export function violatesThinPom(source: string): boolean {
  if (!source.includes('class ')) return false;
  const classMatch = source.match(/class\s+\w+[\s\S]*/);
  if (!classMatch) return false;
  return /expect\s*\(/.test(classMatch[0]);
}
