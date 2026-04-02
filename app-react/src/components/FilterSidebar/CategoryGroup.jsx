import React, { useState } from 'react';
import FieldItem from './FieldItem';

export default function CategoryGroup({ category, fields, searchQuery }) {
  const [isOpen, setIsOpen] = useState(false);

  const filtered = searchQuery
    ? fields.filter((f) => f.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : fields;

  if (filtered.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '9px 12px',
          background: isOpen ? '#EFF6FF' : 'transparent',
          border: 'none',
          textAlign: 'left',
          fontSize: '0.85rem',
          fontWeight: isOpen ? 500 : 400,
          color: isOpen ? 'var(--np-blue)' : '#495057',
          cursor: 'pointer',
          gap: 8,
        }}
        onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = '#F9FAFB'; }}
        onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <i className={`bi ${category.icon}`} style={{
            fontSize: '0.9rem',
            color: isOpen ? 'var(--np-blue)' : '#6c757d',
            width: 18,
            textAlign: 'center',
            flexShrink: 0,
          }}></i>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {category.label}
          </span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: '0.65rem',
            color: '#9CA3AF',
            background: '#F3F4F6',
            padding: '1px 6px',
            borderRadius: 3,
          }}>{filtered.length}</span>
          <i className={`bi bi-chevron-right`} style={{
            fontSize: '0.7rem',
            color: isOpen ? 'var(--np-blue)' : '#9CA3AF',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(90deg)' : 'none',
            flexShrink: 0,
          }}></i>
        </span>
      </button>
      {isOpen && (
        <div style={{
          background: '#F9FAFB',
          borderTop: '1px solid #F3F4F6',
          padding: '2px 0',
        }}>
          {filtered.map((field) => (
            <FieldItem key={field.id} field={field} />
          ))}
        </div>
      )}
    </div>
  );
}
