# -*- coding: utf-8 -*-
"""
YojanaSathi ML Intelligence Pipeline — Model Training & Benchmark
Trains and evaluates 12-class multilingual intent classification.
Evaluates 3 model families:
1. Multinomial Naive Bayes (Baseline)
2. Calibrated SGD Linear Classifier (Modified Huber loss)
3. Regularized Logistic Regression (L2 penalty, balanced weights)

Selects the champion model based on held-out test Macro F1.
"""

import json
import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import FeatureUnion
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix
)

def train_and_evaluate():
    print("=" * 80)
    print("YOJANASATHI 2.0 — MULTILINGUAL 12-CLASS INTENT CLASSIFIER TRAINING")
    print("=" * 80)

    base_dir = os.path.dirname(os.path.dirname(__file__))
    train_path = os.path.join(base_dir, "datasets", "train", "train.json")
    val_path   = os.path.join(base_dir, "datasets", "validation", "val.json")
    test_path  = os.path.join(base_dir, "datasets", "test", "test.json")

    with open(train_path, "r", encoding="utf-8") as f:
        train_data = json.load(f)
    with open(val_path, "r", encoding="utf-8") as f:
        val_data = json.load(f)
    with open(test_path, "r", encoding="utf-8") as f:
        test_data = json.load(f)

    X_train = [s["text"] for s in train_data]
    y_train = [s["label"] for s in train_data]
    X_val   = [s["text"] for s in val_data]
    y_val   = [s["label"] for s in val_data]
    X_test  = [s["text"] for s in test_data]
    y_test  = [s["label"] for s in test_data]
    langs_test = [s.get("lang", "en") for s in test_data]

    classes = sorted(list(set(y_train)))
    print(f"Dataset summary: Train={len(X_train)} | Val={len(X_val)} | Test={len(X_test)}")
    print(f"12 Intent Classes: {classes}")

    # Feature Union: Word n-grams (1,2) + Subword Char n-grams (2,5)
    word_vec = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=10000,
        sublinear_tf=True
    )
    char_vec = TfidfVectorizer(
        analyzer="char_wb",
        ngram_range=(2, 5),
        max_features=25000,
        sublinear_tf=True
    )
    union = FeatureUnion([
        ("word", word_vec),
        ("char", char_vec)
    ])

    print("\nFitting multilingual subword & token TF-IDF representation...")
    X_train_vec = union.fit_transform(X_train)
    X_val_vec   = union.transform(X_val)
    X_test_vec  = union.transform(X_test)
    print(f"Extracted feature vocabulary space: {X_train_vec.shape[1]} dimensions")

    # ── Model 1: Multinomial Naive Bayes Baseline ──
    print("\n[Candidate 1] Training Multinomial Naive Bayes...")
    nb = MultinomialNB(alpha=0.1)
    nb.fit(X_train_vec, y_train)
    y_val_pred_nb = nb.predict(X_val_vec)
    nb_val_f1 = precision_recall_fscore_support(y_val, y_val_pred_nb, average="macro", zero_division=0)[2]
    print(f"  -> Validation Macro F1: {nb_val_f1 * 100:.2f}%")

    # ── Model 2: Calibrated Linear SGD (Modified Huber) ──
    print("\n[Candidate 2] Training Calibrated SGDClassifier (Modified Huber loss)...")
    sgd = SGDClassifier(loss="modified_huber", penalty="l2", alpha=1e-4, max_iter=2500, random_state=42)
    sgd.fit(X_train_vec, y_train)
    y_val_pred_sgd = sgd.predict(X_val_vec)
    sgd_val_f1 = precision_recall_fscore_support(y_val, y_val_pred_sgd, average="macro", zero_division=0)[2]
    print(f"  -> Validation Macro F1: {sgd_val_f1 * 100:.2f}%")

    # ── Model 3: L2 Regularized Logistic Regression (Balanced) ──
    print("\n[Candidate 3] Training Logistic Regression (C=3.5, balanced class weights)...")
    lr = LogisticRegression(C=3.5, max_iter=2500, random_state=42, class_weight="balanced")
    lr.fit(X_train_vec, y_train)
    y_val_pred_lr = lr.predict(X_val_vec)
    lr_val_f1 = precision_recall_fscore_support(y_val, y_val_pred_lr, average="macro", zero_division=0)[2]
    print(f"  -> Validation Macro F1: {lr_val_f1 * 100:.2f}%")

    # Select champion on validation set
    models = [
        ("Multinomial Naive Bayes", nb, nb_val_f1),
        ("Calibrated SGDClassifier (Modified Huber)", sgd, sgd_val_f1),
        ("Logistic Regression (L2 Balanced)", lr, lr_val_f1)
    ]
    models.sort(key=lambda x: x[2], reverse=True)
    champion_name, champion_clf, champion_val_f1 = models[0]
    print(f"\n=> CHAMPION MODEL SELECTED: {champion_name} (Val Macro F1: {champion_val_f1 * 100:.2f}%)")

    # Final Strict Evaluation on HELD-OUT TEST SET
    print("\n" + "=" * 80)
    print("FINAL RIGOROUS EVALUATION ON UNSEEN HELD-OUT TEST SET (109 SAMPLES)")
    print("=" * 80)

    y_test_pred = champion_clf.predict(X_test_vec)
    test_acc = accuracy_score(y_test, y_test_pred)
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_test_pred, average="macro", zero_division=0)
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(y_test, y_test_pred, average="weighted", zero_division=0)

    print(f"Held-out Test Accuracy:        {test_acc * 100:.2f}%")
    print(f"Held-out Test Macro F1:        {f1_macro * 100:.2f}%")
    print(f"Held-out Test Macro Precision: {p_macro * 100:.2f}%")
    print(f"Held-out Test Macro Recall:    {r_macro * 100:.2f}%")
    print(f"Held-out Test Weighted F1:     {f1_weighted * 100:.2f}%")

    print("\nPER-CLASS DETAILED TEST BREAKDOWN:")
    per_class_report = classification_report(y_test, y_test_pred, target_names=classes, output_dict=True, zero_division=0)
    print(classification_report(y_test, y_test_pred, target_names=classes, zero_division=0))

    # Per-Language Metrics
    print("\nPER-LANGUAGE PERFORMANCE BREAKDOWN:")
    unique_langs = sorted(list(set(langs_test)))
    lang_breakdown = {}
    for l in unique_langs:
        sub_indices = [i for i, code in enumerate(langs_test) if code == l]
        if sub_indices:
            sub_y_true = [y_test[i] for i in sub_indices]
            sub_y_pred = [y_test_pred[i] for i in sub_indices]
            sub_acc = accuracy_score(sub_y_true, sub_y_pred)
            sub_f1 = precision_recall_fscore_support(sub_y_true, sub_y_pred, average="weighted", zero_division=0)[2]
            lang_breakdown[l] = {
                "samples": len(sub_indices),
                "accuracy": round(float(sub_acc), 4),
                "f1_score": round(float(sub_f1), 4)
            }
            print(f"  Language: {l.upper():<8} | Samples: {len(sub_indices):<3} | Accuracy: {sub_acc*100:6.2f}% | F1: {sub_f1*100:6.2f}%")

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_test_pred, labels=classes)
    cm_list = cm.tolist()

    # Save artifact
    out_models_dir = os.path.join(base_dir, "models")
    os.makedirs(out_models_dir, exist_ok=True)
    model_artifact_path = os.path.join(out_models_dir, "intent_classifier_12class.joblib")

    artifact = {
        "model_name": champion_name,
        "classes": classes,
        "vectorizer": union,
        "classifier": champion_clf,
        "metrics": {
            "test_accuracy": round(float(test_acc), 4),
            "test_macro_f1": round(float(f1_macro), 4),
            "test_macro_precision": round(float(p_macro), 4),
            "test_macro_recall": round(float(r_macro), 4),
            "per_language": lang_breakdown
        }
    }
    joblib.dump(artifact, model_artifact_path)
    print(f"\nSaved production model artifact to: {model_artifact_path}")

    # Save detailed JSON evaluation report
    out_reports_dir = os.path.join(base_dir, "reports")
    os.makedirs(out_reports_dir, exist_ok=True)
    report_path = os.path.join(out_reports_dir, "evaluation.json")

    report_data = {
        "status": "TRAINED",
        "timestamp": "2026-11-05T15:30:00Z",
        "selected_model": champion_name,
        "total_dataset_size": len(train_data) + len(val_data) + len(test_data),
        "train_samples": len(train_data),
        "validation_samples": len(val_data),
        "test_samples": len(test_data),
        "intent_classes_count": len(classes),
        "intent_classes": classes,
        "supported_languages": ["en", "hi", "pa", "hinglish"],
        "metrics": {
            "accuracy": round(float(test_acc), 4),
            "macro_precision": round(float(p_macro), 4),
            "macro_recall": round(float(r_macro), 4),
            "macro_f1": round(float(f1_macro), 4),
            "weighted_f1": round(float(f1_weighted), 4)
        },
        "per_class": per_class_report,
        "per_language": lang_breakdown,
        "confusion_matrix": {
            "labels": classes,
            "matrix": cm_list
        }
    }

    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report_data, f, ensure_ascii=False, indent=2)

    print(f"Saved evaluation report to: {report_path}")
    print("=" * 80)
    return report_data

if __name__ == "__main__":
    train_and_evaluate()

