const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const privateSessions = new Map();
const privateLoginAttempts = new Map();
const PRIVATE_SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const NOTE_TOPICS = new Set(['cong-viec', 'ca-nhan', 'hoc-tap']);

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    if (typeof password !== 'string' || typeof storedHash !== 'string') return false;
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash || !/^[a-f0-9]{128}$/i.test(hash)) return false;
    const expected = Buffer.from(hash, 'hex');
    const actual = crypto.scryptSync(password, salt, expected.length);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function matchesProfilePassword(profile, password) {
    if (verifyPassword(password, profile.passwordHash)) return true;
    if (typeof password !== 'string' || typeof profile.password !== 'string') return false;
    const submitted = Buffer.from(password);
    const legacy = Buffer.from(profile.password);
    return submitted.length === legacy.length && crypto.timingSafeEqual(submitted, legacy);
}

function requirePrivateSession(req, res, next) {
    const token = req.get('Authorization')?.replace(/^Bearer\s+/i, '');
    const expiresAt = privateSessions.get(token);
    if (!token || !expiresAt || expiresAt <= Date.now()) {
        if (token) privateSessions.delete(token);
        return res.status(401).json({ success: false, message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ' });
    }
    next();
}

function validateTopic(req, res, next) {
    if (!NOTE_TOPICS.has(req.params.topic)) {
        return res.status(400).json({ success: false, message: 'Chủ đề ghi chú không hợp lệ' });
    }
    next();
}


// ============================================================
// PROFILE
// ============================================================

const profilePath = path.join(
    __dirname,
    'data',
    'profile.json'
);

// Migrate existing plaintext credentials once, preserving the current password.
try {
    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    if (profile.password && !profile.passwordHash) {
        profile.passwordHash = hashPassword(profile.password);
        delete profile.password;
        fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2), 'utf8');
    }
} catch (error) {
    console.error('LỖI MIGRATE PASSWORD:', error);
}

// GET PROFILE
app.get('/api/profile', (req, res) => {
    try {
        const rawData = fs.readFileSync(profilePath, 'utf8');
        const profile = JSON.parse(rawData);

        res.json({ theme: profile.theme || 'light' });
    } catch (error) {
        console.error('LỖI GET PROFILE:', error);

        res.status(500).json({
            success: false,
            message: 'Lỗi đọc file profile'
        });
    }
});


// UPDATE PROFILE
app.put('/api/profile', (req, res) => {
    try {
        const currentProfile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
        const { password, currentPassword, theme } = req.body;
        if (theme !== undefined && !['light', 'dark'].includes(theme)) {
            return res.status(400).json({ success: false, message: 'Giao diện không hợp lệ' });
        }
        if (password && (typeof password !== 'string' || password.length < 4)) {
            return res.status(400).json({ success: false, message: 'Mật khẩu mới cần tối thiểu 4 ký tự' });
        }
        if (password && (currentProfile.passwordHash || currentProfile.password) && !matchesProfilePassword(currentProfile, currentPassword)) {
            return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
        }
        const newProfile = { ...currentProfile, theme: theme || currentProfile.theme || 'light' };
        if (password) {
            newProfile.passwordHash = hashPassword(password);
            delete newProfile.password;
        }

        fs.writeFileSync(
            profilePath,
            JSON.stringify(newProfile, null, 2),
            'utf8'
        );

        res.json({
            success: true,
            message: 'Đã cập nhật Profile'
        });
    } catch (error) {
        console.error('LỖI UPDATE PROFILE:', error);

        res.status(500).json({
            success: false,
            message: 'Lỗi ghi file profile'
        });
    }
});


// ============================================================
// SPRINT 2
// QUẢN LÝ GHI CHÚ THÔNG THƯỜNG (PUBLIC NOTES)
// Author: Nguyễn Hoàng Long
// Date: 07/10/2026
// Description: Nhóm API hỗ trợ CRUD cho ghi chú theo chủ đề.
// ============================================================

const notesDir = path.join(
    __dirname,
    'data',
    'notes'
);


// Tạo thư mục notes nếu chưa tồn tại
if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, {
        recursive: true
    });
}


// Lấy đường dẫn file theo topic
const getFilePath = (topic) => {
    return path.join(
        notesDir,
        `${topic}.json`
    );
};


// ------------------------------------------------------------
// 1. LẤY DANH SÁCH GHI CHÚ
// GET /api/notes/:topic
// ------------------------------------------------------------

app.get('/api/notes/:topic', validateTopic, (req, res) => {
    const filePath = getFilePath(req.params.topic);

    try {
        if (!fs.existsSync(filePath)) {
            return res.json([]);
        }

        const data = fs.readFileSync(
            filePath,
            'utf8'
        );

        const notes = data.trim()
            ? JSON.parse(data)
            : [];

        res.json(notes);

    } catch (error) {
        console.error('LỖI GET PUBLIC NOTES:', error);

        res.status(500).json({
            success: false,
            message: 'Lỗi đọc danh sách ghi chú'
        });
    }
});


