export type ProjectDef = { name: string; dependencies?: string[]; storageState?: string };

export function buildAuthProjects(): ProjectDef[] {
  // TODO: setup project + authenticated project with dependencies + storageState
  return [{ name: 'chromium' }];
}
