// The function runs on Deno (Supabase Edge Functions). To avoid TypeScript/VS Code
// diagnostics in a Node/TS workspace, add a small shim for editor-only checks.
// If you use the Deno VS Code extension, you can remove the next two lines.
// @ts-nocheck
declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validate hex color
const isValidHex = (c: string) => /^#[0-9A-Fa-f]{6}$/i.test(c?.trim());

// Parse palette string into array of valid hex colors
const parsePalette = (paletteStr: string): string[] => {
  if (!paletteStr) return [];
  return paletteStr
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(isValidHex);
};

// Generate complementary colors from a base color
const generateComplementaryColors = (baseHex: string, count: number = 6): string[] => {
  const colors = [baseHex];
  const base = parseInt(baseHex.slice(1), 16);
  const r = (base >> 16) & 255;
  const g = (base >> 8) & 255;
  const b = base & 255;

  // Generate variations by adjusting hue
  const hueShifts = [30, 60, 120, 180, 240, 300];
  for (let i = 0; i < count - 1 && i < hueShifts.length; i++) {
    const shift = hueShifts[i];
    const newR = Math.min(255, Math.max(0, (r + shift) % 256));
    const newG = Math.min(255, Math.max(0, (g + shift * 0.7) % 256));
    const newB = Math.min(255, Math.max(0, (b + shift * 0.5) % 256));
    colors.push(`#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`);
  }
  return colors.slice(0, count);
};

