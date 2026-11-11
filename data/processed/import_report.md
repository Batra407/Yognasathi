# Import Report: Government Schemes Dataset

- **Source File**: `data/processed/government_schemes_cleaned.csv`
- **Source Dataset**: Ministry of Finance, Government of India — Union Budget Expenditure Profile (Statements 4A & 4B)
- **Import Timestamp**: 2026-09-19T17:05:10.596Z
- **Database Target**: PostgreSQL (`gov_schemes_db`)

---

## 1. Import Summary Statistics

| Metric | Count |
| :--- | ---: |
| **Total Rows Read from CSV** | **637** |
| **Valid Rows** | **637** |
| **Rows Imported / Upserted** | **637** |
| **Rows Skipped** | **0** |
| **Rows Rejected** | **0** |
| **Departments Created / Synced** | **71** |
| **Categories Created** | **0** (Category data not present in budget outlay file) |
| **Total Schemes in PostgreSQL** | **637** |

---

## 2. Idempotency Verification

- The import script uses Prisma `upsert` matching on the composite unique key `[departmentId, schemeName]`.
- Re-running the import script is 100% idempotent and does not create duplicate records.

---

## 3. Rejections & Mapping Errors

_No rows were rejected during import. All rows parsed and mapped successfully._

---

## 4. Integrity Statement

- **NO Fake Data**: All 637 records in PostgreSQL originate from real government budget statements.
- **NO Invented Fields**: Qualitative fields (`eligibility_text`, `description`, `benefits`, `official_url`) remain `NULL` until source text is supplied.
