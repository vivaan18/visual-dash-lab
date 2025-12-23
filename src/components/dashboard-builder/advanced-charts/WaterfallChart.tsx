import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

interface WaterfallChartProps {
  data: any[];
  properties: any;
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({ data, properties }) => {
  // Calculate cumulative values for waterfall effect
  const waterfallData = data.map((item, index) => {
    const value = item.value || 0;
    const isTotal = item.isTotal || false;
    
    if (index === 0) {
      return { ...item, start: 0, end: value, value, isTotal };
    }
    
    const prevEnd = waterfallData[index - 1].end;
    return {
      ...item,
      start: isTotal ? 0 : prevEnd,
      end: isTotal ? value : prevEnd + value,
      value,
      isTotal
    };
  });

  const getBarColor = (entry: any) => {
    if (entry.isTotal) return '#6366f1'; // primary
    return entry.value >= 0 ? '#10b981' : '#ef4444'; // success/destructive
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={waterfallData}
        margin={{
          top: properties.marginTop ?? 2,
          right: properties.marginRight ?? 2,
          left: properties.marginLeft ?? 2,
          bottom: properties.marginBottom ?? 6,
        }}
      >
        {properties.showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
        <XAxis dataKey="name" angle={properties.xAxisAngle || 0} textAnchor="middle" />
        <YAxis />
        {properties.showTooltip !== false && <Tooltip />}
        {properties.showLegend && <Legend />}
        
        {/* Invisible bar for start position */}
        <Bar dataKey="start" stackId="a" fill="transparent" />
        
        {/* Visible bar for the change */}
        <Bar dataKey="value" stackId="a" radius={properties.barRadius || 0}>
          {waterfallData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
