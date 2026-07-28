export type FlakeCategory = 'timing' | 'data' | 'environment' | 'assertion';

export function categorizeFailure(_message: string): FlakeCategory {
  void _message;
  return 'assertion';
}
