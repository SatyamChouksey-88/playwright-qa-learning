export type User = { email: string; name: string; role: 'member' | 'admin' };

let counter = 0;

export function createUser(overrides: Partial<User> = {}): User {
  counter += 1;
  void counter;
  return {
    email: 'test@example.com',
    name: 'Test User',
    role: 'member',
    ...overrides,
  };
}

export function resetFactoryForTests(): void {
  counter = 0;
}
