import React from 'react';

export default function FieldItem({ field, onDragStart }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(field));
    e.dataTransfer.effectAllowed = 'copy';
    if (onDragStart) onDragStart(field);
  };

  const typeIcon = {
    select: 'bi-list',
    date: 'bi-calendar3',
    text: 'bi-fonts',
    number: 'bi-123',
  };

  return (
    <div
      className="field-item d-flex align-items-center gap-2 px-2 py-1 rounded-2 mb-1"
      draggable
      onDragStart={handleDragStart}
      style={{
        cursor: 'grab',
        fontSize: '0.82rem',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#e9ecef')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <i className={`bi ${typeIcon[field.type] || 'bi-circle'} text-muted`} style={{ fontSize: '0.75rem' }}></i>
      <span className="text-truncate flex-grow-1">{field.label}</span>
      <i className="bi bi-grip-vertical text-muted" style={{ fontSize: '0.7rem', opacity: 0.5 }}></i>
    </div>
  );
}
