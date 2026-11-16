import type { Pastel } from '../data/types';

/** Headline numbers on the landing page. A test keeps these in step with the real content. */
export const LANDING_STATS: { label: string; value: number; color: Pastel }[] = [
  { label: 'Lessons', value: 101, color: 'lavender' },
  { label: 'Tool guides', value: 42, color: 'sky' },
  { label: 'Practice tools', value: 10, color: 'mint' },
  { label: 'Templates', value: 21, color: 'butter' },
  { label: 'Frameworks', value: 51, color: 'peach' },
  { label: 'Interview questions', value: 207, color: 'pink' },
];
