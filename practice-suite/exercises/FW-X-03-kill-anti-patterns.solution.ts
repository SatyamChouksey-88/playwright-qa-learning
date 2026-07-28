const BANNED = [
  ['waitFor', 'Timeout'].join(''),
  ['force:', ' true'].join(''),
  ['network', 'idle'].join(''),
  ['page.', '$('].join(''),
] as const;

export function findAntiPatterns(code: string): string[] {
  return BANNED.filter((token) => code.includes(token));
}
