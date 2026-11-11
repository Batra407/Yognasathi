const { validateApiConfig, fetchMySchemeData } = require('../../src/lib/government/myscheme-api.js');

async function runConnectionTest() {
  console.log(`=======================================================`);
  console.log(`  AUTHENTICATED MYSCHEME API SETU CONNECTION TEST`);
  console.log(`=======================================================\n`);

  const config = validateApiConfig();

  if (!config.isValid) {
    console.log(`[Connection Test] Status: BLOCKED`);
    console.log(`[Connection Test] HTTP Status: 400 Bad Request (Pre-flight Configuration Error)`);
    console.log(`[Connection Test] Reason: ${config.error}`);
    console.log(`[Connection Test] Network Request Attempted: NO`);
    console.log(`[Connection Test] PostgreSQL Dataset B Impact: 0 records added (Intact).\n`);
    return {
      attempted: false,
      authenticated: false,
      authorized: false,
      status: 400,
      errorCategory: 'Configuration Error (Credentials Missing)'
    };
  }

  console.log(`[Connection Test] Network Request Attempted: YES`);
  console.log(`[Connection Test] Initiating authenticated pre-flight GET request to official myScheme API Setu endpoint...`);
  
  const startTime = Date.now();
  const result = await fetchMySchemeData({ page: 1, limit: 1 });
  const duration = Date.now() - startTime;

  console.log(`[Connection Test] Request Duration: ${duration}ms`);
  console.log(`[Connection Test] HTTP Status: ${result.status}`);

  if (result.success) {
    console.log(`[Connection Test] Authentication & Authorization: SUCCESS`);
    console.log(`[Connection Test] Records Received: ${result.recordCount}`);
    console.log(`[Connection Test] Payload Saved: YES`);
    return {
      attempted: true,
      authenticated: true,
      authorized: true,
      status: result.status,
      recordCount: result.recordCount,
      duration
    };
  } else {
    let category = 'Unknown API Error';
    if (result.status === 401) category = 'Authentication Failed (Invalid Credentials)';
    if (result.status === 403) category = 'Authorization Failed (Subscription / Access Denied)';
    if (result.status === 429) category = 'Rate Limit Exceeded';
    if (result.status >= 500) category = 'Government API Server Error';

    console.log(`[Connection Test] Authentication / Access: FAILED`);
    console.log(`[Connection Test] Safe Error Category: ${category}`);
    console.log(`[Connection Test] Details: ${result.error}`);

    return {
      attempted: true,
      authenticated: false,
      authorized: false,
      status: result.status,
      errorCategory: category,
      duration
    };
  }
}

if (require.main === module) {
  runConnectionTest().catch(err => {
    console.error('Connection test script exception:', err);
    process.exit(1);
  });
}

module.exports = { runConnectionTest };
