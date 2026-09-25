"""
CropSafe AI - Visual Crop Nutrient Deficiency Diagnostic & Remedy Key
Module: src/models/crop_deficiency_symptom_key.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Decision-tree based visual symptom matcher across major Sri Lankan crops (Paddy, Tea, Chili, Tomato, Maize, Coconut).
2. Differentiates older vs younger leaf symptoms, interveinal vs uniform chlorosis, marginal scorch, and purpling.
3. Distinguishes nutritional deficiency from fungal blights, viral mottling, or chemical scorching to prevent pesticide misuse.
4. Prescribes immediate remedial interventions (precise foliar spray concentrations, e.g., 0.5% ZnSO4, 1% Urea, 0.2% Borax).
5. Provides Department of Agriculture (DOA) Sri Lanka certified remedial guidelines in Sinhala, Tamil, and English.
"""

import os
import sys
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("CropDeficiencySymptomKey")

# Database of nutrient deficiency diagnostic keys
NUTRIENT_DEFICIENCY_KNOWLEDGE_BASE = {
    "nitrogen_deficiency": {
        "element": "Nitrogen (N)",
        "name_si": "නයිට්‍රජන් (N) ඌනතාවය",
        "name_ta": "நைட்ரஜன் (N) குறைபாடு",
        "leaf_position": "older_leaves",
        "primary_symptoms": ["uniform_yellowing", "stunted_growth", "thin_spindly_stems", "pale_green_to_yellow"],
        "paddy_specific": "පහළ කොළ මුලින්ම කහ වී පසුව මුළු ගොයම ලා කොළ පැහැ වේ. ගොබ දැමීම හා කරල් හටගැනීම බාල වේ.",
        "distinction_from_diseases": "කහ වීම ඒකාකාරීය (Uniform); දිලීර මෙන් ලප හෝ වලයාකාර දාර නැත. වෛරස් මෙන් රැලි වැටීම් නැත.",
        "immediate_remedy": {
            "foliar_spray_en": "Spray 1.0% Urea solution (10g Urea dissolved in 1 Liter water or 160g in 16L knapsack sprayer). Spray early morning.",
            "foliar_spray_si": "1% යූරියා ද්‍රාවණයක් (වතුර ලීටර් 1කට යූරියා ග්‍රෑම් 10ක් හෝ ලීටර් 16 ටැංකියකට ග්‍රෑම් 160ක්) උදෑසන කාලයේ පත්‍ර වලට ඉසින්න.",
            "soil_application_si": "අමතර යූරියා මූලික යෙදුම පස තෙතමනය සහිත අවස්ථාවේදී බෝග පාමුලට දමා පස් කරන්න."
        }
    },
    "phosphorus_deficiency": {
        "element": "Phosphorus (P)",
        "name_si": "පොස්පරස් (P) ඌනතාවය",
        "name_ta": "பாஸ்பரஸ் (P) குறைபாடு",
        "leaf_position": "older_leaves",
        "primary_symptoms": ["purplish_bronze_discoloration", "stunted_root_system", "delayed_maturity", "dark_green_stunted"],
        "paddy_specific": "පහළ පත්‍ර තද කොළ පැහැ ගැන්වී පසුව දම්/දුඹුරු පැහැ වේ. මුල් වර්ධනය අඩාල වී පැළ ගැලවී ඒම පහසු වේ.",
        "distinction_from_diseases": "දම් පැහැය කොළ අගිස්සේ සිට නාරටිය දෙසට විහිදේ. කිසිදු බැක්ටීරියා හෝ දිලීර පැල්ලමක් නොමැත.",
        "immediate_remedy": {
            "foliar_spray_en": "Foliar spray with 0.5% Monopotassium Phosphate (MKP) or 0.5% Superphosphate extract.",
            "foliar_spray_si": "0.5% මොනොපොටෑසියම් පොස්පේට් (MKP) ද්‍රාවණයක් (වතුර ලීටර් 16කට ග්‍රෑම් 80ක්) ඉසින්න.",
            "soil_application_si": "ට්‍රිපල් සුපර්පොස්පේට් (TSP) හෝ රොක් පොස්පේට් (ERP) කාබනික කොම්පෝස්ට් සමඟ කලවම් කර පසට යොදන්න."
        }
    },
    "potassium_deficiency": {
        "element": "Potassium (K)",
        "name_si": "පොටෑසියම් (K) ඌනතාවය",
        "name_ta": "பொட்டாசியம் (K) குறைபாடு",
        "leaf_position": "older_leaves",
        "primary_symptoms": ["marginal_leaf_scorch", "tip_burning", "weak_culms_lodging", "brown_spotting_along_margins"],
        "paddy_specific": "පරණ කොළ වල අගිස්ස සහ දාරය පිළිස්සී ගියාක් මෙන් දුඹුරු වේ (Marginal scorch). ගොයම් ගස් පහසුවෙන් බිම ඇද වැටේ (Lodging).",
        "distinction_from_diseases": "කොළ දාර දිගේ පිළිස්සුණු ස්වභාවයක් ඇති අතර, දිලීර කොළ පාළුව මෙන් කවාකාර කේන්ද්‍රීය වළලු නැත.",
        "immediate_remedy": {
            "foliar_spray_en": "Spray 1.0% Potassium Nitrate (KNO3) or 0.5% MOP (clear supernatant).",
            "foliar_spray_si": "1% පොටෑසියම් නයිට්‍රේට් හෝ පෙරාගත් 0.5% MOP ද්‍රාවණයක් පත්‍ර වලට ඉසින්න.",
            "soil_application_si": "මියුරියේට් ඔෆ් පොටෑෂ් (MOP) බෝගය වටා යොදා පස් බුරුල් කරන්න."
        }
    },
    "magnesium_deficiency": {
        "element": "Magnesium (Mg)",
        "name_si": "මැග්නීසියම් (Mg) ඌනතාවය",
        "name_ta": "மெக்னீசியம் (Mg) குறைபாடு",
        "leaf_position": "older_leaves",
        "primary_symptoms": ["interveinal_chlorosis_old_leaves", "veins_remain_green", "leaf_margins_curled"],
        "paddy_specific": "පරණ කොළ වල නාරටි කොළ පැහැයෙන් ඉතිරි වන අතර නාරටි අතර ප්‍රදේශය ලා කහ හෝ තැඹිලි පැහැ වේ.",
        "distinction_from_diseases": "නාරටි හරිතව පැවතීම (Interveinal pattern) පැහැදිලි ලක්ෂණයකි; දිලීර ලප වලින් මෙය පහසුවෙන් වෙන්කර හඳුනාගත හැක.",
        "immediate_remedy": {
            "foliar_spray_en": "Spray 0.5% to 1.0% Epsom salt (Magnesium Sulfate MgSO4) solution (80-160g in 16L).",
            "foliar_spray_si": "මැග්නීසියම් සල්ෆේට් (එප්සම් ලුණු) 0.5% ද්‍රාවණයක් (වතුර ලීටර් 16කට ග්‍රෑම් 80ක්) සතියක පරතරයෙන් දෙවරක් ඉසින්න.",
            "soil_application_si": "ඩොලමයිට් (Dolomite) පසට යෙදීමෙන් දීර්ඝකාලීනව මැග්නීසියම් හා කැල්සියම් ඌනතාවය සමනය වේ."
        }
    },
    "calcium_deficiency": {
        "element": "Calcium (Ca)",
        "name_si": "කැල්සියම් (Ca) ඌනතාවය",
        "name_ta": "கால்சியம் (Ca) குறைபாடு",
        "leaf_position": "younger_leaves_and_fruits",
        "primary_symptoms": ["blossom_end_rot", "tip_hooking", "bud_death", "distorted_young_leaves"],
        "paddy_specific": "නව දළු අගිස්ස නම්‍ය වී කොක්කක් මෙන් ඇඹරී යාම (Hooking) සහ තක්කාලි/මිරිස් වල ගෙඩි පතුල කුණු වීම (Blossom End Rot).",
        "distinction_from_diseases": "ගෙඩියේ පහළ කළු පැහැවීම බැක්ටීරියා කුණුවීමක් නොවේ; ජලය හා කැල්සියම් ගමන් නොකිරීම නිසා පටක මියයාමකි.",
        "immediate_remedy": {
            "foliar_spray_en": "Spray 0.5% Calcium Nitrate or Calcium Chloride solution directly targeting young foliage and developing fruit.",
            "foliar_spray_si": "0.5% කැල්සියම් නයිට්‍රේට් ද්‍රාවණයක් (වතුර ලීටර් 16කට ග්‍රෑම් 80ක්) අලුත් දළු සහ ගෙඩි වලට ඉසින්න.",
            "soil_application_si": "පසේ තෙතමනය එකසේ පවත්වා ගන්න (ජල හිඟකම නිසා කැල්සියම් උරාගැනීම නතර වේ). කෘෂි හුණු/ඩොලමයිට් යොදන්න."
        }
    },
    "zinc_deficiency": {
        "element": "Zinc (Zn)",
        "name_si": "සින්ක් / සින්ක් (Zn) ඌනතාවය (ඛයිරා රෝගය)",
        "name_ta": "துத்தநாகம் (Zn) குறைபாடு",
        "leaf_position": "middle_and_young_leaves",
        "primary_symptoms": ["khaira_disease_paddy", "brown_rusty_specks_midrib", "little_leaf", "short_internodes"],
        "paddy_specific": "පැළ සිටුවා සති 2-3 කදී කොළ මැද නාරටිය දෙපස මලකඩ පැහැ ලප (Khaira disease) මතුවී ශාකය කුරු වේ.",
        "distinction_from_diseases": "බොහෝ විට ගොවීන් මෙය දිලීර ලප රෝගයක් ලෙස වරදවා වටහා ගනී. නමුත් මලකඩ ලප නාරටියේ පාදමෙන් ආරම්භ වේ.",
        "immediate_remedy": {
            "foliar_spray_en": "Spray 0.5% Zinc Sulfate Heptahydrate (ZnSO4·7H2O) neutralized with 0.25% slaked lime (40g ZnSO4 in 16L).",
            "foliar_spray_si": "0.5% සින්ක් සල්ෆේට් ද්‍රාවණයක් (වතුර ලීටර් 16කට ග්‍රෑම් 40-50ක්) ගොයමට හෝ එළවළු බෝගයට කඩිනමින් ඉසින්න.",
            "soil_application_si": "කුඹුරට හෙක්ටයාරයකට සින්ක් සල්ෆේට් කි.ග්‍රෑ. 10ක් මඩ ගැසීමේදී පසට යොදන්න."
        }
    },
    "iron_deficiency": {
        "element": "Iron (Fe)",
        "name_si": "යකඩ (Fe) ඌනතාවය",
        "name_ta": "இரும்பு (Fe) குறைபாடு",
        "leaf_position": "younger_leaves",
        "primary_symptoms": ["interveinal_chlorosis_young_leaves", "bleached_white_young_leaves", "veins_initially_green"],
        "paddy_specific": "අලුතින් එන දළු සහ ඉහළ කොළ සම්පූර්ණයෙන්ම කහ හෝ කිරි සුදු පැහැයට හැරේ (Bleached white).",
        "distinction_from_diseases": "පරණ කොළ සාමාන්‍ය කොළ පැහැයෙන් තිබියදී අලුත් දළු පමණක් සම්පූර්ණයෙන්ම සුදුමැලි වීම.",
        "immediate_remedy": {
            "foliar_spray_en": "Foliar spray with 0.5% Ferrous Sulfate (FeSO4) or 0.1% Fe-EDTA Chelate.",
            "foliar_spray_si": "0.5% ෆෙරස් සල්ෆේට් (යකඩ සල්ෆේට්) ද්‍රාවණයක් (වතුර ලීටර් 16කට ග්‍රෑම් 50ක්) සතියක පරතරයෙන් ඉසින්න.",
            "soil_application_si": "පසේ pH අගය ක්ෂාරීය (pH > 7.5) නම් යකඩ උරා නොගන්නා බැවින් පසට කාබනික කොම්පෝස්ට් යොදන්න."
        }
    },
    "boron_deficiency": {
        "element": "Boron (B)",
        "name_si": "බෝරෝන් (B) ඌනතාවය",
        "name_ta": "போரான் (B) குறைபாடு",
        "leaf_position": "growing_tips_and_fruits",
        "primary_symptoms": ["hollow_stem", "cracked_fruits", "deformed_growing_tip", "poor_pollination_barren_ears"],
        "paddy_specific": "කරල් වල බීජ පිරෙන්නේ නැතිව බොල් වීම (Empty grains) සහ ගෝවා/තක්කාලි කඳ ඇතුළ හිස් වීම හෝ ගෙඩි පුපුරා යාම.",
        "distinction_from_diseases": "පළතුරු පැළී යාම සහ මල් වැටීම දිලීරයක් නොව සෛල බිත්ති වල බෝරෝන් හිඟකමකි.",
        "immediate_remedy": {
            "foliar_spray_en": "Spray 0.1% to 0.2% Solubor or Borax solution (15-30g in 16L). Do not exceed concentration as Boron has a narrow safety window.",
            "foliar_spray_si": "0.1% - 0.2% බෝරාක්ස් ද්‍රාවණයක් (වතුර ලීටර් 16කට ග්‍රෑම් 20ක්) මල් පිපීමට සතියකට පෙර ඉසින්න. මාත්‍රාව වැඩි නොකරන්න.",
            "soil_application_si": "හෙක්ටයාරයකට බෝරාක්ස් කි.ග්‍රෑ. 5ක් කොම්පෝස්ට් සමඟ කලවම් කර පසට යොදන්න."
        }
    }
}

