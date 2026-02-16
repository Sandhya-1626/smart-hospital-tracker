import pandas as pd
import sys

files = [
    r"C:\Users\mkart\New folder (3)\smart-hospital-tracker\CMCHIS_Cleaned.xlsx",
    r"C:\Users\mkart\New folder (3)\smart-hospital-tracker\insurance dataset.xlsx"
]

for f in files:
    try:
        print(f"--- INSPECTING: {f} ---")
        df = pd.read_excel(f)
        print("COLUMNS:", df.columns.tolist())
        print("FIRST ROW:", df.iloc[0].to_dict())
        print("-------------------------------")
    except Exception as e:
        print(f"Error reading {f}: {e}")
