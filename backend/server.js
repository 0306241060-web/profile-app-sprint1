const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors()); // Cho phép FE gọi API
app.use(express.json()); // Đọc dữ liệu JSON từ FE gửi lên
const profilePath = path.join(__dirname, 'data', 'profile.json');
// API 1: Đọc thông tin Profile
app.get('/api/profile', (req, res) => {
    try {
        const rawData = fs.readFileSync(profilePath, 'utf8');
        const profile = JSON.parse(rawData);
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: "Lỗi đọc file" });
    }
});
// API 2: Cập nhật Profile
app.put('/api/profile', (req, res) => {
    try {
        const newProfile = req.body;
        // Ghi đè dữ liệu mới vào file
        fs.writeFileSync(profilePath, JSON.stringify(newProfile, null, 2), 'utf8');
        res.json({ success: true, message: "Đã cập nhật Profile" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi ghi file" });
    }
});
const PORT = 5000;
/**
* ============================================================================
* MODULE: QUẢN LÝ GHI CHÚ THÔNG THƯỜNG (PUBLIC NOTES)
* Author: [Nguyễn Hoàng Long]
* Date: 7/10/20026]
* Description: Nhóm API hỗ trợ CRUD cho ghi chú theo chủ đề.
*
* [CẢNH BÁO TRÁNH XUNG ĐỘT]:
* - FE Team: Các API này nhận và trả về dữ liệu chuẩn JSON. Không tự ý đổi tên key.
* - BE Team: Nếu đổi đường dẫn lưu file (notesDir), phải báo cáo với PM.
* ============================================================================
*/
const notesDir = path.join(__dirname, 'data', 'notes');
// Khởi tạo thư mục tự động nếu chưa tồn tại
if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir, { recursive: true });
}
const getFilePath = (topic) => path.join(notesDir, `${topic}.json`);
// 1. Lấy danh sách ghi chú (GET)
app.get('/api/notes/:topic', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        if (!fs.existsSync(filePath)) return res.json([]);
        const data = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ message: "Lỗi đọc danh sách ghi chú" });
    }
});
// 2. Thêm mới ghi chú (POST)
app.post('/api/notes/:topic', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        let notes = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath,
            'utf8')) : [];
        const newNote = {
            id: Date.now().toString(),
            title: req.body.title || "Không tiêu đề",
            content: req.body.content || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        notes.push(newNote);
        fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf8');
        res.json({ success: true, note: newNote });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm ghi chú" });
    }
});
// 3. Sửa ghi chú (PUT)
app.put('/api/notes/:topic/:id', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        let notes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const index = notes.findIndex(n => n.id === req.params.id);
        if (index !== -1) {
            notes[index].title = req.body.title;
            notes[index].content = req.body.content;
            notes[index].updatedAt = new Date().toISOString();
            fs.writeFileSync(filePath, JSON.stringify(notes, null, 2), 'utf8');
            return res.json({ success: true, message: "Đã sửa thành công" });
        }
        res.status(404).json({ message: "Không tìm thấy ghi chú" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật ghi chú" });
    }
});
// 4. Xóa ghi chú (DELETE)
app.delete('/api/notes/:topic/:id', (req, res) => {
    const filePath = getFilePath(req.params.topic);
    try {
        let notes = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const newNotes = notes.filter(n => n.id !== req.params.id);
        fs.writeFileSync(filePath, JSON.stringify(newNotes, null, 2), 'utf8');
        res.json({ success: true, message: "Đã xóa thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa ghi chú" });
    }
});
app.listen(PORT, () => console.log(`Backend chạy tại http://localhost:${PORT}`));