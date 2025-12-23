// // src/components/dashboard-builder/ChartRenderer.tsx
// import React from "react";
// import type { DashboardComponent, Series } from "@/types/dashboard";
// import {
//   Bar,
//   Line,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   ComposedChart,
//   PieChart,
//   Pie,
//   FunnelChart,
//   Funnel,
//   LabelList,
//   RadarChart,
//   Radar,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   Cell,
//   ScatterChart,
//   Scatter,
// } from "recharts";
// import {
//   generateSampleDataForChartType,
//   getDefaultSeriesForChart,
// } from "@/lib/chartDefaults";
// import { ChartNoAxesColumnDecreasingIcon, SignalZero } from "lucide-react";

// // ----------------------------- Utilities ------------------------------------
// const sanitizeText = (t: string) =>
//   t?.replace(/</g, "&lt;").replace(/>/g, "&gt;") || "";

// const formatValue = (v: number, suffix = "", decimals = 0): string =>
//   typeof v === "number"
//     ? (decimals ? v.toFixed(decimals) : v.toLocaleString()) + suffix
//     : String(v);

// const DEFAULT_PALETTE = [
//   "#3b82f6",
//   "#10b981",
//   "#f97316",
//   "#ef4444",
//   "#8b5cf6",
//   "#06b6d4",
//   "#f59e0b",
//   "#84cc16",
// ];

// // Return numeric keys present in the first N rows (most likely candidate keys)
// function findNumericKeys(data: any[], sampleRows = 6): string[] {
//   if (!Array.isArray(data) || data.length === 0) return [];
//   const rows = data.slice(0, sampleRows);
//   const keyScores: Record<string, number> = {};
//   rows.forEach((r) => {
//     Object.keys(r || {}).forEach((k) => {
//       const v = r[k];
//       if (typeof v === "number") keyScores[k] = (keyScores[k] || 0) + 1;
//     });
//   });
//   return Object.keys(keyScores).sort((a, b) => keyScores[b] - keyScores[a]);
// }

// // If series.dataKey not present in data, attempt to remap to a sensible key
// function resolveSeriesDataKeys(series: Series[], data: any[]) {
//   const numericKeys = findNumericKeys(data);
//   // Common defaults we expect in your project
//   const commonPreferred = ["value", "Value1", "Value2", "series1", "series2", "y"];

//   return series.map((s) => {
//     // if key exists in sample row, keep it
//     if (data.length && s.dataKey && data[0] && s.dataKey in data[0]) {
//       return s;
//     }

//     // Try: explicit common preferred keys that also exist in data
//     for (const pref of commonPreferred) {
//       if (data.length && pref in data[0]) {
//         console.warn(
//           `[ChartRenderer] remapping series '${s.id}' dataKey '${s.dataKey}' -> '${pref}' (found in data)`
//         );
//         return { ...s, dataKey: pref };
//       }
//     }

//     // Next: use top numeric key detected
//     if (numericKeys.length > 0) {
//       console.warn(
//         `[ChartRenderer] remapping series '${s.id}' dataKey '${s.dataKey}' -> '${numericKeys[0]}' (best numeric key)`
//       );
//       return { ...s, dataKey: numericKeys[0] };
//     }

//     // Last fallback -> keep existing key (may render nothing)
//     return s;
//   });
// }

// // Special handling for scatter: ensure data has x and y; map numeric keys if necessary
// function ensureScatterData(data: any[]) {
//   if (!data || data.length === 0) return data;
//   const first = data[0];
//   if ("x" in first && "y" in first) return data;

//   // find two best numeric keys
//   const numericKeys = findNumericKeys(data);
//   if (numericKeys.length >= 2) {
//     return data.map((r) => ({
//       x: r[numericKeys[0]],
//       y: r[numericKeys[1]],
//       ...r,
//     }));
//   }

//   // if only one numeric key, use it as y and index as x
//   if (numericKeys.length === 1) {
//     return data.map((r, idx) => ({
//       x: idx,
//       y: r[numericKeys[0]],
//       ...r,
//     }));
//   }

//   // fallback: return unchanged
//   return data;
// }

// // ----------------------------- Tooltip --------------------------------------
// const CustomTooltip = ({ active, payload, label, series, isDarkMode }: any) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div
//       className={`p-2 border rounded text-xs ${
//         isDarkMode
//           ? "bg-gray-800 text-white border-gray-700"
//           : "bg-white text-gray-900 border-gray-200"
//       }`}
//     >
//       {label !== undefined && <p className="font-bold mb-1">Category: {sanitizeText(String(label))}</p>}
//       {payload.map((entry: any, i: number) => {
//         const s = series.find((x: any) => x.dataKey === entry.dataKey);
//         return (
//           <p key={i} style={{ color: entry.color }}>
//             {s?.name || entry.name}:{" "}
//             <span className="font-semibold">
//               {formatValue(entry.value, s?.suffix, s?.decimals)}
//             </span>
//           </p>
//         );
//       })}
//     </div>
//   );
// };

