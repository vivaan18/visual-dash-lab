import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings, BarChart2, Palette, Move } from "lucide-react";
import type { DashboardComponent, SeriesType, Series } from "@/types/dashboard";
import { generateSampleDataForChartType } from '@/lib/chartPreviewData';

interface PropertiesPanelProps {
  selectedComponent: DashboardComponent | null;
  onUpdateComponent: (id: string, updates: Partial<DashboardComponent>) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
}

const TABS = [
  { id: "general", icon: <Settings className="h-4 w-4" />, label: "General" },
  { id: "chart", icon: <BarChart2 className="h-4 w-4" />, label: "Chart" },
  { id: "data", icon: <BarChart2 className="h-4 w-4" />, label: "Data" },
  { id: "style", icon: <Palette className="h-4 w-4" />, label: "Style" },
  { id: "position", icon: <Move className="h-4 w-4" />, label: "Position" },
];

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedComponent,
  onUpdateComponent,
  onBringToFront,
  onSendToBack,
}) => {
  const [activeTab, setActiveTab] = useState<string>("general");

  if (!selectedComponent)
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        No component selected
      </div>
    );

  const updateProperty = (key: string, value: any) => {
    if (!selectedComponent) return;
    // Debugging aid: log property updates coming from the UI
    console.debug('[PropertiesPanel] updateProperty', { id: selectedComponent.id, key, value });
    // Create new properties object and apply intelligent defaults for charts
    const newProps: any = { ...selectedComponent.properties, [key]: value };
    const chartLike = typeof selectedComponent.type === 'string' && (
      selectedComponent.type.includes('chart') || ['multi-bar','multi-line','combo-chart','stacked-bar','stacked-area','stacked-column','bar-chart','column-chart','line-chart','area-chart','pie-chart','donut-chart','scatter-chart'].includes(selectedComponent.type as string)
    );
    // If user sets a title on a chart and showTitle isn't explicitly set, enable it.
    if (key === 'title' && value && chartLike && (newProps.showTitle === undefined || newProps.showTitle === false)) {
      newProps.showTitle = true;
    }

    onUpdateComponent(selectedComponent.id, {
      properties: newProps,
    });
  };

  // Derive series information (keys + names) from explicit series, data, or sample data
  const deriveSeriesInfo = () => {
    const seriesDefs: any[] = Array.isArray(selectedComponent.properties.series) ? selectedComponent.properties.series : [];
    let seriesKeys: string[] = [];
    let seriesNames: string[] = [];

    if (seriesDefs.length) {
      seriesKeys = seriesDefs.map((s, i) => s.dataKey || `value${i + 1}`);
      seriesNames = seriesDefs.map((s, i) => s.name || `Series ${i + 1}`);
    } else {
      const dataArr: any[] = Array.isArray(selectedComponent.properties.data) && selectedComponent.properties.data.length ? selectedComponent.properties.data : [];
      const sampleSource = dataArr.length ? dataArr : generateSampleDataForChartType(selectedComponent.type as string, 3);
      const first = sampleSource && sampleSource.length ? sampleSource[0] : {};
      const numericKeys = Object.keys(first).filter(k => k !== 'name' && k !== 'label' && k !== 'x' && k !== 'y' && !isNaN(Number(first[k])));
      if (numericKeys.length) {
        seriesKeys = numericKeys;
        seriesNames = numericKeys.map((k, i) => `Series ${i + 1}`);
      } else {
        seriesKeys = (selectedComponent.type === 'combo-chart') ? ['value','value2','value3'] : ['value','value2'];
        seriesNames = seriesKeys.map((k, i) => `Series ${i + 1}`);
      }
    }

    return { seriesDefs, seriesKeys, seriesNames };
  };

  const { seriesDefs: derivedSeriesDefs, seriesKeys, seriesNames } = deriveSeriesInfo();

  const updatePosition = (axis: "x" | "y", value: number) => {
    onUpdateComponent(selectedComponent.id, {
      position: { ...selectedComponent.position, [axis]: value },
    });
  };

  const updateSize = (dim: "width" | "height", value: number) => {
    onUpdateComponent(selectedComponent.id, {
      size: { ...selectedComponent.size, [dim]: value },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string | ArrayBuffer | null;
      if (typeof result === 'string') updateProperty('url', result);
    };
    reader.readAsDataURL(file);
  };

  // Helper to update or create a series color by series type or index
  const updateSeriesColor = (seriesType: SeriesType, color: string, idx?: number) => {
    if (!selectedComponent) return;
    const existing: Series[] = Array.isArray(selectedComponent.properties.series) ? [...selectedComponent.properties.series] : [];
    if (typeof idx === 'number') {
      while (existing.length <= idx) {
        existing.push({ id: `s${existing.length + 1}`, name: `Series ${existing.length + 1}`, dataKey: `value${existing.length + 1}`, type: seriesType, color, yAxis: 'primary', suffix: '', decimals: 0, showLabels: false } as Series);
      }
      existing[idx] = { ...(existing[idx] || {}), color, type: seriesType } as Series;
    } else {
      const found = existing.findIndex((s: any) => s && s.type === seriesType);
      if (found >= 0) existing[found] = { ...(existing[found] || {}), color, type: seriesType } as Series;
      else existing.push({ id: `${seriesType}-1`, name: seriesType[0].toUpperCase() + seriesType.slice(1), dataKey: 'value', type: seriesType, color, yAxis: 'primary', suffix: '', decimals: 0, showLabels: false } as Series);
    }
    updateProperty('series', existing);
  };

  // Column helpers for data-table: rename, add, remove
  // Use index-based rename to avoid remounting inputs (stable keys)
  const renameColumn = (index: number, newName: string) => {
    if (!selectedComponent) return;
    const dataArr: any[] = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
    const derivedCols: string[] = dataArr.length ? Object.keys(dataArr[0]).filter(k => k !== 'id') : [];
    const cols: string[] = Array.isArray(selectedComponent.properties.columns) && selectedComponent.properties.columns.length
      ? [...selectedComponent.properties.columns]
      : derivedCols.length ? [...derivedCols] : [];

    if (index < 0 || index >= cols.length) return;
    const oldName = cols[index];
    if (oldName === newName) return;
    cols[index] = newName;

    const newData = dataArr.map((r) => {
      const nr: any = { ...r };
      if (Object.prototype.hasOwnProperty.call(nr, oldName)) {
        nr[newName] = nr[oldName];
        delete nr[oldName];
      } else {
        nr[newName] = nr[newName] ?? '';
      }
      return nr;
    });

    updateProperty('columns', cols);
    updateProperty('data', newData);
  };

  const addColumn = (colName?: string) => {
    if (!selectedComponent) return;
    const dataArr: any[] = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
    const derivedCols: string[] = dataArr.length ? Object.keys(dataArr[0]).filter(k => k !== 'id') : [];
    const cols: string[] = Array.isArray(selectedComponent.properties.columns) && selectedComponent.properties.columns.length
      ? [...selectedComponent.properties.columns]
      : derivedCols.length ? [...derivedCols] : [];

    const newCol = colName || `Column${cols.length + 1}`;
    cols.push(newCol);
    const newData = dataArr.map((r) => ({ ...(r || {}), [newCol]: '' }));
    updateProperty('columns', cols);
    updateProperty('data', newData);
  };

  const removeColumn = (colName: string) => {
    if (!selectedComponent) return;
    const dataArr: any[] = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
    const derivedCols: string[] = dataArr.length ? Object.keys(dataArr[0]).filter(k => k !== 'id') : [];
    let cols: string[] = Array.isArray(selectedComponent.properties.columns) && selectedComponent.properties.columns.length
      ? [...selectedComponent.properties.columns]
      : derivedCols.length ? [...derivedCols] : [];

    cols = cols.filter((c) => c !== colName);
    const newData = dataArr.map((r) => {
      const nr: any = { ...r };
      delete nr[colName];
      return nr;
    });
    updateProperty('columns', cols);
    updateProperty('data', newData);
  };

  const TabButton = ({ id, icon, label }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg mb-1 transition ${
        activeTab === id
          ? "bg-primary text-white"
          : "hover:bg-muted text-gray-700 dark:text-gray-300"
      }`}
      disabled={
        // Disable tab buttons that are not relevant for this component type
        !getTabsForType(selectedComponent.type).some((t) => t.id === id)
      }
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  // Return the list of tabs appropriate for the given component type
  const getTabsForType = (type: DashboardComponent['type']) => {
    // Default full set for charts and generic components
    const full = TABS;
    if (type === 'image') return full.filter(t => ['general','position'].includes(t.id));
    if (type === 'text') return full.filter(t => ['general','style','position'].includes(t.id));
    // Ensure table/data-table also get Data tab
    if (type === 'data-table' || type === 'table') return full;
    // Only chart-like components get the Data tab
    const isChartLike = typeof type === 'string' && (type.includes('chart') || ['multi-bar','multi-line','combo-chart','stacked-bar','stacked-area','stacked-column'].includes(type));
    if (!isChartLike) return full.filter(t => t.id !== 'data');
    return full;
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* Sidebar (tabs column) */}
      <div className="w-28 min-w-[7rem] flex-shrink-0 p-2 border-r border-border bg-muted/30">
        {getTabsForType(selectedComponent.type).map((tab) => (
          <TabButton key={tab.id} {...tab} />
        ))}
      </div>

      {/* Scrollable Content (sub-properties) */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-auto px-4 py-4 space-y-4">
        {/* ------------------- GENERAL TAB ------------------- */}
        {activeTab === "general" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Basic Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={selectedComponent.properties.title || ""}
                  onChange={(e) => updateProperty("title", e.target.value)}
                />
              </div>
              {/* KPI-specific quick edits */}
              {selectedComponent.type === 'kpi-card' && (
                <div className="pt-3 space-y-2">
                  <Label htmlFor="kpi-label">KPI Label</Label>
                  <Input
                    id="kpi-label"
                    value={selectedComponent.properties.kpiLabel || ''}
                    onChange={(e) => updateProperty('kpiLabel', e.target.value)}
                  />

                  <Label htmlFor="kpi-value">Value</Label>
                  <Input
                    id="kpi-value"
                    type="number"
                    value={selectedComponent.properties.value ?? ''}
                    onChange={(e) => updateProperty('value', e.target.value === '' ? undefined : Number(e.target.value))}
                  />

                  <Label htmlFor="target-value">Target Value</Label>
                  <Input
                    id="target-value"
                    type="number"
                    value={selectedComponent.properties.targetValue ?? ''}
                    onChange={(e) => updateProperty('targetValue', e.target.value === '' ? undefined : Number(e.target.value))}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="targetColor">Target Value Color</Label>
                      <Input
                        id="targetColor"
                        type="color"
                        value={selectedComponent.properties.targetColor || '#10b981'}
                        onChange={(e) => updateProperty('targetColor', e.target.value)}
                        className="w-16 h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="trendColor">Trend Color</Label>
                      <Input
                        id="trendColor"
                        type="color"
                        value={selectedComponent.properties.trendColor || '#06b6d4'}
                        onChange={(e) => updateProperty('trendColor', e.target.value)}
                        className="w-16 h-8"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-trend">Show Trend</Label>
                    <Switch
                      id="show-trend"
                      checked={selectedComponent.properties.showTrend || false}
                      onCheckedChange={(c) => updateProperty('showTrend', c)}
                    />
                  </div>
                </div>
              )}
              {/* Text element content editor */}
              {selectedComponent.type === 'text' && (
                <div className="pt-3">
                  <Label htmlFor="textContent">Text Content (HTML allowed)</Label>
                  <Textarea
                    id="textContent"
                    value={selectedComponent.properties.text || ''}
                    onChange={(e) => updateProperty('text', e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
              )}

              {/* Image element URL / upload */}
              {selectedComponent.type === 'image' && (
                <div className="pt-3 space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={selectedComponent.properties.url || ''}
                    onChange={(e) => updateProperty('url', e.target.value)}
                  />
                  <div>
                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button asChild>
                      <label htmlFor="image-upload" className="cursor-pointer">Upload Image</label>
                    </Button>
                  </div>
                </div>
              )}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBringToFront(selectedComponent.id)}
                >
                  Bring Front
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendToBack(selectedComponent.id)}
                >
                  Send Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ------------------- DATA TAB ------------------- */}
        {activeTab === "data" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data Points editor (supports cartesian and scatter) */}
              <div>
                <Label>Data Points</Label>
                <div className="mt-2 space-y-2">
                  {/* For combo/multi charts we show fixed series color pickers instead of per-point colors */}
                  {(['combo-chart','multi-line','multi-bar','multi-area','stacked-bar','stacked-area','stacked-column'] as string[]).includes(selectedComponent.type as string) ? (
                    <div className="space-y-2">
                      {selectedComponent.type === 'combo-chart' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Bar Color</Label>
                            <Input
                              type="color"
                              value={(() => {
                                const s = Array.isArray(selectedComponent.properties.series) ? selectedComponent.properties.series.find((x:any)=>x.type==='bar') : undefined;
                                return (s && s.color) || selectedComponent.properties.color || '#3b82f6';
                              })()}
                              onChange={(e)=> updateSeriesColor('bar', e.target.value)}
                              className="w-16 h-8"
                            />
                          </div>
                          <div>
                            <Label>Line Color</Label>
                            <Input
                              type="color"
                              value={(() => {
                                const s = Array.isArray(selectedComponent.properties.series) ? selectedComponent.properties.series.find((x:any)=>x.type==='line') : undefined;
                                return (s && s.color) || '#06b6d4';
                              })()}
                              onChange={(e)=> updateSeriesColor('line', e.target.value)}
                              className="w-16 h-8"
                            />
                          </div>
                          <div>
                            <Label>Area Color</Label>
                            <Input
                              type="color"
                              value={(() => {
                                const s = Array.isArray(selectedComponent.properties.series) ? selectedComponent.properties.series.find((x:any)=>x.type==='area') : undefined;
                                return (s && s.color) || '#f97316';
                              })()}
                              onChange={(e)=> updateSeriesColor('area', e.target.value)}
                              className="w-16 h-8"
                            />
                          </div>
                        </div>
                      )}

                      {selectedComponent.type === 'multi-line' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Line 1 Color</Label>
                            <Input
                              type="color"
                              value={(() => (Array.isArray(selectedComponent.properties.series) && selectedComponent.properties.series[0]?.color) || '#3b82f6')()}
                              onChange={(e)=> updateSeriesColor('line', e.target.value, 0)}
                              className="w-16 h-8"
                            />
                          </div>
                          <div>
                            <Label>Line 2 Color</Label>
                            <Input
                              type="color"
                              value={(() => (Array.isArray(selectedComponent.properties.series) && selectedComponent.properties.series[1]?.color) || '#10b981')()}
                              onChange={(e)=> updateSeriesColor('line', e.target.value, 1)}
                              className="w-16 h-8"
                            />
                          </div>
                        </div>
                      )}

                      {selectedComponent.type === 'multi-bar' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Bar 1 Color</Label>
                            <Input
                              type="color"
                              value={(() => (Array.isArray(selectedComponent.properties.series) && selectedComponent.properties.series[0]?.color) || '#3b82f6')()}
                              onChange={(e)=> updateSeriesColor('bar', e.target.value, 0)}
                              className="w-16 h-8"
                            />
                          </div>
                          <div>
                            <Label>Bar 2 Color</Label>
                            <Input
                              type="color"
                              value={(() => (Array.isArray(selectedComponent.properties.series) && selectedComponent.properties.series[1]?.color) || '#10b981')()}
                              onChange={(e)=> updateSeriesColor('bar', e.target.value, 1)}
                              className="w-16 h-8"
                            />
                          </div>
                        </div>
                      )}

                      {selectedComponent.type === 'multi-area' && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Area 1 Color</Label>
                            <Input
                              type="color"
                              value={(() => (Array.isArray(selectedComponent.properties.series) && selectedComponent.properties.series[0]?.color) || '#3b82f6')()}
                              onChange={(e)=> updateSeriesColor('area', e.target.value, 0)}
                              className="w-16 h-8"
                            />
                          </div>
                          <div>
                            <Label>Area 2 Color</Label>
                            <Input
                              type="color"
                              value={(() => (Array.isArray(selectedComponent.properties.series) && selectedComponent.properties.series[1]?.color) || '#10b981')()}
                              onChange={(e)=> updateSeriesColor('area', e.target.value, 1)}
                              className="w-16 h-8"
                            />
                          </div>
                        </div>
                      )}
                      {(['stacked-bar','stacked-area','stacked-column'] as string[]).includes(selectedComponent.type as string) && (
                        <div className="grid grid-cols-2 gap-2">
                          {seriesKeys.map((k, idx) => (
                            <div key={k}>
                              <Label>Series {idx + 1} Color</Label>
                              <Input
                                type="color"
                                value={(Array.isArray(selectedComponent.properties.series) && selectedComponent.properties.series[idx]?.color) || (idx === 0 ? '#3b82f6' : '#10b981')}
                                onChange={(e) => updateSeriesColor(selectedComponent.type.includes('area') ? 'area' : 'bar', e.target.value, idx)}
                                className="w-16 h-8"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="perBarColors"
                          checked={selectedComponent.properties.perBarColors || false}
                          onCheckedChange={(c) => updateProperty('perBarColors', c)}
                        />
                        <Label htmlFor="perBarColors">Per-point Colors</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label>Uniform Color</Label>
                        <Input
                          id="uniformColor"
                          type="color"
                          aria-label="Uniform Color"
                          value={selectedComponent.properties.color || '#3b82f6'}
                          onChange={(e) => updateProperty('color', e.target.value)}
                          className="w-10 h-8 z-10"
                          style={{ position: 'relative', pointerEvents: 'auto' }}
                        />
                      </div>
                    </div>
                  )}

                    {(() => {
                    const isScatter = (selectedComponent.type || '').toString().includes('scatter');
                    const multiLikeTypes = ['combo-chart','multi-line','multi-bar','multi-area','stacked-bar','stacked-area','stacked-column'];
                    const isMultiSeries = multiLikeTypes.includes(selectedComponent.type as string);
                    const isTable = (selectedComponent.type === 'data-table' || selectedComponent.type === 'table');
                    const dataArr: any[] = Array.isArray(selectedComponent.properties.data) && selectedComponent.properties.data.length ? selectedComponent.properties.data : [];

                    // Table-specific rendering: show editable cells per column
                    if (isTable) {
                      const cols = (Array.isArray(selectedComponent.properties.columns) && selectedComponent.properties.columns.length)
                        ? selectedComponent.properties.columns
                        : (dataArr.length ? Object.keys(dataArr[0]).filter(k => k !== 'id') : ['Column1','Column2']);

                      return (
                        <div className="w-full">
                          {/* Column editor */}
                          <div className="mb-2 flex items-center space-x-2 flex-wrap">
                            {cols.map((col, ci) => (
                              <div key={`col-${ci}`} className="flex items-center space-x-1">
                                <Input
                                  value={col}
                                  onChange={(e) => renameColumn(ci, e.target.value)}
                                  className="w-40"
                                />
                                <Button size="sm" variant="ghost" onClick={() => removeColumn(col)} title={`Remove ${col}`}>
                                  Remove
                                </Button>
                              </div>
                            ))}
                            <Button size="sm" onClick={() => addColumn()}>Add Column</Button>
                          </div>

                          {/* Rows */}
                          {dataArr.map((row: any, ri: number) => (
                            <div key={ri} className="flex items-center space-x-2 flex-wrap w-full">
                              {cols.map((col, ci) => (
                                <Input
                                  key={`row-${ri}-col-${ci}`}
                                  value={row[col] ?? ''}
                                  onChange={(e) => {
                                    const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
                                    arr[ri] = { ...(arr[ri] || {}), [col]: e.target.value };
                                    updateProperty('data', arr);
                                    // ensure columns are stored when user edits first row
                                    if (!selectedComponent.properties.columns || !selectedComponent.properties.columns.length) {
                                      const derived = Object.keys(arr[ri] || {}).filter(k => k !== 'id');
                                      if (derived.length) updateProperty('columns', derived);
                                    }
                                  }}
                                  placeholder={col}
                                  className="flex-1 min-w-[120px]"
                                />
                              ))}
                              <Button size="sm" variant="ghost" onClick={() => {
                                const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
                                arr.splice(ri,1);
                                updateProperty('data', arr);
                              }}>Remove</Button>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    // Use pre-derived series info from deriveSeriesInfo()
                    // `seriesKeys` and `seriesNames` are available from the helper above

                    return dataArr.map((row: any, ri: number) => (
                      <div key={ri} className="flex items-center space-x-2 flex-wrap">
                        {isScatter ? (
                          <>
                            <Input
                              value={row.label || ''}
                              onChange={(e) => {
                                const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
                                arr[ri] = { ...(arr[ri] || {}), label: e.target.value };
                                updateProperty('data', arr);
                              }}
                              placeholder="Label"
                              className="flex-1 min-w-0"
                            />
                            <Input
                              type="number"
                              value={row.x ?? 0}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
                                arr[ri] = { ...(arr[ri] || {}), x: val };
                                updateProperty('data', arr);
                              }}
                              className="w-24"
                              placeholder="x"
                            />
                            <Input
                              type="number"
                              value={row.y ?? 0}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
                                arr[ri] = { ...(arr[ri] || {}), y: val };
                                updateProperty('data', arr);
                              }}
                              className="w-24"
                              placeholder="y"
                            />
                            {/* per-point color for scatter when enabled */}
                            {selectedComponent.properties.perBarColors && (
                              <Input
                                type="color"
                                value={row.fill || row.color || '#3b82f6'}
                                onChange={(e) => {
                                  const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
                                  arr[ri] = { ...(arr[ri] || {}), fill: e.target.value };
                                  updateProperty('data', arr);
                                }}
                                className="w-16 h-8"
                              />
                            )}
                          </>
                        ) : isMultiSeries ? (
                          <>
                            <Input
                              value={row.name || row.period || ''}
                              onChange={(e) => {
                                const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
                                arr[ri] = { ...(arr[ri] || {}), name: e.target.value };
                                updateProperty('data', arr);
                              }}
                              placeholder="Period"
                              className="flex-1 min-w-0"
                            />
                            {seriesKeys.map((k, si) => (
                              <div key={k} className="flex items-center space-x-1">
                                <Input
                                  type="number"
                                  value={row[k] ?? 0}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : Number(e.target.value);
                                    const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
                                    arr[ri] = { ...(arr[ri] || {}), [k]: val };
                                    updateProperty('data', arr);
                                  }}
                                  className="w-24"
                                  aria-label={seriesNames[si]}
                                />
                                {/* per-point color for multi-series is ambiguous; skip */}
                              </div>
                            ))}
                          </>
                        ) : (
                          <>
                            <Input
                              value={row.name || ''}
                              onChange={(e) => {
                                const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
                                arr[ri] = { ...(arr[ri] || {}), name: e.target.value };
                                updateProperty('data', arr);
                              }}
                              className="flex-1 min-w-0"
                            />
                            <Input
                              type="number"
                              value={row.value ?? 0}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
                                arr[ri] = { ...(arr[ri] || {}), value: val };
                                updateProperty('data', arr);
                              }}
                              className="w-24"
                            />
                            {/* per-point color for single-series / pie / donut when enabled */}
                            {selectedComponent.properties.perBarColors && (
                              <Input
                                type="color"
                                value={row.fill || row.color || '#3b82f6'}
                                onChange={(e) => {
                                  const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
                                  arr[ri] = { ...(arr[ri] || {}), fill: e.target.value };
                                  updateProperty('data', arr);
                                }}
                                className="w-16 h-8"
                              />
                            )}
                          </>
                        )}

                        <Button size="sm" variant="ghost" onClick={() => {
                          const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];
                          arr.splice(ri,1);
                          updateProperty('data', arr);
                        }}>Remove</Button>
                      </div>
                    ));
                  })()}

                    <div className="flex space-x-2">
                    <Button size="sm" onClick={() => {
                      const isScatter = (selectedComponent.type || '').toString().includes('scatter');
                      const isMultiSeries = (['combo-chart','multi-line','multi-bar','multi-area','stacked-bar','stacked-area','stacked-column'] as string[]).includes(selectedComponent.type as string);
                      const isTable = (selectedComponent.type === 'data-table' || selectedComponent.type === 'table');
                      const arr = Array.isArray(selectedComponent.properties.data) ? [...selectedComponent.properties.data] : [];

                      if (isScatter) {
                        arr.push({ label: `Point ${arr.length + 1}`, x: 0, y: 0 });
                      } else if (isTable) {
                        const cols = arr.length ? Object.keys(arr[0]).filter(k => k !== 'id') : (selectedComponent.properties.columns || ['Column1','Column2']);
                        const row: any = {};
                        cols.forEach((c:any) => row[c] = '');
                        arr.push(row);
                        // ensure columns are stored
                        if (!selectedComponent.properties.columns || !selectedComponent.properties.columns.length) updateProperty('columns', cols);
                      } else if (isMultiSeries) {
                        // use derived seriesKeys so stacked types align with chart renderer
                        const keys = seriesKeys && seriesKeys.length ? seriesKeys : (selectedComponent.type === 'combo-chart' ? ['value','value2','value3'] : ['value','value2']);
                        const row: any = { name: `Item ${arr.length + 1}` };
                        keys.forEach((k) => (row[k] = 0));
                        arr.push(row);
                      } else {
                        arr.push({ name: `Item ${arr.length + 1}`, value: 0 });
                      }

                      updateProperty('data', arr);
                    }}>Add Row</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const isScatter = (selectedComponent.type || '').toString().includes('scatter');
                      const isMultiSeries = (['combo-chart','multi-line','multi-bar','multi-area','stacked-bar','stacked-area','stacked-column'] as string[]).includes(selectedComponent.type as string);
                      const isTable = (selectedComponent.type === 'data-table' || selectedComponent.type === 'table');

                      if (isScatter) {
                        updateProperty('data', [{ label: 'P1', x: 10, y: 20 }, { label: 'P2', x: 20, y: 5 }, { label: 'P3', x: 30, y: 40 }]);
                        return;
                      }

                      if (isTable) {
                        const cols = selectedComponent.properties.columns && selectedComponent.properties.columns.length ? selectedComponent.properties.columns : ['Column1','Column2'];
                        const fallback = [
                          (() => { const r:any = {}; cols.forEach((c:any)=>r[c]='A'); return r })(),
                          (() => { const r:any = {}; cols.forEach((c:any)=>r[c]='B'); return r })(),
                          (() => { const r:any = {}; cols.forEach((c:any)=>r[c]='C'); return r })(),
                        ];
                        updateProperty('data', fallback);
                        // ensure columns stored
                        if (!selectedComponent.properties.columns || !selectedComponent.properties.columns.length) updateProperty('columns', cols);
                        return;
                      }

                      if (isMultiSeries) {
                        const keys = seriesKeys && seriesKeys.length ? seriesKeys : (selectedComponent.type === 'combo-chart' ? ['value','value2','value3'] : ['value','value2']);
                        const fallback = [
                          (() => { const r:any = { name: 'A' }; keys.forEach(k=>r[k]=10); return r })(),
                          (() => { const r:any = { name: 'B' }; keys.forEach(k=>r[k]=20); return r })(),
                          (() => { const r:any = { name: 'C' }; keys.forEach(k=>r[k]=30); return r })(),
                        ];
                        updateProperty('data', fallback);
                        return;
                      }

                      updateProperty('data', [{ name: 'A', value: 10 }, { name: 'B', value: 20 }, { name: 'C', value: 30 }]);
                    }}>Reset Data</Button>
                  </div>
                  <div className="text-xs text-gray-500">Edit data points here. Toggle per-point colors to set individual fills; otherwise the uniform color is used.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ------------------- CHART TAB ------------------- */}
        {activeTab === "chart" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Chart Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showGrid">Show Grid</Label>
                <Switch
                  id="showGrid"
                  checked={selectedComponent.properties.showGrid !== false}
                  onCheckedChange={(c) => updateProperty("showGrid", c)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showLegend">Show Legend</Label>
                <Switch
                  id="showLegend"
                  checked={selectedComponent.properties.showLegend !== false}
                  onCheckedChange={(c) => updateProperty("showLegend", c)}
                />
              </div>

              {/* Universal Show Values for most chart types */}
              {[
                'bar-chart','column-chart','line-chart','area-chart','multi-bar','multi-line','multi-area','stacked-bar','stacked-area','stacked-column','combo-chart','scatter-chart','pie-chart','donut-chart'
              ].includes(selectedComponent.type as string) && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="showValues">Show Values</Label>
                  <Switch
                    id="showValues"
                    checked={selectedComponent.properties.showValues || false}
                    onCheckedChange={(c) => updateProperty('showValues', c)}
                  />
                </div>
              )}

              {/* Data Table specific settings */}
              {(selectedComponent.type === 'data-table' || selectedComponent.type === 'table') && (
                <div className="border-t pt-3 mt-3">
                  <Label>Table Settings</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showHeader">Show Header</Label>
                      <Switch id="showHeader" checked={selectedComponent.properties.showHeader !== false} onCheckedChange={(c) => updateProperty('showHeader', c)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="striped">Striped Rows</Label>
                      <Switch id="striped" checked={selectedComponent.properties.striped || false} onCheckedChange={(c) => updateProperty('striped', c)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sortable">Sortable</Label>
                      <Switch id="sortable" checked={selectedComponent.properties.sortable || false} onCheckedChange={(c) => updateProperty('sortable', c)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="filterable">Filterable</Label>
                      <Switch id="filterable" checked={selectedComponent.properties.filterable || false} onCheckedChange={(c) => updateProperty('filterable', c)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pagination">Pagination</Label>
                      <Switch id="pagination" checked={selectedComponent.properties.pagination || false} onCheckedChange={(c) => updateProperty('pagination', c)} />
                    </div>
                    {selectedComponent.properties.pagination && (
                      <div>
                        <Label htmlFor="pageSize">Rows Per Page</Label>
                        <Input id="pageSize" type="number" value={selectedComponent.properties.pageSize ?? 10} onChange={(e) => updateProperty('pageSize', e.target.value === '' ? undefined : Number(e.target.value))} />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showRowNumbers">Show Row Numbers</Label>
                      <Switch id="showRowNumbers" checked={selectedComponent.properties.showRowNumbers || false} onCheckedChange={(c) => updateProperty('showRowNumbers', c)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="compact">Compact</Label>
                      <Switch id="compact" checked={selectedComponent.properties.compact || false} onCheckedChange={(c) => updateProperty('compact', c)} />
                    </div>
                    <div>
                      <Label htmlFor="rowsPerPageOptions">Rows Per Page Options (comma separated)</Label>
                      <Input
                        id="rowsPerPageOptions"
                        value={(Array.isArray(selectedComponent.properties.rowsPerPageOptions) ? selectedComponent.properties.rowsPerPageOptions.join(',') : selectedComponent.properties.rowsPerPageOptions) || '10,20,50'}
                        onChange={(e) => {
                          const parts = e.target.value.split(',').map((s: any) => Number(s.trim()));
                          const parsed = parts.filter((n: any) => !isNaN(n));
                          updateProperty('rowsPerPageOptions', parsed);
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">These settings control how the data table displays rows, paging, and interactivity.</div>
                  </div>
                </div>
              )}

              {['line-chart','multi-line','combo-chart'].includes(selectedComponent.type as string) && (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showLines">Show Lines</Label>
                    <Switch
                      id="showLines"
                      checked={selectedComponent.properties.showLines !== false}
                      onCheckedChange={(c) => updateProperty("showLines", c)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showDots">Show Dots</Label>
                    <Switch
                      id="showDots"
                      checked={selectedComponent.properties.showDots !== false}
                      onCheckedChange={(c) => updateProperty("showDots", c)}
                    />
                  </div>
                </>
              )}

              {/* Axis Labels */}
              <div>
                <Label htmlFor="xAxisLabel">X-Axis Label</Label>
                <Input
                  id="xAxisLabel"
                  value={selectedComponent.properties.xAxisLabel || ""}
                  onChange={(e) =>
                    updateProperty("xAxisLabel", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="yAxisLabel">Y-Axis Label</Label>
                <Input
                  id="yAxisLabel"
                  value={selectedComponent.properties.yAxisLabel || ""}
                  onChange={(e) =>
                    updateProperty("yAxisLabel", e.target.value)
                  }
                />
              </div>

              {/* Axis Customization */}
              <div className="border-t pt-3 mt-3">
                <Label>Axis Customization</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Show Axis Lines</Label>
                    <Switch
                      checked={selectedComponent.properties.showAxisLines !== false}
                      onCheckedChange={(c) => updateProperty("showAxisLines", c)}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <Label>Show Tick Lines</Label>
                    <Switch
                      checked={selectedComponent.properties.showTickLines !== false}
                      onCheckedChange={(c) => updateProperty("showTickLines", c)}
                    />
                  </div>
                  <div className="mt-2">
                    <Label htmlFor="slantXAxisLabels">Slant X-Axis Labels</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Switch
                        id="slantXAxisLabels"
                        checked={selectedComponent.properties.slantXAxisLabels || false}
                        onCheckedChange={(c) => updateProperty("slantXAxisLabels", c)}
                      />
                      <div className="text-xs text-gray-500">Quick -45° slant for crowded labels</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Label htmlFor="xAxisAngle">X-Axis Angle (degrees)</Label>
                    <Input
                      id="xAxisAngle"
                      type="number"
                      value={selectedComponent.properties.xAxisAngle ?? 0}
                      onChange={(e) => updateProperty("xAxisAngle", e.target.value === '' ? undefined : Number(e.target.value))}
                    />
                    <div className="text-xs text-gray-500 mt-1">Use positive for upward slant, negative for downward (e.g. -45)</div>
                  </div>
                  {/* Margin controls for cartesian charts */}
                  {[
                    'bar-chart',
                    'column-chart',
                    'line-chart',
                    'area-chart',
                    'multi-bar',
                    'multi-line',
                    'multi-area',
                    'stacked-bar',
                    'stacked-area',
                    'stacked-column',
                    'scatter-chart',
                    'combo-chart',
                  ].includes(selectedComponent.type) && (
                    <div className="border-t pt-3 mt-3">
                      <Label>Chart Margins (px)</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <Label htmlFor="marginTop">Top</Label>
                          <Input
                            id="marginTop"
                            type="number"
                            value={selectedComponent.properties.marginTop ?? ''}
                            onChange={(e) => updateProperty('marginTop', e.target.value === '' ? undefined : Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="marginBottom">Bottom</Label>
                          <Input
                            id="marginBottom"
                            type="number"
                            value={selectedComponent.properties.marginBottom ?? ''}
                            onChange={(e) => updateProperty('marginBottom', e.target.value === '' ? undefined : Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="marginLeft">Left</Label>
                          <Input
                            id="marginLeft"
                            type="number"
                            value={selectedComponent.properties.marginLeft ?? ''}
                            onChange={(e) => updateProperty('marginLeft', e.target.value === '' ? undefined : Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="marginRight">Right</Label>
                          <Input
                            id="marginRight"
                            type="number"
                            value={selectedComponent.properties.marginRight ?? ''}
                            onChange={(e) => updateProperty('marginRight', e.target.value === '' ? undefined : Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">Adjust margins to avoid clipping axes, labels, or legends. Changes apply immediately.</div>
                  
                  {/* Container padding and Y-axis width controls to reduce left whitespace */}
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <Label htmlFor="containerPadding">Container Padding (px)</Label>
                      <Input
                        id="containerPadding"
                        type="number"
                        value={selectedComponent.properties.containerPadding ?? ''}
                        onChange={(e) => updateProperty('containerPadding', e.target.value === '' ? undefined : Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="yAxisWidth">Y-Axis Width (px)</Label>
                      <Input
                        id="yAxisWidth"
                        type="number"
                        value={selectedComponent.properties.yAxisWidth ?? ''}
                        onChange={(e) => updateProperty('yAxisWidth', e.target.value === '' ? undefined : Number(e.target.value))}
                      />
                    </div>
                  </div>
                  {/* Stacked chart controls */}
                  {(['stacked-bar','stacked-area','stacked-column'] as string[]).includes(selectedComponent.type as string) && (
                    <div className="border-t pt-3 mt-3">
                      <Label>Stacking Options</Label>
                      <div className="mt-2 space-y-2">
                        <div>
                          <Label htmlFor="stackingMode">Stacking Mode</Label>
                          <select id="stackingMode" value={selectedComponent.properties.stackingMode || 'stacked'} onChange={(e) => updateProperty('stackingMode', e.target.value)} className="w-full p-1 border rounded">
                            <option value="none">None</option>
                            <option value="stacked">Stacked</option>
                            <option value="percent">Percent</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="orientation">Orientation</Label>
                          <select id="orientation" value={selectedComponent.properties.orientation || 'vertical'} onChange={(e) => updateProperty('orientation', e.target.value)} className="w-full p-1 border rounded">
                            <option value="vertical">Vertical</option>
                            <option value="horizontal">Horizontal</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="barPadding">Bar Padding (0-1)</Label>
                            <Input id="barPadding" type="number" step="0.05" value={selectedComponent.properties.barPadding ?? 0.2} onChange={(e) => updateProperty('barPadding', e.target.value === '' ? undefined : Number(e.target.value))} />
                          </div>
                          <div>
                            <Label htmlFor="barGap">Bar Gap (0-1)</Label>
                            <Input id="barGap" type="number" step="0.05" value={selectedComponent.properties.barGap ?? 0.1} onChange={(e) => updateProperty('barGap', e.target.value === '' ? undefined : Number(e.target.value))} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="showValues">Show Values</Label>
                          <Switch id="showValues" checked={selectedComponent.properties.showValues || false} onCheckedChange={(c) => updateProperty('showValues', c)} />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="showValuesInside">Show Values Inside</Label>
                          <Switch id="showValuesInside" checked={selectedComponent.properties.showValuesInside || false} onCheckedChange={(c) => updateProperty('showValuesInside', c)} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
                  <div>
                    <Label htmlFor="axisColor">Axis Color</Label>
                    <Input
                      id="axisColor"
                      type="color"
                      value={selectedComponent.properties.axisColor || "#6b7280"}
                      onChange={(e) => updateProperty("axisColor", e.target.value)}
                      className="w-16 h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="axisFontSize">Axis Font Size</Label>
                    <Slider
                      value={[selectedComponent.properties.axisFontSize || 12]}
                      onValueChange={(v) => updateProperty("axisFontSize", v[0])}
                      min={8}
                      max={24}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedComponent.properties.axisFontSize || 12}px
                    </div>
                  </div>
                  
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ------------------- STYLE TAB ------------------- */}
        {activeTab === "style" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Styling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Color */}
              <div>
                <Label htmlFor="color">Primary Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="color"
                    type="color"
                    value={selectedComponent.properties.color || "#3b82f6"}
                    onChange={(e) => updateProperty("color", e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={selectedComponent.properties.color || "#3b82f6"}
                    onChange={(e) => updateProperty("color", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Background */}
              <div>
                <Label htmlFor="backgroundColor">Background</Label>
                <div className="flex space-x-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={
                      selectedComponent.properties.backgroundColor || "#ffffff"
                    }
                    onChange={(e) =>
                      updateProperty("backgroundColor", e.target.value)
                    }
                    className="w-16 h-10"
                  />
                  <Input
                    value={
                      selectedComponent.properties.backgroundColor || "#ffffff"
                    }
                    onChange={(e) =>
                      updateProperty("backgroundColor", e.target.value)
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Title Color & Size */}
              <div className="border-t pt-3 mt-3">
                <Label>Title Style</Label>
                <div className="mt-2 space-y-2">
                  <div>
                    <Label htmlFor="titleColor">Title Color</Label>
                    <Input
                      id="titleColor"
                      type="color"
                      value={selectedComponent.properties.titleColor || "#000000"}
                      onChange={(e) =>
                        updateProperty("titleColor", e.target.value)
                      }
                      className="w-16 h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="titleFontSize">Title Font Size</Label>
                    <Slider
                      value={[selectedComponent.properties.titleFontSize || 18]}
                      onValueChange={(v) =>
                        updateProperty("titleFontSize", v[0])
                      }
                      min={10}
                      max={36}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedComponent.properties.titleFontSize || 18}px
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Color & Size */}
              <div className="border-t pt-3 mt-3">
                <Label>Value Style</Label>
                <div className="mt-2 space-y-2">
                  <div>
                    <Label htmlFor="valueColor">Value Color</Label>
                    <Input
                      id="valueColor"
                      type="color"
                      value={selectedComponent.properties.valueColor || "#374151"}
                      onChange={(e) =>
                        updateProperty("valueColor", e.target.value)
                      }
                      className="w-16 h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="valueFontSize">Value Font Size</Label>
                    <Slider
                      value={[selectedComponent.properties.valueFontSize || 12]}
                      onValueChange={(v) =>
                        updateProperty("valueFontSize", v[0])
                      }
                      min={8}
                      max={24}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedComponent.properties.valueFontSize || 12}px
                    </div>
                  </div>
                </div>
              </div>

              {/* Text styling for text elements */}
              {selectedComponent.type === 'text' && (
                <div className="border-t pt-3 mt-3">
                  <Label>Text Style</Label>
                  <div className="mt-2 space-y-2">
                    <div>
                      <Label htmlFor="textColor">Text Color</Label>
                      <Input
                        id="textColor"
                        type="color"
                        value={selectedComponent.properties.textColor || '#111827'}
                        onChange={(e) => updateProperty('textColor', e.target.value)}
                        className="w-16 h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="textFontSize">Font Size</Label>
                      <Slider
                        value={[selectedComponent.properties.textFontSize || 14]}
                        onValueChange={(v) => updateProperty('textFontSize', v[0])}
                        min={8}
                        max={48}
                      />
                      <div className="text-xs text-gray-500 mt-1">{selectedComponent.properties.textFontSize || 14}px</div>
                    </div>
                    <div>
                      <Label htmlFor="textAlign">Alignment</Label>
                      <select
                        id="textAlign"
                        value={selectedComponent.properties.textAlign || 'left'}
                        onChange={(e) => updateProperty('textAlign', e.target.value)}
                        className="w-full p-1 border rounded"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="textBold"
                        checked={selectedComponent.properties.textBold || false}
                        onCheckedChange={(c) => updateProperty('textBold', c)}
                      />
                      <Label htmlFor="textBold">Bold</Label>
                      <Switch
                        id="textItalic"
                        checked={selectedComponent.properties.textItalic || false}
                        onCheckedChange={(c) => updateProperty('textItalic', c)}
                      />
                      <Label htmlFor="textItalic">Italic</Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Image styling for image elements */}
              {selectedComponent.type === 'image' && (
                <div className="border-t pt-3 mt-3">
                  <Label>Image</Label>
                  <div className="mt-2 space-y-2">
                    <div>
                      <Label htmlFor="imageAlt">Alt Text</Label>
                      <Input
                        id="imageAlt"
                        value={selectedComponent.properties.alt || ''}
                        onChange={(e) => updateProperty('alt', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageFit">Fit</Label>
                      <select id="imageFit" value={selectedComponent.properties.fit || 'contain'} onChange={(e) => updateProperty('fit', e.target.value)} className="w-full p-1 border rounded">
                        <option value="contain">Contain</option>
                        <option value="cover">Cover</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Border Radius */}
              <div className="border-t pt-3 mt-3">
                <Label htmlFor="borderRadius">Border Radius</Label>
                <Slider
                  value={[selectedComponent.properties.borderRadius || 8]}
                  onValueChange={(v) => updateProperty("borderRadius", v[0])}
                  min={0}
                  max={20}
                  step={1}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {selectedComponent.properties.borderRadius || 8}px
                </div>
              </div>

              {/* Shadow */}
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="shadow"
                  checked={selectedComponent.properties.shadow || false}
                  onCheckedChange={(c) => updateProperty("shadow", c)}
                />
                <Label htmlFor="shadow">Drop Shadow</Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ------------------- POSITION TAB ------------------- */}
        {activeTab === "position" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Position & Size</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="x">X</Label>
                  <Input
                    id="x"
                    type="number"
                    value={selectedComponent.position.x}
                    onChange={(e) =>
                      updatePosition("x", parseInt(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="y">Y</Label>
                  <Input
                    id="y"
                    type="number"
                    value={selectedComponent.position.y}
                    onChange={(e) =>
                      updatePosition("y", parseInt(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={selectedComponent.size.width}
                    onChange={(e) =>
                      updateSize("width", parseInt(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={selectedComponent.size.height}
                    onChange={(e) =>
                      updateSize("height", parseInt(e.target.value))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
