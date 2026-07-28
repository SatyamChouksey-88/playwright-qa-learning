export function roleStoragePaths(): Record<'admin' | 'member', string> {
  return {
    admin: 'playwright/.auth/admin.json',
    member: 'playwright/.auth/member.json',
  };
}
