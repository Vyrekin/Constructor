import React, { useState } from 'react';
import { parseAIQuery, generateMockSQL } from './aiQueryParser';

export default function AIQueryPanel({ onApplyFilters }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!query.trim()) return;
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const parsed = parseAIQuery(query);
      const sql = generateMockSQL(parsed);
      setResult({ filters: parsed, sql });
      setIsLoading(false);
    }, 800);
  };

  const handleApply = () => {
    if (result?.filters) {
      onApplyFilters(result.filters);
    }
  };

  return (
    <div className="p-3">
      <div className="mb-3">
        <label className="form-label fw-bold small">
          <i className="bi bi-stars me-1 text-primary"></i>
          AI-помічник — опишіть вибірку
        </label>
        <textarea
          className="form-control"
          rows={4}
          placeholder="Напр.: Знайди активних клієнтів чоловічої статі від 25 до 45 років, які відправляли посилки з Києва..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
          }}
        />
      </div>

      <div className="d-flex gap-2 mb-3">
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSubmit}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1"></span>
              Аналізую...
            </>
          ) : (
            <>
              <i className="bi bi-search me-1"></i>
              Шукати
            </>
          )}
        </button>
        {result && (
          <button className="btn btn-success btn-sm" onClick={handleApply}>
            <i className="bi bi-check-lg me-1"></i>
            Застосувати ({result.filters.length})
          </button>
        )}
      </div>

      {result && (
        <div className="border rounded-2 p-2" style={{ background: '#f8f9fa' }}>
          <div className="small fw-bold text-muted mb-1">
            <i className="bi bi-code-slash me-1"></i>
            Згенерований SQL:
          </div>
          <pre
            className="mb-2 p-2 rounded-2 small"
            style={{
              background: '#1e1e1e',
              color: '#d4d4d4',
              fontSize: '0.75rem',
              whiteSpace: 'pre-wrap',
              maxHeight: 200,
              overflow: 'auto',
            }}
          >
            {result.sql || 'Не вдалось розпізнати запит'}
          </pre>
          <div className="small text-muted">
            Знайдено полів: <strong>{result.filters.length}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
