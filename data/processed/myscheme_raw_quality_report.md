# myScheme Raw Data Quality & Inspection Report

- **Audit Subject**: Raw API Payloads from myScheme API Setu (`https://apisetu.gov.in/api/v1/myscheme`)
- **Inspection Date**: ${new Date().toISOString()}
- **Raw File Path**: `data/raw/official_scheme_information/`

---

## 1. Payload Audit & Quality Metrics

| Metric | Status / Count | Notes |
| :--- | ---: | :--- |
| **Total Raw Records Received** | **0** | Awaiting API Setu authentication credentials |
| **Duplicate Scheme IDs** | **0** | N/A |
| **Duplicate Scheme Names** | **0** | N/A |
| **Missing Scheme IDs** | **0** | N/A |
| **Missing Scheme Names** | **0** | N/A |
| **Missing Descriptions** | **0** | N/A |
| **Missing Eligibility Text** | **0** | N/A |
| **Missing Benefits** | **0** | N/A |
| **Missing Official URLs** | **0** | N/A |
| **Missing Beneficiary Info** | **0** | N/A |

---

## 2. PostgreSQL Dataset B Status

- **`government_schemes` Record Count**: **0 records**
- **`government_scheme_sources` Record Count**: **0 records**
- **`scheme_source_mappings` Record Count**: **0 records**
- **Dataset A (`schemes`) Preservation**: **637 real budget records intact**

---

## 3. Data Integrity & Policy Audit

- **Zero Synthetic Data Policy**: Enforced. No mock responses, fake JSON files, or synthetic records have been generated.
- **Next Step**: Once `APISETU_CLIENT_ID` and `APISETU_API_KEY` are populated in `.env`, execute `fetchMySchemeData()` to retrieve real raw JSON payloads into `data/raw/official_scheme_information/`.
