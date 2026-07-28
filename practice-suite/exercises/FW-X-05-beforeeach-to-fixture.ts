export type FixtureMeta = { usesFixtures: boolean; usesBeforeEach: boolean; exportsCustomTest: boolean };

export function describeSetupPattern(): FixtureMeta {
  // TODO: prefer fixtures over beforeEach for shared login setup
  return { usesFixtures: false, usesBeforeEach: true, exportsCustomTest: false };
}
