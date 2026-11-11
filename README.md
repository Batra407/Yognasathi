# YojanaSathi (योजना साथी) — Intelligent Multilingual Government Scheme Discovery Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Scikit--Learn](https://img.shields.io/badge/Scikit--Learn-1.8.0-F7931E?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-139%2F139_Passing-success?style=for-the-badge)](https://github.com/)

> **An AI-powered citizen welfare discovery platform bridging the gap between India's 670+ complex government schemes and everyday citizens through multilingual conversational voice assistance, machine learning intent classification, and deterministic eligibility verification.**

---

## 📌 Table of Contents
- [Project Introduction](#-project-introduction)
  - [Problem Statement](#problem-statement)
  - [Our Solution](#our-solution)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Next.js Architectural Deep Dive](#-nextjs-architectural-deep-dive)
- [How the Platform Works](#-how-the-platform-works)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Technical Challenges & Solutions](#-technical-challenges--solutions)
- [Installation & Local Setup](#-installation--local-setup)
- [Environment Variables](#-environment-variables)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Screenshots & Visuals](#-screenshots--visuals)
- [Future Roadmap](#-future-roadmap)
- [Author & Acknowledgments](#-author--acknowledgments)

---

## 📖 Project Introduction

### Problem Statement
India offers hundreds of Central and State Government welfare schemes spanning agriculture, healthcare, higher education, housing, and social security. However, **over 60% of eligible citizens—especially farmers, rural women, daily wagers, and students—fail to receive the benefits they are entitled to**.

The core obstacles include:
1. **Language & Literacy Barriers**: Complex bureaucratic documentation in English or high-register official terminology prevents native speakers of Hindi, Punjabi, and regional dialects from understanding requirements.
2. **Fragmented Information Architecture**: Citizen welfare information is scattered across dozens of central and state departmental portals with inconsistent application procedures.
3. **The AI Hallucination Dilemma**: Generic conversational LLMs frequently invent non-existent welfare programs, fabricate financial subsidies, and cite dead links, misleading vulnerable citizens who require verified governmental facts.

### Our Solution
**YojanaSathi** eliminates these barriers through a dedicated, full-stack conversational intelligence platform:
- **Multilingual Voice Interaction**: Citizens can describe their real-world circumstances in their mother tongue (**Hindi**, **Punjabi**, **English**, or **Hinglish**) via natural voice or text.
- **Custom ML/NLP Intelligence Pipeline**: A 4-stage pipeline classifies inquiries across **12 welfare domains** (95.58% test accuracy), extracts structured demographic attributes (age, state, occupation, land acreage, crop types, income), and generates proactive follow-up questions for missing eligibility criteria.
- **Zero-Hallucination Deterministic Engine**: Every scheme recommendation is strictly grounded against **672 verified PostgreSQL government scheme records** using rule-based evaluation (`evaluateEligibility`), linking directly to official government domains (`.gov.in`, `.nic.in`).

---

## ✨ Key Features

### 🎙️ 1. Multilingual AI Voice Assistant
- Powered by the native browser **Web Speech API** for real-time speech recognition with live audio waveform visualization.
- Interactive, editable transcript panel enabling citizens to review and correct transcribed audio before searching.
- Script-aware language toggling across **English**, **Hindi (हिन्दी)**, and **Punjabi (ਪੰਜਾਬੀ)** with phonetic **Hinglish** normalization.
- **Resilient Fallback**: In case of network drops or speech timeouts, the interface seamlessly switches to keyboard typing mode with zero error overlays.

### 🧠 2. 12-Class Welfare Intent Classification
- Trained Scikit-Learn machine learning pipeline using subword character n-grams (2–5) and word n-grams (1–2) over a 19,414-dimensional feature space.
- Benchmark-tested on held-out unseen test samples:
  - **Overall Accuracy**: `95.58%` | **Macro F1**: `95.36%`
  - **Per-Language F1**: English (`100.0%`), Hindi (`96.95%`), Punjabi (`92.09%`), Hinglish (`88.24%`).
- Classifies inquiries into: `AGRICULTURE_ASSISTANCE`, `EDUCATION_SCHOLARSHIP`, `HEALTHCARE_ASSISTANCE`, `HOUSING_SHELTER`, `EMPLOYMENT_OPPORTUNITIES`, `WOMEN_EMPOWERMENT`, `PENSION_ASSISTANCE`, `DISABILITY_ASSISTANCE`, `BUSINESS_ENTREPRENEURSHIP`, `FINANCIAL_ASSISTANCE`, `SKILL_DEVELOPMENT`, and `GENERAL_WELFARE`.

### 🔍 3. Structured Citizen Profile Extraction & Multi-Turn Memory
- Rule-validated extraction of citizen attributes:
  - **Age**: Numeric parsing from terms like *"35-year-old"*, *"उम्र 24 साल"*, *"65 ਸਾਲ"*.
  - **Geography**: Standardized mapping across all 36 Indian States and Union Territories.
  - **Occupation**: Farmer, college student, artisan, weaver, unorganized worker, unemployed, entrepreneur.
  - **Agriculture**: Landholding acreage/hectares and specific crop varieties (Wheat, Paddy, Mustard, Cotton, etc.).
  - **Socio-Economic**: Category (SC, ST, OBC, EWS, General), annual income, gender, and disability status.
- **Persistent Conversational Memory**: Preserves context across turns, resolves missing information step-by-step, and allows citizens to correct attributes during conversation.

### 🛡️ 4. Deterministic Eligibility Engine (Zero Hallucination)
- Mathematical rule evaluation engine (`evaluateEligibility`) that tests citizen profile data against verified criteria.
- Returns explicit status badges:
  - `ELIGIBLE`: All mandatory verified rules passed.
  - `NOT_ELIGIBLE`: At least one mandatory criterion failed (with clear explanation of which rule failed).
  - `INSUFFICIENT_INFORMATION`: Missing required citizen attributes (prompts follow-up).
- Transparent audit trail displaying government department, source domain verification, and direct official application URL.

### 📊 5. Admin ML Evaluation Dashboard & Sandbox
- Interactive administrative dashboard at `/admin/ml-evaluation`.
- Displays real-time test set metrics, 12-class precision/recall breakdown, 12×12 confusion matrix heatmap, and a live testing sandbox for testing arbitrary multilingual queries.

### 🎬 6. Cinematic Product Storytelling (Scale AI-Inspired)
- Immersive hero section featuring automated background visual transitions (Aerial India $\rightarrow$ Farmer $\rightarrow$ Student $\rightarrow$ Women Entrepreneurs $\rightarrow$ Smart Development).
- Smooth scrolling physics powered by **Lenis** and synchronized scroll animations via **GSAP**.
- Clean, minimalist aesthetic with glassmorphic floating cards and responsive typography.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Programming Languages** | **JavaScript (ES6+)**, **Python 3.12**, **HTML5**, **CSS3**, **SQL** |
| **Frontend Framework** | **Next.js 16.3.5 (App Router)**, **React 19.2.8** |
| **Styling & Design** | **Tailwind CSS v4**, **PostCSS**, **Lucide React** (Icons) |
| **Animation & Motion** | **GSAP 3** (`@gsap/react`), **Lenis Smooth Scroll** |
| **Backend & Routing** | **Next.js Route Handlers** (Node.js runtime), Custom In-Memory Rate Limiter |
| **Database & ORM** | **PostgreSQL 16/18**, **Prisma ORM 5.22.0** |
| **Machine Learning & NLP** | **Scikit-Learn 1.8.0** (MultinomialNB, SGDClassifier, Logistic Regression), **Joblib**, **FastAPI** |
| **DevOps & Containerization** | **Docker** (Multi-Stage Standalone), **Docker Compose**, **GitHub Actions CI/CD** |
| **Testing Infrastructure** | **Jest 30**, **Playwright 1.63** (E2E), **Testing Library**, Custom AI Brain Suite |

---

## ⚡ Next.js Architectural Deep Dive

Next.js was selected as the unified core framework for YojanaSathi rather than a decoupled frontend/backend setup. Here is how Next.js powers the application:

### 1. App Router Architecture (`src/app`)
YojanaSathi utilizes the modern **Next.js App Router** structure, where folder hierarchies directly dictate routing:
- `src/app/page.js`: Public homepage with cinematic video experience and the embedded Unified AI Assistant.
- `src/app/schemes/page.js`: Searchable, filterable directory of 672 verified schemes with pagination.
- `src/app/schemes/[id]/page.js`: Dynamic route rendering comprehensive scheme details, eligibility criteria, and benefits.
- `src/app/departments/page.js`: Directory of 17 citizen welfare departments.
- `src/app/admin/ml-evaluation/page.js`: Live ML evaluation dashboard with confusion matrix.
- `src/app/not-found.jsx` & `src/app/error.jsx`: Custom enterprise error boundaries and 404 pages.

### 2. Server vs. Client Component Segregation
- **Server Components** (Default): Used for static pages, scheme catalog pre-rendering, sitemap generation, and SEO metadata. They run entirely on the server, generating zero client JavaScript overhead.
- **Client Components** (`"use client"`): Isolated specifically to interactive UI islands:
  - `UnifiedYojanaAssistant.jsx` & `AssistantInput.js`: Manages audio streams, Web Speech recognition, microphone visualizer, and local state.
  - `SmoothScrollProvider.jsx`: Binds Lenis and GSAP scroll triggers to the window lifecycle.
  - `MLEvaluationDashboard.jsx`: Fetches evaluation metrics and renders interactive sandbox predictions.

### 3. API Route Handlers (`src/app/api/...`)
Next.js acts as the backend server using Route Handlers (`route.js`) with standard Web Request/Response APIs:
- `POST /api/schemes/assistant`: Core single-turn recommendation endpoint executing Indic normalization, intent classification, profile extraction, and scheme matching.
- `POST /api/ai/chat`: Multi-turn conversational endpoint with persistent PostgreSQL session memory.
- `GET /api/schemes`: Paginated search with department and state filters.
- `GET /api/health`: Enterprise liveness/readiness probe verifying database connectivity, ML model availability, and uptime.
- `GET /api/admin/ml-evaluation`: Serves held-out model evaluation metrics and confusion matrix.

### 4. Full-Stack Data Cohesion
Next.js enables direct database operations via Prisma ORM inside Route Handlers without requiring separate backend services, eliminating CORS configuration, network serialization overhead, and API version mismatches.

---

## 🔄 How the Platform Works

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen / User
    participant UI as Next.js Client UI (Assistant)
    participant API as Route Handler (/api/schemes/assistant)
    participant NLP as ML/NLP Pipeline (Stage A-D)
    participant Engine as Eligibility Engine
    participant DB as PostgreSQL (Prisma ORM)

    Citizen->>UI: Speaks query in Hindi / Punjabi / English (or types)
    UI->>UI: Web Speech API generates real-time transcript & audio waveform
    UI->>API: POST /api/schemes/assistant with query text
    API->>API: Rate Limiter verifies IP quota (sliding window)
    API->>NLP: Stage A: Script & Language Identification
    API->>NLP: Stage B: 12-Class Welfare Intent Classification
    API->>NLP: Stage C: Citizen Profile Extraction (Age, State, Occupation, Land, Crops)
    API->>DB: Query verified schemes matching intent & geography (Prisma)
    DB-->>API: Returns candidate scheme records
    API->>Engine: Evaluate profile against verified eligibility rules
    Engine->>NLP: Stage D: Identify missing required parameters
    NLP-->>API: Generate contextual follow-up prompt in citizen's language
    API-->>UI: Return matched schemes, eligibility badges, and follow-up question
    UI-->>Citizen: Renders scheme cards, eligibility status, and voice response
```

---

## 📂 Project Architecture & Directory Structure

```
nextjsproject/
├── .github/
│   └── workflows/
│       └── ci.yml                # Automated GitHub Actions CI/CD pipeline
├── ml/                           # Dedicated Machine Learning & NLP Pipeline
│   ├── datasets/
│   │   ├── processed/            # 747 balanced citizen welfare samples
│   │   ├── train/                # 70% stratified training split (522 samples)
│   │   ├── validation/           # 15% validation split (112 samples)
│   │   └── test/                 # 15% held-out test split (113 samples)
│   ├── models/
│   │   └── intent_classifier_12class.joblib  # Serialized production champion model
│   ├── reports/
│   │   └── evaluation.json       # Held-out test evaluation report & confusion matrix
│   ├── src/
│   │   ├── preprocessing.py      # Unicode NFKC normalization & Indic tokenization
│   │   ├── language_detection.py # Script & token language identifier (EN, HI, PA, Hinglish)
│   │   ├── build_12class_dataset.py # Stratified dataset generator with zero leakage
│   │   ├── train.py              # Model training, benchmarking & hyperparameter tuning
│   │   ├── evaluate.py           # Standalone held-out evaluation runner
│   │   ├── entity_extraction.py  # Rule-validated multilingual entity parser
│   │   └── predict.py            # Unified 4-stage prediction pipeline
│   ├── inference_server.py       # FastAPI microservice for standalone deployment
│   └── README.md                 # ML retraining & operations guide
├── prisma/
│   ├── schema.prisma             # Relational PostgreSQL schema (Schemes, Departments, Rules, Sessions)
│   └── seed.js                   # Database seed script for 672 verified schemes
├── public/                       # Static public assets, audio scenes, and imagery
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── admin/
│   │   │   └── ml-evaluation/    # Admin ML dashboard page
│   │   ├── api/
│   │   │   ├── admin/            # Admin metrics API endpoints
│   │   │   ├── ai/               # Chat, speech session & transcription routes
│   │   │   ├── health/           # Production health check endpoint
│   │   │   └── schemes/          # Scheme search, assistant & eligibility endpoints
│   │   ├── departments/          # Department catalog pages
│   │   ├── schemes/              # Scheme listing and dynamic detail pages
│   │   ├── error.jsx             # Production error boundary
│   │   ├── global-error.jsx      # Root application fallback
│   │   ├── layout.js             # Root layout with Lenis smooth scroll & metadata
│   │   ├── not-found.jsx         # Custom branded 404 page
│   │   ├── page.js               # Homepage with cinematic experience & assistant
│   │   ├── robots.js             # Dynamic search engine crawler rules
│   │   └── sitemap.js            # Dynamic SEO sitemap generator
│   ├── components/               # Modular UI Components
│   │   ├── animations/           # GSAP & Lenis smooth scroll wrappers
│   │   ├── assistant/            # Single Unified Voice Assistant interface
│   │   ├── layout/               # Navbar, Footer, and navigation links
│   │   ├── presentation/         # Cinematic background visualizer
│   │   ├── schemes/              # Scheme cards, department filters, search bars
│   │   └── ui/                   # Reusable badges, buttons, modals, and tabs
│   └── lib/                      # Core Backend Utilities
│       ├── eligibilityEngine.js  # Deterministic scheme eligibility verification
│       ├── intentClassifier.js   # Fast in-process 12-class intent classification
│       ├── nlp.js                # Multilingual keyword normalization & script detection
│       ├── persistentMemory.js   # Multi-turn conversation session storage
│       ├── prisma.js             # Global Prisma Client instance
│       ├── profileExtractor.js   # Citizen profile parameter extraction
│       └── rateLimit.js          # In-memory sliding-window rate limiter
├── tests/                        # Comprehensive Testing Infrastructure
│   ├── e2e/                      # Playwright end-to-end browser tests
│   ├── integration/              # Backend API dataflow verification
│   ├── regression/               # Full system regression test suite
│   ├── unit/                     # Jest unit tests (NLP, DB, Eligibility Engine)
│   ├── ai_brain_test_suite.js    # Multi-turn AI dialogue & memory test suite
│   └── test_ml_realistic_queries.py # 9-scenario realistic citizen query evaluation
├── Dockerfile                    # Multi-stage production container build
├── docker-compose.yml            # Local / VPS container orchestration
├── next.config.mjs               # Security headers, compression & standalone output
├── package.json                  # Dependencies & scripts
└── PRODUCTION_DEPLOYMENT.md      # Cloud deployment guide (AWS, Vercel, Docker)
```

---

## 🛠️ Technical Challenges & Solutions

### Challenge 1: Browser Web Speech API "Network" Disconnects Triggering Next.js Dev Modals
* **Problem**: In Google Chrome, `webkitSpeechRecognition` relies on Google's cloud speech endpoints. Transient network latency or silence triggers `recognition.onerror` with `event.error = "network"`. Previously, this invoked `console.error`, causing Next.js development mode to trigger an invasive full-screen error modal.
* **Root Cause**: Next.js catches all uncaught client `console.error` invocations and treats them as blocking build/runtime exceptions.
* **Solution**: Refactored error handling in `AssistantInput.js` to catch errors gracefully without throwing to `console.error`. Added an automatic recovery mechanism: when a network timeout occurs, the UI safely calls `recognition.abort()`, switches the input mode to `"type"`, focuses the textarea (`#text-requirement`), and sets a helpful status message.
* **Result**: Zero jarring error overlays; seamless experience for citizens on slower mobile connections.

### Challenge 2: Next.js 16 Turbopack Production CSS Loader Spawn Failure on Windows
* **Problem**: Running `next build` with Turbopack on Windows failed during CSS optimization with an internal error: `node process exited before we could connect to it with exit code: 0` while processing `globals.css`.
* **Root Cause**: An active Turbopack loader inter-process communication bug on Windows operating systems when invoking PostCSS subprocesses during static build compilation.
* **Solution**: Updated the production build script in `package.json` to `"build": "next build --webpack"`. Webpack reliably compiles all 24 static and dynamic routes in 18 seconds without process disconnects.
* **Result**: Rock-solid, predictable builds in local environments, Docker containers, and CI/CD pipelines.

### Challenge 3: Eliminating AI Hallucination in Citizen Welfare Recommendations
* **Problem**: Standard generative LLMs frequently hallucinate eligibility rules (e.g., claiming a 45-year-old farmer is eligible for student scholarships) or fabricate scheme benefits.
* **Root Cause**: Autoregressive token generation generates statistically plausible text rather than mathematically verified facts.
* **Solution**: Separated comprehension from verification:
  1. The ML/NLP pipeline is restricted strictly to **query comprehension** (language detection, intent classification, and parameter extraction).
  2. Scheme eligibility is executed by a **deterministic mathematical engine** (`evaluateEligibility`) that compares extracted numbers (age, income, landholding) directly against verified database criteria stored in PostgreSQL.
* **Result**: 100% factual accuracy. If criteria are not met, the citizen is explicitly notified with verifiable explanations and direct `.gov.in` links.

### Challenge 4: Multi-Turn Conversation Memory with In-Flight Profile Correction
* **Problem**: Citizens rarely provide all information in a single sentence. For example, a citizen might say *"I am a farmer"*, then in turn 2 say *"Punjab"*, and in turn 3 say *"Actually I am 48, not 45"*.
* **Root Cause**: Stateless REST APIs lose context between requests, while simple string concatenation cannot handle profile corrections or overrides.
* **Solution**: Built a persistent session memory module (`persistentMemory.js`) backed by PostgreSQL. It maintains a structured profile state that merges new attributes additively while supporting explicit field overrides when corrections are detected.
* **Result**: Passes all 8 multi-turn tests in `tests/ai_brain_test_suite.js`, including simulated server restart recovery.

### Challenge 5: Indic Script Identification Without External Translation Cloud APIs
* **Problem**: Cloud translation APIs (Google Cloud Translate, Azure Translator) introduce billing costs, API key exposure risks, and significant network latency (200–500ms per keystroke).
* **Root Cause**: Dependency on external third-party cloud microservices for basic linguistic routing.
* **Solution**: Built an in-process script detector and normalizer (`src/lib/nlp.js` and `ml/src/language_detection.py`) that performs Unicode range frequency analysis:
  - Devanagari range (`\u0900-\u097F`) $\rightarrow$ Hindi (`hi`)
  - Gurmukhi range (`\u0A00-\u0A7F`) $\rightarrow$ Punjabi (`pa`)
  - Basic Latin range with Indic phonetics $\rightarrow$ Hinglish (`hinglish`)
* **Result**: Sub-millisecond (0.1ms) execution entirely offline with zero third-party dependencies.

---

## 🚀 Installation & Local Setup

### Prerequisites
- **Node.js**: v18.18+ or v20+
- **npm**: v9+
- **Python**: v3.10+ (for ML pipeline & testing)
- **PostgreSQL**: v14+ running locally on port `5432` (or Docker)

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/yojanasathi.git
cd yojanasathi

# 2. Install Node.js dependencies
npm install

# 3. Install Python ML dependencies
python -m pip install --upgrade pip
pip install scikit-learn joblib fastapi pydantic uvicorn

# 4. Configure environment variables
cp .env.example .env
# Edit .env with your local PostgreSQL password:
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/gov_schemes_db?schema=public"

# 5. Initialize the Database & Seed 672 Verified Schemes
npx prisma db push
node prisma/seed.js

# 6. (Optional) Re-train or verify the ML model
python ml/src/train.py

# 7. Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
# 1. Environment & Server
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 2. Database Connection (PostgreSQL)
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/gov_schemes_db?schema=public"

# 3. Official Government API Setu Credentials (Optional - Consumer Portal)
# Obtain from: https://apisetu.gov.in
APISETU_CLIENT_ID=
APISETU_API_KEY=

# 4. Telemetry
NEXT_TELEMETRY_DISABLED=1
```

> **Security Note**: Never commit your `.env` file to version control. The repository `.gitignore` strictly excludes all `.env` files while preserving `.env.example`.

---

## 🧪 Testing & Quality Assurance

YojanaSathi maintains an exhaustive **139-test automated verification suite**:

```bash
# Run all test suites simultaneously (Unit + Integration + E2E + Regression)
npm run test:all

# Run individual suites:
npm run test:unit            # 63 Jest unit tests (Eligibility engine, NLP, DB integrity)
npm run test:integration     # 17 API integration tests (Search, Recommend, Assistant)
npm run test:e2e             # 10 Playwright E2E browser tests (Voice UI, Multilingual flows)
npm run test:regression      # 32 System regression tests

# Run AI Brain Multi-Turn Dialogue Suite (8 comprehensive scenarios)
node tests/ai_brain_test_suite.js

# Run Realistic ML Citizen Query Suite (9 realistic scenarios)
python tests/test_ml_realistic_queries.py
```

### Verification Test Summary
- **Unit Tests**: `63 / 63 PASSED`
- **API Integration Tests**: `17 / 17 PASSED`
- **Playwright E2E Tests**: `10 / 10 PASSED`
- **System Regression Tests**: `32 / 32 PASSED`
- **AI Brain Dialogue Tests**: `8 / 8 PASSED`
- **Realistic ML Evaluation**: `9 / 9 PASSED`
- **Total**: **`139 / 139 PASSED (100% Pass Rate)`**

---

## 📸 Screenshots & Visuals

*(Screenshots can be added below to showcase the live interface)*

| Homepage & Cinematic Presentation | Unified Multilingual Voice Assistant |
| :---: | :---: |
| ![Homepage Placeholder](https://via.placeholder.com/600x340?text=Cinematic+Homepage) | ![Assistant Placeholder](https://via.placeholder.com/600x340?text=Voice+Assistant+Interface) |

| Scheme Exploration & Eligibility Badges | Admin ML Evaluation Dashboard |
| :---: | :---: |
| ![Scheme Directory Placeholder](https://via.placeholder.com/600x340?text=672+Verified+Schemes) | ![ML Dashboard Placeholder](https://via.placeholder.com/600x340?text=Confusion+Matrix+%26+Metrics) |

---

## 🗺️ Future Roadmap

- [ ] **Regional Language Expansion**: Extend script identification and voice synthesis to Bengali, Marathi, Telugu, Tamil, and Gujarati.
- [ ] **Offline PWA Voice Caching**: Service Worker caching of common welfare FAQ audio for low-connectivity rural panchayats.
- [ ] **Aadhaar / DigiLocker Verification Hook**: Direct integration with official DigiLocker sandboxes for automated document eligibility matching.
- [ ] **WhatsApp & SMS Bot Webhooks**: Headless adaptation of the 4-stage pipeline for low-end feature phone accessibility via Twilio / Gupshup.

---

## 👨‍💻 Author & Acknowledgments

**Lead Developer & Architect**: [Your Name](https://github.com/your-username)  
- **GitHub**: [@your-username](https://github.com/your-username)
- **LinkedIn**: [linkedin.com/in/your-profile](https://linkedin.com/in/your-profile)

### Acknowledgments & Data Sources
- **Data Source**: Official citizen welfare schemes curated from [myScheme.gov.in](https://www.myscheme.gov.in/) and national portal datasets.
- **Design Inspiration**: Minimalist product presentation inspired by Scale AI design aesthetics.
- **Government Compliance**: All scheme rules, links, and criteria strictly link to authenticated `.gov.in` and `.nic.in` state and central domains.

---

<p align="center">
  <b>YojanaSathi</b> — Empowering every Indian citizen through accessible, verified governmental intelligence.
</p>
