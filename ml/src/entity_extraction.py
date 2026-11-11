# -*- coding: utf-8 -*-
"""
YojanaSathi ML Intelligence Pipeline — Multilingual Entity Extraction
Extracts structured citizen parameters from English, Hindi, Punjabi, and Hinglish.
Enforces domain validation (valid Indian states, age boundaries, income conversion).
"""

import re
from typing import Dict, Any, List

INDIAN_STATES = {
    "punjab": "Punjab", "ਪੰਜਾਬ": "Punjab", "पंजाब": "Punjab",
    "haryana": "Haryana", "ਹਰਿਆਣਾ": "Haryana", "हरियाणा": "Haryana",
    "delhi": "Delhi", "ਦਿੱਲੀ": "Delhi", "दिल्ली": "Delhi",
    "uttar pradesh": "Uttar Pradesh", "up": "Uttar Pradesh", "उत्तर प्रदेश": "Uttar Pradesh", "ਯੂਪੀ": "Uttar Pradesh",
    "rajasthan": "Rajasthan", "ਰਾਜਸਥਾਨ": "Rajasthan", "राजस्थान": "Rajasthan",
    "bihar": "Bihar", "ਬਿਹਾਰ": "Bihar", "बिहार": "Bihar",
    "maharashtra": "Maharashtra", "ਮਹਾਰਾਸ਼ਟਰ": "Maharashtra", "महाराष्ट्र": "Maharashtra",
    "gujarat": "Gujarat", "ਗੁਜਰਾਤ": "Gujarat", "गुजरात": "Gujarat",
    "madhya pradesh": "Madhya Pradesh", "mp": "Madhya Pradesh", "मध्य प्रदेश": "Madhya Pradesh",
    "karnataka": "Karnataka", "कर्नाटक": "Karnataka",
    "tamil nadu": "Tamil Nadu", "तमिलनाडु": "Tamil Nadu",
    "kerala": "Kerala", "केरल": "Kerala",
    "west bengal": "West Bengal", "पश्चिम बंगाल": "West Bengal",
    "odisha": "Odisha", "ओडिशा": "Odisha",
    "assam": "Assam", "असम": "Assam",
    "jharkhand": "Jharkhand", "झारखंड": "Jharkhand",
    "chhattisgarh": "Chhattisgarh", "छत्तीसगढ़": "Chhattisgarh",
    "himachal pradesh": "Himachal Pradesh", "हिमाचल प्रदेश": "Himachal Pradesh", "ਹਿਮਾਚਲ": "Himachal Pradesh",
    "uttarakhand": "Uttarakhand", "उत्तराखंड": "Uttarakhand",
    "jammu and kashmir": "Jammu and Kashmir", "जम्मू और कश्मीर": "Jammu and Kashmir"
}

OCCUPATIONS = {
    "farmer": "farmer", "किसान": "farmer", "ਕਿਸਾਨ": "farmer", "khedoot": "farmer", "kisaan": "farmer",
    "student": "student", "छात्र": "student", "छात्रा": "student", "विद्यार्थੀ": "student", "ਵਿਦਿਆਰਥੀ": "student",
    "artisan": "artisan", "कारीगर": "artisan", "ਦਸਤਕਾਰ": "artisan", "shilpkar": "artisan",
    "weaver": "weaver", "बुनकर": "weaver", "ਜੁਲਾਹਾ": "weaver", "bunkar": "weaver",
    "unorganized worker": "unorganized_worker", "मजदूर": "unorganized_worker", "ਮਜ਼ਦੂਰ": "unorganized_worker", "labourer": "unorganized_worker",
    "unemployed": "unemployed", "बेरोजगार": "unemployed", "ਬੇਰੁਜ਼ਗਾਰ": "unemployed", "job seeker": "unemployed",
    "shopkeeper": "entrepreneur", "दुकानदार": "entrepreneur", "ਦੁਕਾਨਦਾਰ": "entrepreneur", "businessman": "entrepreneur",
    "teacher": "teacher", "शिक्षक": "teacher", "ਅਧਿਆਪਕ": "teacher"
}

CROPS = {
    "wheat": "Wheat", "गेहूं": "Wheat", "कनक": "Wheat", "ਕਣਕ": "Wheat", "gehun": "Wheat",
    "paddy": "Paddy", "धान": "Paddy", "चावल": "Paddy", "ਝੋਨਾ": "Paddy", "jhona": "Paddy", "rice": "Paddy",
    "cotton": "Cotton", "कपास": "Cotton", "ਨਰਮਾ": "Cotton", "ਕਪਾਹ": "Cotton", "kapas": "Cotton",
    "mustard": "Mustard", "सरसों": "Mustard", "ਸਰ੍ਹੋਂ": "Mustard", "sarson": "Mustard",
    "sugarcane": "Sugarcane", "गन्ना": "Sugarcane", "ਗੰਨਾ": "Sugarcane",
    "maize": "Maize", "मक्का": "Maize", "ਮੱਕੀ": "Maize"
}

CATEGORIES = {
    "sc": "SC", "scheduled caste": "SC", "अनुसूचित जाति": "SC", "ਐਸ.ਸੀ.": "SC",
    "st": "ST", "scheduled tribe": "ST", "अनुसूचित जनजाति": "ST", "ਐਸ.ਟੀ.": "ST",
    "obc": "OBC", "other backward class": "OBC", "अन्य पिछड़ा वर्ग": "OBC", "ਓ.ਬੀ.ਸੀ.": "OBC",
    "ews": "EWS", "economically weaker": "EWS", "आर्थिक रूप से कमजोर": "EWS",
    "general": "General", "सामान्य": "General", "ਜਨਰਲ": "General"
}

