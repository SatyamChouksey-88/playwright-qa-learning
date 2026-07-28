const WORKER = new Set(['apiClient', 'dbPool', 'sharedToken']);
const TEST = new Set(['page', 'user', 'checkoutCart']);
void WORKER;
void TEST;

export function classifyFixture(_name: string): 'test' | 'worker' | 'invalid' {
  void _name;
  return 'test';
}
