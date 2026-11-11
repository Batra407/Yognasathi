# YojanaSathi 2.0 — Frontend Architecture & Codebase Audit Report

**Date**: October 31, 2026  
**Project**: YojanaSathi (Next.js 16.3.5 App Router, React 19.2.8, Tailwind CSS v4, Prisma 5.22.0, PostgreSQL 16)  
**Author**: Principal Frontend Architect & Senior UI/UX Engineer  

---

## 1. Existing System Architecture

### 1.1 Tech Stack & Runtime Environment
- **Framework**: Next.js 16.3.5 (App Router, Turbopack, React Server Components + Client Components where interactivity is required).
- **Core Runtime**: Node.js v20+ with React 19.2.8 and React DOM 19.2.8.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss` and `tailwindcss` ^4) integrated with native `@import "tailwindcss";` and custom CSS custom properties defined in `src/app/globals.css`.
- **Animation**: GSAP (`gsap` ^3.15.0) used for hero timeline orchestration and VoiceOrb pulsing; CSS keyframe animations for radar sweeps and waveform pulses.
- **Database & ORM**: PostgreSQL 16 on `localhost:5432/gov_schemes_db` accessed via Prisma Client 5.22.0 (`src/lib/prisma.js`).
- **Testing Infrastructure**: 
  - Unit tests: Jest 30.5.2 with jsdom (`tests/unit/`).
  - Integration tests: Node.js backend integration suite (`tests/integration/test_api_integration.js`).
  - Regression tests: Comprehensive regression runner (`tests/regression/test_all_regressions.js`).
  - E2E tests: Playwright 1.63.0 (`tests/e2e/app.spec.js`).

---

## 2. Existing Routes

### 2.1 Citizen-Facing & Admin Web Routes

| Route | File Path | Type | Current Purpose & State |
| :--- | :--- | :--- | :--- |
| `/` | `src/app/page.js` | Client Component | Landing page with Hero, VoiceOrb, embedded Voice/Text Assistant section (`#assistant`), Workflow pipeline, and trust notice. |
| `/schemes` | `src/app/schemes/page.js` | Client Component | Scheme discovery catalogue with search bar, department filter dropdown, active filter chips, pagination, and dynamic count badges. |
| `/schemes/[id]` | `src/app/schemes/[id]/page.js` | Client Component | Scheme detail view with plain-language summary, who can benefit, benefits, interactive `SchemeEligibilityChecker`, document checklist, application steps, and official portal links. |
| `/departments` | `src/app/departments/page.js` | Client Component | Directory of government ministries and departments administering welfare schemes, with real-time search filter and scheme count indicators. |
| `/admin/schemes` | `src/app/admin/schemes/page.js` | Client Component | Administrative explorer showing read-only PostgreSQL Dataset A & State scheme records with search and department filtering. |

### 2.2 Backend API Routes

| Endpoint | File Path | Method | API Contract & Behavior |
| :--- | :--- | :--- | :--- |
| `/api/schemes` | `src/app/api/schemes/route.js` | `GET` | Paginated scheme listing with `search`, `department`, `state`. Strictly filters to `CITIZEN_WELFARE_SCHEME`. Rejects invalid `recordType` with 400. Returns `{ data, pagination, meta }`. |
| `/api/schemes/[id]` | `src/app/api/schemes/[id]/route.js` | `GET` | Returns single scheme record with relational department, category, verified `eligibilityRules`, and mapped `governmentScheme` (myScheme). Returns 404 if not found. |
| `/api/departments` | `src/app/api/departments/route.js` | `GET` | By default lists only departments that administer active `CITIZEN_WELFARE_SCHEME` records (17 departments). Supports `search`, `all=true`. |
| `/api/schemes/assistant` | `src/app/api/schemes/assistant/route.js` | `POST` | Core conversational query endpoint. Accepts `{ text: string }`. Runs NLP language detection (hi, en, pa), profile extraction, term extraction, relevance scoring, and deterministic eligibility evaluation against verified rules. |
| `/api/schemes/recommend` | `src/app/api/schemes/recommend/route.js` | `POST` | Keyword and profile-based recommendation engine. Strictly excludes budget lines. Evaluates state match and terms. |
| `/api/schemes/recommend-multilingual` | `src/app/api/schemes/recommend-multilingual/route.js` | `POST` | Multilingual wrapper matching localized queries to English schema terms. |
| `/api/schemes/check-eligibility` | `src/app/api/schemes/check-eligibility/route.js` | `POST` | Evaluates user profile against verified rules for a given scheme ID. |
| `/api/eligibility/rules/[schemeId]` | `src/app/api/eligibility/rules/[schemeId]/route.js` | `GET` | Returns verified `GovernmentSchemeEligibilityRule` records for a specific scheme. |
| `/api/nlp/analyze` | `src/app/api/nlp/analyze/route.js` | `POST` | Direct NLP helper for language detection and keyword extraction. |
| `/api/nlp/extract-profile` | `src/app/api/nlp/extract-profile/route.js` | `POST` | Extracts demographic parameters (age, gender, state, income, occupation) from input text. |
| `/api/admin/myscheme/test` | `src/app/api/admin/myscheme/test/route.js` | `GET` | Diagnostics probe for external API Setu credentials. |

