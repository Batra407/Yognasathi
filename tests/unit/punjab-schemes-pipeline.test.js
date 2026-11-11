const fs = require('fs');
const path = require('path');
const { cleanPunjabSchemes, parseCsv, toCsv } = require('../../data/scripts/clean_punjab_schemes.js');
const { validatePunjabSchemes } = require('../../data/scripts/validate_punjab_schemes.js');

describe('Punjab Schemes Data Pipeline Unit Tests', () => {
  const tempDir = path.join(__dirname, 'temp_punjab_test');
  const tempRawFile = path.join(tempDir, 'test_raw.csv');
  const tempCleanedFile = path.join(tempDir, 'test_cleaned.csv');
  const tempValidatedFile = path.join(tempDir, 'test_validated.csv');
  const tempReportFile = path.join(tempDir, 'test_report.json');

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('CSV Parsing & Serialization', () => {
    test('handles quotes, commas, and newlines accurately', () => {
      const csvContent = `col1,col2,col3\n"value, with comma","value with\nnewline","simple"`;
      const parsed = parseCsv(csvContent);
      expect(parsed.length).toBe(2);
      expect(parsed[1][0]).toBe('value, with comma');
      expect(parsed[1][1]).toBe('value with\nnewline');
      expect(parsed[1][2]).toBe('simple');

      const serialized = toCsv(parsed);
      expect(serialized).toContain('"value, with comma"');
      expect(serialized).toContain('"value with\nnewline"');
    });
  });

  describe('Cleaning & Deduplication Rules', () => {
    test('standardizes whitespace, classifies levels, and detects duplicates', () => {
      const sampleCsv = `source_record_id,source_name,source_url,retrieved_at,scheme_name,department_name,scheme_level_raw,state_applicability,description_raw,benefits_raw,eligibility_criteria_raw,target_beneficiaries_raw,application_process_raw,required_documents_raw,official_portal_url
rec1,myScheme,https://www.myscheme.gov.in/schemes/test1,2026-10-24T00:00:00Z,Test State Scheme,Department of Planning,State,Punjab,Desc 1,Benefit 1,Eligible 1,Target 1,Process 1,Docs 1,https://punjab.gov.in/
rec1,myScheme,https://www.myscheme.gov.in/schemes/test1,2026-10-24T00:00:00Z,Test State Scheme,Department of Planning,State,Punjab,Desc 1,Benefit 1,Eligible 1,Target 1,Process 1,Docs 1,https://punjab.gov.in/
rec2,myScheme,https://www.myscheme.gov.in/schemes/test2,2026-10-24T00:00:00Z,Test Central Scheme,Department of Social Security,Centrally Sponsored,Punjab,Desc 2,Benefit 2,Eligible 2,Target 2,Process 2,Docs 2,https://punjab.gov.in/`;

      fs.writeFileSync(tempRawFile, sampleCsv, 'utf-8');

      const result = cleanPunjabSchemes({
        rawPath: tempRawFile,
        outputPath: tempCleanedFile
      });

      expect(result.rawRecordsCount).toBe(3);
      expect(result.cleanedRecordsCount).toBe(3);
      expect(result.exactDuplicates).toBe(1);

      const cleanedContent = fs.readFileSync(tempCleanedFile, 'utf-8');
      const rows = parseCsv(cleanedContent);
      expect(rows[1][7]).toBe('STATE_FUNDED');
      expect(rows[2][18]).toBe('TRUE'); // is_exact_duplicate
      expect(rows[3][7]).toBe('STATE_IMPLEMENTED_CENTRAL');
    });
  });

  describe('Validation & Audit Trail', () => {
    test('excludes exact duplicates with audit entry and enforces government verification', () => {
      const validationResult = validatePunjabSchemes({
        cleanedPath: tempCleanedFile,
        validatedPath: tempValidatedFile,
        reportPath: tempReportFile
      });

      expect(validationResult.validatedCount).toBe(2); // 3 cleaned minus 1 exact duplicate
      expect(validationResult.excludedCount).toBe(1);

      const report = JSON.parse(fs.readFileSync(tempReportFile, 'utf-8'));
      expect(report.summary_counts.exact_duplicates_detected).toBe(1);
      expect(report.exclusions_audit_trail.length).toBe(1);
      expect(report.exclusions_audit_trail[0].reason).toBe('EXACT_DUPLICATE_RECORD');
      expect(report.verification_status_counts.VERIFIED).toBe(2);
    });

    test('flags non-official source domains as UNVERIFIED', () => {
      const nonOfficialCsv = `source_record_id,source_name,source_url,retrieved_at,scheme_name,department_name,scheme_level_raw,state_applicability,description_raw,benefits_raw,eligibility_criteria_raw,target_beneficiaries_raw,application_process_raw,required_documents_raw,official_portal_url
fake1,BlogSource,https://unverified-blog.com/scheme,2026-10-24T00:00:00Z,Blog Scheme,Dept,State,Punjab,Desc,Benefit,Eligibility,Target,Apply,Docs,https://unverified-blog.com/`;

      fs.writeFileSync(tempRawFile, nonOfficialCsv, 'utf-8');
      cleanPunjabSchemes({ rawPath: tempRawFile, outputPath: tempCleanedFile });
      validatePunjabSchemes({ cleanedPath: tempCleanedFile, validatedPath: tempValidatedFile, reportPath: tempReportFile });

      const report = JSON.parse(fs.readFileSync(tempReportFile, 'utf-8'));
      expect(report.verification_status_counts.UNVERIFIED).toBe(1);
      expect(report.verification_status_counts.VERIFIED).toBe(0);
    });
  });

  describe('Real Production Dataset Verification', () => {
    const prodRaw = path.join(__dirname, '..', '..', 'data', 'state_schemes', 'punjab', 'punjab_schemes_raw.csv');
    const prodCleaned = path.join(__dirname, '..', '..', 'data', 'state_schemes', 'punjab', 'punjab_schemes_cleaned.csv');
    const prodValidated = path.join(__dirname, '..', '..', 'data', 'state_schemes', 'punjab', 'punjab_schemes_validated.csv');
    const prodReport = path.join(__dirname, '..', '..', 'data', 'state_schemes', 'punjab', 'punjab_data_quality_report.json');

    test('production dataset files exist and are populated', () => {
      expect(fs.existsSync(prodRaw)).toBe(true);
      expect(fs.existsSync(prodCleaned)).toBe(true);
      expect(fs.existsSync(prodValidated)).toBe(true);
      expect(fs.existsSync(prodReport)).toBe(true);
    });

    test('production quality report confirms valid government records with zero missing fields', () => {
      const report = JSON.parse(fs.readFileSync(prodReport, 'utf-8'));
      expect(report.summary_counts.raw_records_collected).toBe(20);
      expect(report.summary_counts.validated_records_output).toBe(20);
      expect(report.verification_status_counts.VERIFIED).toBe(20);
      expect(report.scheme_classification_counts.STATE_FUNDED).toBe(17);
      expect(report.scheme_classification_counts.STATE_IMPLEMENTED_CENTRAL).toBe(3);
      expect(report.missing_value_counts.scheme_name).toBe(0);
      expect(report.missing_value_counts.department_name).toBe(0);
      expect(report.missing_value_counts.eligibility_criteria).toBe(0);
      expect(report.missing_value_counts.benefits).toBe(0);
      expect(report.url_quality.invalid_or_inaccessible_url_counts).toBe(0);
      expect(report.import_readiness_assessment.is_ready_for_database_import).toBe(true);
    });

    test('pipeline execution is idempotent', () => {
      cleanPunjabSchemes();
      validatePunjabSchemes();
      const firstRun = fs.readFileSync(prodValidated, 'utf-8');

      cleanPunjabSchemes();
      validatePunjabSchemes();
      const secondRun = fs.readFileSync(prodValidated, 'utf-8');

      expect(secondRun).toBe(firstRun);

      // Verify meaningful record identities, counts, and invariants
      const rows = parseCsv(secondRun);
      expect(rows.length - 1).toBe(20);

      const recordIds = rows.slice(1).map(r => r[0]);
      expect(recordIds).toContain('pb-free-power-300');
      expect(recordIds).toContain('dpps');
      expect(recordIds).toContain('ab-mmsby');
      expect(recordIds).toContain('as-pb');

      // Verify zero duplicate IDs exist across runs
      const uniqueIds = new Set(recordIds);
      expect(uniqueIds.size).toBe(recordIds.length);
    });
  });
});