// ------------------------------------------------------------
// 2. THÊM GHI CHÚ
// POST /api/notes/:topic
// ------------------------------------------------------------

app.post('/api/notes/:topic', validateTopic, (req, res) => {
    const filePath = getFilePath(req.params.topic);

    try {
        let notes = [];

        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(
                filePath,
                'utf8'
            );

            notes = data.trim()
                ? JSON.parse(data)
                : [];
        }

        const newNote = {
            id: Date.now().toString(),
            title: req.body.title || 'Không tiêu đề',
            content: req.body.content || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        notes.push(newNote);

        fs.writeFileSync(
            filePath,
            JSON.stringify(notes, null, 2),
            'utf8'
        );

        res.status(201).json({
            success: true,
            message: 'Đã thêm ghi chú',
            note: newNote
        });

    } catch (error) {
        console.error('LỖI POST PUBLIC NOTES:', error);

        res.status(500).json({
            success: false,
            message: 'Lỗi thêm ghi chú',
            error: error.message
        });
    }
});


// ------------------------------------------------------------
// 3. SỬA GHI CHÚ
// PUT /api/notes/:topic/:id
// ------------------------------------------------------------

app.put('/api/notes/:topic/:id', validateTopic, (req, res) => {
    const filePath = getFilePath(req.params.topic);
    const id = req.params.id;

    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy file ghi chú'
            });
        }

        let notes = JSON.parse(
            fs.readFileSync(filePath, 'utf8')
        );

        const index = notes.findIndex(
            note => note.id === id
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy ghi chú'
            });
        }

        notes[index].title = req.body.title;
        notes[index].content = req.body.content;
        notes[index].updatedAt = new Date().toISOString();

        fs.writeFileSync(
            filePath,
            JSON.stringify(notes, null, 2),
            'utf8'
        );

        res.json({
            success: true,
            message: 'Đã sửa thành công',
            note: notes[index]
        });

    } catch (error) {
        console.error('LỖI PUT PUBLIC NOTES:', error);

        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật ghi chú',
            error: error.message
        });
    }
});


// ------------------------------------------------------------
// 4. XÓA GHI CHÚ
// DELETE /api/notes/:topic/:id
// ------------------------------------------------------------

app.delete('/api/notes/:topic/:id', validateTopic, (req, res) => {
    const filePath = getFilePath(req.params.topic);
    const id = req.params.id;

    try {
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy file ghi chú'
            });
        }

        let notes = JSON.parse(
            fs.readFileSync(filePath, 'utf8')
        );

        const index = notes.findIndex(
            note => note.id === id
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy ghi chú'
            });
        }

        const deletedNote = notes.splice(index, 1)[0];

        fs.writeFileSync(
            filePath,
            JSON.stringify(notes, null, 2),
            'utf8'
        );

        res.json({
            success: true,
            message: 'Đã xóa thành công',
            note: deletedNote
        });

    } catch (error) {
        console.error('LỖI DELETE PUBLIC NOTES:', error);

        res.status(500).json({
            success: false,
            message: 'Lỗi xóa ghi chú',
            error: error.message
        });
    }
});


// ============================================================
// SPRINT 3
// BẢO MẬT & GHI CHÚ RIÊNG TƯ (PRIVATE NOTES)
// Author: Nguyễn Hoàng Long
// Date: 07/10/2026
// Description: API kiểm tra mật khẩu và quản lý file private.json.
// ============================================================

const privateNotesFile = path.join(
    __dirname,
    'data',
    'private.json'
);


// Tạo private.json nếu chưa tồn tại
if (!fs.existsSync(privateNotesFile)) {
    fs.writeFileSync(
        privateNotesFile,
        '[]',
        'utf8'
    );
}


// ------------------------------------------------------------
// 1. XÁC THỰC MẬT KHẨU
// POST /api/private/auth
// ------------------------------------------------------------

