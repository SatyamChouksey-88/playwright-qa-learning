export function findIsolationViolations(code: string): string[] {
  const violations: string[] = [];
  if (/let\s+shared\s*=/.test(code) || /var\s+globalUser/.test(code)) {
    violations.push('global-mutable');
  }
  if (code.includes('writeFileSync') && code.includes('/tmp/shared')) {
    violations.push('shared-file');
  }
  if (code.includes('test@example.com') && !code.includes('unique')) {
    violations.push('missing-unique-data');
  }
  return violations;
}
