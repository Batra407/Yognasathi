const fs = require('fs');
const path = require('path');

const APISETU_BASE_URL = process.env.APISETU_BASE_URL || 'https://apisetu.gov.in/dic/myscheme/srv/v3/public';
const RAW_DATA_DIR = path.join(process.cwd(), 'data', 'raw', 'official_scheme_information');

/**
 * Validates whether API Setu credentials are present in environment variables.
 * Never prints or exposes the actual credentials.
 */
function validateApiConfig() {
  const clientId = process.env.APISETU_CLIENT_ID;
  const apiKey = process.env.APISETU_API_KEY;

  if (!clientId || !clientId.trim() || !apiKey || !apiKey.trim()) {
    return {
      isValid: false,
      error: 'API credentials are required before real data can be retrieved.',
      missing: {
        clientId: !clientId || !clientId.trim(),
        apiKey: !apiKey || !apiKey.trim()
      }
    };
  }

  return { isValid: true };
}

/**
 * Fetches government schemes from the official myScheme API via API Setu.
 * 
 * @param {Object} options Options for pagination and filtering
 * @param {number} [options.page] Page number (1-indexed)
 * @param {number} [options.limit] Items per page
 * @param {string} [options.slug] Scheme slug identifier (e.g. 'apy')
 * @param {string} [options.lang] Language ('en' | 'hi')
 * @returns {Promise<Object>} API response object
 */
async function fetchMySchemeData(options = {}) {
  const configCheck = validateApiConfig();
  if (!configCheck.isValid) {
    return {
      success: false,
      status: 400,
      error: configCheck.error,
      details: 'APISETU_CLIENT_ID and APISETU_API_KEY environment variables must be configured in .env'
    };
  }

  let endpoint;
  if (options.slug) {
    const lang = options.lang || 'en';
    endpoint = `${APISETU_BASE_URL}/schemes?lang=${encodeURIComponent(lang)}&slug=${encodeURIComponent(options.slug)}`;
  } else {
    const page = options.page || 1;
    const limit = options.limit || 50;
    endpoint = `${APISETU_BASE_URL}/schemes?page=${page}&limit=${limit}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-APISETU-CLIENT-ID': process.env.APISETU_CLIENT_ID.trim(),
        'X-APISETU-APIKEY': process.env.APISETU_API_KEY.trim()
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const status = response.status;

    if (status === 401 || status === 403) {
      return {
        success: false,
        status,
        error: 'API credentials or subscription are not authorized.',
        details: 'Invalid or unapproved Client ID / API Key for myScheme on API Setu.'
      };
    }

    if (status === 429) {
      return {
        success: false,
        status,
        error: 'API rate limit exceeded. Please wait before retrying.',
        details: 'Too many requests sent to API Setu.'
      };
    }

    if (status >= 500) {
      return {
        success: false,
        status,
        error: 'Government API service error.',
        details: `API Setu server returned status code ${status}`
      };
    }

    if (!response.ok) {
      return {
        success: false,
        status,
        error: `API request failed with status ${status}`,
        details: await response.text()
      };
    }

    const data = await response.json();

    // Preserve raw response payload if successful
    saveRawApiResponse(data);

    return {
      success: true,
      status,
      data,
      recordCount: Array.isArray(data.schemes) ? data.schemes.length : (Array.isArray(data) ? data.length : 0),
      pagination: data.pagination || null
    };

  } catch (err) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        status: 408,
        error: 'Network request timeout.',
        details: 'The official API Setu server did not respond within 10 seconds.'
      };
    }

    return {
      success: false,
      status: 500,
      error: 'Network/connection error occurred while reaching API Setu.',
      details: err.message
    };
  }
}

/**
 * Fetches required documents for a specific scheme from myScheme API via API Setu.
 * 
 * @param {string} schemeId Scheme ID (e.g. '646f0145240424124da45c85')
 * @param {Object} [options] Query options
 * @param {string} [options.lang] Language ('en' | 'hi')
 * @returns {Promise<Object>} API response object
 */
async function fetchSchemeDocuments(schemeId, options = {}) {
  const configCheck = validateApiConfig();
  if (!configCheck.isValid) {
    return {
      success: false,
      status: 400,
      error: configCheck.error,
      details: 'APISETU_CLIENT_ID and APISETU_API_KEY environment variables must be configured in .env'
    };
  }

  const lang = options.lang || 'en';
  const endpoint = `${APISETU_BASE_URL}/schemes/${encodeURIComponent(schemeId)}/documents?lang=${encodeURIComponent(lang)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-APISETU-CLIENT-ID': process.env.APISETU_CLIENT_ID.trim(),
        'X-APISETU-APIKEY': process.env.APISETU_API_KEY.trim()
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const status = response.status;
    if (!response.ok) {
      return {
        success: false,
        status,
        error: `API request failed with status ${status}`,
        details: await response.text()
      };
    }

    const data = await response.json();
    return { success: true, status, data };
  } catch (err) {
    return {
      success: false,
      status: 500,
      error: 'Network error occurred while fetching scheme documents.',
      details: err.message
    };
  }
}

/**
 * Saves untouched raw API response to data/raw/official_scheme_information/
 */
function saveRawApiResponse(data) {
  try {
    if (!fs.existsSync(RAW_DATA_DIR)) {
      fs.mkdirSync(RAW_DATA_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(RAW_DATA_DIR, `myscheme_api_${timestamp}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[myScheme API] Saved raw response payload to ${filePath}`);
  } catch (err) {
    console.error('[myScheme API] Failed to save raw payload:', err.message);
  }
}

module.exports = {
  validateApiConfig,
  fetchMySchemeData,
  fetchSchemeDocuments
};
