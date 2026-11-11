const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'raw', 'official_scheme_information');
const PROCESSED_DIR = path.join(__dirname, '..', 'processed');
const NORMALIZED_FILE = path.join(PROCESSED_DIR, 'myscheme_normalized.json');

function getLatestRawFile() {
  if (!fs.existsSync(RAW_DIR)) return null;
  const files = fs.readdirSync(RAW_DIR)
    .filter(f => f.startsWith('myscheme_api_') && f.endsWith('.json'))
    .sort()
    .reverse();
  return files.length > 0 ? path.join(RAW_DIR, files[0]) : null;
}

function normalizeUrl(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return null;
  let trimmed = urlStr.trim();
  if (!trimmed) return null;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

function cleanText(val) {
  if (val === null || val === undefined) return null;
  if (Array.isArray(val)) {
    const cleanedArr = val.map(item => typeof item === 'string' ? item.trim() : item).filter(Boolean);
    return cleanedArr.length > 0 ? cleanedArr.join('\n') : null;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return val;
}

function runNormalization() {
  console.log(`=======================================================`);
  console.log(`  DATASET B: MYSCHEME DATA NORMALIZATION PIPELINE`);
  console.log(`=======================================================\n`);

  const rawFilePath = getLatestRawFile();

  if (!rawFilePath || !fs.existsSync(rawFilePath)) {
    console.log(`[Normalization Aborted] No raw myScheme JSON payloads found in ${RAW_DIR}`);
    console.log(`[Normalization Aborted] Safe Exit: Zero synthetic or placeholder records created.`);
    return {
      success: false,
      normalizedCount: 0,
      reason: 'No raw payload available'
    };
  }

  console.log(`[Normalization] Reading raw payload from: ${rawFilePath}`);
  const rawContent = fs.readFileSync(rawFilePath, 'utf-8');
  let rawJson;

  try {
    rawJson = JSON.parse(rawContent);
  } catch (err) {
    console.error(`[Normalization Error] Invalid JSON in ${rawFilePath}:`, err.message);
    process.exit(1);
  }

  const rawItems = Array.isArray(rawJson.schemes) ? rawJson.schemes : (Array.isArray(rawJson) ? rawJson : []);
  console.log(`[Normalization] Found ${rawItems.length} raw records to process.`);

  const normalizedRecords = rawItems.map((item, idx) => {
    const sourceId = cleanText(item.scheme_id || item.slug || item.id);
    const schemeName = cleanText(item.scheme_name || item.title);

    return {
      _raw_index: idx,
      sourceId,
      schemeName: schemeName || 'Untitled Scheme',
      schemeShortTitle: cleanText(item.scheme_short_title || item.short_name),
      ministry: cleanText(item.ministry || item.ministry_name),
      departmentName: cleanText(item.department || item.department_name),
      schemeLevel: cleanText(item.scheme_level || item.level),
      stateName: cleanText(item.state_name || item.state),
      description: cleanText(item.description || item.summary),
      eligibilityText: cleanText(item.eligibility_criteria || item.eligibility),
      benefits: cleanText(item.benefits || item.benefit_details),
      targetBeneficiaries: cleanText(item.target_beneficiaries || item.beneficiaries),
      applicationProcess: cleanText(item.application_process || item.how_to_apply),
      requiredDocuments: cleanText(item.required_documents || item.documents_required),
      officialUrl: normalizeUrl(item.official_url || item.scheme_url),
      sourceLastUpdated: cleanText(item.last_updated || item.updated_at),
      sourceName: "myScheme API Setu",
      sourceUrl: "https://apisetu.gov.in/directory/api/myscheme",
      normalizedAt: new Date().toISOString()
    };
  });

  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  fs.writeFileSync(NORMALIZED_FILE, JSON.stringify(normalizedRecords, null, 2), 'utf-8');
  console.log(`[Normalization Complete] Wrote ${normalizedRecords.length} normalized records to ${NORMALIZED_FILE}`);

  return {
    success: true,
    normalizedCount: normalizedRecords.length,
    outputFile: NORMALIZED_FILE
  };
}

if (require.main === module) {
  runNormalization();
}

module.exports = { runNormalization };
