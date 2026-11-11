# Phase 1: Government Schemes Project & Architecture Audit

**Date:** 2026-10-18  
**Auditor:** Senior Data Engineer & Platform Architect  
**Objective:** Complete comprehensive audit of existing Next.js codebase, PostgreSQL database, Prisma schema, REST APIs, scripts, test suites, and frontend components prior to expanding with real State-wise and Union Territory schemes.

---

## 1. Executive Summary & Verification Baseline

| Component | Status | Metric / Detail |
| :--- | :--- | :--- |
| **Framework & Engine** | Active | Next.js 16.3.5 (Turbopack, App Router, JavaScript) + React 19.2.8 |
| **Database Engine** | Connected | PostgreSQL 16 on `localhost:5432/gov_schemes_db` via Prisma ORM 5.22.0 |
| **Dataset A (Central Budget)** | Verified Intact | Exactly **637 records** from Union Budget Expenditure Profile 2026-27 |
| **Departments** | Verified Intact | Exactly **71 Union Ministries & Departments** |
| **Dataset B (myScheme / API Setu)** | Configured / Unpopulated | Schema ready (`government_schemes`); 0 records in DB; API credentials pending |
| **Dataset C (Eligibility Rules)** | Verified Intact | Exactly **10 verified eligibility rules** mapped to central schemes |
| **Test Suite Baseline** | 100% Passing | Unit tests (39/39), Integration tests (16/16), Regression tests (31/31) |

---

## 2. Database Schema Audit (`prisma/schema.prisma`)

The database consists of 7 models across 3 datasets:

### 2.1 Core Relational Models (Dataset A)
1. **`Department` (`departments` table)**:
   - `id` (UUID PK), `name` (VARCHAR Unique), `createdAt`, `updatedAt`
   - Relates 1-to-many with `Scheme`.
   - Current Count: **71**.

2. **`Category` (`categories` table)**:
   - `id` (UUID PK), `name` (VARCHAR Unique), `description` (TEXT Nullable).
   - Relates 1-to-many with `Scheme`.
   - Current Count: **0** (categories are optional tags).

3. **`Scheme` (`schemes` table)**:
   - `id` (UUID PK), `schemeNo` (Float), `schemeName` (String), `departmentId` (UUID FK).
   - 4-year financial allocations in ₹ Crores:
     - `actuals20242025Crores` (Decimal)
     - `be20252026Crores` (Decimal)
     - `re20252026Crores` (Decimal)
     - `be20262027Crores` (Decimal)
   - Qualitative fields:
     - `description` (TEXT), `schemeLevel` (String?), `state` (String?), `eligibilityText` (TEXT), `benefits` (TEXT), `applicationProcess` (TEXT), `officialUrl` (String?), `sourceUrl` (String?), `lastUpdated` (DateTime?).
   - Unique constraint: `@@unique([departmentId, schemeName])`.
   - Current Count: **637** records.

### 2.2 Official Extended Scheme Model (Dataset B)
4. **`GovernmentScheme` (`government_schemes` table)**:
   - `id` (UUID PK), `sourceId` (String? Unique - official slug/code)
   - `schemeName`, `schemeShortTitle`, `ministry`, `departmentName`
   - `schemeLevel` ("Central Sector", "Centrally Sponsored", "State")
   - `stateName` (State/UT name)
   - Narrative fields: `description`, `eligibilityText`, `benefits`, `targetBeneficiaries`, `applicationProcess`, `requiredDocuments`, `officialUrl`
   - Provenance: `sourceName`, `sourceUrl`, `retrievedAt`, `sourceLastUpdated`
   - Current Count: **0**.

5. **`GovernmentSchemeSource` (`government_scheme_sources` table)**:
   - Stores raw payload and retrieval metadata.

6. **`SchemeSourceMapping` (`scheme_source_mappings` table)**:
   - Links budget scheme (`budgetSchemeId`) to official government scheme (`governmentSchemeId`) with confidence score and match type.

### 2.3 Eligibility Rules Model (Dataset C)
7. **`GovernmentSchemeEligibilityRule` (`government_scheme_eligibility_rules` table)**:
   - Normalized rules (`ageMin`, `ageMax`, `gender`, `state`, `occupation`, `annualIncomeMin`, `annualIncomeMax`, `category`, `residency`, `landHoldingMin`, `landHoldingMax`, `employmentStatus`, `disabilityStatus`, `specialConditions`, `requiredDocuments`).
   - Provenance: `sourceName`, `sourceUrl`, `verifiedDate`, `isVerified`.
   - Current Count: **10**.

