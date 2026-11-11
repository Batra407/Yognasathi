# Dataset B Production Ingestion Pipeline Documentation

This document specifies the design, architecture, normalization rules, validation standards, and security boundaries for the **myScheme Service API (via API Setu)** Dataset B ingestion pipeline.

---

## 1. Data Pipeline Architecture

```text
       Official API Setu myScheme Service API
                         │
                         ▼ (Header Auth: X-APISETU-CLIENT-ID, X-APISETU-APIKEY)
          data/scripts/fetch_myscheme_data.js
                         │
                         ▼
   data/raw/official_scheme_information/myscheme_api_*.json
                         │
                         ▼
        data/scripts/normalize_myscheme_data.js
                         │
                         ▼
       data/processed/myscheme_normalized.json
                         │
                         ▼
        data/scripts/validate_myscheme_data.js
                         │
                         ▼
       data/processed/myscheme_validated.json
                         │
                         ▼ (Prisma $transaction batch upsert)
        data/scripts/import_myscheme_data.js
                         │
                         ▼
       PostgreSQL (`government_schemes` / Dataset B)
```

---

## 2. Pipeline Scripts Reference

1. [`data/scripts/check_api_setu_config.js`](file:///c:/Users/Ansh/OneDrive/Documents/nextjsproject/data/scripts/check_api_setu_config.js): Safe configuration diagnostic script checking credential states without exposing secret keys.
2. [`data/scripts/test_myscheme_connection.js`](file:///c:/Users/Ansh/OneDrive/Documents/nextjsproject/data/scripts/test_myscheme_connection.js): Authenticated connection test script using `src/lib/government/myscheme-api.js`.
3. [`data/scripts/fetch_myscheme_data.js`](file:///c:/Users/Ansh/OneDrive/Documents/nextjsproject/data/scripts/fetch_myscheme_data.js): Authenticated API Setu retrieval engine. Safely halts with exit code 0 if credentials are missing (`API Setu credentials are not configured.`).
4. [`data/scripts/normalize_myscheme_data.js`](file:///c:/Users/Ansh/OneDrive/Documents/nextjsproject/data/scripts/normalize_myscheme_data.js): Normalizes raw JSON fields (trimming whitespace, formatting URLs, converting missing fields to `NULL`). Preserves original government text without LLM rewriting.
5. [`data/scripts/validate_myscheme_data.js`](file:///c:/Users/Ansh/OneDrive/Documents/nextjsproject/data/scripts/validate_myscheme_data.js): Audits required fields (`sourceId`, `schemeName`), checks for duplicates, and generates [`data/processed/myscheme_validation_report.md`](file:///c:/Users/Ansh/OneDrive/Documents/nextjsproject/data/processed/myscheme_validation_report.md).
6. [`data/scripts/import_myscheme_data.js`](file:///c:/Users/Ansh/OneDrive/Documents/nextjsproject/data/scripts/import_myscheme_data.js): Batch upsert script (`BATCH_SIZE = 50`) using Prisma transactions. Ensures **100% idempotency** matching on `sourceId`.
7. [`data/scripts/verify_myscheme_database.js`](file:///c:/Users/Ansh/OneDrive/Documents/nextjsproject/data/scripts/verify_myscheme_database.js): Automated database integrity script checking Dataset A (637 schemes, 71 departments) and Dataset B counts.

---

## 3. Credential Provisioning & Access Instructions

To configure legitimate API Setu credentials for live government scheme data retrieval:

1. Obtain official API Setu consumer credentials through the official portal ([https://apisetu.gov.in](https://apisetu.gov.in)).
2. Submit a service API subscription request for the **myScheme Service API** and await approval from Digital India Corporation (MeitY).
3. Populate `APISETU_CLIENT_ID` and `APISETU_API_KEY` in local `.env`.
4. **Never commit `.env`** to Git or expose keys in client-side code.
5. Run the safe configuration diagnostic script:
   ```bash
   node --env-file=.env data/scripts/check_api_setu_config.js
   ```
6. Run the authenticated connection test script:
   ```bash
   node --env-file=.env data/scripts/test_myscheme_connection.js
   ```

Refer to official API Setu documentation for developer credential provisioning details.

---

## 4. Strict Security & Data Policies

- **Zero Synthetic Data Policy**: Enforced across all pipeline stages. If API credentials are not configured, Dataset B remains at 0 records.
- **Dataset Separation**: Dataset A (637 Union Budget records) remains 100% intact and untouched in `schemes` and `departments` tables.
- **Idempotency**: Running `import_myscheme_data.js` multiple times creates 0 duplicate records.
- **Credential Protection**: Keys are kept strictly in `.env` (ignored by Git) and never logged or exposed to client-side code.