// // ----------------------------- Main Component -------------------------------
// const ChartRenderer: React.FC<{
//   component: DashboardComponent;
//   isDarkMode: boolean;
//   isDragging: boolean;
// }> = ({ component, isDarkMode, isDragging }) => {
//   const props = component.properties || {};

//   // Use customData if provided else fallback generated data
//   let data =
//     Array.isArray(props.customData) && props.customData.length
//       ? props.customData
//       : generateSampleDataForChartType(component.type);

//   // For scatter charts, normalize x/y
//   if (component.type === "scatter-chart") {
//     data = ensureScatterData(data);
//   }

//   // Get a safe series array
//   let series: Series[] =
//     props.series && Array.isArray(props.series) && props.series.length
//       ? props.series
//       : getDefaultSeriesForChart(component.type);

//   // Attempt to remap/resolve series dataKeys if they don't exist in data objects
//   series = resolveSeriesDataKeys(series, data);

//   // Drag placeholder
//   if (isDragging) {
//     return (
//       <div className="h-full w-full flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 border-2 border-dashed border-slate-400 dark:border-slate-600">
//         <p className="font-semibold text-slate-600 dark:text-slate-300">
//           Moving {props.title || component.type}...
//         </p>
//       </div>
//     );
//   }

//   // Visual properties
//   const primaryColor = props.color || DEFAULT_PALETTE[0];
//   const backgroundColor = props.backgroundColor || "#ffffff";
//   const borderRadius = props.borderRadius ?? props.borderRadius === 0 ? props.borderRadius : 8;
//   const boxShadow = props.shadow ? "0 2px 8px rgba(0,0,0,0.12)" : "none";

//   const axisColor = isDarkMode ? "#e5e7eb" : "#6b7280";
//   const axisTickStyle = { fontSize: 12, fill: axisColor };

//   const orientation = props.orientation || "vertical";
//   const layout = orientation === "horizontal" ? "vertical" : "horizontal"; // recharts 'layout' mapping
//   const stackingMode = props.stackingMode || "none";
//   const stackId =
//     stackingMode !== "none" && stackingMode !== undefined ? "stack" : undefined;
//   const stackOffset = stackingMode === "percent" ? "expand" : undefined;

//   const labelPosition: "top" | "bottom" | "inside" | "outside" =
//     props.showValuesInside ? "inside" : "top";

//   const barGap = typeof props.barGap === "number" ? `${props.barGap * 100}%` : "10%";
//   const barCategoryGap = typeof props.barPadding === "number" ? `${props.barPadding * 100}%` : "20%";

//   // Shared controls (grid/legend/tooltip)
//   const renderCommonControls = (extra?: React.ReactNode) => (
//     <>
//       {props.showGrid !== false && <CartesianGrid strokeDasharray="3 3" stroke={axisColor} opacity={0.2} />}
//       {props.showTooltip !== false && <Tooltip content={<CustomTooltip series={series} isDarkMode={isDarkMode} />} />}
//       {props.showLegend !== false && <Legend wrapperStyle={{ fontSize: 12 }} />}
//       {extra}
//     </>
//   );

//   // Build chart content
//   let content: React.ReactNode = null;

//   // Cartesian charts (bar/column/line/area/multi/combo)
//   if (
//     [
//       "bar-chart",
//       "column-chart",
//       "line-chart",
//       "area-chart",
//       "multi-bar",
//       "multi-line",
//       "multi-area",
//       "combo-chart",
//       "stacked-bar",
//       "stacked-area",
//       "stacked-column",
//     ].includes(component.type)
//   ) {
//     content = (
//       <ResponsiveContainer width="100%" height="100%">
//         <ComposedChart
//           data={data}
//           layout={layout as any}
//           margin={{
//             top: props.marginTop ?? 20,
//             right: props.marginRight ?? 30,
//             left: props.marginLeft ?? 20,
//             bottom: props.marginBottom ?? 20,
//           }}
//           barGap={barGap}
//           barCategoryGap={barCategoryGap}
//           stackOffset={stackOffset}
//         >
//           {renderCommonControls()}

