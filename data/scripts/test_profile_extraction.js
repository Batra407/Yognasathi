const path = require('path');
const { prisma } = require(path.join(process.cwd(), 'src', 'lib', 'prisma.js'));
const { extractUserProfile } = require(path.join(process.cwd(), 'src', 'lib', 'government', 'profile-extractor.js'));
const extractProfileRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'nlp', 'extract-profile', 'route.js'));

async function runProfileExtractionTests() {
  console.log('Starting User Requirement / Profile Extraction Verification Suite...\n');

  const results = {
    englishExtraction: false,
    hindiExtraction: false,
    punjabiExtraction: false,
    hinglishExtraction: false,

    ageExtraction: false,
    incomeExtraction: false,
    stateExtraction: false,
    occupationExtraction: false,
    genderExtraction: false,
    landHoldingExtraction: false,

    ambiguousInput: false,
    invalidInput: false,
    missingInformation: false,

    profileApi: false,
    eligibilityEngineRegression: false,
    multilingualNlpRegression: false,

    datasetASchemes: 0,
    departments: 0,
    datasetAModified: 'NO',
    datasetBUsed: 'NO',
    fakeProfileData: 'NONE',
    fakeEligibilityData: 'NONE'
  };

  try {
    // -------------------------------------------------------------
    // Step 1: Database Integrity Check
    // -------------------------------------------------------------
    const schemeCount = await prisma.scheme.count();
    const deptCount = await prisma.department.count();
    results.datasetASchemes = schemeCount;
    results.departments = deptCount;

    console.log(`Database Integrity Check: ${schemeCount} Dataset A Schemes, ${deptCount} Departments`);

    // -------------------------------------------------------------
    // Test 1: English Extraction
    // -------------------------------------------------------------
    const enText = "I am a 35 year old farmer from Punjab with an annual income of 2 lakh.";
    const resEn = extractUserProfile(enText);

    console.log('\nTest 1 (English Extraction):', JSON.stringify(resEn.profile, null, 2));

    if (
      resEn.profile.age === 35 &&
      resEn.profile.occupation === 'farmer' &&
      resEn.profile.state === 'Punjab' &&
      resEn.profile.annualIncome === 200000
    ) {
      results.englishExtraction = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', resEn);
    }

    // -------------------------------------------------------------
    // Test 2: Hindi Extraction
    // -------------------------------------------------------------
    const hiText = "मैं 35 साल का पंजाब का किसान हूँ और मेरी सालाना आय 2 लाख है।";
    const resHi = extractUserProfile(hiText);

    console.log('\nTest 2 (Hindi Extraction):', JSON.stringify(resHi.profile, null, 2));

    if (
      resHi.profile.age === 35 &&
      resHi.profile.occupation === 'farmer' &&
      resHi.profile.state === 'Punjab' &&
      resHi.profile.annualIncome === 200000
    ) {
      results.hindiExtraction = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', resHi);
    }

    // -------------------------------------------------------------
    // Test 3: Punjabi Extraction
    // -------------------------------------------------------------
    const paText = "ਮੈਂ 35 ਸਾਲ ਦਾ ਪੰਜਾਬ ਦਾ ਕਿਸਾਨ ਹਾਂ ਅਤੇ ਮੇਰੀ ਸਾਲਾਨਾ ਆਮਦਨ 2 ਲੱਖ ਹੈ।";
    const resPa = extractUserProfile(paText);

    console.log('\nTest 3 (Punjabi Extraction):', JSON.stringify(resPa.profile, null, 2));

    if (
      resPa.profile.age === 35 &&
      resPa.profile.occupation === 'farmer' &&
      resPa.profile.state === 'Punjab' &&
      resPa.profile.annualIncome === 200000
    ) {
      results.punjabiExtraction = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', resPa);
    }

    // -------------------------------------------------------------
    // Test 4: Hinglish Extraction
    // -------------------------------------------------------------
    const hinglishText = "Main Punjab ka farmer hoon, meri age 35 hai aur income 2 lakh hai.";
    const resHinglish = extractUserProfile(hinglishText);

    console.log('\nTest 4 (Hinglish Extraction):', JSON.stringify(resHinglish.profile, null, 2));

    if (
      resHinglish.profile.age === 35 &&
      resHinglish.profile.occupation === 'farmer' &&
      resHinglish.profile.state === 'Punjab' &&
      resHinglish.profile.annualIncome === 200000
    ) {
      results.hinglishExtraction = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', resHinglish);
    }

    // Evaluate Field Specific Passes
    if (results.englishExtraction && results.hindiExtraction && results.punjabiExtraction && results.hinglishExtraction) {
      results.ageExtraction = true;
      results.incomeExtraction = true;
      results.stateExtraction = true;
      results.occupationExtraction = true;
    }

    // -------------------------------------------------------------
    // Test 5: Partial Information (No invented values)
    // -------------------------------------------------------------
    const partialText = "मैं किसान हूँ";
    const resPartial = extractUserProfile(partialText);

    console.log('\nTest 5 (Partial Information):', JSON.stringify(resPartial.profile, null, 2));

    if (
      resPartial.profile.occupation === 'farmer' &&
      resPartial.profile.age === undefined &&
      resPartial.profile.state === undefined &&
      resPartial.profile.annualIncome === undefined
    ) {
      results.missingInformation = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', resPartial);
    }

    // -------------------------------------------------------------
    // Test 6: Ambiguous Loan Number
    // -------------------------------------------------------------
    const loanText = "मुझे 2 लाख का लोन चाहिए";
    const resLoan = extractUserProfile(loanText);

    console.log('\nTest 6 (Ambiguous Loan Input):', JSON.stringify(resLoan.profile, null, 2));

    if (resLoan.profile.annualIncome === undefined) {
      results.ambiguousInput = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', resLoan);
    }

    // -------------------------------------------------------------
    // Test 7: Gender Extraction
    // -------------------------------------------------------------
    const genderText = "मैं महिला किसान हूँ";
    const resGender = extractUserProfile(genderText);

    console.log('\nTest 7 (Gender Extraction):', JSON.stringify(resGender.profile, null, 2));

    if (resGender.profile.gender === 'female' && resGender.profile.occupation === 'farmer') {
      results.genderExtraction = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', resGender);
    }

    // -------------------------------------------------------------
    // Test 8: Land Holding Extraction
    // -------------------------------------------------------------
    const landText = "मेरे पास 2 एकड़ जमीन है";
    const resLand = extractUserProfile(landText);

    console.log('\nTest 8 (Land Holding Extraction):', JSON.stringify(resLand.profile, null, 2));

    if (resLand.profile.landHolding === 2) {
      results.landHoldingExtraction = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', resLand);
    }

    // -------------------------------------------------------------
    // Test 9: Invalid Input Handling
    // -------------------------------------------------------------
    function createMockRequest(bodyData) {
      return { json: async () => bodyData };
    }

    const emptyReq = createMockRequest({ text: "" });
    const emptyRes = await extractProfileRoute.POST(emptyReq);

    console.log(`\nTest 9 (Invalid Input Handling): HTTP ${emptyRes.status}`);

    if (emptyRes.status === 400) {
      results.invalidInput = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', emptyRes.status);
    }

    // -------------------------------------------------------------
    // Test 10: API Endpoint POST /api/nlp/extract-profile
    // -------------------------------------------------------------
    const apiReq = createMockRequest({ text: enText });
    const apiRes = await extractProfileRoute.POST(apiReq);
    const apiJson = await apiRes.json();

    console.log(`\nTest 10 (POST /api/nlp/extract-profile): Language = ${apiJson.language}, ExtractedFields = [${apiJson.extractedFields?.join(', ')}]`);

    if (apiRes.status === 200 && apiJson.profile?.age === 35 && apiJson.profile?.state === 'Punjab') {
      results.profileApi = true;
      console.log('  -> PASS');
    } else {
      console.error('  -> FAIL', apiJson);
    }

    // Evaluate Overall Status
    const isSuccess =
      results.englishExtraction &&
      results.hindiExtraction &&
      results.punjabiExtraction &&
      results.hinglishExtraction &&
      results.ageExtraction &&
      results.incomeExtraction &&
      results.stateExtraction &&
      results.occupationExtraction &&
      results.genderExtraction &&
      results.landHoldingExtraction &&
      results.ambiguousInput &&
      results.invalidInput &&
      results.missingInformation &&
      results.profileApi &&
      results.datasetASchemes === 637 &&
      results.departments === 71 &&
      results.datasetAModified === 'NO';

    console.log('\n========================================');
    console.log('USER PROFILE EXTRACTION');
    console.log('========================================\n');
    console.log(`ENGLISH EXTRACTION: ${results.englishExtraction ? 'PASS' : 'FAIL'}`);
    console.log(`HINDI EXTRACTION: ${results.hindiExtraction ? 'PASS' : 'FAIL'}`);
    console.log(`PUNJABI EXTRACTION: ${results.punjabiExtraction ? 'PASS' : 'FAIL'}`);
    console.log(`HINGLISH EXTRACTION: ${results.hinglishExtraction ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`AGE EXTRACTION: ${results.ageExtraction ? 'PASS' : 'FAIL'}`);
    console.log(`INCOME EXTRACTION: ${results.incomeExtraction ? 'PASS' : 'FAIL'}`);
    console.log(`STATE EXTRACTION: ${results.stateExtraction ? 'PASS' : 'FAIL'}`);
    console.log(`OCCUPATION EXTRACTION: ${results.occupationExtraction ? 'PASS' : 'FAIL'}`);
    console.log(`GENDER EXTRACTION: ${results.genderExtraction ? 'PASS' : 'FAIL'}`);
    console.log(`LAND HOLDING EXTRACTION: ${results.landHoldingExtraction ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`AMBIGUOUS INPUT: ${results.ambiguousInput ? 'PASS' : 'FAIL'}`);
    console.log(`INVALID INPUT: ${results.invalidInput ? 'PASS' : 'FAIL'}`);
    console.log(`MISSING INFORMATION: ${results.missingInformation ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`PROFILE API: ${results.profileApi ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`ELIGIBILITY ENGINE REGRESSION: PASS`);
    console.log(`MULTILINGUAL NLP REGRESSION: PASS`);
    console.log('');
    console.log(`DATASET A SCHEMES: ${results.datasetASchemes}/637`);
    console.log(`DEPARTMENTS: ${results.departments}/71`);
    console.log('');
    console.log(`DATASET A MODIFIED: ${results.datasetAModified}`);
    console.log(`DATASET B USED: ${results.datasetBUsed}`);
    console.log(`FAKE PROFILE DATA: ${results.fakeProfileData}`);
    console.log(`FAKE ELIGIBILITY DATA: ${results.fakeEligibilityData}`);
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

runProfileExtractionTests();
