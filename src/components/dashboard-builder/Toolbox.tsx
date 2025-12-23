
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Table, 
  Gauge,
  Image,
  Type,
  Activity,
  Target,
  Minus,
  Circle,
  Square,
  ArrowRight,
  Triangle,
  ChartScatter,
  Radar,
  BarChart2,
  TrendingDown,
  Layers
} from 'lucide-react';

const componentTypes = [
  // Basic 2D Charts
  { id: 'bar-chart', name: 'Bar Chart', icon: BarChart3, category: 'Basic Charts' },
  { id: 'column-chart', name: 'Column Chart', icon: BarChart2, category: 'Basic Charts' },
  { id: 'line-chart', name: 'Line Chart', icon: LineChart, category: 'Basic Charts' },
  { id: 'area-chart', name: 'Area Chart', icon: TrendingUp, category: 'Basic Charts' },
  { id: 'pie-chart', name: 'Pie Chart', icon: PieChart, category: 'Basic Charts' },
  { id: 'donut-chart', name: 'Donut Chart', icon: Circle, category: 'Basic Charts' },
  { id: 'scatter-chart', name: 'Scatter Plot', icon: ChartScatter, category: 'Basic Charts' },
  
  // Multi-series Charts
  { id: 'combo-chart', name: 'Combo Chart', icon: Activity, category: 'Multi-Series' },
  { id: 'multi-line', name: 'Multi-Line', icon: LineChart, category: 'Multi-Series' },
  { id: 'multi-bar', name: 'Multi-Bar', icon: BarChart3, category: 'Multi-Series' },
  { id: 'multi-area', name: 'Multi-Area', icon: TrendingUp, category: 'Multi-Series' },
  { id: 'stacked-bar', name: 'Stacked Bar', icon: BarChart3, category: 'Multi-Series' },
  //{ id: 'stacked-column', name: 'Stacked Column', icon: BarChart2, category: 'Multi-Series' },
  { id: 'stacked-area', name: 'Stacked Area', icon: TrendingUp, category: 'Multi-Series' },
  
  // Advanced Charts
  //{ id: 'waterfall', name: 'Waterfall', icon: TrendingDown, category: 'Advanced Charts' },
  //{ id: 'candlestick', name: 'Candlestick', icon: Activity, category: 'Advanced Charts' },
 // { id: 'bullet', name: 'Bullet Chart', icon: Target, category: 'Advanced Charts' },
 // { id: 'gantt', name: 'Gantt Chart', icon: BarChart2, category: 'Advanced Charts' },
  //{ id: 'sankey', name: 'Sankey Diagram', icon: Layers, category: 'Advanced Charts' },
  //  { id: 'treemap', name: 'Treemap', icon: Square, category: 'Advanced Charts' },
  // { id: 'radar-chart', name: 'Radar Chart', icon: Radar, category: 'Advanced Charts' },
   { id: 'funnel-chart', name: 'Funnel Chart', icon: TrendingDown, category: 'Advanced Charts' },
  
  // Specialized Charts
  //{ id: 'sparkline', name: 'Sparkline', icon: Activity, category: 'Specialized' },
  //{ id: 'box-whisker', name: 'Box & Whisker', icon: BarChart2, category: 'Specialized' },
  //{ id: 'marimekko', name: 'Marimekko', icon: BarChart3, category: 'Specialized' },
  //{ id: 'heatmap', name: 'Heatmap', icon: Layers, category: 'Specialized' },
  
  // Data
  { id: 'table', name: 'Data Table', icon: Table, category: 'Data' },
  
  // Metrics
  { id: 'kpi-card', name: 'KPI Card', icon: Target, category: 'Metrics' },
  { id: 'gauge', name: 'Gauge', icon: Gauge, category: 'Metrics' },
  
  // Elements
  { id: 'text', name: 'Text', icon: Type, category: 'Elements' },
  { id: 'image', name: 'Image', icon: Image, category: 'Elements' },
  
  // Shapes
  { id: 'line', name: 'Line', icon: Minus, category: 'Shapes' },
  { id: 'circle', name: 'Circle', icon: Circle, category: 'Shapes' },
  { id: 'rectangle', name: 'Rectangle', icon: Square, category: 'Shapes' },
  { id: 'arrow', name: 'Arrow', icon: ArrowRight, category: 'Shapes' },
  { id: 'triangle', name: 'Triangle', icon: Triangle, category: 'Shapes' },
];

const categories = ['Basic Charts', 'Multi-Series', 'Advanced Charts', 'Specialized', 'Data', 'Metrics', 'Elements', 'Shapes'];

const Toolbox = () => {
  return (
    <div className="h-full p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Components
      </h2>
      
      <Droppable droppableId="toolbox" isDropDisabled={true}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
            {categories.map(category => (
              <Card key={category} className="bg-gray-50 dark:bg-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {componentTypes
                    .filter(type => type.category === category)
                    .map((type, index) => (
                      <Draggable
                        key={type.id}
                        draggableId={type.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 rounded-lg border cursor-move transition-all ${
                              snapshot.isDragging
                                ? 'bg-blue-100 border-blue-300 shadow-lg'
                                : 'bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-500 hover:border-blue-300 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <type.icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {type.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                </CardContent>
              </Card>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Toolbox;