//           {props.showXAxis !== false && (
//             <XAxis
//               type={layout === "horizontal" ? "category" : "number"}
//               dataKey={layout === "horizontal" ? "name" : undefined}
//               tick={axisTickStyle}
//               axisLine={{ stroke: axisColor }}
//               tickLine={props.showTickLines !== false}
//               label={
//                 props.xAxisLabel ? { value: props.xAxisLabel, position: "bottom", fill: axisColor } : undefined
//               }
//             />
//           )}

//           {props.showYAxis !== false && (
//             <YAxis
//               type={layout === "horizontal" ? "number" : "category"}
//               dataKey={layout === "horizontal" ? undefined : "name"}
//               tick={axisTickStyle}
//               axisLine={{ stroke: axisColor }}
//               tickLine={props.showTickLines !== false}
//               domain={["auto", "auto"]}
//               label={
//                 props.yAxisLabel ? { value: props.yAxisLabel, angle: -90, position: "left", fill: axisColor } : undefined
//               }
//             />
//           )}

//           {series.map((s, i) => {
//             const color = s.color || primaryColor || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length];
//             const shared = {
//               key: s.id,
//               dataKey: s.dataKey,
//               name: s.name,
//               fill: color,
//               stroke: color,
//               stackId,
//             };
//             const fmt = (v: any) => formatValue(v, s.suffix || "", s.decimals || 0);

//             // Determine effective series type: if chart type forces it, override for clarity
//             let seriesType = s.type;
//             if (!component.type.includes("combo")) {
//               if (component.type.includes("line")) seriesType = "line";
//               else if (component.type.includes("area")) seriesType = "area";
//               else seriesType = "bar";
//             }

//             if (seriesType === "bar") {
//               return (
//                 <Bar {...shared} radius={props.barRadius ?? 0}>
//                   {(s.showLabels || props.showValues) && <LabelList position={labelPosition} formatter={fmt} />}
//                 </Bar>
//               );
//             }
//             if (seriesType === "line") {
//               return (
//                 <Line {...shared} strokeWidth={props.strokeWidth ?? 2} dot={props.showDots !== false} activeDot={{ r: 4 }}>
//                   {(s.showLabels || props.showValues) && <LabelList position={labelPosition} formatter={fmt} />}
//                 </Line>
//               );
//             }
//             if (seriesType === "area") {
//               return (
//                 <Area {...shared} type="monotone" fillOpacity={props.fillOpacity ?? 0.3}>
//                   {(s.showLabels || props.showValues) && <LabelList position={labelPosition} formatter={fmt} />}
//                 </Area>
//               );
//             }
//             return null;
//           })}
//         </ComposedChart>
//       </ResponsiveContainer>
//     );
//   }

//   // Pie / Donut
//   if (["pie-chart", "donut-chart"].includes(component.type)) {
//     const pieData = Array.isArray(data) && data.length ? data : generateSampleDataForChartType("pie-chart");
//     const innerRadius = component.type === "donut-chart" ? props.innerRadius ?? 40 : 0;
//     const outerRadius = props.outerRadius ?? 80;
//     content = (
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           {props.showLegend !== false && <Legend />}
//           <Pie
//             data={pieData}
//             dataKey={"value"}
//             nameKey={"name"}
//             cx="50%"
//             cy="50%"
//             innerRadius={innerRadius}
//             outerRadius={outerRadius}
//             label={props.showDataLabels || props.showValues}
//             isAnimationActive={props.animationDuration !== 0}
//           >
//             {pieData.map((entry: any, idx: number) => (
//               <Cell key={idx} fill={entry.fill || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length]} />
//             ))}
//           </Pie>
//           {props.showTooltip !== false && <Tooltip />}
//         </PieChart>
//       </ResponsiveContainer>
//     );
//   }

//   // Funnel
//   if (component.type === "funnel-chart") {
//     const funnelData = Array.isArray(data) && data.length ? data : generateSampleDataForChartType("funnel-chart");
//     content = (
//       <ResponsiveContainer width="100%" height="100%">
//         <FunnelChart>
//           <Tooltip />
//           <Funnel dataKey="value" data={funnelData} isAnimationActive>
//             <LabelList dataKey="name" position="left" fill="#000" />
//             {funnelData.map((entry: any, idx: number) => (
//               <Cell key={idx} fill={entry.fill || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length]} />
//             ))}
//           </Funnel>
//         </FunnelChart>
//       </ResponsiveContainer>
//     );
//   }

