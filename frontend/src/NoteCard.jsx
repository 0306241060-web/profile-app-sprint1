import React from 'react';

function NoteCard({ note, isDark, onEdit, onDelete, onTogglePin, privateMode = false }) {
  const words = note.content ? note.content.trim().split(/\s+/).length : 0;
  const cardStyle = privateMode
    ? {
        backgroundColor: isDark ? '#2c2324' : '#fff5f5',
        border: `1px solid ${isDark ? '#553333' : '#fecaca'}`,
        padding: '18px',
        borderRadius: '10px',
        minHeight: '130px'
      }
    : {
        backgroundColor: isDark ? '#242526' : '#ffffff',
        border: isDark ? '1px solid #393a3b' : '1px solid #e4e6eb',
        padding: '20px',
        borderRadius: '14px',
        minHeight: '150px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      };

  return (
    <article style={{ ...cardStyle, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <h4 style={{ margin: 0, fontSize: privateMode ? '16px' : '17px', fontWeight: '700', color: privateMode ? (isDark ? '#fca5a5' : '#7f1d1d') : (isDark ? '#e4e6eb' : '#050505') }}>
            {note.title || 'Không tiêu đề'}
          </h4>
          {onTogglePin && (
            <button type="button" onClick={() => onTogglePin(note)} aria-label={note.isPinned ? 'Bỏ ghim ghi chú' : 'Ghim ghi chú'} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: note.isPinned ? 1 : 0.3, fontSize: '16px' }}>📌</button>
          )}
        </div>
        <p style={{ margin: '0 0 20px', fontSize: '14px', lineHeight: '1.6', color: isDark ? '#b0b3b8' : '#4b5563', whiteSpace: 'pre-wrap' }}>{note.content}</p>
      </div>

      <div style={{ borderTop: `1px solid ${privateMode ? (isDark ? '#553333' : '#fecaca') : (isDark ? '#393a3b' : '#f0f2f5')}`, paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {privateMode ? <span /> : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', backgroundColor: isDark ? '#3a3b3c' : '#f0f2f5', color: isDark ? '#e4e6eb' : '#4b5563', fontWeight: '600' }}>{note.tag || 'Cá nhân'}</span>
            <span style={{ fontSize: '11px', color: isDark ? '#b0b3b8' : '#9ca3af' }}>{words} từ</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => onEdit(note)} aria-label={`Sửa ghi chú ${note.title || 'Không tiêu đề'}`} title="Sửa ghi chú" style={{ background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>✏️</button>
          <button type="button" onClick={() => onDelete(note.id)} aria-label={`Xóa ghi chú ${note.title || 'Không tiêu đề'}`} title="Xóa ghi chú" style={{ background: 'none', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>🗑️</button>
        </div>
      </div>
    </article>
  );
}

export default NoteCard;
