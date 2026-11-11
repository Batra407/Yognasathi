const fs = require('fs');
const path = require('path');

const RAW_FILE = path.join(__dirname, '..', 'state_schemes', 'haryana', 'haryana_schemes_raw.csv');
const CLEANED_FILE = path.join(__dirname, '..', 'state_schemes', 'haryana', 'haryana_schemes_cleaned.csv');

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

// Clean and normalize single text field
function cleanField(val) {
  if (!val) return '';
  return val
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanHaryanaSchemes() {
  console.log('--- Cleaning Haryana Schemes Dataset ---');
  if (!fs.existsSync(RAW_FILE)) {
    console.error(`Error: Raw file not found at ${RAW_FILE}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(RAW_FILE, 'utf8');
  const rows = parseCsv(rawContent);

  if (rows.length === 0) {
    console.error('Error: Empty CSV file.');
    process.exit(1);
  }

  const header = rows[0].map(h => cleanField(h));
  console.log(`CSV Header (${header.length} columns):`, header.join(', '));

  const seenIds = new Set();
  const seenNames = new Set();
  const cleanedRows = [header];
  let duplicatesCount = 0;
  let totalRecords = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0 || (row.length === 1 && !row[0].trim())) continue;

    totalRecords++;
    const cleanedRow = row.map(cell => cleanField(cell));

    const sourceRecordId = cleanedRow[0];
    const schemeName = cleanedRow[4];

    // Check duplicate IDs or duplicate Scheme Names
    const normalizedName = schemeName.toLowerCase();
    if (seenIds.has(sourceRecordId) || seenNames.has(normalizedName)) {
      console.warn(`Duplicate found at row ${i}: ID=${sourceRecordId}, Name="${schemeName}". Skipping.`);
      duplicatesCount++;
      continue;
    }

    seenIds.add(sourceRecordId);
    seenNames.add(normalizedName);

    // Standardize State Applicability
    cleanedRow[7] = 'Haryana';

    // Standardize Scheme Level
    cleanedRow[6] = 'State';

    cleanedRows.push(cleanedRow);
  }

  const outputCsv = toCsv(cleanedRows);
  fs.writeFileSync(CLEANED_FILE, outputCsv, 'utf8');

  console.log(`Cleaned dataset written to: ${CLEANED_FILE}`);
  console.log(`Total raw records processed: ${totalRecords}`);
  console.log(`Cleaned valid records: ${cleanedRows.length - 1}`);
  console.log(`Duplicates excluded: ${duplicatesCount}`);
  console.log('--- Haryana Schemes Cleaning Complete ---');
}

if (require.main === module) {
  cleanHaryanaSchemes();
}

module.exports = { cleanHaryanaSchemes, parseCsv, toCsv };
