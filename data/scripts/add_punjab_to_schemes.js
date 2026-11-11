const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { parseCsv } = require('./clean_punjab_schemes.js');

const VALIDATED_FILE = path.join(__dirname, '..', 'state_schemes', 'punjab', 'punjab_schemes_validated.csv');

async function addPunjabToSchemes() {
  console.log(`=======================================================`);
  console.log(`  ADDING PUNJAB STATE SCHEMES TO MAIN SCHEMES REPOSITORY`);
  console.log(`=======================================================\n`);

  if (!fs.existsSync(VALIDATED_FILE)) {
    throw new Error(`Validated file not found at: ${VALIDATED_FILE}`);
  }

  const rawCsv = fs.readFileSync(VALIDATED_FILE, 'utf-8');
  const rows = parseCsv(rawCsv);

  if (rows.length < 2) {
    throw new Error('Validated CSV has no data.');
  }

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const colIndex = {};
  headers.forEach((h, idx) => { colIndex[h] = idx; });

  const getCol = (row, name) => {
    const idx = colIndex[name];
    return idx !== undefined && idx < row.length ? row[idx].trim() : null;
  };

  const prisma = new PrismaClient();

  try {
    await prisma.$connect();

    let insertedSchemes = 0;
    let updatedSchemes = 0;
    let mappedCount = 0;
    let rulesCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

      const sourceRecordId = getCol(row, 'source_record_id');
      const sourceName = getCol(row, 'source_name');
      const sourceUrl = getCol(row, 'source_url');
      const schemeName = getCol(row, 'scheme_name');
      const departmentName = getCol(row, 'department_name') || 'Punjab State Government';
      const schemeClassification = getCol(row, 'scheme_classification');
      const stateName = getCol(row, 'state_name') || 'Punjab';
      const description = getCol(row, 'description');
      const benefits = getCol(row, 'benefits');
      const eligibilityCriteria = getCol(row, 'eligibility_criteria');
      const applicationProcess = getCol(row, 'application_process');
      const requiredDocuments = getCol(row, 'required_documents');
      const officialPortalUrl = getCol(row, 'official_portal_url');

      const schemeLevel = schemeClassification === 'STATE_IMPLEMENTED_CENTRAL'
        ? 'Centrally Sponsored'
        : 'State';

      // 1. Ensure department exists
      const dept = await prisma.department.upsert({
        where: { name: departmentName },
        update: {},
        create: { name: departmentName }
      });

      // 2. Upsert into schemes table
      const schemeNo = 1000 + i;
      const existingScheme = await prisma.scheme.findUnique({
        where: {
          departmentId_schemeName: {
            departmentId: dept.id,
            schemeName: schemeName
          }
        }
      });

      const scheme = await prisma.scheme.upsert({
        where: {
          departmentId_schemeName: {
            departmentId: dept.id,
            schemeName: schemeName
          }
        },
        update: {
          recordType: 'CITIZEN_WELFARE_SCHEME',
          state: stateName,
          schemeLevel: schemeLevel,
          description: description,
          benefits: benefits,
          eligibilityText: eligibilityCriteria,
          applicationProcess: applicationProcess,
          officialUrl: officialPortalUrl,
          sourceUrl: sourceUrl,
          lastUpdated: new Date()
        },
        create: {
          schemeNo: schemeNo,
          schemeName: schemeName,
          departmentId: dept.id,
          recordType: 'CITIZEN_WELFARE_SCHEME',
          state: stateName,
          schemeLevel: schemeLevel,
          description: description,
          benefits: benefits,
          eligibilityText: eligibilityCriteria,
          applicationProcess: applicationProcess,
          officialUrl: officialPortalUrl,
          sourceUrl: sourceUrl,
          lastUpdated: new Date()
        }
      });

      if (existingScheme) {
        updatedSchemes++;
      } else {
        insertedSchemes++;
      }

      // 3. Link with GovernmentScheme in Dataset B if available
      const govScheme = await prisma.governmentScheme.findUnique({
        where: { sourceId: sourceRecordId }
      });

      if (govScheme) {
        await prisma.schemeSourceMapping.upsert({
          where: {
            budgetSchemeId_governmentSchemeId: {
              budgetSchemeId: scheme.id,
              governmentSchemeId: govScheme.id
            }
          },
          update: {
            confidenceScore: 1.0,
            notes: 'Verified Punjab state government scheme linkage'
          },
          create: {
            budgetSchemeId: scheme.id,
            governmentSchemeId: govScheme.id,
            matchType: 'EXACT',
            confidenceScore: 1.0,
            notes: 'Verified Punjab state government scheme linkage'
          }
        });
        mappedCount++;
      }

      // 4. Create or update verified eligibility rule
      const existingRule = await prisma.governmentSchemeEligibilityRule.findFirst({
        where: { schemeId: scheme.id }
      });

      if (!existingRule) {
        await prisma.governmentSchemeEligibilityRule.create({
          data: {
            schemeId: scheme.id,
            state: 'Punjab',
            isVerified: true,
            sourceName: sourceName,
            sourceUrl: sourceUrl,
            verifiedDate: new Date(),
            requiredDocuments: requiredDocuments,
            specialConditions: eligibilityCriteria
          }
        });
        rulesCount++;
      }
    }

    const totalInSchemes = await prisma.scheme.count();
    const totalPunjabSchemes = await prisma.scheme.count({ where: { state: 'Punjab' } });
    const totalUnionSchemes = await prisma.scheme.count({ where: { state: null } });

    console.log(`[Import to Scheme Complete]`);
    console.log(`  Newly Inserted Schemes : ${insertedSchemes}`);
    console.log(`  Updated Schemes        : ${updatedSchemes}`);
    console.log(`  Linked Mappings Created: ${mappedCount}`);
    console.log(`  Eligibility Rules Added: ${rulesCount}`);
    console.log(`\n[Database Summary]`);
    console.log(`  Union Budget Schemes (state: null) : ${totalUnionSchemes}`);
    console.log(`  Punjab State Schemes (state: Punjab): ${totalPunjabSchemes}`);
    console.log(`  Total Active Schemes in Directory  : ${totalInSchemes}\n`);

    return {
      success: true,
      insertedSchemes,
      updatedSchemes,
      totalPunjabSchemes,
      totalInSchemes
    };
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addPunjabToSchemes().catch(err => {
    console.error('Failed to add Punjab schemes to schemes table:', err);
    process.exit(1);
  });
}

module.exports = { addPunjabToSchemes };
