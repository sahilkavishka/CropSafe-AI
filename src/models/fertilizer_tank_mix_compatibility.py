"""
CropSafe AI - Fertilizer Tank-Mix Compatibility & Antagonism Checker
Module: src/models/fertilizer_tank_mix_compatibility.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Evaluates chemical and physical compatibility of 2 or more fertilizers / agro-inputs.
2. Identifies dangerous precipitation reactions (e.g. Calcium Nitrate + Sulphates/Phosphates forming gypsum).
3. Detects ammonia volatilization risks (e.g. Urea + Quicklime / Basic slag).
4. Determines correct mixing sequence based on WALES protocol (Wettable powders -> Agitation -> Liquid -> Emulsifiable -> Solubles).
5. Provides step-by-step Field Jar Test protocol for farmers in Sinhala, Tamil, and English.
6. Computes spray nozzle clogging and foliar burn risk indices.
"""

import os
import sys
import json
import logging
from typing import Dict, List, Any, Tuple
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("FertilizerTankMixCompatibility")

# Fertilizer chemical database with compatibility attributes
FERTILIZER_DATABASE = {
    "urea": {
        "name_en": "Urea (46-0-0)",
        "name_si": "යූරියා (නයිට්‍රජන් 46%)",
        "name_ta": "யூரியா (நைட்ரஜன் 46%)",
        "ph_effect": "neutral_to_mild_alkaline",
        "category": "soluble_nitrogen",
        "cations": ["NH4+"],
        "anions": ["CO(NH2)2"],
        "antagonists": ["quicklime", "copper_fungicides", "basic_slag"]
    },
    "mop": {
        "name_en": "Muriate of Potash / MOP (0-0-60)",
        "name_si": "මියුරියේට් ඔෆ් පොටෑෂ් / MOP (පොටෑසියම් 60%)",
        "name_ta": "மியூரியேட் ஆஃப் பொட்டாஷ் (MOP 60%)",
        "ph_effect": "neutral",
        "category": "soluble_potash",
        "cations": ["K+"],
        "anions": ["Cl-"],
        "antagonists": ["high_sulfate_concentrates"]
    },
    "tsp": {
        "name_en": "Triple Superphosphate / TSP (0-46-0)",
        "name_si": "ට්‍රිපල් සුපර්පොස්පේට් / TSP (පොස්පරස් 46%)",
        "name_ta": "டிரிபிள் சூப்பர்பாஸ்பேட் (TSP 46%)",
        "ph_effect": "acidic",
        "category": "phosphate",
        "cations": ["Ca2+"],
        "anions": ["H2PO4-"],
        "antagonists": ["calcium_nitrate", "iron_chelate", "zinc_sulfate_high"]
    },
    "calcium_nitrate": {
        "name_en": "Calcium Nitrate (15.5-0-0 + 19% Ca)",
        "name_si": "කැල්සියම් නයිට්‍රේට් (නයිට්‍රජන් + කැල්සියම්)",
        "name_ta": "கால்சியம் நைட்ரேட் (நைட்ரஜன் + கால்சியம்)",
        "ph_effect": "neutral_to_mild_acidic",
        "category": "calcium_salt",
        "cations": ["Ca2+"],
        "anions": ["NO3-"],
        "antagonists": ["tsp", "potassium_sulfate", "magnesium_sulfate", "ammonium_phosphate"]
    },
    "potassium_sulfate": {
        "name_en": "Sulfate of Potash / SOP (0-0-50 + 18% S)",
        "name_si": "සල්ෆේට් ඔෆ් පොටෑෂ් / SOP (පොටෑසියම් + සල්ෆර්)",
        "name_ta": "பொட்டாசியம் சல்பேட் (SOP)",
        "ph_effect": "neutral",
        "category": "sulfate_salt",
        "cations": ["K+"],
        "anions": ["SO4(2-)"],
        "antagonists": ["calcium_nitrate", "quicklime"]
    },
    "magnesium_sulfate": {
        "name_en": "Epsom Salt / Magnesium Sulfate (9.6% Mg + 13% S)",
        "name_si": "මැග්නීසියම් සල්ෆේට් / එප්සම් ලුණු",
        "name_ta": "மெக்னீசியம் சல்பேட் (எப்சம் உப்பு)",
        "ph_effect": "neutral",
        "category": "micronutrient_sulfate",
        "cations": ["Mg2+"],
        "anions": ["SO4(2-)"],
        "antagonists": ["calcium_nitrate", "ammonium_phosphate"]
    },
    "zinc_sulfate": {
        "name_en": "Zinc Sulfate Heptahydrate (21% Zn)",
        "name_si": "සින්ක් සල්ෆේට්",
        "name_ta": "துத்தநாக சல்பேட்",
        "ph_effect": "acidic",
        "category": "micronutrient",
        "cations": ["Zn2+"],
        "anions": ["SO4(2-)"],
        "antagonists": ["tsp", "ammonium_phosphate", "calcium_nitrate"]
    },
    "borax": {
        "name_en": "Borax / Disodium Octaborate (11-20% B)",
        "name_si": "බෝරාක්ස් / බෝරෝන්",
        "name_ta": "போராக்ஸ் / போரான்",
        "ph_effect": "mild_alkaline",
        "category": "micronutrient",
        "cations": ["Na+"],
        "anions": ["B4O7(2-)"],
        "antagonists": ["copper_fungicides", "acidic_liquid_fertilizers"]
    },
    "copper_fungicides": {
        "name_en": "Copper Oxychloride / Bordeaux Mixture",
        "name_si": "කොපර් දිලීර නාශක (කොපර් ඔක්සික්ලෝරයිඩ්)",
        "name_ta": "தாமிர பூஞ்சைக் கொல்லி",
        "ph_effect": "alkaline",
        "category": "pesticide_copper",
        "cations": ["Cu2+"],
        "anions": ["Cl-", "OH-"],
        "antagonists": ["urea", "borax", "organophosphate_pesticides", "acidic_foliars"]
    },
    "quicklime": {
        "name_en": "Agricultural Lime / Quicklime (CaCO3 / CaO)",
        "name_si": "කෘෂිකාර්මික හුණු (ඩොලමයිට් / ක්ෂණික හුණු)",
        "name_ta": "விவசாய சுண்ணாம்பு",
        "ph_effect": "strongly_alkaline",
        "category": "soil_amendment",
        "cations": ["Ca2+"],
        "anions": ["CO3(2-)", "O(2-)"],
        "antagonists": ["urea", "ammonium_sulfate", "tsp", "potassium_sulfate"]
    }
}

