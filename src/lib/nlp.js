/**
 * Multilingual NLP Processing Engine
 * Supports English (en), Hindi (hi), Punjabi (pa), Bengali (bn), Marathi (mr),
 * Gujarati (gu), Tamil (ta), Telugu (te), Kannada (kn), Malayalam (ml),
 * Mixed (mixed), and Unknown (unknown).
 * Converts regional Indian languages and natural language English requests into normalized search concepts.
 */

// Common stop words across English, Hindi, Punjabi, Bengali, Marathi, Gujarati, Tamil, Telugu, Kannada, and Malayalam
const STOP_WORDS = new Set([
  // English
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do',
  'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'get', 'got', 'had', 'has', 'have', 'having', 'he', 'help', 'her', 'here',
  'hers', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
  'just', 'like', 'me', 'more', 'most', 'my', 'no', 'nor', 'not', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'our', 'out', 'over', 'own', 'same',
  'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'them',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where',
  'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
  'looking', 'want', 'need', 'seeking', 'find', 'give', 'related', 'please',

  // Hindi (Devanagari)
  'मैं', 'एक', 'हूँ', 'और', 'के', 'लिए', 'चाहता', 'चाहती', 'चाहिए', 'था', 'थी', 'थे',
  'का', 'की', 'को', 'में', 'पर', 'से', 'ने', 'यह', 'वह', 'जो', 'सो', 'इन्हें', 'उन्हें',
  'अपना', 'अपनी', 'अपने', 'मुझे', 'हमें', 'तथा', 'एवं', 'भी', 'ही', 'हो', 'है', 'हैं',

  // Punjabi (Gurmukhi)
  'ਮੈਂ', 'ਇੱਕ', 'ਹਾਂ', 'ਅਤੇ', 'ਤੇ', 'ਦੇ', 'ਲਈ', 'ਚਾਹੁੰਦਾ', 'ਚਾਹੁੰਦੀ', 'ਚਾਹੀਦਾ', 'ਚਾਹੀਦੀ',
  'ਦਾ', 'ਦੀ', 'ਦੇ', 'ਨੇ', 'ਨੂੰ', 'ਵਿੱਚ', 'ਤੇ', 'ਤੋਂ', 'ਇਹ', 'ਉਹ', 'ਜੀ', 'ਵੀ', 'ਹੀ', 'ਹੈ', 'ਹਨ',

  // Bengali (Bengali script)
  'আমার', 'আমি', 'জন্য', 'দরকার', 'চাই', 'একটি', 'এবং', 'বা', 'এর', 'কে', 'তে', 'এ',
  'হয়', 'আছে', 'হবে', 'থেকে', 'সাথে', 'উপর', 'জন্যে', 'একটি', 'করে',

  // Marathi (Devanagari)
  'मला', 'आहे', 'आहेत', 'हवी', 'हवा', 'हवे', 'पाहिजे', 'साठी', 'यांसाठी', 'माझे',
  'माझ्या', 'माझा', 'तुमचे', 'तुमच्या', 'आपले', 'आपल्या', 'आणि', 'किंवा', 'या', 'ती',
  'ते', 'त्या', 'हे', 'झाले', 'करून', 'मिळेल', 'मिळू',

  // Gujarati (Gujarati script)
  'મારે', 'હું', 'માટે', 'જોઈએ', 'અને', 'છે', 'છો', 'હતી', 'હતો', 'મારું', 'તમારું',
  'આ', 'તે', 'થી', 'માં', 'ને', 'જરૂર', 'આપો',

  // Tamil (Tamil script)
  'எனக்கு', 'நான்', 'க்கான', 'வேண்டும்', 'மற்றும்', 'அல்லது', 'இல்', 'உள்ளது', 'ஒரு',
  'இந்த', 'அந்த', 'ஆகிய', 'உடன்', 'இருந்து', 'வேண்டி',

  // Telugu (Telugu script)
  'నాకు', 'నేను', 'కోసం', 'కావాలి', 'మరియు', 'లేదా', 'ఉంది', 'ఒక', 'ఈ', 'ఆ',
  'లో', 'నుండి', 'తో', 'కావాలనుకుంటున్నాను',

  // Kannada (Kannada script)
  'ನನಗೆ', 'ನಾನು', 'ರಿಗಾಗಿ', 'ಗಾಗಿ', 'ಬೇಕು', 'ಮತ್ತು', 'ಅಥವಾ', 'ಇದೆ', 'ಒಂದು', 'ಈ',
  'ಆ', 'ರಲ್ಲಿ', 'ಯಿಂದ', 'ದ', 'ಬೇಕಾಗಿದೆ',

  // Malayalam (Malayalam script)
  'എനിക്ക്', 'ഞാൻ', 'ക്കായി', 'വേണ്ടി', 'വേണം', 'മറ്റും', 'അല്ലെങ്കിൽ', 'ഉണ്ട്', 'ഒരു',
  'ഈ', 'ആ', 'യിൽ', 'നിന്ന്', 'ടെ', 'ആവശ്യമുണ്ട്'
]);

