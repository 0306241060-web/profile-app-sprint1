import React, { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppContext } from './AppContext';

function Layout() {
  const { isDark, displayName } = useAppContext();

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
    <div className="app-shell" style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: isDark ? '#18191a' : '#f0f2f5',
      color: isDark ? '#e4e6eb' : '#050505',
    }}>
      {/* Sidebar */}
      <aside className="app-sidebar" style={{
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
            <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: '600' }}>{displayName || 'Workspace'}</span>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink to="/notes" style={navStyle}>📝 <span>Ghi chú chung</span></NavLink>
          <NavLink to="/private" style={navStyle}>🔒 <span>Vùng kín</span></NavLink>
          <NavLink to="/settings" style={navStyle}>⚙️ <span>Cài đặt</span></NavLink>
        </nav>
      </aside>

      {/* Main Outlet */}
      <main className="app-main" style={{ flex: 1, padding: '32px 48px', minWidth: 0, boxSizing: 'border-box' }}>
          <Outlet context={{ isDark, displayName }} />
      </main>
    </div>
  );
}

export default Layout;