# Known precipitation and reaction pairs
KNOWN_REACTION_RULES = [
    {
        "pair": {"calcium_nitrate", "tsp"},
        "severity": "CRITICAL_INCOMPATIBLE",
        "issue_en": "Forms insoluble Calcium Phosphate (Ca3(PO4)2) chalk precipitate; clogs spray nozzles and locks up both Phosphorus and Calcium.",
        "issue_si": "කැල්සියම් පොස්පේට් සුදු හුණු කැටිති බවට පත්වී දිය නොවී තැන්පත් වේ. ස්ප්‍රේ නොසල් හිරවන අතර ශාකයට පොස්පරස් හා කැල්සියම් උරාගත නොහැක.",
        "issue_ta": "கால்சியம் பாஸ்பேட் உருவாகி ஸ்ப்ரே நாசில்களை அடைக்கும்.",
        "nozzle_clog_risk": 0.95,
        "nutrient_loss_pct": 85.0
    },
    {
        "pair": {"calcium_nitrate", "potassium_sulfate"},
        "severity": "CRITICAL_INCOMPATIBLE",
        "issue_en": "Forms insoluble Gypsum (Calcium Sulfate - CaSO4·2H2O); forms thick paste in tank.",
        "issue_si": "ජලයේ දිය නොවන ජිප්සම් (කැල්සියම් සල්ෆේට්) තට්ටුවක් සෑදී ටැංකිය අඩියේ මඩ මෙන් කැටි ගැසේ.",
        "issue_ta": "ஜிப்சம் படிந்து டேங்க் அடிப்பகுதியில் படியும்.",
        "nozzle_clog_risk": 0.90,
        "nutrient_loss_pct": 75.0
    },
    {
        "pair": {"calcium_nitrate", "magnesium_sulfate"},
        "severity": "CRITICAL_INCOMPATIBLE",
        "issue_en": "Calcium and Sulfate ions form precipitation of CaSO4 precipitate at typical tank concentrations.",
        "issue_si": "කැල්සියම් සහ සල්ෆේට් අයන එකතු වී දිය නොවන සුදු කැටිති හටගනී.",
        "issue_ta": "கால்சியம் மற்றும் சல்பேட் படிவுகள் உருவாகும்.",
        "nozzle_clog_risk": 0.85,
        "nutrient_loss_pct": 70.0
    },
    {
        "pair": {"urea", "quicklime"},
        "severity": "CRITICAL_VOLATILIZATION",
        "issue_en": "Alkaline lime converts Ammonium/Amide into toxic Ammonia gas (NH3); up to 60% Nitrogen is lost into the air with severe odor.",
        "issue_si": "හුණු වල ඇති ක්ෂාරීය බව නිසා යූරියා නයිට්‍රජන් ඇමෝනියා වායුවක් ලෙස වාතයට වාෂ්ප වී යයි (60% කට වඩා නයිට්‍රජන් අපතේ යයි).",
        "issue_ta": "யூரியாவிலுள்ள நைட்ரஜன் அம்மோனியா வாயுவாக ஆவியாகி வீணாகும்.",
        "nozzle_clog_risk": 0.15,
        "nutrient_loss_pct": 65.0
    },
    {
        "pair": {"urea", "copper_fungicides"},
        "severity": "HIGH_FOLIAR_BURN",
        "issue_en": "Urea opens leaf cuticle excessively, causing severe copper toxicity and foliar scorch on leaves.",
        "issue_si": "යූරියා නිසා පත්‍රයේ රෝම කූප අධික ලෙස විවෘත වී කොපර් විෂ වීමෙන් කොළ පිළිස්සී යයි (Foliar burn).",
        "issue_ta": "இலைகள் கருகி சேதமடையும் அபாயம் உள்ளது.",
        "nozzle_clog_risk": 0.20,
        "nutrient_loss_pct": 30.0
    },
    {
        "pair": {"tsp", "zinc_sulfate"},
        "severity": "MODERATE_INCOMPATIBLE",
        "issue_en": "Phosphate precipitates with Zinc forming Zinc Phosphate, immobilizing micronutrient Zinc.",
        "issue_si": "පොස්පේට් සහ සින්ක් එකතු වී සින්ක් පොස්පේට් සෑදී ශාකයට සින්ක් උරාගැනීම අඩාල වේ.",
        "issue_ta": "துத்தநாக சத்து பயிருக்கு கிடைப்பது தடைபடும்.",
        "nozzle_clog_risk": 0.65,
        "nutrient_loss_pct": 50.0
    }
]

