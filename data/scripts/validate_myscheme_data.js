const fs = require('fs');
const path = require('path');

const NORMALIZED_FILE = path.join(__dirname, '..', 'processed', 'myscheme_normalized.json');
const VALIDATED_FILE = path.join(__dirname, '..', 'processed', 'myscheme_validated.json');
const REPORT_FILE = path.join(__dirname, '..', 'processed', 'myscheme_validation_report.md');

function runValidation() {
  console.log(`=======================================================`);
  console.log(`  DATASET B: MYSCHEME DATA VALIDATION PIPELINE`);
  console.log(`=======================================================\n`);

  if (!fs.existsSync(NORMALIZED_FILE)) {
    console.log(`[Validation Aborted] Normalized payload file not found at ${NORMALIZED_FILE}`);
    
    const reportContent = `# myScheme Dataset Validation Report

- **Validation Timestamp**: ${new Date().toISOString()}
- **Status**: **No Data Available (Awaiting API Credentials)**

---

## Validation Audit Summary

| Category | Count | Notes |
| :--- | ---: | :--- |
| **Total Records Inspected** | **0** | No normalized file present |
| **Valid Records** | **0** | Ready for live payload |
| **Rejected Records** | **0** | None |
| **Duplicate Source IDs** | **0** | None |
| **Incomplete Records** | **0** | None |

> **POLICY ENFORCED**: Zero fake, sample, or synthetic records generated.
`;
    fs.writeFileSync(REPORT_FILE, reportContent, 'utf-8');
    console.log(`[Report] Validation report generated at ${REPORT_FILE}`);

    return {
      success: false,
      validCount: 0,
      rejectedCount: 0,
      reason: 'No normalized data file'
    };
  }

  const rawContent = fs.readFileSync(NORMALIZED_FILE, 'utf-8');
  let records = [];
  try {
    records = JSON.parse(rawContent);
  } catch (err) {
    console.error(`[Validation Error] Invalid JSON in ${NORMALIZED_FILE}:`, err.message);
    process.exit(1);
  }

  console.log(`[Validation] Inspected ${records.length} normalized records.`);

  const validRecords = [];
  const rejectedRecords = [];
  const seenSourceIds = new Set();
  let duplicateCount = 0;
  let missingEligibility = 0;
  let missingDescription = 0;
  let missingBenefits = 0;
  let missingUrl = 0;

  records.forEach((rec, idx) => {
    const recordNum = idx + 1;

    if (!rec.schemeName || rec.schemeName === 'Untitled Scheme') {
      rejectedRecords.push({ recordNum, reason: 'Missing or empty scheme_name', item: rec });
      return;
    }

    if (rec.sourceId) {
      if (seenSourceIds.has(rec.sourceId)) {
        duplicateCount++;
        rejectedRecords.push({ recordNum, reason: `Duplicate source_id (${rec.sourceId})`, item: rec });
        return;
      }
      seenSourceIds.add(rec.sourceId);
    }

    if (!rec.eligibilityText) missingEligibility++;
    if (!rec.description) missingDescription++;
    if (!rec.benefits) missingBenefits++;
    if (!rec.officialUrl) missingUrl++;

    validRecords.push(rec);
  });

  fs.writeFileSync(VALIDATED_FILE, JSON.stringify(validRecords, null, 2), 'utf-8');
  console.log(`[Validation Complete] Valid Records: ${validRecords.length} | Rejected Records: ${rejectedRecords.length}`);

  const reportContent = `# myScheme Dataset Validation Report

- **Validation Timestamp**: ${new Date().toISOString()}
- **Input File**: \`data/processed/myscheme_normalized.json\`
- **Output File**: \`data/processed/myscheme_validated.json\`

---

## 1. Validation Audit Summary

| Category | Count | Percentage |
| :--- | ---: | ---: |
| **Total Records Inspected** | **${records.length}** | **100.0%** |
| **Valid Records (Ready for Import)** | **${validRecords.length}** | **${((validRecords.length / records.length) * 100).toFixed(1)}%** |
| **Rejected Records** | **${rejectedRecords.length}** | **${((rejectedRecords.length / records.length) * 100).toFixed(1)}%** |
| **Duplicate Source IDs** | **${duplicateCount}** | - |

---

## 2. Field Audit Statistics

| Field Name | Missing Count | Missing % |
| :--- | ---: | ---: |
| \`eligibility_text\` | ${missingEligibility} | ${((missingEligibility / validRecords.length) * 100 || 0).toFixed(1)}% |
| \`description\` | ${missingDescription} | ${((missingDescription / validRecords.length) * 100 || 0).toFixed(1)}% |
| \`benefits\` | ${missingBenefits} | ${((missingBenefits / validRecords.length) * 100 || 0).toFixed(1)}% |
| \`official_url\` | ${missingUrl} | ${((missingUrl / validRecords.length) * 100 || 0).toFixed(1)}% |

---

## 3. Rejections & Anomaly Log

${rejectedRecords.length === 0 ? '_No records rejected during validation._' : rejectedRecords.map(r => `- **Record #${r.recordNum}**: ${r.reason}`).join('\n')}
`;

  fs.writeFileSync(REPORT_FILE, reportContent, 'utf-8');
  console.log(`[Report] Validation report written to ${REPORT_FILE}`);

  return {
    success: true,
    validCount: validRecords.length,
    rejectedCount: rejectedRecords.length,
    reportFile: REPORT_FILE
  };
}

if (require.main === module) {
  runValidation();
}

module.exports = { runValidation };