def extract_entities(text: str, language: str = "en") -> Dict[str, Any]:
    """Extracts citizen parameters with deterministic rule validation."""
    if not text:
        return {}

    t = text.lower()
    profile = {}
    confidence = {}

    # 1. State Extraction
    for kw, canon in INDIAN_STATES.items():
        if re.search(r'\b' + re.escape(kw) + r'\b', t, re.UNICODE):
            profile["state"] = canon
            confidence["state"] = 0.98
            break

    # 2. Age Extraction (1 to 120)
    age_matches = (
        re.findall(r'(?:age is|i am|i\'m|age:?)\s+(?:a\s+)?(\d{1,3})', t) or
        re.findall(r'(\d{1,3})\s*(?:[-–\s])\s*years?(?:[-–\s])\s*old', t) or
        re.findall(r'(\d{1,3})\s*(?:years?\s*old|वर्षीय|ਸਾਲਾ|years|yrs)', t) or
        re.findall(r'(?:उम्र|आयु|ਉਮਰ|साल|ਸਾਲ)\s*[:=]?\s*(\d{1,3})', t) or
        re.findall(r'(\d{1,3})\s*(?:साल|ਸਾਲ)', t)
    )
    for m in age_matches:
        try:
            val = int(m)
            if 1 <= val <= 115:
                profile["age"] = val
                confidence["age"] = 0.95
                break
        except ValueError:
            pass

    # 3. Occupation Extraction
    for kw, canon in OCCUPATIONS.items():
        if re.search(r'\b' + re.escape(kw) + r'\b', t, re.UNICODE):
            profile["occupation"] = canon
            confidence["occupation"] = 0.95
            break

    # 4. Landholding Extraction (acres/hectares)
    land_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:acres?|एकड़|ਏਕੜ|bigha|hectares?)', t)
    if land_match:
        try:
            profile["landHolding"] = float(land_match.group(1))
            confidence["landHolding"] = 0.92
        except ValueError:
            pass

    # 5. Crop Type Extraction
    matched_crops = []
    for kw, canon in CROPS.items():
        if re.search(r'\b' + re.escape(kw) + r'\b', t, re.UNICODE):
            if canon not in matched_crops:
                matched_crops.append(canon)
    if matched_crops:
        profile["cropType"] = matched_crops[0]
        profile["crops"] = matched_crops
        confidence["cropType"] = 0.95

    # 6. Annual Income Extraction
    income_match = re.search(r'(?:income|income is|आय|ਆਮਦਨ|kamai)\s*[:=]?\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|हजार|ਹਜ਼ਾਰ|thousand|k)?', t) or \
                   re.search(r'(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|हजार|ਹਜ਼ਾਰ)\s*(?:income|आय|ਆਮਦਨ)', t)
    if income_match:
        try:
            raw_val = float(income_match.group(1))
            multiplier = income_match.group(2) or ""
            if any(k in multiplier for k in ["lakh", "lakhs", "lac"]):
                profile["annualIncome"] = int(raw_val * 100000)
            elif any(k in multiplier for k in ["हजार", "ਹਜ਼ਾਰ", "thousand", "k"]):
                profile["annualIncome"] = int(raw_val * 1000)
            else:
                profile["annualIncome"] = int(raw_val)
            confidence["annualIncome"] = 0.92
        except ValueError:
            pass

    # 7. Category Extraction
    for kw, canon in CATEGORIES.items():
        if re.search(r'\b' + re.escape(kw) + r'\b', t, re.UNICODE):
            profile["category"] = canon
            confidence["category"] = 0.96
            break

    # 8. Gender Extraction
    if re.search(r'\b(female|woman|girl|महिला|स्त्री|ਔਰਤ|ਲੜਕੀ)\b', t):
        profile["gender"] = "female"
        confidence["gender"] = 0.96
    elif re.search(r'\b(male|man|boy|पुरुष|मर्द|ਪੁਰਸ਼)\b', t):
        profile["gender"] = "male"
        confidence["gender"] = 0.96

    # 9. Disability Extraction
    if re.search(r'\b(disability|disabled|handicap|divyang|दिव्यांग|ਵਿਕਲਾਂਗ|ਅੰਗਹੀਣ)\b', t):
        profile["disabilityStatus"] = True
        confidence["disabilityStatus"] = 0.95

    # Identify missing core fields based on occupation
    missing_fields = []
    if "state" not in profile:
        missing_fields.append("state")
    if profile.get("occupation") == "farmer":
        if "landHolding" not in profile:
            missing_fields.append("landHolding")
        if "cropType" not in profile:
            missing_fields.append("cropType")
    if "age" not in profile:
        missing_fields.append("age")
    if "annualIncome" not in profile:
        missing_fields.append("annualIncome")

    return {
        "profile": profile,
        "confidence": confidence,
        "missing_fields": missing_fields
    }

if __name__ == "__main__":
    test_inputs = [
        "I am a 35-year-old farmer from Punjab owning 3 acres growing wheat with annual income 2.5 lakh.",
        "मैं 21 साल की छात्रा हूँ, उत्तर प्रदेश से और मुझे कॉलेज स्कॉलरशिप चाहिए।",
        "ਮੈਂ ਪੰਜਾਬ ਦਾ 65 ਸਾਲ ਦਾ ਬਜ਼ੁਰਗ ਹਾਂ ਅਤੇ ਮੇਰੀ ਕੋਈ ਪੈਨਸ਼ਨ ਨਹੀਂ ਹੈ।"
    ]
    for inp in test_inputs:
        print(inp)
        print(extract_entities(inp))
        print("-" * 60)

