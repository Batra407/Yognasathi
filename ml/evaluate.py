# -*- coding: utf-8 -*-
"""
YojanaSathi 2.0 — Comprehensive ML Model Audit and Evaluation Suite
Runs independent, rigorous evaluation of trained Intent Classifier and NER Sequence Tagger
with reproducible train/test splits, zero train/test leakage, and per-language metrics.
"""

import os
import json
import joblib
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support
from train_ner import word_to_features

def evaluate_models():
    base_dir = os.path.dirname(__file__)
    models_dir = os.path.join(base_dir, "models")
    data_dir = os.path.join(base_dir, "data")

    intent_model_path = os.path.join(models_dir, "intent_classifier.joblib")
    ner_model_path = os.path.join(models_dir, "ner_model.joblib")

    print("=" * 80)
    print("YOJANASATHI 2.0 — COMPREHENSIVE ML AUDIT & REPRODUCIBILITY REPORT")
    print("=" * 80)

    # 1. INTENT MODEL AUDIT
    if os.path.exists(intent_model_path):
        intent_art = joblib.load(intent_model_path)
        vec = intent_art["vectorizer"]
        clf = intent_art["classifier"]
        classes = intent_art["classes"]

        with open(os.path.join(data_dir, "intent_dataset.json"), "r", encoding="utf-8") as f:
            intent_data = json.load(f)

        texts = [item["text"] for item in intent_data]
        labels = [item["label"] for item in intent_data]
        langs = [item.get("lang", "en") for item in intent_data]

        # Re-create the exact held-out 20% test split
        indices = np.arange(len(texts))
        train_idx, test_idx = train_test_split(
            indices, test_size=0.20, random_state=42, stratify=labels
        )
        X_test = [texts[i] for i in test_idx]
        y_test = [labels[i] for i in test_idx]
        langs_test = [langs[i] for i in test_idx]

        X_test_vec = vec.transform(X_test)
        y_pred = clf.predict(X_test_vec)

        acc = accuracy_score(y_test, y_pred)
        p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average="macro", zero_division=0)
        p_wt, r_wt, f1_wt, _ = precision_recall_fscore_support(y_test, y_pred, average="weighted", zero_division=0)

        print("\n[PART 1] INTENT CLASSIFICATION AUDIT (HELD-OUT TEST SET ONLY — ZERO LEAKAGE)")
        print(f"Algorithm:           {intent_art.get('model_name', 'Logistic Regression')}")
        print(f"Held-out Test Size:  {len(X_test)} samples ({len(X_test)/len(texts)*100:.1f}% of total {len(texts)})")
        print(f"Test Accuracy:       {acc * 100:.2f}%")
        print(f"Test Macro F1:       {f1_macro * 100:.2f}%")
        print(f"Test Macro Precision:{p_macro * 100:.2f}%")
        print(f"Test Macro Recall:   {r_macro * 100:.2f}%")
        print(f"Test Weighted F1:    {f1_wt * 100:.2f}%")

        print("\nPer-Language Accuracy & F1 Breakdown:")
        for l in sorted(list(set(langs_test))):
            sub_ids = [i for i, lc in enumerate(langs_test) if lc == l]
            if sub_ids:
                sub_yt = [y_test[i] for i in sub_ids]
                sub_yp = [y_pred[i] for i in sub_ids]
                s_acc = accuracy_score(sub_yt, sub_yp)
                s_f1 = precision_recall_fscore_support(sub_yt, sub_yp, average="weighted", zero_division=0)[2]
                print(f"  * {l.upper():<9}: Accuracy = {s_acc*100:5.2f}% | F1 = {s_f1*100:5.2f}% ({len(sub_ids)} samples)")

        print("\nPer-Class Intent Classification Report:")
        print(classification_report(y_test, y_pred, zero_division=0))
    else:
        print("[!] Intent classifier model artifact not found.")

    # 2. NER MODEL AUDIT
    if os.path.exists(ner_model_path):
        ner_art = joblib.load(ner_model_path)
        dict_vec = ner_art["vectorizer"]
        ner_clf = ner_art["classifier"]

        with open(os.path.join(data_dir, "ner_dataset.json"), "r", encoding="utf-8") as f:
            sentences = json.load(f)

        # Sentence-level split to prevent token leakage
        train_sents, test_sents = train_test_split(
            sentences, test_size=0.20, random_state=42
        )

        X_test_features = []
        y_test_ner = []
        for item in test_sents:
            toks = item["tokens"]
            tags = item["tags"]
            for i in range(len(toks)):
                X_test_features.append(word_to_features(toks, i))
                y_test_ner.append(tags[i])

        X_test_ner_vec = dict_vec.transform(X_test_features)
        y_pred_ner = ner_clf.predict(X_test_ner_vec)

        acc_ner = accuracy_score(y_test_ner, y_pred_ner)
        p_m, r_m, f1_m, _ = precision_recall_fscore_support(y_test_ner, y_pred_ner, average="macro", zero_division=0)
        p_w, r_w, f1_w, _ = precision_recall_fscore_support(y_test_ner, y_pred_ner, average="weighted", zero_division=0)

        print("\n[PART 2] NER SEQUENCE TAGGER AUDIT (HELD-OUT TEST SET ONLY — ZERO LEAKAGE)")
        print(f"Held-out Sentences:  {len(test_sents)} (Tokens: {len(X_test_features)})")
        print(f"Token-Level Accuracy:{acc_ner * 100:.2f}%")
        print(f"Macro F1 Score:      {f1_m * 100:.2f}%")
        print(f"Macro Precision:     {p_m * 100:.2f}%")
        print(f"Macro Recall:        {r_m * 100:.2f}%")
        print(f"Weighted F1 Score:   {f1_w * 100:.2f}%")

        print("\nEntity-Level BIO Tag Classification Report:")
        print(classification_report(y_test_ner, y_pred_ner, zero_division=0))
    else:
        print("[!] NER model artifact not found.")

    print("=" * 80)

if __name__ == "__main__":
    evaluate_models()
