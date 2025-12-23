// @/types/dashboard.ts

// -----------------------------------------------------------------------------
// 1. Series / Measure Definition
// -----------------------------------------------------------------------------
export type SeriesType = 'bar' | 'line' | 'area';

export interface Series {
  id: string;
  name: string;
  dataKey: string;
  color: string;
  type: SeriesType;
  yAxis: 'primary' | 'secondary';
  suffix: string;
  decimals: number;
  showLabels: boolean;
}

// -----------------------------------------------------------------------------
// 2. Chart-level shared enums
// -----------------------------------------------------------------------------
export type StackingMode = 'none' | 'stacked' | 'percent';
export type Orientation = 'vertical' | 'horizontal';
export type PatternType = 'dots' | 'lines' | 'crosses' | 'none';
export type DataLabelPosition = 'top' | 'center' | 'bottom' | 'inside' | 'outside';
export type AxisType = 'category' | 'number' | 'time';

// -----------------------------------------------------------------------------
// 3. Dashboard Component Definition
// -----------------------------------------------------------------------------
export interface DashboardComponent {
  id: string;
  type:
    // Basic 2D Charts
    | 'bar-chart' | 'column-chart' | 'line-chart' | 'area-chart' | 'pie-chart'
    | 'donut-chart' | 'scatter-chart'
    // Multi-series Combo Charts
    | 'combo-chart' | 'multi-line' | 'multi-bar' | 'multi-area'
    | 'stacked-bar' | 'stacked-area' | 'stacked-column'
    // Advanced Charts
    | 'waterfall' | 'candlestick' | 'bullet' | 'gantt' | 'sankey' | 'treemap'
    // Specialized Charts
    | 'sparkline' | 'box-whisker' | 'marimekko'
    // Existing / Misc
    | 'radar-chart' | 'funnel-chart' | 'heatmap' | 'table' | 'data-table'
    // Widgets & Shapes
    | 'kpi-card' | 'gauge' | 'text' | 'image'
    | 'shape' | 'ellipse' | 'line' | 'circle' | 'rectangle' | 'arrow' | 'triangle';

  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;

  // ---------------------------------------------------------------------------
  // Component Properties
  // ---------------------------------------------------------------------------
  properties: {
    // --- General Styling & Data ---
    title?: string;
    subtitle?: string;
    description?: string;
    data?: any[];
    customData?: any[];
    customDataJson?: string;
    color?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontWeight?: string;
    borderRadius?: number;
    shadow?: boolean;
    opacity?: number;

    // --- Margins ---
    marginTop?: number;
    marginRight?: number;
    marginLeft?: number;
    marginBottom?: number;

    // --- Grid & Axis Styling ---
    showGrid?: boolean;
    gridColor?: string;
    gridOpacity?: number;
    showAxisLines?: boolean;
    showTickLines?: boolean;

    // --- Axis Controls ---
    xAxisLabel?: string;
    yAxisLabel?: string;
    xAxisAngle?: number;
    yAxisAngle?: number;
    xAxisType?: AxisType;
    yAxisType?: 'category' | 'number';
    showXAxis?: boolean;
    showYAxis?: boolean;
    yAxisMin?: 'auto' | number;
    yAxisMax?: 'auto' | number;
    secondaryYAxisMin?: 'auto' | number;
    secondaryYAxisMax?: 'auto' | number;
    axisColor?: string;

    // --- Data Series ---
    series?: Series[];
    stacked?: boolean;

    // --- Series Styling ---
    showDots?: boolean;
    strokeWidth?: number;
    barRadius?: number;

    // --- Pie / Donut ---
    outerRadius?: number;
    innerRadius?: number;
    showLabels?: boolean;
    showLabelLines?: boolean;
    fillColor?: string;
    fillOpacity?: number;

    // --- Title Styling ---
    showTitle?: boolean;
    titleColor?: string;
    titleFontSize?: number;
    valueFontSize?: number;

    // --- Tooltip & Legend ---
    showTooltip?: boolean;
    showLegend?: boolean;
    tooltipFormat?: string;
    tooltipShowMin?: boolean;
    tooltipShowMax?: boolean;
    tooltipShowAverage?: boolean;

    // --- Interactivity & Animation ---
    animationDuration?: number;
    animationEasing?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    enableZoom?: boolean;

    // --- Advanced Visual Effects ---
    gradient?: boolean;
    gradientColors?: string[];
    pattern?: PatternType;
    showDataLabels?: boolean;
    dataLabelPosition?: DataLabelPosition;

    // --- Candlestick / Waterfall / Box-Whisker Keys ---
    openKey?: string;
    closeKey?: string;
    highKey?: string;
    lowKey?: string;
    targetValue?: number;
    ranges?: Array<{ value: number; color: string }>;
    startKey?: string;
    endKey?: string;
    taskKey?: string;
    sizeKey?: string;
    colorKey?: string;
    minKey?: string;
    maxKey?: string;
    medianKey?: string;
    q1Key?: string;
    q3Key?: string;

    // --- Shape-specific ---
    x1?: string; y1?: string; x2?: string; y2?: string;
    radius?: string;
    filled?: boolean;
    size?: number;
    shapeType?: 'rectangle' | 'ellipse' | 'triangle' | 'line' | 'circle' | 'arrow';

    // --- Text / Image / KPI ---
    text?: string;
    url?: string;
    kpiLabel?: string;

    // -------------------------------------------------------------------------
    // 🔹 Bar / Column Deep Customization (new)
    // -------------------------------------------------------------------------
    orientation?: Orientation;            // 'vertical' | 'horizontal'
    stackingMode?: StackingMode;          // 'none' | 'stacked' | 'percent'
    barPadding?: number;                  // fraction (0–1)
    barGap?: number;                      // fraction (0–1)
    showValues?: boolean;                 // show numeric labels
    showValuesInside?: boolean;           // label position variant
    autoColorPalette?: boolean;           // auto-assign palette colors

    [key: string]: any;
  };
}
