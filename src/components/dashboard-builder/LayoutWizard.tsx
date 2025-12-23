
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DashboardComponent } from '@/types/dashboard';
import { layoutComponents } from '@/lib/layoutWizard';
import { getDefaultSeriesForChart } from '@/lib/chartDefaults';

interface LayoutSuggestion {
  id: string;
  name: string;
  description: string;
  preview: string;
  components: DashboardComponent[];
  layoutType: string;
}

interface LayoutWizardProps {
  onApplyLayout: (layout: LayoutSuggestion) => void;
  onClose: () => void;
  // Current dashboard components so we can arrange them
  currentComponents?: DashboardComponent[];
  // Optional canvas width (helps compute column widths)
  canvasWidth?: number;
}

const LayoutWizard: React.FC<LayoutWizardProps> = ({ onApplyLayout, onClose, currentComponents, canvasWidth }) => {
  const [step, setStep] = useState(1);
  const [chartCount, setChartCount] = useState(6);
  const [kpiCount, setKpiCount] = useState(6);
  const [colorScheme, setColorScheme] = useState('blue');
  const [layoutStructure, setLayoutStructure] = useState('traditional');
  const [suggestions, setSuggestions] = useState<LayoutSuggestion[]>([]);
  const [smartLoading, setSmartLoading] = useState(false);
  const [smartError, setSmartError] = useState<string | null>(null);

  const colorSchemes = {
    blue: { primary: '#3b82f6', secondary: '#1d4ed8', accent: '#60a5fa' },
    green: { primary: '#10b981', secondary: '#047857', accent: '#34d399' },
    purple: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' },
    red: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' },
    orange: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' },
    teal: { primary: '#14b8a6', secondary: '#0d9488', accent: '#5eead4' },
    pink: { primary: '#ec4899', secondary: '#db2777', accent: '#f9a8d4' },
    indigo: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' }
  };

  const generateLayouts = () => {
    const layouts: LayoutSuggestion[] = [];
    const colors = colorSchemes[colorScheme as keyof typeof colorSchemes];
    
    // Generate different layout structures based on selection
    switch (layoutStructure) {
      case 'traditional':
        layouts.push(generateTraditionalLayout(colors));
        break;
      case 'grid':
        layouts.push(generateGridLayout(colors));
        break;
      case 'sidebar':
        layouts.push(generateSidebarLayout(colors));
        break;
      case 'mixed':
        layouts.push(generateMixedLayout(colors));
        break;
      case 'dashboard':
        layouts.push(generateDashboardLayout(colors));
        break;
      default:
        // Generate all layout types
        layouts.push(generateTraditionalLayout(colors));
        layouts.push(generateGridLayout(colors));
        layouts.push(generateSidebarLayout(colors));
        layouts.push(generateMixedLayout(colors));
        layouts.push(generateDashboardLayout(colors));
    }

    setSuggestions(layouts);
    setStep(2);
  };

  // Arrange the current dashboard components using the shared layout helper
  const arrangeCurrent = () => {
    const comps = (currentComponents || []).map(c => ({ ...c }));
    const cw = canvasWidth || 1300;
    try {
      const laid = layoutComponents(comps, { canvasWidth: cw });
      const suggestion: LayoutSuggestion = {
        id: 'arranged-current',
        name: 'Arrange Current Dashboard',
        description: 'Smartly arranges your existing components (no new items created)',
        preview: '🔧',
        components: laid as DashboardComponent[],
        layoutType: 'arranged'
      };
      // Apply directly
      onApplyLayout(suggestion);
    } catch (err) {
      console.error('Layout arrangement failed', err);
      // Provide fallback: simply call onClose so user can continue
      onClose();
    }
  };

  const generateTraditionalLayout = (colors: any): LayoutSuggestion => {
    const components: DashboardComponent[] = [];
    let currentX = 20;
    let currentY = 20;
    
    // KPIs at top in a single grouped section (put all KPIs together first)
    // We place all KPIs sequentially across one or more columns but grouped before charts.
    const kpisPerRow = Math.max(1, kpiCount); // put all KPIs across one row by default
    for (let i = 0; i < kpiCount; i++) {
      const row = Math.floor(i / kpisPerRow);
      const col = i % kpisPerRow;
      components.push({
        id: `kpi-${i + 1}`,
        type: 'kpi-card',
        position: { x: 20 + col * 200, y: 20 + row * 120 },
        size: { width: 180, height: 100 },
        zIndex: i + 1,
        properties: {
          title: `KPI ${i + 1}`,
          color: i % 2 === 0 ? colors.primary : colors.secondary,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          shadow: true,
        }
      });
    }

    // Charts below KPIs
    const kpiRows = Math.ceil(kpiCount / kpisPerRow);
    const chartsStartY = 20 + kpiRows * 120 + 20;
    const chartsPerRow = Math.min(3, chartCount);
    const chartTypes: Array<DashboardComponent['type']> = ['bar-chart', 'line-chart', 'pie-chart', 'area-chart', 'donut-chart', 'gauge'];
    
    for (let i = 0; i < chartCount; i++) {
      const row = Math.floor(i / chartsPerRow);
      const col = i % chartsPerRow;
      components.push({
        id: `chart-${i + 1}`,
        type: chartTypes[i % chartTypes.length],
        position: { x: 20 + col * 320, y: chartsStartY + row * 220 },
        size: { width: 300, height: 200 },
        zIndex: kpiCount + i + 1,
        properties: {
          title: `Chart ${i + 1}`,
          color: colors.accent,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          shadow: true,
        }
      });
    }

    return {
      id: 'traditional-layout',
      name: 'Traditional Layout',
      description: 'KPIs at top, charts below in organized rows',
      preview: '📊',
      components,
      layoutType: 'traditional'
    };
  };

  const generateGridLayout = (colors: any): LayoutSuggestion => {
    const components: DashboardComponent[] = [];
    const totalComponents = kpiCount + chartCount;
    const componentsPerRow = Math.ceil(Math.sqrt(totalComponents));

    // Place KPIs first in top rows (grouped together), then place charts below
    const chartTypes: Array<DashboardComponent['type']> = ['bar-chart', 'line-chart', 'pie-chart', 'area-chart'];

    // Place KPIs
    for (let i = 0; i < kpiCount; i++) {
      const row = Math.floor(i / componentsPerRow);
      const col = i % componentsPerRow;
      components.push({
        id: `kpi-${i + 1}`,
        type: 'kpi-card',
        position: { x: 20 + col * 250, y: 20 + row * 180 },
        size: { width: 220, height: 120 },
        zIndex: i + 1,
        properties: {
          title: `KPI ${i + 1}`,
          color: i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          shadow: true,
        }
      });
    }

    // Charts start on the next row after KPIs
    const kpiRows = Math.ceil(kpiCount / componentsPerRow);
    for (let i = 0; i < chartCount; i++) {
      const row = Math.floor(i / componentsPerRow) + kpiRows;
      const col = i % componentsPerRow;
      components.push({
        id: `chart-${i + 1}`,
        type: chartTypes[i % chartTypes.length],
        position: { x: 20 + col * 250, y: 20 + row * 180 },
        size: { width: 220, height: 160 },
        zIndex: kpiCount + i + 1,
        properties: {
          title: `Chart ${i + 1}`,
          color: (kpiCount + i) % 3 === 0 ? colors.primary : (kpiCount + i) % 3 === 1 ? colors.secondary : colors.accent,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          shadow: true,
        }
      });
    }

    return {
      id: 'grid-layout',
      name: 'Grid Layout',
      description: 'Mixed KPIs and charts in uniform grid',
      preview: '⚏',
      components,
      layoutType: 'grid'
    };
  };

  // Local-first Smart Insight: attempt to create a small set of high-quality layout
  // suggestions based on currentComponents and user preferences. No network calls.
  const handleSmartInsight = async () => {
    setSmartError(null);
    setSmartLoading(true);
    try {
      const colors = colorSchemes[colorScheme as keyof typeof colorSchemes];
      const layouts: LayoutSuggestion[] = [];

      // 1) If there are current components, try to smart-arrange them first
      if (currentComponents && currentComponents.length > 0) {
        try {
          const comps = (currentComponents || []).map(c => ({ ...c }));
          const cw = canvasWidth || 1300;
          const laid = layoutComponents(comps, { canvasWidth: cw });
          layouts.push({
            id: 'smart-arranged-current',
            name: 'Smart Arrange (Current)',
            description: 'Intelligently rearranged your existing components',
            preview: '🔧',
            components: laid as DashboardComponent[],
            layoutType: 'arranged'
          });
        } catch (err) {
          console.warn('Smart arrange failed', err);
        }
      }

      // 2) Produce a few variants using existing generators, prioritizing user's layoutStructure
      const preferred = layoutStructure === 'all' ? 'dashboard' : layoutStructure;
      const variantOrder = [preferred, 'traditional', 'grid', 'mixed', 'sidebar', 'dashboard'];
      for (const v of variantOrder) {
        switch (v) {
          case 'traditional':
            layouts.push(generateTraditionalLayout(colors));
            break;
          case 'grid':
            layouts.push(generateGridLayout(colors));
            break;
          case 'sidebar':
            layouts.push(generateSidebarLayout(colors));
            break;
          case 'mixed':
            layouts.push(generateMixedLayout(colors));
            break;
          case 'dashboard':
            layouts.push(generateDashboardLayout(colors));
            break;
        }
      }

      // dedupe by id
      const seen = new Set<string>();
      const unique = layouts.filter(l => {
        if (seen.has(l.id)) return false;
        seen.add(l.id);
        return true;
      });

      // If there are current components, also offer a Design Enhancements suggestion
      if (currentComponents && currentComponents.length > 0) {
        try {
          const palette = [colors.primary, colors.secondary, colors.accent];
          const enhanced = (currentComponents || []).map((c, i) => {
            const baseColor = c.properties?.color || palette[i % palette.length];
            // start with shallow copy of existing properties
            const newProps: any = {
              ...c.properties,
              borderRadius: Math.max(8, c.properties?.borderRadius ?? 8),
              shadow: true,
              backgroundColor: c.properties?.backgroundColor || '#ffffff',
            };

            // Charts: ensure visual flags, primary color, and series colors are applied
            if (typeof c.type === 'string' && c.type.includes('chart')) {
              newProps.showLegend = c.properties?.showLegend ?? true;
              newProps.showGrid = c.properties?.showGrid ?? false;
              // set a primary color for single-series charts
              newProps.color = c.properties?.color || baseColor;

              // If explicit series exist, map colors onto them; otherwise generate default series and assign colors.
              if (Array.isArray(c.properties?.series) && c.properties.series.length > 0) {
                const seriesPalette = c.properties.series.map((s: any, si: number) => s?.color || palette[(i + si) % palette.length]);
                newProps.series = c.properties.series.map((s: any, si: number) => ({ ...s, color: seriesPalette[si] }));
              } else {
                // create default series and map palette
                try {
                  const defaultSeries = getDefaultSeriesForChart(c.type as any) || [];
                  const seriesPalette = defaultSeries.map((s: any, si: number) => palette[(i + si) % palette.length]);
                  newProps.series = defaultSeries.map((s: any, si: number) => ({ ...s, color: seriesPalette[si] }));
                } catch (e) {
                  // fallback: set colors array
                  newProps.colors = c.properties?.colors && c.properties.colors.length > 0 ? c.properties.colors : [newProps.color, palette[(i+1) % palette.length], palette[(i+2) % palette.length]];
                }
              }

              // For pie/donut charts, ensure data entries have fill colors
              if ((c.type === 'pie-chart' || c.type === 'donut-chart') && Array.isArray(c.properties?.data) && c.properties.data.length > 0) {
                newProps.data = c.properties.data.map((d: any, di: number) => ({ ...(d || {}), fill: d?.fill || palette[di % palette.length] }));
              }

              // ensure titles reflect the scheme
              newProps.titleColor = c.properties?.titleColor || baseColor;

              // prefer deterministic palette usage
              newProps.autoColorPalette = false;
            }

            // KPI: emphasize value color and title color
            if (c.type === 'kpi-card') {
              newProps.valueColor = c.properties?.valueColor || baseColor;
              newProps.titleColor = c.properties?.titleColor || baseColor;
            }

            return { ...c, properties: newProps } as DashboardComponent;
          });

          const designSuggestion: LayoutSuggestion = {
            id: 'design-enhancements',
            name: 'Design Enhancements',
            description: 'Apply a polished, consistent visual treatment across your existing components (colors, shadows, borders).',
            preview: '✨',
            components: enhanced,
            layoutType: 'design'
          };

          // Put design suggestion first so users see it prominently
          unique.unshift(designSuggestion);
        } catch (e) {
          console.warn('Failed to build design enhancement suggestion', e);
        }
      }

      // slight delay for UX
      await new Promise(r => setTimeout(r, 120));

      setSuggestions(unique);
      setStep(2);
    } catch (err: any) {
      console.error('Smart Insight failed', err);
      setSmartError('Could not generate smart layouts. Try Auto-generate.');
    } finally {
      setSmartLoading(false);
    }
  };

  const generateSidebarLayout = (colors: any): LayoutSuggestion => {
    const components: DashboardComponent[] = [];
    
    // KPIs in left sidebar
    for (let i = 0; i < kpiCount; i++) {
      components.push({
        id: `kpi-${i + 1}`,
        type: 'kpi-card',
        position: { x: 20, y: 20 + i * 110 },
        size: { width: 200, height: 90 },
        zIndex: i + 1,
        properties: {
          title: `KPI ${i + 1}`,
          color: colors.primary,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          shadow: true,
        }
      });
    }

    // Charts in main area
    const chartsPerRow = Math.min(2, chartCount);
    const chartTypes: Array<DashboardComponent['type']> = ['bar-chart', 'line-chart', 'pie-chart', 'area-chart', 'donut-chart', 'gauge'];
    
    for (let i = 0; i < chartCount; i++) {
      const row = Math.floor(i / chartsPerRow);
      const col = i % chartsPerRow;
      components.push({
        id: `chart-${i + 1}`,
        type: chartTypes[i % chartTypes.length],
        position: { x: 240 + col * 380, y: 20 + row * 220 },
        size: { width: 360, height: 200 },
        zIndex: kpiCount + i + 1,
        properties: {
          title: `Chart ${i + 1}`,
          color: colors.secondary,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          shadow: true,
        }
      });
    }

    return {
      id: 'sidebar-layout',
      name: 'Sidebar Layout',
      description: 'KPIs in left sidebar, charts in main area',
      preview: '🔲',
      components,
      layoutType: 'sidebar'
    };
  };

  const generateMixedLayout = (colors: any): LayoutSuggestion => {
    const components: DashboardComponent[] = [];
    
    // Top row with some KPIs
    const topKPIs = Math.min(3, kpiCount);
    for (let i = 0; i < topKPIs; i++) {
      components.push({
        id: `top-kpi-${i + 1}`,
        type: 'kpi-card',
        position: { x: 20 + i * 220, y: 20 },
        size: { width: 200, height: 100 },
        zIndex: i + 1,
        properties: {
          title: `Top KPI ${i + 1}`,
          color: colors.primary,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          shadow: true,
        }
      });
    }

    // Middle section with charts and remaining KPIs mixed
    let componentIndex = 0;
    const remainingKPIs = kpiCount - topKPIs;
    const chartTypes: Array<DashboardComponent['type']> = ['bar-chart', 'line-chart', 'pie-chart', 'area-chart'];
    
    // Add main charts
    for (let i = 0; i < Math.min(4, chartCount); i++) {
      const row = Math.floor(i / 2);
      const col = i % 2;
      components.push({
        id: `main-chart-${i + 1}`,
        type: chartTypes[i % chartTypes.length],
        position: { x: 20 + col * 400, y: 140 + row * 220 },
        size: { width: 380, height: 200 },
        zIndex: topKPIs + i + 1,
        properties: {
          title: `Chart ${i + 1}`,
          color: colors.secondary,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          shadow: true,
        }
      });
      componentIndex++;
    }

    // Right sidebar with remaining KPIs
    for (let i = 0; i < remainingKPIs; i++) {
      components.push({
        id: `side-kpi-${i + 1}`,
        type: 'kpi-card',
        position: { x: 820, y: 140 + i * 110 },
        size: { width: 180, height: 90 },
        zIndex: topKPIs + componentIndex + i + 1,
        properties: {
          title: `Side KPI ${i + 1}`,
          color: colors.accent,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          shadow: true,
        }
      });
    }

    return {
      id: 'mixed-layout',
      name: 'Mixed Layout',
      description: 'Creative mix with top KPIs, central charts, side metrics',
      preview: '🎨',
      components,
      layoutType: 'mixed'
    };
  };

  const generateDashboardLayout = (colors: any): LayoutSuggestion => {
    const components: DashboardComponent[] = [];
    
    // Feature KPI at top left
    components.push({
      id: 'feature-kpi',
      type: 'kpi-card',
      position: { x: 20, y: 20 },
      size: { width: 300, height: 120 },
      zIndex: 1,
      properties: {
        title: 'Featured Metric',
        color: colors.primary,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadow: true,
      }
    });

    // Small KPIs in top right
    const smallKPIs = Math.min(kpiCount - 1, 4);
    for (let i = 0; i < smallKPIs; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      components.push({
        id: `small-kpi-${i + 1}`,
        type: 'kpi-card',
        position: { x: 340 + col * 180, y: 20 + row * 70 },
        size: { width: 160, height: 60 },
        zIndex: i + 2,
        properties: {
          title: `KPI ${i + 2}`,
          color: colors.secondary,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          shadow: true,
        }
      });
    }

    // Main chart area
    const mainCharts = Math.min(chartCount, 3);
    const chartTypes: Array<DashboardComponent['type']> = ['bar-chart', 'line-chart', 'area-chart'];
    
    for (let i = 0; i < mainCharts; i++) {
      components.push({
        id: `main-chart-${i + 1}`,
        type: chartTypes[i % chartTypes.length],
        position: { x: 20 + i * 320, y: 160 },
        size: { width: 300, height: 220 },
        zIndex: smallKPIs + i + 2,
        properties: {
          title: `Dashboard Chart ${i + 1}`,
          color: colors.accent,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          shadow: true,
        }
      });
    }

    // Bottom row with additional components
    const remainingCharts = chartCount - mainCharts;
    for (let i = 0; i < Math.min(remainingCharts, 2); i++) {
      components.push({
        id: `bottom-chart-${i + 1}`,
        type: i === 0 ? 'pie-chart' : 'gauge',
        position: { x: 20 + i * 400, y: 400 },
        size: { width: 380, height: 180 },
        zIndex: smallKPIs + mainCharts + i + 2,
        properties: {
          title: `Additional Chart ${i + 1}`,
          color: colors.primary,
          backgroundColor: '#ffffff',
          borderRadius: 8,
          shadow: true,
        }
      });
    }

    return {
      id: 'dashboard-layout',
      name: 'Executive Dashboard',
      description: 'Professional dashboard with featured metrics and key charts',
      preview: '🏢',
      components,
      layoutType: 'dashboard'
    };
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Dashboard Layout Wizard' : 'Choose Your Layout'}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6 p-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-2">Customize Your Dashboard</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tell us your preferences and we'll create the perfect layout
              </p>
            </div>

                    <div className="mb-4 text-center">
                      <p className="text-sm text-gray-700 dark:text-gray-300">Prefer to arrange your current dashboard instead of generating new components?</p>
                      <div className="flex items-center justify-center space-x-2 mt-3">
                        <Button variant="outline" onClick={arrangeCurrent}>Arrange existing dashboard</Button>
                        <Button onClick={() => { setKpiCount(6); setChartCount(6); generateLayouts(); }}>Auto-generate sample layout</Button>
                        <Button onClick={async () => { await handleSmartInsight(); }} disabled={smartLoading}>
                          {smartLoading ? 'Smart Insight...' : 'Smart Insight'}
                        </Button>
                      </div>
                      {smartError && <div className="text-xs text-red-600 mt-2">{smartError}</div>}
                    </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="charts">Number of Charts</Label>
                <Input
                  id="charts"
                  type="number"
                  min="1"
                  max="12"
                  value={chartCount}
                  onChange={(e) => setChartCount(parseInt(e.target.value) || 1)}
                  className="text-center text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kpis">Number of KPIs</Label>
                <Input
                  id="kpis"
                  type="number"
                  min="1"
                  max="12"
                  value={kpiCount}
                  onChange={(e) => setKpiCount(parseInt(e.target.value) || 1)}
                  className="text-center text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color-scheme">Color Scheme</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Professional Blue</SelectItem>
                    <SelectItem value="green">Success Green</SelectItem>
                    <SelectItem value="purple">Creative Purple</SelectItem>
                    <SelectItem value="red">Alert Red</SelectItem>
                    <SelectItem value="orange">Energetic Orange</SelectItem>
                    <SelectItem value="teal">Modern Teal</SelectItem>
                    <SelectItem value="pink">Vibrant Pink</SelectItem>
                    <SelectItem value="indigo">Deep Indigo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="layout-structure">Layout Structure</Label>
                <Select value={layoutStructure} onValueChange={setLayoutStructure}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose layout style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Show All Layouts</SelectItem>
                    <SelectItem value="traditional">Traditional (KPIs top, Charts bottom)</SelectItem>
                    <SelectItem value="grid">Uniform Grid</SelectItem>
                    <SelectItem value="sidebar">Sidebar Layout</SelectItem>
                    <SelectItem value="mixed">Creative Mixed</SelectItem>
                    <SelectItem value="dashboard">Executive Dashboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Your Configuration:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <p><span className="font-medium">Charts:</span> {chartCount}</p>
                <p><span className="font-medium">KPIs:</span> {kpiCount}</p>
                <p><span className="font-medium">Color:</span> {colorScheme}</p>
                <p><span className="font-medium">Style:</span> {layoutStructure === 'all' ? 'Multiple options' : layoutStructure}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={generateLayouts}>
                Generate Layouts
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="text-center mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                Choose from {suggestions.length} customized layout{suggestions.length !== 1 ? 's' : ''} with your {colorScheme} color scheme
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((layout) => (
                <Card key={layout.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="text-4xl text-center mb-2">{layout.preview}</div>
                    <CardTitle className="text-lg text-center">{layout.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                      {layout.description}
                    </p>
                    <div className="text-xs text-center mb-3 text-gray-500">
                      {layout.components.filter(c => c.type === 'kpi-card').length} KPIs • {layout.components.filter(c => c.type !== 'kpi-card').length} Charts
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => onApplyLayout(layout)}
                    >
                      Use This Layout
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LayoutWizard;
