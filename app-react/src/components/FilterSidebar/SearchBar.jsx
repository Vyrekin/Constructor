import React from 'react';

export default function SearchBar({ query, onQueryChange, isAIMode, onToggleAI }) {
  return (
    <div className="px-3 pt-3 pb-2">
      <div className="input-group input-group-sm">
        <span className="input-group-text bg-white border-end-0">
          <i className="bi bi-search text-muted"></i>
        </span>
        <input
          type="text"
          className="form-control border-start-0"
          placeholder="Пошук полів..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <button
          className={`btn ${isAIMode ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={onToggleAI}
          title="AI-помічник"
        >
          <i className="bi bi-stars"></i>
        </button>
      </div>
    </div>
  );
}
