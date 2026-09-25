"""
CropSafe AI - Soil Health, Salinization & CKDu Groundwater Nitrate Leaching Simulator
Faculty of Computing | Sabaragamuwa University of Sri Lanka (DS3206 Capstone Project II)

Implements:
  1. Soil Salinization Hazard (Electrical Conductivity EC_e dS/m shift)
  2. Soil pH Acidification & Aluminum Toxicity Risk Model
  3. Toxic Heavy Metal (Cd, As, Pb) Bioaccumulation Hazard Index
  4. Nitrate Groundwater Leaching & Rajarata CKDu Aquifer Vulnerability Index
"""

import os
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

def _find_file(relative_path):
    candidates = [
        relative_path,
        os.path.join("cropsafe AI", relative_path),
        os.path.join("..", relative_path),
        os.path.join("..", "cropsafe AI", relative_path)
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return relative_path

def evaluate_soil_ecotoxicology(sample_row, target_crop="Paddy (Rice)", soil_type="Reddish Brown Earth (RBE)"):
    """
    Evaluates ecological and soil degradation risks caused by substandard/adulterated fertilizer lots.
    """
    product = sample_row.get("Product_Name", "Urea")
    act_n = float(sample_row.get("Nitrogen_N_g_per_100g", 46.0))
    exp_n = float(sample_row.get("expected_n", 46.0))
    moisture = float(sample_row.get("Moisture_Content_pct", 1.0))
    filler = float(sample_row.get("Estimated_Inert_Filler", 0.0))
    adulterant = str(sample_row.get("Adulterant_Type", "Standard_Pure"))
    region = str(sample_row.get("Region", "North Central Province"))
    rainfall = float(sample_row.get("monthly_rainfall_mm", 160.0))
    
    # 1. Soil Salinization Impact (EC_e in dS/m)
    # Baseline Sri Lankan agricultural soils: ~1.2 dS/m
    baseline_ec = 1.2
    # Salts / industrial gypsum in filler contribute significantly to EC
    salt_fraction = (filler * 0.45) if "Filler" in adulterant or "Substandard" in adulterant else 0.0
    delta_ec = round((salt_fraction * 0.12) + (moisture * 0.05), 2)
    post_app_ec = round(baseline_ec + delta_ec, 2)
    
    # Paddy yield threshold is EC_e = 3.0 dS/m
    if post_app_ec > 4.5:
        salinity_hazard = "CRITICAL_SALINIZATION (Severe Osmotic Desiccation & Crop Death)"
    elif post_app_ec > 3.0:
        salinity_hazard = "ELEVATED_SALINITY (15-30% Yield Retardation)"
    else:
        salinity_hazard = "NEGLIGIBLE_SALINITY (Safe for Cereal Crops)"

    # 2. Soil pH Acidification Shift
    # Ammonium sulfate or low-grade sulfur impurities cause rapid acidification
    baseline_ph = 6.2 # Ideal RBE soil
    if "SOA" in product or "Ammonium" in product:
        delta_ph = -round(0.4 + (filler * 0.015), 2)
    else:
        delta_ph = -round(0.1 + (filler * 0.008), 2)
    post_app_ph = round(max(3.8, baseline_ph + delta_ph), 2)
    
    al_toxicity = "HIGH_ALUMINUM_TOXICITY_RISK" if post_app_ph < 4.8 else "NORMAL_SOIL_REACTION"

    # 3. Heavy Metal Hazard Index (Cadmium, Arsenic, Lead)
    # Low-grade rock phosphate / industrial waste fillers often contain high Cd and As
    if "Filler" in adulterant:
        cd_ppm = round(1.2 + (filler * 0.18), 2) # SLSI limit is 5.0 mg/kg
        as_ppm = round(4.5 + (filler * 0.45), 2) # SLSI limit is 20.0 mg/kg
        pb_ppm = round(8.0 + (filler * 0.60), 2) # SLSI limit is 30.0 mg/kg
    else:
        cd_ppm, as_ppm, pb_ppm = 0.4, 2.1, 4.5

    heavy_metal_risk_score = round(min(100.0, ((cd_ppm / 5.0) + (as_ppm / 20.0) + (pb_ppm / 30.0)) * 33.3), 1)
    
    # 4. Groundwater Nitrate Leaching & Rajarata CKDu Aquifer Risk
    # High rainfall + excess moisture + volatile ammonia leads to rapid downward percolation
    leaching_rate_kg_ha = round((exp_n - act_n) * 0.65 + (rainfall * (moisture / 100.0) * 0.8), 1)
    
    # Vulnerability tier by Region
    ckdu_endemic_regions = ["North Central Province", "North Western Province", "Uva Province", "Eastern Province"]
    is_ckdu_zone = any(r in region for r in ckdu_endemic_regions)
    
    if is_ckdu_zone and leaching_rate_kg_ha > 18.0:
        ckdu_aquifer_risk = "HIGH_AQUIFER_CONTAMINATION (High Nitrate & Metal Leaching in CKDu Zone)"
    elif is_ckdu_zone:
        ckdu_aquifer_risk = "MODERATE_VULNERABILITY (Requires Controlled Release Monitoring)"
    else:
        ckdu_aquifer_risk = "LOW_AQUIFER_IMPACT"

    return {
        "Product": product,
        "Adulteration_Modality": adulterant,
        "Region": region,
        "Soil_Type": soil_type,
        "Salinization_Metric": {
            "Baseline_EC_dSm": baseline_ec,
            "Delta_EC_dSm": delta_ec,
            "Post_Application_EC_dSm": post_app_ec,
            "Salinity_Status": salinity_hazard
        },
        "Soil_pH_Shift": {
            "Baseline_pH": baseline_ph,
            "Delta_pH": delta_ph,
            "Post_Application_pH": post_app_ph,
            "Aluminum_Solubility_Status": al_toxicity
        },
        "Heavy_Metal_Assay_Est": {
            "Cadmium_Cd_mg_kg": cd_ppm,
            "Arsenic_As_mg_kg": as_ppm,
            "Lead_Pb_mg_kg": pb_ppm,
            "Heavy_Metal_Risk_Score_Pct": heavy_metal_risk_score
        },
        "Groundwater_Leaching": {
            "Estimated_Nitrate_Leaching_kg_ha": leaching_rate_kg_ha,
            "CKDu_Endemic_Zone": is_ckdu_zone,
            "Aquifer_Vulnerability_Tier": ckdu_aquifer_risk
        }
    }

def run_ecotoxicology_benchmark_and_visualize(data_path="data/processed/cropsafe_master_dataset.csv",
                                              output_dir="reports/figures/predictive_prescriptive"):
    actual_data = _find_file(data_path)
    actual_dir = _find_file(output_dir)
    os.makedirs(actual_dir, exist_ok=True)
    
    df = pd.read_csv(actual_data)
    
    # Run evaluation across sample cohorts
    modalities = ["Standard_Pure", "Substandard_Blend", "Moisture_Weight_Padding", "Heavy_Insoluble_Filler"]
    sample_records = []
    
    for mod in modalities:
        sub_df = df[df["Adulterant_Type"] == mod]
        if not sub_df.empty:
            row = sub_df.iloc[0]
            sim = evaluate_soil_ecotoxicology(row)
            sample_records.append({
                "Modality": mod.replace("_", " "),
                "EC_dSm": sim["Salinization_Metric"]["Post_Application_EC_dSm"],
                "Soil_pH": sim["Soil_pH_Shift"]["Post_Application_pH"],
                "Heavy_Metal_Score": sim["Heavy_Metal_Assay_Est"]["Heavy_Metal_Risk_Score_Pct"],
                "Nitrate_Leached_kg_ha": sim["Groundwater_Leaching"]["Estimated_Nitrate_Leaching_kg_ha"]
            })

    res_df = pd.DataFrame(sample_records)
    
    # 4-panel visual report
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Plot 1: Soil Salinity EC
    sns.barplot(data=res_df, x="Modality", y="EC_dSm", ax=axes[0, 0], palette="Reds")
    axes[0, 0].axhline(3.0, color="green", linestyle="--", lw=1.5, label="Paddy Tolerance Threshold (3.0 dS/m)")
    axes[0, 0].set_title("Soil Salinization Hazard (EC_e in dS/m)", fontweight="bold")
    axes[0, 0].set_ylabel("Electrical Conductivity (dS/m)")
    axes[0, 0].tick_params(axis='x', rotation=20)
    axes[0, 0].legend()
    
    # Plot 2: Soil pH Acidification
    sns.barplot(data=res_df, x="Modality", y="Soil_pH", ax=axes[0, 1], palette="Blues_r")
    axes[0, 1].axhline(4.8, color="red", linestyle="--", lw=1.5, label="Aluminum Toxicity Trigger (pH 4.8)")
    axes[0, 1].set_title("Soil Reaction & Acidification Shift (pH)", fontweight="bold")
    axes[0, 1].set_ylabel("Soil pH")
    axes[0, 1].set_ylim(3.5, 7.0)
    axes[0, 1].tick_params(axis='x', rotation=20)
    axes[0, 1].legend()
    
    # Plot 3: Heavy Metal Risk Score
    sns.barplot(data=res_df, x="Modality", y="Heavy_Metal_Score", ax=axes[1, 0], palette="Oranges")
    axes[1, 0].axhline(50.0, color="black", linestyle="--", lw=1.5, label="High Bioaccumulation Risk (50%)")
    axes[1, 0].set_title("Toxic Heavy Metal Hazard Score (Cd, As, Pb)", fontweight="bold")
    axes[1, 0].set_ylabel("Risk Score (0 - 100)")
    axes[1, 0].tick_params(axis='x', rotation=20)
    axes[1, 0].legend()
    
    # Plot 4: Groundwater Nitrate Leaching
    sns.barplot(data=res_df, x="Modality", y="Nitrate_Leached_kg_ha", ax=axes[1, 1], palette="Purples")
    axes[1, 1].axhline(15.0, color="red", linestyle="--", lw=1.5, label="Aquifer Contamination Threshold")
    axes[1, 1].set_title("Nitrate Leaching Potential to Shallow Aquifers", fontweight="bold")
    axes[1, 1].set_ylabel("Leached N (kg/ha)")
    axes[1, 1].tick_params(axis='x', rotation=20)
    axes[1, 1].legend()

    plt.tight_layout()
    fig_path = os.path.join(actual_dir, "soil_ecotoxicology_ckdu_risk.png")
    plt.savefig(fig_path, dpi=300)
    plt.close()
    print(f"Soil Ecotoxicology & CKDu risk graphic saved to: {fig_path}")

    return res_df

if __name__ == "__main__":
    print("Testing Soil Health, Salinization & CKDu Groundwater Leaching Simulator...")
    res = run_ecotoxicology_benchmark_and_visualize()
    print("\nEcotoxicological Simulation Summary:")
    print(res)
