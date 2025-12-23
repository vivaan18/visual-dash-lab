import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import SmallChartPreview from './SmallChartPreview';
import { Upload, Sparkles, BarChart3, LineChart, PieChart, TrendingUp, X, FileText, CheckSquare, Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { DashboardComponent } from '@/types/dashboard';
import { parseCSV, profileData, type DataProfile } from '@/lib/csvParser';
import { generateChartSuggestions, convertDataForChart, type ChartSuggestion, type ColumnMapping, type ColumnRole, type Aggregation } from '@/lib/chartSuggestions';

interface ChartSenseProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChart: (chart: DashboardComponent) => void;
  // Optional dashboard color palette to use for previews and created charts
  palette?: string[];
}

const ChartSense: React.FC<ChartSenseProps> = ({ isOpen, onClose, onAddChart, palette }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [dataProfile, setDataProfile] = useState<DataProfile | null>(null);
  const [suggestions, setSuggestions] = useState<ChartSuggestion[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [showMappings, setShowMappings] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualComponentKind, setManualComponentKind] = useState<'kpi' | 'chart'>('kpi');
  const [manualChartType, setManualChartType] = useState<string>('bar-chart');
  const [manualMeasure, setManualMeasure] = useState<string | null>(null);
  const [manualDimension, setManualDimension] = useState<string | null>(null);
  const [manualAggregation, setManualAggregation] = useState<Aggregation>('sum');

  // Fallback palette used when no dashboard palette is provided
  const fallbackPalette = ['#3b82f6', '#f97316', '#10b981', '#a78bfa', '#ef4444', '#06b6d4'];

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'kpi-card':
        return <Sparkles className="h-5 w-5" />;
      case 'line-chart':
      case 'area-chart':
        return <LineChart className="h-5 w-5" />;
      case 'pie-chart':
      case 'donut-chart':
        return <PieChart className="h-5 w-5" />;
      case 'scatter-chart':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);

        if (data.length === 0) {
          toast({
            title: "Empty File",
            description: "The CSV file appears to be empty.",
            variant: "destructive",
          });
          return;
        }

      setCsvData(data);
        const profile = profileData(data);
        setDataProfile(profile);

        // Initialize column mappings
        const mappings: ColumnMapping[] = profile.columns.map(col => ({
          name: col.name,
          role: null,
          type: col.type,
        }));
        setColumnMappings(mappings);
        setShowMappings(true);

        toast({
          title: "CSV Loaded Successfully",
          description: `Analyzed ${data.length} rows. Map columns to generate chart suggestions.`,
        });
      } catch (error) {
        console.error('CSV parsing error:', error);
        toast({
          title: "Parse Error",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive",
        });
      }
    };

    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleUpdateColumnRole = (columnName: string, role: ColumnRole | null) => {
    setColumnMappings(prev =>
      prev.map(col => (col.name === columnName ? { ...col, role } : col))
    );
  };

  const handleUpdateAggregation = (columnName: string, aggregation: Aggregation) => {
    setColumnMappings(prev =>
      prev.map(col => (col.name === columnName ? { ...col, aggregation } : col))
    );
  };

  const handleAutoMap = () => {
    setColumnMappings(prev =>
      prev.map(col => {
        if (col.type === 'numeric') return { ...col, role: 'kpi' as ColumnRole, aggregation: 'sum' as Aggregation };
        if (col.type === 'datetime') return { ...col, role: 'time' as ColumnRole };
        if (col.type === 'categorical') return { ...col, role: 'dimension' as ColumnRole };
        return { ...col };
      })
    );
  };

  const handleGenerateSuggestions = () => {
    if (!dataProfile || !csvData) return;

    const chartSuggestions = generateChartSuggestions(dataProfile, csvData, columnMappings);
    setSuggestions(chartSuggestions);
    setShowMappings(false);
    
    toast({
      title: "Suggestions Generated",
      description: `Generated ${chartSuggestions.length} chart suggestions based on your mappings.`,
    });
  };

  const handleToggleSelection = (suggestionId: string) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(suggestionId)) {
        newSet.delete(suggestionId);
      } else {
        newSet.add(suggestionId);
      }
      return newSet;
    });
  };

  const handleGenerateSelectedCharts = () => {
    if (!csvData || selectedSuggestions.size === 0) return;

    const selectedList = suggestions.filter(s => selectedSuggestions.has(s.id));
    // Delegate placement to parent by calling onAddChart for each selected suggestion
    selectedList.forEach((suggestion, index) => {
      // If this is a KPI suggestion, compute a single aggregated value and set properties.value
      if (suggestion.type === 'kpi-card') {
        const metric = suggestion.columns[0];
        // find aggregation if provided
        const agg = suggestion.mappedColumns?.[0]?.aggregation || 'sum';
        const rawValues = csvData.map(r => Number(r[metric])).filter(v => !isNaN(v));
        let aggregated = 0;
        if (rawValues.length === 0) aggregated = 0;
        else if (agg === 'sum') aggregated = rawValues.reduce((a, b) => a + b, 0);
        else if (agg === 'avg') aggregated = rawValues.reduce((a, b) => a + b, 0) / rawValues.length;
        else if (agg === 'min') aggregated = Math.min(...rawValues);
        else if (agg === 'max') aggregated = Math.max(...rawValues);
        else if (agg === 'count') aggregated = rawValues.length;

        const newKpi: DashboardComponent = {
          id: `kpi-${Date.now()}-${index}`,
          type: 'kpi-card',
          position: { x: 0, y: 0 },
          size: { width: 240, height: 120 },
          zIndex: 0,
          properties: {
            title: suggestion.title,
            kpiLabel: metric,
            value: Math.round(aggregated * 100) / 100,
            backgroundColor: '#ffffff',
            borderRadius: 8,
          }
        };

        onAddChart(newKpi);
      } else {
        const chartData = convertDataForChart(csvData, suggestion);

        // Compute colors for this suggestion (cycle palette or use fallback)
        const colorsForSuggestion = (palette && palette.length > 0 ? palette : fallbackPalette);
        const assignedColors = suggestion.columns.map((_, i) => colorsForSuggestion[i % colorsForSuggestion.length]);

        const newChart: DashboardComponent = {
          id: `chart-${Date.now()}-${Math.floor(Math.random() * 10000)}-${index}`,
          type: suggestion.type,
          // Provide placeholders for typing; parent will overwrite position/zIndex
          position: { x: 0, y: 0 },
          size: { width: 400, height: 300 },
          zIndex: 0,
          properties: {
            title: suggestion.title,
            customData: chartData,
            data: chartData,
            // For single-series use first color; for multi-series include colors array
            color: assignedColors[0],
            colors: assignedColors,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            shadow: true,
            showGrid: true,
            showLegend: true,
            showLabels: true,
          },
        };

        onAddChart(newChart);
      }
    });
    
    toast({
      title: "Charts Generated",
      description: `${selectedSuggestions.size} charts have been added to your dashboard.`,
    });
    
    setSelectedSuggestions(new Set());
    onClose();
  };

  const handleGenerateSingleChart = (suggestion: ChartSuggestion) => {
    if (!csvData) return;
    // If it's a KPI suggestion, compute aggregated value and set properties.value
    if (suggestion.type === 'kpi-card') {
      const metric = suggestion.columns[0];
      const agg = suggestion.mappedColumns?.[0]?.aggregation || 'sum';
      const rawValues = csvData.map(r => Number(r[metric])).filter(v => !isNaN(v));
      let aggregated = 0;
      if (rawValues.length === 0) aggregated = 0;
      else if (agg === 'sum') aggregated = rawValues.reduce((a, b) => a + b, 0);
      else if (agg === 'avg') aggregated = rawValues.reduce((a, b) => a + b, 0) / rawValues.length;
      else if (agg === 'min') aggregated = Math.min(...rawValues);
      else if (agg === 'max') aggregated = Math.max(...rawValues);
      else if (agg === 'count') aggregated = rawValues.length;

      const newKpi: DashboardComponent = {
        id: `kpi-${Date.now()}`,
        type: 'kpi-card',
        position: { x: 50, y: 50 },
        size: { width: 240, height: 120 },
        zIndex: 1,
        properties: {
          title: suggestion.title,
          kpiLabel: metric,
          value: Math.round(aggregated * 100) / 100,
          backgroundColor: '#ffffff',
          borderRadius: 8,
        }
      };

      onAddChart(newKpi);
      toast({ title: 'KPI Added', description: `${suggestion.title} has been added to your dashboard.` });
      return;
    }

    const chartData = convertDataForChart(csvData, suggestion);
    const colorsForSuggestion = (palette && palette.length > 0 ? palette : fallbackPalette);
    const assignedColors = suggestion.columns.map((_, i) => colorsForSuggestion[i % colorsForSuggestion.length]);
    
    const newChart: DashboardComponent = {
      id: `chart-${Date.now()}`,
      type: suggestion.type,
      position: { x: 50, y: 50 },
      size: { width: 400, height: 300 },
      zIndex: 1,
      properties: {
        title: suggestion.title,
        data: chartData,
        color: assignedColors[0],
        colors: assignedColors,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadow: true,
        showGrid: true,
        showLegend: true,
        showLabels: true,
      },
    };

    onAddChart(newChart);

    toast({
      title: "Chart Generated",
      description: `${suggestion.title} has been added to your dashboard.`,
    });
  };

  const handleReset = () => {
    setCsvData(null);
    setDataProfile(null);
    setSuggestions([]);
    setFileName('');
    setColumnMappings([]);
    setSelectedSuggestions(new Set());
    setShowMappings(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              ChartSense - AI-Powered Chart Suggestions
            </DialogTitle>
            {csvData && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </DialogHeader>

        {!csvData ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Import Your CSV File</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your CSV file here, or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <Button asChild>
              <label htmlFor="csv-upload" className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2" />
                Choose CSV File
              </label>
            </Button>
          </div>
        ) : showMappings ? (
          <div className="space-y-4">
            {/* Column Mapping */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Map Columns to Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Assign roles to columns to generate meaningful chart suggestions.
                </p>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" onClick={handleAutoMap}>Auto-map</Button>
                    </div>
                    {columnMappings.map((mapping) => (
                      <div key={mapping.name} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{mapping.name}</p>
                          <p className="text-xs text-muted-foreground">{mapping.type} • sample: {mapping.type === 'numeric' ? (dataProfile?.columns.find(c=>c.name===mapping.name)?.sampleValues.join(', ') ?? '') : (dataProfile?.columns.find(c=>c.name===mapping.name)?.sampleValues.join(', ') ?? '')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={mapping.role || 'none'}
                            onValueChange={(value) =>
                              handleUpdateColumnRole(mapping.name, value === 'none' ? null : value as ColumnRole)
                            }
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue placeholder="Select role..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="kpi">KPI (Metric)</SelectItem>
                              <SelectItem value="dimension">Dimension</SelectItem>
                              <SelectItem value="time">Time</SelectItem>
                              <SelectItem value="filter">Filter</SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Aggregation selector for KPI columns */}
                          {mapping.role === 'kpi' && (
                            <Select
                              value={mapping.aggregation || 'sum'}
                              onValueChange={(value) => handleUpdateAggregation(mapping.name, value as Aggregation)}
                            >
                              <SelectTrigger className="w-[110px]">
                                <SelectValue placeholder="Agg" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sum">Sum</SelectItem>
                                <SelectItem value="avg">Avg</SelectItem>
                                <SelectItem value="count">Count</SelectItem>
                                <SelectItem value="min">Min</SelectItem>
                                <SelectItem value="max">Max</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <Button onClick={handleGenerateSuggestions} className="w-full mt-4">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Chart Suggestions
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Data Profile Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Data Profile</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setShowMappings(true)}>
                    Edit Mappings
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">File</p>
                    <p className="font-medium">{fileName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rows</p>
                    <p className="font-medium">{dataProfile?.rowCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Columns</p>
                    <p className="font-medium">{dataProfile?.columns.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Suggestions</p>
                    <p className="font-medium">{suggestions.length}</p>
                  </div>
                </div>

                {/* Manual create panel */}
                <div className="mt-4 p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Manual Create</div>
                    <div className="text-xs text-muted-foreground">Create KPI or Chart manually</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={manualComponentKind === 'kpi' ? 'kpi' : 'chart'} onValueChange={(v) => { setManualMode(true); setManualComponentKind(v as any); }}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kpi">KPI Card</SelectItem>
                        <SelectItem value="chart">Chart</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={manualMeasure || 'none'} onValueChange={(v) => setManualMeasure(v === 'none' ? null : v)}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Select measure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {(dataProfile?.columns || []).filter(c => c.type === 'numeric').map(c => (
                          <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {manualComponentKind === 'chart' && (
                      <>
                        <Select value={manualChartType || 'bar-chart'} onValueChange={(v) => setManualChartType(v)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Chart type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar-chart">Bar</SelectItem>
                            <SelectItem value="line-chart">Line</SelectItem>
                            <SelectItem value="pie-chart">Pie</SelectItem>
                            <SelectItem value="area-chart">Area</SelectItem>
                            <SelectItem value="scatter-chart">Scatter</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={manualDimension || 'none'} onValueChange={(v) => setManualDimension(v === 'none' ? null : v)}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Select dimension" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {(dataProfile?.columns || []).filter(c => c.type !== 'numeric').map(c => (
                            <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                        </Select>
                      </>
                    )}

                    <Select value={manualAggregation} onValueChange={(v) => setManualAggregation(v as Aggregation)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sum">Sum</SelectItem>
                        <SelectItem value="avg">Avg</SelectItem>
                        <SelectItem value="count">Count</SelectItem>
                        <SelectItem value="min">Min</SelectItem>
                        <SelectItem value="max">Max</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button size="sm" onClick={async () => {
                      if (!csvData) return;
                      if (!manualMeasure) {
                        toast({ title: 'Select measure', description: 'Please choose a numeric measure to create from.', variant: 'destructive' });
                        return;
                      }

                      // compute aggregated value for KPI
                      const rawValues = csvData.map(r => Number(r[manualMeasure])).filter(v => !isNaN(v));
                      let aggregated = 0;
                      if (rawValues.length === 0) aggregated = 0;
                      else if (manualAggregation === 'sum') aggregated = rawValues.reduce((a, b) => a + b, 0);
                      else if (manualAggregation === 'avg') aggregated = rawValues.reduce((a, b) => a + b, 0) / rawValues.length;
                      else if (manualAggregation === 'min') aggregated = Math.min(...rawValues);
                      else if (manualAggregation === 'max') aggregated = Math.max(...rawValues);
                      else if (manualAggregation === 'count') aggregated = rawValues.length;

                      if (manualComponentKind === 'kpi') {
                        const newKpi: DashboardComponent = {
                          id: `kpi-${Date.now()}`,
                          type: 'kpi-card',
                          position: { x: 50, y: 50 },
                          size: { width: 240, height: 120 },
                          zIndex: 1,
                          properties: {
                            title: manualMeasure,
                            kpiLabel: manualMeasure,
                            value: Math.round(aggregated * 100) / 100,
                            valueColor: '#111827',
                            backgroundColor: '#ffffff',
                            borderRadius: 8,
                          },
                        };
                        onAddChart(newKpi);
                        toast({ title: 'KPI Added', description: `${manualMeasure} KPI added.` });
                        onClose();
                        return;
                      }

                      // For charts, build suggestion-like object and convert data
                      const suggestion: any = {
                        id: `manual-${manualChartType}-${manualMeasure}-${manualDimension || 'none'}`,
                        type: manualChartType,
                        title: manualDimension ? `${manualMeasure} by ${manualDimension}` : `${manualMeasure} Distribution`,
                        columns: manualDimension ? [manualDimension, manualMeasure] : [manualMeasure],
                        mappedColumns: manualDimension ? [{ name: manualMeasure, aggregation: manualAggregation }] : undefined,
                      };

                      const chartData = convertDataForChart(csvData, suggestion as any);
                      const colorsForSuggestion = (palette && palette.length > 0 ? palette : fallbackPalette);
                      const assignedColors = (suggestion.columns || []).map((_: any, i: number) => colorsForSuggestion[i % colorsForSuggestion.length]);

                      const newChart: DashboardComponent = {
                        id: `chart-${Date.now()}`,
                        type: manualChartType as any,
                        position: { x: 50, y: 50 },
                        size: { width: 400, height: 300 },
                        zIndex: 1,
                        properties: {
                          title: suggestion.title,
                          data: chartData,
                          color: assignedColors[0],
                          colors: assignedColors,
                          backgroundColor: '#ffffff',
                          borderRadius: 8,
                        }
                      };

                      onAddChart(newChart);
                      toast({ title: 'Chart Added', description: `${suggestion.title} added.` });
                      onClose();
                    }}>Add</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart Suggestions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recommended Charts</CardTitle>
                  {selectedSuggestions.size > 0 && (
                    <Button size="sm" onClick={handleGenerateSelectedCharts}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Add {selectedSuggestions.size} Charts
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {suggestions.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No suggestions yet. Map your columns to generate meaningful charts.
                      </p>
                    ) : (
                      <>
                        {(showAllSuggestions ? suggestions : suggestions.slice(0, 6)).map((suggestion) => (
                          <Card
                            key={suggestion.id}
                            className={`hover:shadow-md transition-shadow ${
                              selectedSuggestions.has(suggestion.id) ? 'ring-2 ring-primary' : ''
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <Checkbox
                                    checked={selectedSuggestions.has(suggestion.id)}
                                    onCheckedChange={() => handleToggleSelection(suggestion.id)}
                                    className="mt-1"
                                  />
                                  <div className="mt-1 text-primary">
                                    {getChartIcon(suggestion.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm mb-1">
                                      {suggestion.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {suggestion.reason}
                                    </p>
                                    {typeof suggestion.confidence === 'number' && (
                                      <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                                        <div>Confidence: <span className="font-medium">{Math.round(suggestion.confidence * 100)}%</span></div>
                                        {suggestion.scoreDetails && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button className="p-1 rounded hover:bg-slate-50">
                                                <Info className="h-4 w-4 text-muted-foreground" />
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" align="center">
                                              <div className="text-xs">
                                                <div>Priority: {Math.round((suggestion.scoreDetails.priorityScore ?? 0) * 100)}%</div>
                                                <div>Mapping: {Math.round((suggestion.scoreDetails.mappingScore ?? 0) * 100)}%</div>
                                                <div>Cardinality: {Math.round((suggestion.scoreDetails.cardinalityScore ?? 0) * 100)}%</div>
                                              </div>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1">
                                        <div className="flex flex-wrap gap-1">
                                          {suggestion.columns.map((col) => (
                                            <Badge key={col} variant="outline" className="text-xs">
                                              {col}
                                            </Badge>
                                          ))}
                                        </div>
                                        {/* Color legend / pills showing assigned colors for each series */}
                                        <div className="flex items-center gap-2 mt-2">
                                          {(() => {
                                            const colorsForSuggestion = (palette && palette.length > 0 ? palette : fallbackPalette);
                                            const assignedColors = suggestion.columns.map((_, i) => colorsForSuggestion[i % colorsForSuggestion.length]);
                                            return assignedColors.map((colColor, idx) => (
                                              <Tooltip key={idx}>
                                                <TooltipTrigger asChild>
                                                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colColor, border: '1px solid rgba(0,0,0,0.06)' }} />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" align="center">
                                                  <div className="text-xs">{suggestion.columns[idx]} — {colColor}</div>
                                                </TooltipContent>
                                              </Tooltip>
                                            ));
                                          })()}
                                        </div>
                                      </div>

                                      {/* Preview thumbnail (lightweight) */}
                                      <div className="w-[160px] h-[90px] border rounded overflow-hidden flex items-center justify-center bg-white">
                                        {suggestion.previewData && suggestion.previewData.length > 0 ? (
                                          <SmallChartPreview
                                            type={suggestion.type}
                                            data={suggestion.previewData}
                                            width={160}
                                            height={90}
                                            color={palette && palette.length > 0 ? palette[0] : '#3b82f6'}
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No preview</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => handleGenerateSingleChart(suggestion)}
                                  variant="outline"
                                >
                                  Add
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {suggestions.length > 6 && (
                          <div className="flex justify-center mt-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowAllSuggestions(v => !v)}>
                              {showAllSuggestions ? 'Show fewer' : `Show all (${suggestions.length})`}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChartSense;
