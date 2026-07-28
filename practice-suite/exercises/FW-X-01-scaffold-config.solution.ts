export type ExerciseConfig = { testDir: string; projects: { name: string }[] };

export function buildExerciseConfig(): ExerciseConfig {
  return {
    testDir: './',
    projects: [{ name: 'exercises' }],
  };
}
