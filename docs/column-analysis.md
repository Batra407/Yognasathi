# Column Analysis Report: Government Schemes Dataset

This document provides a detailed analysis and classification of all 17 columns present in the official raw Government of India dataset (`data/raw/government_schemes_original.csv`).

## Summary of Raw Columns

Total Rows in Raw File: **786**
Total Columns in Raw File: **17**

| Index | Raw Column Name | Inferred Data Type | Missing Count | Missing % | Classification | Retention Decision |
|:-----:|:----------------|:------------------:|--------------:|----------:|:---------------|:-------------------|
| 0 | `Unnamed: 0` | float64 | 786 | 100.0% | Redundant / Empty | **Remove** (Empty artifact column from original Excel conversion) |
| 1 | `Expenditure Profile 2026-2027` | object (string) | 2 | 0.25% | Required | **Retain** (Contains Ministry / Department names, Demand numbers, and raw header text) |
| 2 | `Unnamed: 2` | float64 / str | 149 | 18.96% | Required | **Retain** (Contains official Scheme Number e.g., 1.0, 2.0, 3.0) |
| 3 | `Unnamed: 3` | object (string) | 149 | 18.96% | Required | **Retain** (Contains official Scheme Name e.g., *Crop Insurance Scheme*, *PM-Kisan*, *NAMO DRONE DIDI*) |
| 4 | `Unnamed: 4` | object (string/float) | 75 | 9.54% | Potentially Useful | **Retain** (Actuals 2024-2025 Revenue outlay in ₹ Crores) |
| 5 | `Unnamed: 5` | object (string/float) | 76 | 9.67% | Potentially Useful | **Retain** (Actuals 2024-2025 Capital outlay in ₹ Crores) |
| 6 | `Unnamed: 6` | object (string/float) | 76 | 9.67% | Potentially Useful | **Retain** (Actuals 2024-2025 Total outlay in ₹ Crores) |
| 7 | `Unnamed: 7` | object (string/float) | 75 | 9.54% | Potentially Useful | **Retain** (Budget Estimates 2025-2026 Revenue outlay in ₹ Crores) |
| 8 | `Unnamed: 8` | object (string/float) | 76 | 9.67% | Potentially Useful | **Retain** (Budget Estimates 2025-2026 Capital outlay in ₹ Crores) |
| 9 | `Unnamed: 9` | object (string/float) | 76 | 9.67% | Potentially Useful | **Retain** (Budget Estimates 2025-2026 Total outlay in ₹ Crores) |
| 10 | `Unnamed: 10` | object (string/float) | 75 | 9.54% | Potentially Useful | **Retain** (Revised Estimates 2025-2026 Revenue outlay in ₹ Crores) |
| 11 | `Unnamed: 11` | object (string/float) | 76 | 9.67% | Potentially Useful | **Retain** (Revised Estimates 2025-2026 Capital outlay in ₹ Crores) |
| 12 | `Unnamed: 12` | object (string/float) | 76 | 9.67% | Potentially Useful | **Retain** (Revised Estimates 2025-2026 Total outlay in ₹ Crores) |
| 13 | `Unnamed: 13` | object (string/float) | 75 | 9.54% | Potentially Useful | **Retain** (Budget Estimates 2026-2027 Revenue outlay in ₹ Crores) |
| 14 | `Unnamed: 14` | object (string/float) | 76 | 9.67% | Potentially Useful | **Retain** (Budget Estimates 2026-2027 Capital outlay in ₹ Crores) |
| 15 | `1` | float64 | 786 | 100.0% | Redundant / Empty | **Remove** (Empty column artifact) |
| 16 | `Unnamed: 16` | object (string/float) | 76 | 9.67% | Potentially Useful | **Retain** (Budget Estimates 2026-2027 Total outlay in ₹ Crores) |

---

## Column Mapping & Standardized Names for Cleaned Output

In the cleaned dataset (`data/processed/government_schemes_cleaned.csv`), columns are standardized as follows:

1. `ministry_department`: Ministry or Department administering the scheme (propagated from structural headers).
2. `scheme_no`: Official scheme item number assigned in government records.
3. `scheme_name`: Official Government Scheme Name (trimmed, normalized text).
4. `actuals_2024_2025_total`: Actual financial outlay (₹ Crores) for 2024-2025.
5. `be_2025_2026_total`: Budget Estimates outlay (₹ Crores) for 2025-2026.
6. `re_2025_2026_total`: Revised Estimates outlay (₹ Crores) for 2025-2026.
7. `be_2026_2027_total`: Budget Estimates outlay (₹ Crores) for 2026-2027.
