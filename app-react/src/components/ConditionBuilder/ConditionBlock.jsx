import React from 'react';
import { getFieldById } from '../../data/filterRegistry';

export default function ConditionBlock({ filter, onRemove, onUpdate }) {
  const field = getFieldById(filter.fieldId);
  const isInclude = filter.zone === 'include';
  const accentColor = isInclude ? '#198754' : '#dc3545';

  const handleValueChange = (e) => {
    onUpdate(filter.id, { value: e.target.value });
  };

  const handleOpToggle = () => {
    const nextOp = filter.op === 'ТА' ? 'АБО' : 'ТА';
    onUpdate(filter.id, { op: nextOp });
  };

  const renderValueInput = () => {
    if (!field) return <span className="text-muted small">—</span>;

    if (field.type === 'select' && field.options && Object.keys(field.options).length > 0) {
      return (
        <select
          className="form-select form-select-sm"
          value={filter.value || ''}
          onChange={handleValueChange}
          style={{ maxWidth: 180 }}
        >
          <option value="">Обери...</option>
          {Object.entries(field.options).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'date') {
      return (
        <input
          type="date"
          className="form-control form-control-sm"
          value={filter.value || ''}
          onChange={handleValueChange}
          style={{ maxWidth: 170 }}
        />
      );
    }

    if (field.type === 'number') {
      return (
        <input
          type="number"
          className="form-control form-control-sm"
          value={filter.value || ''}
          onChange={handleValueChange}
          placeholder="0"
          style={{ maxWidth: 120 }}
        />
      );
    }

    return (
      <input
        type="text"
        className="form-control form-control-sm"
        value={filter.value || ''}
        onChange={handleValueChange}
        placeholder="Значення..."
        style={{ maxWidth: 180 }}
      />
    );
  };

  return (
    <div
      className="condition-block d-flex align-items-center gap-2 px-2 py-2 mb-1 rounded-2"
      style={{
        background: '#f8f9fa',
        borderLeft: `3px solid ${accentColor}`,
        fontSize: '0.83rem',
      }}
    >
      <button
        className="btn btn-sm px-1 py-0 border-0"
        onClick={handleOpToggle}
        title="Переключити ТА / АБО"
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: filter.op === 'ТА' ? '#0d6efd' : '#fd7e14',
          minWidth: 30,
        }}
      >
        {filter.op}
      </button>
      <span className="fw-semibold text-truncate" style={{ maxWidth: 140 }}>
        {filter.label}
      </span>
      {renderValueInput()}
      <button
        className="btn btn-sm btn-outline-danger border-0 px-1 py-0 ms-auto"
        onClick={() => onRemove(filter.id)}
        title="Видалити"
      >
        <i className="bi bi-x-lg" style={{ fontSize: '0.75rem' }}></i>
      </button>
    </div>
  );
}
