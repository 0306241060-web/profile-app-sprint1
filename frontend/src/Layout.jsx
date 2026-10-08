import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

function Layout() {
  const [theme, setTheme] = useState('light');

  // Lấy theme ban đầu
  const fetchTheme = () => {
    fetch('http://localhost:5000/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.theme) setTheme(data.theme);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTheme();

    // Lắng nghe tín hiệu khi và chỉ khi bấm "Lưu thay đổi"
    const handleThemeChange = (e) => {
      if (e.detail) {
        setTheme(e.detail);
      } else {
        fetchTheme();
      }
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  const isDark = theme === 'dark';

  // Áp dụng màu nền nền body chuẩn Dark Mode khi theme state cập nhật
  useEffect(() => {
    const bg = isDark ? '#18191a' : '#f0f2f5';
    const text = isDark ? '#e4e6eb' : '#050505';

    document.body.style.backgroundColor = bg;
    document.body.style.color = text;
    document.body.style.transition = 'background-color 0.25s ease, color 0.25s ease';
  }, [isDark]);

  const navStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    textDecoration: 'none',
    color: isActive ? '#ffffff' : (isDark ? '#e4e6eb' : '#4b5563'),
    backgroundColor: isActive ? '#6366f1' : 'transparent',
    fontWeight: isActive ? '600' : '500',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    marginBottom: '6px'
  });

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: isDark ? '#18191a' : '#f0f2f5',
      color: isDark ? '#e4e6eb' : '#050505',
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: isDark ? '#242526' : '#ffffff',
        borderRight: isDark ? '1px solid #393a3b' : '1px solid #e4e6eb',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>N</div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: isDark ? '#f0f2f5' : '#111827' }}>NoteApp Pro</h2>
            <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: '600', textTransform: 'uppercase' }}>Workspace</span>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink to="/notes" style={navStyle}>📝 <span>Ghi chú chung</span></NavLink>
          <NavLink to="/private" style={navStyle}>🔒 <span>Vùng kín</span></NavLink>
          <NavLink to="/settings" style={navStyle}>⚙️ <span>Cài đặt</span></NavLink>
        </nav>
      </aside>

      {/* Main Outlet */}
      <main style={{ flex: 1, padding: '32px 48px', width: 'calc(100vw - 280px)', boxSizing: 'border-box' }}>
        <Outlet context={{ isDark }} />
      </main>
    </div>
  );
}

export default Layout;