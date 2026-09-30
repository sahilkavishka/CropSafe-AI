import sqlite3
import os
import json
from datetime import datetime
from typing import Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "cropsafe_national.db")

def init_db():
    """Initializes the SQLite database with required tables for CropSafe GovTech."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Users Table (Farmers & Officers)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT UNIQUE,
            role TEXT,
            role_title_si TEXT,
            role_title_en TEXT,
            full_name_si TEXT,
            full_name_en TEXT,
            identifier TEXT UNIQUE,  -- NIC or Service ID
            phone TEXT,
            password_hash TEXT,
            avatar_icon TEXT,
            theme_color TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 2. Farmer Profiles Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS farmer_profiles (
            user_id TEXT PRIMARY KEY,
            district TEXT,
            district_si TEXT,
            asc_division TEXT,
            asc_code TEXT,
            dad_farmer_id TEXT,
            land_acres REAL,
            crop TEXT,
            yaya_name TEXT,
            FOREIGN KEY(user_id) REFERENCES users(user_id)
        )
    ''')

    # 3. Officer Profiles Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS officer_profiles (
            user_id TEXT PRIMARY KEY,
            facility_name_si TEXT,
            facility_name_en TEXT,
            district TEXT,
            agency TEXT,
            laboratory_name_si TEXT,
            laboratory_name_en TEXT,
            jurisdiction_si TEXT,
            jurisdiction_en TEXT,
            ministry TEXT,
            FOREIGN KEY(user_id) REFERENCES users(user_id)
        )
    ''')
    
    # 4. User Permissions Table (Many-to-Many logic via JSON list for simplicity in SQLite)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_permissions (
            user_id TEXT PRIMARY KEY,
            permissions_json TEXT,
            FOREIGN KEY(user_id) REFERENCES users(user_id)
        )
    ''')

    conn.commit()
    seed_official_personas(conn)
    conn.close()

def seed_official_personas(conn):
    """Seeds the 4 GovNet Officer Demo Accounts so they are always available."""
    cursor = conn.cursor()
    
    # Check if officers exist
    cursor.execute("SELECT COUNT(*) FROM users WHERE role != 'FARMER'")
    if cursor.fetchone()[0] > 0:
        return
        
    officers = [
        {
            "user_id": "USR-WMS-7701",
            "role": "WAREHOUSE_OFFICER",
            "role_title_si": "රජයේ පොහොර ගබඩාභාරකරු",
            "role_title_en": "Warehouse Storekeeper",
            "full_name_si": "පොහොර ගබඩා පාලන අංශය",
            "full_name_en": "Warehouse Division",
            "identifier": "WMS-ASC-7701",
            "avatar_icon": "🏢",
            "theme_color": "amber",
            "facility_name_si": "තඹුත්තේගම මධ්‍යම ගොවිජන පොහොර ගබඩාව",
            "facility_name_en": "Tambuttegama Central Agrarian Fertilizer Depot",
            "district": "Anuradhapura",
            "agency": "Department of Agrarian Development & Ceylon Fertilizer Co.",
            "permissions": ["MANAGE_BAY_INVENTORY", "CONTROL_IOT_SENSORS", "SCAN_FARMER_QR_TOKEN", "DISPENSE_FERTILIZER_QUOTA"]
        },
        {
            "user_id": "USR-LAB-2026",
            "role": "LAB_CHEMIST",
            "role_title_si": "ප්‍රධාන රසායන විද්‍යාඥ & තත්ත්ව විගණක",
            "role_title_en": "Chief Soil & Fertilizer Chemist",
            "full_name_si": "ජාතික තත්ත්ව විද්‍යාගාරය",
            "full_name_en": "National Quality Lab",
            "identifier": "SLSI-CH-2026",
            "avatar_icon": "🔬",
            "theme_color": "blue",
            "laboratory_name_si": "ජාතික පොහොර ප්‍රමිති හා තත්ත්ව පරීක්ෂණාගාරය (වැලිසර)",
            "laboratory_name_en": "National Fertilizer Quality Lab (Welisara)",
            "permissions": ["RUN_SPECTROMETRY_ANALYSIS", "DETECT_ADULTERATION_ML", "ISSUE_COA_CERTIFICATE"]
        },
        {
            "user_id": "USR-ENF-4180",
            "role": "FIELD_INSPECTOR",
            "role_title_si": "බලාත්මක කිරීමේ නිලධාරී",
            "role_title_en": "Enforcement Inspector",
            "full_name_si": "බලාත්මක කිරීමේ අංශය",
            "full_name_en": "Enforcement Division",
            "identifier": "DOA-ENF-418",
            "avatar_icon": "⚖️",
            "theme_color": "rose",
            "jurisdiction_si": "උතුරු මැද පළාත් බලාත්මක කලාපය",
            "jurisdiction_en": "North Central Province Enforcement Command",
            "permissions": ["SCAN_PACKAGING_AUTHENTICITY", "GENERATE_SECTION34_BREPORT", "RUN_POLICY_WARGAME"]
        },
        {
            "user_id": "USR-DIR-0010",
            "role": "NATIONAL_DIRECTOR",
            "role_title_si": "ජාතික පොහොර සංචිත අධ්‍යක්ෂ",
            "role_title_en": "National Director",
            "full_name_si": "ජාතික පොහොර ලේකම් කාර්යාලය",
            "full_name_en": "National Fertilizer Secretariat",
            "identifier": "MOA-DIR-001",
            "avatar_icon": "🏛️",
            "theme_color": "purple",
            "ministry": "Ministry of Agriculture",
            "permissions": ["VIEW_25_DISTRICT_GIS_MAP", "TRACK_PORT_VESSEL_OFFLOADS", "TRIGGER_NATIONAL_BUFFER_RELEASE"]
        }
    ]
    
    for off in officers:
        cursor.execute('''
            INSERT INTO users (user_id, role, role_title_si, role_title_en, full_name_si, full_name_en, identifier, avatar_icon, theme_color)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (off["user_id"], off["role"], off["role_title_si"], off["role_title_en"], off["full_name_si"], off["full_name_en"], off["identifier"], off["avatar_icon"], off["theme_color"]))
        
        cursor.execute('''
            INSERT INTO officer_profiles (user_id, facility_name_si, facility_name_en, district, agency, laboratory_name_si, laboratory_name_en, jurisdiction_si, jurisdiction_en, ministry)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (off["user_id"], off.get("facility_name_si"), off.get("facility_name_en"), off.get("district"), off.get("agency"), off.get("laboratory_name_si"), off.get("laboratory_name_en"), off.get("jurisdiction_si"), off.get("jurisdiction_en"), off.get("ministry")))
        
        cursor.execute("INSERT INTO user_permissions (user_id, permissions_json) VALUES (?, ?)", (off["user_id"], json.dumps(off["permissions"])))
        
    conn.commit()

def save_farmer_registration(farmer_data: Dict[str, Any]) -> Dict[str, Any]:
    """Saves a new farmer to the SQLite DB."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    clean_nic = farmer_data['nic']
    # Check if already exists
    cursor.execute("SELECT user_id FROM users WHERE identifier=?", (clean_nic,))
    if cursor.fetchone():
        conn.close()
        return get_user_by_identifier(clean_nic) # Return existing
        
    user_id = farmer_data['user_id']
    
    cursor.execute('''
        INSERT INTO users (user_id, role, role_title_si, role_title_en, full_name_si, full_name_en, identifier, phone, avatar_icon, theme_color)
        VALUES (?, 'FARMER', 'ලියාපදිංචි ගොවි මහතා', 'Registered Farmer', ?, ?, ?, ?, '👨🏽‍🌾', 'emerald')
    ''', (user_id, farmer_data['full_name_si'], farmer_data['full_name_en'], clean_nic, farmer_data['phone']))
    
    cursor.execute('''
        INSERT INTO farmer_profiles (user_id, district, district_si, asc_division, asc_code, dad_farmer_id, land_acres, crop, yaya_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, farmer_data['district'], farmer_data['district_si'], farmer_data['asc_division'], farmer_data['asc_code'], farmer_data['dad_farmer_id'], farmer_data['land_acres'], farmer_data['crop'], farmer_data['yaya_name']))
    
    cursor.execute("INSERT INTO user_permissions (user_id, permissions_json) VALUES (?, ?)", (user_id, json.dumps(farmer_data['permissions'])))
    
    conn.commit()
    conn.close()
    return farmer_data

def get_user_by_identifier(identifier: str) -> Optional[Dict[str, Any]]:
    """Retrieves a user (Farmer or Officer) from SQLite by NIC or Service ID."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE identifier=?", (identifier,))
    user_row = cursor.fetchone()
    if not user_row:
        conn.close()
        return None
        
    user_dict = dict(user_row)
    user_id = user_dict["user_id"]
    
    # Get Permissions
    cursor.execute("SELECT permissions_json FROM user_permissions WHERE user_id=?", (user_id,))
    perm_row = cursor.fetchone()
    user_dict["permissions"] = json.loads(perm_row[0]) if perm_row else []
    
    # Get Profile Specifics
    if user_dict["role"] == "FARMER":
        cursor.execute("SELECT * FROM farmer_profiles WHERE user_id=?", (user_id,))
        prof_row = cursor.fetchone()
        if prof_row:
            user_dict.update(dict(prof_row))
    else:
        cursor.execute("SELECT * FROM officer_profiles WHERE user_id=?", (user_id,))
        prof_row = cursor.fetchone()
        if prof_row:
            # Drop None values to match dict structure cleanly
            prof_dict = {k: v for k, v in dict(prof_row).items() if v is not None}
            user_dict.update(prof_dict)
            
    conn.close()
    return user_dict
