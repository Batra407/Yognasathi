# -*- coding: utf-8 -*-
"""
YojanaSathi 2.0 — Enhanced Multilingual NER Sequence Tagger Training Pipeline
Extracts 8 Citizen Profile Entities:
- AGE (B-AGE, I-AGE)
- STATE (B-STATE, I-STATE)
- OCCUPATION (B-OCCUPATION, I-OCCUPATION)
- LAND (B-LAND, I-LAND)
- CROP (B-CROP, I-CROP)  <-- NEW & REQUIRED for Agricultural Scheme Matching
- INCOME (B-INCOME, I-INCOME)
- CATEGORY (B-CATEGORY, I-CATEGORY)
- GENDER (B-GENDER)
- Outside (O)

Features:
- Subword n-gram prefixes & suffixes
- Unicode script recognition (Devanagari, Gurmukhi, Latin)
- Bidirectional token context window (-2, -1, +1, +2)
- Strict held-out evaluation on unseen test split
- Entity-level Precision, Recall, and F1 breakdown
"""

import json
import os
import re
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction import DictVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, precision_recall_fscore_support

def detect_token_script(word):
    if re.search(r'[\u0900-\u097F]', word):
        return 'devanagari'
    if re.search(r'[\u0A00-\u0A7F]', word):
        return 'gurmukhi'
    if re.search(r'[a-zA-Z]', word):
        return 'latin'
    if re.search(r'[0-9]', word):
        return 'digit'
    return 'other'

def word_to_features(tokens, i):
    word = tokens[i]
    script = detect_token_script(word)

    features = {
        "bias": 1.0,
        "word.lower()": word.lower(),
        "script": script,
        "length": len(word),
        "word.isdigit()": word.isdigit(),
        "word.istitle()": word.istitle(),
        "prefix_1": word[:1],
        "prefix_2": word[:2],
        "prefix_3": word[:3],
        "suffix_1": word[-1:],
        "suffix_2": word[-2:],
        "suffix_3": word[-3:],
    }

    # Left Context (-1)
    if i > 0:
        prev_word = tokens[i - 1]
        features.update({
            "-1:word.lower()": prev_word.lower(),
            "-1:script": detect_token_script(prev_word),
            "-1:isdigit": prev_word.isdigit(),
        })
    else:
        features["BOS"] = True

    # Left Context (-2)
    if i > 1:
        prev2_word = tokens[i - 2]
        features["-2:word.lower()"] = prev2_word.lower()

    # Right Context (+1)
    if i < len(tokens) - 1:
        next_word = tokens[i + 1]
        features.update({
            "+1:word.lower()": next_word.lower(),
            "+1:script": detect_token_script(next_word),
            "+1:isdigit": next_word.isdigit(),
        })
    else:
        features["EOS"] = True

    # Right Context (+2)
    if i < len(tokens) - 2:
        next2_word = tokens[i + 2]
        features["+2:word.lower()"] = next2_word.lower()

    return features

def train():
    print("=" * 75)
    print("YOJANASATHI 2.0 — MULTILINGUAL NER SEQUENCE TAGGER (ENHANCED)")
    print("=" * 75)

    dataset_path = os.path.join(os.path.dirname(__file__), "data", "ner_dataset.json")
    with open(dataset_path, "r", encoding="utf-8") as f:
        sentences = json.load(f)

    print(f"Total annotated sentences: {len(sentences)}")

    # Split on sentence level to prevent token leakage across train/test!
    train_sentences, test_sentences = train_test_split(
        sentences, test_size=0.20, random_state=42
    )
    print(f"Train sentences: {len(train_sentences)} | Test sentences: {len(test_sentences)}")

    # Extract features for train set
    X_train_features = []
    y_train = []
    for item in train_sentences:
        toks = item["tokens"]
        tags = item["tags"]
        for i in range(len(toks)):
            X_train_features.append(word_to_features(toks, i))
            y_train.append(tags[i])

    # Extract features for test set
    X_test_features = []
    y_test = []
    for item in test_sentences:
        toks = item["tokens"]
        tags = item["tags"]
        for i in range(len(toks)):
            X_test_features.append(word_to_features(toks, i))
            y_test.append(tags[i])

    print(f"Train tokens: {len(X_train_features)} | Held-out test tokens: {len(X_test_features)}")
    unique_tags = sorted(list(set(y_train + y_test)))
    print(f"Target BIO Entity Tags ({len(unique_tags)}): {unique_tags}")

    vec = DictVectorizer(sparse=True)
    X_train_vec = vec.fit_transform(X_train_features)
    X_test_vec  = vec.transform(X_test_features)
    print(f"DictVectorizer feature dimension: {X_train_vec.shape[1]} features")

    # Train Classifier
    print("Training Logistic Regression Sequence Classifier (L2, C=3.0)...")
    clf = LogisticRegression(C=3.0, max_iter=2000, random_state=42)
    clf.fit(X_train_vec, y_train)

    # Evaluate on held-out test set
    y_pred = clf.predict(X_test_vec)
    acc = accuracy_score(y_test, y_pred)
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average="macro", zero_division=0)
    p_wt, r_wt, f1_wt, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)

    print("\n" + "-" * 75)
    print(f"HELD-OUT TEST TOKEN ACCURACY:    {acc * 100:.2f}%")
    print(f"HELD-OUT TEST MACRO F1:          {f1_macro * 100:.2f}%")
    print(f"HELD-OUT TEST MACRO PRECISION:   {p_macro * 100:.2f}%")
    print(f"HELD-OUT TEST MACRO RECALL:      {r_macro * 100:.2f}%")
    print(f"HELD-OUT TEST WEIGHTED F1:       {f1_wt * 100:.2f}%")
    print("-" * 75)

    print("\nENTITY-LEVEL CLASSIFICATION REPORT (HELD-OUT TEST TOKENS):")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Save artifact
    out_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "ner_model.joblib")

    artifact = {
        "vectorizer": vec,
        "classifier": clf,
        "tags": unique_tags,
        "metrics": {
            "test_accuracy": float(acc),
            "test_macro_f1": float(f1_macro),
            "test_weighted_f1": float(f1_wt)
        }
    }
    joblib.dump(artifact, out_path)
    print(f"\nSaved production NER model artifact to: {out_path}")
    print("=" * 75)

if __name__ == "__main__":
    train()
