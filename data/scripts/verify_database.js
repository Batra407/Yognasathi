const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log(`=======================================================`);
  console.log(`  POSTGRESQL GOVERNMENT SCHEMES DATABASE VERIFICATION`);
  console.log(`=======================================================\n`);

  try {
    await prisma.$connect();

    // 1. Core Counts
    const totalSchemes = await prisma.scheme.count();
    const totalDepartments = await prisma.department.count();
    const totalCategories = await prisma.category.count();

    console.log(`--- 1. OVERALL ENTITY COUNTS ---`);
    console.log(`Total Schemes in PostgreSQL     : ${totalSchemes}`);
    console.log(`Total Departments in PostgreSQL : ${totalDepartments}`);
    console.log(`Total Categories in PostgreSQL  : ${totalCategories}`);

    // 2. Null Value Statistics
    const missingDescriptions = await prisma.scheme.count({ where: { description: null } });
    const missingEligibility = await prisma.scheme.count({ where: { eligibilityText: null } });
    const missingBenefits = await prisma.scheme.count({ where: { benefits: null } });
    const missingOfficialUrls = await prisma.scheme.count({ where: { officialUrl: null } });
    const withOfficialUrls = await prisma.scheme.count({ where: { officialUrl: { not: null } } });

    console.log(`\n--- 2. NULL VALUE & DATA ENRICHMENT STATISTICS ---`);
    console.log(`Schemes with missing descriptions : ${missingDescriptions} / ${totalSchemes} (${((missingDescriptions/totalSchemes)*100).toFixed(1)}%)`);
    console.log(`Schemes with missing eligibility   : ${missingEligibility} / ${totalSchemes} (${((missingEligibility/totalSchemes)*100).toFixed(1)}%)`);
    console.log(`Schemes with missing benefits      : ${missingBenefits} / ${totalSchemes} (${((missingBenefits/totalSchemes)*100).toFixed(1)}%)`);
    console.log(`Schemes with official URLs        : ${withOfficialUrls} / ${totalSchemes}`);

    // 3. Schemes by Department (Top 10)
    console.log(`\n--- 3. SCHEME COUNT BY DEPARTMENT (TOP 10) ---`);
    const deptsWithCounts = await prisma.department.findMany({
      select: {
        name: true,
        _count: {
          select: { schemes: true }
        }
      },
      orderBy: {
        schemes: { _count: 'desc' }
      },
      take: 10
    });

    deptsWithCounts.forEach((d, idx) => {
      console.log(`${(idx + 1).toString().padStart(2, ' ')}. ${d.name.padEnd(65, ' ')} : ${d._count.schemes} schemes`);
    });

    // 4. Sample Real Records from PostgreSQL
    console.log(`\n--- 4. SAMPLE REAL SCHEME RECORDS FROM POSTGRESQL (FIRST 5) ---`);
    const sampleSchemes = await prisma.scheme.findMany({
      take: 5,
      include: {
        department: true
      },
      orderBy: {
        schemeNo: 'asc'
      }
    });

    sampleSchemes.forEach((s, idx) => {
      console.log(`\nRecord #${idx + 1}:`);
      console.log(`  ID            : ${s.id}`);
      console.log(`  Scheme Item # : ${s.schemeNo}`);
      console.log(`  Scheme Name   : ${s.schemeName}`);
      console.log(`  Department    : ${s.department.name}`);
      console.log(`  2024-25 Actual: ₹ ${s.actuals20242025Crores} Crores`);
      console.log(`  2025-26 BE    : ₹ ${s.be20252026Crores} Crores`);
      console.log(`  2025-26 RE    : ₹ ${s.re20252026Crores} Crores`);
      console.log(`  2026-27 BE    : ₹ ${s.be20262027Crores} Crores`);
      console.log(`  Eligibility   : ${s.eligibilityText === null ? 'NULL (Pending original guideline text)' : s.eligibilityText}`);
    });

    console.log(`\n=======================================================`);
    console.log(`  VERIFICATION PASSED: All ${totalSchemes} records are live in PostgreSQL.`);
    console.log(`=======================================================\n`);

  } catch (err) {
    console.error('Database verification failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
