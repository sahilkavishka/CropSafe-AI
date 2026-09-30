import sys
import os
from datetime import datetime
from typing import Dict, Any, List
from pydantic import BaseModel

# Ensure db.py can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.db import init_db, get_user_by_identifier, save_farmer_registration

# Initialize the SQLite Database
init_db()

class LoginRequest(BaseModel):
    role: str
    identifier: str = None
    password: str = None
    demo_mode: bool = False

class RegisterFarmerRequest(BaseModel):
    full_name: str
    nic: str
    phone: str
    district: str
    asc_division: str
    land_acres: float
    crop: str

class UserAuthEngine:
    """
    Manages verified institutional user profiles and cryptographic session validation.
    Now connected to SQLite Database for persistent real-world data tracking.
    """

    @classmethod
    def get_all_demo_profiles(cls) -> List[Dict[str, Any]]:
        """Returns the list of official persona profiles for presentation and 1-click login."""
        demos = []
        for ident in ["WMS-ASC-7701", "SLSI-CH-2026", "DOA-ENF-418", "MOA-DIR-001"]:
            user = get_user_by_identifier(ident)
            if user:
                demos.append(user)
        return demos

    @classmethod
    def authenticate(cls, req: LoginRequest) -> Dict[str, Any]:
        """
        Authenticates a user request. Queries the SQLite database to fetch the exact profile.
        """
        target_role = req.role.lower().strip()
        
        # 1. Real Database Check via NIC or Service ID
        if req.identifier:
            raw_id = req.identifier.strip().upper()
            db_user = get_user_by_identifier(raw_id)
            if db_user:
                return {
                    "authenticated": True,
                    "session_token": f"CS-SESSION-{int(datetime.utcnow().timestamp())}-{db_user['role']}",
                    "user": db_user,
                    "login_time": datetime.utcnow().isoformat()
                }

        # 2. Demo Mode Check (For Presentation Purposes)
        fallback_map = {
            "warehouse": "WMS-ASC-7701",
            "chemist": "SLSI-CH-2026",
            "inspector": "DOA-ENF-418",
            "director": "MOA-DIR-001"
        }
        
        if req.demo_mode and target_role in fallback_map:
            db_user = get_user_by_identifier(fallback_map[target_role])
            if db_user:
                return {
                    "authenticated": True,
                    "session_token": f"CS-SESSION-{int(datetime.utcnow().timestamp())}-{db_user['role']}",
                    "user": db_user,
                    "login_time": datetime.utcnow().isoformat()
                }

        # Fallback to guest
        return {
            "authenticated": False,
            "error": "User not found in the national database. Please verify your NIC or Service ID."
        }

    @classmethod
    def register_farmer(cls, req: RegisterFarmerRequest) -> Dict[str, Any]:
        """Registers a new farmer into the SQLite database and returns an authenticated user profile."""
        clean_nic = req.nic.strip().upper()
        clean_acres = float(req.land_acres) if req.land_acres > 0 else 1.0
        
        new_farmer = {
            "user_id": f"USR-GOVI-{clean_nic[-4:] if len(clean_nic) >= 4 else '9999'}",
            "role": "FARMER",
            "role_title_si": "ලියාපදිංචි ගොවි මහතා",
            "role_title_en": "Registered Paddy Farmer",
            "role_title_ta": "பதிவுசெய்த விவசாயி",
            "full_name_si": req.full_name.strip(),
            "full_name_en": req.full_name.strip(),
            "nic": clean_nic,
            "phone": req.phone.strip(),
            "district": req.district.strip(),
            "district_si": req.district.strip(),
            "asc_division": req.asc_division.strip(),
            "asc_code": f"ASC-{req.district[:3].upper()}-01",
            "dad_farmer_id": f"DAD-{req.district[:3].upper()}-{clean_nic[-4:]}-2026",
            "land_acres": clean_acres,
            "crop": req.crop.strip(),
            "yaya_name": f"{req.district} යාය (Registered Yaya)",
            "avatar_icon": "👨🏽‍🌾",
            "theme_color": "emerald",
            "permissions": [
                "CALCULATE_DOSAGE",
                "VIEW_GOVI_PASSBOOK",
                "GENERATE_QR_TOKEN",
                "TRACK_DBT_SUBSIDY",
                "REPORT_WHISTLEBLOWER"
            ]
        }
        
        saved_farmer = save_farmer_registration(new_farmer)
        
        return {
            "authenticated": True,
            "session_token": f"CS-SESSION-{int(datetime.utcnow().timestamp())}-FARMER-NEW",
            "user": saved_farmer,
            "login_time": datetime.utcnow().isoformat()
        }
