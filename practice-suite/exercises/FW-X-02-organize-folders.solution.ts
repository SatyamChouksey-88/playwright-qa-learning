const REQUIRED = ['tests', 'pages', 'fixtures'] as const;

export function validateFolderStructure(paths: string[]): boolean {
  return REQUIRED.every((folder) => paths.includes(folder));
}
