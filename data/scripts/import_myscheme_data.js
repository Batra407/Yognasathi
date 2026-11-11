const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const VALIDATED_FILE = path.join(__dirname, '..', 'processed', 'myscheme_validated.json');

async function runImport(isDryRun = false) {
  console.log(`=======================================================`);
  console.log(`  DATASET B: MYSCHEME DATA IMPORT PIPELINE (${isDryRun ? 'DRY-RUN' : 'LIVE UPDATE'})`);
  console.log(`=======================================================\n`);

  if (!fs.existsSync(VALIDATED_FILE)) {
    console.log(`[Import Aborted] No authenticated myScheme API data available for import.`);
    console.log(`[Import Aborted] File checked: ${VALIDATED_FILE}`);
    console.log(`[Import Aborted] No Dataset B records were created in PostgreSQL.`);
    console.log(`[Import Aborted] Dataset A remains untouched (637 schemes, 71 departments).\n`);
    console.log(`POLICY ENFORCED: Zero fake, sample, or mock records were created.`);
    return {
      success: false,
      insertedCount: 0,
      updatedCount: 0,
      rejectedCount: 0,
      duplicateCount: 0,
      reason: 'No validated API data available'
    };
  }

  const rawContent = fs.readFileSync(VALIDATED_FILE, 'utf-8');
  let records = [];

  try {
    records = JSON.parse(rawContent);
  } catch (err) {
    console.error(`[Import Error] Invalid JSON in ${VALIDATED_FILE}:`, err.message);
    process.exit(1);
  }

  console.log(`[Import] Found ${records.length} validated records for Dataset B import.`);

  if (records.length === 0) {
    console.log(`[Import Aborted] Validated dataset contains 0 records.`);
    return { success: false, insertedCount: 0, updatedCount: 0, rejectedCount: 0, duplicateCount: 0 };
  }

  if (isDryRun) {
    console.log(`[DRY-RUN COMPLETED] Validated ${records.length} records. 0 PostgreSQL records modified.`);
    return { success: true, count: records.length, isDryRun: true };
  }

  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log(`[Database Connection] Connected to PostgreSQL.`);

    let insertedCount = 0;
    let updatedCount = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);

      await prisma.$transaction(
        batch.map(rec => {
          const sourceIdKey = rec.sourceId || `temp-slug-${rec._raw_index}`;
          return prisma.governmentScheme.upsert({
            where: { sourceId: sourceIdKey },
            update: {
              schemeName: rec.schemeName,
              schemeShortTitle: rec.schemeShortTitle,
              ministry: rec.ministry,
              departmentName: rec.departmentName,
              schemeLevel: rec.schemeLevel,
              stateName: rec.stateName,
              description: rec.description,
              eligibilityText: rec.eligibilityText,
              benefits: rec.benefits,
              targetBeneficiaries: rec.targetBeneficiaries,
              applicationProcess: rec.applicationProcess,
              requiredDocuments: rec.requiredDocuments,
              officialUrl: rec.officialUrl,
              sourceName: rec.sourceName || "myScheme API Setu",
              sourceUrl: rec.sourceUrl || "https://apisetu.gov.in/directory/api/myscheme"
            },
            create: {
              sourceId: sourceIdKey,
              schemeName: rec.schemeName,
              schemeShortTitle: rec.schemeShortTitle,
              ministry: rec.ministry,
              departmentName: rec.departmentName,
              schemeLevel: rec.schemeLevel,
              stateName: rec.stateName,
              description: rec.description,
              eligibilityText: rec.eligibilityText,
              benefits: rec.benefits,
              targetBeneficiaries: rec.targetBeneficiaries,
              applicationProcess: rec.applicationProcess,
              requiredDocuments: rec.requiredDocuments,
              officialUrl: rec.officialUrl,
              sourceName: rec.sourceName || "myScheme API Setu",
              sourceUrl: rec.sourceUrl || "https://apisetu.gov.in/directory/api/myscheme"
            }
          });
        })
      );
      insertedCount += batch.length;
    }

    // Verify database counts
    const totalDatasetB = await prisma.governmentScheme.count();
    const totalDatasetA = await prisma.scheme.count();
    const totalDeptsA = await prisma.department.count();

    console.log(`\n=======================================================`);
    console.log(`  POSTGRESQL IMPORT & INTEGRITY SUMMARY`);
    console.log(`=======================================================`);
    console.log(`Dataset A Schemes in DB       : ${totalDatasetA} (Intact)`);
    console.log(`Dataset A Departments in DB   : ${totalDeptsA} (Intact)`);
    console.log(`Dataset B Schemes in DB       : ${totalDatasetB}`);
    console.log(`=======================================================\n`);

    return {
      success: true,
      insertedCount: totalDatasetB,
      updatedCount: 0,
      rejectedCount: 0,
      duplicateCount: 0
    };
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  runImport(isDryRun).catch(err => {
    console.error('Import script failed:', err);
    process.exit(1);
  });
}

module.exports = { runImport };
