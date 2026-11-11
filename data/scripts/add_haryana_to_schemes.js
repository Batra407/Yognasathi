const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { parseCsv } = require('./clean_haryana_schemes.js');

const VALIDATED_FILE = path.join(__dirname, '..', 'state_schemes', 'haryana', 'haryana_schemes_validated.csv');

// Specific deterministic eligibility conditions mapping for verified Haryana schemes
const HARYANA_RULE_CONFIGS = {
  hry_oap: {
    ageMin: 60,
    annualIncomeMax: 300000,
    targetOccupation: null,
    specialConditions: 'Resident of Haryana; age 60+; family income <= 3,00,000/yr verified in PPP'
  },
  hry_divyang: {
    ageMin: 18,
    annualIncomeMax: 300000,
    disabilityStatus: 'Differently Abled (60%+)',
    specialConditions: 'Resident of Haryana; age 18+; certified disability >= 60%; family income <= 3,00,000/yr'
  },
  hry_widow: {
    ageMin: 18,
    annualIncomeMax: 300000,
    gender: 'Female',
    specialConditions: 'Resident woman of Haryana; age 18+; widowed, deserted, or destitute; family income <= 3,00,000/yr'
  },
  hry_bby: {
    occupation: 'farmer',
    specialConditions: 'Haryana farmer registered on Meri Fasal Mera Byora; cultivating notified vegetable/horticulture crops'
  },
  hry_mmpsy: {
    annualIncomeMax: 180000,
    specialConditions: 'Permanent resident family of Haryana with PPP; verified family annual income <= 1,80,000; landholding <= 5 acres'
  },
  hry_mpmv: {
    occupation: 'farmer',
    specialConditions: 'Haryana farmer switching from paddy to designated alternative crops (maize, pulses, cotton, fodder)'
  },
  hry_chirayu: {
    annualIncomeMax: 300000,
    specialConditions: 'Permanent resident family of Haryana with PPP; verified annual income up to 1,80,000 (free) or up to 3,00,000 (with nominal contribution)'
  },
  hry_vivah: {
    ageMin: 18,
    specialConditions: 'Resident of Haryana; bride age 18+; belongs to Scheduled Caste, BPL, or destitute family'
  },
  hry_scholarship_sc: {
    annualIncomeMax: 250000,
    occupation: 'student',
    category: 'SC',
    specialConditions: 'Haryana domicile; SC category; enrolled in recognized post-matric course; family income <= 2,50,000/yr'
  },
  hry_solar_pump: {
    occupation: 'farmer',
    specialConditions: 'Haryana farmer; agricultural land without electric tubewell; micro-irrigation system installed or committed'
  },
  hry_sports_award: {
    specialConditions: 'Haryana sportsperson representing state in recognized National, Asian, Commonwealth, or Olympic Games'
  },
  hry_antyodaya_utthan: {
    annualIncomeMax: 100000,
    specialConditions: 'Resident family of Haryana with PPP; verified family annual income below 1,00,000/yr'
  },
  hry_disabled_child: {
    ageMax: 18,
    disabilityStatus: 'Severe Disability (40%+)',
    specialConditions: 'Haryana child age 0-18 years with severe disability >= 40% unable to attend regular school'
  },
  hry_medhavi_chhatra: {
    occupation: 'student',
    specialConditions: 'Haryana school student; SC/BC/BPL category; passed 10th or 12th with benchmark merit marks'
  },
  hry_matrushakti: {
    ageMin: 18,
    ageMax: 60,
    gender: 'Female',
    annualIncomeMax: 500000,
    specialConditions: 'Resident woman of Haryana; age 18-60; family annual income <= 5,00,000 in PPP; viable enterprise proposal'
  }
};

