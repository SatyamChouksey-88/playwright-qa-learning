export type ProjectDef = { name: string; dependencies?: string[]; storageState?: string };

export function buildAuthProjects(): ProjectDef[] {
  return [
    { name: 'setup' },
    {
      name: 'authenticated',
      dependencies: ['setup'],
      storageState: 'playwright/.auth/user.json',
    },
  ];
}
