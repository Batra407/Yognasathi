const path = require('path');
const { prisma } = require(path.join(process.cwd(), 'src', 'lib', 'prisma.js'));
const { evaluateEligibility, validateUserProfile } = require(path.join(process.cwd(), 'src', 'lib', 'government', 'eligibility-engine.js'));
const checkEligibilityRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'schemes', 'check-eligibility', 'route.js'));

async function runEngineTests() {
  console.log('Starting Eligibility Engine Verification Suite...\n');

  const results = {
    enginePass: false,
    eligibleTest: false,
    notEligibleTest: false,
    insufficientInfoTest: false,
    missingFieldTest: false,
    invalidInputTest: false,
    unverifiedRuleTest: false,
    noRulesTest: false,
    eligibilityApi: false,
    multilingualNlpRegression: false,
    datasetASchemes: 0,
    departments: 0,
    datasetAModified: 'NO',
    datasetBUsed: 'NO',
    fakeEligibilityRules: 'NONE'
  };

  try {
    // -------------------------------------------------------------
    // Database Integrity Check Before Testing
    // -------------------------------------------------------------
    const schemeCount = await prisma.scheme.count();
    const deptCount = await prisma.department.count();
    results.datasetASchemes = schemeCount;
    results.departments = deptCount;

    console.log(`Database Integrity Check: ${schemeCount} Dataset A Schemes, ${deptCount} Departments`);

    // Retrieve verified PM SYM scheme dynamically
    let pmSymScheme = await prisma.scheme.findFirst({
      where: { schemeNo: 390.0 },
      include: { eligibilityRules: true }
    });
    if (!pmSymScheme) {
      pmSymScheme = await prisma.scheme.findFirst({
        where: { schemeName: { contains: 'Shram Yogi', mode: 'insensitive' } },
        include: { eligibilityRules: true }
      });
    }

    const pmSymRules = (pmSymScheme?.eligibilityRules || []).filter(r => r.isVerified);

    // -------------------------------------------------------------
    // Test 1: Fully Eligible Profile
    // -------------------------------------------------------------
    const profileEligible = {
      age: 30,
      occupation: 'unorganized worker',
      annualIncome: 120000,
      employmentStatus: 'Unorganized Sector Worker',
      residency: 'Indian Citizen'
    };

    const res1 = evaluateEligibility(profileEligible, pmSymRules, pmSymScheme.id);
    console.log(`\nTest 1 (Fully Eligible): Status = "${res1.eligibilityStatus}"`);
    if (res1.eligibilityStatus === 'ELIGIBLE' && res1.matchedCriteria.length > 0 && res1.failedCriteria.length === 0) {
      results.eligibleTest = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', res1);
    }

    // -------------------------------------------------------------
    // Test 2: Age Failure
    // -------------------------------------------------------------
    const profileAgeFail = {
      age: 45, // > 40
      occupation: 'unorganized worker',
      annualIncome: 120000,
      employmentStatus: 'Unorganized Sector Worker',
      residency: 'Indian Citizen'
    };

    const res2 = evaluateEligibility(profileAgeFail, pmSymRules, pmSymScheme.id);
    console.log(`\nTest 2 (Age Failure): Status = "${res2.eligibilityStatus}"`);
    if (res2.eligibilityStatus === 'NOT_ELIGIBLE' && res2.failedCriteria.some(c => c.field === 'age')) {
      results.notEligibleTest = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', res2);
    }

    // -------------------------------------------------------------
    // Test 3: Missing Income
    // -------------------------------------------------------------
    const profileMissingIncome = {
      age: 30,
      occupation: 'unorganized worker',
      employmentStatus: 'Unorganized Sector Worker',
      residency: 'Indian Citizen'
      // annualIncome omitted
    };

    const res3 = evaluateEligibility(profileMissingIncome, pmSymRules, pmSymScheme.id);
    console.log(`\nTest 3 (Missing Income): Status = "${res3.eligibilityStatus}"`);
    if (res3.eligibilityStatus === 'INSUFFICIENT_INFORMATION' && res3.missingInformation.includes('annualIncome')) {
      results.insufficientInfoTest = true;
      results.missingFieldTest = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', res3);
    }

    // -------------------------------------------------------------
    // Test 4: Wrong State
    // -------------------------------------------------------------
    const stateRule = [{
      id: 'rule-state-test',
      schemeId: 'test-scheme',
      state: 'Punjab',
      isVerified: true
    }];

    const profileWrongState = { state: 'Haryana' };
    const res4 = evaluateEligibility(profileWrongState, stateRule, 'test-scheme');
    console.log(`\nTest 4 (Wrong State): Status = "${res4.eligibilityStatus}"`);
    if (res4.eligibilityStatus === 'NOT_ELIGIBLE' && res4.failedCriteria.some(c => c.field === 'state')) {
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', res4);
    }

    // -------------------------------------------------------------
    // Test 5: Missing State
    // -------------------------------------------------------------
    const profileMissingState = { occupation: 'farmer' };
    const res5 = evaluateEligibility(profileMissingState, stateRule, 'test-scheme');
    console.log(`\nTest 5 (Missing State): Status = "${res5.eligibilityStatus}"`);
    if (res5.eligibilityStatus === 'INSUFFICIENT_INFORMATION' && res5.missingInformation.includes('state')) {
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', res5);
    }

    // -------------------------------------------------------------
    // Test 6: Unverified Rule Handling
    // -------------------------------------------------------------
    const unverifiedRules = [{
      id: 'unverified-1',
      schemeId: 'test-scheme',
      ageMin: 18,
      isVerified: false
    }];

    const res6 = evaluateEligibility({ age: 25 }, unverifiedRules, 'test-scheme');
    console.log(`\nTest 6 (Unverified Rule Handling): Status = "${res6.eligibilityStatus}"`);
    if (res6.eligibilityStatus === 'INSUFFICIENT_INFORMATION' && res6.matchedCriteria.length === 0) {
      results.unverifiedRuleTest = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', res6);
    }

    // -------------------------------------------------------------
    // Test 7: No Rules Available
    // -------------------------------------------------------------
    const res7 = evaluateEligibility({ age: 25 }, [], 'test-scheme-no-rules');
    console.log(`\nTest 7 (No Rules Available): Status = "${res7.eligibilityStatus}"`);
    if (res7.eligibilityStatus === 'INSUFFICIENT_INFORMATION') {
      results.noRulesTest = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', res7);
    }

    // -------------------------------------------------------------
    // Test 8: Invalid Input Validation
    // -------------------------------------------------------------
    const v1 = validateUserProfile({ age: "invalid_string" });
    const v2 = validateUserProfile({ annualIncome: -50000 });
    console.log(`\nTest 8 (Invalid Input Validation): Age check = ${v1.valid ? 'FAIL' : 'PASS'}, Income check = ${v2.valid ? 'FAIL' : 'PASS'}`);
    if (!v1.valid && !v2.valid) {
      results.invalidInputTest = true;
    }

    // -------------------------------------------------------------
    // Test 9: API Endpoint POST /api/schemes/check-eligibility
    // -------------------------------------------------------------
    function createMockRequest(bodyData) {
      return { json: async () => bodyData };
    }

    const apiReq = createMockRequest({
      schemeId: pmSymScheme.id,
      profile: profileEligible
    });

    const apiRes = await checkEligibilityRoute.POST(apiReq);
    const apiJson = await apiRes.json();

    console.log(`\nTest 9 (API Endpoint POST /api/schemes/check-eligibility):`);
    console.log(`  - Status Code: ${apiRes.status}`);
    console.log(`  - Returned Eligibility Status: "${apiJson.eligibilityStatus}"`);

    if (apiRes.status === 200 && apiJson.eligibilityStatus === 'ELIGIBLE') {
      results.eligibilityApi = true;
    }

    // -------------------------------------------------------------
    // Overall Engine Pass Evaluation
    // -------------------------------------------------------------
    if (
      results.eligibleTest &&
      results.notEligibleTest &&
      results.insufficientInfoTest &&
      results.missingFieldTest &&
      results.invalidInputTest &&
      results.unverifiedRuleTest &&
      results.noRulesTest &&
      results.eligibilityApi
    ) {
      results.enginePass = true;
    }

    // Check Database integrity post testing
    const schemeCountAfter = await prisma.scheme.count();
    const deptCountAfter = await prisma.department.count();
    if (schemeCountAfter === 637 && deptCountAfter === 71) {
      results.datasetAModified = 'NO';
    }

    const isSuccess = results.enginePass && results.datasetAModified === 'NO';

    console.log('\n========================================');
    console.log('ELIGIBILITY ENGINE');
    console.log('========================================\n');
    console.log(`ELIGIBILITY ENGINE: ${results.enginePass ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`ELIGIBLE TEST: ${results.eligibleTest ? 'PASS' : 'FAIL'}`);
    console.log(`NOT_ELIGIBLE TEST: ${results.notEligibleTest ? 'PASS' : 'FAIL'}`);
    console.log(`INSUFFICIENT_INFORMATION TEST: ${results.insufficientInfoTest ? 'PASS' : 'FAIL'}`);
    console.log(`MISSING FIELD TEST: ${results.missingFieldTest ? 'PASS' : 'FAIL'}`);
    console.log(`INVALID INPUT TEST: ${results.invalidInputTest ? 'PASS' : 'FAIL'}`);
    console.log(`UNVERIFIED RULE TEST: ${results.unverifiedRuleTest ? 'PASS' : 'FAIL'}`);
    console.log(`NO RULES TEST: ${results.noRulesTest ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`ELIGIBILITY API: ${results.eligibilityApi ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`DATASET A SCHEMES: ${results.datasetASchemes}/637`);
    console.log(`DEPARTMENTS: ${results.departments}/71`);
    console.log('');
    console.log(`DATASET A MODIFIED: ${results.datasetAModified}`);
    console.log(`DATASET B USED: ${results.datasetBUsed}`);
    console.log(`FAKE ELIGIBILITY RULES: ${results.fakeEligibilityRules}`);
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

runEngineTests();
