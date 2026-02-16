import pandas as pd
import sys

# Load the dataset
file_path = r'C:\Users\mkart\New folder (3)\smart-hospital-tracker\CMCHIS_Cleaned.xlsx'
output_file = r'C:\Users\mkart\New folder (3)\smart-hospital-tracker\results.txt'

try:
    df = pd.read_excel(file_path)
except Exception as e:
    print(f"Error reading file: {e}")
    sys.exit(1)

with open(output_file, 'w', encoding='utf-8') as f:
    if df.empty:
        f.write("No hospitals found under CMCHIS insurance.")
    else:
        count = len(df)
        f.write(f"Found {count} hospitals supporting CMCHIS.\n")
        f.write("Displaying the first 5 results:\n\n")

        for index, row in df.head(5).iterrows():
            f.write(f"Hospital Name: {row['Hospital Name']}\n")
            district = row['District'] if pd.notna(row['District']) else ""
            state = row['State'] if pd.notna(row['State']) else ""
            f.write(f"District, State: {district}, {state}\n")
            
            specialist = row['Specialties'] if pd.notna(row['Specialties']) else "General"
            f.write(f"Specialist: {specialist}\n")
            
            contact = row['Contact'] if pd.notna(row['Contact']) else "Not Available"
            f.write(f"Contact Number: {contact}\n")
            
            email = row['Email'] if pd.notna(row['Email']) else "Not Available"
            f.write(f"Email: {email}\n")
            f.write("-" * 30 + "\n")
            
        if count > 5:
            f.write(f"\n... and {count - 5} more hospitals.\n")

print("Output written to results.txt")
