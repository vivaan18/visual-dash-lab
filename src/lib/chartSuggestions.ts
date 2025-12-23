/**
 * Chart suggestion engine based on data profiles
 */

import type { DataProfile, ColumnProfile } from './csvParser';
import type { DashboardComponent } from '@/types/dashboard';

export type ColumnRole = 'kpi' | 'dimension' | 'time' | 'filter';

export type Aggregation = 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface ColumnMapping {
  name: string;
  role: ColumnRole | null;
  type: 'numeric' | 'categorical' | 'datetime' | 'text';
  // Optional preferred aggregation when this column is used as a KPI/metric
  aggregation?: Aggregation;
}

export interface ChartSuggestion {
  id: string;
  type: DashboardComponent['type'];
  title: string;
  columns: string[];
  reason: string;
  priority: number;
  mappedColumns?: ColumnMapping[];
  // Confidence score between 0 and 1 (higher = more confident)
  confidence?: number;
  // Small preview dataset derived from the CSV to render a thumbnail
  previewData?: any[];
  // Optional score breakdown to help explain the confidence calculation
  scoreDetails?: {
    priorityScore: number;
    mappingScore: number;
    cardinalityScore: number;
  };
}

/**
 * Generate chart suggestions based on data profile and column mappings
 */
export const generateChartSuggestions = (
  profile: DataProfile,
  data: any[],
  columnMappings?: ColumnMapping[]
): ChartSuggestion[] => {
  const suggestions: ChartSuggestion[] = [];
  const { columns } = profile;

  // If column mappings are provided, use them to create targeted suggestions
  if (columnMappings && columnMappings.some(m => m.role !== null)) {
  const kpis = columnMappings.filter(m => m.role === 'kpi');
  const dimensions = columnMappings.filter(m => m.role === 'dimension');
  const times = columnMappings.filter(m => m.role === 'time');
    
    // KPI + Dimension → Bar/Pie charts
    if (kpis.length > 0 && dimensions.length > 0) {
      // Also recommend KPI cards for each KPI mapping
      kpis.forEach(kpi => {
        // compute aggregated value for KPI preview
        const rawValues = data.map(r => Number(r[kpi.name])).filter(v => !isNaN(v));
        let aggregated = 0;
        const aggregation = kpi.aggregation || 'sum';
        if (rawValues.length === 0) aggregated = 0;
        else if (aggregation === 'sum') aggregated = rawValues.reduce((a, b) => a + b, 0);
        else if (aggregation === 'avg') aggregated = rawValues.reduce((a, b) => a + b, 0) / rawValues.length;
        else if (aggregation === 'min') aggregated = Math.min(...rawValues);
        else if (aggregation === 'max') aggregated = Math.max(...rawValues);
        else if (aggregation === 'count') aggregated = rawValues.length;

        suggestions.push({
          id: `kpi-${kpi.name}`,
          type: 'kpi-card',
          title: `${kpi.name}`,
          columns: [kpi.name],
          reason: `KPI: ${kpi.name} (${aggregation})`,
          priority: 17,
          mappedColumns: [kpi],
          // attach a simple numeric preview
          previewData: [{ name: kpi.name, value: Math.round(aggregated * 100) / 100 }],
        });
      });
      kpis.forEach(kpi => {
        dimensions.forEach(dim => {
          suggestions.push({
            id: `mapped-bar-${dim.name}-${kpi.name}`,
            type: 'bar-chart',
            title: `${kpi.name} by ${dim.name}`,
            columns: [dim.name, kpi.name],
            reason: `Bar chart showing ${kpi.name} (${kpi.aggregation || 'sum'}) across ${dim.name} (Dimension)`,
            priority: 15,
            mappedColumns: [dim, kpi],
          });

          if (dimensions.length === 1 && dimensions[0].type === 'categorical') {
            const catCol = columns.find(c => c.name === dim.name);
            if (catCol && catCol.uniqueCount <= 8) {
              suggestions.push({
                id: `mapped-pie-${dim.name}-${kpi.name}`,
                type: 'pie-chart',
                title: `${kpi.name} Distribution by ${dim.name}`,
                columns: [dim.name, kpi.name],
                reason: `Pie chart showing ${kpi.name} (${kpi.aggregation || 'sum'}) proportions across ${dim.name} (Dimension)`,
                priority: 13,
                mappedColumns: [dim, kpi],
              });
            }
          }
        });
      });
    }

    // KPI + Time → Line/Area charts
    if (kpis.length > 0 && times.length > 0) {
      kpis.forEach(kpi => {
        times.forEach(time => {
          suggestions.push({
            id: `mapped-line-${time.name}-${kpi.name}`,
            type: 'line-chart',
            title: `${kpi.name} Over ${time.name}`,
            columns: [time.name, kpi.name],
            reason: `Line chart tracking ${kpi.name} (${kpi.aggregation || 'sum'}) trends over ${time.name} (Time)`,
            priority: 16,
            mappedColumns: [time, kpi],
          });

          suggestions.push({
            id: `mapped-area-${time.name}-${kpi.name}`,
            type: 'area-chart',
            title: `${kpi.name} Area Over ${time.name}`,
            columns: [time.name, kpi.name],
            reason: `Area chart emphasizing ${kpi.name} (${kpi.aggregation || 'sum'}) accumulation over ${time.name} (Time)`,
            priority: 14,
            mappedColumns: [time, kpi],
          });
        });
      });
    }

    // Multiple KPIs → Comparison charts
    if (kpis.length >= 2) {
      const kpi1 = kpis[0];
      const kpi2 = kpis[1];
      suggestions.push({
        id: `mapped-scatter-${kpi1.name}-${kpi2.name}`,
        type: 'scatter-chart',
        title: `${kpi2.name} vs ${kpi1.name}`,
        columns: [kpi1.name, kpi2.name],
        reason: `Scatter plot revealing correlation between ${kpi1.name} (${kpi1.aggregation || 'sum'}) and ${kpi2.name} (${kpi2.aggregation || 'sum'}) (KPIs)`,
        priority: 12,
        mappedColumns: [kpi1, kpi2],
      });
    }
  }

  const numericCols = columns.filter(c => c.type === 'numeric');
  const categoricalCols = columns.filter(c => c.type === 'categorical');
  const datetimeCols = columns.filter(c => c.type === 'datetime');

  // Numeric + Categorical → Bar/Column/Pie charts
  if (numericCols.length >= 1 && categoricalCols.length >= 1) {
    const numCol = numericCols[0];
    const catCol = categoricalCols[0];

    suggestions.push({
      id: `bar-${catCol.name}-${numCol.name}`,
      type: 'bar-chart',
      title: `${numCol.name} by ${catCol.name}`,
      columns: [catCol.name, numCol.name],
      reason: `Bar chart shows ${numCol.name} (sum) distribution across ${catCol.name} categories`,
      priority: 10,
    });

    if (catCol.uniqueCount <= 8) {
      suggestions.push({
        id: `pie-${catCol.name}-${numCol.name}`,
        type: 'pie-chart',
        title: `${numCol.name} Distribution`,
        columns: [catCol.name, numCol.name],
        reason: `Pie chart visualizes ${numCol.name} (sum) proportions by ${catCol.name}`,
        priority: 8,
      });
    }
  }

  // Numeric + DateTime → Line/Area charts
  if (numericCols.length >= 1 && datetimeCols.length >= 1) {
    const numCol = numericCols[0];
    const dateCol = datetimeCols[0];

    suggestions.push({
      id: `line-${dateCol.name}-${numCol.name}`,
      type: 'line-chart',
      title: `${numCol.name} Trend Over Time`,
      columns: [dateCol.name, numCol.name],
      reason: `Line chart shows ${numCol.name} (sum) trends over ${dateCol.name}`,
      priority: 12,
    });

    suggestions.push({
      id: `area-${dateCol.name}-${numCol.name}`,
      type: 'area-chart',
      title: `${numCol.name} Area Over Time`,
      columns: [dateCol.name, numCol.name],
      reason: `Area chart emphasizes cumulative ${numCol.name} (sum) over ${dateCol.name}`,
      priority: 9,
    });
  }

  // Numeric vs Numeric → Scatter plot
  if (numericCols.length >= 2) {
    const xCol = numericCols[0];
    const yCol = numericCols[1];

    suggestions.push({
      id: `scatter-${xCol.name}-${yCol.name}`,
      type: 'scatter-chart',
      title: `${yCol.name} vs ${xCol.name}`,
      columns: [xCol.name, yCol.name],
      reason: `Scatter plot reveals correlation between ${xCol.name} and ${yCol.name}`,
      priority: 7,
    });
  }

  // Single Categorical → Count plot
  if (categoricalCols.length >= 1 && categoricalCols[0].uniqueCount <= 15) {
    const catCol = categoricalCols[0];

    suggestions.push({
      id: `count-${catCol.name}`,
      type: 'bar-chart',
      title: `${catCol.name} Distribution`,
      columns: [catCol.name],
      reason: `Bar chart shows frequency distribution of ${catCol.name}`,
      priority: 6,
    });
  }

  // Single Numeric → Histogram
  if (numericCols.length >= 1) {
    const numCol = numericCols[0];

    suggestions.push({
      id: `histogram-${numCol.name}`,
      type: 'bar-chart',
      title: `${numCol.name} Distribution`,
      columns: [numCol.name],
      reason: `Histogram shows the distribution and frequency of ${numCol.name} values`,
      priority: 5,
    });
  }

  // Multi-category comparison
  if (numericCols.length >= 2 && categoricalCols.length >= 1) {
    suggestions.push({
      id: `multi-bar-${categoricalCols[0].name}`,
      type: 'bar-chart',
      title: `Multi-Metric Comparison`,
      columns: [categoricalCols[0].name, ...numericCols.slice(0, 3).map(c => c.name)],
      reason: `Compare multiple metrics across ${categoricalCols[0].name} categories`,
      priority: 8,
    });
  }

  // Sort by priority
  suggestions.sort((a, b) => b.priority - a.priority);

  const maxPriority = Math.max(...suggestions.map(s => s.priority), 1);

  // Compute richer confidence and prepare a small preview dataset for each suggestion
  return suggestions.map(s => {
    const priorityScore = s.priority / maxPriority; // 0..1
    const mappingScore = s.mappedColumns && s.mappedColumns.length > 0 ? 1 : 0; // 1 if user mapped relevant columns

    // Cardinality: prefer categorical columns with small unique counts
    let cardinalityScore = 0.5;
    const categoricalCol = profile.columns.find(c => s.columns.includes(c.name) && c.type === 'categorical');
    if (categoricalCol) {
      if (categoricalCol.uniqueCount <= 8) cardinalityScore = 1;
      else if (categoricalCol.uniqueCount <= 20) cardinalityScore = 0.75;
      else cardinalityScore = 0.4;
    } else {
      // fallback: use rowCount to give small boost for larger datasets
      cardinalityScore = Math.min(1, profile.rowCount / 1000);
    }

    // Weighted blend (tunable): priority 50%, mapping 30%, cardinality 20%
    const rawConfidence = priorityScore * 0.5 + mappingScore * 0.3 + cardinalityScore * 0.2;
    const confidence = Math.round(rawConfidence * 100) / 100;

    // Generate a lightweight preview dataset (bounded).
    // If previewData already provided (e.g. KPI cards), use it; otherwise derive from data.
    let preview = [] as any[];
    try {
      if (s.previewData && Array.isArray(s.previewData) && s.previewData.length > 0) {
        preview = s.previewData.slice(0, 20);
      } else {
        preview = convertDataForChart(data.slice(0, 500), s as ChartSuggestion).slice(0, 20);
      }
    } catch (err) {
      preview = [];
    }

    return {
      ...s,
      confidence,
      previewData: preview,
      scoreDetails: {
        priorityScore: Math.round(priorityScore * 100) / 100,
        mappingScore: Math.round(mappingScore * 100) / 100,
        cardinalityScore: Math.round(cardinalityScore * 100) / 100,
      },
    } as ChartSuggestion;
  });
};

