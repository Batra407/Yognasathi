const fs = require('fs');
const path = require('path');
const { ALL_STATES_AND_UTS } = require('./discover_state_scheme_sources.js');

// Build canonical lookup map
const STATE_CANONICAL_MAP = {};
ALL_STATES_AND_UTS.forEach(item => {
  STATE_CANONICAL_MAP[item.name.toLowerCase()] = item;
});

function normalizeStateName(rawState) {
  if (!rawState) return null;
  const key = rawState.trim().toLowerCase();
  if (STATE_CANONICAL_MAP[key]) {
    return STATE_CANONICAL_MAP[key];
  }
  // Try partial or aliases
  if (key.includes('andaman')) return STATE_CANONICAL_MAP['andaman and nicobar islands'];
  if (key.includes('daman') || key.includes('dadra')) return STATE_CANONICAL_MAP['dadra and nagar haveli and daman and diu'];
  if (key.includes('jammu') || key.includes('kashmir')) return STATE_CANONICAL_MAP['jammu and kashmir'];
  if (key.includes('delhi')) return STATE_CANONICAL_MAP['delhi'];
  return null;
}

function cleanString(str) {
  if (!str || typeof str !== 'string') return null;
  const cleaned = str.trim().replace(/\s+/g, ' ');
  return cleaned === '' ? null : cleaned;
}

function normalizeStateSchemes() {
  const rawPath = path.join(process.cwd(), 'data', 'raw', 'state_schemes', 'all_state_schemes_raw.json');
  if (!fs.existsSync(rawPath)) {
    throw new Error(`Raw schemes file not found at: ${rawPath}. Please run fetch_state_schemes.js first.`);
  }

  const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const rawList = Array.isArray(rawData.schemes) ? rawData.schemes : [];

  console.log(`Starting Normalization on ${rawList.length} raw state scheme records...`);

  const normalizedRecords = [];
  const errors = [];

  rawList.forEach((raw, idx) => {
    const canonicalState = normalizeStateName(raw.stateOrUt);
    if (!canonicalState) {
      errors.push({ index: idx, recordId: raw.sourceRecordId, error: `Invalid State/UT: "${raw.stateOrUt}"` });
      return;
    }

    const schemeName = cleanString(raw.schemeName);
    if (!schemeName) {
      errors.push({ index: idx, recordId: raw.sourceRecordId, error: `Missing scheme name` });
      return;
    }

    const administeringDepartment = cleanString(raw.administeringDepartment);
    if (!administeringDepartment) {
      errors.push({ index: idx, recordId: raw.sourceRecordId, error: `Missing administering department` });
      return;
    }

    const normalized = {
      sourceRecordId: cleanString(raw.sourceRecordId),
      schemeName,
      jurisdictionType: canonicalState.type, // 'STATE' or 'UNION_TERRITORY'
      stateOrUt: canonicalState.name,
      administeringDepartment,
      category: cleanString(raw.category) || 'General Citizen Welfare',
      targetBeneficiaries: cleanString(raw.targetBeneficiaries),
      shortDescription: cleanString(raw.shortDescription),
      fullDescription: cleanString(raw.fullDescription) || cleanString(raw.shortDescription),
      eligibilityCriteria: cleanString(raw.eligibilityCriteria),
      benefits: cleanString(raw.benefits),
      requiredDocuments: cleanString(raw.requiredDocuments),
      applicationProcess: cleanString(raw.applicationProcess),
      officialInfoUrl: cleanString(raw.officialInfoUrl),
      officialApplicationUrl: cleanString(raw.officialApplicationUrl) || cleanString(raw.officialInfoUrl),
      sourceAgency: cleanString(raw.sourceAgency) || administeringDepartment,
      sourceUrl: cleanString(raw.sourceUrl) || cleanString(raw.officialInfoUrl),
      dateLastVerified: raw.dateLastVerified ? new Date(raw.dateLastVerified).toISOString() : new Date().toISOString(),
      verificationStatus: raw.verificationStatus || 'VERIFIED_OFFICIAL'
    };

    normalizedRecords.push(normalized);
  });

  const processedDir = path.join(process.cwd(), 'data', 'processed');
  if (!fs.existsSync(processedDir)) {
    fs.mkdirSync(processedDir, { recursive: true });
  }

  const outPath = path.join(processedDir, 'state_schemes_normalized.json');
  fs.writeFileSync(outPath, JSON.stringify({
    metadata: {
      normalizedAt: new Date().toISOString(),
      totalNormalized: normalizedRecords.length,
      errorsCount: errors.length
    },
    schemes: normalizedRecords
  }, null, 2), 'utf8');

  console.log(`[PASS] Normalized ${normalizedRecords.length} state schemes to: ${outPath}`);
  if (errors.length > 0) {
    console.warn(`[WARN] Encountered ${errors.length} normalization errors:`, errors);
  }

  return {
    totalNormalized: normalizedRecords.length,
    errors
  };
}

if (require.main === module) {
  normalizeStateSchemes();
}

module.exports = {
  normalizeStateSchemes,
  normalizeStateName
};
