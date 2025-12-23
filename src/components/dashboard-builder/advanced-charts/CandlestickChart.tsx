// import React from 'react';
// import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line } from 'recharts';

// interface CandlestickChartProps {
//   data: any[];
//   properties: any;
// }

// export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, properties }) => {
//   const openKey = properties.openKey || 'open';
//   const closeKey = properties.closeKey || 'close';
//   const highKey = properties.highKey || 'high';
//   const lowKey = properties.lowKey || 'low';

//   // Transform data for candlestick representation
//   const candleData = data.map(item => ({
//     ...item,
//     candleBody: [item[openKey], item[closeKey]],
//     isGreen: item[closeKey] >= item[openKey],
//   }));

//   const CustomCandlestick = (props: any) => {
//     const { x, y, width, height, payload } = props;
//     const isGreen = payload.isGreen;
//     const color = isGreen ? '#10b981' : '#ef4444';
    
//     // Calculate positions
//     const bodyTop = Math.min(payload[openKey], payload[closeKey]);
//     const bodyBottom = Math.max(payload[openKey], payload[closeKey]);
//     const high = payload[highKey];
//     const low = payload[lowKey];
    
//     return (
//       <g>
//         {/* High-Low line (wick) */}
//         <line
//           x1={x + width / 2}
//           y1={y}
//           x2={x + width / 2}
//           y2={y + height}
//           stroke={color}
//           strokeWidth={1}
//         />
//         {/* Open-Close body */}
//         <rect
//           x={x + width * 0.2}
//           y={y + height * 0.3}
//           width={width * 0.6}
//           height={height * 0.4}
//           fill={isGreen ? color : 'white'}
//           stroke={color}
//           strokeWidth={2}
//         />
//       </g>
//     );
//   };

//   return (
//     <ResponsiveContainer width="100%" height="100%">
//       <ComposedChart
//         data={candleData}
//         margin={{
//           top: properties.marginTop || 20,
//           right: properties.marginRight || 30,
//           left: properties.marginLeft || 20,
//           bottom: properties.marginBottom || 20,
//         }}
//       >
//         {properties.showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
//         <XAxis dataKey="name" />
//         <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
//         {properties.showTooltip !== false && (
//           <Tooltip 
//             content={({ active, payload }) => {
//               if (active && payload && payload[0]) {
//                 const data = payload[0].payload;
//                 return (
//                   <div className="bg-background border border-border p-2 rounded shadow-lg text-xs">
//                     <p className="font-semibold">{data.name}</p>
//                     <p>Open: {data[openKey]}</p>
//                     <p>High: {data[highKey]}</p>
//                     <p>Low: {data[lowKey]}</p>
//                     <p>Close: {data[closeKey]}</p>
//                   </div>
//                 );
//               }
//               return null;
//             }}
//           />
//         )}
//         <Bar dataKey={highKey} shape={<CustomCandlestick />} />
//       </ComposedChart>
//     </ResponsiveContainer>
//   );
// };



import React from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Bar,
  Line,
} from "recharts";

interface CandlestickChartProps {
  data: any[];
  properties?: any;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data = [],
  properties = {},
}) => {
  // Fallback if no data provided
  const chartData =
    data && data.length > 0
      ? data
      : [
          { name: "Jan", open: 100, close: 140, high: 160, low: 90 },
          { name: "Feb", open: 140, close: 120, high: 150, low: 100 },
          { name: "Mar", open: 120, close: 180, high: 190, low: 110 },
          { name: "Apr", open: 180, close: 170, high: 200, low: 160 },
        ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {chartData.map((d, i) => {
          const color = d.close > d.open ? "#22c55e" : "#ef4444";
          return (
            <rect
              key={i}
              x={i * 50 + 30}
              y={Math.min(d.open, d.close)}
              width={10}
              height={Math.abs(d.close - d.open)}
              fill={color}
            />
          );
        })}
        <Line type="monotone" dataKey="high" stroke="#3b82f6" strokeWidth={1} />
        <Line type="monotone" dataKey="low" stroke="#f59e0b" strokeWidth={1} />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
