// Utility to generate sample data for chart previews

export const generateSampleDataForChartType = (chartType: string, dataPoints: number = 6): any => {
  switch (chartType) {
    // Basic 2D Charts
    case 'bar-chart':
    case 'bar':
    case 'column-chart':
      // Use realistic category names for previews: months when there
      // are up to 12 points, otherwise use product names.
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const productNames = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E', 'Product F'];
      return Array.from({ length: dataPoints }, (_, i) => ({
        name:
          dataPoints <= 12
            ? monthNames[i % monthNames.length]
            : productNames[i % productNames.length] + ` ${Math.floor(i / productNames.length) + 1}`,
        value: Math.floor(Math.random() * 100) + 20,
      }));

    case 'line-chart':
    case 'line':
    case 'area-chart':
    case 'area':
      return Array.from({ length: dataPoints }, (_, i) => ({
        name: `Month ${i + 1}`,
        value: Math.floor(Math.random() * 80) + 20 + (i * 5),
      }));

    case 'pie-chart':
    case 'pie':
    case 'donut-chart':
    case 'donut':
      const categories = ['Category A', 'Category B', 'Category C', 'Category D'];
      return categories.map(name => ({
        name,
        value: Math.floor(Math.random() * 40) + 10,
      }));

    case 'scatter-chart':
    case 'scatter':
      return Array.from({ length: 12 }, () => ({
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
      }));

    // Multi-series Combo Charts
    case 'combo-chart':
    case 'multi-line':
    case 'multi-bar':
    case 'multi-area':
      return Array.from({ length: dataPoints }, (_, i) => ({
        name: `Period ${i + 1}`,
        series1: Math.floor(Math.random() * 80) + 20,
        series2: Math.floor(Math.random() * 80) + 20,
        series3: Math.floor(Math.random() * 80) + 20,
      }));

    case 'stacked-bar':
    case 'stacked-column':
    case 'stacked-area':
      return Array.from({ length: dataPoints }, (_, i) => ({
        name: `Q${i + 1}`,
        product1: Math.floor(Math.random() * 50) + 10,
        product2: Math.floor(Math.random() * 50) + 10,
        product3: Math.floor(Math.random() * 50) + 10,
      }));

    // Advanced Charts
    case 'waterfall':
      return [
        { name: 'Starting', value: 100, isTotal: true },
        { name: 'Increase 1', value: 25 },
        { name: 'Increase 2', value: 15 },
        { name: 'Decrease 1', value: -20 },
        { name: 'Increase 3', value: 30 },
        { name: 'Final Total', value: 150, isTotal: true },
      ];

    case 'candlestick':
      return Array.from({ length: dataPoints }, (_, i) => {
        const open = Math.floor(Math.random() * 50) + 50;
        const close = open + Math.floor(Math.random() * 20) - 10;
        const high = Math.max(open, close) + Math.floor(Math.random() * 10);
        const low = Math.min(open, close) - Math.floor(Math.random() * 10);
        return {
          name: `Day ${i + 1}`,
          open,
          close,
          high,
          low,
        };
      });

    case 'bullet':
      return [
        { name: 'Revenue', value: 75, target: 90 },
        { name: 'Profit', value: 60, target: 80 },
        { name: 'Sales', value: 85, target: 95 },
      ];

    case 'gantt':
      const startDate = new Date('2024-01-01');
      return Array.from({ length: 5 }, (_, i) => {
        const start = new Date(startDate);
        start.setDate(start.getDate() + i * 7);
        const end = new Date(start);
        end.setDate(end.getDate() + Math.floor(Math.random() * 14) + 7);
        return {
          task: `Task ${i + 1}`,
          start: start.toISOString(),
          end: end.toISOString(),
        };
      });

    case 'sankey':
      return {
        nodes: [
          { name: 'Source A' },
          { name: 'Source B' },
          { name: 'Middle 1' },
          { name: 'Middle 2' },
          { name: 'Target' },
        ],
        links: [
          { source: 0, target: 2, value: 50 },
          { source: 0, target: 3, value: 30 },
          { source: 1, target: 2, value: 40 },
          { source: 1, target: 3, value: 20 },
          { source: 2, target: 4, value: 90 },
          { source: 3, target: 4, value: 50 },
        ],
      };

    case 'treemap':
      return [
        { name: 'Product A', value: 400 },
        { name: 'Product B', value: 300 },
        { name: 'Product C', value: 250 },
        { name: 'Product D', value: 200 },
        { name: 'Product E', value: 150 },
        { name: 'Product F', value: 100 },
      ];

    // Specialized Charts
    case 'sparkline':
      return Array.from({ length: 20 }, (_, i) => ({
        value: Math.floor(Math.random() * 40) + 30 + Math.sin(i / 3) * 10,
      }));

    case 'box-whisker':
      return Array.from({ length: 4 }, (_, i) => ({
        name: `Group ${i + 1}`,
        min: 10 + i * 5,
        q1: 25 + i * 5,
        median: 40 + i * 5,
        q3: 55 + i * 5,
        max: 70 + i * 5,
      }));

    case 'marimekko':
      return [
        { name: 'Segment A', value: 120, segments: [40, 50, 30] },
        { name: 'Segment B', value: 80, segments: [30, 30, 20] },
        { name: 'Segment C', value: 150, segments: [60, 50, 40] },
        { name: 'Segment D', value: 100, segments: [35, 35, 30] },
      ];

    // Existing Charts
    case 'radar-chart':
    case 'radar':
      const metrics = ['Metric A', 'Metric B', 'Metric C', 'Metric D', 'Metric E'];
      return metrics.map(subject => ({
        subject,
        value: Math.floor(Math.random() * 100) + 20,
      }));

    case 'funnel-chart':
    case 'funnel':
      return [
        { name: 'Stage 1', value: 1000 },
        { name: 'Stage 2', value: 750 },
        { name: 'Stage 3', value: 500 },
        { name: 'Stage 4', value: 250 },
        { name: 'Stage 5', value: 100 },
      ];

    case 'gauge':
      return [{ name: 'Value', value: Math.floor(Math.random() * 60) + 30 }];

    default:
      return Array.from({ length: dataPoints }, (_, i) => ({
        name: `Data ${i + 1}`,
        value: Math.floor(Math.random() * 100),
      }));
  }
};

export const findAvailablePosition = (
  components: any[],
  canvasWidth: number = 1200
): { x: number; y: number } => {
  const componentWidth = 400;
  const componentHeight = 300;
  const padding = 20;
  const columnsPerRow = Math.floor(canvasWidth / (componentWidth + padding));

  // Try to find an empty spot in a grid layout
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < columnsPerRow; col++) {
      const x = col * (componentWidth + padding) + padding;
      const y = row * (componentHeight + padding) + padding;

      // Check if this position overlaps with any existing component
      const hasOverlap = components.some(comp => {
        const compRight = comp.position.x + comp.size.width;
        const compBottom = comp.position.y + comp.size.height;
        const newRight = x + componentWidth;
        const newBottom = y + componentHeight;

        return !(
          x >= compRight ||
          newRight <= comp.position.x ||
          y >= compBottom ||
          newBottom <= comp.position.y
        );
      });

      if (!hasOverlap) {
        return { x, y };
      }
    }
  }

  // If no empty spot found, place at the end
  return { x: padding, y: components.length * (componentHeight + padding) + padding };
};
