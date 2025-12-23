import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, LineChart, PieChart, ScatterChart, Radar, TrendingDown, Eye } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area, ScatterChart as RechartsScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar, FunnelChart, Funnel, XAxis, YAxis, Tooltip } from "recharts";
import { generateSampleDataForChartType } from "@/lib/chartPreviewData";

interface ChartSuggestion {
  chartType: string;
  title: string;
  description: string;
  dataRequirements: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  columns?: string[];
  sampleData?: any[];
}

interface ChartSuggestionPreviewProps {
  suggestion: ChartSuggestion;
  isSelected: boolean;
  onAdd: (suggestion: ChartSuggestion) => void;
  onPreview: (suggestion: ChartSuggestion) => void;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8b5cf6', '#06b6d4', '#f59e0b'];

const getChartIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    'bar-chart': BarChart3,
    'bar': BarChart3,
    'line-chart': LineChart,
    'line': LineChart,
    'area-chart': LineChart,
    'area': LineChart,
    'pie-chart': PieChart,
    'pie': PieChart,
    'donut-chart': PieChart,
    'donut': PieChart,
    'scatter-chart': ScatterChart,
    'scatter': ScatterChart,
    'radar-chart': Radar,
    'radar': Radar,
    'funnel-chart': TrendingDown,
    'funnel': TrendingDown,
  };
  return iconMap[type] || BarChart3;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'default';
  }
};

export const ChartSuggestionPreview = ({ suggestion, isSelected, onAdd, onPreview }: ChartSuggestionPreviewProps) => {
  const Icon = getChartIcon(suggestion.chartType);
  const data = suggestion.sampleData || generateSampleDataForChartType(suggestion.chartType);

  const renderMiniChart = () => {
    const chartType = suggestion.chartType.toLowerCase();

    switch (chartType) {
      case 'bar-chart':
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line-chart':
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data}>
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'area-chart':
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie-chart':
      case 'pie':
      case 'donut-chart':
      case 'donut':
        const innerRadius = chartType.includes('donut') ? '40%' : '0%';
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius="70%"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'scatter-chart':
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsScatterChart>
              <Scatter data={data} fill="hsl(var(--primary))" />
            </RechartsScatterChart>
          </ResponsiveContainer>
        );

      case 'radar-chart':
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <RechartsRadar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'funnel-chart':
      case 'funnel':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Funnel dataKey="value" data={data}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card 
      className={`overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
        isSelected ? 'ring-2 ring-primary border-primary bg-primary/5' : 'hover:border-primary/50'
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">{suggestion.title}</h4>
          </div>
          <Badge variant={getPriorityColor(suggestion.priority)}>
            {suggestion.priority}
          </Badge>
        </div>

        {/* Chart Preview */}
        <div className="bg-muted/30 rounded-lg p-2 mb-3" style={{ height: '120px' }}>
          {renderMiniChart()}
        </div>

        {/* Chart Type */}
        <div className="mb-2">
          <span className="text-xs font-medium text-muted-foreground">Chart Type: </span>
          <span className="text-xs capitalize">{suggestion.chartType.replace('-', ' ')}</span>
        </div>

        {/* Reasoning */}
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {suggestion.reasoning}
        </p>

        {/* Columns if available */}
        {suggestion.columns && suggestion.columns.length > 0 && (
          <div className="mb-3">
            <span className="text-xs font-medium text-muted-foreground">Data: </span>
            <span className="text-xs">{suggestion.columns.join(', ')}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onPreview(suggestion)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAdd(suggestion)}
          >
            Add to Dashboard
          </Button>
        </div>
      </div>
    </Card>
  );
};