/**
 * Convert CSV data to chart format based on suggestion
 */
export const convertDataForChart = (
  data: any[],
  suggestion: ChartSuggestion
): any[] => {
  const { columns } = suggestion;

  if (columns.length === 1) {
    // Single column - count occurrences
    const counts: { [key: string]: number } = {};
    data.forEach(row => {
      const value = row[columns[0]];
      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }

  if (columns.length === 2) {
    // Two columns - aggregate according to mapped aggregation (if any)
    const groupedData: { [key: string]: number[] } = {};

    data.forEach(row => {
      const key = row[columns[0]];
      const raw = row[columns[1]];
      const value = Number(raw);

      if (!isNaN(value)) {
        if (!groupedData[key]) groupedData[key] = [];
        groupedData[key].push(value);
      }
    });

    // Determine aggregation preference from mappedColumns if provided
    let aggregation: Aggregation = 'avg';
    if (suggestion.mappedColumns) {
      const metricMap = suggestion.mappedColumns.find(m => m.name === columns[1]);
      if (metricMap && metricMap.aggregation) aggregation = metricMap.aggregation;
    }

    return Object.entries(groupedData).map(([name, values]) => {
      let aggregated = 0;
      switch (aggregation) {
        case 'sum':
          aggregated = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggregated = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'min':
          aggregated = Math.min(...values);
          break;
        case 'max':
          aggregated = Math.max(...values);
          break;
        case 'count':
          aggregated = values.length;
          break;
        default:
          aggregated = values.reduce((a, b) => a + b, 0) / values.length;
      }

      return {
        name,
        value: aggregated,
      };
    });
  }

  // Multi-column
  return data.slice(0, 20).map(row => {
    const result: any = { name: row[columns[0]] };
    columns.slice(1).forEach(col => {
      result[col] = Number(row[col]) || 0;
    });
    return result;
  });
};
