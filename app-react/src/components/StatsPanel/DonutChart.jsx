import React, { useRef, useEffect } from 'react';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

export default function DonutChart({ includeCount, excludeCount }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const total = includeCount + excludeCount;
    const data = total > 0
      ? [includeCount, excludeCount]
      : [1];
    const colors = total > 0
      ? ['#198754', '#dc3545']
      : ['#e9ecef'];

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: total > 0 ? ['Включити', 'Виключити'] : ['Немає фільтрів'],
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          cutout: '70%',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: total > 0 },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [includeCount, excludeCount]);

  return (
    <div style={{ width: 120, height: 120, margin: '0 auto' }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
