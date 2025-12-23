// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Loader2, Sparkles } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/integrations/supabase/client";

// interface AITemplateGeneratorProps {
//   open: boolean;
//   onClose: () => void;
//   onTemplateGenerated: (template: any) => void;
// }

// export function AITemplateGenerator({ open, onClose, onTemplateGenerated }: AITemplateGeneratorProps) {
//   const [templateType, setTemplateType] = useState("");
//   const [description, setDescription] = useState("");
//   const [features, setFeatures] = useState("");
//   const [isGenerating, setIsGenerating] = useState(false);
//   const { toast } = useToast();

//   const handleGenerate = async () => {
//     if (!templateType.trim()) {
//       toast({
//         title: "Template type required",
//         description: "Please enter a template type (e.g., Tax, Invoice, Dashboard)",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsGenerating(true);
//     try {
//       const { data, error } = await supabase.functions.invoke("generate-template", {
//         body: {
//           templateType: templateType.trim(),
//           description: description.trim() || "A professional dashboard template",
//           features: features.trim() || "Standard dashboard features",
//         },
//       });

//       if (error) throw error;

//       if (data?.error) {
//         throw new Error(data.error);
//       }

//       if (data?.template) {
//         toast({
//           title: "Template generated!",
//           description: `Created ${data.template.name} with ${data.template.components.length} components`,
//         });
//         onTemplateGenerated(data.template);
//         onClose();
//         resetForm();
//       }
//     } catch (error: any) {
//       console.error("Generation error:", error);
//       toast({
//         title: "Generation failed",
//         description: error.message || "Failed to generate template. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const resetForm = () => {
//     setTemplateType("");
//     setDescription("");
//     setFeatures("");
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[525px]">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Sparkles className="h-5 w-5 text-primary" />
//             AI Template Generator
//           </DialogTitle>
//           <DialogDescription>
//             Describe your template needs and let AI create it for you
//           </DialogDescription>
//         </DialogHeader>

//         <div className="grid gap-4 py-4">
//           <div className="grid gap-2">
//             <Label htmlFor="templateType">Template Type *</Label>
//             <Input
//               id="templateType"
//               placeholder="e.g., Tax, Invoice, Sales Dashboard, Analytics"
//               value={templateType}
//               onChange={(e) => setTemplateType(e.target.value)}
//               disabled={isGenerating}
//             />
//           </div>

//           <div className="grid gap-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               placeholder="Brief description of what this template should track or display..."
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               disabled={isGenerating}
//               rows={3}
//             />
//           </div>

//           <div className="grid gap-2">
//             <Label htmlFor="features">Required Features</Label>
//             <Textarea
//               id="features"
//               placeholder="List specific features, metrics, or charts you need..."
//               value={features}
//               onChange={(e) => setFeatures(e.target.value)}
//               disabled={isGenerating}
//               rows={3}
//             />
//           </div>
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={onClose} disabled={isGenerating}>
//             Cancel
//           </Button>
//           <Button onClick={handleGenerate} disabled={isGenerating}>
//             {isGenerating ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Generating...
//               </>
//             ) : (
//               <>
//                 <Sparkles className="mr-2 h-4 w-4" />
//                 Generate Template
//               </>
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { DashboardComponent } from '@/types/dashboard';
import defaultTemplates, { CHART_LAYOUTS, COMPACT_KPI_GAP, makeKpi, makeChart } from './templateGenerator';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';

/**
 * Minimal placeholder AITemplateGenerator to provide a named export and avoid importing the same module.
 * Replace this stub with the full AI generator implementation or move the full implementation to a separate file.
 */
