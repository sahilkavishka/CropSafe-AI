"""
CropSafe AI - Visual Assets Generator for Advanced Agronomic & Farmer Empowerment Engines
Module: src/models/generate_farmer_empowerment_visuals.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Generates publication-quality figures:
1. fertilizer_tank_mix_compatibility_matrix.png
2. groundwater_nitrate_leaching_dynamics.png
3. soil_salinity_reclamation_curves.png
4. farmer_bulk_buying_arbitrage_savings.png
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

def generate_compatibility_matrix():
    """Generates a chemical compatibility matrix heatmap."""
    labels = ["Urea", "MOP", "TSP", "Ca(NO3)2", "SOP", "MgSO4", "ZnSO4", "Lime"]
    n = len(labels)
    # 0 = Safe/Compatible, 1 = Caution, 2 = High Risk (Burn/Loss), 3 = Critical Incompatible (Precipitation)
    matrix = np.zeros((n, n))

    # Known conflicts mapping
    conflicts = {
        (3, 2): 3, (2, 3): 3,  # Ca(NO3)2 + TSP
        (3, 4): 3, (4, 3): 3,  # Ca(NO3)2 + SOP
        (3, 5): 3, (5, 3): 3,  # Ca(NO3)2 + MgSO4
        (0, 7): 2, (7, 0): 2,  # Urea + Lime (NH3 volatilization)
        (2, 6): 1, (6, 2): 1,  # TSP + ZnSO4 (Zinc phosphate precipitate)
        (3, 6): 1, (6, 3): 1,  # Ca(NO3)2 + ZnSO4
        (4, 7): 2, (7, 4): 2,  # SOP + Lime
    }

    for (i, j), val in conflicts.items():
        matrix[i, j] = val

    fig, ax = plt.subplots(figsize=(8.5, 7), dpi=300)
    cmap = sns.color_palette(["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c"], as_cmap=True)
    sns.heatmap(
        matrix,
        xticklabels=labels,
        yticklabels=labels,
        cmap=cmap,
        annot=True,
        fmt=".0f",
        cbar_kws={'label': 'Risk Tier (0=Compatible, 1=Caution, 2=Volatilization, 3=Insoluble Precipitate)'},
        linewidths=1.5,
        linecolor='white',
        ax=ax
    )
    ax.set_title("Fertilizer Tank-Mix Chemical Compatibility & Antagonism Matrix", pad=15, fontweight="bold")
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "fertilizer_tank_mix_compatibility_matrix.png")
    plt.savefig(out_path)
    plt.close()
    print(f"Generated: {out_path}")

def generate_nitrate_leaching_dynamics():
    """Compares nitrate leaching dynamics across 4 soils and application methods."""
    soils = ["Kalpitiya Sandy", "Jaffna Latosol", "Rajarata RBE", "Upcountry Podzol"]
    single_dose_no3 = [61.7, 44.5, 23.8, 28.4]  # mg/L in shallow well
    three_split_no3 = [28.2, 19.8, 8.5, 11.2]   # mg/L in shallow well

    x = np.arange(len(soils))
    width = 0.35

    fig, ax = plt.subplots(figsize=(9, 6), dpi=300)
    rects1 = ax.bar(x - width/2, single_dose_no3, width, label='Single High Dose (180 kg N)', color='#e74c3c', edgecolor='black', alpha=0.85)
    rects2 = ax.bar(x + width/2, three_split_no3, width, label='3-Split Application + Buffer (Managed)', color='#27ae60', edgecolor='black', alpha=0.85)

    ax.axhline(50.0, color='#c0392b', linestyle='--', linewidth=2, label='WHO / SLS 614 Maximum Safe Limit (50 mg/L NO3-)')
    ax.axhline(25.0, color='#f39c12', linestyle=':', linewidth=1.5, label='Advisory Caution Threshold (25 mg/L)')

    ax.set_ylabel('Predicted Well Water Nitrate (mg/L NO3-)', fontweight='bold')
    ax.set_title('Groundwater & Agro-Well Nitrate Leaching Risk by Agro-Ecological Soil Zone', pad=15, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(soils, fontweight='semibold')
    ax.legend(loc='upper right', frameon=True)
    ax.set_ylim(0, 75)

    for rect in rects1:
        h = rect.get_height()
        ax.annotate(f'{h:.1f}', xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=8, fontweight='bold')

    for rect in rects2:
        h = rect.get_height()
        ax.annotate(f'{h:.1f}', xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=8, fontweight='bold')

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "groundwater_nitrate_leaching_dynamics.png")
    plt.savefig(out_path)
    plt.close()
    print(f"Generated: {out_path}")

def generate_salinity_reclamation_curves():
    """Visualizes leaching water requirement and gypsum addition vs initial soil salinity."""
    ec_levels = np.linspace(2.0, 12.0, 50)
    # Leaching fraction denominator: 5 * ECe - 0.8
    den = 5.0 * ec_levels - 0.8
    lf = np.clip(0.8 / den, 0.05, 0.60)
    water_depth_mm = (lf * 400.0) / (1.0 - lf)

    fig, ax1 = plt.subplots(figsize=(9, 5.5), dpi=300)

    color = '#2980b9'
    ax1.set_xlabel('Initial Soil Salinity ECe (dS/m)', fontweight='bold')
    ax1.set_ylabel('Required Leaching Water Depth (mm)', color=color, fontweight='bold')
    ax1.plot(ec_levels, water_depth_mm, color=color, linewidth=2.5, label='Flushing Water Depth (mm)')
    ax1.tick_params(axis='y', labelcolor=color)
    ax1.axvline(4.0, color='#e67e22', linestyle='--', label='Saline Soil Threshold (ECe = 4.0 dS/m)')

    # Twin axis for gypsum requirement on sodic soils (assuming ESP scales with salinity)
    ax2 = ax1.twinx()
    color2 = '#8e44ad'
    gypsum_tons = 0.086 * 0.4 * 1.35 * 15.0 * np.maximum(0, (ec_levels * 2.2) - 5.0) / 10.0
    ax2.set_ylabel('Agricultural Gypsum Requirement (tons/ha)', color=color2, fontweight='bold')
    ax2.plot(ec_levels, gypsum_tons, color=color2, linestyle='-.', linewidth=2.5, label='Gypsum Required (t/ha)')
    ax2.tick_params(axis='y', labelcolor=color2)

    ax1.set_title('Soil Salinity & Sodicity Reclamation Dynamics: Water Flushing vs Gypsum Amelioration', pad=15, fontweight='bold')
    fig.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "soil_salinity_reclamation_curves.png")
    plt.savefig(out_path)
    plt.close()
    print(f"Generated: {out_path}")

def generate_farmer_bulk_buying_savings():
    """Visualizes farmer community collective bulk-buying savings."""
    communities = ["Hingurakgoda ASC", "Polonnaruwa Yaya", "Ampara East Pool", "Kurunegala North", "Matale Farmers"]
    retail_gouging_lkr = [781500, 1140000, 620000, 950000, 810000]
    collective_pool_lkr = [255800, 372000, 204000, 312000, 268000]
    savings_lkr = [r - c for r, c in zip(retail_gouging_lkr, collective_pool_lkr)]

    x = np.arange(len(communities))
    width = 0.35

    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    ax.bar(x - width/2, [v/1000 for v in retail_gouging_lkr], width, label='Black-Market Retail Gouging (Thousand LKR)', color='#e74c3c', edgecolor='black', alpha=0.85)
    ax.bar(x + width/2, [v/1000 for v in collective_pool_lkr], width, label='Collective Pool Requisition Cost (Thousand LKR)', color='#27ae60', edgecolor='black', alpha=0.85)

    ax.set_ylabel('Total Cost (Thousand LKR)', fontweight='bold')
    ax.set_title('Farmer Collective Bulk-Buying: Community Financial Arbitrage & Anti-Hoarding Savings', pad=15, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(communities, fontweight='semibold')
    ax.legend(loc='upper right', frameon=True)

    for i, s in enumerate(savings_lkr):
        ax.annotate(f'Saved:\nLKR {s/1000:.0f}K', xy=(x[i], max(retail_gouging_lkr[i], collective_pool_lkr[i])/1000 + 40),
                    ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#2c3e50')

    ax.set_ylim(0, 1400)
    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "farmer_bulk_buying_arbitrage_savings.png")
    plt.savefig(out_path)
    plt.close()
    print(f"Generated: {out_path}")

if __name__ == "__main__":
    generate_compatibility_matrix()
    generate_nitrate_leaching_dynamics()
    generate_salinity_reclamation_curves()
    generate_farmer_bulk_buying_savings()
    print("All 4 farmer empowerment figures generated successfully.")