---

## 3. Existing Working Functionality

1. **Multilingual Query Processing**:
   - Natural language parsing for Hindi, English, and Punjabi.
   - Profile parameter extraction: age, occupation (farmer, student, worker), state (Punjab, Haryana), and income.
   - Deterministic relevance calculation with normalized scores (0.10 to 0.95) and zero false positives on departments.
2. **Citizen Welfare Filtering**:
   - `CITIZEN_WELFARE_SCHEME`: 35 records (20 Punjab + 15 Haryana).
   - `BUDGET_ACCOUNTING_ENTRY`: 55 records strictly excluded from recommendations and public scheme catalogues.
   - `PENDING_CLASSIFICATION`: 582 central budget records securely sequestered from public listings.
3. **Structured Eligibility Screener**:
   - `SchemeEligibilityChecker` dynamically evaluates user inputs against 45 verified rules in PostgreSQL without inventing criteria.
   - Clear criterion-by-criterion breakdown with status flags (`ELIGIBLE`, `NOT_ELIGIBLE`, `INSUFFICIENT_INFORMATION`).
4. **Speech Recognition & Audio Feedback**:
   - Web Speech API integration in `VoiceOrb` and `AssistantInput` with browser audio waveform visualization via Web Audio API.
   - Speech synthesis (TTS) reading out plain-language summaries in Hindi, English, or Punjabi.
5. **Real Database Provenance**:
   - Zero mock data; all scheme details, departments, and URLs are sourced from official government portals (`eservices.punjab.gov.in`, `saralharyana.gov.in`, `pbplanning.punjab.gov.in`, `myscheme.gov.in`).

---

## 4. Existing Component Inventory

### 4.1 Global & Layout Components
- `src/components/Header.js`: Fixed navigation with logo, nav links (`AI Voice Assistant`, `Find Schemes`, `Departments`, `Punjab Schemes`, `How It Works`), language selector, and active indicators.
- `src/components/Footer.js`: 4-column footer with branding, database metrics (637 Union + 35 State + 86 Depts), language coverage, and official disclaimer.
- `src/components/LanguageSelector.js`: Dropdown selector for Hindi, English, and Punjabi.
- `src/components/Pagination.js`: Accessible pagination control with Next/Previous buttons and page numbered pills.
- `src/components/LoadingSkeleton.js`: Grid-based animated placeholder skeletons.

### 4.2 Home Page Components
- `src/components/Hero.js`: Hero banner with trust badge, headline, center VoiceOrb target, dual CTAs ("Try Speaking Now", "Try Typing Now"), 3 feature blurbs, and 4 database metric cards.
- `src/components/VoiceWaveBackground.js`: Subtle animated SVG canvas backdrop.
- `src/components/WorkflowSection.js`: 5-step citizen discovery workflow explanation.

### 4.3 Scheme Discovery & Details Components
- `src/components/SchemeListingCard.js`: Card for `/schemes` with department title, verification badge, target beneficiaries, benefits overview, and "View Details" button.
- `src/components/DepartmentCard.js`: Card for `/departments` showing department name and scheme count badge.
- `src/components/government/SchemeEligibilityChecker.js`: Client-side interactive eligibility question engine rendered on `/schemes/[id]`.
- `src/components/government/VoiceInput.js`: Standalone microphone capture button.

