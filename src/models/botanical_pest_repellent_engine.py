"""
CropSafe AI - Botanical Foliar & Bio-Pest Repellent Formulator
Standardizes non-toxic botanical insect repellents and foliar biopesticides
utilizing indigenous Sri Lankan flora (Neem, Chili-Garlic, Gliricidia, Tobacco) for organic crop protection.
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


class BotanicalPestRepellentEngine:
    """Formulates herbal foliar extracts and natural pest deterrents for ecological pest management."""

    PEST_BOTANICAL_CATALOG = {
        "Paddy_Brown_Planthopper": {
            "pest_si": "දුඹුරු පැළ මැක්කා (BPH)",
            "botanical_name": "Neem Seed Kernel Extract (NSKE 5%)",
            "botanical_name_si": "කොහොඹ ඇට සාරය",
            "active_principle": "Azadirachtin (Anti-feedant, disrupts insect ecdysis)",
            "soaking_time_hours": 24,
            "shelf_life_days": 7,
            "recipe_for_100l": {
                "Crushed Neem Seeds (තැළුණු කොහොඹ ඇට)": "5.0 kg",
                "Natural Soap Emulsifier (සබන් කුඩු)": "100.0 g",
                "Clean Water (ජලය)": "100.0 L"
            },
            "dosage_per_16l_knapsack_ml": 800,
            "timing_advice_si": "උදෑසන හෝ සවස් කාලයේ පත්‍ර යටි පැත්තට හොඳින් තෙමෙන සේ ඉසින්න."
        },
        "Paddy_Bug": {
            "pest_si": "ගොයම් මැස්සා / මකුණා (Leptocorisa)",
            "botanical_name": "Gliricidia-Tobacco Cow Urine Ferment",
            "botanical_name_si": "ග්ලිරිසීඩියා - දුම්කොළ ගව මුත්‍රා සාරය",
            "active_principle": "Nicotine & Coumarin alkaloids (Vapor deterrent)",
            "soaking_time_hours": 72,
            "shelf_life_days": 30,
            "recipe_for_100l": {
                "Gliricidia Leaves (ග්ලිරිසීඩියා කොළ)": "10.0 kg",
                "Waste Tobacco (දුම්කොළ අපද්‍රව්‍ය)": "2.0 kg",
                "Cow Urine (ගව මුත්‍රා)": "20.0 L",
                "Water (ජලය)": "80.0 L"
            },
            "dosage_per_16l_knapsack_ml": 500,
            "timing_advice_si": "කරල් පීදෙන අවධියේ උදෑසන 8ට පෙර කුඹුරු යාය පුරා ඉසින්න."
        },
        "Vegetable_Caterpillars": {
            "pest_si": "එළවළු කොළ කන දළඹුවන් සහ පැළ මැක්කන්",
            "botanical_name": "Triple-Pungent Chili Garlic Ginger Extract",
            "botanical_name_si": "නයි මිරිස් - සුදුලූනු - ඉඟුරු සැර සාරය",
            "active_principle": "Capsaicin & Allicin (Contact repellent & respiratory irritant)",
            "soaking_time_hours": 48,
            "shelf_life_days": 14,
            "recipe_for_100l": {
                "Hot Bird Chili (නයි මිරිස්/කොච්චි)": "2.5 kg",
                "Crushed Garlic (තැළුණු සුදුලූනු)": "2.5 kg",
                "Crushed Ginger (තැළුණු ඉඟුරු)": "2.5 kg",
                "Water (ජලය)": "100.0 L"
            },
            "dosage_per_16l_knapsack_ml": 250,
            "timing_advice_si": "දැඩි සැරක් ඇති බැවින් ඇස් ආරක්ෂා කරගෙන ඉසින්න. සවස් කාලය සුදුසුයි."
        }
    }

    def __init__(self, figures_dir: str = "reports/figures/predictive_prescriptive"):
        self.figures_dir = figures_dir
        os.makedirs(self.figures_dir, exist_ok=True)

    def formulate_botanical_spray(self, target_pest_key: str = "Paddy_Brown_Planthopper", target_water_liters: float = 100.0) -> Dict[str, Any]:
        """Calculates non-toxic organic botanical repellent formulations for target crop pests."""
        data = self.PEST_BOTANICAL_CATALOG.get(target_pest_key, self.PEST_BOTANICAL_CATALOG["Paddy_Brown_Planthopper"])
        scale = target_water_liters / 100.0

        return {
            "target_pest_key": target_pest_key,
            "pest_name_si": data["pest_si"],
            "botanical_extract": data["botanical_name"],
            "botanical_extract_si": data["botanical_name_si"],
            "active_alkaloids": data["active_principle"],
            "soaking_hours": data["soaking_time_hours"],
            "shelf_life_days": data["shelf_life_days"],
            "knapsack_16l_dosage_ml": data["dosage_per_16l_knapsack_ml"],
            "spray_application_advice_si": data["timing_advice_si"],
            "recipe_scaled": data["recipe_for_100l"]
        }

    def generate_repellent_figure(self, pest_res: Dict[str, Any], save_path: str = None) -> str:
        """Visualizes repellent preparation timeline and knapsack dilution volume."""
        if save_path is None:
            save_path = os.path.join(self.figures_dir, "botanical_pest_repellent_matrix.png")

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 6))
        fig.suptitle(f"CropSafe AI - Botanical Pest Repellent Protocol\nPest: {pest_res['target_pest_key']} | Extract: {pest_res['botanical_extract']}", fontsize=12, fontweight="bold")

        # Left: Preparation timeline
        stages = ["Raw Material Mashing", f"Fermentation Soaking ({pest_res['soaking_hours']}h)", "Cloth Straining", f"Sprayer Loading ({pest_res['knapsack_16l_dosage_ml']}ml/16L)"]
        y_pos = np.arange(len(stages))
        ax1.barh(y_pos, [25, 50, 75, 100], color=["#f39c12", "#e67e22", "#27ae60", "#2ecc71"], edgecolor="black", height=0.55)
        ax1.set_yticks(y_pos)
        ax1.set_yticklabels(stages, fontsize=10, fontweight="bold")
        ax1.set_xlim(0, 110)
        ax1.set_title("1. Standardized Extraction Protocol Timeline", fontsize=11, fontweight="bold")
        ax1.grid(axis="x", linestyle="--", alpha=0.4)

        # Right: Sprayer Dilution
        tank_vol = 16000
        dose = pest_res["knapsack_16l_dosage_ml"]
        water = tank_vol - dose
        ax2.pie([water, dose], labels=[f"Clean Water ({water/1000:.1f} L)", f"Botanical Extract ({dose} ml)"],
                autopct="%1.1f%%", colors=["#3498db", "#27ae60"], startangle=90,
                wedgeprops={"edgecolor": "black", "linewidth": 1.2})
        ax2.set_title(f"2. Knapsack Tank Dilution (16 L Sprayer)", fontsize=11, fontweight="bold")

        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        return save_path


if __name__ == "__main__":
    repellent = BotanicalPestRepellentEngine()

    # Formulate Neem extract for Paddy BPH
    res = repellent.formulate_botanical_spray("Paddy_Brown_Planthopper", target_water_liters=100.0)
    fig_path = repellent.generate_repellent_figure(res)

    print("=== Botanical Pest Repellent Formulator Evaluated ===")
    print(f"Target Pest: {res['pest_name_si']}")
    print(f"Botanical Extract: {res['botanical_extract_si']}")
    print(f"Active Principle: {res['active_alkaloids']}")
    print(f"Knapsack Dosage: {res['knapsack_16l_dosage_ml']} ml per 16 L tank")
    print(f"Advice: {res['spray_application_advice_si']}")
    print(f"Infographic Saved: {fig_path}")
