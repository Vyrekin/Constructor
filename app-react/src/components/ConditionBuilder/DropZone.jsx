import React, { useState } from 'react';

export default function DropZone({ zone, onDrop, children, isEmpty }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data && data.id) {
        onDrop(data, zone);
      }
    } catch {
      // ignore
    }
  };

  const isInclude = zone === 'include';
  const color = isInclude ? '#198754' : '#dc3545';
  const bgColor = isInclude ? '#f0fdf4' : '#fef2f2';
  const borderColor = isDragOver ? color : '#dee2e6';

  return (
    <div
      className="rounded-3 p-2 position-relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        minHeight: 80,
        border: `2px dashed ${borderColor}`,
        background: isDragOver ? bgColor : '#fff',
        transition: 'all 0.2s ease',
      }}
    >
      {isEmpty && !isDragOver && (
        <div className="text-center text-muted py-3" style={{ fontSize: '0.82rem' }}>
          <i className="bi bi-arrow-down-circle d-block mb-1" style={{ fontSize: '1.2rem' }}></i>
          Перетягніть поле сюди
        </div>
      )}
      {isDragOver && isEmpty && (
        <div className="text-center py-3" style={{ color, fontSize: '0.82rem' }}>
          <i className="bi bi-plus-circle d-block mb-1" style={{ fontSize: '1.2rem' }}></i>
          Відпустіть для додавання
        </div>
      )}
      {children}
    </div>
  );
}
