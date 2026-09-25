"""
CropSafe AI - Green Manure & Biological Nitrogen Fixation (BNF) Planner
Module: src/models/green_manure_nitrogen_planner.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Calculates Biological Nitrogen Fixation (BNF) and nutrient return from green manure crops.
2. Supports key Sri Lankan species: Sunnhemp (හණ), Sesbania/Daincha (ඩයින්චා), Gliricidia (ගිනිසීරියා), 
   Wild Sunflower (නැත්තසූරිය), Cowpea/Mung stubble, and Azolla pinnata.
3. Computes chemical Urea 50kg bag offsets, commercial/subsidized LKR financial savings.
4. Predicts soil organic carbon accumulation and carbon footprint mitigation (t CO2e).
5. Provides optimal soil incorporation calendar to prevent seedling ammonia toxicity and nitrogen immobilization.
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
logger = logging.getLogger("GreenManureNitrogenPlanner")

# Green manure database calibrated with Sri Lankan Department of Agriculture (DOA) agronomic field trials
GREEN_MANURE_DATABASE = {
    "sunnhemp": {
        "name_en": "Sunnhemp (Crotalaria juncea)",
        "name_si": "හණ (ක්‍රොටලේරියා)",
        "name_ta": "சணப்பை (Sunnhemp)",
        "type": "legume_in_situ",
        "growth_period_days": 45,
        "fresh_biomass_t_per_ha": 18.0,
        "dry_matter_pct": 20.0,
        "n_content_dry_basis_pct": 3.2,
        "p2o5_content_pct": 0.6,
        "k2o_content_pct": 2.1,
        "c_to_n_ratio": 16.5,
        "days_before_sowing_to_incorporate": 10,
        "notes_si": "මල් පිපීමට පෙර (දින 40-45 දී) කුඹුරට හෝ හේනට නගුලෙන් පසට යට කළ යුතුය. නෙමටෝඩා මර්දනයටද උදව් වේ."
    },
    "sesbania": {
        "name_en": "Sesbania / Daincha (Sesbania aculeata / rostrata)",
        "name_si": "ඩයින්චා (සෙස්බේනියා)",
        "name_ta": "தக்கைப்பூண்டு (Daincha)",
        "type": "legume_in_situ_wetland",
        "growth_period_days": 50,
        "fresh_biomass_t_per_ha": 22.0,
        "dry_matter_pct": 21.0,
        "n_content_dry_basis_pct": 3.4,
        "p2o5_content_pct": 0.7,
        "k2o_content_pct": 1.8,
        "c_to_n_ratio": 15.0,
        "days_before_sowing_to_incorporate": 12,
        "notes_si": "ජලගැලීම් සහ කිවුල් පසට ඉතා ඔරොත්තු දෙයි. කඳෙහිද නයිට්‍රජන් ගැටිති හටගන්නා විශේෂයකි."
    },
    "gliricidia": {
        "name_en": "Gliricidia / Madre de Cacao (Gliricidia sepium)",
        "name_si": "ගිනිසීරියා / වැට හාවරිය",
        "name_ta": "சீமை அகத்தி (Gliricidia)",
        "type": "woody_legume_ex_situ",
        "growth_period_days": 0,  # Pruned from live fences
        "fresh_biomass_t_per_ha": 12.0,
        "dry_matter_pct": 23.0,
        "n_content_dry_basis_pct": 3.8,
        "p2o5_content_pct": 0.5,
        "k2o_content_pct": 2.8,
        "c_to_n_ratio": 13.5,
        "days_before_sowing_to_incorporate": 7,
        "notes_si": "ජීවී වැටවල් වලින් කපාගත් අතු රිකිලි. පසට දැමූ පසු ඉතා ඉක්මනින් දිරාපත් වී ක්ෂණික නයිට්‍රජන් නිදහස් කරයි."
    },
    "wild_sunflower": {
        "name_en": "Wild Sunflower (Tithonia diversifolia)",
        "name_si": "නැත්තසූරිය / වන සූරියකාන්ත",
        "name_ta": "காட்டு சூரியகாந்தி",
        "type": "non_legume_accumulator",
        "growth_period_days": 0,  # Cut from roadsides/borders
        "fresh_biomass_t_per_ha": 15.0,
        "dry_matter_pct": 18.0,
        "n_content_dry_basis_pct": 3.5,
        "p2o5_content_pct": 1.2,  # Excellent natural phosphorus accumulator
        "k2o_content_pct": 4.1,  # Superb potassium accumulator
        "c_to_n_ratio": 12.0,
        "days_before_sowing_to_incorporate": 7,
        "notes_si": "නයිට්‍රජන් වලට අමතරව ස්වභාවික පොස්පරස් (P) සහ පොටෑසියම් (K) ඉතා අධිකව ගබඩා කර ගන්නා ශාකයකි."
    },
    "azolla": {
        "name_en": "Water Fern / Azolla (Azolla pinnata)",
        "name_si": "ඇසොල්ලා / කුඹුරු පර්ණාංග",
        "name_ta": "அசோலா (Azolla)",
        "type": "aquatic_fern_cyanobacteria",
        "growth_period_days": 20,
        "fresh_biomass_t_per_ha": 10.0,
        "dry_matter_pct": 7.0,
        "n_content_dry_basis_pct": 4.5,
        "p2o5_content_pct": 1.0,
        "k2o_content_pct": 2.5,
        "c_to_n_ratio": 10.0,
        "days_before_sowing_to_incorporate": 3,
        "notes_si": "කුඹුරු ජලයේ පාවෙමින් ඇනබීනා (Anabaena) ඇල්ගී ආධාරයෙන් වායුගෝලීය නයිට්‍රජන් ස්ථාවර කරයි. වල් පැලෑටිද මර්දනය කරයි."
    },
    "cowpea_stubble": {
        "name_en": "Cowpea / Mung Bean Stubble Residue",
        "name_si": "කවුපි / මුං ශාක කොටස් (අස්වැන්නෙන් පසු)",
        "name_ta": "பயறு பயிர் எச்சங்கள்",
        "type": "crop_residue",
        "growth_period_days": 60,
        "fresh_biomass_t_per_ha": 8.0,
        "dry_matter_pct": 25.0,
        "n_content_dry_basis_pct": 2.5,
        "p2o5_content_pct": 0.4,
        "k2o_content_pct": 1.9,
        "c_to_n_ratio": 22.0,
        "days_before_sowing_to_incorporate": 14,
        "notes_si": "කන්න අතරතුර මුං හෝ කවුපි වගා කර කරල් නෙලීමෙන් පසු ශාක කොටස් මඩ ගැසීමේදී කුඹුරට යට කිරීම."
    }
}

class GreenManureNitrogenPlanner:
    """Plans green manuring, calculates biological nitrogen fixation, urea offsets, and financial savings."""

    def __init__(self):
        self.db = GREEN_MANURE_DATABASE
        self.urea_n_pct = 46.0  # Urea is 46% N
        self.bag_weight_kg = 50.0  # Standard 50kg bag
        self.urea_subsidized_price_lkr = 2500.0  # GOSL subsidized price
        self.urea_market_price_lkr = 9500.0      # Open market commercial rate

    def calculate_green_manure_plan(
        self,
        manure_key: str,
        land_area_ha: float = 1.0,
        biomass_fresh_tons: float = None,
        target_crop: str = "paddy"
    ) -> Dict[str, Any]:
        """
        Calculates nitrogen contribution and chemical fertilizer offsets.
        
        Args:
            manure_key: e.g. "sunnhemp", "sesbania", "gliricidia", "wild_sunflower", "azolla"
            land_area_ha: Land area in hectares (1 ha = 2.47 acres)
            biomass_fresh_tons: Optional actual observed biomass in tons. If None, uses DOA default yield.
            target_crop: Target subsequent crop (e.g. "paddy", "vegetable", "maize")
        """
        clean_key = manure_key.strip().lower()
        if clean_key not in self.db:
            return {
                "status": "ERROR",
                "message": f"Unknown green manure species '{manure_key}'.",
                "available_species": list(self.db.keys())
            }

        crop_info = self.db[clean_key]

        # Calculate biomass
        if biomass_fresh_tons is None or biomass_fresh_tons <= 0:
            biomass_fresh = crop_info["fresh_biomass_t_per_ha"] * land_area_ha
        else:
            biomass_fresh = biomass_fresh_tons

        dry_matter_tons = biomass_fresh * (crop_info["dry_matter_pct"] / 100.0)
        dry_matter_kg = dry_matter_tons * 1000.0

        # Nutrient release (kg)
        n_released_kg = dry_matter_kg * (crop_info["n_content_dry_basis_pct"] / 100.0)
        p2o5_released_kg = dry_matter_kg * (crop_info["p2o5_content_pct"] / 100.0)
        k2o_released_kg = dry_matter_kg * (crop_info["k2o_content_pct"] / 100.0)

        # Urea equivalent: 1 bag (50kg) of 46% Urea provides 23 kg N
        n_per_bag = self.bag_weight_kg * (self.urea_n_pct / 100.0)
        urea_bags_saved = n_released_kg / n_per_bag
        urea_kg_saved = urea_bags_saved * self.bag_weight_kg

        # Economic savings
        savings_subsidized_lkr = urea_bags_saved * self.urea_subsidized_price_lkr
        savings_market_lkr = urea_bags_saved * self.urea_market_price_lkr

        # Carbon sequestration estimation: Dry matter has ~45% Carbon. 1t C = 3.67t CO2e
        soil_carbon_added_t = dry_matter_tons * 0.45
        co2e_mitigated_t = soil_carbon_added_t * 3.67

        return {
            "calculation_timestamp": datetime.now().isoformat(),
            "species_en": crop_info["name_en"],
            "species_si": crop_info["name_si"],
            "species_ta": crop_info["name_ta"],
            "land_area_ha": land_area_ha,
            "land_area_acres": round(land_area_ha * 2.47105, 2),
            "fresh_biomass_total_tons": round(biomass_fresh, 2),
            "dry_matter_tons": round(dry_matter_tons, 2),
            "biological_nutrients_supplied_kg": {
                "nitrogen_n_kg": round(n_released_kg, 1),
                "phosphorus_p2o5_kg": round(p2o5_released_kg, 1),
                "potassium_k2o_kg": round(k2o_released_kg, 1)
            },
            "chemical_fertilizer_offset": {
                "urea_50kg_bags_saved": round(urea_bags_saved, 2),
                "urea_kg_saved": round(urea_kg_saved, 1),
                "financial_savings_subsidized_lkr": round(savings_subsidized_lkr, 2),
                "financial_savings_open_market_lkr": round(savings_market_lkr, 2)
            },
            "environmental_benefits": {
                "organic_carbon_added_tons": round(soil_carbon_added_t, 2),
                "co2_equivalent_sink_tons": round(co2e_mitigated_t, 2),
                "c_n_ratio": crop_info["c_to_n_ratio"]
            },
            "agronomic_protocol_si": {
                "incorporation_timing_si": f"ප්‍රධාන බෝගය සිටුවීමට/වපුරන්නට දින {crop_info['days_before_sowing_to_incorporate']} කට පෙර පසට යට කර මඩ කරන්න.",
                "practical_notes_si": crop_info["notes_si"],
                "summary_advisory_si": (
                    f"{land_area_ha} ha ඉඩමක {crop_info['name_si']} වගා කිරීමෙන් පසට ස්වභාවික නයිට්‍රජන් "
                    f"කි.ග්‍රෑ. {round(n_released_kg, 1)} ක් එකතු වේ. එමඟින් රසායනික යූරියා බෑග් "
                    f"{round(urea_bags_saved, 1)} ක් (රු. {round(savings_market_lkr, 0):,} ක විවෘත වෙළෙඳපොළ වියදමක්) "
                    f"සම්පූර්ණයෙන්ම ඉතිරි කරගත හැක!"
                )
            }
        }

if __name__ == "__main__":
    planner = GreenManureNitrogenPlanner()

    print("=== TEST 1: Sunnhemp (හණ) on 1 Hectare Paddy Field ===")
    plan1 = planner.calculate_green_manure_plan("sunnhemp", land_area_ha=1.0)
    print(f"Species: {plan1['species_si']}")
    print(f"Nitrogen Added: {plan1['biological_nutrients_supplied_kg']['nitrogen_n_kg']} kg N")
    print(f"Urea 50kg Bags Saved: {plan1['chemical_fertilizer_offset']['urea_50kg_bags_saved']} bags")
    print(f"Savings (Commercial): LKR {plan1['chemical_fertilizer_offset']['financial_savings_open_market_lkr']:,}")
    print(f"Advisory: {plan1['agronomic_protocol_si']['summary_advisory_si']}\n")

    print("=== TEST 2: Wild Sunflower (නැත්තසූරිය) on 0.5 Hectare Field ===")
    plan2 = planner.calculate_green_manure_plan("wild_sunflower", land_area_ha=0.5)
    print(f"Species: {plan2['species_si']}")
    print(f"K2O Potassium Added: {plan2['biological_nutrients_supplied_kg']['potassium_k2o_kg']} kg K2O")
    print(f"Urea Bags Saved: {plan2['chemical_fertilizer_offset']['urea_50kg_bags_saved']} bags")
    print(f"CO2e Sink: {plan2['environmental_benefits']['co2_equivalent_sink_tons']} tons CO2e")
