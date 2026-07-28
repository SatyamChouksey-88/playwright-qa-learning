export type AuthProject = {
  name: string;
  testMatch?: RegExp;
  dependencies?: string[];
  storageState?: string;
};

export function buildAuthProjects(): AuthProject[] {
  return [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      storageState: 'playwright/.auth/user.json',
    },
  ];
}