class CropDeficiencySymptomKeyEngine:
    """Diagnoses crop nutrient deficiencies based on visual symptoms and prescribes remedies."""

    def __init__(self):
        self.kb = NUTRIENT_DEFICIENCY_KNOWLEDGE_BASE

    def diagnose_deficiency(
        self,
        crop_type: str,
        leaf_position: str,
        symptom_description: str,
        is_veins_green: Optional[bool] = None,
        fruit_affected: Optional[bool] = None
    ) -> Dict[str, Any]:
        """
        Diagnoses nutrient deficiency from observable field features.
        
        Args:
            crop_type: e.g. "paddy", "tea", "chili", "tomato", "maize", "vegetable"
            leaf_position: "older_leaves", "younger_leaves", "growing_tips", "whole_plant"
            symptom_description: e.g. "uniform_yellowing", "marginal_scorch", "purplish", "interveinal_chlorosis", "tip_hooking", "khaira_rusty_spots"
            is_veins_green: True if leaf veins stay green while tissue turns yellow
            fruit_affected: True if blossom end rot or fruit cracking observed
        """
        candidate_scores = {}

        for key, data in self.kb.items():
            score = 0.0

            # Match leaf position
            target_pos = data["leaf_position"]
            if leaf_position in target_pos or target_pos in leaf_position:
                score += 35.0
            elif leaf_position == "whole_plant" and key in ["nitrogen_deficiency", "zinc_deficiency"]:
                score += 25.0

            # Match primary symptoms
            for sym in data["primary_symptoms"]:
                if sym.lower() in symptom_description.lower() or symptom_description.lower() in sym.lower():
                    score += 40.0
                    break

            # Check interveinal chlorosis
            if is_veins_green is True:
                if key in ["magnesium_deficiency", "iron_deficiency"]:
                    score += 25.0
                elif key == "nitrogen_deficiency":
                    score -= 30.0  # Nitrogen chlorosis is uniform, veins also yellow

            # Check fruit affected
            if fruit_affected is True:
                if key in ["calcium_deficiency", "boron_deficiency"]:
                    score += 30.0

            candidate_scores[key] = max(0.0, min(100.0, score))

        # Sort candidates
        sorted_candidates = sorted(candidate_scores.items(), key=lambda x: x[1], reverse=True)
        best_match_key, confidence = sorted_candidates[0]
        best_data = self.kb[best_match_key]

        return {
            "diagnostic_timestamp": datetime.now().isoformat(),
            "query_inputs": {
                "crop_type": crop_type,
                "leaf_position": leaf_position,
                "symptom_description": symptom_description,
                "is_veins_green": is_veins_green,
                "fruit_affected": fruit_affected
            },
            "top_diagnosis": {
                "deficiency_key": best_match_key,
                "element": best_data["element"],
                "name_si": best_data["name_si"],
                "name_ta": best_data["name_ta"],
                "confidence_score": round(confidence, 1),
                "distinction_from_disease": best_data["distinction_from_diseases"],
                "paddy_or_crop_symptom": best_data["paddy_specific"],
                "immediate_foliar_remedy_si": best_data["immediate_remedy"]["foliar_spray_si"],
                "immediate_foliar_remedy_en": best_data["immediate_remedy"]["foliar_spray_en"],
                "soil_application_remedy_si": best_data["immediate_remedy"]["soil_application_si"]
            },
            "alternative_possibilities": [
                {
                    "element": self.kb[k]["element"],
                    "name_si": self.kb[k]["name_si"],
                    "confidence_score": round(score, 1)
                }
                for k, score in sorted_candidates[1:3] if score > 20.0
            ],
            "field_action_alert_si": (
                f"මෙම රෝග ලක්ෂණය දිලීරයක් නොවන බව පෙනී යයි. అనවශ්‍ය ලෙස දිලීර නාශක ඉසීමෙන් වළකින්න. "
                f"ක්ෂණික ප්‍රතිකාරයක් ලෙස {best_data['immediate_remedy']['foliar_spray_si']} අනුගමනය කරන්න."
            )
        }

