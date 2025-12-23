// src/components/dashboard-builder/ChartConfigDialog.tsx
import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Plus,
  Check,
  X,
} from "lucide-react";
import type { Series, DashboardComponent } from "@/types/dashboard";
import { cloneDeep } from "lodash";

// -----------------------------------------------------------------------------
// MOCK UTILITIES (Replace with actual imports where applicable)
// -----------------------------------------------------------------------------
const sanitizeText = (text: string) =>
  text?.replace(/</g, "&lt;").replace(/>/g, "&gt;") || "";
const validateChartData = (json: string) => {
  try {
    const data = JSON.parse(json);
    return Array.isArray(data) ? data : false;
  } catch (e) {
    return false;
  }
};

// -----------------------------------------------------------------------------
// Component Type Definitions
// -----------------------------------------------------------------------------
const ALL_CHART_TYPES: {
  label: string;
  value: DashboardComponent["type"];
  category: string;
}[] = [
  { label: "Bar Chart", value: "bar-chart", category: "Standard" },
  { label: "Line Chart", value: "line-chart", category: "Standard" },
  { label: "Area Chart", value: "area-chart", category: "Standard" },
  { label: "Scatter Plot", value: "scatter-chart", category: "Standard" },
  { label: "Combo Chart (Multi Type)", value: "combo-chart", category: "Multi-Series" },
  { label: "Multi-Line Chart", value: "multi-line", category: "Multi-Series" },
  { label: "Multi-Bar Chart", value: "multi-bar", category: "Multi-Series" },
  { label: "Multi-Area Chart", value: "multi-area", category: "Multi-Series" },
  { label: "Stacked Bar Chart", value: "stacked-bar", category: "Multi-Series" },
  { label: "Stacked Area Chart", value: "stacked-area", category: "Multi-Series" },
  { label: "Pie Chart", value: "pie-chart", category: "Radial" },
  { label: "Donut Chart", value: "donut-chart", category: "Radial" },
  { label: "Funnel Chart", value: "funnel-chart", category: "Radial" },
  { label: "KPI Card", value: "kpi-card", category: "Element" },
  { label: "Data Table", value: "data-table", category: "Element" },
  { label: "Text Element", value: "text", category: "Element" },
  { label: "Image Element", value: "image", category: "Element" },
  { label: "Shape (Generic)", value: "shape", category: "Element" },
  { label: "Gauge", value: "gauge", category: "Advanced" },
  { label: "Waterfall", value: "waterfall", category: "Advanced" },
  { label: "Candlestick", value: "candlestick", category: "Advanced" },
];

const chartTabTypes: DashboardComponent["type"][] = [
  "bar-chart", "column-chart", "line-chart", "area-chart",
  "pie-chart", "donut-chart", "scatter-chart", "funnel-chart",
  "combo-chart", "multi-line", "multi-bar", "multi-area",
  "stacked-bar", "stacked-area", "gauge", "waterfall", "candlestick",
];
const seriesTabTypes: DashboardComponent["type"][] = [
  "bar-chart", "column-chart", "line-chart", "area-chart",
  "scatter-chart", "combo-chart", "multi-line", "multi-bar",
  "multi-area", "stacked-bar", "stacked-area", "waterfall", "candlestick",
];
const dataTabTypes: DashboardComponent["type"][] = [
  ...chartTabTypes, "data-table", "table",
];

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------
interface ChartConfigDialogProps {
  component: DashboardComponent;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onUpdate: (updates: Partial<DashboardComponent>) => void;
}

