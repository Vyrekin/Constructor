import React from 'react';
import { getFieldById } from '../../data/filterRegistry';

export default function ConditionBlock({ filter, onRemove, onUpdate }) {
  const field = getFieldById(filter.fieldId);

  const handleValueChange = (e) => {
    onUpdate(filter.id, { value: e.target.value });
  };

  const renderValueInput = () => {
    if (!field) return <span style={{ color: '#9CA3AF', fontSize: '0.82rem' }}>—</span>;

    if (field.type === 'select' && field.options && Object.keys(field.options).length > 0) {
      return (
        <select
          className="cond-value-select"
          value={filter.value || ''}
          onChange={handleValueChange}
          style={{
            fontSize: '0.82rem',
            border: '1px solid #dee2e6',
            borderRadius: 4,
            padding: '3px 8px',
            background: '#fff',
            color: '#212529',
            flex: 1,
            minWidth: 0,
            height: 36,
          }}
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
          className="cond-value-input"
          value={filter.value || ''}
          onChange={handleValueChange}
          style={{
            fontSize: '0.82rem',
            border: '1px solid #dee2e6',
            borderRadius: 4,
            padding: '3px 8px',
            background: '#fff',
            flex: 1,
            minWidth: 0,
            height: 36,
          }}
        />
      );
    }

    return (
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        className="cond-value-input"
        value={filter.value || ''}
        onChange={handleValueChange}
        placeholder={field.type === 'number' ? '0' : 'Значення...'}
        style={{
          fontSize: '0.82rem',
          border: '1px solid #dee2e6',
          borderRadius: 4,
          padding: '3px 8px',
          background: '#fff',
          flex: 1,
          minWidth: 0,
          height: 36,
        }}
      />
    );
  };

  return (
    <div className="condition-block" style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      width: '100%',
      background: '#fff',
      border: '1px solid #E0E0E0',
      borderRadius: 6,
      overflow: 'visible',
    }}>
      {/* Drag handle */}
      <div className="cond-drag-handle" style={{
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'stretch',
        padding: '0 8px',
        color: '#BDBDBD',
        fontSize: '1rem',
        cursor: 'grab',
        flexShrink: 0,
        borderRight: '1px solid #F0F0F0',
      }}>
        <i className="bi bi-grip-vertical"></i>
      </div>

      {/* Field label */}
      <div className="condition-header" style={{
        flex: '0 0 auto',
        minWidth: 140,
        maxWidth: 180,
        display: 'flex',
        alignItems: 'center',
        padding: '10px 10px',
        borderRight: '1px solid #F0F0F0',
        fontSize: '0.82rem',
        fontWeight: 500,
        color: '#212529',
        gap: 4,
      }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {filter.label}
        </span>
      </div>

      {/* Value */}
      <div className="condition-body" style={{
        flex: 1,
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.82rem',
        minWidth: 0,
      }}>
        {renderValueInput()}
      </div>

      {/* Delete */}
      <div
        className="cond-delete"
        onClick={() => onRemove(filter.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          color: '#BDBDBD',
          fontSize: '0.85rem',
          cursor: 'pointer',
          flexShrink: 0,
          borderLeft: '1px solid #F0F0F0',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#DC3545')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#BDBDBD')}
      >
        <i className="bi bi-x-lg"></i>
      </div>
    </div>
  );
}
