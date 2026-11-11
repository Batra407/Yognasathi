# Scheme Source Matching Analysis

This document evaluates official Government of India data sources for enriching the 637 Union Budget scheme records stored in PostgreSQL (`gov_schemes_db`) with qualitative scheme metadata (descriptions, eligibility criteria, benefits, and application instructions).

---

## 1. Data Source Audit & Identification

### Current Dataset Baseline
- **Source**: Ministry of Finance, Government of India — Union Budget Expenditure Profile (Statements 4A & 4B: Central Sector and Centrally Sponsored Schemes).
- **Identifier**: Ministry/Department Name + Official Scheme Item Number + Scheme Title.
- **Total Records**: 637
- **Scope**: Financial expenditure outlays in ₹ Crores (Actuals 2024-25, BE 2025-26, RE 2025-26, BE 2026-27).

### Official Government Sources Investigated
1. **Open Government Data Platform India (`data.gov.in`)**:
   - *Status*: Investigated.
   - *Finding*: Hosts ministry-specific financial and performance statistics. No centralized downloadable bulk dataset (CSV/JSON) mapping budget scheme item numbers to narrative eligibility guidelines is available.
2. **myScheme Portal (`myscheme.gov.in`)**:
   - *Status*: Investigated.
   - *Finding*: Official government platform for citizen scheme discovery. However, no public open-access REST API or downloadable dataset is provided without partner authentication via API Setu.
3. **Direct Benefit Transfer Portal (`dbtbharat.gov.in`)**:
   - *Status*: Investigated.
   - *Finding*: Maintains live transfer registers and ministry-wise dashboards, but does not offer downloadable bulk scheme eligibility datasets or public API endpoints.
4. **API Setu (`apisetu.gov.in`)**:
   - *Status*: Investigated.
   - *Finding*: Requires formal partner registration and credentials for API access.
5. **Third-Party / Scraped Datasets**:
   - *Status*: Excluded per project data rules ("DO NOT use Kaggle, GitHub datasets, Blog websites, Private websites, Unofficial scheme aggregators, Random scraped datasets").

---

## 2. Matching Strategy & Statistics

- **Existing Dataset Identifier**: `[department_id, scheme_name]`
- **New Dataset Identifier**: N/A (No public official bulk dataset with narrative eligibility criteria available)
- **Matching Strategy**: Strict exact matching on official government scheme name and administering ministry/department.
- **Exact Matches**: **0**
- **Possible Matches**: **0**
- **Unmatched Schemes**: **637**

---

## 3. Findings & Official Data Rule Conclusion

Because no official government source currently provides an open, un-authenticated bulk dataset containing:
- Narrative scheme descriptions
- Official eligibility criteria text
- Benefit breakdown details
- Application instructions

**No records could be automatically enriched or linked.**

Per the project's absolute data rules, **no synthetic, LLM-generated, or third-party data has been created or merged**.