async function addHaryanaToSchemes() {
  console.log(`=======================================================`);
  console.log(`  ADDING HARYANA STATE SCHEMES TO MAIN DATABASE REPOSITORY`);
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
    let rulesCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

      const sourceRecordId = getCol(row, 'source_record_id');
      const sourceName = getCol(row, 'source_name') || 'Saral Haryana';
      const sourceUrl = getCol(row, 'source_url') || 'https://saralharyana.gov.in/';
      const schemeName = getCol(row, 'scheme_name');
      const departmentName = getCol(row, 'department_name') || 'Haryana State Government';
      const stateName = getCol(row, 'state_applicability') || 'Haryana';
      const description = getCol(row, 'description_raw');
      const benefits = getCol(row, 'benefits_raw');
      const eligibilityCriteria = getCol(row, 'eligibility_criteria_raw');
      const applicationProcess = getCol(row, 'application_process_raw');
      const requiredDocuments = getCol(row, 'required_documents_raw');
      const officialPortalUrl = getCol(row, 'official_portal_url');

      // 1. Ensure department exists
      const dept = await prisma.department.upsert({
        where: { name: departmentName },
        update: {},
        create: { name: departmentName }
      });

      // 2. Upsert scheme record
      const schemeNo = 2000 + i;
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
          schemeLevel: 'State',
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
          schemeLevel: 'State',
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

      // 3. Create or update verified eligibility rule
      const ruleConfig = HARYANA_RULE_CONFIGS[sourceRecordId] || {};
      const existingRule = await prisma.governmentSchemeEligibilityRule.findFirst({
        where: { schemeId: scheme.id }
      });

      if (!existingRule) {
        await prisma.governmentSchemeEligibilityRule.create({
          data: {
            schemeId: scheme.id,
            state: 'Haryana',
            isVerified: true,
            sourceName: sourceName,
            sourceUrl: officialPortalUrl || sourceUrl,
            verifiedDate: new Date(),
            ageMin: ruleConfig.ageMin || null,
            ageMax: ruleConfig.ageMax || null,
            gender: ruleConfig.gender || null,
            occupation: ruleConfig.occupation || null,
            category: ruleConfig.category || null,
            disabilityStatus: ruleConfig.disabilityStatus || null,
            annualIncomeMax: ruleConfig.annualIncomeMax || null,
            requiredDocuments: requiredDocuments,
            specialConditions: ruleConfig.specialConditions || eligibilityCriteria
          }
        });
        rulesCount++;
      } else {
        await prisma.governmentSchemeEligibilityRule.update({
          where: { id: existingRule.id },
          data: {
            state: 'Haryana',
            isVerified: true,
            sourceName: sourceName,
            sourceUrl: officialPortalUrl || sourceUrl,
            verifiedDate: new Date(),
            ageMin: ruleConfig.ageMin || existingRule.ageMin,
            ageMax: ruleConfig.ageMax || existingRule.ageMax,
            gender: ruleConfig.gender || existingRule.gender,
            occupation: ruleConfig.occupation || existingRule.occupation,
            category: ruleConfig.category || existingRule.category,
            disabilityStatus: ruleConfig.disabilityStatus || existingRule.disabilityStatus,
            annualIncomeMax: ruleConfig.annualIncomeMax || existingRule.annualIncomeMax,
            requiredDocuments: requiredDocuments,
            specialConditions: ruleConfig.specialConditions || existingRule.specialConditions
          }
        });
      }
    }

    const totalInSchemes = await prisma.scheme.count();
    const totalPunjabSchemes = await prisma.scheme.count({ where: { state: 'Punjab' } });
    const totalHaryanaSchemes = await prisma.scheme.count({ where: { state: 'Haryana' } });
    const totalUnionSchemes = await prisma.scheme.count({ where: { state: null } });

    console.log(`[Import to Scheme Complete]`);
    console.log(`  Newly Inserted Schemes  : ${insertedSchemes}`);
    console.log(`  Updated Schemes         : ${updatedSchemes}`);
    console.log(`  Eligibility Rules Added : ${rulesCount}`);
    console.log(`\n[Database Summary]`);
    console.log(`  Union Budget Schemes (state: null)  : ${totalUnionSchemes}`);
    console.log(`  Punjab State Schemes (state: Punjab): ${totalPunjabSchemes}`);
    console.log(`  Haryana State Schemes (state: Haryana): ${totalHaryanaSchemes}`);
    console.log(`  Total Active Schemes in Directory   : ${totalInSchemes}\n`);

    return {
      success: true,
      insertedSchemes,
      updatedSchemes,
      totalHaryanaSchemes,
      totalPunjabSchemes,
      totalInSchemes
    };
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addHaryanaToSchemes().catch(err => {
    console.error('Failed to add Haryana schemes to database:', err);
    process.exit(1);
  });
}

module.exports = { addHaryanaToSchemes };
