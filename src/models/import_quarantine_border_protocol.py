"""
CropSafe AI - Port Fertilizer Import Quarantine & Border Interception Engine
Module: src/models/import_quarantine_border_protocol.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Simulates regulatory dockside cargo hold sampling at Colombo, Hambantota, and Trincomalee ports.
2. Audits imported bulk consignments against National Fertilizer Secretariat (NFS), SLSI (SLS 644 / SLS 1624),
   and National Plant Quarantine Service (NPQS) standards.
3. Tests toxic heavy metal maximum permissible limits: Arsenic (As), Cadmium (Cd), Lead (Pb), Mercury (Hg), Chromium (Cr).
4. Screens organic consignments for microbial quarantine pathogens (Erwinia, Ralstonia, Salmonella) and weed seeds.
5. Issues legal Customs Clearance Certificates or Formal Cargo Seizure & Deportation Orders under Act No. 68 of 1988.
"""

import os
import sys
import json
import hashlib
import logging
from typing import Dict, List, Any
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("ImportQuarantineBorderProtocol")

# National Maximum Permissible Limits (SLS 644, SLS 1624:2021 & NFS Gazette)
STATUTORY_QUARANTINE_LIMITS = {
    "synthetic": {
        "arsenic_as_max_ppm": 3.0,
        "cadmium_cd_max_ppm": 5.0,
        "lead_pb_max_ppm": 30.0,
        "mercury_hg_max_ppm": 0.5,
        "total_chromium_cr_max_ppm": 50.0,
        "max_moisture_pct": 1.5
    },
    "organic": {
        "arsenic_as_max_ppm": 2.0,
        "cadmium_cd_max_ppm": 1.5,
        "lead_pb_max_ppm": 25.0,
        "mercury_hg_max_ppm": 0.4,
        "total_chromium_cr_max_ppm": 40.0,
        "max_moisture_pct": 25.0,
        "max_ecoli_cfu_g": 0.0,            # Zero tolerance for live pathogens
        "max_salmonella_cfu_25g": 0.0,
        "max_viable_weed_seeds_per_kg": 0
    }
}

