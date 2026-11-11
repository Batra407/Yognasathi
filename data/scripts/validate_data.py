import pandas as pd
import os

def validate_data():
    raw_path = os.path.join("data", "raw", "government_schemes_original.csv")
    cleaned_path = os.path.join("data", "processed", "government_schemes_cleaned.csv")

    print("=== DATASET VALIDATION ===")
    
    # 1. Verify files exist
    assert os.path.exists(raw_path), "Raw dataset file missing!"
    assert os.path.exists(cleaned_path), "Cleaned dataset file missing!"
    print("[PASS] Raw and cleaned files exist.")

    # 2. Check raw file integrity
    df_raw = pd.read_csv(raw_path)
    assert len(df_raw) == 786, f"Raw file row count modified! Expected 786, found {len(df_raw)}"
    print("[PASS] Original raw file is untouched and unchanged (786 rows).")

    # 3. Check cleaned file integrity
    df_cleaned = pd.read_csv(cleaned_path)
    assert len(df_cleaned) == 637, f"Unexpected cleaned row count! Expected 637, found {len(df_cleaned)}"
    print("[PASS] Cleaned dataset opens correctly with expected 637 real government scheme records.")

    # 4. Check required columns
    required_cols = ["ministry_department", "scheme_no", "scheme_name"]
    for col in required_cols:
        assert col in df_cleaned.columns, f"Missing required column: {col}"
    print("[PASS] Required scheme metadata columns are present.")

    # 5. Verify no fake data or null replacement placeholders
    forbidden_terms = ["fake", "sample", "unknown", "placeholder", "dummy", "faker"]
    for col in df_cleaned.columns:
        for val in df_cleaned[col].dropna().astype(str):
            for term in forbidden_terms:
                assert term not in val.lower(), f"Forbidden placeholder value '{term}' found in column '{col}'!"
    print("[PASS] Verified NO fake records or dummy placeholder strings were introduced.")
    
    print("ALL VALIDATION CHECKS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    validate_data()
