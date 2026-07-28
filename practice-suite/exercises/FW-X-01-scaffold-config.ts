export type ExerciseConfig = { testDir: string; projects: { name: string }[] };

export function buildExerciseConfig(): ExerciseConfig {
  // TODO: return testDir './' and a single project named 'exercises'
  return { testDir: './tests', projects: [] };
}
