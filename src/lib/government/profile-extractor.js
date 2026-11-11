/**
 * Multilingual User Profile & Requirement Extractor
 * Deterministically extracts normalized profile fields (age, gender, state, occupation,
 * annualIncome, category, residency, landHolding, employmentStatus, disabilityStatus)
 * from natural language requests in English, Hindi, Punjabi, Hinglish, and mixed inputs.
 */

const { detectLanguage } = require('../nlp.js');

// Indian States and UTs normalized map
const STATE_MAP = [
  { name: 'Punjab', keywords: ['punjab', 'पंजाब', 'ਪੰਜਾਬ'] },
  { name: 'Maharashtra', keywords: ['maharashtra', 'महाराष्ट्र'] },
  { name: 'Tamil Nadu', keywords: ['tamil nadu', 'tamilnadu', 'तमिलनाडु', 'தமிழ்நாடு'] },
  { name: 'Haryana', keywords: ['haryana', 'हरियाणा', 'ਹਰਿਆਣਾ'] },
  { name: 'Uttar Pradesh', keywords: ['uttar pradesh', 'उत्तर प्रदेश', 'ਉੱਤਰ ਪ੍ਰਦੇਸ਼', 'up'] },
  { name: 'Gujarat', keywords: ['gujarat', 'गुजरात', 'ગુજરાત'] },
  { name: 'Rajasthan', keywords: ['rajasthan', 'राजस्थान', 'ਰਾਜਸਥਾਨ'] },
  { name: 'Karnataka', keywords: ['karnataka', 'कर्नाटक', 'ਕਰਨਟਕ'] },
  { name: 'Kerala', keywords: ['kerala', 'केरल', 'ਕੇਰਲ'] },
  { name: 'West Bengal', keywords: ['west bengal', 'पश्चिम बंगाल', 'পশ্চিমবঙ্গ'] },
  { name: 'Bihar', keywords: ['bihar', 'बिहार', 'ਬਿਹਾਰ'] },
  { name: 'Delhi', keywords: ['delhi', 'दिल्ली', 'ਦਿੱਲੀ'] },
  { name: 'Madhya Pradesh', keywords: ['madhya pradesh', 'मध्य प्रदेश', 'mp'] },
  { name: 'Andhra Pradesh', keywords: ['andhra pradesh', 'आंध्र प्रदेश'] },
  { name: 'Telangana', keywords: ['telangana', 'तेलंगाना'] },
  { name: 'Odisha', keywords: ['odisha', 'orissa', 'ओडिशा'] },
  { name: 'Assam', keywords: ['assam', 'असम'] },
  { name: 'Jharkhand', keywords: ['jharkhand', 'झारखंड'] },
  { name: 'Chhattisgarh', keywords: ['chhattisgarh', 'छत्तीसगढ़'] },
  { name: 'Uttarakhand', keywords: ['uttarakhand', 'उत्तराखंड'] },
  { name: 'Himachal Pradesh', keywords: ['himachal pradesh', 'हिमाचल प्रदेश'] },
  { name: 'Jammu and Kashmir', keywords: ['jammu and kashmir', 'jammu', 'kashmir', 'जम्मू और कश्मीर'] }
];

// Number word dictionary for multilingual numbers
const NUMBER_WORDS = {
  'one': 1, '1': 1, 'एक': 1, 'ਇੱਕ': 1,
  'two': 2, '2': 2, 'दो': 2, 'ਦੋ': 2,
  'three': 3, '3': 3, 'तीन': 3, 'ਤਿੰਨ': 3,
  'four': 4, '4': 4, 'चार': 4, 'ਚਾਰ': 4,
  'five': 5, '5': 5, 'पांच': 5, 'ਪੰਜ': 5,
  'six': 6, '6': 6, 'छह': 6, 'ਛੇ': 6,
  'seven': 7, '7': 7, 'सात': 7, 'ਸੱਤ': 7,
  'eight': 8, '8': 8, 'आठ': 8, 'ਅੱਠ': 8,
  'nine': 9, '9': 9, 'नौ': 9, 'ਨੌ': 9,
  'ten': 10, '10': 10, 'दस': 10, 'ਦੱਸ': 10
};

