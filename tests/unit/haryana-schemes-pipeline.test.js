const fs = require('fs');
const path = require('path');
const { parseCsv, toCsv } = require('../../data/scripts/clean_haryana_schemes.js');
const { isOfficialGovUrl } = require('../../data/scripts/validate_haryana_schemes.js');

describe('Haryana Schemes Data Pipeline Unit Tests', () => {
  const dataDir = path.join(__dirname, '..', '..', 'data', 'state_schemes', 'haryana');
  const rawFile = path.join(dataDir, 'haryana_schemes_raw.csv');
  const cleanedFile = path.join(dataDir, 'haryana_schemes_cleaned.csv');
  const validatedFile = path.join(dataDir, 'haryana_schemes_validated.csv');
  const reportFile = path.join(dataDir, 'haryana_data_quality_report.json');

  describe('CSV Parsing & Serialization', () => {
    test('handles quotes, commas, and newlines accurately', () => {
      const csvContent = `col1,col2,col3\n"Haryana, Scheme","Line 1\nLine 2","https://saralharyana.gov.in/"`;
      const parsed = parseCsv(csvContent);
      expect(parsed.length).toBe(2);
      expect(parsed[1][0]).toBe('Haryana, Scheme');
      expect(parsed[1][1]).toBe('Line 1\nLine 2');
      expect(parsed[1][2]).toBe('https://saralharyana.gov.in/');

      const serialized = toCsv(parsed);
      expect(serialized).toContain('"Haryana, Scheme"');
      expect(serialized).toContain('"Line 1\nLine 2"');
    });
  });

  describe('Official Domain Verification', () => {
    test('accepts official Haryana government domains', () => {
      expect(isOfficialGovUrl('https://saralharyana.gov.in/')).toBe(true);
      expect(isOfficialGovUrl('https://fasal.haryana.gov.in/')).toBe(true);
      expect(isOfficialGovUrl('https://chirayu.haryana.gov.in/')).toBe(true);
      expect(isOfficialGovUrl('https://socialjusticehry.gov.in/')).toBe(true);
      expect(isOfficialGovUrl('https://hareda.gov.in/')).toBe(true);
      expect(isOfficialGovUrl('https://harchhatravritti.highereduhry.ac.in/')).toBe(true);
    });

    test('rejects unverified non-government domains', () => {
      expect(isOfficialGovUrl('https://schemes-fake-haryana.com/')).toBe(false);
      expect(isOfficialGovUrl('http://unverified-blog.in/')).toBe(false);
      expect(isOfficialGovUrl(null)).toBe(false);
      expect(isOfficialGovUrl('')).toBe(false);
    });
  });

  describe('Production Dataset Quality Verification', () => {
    test('production dataset files exist and are populated', () => {
      expect(fs.existsSync(rawFile)).toBe(true);
      expect(fs.existsSync(cleanedFile)).toBe(true);
      expect(fs.existsSync(validatedFile)).toBe(true);
      expect(fs.existsSync(reportFile)).toBe(true);

      const validatedCsv = fs.readFileSync(validatedFile, 'utf8');
      const rows = parseCsv(validatedCsv);
      // 1 header + 15 records
      expect(rows.length).toBe(16);
    });

    test('production quality report confirms 100% verified government records', () => {
      const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
      expect(report.state).toBe('Haryana');
      expect(report.totalRecordsEvaluated).toBe(15);
      expect(report.verifiedRecords).toBe(15);
      expect(report.rejectedOrFlaggedRecords).toBe(0);
      expect(report.unverifiedUrls).toBe(0);
      expect(report.missingFieldIssues).toBe(0);
      expect(report.complianceStatus).toBe('PASSED_OFFICIAL_CRITERIA');
    });
  });
});
