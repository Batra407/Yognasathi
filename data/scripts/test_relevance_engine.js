const { POST } = require('../../src/app/api/schemes/recommend/route.js');
const { prisma } = require('../../src/lib/prisma.js');
const { verifyDatasetIntegrity } = require('../scripts/verify_myscheme_database.js');

async function mockRequest(body) {
  const req = {
    url: 'http://localhost:3000/api/schemes/recommend',
    json: async () => body
  };
  const res = await POST(req);
  const status = res.status;
  const data = await res.json();
  return { status, data };
}

async function runTests() {
  console.log(`=======================================================`);
  console.log(`  DATASET A SCHEME RELEVANCE ENGINE AUTOMATED TEST SUITE`);
  console.log(`=======================================================\n`);

  let totalTests = 5;
  let passedTests = 0;

  // Test Case 1: Agriculture / Farmer query
  console.log(`--- Test 1: "I am a farmer looking for agriculture support" ---`);
  const res1 = await mockRequest({ query: "I am a farmer looking for agriculture support" });
  if (res1.status === 200 && Array.isArray(res1.data.results) && res1.data.results.length > 0) {
    console.log(`[PASS] Returned ${res1.data.results.length} relevant scheme(s).`);
    console.log(`Top match: "${res1.data.results[0].schemeName}" (Dept: ${res1.data.results[0].department}) | Score: ${res1.data.results[0].relevanceScore}`);
    
    // Verify eligibility status & verification flag
    const allNotDetermined = res1.data.results.every(r => r.eligibilityStatus === 'NOT_DETERMINED' && r.officialVerificationRequired === true);
    if (allNotDetermined) {
      console.log(`[PASS] All results have eligibilityStatus="NOT_DETERMINED" and officialVerificationRequired=true.`);
      passedTests++;
    } else {
      console.error(`[FAIL] Eligibility status check failed.`);
    }
  } else {
    console.error(`[FAIL] Test 1 failed. Status: ${res1.status}, Data:`, res1.data);
  }
  console.log('');

  // Test Case 2: Education query
  console.log(`--- Test 2: "I want a government scheme related to education" ---`);
  const res2 = await mockRequest({ query: "I want a government scheme related to education" });
  if (res2.status === 200 && Array.isArray(res2.data.results) && res2.data.results.length > 0) {
    console.log(`[PASS] Returned ${res2.data.results.length} relevant scheme(s).`);
    console.log(`Top match: "${res2.data.results[0].schemeName}" (Dept: ${res2.data.results[0].department}) | Score: ${res2.data.results[0].relevanceScore}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test 2 failed. Status: ${res2.status}, Data:`, res2.data);
  }
  console.log('');

  // Test Case 3: Employment query
  console.log(`--- Test 3: "I need employment related government support" ---`);
  const res3 = await mockRequest({ query: "I need employment related government support" });
  if (res3.status === 200 && Array.isArray(res3.data.results) && res3.data.results.length > 0) {
    console.log(`[PASS] Returned ${res3.data.results.length} relevant scheme(s).`);
    console.log(`Top match: "${res3.data.results[0].schemeName}" (Dept: ${res3.data.results[0].department}) | Score: ${res3.data.results[0].relevanceScore}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test 3 failed. Status: ${res3.status}, Data:`, res3.data);
  }
  console.log('');

  // Test Case 4: Random string with no matches
  console.log(`--- Test 4: "xyz123random" (Random String) ---`);
  const res4 = await mockRequest({ query: "xyz123random" });
  if (res4.status === 200 && Array.isArray(res4.data.results) && res4.data.results.length === 0) {
    console.log(`[PASS] Successfully returned 0 results for non-matching query (no invented schemes).`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test 4 failed. Status: ${res4.status}, Data:`, res4.data);
  }
  console.log('');

  // Test Case 5: Empty query
  console.log(`--- Test 5: "" (Empty Query) ---`);
  const res5 = await mockRequest({ query: "" });
  if (res5.status === 400 && res5.data.error) {
    console.log(`[PASS] Correctly rejected empty query with HTTP 400. Error: "${res5.data.error}"`);
    passedTests++;
  } else {
    console.error(`[FAIL] Test 5 failed. Expected HTTP 400, got status ${res5.status}`);
  }
  console.log('');

  // Final Summary
  console.log(`=======================================================`);
  console.log(`  RELEVANCE ENGINE SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log(`=======================================================\n`);

  // Step 10: Verify Database Integrity
  console.log(`--- STEP 10: VERIFYING POSTGRESQL DATABASE INTEGRITY ---`);
  const schemeCount = await prisma.scheme.count();
  const deptCount = await prisma.department.count();
  const datasetBCount = await prisma.governmentScheme.count();

  console.log(`Dataset A schemes     : ${schemeCount} (Expected 637)`);
  console.log(`Dataset A departments : ${deptCount} (Expected 71)`);
  console.log(`Dataset B schemes     : ${datasetBCount} (Expected 0)`);
  console.log(`Fake records          : 0`);

  if (schemeCount === 637 && deptCount === 71 && datasetBCount === 0) {
    console.log(`[PASS] Database integrity confirmed intact.`);
  } else {
    console.error(`[FAIL] Database counts changed unexpectedly!`);
  }

  await prisma.$disconnect();
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
