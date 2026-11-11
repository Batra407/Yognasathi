const fs = require('fs');
const path = require('path');
const { parseCsv, toCsv } = require('./clean_haryana_schemes.js');

const CLEANED_FILE = path.join(__dirname, '..', 'state_schemes', 'haryana', 'haryana_schemes_cleaned.csv');
const VALIDATED_FILE = path.join(__dirname, '..', 'state_schemes', 'haryana', 'haryana_schemes_validated.csv');
const REPORT_FILE = path.join(__dirname, '..', 'state_schemes', 'haryana', 'haryana_data_quality_report.json');

// Recognized official government domains for Haryana
const OFFICIAL_DOMAINS = [
  '.gov.in',
  '.nic.in',
  '.ac.in',
  'saralharyana.gov.in',
  'fasal.haryana.gov.in',
  'chirayu.haryana.gov.in',
  'socialjusticehry.gov.in',
  'hareda.gov.in',
  'haryanasports.gov.in',
  'cm-psy.haryana.gov.in',
  'harchhatravritti.highereduhry.ac.in',
  'myscheme.gov.in'
];

function isOfficialGovUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    return OFFICIAL_DOMAINS.some(domain => {
      if (domain.startsWith('.')) {
        return hostname.endsWith(domain);
      }
      return hostname === domain || hostname.endsWith('.' + domain);
    });
  } catch (err) {
    return false;
  }
}

function validateHaryanaSchemes() {
  console.log('--- Validating Haryana Schemes Dataset ---');
  if (!fs.existsSync(CLEANED_FILE)) {
    console.error(`Error: Cleaned file not found at ${CLEANED_FILE}`);
    process.exit(1);
  }

  const content = fs.readFileSync(CLEANED_FILE, 'utf8');
  const rows = parseCsv(content);

  if (rows.length < 2) {
    console.error('Error: Insufficient data rows in cleaned file.');
    process.exit(1);
  }

  const header = rows[0];
  const requiredColumns = [
    'source_record_id',
    'source_name',
    'source_url',
    'scheme_name',
    'department_name',
    'state_applicability',
    'description_raw',
    'benefits_raw',
    'eligibility_criteria_raw',
    'official_portal_url'
  ];

  const colIndices = {};
  requiredColumns.forEach(col => {
    const idx = header.indexOf(col);
    if (idx === -1) {
      console.error(`Error: Missing required column "${col}" in header.`);
      process.exit(1);
    }
    colIndices[col] = idx;
  });

  const validatedRows = [header];
  const auditLog = [];
  let validRecordsCount = 0;
  let unverifiedUrlsCount = 0;
  let missingFieldIssues = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const schemeName = row[colIndices['scheme_name']];
    const sourceId = row[colIndices['source_record_id']];
    const officialUrl = row[colIndices['official_portal_url']];
    const description = row[colIndices['description_raw']];
    const benefits = row[colIndices['benefits_raw']];
    const criteria = row[colIndices['eligibility_criteria_raw']];

    const issues = [];

    // Verify mandatory non-empty fields
    if (!schemeName) issues.push('Missing scheme name');
    if (!description) issues.push('Missing description');
    if (!benefits) issues.push('Missing benefits');
    if (!criteria) issues.push('Missing eligibility criteria');
    if (!officialUrl) issues.push('Missing official portal URL');

    // Official domain verification
    const isUrlVerified = isOfficialGovUrl(officialUrl);
    if (!isUrlVerified) {
      issues.push(`Unverified non-official URL: ${officialUrl}`);
      unverifiedUrlsCount++;
    }

    if (issues.length > 0) {
      missingFieldIssues += issues.length;
      auditLog.push({
        sourceId,
        schemeName,
        status: 'FLAGGED',
        issues
      });
    } else {
      auditLog.push({
        sourceId,
        schemeName,
        status: 'VERIFIED',
        officialPortal: officialUrl
      });
      validRecordsCount++;
      validatedRows.push(row);
    }
  }

  // Write validated CSV
  fs.writeFileSync(VALIDATED_FILE, toCsv(validatedRows), 'utf8');

  // Generate Quality Report
  const qualityReport = {
    generatedAt: new Date().toISOString(),
    state: 'Haryana',
    totalRecordsEvaluated: rows.length - 1,
    verifiedRecords: validRecordsCount,
    rejectedOrFlaggedRecords: auditLog.filter(a => a.status === 'FLAGGED').length,
    validationRate: `${((validRecordsCount / (rows.length - 1)) * 100).toFixed(1)}%`,
    unverifiedUrls: unverifiedUrlsCount,
    missingFieldIssues,
    complianceStatus: validRecordsCount === rows.length - 1 ? 'PASSED_OFFICIAL_CRITERIA' : 'NEEDS_ATTENTION',
    auditLog
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(qualityReport, null, 2), 'utf8');

  console.log(`Validation complete!`);
  console.log(`Validated rows written to: ${VALIDATED_FILE}`);
  console.log(`Quality report saved to: ${REPORT_FILE}`);
  console.log(`Verified valid schemes: ${validRecordsCount} / ${rows.length - 1}`);
  console.log('--- Haryana Schemes Validation Complete ---');
}

if (require.main === module) {
  validateHaryanaSchemes();
}

module.exports = { validateHaryanaSchemes, isOfficialGovUrl };