// Indicator words to disambiguate Devanagari script between Marathi and Hindi
const MARATHI_INDICATOR_WORDS = new Set([
  'मला', 'आहे', 'आहेत', 'हवी', 'हवा', 'हवे', 'पाहिजे', 'साठी', 'यांसाठी',
  'शेतकरी', 'शेतकऱ्यांसाठी', 'शेतकऱ्यांना', 'शेतकऱ्याला', 'माझे', 'माझ्या', 'माझा',
  'तुमचे', 'तुमच्या', 'आपले', 'आपल्या', 'कोणते', 'कोणत्या', 'सर्व', 'अशा',
  'कसे', 'काय', 'हे', 'ती', 'ते', 'त्या', 'या', 'यांचे', 'झाले', 'करून', 'मिळेल', 'मिळू'
]);

const HINDI_INDICATOR_WORDS = new Set([
  'मैं', 'मुझे', 'एक', 'हूँ', 'और', 'के', 'लिए', 'चाहता', 'चाहती', 'चाहिए',
  'था', 'थी', 'थे', 'का', 'की', 'को', 'में', 'पर', 'से', 'ने', 'यह', 'वह',
  'जो', 'सो', 'इन्हें', 'उन्हें', 'अपना', 'अपनी', 'अपने', 'हमें', 'तथा',
  'एवं', 'भी', 'ही', 'हो', 'है', 'हैं', 'किसान', 'किसानों', 'कृषि', 'क्या', 'क्यों', 'कैसे', 'कौन'
]);

// Common English words for valid English detection
const COMMON_ENGLISH_WORDS = new Set([
  'i', 'am', 'a', 'an', 'the', 'for', 'and', 'or', 'to', 'in', 'of', 'is', 'are', 'it', 'you',
  'my', 'we', 'they', 'he', 'she', 'this', 'that', 'farmer', 'farmers', 'farming', 'agriculture',
  'scheme', 'schemes', 'government', 'govt', 'support', 'help', 'need', 'want', 'looking',
  'education', 'student', 'students', 'school', 'scholarship', 'job', 'jobs', 'employment',
  'unemployed', 'health', 'medical', 'hospital', 'housing', 'pension', 'women', 'child', 'rural', 'loan'
]);

