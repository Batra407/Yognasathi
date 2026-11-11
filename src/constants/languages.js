export const SUPPORTED_LANGUAGES = [
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिंदी",
    status: "active",
    flag: "🇮🇳",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    status: "active",
    flag: "🇬🇧",
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    status: "active",
    flag: "🇮🇳",
  },
];

export const PLACEHOLDER_LANGUAGES = [
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    status: "coming_soon",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    status: "coming_soon",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    status: "coming_soon",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    status: "coming_soon",
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    status: "coming_soon",
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    status: "coming_soon",
  },
  {
    code: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    status: "coming_soon",
  },
];

export const ALL_LANGUAGES = [...SUPPORTED_LANGUAGES, ...PLACEHOLDER_LANGUAGES];
