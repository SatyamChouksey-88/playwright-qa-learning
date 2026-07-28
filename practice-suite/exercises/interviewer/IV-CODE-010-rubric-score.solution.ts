export type Dimension = 'technical' | 'process' | 'communication' | 'codeQuality' | 'judgment';

const WEIGHTS: Record<Dimension, number> = {
  technical: 0.3,
  process: 0.25,
  communication: 0.15,
  codeQuality: 0.2,
  judgment: 0.1,
};

export function hireRecommendation(scores: Record<Dimension, number>): { total: number; tier: string } {
  const total = (Object.keys(WEIGHTS) as Dimension[]).reduce(
    (sum, key) => sum + (scores[key] ?? 0) * WEIGHTS[key],
    0,
  );
  let tier = 'Strong no hire';
  if (total >= 3.2) tier = 'Strong hire';
  else if (total >= 2.6) tier = 'Hire';
  else if (total >= 2.0) tier = 'No hire';
  return { total: Math.round(total * 100) / 100, tier };
}
