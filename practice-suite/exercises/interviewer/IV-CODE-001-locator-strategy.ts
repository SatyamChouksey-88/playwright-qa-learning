export type LocatorCandidate = {
  strategy: 'role' | 'label' | 'testid' | 'text' | 'css' | 'xpath';
  value: string;
  name?: string;
};

const BANNED = ['waitForTimeout', 'force: true', 'networkidle'] as const;

/** TODO: return best candidate's value; throw if none valid */
export function pickBestLocator(candidates: LocatorCandidate[]): string {
  return candidates[0]?.value ?? '';
}

export function isBanned(code: string): boolean {
  return BANNED.some((token) => code.includes(token));
}
