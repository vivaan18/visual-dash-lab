import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, TrendingUp, AlertCircle, BarChart3, Lightbulb, Send, Loader2, PieChart, Palette, Activity, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { DashboardComponent } from '@/types/dashboard';
import ColorSchemePreview, { ColorScheme } from './ColorSchemePreview';
import { ChartSuggestionPreview } from './ChartSuggestionPreview';

interface InsightsPanelProps {
  dashboardTitle: string;
  dashboardDescription: string | null;
  components: DashboardComponent[];
  onClose: () => void;
  onApplyColorScheme?: (scheme: ColorScheme) => void;
  onAddChart?: (suggestion: ChartSuggestion) => void;
}

interface Insight {
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'comparison' | 'metric' | 'data-quality';
  severity: 'high' | 'medium' | 'low';
}

interface ChartSuggestion {
  chartType: string;
  title: string;
  description: string;
  dataRequirements: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  sampleData?: any[];
}

interface DesignRecommendations {
  colorSchemes: ColorScheme[];
  layout: Array<{
    area: string;
    suggestion: string;
    impact: string;
  }>;
  typography: {
    headingFont: string;
    bodyFont: string;
    reasoning: string;
  };
  consistency: string[];
}

interface InsightsData {
  summary: string;
  insights: Insight[];
  chartSuggestions: ChartSuggestion[];
  designRecommendations: DesignRecommendations;
  recommendations: {
    data: string[];
    visualization: string[];
    design: string[];
    userExperience: string[];
  };
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  dashboardTitle,
  dashboardDescription,
  components,
  onClose,
  onApplyColorScheme,
  onAddChart
}) => {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [selectedSchemeIndex, setSelectedSchemeIndex] = useState<number | null>(null);
  const [selectedChartIndex, setSelectedChartIndex] = useState<number | null>(null);
  const [previewChartIndex, setPreviewChartIndex] = useState<number | null>(null);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async (userQuestion?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-insights', {
        body: {
          dashboardData: {
            title: dashboardTitle,
            description: dashboardDescription,
            components
          },
          question: userQuestion
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      console.log('Received insights data:', data);
      
      // Ensure data structure is valid with default empty arrays
      const validatedData: InsightsData = {
        summary: data.summary || 'No summary available',
        insights: Array.isArray(data.insights) ? data.insights : [],
        chartSuggestions: Array.isArray(data.chartSuggestions) ? data.chartSuggestions : [],
        designRecommendations: data.designRecommendations || {
          colorSchemes: [],
          layout: [],
          typography: { headingFont: '', bodyFont: '', reasoning: '' },
          consistency: []
        },
        recommendations: data.recommendations || {
          data: [],
          visualization: [],
          design: [],
          userExperience: []
        }
      };
      
      setInsights(validatedData);
      
      if (userQuestion) {
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: userQuestion },
          { role: 'assistant', content: validatedData.summary }
        ]);
      }
    } catch (err) {
      console.error('Error generating insights:', err);
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = () => {
    if (!question.trim()) return;
    generateInsights(question);
    setQuestion('');
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'anomaly': return <AlertCircle className="h-4 w-4" />;
      case 'comparison': return <BarChart3 className="h-4 w-4" />;
      case 'metric': return <Sparkles className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getChartIcon = (chartType: string) => {
    if (chartType.includes('bar')) return <BarChart3 className="h-5 w-5" />;
    if (chartType.includes('line')) return <TrendingUp className="h-5 w-5" />;
    if (chartType.includes('pie') || chartType.includes('donut')) return <PieChart className="h-5 w-5" />;
    return <Activity className="h-5 w-5" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleApplyColorScheme = (scheme: ColorScheme, index: number) => {
    setSelectedSchemeIndex(index);
    if (onApplyColorScheme) {
      onApplyColorScheme(scheme);
    }
    toast({
      title: "Color Scheme Applied",
      description: `"${scheme.name}" has been applied to your dashboard.`,
    });
  };

  const handleAddChart = (suggestion: ChartSuggestion, index: number) => {
    setSelectedChartIndex(index);
    if (onAddChart) {
      onAddChart(suggestion);
    }
    toast({
      title: "Chart Added",
      description: `"${suggestion.title}" has been added to your dashboard.`,
    });
  };

  const handlePreviewChart = (suggestion: ChartSuggestion, index: number) => {
    setPreviewChartIndex(index);
  };

  return (
    <div className="w-96 h-full bg-card/60 backdrop-blur-sm border-l border-border shadow-card-enhanced flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Insights
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 px-6">
        {loading && !insights ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Analyzing your dashboard...</p>
          </div>
        ) : insights ? (
          <div className="space-y-6 pb-6">
            {/* Summary */}
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed">{insights.summary}</p>
              </CardContent>
            </Card>

            {/* Insights */}
            {insights.insights?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Key Findings</h3>
                {insights.insights.map((insight, idx) => (
                  <Card key={idx}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getInsightIcon(insight.type)}</div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">{insight.title}</h4>
                            <Badge variant={getSeverityColor(insight.severity)} className="text-xs">
                              {insight.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Chart Suggestions */}
            {insights.chartSuggestions && insights.chartSuggestions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Suggested Charts
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {insights.chartSuggestions.map((suggestion, idx) => (
                    <ChartSuggestionPreview
                      key={idx}
                      suggestion={suggestion}
                      isSelected={selectedChartIndex === idx}
                      onAdd={(s) => handleAddChart(s, idx)}
                      onPreview={(s) => handlePreviewChart(s, idx)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Design Recommendations */}
            {insights.designRecommendations && (
              insights.designRecommendations.colorSchemes?.length > 0 ||
              insights.designRecommendations.layout?.length > 0 ||
              insights.designRecommendations.typography?.headingFont ||
              insights.designRecommendations.consistency?.length > 0
            ) && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Design Enhancements
                </h3>

                {/* Color Scheme Options */}
                {insights.designRecommendations.colorSchemes && 
                 insights.designRecommendations.colorSchemes.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground">Color Scheme Options</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {insights.designRecommendations.colorSchemes.map((scheme, idx) => (
                        <ColorSchemePreview
                          key={idx}
                          scheme={scheme}
                          isSelected={selectedSchemeIndex === idx}
                          onApply={() => handleApplyColorScheme(scheme, idx)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Layout Improvements */}
                {insights.designRecommendations.layout && insights.designRecommendations.layout.length > 0 && (
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">Layout & Spacing</h4>
                      <div className="space-y-2">
                        {insights.designRecommendations.layout.map((item, idx) => (
                          <div key={idx} className="p-2 bg-muted/50 rounded text-xs space-y-1">
                            <p className="font-medium">{item.area}</p>
                            <p className="leading-relaxed">{item.suggestion}</p>
                            <p className="text-muted-foreground italic">Impact: {item.impact}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Typography */}
                {insights.designRecommendations.typography && insights.designRecommendations.typography.headingFont && (
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">Typography</h4>
                      <div className="text-xs space-y-1">
                        <p><strong>Headings:</strong> {insights.designRecommendations.typography.headingFont}</p>
                        <p><strong>Body:</strong> {insights.designRecommendations.typography.bodyFont}</p>
                        {insights.designRecommendations.typography.reasoning && (
                          <p className="text-muted-foreground italic pt-1 leading-relaxed">
                            {insights.designRecommendations.typography.reasoning}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Consistency */}
                {insights.designRecommendations.consistency && insights.designRecommendations.consistency.length > 0 && (
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">Consistency Improvements</h4>
                      <ul className="space-y-1">
                        {insights.designRecommendations.consistency.map((item, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Categorized Recommendations */}
            {insights.recommendations && (
              insights.recommendations.data?.length > 0 ||
              insights.recommendations.visualization?.length > 0 ||
              insights.recommendations.design?.length > 0 ||
              insights.recommendations.userExperience?.length > 0
            ) && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Action Items
                </h3>
                
                {insights.recommendations.data && insights.recommendations.data.length > 0 && (
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">Data Improvements</h4>
                      <ul className="space-y-1">
                        {insights.recommendations.data.map((rec, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {insights.recommendations.visualization && insights.recommendations.visualization.length > 0 && (
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">Visualization</h4>
                      <ul className="space-y-1">
                        {insights.recommendations.visualization.map((rec, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {insights.recommendations.design && insights.recommendations.design.length > 0 && (
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">Design</h4>
                      <ul className="space-y-1">
                        {insights.recommendations.design.map((rec, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {insights.recommendations.userExperience && insights.recommendations.userExperience.length > 0 && (
                  <Card>
                    <CardContent className="pt-4 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground">User Experience</h4>
                      <ul className="space-y-1">
                        {insights.recommendations.userExperience.map((rec, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span className="leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Chat History */}
            {chatHistory.length > 0 && (
              <div className="space-y-3">
                <Separator />
                <h3 className="text-sm font-semibold">Conversation</h3>
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`text-xs p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary/10 ml-4'
                        : 'bg-muted mr-4'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </ScrollArea>

      {/* Ask Question */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Ask a follow-up question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
            disabled={loading}
          />
          <Button 
            size="icon" 
            onClick={handleAskQuestion}
            disabled={loading || !question.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
