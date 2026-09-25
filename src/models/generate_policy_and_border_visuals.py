"""
CropSafe AI - Visual Assets Generator for Policy Wargame, Anti-Counterfeit Vision & Ellangawa Cascade Models
Module: src/models/generate_policy_and_border_visuals.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Generates publication-quality figures:
1. national_policy_wargame_scenarios.png
2. anti_counterfeit_packaging_assay.png
3. ellangawa_cascade_eutrophication_dynamics.png
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

def generate_policy_wargame_visual():
    """Compares 4 policy shock scenarios on harvest loss and rice price."""
    scenarios = ["Baseline (Normal)", "Red Sea Crisis (+65% Price)", "Subsidy Halved (-50%)", "2021 Overnight Total Ban"]
    yield_loss_pct = [0.0, 19.4, 28.5, 42.0]
    rice_price_lkr = [220.0, 290.4, 325.0, 395.0]

    x = np.arange(len(scenarios))
    width = 0.35

    fig, ax1 = plt.subplots(figsize=(10, 5.8), dpi=300)

    color1 = '#e74c3c'
    rects1 = ax1.bar(x - width/2, yield_loss_pct, width, label='National Paddy Harvest Loss (%)', color=color1, edgecolor='black', alpha=0.85)
    ax1.set_ylabel('Projected Harvest Loss (%)', color=color1, fontweight='bold')
    ax1.tick_params(axis='y', labelcolor=color1)
    ax1.set_ylim(0, 55)

    ax2 = ax1.twinx()
    color2 = '#2980b9'
    rects2 = ax2.bar(x + width/2, rice_price_lkr, width, label='Consumer Rice Retail Price (LKR/kg)', color=color2, edgecolor='black', alpha=0.85)
    ax2.set_ylabel('Retail Rice Price (LKR / kg)', color=color2, fontweight='bold')
    ax2.tick_params(axis='y', labelcolor=color2)
    ax2.set_ylim(150, 450)

    ax1.set_title('National Policy Crisis & Geopolitical Shock "What-If" Simulation (CropSafe AI Wargame)', pad=15, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(scenarios, fontweight='semibold')

    for rect in rects1:
        h = rect.get_height()
        ax1.annotate(f'{h:.1f}%', xy=(rect.get_x() + rect.get_width() / 2, h),
                     xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=8.5, fontweight='bold')

    for rect in rects2:
        h = rect.get_height()
        ax2.annotate(f'Rs. {h:.0f}', xy=(rect.get_x() + rect.get_width() / 2, h),
                     xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=8.5, fontweight='bold')

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "national_policy_wargame_scenarios.png")
    plt.savefig(out_path)
    plt.close()
    print(f"Generated: {out_path}")

def generate_packaging_assay_visual():
    """Visualizes authentic vs counterfeit packaging vision feature scores."""
    features = ['Hologram Diffraction', 'Micro-Print Kerning', 'Closure Stitching', 'Seal Integrity', 'Color Spectral Match']
    genuine_scores = [0.88, 0.92, 0.95, 1.0, 0.94]
    fake_scores = [0.25, 0.42, 0.20, 0.15, 0.48]

    x = np.arange(len(features))
    width = 0.35

    fig, ax = plt.subplots(figsize=(9.5, 5.5), dpi=300)
    ax.bar(x - width/2, [s * 100 for s in genuine_scores], width, label='Genuine Factory-Sealed Bag (Lakpohora)', color='#27ae60', edgecolor='black', alpha=0.85)
    ax.bar(x + width/2, [s * 100 for s in fake_scores], width, label='Seized Counterfeit Repacked Sack', color='#e74c3c', edgecolor='black', alpha=0.85)

    ax.axhline(80.0, color='#2980b9', linestyle='--', label='Statutory Authenticity Pass Mark (80%)')
    ax.set_ylabel('Forensic Optical Authenticity Score (%)', fontweight='bold')
    ax.set_title('Computer Vision Packaging Verification: Genuine vs Counterfeit Fertilizer Bags', pad=15, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(features, fontweight='semibold')
    ax.legend(loc='upper right', frameon=True)
    ax.set_ylim(0, 115)

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "anti_counterfeit_packaging_assay.png")
    plt.savefig(out_path)
    plt.close()
    print(f"Generated: {out_path}")

def generate_ellangawa_eutrophication_visual():
    """Visualizes nutrient loading and Carlson TSI in ancient cascade tanks."""
    metrics = ['Annual P Loading (kg/yr)', 'Annual N Loading (kg/yr)', 'In-Lake Total P (ug/L)', 'Carlson TSI Index']
    unprotected = [63.0, 648.0, 78.4, 67.2]
    restored_kattakaduwa = [15.8, 194.4, 21.2, 48.1]

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5.2), dpi=300)

    # Plot 1: Nutrient Loading
    x1 = np.arange(2)
    w = 0.35
    ax1.bar(x1 - w/2, [unprotected[0], unprotected[1]], w, label='Unprotected Upstream Catchment', color='#e74c3c', edgecolor='black', alpha=0.85)
    ax1.bar(x1 + w/2, [restored_kattakaduwa[0], restored_kattakaduwa[1]], w, label='With Kattakaduwa & Perahana Buffer', color='#27ae60', edgecolor='black', alpha=0.85)
    ax1.set_xticks(x1)
    ax1.set_xticklabels(['Phosphorus (P)', 'Nitrogen (N)'], fontweight='semibold')
    ax1.set_ylabel('Runoff Nutrient Mass (kg / year)', fontweight='bold')
    ax1.set_title('Agricultural Nutrient Export Loading into Cascade Tank', pad=12, fontweight='bold')
    ax1.legend()

    # Plot 2: Carlson TSI
    x2 = np.arange(2)
    bars2 = ax2.bar(['Unprotected Tank', 'Restored Ancient Buffer'], [unprotected[3], restored_kattakaduwa[3]], color=['#e67e22', '#2ecc71'], edgecolor='black', width=0.5, alpha=0.85)
    ax2.axhline(50.0, color='#2980b9', linestyle='--', linewidth=2, label='Eutrophic Threshold (TSI = 50)')
    ax2.set_ylabel('Carlson Trophic State Index (TSI)', fontweight='bold')
    ax2.set_title('Tank Eutrophication Risk: Algal Bloom & Weed Infestation', pad=12, fontweight='bold')
    ax2.set_ylim(0, 80)
    ax2.legend()

    for bar in bars2:
        h = bar.get_height()
        ax2.annotate(f'TSI {h:.1f}', xy=(bar.get_x() + bar.get_width() / 2, h),
                     xytext=(0, 4), textcoords="offset points", ha='center', va='bottom', fontsize=9, fontweight='bold')

    plt.tight_layout()
    out_path = os.path.join(OUTPUT_DIR, "ellangawa_cascade_eutrophication_dynamics.png")
    plt.savefig(out_path)
    plt.close()
    print(f"Generated: {out_path}")

if __name__ == "__main__":
    generate_policy_wargame_visual()
    generate_packaging_assay_visual()
    generate_ellangawa_eutrophication_visual()
    print("All 3 policy and border visuals generated successfully.")
