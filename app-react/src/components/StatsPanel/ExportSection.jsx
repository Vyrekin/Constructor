import React, { useState } from 'react';

const formats = [
  { id: 'phone', label: 'Телефон' },
  { id: 'email', label: 'Email' },
  { id: 'cid', label: 'CID' },
  { id: 'audience', label: 'Audience ID' },
];

export default function ExportSection({ totalCount, onGenerate }) {
  const [selectedFormats, setSelectedFormats] = useState(['phone']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sampleName, setSampleName] = useState('');

  const toggleFormat = (id) => {
    setSelectedFormats((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      if (onGenerate) onGenerate(selectedFormats);
    }, 1200);
  };

  return (
    <div>
      <div className="np-export-title" style={{
        fontSize: '0.95rem',
        fontWeight: 700,
        color: '#111827',
        marginBottom: 14,
      }}>Зберегти вибірку</div>

      {/* Format chips — segmented control */}
      <div className="np-export-label" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#495057', marginBottom: 5 }}>
        Формат
      </div>
      <div className="np-format-chips" style={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: 0,
        marginBottom: 14,
        border: '1.5px solid #dee2e6',
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        {formats.map((fmt) => (
          <button
            key={fmt.id}
            className={`np-format-chip ${selectedFormats.includes(fmt.id) ? 'active' : ''}`}
            onClick={() => toggleFormat(fmt.id)}
            style={{
              flex: 1,
              padding: '5px 8px',
              fontSize: '0.8rem',
              fontWeight: 400,
              border: 'none',
              borderRight: '1.5px solid #dee2e6',
              borderRadius: 0,
              background: selectedFormats.includes(fmt.id) ? '#198754' : '#fff',
              color: selectedFormats.includes(fmt.id) ? '#fff' : '#495057',
              cursor: 'pointer',
              lineHeight: 1.4,
              textAlign: 'center',
            }}
          >{fmt.label}</button>
        ))}
      </div>

      {/* Sample name */}
      <div className="np-export-label" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#495057', marginBottom: 5 }}>
        Назва вибірки
      </div>
      <input
        type="text"
        className="form-control"
        value={sampleName}
        onChange={(e) => setSampleName(e.target.value)}
        placeholder="Наприклад: B2C Active Kyiv"
        style={{
          fontSize: '0.82rem',
          borderColor: '#E5E7EB',
          borderRadius: 6,
          marginBottom: 12,
        }}
      />

      {/* Toggle row */}
      <div className="np-toggle-row" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 10,
        padding: '8px 0',
        borderTop: '1px solid #F3F4F6',
      }}>
        <span style={{ fontSize: '0.8rem', color: '#495057', lineHeight: 1.3 }}>
          Унікалізація контактів
        </span>
        <input
          type="checkbox"
          className="form-check-input"
          defaultChecked
          style={{ width: '2.5em', height: '1.3em', cursor: 'pointer' }}
        />
      </div>

      {/* Save button */}
      <button
        className="btn-np-save-full"
        onClick={handleSave}
        disabled={isGenerating || selectedFormats.length === 0}
        style={{
          background: 'var(--np-green)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: 12,
          width: '100%',
          fontSize: '0.88rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {isGenerating ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Збереження...
          </>
        ) : (
          <>
            <i className="bi bi-floppy me-1"></i>
            Зберегти вибірку
          </>
        )}
      </button>
    </div>
  );
}