// Multilingual concept map mapping terms from English, Hindi, Punjabi, Bengali, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, and Hinglish to canonical domain terms
const CONCEPT_MAP = {
  // Agriculture / Farming / Crop / Seed / Fertilizer / Irrigation
  'किसान': ['farmer', 'farming', 'agriculture'],
  'किसानों': ['farmer', 'farming', 'agriculture'],
  'किसानो': ['farmer', 'farming', 'agriculture'],
  'ਕਿਸਾਨ': ['farmer', 'farming', 'agriculture'],
  'ਕਿਸਾਨਾਂ': ['farmer', 'farming', 'agriculture'],
  'কৃষক': ['farmer', 'farming', 'agriculture'],
  'কৃষকদের': ['farmer', 'farming', 'agriculture'],
  'কৃষকের': ['farmer', 'farming', 'agriculture'],
  'চাষী': ['farmer', 'farming', 'agriculture'],
  'চাষীদের': ['farmer', 'farming', 'agriculture'],
  'शेतकरी': ['farmer', 'farming', 'agriculture'],
  'शेतकऱ्यांसाठी': ['farmer', 'farming', 'agriculture'],
  'शेतकऱ्यांना': ['farmer', 'farming', 'agriculture'],
  'शेतकऱ्याला': ['farmer', 'farming', 'agriculture'],
  'ખેડૂત': ['farmer', 'farming', 'agriculture'],
  'ખેડૂતો': ['farmer', 'farming', 'agriculture'],
  'விவசாயி': ['farmer', 'farming', 'agriculture'],
  'விவசாயிகள்': ['farmer', 'farming', 'agriculture'],
  'விவசாயிகளுக்கான': ['farmer', 'farming', 'agriculture'],
  'விவசாயிகளுக்கு': ['farmer', 'farming', 'agriculture'],
  'రైతు': ['farmer', 'farming', 'agriculture'],
  'రైతులు': ['farmer', 'farming', 'agriculture'],
  'రైతుల': ['farmer', 'farming', 'agriculture'],
  'రైతులకు': ['farmer', 'farming', 'agriculture'],
  'ರೈತ': ['farmer', 'farming', 'agriculture'],
  'ರೈತರು': ['farmer', 'farming', 'agriculture'],
  'ರೈತರಿಗಾಗಿ': ['farmer', 'farming', 'agriculture'],
  'ರೈತರಿಗೆ': ['farmer', 'farming', 'agriculture'],
  'കർഷകൻ': ['farmer', 'farming', 'agriculture'],
  'കർഷകർ': ['farmer', 'farming', 'agriculture'],
  'കർഷകർക്കായി': ['farmer', 'farming', 'agriculture'],
  'കർഷകർക്ക്': ['farmer', 'farming', 'agriculture'],
  'कृषि': ['agriculture', 'agricultural', 'farming'],
  'ਖੇਤੀਬਾੜੀ': ['agriculture', 'agricultural', 'farming'],
  'কৃষি': ['agriculture', 'agricultural', 'farming'],
  'શેતી': ['agriculture', 'agricultural', 'farming'],
  'ખેતી': ['agriculture', 'agricultural', 'farming'],
  'விவசாயம்': ['agriculture', 'agricultural', 'farming'],
  'వ్యవసాయం': ['agriculture', 'agricultural', 'farming'],
  'ಕೃಷಿ': ['agriculture', 'agricultural', 'farming'],
  'കൃഷി': ['agriculture', 'agricultural', 'farming'],
  'ਖੇਤੀ': ['farming', 'farmer', 'agriculture'],
  'खेती': ['farming', 'farmer', 'agriculture'],
  'चাষ': ['farming', 'farmer', 'agriculture'],
  'फसल': ['crop', 'crops', 'agriculture'],
  'फसलों': ['crop', 'crops', 'agriculture'],
  'ਫ਼ਸਲ': ['crop', 'crops', 'agriculture'],
  'ਫਸਲ': ['crop', 'crops', 'agriculture'],
  'ਫਸਲਾਂ': ['crop', 'crops', 'agriculture'],
  'ফসল': ['crop', 'crops', 'agriculture'],
  'पिक': ['crop', 'crops', 'agriculture'],
  'पिके': ['crop', 'crops', 'agriculture'],
  'पिकांसाठी': ['crop', 'crops', 'agriculture'],
  'પાક': ['crop', 'crops', 'agriculture'],
  'பயிர்': ['crop', 'crops', 'agriculture'],
  'పంట': ['crop', 'crops', 'agriculture'],
  'ಬೆಳೆ': ['crop', 'crops', 'agriculture'],
  'വിള': ['crop', 'crops', 'agriculture'],
  'बीज': ['seed', 'seeds', 'agriculture'],
  'ਬੀਜ': ['seed', 'seeds', 'agriculture'],
  'বীজ': ['seed', 'seeds', 'agriculture'],
  'बियाणे': ['seed', 'seeds', 'agriculture'],
  'બિયારણ': ['seed', 'seeds', 'agriculture'],
  'விதை': ['seed', 'seeds', 'agriculture'],
  'విత్తనాలు': ['seed', 'seeds', 'agriculture'],
  'ಬೀಜ': ['seed', 'seeds', 'agriculture'],
  'വിത്ത്': ['seed', 'seeds', 'agriculture'],
  'खाद': ['fertilizer', 'agriculture'],
  'সার': ['fertilizer', 'agriculture'],
  'खत': ['fertilizer', 'agriculture'],
  'ખાદ': ['fertilizer', 'agriculture'],
  'ખાતર': ['fertilizer', 'agriculture'],
  'உரம்': ['fertilizer', 'agriculture'],
  'ఎరువులు': ['fertilizer', 'agriculture'],
  'ಗೊಬ್ಬರ': ['fertilizer', 'agriculture'],
  'വളം': ['fertilizer', 'agriculture'],
  'सिंचाई': ['irrigation', 'water', 'agriculture'],
  'ਸਿੰਚਾਈ': ['irrigation', 'water', 'agriculture'],
  'সেচ': ['irrigation', 'water', 'agriculture'],
  'सिंचन': ['irrigation', 'water', 'agriculture'],
  'સિંચાઈ': ['irrigation', 'water', 'agriculture'],
  'பாசனம்': ['irrigation', 'water', 'agriculture'],
  'నీటిపారుదల': ['irrigation', 'water', 'agriculture'],
  'ನೀರಾವರಿ': ['irrigation', 'water', 'agriculture'],
  'ജലസേചനം': ['irrigation', 'water', 'agriculture'],
  'kisan': ['farmer', 'farming', 'agriculture'],
  'krishi': ['agriculture', 'agricultural'],
  'kheti': ['farming', 'farmer'],
  'farmer': ['farmer', 'farming', 'agriculture'],
  'farmers': ['farmer', 'farming', 'agriculture'],
  'farming': ['farming', 'farmer', 'agriculture'],
  'agriculture': ['agriculture', 'agricultural'],
  'agricultural': ['agriculture', 'agricultural'],

  // Scheme / Government / Support / Subsidy / Welfare
  'योजना': ['scheme', 'government'],
  'योजनाएं': ['scheme', 'government'],
  'योजनाओं': ['scheme', 'government'],
  'ਯੋਜਨਾ': ['scheme', 'government'],
  'ਯੋਜਨਾਵਾਂ': ['scheme', 'government'],
  'প্রকল্প': ['scheme', 'government'],
  'প্রকল্পের': ['scheme', 'government'],
  'યોજના': ['scheme', 'government'],
  'યોજનાઓ': ['scheme', 'government'],
  'திட்டம்': ['scheme', 'government'],
  'திட்டங்கள்': ['scheme', 'government'],
  'పథకం': ['scheme', 'government'],
  'పథకాలు': ['scheme', 'government'],
  'ಯೋಜನೆ': ['scheme', 'government'],
  'ಯೋಜನೆಗಳು': ['scheme', 'government'],
  'പദ്ധതി': ['scheme', 'government'],
  'പദ്ധതികൾ': ['scheme', 'government'],
  'ਸਕੀਮ': ['scheme'],
  'स्कीम': ['scheme'],
  'স্কিম': ['scheme'],
  'સ્કીમ': ['scheme'],
  'స్కీమ్': ['scheme'],
  'സ്കീം': ['scheme'],
  'सरकारी': ['government'],
  'ਸਰਕਾਰੀ': ['government'],
  'সরকারি': ['government'],
  'સરકારી': ['government'],
  'అరసు': ['government'],
  'అరసాంగమ్': ['government'],
  'ప్రభుత్వ': ['government'],
  'ಸರ್ಕಾರಿ': ['government'],
  'സർക്കാർ': ['government'],
  'सरकार': ['government'],
  'ਸਰਕਾਰ': ['government'],
  'সরকার': ['government'],
  'સરકાર': ['government'],
  'அரசு': ['government'],
  'அரசாங்கம்': ['government'],
  'ప్రభుత్వం': ['government'],
  'ಸರ್ಕಾರ': ['government'],
  'सहायता': ['support', 'assistance'],
  'ਸਹਾਇਤਾ': ['support', 'assistance'],
  'সাহায্য': ['support', 'assistance'],
  'সহায়তা': ['support', 'assistance'],
  'सहाय्य': ['support', 'assistance'],
  'સહાય': ['support', 'assistance'],
  'உதவி': ['support', 'assistance'],
  'సాయం': ['support', 'assistance'],
  'సహాయం': ['support', 'assistance'],
  'ಸಹಾಯ': ['support', 'assistance'],
  'സഹായം': ['support', 'assistance'],
  'मदद': ['support', 'help'],
  'ਮਦਦ': ['support', 'help'],
  'मदत': ['support', 'help'],
  'ਮਦਦ': ['support', 'help'],
  'सब्सिडी': ['subsidy', 'grant'],
  'ਸਬਸਿਡੀ': ['subsidy', 'grant'],
  'ভর্তুকি': ['subsidy', 'grant'],
  'अनुदान': ['subsidy', 'grant'],
  'સબસિડી': ['subsidy', 'grant'],
  'மானியம்': ['subsidy', 'grant'],
  'సబ్సిడీ': ['subsidy', 'grant'],
  'రాయితి': ['subsidy', 'grant'],
  'ಸಬ್ಸಿಡಿ': ['subsidy', 'grant'],
  'ಅನುದಾನ': ['subsidy', 'grant'],
  'സബ്‌സിഡി': ['subsidy', 'grant'],
  'कल्याण': ['welfare'],
  'ਭਲਾਈ': ['welfare'],
  'কল্যাণ': ['welfare'],
  'કલ્યાણ': ['welfare'],
  'நலன்': ['welfare'],
  'நலத்திட்டம்': ['welfare', 'scheme'],
  'సంక్షేమం': ['welfare'],
  'ಕಲ್ಯಾಣ': ['welfare'],
  'ക്ഷേമം': ['welfare'],
  'scheme': ['scheme'],
  'schemes': ['scheme'],
  'government': ['government'],
  'govt': ['government'],
  'support': ['support'],
  'subsidy': ['subsidy'],
  'welfare': ['welfare'],

  // Education / Student / Scholarship
  'शिक्षा': ['education', 'educational'],
  'ਸਿੱਖਿਆ': ['education', 'educational'],
  'শিক্ষা': ['education', 'educational'],
  'शिक्षण': ['education', 'educational'],
  'શિક્ષણ': ['education', 'educational'],
  'கல்வி': ['education', 'educational'],
  'విద్య': ['education', 'educational'],
  'ಶಿಕ್ಷಣ': ['education', 'educational'],
  'വിദ്യാഭ്യാസം': ['education', 'educational'],
  'छात्र': ['student', 'education'],
  'छात्रा': ['student', 'education'],
  'विद्यार्थी': ['student', 'education'],
  'ਵਿਦਿਆਰਥੀ': ['student', 'education'],
  'ছাত্র': ['student', 'education'],
  'ছাত্রী': ['student', 'education'],
  'শিক্ষার্থী': ['student', 'education'],
  'વિદ્યાર્થી': ['student', 'education'],
  'மாணவர்': ['student', 'education'],
  'மாணவர்கள்': ['student', 'education'],
  'மாணவி': ['student', 'education'],
  'విద్యార్థి': ['student', 'education'],
  'విద్యార్థులు': ['student', 'education'],
  'ವಿದ್ಯಾರ್ಥಿ': ['student', 'education'],
  'ವಿದ್ಯಾರ್ಥಿಗಳು': ['student', 'education'],
  'വിദ്യാർത്ഥി': ['student', 'education'],
  'വിദ്യാർത്ഥികൾ': ['student', 'education'],
  'स्कूल': ['school', 'education'],
  'ਸਕੂਲ': ['school', 'education'],
  'স্কুল': ['school', 'education'],
  'शाळा': ['school', 'education'],
  'શાળા': ['school', 'education'],
  'பள்ளி': ['school', 'education'],
  'పాఠశాల': ['school', 'education'],
  'ಶಾಲೆ': ['school', 'education'],
  'സ്കൂൾ': ['school', 'education'],
  'कॉलेज': ['college', 'education'],
  'ਕਾਲਜ': ['college', 'education'],
  'কলেজ': ['college', 'education'],
  'महाविद्यालय': ['college', 'education'],
  'કોલેજ': ['college', 'education'],
  'கல்லூரி': ['college', 'education'],
  'కళాశాల': ['college', 'education'],
  'ಕಾಲೇಜು': ['college', 'education'],
  'കോളേജ്': ['college', 'education'],
  'छात्रवृत्ति': ['scholarship', 'education'],
  'ਵਜ਼ੀਫਾ': ['scholarship', 'education'],
  'ਸਕਾਲਰਸ਼ਿਪ': ['scholarship', 'education'],
  'বৃত্তি': ['scholarship', 'education'],
  'স্কলারশিপ': ['scholarship', 'education'],
  'शिष्यवृत्ती': ['scholarship', 'education'],
  'શિષ્યવૃત્તિ': ['scholarship', 'education'],
  'સ્કોલરશિપ': ['scholarship', 'education'],
  'உதவித்தொகை': ['scholarship', 'education'],
  'స్కాలర్‌షిప్': ['scholarship', 'education'],
  'ఉపకారవేతనం': ['scholarship', 'education'],
  'ಶಿಷ್ಯವೇತನ': ['scholarship', 'education'],
  'ಸ್ಕಾಲರ್‌ಶಿಪ್': ['scholarship', 'education'],
  'സ്കോളർഷിപ്പ്': ['scholarship', 'education'],
  'student': ['student', 'education'],
  'students': ['student', 'education'],
  'education': ['education', 'educational'],
  'educational': ['education', 'educational'],
  'scholarship': ['scholarship', 'education'],
  'school': ['school', 'education'],

  // Employment / Jobs / Unemployed / Skill / Loan
  'रोजगार': ['employment', 'job'],
  'ਰੋਜ਼ਗਾਰ': ['employment', 'job'],
  'কর্মসংস্থান': ['employment', 'job'],
  'રોજગાર': ['employment', 'job'],
  'வேலைவாய்ப்பு': ['employment', 'job'],
  'ఉపాధి': ['employment', 'job'],
  'ಉದ್ಯೋಗ': ['employment', 'job'],
  'തൊഴിൽ': ['employment', 'job'],
  'नौकरी': ['job', 'employment'],
  'ਨੌਕਰੀ': ['job', 'employment'],
  'চাকরি': ['job', 'employment'],
  'চাকরী': ['job', 'employment'],
  'नोकरी': ['job', 'employment'],
  'નોકરી': ['job', 'employment'],
  'வேலை': ['job', 'employment'],
  'ఉద్యోగం': ['job', 'employment'],
  'ಕೆಲಸ': ['job', 'employment'],
  'ജോലി': ['job', 'employment'],
  'बेरोजगार': ['unemployed', 'employment'],
  'ਬੇਰੋਜ਼ਗਾਰ': ['unemployed', 'employment'],
  'বেকার': ['unemployed', 'employment'],
  'બેરોજગાર': ['unemployed', 'employment'],
  'வேலைவாய்ப்பில்லாதவர்': ['unemployed', 'employment'],
  'வேலையில்லாதவர்': ['unemployed', 'employment'],
  'నిరుద్యోగి': ['unemployed', 'employment'],
  'నిరుద్యోగులు': ['unemployed', 'employment'],
  'ನಿರುದ್ಯೋಗಿ': ['unemployed', 'employment'],
  'ನಿರುದ್ಯೋಗಿಗಳು': ['unemployed', 'employment'],
  'തൊഴിലില്ലാത്തവർ': ['unemployed', 'employment'],
  'തൊഴിലില്ലായ്മ': ['unemployed', 'employment'],
  'काम': ['work', 'employment'],
  'ਕੰਮ': ['work', 'employment'],
  'কাজ': ['work', 'employment'],
  'કામ': ['work', 'employment'],
  'పని': ['work', 'employment'],
  'मजदूर': ['labor', 'worker'],
  'ਮਜ਼ਦੂਰ': ['labor', 'worker'],
  'শ্রমিক': ['labor', 'worker'],
  'कामगार': ['labor', 'worker'],
  'मजूर': ['labor', 'worker'],
  'મજૂર': ['labor', 'worker'],
  'தொழிலாளி': ['labor', 'worker'],
  'కార్మికుడు': ['labor', 'worker'],
  'కార్మికులు': ['labor', 'worker'],
  'ಕಾರ್ಮಿಕ': ['labor', 'worker'],
  'തൊഴിലാളി': ['labor', 'worker'],
  'कौशल': ['skill', 'training'],
  'ਹੁਨਰ': ['skill', 'training'],
  'দক্ষতা': ['skill', 'training'],
  'कौशल्य': ['skill', 'training'],
  'કૌશલ્ય': ['skill', 'training'],
  'திறன்': ['skill', 'training'],
  'నైపుణ్యం': ['skill', 'training'],
  'ಕೌಶಲ್ಯ': ['skill', 'training'],
  'നൈപുണ്യം': ['skill', 'training'],
  'ऋण': ['loan', 'credit'],
  'करज़ा': ['loan', 'credit'],
  'ਕਰਜ਼ਾ': ['loan', 'credit'],
  'ঋণ': ['loan', 'credit'],
  'कर्ज': ['loan', 'credit'],
  'લોન': ['loan', 'credit'],
  'கடன்': ['loan', 'credit'],
  'రుణం': ['loan', 'credit'],
  'సాల': ['loan', 'credit'],
  'ಸಾಲು': ['loan', 'credit'],
  'വായ്പ': ['loan', 'credit'],
  'loan': ['loan'],
  'employment': ['employment', 'job'],
  'job': ['job', 'employment'],
  'jobs': ['job', 'employment'],
  'unemployed': ['unemployed', 'employment'],
  'skill': ['skill', 'training'],

  // Health / Medical / Hospital / Insurance
  'स्वास्थ्य': ['health', 'medical'],
  'ਸਿਹਤ': ['health', 'medical'],
  'স্বাস্থ্য': ['health', 'medical'],
  'आरोग्य': ['health', 'medical'],
  'આરોગ્ય': ['health', 'medical'],
  'சுகாதாரம்': ['health', 'medical'],
  'சுகாதார': ['health', 'medical'],
  'மருத்துவம்': ['health', 'medical'],
  'ఆరోగ్యం': ['health', 'medical'],
  'వైద్యం': ['health', 'medical'],
  'ಆರೋಗ್ಯ': ['health', 'medical'],
  'ವೈದ್ಯಕೀಯ': ['health', 'medical'],
  'ആരോഗ്യം': ['health', 'medical'],
  'इलाज': ['treatment', 'health'],
  'ਇਲਾਜ': ['treatment', 'health'],
  'চিকিৎসা': ['treatment', 'health'],
  'उपचार': ['treatment', 'health'],
  'ઈલાજ': ['treatment', 'health'],
  'સારવાર': ['treatment', 'health'],
  'சிகிச்சை': ['treatment', 'health'],
  'చికిత్స': ['treatment', 'health'],
  'ಚಿಕಿತ್ಸೆ': ['treatment', 'health'],
  'ചികിത്സ': ['treatment', 'health'],
  'अस्पताल': ['hospital', 'health'],
  'ਹਸਪਤਾਲ': ['hospital', 'health'],
  'হাসপাতাল': ['hospital', 'health'],
  'रुग्णालय': ['hospital', 'health'],
  'दवाखाना': ['hospital', 'health'],
  'હોસ્પિટલ': ['hospital', 'health'],
  'மருத்துவமனை': ['hospital', 'health'],
  'ஆసుపత్రి': ['hospital', 'health'],
  'ఆస్పత్రి': ['hospital', 'health'],
  'ಆಸ್ಪತ್ರೆ': ['hospital', 'health'],
  'ആശുപത്രി': ['hospital', 'health'],
  'दवाई': ['medicine', 'health'],
  'ਦਵਾਈ': ['medicine', 'health'],
  'ওষুধ': ['medicine', 'health'],
  'औषध': ['medicine', 'health'],
  'દવા': ['medicine', 'health'],
  'மருந்து': ['medicine', 'health'],
  'మందులు': ['medicine', 'health'],
  'ಔಷಧ': ['medicine', 'health'],
  'മരുന്ന്': ['medicine', 'health'],
  'बीमा': ['insurance', 'health'],
  'ਬੀਮਾ': ['insurance', 'health'],
  'বীমা': ['insurance', 'health'],
  'विमा': ['insurance', 'health'],
  'વીમો': ['insurance', 'health'],
  'காப்பீடு': ['insurance', 'health'],
  'భీమా': ['insurance', 'health'],
  'బీమా': ['insurance', 'health'],
  'ವಿಮೆ': ['insurance', 'health'],
  'ഇൻഷുറൻസ്': ['insurance', 'health'],
  'health': ['health', 'medical'],
  'medical': ['medical', 'health'],
  'hospital': ['hospital'],
  'medicine': ['medicine'],
  'insurance': ['insurance'],

  // Housing / Rural / Sanitation
  'आवास': ['housing', 'home'],
  'ਆਵਾਸ': ['housing', 'home'],
  'আবাসন': ['housing', 'home'],
  'घरकुल': ['housing', 'home'],
  'வீட்டுவசதி': ['housing', 'home'],
  'గృహనిర్మాణం': ['housing', 'home'],
  'ವಸತಿ': ['housing', 'home'],
  'പാർപ്പിടം': ['housing', 'home'],
  'मकान': ['house', 'housing'],
  'ਮਕਾਨ': ['house', 'housing'],
  'মકાન': ['house', 'housing'],
  'घर': ['home', 'housing'],
  'ਘਰ': ['home', 'housing'],
  'বাড়ি': ['home', 'housing'],
  'বাড়ি': ['home', 'housing'],
  'গৃহ': ['home', 'housing'],
  'ઘર': ['home', 'housing'],
  'வீடு': ['home', 'housing'],
  'ఇల్లు': ['home', 'housing'],
  'గృహం': ['home', 'housing'],
  'ಮನೆ': ['home', 'housing'],
  'ಗೃಹ': ['home', 'housing'],
  'വീട്': ['home', 'housing'],
  'ഭവനം': ['home', 'housing'],
  'ग्रामीण': ['rural'],
  'ਪੇਂਡੂ': ['rural'],
  'গ্রামীণ': ['rural'],
  'ગ્રામીણ': ['rural'],
  'கிராமப்புற': ['rural'],
  'గ్రామీణ': ['rural'],
  'ಗ್ರಾಮೀಣ': ['rural'],
  'ഗ്രാമീണ': ['rural'],
  'शौचालय': ['sanitation', 'toilet'],
  'শৌচাগার': ['sanitation', 'toilet'],
  'કચરામુક્ત': ['sanitation'],
  'கழிப்பறை': ['sanitation', 'toilet'],
  'మరుగుదొడ్డి': ['sanitation', 'toilet'],
  'ಶೌಚಾಲಯ': ['sanitation', 'toilet'],
  'ശൗചാലയം': ['sanitation', 'toilet'],
  'housing': ['housing', 'home'],
  'rural': ['rural'],

  // Women / Children / Senior / Pension
  'महिला': ['women', 'woman', 'female'],
  'महिना': ['women', 'woman', 'female'],
  'महिमा': ['women', 'woman', 'female'],
  'ਮਹਿਲਾ': ['women', 'woman', 'female'],
  'ਔਰਤ': ['women', 'woman', 'female'],
  'মহিলা': ['women', 'woman', 'female'],
  'নারী': ['women', 'woman', 'female'],
  'स्त्री': ['women', 'woman', 'female'],
  'સ્ત્રી': ['women', 'woman', 'female'],
  'பெண்கள்': ['women', 'woman', 'female'],
  'பெண்': ['women', 'woman', 'female'],
  'మహిళలు': ['women', 'woman', 'female'],
  'మహిళ': ['women', 'woman', 'female'],
  'స్త్రీ': ['women', 'woman', 'female'],
  'ಮಹಿಳೆ': ['women', 'woman', 'female'],
  'ಮಹಿಳೆಯರು': ['women', 'woman', 'female'],
  'ಸ್ತ್ರೀ': ['women', 'woman', 'female'],
  'സ്ത്രീകൾ': ['women', 'woman', 'female'],
  'സ്ത്രീ': ['women', 'woman', 'female'],
  'വനിത': ['women', 'woman', 'female'],
  'बेटी': ['daughter', 'girl'],
  'ਧੀ': ['daughter', 'girl'],
  'মেয়ে': ['daughter', 'girl'],
  'मुलगी': ['daughter', 'girl'],
  'દીકરી': ['daughter', 'girl'],
  'மகள்': ['daughter', 'girl'],
  'கூతురు': ['daughter', 'girl'],
  'అమ్మాయి': ['daughter', 'girl'],
  'ಮಗಳು': ['daughter', 'girl'],
  'മകൾ': ['daughter', 'girl'],
  'बच्चा': ['child'],
  'बच्चे': ['children'],
  'ਬੱਚਾ': ['child'],
  'ਬੱਚੇ': ['children'],
  'শিশু': ['child'],
  'बालक': ['child'],
  'બાળક': ['child'],
  'બાળકો': ['children'],
  'குழந்தை': ['child'],
  'குழந்தைகள்': ['children'],
  'పిల్లలు': ['children'],
  'పాప': ['child'],
  'ಮಗು': ['child'],
  'ಮಕ್ಕಳು': ['children'],
  'കുട്ടി': ['child'],
  'കുട്ടികൾ': ['children'],
  'बुजुर्ग': ['elderly', 'senior'],
  'ਬਜ਼ੁਰਗ': ['elderly', 'senior'],
  'ज्येष्ठ': ['elderly', 'senior'],
  'વૃદ્ધ': ['elderly', 'senior'],
  'முதியோர்': ['elderly', 'senior'],
  'వృద్ధులు': ['elderly', 'senior'],
  'ಹಿರಿಯ': ['elderly', 'senior'],
  'വയോജന': ['elderly', 'senior'],
  'पेंशन': ['pension'],
  'ਪੈਨਸ਼ਨ': ['pension'],
  'পেনশন': ['pension'],
  'पेन्शन': ['pension'],
  'પેન્શન': ['pension'],
  'ஓய்வூதியம்': ['pension'],
  'పింఛను': ['pension'],
  'ఫించను': ['pension'],
  'పింఛను': ['pension'],
  'ಪಿಂಚಣಿ': ['pension'],
  'പെൻഷൻ': ['pension'],
  'pension': ['pension'],
  'women': ['women', 'woman'],
  'woman': ['women', 'woman']
};

