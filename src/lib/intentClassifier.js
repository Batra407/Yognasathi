/**
 * YojanaSathi 2.0 — Multilingual Intent Classifier
 * Hybrid ML-aligned 12-Class Welfare Intent Classifier & Conversational Action Engine.
 *
 * 12 Citizen Welfare Domains:
 *   1. AGRICULTURE_ASSISTANCE
 *   2. EDUCATION_SCHOLARSHIP
 *   3. HEALTHCARE_ASSISTANCE
 *   4. HOUSING_SHELTER
 *   5. EMPLOYMENT_OPPORTUNITIES
 *   6. WOMEN_EMPOWERMENT
 *   7. PENSION_ASSISTANCE
 *   8. DISABILITY_ASSISTANCE
 *   9. BUSINESS_ENTREPRENEURSHIP
 *  10. FINANCIAL_ASSISTANCE
 *  11. SKILL_DEVELOPMENT
 *  12. GENERAL_WELFARE
 *
 * Conversational Action Intents:
 *   FIND_SCHEMES, CHECK_ELIGIBILITY, GET_DOCUMENTS, GET_APPLICATION_STEPS,
 *   PROVIDE_PROFILE, ASK_CORRECTION, GREETING, UNKNOWN
 */

// ─── 12 Welfare Domain Vocabulary (Multilingual: EN, HI, PA, Hinglish) ───────
const DOMAIN_KEYWORDS = {
  AGRICULTURE_ASSISTANCE: [
    'farmer', 'farming', 'tractor', 'tubewell', 'irrigation', 'fertilizer', 'seeds',
    'kisan', 'paddy', 'wheat', 'crop', 'agriculture', 'kharif', 'rabi', 'polyhouse',
    'कपास', 'किसान', 'खेती', 'ट्रैक्टर', 'ट्यूबवेल', 'सिंचाई', 'खाद', 'बीज', 'फसल', 'एमएसपी', 'कनक',
    'ਕਿਸਾਨ', 'ਖੇਤੀਬਾੜੀ', 'ਟਰੈਕਟਰ', 'ਟਿਊਬਵੈੱਲ', 'ਸਿੰਚਾਈ', 'ਖਾਦ', 'ਬੀਜ', 'ਫ਼ਸਲ', 'ਝੋਨਾ', 'ਕਣਕ'
  ],
  EDUCATION_SCHOLARSHIP: [
    'scholarship', 'student', 'college', 'school', 'university', 'tuition', 'degree',
    'fellowship', 'study abroad', 'hostel', 'coaching', 'books', 'laptop', 'post matric',
    'छात्रवृत्ति', 'स्कॉलरशिप', 'विद्यार्थी', 'छात्र', 'छात्रा', 'कॉलेज', 'यूनिवर्सिटी', 'फीस', 'पढ़ाई',
    'ਵਜ਼ੀਫ਼ਾ', 'ਸਕਾਲਰਸ਼ਿਪ', 'ਵਿਦਿਆਰਥੀ', 'ਕਾਲਜ', 'ਯੂਨੀਵਰਸਿਟੀ', 'ਫੀਸ', 'ਪੜ੍ਹਾਈ'
  ],
  HEALTHCARE_ASSISTANCE: [
    'health', 'hospital', 'medical', 'treatment', 'surgery', 'ayushman', 'pm-jay',
    'golden card', 'doctor', 'medicine', 'dialysis', 'cancer', 'illness', 'insurance',
    'आयुष्मान', 'इलाज', 'अस्पताल', 'दवाई', 'दवाइयां', 'स्वास्थ्य', 'सर्जरी', 'कैंसर', 'बीमारी',
    'ਆਯੁਸ਼ਮਾਨ', 'ਇਲਾਜ', 'ਹਸਪਤਾਲ', 'ਦਵਾਈ', 'ਸਿਹਤ', 'ਸਰਬੱਤ ਸਿਹਤ ਬੀਮਾ', 'ਬਿਮਾਰੀ'
  ],
  HOUSING_SHELTER: [
    'housing', 'house', 'pm awas', 'pakka makaan', 'kachha house', 'roof', 'home loan',
    'toilet', 'swachh bharat', 'shelter', 'plot', 'flat', 'construction subsidy',
    'आवास', 'मकान', 'घर', 'शौचालय', 'पक्का मकान', 'कच्चा घर', 'गृह निर्माण', 'फ्लैट',
    'ਮਕਾਨ', 'ਘਰ', 'ਪੱਕਾ ਮਕਾਨ', 'ਆਵਾਸ ਯੋਜਨਾ', 'ਲੈਟਰੀਨ', 'ਛੱਤ'
  ],
  EMPLOYMENT_OPPORTUNITIES: [
    'employment', 'unemployed', 'job', 'ncs', 'rozgar', 'vacancy', 'recruitment',
    'allowance', 'mgnrega', 'job card', '100 days work', 'wage', 'placement',
    'रोजगार', 'बेरोजगार', 'नौकरी', 'भत्ता', 'मनरेगा', 'जॉब कार्ड', 'कार्य',
    'ਰੁਜ਼ਗਾਰ', 'ਬੇਰੁਜ਼ਗਾਰ', 'ਨੌਕਰੀ', 'ਮਨਰੇਗਾ', 'ਜਾਬ ਕਾਰਡ', 'ਬੇਰੁਜ਼ਗਾਰੀ ਭੱਤਾ'
  ],
  WOMEN_EMPOWERMENT: [
    'women', 'mother', 'maternity', 'matru vandana', 'girl child', 'sukanya',
    'self help group', 'shg', 'widow', 'sewing machine', 'marriage grant', 'shagun',
    'महिला', 'गर्भवती', 'मातृ वंदना', 'सुकन्या', 'बेटी', 'स्वयं सहायता', 'सिलाई मशीन', 'विवाह अनुदान',
    'ਮਹਿਲਾ', 'ਔਰਤ', 'ਗਰਭਵਤੀ', 'ਧੀਆਂ', 'ਸੁਕੰਨਿਆ', 'ਸ਼ਗਨ ਸਕੀਮ', 'ਸਿਲਾਈ ਮਸ਼ੀਨ'
  ],
  PENSION_ASSISTANCE: [
    'pension', 'old age', 'senior citizen', 'vridha', 'widow pension', 'destitute',
    'atal pension', 'monthly pension', 'retirement', '60 years',
    'पेंशन', 'वृद्धावस्था', 'बुढ़ापा पेंशन', 'वरिष्ठ नागरिक', 'विधवा पेंशन', 'अटल पेंशन',
    'ਪੈਨਸ਼ਨ', 'ਬੁਢਾਪਾ ਪੈਨਸ਼ਨ', 'ਬਜ਼ੁਰਗ', 'ਵਿਧਵਾ ਪੈਨਸ਼ਨ', 'ਅਟਲ ਪੈਨਸ਼ਨ'
  ],
  DISABILITY_ASSISTANCE: [
    'disability', 'disabled', 'handicap', 'udid', 'divyang', 'wheelchair', 'tricycle',
    'hearing aid', 'adip', 'special needs', '40%',
    'दिव्यांग', 'विकलांग', 'यूडीआईडी', 'ट्राइसाइकिल', 'व्हीलचेयर', 'कान की मशीन',
    'ਦਿਵਿਆਂਗ', 'ਵਿਕਲਾਂਗ', 'ਅੰਗਹੀਣ', 'ਯੂਡੀਆਈਡੀ', 'ਟਰਾਈਸਾਈਕਲ'
  ],
  BUSINESS_ENTREPRENEURSHIP: [
    'mudra', 'business', 'shop', 'loan', 'entrepreneur', 'startup', 'pmegp',
    'stand up india', 'msme', 'dairy farm', 'factory', 'subsidy loan',
    'मुद्रा लोन', 'व्यापार', 'दुकान', 'उद्योग', 'स्टार्टअप', 'डेयरी फार्म', 'बिना गारंटी लोन',
    'ਮੁਦਰਾ ਲੋਨ', 'ਕਾਰੋਬਾਰ', 'ਦੁਕਾਨ', 'ਉਦਯੋਗ', 'ਡੇਅਰੀ ਫਾਰਮ'
  ],
  FINANCIAL_ASSISTANCE: [
    'dbt', 'cash transfer', 'financial aid', 'bpl', 'relief', 'flood', 'compensation',
    'jan dhan', 'overdraft', 'emergency grant', 'compensation',
    'आर्थिक सहायता', 'डीबीटी', 'नकद', 'मुआवजा', 'राहत', 'जन धन', 'बीपीएल',
    'ਵਿੱਤੀ ਸਹਾਇਤਾ', 'ਸਿੱਧੀ ਨਕਦ', 'ਮੁਆਵਜ਼ਾ', 'ਹੜ੍ਹ ਰਾਹਤ', 'ਜਨ ਧਨ'
  ],
  SKILL_DEVELOPMENT: [
    'skill', 'pmkvy', 'training', 'iti', 'computer course', 'certificate', 'vishwakarma',
    'artisan', 'electrician', 'mechanic', 'toolkit', 'apprentice',
    'कौशल विकास', 'प्रशिक्षण', 'विश्वकर्मा', 'टूलकिट', 'आईटीआई', 'कंप्यूटर कोर्स', 'सर्टिफिकेट',
    'ਹੁਨਰ ਵਿਕਾਸ', 'ਸਿਖਲਾਈ', 'ਵਿਸ਼ਵਕਰਮਾ', 'ਟੂਲਕਿੱਟ', 'ਆਈਟੀਆਈ'
  ],
  GENERAL_WELFARE: [
    'ration card', 'pds', 'caste certificate', 'domicile', 'income certificate',
    'ujjwala', 'lpg gas', 'cylinder', 'grievance', 'helpline',
    'राशन कार्ड', 'उज्ज्वला', 'गैस सिलेंडर', 'जाति प्रमाण पत्र', 'मूल निवास', 'जनसुनवाई',
    'ਰਾਸ਼ਨ ਕਾਰਡ', 'ਉੱਜਵਲਾ', 'ਗੈਸ ਸਿਲੰਡਰ', 'ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ', 'ਰਿਹਾਇਸ਼ੀ'
  ]
};

