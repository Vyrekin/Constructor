import React, { useState } from 'react';

const formats = [
  { id: 'phone', label: 'Телефон', icon: 'bi-telephone' },
  { id: 'email', label: 'Email', icon: 'bi-envelope' },
  { id: 'cid', label: 'CID', icon: 'bi-fingerprint' },
  { id: 'audience', label: 'Audience ID', icon: 'bi-people' },
];

export default function ExportSection({ totalCount, onGenerate }) {
  const [selectedFormats, setSelectedFormats] = useState(['phone']);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleFormat = (id) => {
    setSelectedFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (onGenerate) onGenerate(selectedFormats);
    }, 1200);
  };

  return (
    <div>
      <h6
        className="fw-bold text-uppercase mb-2"
        style={{ fontSize: '0.7rem', letterSpacing: '1px', color: '#6c757d' }}
      >
        Формат вивантаження
      </h6>
      <div className="d-flex flex-wrap gap-1 mb-3">
        {formats.map((fmt) => (
          <button
            key={fmt.id}
            className={`btn btn-sm ${selectedFormats.includes(fmt.id) ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => toggleFormat(fmt.id)}
            style={{ fontSize: '0.75rem' }}
          >
            <i className={`bi ${fmt.icon} me-1`}></i>
            {fmt.label}
          </button>
        ))}
      </div>
      <button
        className="btn btn-primary w-100 fw-bold"
        onClick={handleGenerate}
        disabled={isGenerating || selectedFormats.length === 0}
      >
        {isGenerating ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Генерація...
          </>
        ) : (
          <>
            <i className="bi bi-play-fill me-1"></i>
            Розрахувати
          </>
        )}
      </button>
    </div>
  );
}
