import React from 'react';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';

interface SankeyChartProps {
  data: any;
  properties: any;
}

export const SankeyChart: React.FC<SankeyChartProps> = ({ data, properties }) => {
  // Recharts Sankey expects data in format: { nodes: [], links: [] }
  const sankeyData = data.nodes ? data : {
    nodes: data.map((item: any) => ({ name: item.name })),
    links: data
      .filter((item: any) => item.source && item.target)
      .map((item: any) => ({
        source: item.source,
        target: item.target,
        value: item.value || 1,
      })),
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Sankey
        data={sankeyData}
        node={{ fill: properties.color || '#6366f1', fillOpacity: 0.8 }}
        link={{ stroke: properties.color || '#6366f1', strokeOpacity: 0.3 }}
        margin={{
          top: properties.marginTop ?? 2,
          right: properties.marginRight ?? 2,
          left: properties.marginLeft ?? 2,
          bottom: properties.marginBottom ?? 6,
        }}
      >
        {properties.showTooltip !== false && <Tooltip />}
      </Sankey>
    </ResponsiveContainer>
  );
};
