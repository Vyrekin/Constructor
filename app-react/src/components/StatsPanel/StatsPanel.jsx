import React, { useState, useEffect } from 'react';
import DonutChart from './DonutChart';
import ExportSection from './ExportSection';

export default function StatsPanel({ includeCount, excludeCount, totalFilters }) {
  const [count, setCount] = useState(24500000);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (totalFilters === 0) {
      animateCount(24500000);
      return;
    }
    // Mock: reduce count based on number of filters
    const base = 24500000;
    const reduction = Math.min(totalFilters * 2400000, base - 100000);
    const newCount = base - reduction + Math.floor(Math.random() * 500000);
    animateCount(Math.max(newCount, 50000));
  }, [totalFilters]);

  const animateCount = (target) => {
    setIsAnimating(true);
    const start = count;
    const diff = target - start;
    const duration = 600;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setIsAnimating(false);
      }
    };
    requestAnimationFrame(step);
  };

  const formatNumber = (n) => n.toLocaleString('uk-UA');

  return (
    <div
      className="d-flex flex-column h-100 bg-white border-start p-3"
      style={{ width: 260, minWidth: 260 }}
    >
      {/* Counter */}
      <div className="text-center mb-3">
        <div className="text-muted small mb-1" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
          РОЗМІР АУДИТОРІЇ
        </div>
        <div
          className="fw-bold"
          style={{
            fontSize: '1.8rem',
            color: '#198754',
            fontVariantNumeric: 'tabular-nums',
            transition: 'color 0.3s',
          }}
        >
          {formatNumber(count)}
        </div>
        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
          контактів
        </div>
      </div>

      {/* Donut */}
      <div className="mb-3">
        <DonutChart includeCount={includeCount} excludeCount={excludeCount} />
        <div className="d-flex justify-content-center gap-3 mt-2" style={{ fontSize: '0.72rem' }}>
          <span>
            <span className="d-inline-block rounded-circle me-1" style={{ width: 8, height: 8, background: '#198754' }}></span>
            Включити: {includeCount}
          </span>
          <span>
            <span className="d-inline-block rounded-circle me-1" style={{ width: 8, height: 8, background: '#dc3545' }}></span>
            Виключити: {excludeCount}
          </span>
        </div>
      </div>

      {/* Scope info */}
      <div className="mb-3 p-2 rounded-2" style={{ background: '#f0f4ff', fontSize: '0.78rem' }}>
        <div className="d-flex justify-content-between">
          <span className="text-muted">Фільтрів:</span>
          <span className="fw-bold">{totalFilters}</span>
        </div>
      </div>

      <div className="mt-auto">
        <ExportSection totalCount={count} />
      </div>
    </div>
  );
}
