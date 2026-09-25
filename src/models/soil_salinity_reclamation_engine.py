"""
CropSafe AI - Soil Salinity & Sodicity Reclamation Engine
Module: src/models/soil_salinity_reclamation_engine.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Evaluates soil Electrical Conductivity (ECe), pH, and Exchangeable Sodium Percentage (ESP / SAR).
2. Classifies soil condition (Normal, Saline, Sodic, Saline-Sodic / කිවුල් සහ ක්ෂාරීය පස).
3. Computes Leaching Fraction (LF) and freshwater flushing depth (mm) to purge salts from root zone.
4. Calculates agricultural Gypsum (CaSO4·2H2O) requirement (tons/ha & kg/acre) to displace toxic sodium.
5. Recommends salinity-tolerant Sri Lankan crop varieties (e.g., Pokkali, AT 354, BG 358 paddy) and organic conditioning.
"""

import os
import sys
import json
import logging
from typing import Dict, List, Any
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("SoilSalinityReclamationEngine")

class SoilSalinityReclamationEngine:
    """Diagnoses soil salinity/sodicity and calculates chemical, hydraulic, and biological reclamation protocols."""

    def __init__(self):
        # Salinity thresholds according to USDA / FAO and DOA Sri Lanka
        self.ec_threshold_saline = 4.0      # dS/m
        self.esp_threshold_sodic = 15.0     # %
        self.ph_alkali_threshold = 8.5

    def diagnose_and_prescribe(
        self,
        ec_e_ds_m: float,
        soil_ph: float,
        esp_pct: float = 8.0,
        ec_water_ds_m: float = 0.8,
        root_depth_cm: float = 40.0,
        land_area_ha: float = 1.0,
        target_esp_pct: float = 5.0
    ) -> Dict[str, Any]:
        """
        Diagnoses soil condition and calculates exact reclamation requirements.
        
        Args:
            ec_e_ds_m: Saturated paste electrical conductivity (dS/m)
            soil_ph: Soil pH (1:2.5 water suspension)
            esp_pct: Exchangeable Sodium Percentage (default 8.0%)
            ec_water_ds_m: Electrical conductivity of irrigation water (dS/m)
            root_depth_cm: Effective crop root zone depth (cm)
            land_area_ha: Total field area in hectares (1 ha = 2.47 acres)
            target_esp_pct: Target safe ESP level (typically 5.0%)
        """
        # 1. Soil Classification
        is_saline = ec_e_ds_m >= self.ec_threshold_saline
        is_sodic = esp_pct >= self.esp_threshold_sodic or soil_ph >= self.ph_alkali_threshold

        if not is_saline and not is_sodic:
            soil_class = "NORMAL"
            soil_class_si = "සාමාන්‍ය නිරෝගී පස (කිවුල් හෝ ක්ෂාරීය නැත)"
            severity_color = "GREEN"
        elif is_saline and not is_sodic:
            soil_class = "SALINE_SOIL"
            soil_class_si = "ලවණ සහිත කිවුල් පස (Saline Soil)"
            severity_color = "ORANGE"
        elif not is_saline and is_sodic:
            soil_class = "SODIC_SOIL"
            soil_class_si = "ක්ෂාරීය සෝඩියම් පස (Sodic / Alkali Soil)"
            severity_color = "RED"
        else:
            soil_class = "SALINE_SODIC_SOIL"
            soil_class_si = "ලවණ-ක්ෂාරීය මිශ්‍ර පස (Saline-Sodic Soil)"
            severity_color = "PURPLE"

        # 2. Leaching Requirement (LF) Calculation
        # LF = ECw / (5 * ECe - ECw)
        denominator = max(0.5, (5.0 * ec_e_ds_m) - ec_water_ds_m)
        leaching_fraction = min(0.60, max(0.05, ec_water_ds_m / denominator))

        # Net irrigation depth needed (mm)
        # To leach salts from root depth D: D_leach = (LF * D) / (1 - LF)
        leaching_water_depth_mm = round((leaching_fraction * (root_depth_cm * 10.0)) / (1.0 - leaching_fraction), 1)

        # 3. Gypsum Requirement (GR) Calculation
        # GR (t/ha) = 0.086 * D_soil(m) * bulk_density(g/cm3) * CEC * (ESP_initial - ESP_target)
        # Assuming typical CEC = 15 meq/100g, bulk density = 1.35 g/cm3
        gypsum_tons_total = 0.0
        gypsum_kg_per_acre = 0.0
        if is_sodic:
            delta_esp = max(0.0, esp_pct - target_esp_pct)
            depth_m = root_depth_cm / 100.0
            bulk_density = 1.35
            cec = 15.0
            gypsum_t_ha = 0.086 * depth_m * bulk_density * cec * delta_esp
            gypsum_tons_total = round(gypsum_t_ha * land_area_ha, 2)
            gypsum_kg_per_acre = round((gypsum_t_ha * 1000.0) / 2.47105, 1)

        # 4. Crop Salinity Tolerance Guidance
        crop_recs = self._get_crop_recommendations(ec_e_ds_m)

        return {
            "evaluation_timestamp": datetime.now().isoformat(),
            "inputs": {
                "ec_e_ds_m": ec_e_ds_m,
                "soil_ph": soil_ph,
                "esp_pct": esp_pct,
                "ec_water_ds_m": ec_water_ds_m,
                "root_depth_cm": root_depth_cm,
                "land_area_ha": land_area_ha
            },
            "classification": {
                "soil_class": soil_class,
                "soil_class_si": soil_class_si,
                "severity_color": severity_color
            },
            "leaching_hydrology": {
                "leaching_fraction": round(leaching_fraction, 3),
                "leaching_water_depth_mm": leaching_water_depth_mm,
                "leaching_advice_si": f"මුල් කලාපයේ ලවණ සෝදා හැරීමට මිලිමීටර් {leaching_water_depth_mm} ක පිරිසිදු ජලය බැඳ කාණු මඟින් බැසයාමට සැලැස්විය යුතුය."
            },
            "chemical_amendments": {
                "gypsum_needed": is_sodic,
                "gypsum_tons_total": gypsum_tons_total,
                "gypsum_kg_per_acre": gypsum_kg_per_acre,
                "amendment_advice_si": (
                    f"හෙක්ටයාරයකට ජිප්සම් (Gypsum) ටොන් {round(gypsum_tons_total/max(0.01, land_area_ha), 2)} ක් "
                    f"(අක්කරයකට කි.ග්‍රෑ. {gypsum_kg_per_acre}) පසට යොදා සෝඩියම් අයන ඉවත් කරන්න."
                    if is_sodic else "ජිප්සම් යෙදීම අවශ්‍ය නොවේ (පසෙහි සෝඩියම් අතිරික්තයක් නැත)."
                )
            },
            "organic_reclamation_plan_si": [
                "1. දහයියා අඟුරු (Biochar) හෝ දහයියා අළු හෙක්ටයාරයකට ටොන් 2ක් පසට කලවම් කර වායු සංසරණය සහ ජල බැසයාම වැඩි කරන්න.",
                "2. හොඳින් දිරූ ගව පොහොර හෝ කොම්පෝස්ට් හෙක්ටයාරයකට ටොන් 5ක් යොදා පසේ ක්ෂුද්‍රජීවී සක්‍රියතාව යථා තත්ත්වයට පත් කරන්න.",
                "3. වැසි ආරම්භයේදීම ඩයින්චා (Sesbania) හෝ හණ වගා කර පසට යට කිරීමෙන් පසේ කිවුල් ගතිය කැපී පෙනෙන ලෙස අඩු වේ."
            ],
            "crop_recommendations": crop_recs
        }

    def _get_crop_recommendations(self, ec_e: float) -> Dict[str, Any]:
        """Provides crop suitability based on EC threshold."""
        if ec_e < 3.0:
            return {
                "suitability_level_si": "සියලුම බෝග සඳහා සුදුසුයි (High Suitability)",
                "paddy_varieties_si": "සාමාන්‍ය සියලුම වී ප්‍රභේද (Bg 300, Bg 352, At 362, Bw 367)",
                "vegetables_si": "මිරිස්, තක්කාලි, බෝංචි, ගෝවා, කැරට්",
                "notes_si": "සාමාන්‍ය පොහොර නිර්දේශ ක්‍රියාත්මක කළ හැක."
            }
        elif ec_e <= 6.0:
            return {
                "suitability_level_si": "මධ්‍යස්ථ කිවුල් සහිතයි (Moderately Saline Tolerant Only)",
                "paddy_varieties_si": "කිවුලට ඔරොත්තු දෙන වී ප්‍රභේද: At 354, Bg 358, BND",
                "vegetables_si": "බණ්ඩක්කා, බීට්රූට්, නිවිති (ලවණතාවයට තරමක් ඔරොත්තු දෙයි)",
                "notes_si": "නයිට්‍රජන් පොහොර කුඩා මාත්‍රාවලින් වාර කිහිපයකදී යොදන්න. අධික යූරියා දැමීමෙන් වළකින්න."
            }
        else:
            return {
                "suitability_level_si": "අධික කිවුල් සහිතයි (Highly Saline / Restrictive)",
                "paddy_varieties_si": "පාරම්පරික පොක්කාලි (Pokkali), At 354 හෝ මා වී ප්‍රභේද පමණි",
                "vegetables_si": "එළවළු වගාවට නුසුදුසුයි (පස සෝදා හැර සුවපත් කරන තෙක් එළවළු නොසිටුවන්න)",
                "notes_si": "ජිප්සම් හා කොළ පොහොර දමා පස කිහිපවරක් සෝදා හරින තෙක් වාණිජ පොහොර නොයොදන්න."
            }

