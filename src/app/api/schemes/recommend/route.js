const { prisma } = require('../../../../lib/prisma.js');

// Common English stop words to filter out during query processing
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', "aren't", 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do',
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'get', 'got', 'had', 'has', 'have', 'having', 'he', 'help', 'her', 'here',
  'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
  'is', 'it', 'its', 'itself', 'just', 'like', 'me', 'more', 'most', 'my',
  'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'scheme', 'schemes',
  'she', 'should', 'so', 'some', 'such', 'support', 'than', 'that', 'the',
  'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'looking', 'want', 'need', 'seeking', 'find', 'give', 'government', 'govt', 'related',
  'financial', 'assistance'
]);

// Domain variations mapping for transparent query expansion
const KEYWORD_VARIATIONS = {
  'farmer': ['farm', 'farmers', 'farming', 'agriculture', 'agricultural', 'kisan', 'krishi'],
  'farmers': ['farm', 'farmer', 'farming', 'agriculture', 'agricultural', 'kisan', 'krishi'],
  'farming': ['farm', 'farmer', 'farmers', 'agriculture', 'agricultural'],
  'agriculture': ['agri', 'agricultural', 'farmer', 'farmers', 'farming', 'krishi'],
  'agricultural': ['agri', 'agriculture', 'farmer', 'farmers', 'farming', 'krishi'],
  'education': ['educational', 'school', 'student', 'students', 'shiksha', 'university', 'college', 'scholarship'],
  'educational': ['education', 'school', 'student', 'students', 'shiksha'],
  'employment': ['employ', 'employee', 'job', 'jobs', 'work', 'labor', 'labour', 'rozgar'],
  'employ': ['employment', 'job', 'jobs', 'work', 'labor', 'labour'],
  'job': ['jobs', 'employment', 'employ', 'work'],
  'jobs': ['job', 'employment', 'employ', 'work'],
  'health': ['medical', 'healthcare', 'hospital', 'treatment', 'medicine', 'ayushman', 'swasthya', 'sehat'],
  'medical': ['health', 'healthcare', 'hospital', 'treatment', 'medicine'],
  'housing': ['house', 'home', 'awas', 'shelter', 'accommodation'],
  'house': ['housing', 'home', 'awas', 'shelter'],
  'pension': ['retirement', 'old age', 'elderly', 'senior', 'vriddha', 'pensioner'],
  'elderly': ['pension', 'old age', 'senior', 'senior citizen'],
  'disability': ['disabled', 'handicap', 'divyang', 'differently abled', 'pwd'],
  'disabled': ['disability', 'handicap', 'divyang', 'differently abled'],
  'woman': ['women', 'mahila', 'female', 'girl', 'beti', 'widow', 'shagun', 'vivah'],
  'women': ['woman', 'mahila', 'female', 'girl', 'beti', 'widow', 'shagun', 'vivah'],
  'child': ['children', 'bal', 'bachcha', 'student', 'poshan', 'dependent'],
  'children': ['child', 'bal', 'bachcha', 'student', 'dependent'],
  'scholarship': ['education', 'stipend', 'fellowship', 'student', 'school', 'college'],
  'insurance': ['bima', 'health coverage', 'life cover', 'accident cover', 'cashless'],
  'electricity': ['power', 'bill', 'domestic', 'units'],
  'power': ['electricity', 'energy', 'utility']
};

const KNOWN_STATES = ['punjab', 'haryana', 'maharashtra', 'delhi', 'rajasthan', 'uttar pradesh', 'gujarat', 'bihar'];

/**
 * Extracts search terms from a natural language query string.
 * Filters out common stop words and derives meaningful terms.
 */
function extractSearchTerms(queryText) {
  if (!queryText || typeof queryText !== 'string') return [];

  const tokens = queryText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1);

  const primaryTerms = tokens.filter(t => !STOP_WORDS.has(t));
  const baseTerms = primaryTerms.length > 0 ? primaryTerms : tokens.filter(t => t.length > 2);

  const termSet = new Set(baseTerms);

  // Include relevant variations for key domain terms
  for (const term of baseTerms) {
    if (KEYWORD_VARIATIONS[term]) {
      for (const variation of KEYWORD_VARIATIONS[term]) {
        termSet.add(variation);
      }
    }
  }

  return Array.from(termSet);
}

/**
 * Detects if a specific state is requested in the query.
 */
