const path = require('path');
const { prisma } = require(path.join(process.cwd(), 'src', 'lib', 'prisma.js'));

async function validateEligibilityData() {
  console.log('========================================');
  console.log('DATASET C ELIGIBILITY DATA VALIDATION');
  console.log('========================================\n');

  let passAll = true;

  try {
    // -------------------------------------------------------------
    // Check 1: Dataset A Integrity Check
    // -------------------------------------------------------------
    const schemeCount = await prisma.scheme.count();
    const deptCount = await prisma.department.count();

    console.log(`Database Integrity Check:`);
    console.log(`  - Dataset A schemes : ${schemeCount} (Expected 637)`);
    console.log(`  - Departments       : ${deptCount} (Expected 71)`);

    if (schemeCount !== 637 || deptCount !== 71) {
      console.error('FAIL: Dataset A modified or corrupted!');
      passAll = false;
    } else {
      console.log('[PASS] Dataset A integrity confirmed.\n');
    }

    // -------------------------------------------------------------
    // Check 2: Dataset C Records & References Validation
    // -------------------------------------------------------------
    const allRules = await prisma.governmentSchemeEligibilityRule.findMany({
      include: { scheme: true }
    });

    console.log(`Dataset C Rules Total: ${allRules.length}`);

    let invalidReferencesCount = 0;
    let missingSourceCount = 0;
    let invalidRangeCount = 0;
    let unverifiedExposedAsVerifiedCount = 0;

    for (const rule of allRules) {
      // 1. Valid Scheme Reference
      if (!rule.scheme) {
        invalidReferencesCount++;
        console.error(`  - Invalid scheme reference: schemeId ${rule.schemeId} not in Dataset A`);
      }

      // 2. Source Validation for Verified Rules
      if (rule.isVerified) {
        if (!rule.sourceName || !rule.sourceUrl || !rule.verifiedDate) {
          missingSourceCount++;
          console.error(`  - Missing source info for verified rule ID ${rule.id}: sourceName="${rule.sourceName}", sourceUrl="${rule.sourceUrl}", verifiedDate="${rule.verifiedDate}"`);
        }
      }

      // 3. Rule Range Validation
      if (rule.ageMin !== null && rule.ageMax !== null && rule.ageMin > rule.ageMax) {
        invalidRangeCount++;
        console.error(`  - Invalid age range: ageMin (${rule.ageMin}) > ageMax (${rule.ageMax}) for rule ${rule.id}`);
      }
      if (rule.annualIncomeMin !== null && rule.annualIncomeMax !== null && rule.annualIncomeMin > rule.annualIncomeMax) {
        invalidRangeCount++;
        console.error(`  - Invalid income range: min (${rule.annualIncomeMin}) > max (${rule.annualIncomeMax}) for rule ${rule.id}`);
      }
      if (rule.landHoldingMin !== null && rule.landHoldingMax !== null && rule.landHoldingMin > rule.landHoldingMax) {
        invalidRangeCount++;
        console.error(`  - Invalid land holding range: min (${rule.landHoldingMin}) > max (${rule.landHoldingMax}) for rule ${rule.id}`);
      }

      // 4. Verification Check
      if (!rule.isVerified && (rule.sourceName || rule.sourceUrl)) {
        // If unverified, should not be treated as verified
      }
    }

    console.log(`Validation Results:`);
    console.log(`  - Valid Scheme References : ${invalidReferencesCount === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`  - Source Validation       : ${missingSourceCount === 0 ? 'PASS' : 'FAIL'}`);
    console.log(`  - Rule Range Validation   : ${invalidRangeCount === 0 ? 'PASS' : 'FAIL'}`);

    if (invalidReferencesCount > 0 || missingSourceCount > 0 || invalidRangeCount > 0) {
      passAll = false;
    }

    if (passAll) {
      console.log('\n[SUCCESS] All Dataset C eligibility validations PASSED cleanly.');
    } else {
      console.error('\n[FAILED] Dataset C validation encountered errors.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Validation error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

validateEligibilityData();