app.post('/api/private/auth', (req, res) => {
    const clientKey = req.ip;
    const now = Date.now();
    const attempt = privateLoginAttempts.get(clientKey);
    if (attempt && attempt.lockedUntil > now) {
        return res.status(429).json({ success: false, message: 'Thử đăng nhập quá nhiều lần. Vui lòng chờ 15 phút.' });
    }
    try {
        const profile = JSON.parse(
            fs.readFileSync(
                profilePath,
                'utf8'
            )
        );

        const password = req.body.password;
        const isLegacyMatch = typeof password === 'string' && profile.password === password;
        if (matchesProfilePassword(profile, password)) {
            if (isLegacyMatch && !profile.passwordHash) {
                profile.passwordHash = hashPassword(password);
                delete profile.password;
                fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2), 'utf8');
            }
            for (const [sessionToken, expiresAt] of privateSessions) {
                if (expiresAt <= Date.now()) privateSessions.delete(sessionToken);
            }
            const token = crypto.randomBytes(32).toString('hex');
            privateSessions.set(token, Date.now() + PRIVATE_SESSION_TTL_MS);
            privateLoginAttempts.delete(clientKey);
            return res.json({ success: true, token, expiresIn: PRIVATE_SESSION_TTL_MS });
        }

        const nextAttempt = attempt && attempt.windowStartedAt > now - 15 * 60 * 1000
            ? { count: attempt.count + 1, windowStartedAt: attempt.windowStartedAt, lockedUntil: 0 }
            : { count: 1, windowStartedAt: now, lockedUntil: 0 };
        if (nextAttempt.count >= 5) nextAttempt.lockedUntil = now + 15 * 60 * 1000;
        privateLoginAttempts.set(clientKey, nextAttempt);

        res.status(401).json({
            success: false,
            message: 'Sai mật khẩu!'
        });

    } catch (error) {
        console.error('LỖI PRIVATE AUTH:', error);

        res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống xác thực'
        });
    }
});


// ------------------------------------------------------------
// 2. LẤY DANH SÁCH GHI CHÚ RIÊNG TƯ
// GET /api/private/notes
// ------------------------------------------------------------

app.use('/api/private/notes', requirePrivateSession);

app.get('/api/private/notes', (req, res) => {
    try {
        const data = fs.readFileSync(
            privateNotesFile,
            'utf8'
        );

        const notes = data.trim()
            ? JSON.parse(data)
            : [];

        res.json(notes);

    } catch (error) {
        console.error('LỖI GET PRIVATE NOTES:', error);

        res.status(500).json({
            success: false,
            message: 'Lỗi đọc ghi chú riêng tư'
        });
    }
});


// ------------------------------------------------------------
// 3. THÊM GHI CHÚ RIÊNG TƯ
// POST /api/private/notes
// ------------------------------------------------------------

app.post('/api/private/notes', (req, res) => {
    try {
        const data = fs.readFileSync(
            privateNotesFile,
            'utf8'
        );

        let notes = data.trim()
            ? JSON.parse(data)
            : [];

        const newNote = {
            id: Date.now().toString(),
            title: req.body.title || 'Lưu bút mật',
            content: req.body.content || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        notes.push(newNote);

        fs.writeFileSync(
            privateNotesFile,
            JSON.stringify(notes, null, 2),
            'utf8'
        );

        console.log(
            'ĐÃ GHI PRIVATE NOTE:',
            newNote
        );  

        res.status(201).json({
            success: true,
            message: 'Đã thêm ghi chú kín',
            note: newNote
        });

    } catch (error) {
        console.error('LỖI POST PRIVATE NOTES:', error);

        res.status(500).json({
            success: false,
            message: 'Lỗi thêm ghi chú kín',
            error: error.message
        });
    }
});


// ------------------------------------------------------------
// 4. SỬA GHI CHÚ RIÊNG TƯ
// PUT /api/private/notes/:id
// ------------------------------------------------------------

app.put('/api/private/notes/:id', (req, res) => {
    const id = req.params.id;

    try {
        let notes = JSON.parse(
            fs.readFileSync(
                privateNotesFile,
                'utf8'
            )
        );

        const index = notes.findIndex(
            note => note.id === id
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy ghi chú'
            });
        }

        notes[index].title = req.body.title;
        notes[index].content = req.body.content;
        notes[index].updatedAt = new Date().toISOString();

        fs.writeFileSync(
            privateNotesFile,
            JSON.stringify(notes, null, 2),
            'utf8'
        );

        res.json({
            success: true,
            message: 'Đã cập nhật ghi chú',
            note: notes[index]
        });

    } catch (error) {
        console.error('LỖI PUT PRIVATE NOTES:', error);

        res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật ghi chú',
            error: error.message
        });
    }
});


// ------------------------------------------------------------
// 5. XÓA GHI CHÚ RIÊNG TƯ
// DELETE /api/private/notes/:id
// ------------------------------------------------------------

app.delete('/api/private/notes/:id', (req, res) => {
    const id = req.params.id;

    try {
        let notes = JSON.parse(
            fs.readFileSync(
                privateNotesFile,
                'utf8'
            )
        );

        const index = notes.findIndex(
            note => note.id === id
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy ghi chú'
            });
        }

        const deletedNote = notes.splice(index, 1)[0];

        fs.writeFileSync(
            privateNotesFile,
            JSON.stringify(notes, null, 2),
            'utf8'
        );

        res.json({
            success: true,
            message: 'Đã xóa ghi chú',
            note: deletedNote
        });

    } catch (error) {
        console.error('LỖI DELETE PRIVATE NOTES:', error);

        res.status(500).json({
            success: false,
            message: 'Lỗi xóa ghi chú',
            error: error.message
        });
    }
});


// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
    console.log(
        `Backend chạy tại http://localhost:${PORT}`
    );
});
