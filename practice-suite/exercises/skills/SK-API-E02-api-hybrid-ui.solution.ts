export type Cookie = { name: string; value: string };
export function hasAuthCookie(cookies: Cookie[]): boolean {
  return cookies.some((c) => c.name === 'session' && c.value.length > 0);
}
