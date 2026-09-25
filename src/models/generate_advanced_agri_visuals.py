"""
CropSafe AI - Visual Assets Generator for Advanced Agricultural & Biosecurity Engines
Module: src/models/generate_advanced_agri_visuals.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Generates publication-quality figures:
1. paddy_straw_nutrient_recycling_kinetics.png
2. soil_acidity_dolomite_titration_curves.png
3. drone_multispectral_ndvi_heatmap.png
4. fertilizer_carbon_lifecycle_comparison.png
"""

import os
import sys
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

OUTPUT_DIR = os.path.join("reports", "figures", "predictive_prescriptive")
os.makedirs(OUTPUT_DIR, exist_ok=True)

plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
plt.rcParams.update({
    "font.size": 10,
    "axes.labelsize": 11,
    "axes.titlesize": 12,
    "xtick.labelsize": 9,
    "ytick.labelsize": 9,
    "figure.titlesize": 13
})

def generate_paddy_straw_kinetics():
    """Plots in-situ straw decomposition C:N kinetics and nutrient return."""
    days = np.linspace(0, 30, 31)
    # Trichoderma accelerated vs untreated
    cn_treated = 24.0 + (80.0 - 24.0) * np.exp(-0.16 * days)
    cn_untreated = 45.0 + (80.0 - 45.0) * np.exp(-0.04 * days)

    fig, ax1 = plt.subplots(figsize=(9, 5.5), dpi=300)

    color = '#27ae60'
    ax1.set_xlabel('Decomposition Period (Days)', fontweight='bold')
    ax1.set_ylabel('C:N Ratio of Paddy Straw Residue', color='#2c3e50', fontweight='bold')
    ax1.plot(days, cn_treated, color=color, linewidth=2.8, label='Trichoderma + Cow Dung Accelerated Inoculation')
    ax1.plot(days, cn_untreated, color='#e74c3c', linestyle='--', linewidth=2.2, label='Untreated Control Residue')
    ax1.axhline(25.0, color='#f39c12', linestyle=':', linewidth=1.8, label='Agronomic Humus Sweet Spot (C:N <= 25:1)')
    ax1.axvline(18.0, color='#8e44ad', linestyle='-.', alpha=0.7, label='Optimal Soil Preparation Window (Day 18)')

    ax1.set_title('In-Situ Paddy Straw Accelerated Bio-Decomposition Kinetics & Humification', pad=15, fontweight='bold')
    ax1.legend(loc='upper right', frameon=True)
    ax1.set_ylim(15, 85)

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "paddy_straw_nutrient_recycling_kinetics.png")
    plt.savefig(out_path)
    plt.close()
    print(f"Generated: {out_path}")

def generate_dolomite_titration_curves():
    """Plots dolomite requirement curves across 4 soil textures."""
    delta_ph = np.linspace(0.0, 2.5, 50)
    textures = {
        "Sandy Soil": 0.65,
        "Sandy Loam": 0.85,
        "Loam / Podzolic (Upcountry)": 1.00,
        "Clay Loam / Heavy Clay": 1.35
    }
    colors = ['#f39c12', '#3498db', '#2ecc71', '#9b59b6']

    fig, ax = plt.subplots(figsize=(9, 5.5), dpi=300)
    for (tex_name, factor), c in zip(textures.items(), colors):
        dolomite_t = (delta_ph * 1.8 * factor) / 1.06
        ax.plot(delta_ph, dolomite_t, label=tex_name, color=c, linewidth=2.4)

    ax.axhline(2.5, color='#e74c3c', linestyle='--', alpha=0.8, label='Maximum Single Application Threshold (2.5 t/ha)')
    ax.set_xlabel('Soil pH Deficit (Target pH - Current pH)', fontweight='bold')
    ax.set_ylabel('Agricultural Dolomite Requirement (tons/ha)', fontweight='bold')
    ax.set_title('Soil Acidity Buffering & Agricultural Dolomite Titration Response Curves', pad=15, fontweight='bold')
    ax.legend(loc='upper left', frameon=True)
    ax.set_ylim(0, 5.5)

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "soil_acidity_dolomite_titration_curves.png")
    plt.savefig(out_path)
    plt.close()
    print(f"Generated: {out_path}")

