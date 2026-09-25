"""
CropSafe AI - Indigenous Liquid Bio-Fertilizer Formulation & Fermentation Guide
Provides standardized agronomic recipes, fermentation timelines, sensory quality checkpoints,
and knapsack sprayer dilution protocols for traditional Sri Lankan bio-stimulants (Jeevamrutha, Panchagavya, Fish Amino Acid, Vermiwash).
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


class LiquidBiofertilizerFormulator:
    """Calculates ingredient proportions, fermentation timelines, and knapsack dilution ratios."""

    FORMULATION_DATABASE = {
        "Jeevamrutha": {
            "name_si": "ජීවාමෘත ක්ෂුද්‍රජීවී පොහොර ද්‍රාවණය",
            "fermentation_days": 8,
            "shelf_life_days": 14,
            "dilution_ratio_foliar": "1:10 (ජලය ලීටර් 10කට ජීවාමෘත ලීටර් 1ක්)",
            "knapsack_16l_volume_ml": 1500, # 1.5 L per 16 L knapsack sprayer
            "ingredients_for_200l": {
                "Fresh Cow Dung (නැවුම් ගව ගොම)": "10.0 kg",
                "Cow Urine (ගව මුත්‍රා)": "7.5 L",
                "Jaggery / Kithul Treacle (හකුරු හෝ පැණි)": "2.0 kg",
                "Pulse Flour (මුංඇට/කඩල පිටි)": "2.0 kg",
                "Living Soil Inoculant (ජීවී නියර පස්)": "0.5 kg (එක් අහුරක්)",
                "Clean Water (පිරිසිදු ජලය)": "180.0 L"
            },
            "sensory_checkpoints": {
                "Day 1-3": "Active microbial awakening; mild bubbling on surface.",
                "Day 4-6": "Peak fermentation; pleasant sweet-sour fermented wine-like aroma.",
                "Day 7-8": "Ready for application; rich in nitrogen-fixing & phosphate-solubilizing microbes.",
                "Failure Sign": "Foul, putrid rotting stench indicates anaerobic putrefaction. Discard."
            }
        },
        "Panchagavya": {
            "name_si": "පංචගව්‍ය පත්‍ර වර්ධක සාරය",
            "fermentation_days": 21,
            "shelf_life_days": 180,
            "dilution_ratio_foliar": "1:33 (3% ද්‍රාවණය - ජලය ලීටර් 1කට මි.ලී. 30ක්)",
            "knapsack_16l_volume_ml": 500, # 500 ml per 16 L knapsack sprayer
            "ingredients_for_200l": {
                "Cow Dung (ගොම)": "25.0 kg",
                "Cow Ghee (එළඟිතෙල්)": "3.5 kg",
                "Cow Urine (ගව මුත්‍රා)": "35.0 L",
                "Cow Milk (එළකිරි)": "15.0 L",
                "Cow Curd (එළකිරි මීකිරි)": "15.0 L",
                "Tender Coconut Water (තැඹිලි වතුර)": "15.0 L",
                "Ripe Banana Pulp (ඉදුණු ඇඹුල් කෙසෙල්)": "10.0 kg",
                "Kithul Treacle (කිතුල් පැණි)": "5.0 L",
                "Water (ජලය)": "70.0 L"
            },
            "sensory_checkpoints": {
                "Day 1-7": "Grease breakdown by ghee and dung stirring.",
                "Day 8-15": "Pleasant fruity-acidic odor.",
                "Day 16-21": "Fully cured hormonal stimulant rich in auxins and cytokinins."
            }
        },
        "Fish_Amino_Acid": {
            "name_si": "මත්ස්‍ය ඇමිනෝ අම්ල (Fish Amino Acid - FAA)",
            "fermentation_days": 30,
            "shelf_life_days": 365,
            "dilution_ratio_foliar": "1:500 (ජලය ලීටර් 1කට මි.ලී. 2ක්)",
            "knapsack_16l_volume_ml": 35,
            "ingredients_for_200l": {
                "Fresh Raw Fish Waste (නැවුම් මාළු අපද්‍රව්‍ය)": "100.0 kg",
                "Brown Sugar / Treacle (දුඹුරු සීනි හෝ පැණි)": "100.0 kg (1:1 අනුපාතය)"
            },
            "sensory_checkpoints": {
                "Day 1-10": "Osmotic liquefaction of fish tissue.",
                "Day 20-30": "Rich brown aromatic liquid with sweet malt aroma."
            }
        }
    }

    def __init__(self, figures_dir: str = "reports/figures/predictive_prescriptive"):
        self.figures_dir = figures_dir
        os.makedirs(self.figures_dir, exist_ok=True)

    def formulate_recipe(self, formulation_type: str = "Jeevamrutha", target_liters: float = 200.0) -> Dict[str, Any]:
        """Scales indigenous liquid bio-fertilizer formulations to desired batch volume."""
        data = self.FORMULATION_DATABASE.get(formulation_type, self.FORMULATION_DATABASE["Jeevamrutha"])
        scale_factor = target_liters / 200.0

        return {
            "formulation_type": formulation_type,
            "name_si": data["name_si"],
            "batch_volume_liters": target_liters,
            "fermentation_days": data["fermentation_days"],
            "shelf_life_days": data["shelf_life_days"],
            "foliar_dilution_ratio": data["dilution_ratio_foliar"],
            "dosage_per_16L_knapsack_ml": data["knapsack_16l_volume_ml"],
            "ingredients_scaled": data["ingredients_for_200l"],
            "fermentation_monitoring": data["sensory_checkpoints"]
        }

    def generate_formulation_figure(self, form_res: Dict[str, Any], save_path: str = None) -> str:
        """Visualizes fermentation timeline and knapsack sprayer dilution instructions."""
        if save_path is None:
            save_path = os.path.join(self.figures_dir, "liquid_biofertilizer_fermentation_guide.png")

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 6))
        fig.suptitle(f"CropSafe AI - Indigenous Liquid Bio-Fertilizer Protocol\nType: {form_res['formulation_type']} (Batch: {form_res['batch_volume_liters']} L | Maturation: {form_res['fermentation_days']} Days)", fontsize=12, fontweight="bold")

        # Left: Fermentation Phase Progress
        phases = list(form_res["fermentation_monitoring"].keys())
        y_pos = np.arange(len(phases))
        ax1.barh(y_pos, [100]*len(phases), color=["#f39c12", "#27ae60", "#2ecc71", "#e74c3c"][:len(phases)], edgecolor="black", alpha=0.85, height=0.55)
        ax1.set_yticks(y_pos)
        ax1.set_yticklabels(phases, fontsize=10, fontweight="bold")
        ax1.set_xlim(0, 110)
        ax1.set_title("1. Aerobic Fermentation Phases & Sensory Audits", fontsize=11, fontweight="bold")

        for i, p in enumerate(phases):
            desc = form_res["fermentation_monitoring"][p]
            short_desc = (desc[:45] + "...") if len(desc) > 45 else desc
            ax1.text(5, i, short_desc, va="center", color="white", fontsize=8.5, fontweight="bold")

        # Right: Sprayer Dilution Graphic
        ax2.bar(["Knapsack Tank\nClean Water", "Concentrated\nBio-Liquid"], [16000 - form_res["dosage_per_16L_knapsack_ml"], form_res["dosage_per_16L_knapsack_ml"]], color=["#3498db", "#27ae60"], edgecolor="black", width=0.5)
        ax2.set_ylabel("Volume in 16L Tank (ml)", fontsize=11, fontweight="bold")
        ax2.set_title(f"2. Knapsack Sprayer Dosage ({form_res['dosage_per_16L_knapsack_ml']} ml per 16 L)", fontsize=11, fontweight="bold")
        ax2.grid(axis="y", linestyle="--", alpha=0.4)

        ax2.text(1, form_res["dosage_per_16L_knapsack_ml"] + 400, f"{form_res['dosage_per_16L_knapsack_ml']} ml", ha="center", fontweight="bold", color="#27ae60")
        ax2.text(0, 8000, f"{16 - form_res['dosage_per_16L_knapsack_ml']/1000:.1f} L Water", ha="center", fontweight="bold", color="white")

        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        return save_path


if __name__ == "__main__":
    formulator = LiquidBiofertilizerFormulator()

    # Formulate Jeevamrutha batch
    res = formulator.formulate_recipe("Jeevamrutha", target_liters=200.0)
    fig_path = formulator.generate_formulation_figure(res)

    print("=== Liquid Bio-Fertilizer Formulation Evaluated ===")
    print(f"Product: {res['name_si']}")
    print(f"Fermentation Days: {res['fermentation_days']} | Shelf Life: {res['shelf_life_days']} Days")
    print(f"Knapsack 16L Dosage: {res['dosage_per_16L_knapsack_ml']} ml")
    print(f"Foliar Dilution: {res['foliar_dilution_ratio']}")
    print(f"Figure Saved: {fig_path}")