function extractStateFromQuery(queryText) {
  if (!queryText) return null;
  const lower = queryText.toLowerCase();
  for (const st of KNOWN_STATES) {
    if (lower.includes(st)) {
      return st;
    }
  }
  return null;
}

/**
 * Calculates a transparent, differentiated relevance score for a scheme based on query terms.
 * 
 * Rules:
 *  1. Non-citizen schemes (BUDGET_ACCOUNTING_ENTRY, PENDING_CLASSIFICATION) receive score 0.
 *  2. State mismatch: If the user explicitly asks for Punjab, a Haryana-only scheme receives score 0.
 *  3. Scheme content must match: Matching the department name alone NEVER qualifies a scheme.
 *     (Prevents accounting items or unrelated schemes from matching solely via department).
 *  4. Weighted scoring based on:
 *     - Scheme title (exact phrase +0.40, whole word +0.25, partial +0.15)
 *     - Target beneficiaries (+0.20 per match)
 *     - Benefits summary (+0.15 per match)
 *     - Scheme description (+0.12 per match)
 *     - State alignment (+0.25 bonus if state matches user's request)
 *     - Verified eligibility rules available (+0.10 bonus)
 *  5. Normalized score range: 0.10 to 0.95. Never returns hardcoded 1.00.
 */
function calculateRelevance(scheme, searchTerms, originalQuery, options = {}) {
  // 1. Exclude budget accounting entries and unverified pending lines by default
  const allowedRecordTypes = options.includePending
    ? ['CITIZEN_WELFARE_SCHEME', 'PENDING_CLASSIFICATION']
    : ['CITIZEN_WELFARE_SCHEME'];

  if (!allowedRecordTypes.includes(scheme.recordType)) {
    return { relevanceScore: 0, matchedTerms: [], matchReasons: [] };
  }

  const queryLower = (originalQuery || '').toLowerCase();
  const queryState = options.state?.toLowerCase() || extractStateFromQuery(originalQuery);

  // 2. State mismatch check: if user asked for a specific state, do not recommend other states' schemes
  if (queryState && scheme.state) {
    const schemeStateLower = scheme.state.toLowerCase();
    if (!schemeStateLower.includes(queryState) && !queryState.includes(schemeStateLower)) {
      return { relevanceScore: 0, matchedTerms: [], matchReasons: [] };
    }
  }

  const schemeNameLower = (scheme.schemeName || '').toLowerCase();
  const beneficiariesLower = (scheme.targetBeneficiaries || '').toLowerCase();
  const benefitsLower = (scheme.benefits || '').toLowerCase();
  const descLower = (scheme.description || '').toLowerCase();
  const plainSummaryLower = (scheme.plainLanguageSummary || '').toLowerCase();
  const eligibilityLower = (scheme.eligibilityText || '').toLowerCase();
  const deptNameLower = (scheme.department?.name || '').toLowerCase();

  const matchedTermsSet = new Set();
  const matchReasons = [];
  let rawScore = 0;
  let schemeContentMatched = false;

  // Exact phrase match in scheme name
  if (queryLower.length > 3 && schemeNameLower.includes(queryLower)) {
    rawScore += 0.40;
    schemeContentMatched = true;
    matchReasons.push('exact phrase match in title');
  }

  for (const term of searchTerms) {
    let termMatched = false;

    // Check scheme title
    if (schemeNameLower.includes(term)) {
      termMatched = true;
      schemeContentMatched = true;
      const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'i');
      if (wordBoundaryRegex.test(schemeNameLower)) {
        rawScore += 0.25;
        matchReasons.push(`"${term}" in title`);
      } else {
        rawScore += 0.15;
        matchReasons.push(`"${term}" in title (partial)`);
      }
    }

    // Check target beneficiaries (strong signal of citizen fit)
    if (beneficiariesLower.includes(term)) {
      termMatched = true;
      schemeContentMatched = true;
      rawScore += 0.20;
      matchReasons.push(`designed for ${term}`);
    }

    // Check benefits text
    if (benefitsLower.includes(term)) {
      termMatched = true;
      schemeContentMatched = true;
      rawScore += 0.15;
      matchReasons.push(`provides ${term} benefit`);
    }

    // Check description or plain summary
    if (descLower.includes(term) || plainSummaryLower.includes(term)) {
      termMatched = true;
      schemeContentMatched = true;
      rawScore += 0.12;
      matchReasons.push(`"${term}" in description`);
    }

    // Check eligibility criteria text
    if (eligibilityLower.includes(term)) {
      termMatched = true;
      schemeContentMatched = true;
      rawScore += 0.10;
    }

    if (termMatched) {
      matchedTermsSet.add(term);
    }
  }

  // CRITICAL RULE: Matching the department name alone NEVER qualifies a scheme.
  // If no scheme content matched, reject the scheme even if department matches.
  if (!schemeContentMatched) {
    return { relevanceScore: 0, matchedTerms: [], matchReasons: [] };
  }

  // Department match only adds a small confirmation bonus if scheme content already matched
  for (const term of searchTerms) {
    if (deptNameLower.includes(term) && !matchedTermsSet.has(term)) {
      matchedTermsSet.add(term);
      rawScore += 0.05;
    }
  }

  // State match bonus: if scheme directly covers the requested state
  if (queryState && scheme.state) {
    const schemeStateLower = scheme.state.toLowerCase();
    if (schemeStateLower.includes(queryState) || queryState.includes(schemeStateLower)) {
      rawScore += 0.25;
      matchReasons.push(`active in ${scheme.state}`);
      matchedTermsSet.add(queryState);
    }
  }

  // Verified eligibility rules bonus
  if (scheme.eligibilityRules && scheme.eligibilityRules.length > 0) {
    rawScore += 0.10;
    matchReasons.push('verified eligibility criteria');
  }

  const matchedTerms = Array.from(matchedTermsSet);
  if (matchedTerms.length === 0 || rawScore <= 0) {
    return { relevanceScore: 0, matchedTerms: [], matchReasons: [] };
  }

  // Normalized score range: 0.10 to 0.95 (reserving 1.00 for verified profile matches)
  const relevanceScore = Math.min(0.95, Math.max(0.10, parseFloat(rawScore.toFixed(2))));

  return {
    relevanceScore,
    matchedTerms,
    matchReasons: [...new Set(matchReasons)]
  };
}

