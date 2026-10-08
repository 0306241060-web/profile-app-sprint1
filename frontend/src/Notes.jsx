import React, { useState, useEffect } from 'react';

function Notes() {
  /* =========================================================
     VÙNG 1: KHỞI TẠO STATE (Trạng thái dữ liệu)
     ========================================================= */
  const [topic, setTopic] = useState('hoc-tap');
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ id: null, title: '', content: '' });

  /* =========================================================
     VÙNG 2: XỬ LÝ LOGIC & GỌI API (Fetch, Save, Delete)
     ========================================================= */
  // 1. Lấy danh sách ghi chú
  const fetchNotes = () => {
    fetch(`http://localhost:5000/api/notes/${topic}`)
      .then(res => res.json())
      .then(data => setNotes(data))
      .catch(err => console.error("Lỗi đọc dữ liệu:", err));
  };

  useEffect(() => { 
    fetchNotes(); 
  }, [topic]);

  // 2. Thêm mới (POST) hoặc Cập nhật (PUT)
  const handleSave = () => {
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id
      ? `http://localhost:5000/api/notes/${topic}/${formData.id}`
      : `http://localhost:5000/api/notes/${topic}`;

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: formData.title, content: formData.content })
    })
      .then(res => res.json())
      .then(() => {
        fetchNotes();
        setFormData({ id: null, title: '', content: '' });
      })
      .catch(err => console.error("Lỗi lưu ghi chú:", err));
  };

  // 3. Xóa ghi chú (DELETE)
  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa ghi chú này?')) {
      fetch(`http://localhost:5000/api/notes/${topic}/${id}`, { method: 'DELETE' })
        .then(() => fetchNotes())
        .catch(err => console.error("Lỗi xóa ghi chú:", err));
    }
  };

  // 4. Chuẩn bị sửa
  const handleEdit = (note) => {
    setFormData({ id: note.id, title: note.title, content: note.content });
  };

  /* =========================================================
     VÙNG 3: RENDER GIAO DIỆN (UI/CSS)
     ========================================================= */
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Ghi chú Công khai (Sprint 2)</h2>

      {/* 3.1. Chọn chủ đề */}
      <div style={{ marginBottom: '20px' }}>
        <strong>Chủ đề: </strong>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} style={{ padding: '5px 10px' }}>
          <option value="hoc-tap">Học tập</option>
          <option value="cong-viec">Công việc</option>
          <option value="ca-nhan">Cá nhân</option>
        </select>
      </div>

      {/* 3.2. Form Nhập liệu */}
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h3>{formData.id ? 'Sửa ghi chú' : 'Thêm ghi chú mới'}</h3>
        <input
          type="text"
          placeholder="Tiêu đề"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
        />
        <textarea
          placeholder="Nội dung ghi chú"
          value={formData.content}
          onChange={e => setFormData({ ...formData, content: e.target.value })}
          style={{ display: 'block', width: '100%', height: '80px', marginBottom: '10px', padding: '8px', boxSizing: 'border-box' }}
        />
        <button onClick={handleSave} style={{ padding: '8px 15px', cursor: 'pointer' }}>
          {formData.id ? 'Cập nhật' : 'Thêm mới'}
        </button>
        {formData.id && (
          <button 
            onClick={() => setFormData({ id: null, title: '', content: '' })}
            style={{ marginLeft: '10px', padding: '8px 15px', cursor: 'pointer' }}
          >
            Hủy
          </button>
        )}
      </div>

      {/* 3.3. Danh sách ghi chú */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {notes.length === 0 && <p>Chưa có ghi chú nào trong chủ đề này.</p>}
        {notes.map(note => (
          <div key={note.id} style={{ border: '1px solid #007bff', padding: '15px', borderRadius: '5px', background: '#f9f9f9' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{note.title}</h4>
            <p style={{ whiteSpace: 'pre-wrap', minHeight: '40px' }}>{note.content}</p>
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => handleEdit(note)} style={{ marginRight: '10px', cursor: 'pointer' }}>Sửa</button>
              <button onClick={() => handleDelete(note.id)} style={{ color: 'red', cursor: 'pointer' }}>Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notes;