export type FlakeCategory = 'timing' | 'data' | 'environment' | 'assertion';

export function categorizeFailure(message: string): FlakeCategory {
  const m = message.toLowerCase();
  if (m.includes('timeout') || m.includes('waiting')) return 'timing';
  if (m.includes('duplicate') || m.includes('unique')) return 'data';
  if (m.includes('linux') || m.includes('mac') || m.includes('docker')) return 'environment';
  return 'assertion';
}
