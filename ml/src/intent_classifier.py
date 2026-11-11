# -*- coding: utf-8 -*-
"""
YojanaSathi ML Intelligence Pipeline — Intent Classifier Wrapper
Provides standalone predict_intent interface for the 12-class model.
"""

from predict import analyze_citizen_query, get_model

def classify_intent(text: str) -> dict:
    """Classifies user intent into one of 12 citizen welfare categories."""
    result = analyze_citizen_query(text)
    return {
        "intent": result["primary_intent"],
        "confidence": result["intent_confidence"],
        "top_probabilities": result["top_probabilities"],
        "language": result["language"]
    }

if __name__ == "__main__":
    test_cases = [
        "Need scholarship for paying my engineering college semester fee",
        "मुझे 60 वर्ष की आयु में बुढ़ापा पेंशन का फॉर्म भरना है",
        "ਖੇਤ ਵਿੱਚ ਸੋਲਰ ਪੰਪ ਲਗਾਉਣ ਲਈ ਸਬਸਿਡੀ ਸਕੀਮ",
        "Mudra loan bina collateral ke business start karne ke liye kaise milega"
    ]
    for tc in test_cases:
        print(tc)
        print(classify_intent(tc))
        print("-" * 50)

