import React, { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';

function Layout() {
  // Hàm áp dụng theme cho toàn bộ trang
  const applyTheme = (theme) => {
    document.body.style.backgroundColor = theme === 'dark' ? '#333' : '#fff';
    document.body.style.color = theme === 'dark' ? '#fff' : '#000';
  };

  // Tải thông tin Profile/Theme ngay khi load bất kỳ trang nào
  useEffect(() => {
    fetch('http://localhost:5000/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.theme) {
          applyTheme(data.theme);
        }
      })
      .catch((err) => console.error('Lỗi tải cấu hình:', err));
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar navigation */}
      <nav style={{ width: '200px', padding: '20px', borderRight: '1px solid #ccc' }}>
        <h3>Menu</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}><Link to="/">Trang chủ</Link></li>
          <li style={{ marginBottom: '10px' }}><Link to="/settings">Cài đặt</Link></li>
          <li style={{ marginBottom: '10px' }}><Link to="/private">Vùng kín</Link></li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;