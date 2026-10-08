import React, { useState } from 'react';

function PrivateNotes() {
  // State quản lý mở khóa, mật khẩu và danh sách ghi chú kín
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '' });

  // Ghép API Auth: Kiểm tra mật khẩu
  const handleLogin = () => {
    fetch('http://localhost:5000/api/private/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIsUnlocked(true);
          fetchPrivateNotes();
        } else {
          alert('Sai mật khẩu, vui lòng thử lại!');
          setPasswordInput('');
        }
      })
      .catch((err) => console.error('Lỗi xác thực:', err));
  };

  // Ghép API GET: Lấy danh sách ghi chú kín
  const fetchPrivateNotes = () => {
    fetch('http://localhost:5000/api/private/notes')
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error('Lỗi tải ghi chú:', err));
  };

  // Ghép API POST: Thêm ghi chú kín mới
  const handleSave = () => {
    if (!formData.title && !formData.content) return;
    fetch('http://localhost:5000/api/private/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then((res) => res.json())
      .then(() => {
        fetchPrivateNotes();
        setFormData({ title: '', content: '' });
      });
  };

  // Ghép API DELETE: Xóa ghi chú kín
  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/private/notes/${id}`, {
      method: 'DELETE'
    }).then(() => fetchPrivateNotes());
  };

  // 1. UI Khóa: Màn hình nhập mật khẩu (Hiển thị khi isUnlocked === false)
  if (!isUnlocked) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Khu vực Bảo mật</h2>
        <p>Vui lòng nhập mật khẩu để truy cập</p>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Nhập mật khẩu..."
          style={{ padding: '8px', marginRight: '10px' }}
        />
        <button onClick={handleLogin} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Mở khóa
        </button>
      </div>
    );
  }

  // 2. UI Quản lý Note Kín: Hiển thị khi isUnlocked === true
  return (
    <div style={{ padding: '20px', backgroundColor: '#ffebee', borderRadius: '8px' }}>
      <h2 style={{ color: '#d32f2f' }}>Khu vực Ghi chú Riêng tư</h2>

      {/* Form nhập liệu */}
      <div style={{ border: '1px solid #ef5350', padding: '15px', marginBottom: '20px', borderRadius: '6px' }}>
        <input
          type="text"
          placeholder="Tiêu đề bí mật"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
        />
        <textarea
          placeholder="Nội dung bí mật"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          style={{ display: 'block', width: '100%', height: '80px', marginBottom: '10px', padding: '8px' }}
        />
        <button onClick={handleSave} style={{ backgroundColor: '#d32f2f', color: 'white', padding: '8px 16px', border: 'none', cursor: 'pointer' }}>
          Lưu bí mật
        </button>
      </div>

      {/* Danh sách ghi chú kín */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {notes.map((note) => (
          <div key={note.id} style={{ border: '1px solid #ef5350', padding: '15px', backgroundColor: '#fff', borderRadius: '6px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#b71c1c' }}>{note.title}</h4>
            <p style={{ margin: '0 0 10px 0' }}>{note.content}</p>
            <button onClick={() => handleDelete(note.id)} style={{ backgroundColor: '#ff5252', color: '#fff', border: 'none', padding: '4px 8px', cursor: 'pointer' }}>
              Xóa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrivateNotes;