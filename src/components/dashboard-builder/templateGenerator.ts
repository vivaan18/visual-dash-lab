import type { DashboardComponent } from '@/types/dashboard';

// Strong Template type used by the TemplateSelector and other consumers
export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string | null;
  components: DashboardComponent[];
  [key: string]: any;
}

type AnyObj = Record<string, any>;

const uid = (prefix = '') => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

// Compact layout constants
export const COMPACT_KPI_WIDTH = 211;
export const COMPACT_KPI_HEIGHT = 107;
export const COMPACT_KPI_GAP = 16;

export const CHART_LAYOUTS = [
  { x: 20, y: 143, width: 558, height: 318 },
  { x: 581, y: 143, width: 558, height: 318 },
  { x: 1144, y: 143, width: 558, height: 318 },
  { x: 20, y: 466, width: 558, height: 334 },
  { x: 581, y: 466, width: 558, height: 334 },
  { x: 1144, y: 466, width: 558, height: 334 },
];

function makeSampleRows(n = 6) {
  return Array.from({ length: n }, (_, i) => ({
    name: `Item ${i + 1}`,
    value: Math.round(Math.random() * 120 + 20),
    secondary: Math.round(Math.random() * 80 + 10),
    tertiary: Math.round(Math.random() * 50 + 5),
  }));
}

export function makeKpi(idSuffix: string, title: string, palette: string[], position: { x: number; y: number }) {
  return {
    id: uid('comp_') + idSuffix,
    type: 'kpi-card',
    position,
    size: { width: COMPACT_KPI_WIDTH, height: COMPACT_KPI_HEIGHT },
    zIndex: 1,
    properties: {
      title,
      kpiLabel: '',
      value: Math.round(Math.random() * 9000 + 100),
      targetValue: Math.round(Math.random() * 8000 + 100),
      showTrend: true,
      backgroundColor: palette[0],
      valueColor: getContrastColor(palette[0]),
      titleColor: getContrastColor(palette[0], 0.75),
      valueFontSize: 34,
      titleFontSize: 13,
      borderRadius: 8,
    },
  } as DashboardComponent;
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function luminanceForHex(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function getContrastColor(hex: string, makeSemiTransparent = 1) {
  try {
    const lum = luminanceForHex(hex || '#ffffff');
    const color = lum < 0.5 ? '#ffffff' : '#111827';
    if (makeSemiTransparent && color === '#ffffff') {
      return makeSemiTransparent === 1 ? '#ffffff' : 'rgba(255,255,255,0.75)';
    }
    return color;
  } catch (e) {
    return '#111827';
  }
}

function makeChartCustom(
  idSuffix: string,
  chosenType: string,
  title: string,
  palette: string[],
  position: { x: number; y: number },
  size: { width: number; height: number },
  seriesDefs: AnyObj[],
  options?: AnyObj
) {
  const data: AnyObj[] = makeSampleRows(6) as AnyObj[];
  if (seriesDefs.some((s) => s.dataKey === 'secondary')) {
    data.forEach((d) => {
      d.secondary = Math.round(Math.random() * 80 + 10);
    });
  }
  if (seriesDefs.some((s) => s.dataKey === 'tertiary')) {
    data.forEach((d) => {
      d.tertiary = Math.round(Math.random() * 50 + 5);
    });
  }
  if (chosenType === 'scatter-chart') {
    for (let i = 0; i < data.length; i++) {
      data[i] = { label: `P${i + 1}`, x: Math.round(Math.random() * 100), y: Math.round(Math.random() * 200) };
    }
  }

  return {
    id: uid('comp_') + idSuffix,
    type: chosenType as any,
    position,
    size,
    zIndex: 2,
    properties: {
      title,
      data,
      series: seriesDefs,
      height: size.height,
      showGrid: options?.showGrid ?? true,
      showLegend: options?.showLegend ?? (seriesDefs.length > 1),
      xAxisLabel: options?.xAxisLabel,
      yAxisLabel: options?.yAxisLabel,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      ...options?.extraProps,
    },
  } as DashboardComponent;
}

// Build the four required templates
const defaultTemplates: Template[] = [];

// Sales CRM - energetic palette, multi-series charts, funnel, scatter, gauge
(() => {
  const palette = ['#ef4444', '#f97316', '#3b82f6'];
  const components: DashboardComponent[] = [];

  const kpis = ['Total Revenue', 'New Leads', 'Win Rate', 'Avg Deal Size', 'Deals Closed', 'Pipeline Value'];
  for (let k = 0; k < 6; k++) {
    components.push(makeKpi(`sales_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));
  }

  components.push(
    makeChartCustom(
      'sales_chart_1',
      'multi-line',
      'Revenue Trend',
      palette,
      CHART_LAYOUTS[0],
      CHART_LAYOUTS[0],
      [
        { id: uid('s_'), dataKey: 'value', name: 'Revenue', color: palette[0], type: 'line' },
        { id: uid('s_'), dataKey: 'secondary', name: 'Forecast', color: palette[1], type: 'line' },
      ],
      { xAxisLabel: 'Month', yAxisLabel: 'Revenue', showLegend: true }
    )
  );

  components.push(
    makeChartCustom(
      'sales_chart_2',
      'combo-chart',
      'Opportunities vs Closed',
      palette,
      CHART_LAYOUTS[1],
      CHART_LAYOUTS[1],
      [
        { id: uid('s_'), dataKey: 'value', name: 'Opportunities', color: palette[0], type: 'bar' },
        { id: uid('s_'), dataKey: 'secondary', name: 'Closed Rate', color: palette[1], type: 'line' },
      ],
      { xAxisLabel: 'Month', yAxisLabel: 'Count / %', showLegend: true }
    )
  );

  components.push(
    makeChartCustom('sales_chart_3', 'funnel-chart', 'Sales Funnel', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
      { id: uid('s_'), dataKey: 'value', name: 'Funnel', color: palette[0], type: 'bar' },
    ], { showLegend: false })
  );

  components.push(
    makeChartCustom('sales_chart_4', 'pie-chart', 'Lead Sources', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
      { id: uid('s_'), dataKey: 'value', name: 'Leads', color: palette[0], type: 'pie' },
    ], { showLegend: true })
  );

  components.push(
    makeChartCustom('sales_chart_5', 'scatter-chart', 'Deal Size vs Sales Cycle', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
      { id: uid('s_'), dataKey: 'x', name: 'Deal Size', color: palette[0], type: 'scatter' },
    ], { xAxisLabel: 'Sales Cycle (days)', yAxisLabel: 'Deal Size', showLegend: false })
  );

  components.push(
    makeChartCustom('sales_chart_6', 'gauge', 'Quota Attainment', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
      { id: uid('s_'), dataKey: 'value', name: 'Quota', color: palette[0], type: 'gauge' },
    ], { showLegend: false })
  );

  defaultTemplates.push({
    id: 'tpl_sales_crm',
    name: 'Sales CRM Dashboard',
    description: 'Sales-focused dashboard with pipeline and performance charts',
    thumbnail: null,
    components,
  });
})();

// HR Analytics - calm palette, multi-series and combo charts, donut, scatter, gauge
(() => {
  const palette = ['#0ea5a4', '#06b6d4', '#34d399'];
  const components: DashboardComponent[] = [];

  const kpis = ['Total Employees', 'New Hires', 'Attrition Rate', 'Avg Tenure', 'Open Positions', 'Engagement Score'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`hr_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(
    makeChartCustom('hr_chart_1', 'multi-line', 'Headcount Trend', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
      { id: uid('s_'), dataKey: 'value', name: 'Headcount', color: palette[0], type: 'line' },
      { id: uid('s_'), dataKey: 'secondary', name: 'Hiring Pace', color: palette[1], type: 'line' },
    ], { xAxisLabel: 'Month', yAxisLabel: 'Employees', showLegend: true })
  );

  components.push(
    makeChartCustom('hr_chart_2', 'combo-chart', 'Hires vs Exits', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
      { id: uid('s_'), dataKey: 'value', name: 'Hires', color: palette[0], type: 'bar' },
      { id: uid('s_'), dataKey: 'secondary', name: 'Exits', color: palette[1], type: 'bar' },
    ], { xAxisLabel: 'Month', yAxisLabel: 'Count', showLegend: true })
  );

  components.push(
    makeChartCustom('hr_chart_3', 'donut-chart', 'Gender Distribution', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
      { id: uid('s_'), dataKey: 'value', name: 'People', color: palette[0], type: 'donut' },
    ], { showLegend: true })
  );

  components.push(
    makeChartCustom('hr_chart_4', 'combo-chart', 'Attrition by Department', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
      { id: uid('s_'), dataKey: 'value', name: 'Attrition %', color: palette[0], type: 'bar' },
      { id: uid('s_'), dataKey: 'secondary', name: 'Avg Tenure', color: palette[1], type: 'line' },
    ], { xAxisLabel: 'Department', yAxisLabel: 'Attrition / Tenure', showLegend: true })
  );

  components.push(
    makeChartCustom('hr_chart_5', 'scatter-chart', 'Engagement vs Tenure', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
      { id: uid('s_'), dataKey: 'x', name: 'Tenure', color: palette[0], type: 'scatter' },
    ], { xAxisLabel: 'Tenure (years)', yAxisLabel: 'Engagement Score', showLegend: false })
  );

  components.push(
    makeChartCustom('hr_chart_6', 'gauge', 'Average Satisfaction', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
      { id: uid('s_'), dataKey: 'value', name: 'Satisfaction', color: palette[2], type: 'gauge' },
    ], { showLegend: false })
  );

  defaultTemplates.push({ id: 'tpl_hr_analytics', name: 'HR Analytics Dashboard', description: 'HR metrics and people analytics for workforce planning', thumbnail: null, components });
})();

