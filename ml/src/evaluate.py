# -*- coding: utf-8 -*-
"""
YojanaSathi ML Intelligence Pipeline — Comprehensive Evaluation Module
Evaluates the production model checkpoint against the test dataset.
Generates accuracy, macro F1, per-class F1, and per-language metrics.
"""

import json
import os
import joblib
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix

def run_evaluation():
    base_dir = os.path.dirname(os.path.dirname(__file__))
    model_path = os.path.join(base_dir, "models", "intent_classifier_12class.joblib")
    test_path  = os.path.join(base_dir, "datasets", "test", "test.json")

    if not os.path.exists(model_path):
        print(f"Error: Model not found at {model_path}. Run train.py first.")
        return

    with open(test_path, "r", encoding="utf-8") as f:
        test_data = json.load(f)

    artifact = joblib.load(model_path)
    vec = artifact["vectorizer"]
    clf = artifact["classifier"]
    classes = artifact["classes"]

    X_test = [s["text"] for s in test_data]
    y_test = [s["label"] for s in test_data]
    langs_test = [s.get("lang", "en") for s in test_data]

    X_test_vec = vec.transform(X_test)
    y_pred = clf.predict(X_test_vec)

    acc = accuracy_score(y_test, y_pred)
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_test, y_pred, average="macro", zero_division=0)

    print("=" * 70)
    print("YOJANASATHI ML MODEL EVALUATION SUMMARY")
    print("=" * 70)
    print(f"Model Architecture: {artifact['model_name']}")
    print(f"Test Samples:       {len(X_test)}")
    print(f"Test Accuracy:      {acc * 100:.2f}%")
    print(f"Macro Precision:    {p_macro * 100:.2f}%")
    print(f"Macro Recall:       {r_macro * 100:.2f}%")
    print(f"Macro F1 Score:     {f1_macro * 100:.2f}%")
    print("=" * 70)

    print("\nPer-Language Performance:")
    for lang in sorted(list(set(langs_test))):
        sub_idx = [i for i, l in enumerate(langs_test) if l == lang]
        sub_true = [y_test[i] for i in sub_idx]
        sub_pred = [y_pred[i] for i in sub_idx]
        sub_acc = accuracy_score(sub_true, sub_pred)
        sub_f1 = precision_recall_fscore_support(sub_true, sub_pred, average="weighted", zero_division=0)[2]
        print(f"  {lang.upper():<8}: Samples={len(sub_idx):<3} | Accuracy={sub_acc*100:6.2f}% | F1={sub_f1*100:6.2f}%")

    return {
        "accuracy": acc,
        "macro_f1": f1_macro,
        "macro_precision": p_macro,
        "macro_recall": r_macro
    }

if __name__ == "__main__":
    run_evaluation()

