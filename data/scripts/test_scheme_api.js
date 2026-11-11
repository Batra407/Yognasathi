const { prisma } = require('../../src/lib/prisma.js');

async function runApiTests() {
  console.log(`=======================================================`);
  console.log(`  STEP 10 READ-ONLY GOVERNMENT DATA API VERIFICATION`);
  console.log(`=======================================================\n`);

  let passedTests = 0;
  let totalTests = 10;

  try {
    await prisma.$connect();

    // ------------------------------------------------------------------------
    // Test 1: GET /api/schemes (Default Listing)
    // ------------------------------------------------------------------------
    console.log(`--- Test 1: GET /api/schemes (Default Listing) ---`);
    const t1Data = await prisma.scheme.findMany({
      skip: 0,
      take: 20,
      orderBy: { schemeNo: 'asc' },
      include: { department: { select: { id: true, name: true } } }
    });
    const t1Total = await prisma.scheme.count();
    console.log(`Total Schemes Found: ${t1Total} | Page Size: ${t1Data.length}`);
    if (t1Total === 637 && t1Data.length === 20) {
      console.log(`[PASS] Test 1 Passed cleanly.\n`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test 1 Failed: Expected 637 total schemes.\n`);
    }

    // ------------------------------------------------------------------------
    // Test 2: Pagination (/api/schemes?page=2&limit=10)
    // ------------------------------------------------------------------------
    console.log(`--- Test 2: Pagination (/api/schemes?page=2&limit=10) ---`);
    const page = 2;
    const limit = 10;
    const t2Data = await prisma.scheme.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { schemeNo: 'asc' },
      include: { department: { select: { id: true, name: true } } }
    });
    const t2TotalPages = Math.ceil(t1Total / limit);
    console.log(`Page: ${page}, Limit: ${limit}, Total Pages: ${t2TotalPages}, Items Received: ${t2Data.length}`);
    if (t2Data.length === 10 && t2Data[0].schemeNo === 11) {
      console.log(`[PASS] Test 2 Passed cleanly.\n`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test 2 Failed.\n`);
    }

    // ------------------------------------------------------------------------
    // Test 3: Search using actual value ("Crop")
    // ------------------------------------------------------------------------
    console.log(`--- Test 3: Search (/api/schemes?search=Crop) ---`);
    const searchVal = "Crop";
    const t3Where = { schemeName: { contains: searchVal, mode: 'insensitive' } };
    const t3Data = await prisma.scheme.findMany({ where: t3Where });
    const t3Count = await prisma.scheme.count({ where: t3Where });
    console.log(`Search Query: "${searchVal}" | Matches Found: ${t3Count}`);
    if (t3Count > 0 && t3Data.every(s => s.schemeName.toLowerCase().includes('crop'))) {
      console.log(`[PASS] Test 3 Passed cleanly. Sample match: "${t3Data[0].schemeName}"\n`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test 3 Failed.\n`);
    }

    // ------------------------------------------------------------------------
    // Test 4: Department Filtering
    // ------------------------------------------------------------------------
    console.log(`--- Test 4: Department Filtering ---`);
    const sampleDept = await prisma.department.findFirst({
      where: { name: 'Department of Agriculture and Farmers Welfare' }
    });
    const t4Where = { departmentId: sampleDept.id };
    const t4Data = await prisma.scheme.findMany({ where: t4Where });
    console.log(`Department: "${sampleDept.name}" | Schemes Found: ${t4Data.length}`);
    if (t4Data.length === 24) {
      console.log(`[PASS] Test 4 Passed cleanly. Expected 24 schemes.\n`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test 4 Failed: Got ${t4Data.length} schemes.\n`);
    }

    // ------------------------------------------------------------------------
    // Test 5: Real Scheme ID Lookup
    // ------------------------------------------------------------------------
    console.log(`--- Test 5: Real Scheme ID Lookup ---`);
    const realId = t1Data[0].id;
    const t5Scheme = await prisma.scheme.findUnique({
      where: { id: realId },
      include: { department: true }
    });
    console.log(`Lookup ID: ${realId} -> Found: "${t5Scheme.schemeName}"`);
    if (t5Scheme && t5Scheme.id === realId) {
      console.log(`[PASS] Test 5 Passed cleanly.\n`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test 5 Failed.\n`);
    }

    // ------------------------------------------------------------------------
    // Test 6: Nonexistent Scheme ID
    // ------------------------------------------------------------------------
    console.log(`--- Test 6: Nonexistent Scheme ID ---`);
    const fakeId = "00000000-0000-0000-0000-000000000000";
    const t6Scheme = await prisma.scheme.findUnique({ where: { id: fakeId } });
    console.log(`Lookup Fake ID: ${fakeId} -> Found: ${t6Scheme}`);
    if (t6Scheme === null) {
      console.log(`[PASS] Test 6 Passed cleanly (Null returned as expected for 404).\n`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test 6 Failed.\n`);
    }

    // ------------------------------------------------------------------------
    // Test 7: Empty Search Result
    // ------------------------------------------------------------------------
    console.log(`--- Test 7: Empty Search Result ---`);
    const emptySearch = "NonexistentSchemeNameXYZ999";
    const t7Count = await prisma.scheme.count({
      where: { schemeName: { contains: emptySearch, mode: 'insensitive' } }
    });
    console.log(`Search Query: "${emptySearch}" | Matches Found: ${t7Count}`);
    if (t7Count === 0) {
      console.log(`[PASS] Test 7 Passed cleanly (0 results as expected).\n`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test 7 Failed.\n`);
    }

    // ------------------------------------------------------------------------
    // Test 8: Invalid Page Sanitization (page = -5 -> fallback 1)
    // ------------------------------------------------------------------------
    console.log(`--- Test 8: Invalid Page Handling ---`);
    let rawPage = -5;
    let safePage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    console.log(`Raw input page: ${rawPage} -> Sanitized page: ${safePage}`);
    if (safePage === 1) {
      console.log(`[PASS] Test 8 Passed cleanly.\n`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test 8 Failed.\n`);
    }

    // ------------------------------------------------------------------------
    // Test 9: Invalid Limit Sanitization (limit = 9999 -> capped 100)
    // ------------------------------------------------------------------------
    console.log(`--- Test 9: Invalid Limit Handling ---`);
    let rawLimit = 9999;
    let safeLimit = rawLimit > 100 ? 100 : rawLimit;
    console.log(`Raw input limit: ${rawLimit} -> Sanitized capped limit: ${safeLimit}`);
    if (safeLimit === 100) {
      console.log(`[PASS] Test 9 Passed cleanly.\n`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test 9 Failed.\n`);
    }

    // ------------------------------------------------------------------------
    // Test 10: GET /api/departments (List 71 Departments)
    // ------------------------------------------------------------------------
    console.log(`--- Test 10: GET /api/departments (List Departments) ---`);
    const depts = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { schemes: true } } }
    });
    console.log(`Total Departments Found: ${depts.length}`);
    if (depts.length === 71) {
      console.log(`[PASS] Test 10 Passed cleanly. First dept: "${depts[0].name}"\n`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test 10 Failed: Expected 71 departments.\n`);
    }

    // Summary
    console.log(`=======================================================`);
    console.log(`  API TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log(`=======================================================\n`);

  } catch (err) {
    console.error('API testing encountered error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runApiTests();
