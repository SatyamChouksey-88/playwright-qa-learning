export type User = { email: string; role: 'admin' | 'member' };
export function buildUser(email: string, role: User['role'] = 'member'): User {
  return { email, role };
}