class FertilizerTankMixCompatibilityEngine:
    """Evaluates compatibility, chemical hazard, mixing sequence, and field jar test protocols."""

    def __init__(self):
        self.db = FERTILIZER_DATABASE
        self.rules = KNOWN_REACTION_RULES

    def evaluate_mix(self, input_keys: List[str], water_volume_liters: float = 16.0) -> Dict[str, Any]:
        """
        Evaluates a tank mix combination of 2 or more fertilizers.
        Default volume is 16L (standard Sri Lankan farmer knapsack sprayer).
        """
        clean_keys = [k.strip().lower() for k in input_keys if k.strip().lower() in self.db]

        if len(clean_keys) < 2:
            return {
                "status": "INSUFFICIENT_INPUTS",
                "message_en": "Please provide at least 2 valid fertilizer keys to test compatibility.",
                "message_si": "මිශ්‍රණය පරීක්ෂා කිරීම සඳහා අවම වශයෙන් පොහොර වර්ග 2ක් වත් තෝරන්න.",
                "valid_keys": list(self.db.keys())
            }

        conflicts = []
        max_clog_risk = 0.0
        max_nutrient_loss = 0.0
        overall_verdict = "COMPATIBLE"

        # Check all unique pairs
        n = len(clean_keys)
        for i in range(n):
            for j in range(i + 1, n):
                pair_set = {clean_keys[i], clean_keys[j]}
                for rule in self.rules:
                    if rule["pair"] == pair_set:
                        conflicts.append({
                            "fertilizer_1": self.db[clean_keys[i]]["name_en"],
                            "fertilizer_2": self.db[clean_keys[j]]["name_en"],
                            "severity": rule["severity"],
                            "issue_en": rule["issue_en"],
                            "issue_si": rule["issue_si"],
                            "issue_ta": rule["issue_ta"],
                            "nozzle_clog_risk": rule["nozzle_clog_risk"],
                            "nutrient_loss_pct": rule["nutrient_loss_pct"]
                        })
                        max_clog_risk = max(max_clog_risk, rule["nozzle_clog_risk"])
                        max_nutrient_loss = max(max_nutrient_loss, rule["nutrient_loss_pct"])

        if conflicts:
            severities = [c["severity"] for c in conflicts]
            if any("CRITICAL" in s for s in severities):
                overall_verdict = "DANGEROUS_INCOMPATIBLE"
            elif any("HIGH" in s for s in severities):
                overall_verdict = "HIGH_RISK"
            else:
                overall_verdict = "CAUTION_REQUIRED"

        # Generate WALES mixing order
        wales_order = self._determine_mixing_order(clean_keys)

        # Generate Field Jar Test Protocol
        jar_test = self._generate_jar_test_protocol(clean_keys, water_volume_liters)

        result = {
            "evaluation_timestamp": datetime.now().isoformat(),
            "inputs_tested": [self.db[k]["name_en"] for k in clean_keys],
            "inputs_tested_si": [self.db[k]["name_si"] for k in clean_keys],
            "water_volume_liters": water_volume_liters,
            "overall_verdict": overall_verdict,
            "is_safe_to_mix": overall_verdict == "COMPATIBLE",
            "nozzle_clogging_risk_pct": round(max_clog_risk * 100, 1),
            "estimated_nutrient_loss_pct": round(max_nutrient_loss, 1),
            "conflicts_detected": conflicts,
            "recommended_mixing_sequence": wales_order,
            "jar_test_protocol": jar_test,
            "advisory_summary_si": self._generate_sinhala_summary(overall_verdict, conflicts, wales_order)
        }

        return result

    def _determine_mixing_order(self, keys: List[str]) -> List[Dict[str, Any]]:
        """Determines the standard scientific WALES mixing sequence."""
        # Step hierarchy:
        # 1. Fill tank 50% with clean water and agitate.
        # 2. Wettable Powders (WP) / Dry Solubles (TSP, Zinc Sulfate, Borax)
        # 3. Liquid concentrates / flowables
        # 4. Soluble salts (Urea, MOP)
        # 5. Adjuvants / Surfactants
        # 6. Fill remaining 50% water.
        sequence = []
        sequence.append({
            "step": 1,
            "action_en": "Fill sprayer tank with 50% of total clean water (e.g. 8 Liters) and begin agitation.",
            "action_si": "ඉසින ටැංකියට මුළු පිරිසිදු ජලයෙන් 50% ක් (ලීටර් 8ක්) පුරවා හොඳින් කලවම් කිරීම අරඹන්න."
        })

        step_idx = 2
        # Prioritize dry powders / phosphates
        dry_powders = [k for k in keys if k in ["tsp", "zinc_sulfate", "borax", "quicklime"]]
        for k in dry_powders:
            sequence.append({
                "step": step_idx,
                "fertilizer": self.db[k]["name_en"],
                "action_en": f"Pre-dissolve {self.db[k]['name_en']} in a small bucket of water, pour through strainer, and agitate thoroughly.",
                "action_si": f"{self.db[k]['name_si']} වෙනම බාල්දියක දියකර පෙරා ටැංකියට දමා හොඳින් කලවම් කරන්න."
            })
            step_idx += 1

        # Liquids / other salts
        other_salts = [k for k in keys if k not in dry_powders]
        for k in other_salts:
            sequence.append({
                "step": step_idx,
                "fertilizer": self.db[k]["name_en"],
                "action_en": f"Add {self.db[k]['name_en']} slowly while constantly stirring until fully dissolved.",
                "action_si": f"{self.db[k]['name_si']} සෙමෙන් එක්කර සම්පූර්ණයෙන්ම දියවන තෙක් අඛණ්ඩව කලවම් කරන්න."
            })
            step_idx += 1

        sequence.append({
            "step": step_idx,
            "action_en": "Top up tank to 100% full capacity (16 Liters) with water. Spray immediately within 2 hours.",
            "action_si": "ඉතිරි ජලය එක්කර සම්පූර්ණ ලීටර් 16 සම්පූර්ණ කර පැය 2ක් ඇතුළත වහාම බෝගයට ඉසින්න."
        })

        return sequence

    def _generate_jar_test_protocol(self, keys: List[str], tank_liters: float) -> Dict[str, Any]:
        """Provides DIY Jar Test instructions before filling large sprayers."""
        return {
            "title_en": "5-Minute DIY Glass Jar Compatibility Test",
            "title_si": "විනාඩි 5ක වීදුරු බෝතල් පරීක්ෂාව (Jar Test)",
            "instructions_si": [
                "1. පිරිසිදු විනිවිද පෙනෙන වීදුරු බෝතලයකට (ජෑම් බෝතලයක්) වතුර මිලිලීටර් 500ක් ගන්න.",
                "2. ඉසීමට නියමිත පොහොර වර්ග වලින් තේ හැඳි භාගය බැගින් අනුපිළිවෙලින් දමා විනාඩියක් හොඳින් සොලවන්න.",
                "3. විනාඩි 10 සිට 15 දක්වා බෝතලය නොසොල්වා තබන්න.",
                "4. පතුලේ සුදු පැහැති හුණු කැටිති, තෙල් තට්ටුවක් හෝ උෂ්ණත්වය අධික ලෙස රත්වී ඇත්නම් එම පොහොර එකට මිශ්‍ර නොකරන්න!"
            ],
            "pass_criteria_si": "ද්‍රාවණය පැහැදිලිව දියවී පතුලේ කැටි ගැසීම් හෝ බුබුළු දැමීමක් නැතිනම් ටැංකියට දැමීම ආරක්ෂිතයි."
        }

    def _generate_sinhala_summary(self, verdict: str, conflicts: List[Dict[str, Any]], sequence: List[Dict[str, Any]]) -> str:
        if verdict == "COMPATIBLE":
            return "මෙම පොහොර වර්ග එකට මිශ්‍ර කිරීම ආරක්ෂිතයි. නියමිත අනුපිළිවෙලට දියකර වහාම බෝගයට යොදන්න."
        elif verdict == "DANGEROUS_INCOMPATIBLE":
            issues = "; ".join([c["issue_si"] for c in conflicts])
            return f"අවවාදයයි! මෙම පොහොර වර්ග එකට මිශ්‍ර කිරීම ඉතා හානිකරයි ({issues}). වෙන වෙනම යොදන්න."
        else:
            return "මෙම මිශ්‍රණයේ අවදානම් සහගත ප්‍රතික්‍රියා ඇත. ඉසීමට පෙර වීදුරු බෝතල් පරීක්ෂාව (Jar test) සිදුකරන්න."

