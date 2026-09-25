"""
CropSafe AI - Precision Fertilizer Dosage & Fair Price Calculator
Grounds fertilizer recommendations in official Sri Lanka Department of Agriculture (DOA)
guidelines, calculating stage-specific split applications, 50kg bag requirements,
government subsidy benefits, and fair price benchmarks.
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


class PrecisionDosageCalculator:
    """Calculates scientifically balanced fertilizer schedules, bag counts, and financial subsidies."""

    # Official DOA recommendations in kg per hectare (1 ha = 2.471 acres)
    DOA_RECOMMENDATIONS_PER_HA = {
        "Paddy_3_Month": {
            "name_si": "කෙටි කාලීන වී (මාස 3 - 3.5: BG 300, AT 362)",
            "urea_kg": 135.0,
            "tsp_kg": 55.0,
            "mop_kg": 60.0,
            "splits": {
                "Basal_Application (වප් අවස්ථාව)": {"urea": 25.0, "tsp": 55.0, "mop": 20.0},
                "1st_Top_Dressing (සති 2-3)": {"urea": 45.0, "tsp": 0.0, "mop": 0.0},
                "2nd_Top_Dressing (සති 5-6)": {"urea": 45.0, "tsp": 0.0, "mop": 20.0},
                "Panicle_Initiation (කරල් ඇදීම)": {"urea": 20.0, "tsp": 0.0, "mop": 20.0}
            }
        },
        "Paddy_4_Month": {
            "name_si": "මධ්‍ය කාලීන වී (මාස 4 - 4.5: BG 358, BG 379)",
            "urea_kg": 165.0,
            "tsp_kg": 65.0,
            "mop_kg": 75.0,
            "splits": {
                "Basal_Application (වප් අවස්ථාව)": {"urea": 30.0, "tsp": 65.0, "mop": 25.0},
                "1st_Top_Dressing (සති 3)": {"urea": 55.0, "tsp": 0.0, "mop": 0.0},
                "2nd_Top_Dressing (සති 6)": {"urea": 55.0, "tsp": 0.0, "mop": 25.0},
                "Panicle_Initiation (සති 8)": {"urea": 25.0, "tsp": 0.0, "mop": 25.0}
            }
        },
        "Potato_Upcountry": {
            "name_si": "උඩරට අල වගාව (නුවරඑළිය / බදුල්ල)",
            "urea_kg": 120.0,
            "tsp_kg": 270.0,
            "mop_kg": 150.0,
            "splits": {
                "Basal_Application (සිටුවීමට පෙර)": {"urea": 40.0, "tsp": 270.0, "mop": 75.0},
                "Top_Dressing_1 (සති 4)": {"urea": 40.0, "tsp": 0.0, "mop": 35.0},
                "Top_Dressing_2 (සති 7)": {"urea": 40.0, "tsp": 0.0, "mop": 40.0}
            }
        },
        "Tea_Mature": {
            "name_si": "පලදැරූ තේ වගාව (TRI නිර්දේශිත)",
            "urea_kg": 180.0,
            "tsp_kg": 40.0, # Rock phosphate equivalent
            "mop_kg": 90.0,
            "splits": {
                "Round 1 (වසන්ත වාරය)": {"urea": 45.0, "tsp": 10.0, "mop": 22.5},
                "Round 2 (නිරිතදිග මෝසම)": {"urea": 45.0, "tsp": 10.0, "mop": 22.5},
                "Round 3 (අන්තර් මෝසම)": {"urea": 45.0, "tsp": 10.0, "mop": 22.5},
                "Round 4 (ඊසානදිග මෝසම)": {"urea": 45.0, "tsp": 10.0, "mop": 22.5}
            }
        },
        "Cinnamon_Mature": {
            "name_si": "පලදැරූ කුරුඳු වගාව (මාතර / ගාල්ල)",
            "urea_kg": 100.0,
            "tsp_kg": 75.0,
            "mop_kg": 80.0,
            "splits": {
                "Round 1 (අස්වනු නෙලූ පසු - මැයි/ජුනි)": {"urea": 50.0, "tsp": 37.5, "mop": 40.0},
                "Round 2 (දෙවන යෙදුම - ඔක්තෝම්බර්/නොවැම්බර්)": {"urea": 50.0, "tsp": 37.5, "mop": 40.0}
            }
        }
    }

    # Statutory pricing per 50kg bag in Sri Lanka (LKR)
    PRICE_BENCHMARKS = {
        "Urea": {"subsidized_mrp": 2500.0, "commercial_mrp": 8500.0},
        "TSP": {"subsidized_mrp": 2500.0, "commercial_mrp": 10500.0},
        "MOP": {"subsidized_mrp": 2500.0, "commercial_mrp": 9000.0}
    }

    def __init__(self, figures_dir: str = "reports/figures/predictive_prescriptive"):
        self.figures_dir = figures_dir
        os.makedirs(self.figures_dir, exist_ok=True)

    def calculate_dosage_and_budget(self, crop_key: str, land_size: float, unit: str = "Acres") -> Dict[str, Any]:
        """
        Converts land area into hectares, scales DOA guidelines, determines 50kg bags,
        and calculates financial subsidy delta.
        """
        # Convert to hectares
        if unit.lower() in ["acres", "acre"]:
            ha = land_size / 2.47105
        elif unit.lower() in ["perches", "perch"]:
            ha = (land_size / 160.0) / 2.47105
        else: # Hectares
            ha = land_size

        crop = self.DOA_RECOMMENDATIONS_PER_HA.get(crop_key, self.DOA_RECOMMENDATIONS_PER_HA["Paddy_3_Month"])

        urea_total_kg = round(crop["urea_kg"] * ha, 1)
        tsp_total_kg = round(crop["tsp_kg"] * ha, 1)
        mop_total_kg = round(crop["mop_kg"] * ha, 1)

        # 50kg bags required (ceil to nearest bag for purchasing)
        urea_bags = int(np.ceil(urea_total_kg / 50.0))
        tsp_bags = int(np.ceil(tsp_total_kg / 50.0))
        mop_bags = int(np.ceil(mop_total_kg / 50.0))
        total_bags = urea_bags + tsp_bags + mop_bags

        # Costs
        p_urea = self.PRICE_BENCHMARKS["Urea"]
        p_tsp = self.PRICE_BENCHMARKS["TSP"]
        p_mop = self.PRICE_BENCHMARKS["MOP"]

        subsidized_cost = (
            urea_bags * p_urea["subsidized_mrp"] +
            tsp_bags * p_tsp["subsidized_mrp"] +
            mop_bags * p_mop["subsidized_mrp"]
        )

        commercial_cost = (
            urea_bags * p_urea["commercial_mrp"] +
            tsp_bags * p_tsp["commercial_mrp"] +
            mop_bags * p_mop["commercial_mrp"]
        )

        subsidy_savings = commercial_cost - subsidized_cost

        # Scale splits for farmer's land
        scaled_splits = {}
        for stage_name, nutrients in crop["splits"].items():
            scaled_splits[stage_name] = {
                "urea_kg": round(nutrients["urea"] * ha, 1),
                "tsp_kg": round(nutrients["tsp"] * ha, 1),
                "mop_kg": round(nutrients["mop"] * ha, 1)
            }

        return {
            "crop_key": crop_key,
            "crop_name_si": crop["name_si"],
            "land_extent": land_size,
            "unit": unit,
            "hectares": round(ha, 3),
            "total_dosage_kg": {
                "Urea": urea_total_kg,
                "TSP": tsp_total_kg,
                "MOP": mop_total_kg
            },
            "bags_50kg_required": {
                "Urea_Bags": urea_bags,
                "TSP_Bags": tsp_bags,
                "MOP_Bags": mop_bags,
                "Total_Bags": total_bags
            },
            "cost_breakdown_lkr": {
                "subsidized_total_lkr": subsidized_cost,
                "commercial_total_lkr": commercial_cost,
                "farmer_savings_lkr": subsidy_savings,
                "subsidy_relief_pct": round((subsidy_savings / commercial_cost) * 100.0, 1)
            },
            "stage_specific_schedule": scaled_splits
        }

    def generate_schedule_figure(self, plan: Dict[str, Any], save_path: str = None) -> str:
        """Visualizes stage-by-stage split schedule and financial comparison."""
        if save_path is None:
            save_path = os.path.join(self.figures_dir, "precision_dosage_cost_schedule.png")

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        fig.suptitle(f"CropSafe AI - Precision Fertilizer Prescription & Subsidy Economics\nCrop: {plan['crop_key']} ({plan['land_extent']} {plan['unit']})", fontsize=12, fontweight="bold")

        # Left: Stage splits
        stages = list(plan["stage_specific_schedule"].keys())
        stages_short = [s.split(" ")[0].replace("_", "\n") for s in stages]
        urea_vals = [plan["stage_specific_schedule"][s]["urea_kg"] for s in stages]
        tsp_vals = [plan["stage_specific_schedule"][s]["tsp_kg"] for s in stages]
        mop_vals = [plan["stage_specific_schedule"][s]["mop_kg"] for s in stages]

        x = np.arange(len(stages))
        width = 0.25

        ax1.bar(x - width, urea_vals, width, label="Urea (N)", color="#3498db", edgecolor="black")
        ax1.bar(x, tsp_vals, width, label="TSP (P)", color="#2ecc71", edgecolor="black")
        ax1.bar(x + width, mop_vals, width, label="MOP (K)", color="#e74c3c", edgecolor="black")

        ax1.set_ylabel("Quantity to Apply (kg)", fontsize=11, fontweight="bold")
        ax1.set_title("1. Stage-Specific Application Schedule (DOA)", fontsize=11, fontweight="bold")
        ax1.set_xticks(x)
        ax1.set_xticklabels(stages_short, fontsize=9, fontweight="bold")
        ax1.legend(loc="upper right")
        ax1.grid(axis="y", linestyle="--", alpha=0.5)

        # Right: Financial Subsidy Comparison
        categories = ["Govt Subsidized", "Open Market Price"]
        costs = [plan["cost_breakdown_lkr"]["subsidized_total_lkr"], plan["cost_breakdown_lkr"]["commercial_total_lkr"]]
        colors = ["#27ae60", "#e67e22"]

        bars = ax2.bar(categories, costs, color=colors, edgecolor="black", width=0.45)
        ax2.set_ylabel("Total Investment (LKR)", fontsize=11, fontweight="bold")
        ax2.set_title(f"2. Farmer Cost Relief (Savings: LKR {plan['cost_breakdown_lkr']['farmer_savings_lkr']:,.0f})", fontsize=11, fontweight="bold")
        ax2.grid(axis="y", linestyle="--", alpha=0.5)

        for b, c in zip(bars, costs):
            ax2.text(b.get_x() + b.get_width()/2., b.get_height() + 1000, f"Rs. {c:,.0f}", ha="center", va="bottom", fontsize=11, fontweight="bold")

        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        return save_path


if __name__ == "__main__":
    calc = PrecisionDosageCalculator()

    # Scenario: Polonnaruwa paddy farmer with 2.5 acres of BG 300
    plan = calc.calculate_dosage_and_budget("Paddy_3_Month", land_size=2.5, unit="Acres")
    fig = calc.generate_schedule_figure(plan)

    print("=== Precision Fertilizer Plan Calculated ===")
    print(f"Crop: {plan['crop_name_si']}")
    print(f"Land: {plan['land_extent']} {plan['unit']} ({plan['hectares']} ha)")
    print(f"Required 50kg Bags: Urea: {plan['bags_50kg_required']['Urea_Bags']}, TSP: {plan['bags_50kg_required']['TSP_Bags']}, MOP: {plan['bags_50kg_required']['MOP_Bags']}")
    print(f"Subsidized Cost: LKR {plan['cost_breakdown_lkr']['subsidized_total_lkr']:,.2f}")
    print(f"Commercial Cost: LKR {plan['cost_breakdown_lkr']['commercial_total_lkr']:,.2f}")
    print(f"Farmer Subsidy Savings: LKR {plan['cost_breakdown_lkr']['farmer_savings_lkr']:,.2f} ({plan['cost_breakdown_lkr']['subsidy_relief_pct']}%)")
    print(f"Schedule Figure Saved: {fig}")
