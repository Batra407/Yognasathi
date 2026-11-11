const { prisma } = require('../../../../lib/prisma.js');
const { detectLanguage, extractKeywordsAndNormalize } = require('../../../../lib/nlp.js');
const { extractSearchTerms, calculateRelevance } = require('../recommend/route.js');

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

    const text = body?.text;

    if (text === undefined || text === null || typeof text !== 'string' || text.trim() === '') {
      return Response.json(
        { error: 'Text parameter is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const language = detectLanguage(trimmedText);
    const { normalizedQuery, keywords } = extractKeywordsAndNormalize(trimmedText);

    // Derive search terms using extractSearchTerms
    const queryForSearch = normalizedQuery && normalizedQuery.trim().length > 0 ? normalizedQuery : trimmedText;
    const searchTerms = extractSearchTerms(queryForSearch);

    if (searchTerms.length === 0) {
      return Response.json({
        originalText: trimmedText,
        language,
        normalizedQuery,
        keywords,
        results: []
      });
    }

    // Public recommendation: only verified CITIZEN_WELFARE_SCHEME records
    // BUDGET_ACCOUNTING_ENTRY and PENDING_CLASSIFICATION are excluded
    const candidateSchemes = await prisma.scheme.findMany({
      where: {
        recordType: 'CITIZEN_WELFARE_SCHEME'
      },
      include: {
        department: {
          select: {
            name: true
          }
        },
        eligibilityRules: {
          where: { isVerified: true }
        }
      }
    });

    const scoredResults = [];

    for (const scheme of candidateSchemes) {
      const { relevanceScore, matchedTerms, matchReasons } = calculateRelevance(
        scheme,
        searchTerms,
        queryForSearch
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

    // Sort by relevance score descending, then scheme name ascending
    scoredResults.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return a.schemeName.localeCompare(b.schemeName);
    });

    return Response.json({
      originalText: trimmedText,
      language,
      normalizedQuery,
      keywords,
      results: scoredResults,
      meta: {
        budgetEntriesExcluded: true,
        pendingClassificationsExcluded: true
      }
    });
  } catch (error) {
    return Response.json(
      { error: 'An error occurred while calculating multilingual scheme relevance.' },
      { status: 500 }
    );
  }
}

module.exports = { POST };
