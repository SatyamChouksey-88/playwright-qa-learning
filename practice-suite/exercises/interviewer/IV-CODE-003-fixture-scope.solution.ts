const WORKER = new Set(['apiClient', 'dbPool', 'sharedToken']);
const TEST = new Set(['page', 'user', 'checkoutCart']);

export function classifyFixture(name: string): 'test' | 'worker' | 'invalid' {
  if (WORKER.has(name)) return 'worker';
  if (TEST.has(name)) return 'test';
  return 'invalid';
}
