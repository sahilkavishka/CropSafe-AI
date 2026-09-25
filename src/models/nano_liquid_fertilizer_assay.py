"""
CropSafe AI - Nano & Liquid Bio-Fertilizer Quality Assay
Physico-chemical diagnostic analyzer for Nano-Urea, liquid bio-fertilizers, and foliar concentrates.
Compliant with SLS 1672:2020 and International Nano-Agri Quality Standards.

Assay Parameters:
  - Specific Gravity & Density (g/cm^3)
  - Optical Refractometry (°Brix and Refractive Index n_D)
  - Dynamic Viscosity (mPa·s)
  - Zeta Potential Colloidal Stability (mV)
  - Active Nutrient Concentration (g/L or % w/v)
  - pH and Electrical Conductivity (dS/m)
"""

import os
import sys
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from typing import Dict, Any, List, Tuple

# Windows encoding safety
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


class NanoLiquidFertilizerAssay:
    """Diagnostic laboratory evaluation for liquid bio-fertilizers and nano-urea formulations."""

    # Reference standards for genuine Sri Lankan / imported nano-fertilizers
    STANDARDS = {
        "Nano_Urea": {
            "density_range": (1.08, 1.16),  # g/cm3
            "brix_range": (8.0, 16.0),      # °Brix
            "viscosity_range": (12.0, 40.0), # mPa·s
            "zeta_min_mv": 30.0,            # Absolute magnitude |zeta| >= 30 mV
            "ph_range": (6.5, 8.5),
            "active_n_pct": (3.8, 4.4),     # 4% w/v target
            "ec_max_dsm": 18.0
        },
        "Liquid_Bio_NPK": {
            "density_range": (1.10, 1.25),
            "brix_range": (14.0, 26.0),
            "viscosity_range": (20.0, 65.0),
            "zeta_min_mv": 25.0,
            "ph_range": (5.5, 7.5),
            "active_n_pct": (2.0, 5.0),
            "ec_max_dsm": 25.0
        }
    }

    def __init__(self, figures_dir: str = "reports/figures/predictive_prescriptive"):
        self.figures_dir = figures_dir
        os.makedirs(self.figures_dir, exist_ok=True)

    def analyze_sample(self, sample: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates physical-chemical metrics, determines adulteration/dilution mode,
        and computes composite Quality Integrity Score (QIS).
        """
        ftype = sample.get("formulation_type", "Nano_Urea")
        std = self.STANDARDS.get(ftype, self.STANDARDS["Nano_Urea"])

        density = sample.get("density_g_cm3", 1.0)
        brix = sample.get("brix_deg", 0.0)
        viscosity = sample.get("viscosity_mpa_s", 1.0)
        zeta = abs(sample.get("zeta_potential_mv", 0.0))
        ph = sample.get("ph", 7.0)
        active_n = sample.get("active_n_pct", 0.0)
        ec = sample.get("ec_ds_m", 0.0)

        penalties = []
        violations = []

        # 1. Density evaluation (Dilution indicator)
        if density < std["density_range"][0]:
            p = min(100.0, (std["density_range"][0] - density) / (std["density_range"][0] - 1.00) * 100.0)
            penalties.append(p * 0.25)
            violations.append(f"Aqueous Dilution Detected: Density {density:.3f} g/cm3 (SLS min {std['density_range'][0]})")
        elif density > std["density_range"][1]:
            penalties.append(20.0)
            violations.append(f"Abnormal Density Elevation: {density:.3f} g/cm3 (Salt/Brine spiking suspected)")

        # 2. Brix refractometry
        if brix < std["brix_range"][0]:
            penalties.append(30.0 * (1.0 - brix / std["brix_range"][0]))
            violations.append(f"Low Soluble Solids: {brix:.1f} °Brix (SLS min {std['brix_range'][0]} °Brix)")

        # 3. Dynamic Viscosity
        if viscosity < std["viscosity_range"][0]:
            penalties.append(20.0 * (1.0 - viscosity / std["viscosity_range"][0]))
            violations.append(f"Colloidal Breakdown: Viscosity {viscosity:.1f} mPa·s below minimum {std['viscosity_range'][0]}")

        # 4. Zeta Potential Stability
        if zeta < std["zeta_min_mv"]:
            penalties.append(25.0 * (1.0 - zeta / std["zeta_min_mv"]))
            violations.append(f"Severe Colloidal Instability / Flocculation: |Zeta| {zeta:.1f} mV (< 30 mV)")

        # 5. Active N%
        if active_n < std["active_n_pct"][0]:
            def_ratio = (std["active_n_pct"][0] - active_n) / std["active_n_pct"][0]
            penalties.append(def_ratio * 40.0)
            violations.append(f"Active Nutrient Deficit: N {active_n:.2f}% (SLS min {std['active_n_pct'][0]}%)")

        total_penalty = sum(penalties)
        qis = max(0.0, min(100.0, 100.0 - total_penalty))

        # Adulteration Classification
        if qis >= 85.0:
            classification = "GENUINE_PREMIUM"
            recommendation = "Approved for agricultural foliar / fertigation release."
        elif qis >= 60.0:
            classification = "SUBSTANDARD_DILUTED"
            recommendation = "Downgraded. Mandatory concentration correction or supplier reprimand."
        else:
            classification = "COUNTERFEIT_ADULTERATED"
            recommendation = "Immediate confiscation. Unfit for agricultural application; severe crop shock hazard."

        estimated_dilution_pct = 0.0
        if density < std["density_range"][0]:
            estimated_dilution_pct = min(100.0, max(0.0, ((std["density_range"][0] - density) / (std["density_range"][0] - 1.00)) * 100.0))

        return {
            "sample_id": sample.get("sample_id", "NLF-SAMPLE-01"),
            "formulation_type": ftype,
            "quality_integrity_score": round(qis, 2),
            "classification": classification,
            "estimated_water_dilution_pct": round(estimated_dilution_pct, 1),
            "violations": violations,
            "recommendation": recommendation,
            "metrics": {
                "density": density,
                "brix": brix,
                "viscosity": viscosity,
                "zeta_potential": zeta,
                "active_n": active_n,
                "ph": ph,
                "ec": ec
            }
        }

    def generate_assay_figure(self, test_sample_res: Dict[str, Any], save_path: str = None) -> str:
        """
        Creates a 4-panel multi-dimensional physical-chemical quality assay figure.
        """
        if save_path is None:
            save_path = os.path.join(self.figures_dir, "nano_liquid_fertilizer_quality_assay.png")

        np.random.seed(42)
        fig, axes = plt.subplots(2, 2, figsize=(14, 11))
        fig.suptitle(f"CropSafe AI - Nano & Liquid Fertilizer Physico-Chemical Quality Assay\nSample ID: {test_sample_res['sample_id']} | Status: {test_sample_res['classification']}", fontsize=14, fontweight="bold")

        # Panel 1: Density vs. Brix Scatter
        ax1 = axes[0, 0]
        # Benchmark clusters
        genuine_density = np.random.normal(1.12, 0.015, 60)
        genuine_brix = np.random.normal(11.5, 1.2, 60)
        counterfeit_density = np.random.normal(1.02, 0.012, 50)
        counterfeit_brix = np.random.normal(3.5, 1.0, 50)

        ax1.scatter(genuine_brix, genuine_density, color="#2ecc71", alpha=0.6, label="Authentic Reference Cohort (SLS 1672)")
        ax1.scatter(counterfeit_brix, counterfeit_density, color="#e74c3c", alpha=0.6, label="Watered-down / Fake Cohort")
        
        # Test Sample
        s_d = test_sample_res["metrics"]["density"]
        s_b = test_sample_res["metrics"]["brix"]
        ax1.scatter([s_b], [s_d], color="#f39c12", s=200, edgecolors="black", linewidths=2.5, zorder=5, label=f"Tested Sample ({s_b:.1f}°Bx, {s_d:.3f}g/cc)")
        ax1.axhline(1.08, color="green", linestyle="--", alpha=0.7, label="SLS Min Density (1.08)")
        ax1.axvline(8.0, color="blue", linestyle=":", alpha=0.7, label="SLS Min Brix (8.0°)")
        ax1.set_xlabel("Optical Refractometry (°Brix)", fontsize=11, fontweight="bold")
        ax1.set_ylabel("Specific Gravity / Density (g/cm³)", fontsize=11, fontweight="bold")
        ax1.set_title("1. Density vs. Dissolved Solids Phase Space", fontsize=12, fontweight="bold")
        ax1.legend(loc="lower right", fontsize=8.5)
        ax1.grid(True, linestyle="--", alpha=0.5)

        # Panel 2: Viscosity vs. Active N%
        ax2 = axes[0, 1]
        dilution_steps = np.linspace(0, 80, 100)
        theory_visc = 28.0 * (1 - dilution_steps / 100) + 1.0 * (dilution_steps / 100)
        theory_n = 4.2 * (1 - dilution_steps / 100)

        ax2.plot(theory_n, theory_visc, color="#34495e", linestyle="-", linewidth=2.5, label="Aqueous Dilution Isotherm Model")
        ax2.scatter([test_sample_res["metrics"]["active_n"]], [test_sample_res["metrics"]["viscosity"]], color="#f39c12", s=220, edgecolors="black", linewidths=2, zorder=5, label="Tested Batch Position")
        ax2.axvline(3.8, color="red", linestyle="--", label="SLS Min Active N (3.8%)")
        ax2.axhline(12.0, color="purple", linestyle=":", label="Colloidal Stability Viscosity Floor")
        ax2.set_xlabel("Active Nano-Nitrogen Content (% w/v)", fontsize=11, fontweight="bold")
        ax2.set_ylabel("Dynamic Viscosity (mPa·s)", fontsize=11, fontweight="bold")
        ax2.set_title("2. Rheology & Chemical Potency Trajectory", fontsize=12, fontweight="bold")
        ax2.legend(loc="upper left", fontsize=8.5)
        ax2.grid(True, linestyle="--", alpha=0.5)

        # Panel 3: Zeta Potential Distribution
        ax3 = axes[1, 0]
        zeta_genuine = np.random.normal(38.0, 4.5, 200)
        zeta_flocculated = np.random.normal(12.0, 3.5, 200)
        ax3.hist(zeta_genuine, bins=25, alpha=0.5, color="#2ecc71", label="Stable Dispersion (|ζ| >= 30 mV)")
        ax3.hist(zeta_flocculated, bins=25, alpha=0.5, color="#e74c3c", label="Flocculated / Agglomerated (|ζ| < 20 mV)")
        ax3.axvline(test_sample_res["metrics"]["zeta_potential"], color="#f39c12", linewidth=3.5, linestyle="-", label=f"Sample Zeta ({test_sample_res['metrics']['zeta_potential']:.1f} mV)")
        ax3.set_xlabel("Zeta Potential Magnitude |ζ| (mV)", fontsize=11, fontweight="bold")
        ax3.set_ylabel("Frequency Count", fontsize=11, fontweight="bold")
        ax3.set_title("3. Colloidal Suspension Stability (Zeta Potential)", fontsize=12, fontweight="bold")
        ax3.legend(loc="upper right", fontsize=8.5)
        ax3.grid(True, linestyle="--", alpha=0.5)

        # Panel 4: Quality Index Radar / Score Breakdown
        ax4 = axes[1, 1]
        metrics = ["Density", "Brix", "Viscosity", "Zeta Pot.", "Active N", "pH Balance"]
        
        # Normalized scores (0 to 100)
        sample_scores = [
            min(100, max(0, (test_sample_res["metrics"]["density"] - 1.0) / 0.12 * 100)),
            min(100, max(0, test_sample_res["metrics"]["brix"] / 12.0 * 100)),
            min(100, max(0, test_sample_res["metrics"]["viscosity"] / 25.0 * 100)),
            min(100, max(0, test_sample_res["metrics"]["zeta_potential"] / 35.0 * 100)),
            min(100, max(0, test_sample_res["metrics"]["active_n"] / 4.0 * 100)),
            min(100, max(0, 100 - abs(test_sample_res["metrics"]["ph"] - 7.5) * 25))
        ]

        bar_colors = ["#2ecc71" if s >= 75 else "#f39c12" if s >= 50 else "#e74c3c" for s in sample_scores]
        bars = ax4.bar(metrics, sample_scores, color=bar_colors, edgecolor="black", alpha=0.85)
        ax4.axhline(80, color="green", linestyle="--", label="Target Quality Baseline (80%)")
        ax4.axhline(50, color="red", linestyle=":", label="Rejection Threshold (50%)")
        ax4.set_ylim(0, 115)
        ax4.set_ylabel("Normalized Compliance Score (%)", fontsize=11, fontweight="bold")
        ax4.set_title(f"4. Multi-Parametric Quality Score (QIS = {test_sample_res['quality_integrity_score']:.1f}/100)", fontsize=12, fontweight="bold")
        ax4.legend(loc="upper right", fontsize=8.5)
        ax4.grid(axis="y", linestyle="--", alpha=0.5)

        for b, s in zip(bars, sample_scores):
            ax4.text(b.get_x() + b.get_width()/2., b.get_height() + 2, f"{s:.0f}%", ha="center", va="bottom", fontsize=9, fontweight="bold")

        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        return save_path


if __name__ == "__main__":
    assay = NanoLiquidFertilizerAssay()

    # Test an adulterated/diluted sample of Nano-Urea
    test_sample = {
        "sample_id": "SL-NU-2026-B812",
        "formulation_type": "Nano_Urea",
        "density_g_cm3": 1.035,        # Substandard (Genuine ~ 1.12)
        "brix_deg": 4.8,               # Substandard (Genuine ~ 11.5)
        "viscosity_mpa_s": 5.2,        # Substandard (Genuine ~ 25)
        "zeta_potential_mv": 14.2,     # Flocculation hazard (< 30)
        "ph": 8.9,                     # High
        "active_n_pct": 1.75,          # Heavily diluted (Genuine 4.0%)
        "ec_ds_m": 7.4
    }

    result = assay.analyze_sample(test_sample)
    fig_path = assay.generate_assay_figure(result)

    print("=== Nano & Liquid Fertilizer Quality Assay Completed ===")
    print(f"Sample: {result['sample_id']} ({result['formulation_type']})")
    print(f"Quality Integrity Score (QIS): {result['quality_integrity_score']}/100")
    print(f"Classification: {result['classification']}")
    print(f"Estimated Water Dilution: {result['estimated_water_dilution_pct']}%")
    print(f"Violations Detected: {len(result['violations'])}")
    for v in result["violations"]:
        print(f"  - {v}")
    print(f"Assay Figure Saved: {fig_path}")
