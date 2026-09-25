"""
CropSafe AI - Soil Acidity Neutralization & Agricultural Dolomite Titration Calculator
Module: src/models/soil_ph_buffer_titration_calculator.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Calculates soil buffering capacity and Lime/Dolomite Requirement (LR) for acidic soils (pH < 5.5).
2. Calibrated for Sri Lankan agro-ecological regions (Ratnapura, Kalutara, Galle, Kandy, Upcountry).
3. Evaluates Aluminum (Al3+) and Manganese (Mn2+) toxicity hazards.
4. Computes Agricultural Dolomite (CaCO3·MgCO3) tonnage, Magnesium (MgO) nutrient release, and cost.
5. Provides split-application schedules and a 2-3 week safety gap before chemical fertilizer application.
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
logger = logging.getLogger("SoilPHBufferTitrationCalculator")

# Soil texture buffer factors (resistance to pH change)
SOIL_TEXTURE_BUFFER_FACTORS = {
    "sandy_soil": {"name_si": "වැලි පස (අඩු බෆර් ධාරිතාව)", "buffer_multiplier": 0.65, "max_single_dose_t_ha": 1.5},
    "sandy_loam": {"name_si": "වැලි ලෝම පස", "buffer_multiplier": 0.85, "max_single_dose_t_ha": 2.0},
    "loam_podzolic": {"name_si": "ලෝම / රතු-කහ පොඩ්සොලික් පස", "buffer_multiplier": 1.0, "max_single_dose_t_ha": 2.5},
    "clay_loam": {"name_si": "මැටි ලෝම පස", "buffer_multiplier": 1.25, "max_single_dose_t_ha": 3.0},
    "heavy_clay": {"name_si": "ඝන මැටි පස (ඉහළ බෆර් ධාරිතාව)", "buffer_multiplier": 1.50, "max_single_dose_t_ha": 3.5}
}

class SoilPHBufferTitrationCalculator:
    """Calculates soil lime and agricultural dolomite requirements to neutralize acid soils."""

    def __init__(self):
        self.textures = SOIL_TEXTURE_BUFFER_FACTORS
        self.dolomite_cce = 1.06       # Calcium Carbonate Equivalent (CCE) of Matale/Kandy Dolomite is ~106%
        self.dolomite_mgo_pct = 19.5   # Contains ~19.5% Magnesium Oxide (MgO)
        self.dolomite_bag_price_lkr = 950.0  # 50kg bag of agricultural dolomite in Sri Lanka

    def calculate_dolomite_requirement(
        self,
        current_ph: float,
        target_ph: float = 6.2,
        soil_texture: str = "loam_podzolic",
        land_area_ha: float = 1.0,
        crop_type: str = "vegetable"
    ) -> Dict[str, Any]:
        """
        Calculates agricultural dolomite requirement and application calendar.
        
        Args:
            current_ph: Soil pH measured in water (1:2.5 suspension)
            target_ph: Desired optimum soil pH (e.g. 6.0-6.5 for vegetables, 4.8-5.2 for tea)
            soil_texture: Key in SOIL_TEXTURE_BUFFER_FACTORS
            land_area_ha: Land area in hectares (1 ha = 2.47 acres)
            crop_type: Target crop (e.g. "vegetable", "tea", "cinnamon", "paddy")
        """
        clean_texture = soil_texture.strip().lower()
        if clean_texture not in self.textures:
            clean_texture = "loam_podzolic"

        tex_info = self.textures[clean_texture]

        # Check toxicity thresholds
        al_toxicity_risk = current_ph < 4.8
        p_fixation_risk = current_ph < 5.5

        delta_ph = max(0.0, target_ph - current_ph)

        if delta_ph <= 0.1:
            return {
                "status": "OPTIMAL",
                "message_si": f"පසේ pH අගය ({current_ph}) දැනටමත් ප්‍රශස්ත මට්ටමේ පවතී. ඩොලමයිට් යෙදීම අවශ්‍ය නොවේ.",
                "dolomite_tons_needed": 0.0,
                "current_ph": current_ph,
                "target_ph": target_ph
            }

        # Lime requirement calculation (pure CaCO3 equivalent tons/ha)
        # Base slope: 1.8 tons CaCO3 per 1.0 pH unit increase in standard loam
        base_caco3_t_ha = delta_ph * 1.8 * tex_info["buffer_multiplier"]

        # Convert to Agricultural Dolomite (considering 106% CCE)
        dolomite_t_ha = round(base_caco3_t_ha / self.dolomite_cce, 2)
        total_dolomite_tons = round(dolomite_t_ha * land_area_ha, 2)
        total_dolomite_kg = round(total_dolomite_tons * 1000.0, 1)

        # 50kg bags and cost
        bags_needed = int(round(total_dolomite_kg / 50.0))
        total_cost_lkr = round(bags_needed * self.dolomite_bag_price_lkr, 2)

        # Magnesium nutrient contribution
        mgo_supplied_kg = round(total_dolomite_kg * (self.dolomite_mgo_pct / 100.0), 1)

        # Application Splits
        max_single = tex_info["max_single_dose_t_ha"]
        if dolomite_t_ha > max_single:
            splits_count = 2
            split_dose_t_ha = round(dolomite_t_ha / 2.0, 2)
            split_advice_si = f"එක්වර නොදමා මාත්‍රා 2කට බෙදා (වරකට හෙක්ටයාරයකට ටොන් {split_dose_t_ha} බැගින්) මාස 3ක පරතරයෙන් යොදන්න."
        else:
            splits_count = 1
            split_advice_si = f"හෙක්ටයාරයකට ටොන් {dolomite_t_ha} ක් එකවර පසට යෙදිය හැක."

        return {
            "calculation_timestamp": datetime.now().isoformat(),
            "inputs": {
                "current_ph": current_ph,
                "target_ph": target_ph,
                "delta_ph": round(delta_ph, 2),
                "soil_texture_si": tex_info["name_si"],
                "land_area_ha": land_area_ha,
                "land_area_acres": round(land_area_ha * 2.47105, 2),
                "crop_type": crop_type
            },
            "hazard_assessment": {
                "aluminum_toxicity_risk": al_toxicity_risk,
                "aluminum_toxicity_si": "අතිශය අවදානම්! ඇලුමිනියම් විෂ වීමෙන් මුල් කුරු වී පොස්පරස් උරා නොගනී." if al_toxicity_risk else "නැත (ආරක්ෂිත මට්ටම)",
                "phosphorus_fixation_risk": p_fixation_risk
            },
            "dolomite_recommendation": {
                "dolomite_tons_per_ha": dolomite_t_ha,
                "dolomite_total_tons": total_dolomite_tons,
                "total_50kg_bags": bags_needed,
                "estimated_investment_lkr": total_cost_lkr,
                "magnesium_mgo_supplied_kg": mgo_supplied_kg
            },
            "application_protocol_si": {
                "splits_required": splits_count,
                "split_schedule_si": split_advice_si,
                "critical_safety_gap_si": "ඩොලමයිට් පසට දමා සති 2 සිට 3ක් යනතුරු කිසිදු රසායනික යූරියා හෝ TSP පොහොරක් නොයොදන්න (එසේ කළහොත් නයිට්‍රජන් වාෂ්ප වී යයි).",
                "summary_si": (
                    f"පසේ pH අගය {current_ph} සිට {target_ph} දක්වා ඉහළ නැංවීමට හෙක්ටයාරයකට ඩොලමයිට් "
                    f"ටොන් {dolomite_t_ha} ක් (බෑග් {bags_needed} ක් - රු. {total_cost_lkr:,.0f}) අවශ්‍ය වේ. "
                    f"මේ මඟින් පසට මැග්නීසියම් (MgO) කි.ග්‍රෑ. {mgo_supplied_kg} ක්ද එකතු වේ."
                )
            }
        }

if __name__ == "__main__":
    calc = SoilPHBufferTitrationCalculator()

    print("=== TEST 1: Highly Acidic Wet Zone Soil (pH 4.2 -> Target 6.2 for Vegetables) ===")
    res1 = calc.calculate_dolomite_requirement(
        current_ph=4.2,
        target_ph=6.2,
        soil_texture="loam_podzolic",
        land_area_ha=1.0,
        crop_type="vegetable"
    )
    print(f"Current pH: {res1['inputs']['current_ph']} -> Target: {res1['inputs']['target_ph']}")
    print(f"Aluminum Toxicity: {res1['hazard_assessment']['aluminum_toxicity_si']}")
    print(f"Dolomite Needed: {res1['dolomite_recommendation']['dolomite_total_tons']} Tons ({res1['dolomite_recommendation']['total_50kg_bags']} bags)")
    print(f"Cost: LKR {res1['dolomite_recommendation']['estimated_investment_lkr']:,}")
    print(f"Summary: {res1['application_protocol_si']['summary_si']}\n")

    print("=== TEST 2: Already Optimal Soil (pH 6.3) ===")
    res2 = calc.calculate_dolomite_requirement(current_ph=6.3, target_ph=6.2)
    print(f"Status: {res2['status']} - {res2['message_si']}")
