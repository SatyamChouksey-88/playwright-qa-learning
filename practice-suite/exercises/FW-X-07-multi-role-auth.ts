export function roleStoragePaths(): Record<'admin' | 'member', string> {
  // TODO: separate storageState paths per role
  return {
    admin: 'playwright/.auth/user.json',
    member: 'playwright/.auth/user.json',
  };
}
