# Punjab Schemes Database Ingestion Report

- **Import Timestamp**: 2026-10-27T16:48:49.218Z
- **Status**: **SUCCESS**
- **Mode**: LIVE POSTGRESQL IMPORT

---

## 1. Ingestion Summary

| Metric | Count |
| :--- | ---: |
| **Total Verified Records in CSV** | **20** |
| **New Records Inserted** | **20** |
| **Existing Records Updated (Idempotent)** | **0** |
| **Skipped Unverified Records** | **0** |
| **Total Active Punjab Schemes in Database** | **20** |

---

## 2. Dataset Separation & Safety Verification

- **Dataset A (Union Budget Expenditure Profile)**: Exactly **637** records preserved (0 modifications).
- **Dataset B / State Schemes (`government_schemes`)**: Ingested with primary keys and unique `source_id` slugs.
- **Audit Provenance (`government_scheme_sources`)**: Associated source provenance entries created for each ingested scheme.

---

## 3. Ingested Schemes Roster

1. **Disabled Person Pension Scheme - Punjab** (`dpps`) — *Department of Social Security and Development of Women and Children* [State]
2. **Old Age Pension Scheme - Punjab** (`oapsp`) — *Department of Social Security and Development of Women and Children* [State]
3. **Dependent Children Pension Scheme - Punjab** (`dcps`) — *Department of Social Security and Development of Women and Children* [State]
4. **Widow / Destitute Women Pension Scheme - Punjab** (`wdwps`) — *Department of Social Security and Development of Women and Children* [State]
5. **Ashirwad Scheme - Punjab** (`as-pb`) — *Department of Social Justice, Empowerment and Minorities* [State]
6. **Balri Birth Gift Scheme (P.B.O.C.W.W.B)** (`bbgs-pbocwwb`) — *Punjab Building and Other Construction Workers Welfare Board* [State]
7. **Bed & Breakfast / Homestay Scheme - Punjab** (`bbhs`) — *Department of Tourism & Cultural Affairs* [State]
8. **Punjab Farm Tourism Scheme** (`pfts`) — *Department of Tourism & Cultural Affairs* [State]
9. **Untied Funds of Hon’ble CM/FM** (`pb-plan-untied-cmfm`) — *Department of Planning* [State]
10. **Punjab Nirman Programme** (`pb-plan-pnp`) — *Department of Planning* [State]
11. **Untied Funds of District Planning Committees (DPCs)** (`pb-plan-dpc`) — *Department of Planning* [State]
12. **Assistance to Non-Governmental Organizations (NGO)** (`pb-plan-ngo`) — *Department of Planning* [State]
13. **Rangla Punjab Vikas Scheme** (`pb-plan-rpvs`) — *Department of Planning* [State]
14. **PM-24 Consultancy Seminars / Pilot Study / Quick Survey of Plan Projects** (`pb-plan-pm24`) — *Department of Planning* [State]
15. **Public Investment Management (PIM) Framework** (`pb-plan-pim`) — *Department of Planning* [State]
16. **Border Area Development Programme (BADP)** (`pb-plan-badp`) — *Department of Planning* [Centrally Sponsored]
17. **Indira Gandhi National Old Age Pension Scheme (Punjab)** (`ignoaps-pb`) — *Department of Social Security and Development of Women and Children* [Centrally Sponsored]
18. **National Family Benefit Scheme (Punjab)** (`nfbs-pb`) — *Department of Social Security and Development of Women and Children* [Centrally Sponsored]
19. **Ayushman Bharat Mukh Mantri Sehat Bima Yojana (AB-MMSBY)** (`ab-mmsby`) — *Department of Health and Family Welfare* [State]
20. **Punjab Free Domestic Electricity Scheme (300 Units Free Power per month)** (`pb-free-power-300`) — *Department of Power* [State]
