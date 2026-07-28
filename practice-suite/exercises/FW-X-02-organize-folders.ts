const REQUIRED = ['tests', 'pages', 'fixtures'] as const;

export function validateFolderStructure(paths: string[]): boolean {
  // TODO: every REQUIRED folder must appear in paths (any order)
  void REQUIRED;
  return paths.includes('tests');
}
