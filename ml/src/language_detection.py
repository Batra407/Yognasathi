# -*- coding: utf-8 -*-
"""
YojanaSathi ML Intelligence Pipeline — Language Identification
Classifies citizen utterance language into 'en', 'hi', 'pa', or 'hinglish'.
"""

import re
from preprocessing import detect_script, normalize_text

HINGLISH_VOCABULARY = {
    "mera", "meri", "mere", "mujhe", "hum", "main", "mein", "hoon", "hai", "hain",
    "kisan", "kheti", "yojana", "chahiye", "subsidy", "paise", "paisa", "rupaye",
    "shiksha", "padhai", "college", "vidyarthi", "chhatra", "naukri", "rozgar",
    "kaam", "ghar", "makaan", "swasthya", "ilaj", "bima", "vridha", "budhapa",
    "pension", "bahu", "mahila", "beti", "ladli", "shuru", "vyapar", "dukaan",
    "kise", "kaise", "milega", "aavedan", "karna", "pind", "pinda", "vich", "da",
    "di", "de", "sanun", "tussi", "assi", "kheti"
}

def identify_language(text: str) -> dict:
    """
    Returns language classification with confidence and detected script.
    Output: { "language": "en" | "hi" | "pa" | "hinglish", "confidence": float, "script": str }
    """
    norm = normalize_text(text)
    if not norm:
        return {"language": "en", "confidence": 0.5, "script": "unknown"}

    script = detect_script(norm)

    if script == "devanagari":
        return {"language": "hi", "confidence": 0.98, "script": "devanagari"}
    elif script == "gurmukhi":
        return {"language": "pa", "confidence": 0.98, "script": "gurmukhi"}
    elif script == "hinglish":
        return {"language": "hinglish", "confidence": 0.92, "script": "latin"}
    elif script == "latin":
        tokens = set(re.findall(r'\b[a-z]+\b', norm.lower()))
        matched = tokens.intersection(HINGLISH_VOCABULARY)
        if len(matched) >= 2 or (len(tokens) > 0 and (len(matched) / len(tokens)) >= 0.25):
            return {"language": "hinglish", "confidence": 0.88, "script": "latin"}
        return {"language": "en", "confidence": 0.95, "script": "latin"}
    else:
        # Mixed script handling
        return {"language": "hi", "confidence": 0.75, "script": "mixed"}

if __name__ == "__main__":
    queries = [
        "I am looking for national scholarship schemes for higher education.",
        "मेरी उम्र 65 साल है, क्या मुझे वृद्धावस्था पेंशन मिलेगी?",
        "ਮੈਨੂੰ ਖੇਤੀਬਾੜੀ ਸਬਸਿਡੀ ਅਤੇ ਟਿਊਬਵੈੱਲ ਕੁਨੈਕਸ਼ਨ ਸਕੀਮ ਬਾਰੇ ਜਾਣਕਾਰੀ ਚਾਹੀਦੀ ਹੈ।",
        "Main ek farmer hoon Punjab se, mujhe solar pump lagwane ke liye subsidy chahiye."
    ]
    for q in queries:
        print(identify_language(q))

