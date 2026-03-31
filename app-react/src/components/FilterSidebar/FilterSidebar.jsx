import React, { useState, useMemo } from 'react';
import SearchBar from './SearchBar';
import CategoryGroup from './CategoryGroup';
import { categories, filterFields, getFieldsByScope } from '../../data/filterRegistry';

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
    <div
      className="d-flex flex-column h-100 bg-white border-end"
      style={{ width: 280, minWidth: 280 }}
    >
      <div className="px-3 pt-3 pb-1">
        <h6 className="fw-bold text-uppercase mb-0" style={{ fontSize: '0.75rem', letterSpacing: '1px', color: '#6c757d' }}>
          <i className="bi bi-funnel me-1"></i> Поля фільтрів
        </h6>
      </div>
      <SearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        isAIMode={isAIMode}
        onToggleAI={onToggleAI}
      />
      <div className="flex-grow-1 overflow-auto" style={{ scrollbarWidth: 'thin' }}>
        {visibleCategories.map((cat) => (
          <CategoryGroup
            key={cat.id}
            category={cat}
            fields={visibleFields.filter((f) => f.catId === cat.id)}
            searchQuery={searchQuery}
          />
        ))}
        {visibleCategories.length === 0 && (
          <div className="text-center text-muted py-4" style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-search d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
            Нічого не знайдено
          </div>
        )}
      </div>
    </div>
  );
}
