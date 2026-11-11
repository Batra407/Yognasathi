const { validateApiConfig } = require('../../src/lib/government/myscheme-api.js');

function runConfigCheck() {
  console.log(`=======================================================`);
  console.log(`  API SETU CREDENTIAL CONFIGURATION DIAGNOSTIC`);
  console.log(`=======================================================\n`);

  const clientId = process.env.APISETU_CLIENT_ID;
  const apiKey = process.env.APISETU_API_KEY;

  const clientIdState = !clientId ? 'missing' : (clientId.trim() === '' ? 'placeholder' : 'configured');
  const apiKeyState = !apiKey ? 'missing' : (apiKey.trim() === '' ? 'placeholder' : 'configured');

  const config = validateApiConfig();

  console.log(`CLIENT_ID : ${clientIdState}`);
  console.log(`API_KEY   : ${apiKeyState}\n`);

  if (!config.isValid) {
    console.log(`Configuration: NOT READY`);
    console.log(`\nAPI Setu credentials are not configured.`);
    console.log(`No network request was made.`);
    console.log(`Dataset B remains unchanged.\n`);
    return {
      ready: false,
      clientIdState,
      apiKeyState
    };
  }

  console.log(`Configuration: READY`);
  console.log(`Valid API Setu credential placeholders detected in environment.\n`);
  return {
    ready: true,
    clientIdState,
    apiKeyState
  };
}

if (require.main === module) {
  runConfigCheck();
}

module.exports = { runConfigCheck };