//   // Radar
//   if (component.type === "radar-chart") {
//     const radarData = Array.isArray(data) && data.length ? data : generateSampleDataForChartType("radar-chart");
//     content = (
//       <ResponsiveContainer width="100%" height="100%">
//         <RadarChart data={radarData}>
//           <PolarGrid />
//           <PolarAngleAxis dataKey="name" />
//           <PolarRadiusAxis />
//           {props.showLegend !== false && <Legend />}
//           {props.showTooltip !== false && <Tooltip />}
//           <Radar name="Value" dataKey="value" stroke={primaryColor} fill={primaryColor} fillOpacity={0.6} />
//         </RadarChart>
//       </ResponsiveContainer>
//     );
//   }

//   // Scatter
//   if (component.type === "scatter-chart") {
//     // ensureScatterData ran earlier
//     const scatterSeries = series[0];
//     const dataKeyX = scatterSeries?.dataKey === "x" || scatterSeries?.dataKey === "y" ? scatterSeries.dataKey : "x";
//     const dataKeyY = scatterSeries?.dataKey === "y" ? scatterSeries.dataKey : "y";
//     content = (
//       <ResponsiveContainer width="100%" height="100%">
//         <ScatterChart>
//           {props.showGrid !== false && <CartesianGrid strokeDasharray="3 3" stroke={axisColor} opacity={0.2} />}
//           <XAxis type="number" dataKey="x" name="X" tick={axisTickStyle} axisLine={{ stroke: axisColor }} />
//           <YAxis type="number" dataKey="y" name="Y" tick={axisTickStyle} axisLine={{ stroke: axisColor }} />
//           {props.showTooltip !== false && <Tooltip content={<CustomTooltip series={series} isDarkMode={isDarkMode} />} />}
//           {props.showLegend !== false && <Legend />}
//           <Scatter data={data} fill={primaryColor} />
//         </ScatterChart>
//       </ResponsiveContainer>
//     );
//   }

//   // Gauge (simple)
//   if (component.type === "gauge") {
//     const value = data?.[0]?.value ?? props.targetValue ?? 70;
//     content = (
//       <div className="flex items-center justify-center h-full">
//         <div className="relative w-36 h-36">
//           <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
//             <path stroke={isDarkMode ? "#222" : "#e6e6e6"} strokeWidth="3" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
//             <path stroke={primaryColor} strokeWidth="3" fill="transparent" strokeDasharray={`${value},100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
//           </svg>
//           <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">{value}%</div>
//         </div>
//       </div>
//     );
//   }

//   // Fallback (unsupported)
//   if (!content) {
//     content = (
//       <div className="h-full flex items-center justify-center text-gray-500">
//         <div className="text-center">
//           <div className="text-4xl mb-2">🤔</div>
//           <p>Unsupported Chart Type: {String(component.type)}</p>
//         </div>
//       </div>
//     );
//   }

//   // Final wrapper with background, border radius, and shadow
//   return (
//     <div
//       className="h-full w-full overflow-hidden"
//       style={{
//         background: backgroundColor,
//         borderRadius: borderRadius,
//         boxShadow: boxShadow,
//       }}
//     >
//       {props.title && props.showTitle !== false && (
//         <div style={{ paddingTop: 8, paddingBottom: 4 }}>
//           <h3
//             className="text-center font-semibold"
//             style={{ color: props.titleColor || primaryColor, fontSize: props.titleFontSize || 18, margin: 0 }}
//           >
//             {sanitizeText(props.title)}
//           </h3>
//         </div>
//       )}

//       <div style={{ height: props.title ? "calc(100% - 48px)" : "100%", padding: 8 }}>
//         {content}
//       </div>
//     </div>
//   );
// };

// export default ChartRenderer;


import React from "react";
import type { DashboardComponent, Series } from "@/types/dashboard";
import {
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  LabelList,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
} from "recharts";
import { generateSampleDataForChartType } from "@/lib/chartPreviewData";

// -----------------------------------------------------------------------------
// Defaults
// -----------------------------------------------------------------------------
const DEFAULT_PALETTE = [
  "#3b82f6",
  "#10b981",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#84cc16",
];

const sanitizeText = (t: string) =>
  t?.replace(/</g, "&lt;").replace(/>/g, "&gt;") || "";

const formatValue = (v: number, suffix = "", decimals = 0): string =>
  typeof v === "number"
    ? (decimals ? v.toFixed(decimals) : v.toLocaleString()) + suffix
    : String(v);

