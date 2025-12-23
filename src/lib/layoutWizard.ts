// Smart layout utility used by the Template/Layout wizards.
// Keeps types loose to avoid tight coupling with app types.
export type LayoutOptions = {
  canvasWidth?: number;
  leftPadding?: number;
  topPadding?: number;
  kpiPreferredCols?: number;
  kpiHeight?: number;
  kpiGap?: number;
  chartPreferredCols?: number;
  chartGap?: number;
};

// Use `any` here intentionally to avoid tight coupling with app-specific types.
type AnyComp = any;

/**
 * Arranges KPIs first (up to kpiPreferredCols) then charts in a grid underneath.
 * - Respects existing component properties.width/height when present.
 * - Returns a new array of components with updated position and size fields.
 */
export function layoutComponents(components: AnyComp[] = [], opts: Partial<LayoutOptions> = {}): AnyComp[] {
  const {
    canvasWidth = 1300,
    leftPadding = 20,
    topPadding = 20,
    kpiPreferredCols = 6,
    kpiHeight = 120,
    kpiGap = 4,
    chartPreferredCols = 3,
    chartGap = 8,
  } = opts;

  // shallow copy to avoid mutating original array
  const comps = components.map(c => ({ ...c, properties: { ...(c.properties || {}) } }));

  const kpis = comps.filter(c => c.type === 'kpi-card');
  const charts = comps.filter(c => c.type !== 'kpi-card');

  // KPI layout: compute columns based on count and preferred
  const kpiCount = kpis.length;
  const kpiCols = Math.min(kpiPreferredCols, Math.max(1, kpiCount));
  const totalKpiGaps = (kpiCols - 1) * kpiGap;
  const availableKpiWidth = Math.max(0, canvasWidth - leftPadding * 2 - totalKpiGaps);
  const kpiWidth = kpiCols > 0 ? Math.max(80, Math.floor(availableKpiWidth / kpiCols)) : Math.max(80, Math.floor(availableKpiWidth));

  kpis.forEach((k, i) => {
    const row = Math.floor(i / kpiCols);
    const col = i % kpiCols;
    const x = leftPadding + col * (kpiWidth + kpiGap);
    const y = topPadding + row * (kpiHeight + kpiGap);
    k.position = { x, y };
    k.size = { width: kpiWidth, height: kpiHeight };
    k.properties = { ...(k.properties || {}), width: kpiWidth, height: kpiHeight };
  });

  // Charts layout: start below KPI block
  const kpiRows = Math.ceil(kpiCount / kpiCols) || 0;
  const chartsStartY = topPadding + kpiRows * (kpiHeight + kpiGap) + 20;

  const chartCount = charts.length;
  const chartCols = Math.min(chartPreferredCols, Math.max(1, chartCount));
  // fallback width when a chart doesn't specify width
  const totalChartGaps = (chartCols - 1) * chartGap;
  const fallbackChartWidth = Math.max(160, Math.floor((canvasWidth - leftPadding * 2 - totalChartGaps) / chartCols));

  charts.forEach((ch, idx) => {
    const col = idx % chartCols;
    const row = Math.floor(idx / chartCols);
    const cw = ch.properties?.width || ch.size?.width || fallbackChartWidth;
    const chh = ch.properties?.height || ch.size?.height || 300;
    const x = leftPadding + col * (cw + chartGap);
    const y = chartsStartY + row * (chh + chartGap);
    ch.position = { x, y };
    ch.size = { width: cw, height: chh };
    ch.properties = { ...(ch.properties || {}), width: cw, height: chh };
  });

  // Keep original order (KPIs then charts)
  return [...kpis, ...charts].map(c => ({
    ...c,
    // normalize to app shape (position, size)
    position: c.position || c.position,
    size: c.size || c.size,
  }));
}
