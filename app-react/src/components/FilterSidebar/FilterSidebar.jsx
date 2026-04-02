import React, { useState, useMemo } from 'react';
import CategoryGroup from './CategoryGroup';
import { categories, getFieldsByScope } from '../../data/filterRegistry';

export default function FilterSidebar({ scope, isAIMode, onToggleAI }) {
  const [searchQuery, setSearchQuery] = useState('');

  const visibleFields = useMemo(() => getFieldsByScope(scope), [scope]);

  const visibleCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (scope !== 'all' && cat.scope !== 'all' && cat.scope !== scope) return false;
      const catFields = visibleFields.filter((f) => f.catId === cat.id);
      if (searchQuery) {
        return catFields.some((f) => f.label.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return catFields.length > 0;
    });
  }, [scope, visibleFields, searchQuery]);

  return (
    <div style={{
      width: 316,
      minWidth: 316,
      background: '#fff',
      borderRadius: 12,
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      alignSelf: 'flex-start',
      maxHeight: 'calc(100vh - 144px)',
    }}>
      {/* Search + AI row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 12px',
        borderBottom: '1px solid #F3F4F6',
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <i className="bi bi-search" style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF',
            fontSize: '0.8rem',
            pointerEvents: 'none',
          }}></i>
          <input
            type="text"
            className="form-control"
            placeholder="Пошук полів..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: 30,
              fontSize: '0.82rem',
              height: 34,
              borderRadius: 6,
              border: '1px solid #E5E7EB',
              background: '#F9FAFB',
            }}
          />
        </div>
        <button
          onClick={onToggleAI}
          style={{
            background: isAIMode ? 'var(--np-green)' : '#F3F4F6',
            color: isAIMode ? '#fff' : '#495057',
            border: isAIMode ? '1px solid var(--np-green)' : '1px solid var(--border)',
            borderRadius: 6,
            padding: '0 10px',
            height: 34,
            fontSize: '0.82rem',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <i className="bi bi-stars"></i> AI
        </button>
      </div>

      {/* Label */}
      <div style={{
        padding: '8px 12px 4px',
        fontSize: '0.72rem',
        fontWeight: 700,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        Категорії полів
      </div>

      {/* Categories list */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {visibleCategories.map((cat) => (
          <CategoryGroup
            key={cat.id}
            category={cat}
            fields={visibleFields.filter((f) => f.catId === cat.id)}
            searchQuery={searchQuery}
          />
        ))}
        {visibleCategories.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '24px 0', fontSize: '0.85rem' }}>
            <i className="bi bi-search d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
            Нічого не знайдено
          </div>
        )}
      </div>
    </div>
  );
}
