
import React, { useState, useRef, useCallback } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboards } from "@/hooks/useDashboards";
import type { DashboardComponent } from '@/types/dashboard';
// FIX: Import the correct data generator
import { findAvailablePosition, generateSampleDataForChartType } from "@/lib/chartPreviewData"; 
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Table, 
  Gauge,
  Image,
  Type,
  Download,
  Save,
  Upload,
  Sun,
  Moon,
  Play,
  Eye,
  Settings,
  Undo,
  Redo,
  Copy,
  Trash2,
  Grid3X3,
  AlignCenter,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  User,
  LogOut,
  Crown,
  FolderOpen,
  Sparkles,
  Share2,
  Telescope,
  MessageSquare
} from 'lucide-react';
import Toolbox from '@/components/dashboard-builder/Toolbox';
import Canvas from '@/components/dashboard-builder/Canvas';
import PropertiesPanel from '@/components/dashboard-builder/PropertiesPanel';
import TemplateSelector from '@/components/dashboard-builder/TemplateSelector';
import ExportDialog from '@/components/dashboard-builder/ExportDialog';
import LayoutWizard from '@/components/dashboard-builder/LayoutWizard';
import { layoutComponents } from '@/lib/layoutWizard';
import KeyboardShortcuts from '@/components/dashboard-builder/KeyboardShortcuts';
import ChartSense from '@/components/dashboard-builder/ChartSense';
import ShareDialog from '@/components/dashboard-builder/ShareDialog';
import CommentsPanel from '@/components/dashboard-builder/CommentsPanel';
import InsightsPanel from '@/components/dashboard-builder/InsightsPanel';
import ResearchPanel from '@/components/dashboard-builder/ResearchPanel';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

// Re-export for backward compatibility
export type { DashboardComponent };

interface HistoryState {
  components: DashboardComponent[];
  selectedComponent: string | null;
}

