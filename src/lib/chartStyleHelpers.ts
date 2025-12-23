// src/lib/chartStyleHelpers.ts
export const defaultMargins = { top: 5, right: 5, left: 5, bottom: 5 };

export const defaultGridProps = {
  strokeDasharray: "3 3",
  stroke: "#b4b6bbff",  // Tailwind gray-300
  opacity: 0.2,
};

export const defaultAxisStyle = {
  fontSize: 12,
  fill: '#6b7280',  // Tailwind gray-500
};

export const defaultLegendStyle = {
  fontSize: '12px',
  color: '#6b7280',
};

export const defaultTooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#374151',
};
