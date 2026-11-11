# Dataset B Field Mapping Documentation: myScheme API → PostgreSQL

This document specifies the exact field mapping configuration between official **myScheme Service API payloads** (via API Setu) and the PostgreSQL models defined in `prisma/schema.prisma` (`GovernmentScheme`, `GovernmentSchemeSource`, and `SchemeSourceMapping`).

---

## 1. Field Mapping Specification

| Source API Field | Target PostgreSQL Field | DB Data Type | Required / Optional | Transformation & Handling | Source Evidence |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `scheme_id` / `slug` | `GovernmentScheme.sourceId` | `VARCHAR(255)` | Optional (*Unique*) | **Direct**: Identifier string from myScheme API. | Pending verification from real API response |
| `scheme_name` | `GovernmentScheme.schemeName` | `VARCHAR(500)` | **Required** | **Direct**: Official full title of the government scheme. | Pending verification from real API response |
| `scheme_short_title` | `GovernmentScheme.schemeShortTitle` | `VARCHAR(255)` | Optional | **Direct**: Acronym or short name (e.g. *PM-KISAN*). | Pending verification from real API response |
| `ministry` | `GovernmentScheme.ministry` | `VARCHAR(255)` | Optional | **Direct**: Administering Central Ministry name. | Pending verification from real API response |
| `department` | `GovernmentScheme.departmentName` | `VARCHAR(255)` | Optional | **Direct**: Administering Department name. | Pending verification from real API response |
| `scheme_level` | `GovernmentScheme.schemeLevel` | `VARCHAR(100)` | Optional | **Direct**: "Central Sector", "Centrally Sponsored", or "State". | Pending verification from real API response |
| `state_name` | `GovernmentScheme.stateName` | `VARCHAR(100)` | Optional | **Direct**: Applicable State/UT name. | Pending verification from real API response |
| `description` | `GovernmentScheme.description` | `TEXT` | Optional | **Direct**: Full text overview of scheme objectives. | Pending verification from real API response |
| `eligibility_criteria` | `GovernmentScheme.eligibilityText` | `TEXT` | Optional | **Direct**: Original unparsed narrative eligibility guidelines. | Pending verification from real API response |
| `benefits` | `GovernmentScheme.benefits` | `TEXT` | Optional | **Direct**: Qualitative and financial benefit descriptions. | Pending verification from real API response |
| `target_beneficiaries` | `GovernmentScheme.targetBeneficiaries` | `TEXT` | Optional | **Transformed**: Stringified array/text of beneficiary categories (*Farmers, Women, Students, MSMEs*). | Pending verification from real API response |
| `application_process` | `GovernmentScheme.applicationProcess` | `TEXT` | Optional | **Direct**: Step-by-step application instructions. | Pending verification from real API response |
| `required_documents` | `GovernmentScheme.requiredDocuments` | `TEXT` | Optional | **Transformed**: Stringified array/text of required documents (*Aadhaar, Land Record, Passbook*). | Pending verification from real API response |
| `official_url` | `GovernmentScheme.officialUrl` | `VARCHAR(500)` | Optional | **Direct**: Official government web portal URL. | Pending verification from real API response |
| `last_updated` | `GovernmentScheme.sourceLastUpdated` | `TIMESTAMP` | Optional | **Parsed**: DateTime timestamp of last official update. | Pending verification from real API response |

---

## 2. Policy Enforcements

- **NO LLM Paraphrasing / Summarization**: Original government text is preserved word-for-word in `eligibility_text`, `description`, and `benefits`.
- **NULL Handling**: Missing or omitted fields in raw payloads are stored as `NULL`. No dummy values are substituted.
- **Unobserved Fields Notice**: Because live API Setu credentials are not yet configured in `.env`, all source field keys remain marked as `Pending verification from real API response`.