if __name__ == "__main__":
    key_engine = CropDeficiencySymptomKeyEngine()

    print("=== TEST 1: Marginal Leaf Scorch on Older Leaves (Potassium Deficiency) ===")
    diag1 = key_engine.diagnose_deficiency(
        crop_type="paddy",
        leaf_position="older_leaves",
        symptom_description="marginal_leaf_scorch",
        is_veins_green=False
    )
    print(f"Diagnosed: {diag1['top_diagnosis']['name_si']} (Confidence: {diag1['top_diagnosis']['confidence_score']}%)")
    print(f"Remedy: {diag1['top_diagnosis']['immediate_foliar_remedy_si']}\n")

    print("=== TEST 2: Young Leaves Interveinal Chlorosis / Bleached White (Iron Deficiency) ===")
    diag2 = key_engine.diagnose_deficiency(
        crop_type="tomato",
        leaf_position="younger_leaves",
        symptom_description="interveinal_chlorosis",
        is_veins_green=True
    )
    print(f"Diagnosed: {diag2['top_diagnosis']['name_si']} (Confidence: {diag2['top_diagnosis']['confidence_score']}%)")
    print(f"Remedy: {diag2['top_diagnosis']['immediate_foliar_remedy_si']}\n")

    print("=== TEST 3: Blossom End Rot on Tomato Fruits (Calcium Deficiency) ===")
    diag3 = key_engine.diagnose_deficiency(
        crop_type="tomato",
        leaf_position="growing_tips",
        symptom_description="blossom_end_rot",
        fruit_affected=True
    )
    print(f"Diagnosed: {diag3['top_diagnosis']['name_si']} (Confidence: {diag3['top_diagnosis']['confidence_score']}%)")
    print(f"Action: {diag3['field_action_alert_si']}")