// Dominant domain concept categories for distinct keyword extraction
const PRIMARY_DOMAIN_KEYWORDS = [
  'farmer', 'agriculture', 'farming', 'student', 'education', 'scholarship',
  'job', 'employment', 'unemployed', 'health', 'medical', 'housing', 'pension', 'women',
  'child', 'skill', 'loan', 'rural', 'fertilizer', 'seed', 'irrigation'
];

/**
 * Detects the language of the input text.
 * Returns 'hi', 'pa', 'bn', 'mr', 'gu', 'ta', 'te', 'kn', 'ml', 'en', 'mixed', or 'unknown'.
 */
function detectLanguage(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return 'unknown';
  }

  const str = text.trim();

  const devanagariMatches = str.match(/[\u0900-\u0963\u0966-\u097F]/g) || [];
  const bengaliMatches    = str.match(/[\u0980-\u09FF]/g) || [];
  const gurmukhiMatches   = str.match(/[\u0A00-\u0A7F]/g) || [];
  const gujaratiMatches   = str.match(/[\u0A80-\u0AFF]/g) || [];
  const tamilMatches      = str.match(/[\u0B80-\u0BFF]/g) || [];
  const teluguMatches     = str.match(/[\u0C00-\u0C7F]/g) || [];
  const kannadaMatches    = str.match(/[\u0C80-\u0CFF]/g) || [];
  const malayalamMatches  = str.match(/[\u0D00-\u0D7F]/g) || [];
  const latinMatches      = str.match(/[a-zA-Z]/g) || [];

  const devCount = devanagariMatches.length;
  const benCount = bengaliMatches.length;
  const gurCount = gurmukhiMatches.length;
  const gujCount = gujaratiMatches.length;
  const tamCount = tamilMatches.length;
  const telCount = teluguMatches.length;
  const kanCount = kannadaMatches.length;
  const malCount = malayalamMatches.length;
  const latCount = latinMatches.length;

  const scriptCounts = [
    { code: 'dev', count: devCount },
    { code: 'bn',  count: benCount },
    { code: 'pa',  count: gurCount },
    { code: 'gu',  count: gujCount },
    { code: 'ta',  count: tamCount },
    { code: 'te',  count: telCount },
    { code: 'kn',  count: kanCount },
    { code: 'ml',  count: malCount },
    { code: 'lat', count: latCount }
  ];

  const activeScripts = scriptCounts.filter(s => s.count > 0);

  if (activeScripts.length === 0) {
    return 'unknown';
  }

  // Mixed language checks: characters from more than one script family present
  if (activeScripts.length > 1) {
    return 'mixed';
  }

  const singleScript = activeScripts[0].code;

  if (singleScript === 'bn') return 'bn';
  if (singleScript === 'pa') return 'pa';
  if (singleScript === 'gu') return 'gu';
  if (singleScript === 'ta') return 'ta';
  if (singleScript === 'te') return 'te';
  if (singleScript === 'kn') return 'kn';
  if (singleScript === 'ml') return 'ml';

  if (singleScript === 'dev') {
    // Devanagari script: Distinguish Marathi ('mr') from Hindi ('hi')
    const words = str.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter(w => w.length > 0);
    let marathiScore = 0;
    let hindiScore = 0;

    for (const w of words) {
      if (MARATHI_INDICATOR_WORDS.has(w)) marathiScore++;
      if (HINDI_INDICATOR_WORDS.has(w)) hindiScore++;
    }

    if (marathiScore > hindiScore) {
      return 'mr';
    }
    if (hindiScore > marathiScore) {
      return 'hi';
    }
    // Default to 'hi' for Devanagari when no explicit Marathi indicators exist
    return 'hi';
  }

  if (singleScript === 'lat') {
    const words = str.toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter(w => w.length > 0);
    const hasKnownWord = words.some(w => COMMON_ENGLISH_WORDS.has(w) || CONCEPT_MAP[w]);
    if (hasKnownWord) {
      return 'en';
    }
    return 'unknown';
  }

  return 'unknown';
}

