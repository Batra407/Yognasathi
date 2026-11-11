# -*- coding: utf-8 -*-
"""
YojanaSathi ML Intelligence Pipeline — Preprocessing & Text Normalization
Handles Indic Unicode normalization, script detection, subword tokenization, and cleaning.
"""

import re
import unicodedata

# Unicode block ranges
DEVANAGARI_RANGE = (0x0900, 0x097F)
GURMUKHI_RANGE   = (0x0A00, 0x0A7F)

def normalize_text(text: str) -> str:
    """Standardizes Unicode NFKC normalization, whitespace, and punctuation."""
    if not text or not isinstance(text, str):
        return ""
    # Unicode NFKC normalization
    normalized = unicodedata.normalize("NFKC", text.strip())
    # Standardize whitespace
    normalized = re.sub(r'\s+', ' ', normalized)
    # Remove unwanted control characters
    normalized = "".join(ch for ch in normalized if unicodedata.category(ch)[0] != "C" or ch == " ")
    return normalized

def detect_script(text: str) -> str:
    """Detects primary script: devanagari, gurmukhi, latin, or mixed."""
    devanagari_count = 0
    gurmukhi_count = 0
    latin_count = 0

    for ch in text:
        cp = ord(ch)
        if DEVANAGARI_RANGE[0] <= cp <= DEVANAGARI_RANGE[1]:
            devanagari_count += 1
        elif GURMUKHI_RANGE[0] <= cp <= GURMUKHI_RANGE[1]:
            gurmukhi_count += 1
        elif ('a' <= ch <= 'z') or ('A' <= ch <= 'Z'):
            latin_count += 1

    total = devanagari_count + gurmukhi_count + latin_count
    if total == 0:
        return "unknown"

    if devanagari_count / total > 0.4:
        return "devanagari"
    if gurmukhi_count / total > 0.4:
        return "gurmukhi"
    if latin_count / total > 0.6:
        # Check for Hinglish heuristics (common Hinglish stop words)
        hinglish_markers = {"mera", "meri", "mere", "mujhe", "kisan", "yojana", "chahiye", "pension", "karna", "hai", "hoon", "main", "apne", "pind", "pinda"}
        words = set(text.lower().split())
        if len(words.intersection(hinglish_markers)) > 0:
            return "hinglish"
        return "latin"

    return "mixed"

def tokenize_indic(text: str) -> list:
    """Tokenizes Indic and English sentences into meaningful linguistic tokens."""
    norm = normalize_text(text)
    # Split by whitespace and common punctuation while keeping words intact
    tokens = re.findall(r'[\w\u0900-\u097F\u0A00-\u0A7F]+|[^\w\s]', norm, re.UNICODE)
    return [t for t in tokens if t.strip()]

if __name__ == "__main__":
    test_samples = [
        "I am a farmer looking for subsidy.",
        "मैं पंजाब का किसान हूँ और मुझे कृषि सब्सिडी चाहिए।",
        "ਮੈਂ ਪੰਜਾਬ ਦਾ ਕਿਸਾਨ ਹਾਂ ਅਤੇ ਮੈਨੂੰ ਖੇਤੀਬਾੜੀ ਸਬਸਿਡੀ ਚਾਹੀਦੀ ਹੈ।",
        "Main Punjab se hoon aur mujhe tractor subsidy chahiye."
    ]
    for s in test_samples:
        print(f"Text: {s} | Script: {detect_script(s)} | Tokens: {tokenize_indic(s)[:5]}")