// Return numeric keys present in the first N rows (most likely candidate keys)
function findNumericKeys(data: any[], sampleRows = 8): string[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  const rows = data.slice(0, sampleRows);
  const keyScores: Record<string, number> = {};
  rows.forEach((r) => {
    if (!r) return;
    Object.keys(r).forEach((k) => {
      const v = r[k];
      if (typeof v === "number" || (!isNaN(Number(v)) && v !== "")) keyScores[k] = (keyScores[k] || 0) + 1;
    });
  });
  return Object.keys(keyScores).sort((a, b) => keyScores[b] - keyScores[a]);
}

// -----------------------------------------------------------------------------
// Tooltip
// -----------------------------------------------------------------------------
const CustomTooltip = ({ active, payload, label, series, isDarkMode }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`p-2 border rounded text-xs ${
        isDarkMode
          ? "bg-gray-800 text-white border-gray-700"
          : "bg-white text-gray-900 border-gray-200"
      }`}
    >
      {label && (
        <p className="font-bold mb-1">Category: {sanitizeText(label)}</p>
      )}
      {payload.map((entry: any, i: number) => {
        const s = series.find((x: any) => x.dataKey === entry.dataKey);
        return (
          <p key={i} style={{ color: entry.color }}>
            {s?.name || entry.name}:{" "}
            <span className="font-semibold">
              {formatValue(entry.value, s?.suffix, s?.decimals)}
            </span>
          </p>
        );
      })}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------
