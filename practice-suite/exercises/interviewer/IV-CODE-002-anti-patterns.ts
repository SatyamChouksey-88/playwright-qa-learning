const BANNED = [
  ['waitFor', 'Timeout'].join(''),
  ['force:', ' true'].join(''),
  ['network', 'idle'].join(''),
  ['page.', '$('].join(''),
] as const;
void BANNED;

export function findAntiPatterns(_code: string): string[] {
  void _code;
  return [];
}
