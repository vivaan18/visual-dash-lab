import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface BulletChartProps {
  data: any[];
  properties: any;
}

export const BulletChart: React.FC<BulletChartProps> = ({ data, properties }) => {
  const ranges = properties.ranges || [
    { value: 60, color: '#ef4444' },
    { value: 80, color: '#f59e0b' },
    { value: 100, color: '#10b981' }
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          // Keep a wide left margin for labels, but tighten other sides
          top: properties.marginTop ?? 2,
          right: properties.marginRight ?? 2,
          left: properties.marginLeft ?? 100,
          bottom: properties.marginBottom ?? 6,
        }}
      >
        {properties.showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
        <XAxis type="number" domain={[0, 100]} />
        <YAxis type="category" dataKey="name" />
        {properties.showTooltip !== false && <Tooltip />}
        
        {/* Background ranges */}
        {ranges.map((range, idx) => (
          <Bar
            key={`range-${idx}`}
            dataKey={() => range.value}
            fill={range.color}
            fillOpacity={0.2}
            radius={properties.barRadius || 0}
          />
        ))}
        
        {/* Actual value bar */}
        <Bar 
          dataKey="value" 
          fill={properties.color || '#6366f1'}
          radius={properties.barRadius || 4}
        />
        
        {/* Target line */}
        {properties.targetValue && (
          <ReferenceLine
            x={properties.targetValue}
            stroke="#000"
            strokeWidth={3}
            strokeDasharray="3 3"
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};