const Index: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { dashboards, saveDashboard, updateDashboard, deleteDashboard } = useDashboards();
  
  const [components, setComponents] = useState<DashboardComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showLayoutWizard, setShowLayoutWizard] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDashboardsDialog, setShowDashboardsDialog] = useState(false);
  const [showChartSense, setShowChartSense] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
  const [showResearchPanel, setShowResearchPanel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dashboardToDelete, setDashboardToDelete] = useState<any | null>(null);
  const [currentDashboardId, setCurrentDashboardId] = useState<string | null>(null);
  
  const [nextZIndex, setNextZIndex] = useState(1);
  const [isToolboxCollapsed, setIsToolboxCollapsed] = useState(false);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false);
  const [gridSnap, setGridSnap] = useState(false);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState<string | null>(null);
  
  const [saveFormData, setSaveFormData] = useState({
    title: '',
    description: '',
    isPublic: false
  });

  
  
  const [dashboardTitle, setDashboardTitle] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState<string | null>(null);
  
  const [history, setHistory] = useState<HistoryState[]>([{ components: [], selectedComponent: null }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Save current state to history
  const saveToHistory = useCallback((newComponents: DashboardComponent[], newSelected: string | null) => {
    const newState = { components: newComponents, selectedComponent: newSelected };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(newHistory.length - 1);
    }
    
    setHistory(newHistory);
  }, [history, historyIndex]);

  // Render a small preview (miniature layout) of a saved dashboard
  // preview removed per request

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setComponents(state.components);
      setSelectedComponent(state.selectedComponent);
      setHistoryIndex(newIndex);
      toast({
        title: "Undone",
        description: "Last action has been undone.",
      });
    }
  }, [history, historyIndex]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setComponents(state.components);
      setSelectedComponent(state.selectedComponent);
      setHistoryIndex(newIndex);
      toast({
        title: "Redone",
        description: "Action has been redone.",
      });
    }
  }, [history, historyIndex]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicate();
      } else if (e.key === 'Delete' && selectedComponent) {
        e.preventDefault();
        deleteComponent(selectedComponent);
      } else if (e.key === 'Escape') {
        setSelectedComponent(null);
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedComponent]);

  const handleDragEnd = (result: DropResult) => {
    console.log('Drag end result:', result);
    
    if (!result.destination) {
      console.log('No destination, drag cancelled');
      return;
    }
    
    const { source, destination } = result;
    
    if (source.droppableId === 'toolbox' && destination.droppableId === 'canvas') {
      console.log('Adding component from toolbox to canvas');
      
      const componentType = result.draggableId as DashboardComponent['type'];
      
      // FIX: Changed 'type: string' to 'type: DashboardComponent['type']'
      const getDefaultSize = (type: DashboardComponent['type']) => {
        const shapeTypes: DashboardComponent['type'][] = ['line', 'circle', 'rectangle', 'arrow', 'triangle', 'shape', 'ellipse'];
        if (shapeTypes.includes(type)) {
          return { width: 150, height: 100 };
        }
        switch (type) {
          case 'text':
            return { width: 200, height: 60 };
          case 'kpi-card':
            return { width: 211, height: 118 };
          case 'gauge':
            return { width: 200, height: 200 };
          default:
            return { width: 424, height: 303 };
        }
      };

      // Get default properties based on chart type
      const getDefaultProperties = (type: DashboardComponent['type']) => {
        // NOTE: This function centralizes sane defaults per chart type.
        // You can tweak any of these values to change defaults for newly added components.
        const baseCommon: DashboardComponent['properties'] = {
          title: `New ${componentType.replace('-', ' ')}`,
          color: '#2563eb',
          backgroundColor: '#ffffff', // default background (applies when ChartRenderer uses it)
          fontSize: 15,
          fontWeight: '600',
          borderRadius: 8,
          shadow: true,
          // margins are px-like but used as numbers in ChartRenderer margin object
          marginTop: 16,
          marginRight: 16,
          marginLeft: 16,
          marginBottom: 16,
          // grid/axis defaults
          showGrid: true,
          showAxisLines: true,
          showTickLines: false,
          showLegend: true,
          showLabels: true,
          // animation & interactions
          strokeWidth: 2,
          fillOpacity: 0.4,
          barRadius: 6,
          showTooltip: true,
          titleColor: '#1f2937',
          axisColor: '#62708b',
          gridColor: '#e6eef7',
          // chart rendering controls
          orientation: 'vertical', // user-facing: 'vertical' | 'horizontal' (most charts vertical by default)
          stackingMode: 'none', // 'none' | 'normal' | 'percent'
          barGap: 0.1, // fraction (0.1 = 10%)
          barPadding: 0.2, // fraction for category gap
          autoColorPalette: true, // auto picks palette for multi-series if true
          // Data fallback
          data: generateSampleDataForChartType(type),
        };

        // Per-type overrides
        // Multi-series charts: sensible default series
        const multiSeriesTypes: DashboardComponent['type'][] = ['combo-chart', 'multi-line', 'multi-bar', 'multi-area', 'stacked-bar', 'stacked-area', 'stacked-column'];
        if (multiSeriesTypes.includes(type)) {
          baseCommon.series = [
            { id: 's1', dataKey: 'series1', color: '#6366f1', type: type.includes('bar') ? 'bar' : type.includes('area') ? 'area' : 'line', name: 'Series 1', yAxis: 'primary', suffix: '', decimals: 0, showLabels: false },
            { id: 's2', dataKey: 'series2', color: '#10b981', type: type.includes('bar') ? 'bar' : type.includes('area') ? 'area' : 'line', name: 'Series 2', yAxis: 'primary', suffix: '', decimals: 0, showLabels: false },
          ];
        }

        // Combo chart default with mixed types
        if (type === 'combo-chart') {
          baseCommon.series = [
            { id: 's1', dataKey: 'series1', color: '#6366f1', type: 'bar', name: 'Sales', yAxis: 'primary', suffix: '', decimals: 0, showLabels: false },
            { id: 's2', dataKey: 'series2', color: '#10b981', type: 'line', name: 'Revenue', yAxis: 'secondary', suffix: '', decimals: 0, showLabels: false },
            { id: 's3', dataKey: 'series3', color: '#f59e0b', type: 'area', name: 'Profit', yAxis: 'primary', suffix: '', decimals: 0, showLabels: false },
          ];
          baseCommon.stackingMode = 'none';
        }

        // Single-series cartesian charts fallback
        const singleSeriesTypes: DashboardComponent['type'][] = ['bar-chart', 'column-chart', 'line-chart', 'area-chart', 'scatter-chart', 'sparkline'];
        if (singleSeriesTypes.includes(type) && !baseCommon.series) {
          // Prefer area -> line -> scatter -> bar mapping so area charts render as area by default
          const inferredSeriesType = type.includes('area')
            ? 'area'
            : type.includes('line')
            ? 'line'
            : type === 'scatter-chart'
            ? 'line'
            : 'bar';
          baseCommon.series = [
            {
              id: 's1',
              dataKey: type === 'scatter-chart' ? 'y' : 'value',
              color: baseCommon.color || '#2563eb',
              type: inferredSeriesType,
              name: 'Series 1',
              yAxis: 'primary',
              suffix: '',
              decimals: 0,
              showLabels: false,
            }
          ];
        }

        // Pie / Donut / Funnel specifics
        if (type === 'pie-chart' || type === 'donut-chart') {
          baseCommon.innerRadius = type === 'donut-chart' ? 40 : 0;
          baseCommon.outerRadius = 80;
          baseCommon.showLabels = true;
          baseCommon.showLabelLines = true;
          baseCommon.data = generateSampleDataForChartType('pie-chart');
          baseCommon.series = [{ id: 's1', dataKey: 'value', color: baseCommon.color || '#2563eb', type: 'bar', name: 'Value', yAxis: 'primary', suffix: '', decimals: 0, showLabels: true }];
        }

        if (type === 'funnel-chart') {
          baseCommon.data = generateSampleDataForChartType('funnel-chart');
          baseCommon.series = [{ id: 's1', dataKey: 'value', color: baseCommon.color || '#2563eb', type: 'bar', name: 'Value', yAxis: 'primary', suffix: '', decimals: 0, showLabels: true }];
        }

        // Radar
        if (type === 'radar-chart') {
          baseCommon.data = generateSampleDataForChartType('radar-chart');
          baseCommon.series = [{ id: 's1', dataKey: 'value', color: baseCommon.color || '#2563eb', type: 'line', name: 'Value', yAxis: 'primary', suffix: '', decimals: 0, showLabels: false }];
        }

        // Candlestick / OHLC keys (so renderer can pick them)
        if (type === 'candlestick') {
          baseCommon.openKey = 'open';
          baseCommon.closeKey = 'close';
          baseCommon.highKey = 'high';
          baseCommon.lowKey = 'low';
          // sample candlestick data generator should produce those keys
          baseCommon.data = generateSampleDataForChartType('candlestick');
        }

        // Waterfall & other advanced charts - keep keys present
        if (type === 'waterfall') {
          baseCommon.series = [{ id: 's1', dataKey: 'value', color: baseCommon.color || '#2563eb', type: 'bar', name: 'Value', yAxis: 'primary', suffix: '', decimals: 0, showLabels: false }];
          baseCommon.data = generateSampleDataForChartType('waterfall');
        }

        // KPI & Gauge defaults
        if (type === 'kpi-card') {
          baseCommon.targetValue = 5000;
          baseCommon.value = 1234;
          baseCommon.kpiLabel = 'Metric';
          baseCommon.showTrend = true;
          baseCommon.showTarget = true;
          baseCommon.timePeriod = 'month';
        }

        if (type === 'gauge') {
          baseCommon.targetValue = 75;
          baseCommon.minValue = 0;
          baseCommon.maxValue = 100;
          baseCommon.color = baseCommon.color || '#2563eb';
        }

        // Data-table / text / image defaults
        if (type === 'data-table' || type === 'table') {
          baseCommon.data = generateSampleDataForChartType('table');
        }

        if (type === 'text') {
          baseCommon.text = '<p>Sample text</p>';
        }

        if (type === 'image') {
          baseCommon.url = 'https://via.placeholder.com/400x300?text=Image';
        }

        // Shapes defaults
        const shapeTypes = ['shape', 'ellipse', 'triangle', 'rectangle', 'circle', 'line', 'arrow'];
        if (shapeTypes.includes(type)) {
          baseCommon.color = baseCommon.color || '#2563eb';
          baseCommon.filled = true;
          baseCommon.strokeWidth = 2;
          baseCommon.opacity = 1;
        }

        // Return a shallow copy to avoid accidental mutation
        return { ...baseCommon };
      };

      const newComponent: DashboardComponent = {
        id: `${componentType}-${Date.now()}`,
        type: componentType,
        position: { x: gridSnap ? Math.round(50 / 20) * 20 : 50, y: gridSnap ? Math.round(50 / 20) * 20 : 50 },
        size: getDefaultSize(componentType),
        zIndex: nextZIndex,
        properties: getDefaultProperties(componentType)
      };
      
      const newComponents = [...components, newComponent];
      setComponents(newComponents);
      setSelectedComponent(newComponent.id);
      setNextZIndex(prev => prev + 1);
      saveToHistory(newComponents, newComponent.id);
      
      toast({
        title: "Component Added",
        description: `${componentType.replace('-', ' ')} has been added to your dashboard.`,
      });
    }
  };

  const updateComponent = (id: string, updates: Partial<DashboardComponent>) => {
    console.debug('[Index] updateComponent', { id, updates });
    const newComponents = components.map(comp => comp.id === id ? { ...comp, ...updates } : comp);
    setComponents(newComponents);
    saveToHistory(newComponents, selectedComponent);
  };

  const deleteComponent = (id: string) => {
    const newComponents = components.filter(comp => comp.id !== id);
    setComponents(newComponents);
    const newSelected = selectedComponent === id ? null : selectedComponent;
    setSelectedComponent(newSelected);
    saveToHistory(newComponents, newSelected);
    
    toast({
      title: "Component Deleted",
      description: "Component has been removed from your dashboard.",
    });
  };

  const handleDuplicate = () => {
    if (!selectedComponent) return;
    
    const component = components.find(c => c.id === selectedComponent);
    if (!component) return;
    
    const newComponent: DashboardComponent = {
      ...component,
      id: `${component.type}-${Date.now()}`,
      position: { 
        x: component.position.x + 20, 
        y: component.position.y + 20 
      },
      zIndex: nextZIndex
    };
    
    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    setSelectedComponent(newComponent.id);
    setNextZIndex(prev => prev + 1);
    saveToHistory(newComponents, newComponent.id);
    
    toast({
      title: "Component Duplicated",
      description: "Component has been duplicated successfully.",
    });
  };

  const deleteAllComponents = () => {
    setComponents([]);
    setSelectedComponent(null);
    saveToHistory([], null);
    
    toast({
      title: "All Components Deleted",
      description: "All components have been removed from your dashboard.",
    });
  };

  const alignComponents = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    if (components.length < 2) return;
    
    const newComponents = [...components];
    
    switch (alignment) {
      case 'left':
        const leftX = Math.min(...components.map(c => c.position.x));
        newComponents.forEach(c => c.position.x = leftX);
        break;
      case 'center':
        const centerX = components.reduce((sum, c) => sum + c.position.x + c.size.width / 2, 0) / components.length;
        newComponents.forEach(c => c.position.x = centerX - c.size.width / 2);
        break;
      case 'top':
        const topY = Math.min(...components.map(c => c.position.y));
        newComponents.forEach(c => c.position.y = topY);
        break;
    }
    
    setComponents(newComponents);
    saveToHistory(newComponents, selectedComponent);
    
    toast({
      title: "Components Aligned",
      description: `Components have been aligned to ${alignment}.`,
    });
  };

  const bringToFront = (id: string) => {
    const newZIndex = nextZIndex;
    updateComponent(id, { zIndex: newZIndex });
    setNextZIndex(prev => prev + 1);
    toast({
      title: "Layer Updated",
      description: "Component brought to front.",
    });
  };

  const sendToBack = (id: string) => {
    updateComponent(id, { zIndex: 0 });
    toast({
      title: "Layer Updated", 
      description: "Component sent to back.",
    });
  };

  const handleApplyColorScheme = (scheme: any) => {
    const colorPalette = [...scheme.primary, ...scheme.secondary];
    let colorIndex = 0;

    const updatedComponents = components.map(comp => {
      const updates: Partial<DashboardComponent> = {};
      
      if (comp.type === 'kpi-card' || comp.type === 'gauge') {
        updates.properties = {
          ...comp.properties,
          color: colorPalette[colorIndex % colorPalette.length],
        };
        colorIndex++;
      } else if (comp.type.includes('chart')) {
        if (comp.properties?.data) {
          updates.properties = {
            ...comp.properties,
            color: colorPalette[colorIndex % colorPalette.length],
          };
          colorIndex++;
        }
      }
      
      return { ...comp, ...updates };
    });

    setComponents(updatedComponents);
    saveToHistory(updatedComponents, selectedComponent);
  };

  const handleSave = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your dashboard.",
        variant: "destructive"
      });
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSaveToDatabase = async () => {
    if (!saveFormData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your dashboard.",
        variant: "destructive"
      });
      return;
    }

    const success = await saveDashboard(
      saveFormData.title,
      components,
      saveFormData.description,
      saveFormData.isPublic
    );

    if (success) {
      setShowSaveDialog(false);
      setSaveFormData({ title: '', description: '', isPublic: false });
    }
  };

  

  const loadDashboard = (dashboard: any) => {
    setComponents(dashboard.components);
    setCurrentDashboardId(dashboard.id);
    setDashboardTitle(dashboard.title);
    setDashboardDescription(dashboard.description || null);
    setShowDashboardsDialog(false);
    const maxZIndex = Math.max(...dashboard.components.map((c: any) => c.zIndex || 0));
    setNextZIndex(maxZIndex + 1);
    saveToHistory(dashboard.components, null);
    toast({
      title: "Dashboard Loaded",
      description: `"${dashboard.title}" has been loaded successfully.`,
    });
  };

  

  const handleLoad = () => {
    const saved = localStorage.getItem('dashboard-mockup');
    if (saved) {
      const projectData = JSON.parse(saved);
      const newComponents = projectData.components || [];
      setComponents(newComponents);
      setIsDarkMode(projectData.darkMode || false);
      saveToHistory(newComponents, null);
      toast({
        title: "Project Loaded",
        description: "Your saved dashboard mockup has been loaded.",
      });
    } else {
      toast({
        title: "No Saved Project",
        description: "No saved project found.",
        variant: "destructive"
      });
    }
  };

  const applyTemplate = (template: any) => {
    try {
      const canvasWidth = canvasRef.current?.clientWidth || 1300;
      const laidOut = layoutComponents(template.components || [], { canvasWidth });
  setComponents(laidOut as unknown as DashboardComponent[]);
      setShowTemplates(false);
  const maxZIndex = Math.max(...(laidOut as any[]).map((c: any) => c.zIndex || 0));
  setNextZIndex(maxZIndex + 1);
  saveToHistory(laidOut as unknown as DashboardComponent[], null);
      toast({
        title: "Template Applied",
        description: `${template.name} template has been applied to your dashboard.`,
      });
    } catch (err) {
      console.error('Failed to apply template layout', err);
      // Fallback: apply raw template components
      setComponents(template.components);
      setShowTemplates(false);
      saveToHistory(template.components, null);
      toast({
        title: "Template Applied",
        description: `${template.name} template has been applied (fallback).`,
      });
    }
  };

  const applyLayout = (layout: any) => {
    setComponents(layout.components);
    setShowLayoutWizard(false);
    const maxZIndex = Math.max(...layout.components.map((c: any) => c.zIndex || 0));
    setNextZIndex(maxZIndex + 1);
    saveToHistory(layout.components, null);
    toast({
      title: "Layout Applied",
      description: `${layout.name} has been applied to your dashboard.`,
    });
  };

  const handleAddChartFromSense = (chart: DashboardComponent) => {
    // Use functional update so multiple rapid calls append correctly and compute positions
    setComponents(prevComponents => {
      const position = findAvailablePosition(prevComponents);
      const z = Math.max(...prevComponents.map(c => c.zIndex || 0), 0) + 1;
      const newComp = { ...chart, position, zIndex: z } as DashboardComponent;
      const newComponents = [...prevComponents, newComp];
      // Keep nextZIndex at least z+1
      setNextZIndex(prev => Math.max(prev, z + 1));
      saveToHistory(newComponents, newComp.id);
      setSelectedComponent(newComp.id);
      return newComponents;
    });
  };

  const handleAddChartFromInsights = (suggestion: any) => {
    const position = findAvailablePosition(components);
    const chartColors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];
    const colorIndex = components.filter(c => c.type.includes('chart')).length % chartColors.length;

    const newComponent: DashboardComponent = {
      id: `component-${Date.now()}`,
      type: suggestion.chartType as any,
      position,
      size: { width: 400, height: 300 },
      zIndex: nextZIndex,
      properties: {
        title: suggestion.title,
        color: chartColors[colorIndex],
        showLegend: true,
        showGrid: true,
        // Data is intentionally left empty to force fallback in ChartRenderer
      },
    };
    
    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    setNextZIndex(prev => prev + 1);
    saveToHistory(newComponents, newComponent.id);
    setSelectedComponent(newComponent.id);
  };

  // Research Panel handlers
  const handleAddKPIFromResearch = (kpi: { name: string; value: string; trend: 'up' | 'down' | 'stable' }) => {
    const position = findAvailablePosition(components);
    const newComponent: DashboardComponent = {
      id: `kpi-${Date.now()}`,
      type: 'kpi-card',
      position,
      size: { width: 211, height: 118 },
      zIndex: nextZIndex,
      properties: {
        title: kpi.name,
        kpiLabel: kpi.name,
        value: parseFloat(kpi.value.replace(/[^0-9.-]/g, '')) || 0,
        targetValue: 0,
        showTrend: true,
        showTarget: false,
        color: kpi.trend === 'up' ? '#10b981' : kpi.trend === 'down' ? '#ef4444' : '#6366f1',
      },
    };
    
    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    setNextZIndex(prev => prev + 1);
    saveToHistory(newComponents, newComponent.id);
    setSelectedComponent(newComponent.id);
  };

  const handleAddChartFromResearch = (chart: { type: string; title: string }) => {
    const position = findAvailablePosition(components);
    const chartColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
    const colorIndex = components.filter(c => c.type.includes('chart')).length % chartColors.length;

    const newComponent: DashboardComponent = {
      id: `chart-${Date.now()}`,
      type: chart.type as DashboardComponent['type'],
      position,
      size: { width: 424, height: 303 },
      zIndex: nextZIndex,
      properties: {
        title: chart.title,
        color: chartColors[colorIndex],
        showLegend: true,
        showGrid: true,
        data: generateSampleDataForChartType(chart.type),
      },
    };
    
    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    setNextZIndex(prev => prev + 1);
    saveToHistory(newComponents, newComponent.id);
    setSelectedComponent(newComponent.id);
  };

  const handleApplyResearchPalette = (colors: string[]) => {
    const newComponents = components.map((comp, idx) => {
      const colorIndex = idx % colors.length;
      return {
        ...comp,
        properties: {
          ...comp.properties,
          color: colors[colorIndex],
        },
      };
    });
    setComponents(newComponents);
    saveToHistory(newComponents, selectedComponent);
    toast({
      title: "Palette Applied",
      description: "Research color palette has been applied to all components.",
    });
  };

  const handleGenerateDashboardFromResearch = (research: any) => {
    const newComponents: DashboardComponent[] = [];
    let currentY = 20;
    let currentX = 20;
    let maxRowHeight = 0;
    const canvasWidth = canvasRef.current?.clientWidth || 1200;
    
    // Add KPI cards in a row
    research.keyMetrics.slice(0, 4).forEach((metric: any, idx: number) => {
      const kpiWidth = 211;
      const kpiHeight = 118;
      
      if (currentX + kpiWidth > canvasWidth - 20) {
        currentX = 20;
        currentY += maxRowHeight + 20;
        maxRowHeight = 0;
      }
      
      newComponents.push({
        id: `kpi-${Date.now()}-${idx}`,
        type: 'kpi-card',
        position: { x: currentX, y: currentY },
        size: { width: kpiWidth, height: kpiHeight },
        zIndex: idx + 1,
        properties: {
          title: metric.name,
          kpiLabel: metric.name,
          value: parseFloat(metric.sampleValue.replace(/[^0-9.-]/g, '')) || 0,
          showTrend: true,
          showTarget: false,
          color: research.colorPalette[idx % research.colorPalette.length] || '#6366f1',
        },
      });
      
      currentX += kpiWidth + 20;
      maxRowHeight = Math.max(maxRowHeight, kpiHeight);
    });
    
    // Move to next row for charts
    currentX = 20;
    currentY += maxRowHeight + 30;
    maxRowHeight = 0;
    
    // Add charts in a 2-column grid
    research.suggestedCharts.slice(0, 4).forEach((chart: any, idx: number) => {
      const chartWidth = 424;
      const chartHeight = 303;
      
      if (currentX + chartWidth > canvasWidth - 20) {
        currentX = 20;
        currentY += maxRowHeight + 20;
        maxRowHeight = 0;
      }
      
      newComponents.push({
        id: `chart-${Date.now()}-${idx}`,
        type: chart.type as DashboardComponent['type'],
        position: { x: currentX, y: currentY },
        size: { width: chartWidth, height: chartHeight },
        zIndex: research.keyMetrics.length + idx + 1,
        properties: {
          title: chart.title,
          color: research.colorPalette[idx % research.colorPalette.length] || '#6366f1',
          showLegend: true,
          showGrid: true,
          data: generateSampleDataForChartType(chart.type),
        },
      });
      
      currentX += chartWidth + 20;
      maxRowHeight = Math.max(maxRowHeight, chartHeight);
    });
    
    setComponents(newComponents);
    setNextZIndex(newComponents.length + 1);
    saveToHistory(newComponents, null);
    setShowResearchPanel(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-gradient-background transition-colors duration-300`}>
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4 shadow-card-enhanced">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Dashboard Builder
              </h1>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setShowLayoutWizard(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Layout Wizard
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Templates
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowChartSense(true)} className="bg-primary/10 hover:bg-primary/20">
                  <Sparkles className="h-4 w-4 mr-2" />
                  ChartSense
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowResearchPanel(true)} 
                  className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30"
                >
                  <Telescope className="h-4 w-4 mr-2" />
                  Research
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDashboardsDialog(true)}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  My Dashboards
                </Button>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)} disabled={!currentDashboardId}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* User Menu and Controls */}
            <div className="flex items-center space-x-4">
              {/* Undo/Redo */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center space-x-2">
                <Button
                  variant={isPreviewMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                >
                  {isPreviewMode ? <Eye className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isPreviewMode ? 'Preview' : 'Edit'}
                </Button>
              </div>
              
              <Separator orientation="vertical" className="h-6" />

              <Button
                variant={showCommentsPanel ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCommentsPanel(!showCommentsPanel)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>

              <Button
                variant={showInsightsPanel ? "default" : "outline"}
                size="sm"
                onClick={() => setShowInsightsPanel(!showInsightsPanel)}
                disabled={!currentDashboardId}
                title="Smart Insights"
              >
                <Sparkles className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
                <Moon className="h-4 w-4" />
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{profile?.full_name || user?.email}</span>
                </div>
                  {/* Canvas background color picker */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-sm border" style={{ backgroundColor: canvasBackgroundColor || 'transparent' }} />
                        <span className="text-xs">Canvas</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Canvas background</div>
                        <Input type="color" value={canvasBackgroundColor || '#ffffff'} onChange={(e) => setCanvasBackgroundColor(e.target.value)} className="w-20 h-8 p-0" />
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setCanvasBackgroundColor(null)}>Reset</Button>
                          <Button size="sm" onClick={() => { /* close handled by popover */ }}>Done</Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open('/admin', '_blank')}
                    className="text-primary hover:text-primary-foreground hover:bg-primary border-primary/20 shadow-glow"
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    Admin
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive border-destructive/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* Toolbox */}
          {!isPreviewMode && (
            <div className={`${isToolboxCollapsed ? 'w-12' : 'w-64'} bg-card/60 backdrop-blur-sm border-r border-border transition-all duration-300 relative shadow-card-enhanced`}>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10"
                onClick={() => setIsToolboxCollapsed(!isToolboxCollapsed)}
              >
                {isToolboxCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
              {!isToolboxCollapsed && <Toolbox />}
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1 relative">
            <Canvas
              ref={canvasRef}
              components={components}
              selectedComponent={selectedComponent}
              onSelectComponent={setSelectedComponent}
              onUpdateComponent={updateComponent}
              onDeleteComponent={deleteComponent}
              onBringToFront={bringToFront}
              onSendToBack={sendToBack}
              isPreviewMode={isPreviewMode}
              isDarkMode={isDarkMode}
              gridSnap={gridSnap}
              canvasBackgroundColor={canvasBackgroundColor}
            />
          </div>

          {/* Properties Panel or Comments Panel */}
          {!isPreviewMode && (
            // expanded width when open, small width when collapsed
            <div className={`${isPropertiesCollapsed ? 'w-12' : 'w-[420px]'} bg-card/60 backdrop-blur-sm border-l border-border transition-all duration-300 relative shadow-card-enhanced`}>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 left-2 z-10"
                onClick={() => setIsPropertiesCollapsed(!isPropertiesCollapsed)}
              >
                {isPropertiesCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              {!isPropertiesCollapsed && (
                showCommentsPanel ? (
                  <CommentsPanel
                    dashboardId={currentDashboardId}
                    selectedComponentId={selectedComponent}
                  />
                ) : (
                  <PropertiesPanel
                    selectedComponent={selectedComponent ? components.find(c => c.id === selectedComponent) : null}
                    onUpdateComponent={updateComponent}
                    onBringToFront={bringToFront}
                    onSendToBack={sendToBack}
                  />
                )
              )}
            </div>
          )}
          
          {/* Insights Panel - separate from Properties */}
          {showInsightsPanel && currentDashboardId && (
            <InsightsPanel
              dashboardTitle={dashboardTitle}
              dashboardDescription={dashboardDescription}
              components={components}
              onClose={() => setShowInsightsPanel(false)}
              onApplyColorScheme={handleApplyColorScheme}
              onAddChart={handleAddChartFromInsights}
            />
          )}
        </div>

        {/* Dialogs */}
        {showLayoutWizard && (
          <LayoutWizard
            onApplyLayout={applyLayout}
            onClose={() => setShowLayoutWizard(false)}
            currentComponents={components}
            canvasWidth={canvasRef.current?.clientWidth}
          />
        )}

        {showTemplates && (
          <TemplateSelector
            // TemplateSelector expects `onApplyTemplate` — forward to our applyTemplate handler
            onApplyTemplate={applyTemplate}
            onClose={() => setShowTemplates(false)}
            canvasWidth={canvasRef.current?.clientWidth}
          />
        )}

        {showExportDialog && (
          <ExportDialog
            components={components}
            canvasRef={canvasRef}
            onClose={() => setShowExportDialog(false)}
          />
        )}

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={saveFormData.title}
                  onChange={(e) => setSaveFormData({ ...saveFormData, title: e.target.value })}
                  placeholder="Enter dashboard title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={saveFormData.description}
                  onChange={(e) => setSaveFormData({ ...saveFormData, description: e.target.value })}
                  placeholder="Enter dashboard description"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={saveFormData.isPublic}
                  onCheckedChange={(checked) => setSaveFormData({ ...saveFormData, isPublic: checked })}
                />
                <Label htmlFor="public">Make this dashboard public</Label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveToDatabase}>Save Dashboard</Button>
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* My Dashboards Dialog */}
        <Dialog open={showDashboardsDialog} onOpenChange={setShowDashboardsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>My Dashboards</DialogTitle>
            </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {dashboards.map((dashboard) => (
                <Card key={dashboard.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 truncate">{dashboard.title}</h3>
                    {dashboard.description && (
                      <p className="text-sm text-muted-foreground mb-3 truncate">{dashboard.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {new Date(dashboard.updated_at).toLocaleDateString()}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={() => loadDashboard(dashboard)}>
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          title={`Delete ${dashboard.title}`}
                          aria-label={`Delete ${dashboard.title}`}
                          onClick={() => {
                            setDashboardToDelete(dashboard);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation dialog for saved dashboards */}
        <Dialog open={showDeleteConfirm} onOpenChange={(open) => { if (!open) { setShowDeleteConfirm(false); setDashboardToDelete(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete <strong>{dashboardToDelete?.title}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setDashboardToDelete(null); }}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!dashboardToDelete) return;
                    const success = await deleteDashboard(dashboardToDelete.id);
                    setShowDeleteConfirm(false);
                    if (success) {
                      // If this was the currently loaded dashboard, clear it
                      if (currentDashboardId === dashboardToDelete.id) {
                        setComponents([]);
                        setCurrentDashboardId(null);
                        setDashboardTitle('');
                        setDashboardDescription(null);
                      }
                      setDashboardToDelete(null);
                      setShowDashboardsDialog(false);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ChartSense Dialog */}
        {/* ChartSense Dialog */}
        <ChartSense
          isOpen={showChartSense}
          onClose={() => setShowChartSense(false)}
          onAddChart={handleAddChartFromSense}
          palette={(() => {
            // derive a palette from existing component colors (fallbacks will apply in ChartSense)
            const colors = components.map(c => c.properties?.color).filter(c => !!c) as string[];
            return Array.from(new Set(colors)).slice(0, 6);
          })()}
        />

        {/* Share Dialog */}
        <ShareDialog
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          dashboardId={currentDashboardId}
          dashboardTitle={dashboards.find(d => d.id === currentDashboardId)?.title || 'Dashboard'}
        />

        {/* Research Panel */}
        <ResearchPanel
          isOpen={showResearchPanel}
          onClose={() => setShowResearchPanel(false)}
          onAddKPI={handleAddKPIFromResearch}
          onAddChart={handleAddChartFromResearch}
          onApplyPalette={handleApplyResearchPalette}
          onGenerateDashboard={handleGenerateDashboardFromResearch}
        />
        
      </DragDropContext>
    </div>
  );
};

export default Index;
