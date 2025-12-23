import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: any[];
  properties: any;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({ data, properties }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={properties.color || '#6366f1'}
          strokeWidth={properties.strokeWidth || 2}
          dot={false}
          animationDuration={properties.animationDuration || 300}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
