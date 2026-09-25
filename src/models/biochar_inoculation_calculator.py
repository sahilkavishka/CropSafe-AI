"""
CropSafe AI - Biochar Inoculation & Soil Carbon Sequestration Engine
Calculates biochar co-composting 'charging' ratios, soil application dosages,
water retention enhancement, and permanent Carbon Dioxide Equivalent (tCO2e) sequestration credits.
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


class BiocharInoculationCalculator:
    """Calculates nutrient charging protocols, soil conditioning rates, and carbon abatement credits."""

    FEEDSTOCK_CHAR_YIELDS = {
        "Paddy_Husk_Biochar": {"name_si": "දහයියා අඟුරු", "organic_carbon_pct": 55.0, "ph": 8.5, "bulk_density_kg_m3": 280.0},
        "Wood_Biochar": {"name_si": "දැව අඟුරු (ග්ලිරිසීඩියා/කෝපි/තේ කප්පාදු)", "organic_carbon_pct": 78.0, "ph": 9.2, "bulk_density_kg_m3": 350.0},
        "Coconut_Shell_Biochar": {"name_si": "පොල් කටු අඟුරු", "organic_carbon_pct": 82.0, "ph": 9.0, "bulk_density_kg_m3": 450.0}
    }

    # Recommended application rate in MT per hectare
    RECOMMENDED_DOSAGE_MT_HA = {
        "Lowland_Paddy": 3.5,
        "Sandy_Dry_Zone": 6.0,
        "Vegetable_Bed": 5.0,
        "Tea_Plantation": 4.0
    }

    def __init__(self, figures_dir: str = "reports/figures/predictive_prescriptive"):
        self.figures_dir = figures_dir
        os.makedirs(self.figures_dir, exist_ok=True)

    def calculate_biochar_prescription(self, char_type: str, land_extent_acres: float, land_use: str = "Lowland_Paddy") -> Dict[str, Any]:
        """
        Computes required biochar tonnage, co-composting inoculation slurry requirements,
        soil water retention gains, and net metric tons of CO2 sequestered.
        """
        ha = land_extent_acres / 2.47105
        char_data = self.FEEDSTOCK_CHAR_YIELDS.get(char_type, self.FEEDSTOCK_CHAR_YIELDS["Paddy_Husk_Biochar"])
        dosage_rate_mt_ha = self.RECOMMENDED_DOSAGE_MT_HA.get(land_use, 3.5)

        total_biochar_mt = round(dosage_rate_mt_ha * ha, 2)
        total_biochar_kg = total_biochar_mt * 1000.0

        # Inoculation Slurry Requirements (14-Day Co-composting Charging)
        # To charge 100 kg of biochar: 40 kg fresh cow dung + 20 L cow urine + 100 L water
        cow_dung_needed_kg = round(total_biochar_kg * 0.40, 1)
        cow_urine_needed_l = round(total_biochar_kg * 0.20, 1)
        compost_slurry_water_l = round(total_biochar_kg * 1.0, 1)

        # Carbon Sequestration calculation: 1 MT C = (44/12) MT CO2 = 3.667 MT CO2
        # Stable recalcitrant fraction is ~85% of total organic carbon
        c_pct = char_data["organic_carbon_pct"] / 100.0
        recalcitrant_carbon_mt = total_biochar_mt * c_pct * 0.85
        co2_sequestered_mt = round(recalcitrant_carbon_mt * (44.0 / 12.0), 2)

        # Soil Conditioning Benefits
        est_water_retention_increase_pct = round(min(35.0, dosage_rate_mt_ha * 4.5), 1)
        est_cec_increase_pct = round(min(45.0, dosage_rate_mt_ha * 6.0), 1)

        return {
            "biochar_type": char_type,
            "char_name_si": char_data["name_si"],
            "land_extent_acres": land_extent_acres,
            "hectares": round(ha, 2),
            "land_use_system": land_use,
            "required_biochar_tonnage_mt": total_biochar_mt,
            "inoculation_recipe_14day": {
                "cattle_dung_slurry_kg": cow_dung_needed_kg,
                "cattle_urine_liters": cow_urine_needed_l,
                "water_liters": compost_slurry_water_l,
                "incubation_days": 14,
                "protocol_si": (
                    "අඟුරු කෙලින්ම කුඹුරට නොදමන්න! ඉහත ගොම දියර සහ මුත්‍රා සමඟ අඟුරු මිශ්‍ර කර "
                    "තෙතමනය සහිතව දින 14ක් පෙඟෙන්නට හැර ක්ෂුද්‍රජීවීන්ගෙන් සක්‍රීය වූ පසු පසට යොදන්න."
                )
            },
            "climate_carbon_sequestration_tCO2e": co2_sequestered_mt,
            "soil_fertility_gains": {
                "water_retention_gain_pct": est_water_retention_increase_pct,
                "cation_exchange_capacity_gain_pct": est_cec_increase_pct,
                "ph_buffer": f"Optimizes acidic soils (Biochar pH: {char_data['ph']})"
            }
        }

    def generate_biochar_figure(self, biochar_res: Dict[str, Any], save_path: str = None) -> str:
        """Visualizes inoculation protocol and carbon sequestration abatements."""
        if save_path is None:
            save_path = os.path.join(self.figures_dir, "biochar_charging_and_sequestration_model.png")

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 6))
        fig.suptitle(f"CropSafe AI - Biochar Inoculation & Climate Sequestration Model\nType: {biochar_res['biochar_type']} | Land: {biochar_res['land_extent_acres']} Acres | Net Carbon Sink: {biochar_res['climate_carbon_sequestration_tCO2e']} tCO2e", fontsize=12, fontweight="bold")

        # Left: Inoculation Mass Balance (Biochar + Dung + Slurry)
        recipe = biochar_res["inoculation_recipe_14day"]
        components = ["Raw Biochar", "Cattle Dung Slurry", "Cattle Urine", "Water Buffer"]
        masses = [
            biochar_res["required_biochar_tonnage_mt"] * 1000.0,
            recipe["cattle_dung_slurry_kg"],
            recipe["cattle_urine_liters"],
            recipe["water_liters"]
        ]
        colors = ["#2c3e50", "#795548", "#f39c12", "#3498db"]

        bars = ax1.bar(components, masses, color=colors, edgecolor="black", width=0.55)
        ax1.set_ylabel("Inoculation Mass (kg / Liters)", fontsize=11, fontweight="bold")
        ax1.set_title("1. 14-Day Co-Composting Biochar Inoculation Recipe", fontsize=11, fontweight="bold")
        ax1.grid(axis="y", linestyle="--", alpha=0.4)

        for b, m in zip(bars, masses):
            ax1.text(b.get_x() + b.get_width()/2., b.get_height() + 50, f"{m:,.0f}", ha="center", va="bottom", fontsize=10, fontweight="bold")

        # Right: Carbon Sequestration vs Emissions Abatement
        metrics = ["Biochar Carbon Sink\n(tCO2e Sequestered)", "Soil Water\nRetention (+%)", "Cation Exchange\nCapacity (+%)"]
        vals = [
            biochar_res["climate_carbon_sequestration_tCO2e"],
            biochar_res["soil_fertility_gains"]["water_retention_gain_pct"],
            biochar_res["soil_fertility_gains"]["cation_exchange_capacity_gain_pct"]
        ]
        bcolors = ["#27ae60", "#2980b9", "#8e44ad"]

        bars2 = ax2.bar(metrics, vals, color=bcolors, edgecolor="black", width=0.5)
        ax2.set_ylabel("Agronomic & Climate Impact", fontsize=11, fontweight="bold")
        ax2.set_title("2. Soil Conditioning & Climate Sequestration Multipliers", fontsize=11, fontweight="bold")
        ax2.grid(axis="y", linestyle="--", alpha=0.4)

        for b, v in zip(bars2, vals):
            ax2.text(b.get_x() + b.get_width()/2., b.get_height() + 1, f"{v}", ha="center", va="bottom", fontsize=11, fontweight="bold")

        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        return save_path


if __name__ == "__main__":
    calc = BiocharInoculationCalculator()

    # Scenario: 2.5 Acres of Lowland Paddy in Polonnaruwa applying Paddy Husk Biochar
    prescription = calc.calculate_biochar_prescription("Paddy_Husk_Biochar", land_extent_acres=2.5, land_use="Lowland_Paddy")
    fig = calc.generate_biochar_figure(prescription)

    print("=== Biochar Inoculation & Sequestration Model Evaluated ===")
    print(f"Product: {prescription['char_name_si']}")
    print(f"Required Biochar: {prescription['required_biochar_tonnage_mt']} MT")
    print(f"CO2e Sequestered: {prescription['climate_carbon_sequestration_tCO2e']} Metric Tons")
    print(f"Water Retention Gain: +{prescription['soil_fertility_gains']['water_retention_gain_pct']}%")
    print(f"Inoculation Protocol: {prescription['inoculation_recipe_14day']['protocol_si']}")
    print(f"Model Chart Saved: {fig}")