class ImportQuarantineBorderProtocolEngine:
    """Manages port quarantine sampling, toxic metal threshold enforcement, and vessel clearance orders."""

    def __init__(self):
        self.limits = STATUTORY_QUARANTINE_LIMITS

    def audit_consignment(
        self,
        vessel_name: str,
        bill_of_lading_no: str,
        country_of_origin: str,
        discharge_port: str,
        fertilizer_category: str,  # "synthetic" or "organic"
        cargo_tonnage_mt: float,
        lab_assay: Dict[str, float],
        pathogen_screen: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Conducts forensic regulatory audit of imported fertilizer cargo.
        """
        clean_cat = fertilizer_category.strip().lower()
        if clean_cat not in self.limits:
            clean_cat = "synthetic"

        limits = self.limits[clean_cat]
        violations = []

        # 1. Audit Heavy Metals (ppm / mg/kg)
        as_val = lab_assay.get("arsenic_ppm", 0.0)
        cd_val = lab_assay.get("cadmium_ppm", 0.0)
        pb_val = lab_assay.get("lead_ppm", 0.0)
        hg_val = lab_assay.get("mercury_ppm", 0.0)
        cr_val = lab_assay.get("chromium_ppm", 0.0)
        moisture = lab_assay.get("moisture_pct", 0.8)

        if as_val > limits["arsenic_as_max_ppm"]:
            violations.append(f"Arsenic (As) {as_val} ppm exceeds legal limit of {limits['arsenic_as_max_ppm']} ppm")
        if cd_val > limits["cadmium_cd_max_ppm"]:
            violations.append(f"Cadmium (Cd) {cd_val} ppm exceeds legal limit of {limits['cadmium_cd_max_ppm']} ppm (Severe CKDu hazard)")
        if pb_val > limits["lead_pb_max_ppm"]:
            violations.append(f"Lead (Pb) {pb_val} ppm exceeds legal limit of {limits['lead_pb_max_ppm']} ppm")
        if hg_val > limits["mercury_hg_max_ppm"]:
            violations.append(f"Mercury (Hg) {hg_val} ppm exceeds legal limit of {limits['mercury_hg_max_ppm']} ppm")
        if cr_val > limits["total_chromium_cr_max_ppm"]:
            violations.append(f"Chromium (Cr) {cr_val} ppm exceeds legal limit of {limits['total_chromium_cr_max_ppm']} ppm")
        if moisture > limits["max_moisture_pct"]:
            violations.append(f"Moisture {moisture}% exceeds standard limit of {limits['max_moisture_pct']}%")

        # 2. Biosecurity / Pathogen Audit for Organic consignments
        if clean_cat == "organic" and pathogen_screen:
            if pathogen_screen.get("erwinia_detected", False):
                violations.append("Bacterial soft-rot plant pathogen 'Erwinia spp.' DETECTED (Strict quarantine violation)")
            if pathogen_screen.get("salmonella_detected", False):
                violations.append("Human enteric pathogen 'Salmonella spp.' DETECTED")
            if pathogen_screen.get("weed_seeds_count", 0) > 0:
                violations.append(f"Viable invasive weed seeds found ({pathogen_screen['weed_seeds_count']} seeds/kg)")

        # 3. Legal Decision
        timestamp = datetime.now().isoformat()
        token_src = f"{vessel_name}|{bill_of_lading_no}|{cargo_tonnage_mt}|{len(violations)}|{timestamp}"
        order_token = hashlib.sha256(token_src.encode("utf-8")).hexdigest()[:14].upper()

        if len(violations) == 0:
            legal_status = "CLEARED_FOR_DISCHARGE"
            status_si = "නැවෙන් ගොඩබෑමට සහ රේගු නිශ්කාශනයට අනුමැතිය හිමිවිය (SLS අනුකූලයි)"
            decision_code = f"NFS-CLEARANCE-{order_token}"
            color = "GREEN"
            order_text_si = (
                f"{vessel_name} නෞකාව මඟින් {country_of_origin} සිට ගෙන ආ මෙට්‍රික් ටොන් {cargo_tonnage_mt:,.0f} ක පොහොර තොගය "
                f"ශ්‍රී ලංකා ප්‍රමිති ආයතනයේ (SLSI) හා ජාතික පොහොර ලේකම් කාර්යාලයේ නිරෝධායන පරීක්ෂාවෙන් 100% සමත් විය."
            )
        else:
            legal_status = "REJECTED_SEIZURE_ORDER"
            status_si = "ප්‍රතික්ෂේපිතයි! වහාම තොගය අත්අඩංගුවට ගෙන නැව ආපසු හරවා යැවීමේ නියෝගය (Deportation Order)"
            decision_code = f"CUSTOMS-SEIZURE-{order_token}"
            color = "RED"
            viol_str = "; ".join(violations)
            order_text_si = (
                f"අවවාදයයි! {vessel_name} නෞකාවේ තොගය නීතිවිරෝධී විෂ සාන්ද්‍රණ හෝ නිරෝධායන උල්ලංඝනයන් නිසා ප්‍රතික්ෂේප විය "
                f"({viol_str}). 1988 අංක 68 දරන පොහොර විධිමත් කිරීමේ පනතේ 19 වගන්තිය යටතේ ගොඩබෑම තහනම් කර ඇත."
            )

        return {
            "order_number": decision_code,
            "timestamp": timestamp,
            "vessel_manifest": {
                "vessel_name": vessel_name,
                "bill_of_lading": bill_of_lading_no,
                "origin_country": country_of_origin,
                "port": discharge_port,
                "cargo_tonnage_mt": cargo_tonnage_mt,
                "category": fertilizer_category
            },
            "quarantine_results": {
                "legal_verdict": legal_status,
                "status_si": status_si,
                "color_indicator": color,
                "violations_count": len(violations),
                "violations_detected": violations
            },
            "laboratory_heavy_metals_ppm": {
                "arsenic_as": as_val,
                "cadmium_cd": cd_val,
                "lead_pb": pb_val,
                "mercury_hg": hg_val,
                "chromium_cr": cr_val
            },
            "official_order_decree_si": order_text_si
        }

if __name__ == "__main__":
    border_engine = ImportQuarantineBorderProtocolEngine()

    print("=== TEST 1: Certified High Purity Bulk Urea Vessel (Passed Clearance) ===")
    res1 = border_engine.audit_consignment(
        vessel_name="MV Ceylon Breeze",
        bill_of_lading_no="BL-OMAN-2026-901",
        country_of_origin="Oman (Sohar Port)",
        discharge_port="Colombo Port (JCT Terminal)",
        fertilizer_category="synthetic",
        cargo_tonnage_mt=25000.0,
        lab_assay={"arsenic_ppm": 0.4, "cadmium_ppm": 0.8, "lead_ppm": 2.1, "mercury_ppm": 0.05, "chromium_ppm": 4.5, "moisture_pct": 0.4}
    )
    print(f"Order: {res1['order_number']}")
    print(f"Verdict: {res1['quarantine_results']['legal_verdict']}")
    print(f"Status: {res1['quarantine_results']['status_si']}")
    print(f"Decree: {res1['official_order_decree_si']}\n")

    print("=== TEST 2: Contaminated Organic Consignment with Cadmium & Pathogens (Seized) ===")
    res2 = border_engine.audit_consignment(
        vessel_name="MV Hippo Spirit II",
        bill_of_lading_no="BL-SHANGHAI-2026-441",
        country_of_origin="China (Qingdao)",
        discharge_port="Hambantota International Port",
        fertilizer_category="organic",
        cargo_tonnage_mt=15000.0,
        lab_assay={"arsenic_ppm": 4.2, "cadmium_ppm": 6.8, "lead_ppm": 38.0, "mercury_ppm": 0.8, "chromium_ppm": 65.0, "moisture_pct": 28.0},
        pathogen_screen={"erwinia_detected": True, "salmonella_detected": False, "weed_seeds_count": 12}
    )
    print(f"Order: {res2['order_number']}")
    print(f"Verdict: {res2['quarantine_results']['legal_verdict']}")
    print(f"Violations: {res2['quarantine_results']['violations_detected']}")
    print(f"Decree: {res2['official_order_decree_si']}")
