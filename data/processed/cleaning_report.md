# Dataset Cleaning & Quality Report

## 1. Dataset Summary

- **Original Row Count**: 786
- **Cleaned Row Count**: 637
- **Original Column Count**: 17
- **Cleaned Column Count**: 7

## 2. Duplicate Detection

- **Exact Duplicates Found**: 0
- **Exact Duplicates Removed**: 0
- **Potential Scheme Name Duplicates Logged**: 39
- **Duplicate Report File**: `data/processed/duplicate_report.csv`

## 3. Missing Value Statistics (Cleaned Dataset)

| Column | Missing Count | Missing % |
|:-------|--------------:|----------:|
| `ministry_department` | 0 | 0.00% |
| `scheme_no` | 0 | 0.00% |
| `scheme_name` | 0 | 0.00% |
| `actuals_2024_2025_total_crores` | 0 | 0.00% |
| `be_2025_2026_total_crores` | 0 | 0.00% |
| `re_2025_2026_total_crores` | 0 | 0.00% |
| `be_2026_2027_total_crores` | 0 | 0.00% |

## 4. Transformations Performed

1. **Whitespace Trimming & Normalization**: Stripped leading/trailing spaces and replaced consecutive whitespace with single spaces.
2. **Ministry/Department Context Propagation**: Associated each scheme with its parent Ministry/Department header from the raw budget structure.
3. **Removed Unnecessary Artifact Columns**: Dropped empty Excel export artifact columns (`Unnamed: 0` and `1`).
4. **Zero Fabrication**: Genuinely missing values were kept as `NULL` / empty strings. No values were guessed or invented.

## 5. Remaining Data Quality & Future Notes

- **Eligibility Criteria**: Official eligibility conditions exist in supplementary scheme guidelines. Structured eligibility extraction will be conducted in subsequent modules without modifying the raw source.
- **Financial Zeroes**: Outlays with `0` or missing values reflect actual government budget allocations or completed sub-schemes.
