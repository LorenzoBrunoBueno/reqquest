import { useEffect, useRef } from 'react';

export default function ScoreChart({ partidas }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // partidas já vem em ordem cronológica (mais antiga primeiro) — ver
    // data/db.js::getPartidas.
    const cronologicas = partidas;
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = 220;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const styles = getComputedStyle(document.body);
    const textColor = styles.getPropertyValue('--text-muted').trim() || '#6b7280';
    const gridColor = styles.getPropertyValue('--border').trim() || '#e5e7eb';
    const lineColor = styles.getPropertyValue('--primary').trim() || '#2563eb';

    const padding = { top: 16, right: 16, bottom: 26, left: 36 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    if (cronologicas.length === 0) {
      ctx.fillStyle = textColor;
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText('Jogue algumas partidas pra ver seu gráfico aqui.', 16, h / 2);
      return;
    }

    const scores = cronologicas.map(p => p.score);
    const maxScore = Math.max(...scores, 10);

    ctx.strokeStyle = gridColor; ctx.lineWidth = 1; ctx.font = '10px Inter, sans-serif'; ctx.fillStyle = textColor;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (plotH * i) / 4;
      ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(w - padding.right, y); ctx.stroke();
      const value = Math.round(maxScore - (maxScore * i) / 4);
      ctx.fillText(value, 4, y + 3);
    }

    const stepX = cronologicas.length > 1 ? plotW / (cronologicas.length - 1) : 0;
    ctx.beginPath();
    ctx.strokeStyle = lineColor; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    cronologicas.forEach((p, i) => {
      const x = padding.left + stepX * i;
      const y = padding.top + plotH - (p.score / maxScore) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.lineTo(padding.left + stepX * (cronologicas.length - 1), padding.top + plotH);
    ctx.lineTo(padding.left, padding.top + plotH);
    ctx.closePath();
    ctx.fillStyle = lineColor + '22';
    ctx.fill();

    ctx.fillStyle = lineColor;
    cronologicas.forEach((p, i) => {
      const x = padding.left + stepX * i;
      const y = padding.top + plotH - (p.score / maxScore) * plotH;
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
    });
  }, [partidas]);

  return (
    <div className="chart-wrap">
      <canvas ref={canvasRef} id="evolution-chart" height="220"></canvas>
    </div>
  );
}
