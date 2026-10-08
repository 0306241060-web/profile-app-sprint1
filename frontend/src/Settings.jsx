import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

function Settings() {
  const { isDark } = useOutletContext() || {};
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Lấy cài đặt hiện tại từ Backend khi load trang
  useEffect(() => {
    fetch('http://localhost:5000/api/profile')
      .then((res) => {
        if (!res.ok) throw new Error('Không thể kết nối Backend');
        return res.json();
      })
      .then((data) => {
        if (data.password) setPassword(data.password);
        if (data.theme) setTheme(data.theme);
      })
      .catch((err) => console.error('Lỗi load profile:', err));
  }, []);

  const handleSave = () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    fetch('http://localhost:5000/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, password, theme })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Không thể lưu cài đặt');
        return data;
      })
      .then(() => {
        setLoading(false);
        setMessage({ text: '✅ Đã lưu thay đổi thành công!', type: 'success' });
        setCurrentPassword('');
        setPassword('');

        // PHÁT SỰ KIỆN ĐỔI THEME TOÀN APP CHỈ KHI NÚT LƯU ĐƯỢC BẤM VÀ THÀNH CÔNG
        window.dispatchEvent(new CustomEvent('themeChange', { detail: theme }));

        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      })
      .catch((err) => {
        setLoading(false);
        setMessage({ text: `❌ ${err.message || 'Không kết nối được với máy chủ'}`, type: 'error' });
        console.error('Lỗi save profile:', err);
      });
  };

  const cardBg = isDark ? '#242526' : '#ffffff';
  const borderCol = isDark ? '#393a3b' : '#e4e6eb';
  const inputBg = isDark ? '#3a3b3c' : '#f0f2f5';
  const textColor = isDark ? '#e4e6eb' : '#050505';

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '24px', color: textColor, textAlign: 'center' }}>⚙️ Cài đặt hệ thống</h1>

      {message.text && (
        <div style={{
          padding: '14px',
          backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: message.type === 'success' ? '#15803d' : '#b91c1c',
          borderRadius: '10px',
          marginBottom: '20px',
          fontSize: '14px',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ backgroundColor: cardBg, border: `1px solid ${borderCol}`, padding: '32px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="current-private-password" style={{ display: 'block', fontWeight: '700', marginBottom: '8px', fontSize: '14px', color: textColor }}>
            🔑 Mật khẩu hiện tại
          </label>
          <input
            type="password"
            id="current-private-password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Chỉ cần nhập khi đổi mật khẩu"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${borderCol}`, outline: 'none', boxSizing: 'border-box', fontSize: '15px', backgroundColor: inputBg, color: textColor, marginBottom: '12px' }}
          />
          <label htmlFor="new-private-password" style={{ display: 'block', fontWeight: '700', marginBottom: '8px', fontSize: '14px', color: textColor }}>
            Mật khẩu mới
          </label>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: isDark ? '#b0b3b8' : '#6b7280' }}>
            Để trống để giữ nguyên. Mật khẩu mới cần ít nhất 4 ký tự.
          </p>
          <input
            type="password"
            id="new-private-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${borderCol}`, outline: 'none', boxSizing: 'border-box', fontSize: '15px', backgroundColor: inputBg, color: textColor }}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px', fontSize: '14px', color: textColor }}>
            🎨 Giao diện (Theme)
          </label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)} // Chọn thoải mái, chưa đổi ngay
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${borderCol}`, outline: 'none', fontSize: '15px', backgroundColor: inputBg, color: textColor, fontWeight: '500' }}
          >
            <option value="light">☀️ Sáng (Light Mode)</option>
            <option value="dark">🌙 Tối (Dark Mode - FB Style)</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#a5b4fc' : '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '15px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}
        >
          {loading ? '⏳ Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
}

export default Settings;
