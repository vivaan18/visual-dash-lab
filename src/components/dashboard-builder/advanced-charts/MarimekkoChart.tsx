import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface MarimekkoChartProps {
  data: any[];
  properties: any;
}

export const MarimekkoChart: React.FC<MarimekkoChartProps> = ({ data, properties }) => {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];
  
  // Calculate total for proportional widths
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  
  const marimekkoData = data.map((item, idx) => ({
    ...item,
    percentage: ((item.value || 0) / total) * 100,
    segments: item.segments || []
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={marimekkoData}
        margin={{
          top: properties.marginTop ?? 2,
          right: properties.marginRight ?? 2,
          left: properties.marginLeft ?? 2,
          bottom: properties.marginBottom ?? 6,
        }}
      >
        {properties.showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
        <XAxis dataKey="name" />
        <YAxis />
        {properties.showTooltip !== false && <Tooltip />}
        
        <Bar dataKey="percentage" radius={properties.barRadius || 0}>
          {marimekkoData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
