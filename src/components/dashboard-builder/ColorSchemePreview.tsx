import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sun, Moon } from 'lucide-react';

export interface ColorScheme {
  name: string;
  theme: 'light' | 'dark';
  primary: string[];
  secondary: string[];
  background: string;
  text: string;
  reasoning: string;
}

interface ColorSchemePreviewProps {
  scheme: ColorScheme;
  isSelected?: boolean;
  onApply: () => void;
}

const ColorSchemePreview: React.FC<ColorSchemePreviewProps> = ({
  scheme,
  isSelected,
  onApply
}) => {
  return (
    <Card 
      className={`relative overflow-hidden transition-all ${
        isSelected 
          ? 'ring-2 ring-primary shadow-lg' 
          : 'hover:shadow-md hover:border-primary/50'
      }`}
    >
      <CardContent className="p-0">
        {/* Mini Dashboard Preview */}
        <div 
          className="p-4 space-y-3"
          style={{ backgroundColor: scheme.background }}
        >
          {/* Header with scheme name */}
          <div className="flex items-center justify-between mb-2">
            <h4 
              className="text-sm font-semibold flex items-center gap-2"
              style={{ color: scheme.text }}
            >
              {scheme.name}
              {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </h4>
            <Badge variant="outline" className="text-xs">
              {scheme.theme === 'light' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            </Badge>
          </div>

          {/* Mini KPI Cards */}
          <div className="grid grid-cols-2 gap-2">
            {scheme.primary.slice(0, 2).map((color, idx) => (
              <div
                key={idx}
                className="rounded p-2 shadow-sm"
                style={{ 
                  backgroundColor: color,
                  color: '#ffffff'
                }}
              >
                <div className="text-[10px] opacity-80">Metric {idx + 1}</div>
                <div className="text-sm font-bold">{(idx + 1) * 1234}</div>
              </div>
            ))}
          </div>

          {/* Mini Chart Placeholder */}
          <div
            className="rounded p-3 shadow-sm"
            style={{ 
              backgroundColor: scheme.theme === 'light' ? '#ffffff' : 'rgba(0,0,0,0.2)',
              border: `1px solid ${scheme.primary[0]}20`
            }}
          >
            <div className="flex items-end gap-1 h-12">
              {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8].map((height, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${height * 100}%`,
                    backgroundColor: scheme.primary[idx % scheme.primary.length],
                    opacity: 0.8
                  }}
                />
              ))}
            </div>
          </div>

          {/* Color Palette Display */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-1">
              <span className="text-[9px] opacity-60" style={{ color: scheme.text }}>Primary:</span>
              <div className="flex gap-1">
                {scheme.primary.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-sm border shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] opacity-60" style={{ color: scheme.text }}>Accent:</span>
              <div className="flex gap-1">
                {scheme.secondary.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-sm border shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Reasoning */}
          <p 
            className="text-[10px] leading-relaxed opacity-70 pt-2 border-t"
            style={{ 
              color: scheme.text,
              borderColor: `${scheme.text}20`
            }}
          >
            {scheme.reasoning}
          </p>

          {/* Apply Button */}
          <Button
            onClick={onApply}
            size="sm"
            className="w-full mt-3"
            variant={isSelected ? "default" : "outline"}
          >
            {isSelected ? 'Applied' : 'Apply This Scheme'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ColorSchemePreview;
