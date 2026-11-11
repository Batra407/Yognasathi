const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { parseCsv } = require('./clean_punjab_schemes.js');

const VALIDATED_FILE = path.join(__dirname, '..', 'state_schemes', 'punjab', 'punjab_schemes_validated.csv');
const REPORT_FILE = path.join(__dirname, '..', 'state_schemes', 'punjab', 'punjab_import_report.md');

async function importPunjabSchemes(options = {}) {
  const isDryRun = options.isDryRun !== undefined ? options.isDryRun : process.argv.includes('--dry-run');
  const validatedPath = options.validatedPath || VALIDATED_FILE;
  const reportPath = options.reportPath || REPORT_FILE;

  console.log(`=======================================================`);
  console.log(`  PUNJAB STATE SCHEMES DATABASE INGESTION PIPELINE`);
  console.log(`  Mode: ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE IMPORT (PostgreSQL)'}`);
  console.log(`=======================================================\n`);

  if (!fs.existsSync(validatedPath)) {
    throw new Error(`Validated dataset file not found at: ${validatedPath}`);
  }

  const rawContent = fs.readFileSync(validatedPath, 'utf-8');
  const parsedRows = parseCsv(rawContent);

  if (parsedRows.length < 2) {
    throw new Error(`Validated dataset at ${validatedPath} contains no records.`);
  }

  const headers = parsedRows[0].map(h => h.trim().toLowerCase());
  const colIndex = {};
  headers.forEach((h, idx) => { colIndex[h] = idx; });

  const getCol = (row, name) => {
    const idx = colIndex[name];
    return idx !== undefined && idx < row.length ? row[idx].trim() : null;
  };

  const candidateRecords = [];
  let skippedUnverified = 0;

  for (let i = 1; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

    const sourceRecordId = getCol(row, 'source_record_id');
    const sourceName = getCol(row, 'source_name');
    const sourceUrl = getCol(row, 'source_url');
    const schemeName = getCol(row, 'scheme_name');
    const departmentName = getCol(row, 'department_name');
    const schemeClassification = getCol(row, 'scheme_classification');
    const stateName = getCol(row, 'state_name');
    const description = getCol(row, 'description');
    const benefits = getCol(row, 'benefits');
    const eligibilityCriteria = getCol(row, 'eligibility_criteria');
    const targetBeneficiaries = getCol(row, 'target_beneficiaries');
    const applicationProcess = getCol(row, 'application_process');
    const requiredDocuments = getCol(row, 'required_documents');
    const officialPortalUrl = getCol(row, 'official_portal_url');
    const verificationStatus = getCol(row, 'verification_status');
    const lastVerifiedDate = getCol(row, 'last_verified_date');

    if (verificationStatus !== 'VERIFIED') {
      skippedUnverified++;
      continue;
    }

    // Determine normalized scheme level for GovernmentScheme model
    let schemeLevel = 'State';
    if (schemeClassification === 'STATE_IMPLEMENTED_CENTRAL') {
      schemeLevel = 'Centrally Sponsored';
    }

    candidateRecords.push({
      sourceId: sourceRecordId,
      schemeName,
      departmentName,
      schemeLevel,
      stateName: stateName || 'Punjab',
      description,
      eligibilityText: eligibilityCriteria,
      benefits,
      targetBeneficiaries,
      applicationProcess,
      requiredDocuments,
      officialUrl: officialPortalUrl,
      sourceName: sourceName || 'Punjab Government Portal',
      sourceUrl: sourceUrl || officialPortalUrl,
      sourceLastUpdated: lastVerifiedDate ? new Date(lastVerifiedDate) : new Date()
    });
  }

  console.log(`[Validation Check] Inspected ${parsedRows.length - 1} records from CSV.`);
  console.log(`[Validation Check] Approved for import: ${candidateRecords.length} VERIFIED records.`);
  if (skippedUnverified > 0) {
    console.log(`[Validation Check] Skipped ${skippedUnverified} unverified records.`);
  }

  if (isDryRun) {
    console.log(`\n[DRY RUN] Simulation complete. No database changes were applied.`);
    return {
      success: true,
      isDryRun: true,
      readyToImportCount: candidateRecords.length,
      skippedUnverified
    };
  }

  const prisma = new PrismaClient();
  let insertedCount = 0;
  let updatedCount = 0;

  try {
    await prisma.$connect();
    console.log(`[Database Connection] Connected to PostgreSQL successfully.`);

    // Check Dataset A count before ingestion
    const datasetABefore = await prisma.scheme.count();
    console.log(`[Safety Check] Dataset A (schemes table) has ${datasetABefore} records (must remain intact).`);

    for (const rec of candidateRecords) {
      const existing = await prisma.governmentScheme.findUnique({
        where: { sourceId: rec.sourceId }
      });

      const upserted = await prisma.governmentScheme.upsert({
        where: { sourceId: rec.sourceId },
        update: {
          schemeName: rec.schemeName,
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
          sourceName: rec.sourceName,
          sourceUrl: rec.sourceUrl,
          sourceLastUpdated: rec.sourceLastUpdated
        },
        create: {
          sourceId: rec.sourceId,
          schemeName: rec.schemeName,
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
          sourceName: rec.sourceName,
          sourceUrl: rec.sourceUrl,
          sourceLastUpdated: rec.sourceLastUpdated
        }
      });

      if (existing) {
        updatedCount++;
      } else {
        insertedCount++;
      }

      // Add audit provenance link into government_scheme_sources
      await prisma.governmentSchemeSource.create({
        data: {
          governmentSchemeId: upserted.id,
          sourceName: rec.sourceName,
          sourceUrl: rec.sourceUrl,
          rawPayload: JSON.stringify({
            sourceId: rec.sourceId,
            schemeName: rec.schemeName,
            department: rec.departmentName,
            officialUrl: rec.officialUrl
          })
        }
      });
    }

    // Verify Dataset A remains intact
    const datasetAAfter = await prisma.scheme.count();
    if (datasetABefore !== datasetAAfter) {
      throw new Error(`CRITICAL INTEGRITY VIOLATION: Dataset A modified! (${datasetABefore} -> ${datasetAAfter})`);
    }

    const totalGovSchemes = await prisma.governmentScheme.count();
    const totalPunjabInDb = await prisma.governmentScheme.count({
      where: { stateName: 'Punjab' }
    });

    console.log(`\n=======================================================`);
    console.log(`[Import Complete] Inserted: ${insertedCount} | Updated: ${updatedCount}`);
    console.log(`[Integrity Check] Dataset A records: ${datasetAAfter} (Preserved 100%)`);
    console.log(`[Database State] Total Punjab government schemes in DB: ${totalPunjabInDb}`);
    console.log(`=======================================================\n`);

    // Write audit report
    const reportMd = `# Punjab Schemes Database Ingestion Report

- **Import Timestamp**: ${new Date().toISOString()}
- **Status**: **SUCCESS**
- **Mode**: LIVE POSTGRESQL IMPORT

---

## 1. Ingestion Summary

| Metric | Count |
| :--- | ---: |
| **Total Verified Records in CSV** | **${candidateRecords.length}** |
| **New Records Inserted** | **${insertedCount}** |
| **Existing Records Updated (Idempotent)** | **${updatedCount}** |
| **Skipped Unverified Records** | **${skippedUnverified}** |
| **Total Active Punjab Schemes in Database** | **${totalPunjabInDb}** |

---

## 2. Dataset Separation & Safety Verification

- **Dataset A (Union Budget Expenditure Profile)**: Exactly **${datasetAAfter}** records preserved (0 modifications).
- **Dataset B / State Schemes (\`government_schemes\`)**: Ingested with primary keys and unique \`source_id\` slugs.
- **Audit Provenance (\`government_scheme_sources\`)**: Associated source provenance entries created for each ingested scheme.

---

## 3. Ingested Schemes Roster

${candidateRecords.map((r, idx) => `${idx + 1}. **${r.schemeName}** (\`${r.sourceId}\`) — *${r.departmentName}* [${r.schemeLevel}]`).join('\n')}
`;

    fs.writeFileSync(reportPath, reportMd, 'utf-8');
    console.log(`[Audit Report Generated] Saved to ${reportPath}`);

    return {
      success: true,
      insertedCount,
      updatedCount,
      totalPunjabInDb,
      datasetAIntact: datasetAAfter === datasetABefore
    };
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  importPunjabSchemes().catch(err => {
    console.error('Import failed:', err);
    process.exit(1);
  });
}

module.exports = { importPunjabSchemes };