const ChartConfigDialog: React.FC<ChartConfigDialogProps> = ({
  component,
  isOpen,
  setIsOpen,
  onUpdate,
}) => {
  const [localComponent, setLocalComponent] = useState<DashboardComponent>(() =>
    cloneDeep(component)
  );
  const [isDataValid, setIsDataValid] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (component && isOpen) {
      setLocalComponent(cloneDeep(component));
    }
  }, [component, isOpen]);

  const onLocalUpdate = useCallback(
    (updates: Partial<DashboardComponent["properties"]>) => {
      setLocalComponent((prev) => ({
        ...prev,
        properties: {
          ...prev.properties,
          ...updates,
        },
      }));
    },
    []
  );

  const handleDataChange = (json: string) => {
    const data = validateChartData(json);
    const valid = !!data;
    setIsDataValid(valid);
    onLocalUpdate({
      customDataJson: json,
      customData: valid ? data : undefined,
    });
  };

  const handleSave = () => {
    if (dataTabTypes.includes(localComponent.type) && !isDataValid) return;
    onUpdate({
      type: localComponent.type,
      properties: cloneDeep(localComponent.properties),
    });
    setIsOpen(false);
  };

  const handleSeriesUpdate = (index: number, updates: Partial<Series>) => {
    const newSeries = cloneDeep(localComponent.properties.series || []);
    if (newSeries[index]) {
      newSeries[index] = { ...newSeries[index], ...updates };
      onLocalUpdate({ series: newSeries });
    }
  };

  const handleAddSeries = () => {
    const newSeries: Series = {
      id: `manual-${Date.now()}`,
      name: `Series ${(localComponent.properties.series?.length || 0) + 1}`,
      dataKey: "Value1",
      color: "#000000",
      type: "bar",
      yAxis: "primary",
      suffix: "",
      decimals: 0,
      showLabels: false,
    };
    onLocalUpdate({
      series: [...(localComponent.properties.series || []), newSeries],
    });
  };

  const handleRemoveSeries = (index: number) => {
    const newSeries = (localComponent.properties.series || []).filter(
      (_, i) => i !== index
    );
    onLocalUpdate({ series: newSeries });
  };

  const componentType = localComponent.type;
  const isChart = chartTabTypes.includes(componentType);
  const showSeriesTab = seriesTabTypes.includes(componentType);
  const showDataTab = dataTabTypes.includes(componentType);
  const shapeComponentTypes: DashboardComponent["type"][] = [
    "shape",
    "ellipse",
    "triangle",
    "rectangle",
    "circle",
    "line",
    "arrow",
  ];
  const isShapeComponent = shapeComponentTypes.includes(componentType);

  const dialogJSX = (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Configure Component:{" "}
            {localComponent.properties.title || localComponent.type}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            {isChart && <TabsTrigger value="appearance">Chart Appearance</TabsTrigger>}
            {showSeriesTab && <TabsTrigger value="series">Data Series</TabsTrigger>}
            {showDataTab && <TabsTrigger value="data">Data Source</TabsTrigger>}
          </TabsList>

          {/* ------------------ General Tab ------------------ */}
          <TabsContent value="general" className="py-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={localComponent.properties.title || ""}
                    onChange={(e) => onLocalUpdate({ title: e.target.value })}
                  />
                  <Label htmlFor="type" className="pt-4 block">
                    Component Type
                  </Label>
                  <Select
                    value={localComponent.type}
                    onValueChange={(newType: DashboardComponent["type"]) => {
                      setLocalComponent((prev) => ({
                        ...prev,
                        type: newType,
                        properties: { ...prev.properties },
                      }));
                      setActiveTab(
                        chartTabTypes.includes(newType) ? "appearance" : "general"
                      );
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select component type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_CHART_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <Badge variant="secondary" className="mr-2">
                            {type.category}
                          </Badge>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(componentType === "text" ||
                  componentType === "image" ||
                  isShapeComponent) && (
                  <div className="space-y-2">
                    {componentType === "text" && (
                      <>
                        <Label htmlFor="text-content">
                          Content (HTML allowed)
                        </Label>
                        <Textarea
                          id="text-content"
                          value={localComponent.properties.text || ""}
                          onChange={(e) => onLocalUpdate({ text: e.target.value })}
                          rows={5}
                        />
                      </>
                    )}
                    {componentType === "image" && (
                      <>
                        <Label htmlFor="image-url">Image URL</Label>
                        <Input
                          id="image-url"
                          value={localComponent.properties.url || ""}
                          onChange={(e) => onLocalUpdate({ url: e.target.value })}
                        />
                      </>
                    )}
                    {isShapeComponent && (
                      <>
                        <Label htmlFor="shape-color">Fill Color</Label>
                        <Input
                          id="shape-color"
                          type="color"
                          value={localComponent.properties.color || "#3b82f6"}
                          onChange={(e) => onLocalUpdate({ color: e.target.value })}
                          className="w-16 h-8 p-0"
                        />
                      </>
                    )}
                  </div>
                )}

                {/* KPI specific properties */}
                {componentType === "kpi-card" && (
                  <div className="space-y-2">
                    <Label htmlFor="kpi-label">KPI Label</Label>
                    <Input
                      id="kpi-label"
                      value={localComponent.properties.kpiLabel ?? ""}
                      onChange={(e) => onLocalUpdate({ kpiLabel: e.target.value })}
                    />
                    <Label htmlFor="target-value">Target Value</Label>
                    <Input
                      id="target-value"
                      type="number"
                      value={localComponent.properties.targetValue || 0}
                      onChange={(e) =>
                        onLocalUpdate({
                          targetValue: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                    <Label htmlFor="kpi-color">Color</Label>
                    <Input
                      id="kpi-color"
                      type="color"
                      value={localComponent.properties.color || "#3b82f6"}
                      onChange={(e) => onLocalUpdate({ color: e.target.value })}
                      className="w-16 h-8 p-0"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------ Appearance Tab ------------------ */}
          {isChart && (
            <TabsContent value="appearance" className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Visual Customization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-title">Show Title</Label>
                    <Switch
                      id="show-title"
                      checked={localComponent.properties.showTitle !== false}
                      onCheckedChange={(checked) =>
                        onLocalUpdate({ showTitle: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-legend">Show Legend</Label>
                    <Switch
                      id="show-legend"
                      checked={localComponent.properties.showLegend !== false}
                      onCheckedChange={(checked) =>
                        onLocalUpdate({ showLegend: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-grid">Show Grid Lines</Label>
                    <Switch
                      id="show-grid"
                      checked={localComponent.properties.showGrid !== false}
                      onCheckedChange={(checked) =>
                        onLocalUpdate({ showGrid: checked })
                      }
                    />
                  </div>

                  {/* Animation/Zoom */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enable-zoom">Enable Zoom & Pan</Label>
                      <Switch
                        id="enable-zoom"
                        checked={localComponent.properties.enableZoom || false}
                        onCheckedChange={(checked) =>
                          onLocalUpdate({ enableZoom: checked })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Animation Duration (ms)</Label>
                    <Slider
                      value={[localComponent.properties.animationDuration || 1000]}
                      onValueChange={(value) =>
                        onLocalUpdate({ animationDuration: value[0] })
                      }
                      min={0}
                      max={3000}
                      step={100}
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {localComponent.properties.animationDuration || 1000}ms
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* ------------------ Series Tab ------------------ */}
          {showSeriesTab && (
            <TabsContent value="series" className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Series Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(localComponent.properties.series || []).map((series, i) => (
                    <div
                      key={series.id}
                      className="border p-3 rounded-md space-y-2 relative"
                    >
                      <div className="font-semibold text-sm flex items-center justify-between">
                        <span>{series.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 h-6 w-6"
                          onClick={() =>
                            handleRemoveSeries(i)
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <Label>Name</Label>
                      <Input
                        value={series.name}
                        onChange={(e) =>
                          handleSeriesUpdate(i, { name: e.target.value })
                        }
                      />
                      <Label>Data Key</Label>
                      <Input
                        value={series.dataKey}
                        onChange={(e) =>
                          handleSeriesUpdate(i, { dataKey: e.target.value })
                        }
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={handleAddSeries}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Series
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* ------------------ Data Tab ------------------ */}
          {showDataTab && (
            <TabsContent value="data" className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Data Source (JSON)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label className="flex items-center justify-between">
                    JSON Data (Array of Objects)
                    <Badge
                      variant={isDataValid ? "default" : "destructive"}
                      className="flex items-center"
                    >
                      {isDataValid ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <X className="h-3 w-3 mr-1" />
                      )}
                      {isDataValid ? "Valid" : "Invalid"}
                    </Badge>
                  </Label>
                  <Textarea
                    value={localComponent.properties.customDataJson || "[]"}
                    onChange={(e) => handleDataChange(e.target.value)}
                    rows={10}
                    className={`font-mono text-xs ${
                      isDataValid ? "" : "border-red-500"
                    }`}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={showDataTab && !isDataValid}
          >
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return createPortal(dialogJSX, document.body);
};

export default ChartConfigDialog;
