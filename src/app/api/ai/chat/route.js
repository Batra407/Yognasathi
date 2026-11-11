/**
 * POST /api/ai/chat
 * Core AI conversational endpoint for YojanaSathi 2.0.
 *
 * Request body:
 *   { sessionId: string, message: string, language?: string }
 *
 * Response:
 *   {
 *     sessionId,
 *     reply,               — natural language reply (LLM or deterministic)
 *     replySource,         — "llm" | "deterministic"
 *     language,            — detected language
 *     intent,              — classified intent
 *     isCorrection,        — true if user corrected a previous value
 *     correctionApplied,   — { field, value } | null
 *     extractedProfile,    — fields extracted from THIS message
 *     cumulativeProfile,   — full accumulated profile for this session
 *     schemes,             — matched CITIZEN_WELFARE_SCHEME results (max 10)
 *     followUpQuestion,    — suggested next question to complete profile | null
 *     missingFields,       — profile fields still needed for full eligibility
 *     meta: { candidatesSearched, budgetEntriesExcluded, pendingClassificationsExcluded }
 *   }
 *
 * Rules enforced here:
 *   - BUDGET_ACCOUNTING_ENTRY and PENDING_CLASSIFICATION records are never returned.
 *   - Geographic filtering: Punjab-only schemes never shown to Haryana residents, etc.
 *   - Eligibility evaluated only against isVerified = true rules.
 *   - No API credentials or session data are leaked in error responses.
 */

const { prisma } = require('../../../../lib/prisma.js');
const { detectLanguage, extractKeywordsAndNormalize } = require('../../../../lib/nlp.js');
const { extractUserProfile } = require('../../../../lib/government/profile-extractor.js');
const { evaluateEligibility } = require('../../../../lib/government/eligibility-engine.js');
const { extractSearchTerms, calculateRelevance } = require('../../schemes/recommend/route.js');
const {
  getProfile,
  updateProfile,
  applyCorrection,
  addMessage,
  getMessages,
  clearSession
} = require('../../../../lib/conversationMemory.js');
const { classifyIntent } = require('../../../../lib/intentClassifier.js');
const { generateResponse } = require('../../../../lib/llmClient.js');

/** Fields checked to determine what is still missing from the profile. */
const GENERAL_PRIORITY = ['occupation', 'state', 'age', 'annualIncome', 'gender', 'category'];
const FARMER_PRIORITY  = ['state', 'landHolding', 'cropType', 'age', 'annualIncome', 'category'];

/**
 * Identifies which profile fields are still missing and important for eligibility.
 * Returns them ordered by priority.
 */
function getMissingFields(profile, verifiedRulesForMatchedSchemes = []) {
  const isFarmer = profile.occupation === 'farmer';
  const priorityList = isFarmer ? FARMER_PRIORITY : GENERAL_PRIORITY;

  const neededFields = new Set();

  for (const field of priorityList) {
    if (profile[field] === undefined || profile[field] === null || profile[field] === '') {
      neededFields.add(field);
      if (neededFields.size >= 1) break; // Focus on the single next logical question
    }
  }

  // If farmer has state, land, and crop, check if age or income needed by verified rules
  if (neededFields.size === 0) {
    for (const rule of verifiedRulesForMatchedSchemes) {
      if ((rule.ageMin !== null || rule.ageMax !== null) && profile.age === undefined) neededFields.add('age');
      if ((rule.annualIncomeMin !== null || rule.annualIncomeMax !== null) && profile.annualIncome === undefined) neededFields.add('annualIncome');
      if (rule.category && !profile.category) neededFields.add('category');
    }
  }

  return Array.from(neededFields);
}

/**
 * Builds the follow-up question for the single most important missing field.
 * @param {string[]} missingFields
 * @param {string} language
 * @returns {string|null}
 */