def generate_drone_ndvi_heatmap():
    """Visualizes simulated drone canopy NDVI alongside VRA prescription grid."""
    np.random.seed(101)
    red_band = np.random.uniform(0.06, 0.22, (5, 5))
    nir_band = np.random.uniform(0.35, 0.85, (5, 5))
    ndvi = (nir_band - red_band) / (nir_band + red_band + 1e-6)

    # VRA Prescription
    prescription = np.zeros((5, 5))
    for r in range(5):
        for c in range(5):
            val = ndvi[r, c]
            if val < 0.45: rate = 65.0 * 1.35
            elif val < 0.65: rate = 65.0 * 1.15
            elif val <= 0.78: rate = 65.0 * 1.0
            else: rate = 65.0 * 0.65
            prescription[r, c] = round(rate, 1)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5.5), dpi=300)

    # Plot 1: NDVI Heatmap
    sns.heatmap(ndvi, annot=True, fmt=".2f", cmap="YlGn", cbar_kws={'label': 'Canopy NDVI Index'}, ax=ax1, linewidths=1.5, linecolor='white')
    ax1.set_title('Drone Multispectral Canopy NDVI Heatmap (5x5 Field Grid)', pad=12, fontweight='bold')
    ax1.set_xlabel('Spatial Grid Column', fontweight='semibold')
    ax1.set_ylabel('Spatial Grid Row', fontweight='semibold')

    # Plot 2: Prescription Heatmap
    sns.heatmap(prescription, annot=True, fmt=".1f", cmap="Blues", cbar_kws={'label': 'Prescribed Urea Rate (kg/ha)'}, ax=ax2, linewidths=1.5, linecolor='white')
    ax2.set_title('Precision Variable-Rate Application (VRA) Nitrogen Prescription', pad=12, fontweight='bold')
    ax2.set_xlabel('Spatial Grid Column', fontweight='semibold')
    ax2.set_ylabel('Spatial Grid Row', fontweight='semibold')

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "drone_multispectral_ndvi_heatmap.png")
    plt.savefig(out_path)
    plt.close()
    print(f"Generated: {out_path}")

def generate_carbon_lifecycle_comparison():
    """Visualizes carbon lifecycle breakdown: Chemical vs Eco-Smart."""
    categories = ['Production (Scope 1/2)', 'Transport (Scope 3)', 'Urea Hydrolysis CO2', 'Field N2O (GWP 298)', 'Biochar Carbon Sink']
    conventional = [428.5, 11.2, 110.0, 375.6, 0.0]
    ecosmart = [193.5, 9.8, 55.0, 187.8, -1232.5]

    x = np.arange(len(categories))
    width = 0.35

    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.bar(x - width/2, conventional, width, label='Conventional High-Chemical (150kg Urea)', color='#e74c3c', edgecolor='black', alpha=0.85)
    ax.bar(x + width/2, ecosmart, width, label='Eco-Smart Balanced (75kg Urea + Biochar)', color='#27ae60', edgecolor='black', alpha=0.85)

    ax.axhline(0, color='black', linewidth=1)
    ax.set_ylabel('Greenhouse Gas Emissions (kg CO2e / ha)', fontweight='bold')
    ax.set_title('Fertilizer Life Cycle Assessment (LCA): Scope 1-3 Carbon Footprint Comparison', pad=15, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(categories, rotation=15, ha='right', fontweight='semibold')
    ax.legend(loc='upper right', frameon=True)

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "fertilizer_carbon_lifecycle_comparison.png")
    plt.savefig(out_path)
    plt.close()
    print(f"Generated: {out_path}")

if __name__ == "__main__":
    generate_paddy_straw_kinetics()
    generate_dolomite_titration_curves()
    generate_drone_ndvi_heatmap()
    generate_carbon_lifecycle_comparison()
    print("All 4 advanced agricultural visuals generated successfully.")
