# Current Data Assessment Report: Union Budget Expenditure Profile Dataset

This document provides a comprehensive audit of the 637 scheme records currently stored in the PostgreSQL database (`gov_schemes_db`) imported from `data/processed/government_schemes_cleaned.csv`.

---

## 1. What the Current Dataset Contains

- **Source**: Ministry of Finance, Government of India — Union Budget Expenditure Profile (Statement 4A: Central Sector Schemes & Statement 4B: Centrally Sponsored Schemes).
- **Total Scheme Records**: 637
- **Administering Departments/Ministries**: 71
- **Primary Data Fields**:
  - `scheme_no`: Official budget item number (e.g., 1.0, 2.0).
  - `scheme_name`: Official scheme name in government budget records (e.g., *Pradhan Mantri Kisan Samman Nidhi (PM-Kisan)*, *Crop Insurance Scheme*).
  - `department_id`: Foreign key reference to normalized `departments` table.
  - `actuals_2024_2025_total_crores`: Actual expenditure outlay for FY 2024-2025 (in ₹ Crores).
  - `be_2025_2026_total_crores`: Budget Estimate outlay for FY 2025-2026 (in ₹ Crores).
  - `re_2025_2026_total_crores`: Revised Estimate outlay for FY 2025-2026 (in ₹ Crores).
  - `be_2026_2027_total_crores`: Budget Estimate outlay for FY 2026-2027 (in ₹ Crores).

---

## 2. What the Current Dataset Does NOT Contain

The current dataset is **strictly financial and expenditure-oriented**. It lacks all narrative and qualitative scheme metadata:

1. **Scheme Description**: 100% missing (`NULL`). No summary of scheme objectives or scope.
2. **Eligibility Criteria**: 100% missing (`NULL`). No rules regarding age, income, gender, land holding, occupation, or social category.
3. **Qualitative Benefits**: 100% missing (`NULL`). Outlay numbers in ₹ Crores are present, but benefit descriptions (e.g. *"Financial benefit of ₹6,000 per year in three equal installments"*) are absent.
4. **Application Process**: 100% missing (`NULL`). No portal URLs, registration steps, or offline submission instructions.
5. **Required Documents**: 100% missing (`NULL`). No list of required documents (Aadhaar, Land Record, Bank Passbook).
6. **Target Beneficiary Groups**: 100% missing (`NULL`). No structured or unstructured beneficiary classifications (Farmers, Women, Students, MSMEs).
7. **Official Portal URLs**: 100% missing (`NULL`). No links to official government scheme websites.

---

## 3. Why It Is Insufficient for Citizen Eligibility Matching

The primary goal of the Multilingual Government Scheme Voice Assistant is to assist Indian citizens in discovering government schemes for which they qualify based on demographic profile (age, gender, income, state, occupation, category). 

Because the current dataset contains **only financial expenditure figures** and **zero eligibility rules or qualitative details**, it cannot be used for citizen eligibility matching in its current state.

---

## 4. Required Fields Currently Unavailable

To enable citizen scheme discovery and eligibility evaluation, the dataset requires official enrichment for:
- `description`
- `eligibility_text`
- `benefits`
- `application_process`
- `target_beneficiaries`
- `required_documents`
- `official_url`
- `source_url`
