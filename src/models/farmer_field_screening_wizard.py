"""
CropSafe AI - Farmer DIY Quick Field Screening Wizard
Enables farmers and field officers to verify fertilizer purity using simple, low-cost
home and field tests without sophisticated laboratory equipment.

Empirical Field Assays:
  1. Water Dissolution Assay: Complete solubility vs. insoluble sediment (sand, gypsum, rock powder).
  2. Endothermic Thermodynamic Drop Assay: Instant freezing temperature drop upon dissolving genuine urea.
  3. Vinegar / Acid Effervescence Assay: Detection of limestone, dolomite, or calcium carbonate adulterants.
  4. Hot Spoon / Pyrolytic Sublimation Assay: Complete volatilization vs. charred inorganic residue.
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


class FarmerFieldScreeningWizard:
    """Diagnostic wizard translating simple farmer-observed field reactions into adulteration probabilities."""

    def __init__(self, figures_dir: str = "reports/figures/predictive_prescriptive"):
        self.figures_dir = figures_dir
        os.makedirs(self.figures_dir, exist_ok=True)

    def evaluate_diy_tests(self, observations: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates adulteration likelihood and identifies specific adulterant types
        based on 4 rapid field tests.
        """
        ftype = observations.get("fertilizer_type", "Urea")
        
        # Test 1: Water Dissolution (1 tbsp in half glass of clean water)
        dissolves_completely = observations.get("dissolves_completely", True)
        sediment_at_bottom = observations.get("sediment_at_bottom", False)
        water_clarity = observations.get("water_clarity", "Clear") # 'Clear', 'Milky', 'Muddy'

        # Test 2: Endothermic Cold Test (Water temperature change)
        feels_ice_cold = observations.get("feels_ice_cold", True) # Genuine Urea drops water temp by 8-12°C

        # Test 3: Vinegar / Acid Test (Adding few drops of vinegar/lime juice)
        fizzes_with_vinegar = observations.get("fizzes_with_vinegar", False)

        # Test 4: Hot Spoon / Flame Test (Heating small amount on metal spoon over fire)
        volatilizes_completely = observations.get("volatilizes_completely", True)
        charred_residue_remains = observations.get("charred_residue_remains", False)
        pungent_ammonia_smell = observations.get("pungent_ammonia_smell", True)

        fraud_signals = []
        adulterant_candidates = []
        risk_score = 0.0

        if ftype == "Urea":
            # Urea specific checks
            if not dissolves_completely or sediment_at_bottom:
                fraud_signals.append("Insoluble mineral ballast detected at bottom of glass (Genuine Urea is 100% soluble).")
                adulterant_candidates.append("River Sand / Gypsum Powder / Crushed Quartz")
                risk_score += 40.0
            
            if not feels_ice_cold:
                fraud_signals.append("Zero endothermic chill detected! Real Urea causes an instant icy temperature drop.")
                adulterant_candidates.append("Low-grade Sodium Salt / Industrial Nitrate Slag / Crushed Rock")
                risk_score += 35.0

            if fizzes_with_vinegar:
                fraud_signals.append("Vigorous carbon dioxide bubbling with acid! Real Urea does NOT effervesce.")
                adulterant_candidates.append("Ground Limestone / Dolomite / Calcium Carbonate")
                risk_score += 40.0

            if not volatilizes_completely or charred_residue_remains:
                fraud_signals.append("Heavy solid residue remains after heating! Genuine Urea sublimes into pure gas.")
                adulterant_candidates.append("Inert Mineral Powder / Table Salt")
                risk_score += 35.0

        elif ftype == "MOP":
            # MOP (Muriate of Potash / Red Fertilizer) checks
            if fizzes_with_vinegar:
                fraud_signals.append("Effervescence detected! Genuine MOP (Potassium Chloride) does not fizz with acid.")
                adulterant_candidates.append("Red-Dyed Dolomite / Brick Dust with Limestone")
                risk_score += 45.0

            if sediment_at_bottom and water_clarity in ["Muddy", "Milky"]:
                fraud_signals.append("Heavy red/brown clay or sand settling at bottom.")
                adulterant_candidates.append("Red Clay / Dyed River Sand")
                risk_score += 40.0

        adulteration_probability = min(100.0, risk_score)

        if adulteration_probability < 20.0:
            status = "AUTHENTIC_GENUINE"
            advice_en = "Your fertilizer passed all rapid home tests. It appears authentic and safe to apply."
            advice_si = "ඔබගේ පොහොර සාම්පලය සියලුම මූලික ක්ෂේත්‍ර පරීක්ෂණ සාර්ථකව සමත් විය. එය නියම තත්ත්වයේ පවතින බව පෙනේ."
        elif adulteration_probability < 55.0:
            status = "SUSPICIOUS_MILD_ADULTERATION"
            advice_en = "Suspicious impurities detected. Submit a sample to your nearest Agrarian Service Center before spreading."
            advice_si = "සැකකටයුතු අපද්‍රව්‍ය අනාවරණය වී ඇත. කුඹුරට යෙදීමට පෙර ළඟම ඇති ගොවිජන සේවා මධ්‍යස්ථානයට සාම්පලයක් පෙන්වන්න."
        else:
            status = "HIGH_CONFIDENCE_COUNTERFEIT"
            advice_en = "CRITICAL ALERT: Strong indicators of fake/adulterated fertilizer! DO NOT apply to crops. File a whistleblower complaint."
            advice_si = "අවවාදයයි: බාල හෝ ව්‍යාජ පොහොර බවට දැඩි සාක්ෂි ඇත! වගාවට යෙදීමෙන් වළකින්න. වහාම පැමිණිල්ලක් ලියාපදිංචි කරන්න."

        return {
            "fertilizer_type": ftype,
            "adulteration_probability_pct": round(adulteration_probability, 1),
            "status": status,
            "fraud_signals": fraud_signals if fraud_signals else ["All rapid physical-chemical reactions conform to authentic baseline."],
            "probable_adulterants": list(set(adulterant_candidates)) if adulterant_candidates else ["None"],
            "action_advice": {
                "en": advice_en,
                "si": advice_si
            },
            "test_matrix": {
                "Water_Solubility": "PASS" if (dissolves_completely and not sediment_at_bottom) else "FAIL",
                "Endothermic_Chill": "PASS" if feels_ice_cold else "FAIL",
                "Acid_Fizz_Resistance": "PASS" if not fizzes_with_vinegar else "FAIL",
                "Pyrolytic_Vaporization": "PASS" if (volatilizes_completely and not charred_residue_remains) else "FAIL"
            }
        }

    def generate_wizard_visualization(self, eval_res: Dict[str, Any], save_path: str = None) -> str:
        """Generates visual infographic summarizing the 4 tests and farmer verdict."""
        if save_path is None:
            save_path = os.path.join(self.figures_dir, "farmer_diy_field_screening_matrix.png")

        fig, ax = plt.subplots(figsize=(10, 6))
        fig.suptitle(f"CropSafe AI - Farmer Rapid Field Screening Matrix ({eval_res['fertilizer_type']})\nVerdict: {eval_res['status']} | Risk: {eval_res['adulteration_probability_pct']}%", fontsize=13, fontweight="bold")

        tests = list(eval_res["test_matrix"].keys())
        statuses = [eval_res["test_matrix"][t] for t in tests]
        
        display_names = [
            "1. Water Dissolution\n(Clear vs Sediment)",
            "2. Endothermic Chill\n(Icy Cold Water)",
            "3. Vinegar Fizz Test\n(No Carbonate Bubbles)",
            "4. Hot Spoon Test\n(Pure Vaporization)"
        ]

        colors = ["#2ecc71" if s == "PASS" else "#e74c3c" for s in statuses]
        y_pos = np.arange(len(tests))

        bars = ax.barh(y_pos, [100]*len(tests), color=colors, alpha=0.85, edgecolor="black", height=0.55)
        ax.set_yticks(y_pos)
        ax.set_yticklabels(display_names, fontsize=10, fontweight="bold")
        ax.set_xlim(0, 115)
        ax.set_xlabel("Compliance Status", fontsize=11, fontweight="bold")
        ax.set_xticks([0, 50, 100])
        ax.set_xticklabels(["Fail", "Review", "100% Pass"], fontsize=10)

        for i, (b, s) in enumerate(zip(bars, statuses)):
            ax.text(50, b.get_y() + b.get_height()/2., f"{s}", ha="center", va="center", color="white", fontsize=12, fontweight="bold")

        ax.grid(axis="x", linestyle="--", alpha=0.5)
        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        return save_path


if __name__ == "__main__":
    wizard = FarmerFieldScreeningWizard()

    # Scenario: Farmer bought suspicious Urea in Anuradhapura
    farmer_obs = {
        "fertilizer_type": "Urea",
        "dissolves_completely": False,
        "sediment_at_bottom": True,
        "water_clarity": "Milky",
        "feels_ice_cold": False,        # Didn't get cold!
        "fizzes_with_vinegar": True,    # Fizzes!
        "volatilizes_completely": False,
        "charred_residue_remains": True,
        "pungent_ammonia_smell": False
    }

    result = wizard.evaluate_diy_tests(farmer_obs)
    fig_path = wizard.generate_wizard_visualization(result)

    print("=== Farmer Field Screening Wizard Evaluated ===")
    print(f"Product: {result['fertilizer_type']}")
    print(f"Adulteration Probability: {result['adulteration_probability_pct']}%")
    print(f"Status: {result['status']}")
    print(f"Advice (Sinhala): {result['action_advice']['si']}")
    print(f"Probable Adulterants: {', '.join(result['probable_adulterants'])}")
    print(f"Infographic Saved: {fig_path}")
