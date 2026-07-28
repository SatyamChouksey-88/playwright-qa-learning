export type LocatorCandidate = {
  strategy: 'role' | 'label' | 'testid' | 'text' | 'css' | 'xpath';
  value: string;
  name?: string;
};

const BANNED = ['waitForTimeout', 'force: true', 'networkidle'] as const;

const PRIORITY: LocatorCandidate['strategy'][] = ['role', 'label', 'testid', 'text'];

export function isBanned(code: string): boolean {
  return BANNED.some((token) => code.includes(token));
}

export function pickBestLocator(candidates: LocatorCandidate[]): string {
  for (const strategy of PRIORITY) {
    const match = candidates.find(
      (c) => c.strategy === strategy && !isBanned(c.value) && c.value.length > 0,
    );
    if (match) return match.value;
  }
  throw new Error('No valid locator candidate');
}
