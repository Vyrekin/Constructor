import React, { useState, useMemo, useRef, useEffect } from 'react';
import { categories, filterFields, getFieldsByScope } from '../../data/filterRegistry';

export default function FilterPicker({ isOpen, zone, scope, position, onSelect, onClose }) {
  const [step, setStep] = useState(0);
  const [selectedField, setSelectedField] = useState(null);
  const [value, setValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setSelectedField(null);
      setValue('');
      setSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const visibleFields = useMemo(() => {
    let fields = getFieldsByScope(scope);
    if (searchQuery) {
      fields = fields.filter((f) => f.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return fields;
  }, [scope, searchQuery]);

  const handleFieldClick = (field) => {
    setSelectedField(field);
    if (field.type === 'select' && field.options && Object.keys(field.options).length > 0) {
      setStep(1);
    } else {
      setStep(2);
    }
  };

  const handleValueSelect = (val) => {
    onSelect({ field: selectedField, value: val, zone });
    onClose();
  };

  const handleSubmitValue = () => {
    if (value.trim()) {
      onSelect({ field: selectedField, value: value.trim(), zone });
      onClose();
    }
  };

  if (!isOpen) return null;

  const isInclude = zone === 'include';
  const accentColor = isInclude ? '#198754' : '#dc3545';

  return (
    <div
      ref={ref}
      className="position-fixed shadow-lg rounded-3 bg-white border"
      style={{
        top: position?.y || 200,
        left: position?.x || 400,
        width: 320,
        maxHeight: 420,
        zIndex: 1060,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 d-flex align-items-center justify-content-between"
        style={{ background: accentColor + '10', borderBottom: `2px solid ${accentColor}` }}
      >
        <span className="fw-bold small">
          {step === 0 && 'Оберіть поле'}
          {step === 1 && `${selectedField?.label} — значення`}
          {step === 2 && `${selectedField?.label} — введіть`}
        </span>
        <button className="btn btn-sm border-0 p-0" onClick={onClose}>
          <i className="bi bi-x-lg text-muted"></i>
        </button>
      </div>

      <div className="p-2" style={{ maxHeight: 350, overflowY: 'auto' }}>
        {/* Step 0: Field list */}
        {step === 0 && (
          <>
            <input
              type="text"
              className="form-control form-control-sm mb-2"
              placeholder="Пошук..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {categories.map((cat) => {
              const catFields = visibleFields.filter((f) => f.catId === cat.id);
              if (catFields.length === 0) return null;
              return (
                <div key={cat.id} className="mb-2">
                  <div className="small text-muted fw-bold px-1 mb-1" style={{ fontSize: '0.7rem' }}>
                    <i className={`bi ${cat.icon} me-1`}></i>
                    {cat.label}
                  </div>
                  {catFields.map((field) => (
                    <div
                      key={field.id}
                      className="picker-item px-2 py-1 rounded-1 d-flex align-items-center gap-2"
                      style={{ cursor: 'pointer', fontSize: '0.82rem' }}
                      onClick={() => handleFieldClick(field)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#e9ecef')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span className="flex-grow-1">{field.label}</span>
                      <i className="bi bi-chevron-right text-muted" style={{ fontSize: '0.65rem' }}></i>
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}

        {/* Step 1: Select options */}
        {step === 1 && selectedField && (
          <>
            <button
              className="btn btn-sm btn-link text-muted p-0 mb-2"
              onClick={() => setStep(0)}
            >
              <i className="bi bi-arrow-left me-1"></i> Назад
            </button>
            {Object.entries(selectedField.options).map(([key, label]) => (
              <div
                key={key}
                className="picker-item px-2 py-1 rounded-1"
                style={{ cursor: 'pointer', fontSize: '0.82rem' }}
                onClick={() => handleValueSelect(key)}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#e9ecef')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {label}
              </div>
            ))}
          </>
        )}

        {/* Step 2: Text/number/date input */}
        {step === 2 && selectedField && (
          <>
            <button
              className="btn btn-sm btn-link text-muted p-0 mb-2"
              onClick={() => setStep(0)}
            >
              <i className="bi bi-arrow-left me-1"></i> Назад
            </button>
            <div className="input-group input-group-sm">
              <input
                type={selectedField.type === 'number' ? 'number' : selectedField.type === 'date' ? 'date' : 'text'}
                className="form-control"
                placeholder="Введіть значення..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitValue()}
                autoFocus
              />
              <button className="btn btn-primary" onClick={handleSubmitValue}>
                <i className="bi bi-check-lg"></i>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
