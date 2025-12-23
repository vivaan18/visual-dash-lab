
import React, { forwardRef } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import DashboardComponent from './DashboardComponent';
import type { DashboardComponent as DashboardComponentType } from '@/types/dashboard';

interface CanvasProps {
  components: DashboardComponentType[];
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<DashboardComponentType>) => void;
  onDeleteComponent: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  isPreviewMode: boolean;
  isDarkMode: boolean;
  gridSnap?: boolean;
  canvasBackgroundColor?: string | null;
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({
  components,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onBringToFront,
  onSendToBack,
  isPreviewMode,
  isDarkMode,
  gridSnap = false
  ,
  canvasBackgroundColor = null
}, ref) => {
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectComponent(null);
    }
  };

  const snapToGrid = (value: number, gridSize: number = 20) => {
    return gridSnap ? Math.round(value / gridSize) * gridSize : value;
  };

  const handleComponentUpdate = (id: string, updates: Partial<DashboardComponentType>) => {
    if (updates.position && gridSnap) {
      updates.position = {
        x: snapToGrid(updates.position.x),
        y: snapToGrid(updates.position.y)
      };
    }
    onUpdateComponent(id, updates);
  };

  // Helper function to determine if component should span multiple columns
  const shouldSpanTwoColumns = (component: DashboardComponentType) => {
    const largeChartTypes = ['line-chart', 'area-chart', 'heatmap', 'funnel-chart'];
    return isPreviewMode && largeChartTypes.includes(component.type);
  };

  return (
    <Droppable droppableId="canvas">
      {(provided, snapshot) => (
        <div
          ref={(el) => {
            provided.innerRef(el);
            if (ref) {
              if (typeof ref === 'function') {
                ref(el);
              } else {
                ref.current = el;
              }
            }
          }}
          {...provided.droppableProps}
          className={`w-full h-full overflow-auto ${
            snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          } transition-colors duration-200 ${
            isPreviewMode ? 'p-4' : 'relative'
          }`}
          onClick={handleCanvasClick}
          style={
            isPreviewMode
              ? {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gridAutoRows: 'minmax(250px, auto)',
                  gap: '1rem',
                  alignContent: 'start',
                  backgroundColor: canvasBackgroundColor || (isDarkMode ? undefined : undefined),
                }
              : {
                  backgroundColor: canvasBackgroundColor || undefined,
                  backgroundImage: gridSnap ? `
                    radial-gradient(circle, ${isDarkMode ? '#374151' : '#d1d5db'} 1px, transparent 1px)
                  ` : 'none',
                  backgroundSize: gridSnap ? '20px 20px' : 'auto',
                }
          }
        >
          {/* Grid overlay when snap is enabled (builder mode only) */}
          {gridSnap && !isPreviewMode && (
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, ${isDarkMode ? '#374151' : '#d1d5db'} 1px, transparent 1px),
                    linear-gradient(to bottom, ${isDarkMode ? '#374151' : '#d1d5db'} 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              />
            </div>
          )}

          {components
            .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
            .map((component) => (
              <div
                key={component.id}
                className={isPreviewMode ? 'w-full h-full' : ''}
                style={
                  isPreviewMode
                    ? {
                        gridColumn: shouldSpanTwoColumns(component) ? 'span 2' : 'span 1',
                        minHeight: '250px',
                      }
                    : {}
                }
              >
                <DashboardComponent
                  component={component}
                  isSelected={selectedComponent === component.id}
                  onSelect={() => onSelectComponent(component.id)}
                  onUpdate={(updates) => handleComponentUpdate(component.id, updates)}
                  onDelete={() => onDeleteComponent(component.id)}
                  onBringToFront={() => onBringToFront(component.id)}
                  onSendToBack={() => onSendToBack(component.id)}
                  isPreviewMode={isPreviewMode}
                  isDarkMode={isDarkMode}
                />
              </div>
            ))}
          
          {provided.placeholder}
          
          {/* Canvas info */}
          {!isPreviewMode && components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400 dark:text-gray-500">
                <p className="text-xl font-medium mb-2">Start Building Your Dashboard</p>
                <p className="text-sm">Drag components from the toolbox to get started</p>
              </div>
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
