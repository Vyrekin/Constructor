import React from 'react';

export default function FieldItem({ field }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(field));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px 6px 10px',
        fontSize: '0.78rem',
        color: '#6c757d',
        gap: 6,
        borderBottom: '1px solid #F0F0F0',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#EFF6FF')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <i className="bi bi-grip-vertical" style={{
        color: '#AAAAAA',
        fontSize: '0.95rem',
        marginRight: 8,
        cursor: 'grab',
        flexShrink: 0,
      }}></i>
      <span style={{ flex: 1, lineHeight: 1.3, color: 'var(--text-main)' }}>
        {field.label}
      </span>
    </div>
  );
}
