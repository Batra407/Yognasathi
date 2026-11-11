const { prisma } = require('../../src/lib/prisma.js');
const schemesRoute = require('../../src/app/api/schemes/route.js');
const schemeByIdRoute = require('../../src/app/api/schemes/[id]/route.js');
const departmentsRoute = require('../../src/app/api/departments/route.js');
const recommendRoute = require('../../src/app/api/schemes/recommend/route.js');
const assistantRoute = require('../../src/app/api/schemes/assistant/route.js');

function createMockRequest(url, body = null) {
  return {
    url,
    json: async () => body
  };
}

describe('Welfare Classification & Citizen Information Overhaul Tests', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // 1. Public scheme listing excludes budget accounting records
  test('1. Public scheme listing excludes budget accounting records', async () => {
    const req = createMockRequest('http://localhost:3000/api/schemes?page=1&limit=50');
    const res = await schemesRoute.GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.length).toBeGreaterThan(0);
    // Every single record must be a CITIZEN_WELFARE_SCHEME
    for (const scheme of json.data) {
      expect(scheme.recordType).toBe('CITIZEN_WELFARE_SCHEME');
      expect(scheme.schemeName).not.toMatch(/Actual Recoveries/i);
      expect(scheme.schemeName).not.toMatch(/Reserve Fund/i);
    }
  });

  // 2. Pending classifications are not exposed as welfare recommendations
  test('2. Pending classifications are excluded from welfare recommendations by default', async () => {
    const req = createMockRequest('http://localhost:3000/api/schemes/recommend', {
      query: 'scholarship'
    });
    const res = await recommendRoute.POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    for (const result of json.results) {
      expect(result.recordType).toBe('CITIZEN_WELFARE_SCHEME');
      expect(result.recordType).not.toBe('PENDING_CLASSIFICATION');
      expect(result.recordType).not.toBe('BUDGET_ACCOUNTING_ENTRY');
    }
  });

  // 3. Punjab and Haryana scheme details still work
  test('3. Punjab and Haryana scheme details still work with verified data', async () => {
    const punjabScheme = await prisma.scheme.findFirst({
      where: { state: 'Punjab', recordType: 'CITIZEN_WELFARE_SCHEME' }
    });
    expect(punjabScheme).toBeDefined();

    const req = createMockRequest(`http://localhost:3000/api/schemes/${punjabScheme.id}`);
    const res = await schemeByIdRoute.GET(req, {
      params: Promise.resolve({ id: punjabScheme.id })
    });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.schemeName).toBe(punjabScheme.schemeName);
    expect(json.description).toBeTruthy();
    expect(json.benefits).toBeTruthy();
    expect(json.eligibilityText).toBeTruthy();
    expect(json.officialUrl).toBeTruthy();

    const haryanaScheme = await prisma.scheme.findFirst({
      where: { state: 'Haryana', recordType: 'CITIZEN_WELFARE_SCHEME' }
    });
    expect(haryanaScheme).toBeDefined();

    const reqH = createMockRequest(`http://localhost:3000/api/schemes/${haryanaScheme.id}`);
    const resH = await schemeByIdRoute.GET(reqH, {
      params: Promise.resolve({ id: haryanaScheme.id })
    });
    expect(resH.status).toBe(200);
    const jsonH = await resH.json();
    expect(jsonH.schemeName).toBe(haryanaScheme.schemeName);
  });

  // 4. Eligibility rules remain intact
  test('4. Eligibility rules remain intact and linked to schemes', async () => {
    const ruleCount = await prisma.governmentSchemeEligibilityRule.count();
    expect(ruleCount).toBe(45);

    const allRules = await prisma.governmentSchemeEligibilityRule.findMany({
      include: { scheme: { select: { id: true, schemeName: true } } }
    });
    const unlinked = allRules.filter(r => !r.scheme);
    expect(unlinked.length).toBe(0);

    const verifiedRules = await prisma.governmentSchemeEligibilityRule.count({
      where: { isVerified: true }
    });
    expect(verifiedRules).toBe(45);
  });

  // 5. Farmer searches return relevant schemes rather than accounting entries
  test('5. Farmer search returns farmer schemes and never returns Actual Recoveries', async () => {
    const req = createMockRequest('http://localhost:3000/api/schemes/recommend', {
      query: 'financial assistance for farmers in Punjab'
    });
    const res = await recommendRoute.POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    // Must NOT contain Actual Recoveries
    const hasActualRecoveries = json.results.some(r =>
      r.schemeName.toLowerCase().includes('actual recoveries') ||
      r.schemeName.toLowerCase().includes('reserve fund')
    );
    expect(hasActualRecoveries).toBe(false);

    // Results must contain farmer-relevant or Punjab welfare schemes
    if (json.results.length > 0) {
      const topResult = json.results[0];
      expect(topResult.relevanceScore).toBeLessThanOrEqual(0.95);
      expect(topResult.relevanceScore).toBeGreaterThanOrEqual(0.10);
      expect(topResult.recordType).toBe('CITIZEN_WELFARE_SCHEME');
    }
  });

  // 6. Budget records cannot appear through assistant recommendation endpoint
  test('6. Budget records cannot appear through the assistant recommendation endpoint', async () => {
    const req = createMockRequest('http://localhost:3000/api/schemes/assistant', {
      text: 'I am looking for health and medical financial schemes for my family in Punjab'
    });
    const res = await assistantRoute.POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.results.length).toBeGreaterThan(0);

    for (const r of json.results) {
      expect(r.recordType).toBe('CITIZEN_WELFARE_SCHEME');
      expect(r.schemeName).not.toMatch(/actual recoveries/i);
      expect(r.schemeName).not.toMatch(/reserve fund/i);
      expect(r.schemeName).not.toMatch(/leased assets/i);
    }
  });

  // 7. Missing official source data is represented honestly
  test('7. Missing official source data is represented honestly without fabricated scores', async () => {
    const req = createMockRequest('http://localhost:3000/api/schemes/recommend', {
      query: 'completely_unknown_unrelated_query_12345'
    });
    const res = await recommendRoute.POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.results.length).toBe(0);
  });

  // 8. Invalid recordType filters are rejected safely
  test('8. Invalid recordType filters are rejected safely with status 400', async () => {
    const req = createMockRequest('http://localhost:3000/api/schemes?recordType=BUDGET_ACCOUNTING_ENTRY');
    const res = await schemesRoute.GET(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toMatch(/Invalid recordType/i);
  });

  // 9. Pagination and search still work
  test('9. Pagination and search work accurately on public listings', async () => {
    const req = createMockRequest('http://localhost:3000/api/schemes?page=1&limit=5');
    const res = await schemesRoute.GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.length).toBe(5);
    expect(json.pagination.page).toBe(1);
    expect(json.pagination.limit).toBe(5);
    expect(json.pagination.total).toBe(35);
    expect(json.pagination.totalPages).toBe(7);

    // Search filter
    const reqSearch = createMockRequest('http://localhost:3000/api/schemes?search=Pension');
    const resSearch = await schemesRoute.GET(reqSearch);
    expect(resSearch.status).toBe(200);
    const jsonSearch = await resSearch.json();
    expect(jsonSearch.data.length).toBeGreaterThan(0);
    for (const s of jsonSearch.data) {
      expect(s.schemeName.toLowerCase()).toContain('pension');
    }
  });

  // 10. Departments endpoint filters to departments with citizen welfare schemes
  test('10. Departments endpoint lists only departments with citizen welfare schemes by default', async () => {
    const req = createMockRequest('http://localhost:3000/api/departments');
    const res = await departmentsRoute.GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.total).toBe(17);
    expect(json.data.length).toBe(17);

    // Every department returned must have at least 1 welfare scheme
    for (const dept of json.data) {
      expect(dept._count.schemes).toBeGreaterThan(0);
    }

    // Budget-only departments like "Department of Fertilisers" must NOT appear
    const fertilisersDept = json.data.find(d => d.name.toLowerCase().includes('fertilisers'));
    expect(fertilisersDept).toBeUndefined();
  });
});
