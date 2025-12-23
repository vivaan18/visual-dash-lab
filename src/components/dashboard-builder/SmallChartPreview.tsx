import React from 'react';

interface Props {
  type: string;
  data: any[];
  width?: number;
  height?: number;
  color?: string;
  colors?: string[];
}

// Very small, dependency-free SVG previews. Not a full chart renderer — just enough
// to give users an idea of the shape (bars, line, pie, scatter).
const SmallChartPreview: React.FC<Props> = ({ type, data = [], width = 160, height = 90, color = '#3b82f6', colors = [] }) => {
  if (!data || data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No preview</div>;
  }

  // Detect series shape. We support:
  // - array of simple { value } or { y } or numeric entries -> single series
  // - array of objects with multiple numeric keys -> multi-series
  const sample = data[0] || {};
  const numericKeys = typeof sample === 'object' && sample ? Object.keys(sample).filter(k => typeof sample[k] === 'number') : [];

  let series: number[][] = [];
  let categories: string[] = [];

  if (numericKeys.length > 1) {
    // multi-series: each numeric key becomes a series
    series = numericKeys.map(k => data.map((d: any) => {
      const v = Number(d[k]);
      return isNaN(v) ? 0 : v;
    }));
    categories = (data as any[]).map((d: any, i: number) => d.label ?? d.name ?? `#${i+1}`);
  } else {
    // single series
    const numericValues = data.map((d: any) => Number(d.value ?? d.y ?? Object.values(d).find((v: any) => typeof v === 'number'))).map(v => isNaN(v) ? 0 : v);
    series = [numericValues];
    categories = (data as any[]).map((d: any, i: number) => d.label ?? d.name ?? `#${i+1}`);
  }

  const max = Math.max(...series.flat(), 1);

  if (type.includes('bar') || type.includes('histogram') || (data[0] && 'value' in data[0] && data.length <= 8)) {
    // Grouped bar chart for multi-series, single bars for single-series
    const nCats = Math.max(1, categories.length);
    const seriesCount = Math.max(1, series.length);
    const groupWidth = width / nCats;
    const barInnerWidth = Math.max(3, (groupWidth - 6) / seriesCount);
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {series[0].map((_, i) => {
          return series.map((s, si) => {
            const v = s[i] ?? 0;
            const h = (v / max) * (height - 8);
            const x = i * groupWidth + 2 + si * (barInnerWidth + 2);
            const y = height - h - 4;
            const fill = colors[si] || (si === 0 ? color : `rgba(59,130,246,${1 - si*0.15})`);
            return <rect key={`${i}-${si}`} x={x} y={y} width={Math.max(3, barInnerWidth)} height={h} fill={fill} rx={2} />;
          });
        })}
      </svg>
    );
  }

  if (type.includes('line') || type.includes('area')) {
    const n = Math.max(1, series[0].length);
    const step = width / Math.max(1, n - 1);
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {series.map((s, si) => {
          const points = s.map((v, i) => `${i * step},${height - (v / max) * (height - 8) - 4}`).join(' ');
          const stroke = colors[si] || (si === 0 ? color : `rgba(59,130,246,${1 - si*0.15})`);
          return <polyline key={si} fill="none" stroke={stroke} strokeWidth={si===0?2:1.5} points={points} strokeLinejoin="round" strokeLinecap="round" opacity={1 - si*0.15} />;
        })}
      </svg>
    );
  }

  if (type.includes('pie') || type.includes('donut')) {
    const total = series[0].reduce((a: number, b: number) => a + b, 0) || 1;
    let start = 0;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.min(width, height) / 2 - 4;

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {series[0].map((v, i) => {
          const portion = v / total;
          const end = start + portion;
          const large = portion > 0.5 ? 1 : 0;
          const sx = cx + r * Math.cos(2 * Math.PI * start - Math.PI / 2);
          const sy = cy + r * Math.sin(2 * Math.PI * start - Math.PI / 2);
          const ex = cx + r * Math.cos(2 * Math.PI * end - Math.PI / 2);
          const ey = cy + r * Math.sin(2 * Math.PI * end - Math.PI / 2);
          const d = `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`;
          const fill = colors[i] || color;
          start = end;
          return <path key={i} d={d} fill={fill} opacity={0.9 - (i % 3) * 0.15} />;
        })}
      </svg>
    );
  }

  if (type.includes('scatter')) {
    const cx = width / 2;
    const cy = height / 2;
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {series[0].map((v, i) => {
          const x = (i / Math.max(1, series[0].length - 1)) * (width - 8) + 4;
          const y = height - (v / max) * (height - 8) - 4;
          return <circle key={i} cx={x} cy={y} r={2.5} fill={colors[0] || color} />;
        })}
      </svg>
    );
  }

  // Fallback: simple sparkline based on numeric values
  const step = width / Math.max(1, series[0].length - 1);
  const points = series[0].map((v, i) => `${i * step},${height - (v / max) * (height - 8) - 4}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={colors[0] || color} strokeWidth={1.5} points={points} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

export default SmallChartPreview;