// Manufacturing - industrial palette, multi-line, combo, bar, pie, scatter, gauge
(() => {
  const palette = ['#374151', '#f97316', '#f59e0b'];
  const components: DashboardComponent[] = [];

  const kpis = ['Throughput', 'OEE', 'Downtime', 'Yield Rate', 'Defects', 'Cycle Time'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`mfg_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(
    makeChartCustom('mfg_chart_1', 'multi-line', 'Throughput Trend', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
      { id: uid('s_'), dataKey: 'value', name: 'Throughput', color: palette[0], type: 'line' },
      { id: uid('s_'), dataKey: 'secondary', name: 'Target', color: palette[1], type: 'line' },
    ], { xAxisLabel: 'Week', yAxisLabel: 'Units', showLegend: true })
  );

  components.push(
    makeChartCustom('mfg_chart_2', 'combo-chart', 'Production vs Downtime', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
      { id: uid('s_'), dataKey: 'value', name: 'Production', color: palette[0], type: 'bar' },
      { id: uid('s_'), dataKey: 'secondary', name: 'Downtime (hrs)', color: palette[1], type: 'line' },
    ], { xAxisLabel: 'Shift', yAxisLabel: 'Units / Hours', showLegend: true })
  );

  components.push(
    makeChartCustom('mfg_chart_3', 'bar-chart', 'Top Machines Output', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
      { id: uid('s_'), dataKey: 'value', name: 'Output', color: palette[0], type: 'bar' },
    ], { xAxisLabel: 'Machine', yAxisLabel: 'Units', showLegend: false })
  );

  components.push(
    makeChartCustom('mfg_chart_4', 'pie-chart', 'Defect Types', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
      { id: uid('s_'), dataKey: 'value', name: 'Defects', color: palette[0], type: 'pie' },
    ], { showLegend: true })
  );

  components.push(
    makeChartCustom('mfg_chart_5', 'scatter-chart', 'Cycle Time vs Output', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
      { id: uid('s_'), dataKey: 'x', name: 'Cycle Time', color: palette[0], type: 'scatter' },
    ], { xAxisLabel: 'Cycle Time (s)', yAxisLabel: 'Output', showLegend: false })
  );

  components.push(
    makeChartCustom('mfg_chart_6', 'gauge', 'Overall Equipment Effectiveness', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
      { id: uid('s_'), dataKey: 'value', name: 'OEE', color: palette[1], type: 'gauge' },
    ], { showLegend: false })
  );

  defaultTemplates.push({ id: 'tpl_manufacturing', name: 'Manufacturing Dashboard', description: 'Operational manufacturing metrics and equipment performance', thumbnail: null, components });
})();

// Compensation - premium palette, multi-series and combo, donut, bar, scatter, gauge
(() => {
  const palette = ['#b45309', '#d97706', '#8b5cf6'];
  const components: DashboardComponent[] = [];

  const kpis = ['Total Compensation', 'Avg Salary', 'Bonus Spend', 'Benefits Cost', 'Comp Ratio', 'Budget Utilization'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`comp_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(
    makeChartCustom('comp_chart_1', 'multi-line', 'Salary Spend Trend', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
      { id: uid('s_'), dataKey: 'value', name: 'Salary Spend', color: palette[0], type: 'line' },
      { id: uid('s_'), dataKey: 'secondary', name: 'Benefits', color: palette[1], type: 'line' },
    ], { xAxisLabel: 'Quarter', yAxisLabel: 'USD', showLegend: true })
  );

  components.push(
    makeChartCustom('comp_chart_2', 'combo-chart', 'Base vs Bonus vs Benefits', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
      { id: uid('s_'), dataKey: 'value', name: 'Base', color: palette[0], type: 'bar' },
      { id: uid('s_'), dataKey: 'secondary', name: 'Bonus', color: palette[1], type: 'bar' },
      { id: uid('s_'), dataKey: 'tertiary', name: 'Benefits', color: palette[2], type: 'line' },
    ], { xAxisLabel: 'Department', yAxisLabel: 'USD', showLegend: true })
  );

  components.push(
    makeChartCustom('comp_chart_3', 'donut-chart', 'Comp Distribution by Level', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
      { id: uid('s_'), dataKey: 'value', name: 'Distribution', color: palette[0], type: 'donut' },
    ], { showLegend: true })
  );

  components.push(
    makeChartCustom('comp_chart_4', 'bar-chart', 'Average Salary by Role', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
      { id: uid('s_'), dataKey: 'value', name: 'Avg Salary', color: palette[0], type: 'bar' },
    ], { xAxisLabel: 'Role', yAxisLabel: 'USD', showLegend: false })
  );

  components.push(
    makeChartCustom('comp_chart_5', 'scatter-chart', 'Salary vs Performance', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
      { id: uid('s_'), dataKey: 'x', name: 'Performance', color: palette[0], type: 'scatter' },
    ], { xAxisLabel: 'Performance Score', yAxisLabel: 'Salary', showLegend: false })
  );

  components.push(
    makeChartCustom('comp_chart_6', 'gauge', 'Comp Budget Utilization', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
      { id: uid('s_'), dataKey: 'value', name: 'Budget Utilization', color: palette[1], type: 'gauge' },
    ], { showLegend: false })
  );

  defaultTemplates.push({ id: 'tpl_compensation', name: 'Compensation Dashboard', description: 'Compensation planning, spend and distribution', thumbnail: null, components });
})();

