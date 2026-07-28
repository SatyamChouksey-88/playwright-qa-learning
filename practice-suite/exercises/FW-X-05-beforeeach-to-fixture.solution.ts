export type FixtureMeta = { usesFixtures: boolean; usesBeforeEach: boolean; exportsCustomTest: boolean };

export function describeSetupPattern(): FixtureMeta {
  return { usesFixtures: true, usesBeforeEach: false, exportsCustomTest: true };
}
