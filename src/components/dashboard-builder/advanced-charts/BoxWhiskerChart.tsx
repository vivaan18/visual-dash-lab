import React from 'react';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar } from 'recharts';

interface BoxWhiskerChartProps {
  data: any[];
  properties: any;
}

export const BoxWhiskerChart: React.FC<BoxWhiskerChartProps> = ({ data, properties }) => {
  const minKey = properties.minKey || 'min';
  const maxKey = properties.maxKey || 'max';
  const medianKey = properties.medianKey || 'median';
  const q1Key = properties.q1Key || 'q1';
  const q3Key = properties.q3Key || 'q3';

  const CustomBox = (props: any) => {
    const { x, width, payload } = props;
    const centerX = x + width / 2;
    const boxWidth = width * 0.5;
    
    // Calculate Y positions (simplified scaling)
    const yScale = 2;
    const min = 300 - (payload[minKey] * yScale);
    const max = 300 - (payload[maxKey] * yScale);
    const median = 300 - (payload[medianKey] * yScale);
    const q1 = 300 - (payload[q1Key] * yScale);
    const q3 = 300 - (payload[q3Key] * yScale);

    return (
      <g>
        {/* Whisker lines */}
        <line x1={centerX} y1={min} x2={centerX} y2={max} stroke="#6366f1" strokeWidth={2} />
        <line x1={centerX - boxWidth / 4} y1={min} x2={centerX + boxWidth / 4} y2={min} stroke="#6366f1" strokeWidth={2} />
        <line x1={centerX - boxWidth / 4} y1={max} x2={centerX + boxWidth / 4} y2={max} stroke="#6366f1" strokeWidth={2} />
        
        {/* Box */}
        <rect
          x={centerX - boxWidth / 2}
          y={q3}
          width={boxWidth}
          height={q1 - q3}
          fill={properties.color || '#6366f1'}
          fillOpacity={0.6}
          stroke="#6366f1"
          strokeWidth={2}
        />
        
        {/* Median line */}
        <line
          x1={centerX - boxWidth / 2}
          y1={median}
          x2={centerX + boxWidth / 2}
          y2={median}
          stroke="#000"
          strokeWidth={2}
        />
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
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
        {properties.showTooltip !== false && (
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background border border-border p-2 rounded shadow-lg text-xs">
                    <p className="font-semibold">{data.name}</p>
                    <p>Max: {data[maxKey]}</p>
                    <p>Q3: {data[q3Key]}</p>
                    <p>Median: {data[medianKey]}</p>
                    <p>Q1: {data[q1Key]}</p>
                    <p>Min: {data[minKey]}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        )}
        <Bar dataKey={maxKey} shape={<CustomBox />} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
