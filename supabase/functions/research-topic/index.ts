import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResearchResult {
  summary: string;
  keyMetrics: Array<{
    name: string;
    description: string;
    sampleValue: string;
    trend: 'up' | 'down' | 'stable';
  }>;
  suggestedCharts: Array<{
    type: 'bar-chart' | 'line-chart' | 'pie-chart' | 'area-chart' | 'donut-chart' | 'kpi-card';
    title: string;
    description: string;
  }>;
  quickFacts: string[];
  colorPalette: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic } = await req.json();
    
    if (!topic || typeof topic !== 'string') {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a dashboard research assistant. When given a topic, you research and provide structured data that helps users build dashboards about that topic.

Your goal is to provide:
1. A brief summary of what this dashboard should focus on
2. Key metrics/KPIs that are commonly tracked for this topic
3. Suggested chart types with specific titles
4. Quick facts and industry insights
5. A color palette that suits the topic's industry/theme

Be specific, practical, and provide realistic sample values.`;

    const userPrompt = `Research the following topic for building a dashboard: "${topic}"

Provide comprehensive research data including:
- Key metrics with realistic sample values and trends
- Suggested chart types that would effectively visualize this data
- Quick facts about this topic/industry
- A color palette (5 hex colors) that would suit this dashboard theme`;

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
              name: "provide_research_data",
              description: "Provide structured research data for building a dashboard about the given topic",
              parameters: {
                type: "object",
                properties: {
                  summary: {
                    type: "string",
                    description: "Brief 2-3 sentence summary of what this dashboard should focus on"
                  },
                  keyMetrics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Name of the metric/KPI" },
                        description: { type: "string", description: "What this metric measures" },
                        sampleValue: { type: "string", description: "A realistic sample value (e.g., '$1.2M', '45%', '12,500')" },
                        trend: { type: "string", enum: ["up", "down", "stable"], description: "Current trend direction" }
                      },
                      required: ["name", "description", "sampleValue", "trend"],
                      additionalProperties: false
                    },
                    description: "4-6 key metrics/KPIs for this topic"
                  },
                  suggestedCharts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { 
                          type: "string", 
                          enum: ["bar-chart", "line-chart", "pie-chart", "area-chart", "donut-chart", "kpi-card"],
                          description: "Type of chart to use"
                        },
                        title: { type: "string", description: "Title for the chart" },
                        description: { type: "string", description: "What this chart will show" }
                      },
                      required: ["type", "title", "description"],
                      additionalProperties: false
                    },
                    description: "4-6 suggested charts with titles"
                  },
                  quickFacts: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-7 quick facts or industry insights about this topic"
                  },
                  colorPalette: {
                    type: "array",
                    items: { type: "string" },
                    description: "5 hex color codes that suit this dashboard theme (e.g., '#6366f1')"
                  }
                },
                required: ["summary", "keyMetrics", "suggestedCharts", "quickFacts", "colorPalette"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_research_data" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "provide_research_data") {
      throw new Error("Unexpected AI response format");
    }

    const researchData: ResearchResult = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(researchData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Research error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
