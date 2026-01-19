import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { 
  X, 
  Search, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Lightbulb,
  Palette,
  Plus,
  Sparkles,
  Rocket
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

interface ResearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddKPI: (kpi: { name: string; value: string; trend: 'up' | 'down' | 'stable' }) => void;
  onAddChart: (chart: { type: string; title: string }) => void;
  onApplyPalette: (colors: string[]) => void;
  onGenerateDashboard: (research: ResearchResult) => void;
}

// Floating particles component
const FloatingParticles: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-500/20 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
};

// Animated gradient orb
const GradientOrb: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <div className={`relative w-10 h-10 ${isLoading ? 'animate-pulse' : ''}`}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-80 blur-sm" />
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-white" />
      </div>
      {isLoading && (
        <div className="absolute -inset-1 rounded-full border-2 border-blue-400/50 animate-ping" />
      )}
    </div>
  );
};

const ResearchPanel: React.FC<ResearchPanelProps> = ({
  isOpen,
  onClose,
  onAddKPI,
  onAddChart,
  onApplyPalette,
  onGenerateDashboard
}) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [research, setResearch] = useState<ResearchResult | null>(null);
  const [addedKPIs, setAddedKPIs] = useState<Set<number>>(new Set());
  const [addedCharts, setAddedCharts] = useState<Set<number>>(new Set());
  const [paletteApplied, setPaletteApplied] = useState(false);

  // Reset state when panel opens
  useEffect(() => {
    if (isOpen) {
      setAddedKPIs(new Set());
      setAddedCharts(new Set());
      setPaletteApplied(false);
    }
  }, [isOpen]);

  const handleResearch = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    setResearch(null);
    setAddedKPIs(new Set());
    setAddedCharts(new Set());
    setPaletteApplied(false);

    try {
      const { data, error } = await supabase.functions.invoke('research-topic', {
        body: { topic: topic.trim() }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Research Error",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      setResearch(data);
      toast({
        title: "Research Complete",
        description: `Found insights for "${topic}"`,
      });
    } catch (err) {
      console.error('Research error:', err);
      toast({
        title: "Error",
        description: "Failed to research topic. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddKPI = (metric: ResearchResult['keyMetrics'][0], index: number) => {
    onAddKPI({
      name: metric.name,
      value: metric.sampleValue,
      trend: metric.trend
    });
    setAddedKPIs(prev => new Set([...prev, index]));
  };

  const handleAddChart = (chart: ResearchResult['suggestedCharts'][0], index: number) => {
    onAddChart({
      type: chart.type,
      title: chart.title
    });
    setAddedCharts(prev => new Set([...prev, index]));
  };

  const handleApplyPalette = () => {
    if (research?.colorPalette) {
      onApplyPalette(research.colorPalette);
      setPaletteApplied(true);
    }
  };

  const handleGenerateDashboard = () => {
    if (research) {
      onGenerateDashboard(research);
      toast({
        title: "Dashboard Generated",
        description: "Your dashboard has been created from research data!",
      });
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-emerald-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  const getChartIcon = (type: string) => {
    if (type.includes('bar')) return <BarChart3 className="h-4 w-4" />;
    if (type.includes('line')) return <LineChart className="h-4 w-4" />;
    if (type.includes('pie') || type.includes('donut')) return <PieChart className="h-4 w-4" />;
    if (type.includes('area')) return <Activity className="h-4 w-4" />;
    return <BarChart3 className="h-4 w-4" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl animate-slide-in-right flex flex-col">
        <FloatingParticles />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <GradientOrb isLoading={loading} />
            <div>
              <h2 className="text-lg font-semibold text-white">Research Lab</h2>
              <p className="text-xs text-slate-400">AI-powered dashboard research</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-sm" />
            <div className="relative flex gap-2">
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What dashboard do you want to build?"
                className="bg-slate-800/80 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500/50"
                onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
              />
              <Button
                onClick={handleResearch}
                disabled={loading || !topic.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            e.g., "SaaS metrics", "E-commerce sales", "Marketing campaign"
          </p>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          {loading && !research && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-blue-400 animate-pulse" />
                </div>
              </div>
              <p className="text-slate-400 text-sm">Researching "{topic}"...</p>
            </div>
          )}

          {research && (
            <div className="space-y-6">
              {/* Summary Card */}
              <div 
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm animate-fade-in"
                style={{ animationDelay: '0ms' }}
              >
                <p className="text-sm text-slate-300 leading-relaxed">{research.summary}</p>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                  Key Metrics
                </h3>
                <div className="grid gap-2">
                  {research.keyMetrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="group p-3 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:border-purple-500/30 transition-all"
                      style={{ animationDelay: `${150 + idx * 50}ms` }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white text-sm truncate">{metric.name}</span>
                            {getTrendIcon(metric.trend)}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{metric.description}</p>
                          <p className="text-lg font-bold text-blue-400 mt-1">{metric.sampleValue}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddKPI(metric, idx)}
                          disabled={addedKPIs.has(idx)}
                          className={`shrink-0 ${addedKPIs.has(idx) ? 'text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                        >
                          {addedKPIs.has(idx) ? '✓' : <Plus className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Charts */}
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  Suggested Charts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {research.suggestedCharts.map((chart, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddChart(chart, idx)}
                      disabled={addedCharts.has(idx)}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                        addedCharts.has(idx)
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-slate-800/40 border-slate-700/30 text-slate-300 hover:border-blue-500/50 hover:text-white'
                      }`}
                    >
                      {getChartIcon(chart.type)}
                      <span className="text-sm">{chart.title}</span>
                      {addedCharts.has(idx) && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Facts */}
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-400" />
                  Quick Facts
                </h3>
                <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/30 space-y-2">
                  {research.quickFacts.map((fact, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span className="text-slate-300">{fact}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div className="space-y-3 animate-fade-in" style={{ animationDelay: '500ms' }}>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Palette className="h-4 w-4 text-pink-400" />
                  Recommended Palette
                </h3>
                <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/30">
                  <div className="flex gap-2 mb-3">
                    {research.colorPalette.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-10 h-10 rounded-lg shadow-lg ring-2 ring-white/10"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleApplyPalette}
                    disabled={paletteApplied}
                    className={`w-full ${
                      paletteApplied 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {paletteApplied ? '✓ Palette Applied' : 'Apply Palette'}
                  </Button>
                </div>
              </div>

              {/* Generate Dashboard Button */}
              <div className="pt-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
                <Button
                  onClick={handleGenerateDashboard}
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-6 rounded-xl shadow-lg shadow-purple-500/25"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Generate Full Dashboard
                </Button>
              </div>
            </div>
          )}

          {!loading && !research && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-slate-800/60 flex items-center justify-center">
                <Search className="h-8 w-8 text-slate-500" />
              </div>
              <div>
                <p className="text-slate-400">Enter a topic to start researching</p>
                <p className="text-xs text-slate-500 mt-1">AI will find metrics, charts, and insights for you</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ResearchPanel;
