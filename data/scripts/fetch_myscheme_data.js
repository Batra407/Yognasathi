const fs = require('fs');
const path = require('path');
const { validateApiConfig, fetchMySchemeData } = require('../../src/lib/government/myscheme-api.js');

async function runFetchPipeline() {
  console.log(`=======================================================`);
  console.log(`  DATASET B: MYSCHEME DATA FETCH PIPELINE`);
  console.log(`=======================================================\n`);

  const config = validateApiConfig();

  if (!config.isValid) {
    console.log(`API Setu credentials are not configured.`);
    console.log(`No Dataset B data was retrieved.`);
    console.log(`No database records were created.`);
    console.log(`\nRequirement: Please configure APISETU_CLIENT_ID and APISETU_API_KEY in .env when credentials become available.`);
    return {
      success: false,
      retrieved: 0,
      reason: 'API Setu credentials missing'
    };
  }

  console.log(`[Fetch Engine] Credentials verified. Initiating authenticated fetch from API Setu...`);
  
  let page = 1;
  const limit = 50;
  let hasMore = true;
  let totalFetched = 0;
  const allRecords = [];

  while (hasMore) {
    console.log(`[Fetch Engine] Requesting page ${page} (limit: ${limit})...`);
    const result = await fetchMySchemeData({ page, limit });

    if (!result.success) {
      console.error(`[Fetch Engine] API Request Failed at page ${page}:`, result.error);
      if (result.details) console.error(`  Details:`, result.details);
      break;
    }

    const items = Array.isArray(result.data?.schemes) 
      ? result.data.schemes 
      : (Array.isArray(result.data) ? result.data : []);

    totalFetched += items.length;
    allRecords.push(...items);

    console.log(`[Fetch Engine] Received ${items.length} records on page ${page}. Total so far: ${totalFetched}`);

    if (result.pagination && result.pagination.totalPages) {
      hasMore = page < result.pagination.totalPages;
    } else {
      hasMore = items.length === limit;
    }

    page++;
    if (hasMore) {
      // Respect rate limit with small pause
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n=======================================================`);
  console.log(`[Fetch Complete] Total raw records fetched: ${totalFetched}`);
  console.log(`=======================================================\n`);

  return {
    success: true,
    retrieved: totalFetched,
    pages: page - 1
  };
}

if (require.main === module) {
  runFetchPipeline().catch(err => {
    console.error('Fetch script exception:', err);
    process.exit(1);
  });
}

module.exports = { runFetchPipeline };
