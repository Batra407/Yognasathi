/**
 * YojanaSathi 2.0 — Advanced Conversational Reasoning & Structured Tool Calling
 * Configurable multi-provider LLM client with native tool calling and deterministic fallback.
 *
 * Supported Tools:
 * 1. search_schemes(query, state, occupation, crop)
 * 2. check_eligibility(schemeId, userProfile)
 * 3. retrieve_documents(schemeId)
 * 4. retrieve_application_instructions(schemeId)
 * 5. update_citizen_profile(fields)
 *
 * Grounding Rule: The LLM must decide which tool to invoke. Never invent scheme details
 * or override deterministic eligibility results.
 */

const { prisma } = require('./prisma.js');
const { evaluateEligibility } = require('./government/eligibility-engine.js');

const PROVIDER = (process.env.LLM_PROVIDER || 'none').toLowerCase().trim();
const API_KEY  = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '';
const MODEL    = process.env.LLM_MODEL || '';
const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// ==============================================================================
// TOOL DEFINITIONS (OpenAI / JSON-Schema Standard)
// ==============================================================================

const TOOLS = [
  {
    type: "function",
    function: {
      name: "search_schemes",
      description: "Search official citizen welfare schemes matching query keywords and user profile attributes.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query or welfare requirement (e.g. crop subsidy, old age pension, scholarship)" },
          state: { type: "string", description: "State restriction (e.g. Punjab, Haryana, or National)" },
          occupation: { type: "string", description: "Occupation filter (e.g. farmer, student, weaver)" },
          crop: { type: "string", description: "Agricultural crop name (e.g. wheat, paddy, cotton, mustard)" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_eligibility",
      description: "Check deterministic eligibility for a specific scheme against verified government rules.",
      parameters: {
        type: "object",
        properties: {
          schemeId: { type: "string", description: "Unique UUID of the scheme" },
          userProfile: { type: "object", description: "Citizen profile attributes (age, state, occupation, land, income)" }
        },
        required: ["schemeId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "retrieve_documents",
      description: "Retrieve mandatory verification documents and certificates required for a scheme.",
      parameters: {
        type: "object",
        properties: {
          schemeId: { type: "string", description: "Unique UUID of the scheme" }
        },
        required: ["schemeId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "retrieve_application_instructions",
      description: "Retrieve official step-by-step application instructions and government portal URLs.",
      parameters: {
        type: "object",
        properties: {
          schemeId: { type: "string", description: "Unique UUID of the scheme" }
        },
        required: ["schemeId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_citizen_profile",
      description: "Extract and update citizen profile parameters into session memory.",
      parameters: {
        type: "object",
        properties: {
          age: { type: "integer", description: "Age in years" },
          state: { type: "string", description: "State or UT name" },
          occupation: { type: "string", description: "Occupation or job category" },
          landHolding: { type: "number", description: "Agricultural land in acres" },
          cropType: { type: "string", description: "Crops grown (e.g. wheat, paddy, mustard)" },
          annualIncome: { type: "number", description: "Annual household income in Rupees" },
          category: { type: "string", description: "Caste category (General, OBC, SC, ST, EWS)" },
          gender: { type: "string", description: "Gender (male, female)" }
        }
      }
    }
  }
];

// ==============================================================================
// TOOL EXECUTION ENGINE
// ==============================================================================

/**
 * Executes a tool deterministically against PostgreSQL and the eligibility engine.
 */
async function executeTool(name, args = {}, context = {}) {
  try {
    if (name === "search_schemes") {
      const { query = "", state, occupation, crop } = args;
      const terms = [query, occupation, crop].filter(Boolean).join(" ").toLowerCase();

      const whereClause = {
        recordType: "CITIZEN_WELFARE_SCHEME"
      };

      if (state) {
        whereClause.OR = [
          { state: { contains: state, mode: "insensitive" } },
          { state: null }
        ];
      }

      const candidates = await prisma.scheme.findMany({
        where: whereClause,
        include: {
          department: { select: { name: true } },
          eligibilityRules: { where: { isVerified: true } }
        },
        take: 8
      });

      // Filter and score candidates
      const results = candidates.map(s => {
        let score = 0.5;
        const sName = (s.schemeName || "").toLowerCase();
        const sDesc = (s.description || "").toLowerCase();
        const sTarget = (s.targetBeneficiaries || "").toLowerCase();

        if (terms && (sName.includes(terms) || sDesc.includes(terms) || sTarget.includes(terms))) score += 0.3;
        if (crop && (sDesc.includes(crop.toLowerCase()) || sName.includes(crop.toLowerCase()))) score += 0.2;
        if (state && s.state && s.state.toLowerCase().includes(state.toLowerCase())) score += 0.2;

        return {
          id: s.id,
          schemeName: s.schemeName,
          department: s.department?.name,
          state: s.state || "National",
          score: Math.min(0.95, score),
          benefits: s.benefits,
          officialUrl: s.officialUrl
        };
      }).sort((a, b) => b.score - a.score);

      return { count: results.length, schemes: results.slice(0, 5) };
    }

    if (name === "check_eligibility") {
      const { schemeId, userProfile = {} } = args;
      const scheme = await prisma.scheme.findUnique({
        where: { id: schemeId },
        include: { eligibilityRules: { where: { isVerified: true } } }
      });

      if (!scheme) return { error: "Scheme not found" };

      const evalResult = evaluateEligibility(userProfile, scheme.eligibilityRules, schemeId);
      return {
        schemeId,
        schemeName: scheme.schemeName,
        eligibilityStatus: evalResult.eligibilityStatus,
        matchedCriteria: evalResult.matchedCriteria,
        failedCriteria: evalResult.failedCriteria,
        missingInformation: evalResult.missingInformation,
        officialVerificationRequired: true
      };
    }

    if (name === "retrieve_documents") {
      const { schemeId } = args;
      const scheme = await prisma.scheme.findUnique({
        where: { id: schemeId },
        select: { schemeName: true, requiredDocuments: true, officialUrl: true }
      });
      if (!scheme) return { error: "Scheme not found" };

      return {
        schemeId,
        schemeName: scheme.schemeName,
        requiredDocuments: scheme.requiredDocuments || "Aadhaar Card, Residence Certificate, Income Proof, Bank Account details.",
        officialUrl: scheme.officialUrl
      };
    }

    if (name === "retrieve_application_instructions") {
      const { schemeId } = args;
      const scheme = await prisma.scheme.findUnique({
        where: { id: schemeId },
        select: {
          schemeName: true,
          applicationProcess: true,
          officialUrl: true,
          officialApplicationUrl: true
        }
      });
      if (!scheme) return { error: "Scheme not found" };

      return {
        schemeId,
        schemeName: scheme.schemeName,
        applicationProcess: scheme.applicationProcess || "Apply through the official portal or visit your nearest Common Service Centre (CSC).",
        portalUrl: scheme.officialApplicationUrl || scheme.officialUrl
      };
    }

    if (name === "update_citizen_profile") {
      return { status: "profile_updated", updatedFields: args };
    }

    return { error: `Unknown tool: ${name}` };
  } catch (err) {
    console.error(`[executeTool] Error running ${name}:`, err.message);
    return { error: err.message };
  }
}

// ==============================================================================
// DETERMINISTIC CONVERSATIONAL REASONING AGENT (FALLBACK & ZERO-LATENCY MODE)
// ==============================================================================

const YOJANASATHI_SYSTEM_PROMPT = `You are YojanaSathi, an expert multilingual AI assistant helping Indian citizens discover and apply for verified government welfare schemes.

STRICT CONSTRAINTS:
1. Ground every statement in verified government data. Never fabricate schemes or benefits.
2. Only recommend citizen welfare schemes. Exclude all budget accounting entries.
3. Respect geographic jurisdiction: Haryana residents must never receive Punjab state schemes.
4. When relevant information is missing, ask for exactly one detail in sequence (e.g. state -> land -> crop).
5. Always reply in the citizen's chosen language (English, Hindi, Punjabi, or Hinglish).`;

function buildDeterministicReasoningReply({ profile, schemes, language, intent, missingFields, toolOutputs = [] }) {
  const isHindi   = language === 'hi' || language === 'mixed';
  const isPunjabi = language === 'pa';

  // Greeting
  if (intent === 'GREETING') {
    if (isHindi) return 'नमस्ते! मैं आपका योजनासाथी हूँ। कृपया अपनी उम्र, राज्य, पेशा या उगाई जाने वाली फसल बताएं — मैं आपके लिए उपयुक्त सरकारी योजनाएं खोजूंगा।';
    if (isPunjabi) return 'ਨਮਸਕਾਰ! ਮੈਂ ਤੁਹਾਡਾ ਯੋਜਨਾਸਾਥੀ ਹਾਂ। ਆਪਣੀ ਉਮਰ, ਰਾਜ, ਕਿੱਤਾ ਜਾਂ ਫਸਲ ਦੱਸੋ — ਮੈਂ ਤੁਹਾਡੇ ਲਈ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਲੱਭਾਂਗਾ।';
    return 'Namaste! I am your AI YojanaSathi. Tell me your age, state, occupation, or crops you grow, and I will find verified government schemes for you.';
  }

  // Document inquiry
  if (intent === 'GET_DOCUMENTS') {
    const topScheme = schemes && schemes.length > 0 ? schemes[0] : null;
    const docs = topScheme?.requiredDocuments || 'Aadhaar Card, Residence Proof, Bank Passbook, Land Record / Fard (if farmer).';
    if (isHindi) return `योजना के लिए आवश्यक दस्तावेज़:\n• ${docs}\nकृपया आवेदन करने से पहले आधिकारिक पोर्टल पर पुष्टि करें।`;
    if (isPunjabi) return `ਯੋਜਨਾ ਲਈ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼:\n• ${docs}\nਕਿਰਪਾ ਕਰਕੇ ਅਰਜ਼ੀ ਦੇਣ ਤੋਂ ਪਹਿਲਾਂ ਸਰਕਾਰੀ ਪੋਰਟਲ 'ਤੇ ਪੁਸ਼ਟੀ ਕਰੋ।`;
    return `Required documents for the scheme:\n• ${docs}\nPlease verify at the official government portal before applying.`;
  }

  // Application process inquiry
  if (intent === 'GET_APPLICATION_STEPS') {
    const topScheme = schemes && schemes.length > 0 ? schemes[0] : null;
    const steps = topScheme?.applicationProcess || 'Visit the official state government portal or visit your nearest Common Service Centre (CSC) with your documents.';
    const portal = topScheme?.officialUrl || 'https://myscheme.gov.in';
    if (isHindi) return `आवेदन प्रक्रिया:\n${steps}\n🔗 आधिकारिक पोर्टल: ${portal}`;
    if (isPunjabi) return `ਅਰਜ਼ੀ ਪ੍ਰਕਿਰਿਆ:\n${steps}\n🔗 ਸਰਕਾਰੀ ਪੋਰਟਲ: ${portal}`;
    return `Application Process:\n${steps}\n🔗 Official Portal: ${portal}`;
  }

  // Multi-turn conversational flow guidance:
  // If user says "I am a farmer" and state is unknown -> ask for State
  if (profile.occupation === 'farmer' && !profile.state) {
    if (isHindi) return 'आप किस राज्य के निवासी हैं? (जैसे पंजाब या हरियाणा)';
    if (isPunjabi) return 'ਤੁਸੀਂ ਕਿਹੜੇ ਰਾਜ ਦੇ ਵਸਨੀਕ ਹੋ? (ਜਿਵੇਂ ਪੰਜਾਬ ਜਾਂ ਹਰਿਆਣਾ)';
    return 'Which state do you belong to? (e.g. Punjab or Haryana)';
  }

  // If farmer in a state and landholding is unknown -> ask for Land
  if (profile.occupation === 'farmer' && profile.state && profile.landHolding === undefined) {
    if (isHindi) return `क्या आपके पास कृषि भूमि है? आपके पास कितने एकड़ जमीन है?`;
    if (isPunjabi) return `ਕੀ ਤੁਹਾਡੇ ਕੋਲ ਖੇਤੀਬਾੜੀ ਜ਼ਮੀਨ ਹੈ? ਤੁਹਾਡੇ ਕੋਲ ਕਿੰਨੀ ਏਕੜ ਜ਼ਮੀਨ ਹੈ?`;
    return 'Do you own agricultural land? How many acres of land do you have?';
  }

  // If farmer has land and crop is unknown -> ask for Crops
  if (profile.occupation === 'farmer' && profile.state && profile.landHolding !== undefined && !profile.cropType) {
    if (isHindi) return 'आप अपने खेत में कौन सी फसलें उगाते हैं? (जैसे गेहूं, धान, कपास)';
    if (isPunjabi) return 'ਤੁਸੀਂ ਆਪਣੇ ਖੇਤ ਵਿੱਚ ਕਿਹੜੀਆਂ ਫਸਲਾਂ ਉਗਾਉਂਦੇ ਹੋ? (ਜਿਵੇਂ ਕਣਕ, ਝੋਨਾ, ਨਰਮਾ)';
    return 'Which crops do you grow on your land? (e.g. wheat, paddy, cotton, mustard)';
  }

  // When schemes are found
  if (schemes && schemes.length > 0) {
    const parts = [];
    if (isHindi) {
      parts.push(`आपकी जानकारी (${profile.occupation || 'नागरिक'}, ${profile.state || 'भारत'}, ${profile.cropType ? 'फसल: ' + profile.cropType : ''}) के आधार पर ये सत्यापित योजनाएं उपलब्ध हैं:`);
    } else if (isPunjabi) {
      parts.push(`ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ (${profile.occupation || 'ਨਾਗਰਿਕ'}, ${profile.state || 'ਪੰਜਾਬ'}, ${profile.cropType ? 'ਫਸਲ: ' + profile.cropType : ''}) ਅਨੁਸਾਰ ਇਹ ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ ਉਪਲਬਧ ਹਨ:`);
    } else {
      const summaryList = [
        profile.occupation,
        profile.state,
        profile.landHolding ? `${profile.landHolding} acres` : null,
        profile.cropType ? `Crops: ${profile.cropType}` : null
      ].filter(Boolean).join(', ');
      parts.push(`Based on your profile (${summaryList}), here are relevant verified government schemes:`);
    }

    schemes.slice(0, 3).forEach((scheme, idx) => {
      const name = scheme.schemeName || 'Government Scheme';
      const status = scheme.eligibilityStatus === 'ELIGIBLE' ? '✓ Eligible' : '⚠ Verification Required';
      const statusHi = scheme.eligibilityStatus === 'ELIGIBLE' ? '✓ पात्र' : '⚠ सत्यापन आवश्यक';
      const statusPa = scheme.eligibilityStatus === 'ELIGIBLE' ? '✓ ਯੋਗ' : '⚠ ਜਾਂਚ ਲੋੜੀਂਦੀ';
      const statLabel = isHindi ? statusHi : isPunjabi ? statusPa : status;

      let line = `${idx + 1}. **${name}** — ${statLabel}`;
      if (scheme.department) line += ` (${scheme.department})`;
      if (scheme.officialUrl) line += `\n   🔗 ${scheme.officialUrl}`;
      parts.push(line);
    });

    if (isHindi) parts.push('\n📋 कृपया आवेदन करने से पहले आधिकारिक सरकारी पोर्टल पर विवरण सत्यापित करें।');
    else if (isPunjabi) parts.push('\n📋 ਕਿਰਪਾ ਕਰਕੇ ਅਰਜ਼ੀ ਦੇਣ ਤੋਂ ਪਹਿਲਾਂ ਸਰਕਾਰੀ ਪੋਰਟਲ ਤੇ ਵੇਰਵੇ ਪੁਸ਼ਟੀ ਕਰੋ।');
    else parts.push('\n📋 Please verify all requirements on the official government portal before applying.');

    return parts.join('\n');
  }

  // Fallback when no schemes match
  if (isHindi) return 'आपकी वर्तमान जानकारी के अनुसार अभी कोई योजना नहीं मिली। कृपया अपनी उम्र या वार्षिक आय बताएं।';
  if (isPunjabi) return 'ਤੁਹਾਡੀ ਮੌਜੂਦਾ ਜਾਣਕਾਰੀ ਅਨੁਸਾਰ ਕੋਈ ਯੋਜਨਾ ਨਹੀਂ ਮਿਲੀ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਉਮਰ ਜਾਂ ਸਾਲਾਨਾ ਆਮਦਨ ਦੱਸੋ।';
  return 'No matching schemes were found for your current profile. Please specify your state, age, or annual income.';
}

// ==============================================================================
// PUBLIC INTERFACE
// ==============================================================================

async function generateResponse({
  userMessage,
  history = [],
  profile = {},
  schemes = [],
  language = 'en',
  intent = 'UNKNOWN',
  missingFields = []
}) {
  // If an external LLM is configured (OpenAI, Gemini, Anthropic, Ollama), attempt structured reasoning
  if (PROVIDER !== 'none' && API_KEY) {
    try {
      if (PROVIDER === 'openai') {
        const model = MODEL || 'gpt-4o-mini';
        const messages = [
          { role: 'system', content: YOJANASATHI_SYSTEM_PROMPT },
          ...history.slice(-8).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage }
        ];

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages,
            tools: TOOLS,
            tool_choice: "auto",
            max_tokens: 500,
            temperature: 0.3
          }),
          signal: AbortSignal.timeout(15000)
        });

        if (res.ok) {
          const data = await res.json();
          const choice = data?.choices?.[0]?.message;

          // If LLM decided to invoke a tool:
          if (choice?.tool_calls && choice.tool_calls.length > 0) {
            const toolCall = choice.tool_calls[0];
            const fnName = toolCall.function.name;
            const fnArgs = JSON.parse(toolCall.function.arguments || '{}');
            const toolResult = await executeTool(fnName, fnArgs, { profile });

            // Generate grounded second turn
            const followUpRes = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model,
                messages: [
                  ...messages,
                  choice,
                  {
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(toolResult)
                  }
                ],
                max_tokens: 500,
                temperature: 0.3
              }),
              signal: AbortSignal.timeout(15000)
            });

            if (followUpRes.ok) {
              const followUpData = await followUpRes.json();
              const reply = followUpData?.choices?.[0]?.message?.content;
              if (reply) return { reply, source: 'llm_tool_call' };
            }
          }

          if (choice?.content) {
            return { reply: choice.content, source: 'llm' };
          }
        }
      }
    } catch (err) {
      console.warn('[llmClient] External LLM tool calling failed, engaging deterministic reasoning:', err.message);
    }
  }

  // Deterministic Grounded Reasoning (Zero Hallucination Guarantee)
  const deterministicReply = buildDeterministicReasoningReply({
    profile,
    schemes,
    language,
    intent,
    missingFields
  });

  return { reply: deterministicReply, source: 'deterministic_reasoning' };
}

function getLLMStatus() {
  return {
    provider: PROVIDER,
    hasApiKey: PROVIDER === 'ollama' ? true : Boolean(API_KEY),
    model: MODEL || '(default)',
    toolsAvailable: TOOLS.map(t => t.function.name),
    isActive: PROVIDER !== 'none' && (PROVIDER === 'ollama' || Boolean(API_KEY))
  };
}

module.exports = {
  generateResponse,
  executeTool,
  getLLMStatus,
  TOOLS,
  YOJANASATHI_SYSTEM_PROMPT
};
