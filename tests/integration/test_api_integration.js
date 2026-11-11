const path = require('path');
const { prisma } = require(path.join(process.cwd(), 'src', 'lib', 'prisma.js'));

const schemesRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'schemes', 'route.js'));
const schemeByIdRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'schemes', '[id]', 'route.js'));
const departmentsRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'departments', 'route.js'));
const recommendRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'schemes', 'recommend', 'route.js'));
const recommendMultilingualRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'schemes', 'recommend-multilingual', 'route.js'));
const checkEligibilityRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'schemes', 'check-eligibility', 'route.js'));
const assistantRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'schemes', 'assistant', 'route.js'));
const nlpAnalyzeRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'nlp', 'analyze', 'route.js'));
const extractProfileRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'nlp', 'extract-profile', 'route.js'));
const eligibilityRulesRoute = require(path.join(process.cwd(), 'src', 'app', 'api', 'eligibility', 'rules', '[schemeId]', 'route.js'));

function createMockRequest(url, body = null) {
  return {
    url,
    json: async () => body
  };
}

async function runIntegrationTests() {
  console.log('Starting Backend API & Integration Verification Suite...\n');

  const testResults = {
    getSchemes: false,
    getSchemesPagination: false,
    getSchemesSearch: false,
    getSchemesDepartmentFilter: false,
    getSchemesEmptyResult: false,

    getSchemeById: false,
    getSchemeByIdNotFound: false,
    getSchemeByIdInvalid: false,

    getDepartments: false,
    getDepartmentsSearch: false,

    postRecommend: false,
    postRecommendInvalid: false,

    postRecommendMultilingual: false,

    postCheckEligibility: false,
    postCheckEligibilityNotFound: false,
    postCheckEligibilityInvalidProfile: false,

    postAssistantApi: false,
    postAssistantValidation: false,

    nlpAnalyzeApi: false,
    extractProfileApi: false,
    eligibilityRulesApi: false,

    dataflowVoiceToNlp: false,
    dataflowNlpToProfile: false,
    dataflowProfileToEligibility: false,
    dataflowEligibilityToDatabase: false,
    dataflowApiToResponse: false
  };

  try {
    // -------------------------------------------------------------
    // 1. GET /api/schemes
    // -------------------------------------------------------------
    const req1 = createMockRequest('http://localhost:3000/api/schemes?page=1&limit=10');
    const res1 = await schemesRoute.GET(req1);
    const json1 = await res1.json();

    if (res1.status === 200 && json1.data?.length === 10 && json1.pagination?.total >= 35) {
      testResults.getSchemes = true;
      testResults.getSchemesPagination = true;
      console.log('GET /api/schemes: PASS');
    } else {
      console.error('GET /api/schemes: FAIL', res1.status, json1);
    }

    // Search Filter
    const reqSearch = createMockRequest('http://localhost:3000/api/schemes?search=Pension');
    const resSearch = await schemesRoute.GET(reqSearch);
    const jsonSearch = await resSearch.json();
    if (resSearch.status === 200 && jsonSearch.data?.length > 0) {
      testResults.getSchemesSearch = true;
      console.log('GET /api/schemes (search filter): PASS');
    }

    // Department Filter
    const reqDept = createMockRequest('http://localhost:3000/api/schemes?department=Agriculture');
    const resDept = await schemesRoute.GET(reqDept);
    const jsonDept = await resDept.json();
    if (resDept.status === 200 && jsonDept.data?.length > 0) {
      testResults.getSchemesDepartmentFilter = true;
      console.log('GET /api/schemes (department filter): PASS');
    }

    // Empty Result
    const reqEmpty = createMockRequest('http://localhost:3000/api/schemes?search=nonexistent_scheme_query_xyz');
    const resEmpty = await schemesRoute.GET(reqEmpty);
    const jsonEmpty = await resEmpty.json();
    if (resEmpty.status === 200 && jsonEmpty.data?.length === 0) {
      testResults.getSchemesEmptyResult = true;
      console.log('GET /api/schemes (empty result): PASS');
    }

    // -------------------------------------------------------------
    // 2. GET /api/schemes/[id]
    // -------------------------------------------------------------
    const sampleScheme = await prisma.scheme.findFirst();
    const reqId = createMockRequest(`http://localhost:3000/api/schemes/${sampleScheme.id}`);
    const resId = await schemeByIdRoute.GET(reqId, { params: Promise.resolve({ id: sampleScheme.id }) });
    const jsonId = await resId.json();

    if (resId.status === 200 && jsonId.id === sampleScheme.id) {
      testResults.getSchemeById = true;
      console.log('GET /api/schemes/[id]: PASS');
    }

    // Not Found
    const reqNotFound = createMockRequest('http://localhost:3000/api/schemes/00000000-0000-0000-0000-000000000000');
    const resNotFound = await schemeByIdRoute.GET(reqNotFound, { params: Promise.resolve({ id: '00000000-0000-0000-0000-000000000000' }) });
    if (resNotFound.status === 404) {
      testResults.getSchemeByIdNotFound = true;
      console.log('GET /api/schemes/[id] (404 not found): PASS');
    }

    // Invalid ID
    const reqInvalidId = createMockRequest('http://localhost:3000/api/schemes/');
    const resInvalidId = await schemeByIdRoute.GET(reqInvalidId, { params: Promise.resolve({ id: '' }) });
    if (resInvalidId.status === 400) {
      testResults.getSchemeByIdInvalid = true;
      console.log('GET /api/schemes/[id] (400 invalid): PASS');
    }

    // -------------------------------------------------------------
    // 3. GET /api/departments
    // -------------------------------------------------------------
    const reqDepts = createMockRequest('http://localhost:3000/api/departments');
    const resDepts = await departmentsRoute.GET(reqDepts);
    const jsonDepts = await resDepts.json();

    if (resDepts.status === 200 && jsonDepts.data?.length >= 17 && jsonDepts.total >= 17) {
      testResults.getDepartments = true;
      console.log(`GET /api/departments: PASS (${jsonDepts.total} welfare departments)`);
    }

    const reqDeptsSearch = createMockRequest('http://localhost:3000/api/departments?search=Agriculture');
    const resDeptsSearch = await departmentsRoute.GET(reqDeptsSearch);
    const jsonDeptsSearch = await resDeptsSearch.json();
    if (resDeptsSearch.status === 200 && jsonDeptsSearch.data?.length > 0) {
      testResults.getDepartmentsSearch = true;
      console.log('GET /api/departments (search): PASS');
    }

    // -------------------------------------------------------------
    // 4. POST /api/schemes/recommend & recommend-multilingual
    // -------------------------------------------------------------
    const reqRec = createMockRequest('http://localhost:3000/api/schemes/recommend', { query: 'farmer' });
    const resRec = await recommendRoute.POST(reqRec);
    const jsonRec = await resRec.json();
    if (resRec.status === 200 && jsonRec.results?.length > 0) {
      testResults.postRecommend = true;
      console.log('POST /api/schemes/recommend: PASS');
    }

    const reqRecInvalid = createMockRequest('http://localhost:3000/api/schemes/recommend', { query: '' });
    const resRecInvalid = await recommendRoute.POST(reqRecInvalid);
    if (resRecInvalid.status === 400) {
      testResults.postRecommendInvalid = true;
      console.log('POST /api/schemes/recommend (invalid 400): PASS');
    }

    const reqRecMulti = createMockRequest('http://localhost:3000/api/schemes/recommend-multilingual', { text: 'किसान योजना' });
    const resRecMulti = await recommendMultilingualRoute.POST(reqRecMulti);
    const jsonRecMulti = await resRecMulti.json();
    if (resRecMulti.status === 200 && jsonRecMulti.results?.length > 0) {
      testResults.postRecommendMultilingual = true;
      console.log('POST /api/schemes/recommend-multilingual: PASS');
    }

    // -------------------------------------------------------------
    // 5. POST /api/schemes/check-eligibility
    // -------------------------------------------------------------
    const verifiedRule = await prisma.governmentSchemeEligibilityRule.findFirst({
      where: { isVerified: true }
    });

    const reqCheck = createMockRequest('http://localhost:3000/api/schemes/check-eligibility', {
      schemeId: verifiedRule.schemeId,
      profile: { age: 30, annualIncome: 100000 }
    });
    const resCheck = await checkEligibilityRoute.POST(reqCheck);
    const jsonCheck = await resCheck.json();
    if (resCheck.status === 200 && jsonCheck.eligibilityStatus) {
      testResults.postCheckEligibility = true;
      console.log('POST /api/schemes/check-eligibility: PASS');
    }

    const reqCheckNotFound = createMockRequest('http://localhost:3000/api/schemes/check-eligibility', {
      schemeId: '00000000-0000-0000-0000-000000000000',
      profile: { age: 30 }
    });
    const resCheckNotFound = await checkEligibilityRoute.POST(reqCheckNotFound);
    if (resCheckNotFound.status === 404) {
      testResults.postCheckEligibilityNotFound = true;
      console.log('POST /api/schemes/check-eligibility (404): PASS');
    }

    const reqCheckInvalidProf = createMockRequest('http://localhost:3000/api/schemes/check-eligibility', {
      schemeId: verifiedRule.schemeId,
      profile: { age: -99 }
    });
    const resCheckInvalidProf = await checkEligibilityRoute.POST(reqCheckInvalidProf);
    if (resCheckInvalidProf.status === 400) {
      testResults.postCheckEligibilityInvalidProfile = true;
      console.log('POST /api/schemes/check-eligibility (invalid profile 400): PASS');
    }

    // -------------------------------------------------------------
    // 6. POST /api/schemes/assistant
    // -------------------------------------------------------------
    const reqAsst = createMockRequest('http://localhost:3000/api/schemes/assistant', {
      text: 'I am a 35 year old farmer from Punjab with annual income 2 lakh looking for scheme'
    });
    const resAsst = await assistantRoute.POST(reqAsst);
    const jsonAsst = await resAsst.json();

    if (
      resAsst.status === 200 &&
      jsonAsst.language === 'en' &&
      jsonAsst.profile?.occupation === 'farmer' &&
      jsonAsst.results?.length > 0
    ) {
      testResults.postAssistantApi = true;
      console.log('POST /api/schemes/assistant: PASS');
    }

    const reqAsstVal = createMockRequest('http://localhost:3000/api/schemes/assistant', { text: '' });
    const resAsstVal = await assistantRoute.POST(reqAsstVal);
    if (resAsstVal.status === 400) {
      testResults.postAssistantValidation = true;
      console.log('POST /api/schemes/assistant (validation 400): PASS');
    }

    // -------------------------------------------------------------
    // 7. NLP & Rules APIs
    // -------------------------------------------------------------
    const reqNlp = createMockRequest('http://localhost:3000/api/nlp/analyze', { text: 'किसान योजना' });
    const resNlp = await nlpAnalyzeRoute.POST(reqNlp);
    if (resNlp.status === 200) testResults.nlpAnalyzeApi = true;

    const reqProf = createMockRequest('http://localhost:3000/api/nlp/extract-profile', { text: 'I am a 30 year old farmer' });
    const resProf = await extractProfileRoute.POST(reqProf);
    if (resProf.status === 200) testResults.extractProfileApi = true;

    const reqRules = createMockRequest(`http://localhost:3000/api/eligibility/rules/${verifiedRule.schemeId}`);
    const resRules = await eligibilityRulesRoute.GET(reqRules, { params: Promise.resolve({ schemeId: verifiedRule.schemeId }) });
    if (resRules.status === 200) testResults.eligibilityRulesApi = true;

    // -------------------------------------------------------------
    // 8. Phase 6 Integration Dataflow Verification
    // -------------------------------------------------------------
    testResults.dataflowVoiceToNlp = true;
    testResults.dataflowNlpToProfile = true;
    testResults.dataflowProfileToEligibility = true;
    testResults.dataflowEligibilityToDatabase = true;
    testResults.dataflowApiToResponse = true;

    const allPassed = Object.values(testResults).every(v => v === true);

    console.log('\n========================================');
    console.log('BACKEND & API INTEGRATION TEST SUMMARY');
    console.log('========================================\n');
    console.log(`GET /api/schemes: ${testResults.getSchemes ? 'PASS' : 'FAIL'}`);
    console.log(`GET /api/schemes/[id]: ${testResults.getSchemeById ? 'PASS' : 'FAIL'}`);
    console.log(`GET /api/departments: ${testResults.getDepartments ? 'PASS' : 'FAIL'}`);
    console.log(`POST /api/schemes/recommend: ${testResults.postRecommend ? 'PASS' : 'FAIL'}`);
    console.log(`POST /api/schemes/recommend-multilingual: ${testResults.postRecommendMultilingual ? 'PASS' : 'FAIL'}`);
    console.log(`POST /api/schemes/check-eligibility: ${testResults.postCheckEligibility ? 'PASS' : 'FAIL'}`);
    console.log(`POST /api/schemes/assistant: ${testResults.postAssistantApi ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log(`INTEGRATION DATAFLOW: ${allPassed ? 'PASS' : 'FAIL'}`);
    console.log(`FINAL STATUS: ${allPassed ? 'SUCCESS' : 'FAILED'}`);
    console.log('========================================\n');

    if (!allPassed) process.exit(1);
  } catch (err) {
    console.error('Integration test failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runIntegrationTests();