export function AITemplateGenerator({
  open,
  onClose,
  onTemplateGenerated,
  canvasWidth,
  defaultColor,
}: {
  open: boolean;
  onClose: () => void;
  onTemplateGenerated: (template: any) => void;
  canvasWidth?: number;
  defaultColor?: string;
}) {
  const [templateType, setTemplateType] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  // AI generation options
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor || '#2563eb');
  const [paletteText, setPaletteText] = useState<string>(defaultColor ? defaultColor : '#2563eb');
  const [useServerAI, setUseServerAI] = useState<boolean>(false);

  const parsePalette = (text: string) =>
    text
      .split(/[,\s]+/) // split by comma or whitespace
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const handleGenerate = async () => {
    if (!templateType.trim()) {
      toast({ title: 'Template type required', description: 'Please enter a template type (e.g., Sales, Marketing)', variant: 'destructive' });
      return;
    }
    if (!description.trim()) {
      toast({ title: 'Description required', description: 'Please provide a brief description for the template', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
      try {
          // If user opted into server-side LLM, call the Supabase Edge Function
          if (useServerAI) {
            const { data, error } = await supabase.functions.invoke('generate-template', {
              body: { templateType: templateType.trim(), description: description.trim(), features: features.trim(), palette: paletteText }
            });

            if (error) throw error;
            if (!data?.template) throw new Error('No template returned from server AI');

            // Normalize server template colors and ensure it fits the canvas by re-layout.
            const srv = data.template as any;
            const srvComps: any[] = Array.isArray(srv.components) ? srv.components : [];

            // Resolve palette priority: user-provided palette > server-provided palette > selectedColor
            const serverPalette: string[] = (srv.aiMeta && Array.isArray(srv.aiMeta.palette)) ? srv.aiMeta.palette : [];
            const userPalette = parsePalette(paletteText).filter(Boolean);
            const colorPalette = userPalette.length ? userPalette : (serverPalette.length ? serverPalette : [selectedColor || '#2563eb']);

            // Normalize components to compact no-position format so generateCompactGridLayout can place them
            const compsNoPos: Omit<DashboardComponent, 'position' | 'zIndex'>[] = srvComps.map((c: any, i: number) => {
              const isKpi = (c.type === 'kpi-card' || c.type === 'kpi');
              const size = c.size ?? (isKpi ? { width: COMPACT_KPI_WIDTH, height: COMPACT_KPI_HEIGHT } : { width: COMPACT_CHART_WIDTH, height: COMPACT_CHART_HEIGHT });
              const title = (c.properties && (c.properties.title || c.title)) || c.title || (isKpi ? `Metric ${i+1}` : `Chart ${i+1}`);

              const assignedColor = c.properties?.color || c.color || colorPalette[i % colorPalette.length];

              const properties = {
                ...(c.properties || {}),
                title,
                // For KPI, prefer backgroundColor for the tile; for charts, set color
                ...(isKpi ? { backgroundColor: c.properties?.backgroundColor || assignedColor } : { color: c.properties?.color || assignedColor }),
              } as any;

              return {
                id: c.id || `srv_${i}`,
                type: isKpi ? 'kpi-card' : (c.type || 'bar-chart'),
                size,
                properties,
              } as Omit<DashboardComponent, 'position' | 'zIndex'>;
            });

            const optimized = generateCompactGridLayout(compsNoPos as any, (canvasWidth || window?.innerWidth || 1300));

            const adjustedTemplate = {
              id: srv.id || `ai-${Date.now()}`,
              name: srv.name || templateType || 'AI Template',
              description: srv.description || description || '',
              thumbnail: srv.thumbnail || '✨',
              components: optimized,
            } as any;
            (adjustedTemplate as any).aiMeta = { ...(srv.aiMeta || {}), palette: colorPalette };

            onTemplateGenerated(adjustedTemplate);
            toast({ title: 'Template generated', description: `Generated ${optimized.length} components (server AI)` });
            onClose();
            setIsGenerating(false);
            setTemplateType('');
            setDescription('');
            setFeatures('');
            return;
          }
        const items = features.split(/[\,\n]+/).map(s => s.trim()).filter(Boolean);
        let finalKpis: string[] = [];
        let finalCharts: string[] = [];
        if (items.length === 0) {
          const q = templateType.trim().toLowerCase();
          const match = defaultTemplates.find(t => (t.industry && String(t.industry).toLowerCase() === q) || (t.name && String(t.name).toLowerCase().includes(q)));
          if (match) {
            const kpiTitles = match.components.filter((c: any) => c.type === 'kpi-card').map((c: any) => (c.properties && (c.properties.title || c.properties.kpiLabel)) || 'Metric');
            const chartTitles = match.components.filter((c: any) => c.type !== 'kpi-card').map((c: any) => ({ type: c.type, title: (c.properties && c.properties.title) || 'Chart' }));
            finalKpis = kpiTitles.slice(0, 6).map((t: string) => t);
            finalCharts = chartTitles.slice(0, 6).map((t: any) => t.title);
          } else {
            const fallbackKpis = ['Total Revenue', 'Active Users', 'Conversion Rate', 'New Customers', 'Average Order Value', 'Churn Rate'];
            const fallbackCharts = ['Revenue Trend', 'Users Over Time', 'Sales by Region', 'Top Products', 'Conversion Funnel', 'Customer Cohort'];
            finalKpis = fallbackKpis;
            finalCharts = fallbackCharts;
          }
        } else {
          const kpiKeywords = ['kpi','total','sum','average','avg','rate','percentage','%','cash','$','count','number','score','index','ltv','revenue','profit','margin','churn','growth'];
          const chartKeywords = ['chart','by','vs','trend','over time','distribution','breakdown','comparison','trend','vs.','vs','histogram','scatter','area','bar','line','pie','donut','gauge'];

          const normalize = (s: string) => s.toLowerCase();

          const classify = (s: string): 'kpi' | 'chart' => {
            const lower = normalize(s);
            if (/\(kpi\)|\[kpi\]/i.test(s)) return 'kpi';
            if (/\(chart\)|\[chart\]/i.test(s)) return 'chart';
            for (const kw of kpiKeywords) if (lower.includes(kw)) return 'kpi';
            for (const kw of chartKeywords) if (lower.includes(kw)) return 'chart';
            if (/(\bby\b|\bvs\b|over time|trend)/.test(lower)) return 'chart';
            if (s.length < 24 && /\d|%|\$/.test(s)) return 'kpi';
            return 'chart';
          };

          const kpiItems: string[] = [];
          const chartItems: string[] = [];
          for (const it of items) {
            const cls = classify(it);
            if (cls === 'kpi') kpiItems.push(it);
            else chartItems.push(it);
          }

          const makeDefaults = (prefix: string, count: number) => Array.from({length: count}, (_, i) => `${prefix} ${i + 1}`);

          finalKpis = kpiItems.slice(0, 6);
          finalCharts = chartItems.slice(0, 6);

          if (finalKpis.length < 6) {
            const needed = 6 - finalKpis.length;
            const fromCharts = chartItems.slice(0, needed).map(s => `${s} (KPI)`);
            finalKpis.push(...fromCharts);
            if (finalKpis.length < 6) finalKpis.push(...makeDefaults('KPI', 6 - finalKpis.length));
          }

          if (finalCharts.length < 6) {
            const needed = 6 - finalCharts.length;
            const fromKpis = kpiItems.slice(0, needed).map(s => `${s} Chart`);
            finalCharts.push(...fromKpis);
            if (finalCharts.length < 6) finalCharts.push(...makeDefaults('Chart', 6 - finalCharts.length));
          }

        }

        const userPalette = parsePalette(paletteText).filter(Boolean);
        let colorPalette = userPalette.length ? userPalette : [selectedColor || '#2563eb'];
        if (!userPalette.length) {
          const q = templateType.trim().toLowerCase();
          const match = defaultTemplates.find(t => (t.industry && String(t.industry).toLowerCase() === q) || (t.name && String(t.name).toLowerCase().includes(q)));
          if (match && (match as any).components && (match as any).components.length) {
            const kp = (match as any).components.find((c: any) => c.type === 'kpi-card');
            if (kp && kp.properties && kp.properties.backgroundColor) {
              colorPalette = [kp.properties.backgroundColor, ...(colorPalette.slice(1))];
            }
          }
        }

        // Build KPI components using palette (cycle colors)
        // KPIs should display a blank label by default (user requested). Preserve the original metric name
        // in `dataKey` so it can be mapped to data later.
        const kpisRaw = finalKpis.map((origTitle, i) => {
          const value = Math.floor(Math.random() * 10000).toLocaleString();
          const visibleTitle = String(origTitle || `${templateType} Metric ${i + 1}`);
          const k = createCompactKPI(`ai_kpi_${i}`, visibleTitle, value, colorPalette[i % colorPalette.length]);
          (k.properties as any).dataKey = origTitle;
          (k.properties as any).originalLabel = origTitle;
          return k;
        });

        // Determine chart types heuristically (try to infer from the text)
        const inferChartType = (label: string) => {
          const l = label.toLowerCase();
          if (l.includes('trend') || l.includes('over time') || l.includes('growth')) return 'line-chart';
          if (l.includes('by') || l.includes('comparison') || l.includes('vs')) return 'bar-chart';
          if (l.includes('share') || l.includes('mix') || l.includes('distribution') || l.includes('breakdown')) return 'pie-chart';
          if (l.includes('gauge') || l.includes('score') || l.includes('goal')) return 'gauge';
          if (l.includes('area')) return 'area-chart';
          return 'bar-chart';
        };

        const chartsRaw = finalCharts.slice(0,6).map((label, i) => {
          const ct = inferChartType(label) as any;
          const color = colorPalette[(i + kpisRaw.length) % colorPalette.length];
          const visibleTitle = String(label || `${templateType} Chart ${i + 1}`);
          return createCompactChart(`ai_chart_${i}`, ct, visibleTitle, color, Math.floor(Math.random() * 1000));
        });

        // Combine and generate an optimized layout sized for the canvas width passed via props
        const combined = [...kpisRaw, ...chartsRaw];
  const optimized = generateCompactGridLayout(combined as any, (canvasWidth || window?.innerWidth || 1300));

        const template = {
          id: `ai-${Date.now()}`,
          name: templateType || 'AI Template',
          description: description || `AI generated template for ${templateType}`,
          thumbnail: '✨',
          components: optimized,
        };

  // Embed metadata including the color palette
  (template as any).aiMeta = { description: description || '', requiredFeatures: items, palette: colorPalette };

        onTemplateGenerated(template);
        toast({ title: 'Template generated', description: `Generated ${optimized.length} components` });
        onClose();
        // reset
        setTemplateType('');
        setDescription('');
        setFeatures('');
      } catch (err: any) {
        console.error('AI generate failed', err);
        toast({ title: 'Generation failed', description: err?.message || 'Unknown error', variant: 'destructive' });
      } finally {
        setIsGenerating(false);
      }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> AI Template Generator</DialogTitle>
        </DialogHeader>

    <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="templateType">Template Type *</Label>
            <Input id="templateType" placeholder="e.g., Sales, Marketing" value={templateType} onChange={(e) => setTemplateType(e.target.value)} disabled={isGenerating} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (important)</Label>
            <Textarea id="description" placeholder="Describe the template (this will be included)" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isGenerating} rows={3} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="features">Required Features / Metrics (comma or newline separated)</Label>
            <Textarea id="features" placeholder="e.g., Revenue, New Customers, Conversion Rate" value={features} onChange={(e) => setFeatures(e.target.value)} disabled={isGenerating} rows={3} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="accentColor">Accent Color</Label>
            <div className="flex items-center space-x-2">
              <Input id="accentColor" type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-12 h-8" />
              <Input value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} />
            </div>
            <div className="text-xs text-gray-500">This color will be used to style KPI accents and primary chart colors.</div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="palette">Palette (comma or space separated hex colors)</Label>
            <Input
              id="palette"
              value={paletteText}
              onChange={(e) => setPaletteText(e.target.value)}
            />
            <div className="flex items-center space-x-2 mt-2">
              {parsePalette(paletteText).slice(0, 8).map((c, idx) => (
                <div key={idx} className="w-8 h-8 rounded border" style={{ background: c }} title={c} />
              ))}
            </div>
            <div className="text-xs text-gray-500">Enter multiple colors to generate a palette for KPIs and charts (max 8 shown).</div>
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Use server AI (LLM)</Label>
              <div className="flex items-center space-x-2">
                <Switch checked={useServerAI} onCheckedChange={(c) => setUseServerAI(Boolean(c))} />
              </div>
            </div>
            <div className="text-xs text-gray-500">When enabled, uses the server-side LLM endpoint to generate a fully positioned template. Requires server configuration (Lovable API key).</div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>Cancel</Button>
            <div className="flex items-center space-x-2">
              <Button onClick={handleGenerate} disabled={isGenerating || !templateType.trim() || !description.trim()}>
                {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : <>Generate Template</>}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  components: DashboardComponent[];
}

// --- NEW COMPACT LAYOUT CONFIGURATION (as requested) ---
const COMPACT_CHART_WIDTH = 423;
const COMPACT_CHART_HEIGHT = 328;
const COMPACT_KPI_WIDTH = 211;
const COMPACT_KPI_HEIGHT = 107;
const MINIMAL_SPACING = 2; // Standard spacing

// --- NEW DYNAMIC LAYOUT LOGIC FOR COMPACT TEMPLATES ---

/**
 * Generates a highly compact grid layout for the new templates (KPIs: 211x107, Charts: 423x328).
 * - KPIs are arranged in a single, tight row (2px spacing, centered).
 * - Charts are arranged in a 3-column grid (2px spacing, max 6 charts, centered).
 */
const generateCompactGridLayout = (components: Omit<DashboardComponent, 'position' | 'zIndex'>[], canvasWidth: number = 1300): DashboardComponent[] => {
    
    const CHART_ITEMS_PER_ROW = 3;
    const KPI_ITEMS_PER_ROW = 10; // High number to force single row
    const VERTICAL_GAP_KPI_TO_CHART = MINIMAL_SPACING; 
    const MAX_CHART_COUNT = 6;
  const REFERENCE_VIEW_WIDTH = canvasWidth || 1300; // Use actual canvas width when available for centering

    // Split components
    const kpis = components.filter((c) => c.type === "kpi-card");
    const charts = components.filter((c) => c.type !== "kpi-card").slice(0, MAX_CHART_COUNT);

    // Helper to calculate X position for a given column index (Centered logic)
    const getXPosition = (col: number, width: number, totalItems: number, itemsPerRow: number, gap: number) => {
        
        let totalContentWidth;
        if (itemsPerRow === CHART_ITEMS_PER_ROW) {
            // For charts, we center the 3-column block
            totalContentWidth = CHART_ITEMS_PER_ROW * COMPACT_CHART_WIDTH + (CHART_ITEMS_PER_ROW - 1) * gap;
        } else {
            // For KPIs, we center the actual number of KPIs present
            totalContentWidth = totalItems * COMPACT_KPI_WIDTH + (totalItems > 0 ? (totalItems - 1) * gap : 0);
        }
        
        // Calculate start X to center the entire block
        const startX = Math.max(MINIMAL_SPACING, (REFERENCE_VIEW_WIDTH - totalContentWidth) / 2);
        
        return startX + col * (width + gap);
    };

    // --- 1. Arrange KPIs (Single Row) ---
    const arrangedKPIs = kpis.map((comp, i) => {
        const col = i; // All in one row
        
        return {
            ...comp,
            position: {
                x: getXPosition(col, COMPACT_KPI_WIDTH, kpis.length, KPI_ITEMS_PER_ROW, MINIMAL_SPACING),
                y: MINIMAL_SPACING, // Start at 2px from top
            },
            size: { width: COMPACT_KPI_WIDTH, height: COMPACT_KPI_HEIGHT },
            zIndex: i + 1,
        };
    });
    
    // Calculate the Y position where charts should start
    const kpiBlockHeight = arrangedKPIs.length > 0 ? COMPACT_KPI_HEIGHT : 0;
    const chartStartY = MINIMAL_SPACING + kpiBlockHeight + VERTICAL_GAP_KPI_TO_CHART;

    // --- 2. Arrange Charts (3x2 Grid) ---
    const arrangedCharts = charts.map((comp, i) => {
        const row = Math.floor(i / CHART_ITEMS_PER_ROW);
        const col = i % CHART_ITEMS_PER_ROW;

        return {
            ...comp,
            position: {
                x: getXPosition(col, COMPACT_CHART_WIDTH, CHART_ITEMS_PER_ROW, CHART_ITEMS_PER_ROW, MINIMAL_SPACING), 
                y: chartStartY + row * (COMPACT_CHART_HEIGHT + MINIMAL_SPACING), 
            },
            size: { width: COMPACT_CHART_WIDTH, height: COMPACT_CHART_HEIGHT },
            zIndex: i + arrangedKPIs.length + 1,
        };
    });

    return [...arrangedKPIs, ...arrangedCharts] as DashboardComponent[];
};

// --- NEW COMPONENT HELPERS FOR COMPACT TEMPLATES (Exclude position/zIndex) ---

// Helper function for Compact Templates (NO position/zIndex required)
const createCompactKPI = (
  id: string,
  title: string,
  value: string | number,
  color: string,
): Omit<DashboardComponent, 'position' | 'zIndex'> => ({
  id,
  type: 'kpi-card' as const,
  size: { width: COMPACT_KPI_WIDTH, height: COMPACT_KPI_HEIGHT }, // New Size
  properties: {
    title,
    value,
    color,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadow: true,
  }
});

// Helper function for Compact Charts (NO position/zIndex required)
const createCompactChart = (
  id: string,
  type: 'bar-chart' | 'line-chart' | 'pie-chart' | 'area-chart' | 'donut-chart' | 'gauge',
  title: string,
  color: string,
  value?: number
): Omit<DashboardComponent, 'position' | 'zIndex'> => {
  const baseComponent: Omit<DashboardComponent, 'position' | 'zIndex'> = {
    id,
    type,
    size: { width: COMPACT_CHART_WIDTH, height: COMPACT_CHART_HEIGHT }, // New Size
    properties: {
      title,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      shadow: true,
      ...(color && { color }),
      ...(type === 'gauge' && value !== undefined && { value }),
    }
  };
  return baseComponent;
};


// --- ORIGINAL HARDCODED HELPERS (Kept for existing templates) ---

// Helper function to create KPI components with proper typing
const createKPI = (
  id: string,
  title: string,
  value: string | number,
  color: string,
  position: { x: number; y: number },
  zIndex: number
): DashboardComponent => ({
  id,
  type: 'kpi-card' as const,
  position,
  size: { width: 180, height: 100 },
  zIndex,
  properties: {
    title,
    value,
    color,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadow: true,
  }
});

// Helper function to create chart components with proper typing
const createChart = (
  id: string,
  type: 'bar-chart' | 'line-chart' | 'pie-chart' | 'area-chart' | 'donut-chart' | 'gauge',
  title: string,
  color: string,
  position: { x: number; y: number },
  zIndex: number,
  value?: number
): DashboardComponent => {
  const baseComponent: DashboardComponent = {
    id,
    type,
    position,
    size: { width: 380, height: 250 },
    zIndex,
    properties: {
      title,
      backgroundColor: '#ffffff',
      borderRadius: 8,
      shadow: true,
    }
  };

  if (color) {
    baseComponent.properties.color = color;
  }

  if (type === 'gauge' && value !== undefined) {
    baseComponent.properties.value = value;
  }

  return baseComponent;
};

// --- ORIGINAL HARDCODED POSITIONS (Kept for existing templates) ---
const kpiPositions = [
  { x: 20, y: 20 },
  { x: 220, y: 20 },
  { x: 420, y: 20 },
  { x: 620, y: 20 },
  { x: 820, y: 20 },
  { x: 1020, y: 20 },
];

const chartPositions = [
  { x: 20, y: 140 },
  { x: 420, y: 140 },
  { x: 820, y: 140 },
  { x: 20, y: 410 },
  { x: 420, y: 410 },
  { x: 820, y: 410 },
];

// --- ORIGINAL 6 TEMPLATES ---
const originalTemplates: Template[] = [
  {
    id: 'comprehensive-bi-dashboard',
    name: 'Executive BI Dashboard',
    description: 'Complete business intelligence with 6 KPIs and 6 charts',
    thumbnail: '📊',
    components: [
      // 6 KPIs
      createKPI('bi-kpi-1', 'Total Revenue', '$2.4M', '#3b82f6', kpiPositions[0], 1),
      createKPI('bi-kpi-2', 'Active Users', '45.2K', '#10b981', kpiPositions[1], 2),
      createKPI('bi-kpi-3', 'Conversion Rate', '3.24%', '#f59e0b', kpiPositions[2], 3),
      createKPI('bi-kpi-4', 'Customer LTV', '$1,247', '#8b5cf6', kpiPositions[3], 4),
      createKPI('bi-kpi-5', 'Churn Rate', '2.1%', '#ef4444', kpiPositions[4], 5),
      createKPI('bi-kpi-6', 'Net Profit', '$524K', '#06b6d4', kpiPositions[5], 6),
      // 6 Charts
      createChart('bi-chart-1', 'line-chart', 'Revenue Trend', '#3b82f6', chartPositions[0], 7),
      createChart('bi-chart-2', 'bar-chart', 'Sales by Region', '#10b981', chartPositions[1], 8),
      createChart('bi-chart-3', 'pie-chart', 'Product Category Mix', '', chartPositions[2], 9),
      createChart('bi-chart-4', 'area-chart', 'User Acquisition Funnel', '#f59e0b', chartPositions[3], 10),
      createChart('bi-chart-5', 'donut-chart', 'Customer Segments', '', chartPositions[4], 11),
      createChart('bi-chart-6', 'gauge', 'Performance Score', '#8b5cf6', chartPositions[5], 12, 87),
    ]
  },
  {
    id: 'sales-dashboard',
    name: 'Sales Performance',
    description: 'Blue-themed sales tracking with 6 KPIs and 6 charts',
    thumbnail: '📊',
    components: [
      // 6 KPIs
      createKPI('sales-kpi-1', 'Total Revenue', '$2.1M', '#3b82f6', kpiPositions[0], 1),
      createKPI('sales-kpi-2', 'Monthly Sales', '$347K', '#1e40af', kpiPositions[1], 2),
      createKPI('sales-kpi-3', 'New Customers', '1,234', '#2563eb', kpiPositions[2], 3),
      createKPI('sales-kpi-4', 'Deals Closed', '847', '#1d4ed8', kpiPositions[3], 4),
      createKPI('sales-kpi-5', 'Conversion Rate', '18.7%', '#3730a3', kpiPositions[4], 5),
      createKPI('sales-kpi-6', 'Pipeline Value', '$4.2M', '#312e81', kpiPositions[5], 6),
      // 6 Charts
      createChart('sales-chart-1', 'bar-chart', 'Monthly Sales Trends', '#3b82f6', chartPositions[0], 7),
      createChart('sales-chart-2', 'line-chart', 'Revenue Growth', '#1e40af', chartPositions[1], 8),
      createChart('sales-chart-3', 'pie-chart', 'Sales by Product', '', chartPositions[2], 9),
      createChart('sales-chart-4', 'area-chart', 'Customer Acquisition', '#2563eb', chartPositions[3], 10),
      createChart('sales-chart-5', 'donut-chart', 'Sales Team Performance', '', chartPositions[4], 11),
      createChart('sales-chart-6', 'gauge', 'Target Achievement', '#1d4ed8', chartPositions[5], 12, 92),
    ]
  },
  {
    id: 'marketing-analytics',
    name: 'Marketing Analytics',
    description: 'Green-themed marketing performance with 6 KPIs and 6 charts',
    thumbnail: '📈',
    components: [
      // 6 KPIs
      createKPI('marketing-kpi-1', 'Campaign ROI', '284%', '#10b981', kpiPositions[0], 1),
      createKPI('marketing-kpi-2', 'Leads Generated', '4,247', '#059669', kpiPositions[1], 2),
      createKPI('marketing-kpi-3', 'Cost Per Lead', '$47', '#047857', kpiPositions[2], 3),
      createKPI('marketing-kpi-4', 'Email Open Rate', '28.4%', '#065f46', kpiPositions[3], 4),
      createKPI('marketing-kpi-5', 'Social Engagement', '12.8%', '#064e3b', kpiPositions[4], 5),
      createKPI('marketing-kpi-6', 'Ad Spend', '$124K', '#052e16', kpiPositions[5], 6),
      // 6 Charts
      createChart('marketing-chart-1', 'line-chart', 'Lead Generation Trends', '#10b981', chartPositions[0], 7),
      createChart('marketing-chart-2', 'area-chart', 'Campaign Performance', '#059669', chartPositions[1], 8),
      createChart('marketing-chart-3', 'pie-chart', 'Channel Distribution', '', chartPositions[2], 9),
      createChart('marketing-chart-4', 'bar-chart', 'Monthly Ad Spend', '#047857', chartPositions[3], 10),
      createChart('marketing-chart-5', 'donut-chart', 'Lead Source Breakdown', '', chartPositions[4], 11),
      createChart('marketing-chart-6', 'gauge', 'Campaign Effectiveness', '#065f46', chartPositions[5], 12, 78),
    ]
  },
  {
    id: 'financial-overview',
    name: 'Financial Overview',
    description: 'Purple-themed financial metrics with 6 KPIs and 6 charts',
    thumbnail: '💰',
    components: [
      // 6 KPIs
      createKPI('financial-kpi-1', 'Total Assets', '$8.7M', '#8b5cf6', kpiPositions[0], 1),
      createKPI('financial-kpi-2', 'Profit Margin', '23.5%', '#7c3aed', kpiPositions[1], 2),
      createKPI('financial-kpi-3', 'Operating Expenses', '$1.2M', '#6d28d9', kpiPositions[2], 3),
      createKPI('financial-kpi-4', 'Cash Flow', '$547K', '#5b21b6', kpiPositions[3], 4),
      createKPI('financial-kpi-5', 'Debt Ratio', '0.34', '#4c1d95', kpiPositions[4], 5),
      createKPI('financial-kpi-6', 'ROE', '18.7%', '#3730a3', kpiPositions[5], 6),
      // 6 Charts
      createChart('financial-chart-1', 'bar-chart', 'Budget vs Actual', '#8b5cf6', chartPositions[0], 7),
      createChart('financial-chart-2', 'line-chart', 'Revenue Growth', '#7c3aed', chartPositions[1], 8),
      createChart('financial-chart-3', 'pie-chart', 'Expense Breakdown', '', chartPositions[2], 9),
      createChart('financial-chart-4', 'area-chart', 'Cash Flow Analysis', '#6d28d9', chartPositions[3], 10),
      createChart('financial-chart-5', 'donut-chart', 'Asset Allocation', '', chartPositions[4], 11),
      createChart('financial-chart-6', 'gauge', 'Financial Health Score', '#5b21b6', chartPositions[5], 12, 85),
    ]
  },
  {
    id: 'operations-dashboard',
    name: 'Operations Monitor',
    description: 'Orange-themed operational efficiency with 6 KPIs and 6 charts',
    thumbnail: '⚙️',
    components: [
      // 6 KPIs
      createKPI('ops-kpi-1', 'Efficiency Rate', '94.2%', '#f59e0b', kpiPositions[0], 1),
      createKPI('ops-kpi-2', 'Downtime', '2.1 hrs', '#ea580c', kpiPositions[1], 2),
      createKPI('ops-kpi-3', 'Production Units', '12,847', '#d97706', kpiPositions[2], 3),
      createKPI('ops-kpi-4', 'Quality Score', '98.7%', '#c2410c', kpiPositions[3], 4),
      createKPI('ops-kpi-5', 'Machine Uptime', '97.8%', '#9a3412', kpiPositions[4], 5),
      createKPI('ops-kpi-6', 'Cost Per Unit', '$12.40', '#7c2d12', kpiPositions[5], 6),
      // 6 Charts
      createChart('ops-chart-1', 'area-chart', 'Production Output', '#f59e0b', chartPositions[0], 7),
      createChart('ops-chart-2', 'bar-chart', 'Equipment Performance', '#ea580c', chartPositions[1], 8),
      createChart('ops-chart-3', 'line-chart', 'Efficiency Trends', '#d97706', chartPositions[2], 9),
      createChart('ops-chart-4', 'pie-chart', 'Production Line Mix', '', chartPositions[3], 10),
      createChart('ops-chart-5', 'donut-chart', 'Resource Utilization', '', chartPositions[4], 11),
      createChart('ops-chart-6', 'gauge', 'Overall Equipment Effectiveness', '#c2410c', chartPositions[5], 12, 87),
    ]
  },
  {
    id: 'customer-insights',
    name: 'Customer Insights',
    description: 'Teal-themed customer behavior with 6 KPIs and 6 charts',
    thumbnail: '👥',
    components: [
      // 6 KPIs
      createKPI('customer-kpi-1', 'Total Customers', '24,847', '#14b8a6', kpiPositions[0], 1),
      createKPI('customer-kpi-2', 'Satisfaction Score', '4.7/5', '#0d9488', kpiPositions[1], 2),
      createKPI('customer-kpi-3', 'Retention Rate', '89.2%', '#0f766e', kpiPositions[2], 3),
      createKPI('customer-kpi-4', 'Avg Order Value', '$247', '#115e59', kpiPositions[3], 4),
      createKPI('customer-kpi-5', 'Support Tickets', '147', '#134e4a', kpiPositions[4], 5),
      createKPI('customer-kpi-6', 'NPS Score', '72', '#042f2e', kpiPositions[5], 6),
      // 6 Charts
      createChart('customer-chart-1', 'bar-chart', 'Monthly Retention', '#14b8a6', chartPositions[0], 7),
      createChart('customer-chart-2', 'line-chart', 'Customer Acquisition', '#0d9488', chartPositions[1], 8),
      createChart('customer-chart-3', 'donut-chart', 'Customer Segments', '', chartPositions[2], 9),
      createChart('customer-chart-4', 'area-chart', 'Customer Lifetime Value', '#0f766e', chartPositions[3], 10),
      createChart('customer-chart-5', 'pie-chart', 'Support Channel Usage', '', chartPositions[4], 11),
      createChart('customer-chart-6', 'gauge', 'Customer Health Score', '#115e59', chartPositions[5], 12, 87),
    ]
  },
];

// Array to hold the 24 additional templates generated below
const additionalTemplates: Template[] = [];

// --- ORIGINAL GENERATION OF 24 ADDITIONAL TEMPLATES ---
const additionalTemplateConfigs = [
  { id: 'hr-analytics', name: 'HR Analytics', description: 'Pink-themed human resources with 6 KPIs and 6 charts', thumbnail: '👤', colors: ['#ec4899', '#db2777', '#be185d', '#9d174d', '#831843', '#4c1d4b'] },
  { id: 'it-security', name: 'IT Security Monitor', description: 'Red-themed cybersecurity with 6 KPIs and 6 charts', thumbnail: '🔒', colors: ['#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#6b1818', '#5b1212'] },
  { id: 'supply-chain', name: 'Supply Chain Analytics', description: 'Brown-themed logistics with 6 KPIs and 6 charts', thumbnail: '📦', colors: ['#a16207', '#92400e', '#78350f', '#65501f', '#451a03', '#1c0a00'] },
  { id: 'ecommerce-analytics', name: 'E-commerce Analytics', description: 'Indigo-themed online store with 6 KPIs and 6 charts', thumbnail: '🛒', colors: ['#4f46e5', '#4338ca', '#3730a3', '#312e81', '#1e1b4b', '#0f0e3d'] },
  { id: 'healthcare-analytics', name: 'Healthcare Analytics', description: 'Medical and patient care with 6 KPIs and 6 charts', thumbnail: '🏥', colors: ['#059669', '#047857', '#065f46', '#064e3b', '#022c22', '#14532d'] },
  { id: 'education-analytics', name: 'Education Analytics', description: 'Student performance with 6 KPIs and 6 charts', thumbnail: '🎓', colors: ['#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#1e3a8a', '#172554'] },
  { id: 'real-estate', name: 'Real Estate Analytics', description: 'Property market with 6 KPIs and 6 charts', thumbnail: '🏢', colors: ['#0891b2', '#0e7490', '#155e75', '#164e63', '#083344', '#042f2e'] },
  { id: 'social-media', name: 'Social Media Analytics', description: 'Social engagement with 6 KPIs and 6 charts', thumbnail: '📱', colors: ['#e11d48', '#be123c', '#9f1239', '#881337', '#4c0519', '#1f0309'] },
  { id: 'sports-analytics', name: 'Sports Analytics', description: 'Athletic performance with 6 KPIs and 6 charts', thumbnail: '⚽', colors: ['#16a34a', '#15803d', '#166534', '#14532d', '#052e16', '#0a1909'] },
  { id: 'energy-management', name: 'Energy Management', description: 'Power consumption with 6 KPIs and 6 charts', thumbnail: '⚡', colors: ['#facc15', '#eab308', '#ca8a04', '#a16207', '#92400e', '#78350f'] },
  { id: 'food-beverage', name: 'Food & Beverage', description: 'Restaurant industry with 6 KPIs and 6 charts', thumbnail: '🍽️', colors: ['#fb923c', '#f97316', '#ea580c', '#dc2626', '#c2410c', '#9a3412'] },
  { id: 'logistics-shipping', name: 'Logistics & Shipping', description: 'Transportation tracking with 6 KPIs and 6 charts', thumbnail: '🚚', colors: ['#059669', '#047857', '#065f46', '#064e3b', '#022c22', '#14532d'] },
  { id: 'manufacturing', name: 'Manufacturing Analytics', description: 'Production efficiency with 6 KPIs and 6 charts', thumbnail: '🏭', colors: ['#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81', '#1e1b4b'] },
  { id: 'agriculture', name: 'Agriculture Analytics', description: 'Crop monitoring with 6 KPIs and 6 charts', thumbnail: '🌾', colors: ['#65a30d', '#4d7c0f', '#365314', '#1a2e05', '#14532d', '#052e16'] },
  { id: 'automotive', name: 'Automotive Analytics', description: 'Vehicle performance with 6 KPIs and 6 charts', thumbnail: '🚗', colors: ['#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6'] },
  { id: 'gaming-esports', name: 'Gaming & Esports', description: 'Player engagement with 6 KPIs and 6 charts', thumbnail: '🎮', colors: ['#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#3730a3', '#312e81'] },
  { id: 'telecommunications', name: 'Telecommunications', description: 'Network performance with 6 KPIs and 6 charts', thumbnail: '📡', colors: ['#0ea5e9', '#0284c7', '#0369a1', '#0c4a6e', '#075985', '#0c4a6e'] },
  { id: 'media-entertainment', name: 'Media & Entertainment', description: 'Content performance with 6 KPIs and 6 charts', thumbnail: '🎬', colors: ['#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#6b1818', '#5b1212'] },
  { id: 'startup-metrics', name: 'Startup Metrics', description: 'Early-stage growth with 6 KPIs and 6 charts', thumbnail: '🚀', colors: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f', '#451a03'] },
  { id: 'nonprofit-analytics', name: 'Nonprofit Analytics', description: 'Donation tracking with 6 KPIs and 6 charts', thumbnail: '❤️', colors: ['#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#6b1818', '#5b1212'] },
  { id: 'government-analytics', name: 'Government Analytics', description: 'Public sector performance with 6 KPIs and 6 charts', thumbnail: '🏛️', colors: ['#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'] },
  { id: 'travel-tourism', name: 'Travel & Tourism', description: 'Hospitality industry with 6 KPIs and 6 charts', thumbnail: '✈️', colors: ['#0891b2', '#0e7490', '#155e75', '#164e63', '#083344', '#042f2e'] },
  { id: 'retail-analytics', name: 'Retail Analytics', description: 'Store performance with 6 KPIs and 6 charts', thumbnail: '🛍️', colors: ['#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#3730a3', '#312e81'] },
  { id: 'construction', name: 'Construction Analytics', description: 'Project management with 6 KPIs and 6 charts', thumbnail: '🏗️', colors: ['#ea580c', '#dc2626', '#c2410c', '#9a3412', '#7c2d12', '#451a03'] },
];

// Generate additional templates (Original 24, still using hardcoded positions)
additionalTemplateConfigs.forEach(config => {
  const kpiTitles = ['Metric 1', 'Metric 2', 'Metric 3', 'Metric 4', 'Metric 5', 'Metric 6'];
  const kpiValues = ['1,247', '94%', '$2.4M', '18.7%', '847', '72%'];
  const chartTitles = ['Performance', 'Trends', 'Distribution', 'Analysis', 'Breakdown', 'Score'];
  const chartTypes: ('bar-chart' | 'line-chart' | 'pie-chart' | 'area-chart' | 'donut-chart' | 'gauge')[] = ['bar-chart', 'line-chart', 'pie-chart', 'area-chart', 'donut-chart', 'gauge'];

  additionalTemplates.push({
    id: config.id,
    name: config.name,
    description: config.description,
    thumbnail: config.thumbnail,
    components: [
      // 6 KPIs
      ...kpiTitles.map((title, i) => 
        createKPI(`${config.id}-kpi-${i + 1}`, title, kpiValues[i], config.colors[i], kpiPositions[i], i + 1)
      ),
      // 6 Charts
      ...chartTitles.map((title, i) => 
        createChart(
          `${config.id}-chart-${i + 1}`, 
          chartTypes[i], 
          title, 
          chartTypes[i] === 'pie-chart' || chartTypes[i] === 'donut-chart' ? '' : config.colors[i], 
          chartPositions[i], 
          i + 7,
          chartTypes[i] === 'gauge' ? 85 + i : undefined
        )
      ),
    ]
  });
});

// Combine all 30 original and additional templates
const standardTemplates = [...originalTemplates, ...additionalTemplates];


// --- NEW 10 COMPACT TEMPLATES (Using the dynamic layout generator) ---
const compactTemplates: Template[] = [
    {
        id: 'compact-sales-red',
        name: 'Compact Sales V2 (Red)',
        description: `New compact layout (KPIs: ${COMPACT_KPI_WIDTH}x${COMPACT_KPI_HEIGHT}, Charts: ${COMPACT_CHART_WIDTH}x${COMPACT_CHART_HEIGHT}) for Sales.`,
        thumbnail: '🔥',
        components: generateCompactGridLayout([
            createCompactKPI('cs-kpi-1', 'Total Sales', '$4.5M', '#ef4444'),
            createCompactKPI('cs-kpi-2', 'Win Rate', '35%', '#dc2626'),
            createCompactKPI('cs-kpi-3', 'Deals Pipeline', '$12M', '#b91c1c'),
            createCompactKPI('cs-kpi-4', 'Avg Deal Size', '$18K', '#991b1b'),
            createCompactKPI('cs-kpi-5', 'Sales Cycle (Days)', '45', '#7f1d1d'),
            createCompactKPI('cs-kpi-6', 'Monthly Target', '95%', '#6b1818'),
            createCompactChart('cs-chart-1', 'line-chart', 'Monthly Revenue Trend', '#ef4444'),
            createCompactChart('cs-chart-2', 'bar-chart', 'Sales by Channel', '#dc2626'),
            createCompactChart('cs-chart-3', 'donut-chart', 'Product Margin Mix', ''),
            createCompactChart('cs-chart-4', 'area-chart', 'Lead Conversion Funnel', '#b91c1c'),
            createCompactChart('cs-chart-5', 'gauge', 'Quarterly Goal', '#991b1b', 82),
            createCompactChart('cs-chart-6', 'pie-chart', 'Team Activity Split', ''),
        ]),
    },
    {
        id: 'compact-marketing-purple',
        name: 'Compact Marketing V2 (Purple)',
        description: `New compact layout (KPIs: ${COMPACT_KPI_WIDTH}x${COMPACT_KPI_HEIGHT}, Charts: ${COMPACT_CHART_WIDTH}x${COMPACT_CHART_HEIGHT}) for Marketing.`,
        thumbnail: '✨',
        components: generateCompactGridLayout([
            createCompactKPI('cm-kpi-1', 'New Leads', '15.2K', '#8b5cf6'),
            createCompactKPI('cm-kpi-2', 'Conversion Rate', '4.1%', '#7c3aed'),
            createCompactKPI('cm-kpi-3', 'CPC', '$2.10', '#6d28d9'),
            createCompactKPI('cm-kpi-4', 'Website Traffic', '180K', '#5b21b6'),
            createCompactKPI('cm-kpi-5', 'Email CTR', '15.4%', '#4c1d95'),
            createCompactKPI('cm-kpi-6', 'SEO Rank', 'Top 5', '#3730a3'),
            createCompactChart('cm-chart-1', 'area-chart', 'Traffic Sources Over Time', '#8b5cf6'),
            createCompactChart('cm-chart-2', 'bar-chart', 'Campaign ROI Comparison', '#7c3aed'),
            createCompactChart('cm-chart-3', 'pie-chart', 'Lead Source Geography', ''),
            createCompactChart('cm-chart-4', 'line-chart', 'Lead Quality Index', '#6d28d9'),
            createCompactChart('cm-chart-5', 'donut-chart', 'Content Performance', ''),
            createCompactChart('cm-chart-6', 'gauge', 'Engagement Score', '#5b21b6', 77),
        ]),
    },
    {
        id: 'compact-finance-teal',
        name: 'Compact Finance V2 (Teal)',
        description: `New compact layout (KPIs: ${COMPACT_KPI_WIDTH}x${COMPACT_KPI_HEIGHT}, Charts: ${COMPACT_CHART_WIDTH}x${COMPACT_CHART_HEIGHT}) for Finance.`,
        thumbnail: '💵',
        components: generateCompactGridLayout([
            createCompactKPI('cf-kpi-1', 'Gross Margin', '42%', '#14b8a6'),
            createCompactKPI('cf-kpi-2', 'Net Income', '$1.1M', '#0d9488'),
            createCompactKPI('cf-kpi-3', 'Opex Ratio', '24%', '#0f766e'),
            createCompactKPI('cf-kpi-4', 'Working Capital', '$850K', '#115e59'),
            createCompactKPI('cf-kpi-5', 'Inventory Turnover', '4.5x', '#134e4a'),
            createCompactKPI('cf-kpi-6', 'Quick Ratio', '1.2', '#042f2e'),
            createCompactChart('cf-chart-1', 'bar-chart', 'Opex vs Budget', '#14b8a6'),
            createCompactChart('cf-chart-2', 'line-chart', 'Gross Margin Trend', '#0d9488'),
            createCompactChart('cf-chart-3', 'donut-chart', 'Debt Allocation', ''),
            createCompactChart('cf-chart-4', 'area-chart', 'Cash Flow Forecast', '#0f766e'),
            createCompactChart('cf-chart-5', 'gauge', 'Liquidity Index', '#115e59', 91),
            createCompactChart('cf-chart-6', 'pie-chart', 'Revenue by Stream', ''),
        ]),
    },
    {
        id: 'compact-hr-indigo',
        name: 'Compact HR V2 (Indigo)',
        description: `New compact layout (KPIs: ${COMPACT_KPI_WIDTH}x${COMPACT_KPI_HEIGHT}, Charts: ${COMPACT_CHART_WIDTH}x${COMPACT_CHART_HEIGHT}) for Human Resources.`,
        thumbnail: '🤝',
        components: generateCompactGridLayout([
            createCompactKPI('ch-kpi-1', 'Employee Count', '420', '#4f46e5'),
            createCompactKPI('ch-kpi-2', 'Turnover Rate', '12.5%', '#4338ca'),
            createCompactKPI('ch-kpi-3', 'Time to Hire (Days)', '30', '#3730a3'),
            createCompactKPI('ch-kpi-4', 'Training Spend', '$42K', '#312e81'),
            createCompactKPI('ch-kpi-5', 'Engagement Score', '7.8/10', '#1e1b4b'),
            createCompactKPI('ch-kpi-6', 'Absenteeism', '1.2%', '#0f0e3d'),
            createCompactChart('ch-chart-1', 'line-chart', 'Headcount Growth', '#4f46e5'),
            createCompactChart('ch-chart-2', 'bar-chart', 'Turnover by Department', '#4338ca'),
            createCompactChart('ch-chart-3', 'pie-chart', 'Employee Tenure Mix', ''),
            createCompactChart('ch-chart-4', 'area-chart', 'Salary Distribution', '#3730a3'),
            createCompactChart('ch-chart-5', 'donut-chart', 'Diversity Breakdown', ''),
            createCompactChart('ch-chart-6', 'gauge', 'Retention Health', '#312e81', 88),
        ]),
    },
    {
        id: 'compact-ops-amber',
        name: 'Compact Operations V2 (Amber)',
        description: `New compact layout (KPIs: ${COMPACT_KPI_WIDTH}x${COMPACT_KPI_HEIGHT}, Charts: ${COMPACT_CHART_WIDTH}x${COMPACT_CHART_HEIGHT}) for Operations.`,
        thumbnail: '⚙️',
        components: generateCompactGridLayout([
            createCompactKPI('co-kpi-1', 'Order Fulfilled', '18.4K', '#f59e0b'),
            createCompactKPI('co-kpi-2', 'Defect Rate', '0.5%', '#d97706'),
            createCompactKPI('co-kpi-3', 'Delivery Time (Hrs)', '4.2', '#b45309'),
            createCompactKPI('co-kpi-4', 'Utilization Rate', '92%', '#92400e'),
            createCompactKPI('co-kpi-5', 'Maintenance Cost', '$12K', '#78350f'),
            createCompactKPI('co-kpi-6', 'Capacity Used', '85%', '#451a03'),
            createCompactChart('co-chart-1', 'area-chart', 'Fulfillment Rate Trend', '#f59e0b'),
            createCompactChart('co-chart-2', 'bar-chart', 'Defects by Cause', '#d97706'),
            createCompactChart('co-chart-3', 'pie-chart', 'Inventory Breakdown', ''),
            createCompactChart('co-chart-4', 'line-chart', 'Machine Downtime', '#b45309'),
            createCompactChart('co-chart-5', 'donut-chart', 'Resource Allocation', ''),
            createCompactChart('co-chart-6', 'gauge', 'Efficiency Index', '#92400e', 94),
        ]),
    },
    {
        id: 'compact-cs-blue',
        name: 'Compact Customer Service V2 (Blue)',
        description: `New compact layout (KPIs: ${COMPACT_KPI_WIDTH}x${COMPACT_KPI_HEIGHT}, Charts: ${COMPACT_CHART_WIDTH}x${COMPACT_CHART_HEIGHT}) for Customer Service.`,
        thumbnail: '📞',
        components: generateCompactGridLayout([
            createCompactKPI('cc-kpi-1', 'Avg Handle Time', '3:15', '#3b82f6'),
            createCompactKPI('cc-kpi-2', 'First Call Res.', '88%', '#2563eb'),
            createCompactKPI('cc-kpi-3', 'CSAT Score', '9.1/10', '#1d4ed8'),
            createCompactKPI('cc-kpi-4', 'Ticket Volume', '4,100', '#1e40af'),
            createCompactKPI('cc-kpi-5', 'Queue Size', '12', '#1e3a8a'),
            createCompactKPI('cc-kpi-6', 'Escalation Rate', '3%', '#172554'),
            createCompactChart('cc-chart-1', 'line-chart', 'Ticket Volume Trend', '#3b82f6'),
            createCompactChart('cc-chart-2', 'bar-chart', 'CSAT by Agent', '#2563eb'),
            createCompactChart('cc-chart-3', 'pie-chart', 'Ticket Category Mix', ''),
            createCompactChart('cc-chart-4', 'area-chart', 'Avg Handle Time Trend', '#1d4ed8'),
            createCompactChart('cc-chart-5', 'donut-chart', 'Resolution Type', ''),
            createCompactChart('cc-chart-6', 'gauge', 'Service Level', '#1e40af', 95),
        ]),
    },
    {
        id: 'compact-it-grey',
        name: 'Compact IT Security V2 (Grey)',
        description: `New compact layout (KPIs: ${COMPACT_KPI_WIDTH}x${COMPACT_KPI_HEIGHT}, Charts: ${COMPACT_CHART_WIDTH}x${COMPACT_CHART_HEIGHT}) for IT Security.`,
        thumbnail: '🛡️',
        components: generateCompactGridLayout([
            createCompactKPI('ci-kpi-1', 'Vulnerabilities', '45', '#4b5563'),
            createCompactKPI('ci-kpi-2', 'Incidents Reported', '5', '#374151'),
            createCompactKPI('ci-kpi-3', 'Patches Applied', '98%', '#6b7280'),
            createCompactKPI('ci-kpi-4', 'Auth. Failures', '120', '#9ca3af'),
            createCompactKPI('ci-kpi-5', 'Firewall Blocks', '1.2M', '#d1d5db'),
            createCompactKPI('ci-kpi-6', 'Compliance Score', '99%', '#f3f4f6'),
            createCompactChart('ci-chart-1', 'bar-chart', 'Vulnerability by System', '#4b5563'),
            createCompactChart('ci-chart-2', 'line-chart', 'Incident Trend', '#374151'),
            createCompactChart('ci-chart-3', 'donut-chart', 'Attack Vector Mix', ''),
            createCompactChart('ci-chart-4', 'area-chart', 'Patch Compliance Over Time', '#6b7280'),
            createCompactChart('ci-chart-5', 'gauge', 'Security Health', '#9ca3af', 90),
            createCompactChart('ci-chart-6', 'pie-chart', 'User Access Status', ''),
        ]),
    },
    {
        id: 'compact-ecom-green',
        name: 'Compact E-commerce V2 (Green)',
        description: `New compact layout (KPIs: ${COMPACT_KPI_WIDTH}x${COMPACT_KPI_HEIGHT}, Charts: ${COMPACT_CHART_WIDTH}x${COMPACT_CHART_HEIGHT}) for E-commerce.`,
        thumbnail: '🛍️',
        components: generateCompactGridLayout([
            createCompactKPI('ce-kpi-1', 'Conversion Rate', '3.8%', '#10b981'),
            createCompactKPI('ce-kpi-2', 'Avg Order Value', '$145', '#059669'),
            createCompactKPI('ce-kpi-3', 'Traffic', '350K', '#047857'),
            createCompactKPI('ce-kpi-4', 'Cart Abandonment', '65%', '#065f46'),
            createCompactKPI('ce-kpi-5', 'Repeat Customer', '30%', '#064e3b'),
            createCompactKPI('ce-kpi-6', 'Product Returns', '5%', '#052e16'),
            createCompactChart('ce-chart-1', 'area-chart', 'Daily Conversion Rate', '#10b981'),
            createCompactChart('ce-chart-2', 'bar-chart', 'Sales by Device', '#059669'),
            createCompactChart('ce-chart-3', 'pie-chart', 'Top Selling Categories', ''),
            createCompactChart('ce-chart-4', 'line-chart', 'Customer LTV Trend', '#047857'),
            createCompactChart('ce-chart-5', 'donut-chart', 'Geographic Sales Mix', ''),
            createCompactChart('ce-chart-6', 'gauge', 'Store Health Score', '#065f46', 84),
        ]),
    },
    {
        id: 'compact-pm-yellow',
        name: 'Compact Project Mgmt V2 (Yellow)',
        description: `New compact layout (KPIs: ${COMPACT_KPI_WIDTH}x${COMPACT_KPI_HEIGHT}, Charts: ${COMPACT_CHART_WIDTH}x${COMPACT_CHART_HEIGHT}) for Project Management.`,
        thumbnail: '📝',
        components: generateCompactGridLayout([
            createCompactKPI('cp-kpi-1', 'Projects On Track', '9/10', '#facc15'),
            createCompactKPI('cp-kpi-2', 'Avg Task Completion', '4 days', '#eab308'),
            createCompactKPI('cp-kpi-3', 'Budget Variance', '-5%', '#ca8a04'),
            createCompactKPI('cp-kpi-4', 'Resources Used', '85%', '#a16207'),
            createCompactKPI('cp-kpi-5', 'Open Bugs', '12', '#92400e'),
            createCompactKPI('cp-kpi-6', 'SLA Adherence', '99%', '#78350f'),
            createCompactChart('cp-chart-1', 'bar-chart', 'Task Status Breakdown', '#facc15'),
            createCompactChart('cp-chart-2', 'area-chart', 'Resource Load', '#eab308'),
            createCompactChart('cp-chart-3', 'pie-chart', 'Project Phase Distribution', ''),
            createCompactChart('cp-chart-4', 'line-chart', 'Bug Fix Rate', '#ca8a04'),
            createCompactChart('cp-chart-5', 'gauge', 'Project Health', '#a16207', 89),
            createCompactChart('cp-chart-6', 'donut-chart', 'Team Velocity', ''),
        ]),
    },
    {
        id: 'compact-sc-brown',
        name: 'Compact Supply Chain V2 (Brown)',
        description: `New compact layout (KPIs: ${COMPACT_KPI_WIDTH}x${COMPACT_KPI_HEIGHT}, Charts: ${COMPACT_CHART_WIDTH}x${COMPACT_CHART_HEIGHT}) for Supply Chain.`,
        thumbnail: '📦',
        components: generateCompactGridLayout([
            createCompactKPI('csch-kpi-1', 'Lead Time (Days)', '15', '#a16207'),
            createCompactKPI('csch-kpi-2', 'Fill Rate', '95%', '#92400e'),
            createCompactKPI('csch-kpi-3', 'Inventory Days', '45', '#78350f'),
            createCompactKPI('csch-kpi-4', 'Freight Cost', '$12K', '#65501f'),
            createCompactKPI('csch-kpi-5', 'On-Time Delivery', '98%', '#451a03'),
            createCompactKPI('csch-kpi-6', 'Warehouse Cost', '$8K', '#1c0a00'),
            createCompactChart('csch-chart-1', 'line-chart', 'Lead Time Trend', '#a16207'),
            createCompactChart('csch-chart-2', 'bar-chart', 'Inventory by Warehouse', '#92400e'),
            createCompactChart('csch-chart-3', 'donut-chart', 'Supplier Performance', ''),
            createCompactChart('csch-chart-4', 'area-chart', 'On-Time Delivery Rate', '#78350f'),
            createCompactChart('csch-chart-5', 'gauge', 'Supply Chain Risk', '#65501f', 75),
            createCompactChart('csch-chart-6', 'pie-chart', 'Shipping Method Mix', ''),
        ]),
    },
];

console.log('TemplateSelector module loaded with', standardTemplates.length + compactTemplates.length, 'templates');

interface TemplateSelectorProps {
  onApplyTemplate: (template: Template) => void;
  onClose: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onApplyTemplate,
  onClose
}) => {
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  
  // --- UPDATED MERGE SEQUENCE ---
  // Order: 1. AI Generated -> 2. Compact V2 (New) -> 3. Standard V1 (Original)
  const allTemplates = [...customTemplates, ...compactTemplates, ...standardTemplates];

  const handleTemplateGenerated = (template: Template) => {
    setCustomTemplates(prev => [template, ...prev]);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl w-[90vw] h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>Choose from {allTemplates.length} Templates</DialogTitle>
              <Button
                onClick={() => setShowAIGenerator(true)}
                className="gap-2"
                size="sm"
              >
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 w-full">
            {customTemplates.length > 0 && (
              <div className="px-4 pt-2">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Generated Templates
                </h3>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
              {allTemplates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 h-fit">
                <CardHeader className="pb-2">
                  <div className="text-2xl text-center mb-1">{template.thumbnail}</div>
                  <CardTitle className="text-xs text-center font-semibold leading-tight">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 text-center leading-relaxed line-clamp-3">
                    {template.description}
                  </p>
                  <Button
                    className="w-full text-xs"
                    size="sm"
                    onClick={() => onApplyTemplate(template)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
              ))}
            </div>
            
            <div className="text-center p-4 text-sm text-gray-500">
              Showing all {allTemplates.length} templates
            </div>
          </ScrollArea>
          
          <div className="flex justify-center p-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AITemplateGenerator
        open={showAIGenerator}
        onClose={() => setShowAIGenerator(false)}
        onTemplateGenerated={handleTemplateGenerated}
      />
    </>
  );
};

export default TemplateSelector;