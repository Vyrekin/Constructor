import React, { useState } from 'react';
import FieldItem from './FieldItem';

export default function CategoryGroup({ category, fields, searchQuery, onDragStart }) {
  const [isOpen, setIsOpen] = useState(true);

  const filtered = searchQuery
    ? fields.filter((f) => f.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : fields;

  if (filtered.length === 0) return null;

  return (
    <div className="mb-1">
      <button
        className="btn btn-sm w-100 d-flex align-items-center gap-2 px-3 py-2 text-start border-0"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: isOpen ? '#f0f4ff' : 'transparent',
          fontWeight: 600,
          fontSize: '0.8rem',
          letterSpacing: '0.3px',
        }}
      >
        <i className={`bi ${category.icon} text-primary`}></i>
        <span className="flex-grow-1 text-truncate">{category.label}</span>
        <span className="badge bg-primary bg-opacity-10 text-primary" style={{ fontSize: '0.65rem' }}>
          {filtered.length}
        </span>
        <i className={`bi bi-chevron-${isOpen ? 'up' : 'down'} text-muted`} style={{ fontSize: '0.65rem' }}></i>
      </button>
      {isOpen && (
        <div className="ps-3 pe-1 pb-1">
          {filtered.map((field) => (
            <FieldItem key={field.id} field={field} onDragStart={onDragStart} />
          ))}
        </div>
      )}
    </div>
  );
}
