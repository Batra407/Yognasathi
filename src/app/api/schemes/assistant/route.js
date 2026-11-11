const { prisma } = require('../../../../lib/prisma.js');
const { detectLanguage, extractKeywordsAndNormalize } = require('../../../../lib/nlp.js');
const { extractUserProfile } = require('../../../../lib/government/profile-extractor.js');
const { extractSearchTerms, calculateRelevance } = require('../recommend/route.js');
const { evaluateEligibility } = require('../../../../lib/government/eligibility-engine.js');
const { classifyWelfareDomain } = require('../../../../lib/intentClassifier.js');
const { rateLimit, getClientIp } = require('../../../../lib/rateLimit.js');

async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limitCheck = rateLimit(ip, 60, 60 * 1000);
    if (!limitCheck.success) {
      return Response.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0'
          }
        }
      );
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: 'Invalid JSON payload in request body.' },
        { status: 400 }
      );
    }

    const text = body?.text || body?.query;

    if (text === undefined || text === null || typeof text !== 'string' || text.trim() === '') {
      return Response.json(
        { error: 'Text parameter is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();

    // Step 2: Language Detection
    const language = detectLanguage(trimmedText);

    // Step 3: User Profile Extraction
    const extractionResult = extractUserProfile(trimmedText);
    const profile = extractionResult.profile || {};

    // Step 4: User Intent & Search Terms Extraction
    const { normalizedQuery, keywords } = extractKeywordsAndNormalize(trimmedText);
    const queryForSearch = normalizedQuery && normalizedQuery.trim().length > 0 ? normalizedQuery : trimmedText;
    const searchTerms = extractSearchTerms(queryForSearch);

    if (searchTerms.length === 0) {
      return Response.json({
        language,
        profile,
        intent: { keywords: keywords || [] },
        results: [],
        meta: {
          note: 'No search terms identified. Please describe your situation in more detail.'
        }
      });
    }

    // Step 5: Candidate retrieval — ONLY CITIZEN_WELFARE_SCHEME records
    // BUDGET_ACCOUNTING_ENTRY and PENDING_CLASSIFICATION are excluded
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
        queryForSearch,
        { state: profile.state }
      );

      if (relevanceScore > 0 && matchedTerms.length > 0) {
        const verifiedRules = scheme.eligibilityRules || [];
        const hasRules = verifiedRules.length > 0;

        let eligibilityEval;
        let officialSource = null;

        if (hasRules) {
          eligibilityEval = evaluateEligibility(profile, verifiedRules, scheme.id);
          const firstRule = verifiedRules[0];
          if (firstRule.sourceName || firstRule.sourceUrl) {
            officialSource = {
              sourceName: firstRule.sourceName || 'Official Government Source',
              sourceUrl: firstRule.sourceUrl || null
            };
          }
        } else {
          eligibilityEval = {
            eligibilityStatus: 'INSUFFICIENT_INFORMATION',
            matchedCriteria: [],
            failedCriteria: [],
            missingInformation: [],
            unresolvedConditions: []
          };
          if (scheme.officialUrl) {
            officialSource = {
              sourceName: scheme.sourceTitle || 'Official Government Portal',
              sourceUrl: scheme.officialUrl
            };
          }
        }

        scoredResults.push({
          schemeId: scheme.id,
          schemeName: scheme.schemeName,
          department: scheme.department?.name || 'Unknown',
          state: scheme.state || 'National / Central',
          recordType: scheme.recordType,
          relevanceScore,
          matchedTerms,
          matchReasons,
          eligibilityStatus: eligibilityEval.eligibilityStatus,
          matchedCriteria: eligibilityEval.matchedCriteria || [],
          failedCriteria: eligibilityEval.failedCriteria || [],
          missingInformation: eligibilityEval.missingInformation || [],
          eligibilityRulesAvailable: hasRules,
          officialVerificationRequired: true,
          officialSource,
          description: scheme.description || null,
          plainLanguageSummary: scheme.plainLanguageSummary || null,
          benefits: scheme.benefits || null,
          targetBeneficiaries: scheme.targetBeneficiaries || null,
          eligibilityText: scheme.eligibilityText || null,
          applicationProcess: scheme.applicationProcess || null,
          officialUrl: scheme.officialUrl || officialSource?.sourceUrl || null,
          verificationStatus: scheme.verificationStatus || null,
          lastVerifiedAt: scheme.lastVerifiedAt ? scheme.lastVerifiedAt.toISOString() : null,
          lastUpdated: scheme.lastUpdated ? scheme.lastUpdated.toISOString() : null
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

    const mlIntent = classifyWelfareDomain(trimmedText);

    return Response.json({
      language,
      profile,
      intent: {
        keywords: keywords || [],
        primary_intent: mlIntent.primary_intent,
        secondary_intents: mlIntent.secondary_intents,
        confidence: mlIntent.confidence,
        probabilities: mlIntent.probabilities
      },
      results: scoredResults,
      meta: {
        candidatesSearched: candidateSchemes.length,
        budgetEntriesExcluded: true,
        pendingClassificationsExcluded: true
      }
    });
  } catch (error) {
    return Response.json(
      { error: 'An error occurred while processing the assistant request.' },
      { status: 500 }
    );
  }
}

module.exports = { POST };
