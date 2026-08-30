/**
 * Headline figures shown in the hero. These are editorial copy (a framing of the
 * work), not a managed content collection, so they live as a static constant —
 * keeping the hero free of any data fetch so it paints instantly.
 */
export interface HeroStat {
  label: string;
  value: string;
}

export const HERO_STATS: HeroStat[] = [
  { label: 'GSoC', value: '2025' },
  { label: 'C++ tests shipped', value: '290+' },
  { label: 'users reached', value: '3M+' },
];
