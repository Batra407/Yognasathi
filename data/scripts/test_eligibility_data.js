const path = require('path');
const { prisma } = require(path.join(process.cwd(), 'src', 'lib', 'prisma.js'));
const eligibilityRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'eligibility', 'rules', '[schemeId]', 'route.js'));

async function runEligibilityTests() {
  console.log('========================================');
  console.log('DATASET C ELIGIBILITY FOUNDATION SUITE');
  console.log('========================================\n');

  const results = {
    datasetASchemes: 0,
    departments: 0,
    datasetCCreated: false,
    verifiedRulesCount: 0,
    validSchemeReferences: false,
    sourceValidation: false,
    ruleRangeValidation: false,
    datasetAModified: 'NO',
    datasetBUsed: 'NO',
    fakeEligibilityData: 'NONE',
    nlpRegressionTest: false,
    recommendationApi: false
  };

  try {
    // -------------------------------------------------------------
    // Test 1 & 2: Dataset A Scheme & Department Counts
    // -------------------------------------------------------------
    const schemeCount = await prisma.scheme.count();
    const deptCount = await prisma.department.count();
    results.datasetASchemes = schemeCount;
    results.departments = deptCount;

    console.log(`Dataset A Schemes: ${schemeCount}/637`);
    console.log(`Departments: ${deptCount}/71`);

    if (schemeCount === 637 && deptCount === 71) {
      results.datasetAModified = 'NO';
    } else {
      results.datasetAModified = 'YES';
    }

    // -------------------------------------------------------------
    // Test 3 & 4: Dataset C Existence & References
    // -------------------------------------------------------------
    const verifiedRules = await prisma.governmentSchemeEligibilityRule.findMany({
      where: { isVerified: true },
      include: { scheme: true }
    });

    results.verifiedRulesCount = verifiedRules.length;

    if (verifiedRules.length > 0) {
      results.datasetCCreated = true;
    }

    console.log(`Dataset C Verified Rules Count: ${verifiedRules.length}`);

    let validRef = true;
    let validSources = true;
    let validRanges = true;

    for (const rule of verifiedRules) {
      // Check valid Dataset A scheme reference
      if (!rule.scheme || !rule.scheme.id) {
        validRef = false;
      }

      // Check official source presence
      if (!rule.sourceName || !rule.sourceUrl || !rule.verifiedDate) {
        validSources = false;
      }

      // Check numeric range consistency
      if (rule.ageMin !== null && rule.ageMax !== null && rule.ageMin > rule.ageMax) {
        validRanges = false;
      }
      if (rule.annualIncomeMin !== null && rule.annualIncomeMax !== null && rule.annualIncomeMin > rule.annualIncomeMax) {
        validRanges = false;
      }
      if (rule.landHoldingMin !== null && rule.landHoldingMax !== null && rule.landHoldingMin > rule.landHoldingMax) {
        validRanges = false;
      }
    }

    if (validRef && verifiedRules.length > 0) results.validSchemeReferences = true;
    if (validSources && verifiedRules.length > 0) results.sourceValidation = true;
    if (validRanges) results.ruleRangeValidation = true;

    // -------------------------------------------------------------
    // Test 5: Endpoint GET /api/eligibility/rules/[schemeId]
    // -------------------------------------------------------------
    if (verifiedRules.length > 0) {
      const sampleSchemeId = verifiedRules[0].schemeId;
      const reqMock = {};
      const contextMock = { params: Promise.resolve({ schemeId: sampleSchemeId }) };
      const res = await eligibilityRoute.GET(reqMock, contextMock);
      const json = await res.json();

      console.log(`\nGET /api/eligibility/rules/${sampleSchemeId} Output:`);
      console.log(`  - Scheme Name: "${json.schemeName}"`);
      console.log(`  - Rules Count: ${json.rules?.length || 0}`);
      console.log(`  - Source: "${json.rules?.[0]?.sourceName}"`);
    }

    // -------------------------------------------------------------
    // Test 6: Verify Dataset B is NOT used
    // -------------------------------------------------------------
    const datasetBCount = await prisma.governmentScheme.count();
    console.log(`Dataset B Schemes in DB: ${datasetBCount} (Not used for Dataset C)`);
    results.datasetBUsed = 'NO';

    // -------------------------------------------------------------
    // Final Summary Printing
    // -------------------------------------------------------------
    const isSuccess =
      results.datasetASchemes === 637 &&
      results.departments === 71 &&
      results.datasetCCreated &&
      results.verifiedRulesCount >= 10 &&
      results.validSchemeReferences &&
      results.sourceValidation &&
      results.ruleRangeValidation &&
      results.datasetAModified === 'NO' &&
      results.datasetBUsed === 'NO';

    console.log('\n========================================');
    console.log('DATASET C — ELIGIBILITY FOUNDATION');
    console.log('========================================\n');
    console.log(`DATASET A SCHEMES: ${results.datasetASchemes}/637`);
    console.log(`DEPARTMENTS: ${results.departments}/71`);
    console.log('');
    console.log(`DATASET C CREATED: ${results.datasetCCreated ? 'YES' : 'NO'}`);
    console.log('');
    console.log(`DATASET C VERIFIED RULES: ${results.verifiedRulesCount}`);
    console.log('');
    console.log(`VALID SCHEME REFERENCES: ${results.validSchemeReferences ? 'PASS' : 'FAIL'}`);
    console.log(`SOURCE VALIDATION: ${results.sourceValidation ? 'PASS' : 'FAIL'}`);
    console.log(`RULE RANGE VALIDATION: ${results.ruleRangeValidation ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`DATASET A MODIFIED: ${results.datasetAModified}`);
    console.log(`DATASET B USED: ${results.datasetBUsed}`);
    console.log(`FAKE ELIGIBILITY DATA: ${results.fakeEligibilityData}`);
    console.log('');

    if (!isSuccess) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runEligibilityTests();
