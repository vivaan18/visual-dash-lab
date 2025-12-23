// src/components/dashboard-builder/DashboardComponent.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronUp, ChevronDown, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import type { DashboardComponent as ComponentType } from '@/types/dashboard';
import ChartRenderer from './ChartRenderer';
import ShapeRenderer from './ShapeRenderer';
import ChartConfigDialog from './ChartConfigDialog';

// --- MOCK Renderer Definitions (Replace with your actual components) ---
const TextRenderer: any = ({ component }: { component: any }) => {
  const text = component.properties.text || 'Text Element';
  const textColor = component.properties.textColor || component.properties.color || '#111827';
  const fontSize = component.properties.textFontSize || 14;
  const textAlign = component.properties.textAlign || 'left';
  const fontWeight = component.properties.textBold ? '700' : '400';
  const fontStyle = component.properties.textItalic ? 'italic' : 'normal';
  const bg = component.properties.backgroundColor || 'transparent';

  return (
    <div className="h-full w-full overflow-auto" style={{ padding: 0, background: bg }}>
      <div
        style={{ color: textColor, fontSize: fontSize, textAlign: textAlign as any, fontWeight, fontStyle, lineHeight: 1.2 }}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
};

const ImageRenderer: any = ({ component }: { component: any }) => {
    const url = component.properties.url || 'https://via.placeholder.com/400x300?text=Image+Element';
    const alt = component.properties.alt || 'Image';
    const fit = component.properties.fit || 'contain';

    return (
        <div className="h-full w-full overflow-hidden flex items-center justify-center" style={{ padding: 0 }}>
            <img
                src={url}
                alt={alt}
                style={{ width: '100%', height: '100%', objectFit: fit as any }}
            />
        </div>
    );
};
const DataTableRenderer: any = ({ component, isDarkMode }: { component: any, isDarkMode: boolean }) => {
  const data: any[] = Array.isArray(component.properties.data) ? component.properties.data : [];
  const cols: string[] = (Array.isArray(component.properties.columns) && component.properties.columns.length)
    ? component.properties.columns
    : (data.length ? Object.keys(data[0]).filter((k) => k !== 'id') : ['Column1', 'Column2']);

  const showHeader = component.properties.showHeader !== false;

  return (
    <div className={`h-full w-full p-2 overflow-auto ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {/* Render title if provided and not explicitly hidden */}
      {component.properties.title && component.properties.showTitle !== false && (
        <div className="w-full text-center text-sm font-medium mb-2" style={{ color: component.properties.titleColor || (isDarkMode ? '#fff' : '#111827'), fontSize: component.properties.titleFontSize || 14 }}>
          {component.properties.title}
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200">
        {showHeader && (
          <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
            <tr>
              {cols.map((c: string) => (
                <th key={c} className="px-3 py-2 text-xs font-medium uppercase tracking-wider">{c}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className={isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}>
          {data && data.length ? data.map((row: any, ri: number) => (
            <tr key={ri} className="odd:bg-transparent">
              {cols.map((c) => (
                <td key={c} className="px-3 py-2 whitespace-nowrap">{row[c] ?? ''}</td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={cols.length} className="px-3 py-2 text-xs text-muted-foreground">No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
const KPICardRenderer: any = ({ component, isDarkMode }: { component: any, isDarkMode: boolean }) => {
  // prefer explicit 'value', fallback to 'targetValue' for older templates
  const rawValue = typeof component.properties.value === 'number' ? component.properties.value : component.properties.targetValue;
  const value = typeof rawValue === 'number' ? rawValue : 0;
  // keep existing behavior for undefined (show 'Metric'), but respect an explicit empty string
  const label = component.properties.kpiLabel === undefined ? 'Metric' : component.properties.kpiLabel;
  const color = component.properties.color || '#3b82f6';
  const bgColor = component.properties.backgroundColor || 'transparent';
  const showTrend = component.properties.showTrend || false;
  const target = typeof component.properties.targetValue === 'number' ? component.properties.targetValue : undefined;
  const delta = typeof target === 'number' ? value - target : undefined;
  const deltaPercent = typeof target === 'number' && target !== 0 ? Math.round(((value - target) / Math.abs(target)) * 100) : undefined;

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4" style={{ background: bgColor, borderRadius: component.properties.borderRadius ?? 6 }}>
      {component.properties.title && (
        <div className={`w-full text-center text-sm font-medium mb-2`} style={{ color: component.properties.titleColor || '#111827', fontSize: component.properties.titleFontSize || 14 }}>
          {component.properties.title}
        </div>
      )}

      <div className="flex items-center space-x-3">
        <div className="text-4xl font-bold" style={{ color: component.properties.valueColor || color, fontSize: component.properties.valueFontSize || 36 }}>
          {value.toLocaleString()}
        </div>
        {showTrend && typeof delta === 'number' && (
          <div className="flex flex-col items-center text-sm">
            {delta > 0 ? (
              <TrendingUp className="text-green-500" />
            ) : delta < 0 ? (
              <TrendingDown className="text-red-500" />
            ) : (
              <div className="text-gray-400">—</div>
            )}
            <div className="text-xs text-muted-foreground">
              {deltaPercent !== undefined ? `${deltaPercent}%` : delta}
            </div>
          </div>
        )}
      </div>

      <div className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</div>
    </div>
  );
};
// --- END MOCK Renderer Definitions ---


interface DashboardComponentProps {
  component: ComponentType;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ComponentType>) => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  isPreviewMode: boolean;
  isDarkMode: boolean;
}

const DashboardComponent: React.FC<DashboardComponentProps> = ({
  component,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onBringToFront,
  onSendToBack,
  isPreviewMode,
  isDarkMode
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // FIX: Use local state for drag position to prevent global re-renders
  const [localPosition, setLocalPosition] = useState(component.position);
  // Ref to store the latest position for mouseUp
  const positionRef = useRef(component.position);

  // Sync local position state when the prop changes
  useEffect(() => {
    if (!isDragging) {
      setLocalPosition(component.position);
      positionRef.current = component.position;
    }
  }, [component.position, isDragging]);


  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging when preview mode or when the configuration dialog is open.
    // If the dialog is open, we want inputs inside the dialog to receive focus/clicks.
    if (isPreviewMode || isConfigOpen) return;

    e.preventDefault();
    e.stopPropagation();
    
    onSelect();
    
    setIsDragging(true); 
    
    const startX = e.clientX - localPosition.x;
    const startY = e.clientY - localPosition.y;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      
      setLocalPosition({ x: newX, y: newY });
      positionRef.current = { x: newX, y: newY };
    };

    const handleMouseUp = () => {
      setIsDragging(false); 
      onUpdate({ position: positionRef.current });
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleConfigUpdate = (updates: Partial<ComponentType>) => {
    onUpdate(updates);
  };
  
  // List of all component types that have a settings cog
  const configurableTypes: ComponentType['type'][] = [
    'bar-chart', 'column-chart', 'line-chart', 'area-chart', 'pie-chart', 'donut-chart', 
    'scatter-chart', 'gauge', 'kpi-card', 'text', 'image', 'data-table', 'table', 'funnel-chart', 
    'combo-chart', 'multi-line', 'multi-bar', 'multi-area', 'stacked-bar', 'stacked-area', 
    'shape', 'ellipse', 'triangle', 'rectangle', 'circle', 'line', 'arrow'
  ];
  
  const isConfigurable = configurableTypes.includes(component.type);
  
  // --- Component Type Routing ---
  let contentRenderer;
  
  const chartTypes: ComponentType['type'][] = [
    'bar-chart', 'column-chart', 'line-chart', 'area-chart', 'pie-chart', 'donut-chart', 
    'scatter-chart', 'gauge', 'funnel-chart', 'combo-chart', 'multi-line', 'multi-bar', 'multi-area',
    'stacked-bar', 'stacked-area', 'stacked-column', 'radar-chart', 'waterfall', 'candlestick', 'bullet', 
    'gantt', 'sankey', 'treemap', 'sparkline', 'box-whisker', 'marimekko'
  ];
  const shapeTypes: ComponentType['type'][] = ['shape', 'ellipse', 'triangle', 'rectangle', 'circle', 'line', 'arrow'];

  if (shapeTypes.includes(component.type)) {
    contentRenderer = <ShapeRenderer component={component} />;
  } else if (component.type === 'text') {
    contentRenderer = <TextRenderer component={component} />;
  } else if (component.type === 'image') {
    contentRenderer = <ImageRenderer component={component} />;
  } else if (component.type === 'data-table' || component.type === 'table') {
    contentRenderer = <DataTableRenderer component={component} isDarkMode={isDarkMode} />;
  } else if (component.type === 'kpi-card') {
    contentRenderer = <KPICardRenderer component={component} isDarkMode={isDarkMode} />;
  } else if (chartTypes.includes(component.type)) {
    // All chart types
    contentRenderer = (
        <ChartRenderer 
            component={component} 
            isDarkMode={isDarkMode} 
            isDragging={isDragging} 
        />
    );
  } else {
      // Fallback for unsupported/unknown types
      contentRenderer = (
          <div className="h-full w-full flex items-center justify-center text-gray-500">
              <p>Unknown Component Type: {component.type}</p>
          </div>
      );
  }

  return (
    <Card
      className={`absolute transition-shadow duration-100 ${
        isSelected && !isPreviewMode ? 'shadow-lg border-2 border-blue-500 z-50' : 'shadow-md hover:shadow-xl'
      } ${isPreviewMode ? 'cursor-default' : 'cursor-move'}`}
      style={{
        // FIX: Use localPosition for immediate feedback during drag
        left: localPosition.x,
        top: localPosition.y,
        width: component.size.width,
        height: component.size.height,
        zIndex: component.zIndex
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={() => {
        if (!isPreviewMode && isConfigurable) {
            setIsConfigOpen(true);
        }
      }}
    >
      <div className="w-full h-full">
        {contentRenderer}
      </div>

      {/* Control overlay */}
      {isSelected && !isPreviewMode && (
        <div className={`absolute top-0 right-0 p-1 flex space-x-1 ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} rounded-bl-lg`}>
          
          {/* Settings Button */}
          {isConfigurable && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfigOpen(true);
                }}
                title="Configure Component"
              >
                <Settings className="h-3 w-3" />
              </Button>
              {/* Keep key if you intentionally use it elsewhere */}
              <ChartConfigDialog
                key={component.id} 
                component={component}
                isOpen={isConfigOpen}
                setIsOpen={setIsConfigOpen}
                onUpdate={handleConfigUpdate}
              />
            </>
          )}

          {/* Layering buttons */}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onBringToFront(); }} title="Bring to Front">
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onSendToBack(); }} title="Send to Back">
            <ChevronDown className="h-3 w-3" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-500 hover:bg-red-500/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete Component"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Resize handles */}
      {isSelected && !isPreviewMode && (
        <>
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize rounded-full"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              const startWidth = component.size.width;
              const startHeight = component.size.height;
              const startX = e.clientX;
              const startY = e.clientY;
              
              const handleMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                onUpdate({
                  size: {
                    width: Math.max(100, startWidth + deltaX),
                    height: Math.max(50, startHeight + deltaY)
                  }
                });
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </>
      )}
    </Card>
  );
};

export default DashboardComponent;
