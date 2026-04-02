import React, { useState, useEffect, useRef } from 'react';
import DonutChart from './DonutChart';
import ExportSection from './ExportSection';

export default function StatsPanel({ includeCount, excludeCount, totalFilters }) {
  const [count, setCount] = useState(24500000);
  const countRef = useRef(24500000);

  useEffect(() => {
    const base = 24500000;
    let target;
    if (totalFilters === 0) {
      target = base;
    } else {
      const reduction = Math.min(totalFilters * 2400000, base - 100000);
      target = base - reduction + Math.floor(Math.random() * 500000);
      target = Math.max(target, 50000);
    }
    const start = countRef.current;
    const diff = target - start;
    const duration = 600;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setCount(current);
      countRef.current = current;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [totalFilters]);

  const formatNumber = (n) => n.toLocaleString('uk-UA');

  return (
    <div style={{
      width: 333,
      minWidth: 333,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      alignSelf: 'flex-start',
      overflowY: 'auto',
    }}>
      {/* Counter box — GREEN card */}
      <div className="counter-box" style={{
        background: 'var(--np-green)',
        borderRadius: 12,
        padding: '20px 20px 16px',
        boxShadow: 'var(--shadow-card)',
        textAlign: 'left',
        position: 'relative',
      }}>
        <i className="bi bi-graph-up-arrow" style={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'rgba(255,255,255,0.85)',
          fontSize: '1.2rem',
        }}></i>
        <span style={{
          fontSize: '2.25rem',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.1,
          letterSpacing: -1,
          display: 'block',
        }}>{formatNumber(count)}</span>
        <small style={{
          fontSize: '0.78rem',
          color: 'rgba(255,255,255,0.85)',
          display: 'block',
          marginTop: 4,
        }}>Розмір аудиторії</small>
        <span style={{
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.85)',
          display: 'block',
          marginTop: 2,
        }}>контактів</span>
      </div>

      {/* Donut chart — white card */}
      <div className="np-donut-wrap" style={{
        padding: '16px 20px',
        textAlign: 'center',
        background: '#fff',
        borderRadius: 12,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <DonutChart includeCount={includeCount} excludeCount={excludeCount} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 10, fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--np-green)', display: 'inline-block' }}></span>
            Включити: {includeCount}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--np-orange)', display: 'inline-block' }}></span>
            Виключити: {excludeCount}
          </span>
        </div>
      </div>

      {/* Export section — white card */}
      <div className="np-export-section" style={{
        padding: '16px 20px',
        background: '#fff',
        borderRadius: 12,
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <ExportSection totalCount={count} />
      </div>
    </div>
  );
}
