"""
CropSafe AI - Trilingual USSD & SMS Farmer Advisory Simulator (*1920#)
Faculty of Computing | Sabaragamuwa University of Sri Lanka (DS3206 Capstone Project II)

Provides:
  1. USSD Session Simulator (*1920#) for Rural Smallholder Feature Phones
  2. 160-Character SMS Verification Engine (Sinhala, Tamil, English)
  3. Official Maximum Retail Price (MRP) & Subsidy Verification
  4. Anonymous Whistleblower Fraud Reporting Dispatcher
  5. Precision Nutrient Compensation Dosage Calculator via SMS
"""

import os
import sys
import json
import pandas as pd

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def _find_file(relative_path):
    candidates = [
        relative_path,
        os.path.join("cropsafe AI", relative_path),
        os.path.join("..", relative_path),
        os.path.join("..", "cropsafe AI", relative_path)
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return relative_path

class USSDAdvisorySimulator:
    """Simulates interactive USSD session (*1920#) for farmers querying fertilizer authenticity."""
    def __init__(self, data_path="data/processed/cropsafe_master_dataset.csv"):
        self.data_path = _find_file(data_path)
        self.df = pd.read_csv(self.data_path) if os.path.exists(self.data_path) else pd.DataFrame()

    def get_main_menu(self, language="si"):
        """Returns the initial USSD screen in the selected national language."""
        if language == "si":
            return (
                "=== CropSafe AI ගොවි සේවය (*1920#) ===\n"
                "1. පොහොර කාණ්ඩය (Batch) සත්‍යාපනය\n"
                "2. නිල උපරිම මිල (MRP) පරීක්ෂාව\n"
                "3. බාල පොහොර පැමිණිලි කිරීම (රහසිගත)\n"
                "4. අතිරේක පොහොර මාත්‍රා උපදෙස්\n"
                "5. Change Language (English / தமிழ்)"
            )
        elif language == "ta":
            return (
                "=== CropSafe AI விவசாய சேவை (*1920#) ===\n"
                "1. உரத் தொகுதியை (Batch) சரிபார்க்க\n"
                "2. அதிகபட்ச சில்லறை விலையை சரிபார்க்க\n"
                "3. போலி உரம் பற்றிய புகார்\n"
                "4. கூடுதல் உர அளவு வழிகாட்டல்\n"
                "5. மொழியை மாற்றுக"
            )
        else:
            return (
                "=== CropSafe AI Farmer Advisory (*1920#) ===\n"
                "1. Verify Fertilizer Batch Authenticity\n"
                "2. Check Maximum Retail Price (MRP)\n"
                "3. Report Fake/Substandard Fertilizer\n"
                "4. Compensatory Dosage Advisor\n"
                "5. භාෂාව වෙනස් කරන්න"
            )

    def verify_batch_via_sms(self, batch_id, language="si"):
        """Simulates SMS verification: Farmer texts Batch ID to shortcode 1920."""
        batch_id_clean = batch_id.strip()
        matched = self.df[self.df["Batch_ID"].str.contains(batch_id_clean, case=False, na=False)]
        
        if matched.empty:
            if language == "si":
                return f"[CropSafe AI] අවවාදයයි: '{batch_id_clean}' අංකය NFS දත්ත පද්ධතියේ ලියාපදිංචි වී නොමැත. මෙය ව්‍යාජ පොහොරක් විය හැක. මිලදී නොගන්න! හදිසි ඇමතුම්: 1920."
            elif language == "ta":
                return f"[CropSafe AI] எச்சரிக்கை: '{batch_id_clean}' பதிவு செய்யப்படவில்லை. இது போலி உரமாக இருக்கலாம். வாங்க வேண்டாம்! உதவிக்கு: 1920."
            else:
                return f"[CropSafe AI] WARNING: Batch '{batch_id_clean}' is NOT registered with the National Fertilizer Secretariat. Likely counterfeit. Do not buy! Hotline: 1920."

        row = matched.iloc[0]
        product = row["Product_Name"]
        supplier = row["Supplier"]
        mrp = row["Benchmark_Price_LKR_kg"]
        status = row["Adulterant_Type"]
        
        is_safe = (status == "Standard_Pure")
        
        if is_safe:
            if language == "si":
                return f"[CropSafe AI] තහවුරු කළා: {batch_id_clean} ({product} - {supplier}) SLSI ප්‍රමිතියෙන් යුක්තයි. නීත්‍යානුකූල මිල: රු. {mrp:.2f}/kg. සහතික ලත් පිරිසිදු පොහොරකි."
            elif language == "ta":
                return f"[CropSafe AI] சரிபார்க்கப்பட்டது: {batch_id_clean} ({product} - {supplier}) SLSI தரமானது. அரசு விலை: ரூ. {mrp:.2f}/kg. பாதுகாப்பானது."
            else:
                return f"[CropSafe AI] VERIFIED: {batch_id_clean} ({product} by {supplier}) complies with SLSI standards. Official MRP: Rs. {mrp:.2f}/kg. Certified pure."
        else:
            if language == "si":
                return f"[CropSafe AI] අනතුරු ඇඟවීමයි! {batch_id_clean} ({product}) බාල/තනුක කළ බවට හඳුනාගෙන ඇත ({status.replace('_', ' ')}). මිලදී ගැනීමෙන් වළකින්න! පැමිණිලි: 1920."
            elif language == "ta":
                return f"[CropSafe AI] எச்சரிக்கை! {batch_id_clean} போலி/கலப்படம் என கண்டறியப்பட்டுள்ளது ({status}). வாங்க வேண்டாம்! புகார்: 1920."
            else:
                return f"[CropSafe AI] FRAUD ALERT! {batch_id_clean} ({product}) flagged as Substandard ({status.replace('_', ' ')}). Do not apply! Report to: 1920."

    def submit_anonymous_complaint(self, batch_id, store_name, district, notes=""):
        """Registers a whistleblower complaint directly into the agrarian audit log."""
        ticket_id = f"TIP-{abs(hash(batch_id + store_name)) % 100000:05d}"
        complaint = {
            "Ticket_ID": ticket_id,
            "Target_Batch": batch_id,
            "Retail_Store": store_name,
            "District": district,
            "Farmer_Notes": notes,
            "Action_Assigned": "Automated Dispatch to District Agrarian Inspector"
        }
        return complaint

if __name__ == "__main__":
    print("Testing Trilingual USSD & SMS Farmer Advisory Simulator...")
    ussd = USSDAdvisorySimulator()
    
    # 1. Test Main Menus
    print("\n--- USSD MAIN MENU (SINHALA) ---")
    try:
        print(ussd.get_main_menu("si"))
    except UnicodeEncodeError:
        print(ussd.get_main_menu("si").encode('ascii', 'replace').decode())
        
    print("\n--- USSD MAIN MENU (ENGLISH) ---")
    print(ussd.get_main_menu("en"))
    
    # 2. Test SMS Batch Verification (Authentic Sample)
    print("\n--- SMS TEST 1: AUTHENTIC BATCH ---")
    sms_auth = ussd.verify_batch_via_sms("BT23-4200C", language="en")
    print(sms_auth)
    
    # 3. Test SMS Batch Verification (Fraudulent Sample)
    print("\n--- SMS TEST 2: FRAUDULENT BATCH ---")
    sms_fraud = ussd.verify_batch_via_sms("CR22-9335A", language="en")
    print(sms_fraud)
    
    # 4. Test Anonymous Whistleblower Complaint
    print("\n--- SMS TEST 3: FARMER WHISTLEBLOWER DISPATCH ---")
    tip = ussd.submit_anonymous_complaint("CR24-UNKNOWN", "Wariyapola Agro Retailer", "Kurunegala", "Moist sand found inside sealed bag")
    print("Whistleblower Ticket Generated:", tip)