// Additional 10 industry templates requested by user

// Marketing
(() => {
  const palette = ['#8b5cf6', '#ec4899', '#06b6d4'];
  const components: DashboardComponent[] = [];
  const kpis = ['Campaign Spend', 'Impressions', 'Clicks', 'CTR', 'Conversions', 'CAC'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`mkt_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(makeChartCustom('mkt_chart_1', 'multi-line', 'Spend vs Conversions', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
    { id: uid('s_'), dataKey: 'value', name: 'Spend', color: palette[0], type: 'line' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Conversions', color: palette[1], type: 'line' },
  ], { xAxisLabel: 'Week', yAxisLabel: 'USD / Conversions', showLegend: true }));

  components.push(makeChartCustom('mkt_chart_2', 'combo-chart', 'Impressions & CTR', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
    { id: uid('s_'), dataKey: 'value', name: 'Impressions', color: palette[0], type: 'bar' },
    { id: uid('s_'), dataKey: 'secondary', name: 'CTR', color: palette[2], type: 'line' },
  ], { xAxisLabel: 'Channel', yAxisLabel: 'Count / %', showLegend: true }));

  components.push(makeChartCustom('mkt_chart_3', 'pie-chart', 'Channel Mix', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
    { id: uid('s_'), dataKey: 'value', name: 'Channel', color: palette[0], type: 'pie' },
  ], { showLegend: true }));

  components.push(makeChartCustom('mkt_chart_4', 'donut-chart', 'Campaign ROI', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
    { id: uid('s_'), dataKey: 'value', name: 'ROI', color: palette[1], type: 'donut' },
  ], { showLegend: true }));

  components.push(makeChartCustom('mkt_chart_5', 'scatter-chart', 'CTR vs Conversion Rate', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
    { id: uid('s_'), dataKey: 'x', name: 'CTR', color: palette[0], type: 'scatter' },
  ], { xAxisLabel: 'CTR', yAxisLabel: 'Conv Rate', showLegend: false }));

  components.push(makeChartCustom('mkt_chart_6', 'gauge', 'Marketing Efficiency', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
    { id: uid('s_'), dataKey: 'value', name: 'Efficiency', color: palette[2], type: 'gauge' },
  ], { showLegend: false }));

  defaultTemplates.push({ id: 'tpl_marketing', name: 'Marketing Dashboard', description: 'Campaign performance and channel analytics', thumbnail: null, components });
})();

// Finance
(() => {
  const palette = ['#065f46', '#0ea5a4', '#f59e0b'];
  const components: DashboardComponent[] = [];
  const kpis = ['Revenue', 'Expenses', 'Gross Margin', 'EBITDA', 'Cash Balance', 'Burn Rate'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`fin_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(makeChartCustom('fin_chart_1', 'multi-line', 'Revenue & Expenses', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
    { id: uid('s_'), dataKey: 'value', name: 'Revenue', color: palette[0], type: 'line' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Expenses', color: palette[1], type: 'line' },
  ], { xAxisLabel: 'Month', yAxisLabel: 'USD', showLegend: true }));

  components.push(makeChartCustom('fin_chart_2', 'combo-chart', 'Margin & EBITDA', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
    { id: uid('s_'), dataKey: 'value', name: 'Gross Margin', color: palette[0], type: 'bar' },
    { id: uid('s_'), dataKey: 'secondary', name: 'EBITDA', color: palette[2], type: 'line' },
  ], { xAxisLabel: 'Quarter', yAxisLabel: 'USD', showLegend: true }));

  components.push(makeChartCustom('fin_chart_3', 'pie-chart', 'Expense Breakdown', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
    { id: uid('s_'), dataKey: 'value', name: 'Expense', color: palette[0], type: 'pie' },
  ], { showLegend: true }));

  components.push(makeChartCustom('fin_chart_4', 'bar-chart', 'Top Cost Centers', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
    { id: uid('s_'), dataKey: 'value', name: 'Cost', color: palette[1], type: 'bar' },
  ], { xAxisLabel: 'Center', yAxisLabel: 'USD', showLegend: false }));

  components.push(makeChartCustom('fin_chart_5', 'scatter-chart', 'Cash vs Burn', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
    { id: uid('s_'), dataKey: 'x', name: 'Cash', color: palette[0], type: 'scatter' },
  ], { xAxisLabel: 'Cash', yAxisLabel: 'Burn Rate', showLegend: false }));

  components.push(makeChartCustom('fin_chart_6', 'gauge', 'Liquidity Health', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
    { id: uid('s_'), dataKey: 'value', name: 'Liquidity', color: palette[2], type: 'gauge' },
  ], { showLegend: false }));

  defaultTemplates.push({ id: 'tpl_finance', name: 'Finance Dashboard', description: 'Financial performance and liquidity overview', thumbnail: null, components });
})();

