import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GanttChartProps {
  data: any[];
  properties: any;
}

export const GanttChart: React.FC<GanttChartProps> = ({ data, properties }) => {
  const startKey = properties.startKey || 'start';
  const endKey = properties.endKey || 'end';
  const taskKey = properties.taskKey || 'task';

  // Transform data for Gantt representation
  const ganttData = data.map((item, idx) => {
    const start = new Date(item[startKey]).getTime();
    const end = new Date(item[endKey]).getTime();
    return {
      ...item,
      startTime: start,
      duration: end - start,
      displayStart: start,
    };
  });

  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={ganttData}
        layout="vertical"
        margin={{
          // Keep a large left margin for task labels but tighten others
          top: properties.marginTop ?? 2,
          right: properties.marginRight ?? 2,
          left: properties.marginLeft ?? 120,
          bottom: properties.marginBottom ?? 6,
        }}
      >
        {properties.showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
        <XAxis 
          type="number" 
          domain={['dataMin', 'dataMax']}
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis type="category" dataKey={taskKey} width={100} />
        {properties.showTooltip !== false && (
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background border border-border p-2 rounded shadow-lg text-xs">
                    <p className="font-semibold">{data[taskKey]}</p>
                    <p>Start: {new Date(data[startKey]).toLocaleDateString()}</p>
                    <p>End: {new Date(data[endKey]).toLocaleDateString()}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        )}
        
        {/* Invisible bar for start position */}
        <Bar dataKey="displayStart" stackId="a" fill="transparent" />
        
        {/* Visible bar for duration */}
        <Bar dataKey="duration" stackId="a" radius={properties.barRadius || 4}>
          {ganttData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