### 4.4 Assistant Components (`src/components/assistant/`)
- `AssistantInput.js`: Dual-mode input controller (voice recording via Web Speech API + text input with `#text-requirement` and "Search Assistant" submit button).
- `VoiceOrb.js`: Canvas-based audio reactive orb with 5 visual states (`idle`, `listening`, `processing`, `searching`, `speaking`, `error`).
- `VoiceButton.js`: Compact microphone button with animated states.
- `Transcript.js`: Speech-to-text transcript card with inline edit and clear actions.
- `AssistantResponse.js`: Master container for assistant search output (ProfileCard, MissingInformation, SchemeList).
- `ProfileCard.js`: Displays extracted citizen parameters.
- `MissingInformation.js`: Suggests prompts to clarify profile fields.
- `SchemeCard.js`: Displays assistant recommendation cards with relevance score, match reasons, and eligibility badge.
- `SchemeList.js`: Grid list of recommended scheme cards.
- `SourceBadge.js` & `EligibilityBadge.js`: Status badges for verified government provenance.
- `TrustNotice.js`: Legal disclaimer on automated screening vs. official government sanction.

---

## 5. Existing API Contracts

### 5.1 GET `/api/schemes`
- **Query Params**:
  - `page`: positive integer (default 1)
  - `limit`: positive integer, max 100 (default 20)
  - `search`: string (schemeName case-insensitive match)
  - `department`: string (department ID or partial name)
  - `state`: string (state name, e.g. "Punjab", "Haryana")
  - `recordType`: string (only accepts `CITIZEN_WELFARE_SCHEME`)
- **Success Response (200)**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "schemeName": "string",
        "recordType": "CITIZEN_WELFARE_SCHEME",
        "department": { "id": "uuid", "name": "string" },
        "state": "string | null",
        "description": "string",
        "plainLanguageSummary": "string",
        "targetBeneficiaries": "string",
        "benefits": "string",
        "requiredDocuments": "string",
        "applicationProcess": "string",
        "officialApplicationUrl": "string",
        "officialUrl": "string",
        "verificationStatus": "VERIFIED_OFFICIAL",
        "lastVerifiedAt": "iso-date"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 35, "totalPages": 2 },
    "meta": { "recordType": "CITIZEN_WELFARE_SCHEME" }
  }
  ```

### 5.2 POST `/api/schemes/assistant`
- **Request Body**: `{ "text": "I am a 35 year old farmer looking for schemes" }`
- **Success Response (200)**:
  ```json
  {
    "language": "en",
    "profile": {
      "age": 35,
      "occupation": "farmer",
      "state": null,
      "annualIncome": null
    },
    "intent": { "keywords": ["farmer"] },
    "results": [
      {
        "scheme": { "id": "uuid", "schemeName": "string", "department": { "name": "string" } },
        "relevanceScore": 0.85,
        "matchedTerms": ["farmer"],
        "matchReasons": ["Matched citizen profile occupation: farmer"],
        "eligibility": {
          "status": "ELIGIBLE | NOT_ELIGIBLE | INSUFFICIENT_INFORMATION",
          "isDetermined": true,
          "matchedCriteria": [],
          "failedCriteria": [],
          "notes": "string"
        }
      }
    ]
  }
  ```

---

## 6. Existing Database Dependencies

- **Database**: PostgreSQL 16 `gov_schemes_db`.
- **Key Tables**:
  - `schemes` (672 records): contains classification enum `SchemeRecordType` (`CITIZEN_WELFARE_SCHEME`, `BUDGET_ACCOUNTING_ENTRY`, `PENDING_CLASSIFICATION`).
  - `departments` (86 records).
  - `categories` (dynamic categories).
  - `government_scheme_eligibility_rules` (45 verified rules).
  - `scheme_source_mappings` (mappings linking `Scheme` to `GovernmentScheme`).
  - `government_schemes` (20 national myScheme entries).

**Critical Invariant**: Database records and schema must be strictly preserved. No migrations or resets will be performed.

---

## 7. Frontend Problems in Current Implementation

1. **Outdated Dark/Amber Aesthetic**:
   - The dark palette (`#08090B`, `#111317`, `#FF9B2F`) feels like a dark gaming or crypto dashboard rather than an authoritative, trustworthy, accessible Indian public utility.
   - Insufficient contrast in certain sub-elements on mobile screens.
2. **Missing Dedicated AI Voice Assistant Page**:
   - The assistant currently only lives as an embedded anchor `#assistant` on the homepage. There is no dedicated `/assistant` page where a citizen can experience a full-screen, conversational conversational interface with suggested queries, conversation history, and audio replay controls.
3. **No Dedicated About / Transparency Page**:
   - Important methodology, open-data sources, and official verification disclaimers are dispersed across tooltips and footer text rather than presented in a dedicated `/about` page.
