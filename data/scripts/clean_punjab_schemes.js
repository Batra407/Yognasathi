const fs = require('fs');
const path = require('path');

const RAW_FILE = path.join(__dirname, '..', 'state_schemes', 'punjab', 'punjab_schemes_raw.csv');
const CLEANED_FILE = path.join(__dirname, '..', 'state_schemes', 'punjab', 'punjab_schemes_cleaned.csv');

// Robust CSV parser supporting quotes, commas, and newlines
function parseCsv(content) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n of \r\n
      }
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.length > 0 && (currentRow.length > 1 || currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

// Convert rows back to CSV with appropriate quoting
function toCsv(rows) {
  return rows.map(row => {
    return row.map(val => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');
  }).join('\n');
}

function normalizeText(val) {
  if (val === null || val === undefined) return null;
  const str = String(val).normalize('NFC').trim();
  return str.length > 0 ? str : null;
}

function isValidUrl(urlString) {
  if (!urlString) return false;
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function cleanPunjabSchemes(options = {}) {
  const rawPath = options.rawPath || RAW_FILE;
  const outputPath = options.outputPath || CLEANED_FILE;

  if (!fs.existsSync(rawPath)) {
    throw new Error(`Raw dataset not found at ${rawPath}`);
  }

  const rawContent = fs.readFileSync(rawPath, 'utf-8');
  const parsedRows = parseCsv(rawContent);

  if (parsedRows.length < 2) {
    throw new Error(`Raw dataset at ${rawPath} is empty or has no header.`);
  }

  const header = parsedRows[0].map(col => col.trim().toLowerCase());
  const colIndex = {};
  header.forEach((name, idx) => {
    colIndex[name] = idx;
  });

  const getCol = (row, name) => {
    const idx = colIndex[name];
    return idx !== undefined && idx < row.length ? row[idx] : null;
  };

  const records = [];
  const seenExact = new Set();
  const seenNames = new Map();
  let exactDuplicates = 0;
  let possibleDuplicates = 0;

  for (let i = 1; i < parsedRows.length; i++) {
    const row = parsedRows[i];
    if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

    const sourceRecordId = normalizeText(getCol(row, 'source_record_id'));
    const sourceName = normalizeText(getCol(row, 'source_name'));
    const sourceUrl = normalizeText(getCol(row, 'source_url'));
    const retrievedAt = normalizeText(getCol(row, 'retrieved_at'));
    const schemeName = normalizeText(getCol(row, 'scheme_name'));
    const departmentName = normalizeText(getCol(row, 'department_name'));
    const schemeLevelRaw = normalizeText(getCol(row, 'scheme_level_raw')) || '';
    const stateApplicability = normalizeText(getCol(row, 'state_applicability')) || 'Punjab';
    const description = normalizeText(getCol(row, 'description_raw'));
    const benefits = normalizeText(getCol(row, 'benefits_raw'));
    const eligibilityCriteria = normalizeText(getCol(row, 'eligibility_criteria_raw'));
    const targetBeneficiaries = normalizeText(getCol(row, 'target_beneficiaries_raw'));
    const applicationProcess = normalizeText(getCol(row, 'application_process_raw'));
    const requiredDocuments = normalizeText(getCol(row, 'required_documents_raw'));
    const officialPortalUrl = normalizeText(getCol(row, 'official_portal_url'));

    // Check exact duplicate signature
    const exactSig = `${sourceRecordId || ''}|${schemeName || ''}|${departmentName || ''}`;
    let isExactDuplicate = false;
    if (seenExact.has(exactSig)) {
      exactDuplicates++;
      isExactDuplicate = true;
    } else {
      seenExact.add(exactSig);
    }

    // Classify scheme
    let schemeClassification = 'OTHER/UNCONFIRMED';
    const lvlLower = schemeLevelRaw.toLowerCase();
    if (lvlLower.includes('centrally sponsored') || lvlLower.includes('central sector')) {
      schemeClassification = 'STATE_IMPLEMENTED_CENTRAL';
    } else if (lvlLower === 'state' || lvlLower.includes('state funded')) {
      schemeClassification = 'STATE_FUNDED';
    }

    // Flag potential duplicates with different spellings or overlapping names
    const simplifiedName = (schemeName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    let possibleDuplicateFlag = 'NONE';
    if (seenNames.has(simplifiedName)) {
      possibleDuplicates++;
      possibleDuplicateFlag = `POTENTIAL_MATCH_WITH:${seenNames.get(simplifiedName)}`;
    } else if (simplifiedName) {
      seenNames.set(simplifiedName, sourceRecordId || schemeName);
    }

    // Validate URL syntax
    const isSourceUrlValid = isValidUrl(sourceUrl);
    const isOfficialUrlValid = isValidUrl(officialPortalUrl);

    records.push({
      source_record_id: sourceRecordId,
      source_name: sourceName,
      source_url: sourceUrl,
      is_source_url_valid: isSourceUrlValid ? 'VALID' : 'INVALID',
      retrieved_at: retrievedAt,
      scheme_name: schemeName,
      department_name: departmentName,
      scheme_classification: schemeClassification,
      scheme_level_raw: schemeLevelRaw,
      state_name: stateApplicability,
      description: description,
      benefits: benefits,
      eligibility_criteria: eligibilityCriteria,
      target_beneficiaries: targetBeneficiaries,
      application_process: applicationProcess,
      required_documents: requiredDocuments,
      official_portal_url: officialPortalUrl,
      is_official_url_valid: isOfficialUrlValid ? 'VALID' : 'INVALID',
      is_exact_duplicate: isExactDuplicate ? 'TRUE' : 'FALSE',
      possible_duplicate_flag: possibleDuplicateFlag
    });
  }

  // Build cleaned CSV rows
  const cleanedHeaders = [
    'source_record_id',
    'source_name',
    'source_url',
    'is_source_url_valid',
    'retrieved_at',
    'scheme_name',
    'department_name',
    'scheme_classification',
    'scheme_level_raw',
    'state_name',
    'description',
    'benefits',
    'eligibility_criteria',
    'target_beneficiaries',
    'application_process',
    'required_documents',
    'official_portal_url',
    'is_official_url_valid',
    'is_exact_duplicate',
    'possible_duplicate_flag'
  ];

  const outputRows = [cleanedHeaders];
  for (const rec of records) {
    outputRows.push(cleanedHeaders.map(h => rec[h]));
  }

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, toCsv(outputRows), 'utf-8');

  return {
    rawRecordsCount: parsedRows.length - 1,
    cleanedRecordsCount: records.length,
    exactDuplicates,
    possibleDuplicates,
    outputPath
  };
}

if (require.main === module) {
  try {
    const res = cleanPunjabSchemes();
    console.log('[Clean Punjab Schemes] Success:');
    console.log(`  Raw records: ${res.rawRecordsCount}`);
    console.log(`  Cleaned records: ${res.cleanedRecordsCount}`);
    console.log(`  Exact duplicates: ${res.exactDuplicates}`);
    console.log(`  Possible duplicates: ${res.possibleDuplicates}`);
    console.log(`  Output: ${res.outputPath}`);
  } catch (err) {
    console.error('[Clean Punjab Schemes] Error:', err.message);
    process.exit(1);
  }
}

module.exports = { cleanPunjabSchemes, parseCsv, toCsv };
