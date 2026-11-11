# Scheme Data Enrichment Report

- **Source Dataset**: Ministry of Finance, Government of India — Union Budget Expenditure Profile
- **Enrichment Target**: PostgreSQL (`gov_schemes_db`)
- **Execution Date**: 2026-09-19T17:09:39.648Z
- **Execution Mode**: Live Update

---

## 1. Summary Statistics

| Metric | Count |
| :--- | ---: |
| **Existing Scheme Records in DB** | **637** |
| **Official External Records Discovered** | **0** |
| **Exact Matches Found** | **0** |
| **Possible Matches Found** | **0** |
| **Unmatched Schemes** | **637** |
| **Database Records Updated** | **0** |
| **Database Records Unchanged** | **637** |

---

## 2. Missing Fields Audit

| Field | Missing Count | Missing % |
| :--- | ---: | ---: |
| `eligibility_text` | 637 | 100.0% |
| `description` | 637 | 100.0% |
| `benefits` | 637 | 100.0% |

---

## 3. Official Source Limitations & Stop Condition Audit

> **OFFICIAL FINDING**: The current official budget expenditure dataset does not contain narrative eligibility text, qualitative benefits, or application instructions. Public open-access bulk datasets for eligibility rules are not available without partner API registration.

- **Data Rule Adherence**: No fake data, synthetic descriptions, or third-party scraped data were added.
- **Pipeline Integrity**: All 637 real government budget records are preserved intact.
