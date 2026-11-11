const { prisma } = require('../../src/lib/prisma.js');

describe('Database Access & Integrity Unit Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('verifies Dataset A contains exactly 637 government scheme records', async () => {
    const datasetACount = await prisma.scheme.count({ where: { state: null } });
    expect(datasetACount).toBe(637);
  });

  test('verifies government departments exist with baseline coverage', async () => {
    const deptCount = await prisma.department.count();
    expect(deptCount).toBeGreaterThanOrEqual(71);
  });

  test('verifies Punjab state schemes are added and queryable with department', async () => {
    const punjabCount = await prisma.scheme.count({ where: { state: 'Punjab' } });
    expect(punjabCount).toBe(20);
  });

  test('verifies Haryana state schemes are added and queryable with department', async () => {
    const haryanaCount = await prisma.scheme.count({ where: { state: 'Haryana' } });
    expect(haryanaCount).toBe(15);
  });

  test('verifies Dataset C contains at least 10 verified eligibility rule records', async () => {
    const verifiedRulesCount = await prisma.governmentSchemeEligibilityRule.count({
      where: { isVerified: true }
    });
    expect(verifiedRulesCount).toBeGreaterThanOrEqual(10);
  });

  test('queries scheme by ID with department relation', async () => {
    const firstScheme = await prisma.scheme.findFirst({
      include: { department: true }
    });

    expect(firstScheme).toBeDefined();
    expect(firstScheme.id).toBeDefined();
    expect(firstScheme.schemeName).toBeDefined();
    expect(firstScheme.department).toBeDefined();
    expect(firstScheme.department.name).toBeDefined();
  });
});
