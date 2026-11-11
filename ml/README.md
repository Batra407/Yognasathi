# YojanaSathi ML/NLP Intelligence Pipeline — Retraining & Deployment Guide

## 1. Overview & Architecture

The YojanaSathi ML Intelligence pipeline upgrades the voice assistant into a domain-specific conversational intelligence engine for Indian citizen welfare schemes. It executes a 4-stage pipeline:

```
Citizen Audio / Text Input
         │
         ▼
[Stage A: Language & Script Identification] (Indic script detection: Hindi, English, Punjabi, Hinglish)
         │
         ▼
[Stage B: 12-Class Welfare Intent Classification] (Trained Scikit-Learn Multilingual Subword TF-IDF)
         │
         ▼
[Stage C: Citizen Entity Extraction] (Deterministic extraction for age, state, occupation, land, crops, etc.)
         │
         ▼
[Stage D: Follow-up Question Generation] (Contextual missing profile field identification in citizen's language)
         │
         ▼
[Deterministic Database Eligibility Engine] (PostgreSQL 672 verified schemes — zero hallucination)
```

---

## 2. Directory Structure

```
ml/
├── datasets/
│   ├── raw/                 # Raw unlabeled & seed data
│   ├── processed/           # 747 balanced multilingual citizen samples across 12 welfare domains
│   ├── train/               # Train split (70% - 522 samples)
│   ├── validation/          # Validation split (15% - 112 samples)
│   └── test/                # Held-out Test split (15% - 113 samples)
├── models/
│   └── intent_classifier_12class.joblib  # Serialized production pipeline
├── reports/
│   └── evaluation.json      # Held-out test metrics, confusion matrix & per-language breakdown
├── src/
│   ├── preprocessing.py     # Unicode NFKC normalization, whitespace standardizer, Indic tokenization
│   ├── language_detection.py# Fast script & token-level language identification (EN, HI, PA, Hinglish)
│   ├── build_12class_dataset.py # Stratified split generator ensuring ZERO train/test leakage
│   ├── train.py             # Model training, hyperparameter benchmarking & champion selection
│   ├── evaluate.py          # Standalone held-out test evaluation runner
│   ├── entity_extraction.py # Rule-validated multilingual entity extractor
│   ├── predict.py           # Unified 4-stage inference pipeline
│   └── intent_classifier.py # Lightweight wrapper for inference
├── inference_server.py      # FastAPI microservice for high-throughput deployment
└── README.md                # This operational guide
```

---

## 3. Retraining Workflow

### Step 1: Add or Expand Dataset
To add new citizen phrases or regional dialect variations, edit `ml/src/build_12class_dataset.py` in the corresponding welfare domain dictionary:
- `AGRICULTURE_ASSISTANCE`
- `EDUCATION_SCHOLARSHIP`
- `HEALTHCARE_ASSISTANCE`
- `HOUSING_SHELTER`
- `EMPLOYMENT_OPPORTUNITIES`
- `WOMEN_EMPOWERMENT`
- `PENSION_ASSISTANCE`
- `DISABILITY_ASSISTANCE`
- `BUSINESS_ENTREPRENEURSHIP`
- `FINANCIAL_ASSISTANCE`
- `SKILL_DEVELOPMENT`
- `GENERAL_WELFARE`

### Step 2: Rebuild & Stratify Dataset Splits
Run the dataset generator to normalize, deduplicate, and split with zero data leakage:
```bash
python ml/src/build_12class_dataset.py
```

### Step 3: Train Champion Model
Train and benchmark 3 model families (`MultinomialNB`, `SGDClassifier`, `LogisticRegression`) with subword character n-grams (2-5) and word n-grams (1-2):
```bash
python ml/src/train.py
```
The script automatically selects the champion model by validation macro F1 and outputs:
- Production model: `ml/models/intent_classifier_12class.joblib`
- Real held-out evaluation report: `ml/reports/evaluation.json`

### Step 4: Run Independent Evaluation
Verify held-out performance on the 113 unseen test samples:
```bash
python ml/src/evaluate.py
```

### Step 5: Test Realistic Citizen Queries
Validate end-to-end performance against diverse real-world citizen prompts:
```bash
python tests/test_ml_realistic_queries.py
```

---

## 4. Serving & Deployment Options

### Option A: Direct In-Process Serving (Next.js Node.js Engine)
The Next.js application includes an in-process classifier in `src/lib/intentClassifier.js` which performs fast sub-millisecond classification across all 12 welfare domains, maintaining instant response times without external dependencies.

### Option B: FastAPI Microservice (Python Daemon)
For high-scale or centralized multi-node deployments:
```bash
python -m uvicorn ml.inference_server:app --host 0.0.0.0 --port 8000
```
Endpoints provided:
- `GET /health`: Healthcheck and model metadata.
- `POST /predict/intent`: 12-class intent prediction with probability distribution.
- `POST /predict/entities`: Extracted citizen profile and missing fields.
- `POST /predict/analyze`: Complete 4-stage inference pipeline (Language + Intent + Entities + Follow-up).

---

## 5. Security & Privacy Safeguards

1. **Zero Hallucination Grounding**: Scheme recommendations and eligibility evaluations are computed deterministically against PostgreSQL records (`evaluateEligibility`). The ML model only interprets the citizen query; it never generates speculative eligibility verdicts.
2. **Data Minimization**: Voice recordings are never stored on disk or used for training without explicit user consent.
3. **Citizen Profile Correction**: Extracted entities are displayed in an editable badge layout so citizens can correct any misinterpreted attribute at any time.

