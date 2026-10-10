import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAppContext } from './AppContext';

function Settings() {
  const { isDark } = useOutletContext() || {};
  const { refreshProfile, updateProfile } = useAppContext();
  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [theme, setTheme] = useState('light');
  const [passwordConfigured, setPasswordConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    refreshProfile()
      .then((data) => {
        setDisplayName(data.displayName || '');
        setTheme(data.theme || 'light');
        setPasswordConfigured(Boolean(data.passwordConfigured));
      })
      .catch((error) => setMessage({ text: error.message, type: 'error' }));
  }, [refreshProfile]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, currentPassword, password, theme })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể lưu cài đặt');

      const savedProfile = data.profile || { displayName: displayName.trim(), theme, passwordConfigured: passwordConfigured || Boolean(password) };
      updateProfile(savedProfile);
      setDisplayName(savedProfile.displayName);
      setTheme(savedProfile.theme);
      setPasswordConfigured(savedProfile.passwordConfigured);
      setCurrentPassword('');
      setPassword('');
      setMessage({ text: 'Đã lưu thay đổi thành công!', type: 'success' });
    } catch (error) {
      setMessage({ text: error.message || 'Không kết nối được với máy chủ', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const cardBg = isDark ? '#242526' : '#ffffff';
  const borderCol = isDark ? '#393a3b' : '#e4e6eb';
  const inputBg = isDark ? '#3a3b3c' : '#f0f2f5';
  const textColor = isDark ? '#e4e6eb' : '#050505';
  const labelStyle = { display: 'block', fontWeight: '700', marginBottom: '8px', fontSize: '14px', color: textColor };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${borderCol}`, outline: 'none', boxSizing: 'border-box', fontSize: '15px', backgroundColor: inputBg, color: textColor };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '24px', color: textColor, textAlign: 'center' }}>👤 Thông tin cá nhân</h1>

      {message.text && (
        <div role="status" style={{ padding: '14px', backgroundColor: message.type === 'success' ? (isDark ? '#173b2a' : '#dcfce7') : (isDark ? '#442525' : '#fee2e2'), color: message.type === 'success' ? (isDark ? '#86efac' : '#15803d') : (isDark ? '#fca5a5' : '#b91c1c'), borderRadius: '10px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '600' }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ backgroundColor: cardBg, border: `1px solid ${borderCol}`, padding: '32px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="display-name" style={labelStyle}>Tên hiển thị</label>
          <input id="display-name" type="text" autoComplete="name" maxLength={80} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Nhập tên hiển thị" style={inputStyle} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="current-private-password" style={labelStyle}>🔑 Mật khẩu hiện tại</label>
          <input type="password" id="current-private-password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder={passwordConfigured ? 'Chỉ cần nhập khi đổi mật khẩu' : 'Chưa thiết lập mật khẩu'} style={{ ...inputStyle, marginBottom: '12px' }} />
          <label htmlFor="new-private-password" style={labelStyle}>Mật khẩu vùng kín</label>
          <p style={{ margin: '0 0 8px', fontSize: '13px', color: isDark ? '#b0b3b8' : '#6b7280' }}>
            {passwordConfigured ? 'Để trống để giữ nguyên. Mật khẩu mới cần ít nhất 4 ký tự.' : 'Thiết lập mật khẩu để bảo vệ ghi chú riêng tư (ít nhất 4 ký tự).'}
          </p>
          <input type="password" id="new-private-password" autoComplete="new-password" minLength={password ? 4 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={passwordConfigured ? 'Nhập mật khẩu mới' : 'Tạo mật khẩu'} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label htmlFor="profile-theme" style={labelStyle}>🎨 Giao diện</label>
          <select id="profile-theme" value={theme} onChange={(event) => setTheme(event.target.value)} style={{ ...inputStyle, fontWeight: '500' }}>
            <option value="light">☀️ Sáng</option>
            <option value="dark">🌙 Tối</option>
          </select>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#a5b4fc' : '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </form>
    </div>
  );
}

export default Settings;
