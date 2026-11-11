# -*- coding: utf-8 -*-
"""
Realistic Citizen Query Evaluation Test Suite
Testing Section 10 realistic queries across 12 domains, multilingual varieties,
entity extraction, missing info, and ambiguous inputs.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "ml", "src"))
from predict import analyze_citizen_query

REALISTIC_TEST_CASES = [
    {
        "domain": "Agriculture",
        "query": "I am a 35-year-old farmer from Punjab. I need help with agricultural equipment.",
        "expected_intent": "AGRICULTURE_ASSISTANCE",
        "expected_lang": "en",
        "expected_profile": {"occupation": "farmer", "age": 35, "state": "Punjab"}
    },
    {
        "domain": "Education",
        "query": "I am a college student and want to know about scholarships.",
        "expected_intent": "EDUCATION_SCHOLARSHIP",
        "expected_lang": "en",
        "expected_profile": {"occupation": "student"}
    },
    {
        "domain": "Healthcare",
        "query": "I need financial assistance for medical treatment.",
        "expected_intent": "HEALTHCARE_ASSISTANCE",
        "expected_lang": "en",
        "expected_profile": {}
    },
    {
        "domain": "Housing",
        "query": "I live in a rural area and need housing assistance.",
        "expected_intent": "HOUSING_SHELTER",
        "expected_lang": "en",
        "expected_profile": {}
    },
    {
        "domain": "Employment",
        "query": "I am unemployed and looking for government skill development support.",
        "expected_intent": "SKILL_DEVELOPMENT",
        "expected_lang": "en",
        "expected_profile": {"occupation": "unemployed"}
    },
    {
        "domain": "Women Entrepreneurship",
        "query": "I want to start a small business. Are there government assistance programmes?",
        "expected_intent": "BUSINESS_ENTREPRENEURSHIP",
        "expected_lang": "en",
        "expected_profile": {}
    },
    {
        "domain": "Hindi Farmer",
        "query": "मैं उत्तर प्रदेश का किसान हूं और मुझे खेती के लिए सरकारी सहायता चाहिए।",
        "expected_intent": "AGRICULTURE_ASSISTANCE",
        "expected_lang": "hi",
        "expected_profile": {"occupation": "farmer", "state": "Uttar Pradesh"}
    },
    {
        "domain": "Punjabi Pension",
        "query": "ਮੈਂ ਪੰਜਾਬ ਦਾ 65 ਸਾਲ ਦਾ ਬਜ਼ੁਰਗ ਹਾਂ ਅਤੇ ਮੈਨੂੰ ਬੁਢਾਪਾ ਪੈਨਸ਼ਨ ਯੋਜਨਾ ਦੀ ਲੋੜ ਹੈ।",
        "expected_intent": "PENSION_ASSISTANCE",
        "expected_lang": "pa",
        "expected_profile": {"age": 65, "state": "Punjab"}
    },
    {
        "domain": "Hinglish Scholarship",
        "query": "Main Haryana se hoon aur mujhe education scholarship ke baare mein jaana hai.",
        "expected_intent": "EDUCATION_SCHOLARSHIP",
        "expected_lang": "hinglish",
        "expected_profile": {"state": "Haryana"}
    }
]

def run_tests():
    passed = 0
    total = len(REALISTIC_TEST_CASES)
    print("=" * 80)
    print("YOJANASATHI ML — REALISTIC CITIZEN QUERY EVALUATION TEST SUITE")
    print("=" * 80)

    for idx, tc in enumerate(REALISTIC_TEST_CASES, start=1):
        q = tc["query"]
        res = analyze_citizen_query(q)
        intent = res["primary_intent"]
        lang = res["language"]
        profile = res["extracted_profile"]
        missing = res["missing_information"]
        follow_up = res["follow_up_question"]

        intent_ok = (intent == tc["expected_intent"])
        lang_ok = (lang == tc["expected_lang"]) or (tc["expected_lang"] == "hinglish" and lang in ["hinglish", "en"])
        
        # Profile match
        profile_ok = True
        for k, v in tc["expected_profile"].items():
            if profile.get(k) != v:
                profile_ok = False
                break

        test_passed = intent_ok and lang_ok and profile_ok
        if test_passed:
            passed += 1
            status = "PASS"
        else:
            status = "FAIL"

        print(f"[{status}] Case {idx}: {tc['domain']}")
        print(f"       Query: \"{q}\"")
        print(f"       Intent: {intent} (Expected: {tc['expected_intent']}) - Match: {intent_ok}")
        print(f"       Lang: {lang} (Expected: {tc['expected_lang']}) - Match: {lang_ok}")
        print(f"       Profile: {profile} - Match: {profile_ok}")
        print(f"       Missing: {missing}")
        print(f"       Follow-up: {follow_up}")
        print("-" * 80)

    print(f"\nFINAL RESULT: {passed}/{total} Passed ({passed/total*100:.1f}%)")
    print("=" * 80)
    return passed == total

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)

