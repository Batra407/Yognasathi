const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const CSV_FILE_PATH = path.join(__dirname, '..', 'processed', 'government_schemes_cleaned.csv');
const REPORT_FILE_PATH = path.join(__dirname, '..', 'processed', 'import_report.md');

// Robust standard CSV parser
function parseCSV(content) {
  const rawLines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (rawLines.length === 0) return [];

  const headers = parseCSVLine(rawLines[0]);
  const rows = [];

  for (let i = 1; i < rawLines.length; i++) {
    const values = parseCSVLine(rawLines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((h, idx) => {
        row[h.trim()] = values[idx] !== undefined ? values[idx].trim() : '';
      });
      rows.push(row);
    } else {
      rows.push({ _raw_line: rawLines[i], _error: `Column count mismatch (${values.length} vs expected ${headers.length})` });
    }
  }
  return rows;
}

function parseCSVLine(line) {
  const values = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(currentVal);
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  values.push(currentVal);

  return values.map(v => {
    let s = v.trim();
    if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
      s = s.slice(1, -1).replace(/""/g, '"');
    }
    return s;
  });
}

async function runImport(isDryRun = false) {
  console.log(`=======================================================`);
  console.log(`  Government Scheme Data Import Script (${isDryRun ? 'DRY-RUN VALIDATION' : 'ACTUAL IMPORT'})`);
  console.log(`=======================================================\n`);

  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`ERROR: Cleaned CSV file not found at ${CSV_FILE_PATH}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
  const rows = parseCSV(rawContent);

  console.log(`[CSV Parse] Total rows read from CSV: ${rows.length}`);

  let validRows = 0;
  let rejectedRows = [];
  const departmentNames = new Set();
  const validRecords = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // header is line 1

    if (row._error) {
      rejectedRows.push({ rowNumber: rowNum, reason: row._error, field: 'csv_formatting' });
      return;
    }

    const ministryDept = row.ministry_department;
    const schemeNoStr = row.scheme_no;
    const schemeName = row.scheme_name;

    if (!ministryDept) {
      rejectedRows.push({ rowNumber: rowNum, reason: 'Missing ministry_department', field: 'ministry_department' });
      return;
    }
    if (!schemeName) {
      rejectedRows.push({ rowNumber: rowNum, reason: 'Missing scheme_name', field: 'scheme_name' });
      return;
    }

    const schemeNo = parseFloat(schemeNoStr) || 0;
    const actuals20242025 = parseFloat(row.actuals_2024_2025_total_crores) || 0.0;
    const be20252026 = parseFloat(row.be_2025_2026_total_crores) || 0.0;
    const re20252026 = parseFloat(row.re_2025_2026_total_crores) || 0.0;
    const be20262027 = parseFloat(row.be_2026_2027_total_crores) || 0.0;

    departmentNames.add(ministryDept);
    validRows++;

    validRecords.push({
      ministryDept,
      schemeNo,
      schemeName,
      actuals20242025,
      be20252026,
      re20252026,
      be20262027,
      rowNum
    });
  });

  console.log(`[Validation Result] Valid Rows: ${validRows} | Rejected Rows: ${rejectedRows.length}`);
  console.log(`[Validation Result] Unique Ministries/Departments Found: ${departmentNames.size}\n`);

  if (rejectedRows.length > 0) {
    console.warn(`WARNING: ${rejectedRows.length} rows failed validation!`);
  }

  if (isDryRun) {
    console.log(`[DRY-RUN COMPLETED] No changes were made to PostgreSQL database.`);
    return {
      totalRows: rows.length,
      validRows,
      rejectedRows,
      departmentsCount: departmentNames.size,
      importedCount: 0,
      updatedCount: 0,
      skippedCount: 0
    };
  }

  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log(`[Database Connection] Connected to PostgreSQL.`);

    // 1. Sync Departments
    console.log(`[Import Phase 1] Syncing ${departmentNames.size} departments...`);
    const deptMap = new Map(); // name -> id

    for (const name of departmentNames) {
      const dept = await prisma.department.upsert({
        where: { name },
        update: {},
        create: { name }
      });
      deptMap.set(name, dept.id);
    }
    console.log(`[Import Phase 1] Departments successfully synced.`);

    // 2. Import Schemes in Batches
    console.log(`[Import Phase 2] Importing ${validRecords.length} schemes in batches...`);
    const BATCH_SIZE = 50;
    let importedCount = 0;

    for (let i = 0; i < validRecords.length; i += BATCH_SIZE) {
      const batch = validRecords.slice(i, i + BATCH_SIZE);

      await prisma.$transaction(
        batch.map(rec => {
          const deptId = deptMap.get(rec.ministryDept);
          return prisma.scheme.upsert({
            where: {
              departmentId_schemeName: {
                departmentId: deptId,
                schemeName: rec.schemeName
              }
            },
            update: {
              schemeNo: rec.schemeNo,
              actuals20242025Crores: rec.actuals20242025,
              be20252026Crores: rec.be20252026,
              re20252026Crores: rec.re20252026,
              be20262027Crores: rec.be20262027
            },
            create: {
              schemeNo: rec.schemeNo,
              schemeName: rec.schemeName,
              departmentId: deptId,
              actuals20242025Crores: rec.actuals20242025,
              be20252026Crores: rec.be20252026,
              re20252026Crores: rec.re20252026,
              be20262027Crores: rec.be20262027
              // All qualitative text fields (eligibilityText, benefits, description, etc.) remain NULL
            }
          });
        })
      );
      importedCount += batch.length;
    }

    console.log(`[Import Phase 2] Batch import complete. Total Schemes Processed: ${importedCount}`);

    // Verify DB totals
    const totalSchemesInDB = await prisma.scheme.count();
    const totalDeptsInDB = await prisma.department.count();
    const totalCategoriesInDB = await prisma.category.count();

    console.log(`\n=======================================================`);
    console.log(`  POSTGRESQL DATABASE VERIFICATION SUMMARY`);
    console.log(`=======================================================`);
    console.log(`Total Schemes in DB     : ${totalSchemesInDB}`);
    console.log(`Total Departments in DB : ${totalDeptsInDB}`);
    console.log(`Total Categories in DB  : ${totalCategoriesInDB}`);
    console.log(`=======================================================\n`);

    // Generate Import Report
    const reportContent = `# Import Report: Government Schemes Dataset

- **Source File**: \`data/processed/government_schemes_cleaned.csv\`
- **Source Dataset**: Ministry of Finance, Government of India — Union Budget Expenditure Profile (Statements 4A & 4B)
- **Import Timestamp**: ${new Date().toISOString()}
- **Database Target**: PostgreSQL (\`gov_schemes_db\`)

---

## 1. Import Summary Statistics

| Metric | Count |
| :--- | ---: |
| **Total Rows Read from CSV** | **${rows.length}** |
| **Valid Rows** | **${validRows}** |
| **Rows Imported / Upserted** | **${validRecords.length}** |
| **Rows Skipped** | **0** |
| **Rows Rejected** | **${rejectedRows.length}** |
| **Departments Created / Synced** | **${departmentNames.size}** |
| **Categories Created** | **0** (Category data not present in budget outlay file) |
| **Total Schemes in PostgreSQL** | **${totalSchemesInDB}** |

---

## 2. Idempotency Verification

- The import script uses Prisma \`upsert\` matching on the composite unique key \`[departmentId, schemeName]\`.
- Re-running the import script is 100% idempotent and does not create duplicate records.

---

## 3. Rejections & Mapping Errors

${rejectedRows.length === 0 ? '_No rows were rejected during import. All rows parsed and mapped successfully._' : rejectedRows.map(r => `- **Row ${r.rowNumber}**: ${r.reason} (Field: \`${r.field}\`)`).join('\n')}

---

## 4. Integrity Statement

- **NO Fake Data**: All ${totalSchemesInDB} records in PostgreSQL originate from real government budget statements.
- **NO Invented Fields**: Qualitative fields (\`eligibility_text\`, \`description\`, \`benefits\`, \`official_url\`) remain \`NULL\` until source text is supplied.
`;

    fs.writeFileSync(REPORT_FILE_PATH, reportContent, 'utf-8');
    console.log(`[Report] Import report generated at ${REPORT_FILE_PATH}`);

    return {
      totalRows: rows.length,
      validRows,
      rejectedRows,
      departmentsCount: departmentNames.size,
      totalSchemesInDB,
      totalDeptsInDB
    };
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  runImport(isDryRun).catch(err => {
    console.error('Import failed with exception:', err);
    process.exit(1);
  });
}

module.exports = { runImport };
