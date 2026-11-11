const path = require('path');
const { prisma } = require(path.join(process.cwd(), 'src', 'lib', 'prisma.js'));

async function seedEligibilityRules() {
  console.log('Starting Dataset C Verified Eligibility Rules Seeding...\n');

  const rulesData = [
    {
      schemeId: '27afc906-eca9-4b92-9c42-11662c11d83d',
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
      schemeId: '28bc123a-8d3a-4ca9-9c3c-a03fb89e586e',
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
      schemeId: 'b7c169d9-f34b-4616-8a03-975729f96201',
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
      schemeId: '4ac121d0-d8ba-47d8-9057-d4ba1193d2af',
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
      schemeId: '1a90e9d1-e608-4def-b419-9416cb542916',
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
      schemeId: 'c95663da-8b7c-4ea0-aa12-df45c323ccc2',
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
      schemeId: '4bf0a262-5187-4e84-9fb1-f1e7b1a345b8',
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
      schemeId: '709d448b-be1f-4a77-b74b-9122983d0596',
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
      schemeId: '1897bafb-b971-4741-a4be-94bf739d32a6',
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
      schemeId: '12c8a931-c984-4eeb-b6f5-51ee6eb08536',
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

  for (const rule of rulesData) {
    // Verify Dataset A scheme exists
    const scheme = await prisma.scheme.findUnique({
      where: { id: rule.schemeId }
    });

    if (!scheme) {
      console.error(`ERROR: Scheme ID ${rule.schemeId} not found in Dataset A!`);
      continue;
    }

    // Upsert rule into GovernmentSchemeEligibilityRule
    const existingRule = await prisma.governmentSchemeEligibilityRule.findFirst({
      where: { schemeId: rule.schemeId }
    });

    if (existingRule) {
      await prisma.governmentSchemeEligibilityRule.update({
        where: { id: existingRule.id },
        data: rule
      });
    } else {
      await prisma.governmentSchemeEligibilityRule.create({
        data: rule
      });
    }

    seededCount++;
    console.log(`Seeded rule for Scheme: "${scheme.schemeName}" (ID: ${scheme.id})`);
  }

  console.log(`\nSuccessfully seeded ${seededCount} verified eligibility rules in Dataset C.`);
  await prisma.$disconnect();
}

seedEligibilityRules().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
