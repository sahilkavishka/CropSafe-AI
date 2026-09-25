"""
CropSafe AI - DIY Compost Recipe & C:N Feedstock Optimizer
Formulates scientifically balanced farm-waste composting recipes targeting optimal
Carbon-to-Nitrogen (25:1 - 30:1) and moisture (55-60%) thresholds for thermophilic decomposition.
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


class CompostFeedstockOptimizer:
    """Calculates composite C:N ratio, moisture balances, and aerobic turning calendars for farm waste."""

    FEEDSTOCK_PROPERTIES = {
        "Paddy_Straw": {"name_si": "වියළි වී පිදුරු", "c_pct": 42.0, "n_pct": 0.6, "moisture_pct": 12.0, "cn_ratio": 70.0},
        "Coir_Dust": {"name_si": "කොහුබත්", "c_pct": 45.0, "n_pct": 0.5, "moisture_pct": 18.0, "cn_ratio": 90.0},
        "Dry_Leaves": {"name_si": "වියළි ගස් කොළ", "c_pct": 40.0, "n_pct": 0.8, "moisture_pct": 15.0, "cn_ratio": 50.0},
        "Cow_Dung": {"name_si": "නැවුම් ගව ගොම", "c_pct": 32.0, "n_pct": 1.8, "moisture_pct": 70.0, "cn_ratio": 17.8},
        "Poultry_Manure": {"name_si": "කුකුල් පොහොර", "c_pct": 28.0, "n_pct": 2.8, "moisture_pct": 55.0, "cn_ratio": 10.0},
        "Gliricidia_Foliage": {"name_si": "ග්ලිරිසීඩියා කොළ පොහොර", "c_pct": 35.0, "n_pct": 2.5, "moisture_pct": 65.0, "cn_ratio": 14.0},
        "Kitchen_Veg_Waste": {"name_si": "මුළුතැන්ගෙයි එළවළු අපද්‍රව්‍ය", "c_pct": 30.0, "n_pct": 1.9, "moisture_pct": 75.0, "cn_ratio": 15.8},
        "Wood_Ash": {"name_si": "දර අළු", "c_pct": 15.0, "n_pct": 0.3, "moisture_pct": 5.0, "cn_ratio": 50.0}
    }

    def __init__(self, figures_dir: str = "reports/figures/predictive_prescriptive"):
        self.figures_dir = figures_dir
        os.makedirs(self.figures_dir, exist_ok=True)

    def optimize_recipe(self, feedstock_inputs_kg: Dict[str, float]) -> Dict[str, Any]:
        """
        Calculates mass-weighted C:N ratio, total water deficit, and estimated maturation time.
        """
        total_wet_mass = sum(feedstock_inputs_kg.values())
        if total_wet_mass <= 0:
            return {"error": "Total feedstock input must be greater than zero kg."}

        total_dry_mass = 0.0
        total_carbon_mass = 0.0
        total_nitrogen_mass = 0.0
        total_water_mass = 0.0

        recipe_breakdown = []

        for name, wet_kg in feedstock_inputs_kg.items():
            if wet_kg <= 0:
                continue
            props = self.FEEDSTOCK_PROPERTIES.get(name, self.FEEDSTOCK_PROPERTIES["Paddy_Straw"])
            water_kg = wet_kg * (props["moisture_pct"] / 100.0)
            dry_kg = wet_kg - water_kg
            c_kg = dry_kg * (props["c_pct"] / 100.0)
            n_kg = dry_kg * (props["n_pct"] / 100.0)

            total_dry_mass += dry_kg
            total_carbon_mass += c_kg
            total_nitrogen_mass += n_kg
            total_water_mass += water_kg

            recipe_breakdown.append({
                "feedstock": name,
                "name_si": props["name_si"],
                "wet_kg": wet_kg,
                "share_pct": round((wet_kg / total_wet_mass) * 100.0, 1),
                "dry_matter_kg": round(dry_kg, 1),
                "carbon_kg": round(c_kg, 2),
                "nitrogen_kg": round(n_kg, 2)
            })

        composite_cn_ratio = total_carbon_mass / max(0.01, total_nitrogen_mass)
        current_moisture_pct = (total_water_mass / total_wet_mass) * 100.0

        # Calculate water deficit to reach target 58% moisture
        target_moisture_pct = 58.0
        target_water_mass = (target_moisture_pct / 100.0) * (total_dry_mass / (1.0 - target_moisture_pct / 100.0))
        water_to_add_liters = max(0.0, target_water_mass - total_water_mass)

        # Evaluation & Recommendations
        if 24.0 <= composite_cn_ratio <= 32.0:
            status = "PERFECT_BALANCED_RATIO"
            est_days = 45
            advice_en = "Optimal C:N ratio! Rapid thermophilic heating (55-65°C) will initiate within 72 hours."
            advice_si = "පරිපූර්ණ C:N අනුපාතයකි! පැය 72ක් තුළ තාපජ බැක්ටීරියා ක්‍රියාකාරී වී දින 45කින් උසස් කොම්පෝස්ට් නිපදවේ."
        elif composite_cn_ratio > 32.0:
            status = "CARBON_HEAVY_SLOW"
            est_days = 90
            excess_c = composite_cn_ratio - 30.0
            rec_green_kg = round(excess_c * total_dry_mass * 0.05, 1)
            advice_en = f"Excess Carbon (C:N {composite_cn_ratio:.1f}:1). Add {rec_green_kg} kg of Gliricidia green leaves or cattle dung to speed up."
            advice_si = f"කාබන් වැඩියි (C:N {composite_cn_ratio:.1f}:1). කොම්පෝස්ට් වීම ප්‍රමාද වේ. ග්ලිරිසීඩියා කොළ හෝ ගව ගොම කි.ග්‍රෑ. {rec_green_kg}ක් එකතු කරන්න."
        else:
            status = "NITROGEN_HEAVY_ODOR_RISK"
            est_days = 60
            advice_en = f"Excess Nitrogen (C:N {composite_cn_ratio:.1f}:1). Risk of ammonia odor. Add dried paddy straw or coir dust."
            advice_si = f"නයිට්‍රජන් වැඩියි (C:N {composite_cn_ratio:.1f}:1). ගඳ ගැසීමේ අවදානමක් ඇත. වියළි පිදුරු හෝ කොහුබත් තට්ටුවක් එකතු කරන්න."

        turning_schedule = [
            {"day": 7, "action_si": "පළමු පෙරළීම (First Turn) - වාතාශ්‍රය සැපයීම සහ උෂ්ණත්වය පාලනය", "temp_c_target": "55 - 65°C"},
            {"day": 14, "action_si": "දෙවන පෙරළීම (Second Turn) - පිටත කොටස් ඇතුළට හරවා මිශ්‍ර කිරීම", "temp_c_target": "50 - 60°C"},
            {"day": 28, "action_si": "තෙවන පෙරළීම (Third Turn) - තෙතමනය පරීක්ෂාව (අතින් මිරිකා බැලීම)", "temp_c_target": "40 - 45°C"},
            {"day": 42, "action_si": "පැසවීමේ අවසන් අදියර (Curing & Maturation) - පස් සුවඳ හමන කළු දුඹුරු පැහැය", "temp_c_target": "30 - 35°C"}
        ]

        return {
            "total_wet_mass_kg": round(total_wet_mass, 1),
            "total_dry_mass_kg": round(total_dry_mass, 1),
            "composite_cn_ratio": round(composite_cn_ratio, 1),
            "current_moisture_pct": round(current_moisture_pct, 1),
            "water_to_add_liters": round(water_to_add_liters, 1),
            "estimated_maturation_days": est_days,
            "recipe_status": status,
            "agronomic_advice": {"en": advice_en, "si": advice_si},
            "feedstock_breakdown": recipe_breakdown,
            "aerobic_turning_schedule": turning_schedule
        }

    def generate_optimization_figure(self, opt_res: Dict[str, Any], save_path: str = None) -> str:
        """Visualizes feedstock composition and decomposition temperature kinetics."""
        if save_path is None:
            save_path = os.path.join(self.figures_dir, "compost_feedstock_optimization_model.png")

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        fig.suptitle(f"CropSafe AI - Compost Feedstock C:N Balance & Thermophilic Maturation Model\nRecipe Status: {opt_res['recipe_status']} | Composite C:N = {opt_res['composite_cn_ratio']}:1 | Days: {opt_res['estimated_maturation_days']} d", fontsize=12, fontweight="bold")

        # Left: Feedstock composition pie
        labels = [f"{b['feedstock'].replace('_', ' ')} ({b['wet_kg']} kg)" for b in opt_res["feedstock_breakdown"]]
        sizes = [b["wet_kg"] for b in opt_res["feedstock_breakdown"]]
        colors = ["#f39c12", "#e67e22", "#d35400", "#27ae60", "#2ecc71", "#1abc9c", "#9b59b6", "#95a5a6"][:len(sizes)]

        ax1.pie(sizes, labels=labels, autopct="%1.1f%%", startangle=140, colors=colors, wedgeprops={"edgecolor": "black", "linewidth": 1.2})
        ax1.set_title("1. Feedstock Mass Composition (kg)", fontsize=11, fontweight="bold")

        # Right: Composting Temperature Curve (Thermophilic Phase Kinetics)
        days = np.linspace(0, opt_res["estimated_maturation_days"], 150)
        # Thermophilic heating curve peaking at day 8
        temp_curve = 28.0 + 35.0 * np.exp(-((days - 8)**2) / 60.0) + 12.0 * np.exp(-((days - 22)**2) / 120.0)
        
        ax2.plot(days, temp_curve, color="#c0392b", linewidth=2.8, label="Pile Core Temperature (°C)")
        ax2.axhspan(55, 65, color="#e74c3c", alpha=0.15, label="Thermophilic Sanitization Zone (55-65°C: Kills Pathogens/Weeds)")
        ax2.axhspan(30, 45, color="#2ecc71", alpha=0.15, label="Mesophilic Curing Zone (30-45°C)")

        # Mark turning points
        for turn in opt_res["aerobic_turning_schedule"]:
            t_day = turn["day"]
            if t_day <= opt_res["estimated_maturation_days"]:
                ax2.axvline(t_day, color="#2980b9", linestyle="--", alpha=0.7)
                ax2.text(t_day + 0.5, 66, f"Turn {t_day}d", fontsize=8.5, color="#2980b9", rotation=90)

        ax2.set_xlabel("Composting Age (Days)", fontsize=11, fontweight="bold")
        ax2.set_ylabel("Internal Core Temperature (°C)", fontsize=11, fontweight="bold")
        ax2.set_title("2. 4-Stage Aerobic Temperature & Turning Profile", fontsize=11, fontweight="bold")
        ax2.set_ylim(20, 75)
        ax2.legend(loc="upper right", fontsize=8.5)
        ax2.grid(True, linestyle="--", alpha=0.4)

        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        return save_path


if __name__ == "__main__":
    optimizer = CompostFeedstockOptimizer()

    # Scenario: Polonnaruwa farmer with 100kg paddy straw, 80kg cow dung, 50kg gliricidia, and 10kg wood ash
    farm_materials = {
        "Paddy_Straw": 100.0,
        "Cow_Dung": 80.0,
        "Gliricidia_Foliage": 50.0,
        "Wood_Ash": 10.0
    }

    res = optimizer.optimize_recipe(farm_materials)
    fig_path = optimizer.generate_optimization_figure(res)

    print("=== Compost Feedstock Optimizer Evaluated ===")
    print(f"Total Mass: {res['total_wet_mass_kg']} kg (Dry: {res['total_dry_mass_kg']} kg)")
    print(f"Composite C:N: {res['composite_cn_ratio']}:1 (Status: {res['recipe_status']})")
    print(f"Water to Add: {res['water_to_add_liters']} Liters")
    print(f"Estimated Maturity: {res['estimated_maturation_days']} Days")
    print(f"Advice (Sinhala): {res['agronomic_advice']['si']}")
    print(f"Optimization Figure Saved: {fig_path}")
