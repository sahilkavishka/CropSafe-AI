"""
CropSafe AI - Crop Leaf Burn & Fertilizer Toxicity Troubleshooter
Specialist diagnostic engine helping farmers identify post-fertilization crop damage,
distinguishing toxic chemical contaminants (e.g. Biuret) from osmotic salt burn and fake-fertilizer nutrient starvation.
"""

import os
import sys
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from typing import Dict, Any, List

# Windows encoding safety
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


class FertilizerToxicityTroubleshooter:
    """Diagnoses crop stress symptoms following fertilizer application and prescribes first-aid remedies."""

    DIAGNOSES = {
        "Biuret_Toxicity": {
            "name_en": "Toxic Biuret Contamination",
            "name_si": "බයියුරෙට් රසායනික විෂවීම (Biuret Toxicity)",
            "cause": "Substandard urea batch containing > 1.0% biuret impurity.",
            "emergency_actions_en": [
                "Immediately cease using the suspected urea batch.",
                "Foliar spray with 1% seaweed extract or humic acid to stimulate cellular repair.",
                "Apply generous top-dressing of organic well-cured compost (500 kg/ha) to buffer root zone.",
                "Submit sample of the fertilizer to the Agrarian Services Center for biuret assay."
            ],
            "emergency_actions_si": [
                "අදාළ සැකකටයුතු යූරියා භාවිතය වහාම නවත්වන්න.",
                "ශාක සෛල සුවපත් කිරීම සඳහා 1% මුහුදු පැලෑටි සාරය (Seaweed extract) හෝ හියුමික් අම්ල පත්‍ර ඉසිනයක් යොදන්න.",
                "පසෙහි මුල් කලාපය ආරක්ෂා කිරීම සඳහා හොඳින් පැසුණු කොම්පෝස්ට් පසට එකතු කරන්න.",
                "පොහොර සාම්පලයක් රැගෙන ගොවිජන සේවා මධ්‍යස්ථානය වෙත ගොස් බයියුරෙට් පරීක්ෂාව සඳහා යොමු කරන්න."
            ]
        },
        "Osmotic_Salt_Burn": {
            "name_en": "Osmotic Root Plasmolysis / Fertilizer Salt Burn",
            "name_si": "පොහොර සැර වැඩිවීම / මුල් පිළිස්සීම (Fertilizer Salt Scorch)",
            "cause": "Over-concentration of soluble fertilizer applied too close to root crown in dry soil.",
            "emergency_actions_en": [
                "Flood/flush field with 5 - 10 cm of fresh standing irrigation water to leach excess salts.",
                "Maintain moist soil condition; DO NOT allow the field to dry or crack.",
                "Withhold all chemical fertilizers for at least 14 days until new white feeder roots appear.",
                "Apply light foliar micro-nutrient spray once recovery tillers emerge."
            ],
            "emergency_actions_si": [
                "අතිරික්ත ලවණ මුල් කලාපයෙන් පහළට සේදී යාම සඳහා කුඹුරට/පාත්තියට අඟල් 2-4 ක් පිරිසිදු ජලය බැඳ සෝදා හරින්න.",
                "පස වේලී ඉරිතලා යාමට ඉඩ නොදී නිරන්තර තෙතමනය පවත්වා ගන්න.",
                "අලුත් සුදු මුල් මතුවන තෙක් ඉදිරි දින 14 තුළ කිසිදු රසායනික පොහොරක් නොයොදන්න.",
                "පැළ යථා තත්ත්වයට පත්වන විට සැහැල්ලු ක්ෂුද්‍ර පෝෂක ද්‍රාවණයක් පත්‍ර මතට ඉසින්න."
            ]
        },
        "Ammonia_Vapor_Scorch": {
            "name_en": "Gaseous Ammonia Vapor Scorching",
            "name_si": "ඇමෝනියා වාෂ්පයෙන් පත්‍ර පිළිස්සීම (Ammonia Volatilization Scorch)",
            "cause": "Surface broadcast of urea on hot, moist, alkaline soil without immediate incorporation.",
            "emergency_actions_en": [
                "Immediately irrigate to dissolve surface urea and move it into the soil column.",
                "Lightly incorporate or hoe the topsoil around crop bases to prevent gas escape.",
                "Prune dead, scorched lower foliage to prevent secondary fungal infections."
            ],
            "emergency_actions_si": [
                "පස මතුපිට ඇති යූරියා කඩිනමින් දියවී පස තුළට කාන්දු වන පරිදි වහාම ජල සම්පාදනය කරන්න.",
                "වාෂ්ප පිටවීම වැළැක්වීම සඳහා පස් මතුපිට සැහැල්ලුවෙන් බුරුල් කර යූරියා පස් යට කරන්න.",
                "දිලීර රෝග ඇතිවීම වැළැක්වීම සඳහා දැඩි ලෙස පිළිස්සුණු පහළ කොළ කපා ඉවත් කරන්න."
            ]
        },
        "Starvation_Fake_Fertilizer": {
            "name_en": "Nutrient Deficiency from Inert / Counterfeit Fertilizer",
            "name_si": "ව්‍යාජ පොහොර නිසා හටගත් පෝෂක ඌනතාවය (Counterfeit Starvation)",
            "cause": "The applied fertilizer was adulterated filler (e.g. sand, limestone) containing 0% active nutrients.",
            "emergency_actions_en": [
                "File an immediate whistleblower report against the dealer who sold this batch.",
                "Procure genuine, certified fertilizer from an official Agrarian Service Center depot.",
                "Apply corrective booster dose of genuine Urea + foliar NPK to rescue crop yield."
            ],
            "emergency_actions_si": [
                "මෙම බාල පොහොර අලෙවි කළ වෙළෙන්දාට එරෙහිව වහාම නිර්නාමික පැමිණිල්ලක් ගොනු කරන්න.",
                "ළඟම ඇති නිල ගොවිජන සේවා මධ්‍යස්ථානයෙන් සහතිකලත් නියම පොහොර මිටියක් මිලදී ගන්න.",
                "අස්වැන්න බේරාගැනීම සඳහා නිර්දේශිත නියම යූරියා සහ ද්‍රව පත්‍ර පොහොර කඩිනමින් යොදන්න."
            ]
        }
    }

    def __init__(self, figures_dir: str = "reports/figures/predictive_prescriptive"):
        self.figures_dir = figures_dir
        os.makedirs(self.figures_dir, exist_ok=True)

    def diagnose_crop_symptoms(self, observations: Dict[str, Any]) -> Dict[str, Any]:
        """
        Infers the probable cause of crop injury based on symptom topology and timing.
        """
        symptom_loc = observations.get("symptom_location", "leaf_tips_only")
        days = observations.get("days_since_application", 3)
        soil_moisture = observations.get("soil_moisture", "dry")
        odor = observations.get("odor", "none")
        ftype = observations.get("fertilizer_type", "Urea")

        scores = {
            "Biuret_Toxicity": 15.0,
            "Osmotic_Salt_Burn": 15.0,
            "Ammonia_Vapor_Scorch": 10.0,
            "Starvation_Fake_Fertilizer": 10.0
        }

        # Symptom Location Matching
        if symptom_loc == "leaf_tips_only":
            # Hallmark of Biuret poisoning
            scores["Biuret_Toxicity"] += 45.0
        elif symptom_loc == "leaf_margins_outer":
            # Hallmark of osmotic salt desiccation
            scores["Osmotic_Salt_Burn"] += 45.0
        elif symptom_loc == "water_soaked_scorched_lower_leaves":
            scores["Ammonia_Vapor_Scorch"] += 50.0
        elif symptom_loc == "uniform_yellow_older_leaves":
            scores["Starvation_Fake_Fertilizer"] += 45.0

        # Timing Matching
        if days <= 2 and soil_moisture == "dry":
            scores["Osmotic_Salt_Burn"] += 25.0
        elif 3 <= days <= 7 and ftype == "Urea":
            scores["Biuret_Toxicity"] += 25.0
        elif days > 10 and symptom_loc == "uniform_yellow_older_leaves":
            scores["Starvation_Fake_Fertilizer"] += 35.0

        # Odor Matching
        if odor == "strong_ammonia_gas":
            scores["Ammonia_Vapor_Scorch"] += 30.0

        # Identify champion diagnosis
        best_diag_key = max(scores, key=scores.get)
        total_score = sum(scores.values())
        probabilities = {k: round((v / total_score) * 100.0, 1) for k, v in scores.items()}

        diag_data = self.DIAGNOSES[best_diag_key]

        return {
            "primary_diagnosis_key": best_diag_key,
            "primary_diagnosis_en": diag_data["name_en"],
            "primary_diagnosis_si": diag_data["name_si"],
            "confidence_pct": probabilities[best_diag_key],
            "underlying_cause": diag_data["cause"],
            "all_probabilities": probabilities,
            "emergency_first_aid": {
                "en": diag_data["emergency_actions_en"],
                "si": diag_data["emergency_actions_si"]
            }
        }

    def generate_diagnostic_figure(self, diag_result: Dict[str, Any], save_path: str = None) -> str:
        """Visualizes diagnostic probabilities as a clear benchmark chart."""
        if save_path is None:
            save_path = os.path.join(self.figures_dir, "crop_toxicity_diagnostic_report.png")

        fig, ax = plt.subplots(figsize=(10, 5))
        fig.suptitle(f"CropSafe AI - Crop Fertilizer Burn & Toxicity Differential Diagnosis\nPrimary Diagnosis: {diag_result['primary_diagnosis_en']} ({diag_result['confidence_pct']}%)", fontsize=12, fontweight="bold")

        categories = list(diag_result["all_probabilities"].keys())
        display_names = [
            "Biuret\nToxicity",
            "Osmotic\nSalt Burn",
            "Ammonia\nVapor Scorch",
            "Counterfeit\nStarvation"
        ]
        probs = [diag_result["all_probabilities"][k] for k in categories]

        colors = ["#e74c3c" if k == diag_result["primary_diagnosis_key"] else "#95a5a6" for k in categories]

        bars = ax.bar(display_names, probs, color=colors, edgecolor="black", width=0.5)
        ax.set_ylabel("Diagnostic Probability (%)", fontsize=11, fontweight="bold")
        ax.set_ylim(0, 100)
        ax.grid(axis="y", linestyle="--", alpha=0.5)

        for b, p in zip(bars, probs):
            ax.text(b.get_x() + b.get_width()/2., b.get_height() + 2, f"{p:.1f}%", ha="center", va="bottom", fontsize=10, fontweight="bold")

        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        return save_path


if __name__ == "__main__":
    troubleshooter = FertilizerToxicityTroubleshooter()

    # Scenario: Farmer in Dambulla noticed leaf tips turning bright yellow 5 days after applying cheap urea
    obs = {
        "fertilizer_type": "Urea",
        "days_since_application": 5,
        "symptom_location": "leaf_tips_only",
        "soil_moisture": "adequate_moist",
        "odor": "none"
    }

    res = troubleshooter.diagnose_crop_symptoms(obs)
    fig_path = troubleshooter.generate_diagnostic_figure(res)

    print("=== Crop Toxicity Diagnosed Successfully ===")
    print(f"Primary Diagnosis: {res['primary_diagnosis_si']} ({res['confidence_pct']}%)")
    print(f"Cause: {res['underlying_cause']}")
    print("Emergency Action 1 (Sinhala):", res["emergency_first_aid"]["si"][0])
    print(f"Diagnostic Chart Saved: {fig_path}")
