export type User = { email: string; role: 'admin' | 'member' };
export function buildUser(email: string): User {
  return { email, role: 'admin' };
}
