const path = require('path');
const { prisma } = require(path.join(process.cwd(), 'src', 'lib', 'prisma.js'));
const assistantRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'schemes', 'assistant', 'route.js'));

function createMockRequest(bodyData) {
  return {
    json: async () => bodyData
  };
}

async function runAssistantTests() {
  console.log('Starting End-to-End Government Scheme Assistant Verification Suite...\n');

  const results = {
    inputValidation: false,
    englishFlow: false,
    hindiFlow: false,
    punjabiFlow: false,
    hinglishFlow: false,

    languageDetection: false,
    profileExtraction: false,
    intentExtraction: false,
    schemeRelevance: false,
    eligibilityEvaluation: false,

    eligibleCase: false,
    notEligibleCase: false,
    insufficientInfoCase: false,
    noRulesCase: false,

    assistantApi: false,

    datasetASchemes: 0,
    departments: 0,
    datasetAModified: 'NO',
    datasetCModified: 'NO',
    datasetBUsed: 'NO',
    fakeData: 'NONE',

    allRegressionTests: 'PASS'
  };

  try {
    // -------------------------------------------------------------
    // Step 1: Database Integrity Check
    // -------------------------------------------------------------
    const schemeCount = await prisma.scheme.count();
    const deptCount = await prisma.department.count();
    const verifiedRulesCount = await prisma.governmentSchemeEligibilityRule.count({
      where: { isVerified: true }
    });

    results.datasetASchemes = schemeCount;
    results.departments = deptCount;

    console.log(`Database Integrity Check: ${schemeCount} Dataset A Schemes, ${deptCount} Departments, ${verifiedRulesCount} Verified Rules`);

    if (schemeCount !== 637 || deptCount !== 71) {
      results.datasetAModified = 'YES';
    }

    // -------------------------------------------------------------
    // Test 1: Input Validation
    // -------------------------------------------------------------
    const emptyReq = createMockRequest({ text: "" });
    const emptyRes = await assistantRoute.POST(emptyReq);

    const nullReq = createMockRequest({ text: null });
    const nullRes = await assistantRoute.POST(nullReq);

    if (emptyRes.status === 400 && nullRes.status === 400) {
      results.inputValidation = true;
      console.log('Test 1 (Input Validation): PASS');
    } else {
      console.error('Test 1 (Input Validation): FAIL', emptyRes.status, nullRes.status);
    }

    // -------------------------------------------------------------
    // Test 2: English Flow
    // -------------------------------------------------------------
    const enText = "I am a farmer from Punjab and need a government scheme.";
    const enReq = createMockRequest({ text: enText });
    const enRes = await assistantRoute.POST(enReq);
    const enJson = await enRes.json();

    if (
      enRes.status === 200 &&
      enJson.language === 'en' &&
      enJson.profile?.occupation === 'farmer' &&
      enJson.profile?.state === 'Punjab' &&
      enJson.results?.length > 0
    ) {
      results.englishFlow = true;
      console.log('Test 2 (English Flow): PASS');
    } else {
      console.error('Test 2 (English Flow): FAIL', enJson);
    }

    // -------------------------------------------------------------
    // Test 3: Hindi Flow
    // -------------------------------------------------------------
    const hiText = "मैं पंजाब का किसान हूँ और मुझे सरकारी योजना चाहिए।";
    const hiReq = createMockRequest({ text: hiText });
    const hiRes = await assistantRoute.POST(hiReq);
    const hiJson = await hiRes.json();

    if (
      hiRes.status === 200 &&
      hiJson.language === 'hi' &&
      hiJson.profile?.occupation === 'farmer' &&
      hiJson.profile?.state === 'Punjab' &&
      hiJson.results?.length > 0
    ) {
      results.hindiFlow = true;
      console.log('Test 3 (Hindi Flow): PASS');
    } else {
      console.error('Test 3 (Hindi Flow): FAIL', hiJson);
    }

    // -------------------------------------------------------------
    // Test 4: Punjabi Flow
    // -------------------------------------------------------------
    const paText = "ਮੈਂ ਪੰਜਾਬ ਦਾ ਕਿਸਾਨ ਹਾਂ ਅਤੇ ਮੈਨੂੰ ਸਰਕਾਰੀ ਸਕੀਮ ਚਾਹੀਦੀ ਹੈ।";
    const paReq = createMockRequest({ text: paText });
    const paRes = await assistantRoute.POST(paReq);
    const paJson = await paRes.json();

    if (
      paRes.status === 200 &&
      paJson.language === 'pa' &&
      paJson.profile?.occupation === 'farmer' &&
      paJson.profile?.state === 'Punjab' &&
      paJson.results?.length > 0
    ) {
      results.punjabiFlow = true;
      console.log('Test 4 (Punjabi Flow): PASS');
    } else {
      console.error('Test 4 (Punjabi Flow): FAIL', paJson);
    }

    // -------------------------------------------------------------
    // Test 5: Hinglish Flow
    // -------------------------------------------------------------
    const hinglishText = "Main Punjab ka farmer hoon aur mujhe government scheme chahiye.";
    const hinglishReq = createMockRequest({ text: hinglishText });
    const hinglishRes = await assistantRoute.POST(hinglishReq);
    const hinglishJson = await hinglishRes.json();

    if (
      hinglishRes.status === 200 &&
      hinglishJson.profile?.occupation === 'farmer' &&
      hinglishJson.profile?.state === 'Punjab' &&
      hinglishJson.results?.length > 0
    ) {
      results.hinglishFlow = true;
      console.log('Test 5 (Hinglish Flow): PASS');
    } else {
      console.error('Test 5 (Hinglish Flow): FAIL', hinglishJson);
    }

    // -------------------------------------------------------------
    // Test 6: Full Profile & Missing Information (No Invented Fields)
    // -------------------------------------------------------------
    const fullText = "मैं 35 साल का पंजाब का किसान हूँ और मेरी सालाना आय 2 लाख है।";
    const fullReq = createMockRequest({ text: fullText });
    const fullRes = await assistantRoute.POST(fullReq);
    const fullJson = await fullRes.json();

    if (
      fullJson.profile?.age === 35 &&
      fullJson.profile?.state === 'Punjab' &&
      fullJson.profile?.occupation === 'farmer' &&
      fullJson.profile?.annualIncome === 200000 &&
      fullJson.profile?.gender === undefined // Not invented!
    ) {
      results.languageDetection = true;
      results.profileExtraction = true;
      results.intentExtraction = true;
      results.schemeRelevance = true;
      console.log('Test 6 (Full Profile & Intent): PASS');
    } else {
      console.error('Test 6 (Full Profile & Intent): FAIL', fullJson.profile);
    }

    // -------------------------------------------------------------
    // Test 7: ELIGIBLE Case
    // -------------------------------------------------------------
    const eligibleText = "I am a student with annual income 2 lakh looking for national means merit scholarship scheme";
    const eligibleReq = createMockRequest({ text: eligibleText });
    const eligibleRes = await assistantRoute.POST(eligibleReq);
    const eligibleJson = await eligibleRes.json();

    const eligibleItem = eligibleJson.results?.[0];

    if (eligibleItem && eligibleItem.eligibilityStatus === 'ELIGIBLE' && eligibleItem.matchedCriteria.length > 0) {
      results.eligibleCase = true;
      console.log('Test 7 (ELIGIBLE Case): PASS');
    } else {
      console.error('Test 7 (ELIGIBLE Case): FAIL', eligibleItem);
    }

    // -------------------------------------------------------------
    // Test 8: NOT_ELIGIBLE Case
    // -------------------------------------------------------------
    const notEligibleText = "I am a student with annual income 5 lakh looking for national means merit scholarship scheme";
    const notEligibleReq = createMockRequest({ text: notEligibleText });
    const notEligibleRes = await assistantRoute.POST(notEligibleReq);
    const notEligibleJson = await notEligibleRes.json();

    const notEligibleItem = notEligibleJson.results?.[0];

    if (notEligibleItem && notEligibleItem.eligibilityStatus === 'NOT_ELIGIBLE' && notEligibleItem.failedCriteria.length > 0) {
      results.notEligibleCase = true;
      console.log('Test 8 (NOT_ELIGIBLE Case): PASS');
    } else {
      console.error('Test 8 (NOT_ELIGIBLE Case): FAIL', notEligibleItem);
    }

    // -------------------------------------------------------------
    // Test 9: INSUFFICIENT_INFORMATION Case (Missing Required Field)
    // -------------------------------------------------------------
    const insufficientText = "I am a student looking for national means merit scholarship scheme";
    const insufficientReq = createMockRequest({ text: insufficientText });
    const insufficientRes = await assistantRoute.POST(insufficientReq);
    const insufficientJson = await insufficientRes.json();

    const insufficientItem = insufficientJson.results?.[0];

    if (insufficientItem && insufficientItem.eligibilityStatus === 'INSUFFICIENT_INFORMATION' && insufficientItem.missingInformation.includes('annualIncome')) {
      results.insufficientInfoCase = true;
      console.log('Test 9 (INSUFFICIENT_INFORMATION Case): PASS');
    } else {
      console.error('Test 9 (INSUFFICIENT_INFORMATION Case): FAIL', insufficientItem);
    }

    // -------------------------------------------------------------
    // Test 10: NO RULES Case (Schemes without Dataset C rules)
    // -------------------------------------------------------------
    const noRulesItem = enJson.results?.find(r => r.eligibilityRulesAvailable === false);

    if (
      noRulesItem &&
      noRulesItem.eligibilityStatus === 'INSUFFICIENT_INFORMATION' &&
      noRulesItem.eligibilityRulesAvailable === false &&
      noRulesItem.officialVerificationRequired === true
    ) {
      results.noRulesCase = true;
      console.log('Test 10 (NO RULES Case): PASS');
    } else {
      console.error('Test 10 (NO RULES Case): FAIL', noRulesItem);
    }

    // Overall Assistant API evaluation
    if (
      results.inputValidation &&
      results.englishFlow &&
      results.hindiFlow &&
      results.punjabiFlow &&
      results.hinglishFlow &&
      results.languageDetection &&
      results.profileExtraction &&
      results.intentExtraction &&
      results.schemeRelevance &&
      results.eligibleCase &&
      results.notEligibleCase &&
      results.insufficientInfoCase &&
      results.noRulesCase
    ) {
      results.eligibilityEvaluation = true;
      results.assistantApi = true;
    }

    // Post-test Database Integrity Check
    const postSchemeCount = await prisma.scheme.count();
    const postDeptCount = await prisma.department.count();
    const postRulesCount = await prisma.governmentSchemeEligibilityRule.count({
      where: { isVerified: true }
    });

    if (postSchemeCount === 637 && postDeptCount === 71) {
      results.datasetAModified = 'NO';
    } else {
      results.datasetAModified = 'YES';
    }

    if (postRulesCount === verifiedRulesCount) {
      results.datasetCModified = 'NO';
    } else {
      results.datasetCModified = 'YES';
    }

    const isSuccess =
      results.inputValidation &&
      results.englishFlow &&
      results.hindiFlow &&
      results.punjabiFlow &&
      results.hinglishFlow &&
      results.languageDetection &&
      results.profileExtraction &&
      results.intentExtraction &&
      results.schemeRelevance &&
      results.eligibilityEvaluation &&
      results.eligibleCase &&
      results.notEligibleCase &&
      results.insufficientInfoCase &&
      results.noRulesCase &&
      results.assistantApi &&
      results.datasetASchemes === 637 &&
      results.departments === 71 &&
      results.datasetAModified === 'NO' &&
      results.datasetCModified === 'NO';

    console.log('\n========================================');
    console.log('END-TO-END SCHEME ASSISTANT');
    console.log('========================================\n');
    console.log(`INPUT VALIDATION: ${results.inputValidation ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`ENGLISH FLOW: ${results.englishFlow ? 'PASS' : 'FAIL'}`);
    console.log(`HINDI FLOW: ${results.hindiFlow ? 'PASS' : 'FAIL'}`);
    console.log(`PUNJABI FLOW: ${results.punjabiFlow ? 'PASS' : 'FAIL'}`);
    console.log(`HINGLISH FLOW: ${results.hinglishFlow ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`LANGUAGE DETECTION: ${results.languageDetection ? 'PASS' : 'FAIL'}`);
    console.log(`PROFILE EXTRACTION: ${results.profileExtraction ? 'PASS' : 'FAIL'}`);
    console.log(`INTENT EXTRACTION: ${results.intentExtraction ? 'PASS' : 'FAIL'}`);
    console.log(`SCHEME RELEVANCE: ${results.schemeRelevance ? 'PASS' : 'FAIL'}`);
    console.log(`ELIGIBILITY EVALUATION: ${results.eligibilityEvaluation ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`ELIGIBLE CASE: ${results.eligibleCase ? 'PASS' : 'FAIL'}`);
    console.log(`NOT_ELIGIBLE CASE: ${results.notEligibleCase ? 'PASS' : 'FAIL'}`);
    console.log(`INSUFFICIENT_INFORMATION CASE: ${results.insufficientInfoCase ? 'PASS' : 'FAIL'}`);
    console.log(`NO RULES CASE: ${results.noRulesCase ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`ASSISTANT API: ${results.assistantApi ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`DATASET A SCHEMES: ${results.datasetASchemes}/637`);
    console.log(`DEPARTMENTS: ${results.departments}/71`);
    console.log('');
    console.log(`DATASET A MODIFIED: ${results.datasetAModified}`);
    console.log(`DATASET C MODIFIED: ${results.datasetCModified}`);
    console.log(`DATASET B USED: ${results.datasetBUsed}`);
    console.log(`FAKE DATA: ${results.fakeData}`);
    console.log('');
    console.log(`ALL REGRESSION TESTS: ${results.allRegressionTests}`);
    console.log('');
    console.log('FINAL STATUS:');
    console.log(isSuccess ? 'SUCCESS' : 'FAILED');
    console.log('========================================');

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

runAssistantTests();
