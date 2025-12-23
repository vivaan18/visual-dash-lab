import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dashboardData, question } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from dashboard data
    const context = buildDashboardContext(dashboardData);
    
    // Create the prompt
    const systemPrompt = `You are an expert data analyst AND UI/UX designer specializing in dashboard creation.

Your analysis should cover THREE key areas:

DATA INSIGHTS:
- Trends: Identify patterns over time
- Anomalies: Highlight unusual values or outliers
- Comparisons: Compare different dimensions (e.g., "Department A has 20% higher costs than average")
- Key metrics: Summarize important KPIs
- Data quality observations

CHART RECOMMENDATIONS:
- Suggest 2-4 new charts that would add value to this dashboard
- For each suggestion, specify chart type, purpose, and required data
- Explain how each chart complements existing visualizations
- Consider data relationships and storytelling flow
- Think about missing perspectives (time-series, distributions, correlations)
- **IMPORTANT**: Provide realistic sample data (6-8 data points) for each chart suggestion
  * Bar/Line/Area charts: Array of {name: string, value: number} objects
  * Pie/Donut charts: Array of {name: string, value: number} with 3-4 categories
  * Scatter charts: Array of {x: number, y: number} objects

DESIGN ENHANCEMENTS:
- Generate 3-4 DISTINCT color scheme options with creative names (e.g., "Professional Blue", "Vibrant Energy", "Nature Green", "Modern Purple")
- Each color scheme should include: name, theme (light/dark), 2-3 primary colors, 2-3 secondary colors, background color, text color, and reasoning
- Ensure color schemes are diverse and cater to different dashboard purposes (corporate, creative, technical, etc.)
- Recommend layout optimizations for better information hierarchy
- Suggest typography improvements (fonts, sizes, weights)
- Identify design inconsistencies across components
- Propose spacing and alignment improvements
- Consider visual balance and white space
- Ensure color contrast and accessibility

Be specific, actionable, and explain the reasoning behind each suggestion.`;

    const userPrompt = question 
      ? `${context}\n\nUser question: ${question}` 
      : context;

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
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_comprehensive_insights",
              description: "Generate comprehensive insights including data analysis, chart suggestions, and design recommendations",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "A brief 2-3 sentence overview of the dashboard"
                  },
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        type: { 
                          type: "string",
                          enum: ["trend", "anomaly", "comparison", "metric", "data-quality"]
                        },
                        severity: {
                          type: "string",
                          enum: ["high", "medium", "low"]
                        }
                      },
                      required: ["title", "description", "type", "severity"]
                    }
                  },
                  chartSuggestions: {
                    type: "array",
                    description: "2-4 suggestions for new charts that would enhance the dashboard",
                    items: {
                      type: "object",
                      properties: {
                        chartType: {
                          type: "string",
                          enum: ["bar-chart", "line-chart", "pie-chart", "donut-chart", "area-chart", "scatter-chart", "gauge", "heatmap"]
                        },
                        title: { type: "string", description: "Suggested chart title" },
                        description: { type: "string", description: "What this chart would show" },
                        dataRequirements: { type: "string", description: "What data is needed" },
                        reasoning: { type: "string", description: "Why this chart would be valuable" },
                        priority: {
                          type: "string",
                          enum: ["high", "medium", "low"]
                        },
                        sampleData: {
                          type: "array",
                          description: "Sample data array (6-8 points) to preview the chart. Format depends on chart type.",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string", description: "Category or label (for bar/line/pie charts)" },
                              value: { type: "number", description: "Value (for bar/line/pie charts)" },
                              x: { type: "number", description: "X coordinate (for scatter charts)" },
                              y: { type: "number", description: "Y coordinate (for scatter charts)" }
                            }
                          }
                        }
                      },
                      required: ["chartType", "title", "description", "dataRequirements", "reasoning", "priority", "sampleData"]
                    }
                  },
                  designRecommendations: {
                    type: "object",
                    properties: {
                      colorSchemes: {
                        type: "array",
                        description: "3-4 distinct color scheme options with different styles",
                        items: {
                          type: "object",
                          properties: {
                            name: { 
                              type: "string",
                              description: "Creative name for the color scheme (e.g., 'Professional Blue', 'Vibrant Energy')"
                            },
                            theme: {
                              type: "string",
                              enum: ["light", "dark"],
                              description: "Whether optimized for light or dark mode"
                            },
                            primary: {
                              type: "array",
                              items: { type: "string" },
                              description: "2-3 primary color hex codes"
                            },
                            secondary: {
                              type: "array",
                              items: { type: "string" },
                              description: "2-3 secondary/accent color hex codes"
                            },
                            background: {
                              type: "string",
                              description: "Background color hex code"
                            },
                            text: {
                              type: "string",
                              description: "Primary text color hex code"
                            },
                            reasoning: { 
                              type: "string",
                              description: "Why this scheme works for the dashboard"
                            }
                          },
                          required: ["name", "theme", "primary", "secondary", "background", "text", "reasoning"]
                        }
                      },
                      layout: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            area: { type: "string", description: "Which area of the dashboard" },
                            suggestion: { type: "string", description: "Specific improvement" },
                            impact: { type: "string", description: "Expected benefit" }
                          },
                          required: ["area", "suggestion", "impact"]
                        }
                      },
                      typography: {
                        type: "object",
                        properties: {
                          headingFont: { type: "string" },
                          bodyFont: { type: "string" },
                          reasoning: { type: "string" }
                        },
                        required: ["headingFont", "bodyFont", "reasoning"]
                      },
                      consistency: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of consistency improvements needed"
                      }
                    },
                    required: ["colorSchemes", "layout", "typography", "consistency"]
                  },
                  recommendations: {
                    type: "object",
                    properties: {
                      data: {
                        type: "array",
                        items: { type: "string" },
                        description: "Data-related recommendations"
                      },
                      visualization: {
                        type: "array",
                        items: { type: "string" },
                        description: "Visualization improvements"
                      },
                      design: {
                        type: "array",
                        items: { type: "string" },
                        description: "Design enhancements"
                      },
                      userExperience: {
                        type: "array",
                        items: { type: "string" },
                        description: "UX improvements"
                      }
                    },
                    required: ["data", "visualization", "design", "userExperience"]
                  }
                },
                required: ["summary", "insights", "chartSuggestions", "designRecommendations", "recommendations"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_comprehensive_insights" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const insights = JSON.parse(toolCall.function.arguments);
    console.log("Parsed insights:", JSON.stringify(insights, null, 2));

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildDashboardContext(dashboardData: any): string {
  const { title, description, components } = dashboardData;
  
  let context = `Dashboard: ${title}\n`;
  if (description) context += `Description: ${description}\n`;
  context += `\nTotal Components: ${components.length}\n`;
  
  // Analyze component types
  const typeCount: Record<string, number> = {};
  const colors: Set<string> = new Set();
  let hasTimeData = false;
  let minY = Infinity, maxY = -Infinity;
  
  components.forEach((comp: any) => {
    typeCount[comp.type] = (typeCount[comp.type] || 0) + 1;
    if (comp.properties?.color) colors.add(comp.properties.color);
    if (comp.properties?.backgroundColor) colors.add(comp.properties.backgroundColor);
    if (comp.position) {
      minY = Math.min(minY, comp.position.y);
      maxY = Math.max(maxY, comp.position.y);
    }
    
    // Check for time-series data
    if (comp.data) {
      const dataStr = JSON.stringify(comp.data);
      if (dataStr.includes('date') || dataStr.includes('month') || dataStr.includes('year')) {
        hasTimeData = true;
      }
    }
  });
  
  context += `\nComponent Distribution:\n`;
  Object.entries(typeCount).forEach(([type, count]) => {
    context += `  - ${type}: ${count}\n`;
  });
  
  context += `\nColor Palette (${colors.size} colors):\n  ${Array.from(colors).join(', ')}\n`;
  context += `\nLayout: Vertical span from y=${minY} to y=${maxY}\n`;
  context += `Time-series data present: ${hasTimeData ? 'Yes' : 'No'}\n`;
  
  // Identify missing chart types
  const allTypes = ['bar-chart', 'line-chart', 'pie-chart', 'donut-chart', 'area-chart', 'scatter-chart', 'gauge', 'heatmap'];
  const missingTypes = allTypes.filter(t => !typeCount[t]);
  if (missingTypes.length > 0) {
    context += `\nUnused chart types: ${missingTypes.join(', ')}\n`;
  }
  
  context += `\nDetailed Components:\n`;
  components.forEach((comp: any, idx: number) => {
    const props = comp.properties || {};
    context += `\n${idx + 1}. ${comp.type}`;
    
    if (props.title) context += ` - "${props.title}"`;
    if (props.value) context += ` (Value: ${props.value})`;
    if (props.color) context += ` (Color: ${props.color})`;
    
    // Position and size
    if (comp.position && comp.size) {
      context += `\n   Position: (${comp.position.x}, ${comp.position.y}), Size: ${comp.size.width}x${comp.size.height}`;
    }
    
    // Add chart data if available
    if (comp.data) {
      const dataStr = JSON.stringify(comp.data);
      context += `\n   Data sample: ${dataStr.slice(0, 150)}${dataStr.length > 150 ? '...' : ''}`;
    }
  });
  
  return context;
}
