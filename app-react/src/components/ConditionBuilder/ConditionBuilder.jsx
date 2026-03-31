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
  return (
    <div className="flex-grow-1 p-3 overflow-auto">
      {/* Include zone */}
      <div className="mb-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
            <span
              className="badge rounded-pill"
              style={{ background: '#198754', fontSize: '0.7rem' }}
            >
              ВКЛЮЧИТИ
            </span>
            <span className="text-muted small">({includeFilters.length})</span>
          </h6>
          <button
            className="btn btn-sm btn-outline-success border-0 px-2 py-0"
            onClick={() => onOpenPicker('include')}
            title="Додати фільтр"
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>
        <DropZone zone="include" onDrop={onDrop} isEmpty={includeFilters.length === 0}>
          {includeFilters.map((filter) => (
            <ConditionBlock
              key={filter.id}
              filter={filter}
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ))}
        </DropZone>
      </div>

      {/* Exclude zone */}
      <div className="mb-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
            <span
              className="badge rounded-pill"
              style={{ background: '#dc3545', fontSize: '0.7rem' }}
            >
              ВИКЛЮЧИТИ
            </span>
            <span className="text-muted small">({excludeFilters.length})</span>
          </h6>
          <button
            className="btn btn-sm btn-outline-danger border-0 px-2 py-0"
            onClick={() => onOpenPicker('exclude')}
            title="Додати виключення"
          >
            <i className="bi bi-plus-lg"></i>
          </button>
        </div>
        <DropZone zone="exclude" onDrop={onDrop} isEmpty={excludeFilters.length === 0}>
          {excludeFilters.map((filter) => (
            <ConditionBlock
              key={filter.id}
              filter={filter}
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ))}
        </DropZone>
      </div>

      {/* Formula & Actions */}
      <div className="d-flex align-items-center gap-2 mt-2">
        <button className="btn btn-sm btn-outline-secondary" onClick={onClear} disabled={includeFilters.length === 0 && excludeFilters.length === 0}>
          <i className="bi bi-trash3 me-1"></i> Очистити
        </button>
        {(includeFilters.length > 0 || excludeFilters.length > 0) && (
          <div
            className="flex-grow-1 px-2 py-1 rounded-2 small text-muted"
            style={{ background: '#f0f4ff', fontFamily: 'monospace', fontSize: '0.75rem' }}
          >
            <i className="bi bi-code-slash me-1"></i>
            {includeFilters.map((f) => f.label).join(` ${includeFilters[0]?.op || 'ТА'} `)}
            {excludeFilters.length > 0 && (
              <span className="text-danger">
                {' '}ОКРІМ ({excludeFilters.map((f) => f.label).join(', ')})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