---

## 3. API Surface Audit

| Endpoint | Method | Supported Parameters | Current Response Contract | State/UT Support Currently? |
| :--- | :--- | :--- | :--- | :--- |
| `/api/schemes` | GET | `page`, `limit`, `search`, `department` | `{ data: Scheme[], pagination: { page, limit, total, totalPages } }` | ❌ No `state` or `jurisdiction` query param |
| `/api/schemes/[id]` | GET | `id` (route param) | `Scheme` with `department` and `category` | ⚠️ Scheme has nullable `state`, `schemeLevel` |
| `/api/departments` | GET | `search` | `{ data: Department[], total: number }` | N/A (Union Departments) |
| `/api/schemes/check-eligibility` | POST | `{ schemeId, profile }` | Deterministic eligibility evaluation | Partial (`profile.state` supported in engine) |
| `/api/schemes/assistant` | POST | `{ text }` | Multilingual NLP assistant response | Partial (`profile.state` extracted) |
| `/api/nlp/extract-profile` | POST | `{ text }` | Extracted profile entities | Partial (`STATE_MAP` has 22 states, needs 36) |

---

## 4. Existing Ingestion & Data Scripts Audit

1. **`data/scripts/clean_government_data.py` & `import_government_data.js`**:
   - Parses `government_schemes_original.csv`, deduplicates, and loads the 637 Dataset A records into PostgreSQL.
2. **`data/scripts/verify_database.js` & `verify_myscheme_database.js`**:
   - Integrity assertion scripts verifying 637 schemes, 71 departments, and zero synthetic records.
3. **`data/scripts/fetch_myscheme_data.js` & `check_api_setu_config.js`**:
   - API Setu client for myScheme API. Reports credential status.
   - Status: API credentials (`APISETU_CLIENT_ID`, `APISETU_API_KEY`) are currently not set in `.env`.
4. **`data/scripts/seed_eligibility_rules.js`**:
   - Seeds 10 verified eligibility rules with official source links.

---

## 5. Frontend & UI Capabilities Audit

1. **Home Page (`/`)**:
   - Multilingual scheme search, voice/text discovery input widget, category badges, 5-step citizen guidance.
2. **Schemes Directory (`/schemes`)**:
   - Full search bar, department filter dropdown, scheme cards with budget details and tags.
   - **Gap**: Lacks State/UT selector and Central vs. State jurisdiction filter tabs.
3. **Departments Directory (`/departments`)**:
   - Department directory with scheme counts and links back to `/schemes?department=...`.

---

## 6. Architecture Strategy for Real State-Wise Schemes Expansion

### 6.1 State & UT Coverage Requirements
Must cover all 28 States and 8 Union Territories:
- **28 States**: Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand, West Bengal.
- **8 Union Territories**: Andaman and Nicobar Islands, Chandigarh, Dadra and Nagar Haveli and Daman and Diu, Delhi, Jammu and Kashmir, Ladakh, Lakshadweep, Puducherry.

### 6.2 Data Model Integration Strategy
To preserve existing functionality and satisfy all requirements:
1. **Jurisdiction Representation**:
   - Standardized values: `CENTRAL`, `STATE`, `UNION_TERRITORY`.
   - In `Scheme` model: `schemeLevel` will store `CENTRAL`, `STATE`, or `UNION_TERRITORY`.
   - `state` field stores normalized State or UT name (e.g. `Maharashtra`, `Punjab`, `Delhi`). Central schemes implemented nationally will have `state: null` or national scope.
2. **Department / Administering Authority**:
   - For state schemes, `departmentId` will reference the administering department (e.g., `Government of Maharashtra - Department of Agriculture` or state-specific department records, cleanly distinguishing state departments from Union Ministries).
3. **Zero Data Regression / Idempotency**:
   - Preserve all 637 Dataset A records with `schemeLevel: 'CENTRAL'`.
   - Use stable source identifiers (`sourceUrl` or composite key) to ensure idempotent imports.

---

## 7. Phase 1 Sign-Off & Readiness for Phase 2

- ✅ Existing repository, database, APIs, scripts, and tests are thoroughly audited.
- ✅ Baseline verified: All tests pass, database is healthy, zero corruption.
- ✅ Clear roadmap established for Phase 2 (Research official sources and generate source inventory).