// Product Analytics
(() => {
  const palette = ['#1f2937', '#6366f1', '#06b6d4'];
  const components: DashboardComponent[] = [];
  const kpis = ['DAU', 'MAU', 'Retention', 'Churn', 'Avg Session', 'Feature Adoption'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`prod_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(makeChartCustom('prod_chart_1', 'multi-line', 'Retention Curve', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
    { id: uid('s_'), dataKey: 'value', name: 'Cohort 1', color: palette[0], type: 'line' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Cohort 2', color: palette[1], type: 'line' },
  ], { xAxisLabel: 'Days', yAxisLabel: 'Retention %', showLegend: true }));

  components.push(makeChartCustom('prod_chart_2', 'funnel-chart', 'Activation Funnel', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
    { id: uid('s_'), dataKey: 'value', name: 'Funnel', color: palette[0], type: 'bar' },
  ], { showLegend: false }));

  components.push(makeChartCustom('prod_chart_3', 'bar-chart', 'Conversions by Feature', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
    { id: uid('s_'), dataKey: 'value', name: 'Conversions', color: palette[1], type: 'bar' },
  ], { xAxisLabel: 'Feature', yAxisLabel: 'Conversions', showLegend: false }));

  components.push(makeChartCustom('prod_chart_4', 'multi-line', 'Cohort Comparison', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
    { id: uid('s_'), dataKey: 'value', name: 'Cohort A', color: palette[0], type: 'line' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Cohort B', color: palette[1], type: 'line' },
  ], { xAxisLabel: 'Week', yAxisLabel: 'Retention', showLegend: true }));

  components.push(makeChartCustom('prod_chart_5', 'scatter-chart', 'Session Length vs Events', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
    { id: uid('s_'), dataKey: 'x', name: 'Session Length', color: palette[2], type: 'scatter' },
  ], { xAxisLabel: 'Session (s)', yAxisLabel: 'Events', showLegend: false }));

  components.push(makeChartCustom('prod_chart_6', 'pie-chart', 'Platform Mix', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
    { id: uid('s_'), dataKey: 'value', name: 'Platform', color: palette[0], type: 'pie' },
  ], { showLegend: true }));

  defaultTemplates.push({ id: 'tpl_product', name: 'Product Analytics Dashboard', description: 'User behavior, cohorts and feature metrics', thumbnail: null, components });
})();

// Customer Success
(() => {
  const palette = ['#0ea5b7', '#059669', '#10b981'];
  const components: DashboardComponent[] = [];
  const kpis = ['NPS', 'CSAT', 'Churn Rate', 'Avg Response', 'SLAs Met', 'Net Retention'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`cs_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(makeChartCustom('cs_chart_1', 'multi-line', 'NPS Trend', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
    { id: uid('s_'), dataKey: 'value', name: 'NPS', color: palette[0], type: 'line' },
  ], { xAxisLabel: 'Month', yAxisLabel: 'NPS', showLegend: false }));

  components.push(makeChartCustom('cs_chart_2', 'combo-chart', 'Tickets vs Resolution Time', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
    { id: uid('s_'), dataKey: 'value', name: 'Tickets', color: palette[0], type: 'bar' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Resolution Time', color: palette[1], type: 'line' },
  ], { xAxisLabel: 'Week', yAxisLabel: 'Count / Hours', showLegend: true }));

  components.push(makeChartCustom('cs_chart_3', 'donut-chart', 'Issue Types', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
    { id: uid('s_'), dataKey: 'value', name: 'Issue', color: palette[0], type: 'donut' },
  ], { showLegend: true }));

  components.push(makeChartCustom('cs_chart_4', 'bar-chart', 'CS by Account', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
    { id: uid('s_'), dataKey: 'value', name: 'CS Score', color: palette[1], type: 'bar' },
  ], { xAxisLabel: 'Account', yAxisLabel: 'Score', showLegend: false }));

  components.push(makeChartCustom('cs_chart_5', 'scatter-chart', 'Response Time vs Satisfaction', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
    { id: uid('s_'), dataKey: 'x', name: 'Response', color: palette[2], type: 'scatter' },
  ], { xAxisLabel: 'Response (hrs)', yAxisLabel: 'Satisfaction', showLegend: false }));

  components.push(makeChartCustom('cs_chart_6', 'gauge', 'Net Retention', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
    { id: uid('s_'), dataKey: 'value', name: 'Net Retention', color: palette[0], type: 'gauge' },
  ], { showLegend: false }));

  defaultTemplates.push({ id: 'tpl_customer_success', name: 'Customer Success Dashboard', description: 'Customer health, support and retention metrics', thumbnail: null, components });
})();