const ChartRenderer: React.FC<{
  component: DashboardComponent;
  isDarkMode: boolean;
  isDragging: boolean;
}> = ({ component, isDarkMode, isDragging }) => {
  const props = component.properties || {};

  // --- Data ---
  // Prefer explicit `properties.data` on the component, then `customData`, then generated sample data
  const rawData =
    Array.isArray(props.data) && props.data.length
      ? props.data
      : Array.isArray(props.customData) && props.customData.length
      ? props.customData
      : generateSampleDataForChartType(component.type);

  // Sanitize data to avoid runtime crashes when consumers pass strings/undefined
  const data: any[] = Array.isArray(rawData)
    ? rawData.map((r: any, idx: number) => {
        const row = r || {};
        const safe: any = { ...row };
        // coerce numeric fields if present (or fallback to sensible defaults)
        if (safe.x !== undefined) safe.x = Number(safe.x);
        if (safe.y !== undefined) safe.y = Number(safe.y);
        if (safe.value !== undefined) safe.value = Number(safe.value);
        // if scatter and no explicit x/y, try to derive from numeric keys
        if (component.type === "scatter-chart") {
          if (safe.x === undefined && safe.y === undefined) {
            // try common numeric keys
            const numKeys = Object.keys(safe).filter(k => typeof safe[k] === 'number' || !isNaN(Number(safe[k])));
            if (numKeys.length >= 2) {
              safe.x = Number(safe[numKeys[0]]);
              safe.y = Number(safe[numKeys[1]]);
            } else if (numKeys.length === 1) {
              safe.x = idx;
              safe.y = Number(safe[numKeys[0]]);
            } else {
              // fallback to zeros
              safe.x = Number(safe.x) || 0;
              safe.y = Number(safe.y) || 0;
            }
          } else {
            // ensure numeric
            safe.x = Number(safe.x) || 0;
            safe.y = Number(safe.y) || 0;
          }
        }
        return safe;
      })
    : [];

  // --- Series ---
  let series: Series[] = [];

  if (props.series && props.series.length) {
    series = props.series;
  } else {
    // If no explicit series defined, attempt to create sensible defaults from data
    const numericKeys = findNumericKeys(data);
    const isMultiLike = [
      "multi-bar",
      "multi-line",
      "multi-area",
      "combo-chart",
      "stacked-bar",
      "stacked-area",
      "stacked-column",
    ].includes(component.type);

    if (isMultiLike && numericKeys.length > 0) {
      // choose default series type depending on chart kind
      const defaultType: Series["type"] = component.type.includes("line")
        ? "line"
        : component.type.includes("area")
        ? "area"
        : "bar";

      series = numericKeys.map((k, i) => ({
        id: `s${i + 1}`,
        name: `Series ${i + 1}`,
        dataKey: k,
        color: DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
        type: defaultType,
        yAxis: "primary",
        suffix: "",
        decimals: 0,
        showLabels: true,
      }));
    } else {
      // fallback to single series reading `value`
      series = [
        {
          id: "s1",
          name: "Value",
          dataKey: "value",
          color: props.color || DEFAULT_PALETTE[0],
          type: component.type.includes("line") ? "line" : component.type.includes("area") ? "area" : "bar",
          yAxis: "primary",
          suffix: "",
          decimals: 0,
          showLabels: true,
        },
      ];
    }
  }

  // --- Early Exit for Dragging ---
  if (isDragging)
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-100/50 dark:bg-slate-800/50 border-2 border-dashed border-slate-400 dark:border-slate-600">
        <p className="font-semibold text-slate-600 dark:text-slate-300">
          Moving {props.title || component.type}...
        </p>
      </div>
    );

  // ---------------------------------------------------------------------------
  // Core Properties
  // ---------------------------------------------------------------------------
  const orientation = props.orientation || "vertical"; // user-facing
  const layout = orientation === "horizontal" ? "vertical" : "horizontal"; // Recharts internal
  // Default stacking for stacked-* chart types when property not explicitly set
  const stackingMode = (typeof props.stackingMode === 'string')
    ? props.stackingMode
    : component.type.startsWith('stacked')
    ? 'stacked'
    : 'none';
  const stackId =
    stackingMode !== "none" && stackingMode !== undefined ? "stack" : undefined;
  const stackOffset = stackingMode === "percent" ? "expand" : undefined;

  const primaryColor = props.color || DEFAULT_PALETTE[0];
  const bgColor = props.backgroundColor || "#ffffff";
  const borderRadius = props.borderRadius || 8;
  const shadow = props.shadow
    ? "shadow-md shadow-slate-300/60 dark:shadow-slate-700/40"
    : "";

  // --- Axis & Value styling ---
  const axisColor = props.axisColor || (isDarkMode ? "#e5e7eb" : "#6b7280");
  const axisFontSize = props.axisFontSize || 12;
  const valueColor = props.valueColor || axisColor;
  const valueFontSize = props.valueFontSize || 12;

  const axisTickStyle = { fontSize: axisFontSize, fill: axisColor };
  // Allow rotating/slanting X axis labels via properties:
  // - props.xAxisAngle: numeric angle in degrees (positive rotates up, negative down)
  // - props.slantXAxisLabels: shorthand to set a -45deg angle
  const xAxisAngle =
    typeof props.xAxisAngle === "number"
      ? props.xAxisAngle
      : props.slantXAxisLabels
      ? -45
      : 0;
  const xAxisTextAnchor = xAxisAngle ? (xAxisAngle < 0 ? "end" : "start") : undefined;
  const labelPosition: "top" | "bottom" | "inside" | "outside" =
    props.showValuesInside ? "inside" : "top";

  const barGap = props.barGap ? `${props.barGap * 100}%` : "10%";
  const barCategoryGap = props.barPadding
    ? `${props.barPadding * 100}%`
    : "20%";

  // ---------------------------------------------------------------------------
  // Chart Container Styling
  // ---------------------------------------------------------------------------
  const containerStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    borderRadius: borderRadius,
    boxShadow: shadow ? "0 2px 6px rgba(0,0,0,0.1)" : undefined,
    transition: "all 0.2s ease-in-out",
  };

  // Allow user to override the container inner padding (default 8px)
  const containerPadding = typeof props.containerPadding === 'number' ? props.containerPadding : 8;

  // For Cartesian charts we want smaller defaults for bar/column charts only.
  // Other cartesian charts keep the older, more generous margins to avoid
  // clipping axis labels / legends by default.
  const cartesianMargin = ["bar-chart", "column-chart"].includes(component.type)
    ? {
        top: props.marginTop ?? 2,
        right: props.marginRight ?? 2,
        left: props.marginLeft ?? 2,
        bottom: props.marginBottom ?? 6,
      }
    : {
        top: props.marginTop ?? 20,
        right: props.marginRight ?? 30,
        left: props.marginLeft ?? 20,
        bottom: props.marginBottom ?? 20,
      };

  // ---------------------------------------------------------------------------
  // Chart Rendering
  // ---------------------------------------------------------------------------
  return (
    <div className="h-full w-full" style={containerStyle}>
      {/* Title */}
      {props.title && props.showTitle !== false && (
        <h3
          className="text-center pt-2 font-semibold"
          style={{
            color: props.titleColor || primaryColor,
            fontSize: props.titleFontSize || 18,
          }}
        >
          {sanitizeText(props.title)}
        </h3>
      )}

      {/* Chart Area */}
      <div
        style={{ height: props.title ? "calc(100% - 40px)" : "100%", padding: containerPadding }}
      >
        {/* Choose renderer based on component.type */}
        {[
          "bar-chart",
          "column-chart",
          "line-chart",
          "area-chart",
          "multi-bar",
          "multi-line",
          "multi-area",
          "combo-chart",
          "stacked-bar",
          "stacked-area",
          "stacked-column",
        ].includes(component.type) ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              layout={layout as any}
              margin={cartesianMargin}
              barGap={barGap}
              barCategoryGap={barCategoryGap}
              stackOffset={stackOffset}
            >
              {/* Grid */}
              {props.showGrid !== false && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={axisColor}
                  opacity={0.2}
                />
              )}

              {/* X Axis */}
              {props.showXAxis !== false && (
                <XAxis
                  type={layout === "horizontal" ? "category" : "number"}
                  dataKey={layout === "horizontal" ? "name" : undefined}
                  tick={axisTickStyle}
                  axisLine={
                    props.showAxisLines !== false
                      ? { stroke: axisColor }
                      : { stroke: "none" }
                  }
                  tickLine={props.showTickLines !== false}
                  label={
                    props.xAxisLabel
                      ? {
                          value: props.xAxisLabel,
                          position: "bottom",
                          fill: axisColor,
                          fontSize: axisFontSize,
                        }
                      : undefined
                  }
                  angle={xAxisAngle || undefined}
                  textAnchor={xAxisTextAnchor}
                />
              )}

              {/* Y Axis */}
              {props.showYAxis !== false && (
                <YAxis
                  type={layout === "horizontal" ? "number" : "category"}
                  dataKey={layout === "horizontal" ? undefined : "name"}
                  tick={axisTickStyle}
                  axisLine={
                    props.showAxisLines !== false
                      ? { stroke: axisColor }
                      : { stroke: "none" }
                  }
                  tickLine={props.showTickLines !== false}
                  // allow explicit control of y-axis pixel width to reduce left whitespace
                  {...(typeof props.yAxisWidth === 'number' ? { width: props.yAxisWidth } : {})}
                  domain={["auto", "auto"]}
                  label={
                    props.yAxisLabel
                      ? {
                          value: props.yAxisLabel,
                          angle: -90,
                          position: "left",
                          fill: axisColor,
                          fontSize: axisFontSize,
                        }
                      : undefined
                  }
                />
              )}

              {/* Tooltip / Legend */}
              {props.showTooltip !== false && (
                <Tooltip
                  content={<CustomTooltip series={series} isDarkMode={isDarkMode} />}
                />
              )}
              {props.showLegend !== false && (
                <Legend wrapperStyle={{ fontSize: 12 }} />
              )}

              {/* Series Rendering */}
              {series.map((s, i) => {
                // If the user set a uniform color (perBarColors === false) and provided a `color`, prefer that.
                const effectiveUniform = props.perBarColors === false && !!props.color;
                const color = effectiveUniform
                  ? props.color
                  : s.color || (props.autoColorPalette !== false ? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length] : primaryColor);

                const shared = {
                  key: s.id,
                  dataKey: s.dataKey,
                  name: s.name,
                  fill: color,
                  stroke: color,
                  stackId,
                };

                const fmt = (v: any) => formatValue(v, s.suffix || "", s.decimals || 0);

                if (s.type === "bar")
                  return (
                    <Bar {...shared} radius={props.barRadius || 0}>
                      {/* render per-bar cells when data provides fills or user enabled perBarColors, and only when not overridden by uniform color */}
                      {((props.perBarColors || (Array.isArray(data) && data.some((d: any) => d && d.fill))) && !effectiveUniform) && Array.isArray(data) && data.map((d: any, di: number) => (
                        <Cell key={di} fill={d?.fill || color} />
                      ))}
                      {(s.showLabels || props.showValues) && (
                        <LabelList
                          position={labelPosition}
                          formatter={fmt}
                          style={{
                            fill: props.valueColor || valueColor,
                            fontSize: props.valueFontSize || valueFontSize,
                          }}
                        />
                      )}
                    </Bar>
                  );
                if (s.type === "line") {
                  // If per-point fills exist or user enabled perBarColors, show colored dots per data payload.
                  const usePerPoint = (props.perBarColors || (Array.isArray(data) && data.some((d: any) => d && d.fill))) && !(props.perBarColors === false && !!props.color);
                  const showDots = props.showDots !== false;
                  const dotProp: any = usePerPoint
                    ? (dotProps: any) => {
                        const { cx, cy, payload } = dotProps;
                        if (cx == null || cy == null) return null;
                        const fill = payload?.fill || color;
                        return <circle cx={cx} cy={cy} r={3} fill={fill} stroke={fill} />;
                      }
                    : showDots;

                  // If user disabled lines, render transparent stroke and keep dots visible
                  const strokeColor = props.showLines === false ? "transparent" : color;
                  const strokeW = props.showLines === false ? 0 : props.strokeWidth || 2;

                  return (
                    <Line
                      {...shared}
                      stroke={strokeColor}
                      strokeWidth={strokeW}
                      dot={dotProp}
                      activeDot={{ r: 4 }}
                    >
                      {(s.showLabels || props.showValues) && (
                        <LabelList
                          position={labelPosition}
                          formatter={fmt}
                          style={{
                            fill: props.valueColor || valueColor,
                            fontSize: props.valueFontSize || valueFontSize,
                          }}
                        />
                      )}
                    </Line>
                  );
                }
                if (s.type === "area")
                  return (
                    <Area
                      {...shared}
                      fillOpacity={props.fillOpacity || 0.3}
                      type="monotone"
                    >
                      {(s.showLabels || props.showValues) && (
                        <LabelList
                          position={labelPosition}
                          formatter={fmt}
                          style={{
                            fill: props.valueColor || valueColor,
                            fontSize: props.valueFontSize || valueFontSize,
                          }}
                        />
                      )}
                    </Area>
                  );
                return null;
              })}
            </ComposedChart>
          </ResponsiveContainer>
        ) : component.type === "pie-chart" || component.type === "donut-chart" ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {props.showLegend !== false && <Legend />}
              <Pie
                data={Array.isArray(data) && data.length ? data : generateSampleDataForChartType("pie-chart")}
                dataKey={"value"}
                nameKey={"name"}
                cx="50%"
                cy="50%"
                innerRadius={component.type === "donut-chart" ? props.innerRadius ?? 40 : 0}
                outerRadius={props.outerRadius ?? 80}
                label={props.showDataLabels || props.showValues}
                isAnimationActive={props.animationDuration !== 0}
              >
                {(Array.isArray(data) ? data : []).map((entry: any, idx: number) => {
                  const pieUniform = props.perBarColors === false && !!props.color;
                  const fill = pieUniform ? props.color : entry.fill || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
                  return <Cell key={idx} fill={fill} />;
                })}
              </Pie>
              {props.showTooltip !== false && <Tooltip />}
            </PieChart>
          </ResponsiveContainer>
        ) : component.type === "funnel-chart" ? (
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip />
              <Funnel dataKey="value" data={Array.isArray(data) && data.length ? data : generateSampleDataForChartType("funnel-chart")} isAnimationActive>
                <LabelList dataKey="name" position="left" fill="#000" />
                {(Array.isArray(data) ? data : []).map((entry: any, idx: number) => (
                  <Cell key={idx} fill={entry.fill || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length]} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        ) : component.type === "radar-chart" ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={Array.isArray(data) && data.length ? data : generateSampleDataForChartType("radar-chart")}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              {props.showLegend !== false && <Legend />}
              {props.showTooltip !== false && <Tooltip />}
              <Radar name="Value" dataKey="value" stroke={primaryColor} fill={primaryColor} fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        ) : component.type === "scatter-chart" ? (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={cartesianMargin}>
              {props.showGrid !== false && <CartesianGrid strokeDasharray="3 3" stroke={axisColor} opacity={0.2} />}
              <XAxis
                type="number"
                dataKey="x"
                name="X"
                tick={axisTickStyle}
                axisLine={{ stroke: axisColor }}
                angle={xAxisAngle || undefined}
                textAnchor={xAxisTextAnchor}
              />
              <YAxis type="number" dataKey="y" name="Y" tick={axisTickStyle} axisLine={{ stroke: axisColor }} {...(typeof props.yAxisWidth === 'number' ? { width: props.yAxisWidth } : {})} />
              {props.showTooltip !== false && <Tooltip content={<CustomTooltip series={series} isDarkMode={isDarkMode} />} />}
              {props.showLegend !== false && <Legend />}
              <Scatter data={data} fill={(props.perBarColors === false && props.color) ? props.color : primaryColor}>
                {((props.perBarColors || (Array.isArray(data) && data.some((d: any) => d && d.fill))) && !(props.perBarColors === false && !!props.color)) && Array.isArray(data) && data.map((d: any, di: number) => (
                  <Cell key={di} fill={d?.fill || primaryColor} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        ) : component.type === "gauge" ? (
          <div className="flex items-center justify-center h-full">
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                <path stroke={isDarkMode ? "#222" : "#e6e6e6"} strokeWidth="3" fill="transparent" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                <path stroke={primaryColor} strokeWidth="3" fill="transparent" strokeDasharray={`${data?.[0]?.value ?? props.targetValue ?? 70},100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-bold">{data?.[0]?.value ?? props.targetValue ?? 70}%</div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🤔</div>
              <p>Unsupported Chart Type: {String(component.type)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartRenderer;
