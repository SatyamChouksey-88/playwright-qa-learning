export type AuthProject = {
  name: string;
  testMatch?: RegExp;
  dependencies?: string[];
  storageState?: string;
};

export function buildAuthProjects(): AuthProject[] {
  return [{ name: 'chromium' }];
}
