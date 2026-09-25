"""
CropSafe AI - Groundwater & Agro-Well Nitrate Leaching Risk Engine
Module: src/models/groundwater_nitrate_leaching_risk.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Evaluates vertical nitrate (NO3-) leaching into shallow groundwater aquifers and rural agro-wells.
2. Calibrated for major Sri Lankan agro-ecological soil zones (Kalpitiya Sandy Regosols, Jaffna Latosols, 
   Rajarata Reddish Brown Earths, Upcountry Red-Yellow Podzolic).
3. Compares estimated aquifer recharge concentration against WHO and SLS 614 drinking water thresholds (50 mg/L NO3-).
4. Computes safe setback distances between fertilizer application plots and domestic drinking wells.
5. Prescribes split-application schedules and vegetative bio-interceptor buffers (Vetiver grass) to prevent CKDu/Blue Baby Syndrome.
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
logger = logging.getLogger("GroundwaterNitrateLeachingRisk")

# Sri Lankan Soil Hydraulic & Leaching Characteristics
SOIL_HYDROLOGY_DATABASE = {
    "sandy_regosol_kalpitiya": {
        "name_en": "Sandy Regosol (Kalpitiya / Batticaloa Coastal)",
        "name_si": "වැලි රෙගොසෝල් පස (කල්පිටිය / මඩකලපුව වෙරළබඩ)",
        "name_ta": "மணல் மண் (கற்பிட்டி / மட்டக்களப்பு)",
        "infiltration_rate_cm_hr": 28.0,
        "porosity": 0.42,
        "bulk_density_g_cm3": 1.55,
        "base_leaching_fraction": 0.48,  # 48% applied N prone to leaching
        "cation_exchange_capacity_meq_100g": 3.2,
        "risk_multiplier": 1.85,
        "vulnerability_desc_si": "අතිශය අධික පාරගම්‍යතාවයක් සහිත වැලි පසකි. පොහොර දැමූ වහාම ජලයට දියවී පහළ භූගත ජලයට කාන්දු වේ."
    },
    "red_yellow_latosol_jaffna": {
        "name_en": "Red-Yellow Latosol (Jaffna Peninsula / Mannar)",
        "name_si": "රතු-කහ ලැටොසෝල් පස (යාපනය / මන්නාරම හුණුගල් ආශ්‍රිත)",
        "name_ta": "செம்மண் (யாழ்ப்பாணம் / மன்னார்)",
        "infiltration_rate_cm_hr": 14.0,
        "porosity": 0.40,
        "bulk_density_g_cm3": 1.48,
        "base_leaching_fraction": 0.36,
        "cation_exchange_capacity_meq_100g": 7.5,
        "risk_multiplier": 1.45,
        "vulnerability_desc_si": "හුණුගල් තට්ටුව මත පිහිටි ගැඹුරු නොවන පසකි. පානීය ළිං වල නයිට්‍රේට් අධික ලෙස එකතු වීමේ අවදානමක් ඇත."
    },
    "reddish_brown_earth_rajarata": {
        "name_en": "Reddish Brown Earth / RBE (Anuradhapura / Polonnaruwa / Mahaweli)",
        "name_si": "රතු දුඹුරු පස / RBE (අනුරාධපුර / පොලොන්නරුව / මහවැලි කලාපය)",
        "name_ta": "செம்பழுப்பு மண் (அனுராதபுரம் / பொலன்னறுவை)",
        "infiltration_rate_cm_hr": 4.5,
        "porosity": 0.36,
        "bulk_density_g_cm3": 1.38,
        "base_leaching_fraction": 0.22,
        "cation_exchange_capacity_meq_100g": 14.8,
        "risk_multiplier": 1.0,
        "vulnerability_desc_si": "මධ්‍යස්ථ වැලි-මැටි පසකි. මහ කන්නයේ ජල මට්ටම ඉහළ යාමේදී නොගැඹුරු ගොවි ළිං වලට කාන්දු වීමේ අවදානමක් පවතී."
    },
    "red_yellow_podzolic_upcountry": {
        "name_en": "Red-Yellow Podzolic (Nuwara Eliya / Kandy / Badulla)",
        "name_si": "රතු කහ පොඩ්සොලික් පස (නුවරඑළිය / මහනුවර / බදුල්ල කඳුකර)",
        "name_ta": "மலைநாட்டு செம்மஞ்சள் மண் (நுவரெலியா / கண்டி)",
        "infiltration_rate_cm_hr": 6.2,
        "porosity": 0.38,
        "bulk_density_g_cm3": 1.32,
        "base_leaching_fraction": 0.26,
        "cation_exchange_capacity_meq_100g": 18.2,
        "risk_multiplier": 1.15,
        "vulnerability_desc_si": "අධික බෑවුම් සහිත ප්‍රදේශ වල පාංශු ඛාදනය හා පැති කාන්දු (lateral flow) මඟින් ඇළ දොළ හා උල්පත් දූෂණය වීමේ අවදානම ඉහළයි."
    },
    "low_humic_gley_wetland": {
        "name_en": "Low Humic Gley / LHG (Wetland Paddy Valleys)",
        "name_si": "අඩු හියුමික් ග්ලේ පස / LHG (කුඹුරු පහත් බිම්)",
        "name_ta": "தாழ் ஈரப்பத களிமண் (நெல் வயல்கள்)",
        "infiltration_rate_cm_hr": 0.8,
        "porosity": 0.45,
        "bulk_density_g_cm3": 1.25,
        "base_leaching_fraction": 0.10,
        "cation_exchange_capacity_meq_100g": 22.0,
        "risk_multiplier": 0.65,
        "vulnerability_desc_si": "ජලය බැස නොයන ඝන මැටි පසකි. සෘජු සිරස් කාන්දුව අවම වුවද මතුපිට ජලයට සේදී යාම සිදුවිය හැක."
    }
}

class GroundwaterNitrateLeachingRiskEngine:
    """Predicts vertical nitrate leaching potential and domestic well water contamination risks."""

    def __init__(self):
        self.soils = SOIL_HYDROLOGY_DATABASE
        self.who_nitrate_limit_mg_l = 50.0  # WHO & SLS 614 standard (NO3-)
        self.who_nitrate_n_limit_mg_l = 11.3  # NO3-N limit

    def assess_leaching_risk(
        self,
        soil_type: str,
        total_nitrogen_applied_kg_ha: float,
        water_table_depth_m: float,
        total_rainfall_and_irrigation_mm: float,
        split_applications_count: int = 1,
        well_distance_m: float = 25.0,
        has_vegetative_buffer: bool = False
    ) -> Dict[str, Any]:
        """
        Assesses groundwater nitrate leaching vulnerability.
        
        Args:
            soil_type: Key in SOIL_HYDROLOGY_DATABASE
            total_nitrogen_applied_kg_ha: Total synthetic & organic N applied per season (e.g. 150 kg/ha)
            water_table_depth_m: Depth to water table in meters (e.g. 1.5m to 10m)
            total_rainfall_and_irrigation_mm: Total seasonal water input (e.g. 800 mm)
            split_applications_count: Number of split doses (e.g. 1 = all at once, 3 = three splits)
            well_distance_m: Distance from crop plot to nearest domestic drinking well
            has_vegetative_buffer: True if deep-rooted grass/tree buffer strip exists between plot and well
        """
        clean_soil = soil_type.strip().lower()
        if clean_soil not in self.soils:
            clean_soil = "reddish_brown_earth_rajarata"

        soil = self.soils[clean_soil]

        # 1. Split application attenuation factor
        # Applying all N at once dramatically spikes leaching risk; splitting flattens peak plume
        split_attenuation = 1.0 / (split_applications_count ** 0.45)

        # 2. Water flux factor: Deep percolation volume
        percolation_ratio = min(1.0, max(0.2, (total_rainfall_and_irrigation_mm - 300.0) / 700.0))

        # 3. Water table depth attenuation (unsaturated vadose zone denitrification)
        # Deep vadose zone gives microbes time to denitrify NO3- to N2 gas
        depth_attenuation = max(0.40, 1.0 - (water_table_depth_m * 0.065))

        # 4. Vegetative buffer attenuation (e.g. Vetiver grass buffer intercepts nitrate)
        buffer_factor = 0.65 if has_vegetative_buffer else 1.0

        # Calculate mass of N leached (kg N / ha)
        leached_n_kg_ha = (
            total_nitrogen_applied_kg_ha
            * soil["base_leaching_fraction"]
            * split_attenuation
            * percolation_ratio
            * depth_attenuation
            * buffer_factor
        )

        # Recharge volume in liters per ha (1 ha = 10,000 m2; 1 mm = 10 m3 = 10,000 Liters)
        recharge_water_liters_per_ha = max(100000.0, total_rainfall_and_irrigation_mm * 0.40 * 10000.0)

        # N concentration in recharge (mg N / Liter)
        # kg to mg is * 1,000,000
        n_concentration_mg_l = (leached_n_kg_ha * 1000000.0) / recharge_water_liters_per_ha

        # Convert NO3-N to NO3- ion: Molecular weight NO3 (62) / N (14) = 4.43
        nitrate_ion_mg_l = n_concentration_mg_l * 4.43

        # Lateral transport attenuation to well
        # Advective-dispersive dilution over distance
        lateral_attenuation = max(0.20, 1.0 - (well_distance_m / 60.0))
        predicted_well_nitrate_mg_l = nitrate_ion_mg_l * lateral_attenuation

        # Determine risk level
        if predicted_well_nitrate_mg_l < 25.0:
            risk_level = "LOW_SAFE"
            risk_color = "GREEN"
            risk_desc_si = "පානීය ජල මට්ටම ආරක්ෂිතයි (WHO සීමාවට බෙහෙවින් අඩුයි)."
        elif predicted_well_nitrate_mg_l <= self.who_nitrate_limit_mg_l:
            risk_level = "MODERATE_WARNING"
            risk_color = "YELLOW"
            risk_desc_si = "අවවාදාත්මක මට්ටමකි! නයිට්‍රේට් මට්ටම WHO උපරිම සීමාවට ආසන්න වෙමින් පවතී."
        else:
            risk_level = "CRITICAL_HAZARDOUS"
            risk_color = "RED"
            risk_desc_si = "අතිශය අනතුරුදායකයි! පානීය ජලයේ නයිට්‍රේට් සීමාව (50 mg/L) ඉක්මවා ඇත. ළදරුවන්ට හා පවුලේ අයට රෝග අවදානමක් ඇත."

        # Calculate minimum safe setback distance (m) to bring well nitrate under 25 mg/L
        required_setback_m = max(15.0, round(well_distance_m * (predicted_well_nitrate_mg_l / 25.0), 1))

        return {
            "assessment_timestamp": datetime.now().isoformat(),
            "soil_type_en": soil["name_en"],
            "soil_type_si": soil["name_si"],
            "total_nitrogen_applied_kg_ha": total_nitrogen_applied_kg_ha,
            "water_table_depth_m": water_table_depth_m,
            "split_applications_count": split_applications_count,
            "well_distance_m": well_distance_m,
            "has_vegetative_buffer": has_vegetative_buffer,
            "estimated_n_leached_kg_ha": round(leached_n_kg_ha, 1),
            "predicted_aquifer_recharge_no3_mg_l": round(nitrate_ion_mg_l, 1),
            "predicted_well_water_no3_mg_l": round(predicted_well_nitrate_mg_l, 1),
            "who_drinking_water_limit_mg_l": self.who_nitrate_limit_mg_l,
            "risk_level": risk_level,
            "risk_color": risk_color,
            "risk_description_si": risk_desc_si,
            "recommended_safe_well_distance_m": required_setback_m,
            "mitigation_prescriptions_si": [
                f"1. පොහොර එකවර නොදමා අවම වශයෙන් වාර {max(3, split_applications_count + 1)} කට බෙදා යොදන්න (Split application).",
                "2. ගොවි බිම සහ පානීය ළිඳ අතර අවම වශයෙන් මීටර් 3ක පළලකින් යුත් ගැඹුරට මුල් යන තෘණ තීරයක් (උදා: වෙටිවර්/සැවැන්දරා) සිටුවන්න.",
                "3. වැලි සහිත පසෙහි (කල්පිටිය/වෙරළබඩ) යූරියා සමඟ නීම් (Neem) තෙල් හෝ කාබනික කොම්පෝස්ට් මිශ්‍ර කර නයිට්‍රජන් සෙමෙන් මුදාහරින (Slow-release) තත්ත්වයට පත් කරන්න.",
                f"4. ළිඳ පිහිටි ස්ථානය ගොවිබිමේ සිට අවම වශයෙන් මීටර් {required_setback_m} ක දුරකින් තබාගන්න."
            ]
        }

if __name__ == "__main__":
    risk_engine = GroundwaterNitrateLeachingRiskEngine()

    print("=== TEST 1: High Risk Kalpitiya Sandy Soil (180 kg N, Single Dose, Shallow 1.5m Well) ===")
    res1 = risk_engine.assess_leaching_risk(
        soil_type="sandy_regosol_kalpitiya",
        total_nitrogen_applied_kg_ha=180.0,
        water_table_depth_m=1.5,
        total_rainfall_and_irrigation_mm=900.0,
        split_applications_count=1,
        well_distance_m=15.0,
        has_vegetative_buffer=False
    )
    print(f"Soil: {res1['soil_type_si']}")
    print(f"Predicted Well NO3-: {res1['predicted_well_water_no3_mg_l']} mg/L (WHO Limit: {res1['who_drinking_water_limit_mg_l']} mg/L)")
    print(f"Risk: {res1['risk_level']} - {res1['risk_description_si']}")
    print(f"Recommended Setback: {res1['recommended_safe_well_distance_m']} meters\n")

    print("=== TEST 2: Managed Rajarata RBE Soil with 3 Splits & Buffer Strip ===")
    res2 = risk_engine.assess_leaching_risk(
        soil_type="reddish_brown_earth_rajarata",
        total_nitrogen_applied_kg_ha=120.0,
        water_table_depth_m=4.0,
        total_rainfall_and_irrigation_mm=750.0,
        split_applications_count=3,
        well_distance_m=40.0,
        has_vegetative_buffer=True
    )
    print(f"Soil: {res2['soil_type_si']}")
    print(f"Predicted Well NO3-: {res2['predicted_well_water_no3_mg_l']} mg/L")
    print(f"Risk: {res2['risk_level']} - {res2['risk_description_si']}")
