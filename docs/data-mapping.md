# Data Mapping Documentation: CSV → PostgreSQL Database

This document details the mapping between the cleaned Government of India scheme dataset (`data/processed/government_schemes_cleaned.csv`) and the PostgreSQL database schema defined in `prisma/schema.prisma`.

---

## 1. Direct Column Mapping Overview

| Cleaned CSV Column Name | CSV Data Type | PostgreSQL Table | Database Column Name | DB Field Type | Transformation / Handling |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ministry_department` | String | `departments` & `schemes` | `departments.name` / `schemes.department_id` | `VARCHAR(255)` / `UUID` | **Normalized**: Extracted into `departments` table (unique constraint). `schemes.department_id` references `departments.id`. |
| `scheme_no` | Float | `schemes` | `schemes.scheme_no` | `DOUBLE PRECISION` | **Direct**: Numeric item number assigned in Union Budget Statement 4A/4B (e.g., 1.0, 2.0). |
| `scheme_name` | String | `schemes` | `schemes.scheme_name` | `VARCHAR(500)` | **Direct**: Cleaned text string containing the official Government Scheme Name. |
| `actuals_2024_2025_total_crores` | Float | `schemes` | `schemes.actuals_2024_2025_total_crores` | `NUMERIC(14,2)` | **Direct**: Converted to high-precision Decimal representing financial outlay in ₹ Crores. |
| `be_2025_2026_total_crores` | Float | `schemes` | `schemes.be_2025_2026_total_crores` | `NUMERIC(14,2)` | **Direct**: Budget Estimate for 2025-2026 in ₹ Crores. |
| `re_2025_2026_total_crores` | Float | `schemes` | `schemes.re_2025_2026_total_crores` | `NUMERIC(14,2)` | **Direct**: Revised Estimate for 2025-2026 in ₹ Crores. |
| `be_2026_2027_total_crores` | Float | `schemes` | `schemes.be_2026_2027_total_crores` | `NUMERIC(14,2)` | **Direct**: Budget Estimate for 2026-2027 in ₹ Crores. |

---

## 2. Detailed Column Analysis & Transformation Policy

### 2.1 `ministry_department`
- **Destination**: `departments.name` and foreign key `schemes.department_id`.
- **Transformation**: Stripped of leading/trailing whitespace. During database population, unique department names (71 total) are inserted into `departments`, and the generated `id` is mapped to `schemes.department_id`.
- **Reasoning**: Ensures database normalization and prevents repetitive text string storage.

### 2.2 `scheme_no`
- **Destination**: `schemes.scheme_no`.
- **Transformation**: Stored as `Float` / `DOUBLE PRECISION` matching government budget item indexing.
- **Reasoning**: Maintains exact alignment with official Union Budget Expenditure Profile indexing.

### 2.3 `scheme_name`
- **Destination**: `schemes.scheme_name`.
- **Transformation**: String trimming and character normalization.
- **Reasoning**: Primary official text identifier of the government scheme.

### 2.4 Financial Outlay Columns (`actuals_2024_2025_total_crores`, `be_2025_2026_total_crores`, `re_2025_2026_total_crores`, `be_2026_2027_total_crores`)
- **Destination**: `schemes.actuals_2024_2025_total_crores`, `schemes.be_2025_2026_total_crores`, `schemes.re_2025_2026_total_crores`, `schemes.be_2026_2027_total_crores`.
- **Transformation**: Parsed as `NUMERIC(14,2)` / `Decimal` to avoid binary floating-point representation rounding issues when performing financial aggregations.
- **Reasoning**: Represents real government expenditure outlays in ₹ Crores across 4 financial years.

---

## 3. Ignored Columns Policy

- **Cleaned CSV Ignored Columns**: **NONE**. All 7 columns present in `data/processed/government_schemes_cleaned.csv` are mapped into the PostgreSQL database.
- **Raw CSV Ignored Columns (from Step 2 Cleaning)**:
  - `Unnamed: 0` (100% missing artifact column).
  - `1` (100% missing artifact column).
  - Individual Revenue/Capital breakdown sub-columns (`Unnamed: 4`, `Unnamed: 5`, etc.) were consolidated into Total Crores in Step 2.

---

## 4. Nullable Database Fields & Future Data Mapping

The following database fields do not exist in the current Union Budget expenditure CSV and are set to `NULL` until detailed scheme text sources are processed:

- `description`: Set to `NULL`.
- `scheme_level`: Set to `NULL`.
- `state`: Set to `NULL`.
- `eligibility_text`: Set to `NULL`. (Original text will be populated here when real scheme documents are ingested).
- `benefits`: Set to `NULL`.
- `application_process`: Set to `NULL`.
- `official_url`: Set to `NULL`.
- `source_url`: Set to `NULL`.
- `last_updated`: Set to `NULL`.

---

## 5. Integrity & Pipeline Compliance Verification

1. **No Data Fabrication**: No synthetic text, invented criteria, or dummy rows are created.
2. **No LLM Parsing at Database Layer**: Raw textual fields are declared as `TEXT` (`String?`) to preserve future original government guidelines without pre-structuring.
3. **Strict Non-Destructive Mapping**: Every valid government record (637 rows) in `government_schemes_cleaned.csv` maps directly to a valid database row.
