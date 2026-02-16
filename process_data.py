import csv
import re
import sys

# Try to import openpyxl, if not present, we might need to install it or default to CSV
try:
    from openpyxl import Workbook
except ImportError:
    print("openpyxl not found. Please install it using: pip install openpyxl")
    sys.exit(1)

INPUT_FILE = r"C:\Users\mkart\New folder (3)\smart-hospital-tracker\CMCHIS.txt"
OUTPUT_FILE = r"C:\Users\mkart\New folder (3)\smart-hospital-tracker\CMCHIS_Cleaned.xlsx"

def clean_text(text):
    if not text:
        return "Not Available"
    text = str(text).strip()
    if text.lower() in ["nan", "none", "null", ""]:
        return "Not Available"
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text)
    return text.title()

def clean_email(email):
    if not email:
        return "Not Available"
    email = str(email).strip().lower()
    if not email or email.lower() in ["nan", "none", "null"]:
        return "Not Available"
    
    # Simple check for junk emails
    if len(email) < 5 or "@" not in email or email in ["m", "om", "l.com", "ices.com", "ail.com", "s.com", "are.com", "e.com", "ls.com", "ndia.com", ".com", ".in"]:
        return "Not Available"
    return email

def clean_contact(contact):
    if not contact:
        return "Not Available"
    contact = str(contact).strip()
    # Remove non-digit characters
    digits = re.sub(r'\D', '', contact)
    
    # Filter junk numbers
    if not digits:
        return "Not Available"
    if all(d == digits[0] for d in digits) and len(digits) > 5: # e.g. 1111111111, 8888888888
        return "Not Available"
    if digits == "0":
        return "Not Available"
    if len(digits) < 6: # Too short to be valid phone
        return "Not Available"
    if digits == "9898989898": # Common dummy number seen in file (optional heuristic)
        return "Not Available"
        
    return digits

def process_data():
    all_rows = []
    
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading file: {e}")
        return

    # Part 1 (Line 2 to 362)
    # Header format: S.No,Hospital Name,District,State,Contact,Email,Specialties
    part1_lines = lines[1:362]
    reader1 = csv.reader(part1_lines)
    for row in reader1:
        if not row: continue
        if len(row) >= 7:
            new_row = {
                "Hospital Name": row[1],
                "City": "Not Available",
                "District": row[2],
                "State": row[3],
                "Contact": row[4],
                "Email": row[5],
                "Specialties": ", ".join(row[6:])
            }
            all_rows.append(new_row)

    # Part 2 (Line 364 onwards)
    # Header format: S.No,Hospital Name,City,District,State,Contact,Email,Specialties
    part2_lines = lines[363:]
    reader2 = csv.reader(part2_lines)
    for row in reader2:
        if not row: continue
        if len(row) >= 8:
            new_row = {
                "Hospital Name": row[1],
                "City": row[2],
                "District": row[3],
                "State": row[4],
                "Contact": row[5],
                "Email": row[6],
                "Specialties": ", ".join(row[7:])
            }
            all_rows.append(new_row)

    # Clean Data
    cleaned_rows = []
    seen = set()
    
    for row in all_rows:
        # Clean fields
        hospital = clean_text(row["Hospital Name"])
        city = clean_text(row["City"])
        district = clean_text(row["District"])
        state = clean_text(row["State"])
        contact = clean_contact(row["Contact"])
        email = clean_email(row["Email"])
        specialties = clean_text(row["Specialties"])
        
        # Deduplication key
        key = (hospital.lower(), contact)
        if key in seen:
            continue
        seen.add(key)
        
        cleaned_rows.append([hospital, city, district, state, contact, email, specialties])

    # Sort by State, District, City
    # Note: City might be "Not Available", so we sort carefully
    cleaned_rows.sort(key=lambda x: (x[3], x[2], x[1]))

    # Export to Excel using openpyxl
    wb = Workbook()
    ws = wb.active
    ws.title = "Hospitals"
    
    # Headers
    headers = ["Hospital Name", "City", "District", "State", "Contact", "Email", "Specialties"]
    ws.append(headers)
    
    for row in cleaned_rows:
        ws.append(row)
        
    wb.save(OUTPUT_FILE)
    print(f"Successfully created {OUTPUT_FILE} with {len(cleaned_rows)} rows.")

if __name__ == "__main__":
    process_data()