function buildFollowUpQuestion(missingFields, language) {
  if (!missingFields || missingFields.length === 0) return null;

  const isHindi   = language === 'hi' || language === 'mixed';
  const isPunjabi = language === 'pa';

  const FOLLOW_UP_QUESTIONS = {
    state: {
      en: 'Which state do you belong to? (e.g. Punjab or Haryana)',
      hi: 'आप किस राज्य के निवासी हैं? (जैसे पंजाब या हरियाणा)',
      pa: 'ਤੁਸੀਂ ਕਿਹੜੇ ਰਾਜ ਦੇ ਵਸਨੀਕ ਹੋ? (ਜਿਵੇਂ ਪੰਜਾਬ ਜਾਂ ਹਰਿਆਣਾ)'
    },
    landHolding: {
      en: 'Do you own agricultural land? How many acres of land do you have?',
      hi: 'क्या आपके पास कृषि भूमि है? आपके पास कितने एकड़ जमीन है?',
      pa: 'ਕੀ ਤੁਹਾਡੇ ਕੋਲ ਖੇਤੀਬਾੜੀ ਜ਼ਮੀਨ ਹੈ? ਤੁਹਾਡੇ ਕੋਲ ਕਿੰਨੀ ਏਕੜ ਜ਼ਮੀਨ ਹੈ?'
    },
    cropType: {
      en: 'Which crops do you grow? (e.g. wheat, paddy, cotton, mustard)',
      hi: 'आप अपने खेत में कौन सी फसलें उगाते हैं? (जैसे गेहूं, धान, कपास, सरसों)',
      pa: 'ਤੁਸੀਂ ਆਪਣੇ ਖੇਤ ਵਿੱਚ ਕਿਹੜੀਆਂ ਫਸਲਾਂ ਉਗਾਉਂਦੇ ਹੋ? (ਜਿਵੇਂ ਕਣਕ, ਝੋਨਾ, ਨਰਮਾ, ਸਰ੍ਹੋਂ)'
    },
    age: {
      en: 'How old are you?',
      hi: 'आपकी उम्र कितनी है?',
      pa: 'ਤੁਹਾਡੀ ਉਮਰ ਕਿੰਨੀ ਹੈ?'
    },
    occupation: {
      en: 'What is your occupation? (e.g. farmer, student, worker)',
      hi: 'आपका पेशा क्या है? (जैसे किसान, छात्र, मजदूर)',
      pa: 'ਤੁਹਾਡਾ ਕਿੱਤਾ ਕੀ ਹੈ? (ਜਿਵੇਂ ਕਿਸਾਨ, ਵਿਦਿਆਰਥੀ, ਮਜ਼ਦੂਰ)'
    },
    annualIncome: {
      en: 'What is your approximate annual household income?',
      hi: 'आपकी अनुमानित वार्षिक घरेलू आय क्या है?',
      pa: 'ਤੁਹਾਡੀ ਸਾਲਾਨਾ ਘਰੇਲੂ ਆਮਦਨ ਲਗਭਗ ਕਿੰਨੀ ਹੈ?'
    },
    gender: {
      en: 'Are you male or female?',
      hi: 'आप पुरुष हैं या महिला?',
      pa: 'ਤੁਸੀਂ ਪੁਰਸ਼ ਹੋ ਜਾਂ ਔਰਤ?'
    },
    category: {
      en: 'What is your caste category? (General / OBC / SC / ST)',
      hi: 'आपकी जाति श्रेणी क्या है? (General / OBC / SC / ST)',
      pa: 'ਤੁਹਾਡੀ ਜਾਤ ਸ਼੍ਰੇਣੀ ਕੀ ਹੈ? (General / OBC / SC / ST)'
    }
  };

  const field = missingFields[0];
  const q = FOLLOW_UP_QUESTIONS[field];
  if (!q) return null;
  return isHindi ? q.hi : isPunjabi ? q.pa : q.en;
}

