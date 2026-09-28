import React from 'react';
import { Link, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar navigation */}
      <nav style={{ width: '200px', padding: '20px', borderRight: '1px solid #ccc' }}>
        <h3>Menu</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/">Trang chủ</Link></li>
          <li><Link to="/settings">Cài đặt</Link></li>
          <li><Link to="/private">Vùng kín</Link></li>
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