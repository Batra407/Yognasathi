/**
 * classify_records.js
 * 
 * Safe migration script: classifies all 672 existing Scheme records into:
 *   - CITIZEN_WELFARE_SCHEME  — 35 state schemes (Punjab/Haryana) with full verified citizen data
 *   - BUDGET_ACCOUNTING_ENTRY — bookkeeping/fiscal lines, recoveries, reserve fund adjustments
 *   - PENDING_CLASSIFICATION  — Union Budget expenditure lines awaiting full citizen-facing enrichment
 * 
 * Idempotent: safe to re-run.
 * Preserves all existing records and IDs.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Patterns that unambiguously identify budget accounting entries (not citizen welfare schemes)
const ACCOUNTING_PATTERNS = [
  /\bactual\s+recoveries?\b/i,
  /\breserve\s+fund\b/i,
  /\badditional\s+transfer\s+to\b/i,
  /\bamount\s+met\s+from\b/i,
  /\btransfers?\s+to\s+.*(fund|kosh|board|corporation|enterprises?)\b/i,
  /\btransferred\s+(to|from)\b/i,
  /\bdeduction\s+on\s+account\b/i,
  /\bdeduct\b/i,
  /\binterest\s+subsidy\s+to\b/i,
  /\bsubscription\s+to\b/i,
  /\bloan(s)?\s+to\b/i,
  /\binvestment\s+in\b/i,
  /\bcontribution\s+to\s+(international|corpus|trust|statutory)\b/i,
  /\bcompensation\s+to\b/i,
  /\bgrants?-in-aid\s+to\s+(national\s+co-operative|statutory)\b/i,
  /\brepayment\s+of\b/i,
  /\brefund(s)?\s+of\b/i,
  /\bfiscal\s+incentive\b/i,
  /\bextra\s+budgetary\b/i,
  /\boutstanding\s+claims\b/i,
  /\bbalance\s+from\b/i,
  /\bonetime\s+payment\s+of\s+arrears\b/i,
  /\bpayment\s+of\s+differential\s+royalty\b/i,
  /\bleased\s+assets\s*-\s*payment\b/i,
  /\bintegrated\s+building\s+for\s+institute\b/i,
  /\bcapital\s+outlay\s+on\b/i,
];

async function classifyRecords() {
  console.log('='.repeat(60));
  console.log('  SCHEME RECORD CLASSIFICATION MIGRATION');
  console.log('='.repeat(60));

  const allSchemes = await prisma.scheme.findMany({
    select: {
      id: true,
      schemeName: true,
      state: true,
      description: true,
      benefits: true,
      officialUrl: true,
      recordType: true,
      eligibilityRules: {
        select: { id: true, isVerified: true }
      }
    }
  });

  console.log(`Total records in database: ${allSchemes.length}`);

  const toSetCitizenWelfare = [];
  const toSetBudgetAccounting = [];
  const toSetPending = [];

  for (const scheme of allSchemes) {
    const hasVerifiedRules = scheme.eligibilityRules.some(r => r.isVerified);

    // 1. Confirmed state citizen schemes (Punjab & Haryana)
    if (scheme.state && scheme.description) {
      toSetCitizenWelfare.push(scheme.id);
      continue;
    }

    // 2. Budget accounting lines — fiscal/accounting lines without citizen application
    // If scheme has verified rules (e.g. Atal Pension Yojana), it's NOT an accounting line
    if (!hasVerifiedRules && ACCOUNTING_PATTERNS.some(p => p.test(scheme.schemeName))) {
      toSetBudgetAccounting.push(scheme.id);
      continue;
    }

    // 3. Central budget schemes that have verified rules
    if (hasVerifiedRules && scheme.description) {
      toSetCitizenWelfare.push(scheme.id);
      continue;
    }

    // 4. Default: PENDING_CLASSIFICATION (central budget lines awaiting official enrichment)
    toSetPending.push(scheme.id);
  }

  console.log(`→ Setting to CITIZEN_WELFARE_SCHEME: ${toSetCitizenWelfare.length}`);
  console.log(`→ Setting to BUDGET_ACCOUNTING_ENTRY: ${toSetBudgetAccounting.length}`);
  console.log(`→ Setting to PENDING_CLASSIFICATION:  ${toSetPending.length}`);

  if (toSetCitizenWelfare.length > 0) {
    await prisma.scheme.updateMany({
      where: { id: { in: toSetCitizenWelfare } },
      data: { recordType: 'CITIZEN_WELFARE_SCHEME' }
    });
  }

  if (toSetBudgetAccounting.length > 0) {
    await prisma.scheme.updateMany({
      where: { id: { in: toSetBudgetAccounting } },
      data: { recordType: 'BUDGET_ACCOUNTING_ENTRY' }
    });
  }

  if (toSetPending.length > 0) {
    await prisma.scheme.updateMany({
      where: { id: { in: toSetPending } },
      data: { recordType: 'PENDING_CLASSIFICATION' }
    });
  }

  const counts = await prisma.scheme.groupBy({
    by: ['recordType'],
    _count: { _all: true }
  });
  console.log('\n--- FINAL CLASSIFICATION SUMMARY ---');
  for (const row of counts) {
    console.log(`  ${row.recordType}: ${row._count._all}`);
  }
}

if (require.main === module) {
  classifyRecords().catch(console.error).finally(() => prisma.$disconnect());
}

module.exports = { classifyRecords };
