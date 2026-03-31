import React, { useState, useCallback } from 'react';
import FilterSidebar from './components/FilterSidebar/FilterSidebar';
import ConditionBuilder from './components/ConditionBuilder/ConditionBuilder';
import FilterPicker from './components/FilterPicker/FilterPicker';
import AIQueryPanel from './components/AIQueryPanel/AIQueryPanel';
import StatsPanel from './components/StatsPanel/StatsPanel';
import { useFiltersStore } from './store/useFiltersStore';

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

  const [scope, setScope] = useState('all'); // 'all' | 'b2c' | 'b2b'
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
    setPicker({ isOpen: true, zone, position: { x: 340, y: 120 } });
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

  const scopeLabels = { all: 'Усі', b2c: 'С-клієнти', b2b: 'В-клієнти' };

  return (
    <div className="d-flex flex-column vh-100" style={{ background: '#f6f6f9' }}>
      {/* Header */}
      <header
        className="d-flex align-items-center px-3 py-2 border-bottom bg-white shadow-sm"
        style={{ minHeight: 56, zIndex: 1040 }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-2 d-flex align-items-center justify-content-center"
            style={{ width: 36, height: 36, background: '#198754', color: '#fff', fontWeight: 800, fontSize: '1rem' }}
          >
            НП
          </div>
          <div>
            <div className="fw-bold" style={{ fontSize: '0.95rem', lineHeight: 1.2 }}>
              Конструктор вибірок
            </div>
            <div className="text-muted" style={{ fontSize: '0.68rem' }}>
              React Edition
            </div>
          </div>
        </div>

        {/* Scope toggle */}
        <div className="ms-4 d-inline-flex bg-light rounded-pill p-1 border">
          {['all', 'b2b', 'b2c'].map((s) => (
            <button
              key={s}
              className={`btn btn-sm px-3 ${scope === s ? 'btn-primary shadow-sm' : 'btn-link text-decoration-none text-muted'}`}
              style={{ borderRadius: 20, fontSize: '0.78rem' }}
              onClick={() => setScope(s)}
            >
              {scopeLabels[s]}
            </button>
          ))}
        </div>

        <div className="ms-auto d-flex align-items-center gap-2">
          <span className="badge bg-success bg-opacity-10 text-success px-2 py-1" style={{ fontSize: '0.72rem' }}>
            <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.4rem' }}></i>
            Онлайн
          </span>
        </div>
      </header>

      {/* Main layout */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Left sidebar */}
        <FilterSidebar
          scope={scope}
          isAIMode={isAIMode}
          onToggleAI={() => setIsAIMode(!isAIMode)}
        />

        {/* Center: Condition builder or AI panel */}
        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
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

        {/* Right stats panel */}
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
