// -----------------------------------------------------------------------------
// src/lib/chartDefaults.ts
// Centralized chart defaults and sample data generator
// Ensures every chart renders correctly with baseline visuals
// -----------------------------------------------------------------------------

import type { DashboardComponent, Series } from "@/types/dashboard";

// -----------------------------------------------------------------------------
// 1️⃣ Sample Data Generator
// -----------------------------------------------------------------------------
export const generateSampleDataForChartType = (
  type: DashboardComponent["type"],
  count: number = 6
): any[] => {
  const categories = ["A", "B", "C", "D", "E", "F"];

  switch (type) {
    // --- Basic Cartesian Charts ---
    case "bar-chart":
    case "column-chart":
    case "line-chart":
    case "area-chart":
      return categories.map((name) => ({
        name,
        value: Math.floor(Math.random() * 100) + 10,
      }));

    // --- Pie / Donut ---
    case "pie-chart":
    case "donut-chart":
      return categories.slice(0, 4).map((name) => ({
        name: `Segment ${name}`,
        value: Math.floor(Math.random() * 40) + 20,
      }));

    // --- Funnel ---
    case "funnel-chart":
      return categories.slice(0, 5).map((name, i) => ({
        name: `Step ${i + 1}`,
        value: 100 - i * 15,
      }));

    // --- Radar ---
    case "radar-chart":
      return categories.map((name) => ({
        name,
        value: Math.floor(Math.random() * 90) + 10,
      }));

    // --- Gauge ---
    case "gauge":
      return [{ name: "Progress", value: 70 }];

    // --- KPI ---
    case "kpi-card":
      return [{ name: "KPI", value: 1234 }];

    // --- Multi-Series (non-stacked) ---
    case "multi-bar":
    case "multi-line":
    case "combo-chart":
      return categories.map((name) => ({
        name,
        Value1: Math.floor(Math.random() * 100),
        Value2: Math.floor(Math.random() * 100),
      }));

    // --- Unsupported (scatter/stacked) ---
    case "scatter-chart":
    case "stacked-bar":
    case "stacked-area":
      return [];

    // --- Default fallback ---
    default:
      return categories.map((name) => ({
        name,
        value: Math.floor(Math.random() * 100),
      }));
  }
};

// -----------------------------------------------------------------------------
// 2️⃣ Default Series Generator
// -----------------------------------------------------------------------------
export const getDefaultSeriesForChart = (
  type: DashboardComponent["type"]
): Series[] => {
  const palette = ["#3b82f6", "#10b981", "#f97316"];

  // --- Multi-Series Charts ---
  if (["multi-bar", "multi-line", "combo-chart"].includes(type)) {
    return [
      {
        id: "s1",
        name: "Series 1",
        dataKey: "Value1",
        color: palette[0],
        type: "bar",
        yAxis: "primary",
        suffix: "",
        decimals: 0,
        showLabels: false,
      },
      {
        id: "s2",
        name: "Series 2",
        dataKey: "Value2",
        color: palette[1],
        type: "line",
        yAxis: "primary",
        suffix: "",
        decimals: 0,
        showLabels: false,
      },
    ];
  }

  // --- Single-Series Charts ---
  return [
    {
      id: "s1",
      name: "Value",
      dataKey: "value",
      color: "#3b82f6",
      type: type.includes("line")
        ? "line"
        : type.includes("area")
        ? "area"
        : "bar",
      yAxis: "primary",
      suffix: "",
      decimals: 0,
      showLabels: true,
    },
  ];
};

// -----------------------------------------------------------------------------
// 3️⃣ Default Chart Properties
// -----------------------------------------------------------------------------
export const getDefaultChartProperties =
  (): DashboardComponent["properties"] => ({
    // --- General Info ---
    title: "Untitled Chart",
    subtitle: "",
    description: "",

    // --- Colors & Appearance ---
    color: "#2563eb",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    shadow: true,

    // --- Title & Value Styling ---
    titleColor: "#1f2937",
    titleFontSize: 18,
    valueColor: "#374151",
    valueFontSize: 12,

    // --- Axis Styling ---
    axisColor: "#6b7280",
    axisFontSize: 12,
    showAxisLines: true,
    showTickLines: true,

    // --- Axis & Layout ---
    orientation: "vertical", // vertical = column chart style
    stackingMode: "none", // none | stacked | percent
    xAxisLabel: "Category",
    yAxisLabel: "Value",
    showXAxis: true,
    showYAxis: true,

    // --- Grid & Legend ---
    showGrid: true,
    showLegend: true,
    showTooltip: true,

    // --- Label Settings ---
    showValues: true,
    showValuesInside: false,
    showDataLabels: false,
    dataLabelPosition: "top",

    // --- Line & Area ---
    strokeWidth: 2,
    fillOpacity: 0.4,

    // --- Pie / Donut ---
    outerRadius: 80,
    innerRadius: 40,

    // --- Margins ---
    marginTop: 20,
    marginRight: 30,
    marginBottom: 30,
    marginLeft: 40,

    // --- Animation ---
    animationDuration: 800,
    animationEasing: "ease-in-out",

    // --- Auto Palette ---
    autoColorPalette: true,
  });

// -----------------------------------------------------------------------------
// 4️⃣ Complete Default Component Builder
// -----------------------------------------------------------------------------
export const createDefaultChartComponent = (
  id: string,
  type: DashboardComponent["type"]
): DashboardComponent => {
  const props = getDefaultChartProperties();
  const data = generateSampleDataForChartType(type);
  const series = getDefaultSeriesForChart(type);

  return {
    id,
    type,
    position: { x: 50, y: 50 },
    size: { width: 420, height: 320 },
    zIndex: 1,
    properties: {
      ...props,
      data,
      series,
    },
  };
};

// -----------------------------------------------------------------------------
// ✅ Notes
// - Supports all main chart types (bar, line, area, pie, donut, funnel, radar, gauge, kpi).
// - Excludes scatter, stacked-bar, stacked-area intentionally (for later phase).
// - Adds new defaults for axis, title, and value style to match ChartRenderer & PropertiesPanel.
// -----------------------------------------------------------------------------
