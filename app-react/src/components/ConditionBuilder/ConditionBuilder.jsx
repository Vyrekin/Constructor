import React from 'react';
import DropZone from './DropZone';
import ConditionBlock from './ConditionBlock';

export default function ConditionBuilder({
  includeFilters,
  excludeFilters,
  onDrop,
  onRemove,
  onUpdate,
  onClear,
  onOpenPicker,
}) {
  const totalCount = includeFilters.length + excludeFilters.length;

  return (
    <div>
      {/* Audience header */}
      <div className="audience-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <h2 className="audience-title" style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#111827',
          margin: 0,
        }}>Аудиторія</h2>
        {totalCount > 0 && (
          <button
            className="btn-clear-all"
            onClick={onClear}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#E2001A',
              border: '1px solid #E2001A',
              background: 'transparent',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <i className="bi bi-x-circle"></i> Очистити все
          </button>
        )}
      </div>

      {/* Filter builder card */}
      <div className="filter-builder-card" style={{
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12,
      }}>
        {/* Mode bar */}
        <div className="filter-mode-bar" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '8px 12px',
          borderBottom: '1px solid #E5E7EB',
          background: '#F9FAFB',
        }}>
          <span className="fmode-tab active" style={{
            padding: '4px 14px',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 4,
            background: 'var(--np-blue)',
            color: '#fff',
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            border: 'none',
          }}>ВКЛЮЧИТИ</span>
          <span className="fmode-tab" style={{
            padding: '4px 14px',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: 4,
            background: 'transparent',
            color: '#6B7280',
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            border: 'none',
          }}>ВИКЛЮЧИТИ</span>

          <span style={{ width: 1, height: 18, background: '#D1D5DB', margin: '0 2px', flexShrink: 0 }}></span>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 10, fontSize: '0.75rem', marginLeft: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--np-green)' }}></span> B2C
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--np-blue)' }}></span> B2B
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9CA3AF' }}></span> Усі
            </span>
          </div>
        </div>

        {/* Conditions area */}
        <div className="filter-conditions-area" style={{ padding: '12px 14px', minHeight: 100 }}>
          {/* Include section */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--np-green)',
              cursor: 'pointer',
            }}>
              <i className="bi bi-check-circle"></i>
              Включити ({includeFilters.length})
              <button
                onClick={() => onOpenPicker('include')}
                style={{
                  background: 'transparent',
                  border: '1px solid #D1D5DB',
                  borderRadius: 4,
                  width: 20,
                  height: 20,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9CA3AF',
                  fontSize: '0.85rem',
                  marginLeft: 4,
                  padding: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--np-blue)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--np-blue)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              >+</button>
            </div>
            <DropZone zone="include" onDrop={onDrop} isEmpty={includeFilters.length === 0}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {includeFilters.map((filter, idx) => (
                  <React.Fragment key={filter.id}>
                    {idx > 0 && (
                      <div className="inter-block-op" style={{ display: 'flex', alignItems: 'center', margin: '3px 0' }}>
                        <span className="inter-op-select" style={{
                          background: '#FFFBEB',
                          border: '1px solid #F59E0B',
                          color: '#D97706',
                          borderRadius: 4,
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}>{filter.op}</span>
                      </div>
                    )}
                    <ConditionBlock filter={filter} onRemove={onRemove} onUpdate={onUpdate} />
                  </React.Fragment>
                ))}
              </div>
            </DropZone>
          </div>

          {/* Exclude section */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 8,
              fontSize: '0.88rem',
              fontWeight: 600,
              color: 'var(--np-orange)',
              cursor: 'pointer',
            }}>
              <i className="bi bi-dash-circle"></i>
              Виключити ({excludeFilters.length})
              <button
                onClick={() => onOpenPicker('exclude')}
                style={{
                  background: 'transparent',
                  border: '1px solid #D1D5DB',
                  borderRadius: 4,
                  width: 20,
                  height: 20,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9CA3AF',
                  fontSize: '0.85rem',
                  marginLeft: 4,
                  padding: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--np-blue)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--np-blue)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              >+</button>
            </div>
            <DropZone zone="exclude" onDrop={onDrop} isEmpty={excludeFilters.length === 0}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {excludeFilters.map((filter, idx) => (
                  <React.Fragment key={filter.id}>
                    {idx > 0 && (
                      <div className="inter-block-op" style={{ display: 'flex', alignItems: 'center', margin: '3px 0' }}>
                        <span className="inter-op-select" style={{
                          background: '#FFFBEB',
                          border: '1px solid #F59E0B',
                          color: '#D97706',
                          borderRadius: 4,
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}>{filter.op}</span>
                      </div>
                    )}
                    <ConditionBlock filter={filter} onRemove={onRemove} onUpdate={onUpdate} />
                  </React.Fragment>
                ))}
              </div>
            </DropZone>
          </div>
        </div>
      </div>

      {/* Calculate button */}
      <button className="btn-calculate-full" style={{
        background: 'var(--np-blue)',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '14px 20px',
        width: '100%',
        fontSize: '0.92rem',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        letterSpacing: '0.2px',
        marginTop: 8,
      }}>
        <i className="bi bi-play-fill"></i> Розрахувати
      </button>
    </div>
  );
}
