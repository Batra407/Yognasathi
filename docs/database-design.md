# Database Design Documentation: Government Schemes Database

This document specifies the PostgreSQL database schema for storing official Government of India scheme data and supporting future eligibility matching for the Multilingual Government Scheme Voice Assistant.

---

## 1. Data Analysis & Eligibility Architecture Findings

### 1.1 Dataset Findings (from `data/processed/government_schemes_cleaned.csv`)
- **Total Records**: 637 clean scheme entries.
- **Total Columns**: 7 columns (`ministry_department`, `scheme_no`, `scheme_name`, `actuals_2024_2025_total_crores`, `be_2025_2026_total_crores`, `re_2025_2026_total_crores`, `be_2026_2027_total_crores`).
- **Data Origin**: Union Budget Expenditure Profile (Statements 4A & 4B: Central Sector and Centrally Sponsored Schemes).

### 1.2 Eligibility Data Representation
- **Analysis Result**: **Currently Free-Text / Reserved Nullable Field**.
- **Finding**: The official budget outlay dataset contains scheme identities, administering departments, and 4-year financial outlays (in ₹ Crores). Detailed eligibility criteria text is not included in this budget expenditure file.
- **Representation Strategy**:
  - `eligibility_text` is defined as a nullable `TEXT` column (`String?` in Prisma).
  - It will remain `NULL` until official scheme guidelines/notifications with eligibility criteria are attached.
  - No LLM extraction or synthetic attributes (`min_age`, `gender`, `income_limit`) are generated or invented.
  - When real eligibility text is imported in future steps, original government text will be preserved intact in `eligibility_text` without arbitrary conversion into numeric columns.

---

## 2. Entity Relationship Overview

The database uses a normalized PostgreSQL relational design consisting of three primary tables: `departments`, `categories`, and `schemes`.

```text
       ┌────────────────────────┐
       │      departments       │
       ├────────────────────────┤
       │ id (PK)                │
       │ name (Unique)          │
       └───────────┬────────────┘
                   │
                   │ 1
                   │
                   │ N
       ┌───────────▼────────────┐                   ┌────────────────────────┐
       │        schemes         │                   │       categories       │
       ├────────────────────────┤                   ├────────────────────────┤
       │ id (PK)                │ N               1 │ id (PK)                │
       │ department_id (FK) ────┼───────────────────┤ name (Unique)          │
       │ category_id (FK) ──────┼───────────────────┤ description            │
       │ scheme_no              │                   └────────────────────────┘
       │ scheme_name            │
       │ financial outlays...   │
       │ eligibility_text (NULL)│
       │ benefits (NULL)        │
       └────────────────────────┘
```

---

## 3. Table Specifications

### 3.1 `departments` Table

**Purpose**: Stores normalized government ministries and departments administering the schemes. Eliminates redundant string repetition across 637 records.

| Column Name | Data Type | Required / Nullable | PK / FK / Unique | Default | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / `UUID` | Required | **PK** | `uuid()` | Unique identifier for department |
| `name` | `VARCHAR(255)` | Required | **UNIQUE** | - | Department / Ministry name (e.g. *Department of Agriculture and Farmers Welfare*) |
| `created_at` | `TIMESTAMP` | Required | - | `now()` | Timestamp of row creation |
| `updated_at` | `TIMESTAMP` | Required | - | `updatedAt` | Timestamp of row update |

---

### 3.2 `categories` Table

**Purpose**: Stores scheme domain categories (e.g., Agriculture, Social Welfare, Education) to support sector-wise filtering.

| Column Name | Data Type | Required / Nullable | PK / FK / Unique | Default | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / `UUID` | Required | **PK** | `uuid()` | Unique identifier for category |
| `name` | `VARCHAR(255)` | Required | **UNIQUE** | - | Category name |
| `description` | `TEXT` | Nullable | - | `NULL` | Category description |
| `created_at` | `TIMESTAMP` | Required | - | `now()` | Timestamp of row creation |
| `updated_at` | `TIMESTAMP` | Required | - | `updatedAt` | Timestamp of row update |

