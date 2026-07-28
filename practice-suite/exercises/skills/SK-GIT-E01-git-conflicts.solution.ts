export function resolveConflict(raw: string): string {
  const m = raw.match(/=======\r?\n([\s\S]*?)\r?\n>>>>>>>/);
  return (m?.[1] ?? '').trim();
}
