/**
 * Unified Database Seed Script for YojanaSathi
 * Sequentially imports and verifies all 672 schemes and eligibility rules.
 */

const { execSync } = require('child_process');
const path = require('path');

const scripts = [
  'data/scripts/import_government_data.js',
  'data/scripts/import_punjab_schemes.js',
  'data/scripts/add_punjab_to_schemes.js',
  'data/scripts/add_haryana_to_schemes.js',
  'data/scripts/classify_records.js',
  'data/scripts/seed_eligibility_rules.js'
];

console.log('Starting YojanaSathi database initialization and seed sequence...');

for (const script of scripts) {
  const fullPath = path.join(process.cwd(), script);
  console.log(`\nExecuting: ${script}`);
  try {
    execSync(`node "${fullPath}"`, { stdio: 'inherit', env: process.env });
  } catch (err) {
    console.error(`Failed to execute seed step ${script}:`, err.message);
    process.exit(1);
  }
}

console.log('\n✅ Database seed sequence completed successfully.');