// Default palette if none provided
const DEFAULT_PALETTE = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateType, description, features, palette } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("GEMINI_API_KEY") || Deno.env.get("VITE_GEMINI_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY or GEMINI_API_KEY is not configured");
    }

    // Parse and validate user palette
    let userPalette = parsePalette(palette || '');
    
    // If only one color provided, generate complementary colors
    if (userPalette.length === 1) {
      userPalette = generateComplementaryColors(userPalette[0], 6);
      console.log("Generated complementary palette from single color:", userPalette);
    }
    
    // Use user palette or default
    const finalPalette = userPalette.length >= 2 ? userPalette : DEFAULT_PALETTE;
    
    console.log("Generating template:", { templateType, description, features, palette: finalPalette });

    const systemPrompt = `You are a dashboard template generator. Generate professional, well-designed dashboard templates.

MANDATORY COLOR PALETTE: You MUST use ONLY these colors for ALL components: ${finalPalette.join(', ')}
- Cycle through these colors in order for KPIs and charts
- KPI 1 uses color 1, KPI 2 uses color 2, etc.
- When you run out of colors, start from the beginning
- DO NOT use any other colors

Return a JSON object with this EXACT structure:
{
  "name": "Template name",
  "description": "Brief description",
  "components": [
    {
      "type": "kpi-card" | "bar-chart" | "line-chart" | "pie-chart" | "area-chart" | "donut-chart" | "gauge",
      "title": "Component title",
      "value": "REQUIRED for KPI and gauge types - realistic values like '$125K', '85%', '1,234 users', '45 mins', '2.5K'",
      "color": "One of the palette colors above",
      "position": {"x": number, "y": number},
      "size": {"width": number, "height": number}
    }
  ]
}

CRITICAL REQUIREMENTS:
1. EXACTLY 6 KPI cards with realistic, contextual dummy values (NEVER empty or "0")
2. EXACTLY 6 charts - MUST use ALL 6 DIFFERENT chart types: bar-chart, line-chart, pie-chart, donut-chart, area-chart, gauge
3. Chart type selection based on data context:
   - "trend", "over time", "growth" → line-chart
   - "distribution", "breakdown", "share" → pie-chart or donut-chart
   - "comparison", "by category", "vs" → bar-chart
   - "progress", "goal", "score" → gauge
   - "cumulative", "volume" → area-chart
4. Grid Layout (DO NOT OVERLAP):
   - Row 1 (y:50): 3 KPIs at x=50,480,910
   - Row 2 (y:170): 3 KPIs at x=50,480,910
   - Row 3 (y:300): 3 charts at x=50,480,910
   - Row 4 (y:620): 3 charts at x=50,480,910
5. Sizes: KPI cards 280x120, Charts 380x280
6. Value Format Examples: "$1.2M", "85%", "2,456", "45 min", "3.8/5", "142K users"
7. Titles must be specific and relevant to template type (not generic)
8. For gauge type, value should be a number between 0-100`;

    const userPrompt = `Generate a ${templateType} dashboard template.
Description: ${description}
Required features: ${features || 'Standard dashboard metrics'}

MANDATORY CHECKLIST:
✓ EXACTLY 6 KPI cards (type: "kpi-card") with realistic values appropriate for ${templateType}
✓ EXACTLY 6 charts using ALL DIFFERENT types: bar-chart, line-chart, pie-chart, donut-chart, area-chart, gauge
✓ Every KPI MUST have a specific, realistic "value" field (e.g., "$45.2K" not "$0" or empty)
✓ Use ONLY these colors cycling in order: ${finalPalette.join(', ')}
✓ Layout: KPIs in top 2 rows (y:50, y:170), Charts in bottom 2 rows (y:300, y:620)
✓ Positions: x values should be 50, 480, 910 for 3 columns
✓ NO overlapping components
✓ Titles should be specific to ${templateType} domain (not "KPI 1", "Chart 1")
✓ Choose chart types based on what makes sense for the data (trends=line, distribution=pie, comparison=bar, progress=gauge)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_template",
              description: "Create a dashboard template with components",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  components: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { 
                          type: "string", 
                          enum: ["kpi-card", "bar-chart", "line-chart", "pie-chart", "area-chart", "donut-chart", "gauge"],
                          description: "Component type - MUST use variety for charts"
                        },
                        title: { type: "string", description: "Specific title relevant to the domain" },
                        value: { type: "string", description: "REQUIRED for kpi-card and gauge - realistic value" },
                        color: { 
                          type: "string", 
                          enum: finalPalette,
                          description: `MUST be one of: ${finalPalette.join(', ')}`
                        },
                        position: {
                          type: "object",
                          properties: {
                            x: { type: "number" },
                            y: { type: "number" }
                          },
                          required: ["x", "y"]
                        },
                        size: {
                          type: "object",
                          properties: {
                            width: { type: "number" },
                            height: { type: "number" }
                          },
                          required: ["width", "height"]
                        }
                      },
                      required: ["type", "title", "color", "position", "size"]
                    }
                  }
                },
                required: ["name", "description", "components"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_template" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const templateSpec = JSON.parse(toolCall.function.arguments);
    
    // Validate and fix the template structure
    const kpis = templateSpec.components.filter((c: any) => c.type === "kpi-card" || c.type === "kpi");
    const charts = templateSpec.components.filter((c: any) => !["kpi-card", "kpi"].includes(c.type));
    
    console.log(`Template validation: ${kpis.length} KPIs, ${charts.length} charts`);
    
    // Ensure we have exactly 6 KPIs and 6 charts
    if (kpis.length !== 6 || charts.length !== 6) {
      console.warn(`Invalid template structure. Expected 6 KPIs and 6 charts, got ${kpis.length} KPIs and ${charts.length} charts`);
    }
    
    // POST-PROCESS: Enforce user palette on all components
    // This guarantees the user's colors are used regardless of what AI returns
    const enforceUserPalette = (components: any[]): any[] => {
      return components.map((comp: any, index: number) => {
        const paletteColor = finalPalette[index % finalPalette.length];
        return {
          ...comp,
          color: paletteColor,
          properties: {
            ...(comp.properties || {}),
            color: paletteColor,
          }
        };
      });
    };
    
    const allComponents = [...kpis, ...charts];
    const paletteEnforcedComponents = enforceUserPalette(allComponents);
    
    // Convert to dashboard components format with validation
    const components = paletteEnforcedComponents.map((comp: any, index: number) => {
      // Fix type name if needed
      const componentType = comp.type === "kpi" ? "kpi-card" : comp.type;
      const paletteColor = finalPalette[index % finalPalette.length];
      
      // Ensure KPIs and gauges have values
      let value = comp.value;
      if (componentType === "kpi-card" && !value) {
        const fallbackValues = ["$12.5K", "85%", "1,234", "45 min", "3.8/5", "142K"];
        value = fallbackValues[index % fallbackValues.length];
        console.warn(`Missing KPI value, using fallback: ${value}`);
      } else if (componentType === "gauge" && !value) {
        value = "75";
      }
      
      // Build properties with enforced palette color
      const isKpi = componentType === "kpi-card";
      const properties: any = {
        title: comp.title,
        value: value,
        shadow: true,
        borderRadius: 8,
      };
      
      // Apply palette color appropriately
      if (isKpi) {
        properties.backgroundColor = paletteColor;
        properties.color = paletteColor;
        properties.valueColor = '#ffffff'; // White text on colored background
      } else {
        properties.color = paletteColor;
        properties.backgroundColor = '#ffffff';
        // For charts with series, apply palette colors to each series
        properties.series = [
          { dataKey: 'value', color: paletteColor, name: comp.title || 'Value' }
        ];
      }
      
      return {
        id: `generated-${Date.now()}-${index}`,
        type: componentType,
        position: comp.position,
        size: comp.size,
        zIndex: index + 1,
        color: paletteColor,
        title: comp.title,
        value: value,
        data: !["kpi-card", "gauge"].includes(componentType) ? generateChartData(componentType) : undefined,
        properties
      };
    });

    return new Response(
      JSON.stringify({
        template: {
          id: `ai-generated-${Date.now()}`,
          name: templateSpec.name,
          description: templateSpec.description,
          thumbnail: "🤖",
          components: components,
          aiMeta: {
            palette: finalPalette,
            templateType,
            description
          }
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-template:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateChartData(chartType: string) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map(month => ({
    name: month,
    value: Math.floor(Math.random() * 100) + 20
  }));
}
