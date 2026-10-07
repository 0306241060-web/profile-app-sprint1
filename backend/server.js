const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;


// ============================================================
// PROFILE
// ============================================================

const profilePath = path.join(
    __dirname,
    'data',
    'profile.json'
);

// GET PROFILE
app.get('/api/profile', (req, res) => {
    try {
        const rawData = fs.readFileSync(profilePath, 'utf8');
        const profile = JSON.parse(rawData);

        res.json(profile);
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
        const newProfile = req.body;

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

app.get('/api/notes/:topic', (req, res) => {
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

app.post('/api/notes/:topic', (req, res) => {
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

app.put('/api/notes/:topic/:id', (req, res) => {
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

app.delete('/api/notes/:topic/:id', (req, res) => {
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
    try {
        const profile = JSON.parse(
            fs.readFileSync(
                profilePath,
                'utf8'
            )
        );

        if (profile.password === req.body.password) {
            return res.json({
                success: true
            });
        }

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