// IT / Infrastructure
(() => {
  const palette = ['#0f172a', '#0284c7', '#334155'];
  const components: DashboardComponent[] = [];
  const kpis = ['Uptime', 'Incidents', 'MTTR', 'CPU Util', 'Memory Util', 'Alerts'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`it_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(makeChartCustom('it_chart_1', 'multi-line', 'Uptime & Latency', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
    { id: uid('s_'), dataKey: 'value', name: 'Uptime', color: palette[0], type: 'line' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Latency', color: palette[1], type: 'line' },
  ], { xAxisLabel: 'Hour', yAxisLabel: 'ms / %', showLegend: true }));

  components.push(makeChartCustom('it_chart_2', 'bar-chart', 'Incidents by Service', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
    { id: uid('s_'), dataKey: 'value', name: 'Incidents', color: palette[0], type: 'bar' },
  ], { xAxisLabel: 'Service', yAxisLabel: 'Count', showLegend: false }));

  components.push(makeChartCustom('it_chart_3', 'scatter-chart', 'CPU vs Latency', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
    { id: uid('s_'), dataKey: 'x', name: 'CPU', color: palette[2], type: 'scatter' },
  ], { xAxisLabel: 'CPU %', yAxisLabel: 'Latency ms', showLegend: false }));

  components.push(makeChartCustom('it_chart_4', 'pie-chart', 'Alert Types', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
    { id: uid('s_'), dataKey: 'value', name: 'Alert', color: palette[0], type: 'pie' },
  ], { showLegend: true }));

  components.push(makeChartCustom('it_chart_5', 'gauge', 'SLA Compliance', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
    { id: uid('s_'), dataKey: 'value', name: 'SLA', color: palette[1], type: 'gauge' },
  ], { showLegend: false }));

  components.push(makeChartCustom('it_chart_6', 'combo-chart', 'Requests vs Errors', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
    { id: uid('s_'), dataKey: 'value', name: 'Requests', color: palette[0], type: 'bar' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Errors', color: palette[1], type: 'line' },
  ], { xAxisLabel: 'Minute', yAxisLabel: 'Count', showLegend: true }));

  defaultTemplates.push({ id: 'tpl_it_infra', name: 'IT & Infrastructure Dashboard', description: 'Operational metrics for infrastructure and services', thumbnail: null, components });
})();

// E-commerce
(() => {
  const palette = ['#db2777', '#f97316', '#14b8a6'];
  const components: DashboardComponent[] = [];
  const kpis = ['GMV', 'Orders', 'AOV', 'Conversion Rate', 'Cart Abandon', 'Repeat Rate'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`ec_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(makeChartCustom('ec_chart_1', 'multi-line', 'Sales Trend', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
    { id: uid('s_'), dataKey: 'value', name: 'Sales', color: palette[0], type: 'line' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Orders', color: palette[1], type: 'line' },
  ], { xAxisLabel: 'Day', yAxisLabel: 'USD / Orders', showLegend: true }));

  components.push(makeChartCustom('ec_chart_2', 'combo-chart', 'Orders & Conversion', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
    { id: uid('s_'), dataKey: 'value', name: 'Orders', color: palette[0], type: 'bar' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Conversion', color: palette[2], type: 'line' },
  ], { xAxisLabel: 'Channel', yAxisLabel: 'Count / %', showLegend: true }));

  components.push(makeChartCustom('ec_chart_3', 'pie-chart', 'Payment Methods', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
    { id: uid('s_'), dataKey: 'value', name: 'Method', color: palette[0], type: 'pie' },
  ], { showLegend: true }));

  components.push(makeChartCustom('ec_chart_4', 'donut-chart', 'Top Categories', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
    { id: uid('s_'), dataKey: 'value', name: 'Category', color: palette[1], type: 'donut' },
  ], { showLegend: true }));

  components.push(makeChartCustom('ec_chart_5', 'scatter-chart', 'AOV vs Conversion', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
    { id: uid('s_'), dataKey: 'x', name: 'AOV', color: palette[0], type: 'scatter' },
  ], { xAxisLabel: 'AOV', yAxisLabel: 'Conversion', showLegend: false }));

  components.push(makeChartCustom('ec_chart_6', 'bar-chart', 'Top Products', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
    { id: uid('s_'), dataKey: 'value', name: 'Sales', color: palette[2], type: 'bar' },
  ], { xAxisLabel: 'Product', yAxisLabel: 'Sales', showLegend: false }));

  defaultTemplates.push({ id: 'tpl_ecommerce', name: 'E-commerce Dashboard', description: 'Sales, conversion and product performance', thumbnail: null, components });
})();