4. **Scattered Design Tokens**:
   - Hardcoded hex codes (`#FF9B2F`, `rgba(245,241,233,0.08)`) are embedded across multiple components alongside CSS variables, causing visual maintenance overhead.
5. **Lack of Modern Conversational UI Elements**:
   - Missing live waveform visualizer, conversation turn history, speech audio replay buttons, stop-speaking controls, and clear-conversation actions in a unified conversational layout.

---

## 8. Dependencies That Can Be Reused

1. **`gsap` (^3.15.0)**: Installed and fully operational for timeline choreography and smooth transitions.
2. **Tailwind CSS v4**: Installed with `@tailwindcss/postcss` for utility classes and layout styling.
3. **Web Audio API & Web Speech API integration**: Audio stream capture, frequency analysis, and speech recognition logic in `VoiceOrb.js` and `AssistantInput.js`.
4. **NLP & Profile Extraction**: Tested business logic in `src/lib/nlp.js` and `src/lib/government/profile-extractor.js`.
5. **Eligibility Evaluation Engine**: Proven deterministic logic in `src/lib/government/eligibility-engine.js`.

---

## 9. Components to Be Rebuilt vs. Preserved

| Component | Strategy | Action Plan |
| :--- | :--- | :--- |
| `src/app/globals.css` | **Complete Redesign** | Implement the new **Premium White + Navy + Blue** design tokens (`#FFFFFF`, `#F7F9FC`, `#17243A`, `#68758A`, `#2563EB`, `#14233B`, `#E5EAF1`). |
| `Header.js` | **Rebuild Presentation** | Clean white backdrop (`#FFFFFF`), subtle border (`#E5EAF1`), navy typography, blue primary CTA, links to Home, Discover Schemes, AI Assistant, How It Works, About. |
| `Footer.js` | **Rebuild Presentation** | Premium navy/white structure with official transparency disclaimers, database metrics, and clear navigation. |
| `src/app/page.js` | **Rebuild Presentation** | Modern clean landing page with hero, conversational search box, category tiles, state browse shortcuts, verified scheme highlights, and workflow. |
| `Hero.js` | **Rebuild Presentation** | Elegant white/navy layout with conversational input prompt, microphone trigger, and clear metrics. Preserves button roles for E2E tests (`Try Speaking Now`, `Try Typing Now`). |
| `src/app/schemes/page.js` | **Rebuild Presentation** | Premium searchable scheme catalogue with filters for state, department, category, and verification status. |
| `SchemeListingCard.js` | **Rebuild Presentation** | Crisp white card with blue accents, verified badge, and clear metadata. |
| `src/app/schemes/[id]/page.js` | **Rebuild Presentation** | Two-column desktop / single-column mobile layout with structured sections, official CTAs, and disclaimers. |
| `SchemeEligibilityChecker.js` | **Rebuild Presentation** | Redesign with white surfaces, clear radio/select inputs, and green/red criteria feedback. Preserve engine evaluation logic. |
| Dedicated Assistant Page (`src/app/assistant/page.js`) | **New Creation** | Full-screen conversational AI interface with animated waveform, live transcript, conversation turns, suggested prompts, and scheme cards. |
| `src/app/about/page.js` | **New Creation** | Mission, data provenance, and verification methodology page. |
| `src/app/admin/schemes/page.js` | **Rebuild Presentation** | Professional clean admin dashboard with real statistics, PostgreSQL status, search, and department filtering. |

---

## 10. Backward Compatibility & Test Invariant Safeguards

1. **E2E Test Selectors (`tests/e2e/app.spec.js`)**:
   - Hero must include text matching `/Democratizing Access to Public Welfare/i` or equivalent subtitle, and buttons matching `/Try Speaking Now/i` and `/Try Typing Now/i`.
   - Text input must maintain id `#text-requirement` and submit button with text `/Search Assistant/i` or `Discover Schemes`.
   - Assistant result must display `/Extracted User Profile/i` and `/Recommended Schemes/i`.
   - Empty state must display `/No matching schemes found in Dataset A/i` or clean equivalent.
   - Admin page must display `/Government Schemes Explorer/i` and search input with `placeholder*="Crop Insurance"`.
2. **Regression & Integration Tests**:
   - Zero changes to API route paths, database relations, or response schemas.
   - All 63 unit tests, 17 integration tests, and 32 regression assertions must continue to pass seamlessly.

