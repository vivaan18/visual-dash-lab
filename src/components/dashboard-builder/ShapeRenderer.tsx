
import React from 'react';
import type { DashboardComponent } from '@/types/dashboard';
import { ArrowRight, Circle, Square, Triangle } from 'lucide-react';

interface ShapeRendererProps {
  component: DashboardComponent;
}

const ShapeRenderer: React.FC<ShapeRendererProps> = ({ component }) => {
  const renderShape = () => {
    const color = component.properties.color || '#3b82f6';
    const fillColor = component.properties.fillColor || color;
    const strokeWidth = component.properties.strokeWidth || 2;
    const opacity = component.properties.opacity || 1;

    switch (component.type) {
      case 'line':
        return (
          <svg width="100%" height="100%" className="absolute inset-0">
            <line
              x1={component.properties.x1 || '10%'}
              y1={component.properties.y1 || '50%'}
              x2={component.properties.x2 || '90%'}
              y2={component.properties.y2 || '50%'}
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          </svg>
        );
      
      case 'circle':
        return (
          <svg width="100%" height="100%" className="absolute inset-0">
            <circle
              cx="50%"
              cy="50%"
              r={component.properties.radius || '40%'}
              fill={component.properties.filled ? fillColor : 'transparent'}
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          </svg>
        );
      
      case 'rectangle':
        return (
          <svg width="100%" height="100%" className="absolute inset-0">
            <rect
              x="10%"
              y="10%"
              width="80%"
              height="80%"
              fill={component.properties.filled ? fillColor : 'transparent'}
              stroke={color}
              strokeWidth={strokeWidth}
              rx={component.properties.borderRadius || 0}
              opacity={opacity}
            />
          </svg>
        );
      
      case 'arrow':
        return (
          <div className="h-full flex items-center justify-center">
            <ArrowRight 
              size={component.properties.size || 48} 
              color={color}
              style={{ opacity }}
            />
          </div>
        );
      
      case 'triangle':
        return (
          <svg width="100%" height="100%" className="absolute inset-0">
            <polygon
              points="50%,10% 10%,90% 90%,90%"
              fill={component.properties.filled ? fillColor : 'transparent'}
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          </svg>
        );
      
      default:
        return (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">⭕</div>
              <p>Shape</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full relative">
      {renderShape()}
    </div>
  );
};

export default ShapeRenderer;