// Education
(() => {
  const palette = ['#0ea5a4', '#06b6d4', '#6366f1'];
  const components: DashboardComponent[] = [];
  const kpis = ['Enrollments', 'Completion Rate', 'Active Students', 'Avg Score', 'Dropout Rate', 'Time Spent'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`edu_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(makeChartCustom('edu_chart_1', 'multi-line', 'Enrollments Trend', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
    { id: uid('s_'), dataKey: 'value', name: 'Enrollments', color: palette[0], type: 'line' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Active', color: palette[1], type: 'line' },
  ], { xAxisLabel: 'Month', yAxisLabel: 'Students', showLegend: true }));

  components.push(makeChartCustom('edu_chart_2', 'bar-chart', 'Completion by Course', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
    { id: uid('s_'), dataKey: 'value', name: 'Completion', color: palette[1], type: 'bar' },
  ], { xAxisLabel: 'Course', yAxisLabel: '%', showLegend: false }));

  components.push(makeChartCustom('edu_chart_3', 'pie-chart', 'Course Mix', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
    { id: uid('s_'), dataKey: 'value', name: 'Course', color: palette[0], type: 'pie' },
  ], { showLegend: true }));

  components.push(makeChartCustom('edu_chart_4', 'donut-chart', 'Grades Distribution', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
    { id: uid('s_'), dataKey: 'value', name: 'Grade', color: palette[2], type: 'donut' },
  ], { showLegend: true }));

  components.push(makeChartCustom('edu_chart_5', 'scatter-chart', 'Study Time vs Score', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
    { id: uid('s_'), dataKey: 'x', name: 'Study Time', color: palette[0], type: 'scatter' },
  ], { xAxisLabel: 'Hours', yAxisLabel: 'Score', showLegend: false }));

  components.push(makeChartCustom('edu_chart_6', 'gauge', 'Completion Rate', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
    { id: uid('s_'), dataKey: 'value', name: 'Completion', color: palette[1], type: 'gauge' },
  ], { showLegend: false }));

  defaultTemplates.push({ id: 'tpl_education', name: 'Education Dashboard', description: 'Student outcomes, engagement and course performance', thumbnail: null, components });
})();

// Healthcare
(() => {
  const palette = ['#065f46', '#10b981', '#f97316'];
  const components: DashboardComponent[] = [];
  const kpis = ['Patients', 'Readmission Rate', 'Avg LOS', 'Bed Occupancy', 'Surgery Count', 'Avg Wait'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`hc_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(makeChartCustom('hc_chart_1', 'multi-line', 'Patient Trend', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
    { id: uid('s_'), dataKey: 'value', name: 'Patients', color: palette[0], type: 'line' },
  ], { xAxisLabel: 'Day', yAxisLabel: 'Count', showLegend: false }));

  components.push(makeChartCustom('hc_chart_2', 'bar-chart', 'Procedures by Type', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
    { id: uid('s_'), dataKey: 'value', name: 'Procedures', color: palette[1], type: 'bar' },
  ], { xAxisLabel: 'Type', yAxisLabel: 'Count', showLegend: false }));

  components.push(makeChartCustom('hc_chart_3', 'pie-chart', 'Diagnosis Mix', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
    { id: uid('s_'), dataKey: 'value', name: 'Diagnosis', color: palette[0], type: 'pie' },
  ], { showLegend: true }));

  components.push(makeChartCustom('hc_chart_4', 'scatter-chart', 'Wait Time vs Satisfaction', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
    { id: uid('s_'), dataKey: 'x', name: 'Wait', color: palette[2], type: 'scatter' },
  ], { xAxisLabel: 'Minutes', yAxisLabel: 'Satisfaction', showLegend: false }));

  components.push(makeChartCustom('hc_chart_5', 'donut-chart', 'Payer Mix', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
    { id: uid('s_'), dataKey: 'value', name: 'Payer', color: palette[1], type: 'donut' },
  ], { showLegend: true }));

  components.push(makeChartCustom('hc_chart_6', 'gauge', 'Bed Occupancy', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
    { id: uid('s_'), dataKey: 'value', name: 'Occupancy', color: palette[0], type: 'gauge' },
  ], { showLegend: false }));

  defaultTemplates.push({ id: 'tpl_healthcare', name: 'Healthcare Dashboard', description: 'Clinical operations and hospital performance', thumbnail: null, components });
})();

