import React, { useState, useCallback } from 'react';
import FilterSidebar from './components/FilterSidebar/FilterSidebar';
import ConditionBuilder from './components/ConditionBuilder/ConditionBuilder';
import FilterPicker from './components/FilterPicker/FilterPicker';
import AIQueryPanel from './components/AIQueryPanel/AIQueryPanel';
import StatsPanel from './components/StatsPanel/StatsPanel';
import { useFiltersStore } from './store/useFiltersStore';
import './app.css';

export default function App() {
  const {
    filters,
    includeFilters,
    excludeFilters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
  } = useFiltersStore();

  const [scope, setScope] = useState('all');
  const [isAIMode, setIsAIMode] = useState(false);
  const [picker, setPicker] = useState({ isOpen: false, zone: 'include', position: null });

  const handleDrop = useCallback(
    (field, zone) => {
      addFilter({
        fieldId: field.id,
        label: field.label,
        value: '',
        zone,
        op: 'ТА',
        visibility: field.scope || 'universal',
      });
    },
    [addFilter]
  );

  const handlePickerSelect = useCallback(
    ({ field, value, zone }) => {
      addFilter({
        fieldId: field.id,
        label: field.label,
        value,
        zone,
        op: 'ТА',
        visibility: field.scope || 'universal',
      });
    },
    [addFilter]
  );

  const handleOpenPicker = useCallback((zone) => {
    setPicker({ isOpen: true, zone, position: { x: 340, y: 160 } });
  }, []);

  const handleClosePicker = useCallback(() => {
    setPicker((p) => ({ ...p, isOpen: false }));
  }, []);

  const handleAIApply = useCallback(
    (parsedFilters) => {
      for (const f of parsedFilters) {
        addFilter(f);
      }
      setIsAIMode(false);
    },
    [addFilter]
  );

  const scopeLabels = { all: 'Усі', b2c: 'C-клієнти', b2b: 'B-клієнти' };

  return (
    <div className="d-flex flex-column vh-100" style={{ background: 'var(--bg-app, #f6f6f9)' }}>
      {/* ── System Header (48px) ── */}
      <header className="app-header d-flex align-items-center px-3" style={{
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        height: 48,
        minHeight: 48,
        zIndex: 1040,
      }}>
        <span className="np-logo-text" style={{
          color: '#E2001A',
          fontWeight: 900,
          fontSize: '1rem',
          letterSpacing: '-0.3px',
          textTransform: 'uppercase',
        }}>Нова Пошта</span>
        <div className="np-system-nav d-flex gap-1 ms-3">
          <span className="nav-link" style={{ color: '#495057', fontSize: '0.8rem', fontWeight: 500, padding: '0.2rem 0.5rem' }}>
            Конструктор
          </span>
        </div>
        <div className="ms-auto d-flex align-items-center gap-2">
          <span style={{ fontSize: '0.8rem', color: '#495057' }}>
            <i className="bi bi-person-circle me-1"></i>User
          </span>
        </div>
      </header>

      {/* ── Page Sub-header (64px) ── */}
      <div className="page-subheader d-flex align-items-center" style={{
        background: '#fff',
        borderBottom: '1px solid #dee2e6',
        padding: '0 24px',
        height: 64,
        minHeight: 64,
        gap: 24,
        position: 'sticky',
        top: 48,
        zIndex: 990,
      }}>
        <h1 className="page-title mb-0" style={{
          fontSize: '1.875rem',
          fontWeight: 600,
          color: '#212529',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>Конструктор вибірок</h1>

        {/* Segment tabs */}
        <div className="segment-tabs" style={{
          display: 'inline-flex',
          border: '1px solid #dee2e6',
          borderRadius: 6,
          overflow: 'hidden',
          background: '#fff',
        }}>
          {['all', 'b2b', 'b2c'].map((s) => (
            <button
              key={s}
              className={`seg-tab ${scope === s ? 'active' : ''}`}
              onClick={() => setScope(s)}
              style={{
                padding: '6px 16px',
                fontSize: '0.82rem',
                fontWeight: scope === s ? 600 : 500,
                color: scope === s ? '#212529' : '#6c757d',
                background: scope === s ? '#e9ecef' : 'transparent',
                border: 'none',
                borderRight: '1px solid #dee2e6',
                cursor: 'pointer',
              }}
            >{scopeLabels[s]}</button>
          ))}
        </div>

        <button className="btn-templates ms-auto" style={{
          background: '#0d6efd',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 18px',
          fontSize: '0.85rem',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          flexShrink: 0,
        }}>
          <i className="bi bi-bookmark"></i> Шаблони
        </button>
      </div>

      {/* ── Main 3-column layout ── */}
      <div className="np-layout" style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        background: '#f6f6f9',
        padding: 16,
        gap: 12,
      }}>
        {/* Left sidebar */}
        <FilterSidebar
          scope={scope}
          isAIMode={isAIMode}
          onToggleAI={() => setIsAIMode(!isAIMode)}
        />

        {/* Center content */}
        <div className="np-main-content" style={{
          flex: 1,
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #dee2e6',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          padding: '20px 20px 16px',
          overflowY: 'auto',
          alignSelf: 'flex-start',
          minHeight: 200,
        }}>
          {isAIMode ? (
            <AIQueryPanel onApplyFilters={handleAIApply} />
          ) : (
            <ConditionBuilder
              includeFilters={includeFilters}
              excludeFilters={excludeFilters}
              onDrop={handleDrop}
              onRemove={removeFilter}
              onUpdate={updateFilter}
              onClear={clearFilters}
              onOpenPicker={handleOpenPicker}
            />
          )}
        </div>

        {/* Right sidebar */}
        <StatsPanel
          includeCount={includeFilters.length}
          excludeCount={excludeFilters.length}
          totalFilters={filters.length}
        />
      </div>

      {/* Filter Picker popup */}
      <FilterPicker
        isOpen={picker.isOpen}
        zone={picker.zone}
        scope={scope}
        position={picker.position}
        onSelect={handlePickerSelect}
        onClose={handleClosePicker}
      />
    </div>
  );
}
