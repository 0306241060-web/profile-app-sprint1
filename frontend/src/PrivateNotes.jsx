import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

function PrivateNotes() {
  const { isDark } = useOutletContext() || {};
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sessionToken, setSessionToken] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handleLogin = () => {
    if (!passwordInput || isLoading) return;
    setIsLoading(true);
    setError('');
    fetch('http://localhost:5000/api/private/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput })
    })
      .then(async (res) => ({ ok: res.ok, data: await res.json() }))
      .then(({ ok, data }) => {
        if (ok && data.success && data.token) {
          setSessionToken(data.token);
          setIsUnlocked(true);
          fetchPrivateNotes(data.token);
        } else {
          setError('Mật khẩu không đúng. Vui lòng thử lại.');
          setPasswordInput('');
        }
      })
      .catch(() => setError('Không kết nối được với máy chủ.'))
      .finally(() => setIsLoading(false));
  };

  const expireSession = () => {
    setSessionToken('');
    setIsUnlocked(false);
    setNotes([]);
    setError('Phiên đăng nhập hết hạn. Vui lòng mở khóa lại.');
  };

  const fetchPrivateNotes = (token = sessionToken) => {
    fetch('http://localhost:5000/api/private/notes', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (res.status === 401) { expireSession(); return null; }
        if (!res.ok) throw new Error('Không thể tải ghi chú riêng tư');
        return res.json();
      })
      .then((data) => { if (Array.isArray(data)) setNotes(data); })
      .catch(() => setError('Không thể tải ghi chú riêng tư.'));
  };

  const handleSave = () => {
    if (!formData.title.trim() && !formData.content.trim()) return;
    fetch('http://localhost:5000/api/private/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
      body: JSON.stringify(formData)
    })
      .then(async (res) => {
        if (res.status === 401) { expireSession(); return false; }
        if (!res.ok) throw new Error('Không thể lưu ghi chú');
        return true;
      })
      .then((saved) => {
        if (!saved) return;
        fetchPrivateNotes();
        setFormData({ title: '', content: '' });
        setError('');
      })
      .catch(() => setError('Không thể lưu ghi chú riêng tư.'));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/api/private/notes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sessionToken}` }
    }).then((res) => {
      if (res.status === 401) { expireSession(); return; }
      if (!res.ok) throw new Error('Không thể xóa ghi chú');
      return fetchPrivateNotes();
    }).catch(() => setError('Không thể xóa ghi chú riêng tư.'));
  };

  // Màn hình Khóa
  if (!isUnlocked) {
    return (
      <div style={{ maxWidth: '400px', margin: '60px auto', padding: '32px', backgroundColor: isDark ? '#242526' : '#ffffff', color: isDark ? '#e4e6eb' : '#111827', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)', textAlign: 'center', border: `1px solid ${isDark ? '#393a3b' : '#f3f4f6'}` }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: isDark ? '#e4e6eb' : '#111827' }}>Khu vực Bảo mật</h2>
        <p style={{ margin: '0 0 24px 0', color: isDark ? '#b0b3b8' : '#6b7280', fontSize: '14px' }}>Mật khẩu được yêu cầu để xem dữ liệu nhạy cảm</p>
        {error && <p role="alert" style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>}
        
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Nhập mật khẩu..."
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${isDark ? '#555' : '#d1d5db'}`, outline: 'none', boxSizing: 'border-box', marginBottom: '16px', fontSize: '14px', backgroundColor: isDark ? '#3a3b3c' : '#fff', color: isDark ? '#e4e6eb' : '#111827' }}
        />
        <button 
          onClick={handleLogin}
          style={{ width: '100%', padding: '12px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
          disabled={isLoading || !passwordInput}
        >
          {isLoading ? 'Đang xác thực...' : 'Mở khóa ngay'}
        </button>
      </div>
    );
  }

  // Màn hình Quản lý Note Kín
  return (
    <div>
      {error && <p role="alert" style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: isDark ? '#fca5a5' : '#991b1b', fontSize: '24px' }}>🕵️ Ghi chú Riêng tư</h2>
      </div>

      {/* Form Soạn thảo */}
      <div style={{ backgroundColor: isDark ? '#242526' : '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${isDark ? '#553333' : '#fee2e2'}`, marginBottom: '28px' }}>
        <input
          type="text"
          placeholder="Tiêu đề bí mật..."
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: `1px solid ${isDark ? '#555' : '#e5e7eb'}`, marginBottom: '12px', outline: 'none', boxSizing: 'border-box', fontSize: '15px', fontWeight: '600', backgroundColor: isDark ? '#3a3b3c' : '#fff', color: isDark ? '#e4e6eb' : '#111827' }}
        />
        <textarea
          placeholder="Viết nội dung bảo mật vào đây..."
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: `1px solid ${isDark ? '#555' : '#e5e7eb'}`, height: '90px', marginBottom: '12px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '14px', backgroundColor: isDark ? '#3a3b3c' : '#fff', color: isDark ? '#e4e6eb' : '#111827' }}
        />
        <button 
          onClick={handleSave} 
          style={{ backgroundColor: '#dc2626', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
        >
          + Lưu ghi chú bí mật
        </button>
      </div>

      {/* Grid Danh sách Ghi chú */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {notes.map((note) => (
          <div key={note.id} style={{ backgroundColor: isDark ? '#2c2324' : '#fff5f5', border: `1px solid ${isDark ? '#553333' : '#fecaca'}`, padding: '18px', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: isDark ? '#fca5a5' : '#7f1d1d', fontSize: '16px' }}>{note.title}</h4>
              <p style={{ margin: '0 0 16px 0', color: isDark ? '#d1d5db' : '#4b5563', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{note.content}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => handleDelete(note.id)} 
                style={{ backgroundColor: 'transparent', color: '#ef4444', border: 'none', padding: '4px 8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
              >
                🗑️ Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PrivateNotes;
