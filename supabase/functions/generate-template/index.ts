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

serve(async (req: any) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateType, description, features } = await req.json();
    // Support multiple env var names so projects that already have a GEMINI key can reuse it.
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("GEMINI_API_KEY") || Deno.env.get("VITE_GEMINI_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY or GEMINI_API_KEY is not configured");
    }

    console.log("Generating template:", { templateType, description, features });

    const systemPrompt = `You are a dashboard template generator. Generate professional, well-designed dashboard templates.
    
Return a JSON object with this EXACT structure:
{
  "name": "Template name",
  "description": "Brief description",
  "components": [
    {
      "type": "kpi-card" | "bar-chart" | "line-chart" | "pie-chart" | "area-chart" | "donut-chart" | "gauge",
      "title": "Component title",
      "value": "REQUIRED for KPI and gauge types - realistic values like '$125K', '85%', '1,234 users', '45 mins', '2.5K'",
      "color": "#3b82f6 | #10b981 | #8b5cf6 | #f59e0b | #ef4444 | #ec4899",
      "position": {"x": number, "y": number},
      "size": {"width": number, "height": number}
    }
  ]
}

CRITICAL REQUIREMENTS:
1. EXACTLY 6 KPI cards with realistic, contextual dummy values (NEVER empty or "0")
2. EXACTLY 6 charts of DIFFERENT types (variety is key - mix bar, line, pie, donut, area, gauge)
3. Cohesive color palette: Pick 2-3 hex colors from the list and reuse them consistently
4. Grid Layout (DO NOT OVERLAP):
   - Row 1 (y:50): 6 KPIs in 2 rows of 3 - positions: x=50,480,910 and x=50,480,910 with y=50 and y=170
   - Row 2-3 (y:300, y:620): 6 charts in 2 rows of 3 - same x positions
5. Sizes: KPI cards 280x120, Charts 380x280
6. Value Format Examples: "$1.2M", "85%", "2,456", "45 min", "3.8/5", "142K users"
7. Titles must be specific and relevant to template type (not generic)
8. For gauge type, value should be a number between 0-100`;

    const userPrompt = `Generate a ${templateType} dashboard template.
Description: ${description}
Required features: ${features}

MANDATORY CHECKLIST:
✓ EXACTLY 6 KPI cards (type: "kpi-card") with realistic values appropriate for this domain
✓ EXACTLY 6 different chart types from: bar-chart, line-chart, pie-chart, donut-chart, area-chart, gauge
✓ Every KPI MUST have a specific, realistic "value" field (e.g., "$45.2K" not "$0" or empty)
✓ Pick 2-3 colors from the palette and use them consistently across all 12 components
✓ Layout: KPIs in top 2 rows (y:50, y:170), Charts in bottom 2 rows (y:300, y:620)
✓ Positions: x values should be 50, 480, 910 for 3 columns
✓ NO overlapping components
✓ Titles should be specific to ${templateType} domain (not "KPI 1", "Chart 1")`;

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
                        type: { type: "string", enum: ["kpi-card", "bar-chart", "line-chart", "pie-chart", "area-chart", "donut-chart", "gauge"] },
                        title: { type: "string" },
                        value: { type: "string", description: "Required for kpi-card and gauge types" },
                        color: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
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
    
    // Convert to dashboard components format with validation
    const components = templateSpec.components.map((comp: any, index: number) => {
      // Fix type name if needed
      const componentType = comp.type === "kpi" ? "kpi-card" : comp.type;
      
      // Ensure KPIs and gauges have values
      let value = comp.value;
      if (componentType === "kpi-card" && !value) {
        // Generate a fallback value if missing
        const fallbackValues = ["$12.5K", "85%", "1,234", "45 min", "3.8/5", "142K"];
        value = fallbackValues[index % fallbackValues.length];
        console.warn(`Missing KPI value, using fallback: ${value}`);
      } else if (componentType === "gauge" && !value) {
        value = "75";
      }
      
      return {
        id: `generated-${Date.now()}-${index}`,
        type: componentType,
        position: comp.position,
        size: comp.size,
        zIndex: index + 1,
        color: comp.color,
        title: comp.title,
        value: value,
        data: !["kpi-card", "gauge"].includes(componentType) ? generateChartData(componentType) : undefined,
        properties: {
          title: comp.title,
          value: value,
          color: comp.color,
          shadow: true,
          backgroundColor: undefined,
          borderRadius: undefined,
        }
      };
    });

    return new Response(
      JSON.stringify({
        template: {
          id: `ai-generated-${Date.now()}`,
          name: templateSpec.name,
          description: templateSpec.description,
          thumbnail: "🤖",
          components: components
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



/////////today