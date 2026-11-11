# Dataset B Data Mapping Documentation: myScheme API → PostgreSQL

This document specifies the database field mapping between official **myScheme Service API payloads** (via API Setu) and the PostgreSQL models defined in `prisma/schema.prisma` (`GovernmentScheme`, `GovernmentSchemeSource`, and `SchemeSourceMapping`).

---

## 1. Data Mapping Table

| Official API Field Name | Database Model | PostgreSQL Column Name | DB Field Type | Required / Nullable | Transformation & Handling |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `scheme_id` / `slug` | `GovernmentScheme` | `source_id` | `VARCHAR(255)` | Nullable (*Unique*) | **Direct**: Unique scheme identifier string from myScheme API. |
| `scheme_name` | `GovernmentScheme` | `scheme_name` | `VARCHAR(500)` | **Required** | **Direct**: Official full title of the government scheme. |
| `scheme_short_title` | `GovernmentScheme` | `scheme_short_title` | `VARCHAR(255)` | Nullable | **Direct**: Short name or acronym (e.g. *PM-KISAN*). |
| `ministry` | `GovernmentScheme` | `ministry` | `VARCHAR(255)` | Nullable | **Direct**: Administering Central Ministry name. |
| `department` | `GovernmentScheme` | `department_name` | `VARCHAR(255)` | Nullable | **Direct**: Administering Department name. |
| `scheme_level` | `GovernmentScheme` | `scheme_level` | `VARCHAR(100)` | Nullable | **Direct**: "Central Sector", "Centrally Sponsored", or "State". |
| `state_name` | `GovernmentScheme` | `state_name` | `VARCHAR(100)` | Nullable | **Direct**: State/UT applicability ("All India" or State name). |
| `description` | `GovernmentScheme` | `description` | `TEXT` | Nullable | **Direct**: Narrative text overview of scheme objectives. |
| `eligibility_criteria` | `GovernmentScheme` | `eligibility_text` | `TEXT` | Nullable | **Direct**: Raw unparsed narrative eligibility guidelines. |
| `benefits` | `GovernmentScheme` | `benefits` | `TEXT` | Nullable | **Direct**: Qualitative and financial benefit descriptions. |
| `target_beneficiaries` | `GovernmentScheme` | `target_beneficiaries` | `TEXT` | Nullable | **Transformed**: Stringified array/text of beneficiary groups (*Farmers, Women, Students, MSMEs*). |
| `application_process` | `GovernmentScheme` | `application_process` | `TEXT` | Nullable | **Direct**: Step-by-step application instructions. |
| `required_documents` | `GovernmentScheme` | `required_documents` | `TEXT` | Nullable | **Transformed**: Stringified array/text of required documents (*Aadhaar, Land Record, Passbook*). |
| `official_url` | `GovernmentScheme` | `official_url` | `VARCHAR(500)` | Nullable | **Direct**: Official government web portal URL. |
| `source_last_updated` | `GovernmentScheme` | `source_last_updated` | `TIMESTAMP` | Nullable | **Parsed**: DateTime timestamp of last official update. |
| `_raw_payload` | `GovernmentSchemeSource` | `raw_payload` | `TEXT` | Nullable | **Preserved**: Complete raw JSON payload snippet for audit trail. |

---

## 2. Unobserved API Fields Policy

> **Status Notice**: All field names listed above are derived from the official API Setu myScheme Service API specification ([`docs/official-scheme-information-source.md`](file:///c:/Users/Ansh/OneDrive/Documents/nextjsproject/docs/official-scheme-information-source.md)). 
> Because live API Setu credentials are pending, exact key names in actual JSON payloads remain marked as:
> **`Pending verification from real API response`**

---

## 3. Provenance & Source Audit Mapping

Every record inserted into `GovernmentScheme` automatically populates:
- `source_name`: Default `"myScheme API Setu"`.
- `source_url`: Default `"https://apisetu.gov.in/directory/api/myscheme"`.
- `retrieved_at`: Server timestamp (`now()`).

A corresponding entry is created in `GovernmentSchemeSource` (`government_scheme_sources`) to maintain source provenance history.

---

## 4. Dataset A & Dataset B Separation Policy

- **Dataset A (`schemes`)**: Stores Union Budget financial expenditure records. **NOT modified**.
- **Dataset B (`government_schemes`)**: Stores myScheme qualitative metadata.
- **Linkage (`scheme_source_mappings`)**: An optional junction table stores verified matches (`match_type: "EXACT"`) between Dataset A and Dataset B without altering either dataset.
