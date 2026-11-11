# -*- coding: utf-8 -*-
"""
YojanaSathi ML Intelligence Pipeline — Unified Prediction & Analysis Engine
Executes complete Stage A -> Stage B -> Stage C -> Stage D inference pipeline:
Stage A: Language Identification & Normalization
Stage B: ML 12-Class Intent Classification (scikit-learn champion model)
Stage C: Multilingual Citizen Entity Extraction & Validation
Stage D: Contextual Follow-up Question Generation for Missing Data
"""

import os
import joblib
from typing import Dict, Any
from language_detection import identify_language
from entity_extraction import extract_entities
from preprocessing import normalize_text

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "intent_classifier_12class.joblib")

_model_artifact = None

def get_model():
    global _model_artifact
    if _model_artifact is None:
        if os.path.exists(MODEL_PATH):
            _model_artifact = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError(f"Trained intent model not found at {MODEL_PATH}. Run train.py first.")
    return _model_artifact

FOLLOW_UP_PROMPTS = {
    "state": {
        "en": "Which state or Union Territory do you currently reside in?",
        "hi": "आप किस राज्य या केंद्र शासित प्रदेश के निवासी हैं? (जैसे पंजाब या हरियाणा)",
        "pa": "ਤੁਸੀਂ ਕਿਸ ਰਾਜ ਦੇ ਵਸਨੀਕ ਹੋ? (ਜਿਵੇਂ ਕਿ ਪੰਜਾਬ ਜਾਂ ਹਰਿਆਣਾ)"
    },
    "occupation": {
        "en": "What is your current occupation or livelihood? (e.g. farmer, student, artisan, unorganized worker)",
        "hi": "आपका वर्तमान व्यवसाय या आजीविका का साधन क्या है? (जैसे किसान, विद्यार्थी, मजदूर)",
        "pa": "ਤੁਹਾਡਾ ਮੁੱਖ ਕੰਮ ਜਾਂ ਕਿੱਤਾ ਕੀ ਹੈ? (ਜਿਵੇਂ ਕਿਸਾਨ, ਵਿਦਿਆਰਥੀ, ਮਜ਼ਦੂਰ)"
    },
    "age": {
        "en": "What is your age in years?",
        "hi": "आपकी आयु (उम्र) कितने वर्ष है?",
        "pa": "ਤੁਹਾਡੀ ਉਮਰ ਕਿੰਨੇ ਸਾਲ ਹੈ?"
    },
    "landHolding": {
        "en": "How many acres of agricultural land do you own?",
        "hi": "आपके पास कितने एकड़ कृषि योग्य जमीन है?",
        "pa": "ਤੁਹਾਡੇ ਕੋਲ ਖੇਤੀਬਾੜੀ ਲਈ ਕਿੰਨੀ ਜ਼ਮੀਨ ਹੈ (ਏਕੜ ਵਿੱਚ)?"
    },
    "cropType": {
        "en": "Which primary crops do you grow on your land? (e.g. wheat, paddy, mustard)",
        "hi": "आप अपने खेत में मुख्य रूप से कौन सी फसलें उगाते हैं? (जैसे गेहूं, धान, सरसों)",
        "pa": "ਤੁਸੀਂ ਮੁੱਖ ਤੌਰ 'ਤੇ ਕਿਹੜੀਆਂ ਫ਼ਸਲਾਂ ਬੀਜਦੇ ਹੋ? (ਜਿਵੇਂ ਕਣਕ, ਝੋਨਾ, ਨਰਮਾ)"
    },
    "annualIncome": {
        "en": "What is your approximate annual household income?",
        "hi": "आपके परिवार की वार्षिक आय (सालाना कमाई) लगभग कितनी है?",
        "pa": "ਤੁਹਾਡੇ ਪਰਿਵਾਰ ਦੀ ਸਾਲਾਨਾ ਆਮਦਨ ਕਿੰਨੀ ਹੈ?"
    }
}

def analyze_citizen_query(text: str) -> Dict[str, Any]:
    """Runs complete end-to-end ML inference on a citizen inquiry."""
    norm_text = normalize_text(text)
    if not norm_text:
        return {
            "language": "en",
            "primary_intent": "GENERAL_WELFARE",
            "intent_confidence": 0.0,
            "extracted_profile": {},
            "missing_information": ["occupation", "state"],
            "follow_up_question": "How can YojanaSathi assist you with government welfare programs?"
        }

    # 1. Stage A: Language Identification
    lang_info = identify_language(norm_text)
    lang = lang_info["language"]
    lang_key = "hi" if lang in ["hi", "hinglish"] else "pa" if lang == "pa" else "en"

    # 2. Stage B: ML Intent Classification
    model_art = get_model()
    vec = model_art["vectorizer"]
    clf = model_art["classifier"]
    classes = model_art["classes"]

    X_vec = vec.transform([norm_text])
    probs = clf.predict_proba(X_vec)[0] if hasattr(clf, "predict_proba") else None

    if probs is not None:
        top_idx = int(probs.argmax())
        primary_intent = classes[top_idx]
        confidence = round(float(probs[top_idx]), 4)
        top_probs = {cls: round(float(p), 4) for cls, p in sorted(zip(classes, probs), key=lambda x: x[1], reverse=True)[:3]}
    else:
        primary_intent = clf.predict(X_vec)[0]
        confidence = 0.95
        top_probs = {primary_intent: 1.0}

    # 3. Stage C: Entity Extraction & Validation
    entity_result = extract_entities(norm_text, language=lang)
    profile = entity_result["profile"]
    entity_confidence = entity_result["confidence"]
    missing = entity_result["missing_fields"]

    # 4. Stage D: Follow-up Question Generation
    follow_up = None
    if missing:
        first_missing = missing[0]
        follow_up = FOLLOW_UP_PROMPTS.get(first_missing, {}).get(lang_key, f"Could you provide your {first_missing}?")

    return {
        "text": norm_text,
        "language": lang,
        "language_confidence": lang_info["confidence"],
        "primary_intent": primary_intent,
        "intent_confidence": confidence,
        "top_probabilities": top_probs,
        "extracted_profile": profile,
        "entity_confidence": entity_confidence,
        "missing_information": missing,
        "follow_up_question": follow_up
    }

if __name__ == "__main__":
    test_queries = [
        "I am a 35-year-old farmer in Punjab looking for agriculture subsidies.",
        "मेरी उम्र 21 साल है, मैं कॉलेज की छात्रा हूँ और मुझे उच्च शिक्षा छात्रवृत्ति चाहिए।",
        "ਮੈਂ ਪੰਜਾਬ ਦਾ ਵਸਨੀਕ ਹਾਂ ਅਤੇ ਬੁਢਾਪਾ ਪੈਨਸ਼ਨ ਯੋਜਨਾ ਬਾਰੇ ਜਾਣਨਾ ਚਾਹੁੰਦਾ ਹਾਂ।",
        "Main ek dukandar hoon, mujhe Mudra loan chahiye shop expand karne ke liye."
    ]
    for q in test_queries:
        res = analyze_citizen_query(q)
        print(f"QUERY: {q}")
        print(f"INTENT: {res['primary_intent']} ({res['intent_confidence']*100:.1f}%) | LANG: {res['language']}")
        print(f"PROFILE: {res['extracted_profile']}")
        print(f"FOLLOW-UP: {res['follow_up_question']}")
        print("-" * 75)

