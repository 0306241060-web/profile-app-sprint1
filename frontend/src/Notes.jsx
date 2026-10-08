import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';

const topics = { 'Công việc': 'cong-viec', 'Cá nhân': 'ca-nhan', 'Học tập': 'hoc-tap' };

function Notes() {
  const { isDark } = useOutletContext() || {};
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', tag: 'Công việc', isPinned: false });

  const fetchNotes = useCallback(() => {
    Promise.all(Object.entries(topics).map(async ([tag, topic]) => {
      const res = await fetch(`http://localhost:5000/api/notes/${topic}`);
      if (!res.ok) throw new Error('Không thể tải ghi chú');
      const data = await res.json();
      return (Array.isArray(data) ? data : []).map((note) => ({ ...note, tag }));
    }))
      .then((groups) => {
        const pinnedIds = JSON.parse(localStorage.getItem('pinnedNoteIds') || '[]');
        setNotes(groups.flat().map((note) => ({ ...note, isPinned: pinnedIds.includes(note.id) })));
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleSave = () => {
    if (!formData.title.trim() && !formData.content.trim()) return;

    if (editingId) {
      fetch(`http://localhost:5000/api/notes/${topics[formData.tag]}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).then((res) => { if (!res.ok) throw new Error('Không thể cập nhật ghi chú'); }).then(() => {
        fetchNotes();
        setEditingId(null);
        setFormData({ title: '', content: '', tag: 'Công việc', isPinned: false });
      });
    } else {
      fetch(`http://localhost:5000/api/notes/${topics[formData.tag]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, createdAt: new Date().toLocaleDateString('vi-VN') })
      }).then((res) => { if (!res.ok) throw new Error('Không thể thêm ghi chú'); }).then(() => {
        fetchNotes();
        setFormData({ title: '', content: '', tag: 'Công việc', isPinned: false });
      });
    }
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setFormData({ title: note.title, content: note.content, tag: note.tag || 'Công việc', isPinned: note.isPinned || false });
  };

  const handleDelete = (id) => {
    const note = notes.find((item) => item.id === id);
    if (!note) return;
    fetch(`http://localhost:5000/api/notes/${topics[note.tag]}/${id}`, { method: 'DELETE' })
      .then((res) => { if (!res.ok) throw new Error('Không thể xóa ghi chú'); return fetchNotes(); })
      .catch((err) => console.error(err));
  };

  const togglePin = (note) => {
    const pinnedIds = new Set(JSON.parse(localStorage.getItem('pinnedNoteIds') || '[]'));
    if (pinnedIds.has(note.id)) pinnedIds.delete(note.id);
    else pinnedIds.add(note.id);
    localStorage.setItem('pinnedNoteIds', JSON.stringify([...pinnedIds]));
    setNotes((current) => current.map((item) => item.id === note.id ? { ...item, isPinned: !item.isPinned } : item));
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = selectedTag === 'All' || n.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  // Màu sắc Facebook Dark/Light Mode
  const cardBg = isDark ? '#242526' : '#ffffff';
  const borderCol = isDark ? '#393a3b' : '#e4e6eb';
  const inputBg = isDark ? '#3a3b3c' : '#f0f2f5';
  const textColor = isDark ? '#e4e6eb' : '#050505';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header & Thanh Tìm Kiếm */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: textColor }}>Ghi chú chung</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: isDark ? '#b0b3b8' : '#656b75' }}>Quản lý công việc và ghi chú hằng ngày</p>
        </div>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm nhanh ghi chú..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '320px',
            padding: '12px 16px',
            borderRadius: '24px',
            border: 'none',
            outline: 'none',
            backgroundColor: inputBg,
            color: textColor,
            fontSize: '14px'
          }}
        />
      </div>

      {/* Editor Tạo/Sửa Ghi Chú */}
      <div style={{ backgroundColor: cardBg, border: `1px solid ${borderCol}`, padding: '24px', borderRadius: '16px', marginBottom: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <input
          type="text"
          placeholder="Tiêu đề ghi chú..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${borderCol}`, marginBottom: '12px', outline: 'none', fontWeight: '700', fontSize: '16px', boxSizing: 'border-box', backgroundColor: inputBg, color: textColor }}
        />
        <textarea
          placeholder="Viết nội dung tại đây..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${borderCol}`, height: '100px', marginBottom: '16px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '14px', backgroundColor: inputBg, color: textColor }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: isDark ? '#b0b3b8' : '#656b75', fontWeight: '600' }}>Chủ đề:</span>
            <select
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              disabled={Boolean(editingId)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${borderCol}`, outline: 'none', backgroundColor: inputBg, color: textColor, fontWeight: '500' }}
            >
              <option value="Công việc">💼 Công việc</option>
              <option value="Cá nhân">👤 Cá nhân</option>
              <option value="Học tập">📚 Học tập</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {editingId && (
              <button onClick={() => { setEditingId(null); setFormData({ title: '', content: '', tag: 'Công việc', isPinned: false }); }} style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#3a3b3c', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>Hủy</button>
            )}
            <button onClick={handleSave} style={{ backgroundColor: '#6366f1', color: '#fff', padding: '10px 24px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' }}>
              {editingId ? 'Cập nhật' : '+ Thêm mới'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tag Pills */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        {['All', 'Công việc', 'Cá nhân', 'Học tập'].map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              padding: '8px 18px', borderRadius: '20px', border: 'none',
              backgroundColor: selectedTag === tag ? '#6366f1' : (isDark ? '#3a3b3c' : '#e4e6eb'),
              color: selectedTag === tag ? '#fff' : textColor, cursor: 'pointer', fontSize: '13px', fontWeight: '600'
            }}
          >
            {tag === 'All' ? 'Tất cả' : tag}
          </button>
        ))}
      </div>

      {/* Ghi chú Đã Ghim */}
      {pinnedNotes.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#6366f1', letterSpacing: '0.05em', marginBottom: '14px', fontWeight: '800' }}>📌 Ghi chú đã ghim</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {pinnedNotes.map((note) => (
              <CardItem key={note.id} note={note} isDark={isDark} onDelete={handleDelete} onEdit={handleEdit} onTogglePin={togglePin} />
            ))}
          </div>
        </div>
      )}

      {/* Ghi chú Khác */}
      <div>
        {pinnedNotes.length > 0 && <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: isDark ? '#b0b3b8' : '#656b75', letterSpacing: '0.05em', marginBottom: '14px', fontWeight: '800' }}>Danh sách ghi chú</h3>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {unpinnedNotes.map((note) => (
            <CardItem key={note.id} note={note} isDark={isDark} onDelete={handleDelete} onEdit={handleEdit} onTogglePin={togglePin} />
          ))}
          {filteredNotes.length === 0 && <p style={{ gridColumn: '1 / -1', color: isDark ? '#b0b3b8' : '#656b75', textAlign: 'center', padding: '32px 16px' }}>{search || selectedTag !== 'All' ? 'Không tìm thấy ghi chú phù hợp.' : 'Chưa có ghi chú nào. Hãy tạo ghi chú đầu tiên của bạn.'}</p>}
        </div>
      </div>
    </div>
  );
}

function CardItem({ note, isDark, onDelete, onEdit, onTogglePin }) {
  const words = note.content ? note.content.trim().split(/\s+/).length : 0;
  return (
    <div style={{
      backgroundColor: isDark ? '#242526' : '#ffffff',
      border: isDark ? '1px solid #393a3b' : '1px solid #e4e6eb',
      padding: '20px',
      borderRadius: '14px',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      minHeight: '150px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <h4 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: isDark ? '#e4e6eb' : '#050505' }}>{note.title || 'Không tiêu đề'}</h4>
          <button onClick={() => onTogglePin(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: note.isPinned ? 1 : 0.3, fontSize: '16px' }}>📌</button>
        </div>
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', lineHeight: '1.6', color: isDark ? '#b0b3b8' : '#4b5563', whiteSpace: 'pre-wrap' }}>{note.content}</p>
      </div>

      <div style={{ borderTop: isDark ? '1px solid #393a3b' : '1px solid #f0f2f5', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', backgroundColor: isDark ? '#3a3b3c' : '#f0f2f5', color: isDark ? '#e4e6eb' : '#4b5563', fontWeight: '600' }}>{note.tag || 'Cá nhân'}</span>
          <span style={{ fontSize: '11px', color: isDark ? '#b0b3b8' : '#9ca3af' }}>{words} từ</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => onEdit(note)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Sửa</button>
          <button onClick={() => onDelete(note.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Xóa</button>
        </div>
      </div>
    </div>
  );
}

export default Notes;
