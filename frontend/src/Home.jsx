import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';

const destinations = [
  {
    to: '/notes',
    icon: '📝',
    title: 'Ghi chú chung',
    description: 'Tạo, tìm kiếm và sắp xếp ghi chú theo chủ đề.',
    action: 'Mở ghi chú',
    accent: '#6366f1'
  },
  {
    to: '/private',
    icon: '🔒',
    title: 'Vùng kín',
    description: 'Truy cập ghi chú riêng tư sau khi xác thực mật khẩu.',
    action: 'Mở vùng kín',
    accent: '#dc2626'
  },
  {
    to: '/settings',
    icon: '👤',
    title: 'Hồ sơ & giao diện',
    description: 'Cập nhật tên hiển thị, giao diện và mật khẩu vùng kín.',
    action: 'Mở Profile',
    accent: '#0891b2'
  }
];

function Home() {
  const { isDark, displayName } = useOutletContext() || {};
  const textColor = isDark ? '#e4e6eb' : '#111827';
  const mutedColor = isDark ? '#b0b3b8' : '#656b75';
  const cardColor = isDark ? '#242526' : '#ffffff';
  const borderColor = isDark ? '#393a3b' : '#e4e6eb';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <section
        style={{
          padding: '32px',
          borderRadius: '18px',
          marginBottom: '28px',
          color: '#ffffff',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          boxShadow: '0 12px 28px rgba(79, 70, 229, 0.2)'
        }}
      >
        <p style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', letterSpacing: '0.08em', opacity: 0.85 }}>
          NOTEAPP PRO
        </p>
        <h1 style={{ margin: 0, fontSize: '30px', fontWeight: '800' }}>
          Xin chào, {displayName || 'bạn'}!
        </h1>
        <p style={{ maxWidth: '640px', margin: '12px 0 0', fontSize: '16px', lineHeight: 1.6, opacity: 0.92 }}>
          Chọn một khu vực bên dưới để tiếp tục quản lý ghi chú của bạn.
        </p>
      </section>

      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ margin: 0, color: textColor, fontSize: '21px', fontWeight: '800' }}>Truy cập nhanh</h2>
        <p style={{ margin: '6px 0 0', color: mutedColor, fontSize: '14px' }}>Các khu vực chính của ứng dụng</p>
      </div>

      <section
        aria-label="Các khu vực chính"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}
      >
        {destinations.map((destination) => (
          <article
            key={destination.to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '220px',
              padding: '22px',
              border: `1px solid ${borderColor}`,
              borderRadius: '14px',
              backgroundColor: cardColor,
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
            }}
          >
            <span aria-hidden="true" style={{ fontSize: '26px', marginBottom: '14px' }}>{destination.icon}</span>
            <h3 style={{ margin: '0 0 8px', color: textColor, fontSize: '18px', fontWeight: '750' }}>
              {destination.title}
            </h3>
            <p style={{ flex: 1, margin: 0, color: mutedColor, fontSize: '14px', lineHeight: 1.55 }}>
              {destination.description}
            </p>
            <Link
              to={destination.to}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                marginTop: '18px',
                color: destination.accent,
                fontSize: '14px',
                fontWeight: '700',
                textDecoration: 'none'
              }}
            >
              {destination.action} <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Home;
