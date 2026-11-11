const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'raw', 'official_scheme_information');

function findLatestRawResponse() {
  if (!fs.existsSync(RAW_DIR)) return null;
  const files = fs.readdirSync(RAW_DIR)
    .filter(f => f.startsWith('myscheme_api_') && f.endsWith('.json'))
    .sort()
    .reverse();
  return files.length > 0 ? path.join(RAW_DIR, files[0]) : null;
}

function analyzePayload(filePath) {
  console.log(`=======================================================`);
  console.log(`  REAL MYSCHEME API RESPONSE SCHEMA DETECTOR`);
  console.log(`=======================================================\n`);

  if (!filePath || !fs.existsSync(filePath)) {
    console.log(`No real myScheme API response is available.`);
    console.log(`Dataset B processing cannot begin.`);
    console.log(`\nLocation checked: ${RAW_DIR}`);
    console.log(`Policy Enforced: Zero fake JSON files or sample responses created.`);
    return {
      available: false,
      reason: 'No raw payload file'
    };
  }

  console.log(`[Inspector] Inspecting raw payload file: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (err) {
    console.error(`[Inspector Error] Invalid JSON in ${filePath}:`, err.message);
    process.exit(1);
  }

  const responseType = Array.isArray(data) ? 'ARRAY' : typeof data === 'object' ? 'OBJECT' : typeof data;
  let containerPath = 'root';
  let records = [];

  if (Array.isArray(data)) {
    records = data;
  } else if (data && Array.isArray(data.schemes)) {
    containerPath = 'data.schemes';
    records = data.schemes;
  } else if (data && Array.isArray(data.data)) {
    containerPath = 'data.data';
    records = data.data;
  } else if (data && Array.isArray(data.items)) {
    containerPath = 'data.items';
    records = data.items;
  }

  console.log(`Response type     : ${responseType}`);
  console.log(`Record container  : ${containerPath}`);
  console.log(`Record count      : ${records.length}`);

  if (records.length === 0) {
    console.log(`\n[Inspector Result] Payload contains 0 records.`);
    return { available: true, recordCount: 0, containerPath, responseType };
  }

  const sample = records[0];
  const fields = Object.keys(sample);

  const primitives = [];
  const nestedObjects = [];
  const arrays = [];

  fields.forEach(f => {
    const val = sample[f];
    if (Array.isArray(val)) arrays.push(f);
    else if (val !== null && typeof val === 'object') nestedObjects.push(f);
    else primitives.push(f);
  });

  console.log(`\nFields discovered (${fields.length} total):`);
  fields.forEach(f => console.log(`  - ${f.padEnd(25, ' ')} : (${typeof sample[f]})`));

  console.log(`\nPrimitive Fields  :`, primitives.join(', ') || 'None');
  console.log(`Nested Objects    :`, nestedObjects.join(', ') || 'None');
  console.log(`Array Fields      :`, arrays.join(', ') || 'None');

  const potentialId = fields.find(f => /id|slug|code/i.test(f)) || 'None';
  const potentialName = fields.find(f => /name|title/i.test(f)) || 'None';

  console.log(`\nPotential identifier  : ${potentialId}`);
  console.log(`Potential scheme name : ${potentialName}`);

  return {
    available: true,
    responseType,
    containerPath,
    recordCount: records.length,
    fields,
    potentialId,
    potentialName
  };
}

if (require.main === module) {
  const latestFile = findLatestRawResponse();
  analyzePayload(latestFile);
}

module.exports = { analyzePayload, findLatestRawResponse };
