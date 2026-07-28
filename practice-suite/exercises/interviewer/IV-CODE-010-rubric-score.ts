export type Dimension = 'technical' | 'process' | 'communication' | 'codeQuality' | 'judgment';

const WEIGHTS: Record<Dimension, number> = {
  technical: 0.3,
  process: 0.25,
  communication: 0.15,
  codeQuality: 0.2,
  judgment: 0.1,
};
void WEIGHTS;

export function hireRecommendation(_scores: Record<Dimension, number>): { total: number; tier: string } {
  void _scores;
  return { total: 0, tier: 'No hire' };
}