/**
 * Extracts normalized user profile fields from natural language text.
 */
function extractUserProfile(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return {
      error: 'Text parameter is required and cannot be empty.',
      status: 400
    };
  }

  const trimmedText = text.trim();
  const language = detectLanguage(trimmedText);

  const profile = {};
  const extractedFields = [];
  const uncertainFields = [];

  // -------------------------------------------------------------
  // 1. Occupation Extraction
  // -------------------------------------------------------------
  if (/farmer|farmers|farming|किसान|किसानों|ਕਿਸਾਨ|ਕਿਸਾਨਾਂ|शेतकरी|ખેડૂત|চাষী|কৃষক|விவசாயி|రైతు|ರೈತ|കർഷകൻ/iu.test(trimmedText)) {
    profile.occupation = 'farmer';
    extractedFields.push('occupation');
  } else if (/student|students|छात्र|छात्रा|विद्यार्थी|ਵਿਦਿਆਰਥੀ|மாணவர்|విద్యార్థి|ವಿದ್ಯಾರ್ಥಿ|വിദ്യാർത്ഥി/iu.test(trimmedText)) {
    profile.occupation = 'student';
    extractedFields.push('occupation');
  } else if (/unemployed|बेरोजगार|ਬੇਰੋਜ਼ਗਾਰ|বেকার|வேலைவாய்ப்பில்லாதவர்|నిరుద్యోగి|ನಿರುದ್ಯೋಗಿ|തൊഴിലില്ലാത്തവർ/iu.test(trimmedText)) {
    profile.occupation = 'unemployed';
    extractedFields.push('occupation');
  } else if (/handloom|weaver|weavers|बुनकर|ਵੀਵਰ|நெசவாளர்/iu.test(trimmedText)) {
    profile.occupation = 'handloom weaver';
    extractedFields.push('occupation');
  } else if (/unorganized worker|असंगठित मजदूर|असंगठित क्षेत्र/iu.test(trimmedText)) {
    profile.occupation = 'unorganized worker';
    extractedFields.push('occupation');
  }

  // -------------------------------------------------------------
  // 2. Gender Extraction
  // -------------------------------------------------------------
  if (/female|woman|women|girl|lady|महिला|स्त्री|ਔਰਤ|महिलाएं|સ્ત્રી|பெண்|பெண்கள்|స్త్రీ|మహిళ|ಮಹಿಳೆ|സ്ത്രീ/iu.test(trimmedText)) {
    profile.gender = 'female';
    extractedFields.push('gender');
  } else if (/(?:^|[^\p{L}\p{N}])(?:male|man|men|boy|पुरुष|आदमी|ਬੰਦਾ)(?:$|[^\p{L}\p{N}])/iu.test(trimmedText)) {
    profile.gender = 'male';
    extractedFields.push('gender');
  }

  // -------------------------------------------------------------
  // 3. State Extraction
  // -------------------------------------------------------------
  for (const st of STATE_MAP) {
    for (const kw of st.keywords) {
      const regex = new RegExp(`(?:^|[^\\p{L}\\p{N}])${kw}(?:$|[^\\p{L}\\p{N}])`, 'iu');
      if (regex.test(trimmedText)) {
        profile.state = st.name;
        extractedFields.push('state');
        break;
      }
    }
    if (profile.state) break;
  }

  // -------------------------------------------------------------
  // 4. Age Extraction
  // -------------------------------------------------------------
  const agePatterns = [
    /(?:age|aged)\s*(?:is\s*)?(\d{1,2})(?:$|[^\p{L}\p{N}])/iu,
    /(\d{1,2})\s*(?:years|yr|yrs|year)\s*(?:old|of\s*age)?(?:$|[^\p{L}\p{N}])/iu,
    /(\d{1,2})\s*(?:साल|वर्ष|ਸਾਲ)\s*(?:का|की|के|ਦਾ|ਦੀ|ਦੇ|of)?(?:$|[^\p{L}\p{N}])/iu,
    /(?:उम्र|ਉਮਰ|आयु)\s*(?:is\s*)?(\d{1,2})(?:$|[^\p{L}\p{N}])/iu,
    /meri\s*age\s*(\d{1,2})(?:$|[^\p{L}\p{N}])/iu
  ];

  let extractedAge = null;
  for (const pat of agePatterns) {
    const match = trimmedText.match(pat);
    if (match && match[1]) {
      const parsedAge = parseInt(match[1], 10);
      if (parsedAge >= 1 && parsedAge <= 120) {
        extractedAge = parsedAge;
        break;
      }
    }
  }

  if (extractedAge !== null) {
    profile.age = extractedAge;
    extractedFields.push('age');
  }

  // -------------------------------------------------------------
  // 5. Annual Income Extraction
  // -------------------------------------------------------------
  // Ambiguity Check: Do NOT extract as annualIncome if context indicates loan or grant!
  const isLoanContext = /loan|ऋण|करज़ा|ਕਰਜ਼ਾ|ਲੋਨ|लोਨ|लोन|borrow|credit/iu.test(trimmedText);

  if (!isLoanContext) {
    const incomeContextRegex = /income|annual\s*income|salary|earning|earnings|आय|आमादनी|आमदन|ਆਮਦਨ|सालाना\s*आय|ਸਾਲਾਨਾ\s*ਆਮਦਨ|सैलरी|तनख्वाह/iu;
    const hasIncomeContext = incomeContextRegex.test(trimmedText);

    if (hasIncomeContext) {
      let incomeVal = null;

      // Check numeric pattern with lakh/crore/k
      const lakhMatch = trimmedText.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|एक|दो|तीन|चार|पांच|ਇੱਕ|ਦੋ|ਤਿੰਨ|ਚਾਰ|ਪੰਜ)\b)\s*(?:lakh|lakhs|lac|lacs|लाख|ਲੱਖ)/iu);

      if (lakhMatch) {
        const rawNum = lakhMatch[1].toLowerCase();
        const multiplier = NUMBER_WORDS[rawNum] !== undefined ? NUMBER_WORDS[rawNum] : parseFloat(rawNum);
        if (!isNaN(multiplier)) {
          incomeVal = Math.round(multiplier * 100000);
        }
      } else {
        // Direct number match e.g. "income is 200000" or "₹2,00,000"
        const directMatch = trimmedText.match(/(?:income|आय|आमदन|ਆਮਦਨ|salary)[^\d]*?(?:₹|rs\.?|inr)?\s*([\d,]{4,9})/iu);
        if (directMatch) {
          const cleanNum = parseInt(directMatch[1].replace(/,/g, ''), 10);
          if (!isNaN(cleanNum) && cleanNum > 0) {
            incomeVal = cleanNum;
          }
        }
      }

      if (incomeVal !== null) {
        profile.annualIncome = incomeVal;
        extractedFields.push('annualIncome');
      } else {
        uncertainFields.push('annualIncome');
      }
    }
  }

  // -------------------------------------------------------------
  // 6. Category Extraction
  // -------------------------------------------------------------
  if (/(?:^|[^\p{L}\p{N}])(?:OBC|EBC)(?:$|[^\p{L}\p{N}])|अन्य पिछडा वर्ग/iu.test(trimmedText)) {
    profile.category = 'OBC';
    extractedFields.push('category');
  } else if (/(?:^|[^\p{L}\p{N}])SC(?:$|[^\p{L}\p{N}])|scheduled caste|अनुसूचित जाति/iu.test(trimmedText)) {
    profile.category = 'SC';
    extractedFields.push('category');
  } else if (/(?:^|[^\p{L}\p{N}])ST(?:$|[^\p{L}\p{N}])|scheduled tribe|अनुसूचित जनजाति/iu.test(trimmedText)) {
    profile.category = 'ST';
    extractedFields.push('category');
  } else if (/(?:^|[^\p{L}\p{N}])General(?:$|[^\p{L}\p{N}])|सामान्य वर्ग/iu.test(trimmedText)) {
    profile.category = 'General';
    extractedFields.push('category');
  }

  // -------------------------------------------------------------
  // 7. Land Holding Extraction
  // -------------------------------------------------------------
  const landMatch = trimmedText.match(/(\d+(?:\.\d+)?)\s*(?:acres?|acre|hectares?|hectare|एकड़|ਏਕੜ|बीघा)\s*(?:of\s*)?(?:land|zameen|zameen|ज़मीन|ਜ਼ਮੀਨ)?/iu) ||
                    trimmedText.match(/(?:ज़मीन|ਜ਼ਮੀਨ|जमीन|land)[^\d]*?(\d+(?:\.\d+)?)\s*(?:acres?|acre|एकड़|ਏਕੜ)/iu);

  if (landMatch && landMatch[1]) {
    const parsedLand = parseFloat(landMatch[1]);
    if (!isNaN(parsedLand) && parsedLand >= 0) {
      profile.landHolding = parsedLand;
      extractedFields.push('landHolding');
    }
  }

  // -------------------------------------------------------------
  // 8. Employment Status Extraction
  // -------------------------------------------------------------
  if (/self[\s-]*employed|स्वयं\s*रोजगार|खुद\s*का\s*काम/iu.test(trimmedText)) {
    profile.employmentStatus = 'self_employed';
    extractedFields.push('employmentStatus');
  } else if (/(?:^|[^\p{L}\p{N}])unemployed(?:$|[^\p{L}\p{N}])|बेरोजगार|ਬੇਰੋਜ਼ਗਾਰ/iu.test(trimmedText)) {
    profile.employmentStatus = 'unemployed';
    extractedFields.push('employmentStatus');
  }

  // -------------------------------------------------------------
  // 9. Disability Status Extraction
  // -------------------------------------------------------------
  if (/disability|disabled|विकलांग|दिव्यांग|ਅਪਾਹਜ/iu.test(trimmedText)) {
    const pctMatch = trimmedText.match(/(\d{1,2})%\s*(?:disability|विकलांगता)/iu);
    if (pctMatch) {
      profile.disabilityStatus = `${pctMatch[1]}% or more disability`;
    } else {
      profile.disabilityStatus = true;
    }
    extractedFields.push('disabilityStatus');
  }

  // -------------------------------------------------------------
  // 10. Crop Identification (Agricultural profiling)
  // -------------------------------------------------------------
  const CROPS_MAP = [
    { name: 'Wheat', regex: /\b(wheat|gehu|gehun)\b|गेहूं|कनक|ਕਣਕ/iu },
    { name: 'Paddy / Rice', regex: /\b(paddy|rice|dhaan|chawal)\b|धान|चावल|ਝੋਨਾ|ਚੌਲ/iu },
    { name: 'Cotton', regex: /\b(cotton|kapas|narma)\b|कपास|नर्मा|ਨਰਮਾ/iu },
    { name: 'Mustard', regex: /\b(mustard|sarson)\b|सरसों|ਰਾਈ|ਸਰ੍ਹੋਂ/iu },
    { name: 'Sugarcane', regex: /\b(sugarcane|ganna)\b|गन्ना|ਗੰਨਾ/iu },
    { name: 'Maize', regex: /\b(maize|makka|corn)\b|मक्का|ਮੱਕੀ/iu },
    { name: 'Bajra', regex: /\b(bajra|millet)\b|बाजरा|ਬਾਜਰਾ/iu },
    { name: 'Potato', regex: /\b(potato|potatoes|aloo)\b|आलू|ਆਲੂ/iu },
    { name: 'Pulses', regex: /\b(pulses|dal|daal|gram|chana)\b|दाल|चना|ਦਾਲ/iu }
  ];

  const identifiedCrops = [];
  for (const crop of CROPS_MAP) {
    if (crop.regex.test(trimmedText)) {
      identifiedCrops.push(crop.name);
    }
  }
  if (identifiedCrops.length > 0) {
    profile.cropType = identifiedCrops.join(', ');
    profile.crops = identifiedCrops;
    extractedFields.push('cropType');
  }

  return {
    language,
    profile,
    extractedFields,
    uncertainFields
  };
}

module.exports = {
  extractUserProfile,
  STATE_MAP
};
