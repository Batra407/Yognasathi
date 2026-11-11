# Official Data Source Documentation: Government Schemes Dataset

This document details the official source, origin, licensing, and metadata for the raw government schemes dataset used in the Multilingual Government Scheme Voice Assistant project.

## 1. Source Metadata

- **Official Source Name**: Ministry of Finance, Government of India — Union Budget Expenditure Profile (Statement 4A & Statement 4B: Central Sector & Centrally Sponsored Schemes)
- **Government Organization**: Ministry of Finance / National Informatics Centre (NIC) / Government of India
- **Official Portal URL**: [https://www.indiabudget.gov.in](https://www.indiabudget.gov.in)
- **Dataset Direct URL**: [https://www.indiabudget.gov.in/doc/eb/stat4b.xlsx](https://www.indiabudget.gov.in/doc/eb/stat4b.xlsx) & [https://www.indiabudget.gov.in/doc/eb/stat4a.xlsx](https://www.indiabudget.gov.in/doc/eb/stat4a.xlsx)
- **Download Date**: September 17, 2026
- **Original Filename**: `government_schemes_original.csv`
- **Untouched File Location**: `data/raw/government_schemes_original.csv`
- **Cleaned File Location**: `data/processed/government_schemes_cleaned.csv`

## 2. Dataset Structure

- **Original Number of Records (Rows)**: 786
- **Cleaned Number of Records (Rows)**: 637
- **Original Number of Columns**: 17
- **Final Cleaned Columns**: 7
- **Data Format**: CSV (UTF-8 Encoded)

## 3. Original Column Names

1. `Unnamed: 0` (Empty artifact column)
2. `Expenditure Profile 2026-2027` (Ministry/Department header & raw text)
3. `Unnamed: 2` (Scheme Item Number)
4. `Unnamed: 3` (Official Scheme Name)
5. `Unnamed: 4` (Actuals 2024-2025 Revenue Outlay)
6. `Unnamed: 5` (Actuals 2024-2025 Capital Outlay)
7. `Unnamed: 6` (Actuals 2024-2025 Total Outlay in ₹ Crores)
8. `Unnamed: 7` (Budget Estimates 2025-2026 Revenue Outlay)
9. `Unnamed: 8` (Budget Estimates 2025-2026 Capital Outlay)
10. `Unnamed: 9` (Budget Estimates 2025-2026 Total Outlay in ₹ Crores)
11. `Unnamed: 10` (Revised Estimates 2025-2026 Revenue Outlay)
12. `Unnamed: 11` (Revised Estimates 2025-2026 Capital Outlay)
13. `Unnamed: 12` (Revised Estimates 2025-2026 Total Outlay in ₹ Crores)
14. `Unnamed: 13` (Budget Estimates 2026-2027 Revenue Outlay)
15. `Unnamed: 14` (Budget Estimates 2026-2027 Capital Outlay)
16. `1` (Empty artifact column)
17. `Unnamed: 16` (Budget Estimates 2026-2027 Total Outlay in ₹ Crores)

## 4. License & Usage Information

- **License**: Government Open Data License - India (GODL) / Open Data Access Policy under National Data Sharing and Accessibility Policy (NDSAP).
- **Public Domain Access**: Freely accessible for public information, welfare research, and civic guidance.

## 5. Limitations & Data Integrity Notes

- **Zero Fabrication**: No fake scheme records, dummy values, or synthetic eligibility text have been created.
- **Missing Values**: Genuinely missing values in the raw source are preserved as `NULL` / empty fields.
- **Eligibility Information**: Detailed eligibility guidelines published by individual ministries are maintained separately without altering raw official text.