/**
 * Normalizes input text into search concepts and extracts primary domain keywords.
 */
function extractKeywordsAndNormalize(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return {
      normalizedQuery: '',
      keywords: []
    };
  }

  const tokens = text
    .toLowerCase()
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter(t => t.length > 0);

  const conceptSet = new Set();
  const keywordSet = new Set();

  for (const token of tokens) {
    // Check direct concept mappings
    if (CONCEPT_MAP[token]) {
      for (const mappedTerm of CONCEPT_MAP[token]) {
        conceptSet.add(mappedTerm);
        if (PRIMARY_DOMAIN_KEYWORDS.includes(mappedTerm)) {
          keywordSet.add(mappedTerm);
        }
      }
    } else if (!STOP_WORDS.has(token) && token.length > 1) {
      // Valid non-stop word token
      conceptSet.add(token);
      if (PRIMARY_DOMAIN_KEYWORDS.includes(token)) {
        keywordSet.add(token);
      }
    }
  }

  const normalizedTerms = Array.from(conceptSet);
  let keywords = Array.from(keywordSet);

  // Fallback: If no primary domain keyword was flagged, pick top non-stop concepts
  if (keywords.length === 0 && normalizedTerms.length > 0) {
    keywords = normalizedTerms.filter(t => !['scheme', 'government', 'support', 'help'].includes(t)).slice(0, 3);
  }

  const normalizedQuery = normalizedTerms.join(' ');

  return {
    normalizedQuery,
    keywords
  };
}

module.exports = {
  detectLanguage,
  extractKeywordsAndNormalize,
  STOP_WORDS,
  CONCEPT_MAP
};
