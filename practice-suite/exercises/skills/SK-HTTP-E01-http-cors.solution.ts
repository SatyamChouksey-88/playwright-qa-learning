export function diagnoseCors(hasOrigin: boolean, hasCredentials: boolean): string {
  if (!hasOrigin) return 'missing-access-control-allow-origin';
  if (hasCredentials) return 'credentials-requires-specific-origin';
  return 'ok';
}