---

### 3.3 `schemes` Table

**Purpose**: Central table storing scheme identity, official budget outlays (in ₹ Crores), and reserved nullable fields for future text enrichment.

| Column Name | Data Type | Required / Nullable | PK / FK / Unique | Default | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` / `UUID` | Required | **PK** | `uuid()` | Unique primary key for scheme |
| `scheme_no` | `DOUBLE PRECISION` | Required | - | - | Official scheme item number from Union Budget statement |
| `scheme_name` | `VARCHAR(500)` | Required | - | - | Official scheme title |
| `department_id` | `VARCHAR(36)` | Required | **FK** → `departments.id` | - | Foreign key referencing administering department |
| `category_id` | `VARCHAR(36)` | Nullable | **FK** → `categories.id` | `NULL` | Foreign key referencing category |
| `actuals_2024_2025_total_crores` | `NUMERIC(14,2)` | Required | - | `0.00` | Actual financial outlay for 2024-2025 (in ₹ Crores) |
| `be_2025_2026_total_crores` | `NUMERIC(14,2)` | Required | - | `0.00` | Budget estimate outlay for 2025-2026 (in ₹ Crores) |
| `re_2025_2026_total_crores` | `NUMERIC(14,2)` | Required | - | `0.00` | Revised estimate outlay for 2025-2026 (in ₹ Crores) |
| `be_2026_2027_total_crores` | `NUMERIC(14,2)` | Required | - | `0.00` | Budget estimate outlay for 2026-2027 (in ₹ Crores) |
| `description` | `TEXT` | Nullable | - | `NULL` | Full scheme description (reserved for future enrichment) |
| `scheme_level` | `VARCHAR(100)` | Nullable | - | `NULL` | Level e.g., "Central Sector" or "Centrally Sponsored" |
| `state` | `VARCHAR(100)` | Nullable | - | `NULL` | Target state/UT (NULL for national schemes) |
| `eligibility_text` | `TEXT` | Nullable | - | `NULL` | Raw unparsed official eligibility criteria text |
| `benefits` | `TEXT` | Nullable | - | `NULL` | Details of qualitative/quantitative scheme benefits |
| `application_process` | `TEXT` | Nullable | - | `NULL` | How to apply instructions |
| `official_url` | `VARCHAR(500)` | Nullable | - | `NULL` | Official government web portal link |
| `source_url` | `VARCHAR(500)` | Nullable | - | `NULL` | Source document / notification URL |
| `last_updated` | `TIMESTAMP` | Nullable | - | `NULL` | Last updated date of official record |
| `created_at` | `TIMESTAMP` | Required | - | `now()` | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | Required | - | `updatedAt` | Record modification timestamp |

**Indexes & Constraints**:
- **Unique Constraint**: `@@unique([department_id, scheme_name])` ensures scheme titles remain unique within each administering department.
- **Indexes**:
  - `@@index([department_id])` for fast filtering by ministry/department.
  - `@@index([category_id])` for category-based queries.
  - `@@index([scheme_name])` for search auto-completion.

---

## 4. Architectural Justification of Database Tables

1. **`departments` Table**:
   - **Why needed**: 71 distinct departments/ministries exist across 637 rows. Normalizing into a separate table ensures data integrity, avoids string duplication, and allows department-level metadata management.
2. **`categories` Table**:
   - **Why needed**: Decouples scheme classification from core scheme definitions. Allows optional tagging without altering scheme records.
3. **`schemes` Table**:
   - **Why needed**: Holds all primary attributes, financial outlays, and reserved fields in a clean 1-to-many relationship with `departments`.

---

## 5. Absolute Data Rules & Compliance Confirmation

- **Zero Fake Data**: No mock records, sample rows, or synthetic values were inserted into any database table.
- **No Dummy Eligibility**: Eligibility text fields are declared as nullable strings (`NULL`) and not fabricated.
- **Data Pipeline Integrity**: Database structure strictly maps 1-to-1 with `data/processed/government_schemes_cleaned.csv` and preserves raw financial metrics.