async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: 'Invalid JSON payload in request body.' },
        { status: 400 }
      );
    }

    const query = body?.query;

    if (query === undefined || query === null || typeof query !== 'string' || query.trim() === '') {
      return Response.json(
        { error: 'Query parameter is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    const searchTerms = extractSearchTerms(trimmedQuery);

    if (searchTerms.length === 0) {
      return Response.json({
        query: trimmedQuery,
        results: [],
        note: 'Query did not yield usable search terms.'
      });
    }

    // Public recommendation: only CITIZEN_WELFARE_SCHEME records are eligible.
    // BUDGET_ACCOUNTING_ENTRY and PENDING_CLASSIFICATION are excluded.
    const candidateSchemes = await prisma.scheme.findMany({
      where: {
        recordType: 'CITIZEN_WELFARE_SCHEME'
      },
      include: {
        department: { select: { name: true } },
        eligibilityRules: { where: { isVerified: true } }
      }
    });

    const scoredResults = [];

    for (const scheme of candidateSchemes) {
      const { relevanceScore, matchedTerms, matchReasons } = calculateRelevance(
        scheme,
        searchTerms,
        trimmedQuery
      );

      if (relevanceScore > 0 && matchedTerms.length > 0) {
        scoredResults.push({
          schemeId: scheme.id,
          schemeName: scheme.schemeName,
          department: scheme.department?.name || 'Unknown',
          state: scheme.state || 'National / Central',
          recordType: scheme.recordType,
          relevanceScore,
          matchedTerms,
          matchReasons,
          eligibilityStatus: 'NOT_DETERMINED',
          officialVerificationRequired: true,
          officialUrl: scheme.officialUrl || null
        });
      }
    }

    // Deterministic sorting: highest score first, then alphabetical by scheme name
    scoredResults.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return a.schemeName.localeCompare(b.schemeName);
    });

    return Response.json({
      query: trimmedQuery,
      results: scoredResults,
      meta: {
        candidatesSearched: candidateSchemes.length,
        budgetEntriesExcluded: true,
        pendingClassificationsExcluded: true
      }
    });
  } catch (error) {
    return Response.json(
      { error: 'An error occurred while calculating scheme relevance.' },
      { status: 500 }
    );
  }
}

module.exports = { POST, extractSearchTerms, calculateRelevance, extractStateFromQuery };