// Retail
(() => {
  const palette = ['#b91c1c', '#f59e0b', '#065f46'];
  const components: DashboardComponent[] = [];
  const kpis = ['Sales', 'Transactions', 'Traffic', 'Conversion', 'Avg Basket', 'Returns'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`ret_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(makeChartCustom('ret_chart_1', 'multi-line', 'Sales & Traffic', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
    { id: uid('s_'), dataKey: 'value', name: 'Sales', color: palette[0], type: 'line' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Traffic', color: palette[1], type: 'line' },
  ], { xAxisLabel: 'Week', yAxisLabel: 'Count / USD', showLegend: true }));

  components.push(makeChartCustom('ret_chart_2', 'combo-chart', 'Conversion by Channel', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
    { id: uid('s_'), dataKey: 'value', name: 'Transactions', color: palette[0], type: 'bar' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Conversion', color: palette[2], type: 'line' },
  ], { xAxisLabel: 'Channel', yAxisLabel: 'Count / %', showLegend: true }));

  components.push(makeChartCustom('ret_chart_3', 'bar-chart', 'Store Performance', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
    { id: uid('s_'), dataKey: 'value', name: 'Sales', color: palette[1], type: 'bar' },
  ], { xAxisLabel: 'Store', yAxisLabel: 'Sales', showLegend: false }));

  components.push(makeChartCustom('ret_chart_4', 'pie-chart', 'Category Mix', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
    { id: uid('s_'), dataKey: 'value', name: 'Category', color: palette[0], type: 'pie' },
  ], { showLegend: true }));

  components.push(makeChartCustom('ret_chart_5', 'scatter-chart', 'Traffic vs Conversion', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
    { id: uid('s_'), dataKey: 'x', name: 'Traffic', color: palette[2], type: 'scatter' },
  ], { xAxisLabel: 'Traffic', yAxisLabel: 'Conversion', showLegend: false }));

  components.push(makeChartCustom('ret_chart_6', 'gauge', 'Sales Target', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
    { id: uid('s_'), dataKey: 'value', name: 'Target %', color: palette[0], type: 'gauge' },
  ], { showLegend: false }));

  defaultTemplates.push({ id: 'tpl_retail', name: 'Retail Dashboard', description: 'In-store and online retail performance', thumbnail: null, components });
})();

// Logistics
(() => {
  const palette = ['#0ea5b7', '#0369a1', '#10b981'];
  const components: DashboardComponent[] = [];
  const kpis = ['On-time Delivery', 'Transit Time', 'Shipments', 'Delay Rate', 'Cost/Shipment', 'Capacity Util'];
  for (let k = 0; k < 6; k++) components.push(makeKpi(`log_kpi_${k}`, kpis[k], palette, { x: 20 + k * (COMPACT_KPI_WIDTH + COMPACT_KPI_GAP), y: 20 }));

  components.push(makeChartCustom('log_chart_1', 'multi-line', 'On-time Trend', palette, CHART_LAYOUTS[0], CHART_LAYOUTS[0], [
    { id: uid('s_'), dataKey: 'value', name: 'On-time %', color: palette[0], type: 'line' },
    { id: uid('s_'), dataKey: 'secondary', name: 'Shipments', color: palette[1], type: 'line' },
  ], { xAxisLabel: 'Week', yAxisLabel: 'Percent / Count', showLegend: true }));

  components.push(makeChartCustom('log_chart_2', 'bar-chart', 'Volume by Route', palette, CHART_LAYOUTS[1], CHART_LAYOUTS[1], [
    { id: uid('s_'), dataKey: 'value', name: 'Volume', color: palette[1], type: 'bar' },
  ], { xAxisLabel: 'Route', yAxisLabel: 'Shipments', showLegend: false }));

  components.push(makeChartCustom('log_chart_3', 'pie-chart', 'Carrier Mix', palette, CHART_LAYOUTS[2], CHART_LAYOUTS[2], [
    { id: uid('s_'), dataKey: 'value', name: 'Carrier', color: palette[0], type: 'pie' },
  ], { showLegend: true }));

  components.push(makeChartCustom('log_chart_4', 'scatter-chart', 'Transit Time vs Cost', palette, CHART_LAYOUTS[3], CHART_LAYOUTS[3], [
    { id: uid('s_'), dataKey: 'x', name: 'Transit', color: palette[2], type: 'scatter' },
  ], { xAxisLabel: 'Transit (days)', yAxisLabel: 'Cost', showLegend: false }));

  components.push(makeChartCustom('log_chart_5', 'gauge', 'On-time Delivery', palette, CHART_LAYOUTS[4], CHART_LAYOUTS[4], [
    { id: uid('s_'), dataKey: 'value', name: 'On-time', color: palette[0], type: 'gauge' },
  ], { showLegend: false }));

  components.push(makeChartCustom('log_chart_6', 'bar-chart', 'Cost per Shipment', palette, CHART_LAYOUTS[5], CHART_LAYOUTS[5], [
    { id: uid('s_'), dataKey: 'value', name: 'Cost', color: palette[1], type: 'bar' },
  ], { xAxisLabel: 'Lane', yAxisLabel: 'USD', showLegend: false }));

  defaultTemplates.push({ id: 'tpl_logistics', name: 'Logistics Dashboard', description: 'Shipment performance and cost metrics', thumbnail: null, components });
})();

export default defaultTemplates;