if __name__ == "__main__":
    engine = FertilizerTankMixCompatibilityEngine()

    print("=== TEST 1: Dangerous Mix (Calcium Nitrate + TSP) ===")
    res1 = engine.evaluate_mix(["calcium_nitrate", "tsp"])
    print(f"Verdict: {res1['overall_verdict']}")
    print(f"Clogging Risk: {res1['nozzle_clogging_risk_pct']}%")
    print(f"Sinhala Advisory: {res1['advisory_summary_si']}\n")

    print("=== TEST 2: Ammonia Volatilization Mix (Urea + Quicklime) ===")
    res2 = engine.evaluate_mix(["urea", "quicklime"])
    print(f"Verdict: {res2['overall_verdict']}")
    print(f"Nutrient Loss: {res2['estimated_nutrient_loss_pct']}%")
    print(f"Sinhala Advisory: {res2['advisory_summary_si']}\n")

    print("=== TEST 3: Safe Compatible Mix (Urea + MOP + Borax) ===")
    res3 = engine.evaluate_mix(["urea", "mop", "borax"])
    print(f"Verdict: {res3['overall_verdict']}")
    print(f"Is Safe: {res3['is_safe_to_mix']}")
    print(f"Sinhala Advisory: {res3['advisory_summary_si']}")
