export type User = { email: string; name: string; role: 'member' | 'admin' };

let counter = 0;

export function createUser(overrides: Partial<User> = {}): User {
  counter += 1;
  const id = `${Date.now()}-${counter}`;
  return {
    email: `user-${id}@example.test`,
    name: 'Test User',
    role: 'member',
    ...overrides,
  };
}

export function resetFactoryForTests(): void {
  counter = 0;
}
