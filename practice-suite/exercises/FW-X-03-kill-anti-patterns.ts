const BANNED = [
  ['waitFor', 'Timeout'].join(''),
  ['force:', ' true'].join(''),
  ['network', 'idle'].join(''),
  ['page.', '$('].join(''),
] as const;

export function findAntiPatterns(code: string): string[] {
  // TODO: return all BANNED tokens found in code (may be multiple)
  void code;
  void BANNED;
  return [];
}
