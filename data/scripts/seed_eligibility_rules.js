const path = require('path');
const { prisma } = require(path.join(process.cwd(), 'src', 'lib', 'prisma.js'));

async function seedEligibilityRules() {
  console.log('Starting Dataset C Verified Eligibility Rules Seeding...\n');

  const rulesData = [
    {
      schemeNo: 390.0,
      schemeName: 'Pradhan Mantri Shram Yogi Maandhan',
      ageMin: 18,
      ageMax: 40,
      gender: null,
      state: null,
      occupation: 'unorganized worker',
      annualIncomeMin: null,
      annualIncomeMax: 180000.0,
      category: null,
      residency: 'Indian Citizen',
      landHoldingMin: null,
      landHoldingMax: null,
      employmentStatus: 'Unorganized Sector Worker',
      disabilityStatus: null,
      specialConditions: 'Must not be covered under EPFO/ESIC/CMPFO or an income tax assessee. Must possess Aadhaar card and Savings Bank account / Jan Dhan account.',
      requiredDocuments: 'Aadhaar Card, Savings Bank Account / Jan Dhan Account Details',
      sourceName: 'Ministry of Labour and Employment Portal',
      sourceUrl: 'https://labour.gov.in/pm-sym',
      verifiedDate: new Date('2026-01-15'),
      isVerified: true
    },
    {
      schemeNo: 287.0,
      schemeName: 'Government Co-contribution to Atal Pension Yojana',
      ageMin: 18,
      ageMax: 40,
      gender: null,
      state: null,
      occupation: null,
      annualIncomeMin: null,
      annualIncomeMax: null,
      category: null,
      residency: 'Indian Citizen',
      landHoldingMin: null,
      landHoldingMax: null,
      employmentStatus: null,
      disabilityStatus: null,
      specialConditions: 'Must hold a savings bank account. Must not be a member of any statutory social security scheme and must not be an income tax payer.',
      requiredDocuments: 'Savings Bank Account, Aadhaar Card, Mobile Number',
      sourceName: 'Pension Fund Regulatory and Development Authority (PFRDA)',
      sourceUrl: 'https://www.pfrda.org.in',
      verifiedDate: new Date('2026-01-15'),
      isVerified: true
    },
    {
      schemeNo: 1.0,
      schemeName: 'Crop Insurance Scheme',
      ageMin: null,
      ageMax: null,
      gender: null,
      state: null,
      occupation: 'farmer',
      annualIncomeMin: null,
      annualIncomeMax: null,
      category: null,
      residency: 'Resident Farmer',
      landHoldingMin: null,
      landHoldingMax: null,
      employmentStatus: null,
      disabilityStatus: null,
      specialConditions: 'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers are eligible.',
      requiredDocuments: 'Land Records (Khasra/Khatauni), Bank Passbook, Aadhaar Card, Sowing Certificate',
      sourceName: 'Pradhan Mantri Fasal Bima Yojana Portal',
      sourceUrl: 'https://pmfby.gov.in',
      verifiedDate: new Date('2026-01-15'),
      isVerified: true
    },
    {
      schemeNo: 211.0,
      schemeName: 'National Means cum Merit Scholarship Scheme',
      ageMin: null,
      ageMax: null,
      gender: null,
      state: null,
      occupation: 'student',
      annualIncomeMin: null,
      annualIncomeMax: 350000.0,
      category: null,
      residency: null,
      landHoldingMin: null,
      landHoldingMax: null,
      employmentStatus: null,
      disabilityStatus: null,
      specialConditions: 'Students studying as regular students in Class VIII in Government, Local Body, and Government-aided schools with at least 55% marks (50% for SC/ST) in Class VII examination.',
      requiredDocuments: 'Class VII Marksheet, Income Certificate, Caste Certificate (if applicable), Bank Details',
      sourceName: 'Department of School Education and Literacy, Ministry of Education',
      sourceUrl: 'https://dsel.education.gov.in/nmmss',
      verifiedDate: new Date('2026-01-15'),
      isVerified: true
    },
    {
      schemeNo: 571.0,
      schemeName: 'Scholarships for Higher Education for Young Achievers Scheme (SHREYAS) for OBCs and EBCs',
      ageMin: null,
      ageMax: null,
      gender: null,
      state: null,
      occupation: 'student',
      annualIncomeMin: null,
      annualIncomeMax: 800000.0,
      category: 'OBC/EBC',
      residency: null,
      landHoldingMin: null,
      landHoldingMax: null,
      employmentStatus: null,
      disabilityStatus: null,
      specialConditions: 'For OBC and EBC students pursuing higher education courses (Master level or PhD) in eligible higher educational institutions.',
      requiredDocuments: 'OBC/EBC Caste Certificate, Family Income Certificate, Academic Transcripts, Admission Proof',
      sourceName: 'Ministry of Social Justice and Empowerment',
      sourceUrl: 'https://socialjustice.gov.in',
      verifiedDate: new Date('2026-01-15'),
      isVerified: true
    },
    {
      schemeNo: 580.0,
      schemeName: 'Scholarship for Students with Disabilities',
      ageMin: null,
      ageMax: null,
      gender: null,
      state: null,
      occupation: 'student',
      annualIncomeMin: null,
      annualIncomeMax: 250000.0,
      category: null,
      residency: null,
      landHoldingMin: null,
      landHoldingMax: null,
      employmentStatus: null,
      disabilityStatus: '40% or more disability',
      specialConditions: 'For students with benchmark disabilities (40% or more) studying in recognized secondary and post-secondary institutions.',
      requiredDocuments: 'Disability Certificate issued by competent medical authority, Income Certificate, Marksheet, Aadhaar Card',
      sourceName: 'Department of Empowerment of Persons with Disabilities',
      sourceUrl: 'https://disabilityaffairs.gov.in',
      verifiedDate: new Date('2026-01-15'),
      isVerified: true
    },
    {
      schemeNo: 410.0,
      schemeName: 'Prime Minister Employment Generation Programme (PMEGP)',
      ageMin: 18,
      ageMax: null,
      gender: null,
      state: null,
      occupation: null,
      annualIncomeMin: null,
      annualIncomeMax: null,
      category: null,
      residency: null,
      landHoldingMin: null,
      landHoldingMax: null,
      employmentStatus: 'Entrepreneur / Self-Employed',
      disabilityStatus: null,
      specialConditions: 'Any individual above 18 years of age. For setting up project costing above Rs.10 lakh in manufacturing sector and above Rs.5 lakh in business/service sector, the beneficiary should possess at least VIII standard pass educational qualification.',
      requiredDocuments: 'Aadhaar Card, VIII Class Marksheet (if project cost > 10L/5L), Detailed Project Report (DPR), Caste/Category Certificate',
      sourceName: 'Khadi and Village Industries Commission (KVIC) Portal',
      sourceUrl: 'https://www.kviconline.gov.in/pmegpeportal',
      verifiedDate: new Date('2026-01-15'),
      isVerified: true
    },
    {
      schemeNo: 10.0,
      schemeName: 'Agriculture Infrastructure Fund (AIF)',
      ageMin: null,
      ageMax: null,
      gender: null,
      state: null,
      occupation: 'farmer/agri-entrepreneur',
      annualIncomeMin: null,
      annualIncomeMax: null,
      category: null,
      residency: null,
      landHoldingMin: null,
      landHoldingMax: null,
      employmentStatus: null,
      disabilityStatus: null,
      specialConditions: 'Primary Agricultural Credit Societies (PACS), Marketing Cooperative Societies, Farmer Producer Organizations (FPOs), Self Help Groups (SHGs), Farmers, Agri-entrepreneurs creating post-harvest management infrastructure.',
      requiredDocuments: 'DPR/Project Proposal, Land Documents, Entity Registration / FPO Registration, Bank Account Details',
      sourceName: 'Department of Agriculture and Farmers Welfare, AIF Portal',
      sourceUrl: 'https://agriinfra.dac.gov.in',
      verifiedDate: new Date('2026-01-15'),
      isVerified: true
    },
    {
      schemeNo: 595.0,
      schemeName: 'National Handloom Development Programme',
      ageMin: null,
      ageMax: null,
      gender: null,
      state: null,
      occupation: 'handloom weaver',
      annualIncomeMin: null,
      annualIncomeMax: null,
      category: null,
      residency: null,
      landHoldingMin: null,
      landHoldingMax: null,
      employmentStatus: null,
      disabilityStatus: null,
      specialConditions: 'Individual handloom weavers, weaver self-help groups, handloom producer companies, and cooperative societies.',
      requiredDocuments: 'Weaver Photo ID / Pehchan Card, Bank Passbook, Aadhaar Card',
      sourceName: 'Office of the Development Commissioner for Handlooms, Ministry of Textiles',
      sourceUrl: 'https://handlooms.nic.in',
      verifiedDate: new Date('2026-01-15'),
      isVerified: true
    },
    {
      schemeNo: 325.0,
      schemeName: 'Pradhan Mantri Ayushman Bharat Health Infrastructure Mission (PMABHIM) (Health)',
      ageMin: null,
      ageMax: null,
      gender: null,
      state: null,
      occupation: null,
      annualIncomeMin: null,
      annualIncomeMax: null,
      category: null,
      residency: 'Indian Resident',
      landHoldingMin: null,
      landHoldingMax: null,
      employmentStatus: null,
      disabilityStatus: null,
      specialConditions: 'Nationwide infrastructure augmentation targeting urban health and wellness centres, block public health units, and integrated public health labs.',
      requiredDocuments: 'Official Health Facility Registration / District Health Officer Endorsement',
      sourceName: 'Ministry of Health and Family Welfare Official Release',
      sourceUrl: 'https://mohfw.gov.in',
      verifiedDate: new Date('2026-01-15'),
      isVerified: true
    }
  ];

  let seededCount = 0;

  for (const ruleItem of rulesData) {
    let scheme = null;
    
    // 1. First attempt to match by schemeNo
    if (ruleItem.schemeNo !== undefined) {
      scheme = await prisma.scheme.findFirst({
        where: { schemeNo: ruleItem.schemeNo }
      });
    }

    // 2. Second attempt: match by schemeName
    if (!scheme && ruleItem.schemeName) {
      scheme = await prisma.scheme.findFirst({
        where: { schemeName: ruleItem.schemeName }
      });
    }

    if (!scheme) {
      console.error(`ERROR: Scheme "${ruleItem.schemeName}" (No: ${ruleItem.schemeNo}) not found in Dataset A!`);
      continue;
    }

    const { schemeNo, schemeName, ...ruleFields } = ruleItem;
    const rulePayload = { ...ruleFields, schemeId: scheme.id };

    // Upsert rule into GovernmentSchemeEligibilityRule
    const existingRule = await prisma.governmentSchemeEligibilityRule.findFirst({
      where: { schemeId: scheme.id }
    });

    if (existingRule) {
      await prisma.governmentSchemeEligibilityRule.update({
        where: { id: existingRule.id },
        data: rulePayload
      });
    } else {
      await prisma.governmentSchemeEligibilityRule.create({
        data: rulePayload
      });
    }

    seededCount++;
    console.log(`Seeded rule for Scheme: "${scheme.schemeName}" (ID: ${scheme.id})`);
  }

  console.log(`\nSuccessfully seeded ${seededCount} verified eligibility rules in Dataset C.`);
  await prisma.$disconnect();
}

if (require.main === module) {
  seedEligibilityRules().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seedEligibilityRules };
