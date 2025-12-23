import React from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

interface TreemapChartProps {
  data: any[];
  properties: any;
}

export const TreemapChart: React.FC<TreemapChartProps> = ({ data, properties }) => {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#f97316'];

  const CustomContent = (props: any) => {
    const { x, y, width, height, name, value, index } = props;
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={colors[index % colors.length]}
          fillOpacity={0.9}
          stroke="#fff"
          strokeWidth={2}
        />
        {width > 50 && height > 30 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 10}
              textAnchor="middle"
              fill="#fff"
              fontSize={14}
              fontWeight="bold"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 10}
              textAnchor="middle"
              fill="#fff"
              fontSize={12}
            >
              {value}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data}
        dataKey="value"
        aspectRatio={4 / 3}
        stroke="#fff"
        content={<CustomContent />}
      >
        {properties.showTooltip !== false && <Tooltip />}
      </Treemap>
    </ResponsiveContainer>
  );
};