async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { sessionId, message, language: hintLang } = body || {};

    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      return Response.json({ error: 'sessionId is required.' }, { status: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return Response.json({ error: 'message is required and cannot be empty.' }, { status: 400 });
    }

    const trimmedMessage = message.trim();
    const sid = sessionId.trim();

    // ── Step 1: Detect language ──────────────────────────────────────────────
    const language = detectLanguage(trimmedMessage) || hintLang || 'en';

    // ── Step 2: Extract profile entities from THIS message ───────────────────
    const extraction = extractUserProfile(trimmedMessage);
    const newProfileData = extraction.profile || {};

    // ── Step 3: Classify intent ───────────────────────────────────────────────
    const cumulativeProfile = getProfile(sid);
    const { intent, primary_intent, secondary_intents, confidence, isCorrection, correctionField, correctionValue } = classifyIntent(
      trimmedMessage, language, cumulativeProfile
    );

    // ── Step 4: Apply correction if detected ──────────────────────────────────
    let correctionApplied = null;
    if (isCorrection && correctionField && correctionValue !== null) {
      applyCorrection(sid, correctionField, correctionValue);
      correctionApplied = { field: correctionField, value: correctionValue };
    }

    // ── Step 5: Merge new profile data into session ───────────────────────────
    if (Object.keys(newProfileData).length > 0) {
      updateProfile(sid, newProfileData);
    }

    // Get the full updated cumulative profile
    const fullProfile = getProfile(sid);

    // ── Step 6: Save user message to history ─────────────────────────────────
    addMessage(sid, 'user', trimmedMessage, { language, intent });

    // ── Step 7: Determine if we should search for schemes ────────────────────
    const shouldSearch = (
      intent === 'FIND_SCHEMES' ||
      intent === 'CHECK_ELIGIBILITY' ||
      intent === 'GET_DOCUMENTS' ||
      intent === 'GET_APPLICATION_STEPS' ||
      (intent === 'PROVIDE_PROFILE' && Object.keys(fullProfile).length >= 1) ||
      (intent === 'ASK_CORRECTION') ||
      // Fallback: profile has enough data to search even if intent unclear
      Object.keys(fullProfile).length >= 2
    );

    let matchedSchemes = [];
    let allVerifiedRules = [];
    let candidatesSearched = 0;

    if (shouldSearch) {
      // ── Step 8: Build search query from combined profile + message ────────
      const { normalizedQuery, keywords } = extractKeywordsAndNormalize(trimmedMessage);
      const queryBase = normalizedQuery && normalizedQuery.trim().length > 0
        ? normalizedQuery
        : trimmedMessage;

      // Supplement with profile occupation/keywords
      const profileTerms = [
        fullProfile.occupation,
        fullProfile.state,
        fullProfile.cropType
      ].filter(Boolean).join(' ');

      const combinedQuery = [queryBase, profileTerms].filter(Boolean).join(' ');
      const searchTerms = extractSearchTerms(combinedQuery);

      // ── Step 9: Fetch only CITIZEN_WELFARE_SCHEME records ─────────────────
      const candidateSchemes = await prisma.scheme.findMany({
        where: { recordType: 'CITIZEN_WELFARE_SCHEME' },
        include: {
          department: { select: { name: true } },
          eligibilityRules: { where: { isVerified: true } }
        }
      });

      candidatesSearched = candidateSchemes.length;

      // ── Step 10: Score and geographic filter ──────────────────────────────
      const scoredResults = [];

      for (const scheme of candidateSchemes) {
        // Geographic filtering: if user specified a state and scheme has a different state,
        // skip (unless scheme is national/central i.e., state = null / "All")
        if (fullProfile.state && scheme.state) {
          const schemeStateLower = scheme.state.toLowerCase();
          const userStateLower   = fullProfile.state.toLowerCase();
          const isNational = schemeStateLower === 'all' || schemeStateLower.includes('all state');
          if (!isNational && !schemeStateLower.includes(userStateLower) && !userStateLower.includes(schemeStateLower)) {
            continue; // geographic mismatch — skip
          }
        }

        const { relevanceScore, matchedTerms, matchReasons } = calculateRelevance(
          scheme,
          searchTerms.length > 0 ? searchTerms : ['scheme'],
          combinedQuery,
          { state: fullProfile.state }
        );

        const verifiedRules = scheme.eligibilityRules || [];

        // ── Step 11: Eligibility evaluation ─────────────────────────────────
        let eligibilityEval;
        if (verifiedRules.length > 0) {
          eligibilityEval = evaluateEligibility(fullProfile, verifiedRules, scheme.id);
          allVerifiedRules.push(...verifiedRules);
        } else {
          eligibilityEval = {
            eligibilityStatus: 'INSUFFICIENT_INFORMATION',
            matchedCriteria: [],
            failedCriteria: [],
            missingInformation: [],
            unresolvedConditions: []
          };
        }

        // Include scheme if relevance > 0 OR if profile occupation/state matches scheme content
        if (relevanceScore > 0 || matchedTerms.length > 0) {
          let officialSource = null;
          if (verifiedRules.length > 0 && (verifiedRules[0].sourceName || verifiedRules[0].sourceUrl)) {
            officialSource = {
              sourceName: verifiedRules[0].sourceName || 'Official Government Source',
              sourceUrl:  verifiedRules[0].sourceUrl  || null
            };
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
            eligibilityStatus:       eligibilityEval.eligibilityStatus,
            matchedCriteria:         eligibilityEval.matchedCriteria || [],
            failedCriteria:          eligibilityEval.failedCriteria  || [],
            missingInformation:      eligibilityEval.missingInformation || [],
            eligibilityRulesAvailable: verifiedRules.length > 0,
            officialVerificationRequired: true,
            officialSource,
            description:            scheme.description || null,
            plainLanguageSummary:   scheme.plainLanguageSummary || null,
            benefits:               scheme.benefits || null,
            targetBeneficiaries:    scheme.targetBeneficiaries || null,
            eligibilityText:        scheme.eligibilityText || null,
            applicationProcess:     scheme.applicationProcess || null,
            requiredDocuments:      scheme.requiredDocuments || null,
            officialUrl:            scheme.officialUrl || officialSource?.sourceUrl || null,
            officialApplicationUrl: scheme.officialApplicationUrl || null,
            verificationStatus:     scheme.verificationStatus || null,
            lastVerifiedAt:         scheme.lastVerifiedAt ? scheme.lastVerifiedAt.toISOString() : null
          });
        }
      }

      // Sort: ELIGIBLE first, then by relevanceScore DESC, then alphabetical
      scoredResults.sort((a, b) => {
        // Eligibility priority
        const eligOrder = { ELIGIBLE: 0, INSUFFICIENT_INFORMATION: 1, NOT_ELIGIBLE: 2 };
        const eA = eligOrder[a.eligibilityStatus] ?? 1;
        const eB = eligOrder[b.eligibilityStatus] ?? 1;
        if (eA !== eB) return eA - eB;
        // Relevance
        if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
        return a.schemeName.localeCompare(b.schemeName);
      });

      matchedSchemes = scoredResults.slice(0, 10); // cap at 10
    }

    // ── Step 12: Determine missing fields ─────────────────────────────────────
    const missingFields = getMissingFields(fullProfile, allVerifiedRules);

    // ── Step 13: Build follow-up question ─────────────────────────────────────
    const followUpQuestion = buildFollowUpQuestion(missingFields, language);

    // ── Step 14: Generate natural language reply ──────────────────────────────
    const history = getMessages(sid);
    const { reply, source: replySource } = await generateResponse({
      userMessage: trimmedMessage,
      history: history.slice(-12), // last 12 messages for context
      profile: fullProfile,
      schemes: matchedSchemes,
      language,
      intent,
      missingFields
    });

    // ── Step 15: Save assistant reply to history ──────────────────────────────
    addMessage(sid, 'assistant', reply, { replySource });

    // ── Step 16: Respond ──────────────────────────────────────────────────────
    return Response.json({
      sessionId: sid,
      reply,
      replySource,
      language,
      intent,
      primary_intent:    primary_intent || intent,
      secondary_intents: secondary_intents || [],
      intent_confidence: confidence || 0.9,
      isCorrection,
      correctionApplied,
      extractedProfile:  newProfileData,
      cumulativeProfile: fullProfile,
      schemes:           matchedSchemes,
      followUpQuestion,
      missingFields,
      meta: {
        candidatesSearched,
        budgetEntriesExcluded:            true,
        pendingClassificationsExcluded:   true,
        geographicFilteringApplied:       Boolean(fullProfile.state)
      }
    });

  } catch (error) {
    console.error('[/api/ai/chat] Unhandled error:', error?.message || error);
    return Response.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

module.exports = { POST };