// ─── Correction patterns ────────────────────────────────────────────────────
const CORRECTION_PATTERNS = [
  /\bactually\b/i,
  /\bi meant\b/i,
  /\bnot\s+\d+[,\s]+(?:i am|i'm|my age is|age is)\s+\d+/i,
  /\bsorry[,.]?\s+(i am|i'm|my)/i,
  /\bcorrect(?:ion)?[,:]?\s/i,
  /\bchange(?:d)?\s+(my|the)\s+(age|state|income|occupation)/i,
  /दरअसल|वास्तव में|सुधार|नहीं.*बल्कि/u,
  /ਅਸਲ ਵਿੱਚ|ਨਹੀਂ.*ਸਗੋਂ/u
];

// ─── Greeting patterns ───────────────────────────────────────────────────────
const GREETING_PATTERNS = [
  /^\s*(hi|hello|hey|namaste|namaskar|sat sri akal|waheguru|jai hind)\b/i,
  /^(नमस्ते|नमस्कार|हैलो|हिंदी)/u,
  /^(ਨਮਸਕਾਰ|ਸਤ ਸ੍ਰੀ ਅਕਾਲ|ਹੈਲੋ)/u
];

const FIND_SCHEMES_KEYWORDS = [
  'scheme', 'schemes', 'benefit', 'benefits', 'yojana', 'yojanas',
  'subsidy', 'subsidies', 'grant', 'grants', 'welfare', 'assistance',
  'eligible', 'eligibility', 'apply', 'application', 'government help',
  'योजना', 'योजनाएं', 'सब्सिडी', 'लाभ', 'सरकारी मदद',
  'ਯੋਜਨਾ', 'ਸਕੀਮ', 'ਸਬਸਿਡੀ', 'ਲਾਭ', 'ਸਰਕਾਰੀ ਮਦਦ'
];

const ELIGIBILITY_KEYWORDS = [
  'am i eligible', 'check eligibility', 'qualify', 'qualified', 'do i qualify',
  'can i get', 'can i apply', 'will i get', 'am i entitled',
  'पात्र', 'पात्रता', 'योग्य', 'मुझे मिलेगा', 'मिल सकता है',
  'ਯੋਗ', 'ਯੋਗਤਾ', 'ਮੈਨੂੰ ਮਿਲੇਗਾ'
];

const DOCUMENTS_KEYWORDS = [
  'document', 'documents', 'papers', 'certificate', 'certificates',
  'required documents', 'what documents', 'proof', 'aadhaar',
  'दस्तावेज', 'कागज़', 'प्रमाण पत्र', 'आधार',
  'ਦਸਤਾਵੇਜ਼', 'ਕਾਗਜ਼', 'ਪ੍ਰਮਾਣ ਪੱਤਰ', 'ਆਧਾਰ'
];

const APPLICATION_STEPS_KEYWORDS = [
  'how to apply', 'application process', 'how do i apply', 'where to apply',
  'apply online', 'portal', 'register', 'registration', 'form', 'steps',
  'कैसे आवेदन', 'आवेदन प्रक्रिया', 'ऑनलाइन आवेदन', 'पोर्टल',
  'ਅਰਜ਼ੀ ਕਿਵੇਂ', 'ਅਰਜ਼ੀ ਪ੍ਰਕਿਰਿਆ', 'ਔਨਲਾਈਨ ਅਰਜ਼ੀ'
];

const PROFILE_INDICATORS = [
  /\bi am\b/i, /\bmy name is\b/i, /\bmy age is\b/i, /\bi'm\b/i,
  /\b\d+\s*years?\s*old\b/i, /\bi live\s+in\b/i, /\bi work\s+as\b/i,
  /\bi am\s+a\s+(farmer|student|worker|teacher|doctor)\b/i,
  /\bmy income\b/i, /\bi own\s+\d+\s*acres?\b/i,
  /मैं\s+\d+\s*साल/u, /मेरी\s+उम्र/u, /मेरी\s+आयु/u,
  /मैं\s+.*\s+(किसान|छात्र|मजदूर|बेरोजगार)/u,
  /ਮੈਂ\s+\d+\s*ਸਾਲ/u, /ਮੇਰੀ\s+ਉਮਰ/u,
  /ਮੈਂ\s+.*\s+(ਕਿਸਾਨ|ਵਿਦਿਆਰਥੀ|ਮਜ਼ਦੂਰ)/u
];

function detectCorrection(text) {
  const hasCorrection = CORRECTION_PATTERNS.some(re => re.test(text));
  if (!hasCorrection) {
    return { isCorrection: false, field: null, newValue: null };
  }

  let field = null;
  let newValue = null;

  const ageMatch = text.match(/(?:actually\s+)?(?:i am|i'm|my age is|age is)\s+(\d+)/i) ||
                   text.match(/not\s+\d+[,\s]+(?:i am|i'm)\s+(\d+)/i) ||
                   text.match(/(\d+)\s*(?:साल|ਸਾਲ)\s*(?:का|ਦਾ)?/u);
  if (ageMatch) {
    field = 'age';
    newValue = parseInt(ageMatch[1], 10);
  }

  const stateMatch = text.match(/(?:actually|correct|i live in)\s+(punjab|haryana|delhi|rajasthan|gujarat|maharashtra|uttar pradesh|bihar|up)/i);
  if (stateMatch) {
    field = 'state';
    newValue = stateMatch[1].charAt(0).toUpperCase() + stateMatch[1].slice(1);
  }

  const incomeMatch = text.match(/(?:my income is|income)\s+(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|lac)?/i);
  if (incomeMatch) {
    const raw = parseFloat(incomeMatch[1]);
    field = 'annualIncome';
    newValue = /lakh/i.test(text) ? Math.round(raw * 100000) : raw;
  }

  return { isCorrection: true, field, newValue };
}

/**
 * Classifies text across 12 Citizen Welfare Domains using token and n-gram overlap.
 */
function classifyWelfareDomain(text) {
  const lower = text.toLowerCase();
  const scores = {};

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score += 1.0;
      }
    }
    scores[domain] = score;
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topDomain = sorted[0][0];
  const topScore = sorted[0][1];

  const total = sorted.reduce((sum, item) => sum + item[1], 0) || 1.0;
  const probabilities = {};
  for (const [dom, sc] of sorted) {
    probabilities[dom] = Math.round((sc / total) * 100) / 100;
  }

  const primary_intent = topScore > 0 ? topDomain : 'GENERAL_WELFARE';
  const secondary_intents = sorted.filter(x => x[1] > 0 && x[0] !== primary_intent).map(x => x[0]).slice(0, 2);
  const confidence = topScore > 0 ? Math.min(0.98, Math.max(0.65, 0.5 + topScore * 0.15)) : 0.45;

  return {
    primary_intent,
    secondary_intents,
    confidence: Math.round(confidence * 100) / 100,
    probabilities
  };
}

/**
 * Main Intent Classifier — integrates conversational actions with 12 ML citizen welfare domains.
 */
function classifyIntent(text, language = 'en', profile = {}) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return {
      intent: 'UNKNOWN',
      primary_intent: 'GENERAL_WELFARE',
      confidence: 0,
      isCorrection: false,
      correctionField: null,
      correctionValue: null
    };
  }

  const t = text.trim();
  const lower = t.toLowerCase();

  // 1. Check for Greeting
  if (GREETING_PATTERNS.some(re => re.test(t))) {
    return {
      intent: 'GREETING',
      primary_intent: 'GENERAL_WELFARE',
      confidence: 0.95,
      isCorrection: false,
      correctionField: null,
      correctionValue: null
    };
  }

  // 2. Check for Correction Override
  const correction = detectCorrection(t);
  if (correction.isCorrection) {
    return {
      intent: 'ASK_CORRECTION',
      primary_intent: 'GENERAL_WELFARE',
      confidence: 0.90,
      isCorrection: true,
      correctionField: correction.field,
      correctionValue: correction.newValue
    };
  }

  // 3. Classify 12 ML Welfare Domains
  const domainInfo = classifyWelfareDomain(t);

  // 4. Action Intent Scoring
  const actionScores = {
    FIND_SCHEMES: 0,
    CHECK_ELIGIBILITY: 0,
    GET_DOCUMENTS: 0,
    GET_APPLICATION_STEPS: 0,
    PROVIDE_PROFILE: 0
  };

  for (const kw of FIND_SCHEMES_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) actionScores.FIND_SCHEMES += 1;
  }
  for (const kw of ELIGIBILITY_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) actionScores.CHECK_ELIGIBILITY += 2;
  }
  for (const kw of DOCUMENTS_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) actionScores.GET_DOCUMENTS += 2;
  }
  for (const kw of APPLICATION_STEPS_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) actionScores.GET_APPLICATION_STEPS += 2;
  }
  const profileMatchCount = PROFILE_INDICATORS.filter(re => re.test(t)).length;
  actionScores.PROVIDE_PROFILE = profileMatchCount * 2;

  // If domain intent detected, default to FIND_SCHEMES if no specific action specified
  if (domainInfo.primary_intent !== 'GENERAL_WELFARE') {
    actionScores.FIND_SCHEMES += 1.5;
  }

  const topAction = Object.entries(actionScores).sort((a, b) => b[1] - a[1])[0];
  const finalActionIntent = topAction[1] > 0 ? topAction[0] : (profileMatchCount > 0 ? 'PROVIDE_PROFILE' : 'FIND_SCHEMES');

  return {
    intent: finalActionIntent,
    primary_intent: domainInfo.primary_intent,
    secondary_intents: domainInfo.secondary_intents,
    confidence: domainInfo.confidence,
    probabilities: domainInfo.probabilities,
    isCorrection: false,
    correctionField: null,
    correctionValue: null
  };
}

module.exports = {
  classifyIntent,
  classifyWelfareDomain,
  detectCorrection,
  DOMAIN_KEYWORDS
};