if __name__ == "__main__":
    engine = SoilSalinityReclamationEngine()

    print("=== TEST 1: Coastal Saline-Sodic Soil (Puttalam/Kalpitiya, EC=7.5, pH=8.9, ESP=22%) ===")
    res1 = engine.diagnose_and_prescribe(
        ec_e_ds_m=7.5,
        soil_ph=8.9,
        esp_pct=22.0,
        ec_water_ds_m=1.2,
        root_depth_cm=40.0,
        land_area_ha=1.0
    )
    print(f"Classification: {res1['classification']['soil_class_si']}")
    print(f"Leaching Water: {res1['leaching_hydrology']['leaching_water_depth_mm']} mm")
    print(f"Gypsum Total: {res1['chemical_amendments']['gypsum_tons_total']} tons (LKR savings/reclamation)")
    print(f"Paddy Varieties: {res1['crop_recommendations']['paddy_varieties_si']}\n")

    print("=== TEST 2: Normal Inland Soil (EC=1.2, pH=6.5, ESP=4%) ===")
    res2 = engine.diagnose_and_prescribe(
        ec_e_ds_m=1.2,
        soil_ph=6.5,
        esp_pct=4.0
    )
    print(f"Classification: {res2['classification']['soil_class_si']}")
    print(f"Gypsum Needed: {res2['chemical_amendments']['gypsum_needed']}")
