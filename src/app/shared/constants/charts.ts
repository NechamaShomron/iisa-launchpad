export type AgeBucket = { label: string; min: number; max: number };

export const AGE_BUCKETS: AgeBucket[] = [
  { label: '18–24', min: 18, max: 24 },
  { label: '25–34', min: 25, max: 34 },
  { label: '35–44', min: 35, max: 44 },
  { label: '45–54', min: 45, max: 54 },
  { label: '55–64', min: 55, max: 64 },
  { label: '65–74', min: 65, max: 74 },
  { label: '75–84', min: 75, max: 84 },
  { label: '85–100', min: 85, max: 100 }
];

export const AGE_BUCKET_LABELS = AGE_BUCKETS.map(b => b.label);

export const AGE_COLORS: string[] = [
  '#818cf8',
  '#a78bfa',
  '#c4b5fd',
  '#f472b6',
  '#fb7185',
  '#fda4af',
  '#93c5fd',
  '#60a5fa'
];

export const DONUT_PRIMARY_COLOR = '#3b82f6';
export const DONUT_BACKGROUND_COLOR = '#e5e7eb';
export const TREND_LINE_COLOR = '#3b82f6';
export const TREND_AREA_GRADIENT_START = 'rgba(59,130,246,0.25)';
export const TREND_AREA_GRADIENT_END = 'rgba(59,130,246,0.05)';



