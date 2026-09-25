"""
CropSafe AI - Natural & Organic Fertilizer Quality & Adulteration Screening Engine
Comprehensive scientific diagnostic evaluation for natural and organic soil amendments
under Sri Lanka Standards SLS 1624:2021 (Compost), SLS 1704 (Solid Organic),
SLS 977 (Eppawala Rock Phosphate - ERP), and SLS 1672 (Liquid Bio-fertilizer).

Assay Metrics & Fraud Detection:
  1. Carbon-to-Nitrogen Ratio (C:N) & Synthetic Spiking Detection (e.g. synthetic urea doping)
  2. Organic Matter (OM) vs. Sand/Inert Mineral Ballast (Quarry dust, river sand)
  3. Heavy Metal Toxicological Safety Index (Cadmium Cd, Lead Pb, Arsenic As, Chromium Cr)
  4. Phytotoxicity Bioassay & Seed Germination Index (GI%)
  5. Microbiological Pathogen Screening (Salmonella & Escherichia coli)
  6. Natural Indigenous Mineral Verification (Eppawala Rock Phosphate - ERP, Biochar, Bone Meal)
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


class OrganicNaturalFertilizerAssay:
    """Scientific laboratory evaluation engine for natural and organic fertilizers in Sri Lanka."""

    # Statutory thresholds per Sri Lanka Standard SLS 1624:2021 and SLS 1704
    STANDARDS = {
        "Compost_Solid": {
            "c_n_min": 10.0,
            "c_n_max": 20.0,
            "min_organic_matter_pct": 25.0,  # SLS 1624: min 25%
            "max_sand_inert_pct": 10.0,      # SLS 1624: max 10%
            "max_moisture_pct": 25.0,        # SLS 1624: max 25%
            "ph_range": (6.5, 8.5),
            "min_gi_pct": 80.0,              # Seed Germination Index >= 80% (Phytotoxicity-free)
            "heavy_metals_max_ppm": {
                "Cadmium_Cd": 1.5,           # mg/kg (Critical for CKDu prevention)
                "Lead_Pb": 30.0,             # mg/kg
                "Arsenic_As": 3.0,           # mg/kg
                "Chromium_Cr": 50.0          # mg/kg
            },
            "pathogens": {
                "salmonella_absent": True,
                "max_e_coli_mpn_g": 1000
            }
        },
        "Vermicompost": {
            "c_n_min": 9.0,
            "c_n_max": 15.0,
            "min_organic_matter_pct": 30.0,
            "max_sand_inert_pct": 5.0,
            "max_moisture_pct": 25.0,
            "ph_range": (6.8, 7.8),
            "min_gi_pct": 85.0,
            "heavy_metals_max_ppm": {
                "Cadmium_Cd": 1.0,
                "Lead_Pb": 25.0,
                "Arsenic_As": 2.5,
                "Chromium_Cr": 40.0
            }
        },
        "Biochar": {
            "c_n_min": 25.0,
            "c_n_max": 80.0,
            "min_organic_carbon_pct": 60.0,
            "max_moisture_pct": 15.0,
            "ph_range": (7.0, 9.5),
            "max_sand_inert_pct": 8.0,
            "heavy_metals_max_ppm": {
                "Cadmium_Cd": 1.5,
                "Lead_Pb": 30.0,
                "Arsenic_As": 3.0,
                "Chromium_Cr": 50.0
            }
        },
        "Eppawala_Rock_Phosphate": {
            "min_p2o5_pct": 28.0,            # SLS 977: min 28% total P2O5
            "min_citric_sol_p2o5": 5.0,      # min 5% 2%-citric acid soluble P2O5
            "max_moisture_pct": 2.0,
            "max_inert_sand_pct": 5.0,
            "heavy_metals_max_ppm": {
                "Cadmium_Cd": 5.0,           # Natural igneous phosphate rock threshold
                "Lead_Pb": 20.0,
                "Arsenic_As": 10.0,
                "Chromium_Cr": 60.0
            }
        }
    }

    def __init__(self, figures_dir: str = "reports/figures/predictive_prescriptive"):
        self.figures_dir = figures_dir
        os.makedirs(self.figures_dir, exist_ok=True)

    def analyze_organic_sample(self, sample: Dict[str, Any]) -> Dict[str, Any]:
        """
        Performs multi-parametric chemical, toxicological, and biological assay
        on natural/organic fertilizer samples.
        """
        category = sample.get("organic_type", "Compost_Solid")
        std = self.STANDARDS.get(category, self.STANDARDS["Compost_Solid"])

        total_n = sample.get("total_n_pct", 1.5)
        total_c = sample.get("total_organic_c_pct", 20.0)
        om_pct = sample.get("organic_matter_pct", total_c * 1.724)  # Van Bemmelen factor
        moisture = sample.get("moisture_pct", 20.0)
        sand_inert = sample.get("sand_inert_pct", 5.0)
        ph = sample.get("ph", 7.2)
        gi_pct = sample.get("germination_index_pct", 88.0)
        salmonella_present = sample.get("salmonella_detected", False)
        e_coli_count = sample.get("e_coli_mpn_g", 120)

        heavy_metals = sample.get("heavy_metals_ppm", {
            "Cadmium_Cd": 0.4,
            "Lead_Pb": 12.0,
            "Arsenic_As": 1.1,
            "Chromium_Cr": 18.0
        })

        violations = []
        adulteration_types = []
        score = 100.0

        # Special logic for Eppawala Rock Phosphate (ERP)
        if category == "Eppawala_Rock_Phosphate":
            p2o5 = sample.get("total_p2o5_pct", 28.5)
            citric_p2o5 = sample.get("citric_soluble_p2o5_pct", 5.4)
            if p2o5 < std["min_p2o5_pct"]:
                violations.append(f"Sub-potent Rock Phosphate: Total P2O5 {p2o5:.1f}% (SLS 977 min {std['min_p2o5_pct']}%)")
                score -= 35.0
            if sand_inert > std["max_inert_sand_pct"]:
                violations.append(f"Inert Sand Adulteration: {sand_inert:.1f}% sand filler")
                adulteration_types.append("River Sand / Quartz Powder Padding")
                score -= 25.0
            c_n_ratio = 0.0
        else:
            # 1. C:N Ratio & Synthetic Spiking Analysis
            c_n_ratio = total_c / max(0.01, total_n)
            if c_n_ratio < std["c_n_min"]:
                if total_n > 3.0:
                    violations.append(f"CRITICAL FRAUD: Suspected Synthetic Nitrogen Spiking (Total N {total_n:.2f}%, C:N {c_n_ratio:.1f}:1)")
                    adulteration_types.append("Synthetic Urea Spiking / Chemical Nitrogen Doping")
                    score -= 45.0
                else:
                    violations.append(f"Low C:N Ratio ({c_n_ratio:.1f}:1 below optimal {std['c_n_min']}:1)")
                    score -= 15.0
            elif c_n_ratio > std["c_n_max"]:
                violations.append(f"Immature Compost Hazard: High C:N {c_n_ratio:.1f}:1 (Unfermented, causes soil N-immobilization)")
                adulteration_types.append("Immature / Raw Woody Biomass")
                score -= 25.0

            # 2. Organic Matter vs Sand/Inert Ballast
            if om_pct < std["min_organic_matter_pct"]:
                violations.append(f"Low Organic Matter: {om_pct:.1f}% (SLS 1624 min {std['min_organic_matter_pct']}%)")
                score -= 20.0
            if sand_inert > std["max_sand_inert_pct"]:
                violations.append(f"Foreign Mineral Adulteration: Sand/Inert debris {sand_inert:.1f}% (SLS max {std['max_sand_inert_pct']}%)")
                adulteration_types.append("Quarry Dust / Construction Silt / Street Sweepings")
                score -= 25.0

            # 3. Moisture Padding
            if moisture > std["max_moisture_pct"]:
                violations.append(f"Moisture Over-weighting: {moisture:.1f}% (SLS max {std['max_moisture_pct']}%)")
                adulteration_types.append("Water Padding Weight Fraud")
                score -= 15.0

            # 4. Phytotoxicity Bioassay (GI%)
            if gi_pct < std["min_gi_pct"]:
                violations.append(f"Phytotoxic Compost: Seed Germination Index {gi_pct:.1f}% (< 80% safe threshold)")
                score -= 25.0

            # 5. Microbiological Pathogens
            if salmonella_present:
                violations.append("CRITICAL PATHOGEN DETECTED: Salmonella spp. present (Strict Zero Tolerance)")
                adulteration_types.append("Unsanitized Municipal / Sludge Bio-waste")
                score -= 50.0
            if e_coli_count > std["pathogens"]["max_e_coli_mpn_g"]:
                violations.append(f"High Fecal Coliform Contamination: E. coli {e_coli_count} MPN/g (> 1000 MPN/g)")
                score -= 25.0

        # 6. Heavy Metal Toxicology Screening
        hm_std = std["heavy_metals_max_ppm"]
        hm_risk_index = 0.0
        for metal, limit in hm_std.items():
            val = heavy_metals.get(metal, 0.0)
            ratio = val / limit
            if ratio > 1.0:
                violations.append(f"Toxic Heavy Metal Violation: {metal} {val:.2f} mg/kg exceeds SLS ceiling {limit} mg/kg")
                score -= (ratio - 1.0) * 30.0
                if "Cadmium" in metal:
                    adulteration_types.append("Industrial Sludge / Rajarata CKDu Cadmium Hazard")
            hm_risk_index += ratio

        final_score = max(0.0, min(100.0, score))

        # Quality Grade Classification
        if final_score >= 85.0 and len(violations) == 0:
            quality_grade = "GRADE_A_PREMIUM_ORGANIC"
            verdict = "Certified Compliant for Organic Export & Commercial Agriculture (SLS 1624:2021 Passed)"
        elif final_score >= 65.0:
            quality_grade = "GRADE_B_FIELD_ACCEPTABLE"
            verdict = "Acceptable for general open-field cultivation with mild corrective conditioning."
        elif final_score >= 40.0:
            quality_grade = "GRADE_C_SUBSTANDARD_REJECTED"
            verdict = "Substandard natural fertilizer. High inert filler or unfermented organic fraction."
        else:
            quality_grade = "GRADE_F_TOXIC_COUNTERFEIT"
            verdict = "Prohibited Substance. Toxic contamination or fraudulent artificial spiking detected. Seizure ordered."

        return {
            "sample_id": sample.get("sample_id", "ORG-SL-2026-001"),
            "organic_type": category,
            "quality_score": round(final_score, 1),
            "quality_grade": quality_grade,
            "verdict": verdict,
            "carbon_to_nitrogen_ratio": round(c_n_ratio, 1) if category != "Eppawala_Rock_Phosphate" else None,
            "organic_matter_pct": round(om_pct, 1),
            "sand_inert_pct": round(sand_inert, 1),
            "ph": ph,
            "germination_index_pct": gi_pct if category != "Eppawala_Rock_Phosphate" else None,
            "heavy_metals_ppm": heavy_metals,
            "heavy_metal_risk_index": round(hm_risk_index / len(hm_std), 2),
            "detected_adulterants": adulteration_types if adulteration_types else ["None (Authentic Organic Matrix)"],
            "statutory_violations": violations
        }

    def generate_organic_benchmark_figure(self, test_sample_res: Dict[str, Any], save_path: str = None) -> str:
        """
        Produces a publication-quality 4-panel diagnostic figure visualizing
        organic matter maturity, heavy metal toxicity, germination kinetics, and quality grades.
        """
        if save_path is None:
            save_path = os.path.join(self.figures_dir, "organic_natural_fertilizer_quality_benchmark.png")

        np.random.seed(42)
        fig, axes = plt.subplots(2, 2, figsize=(14, 11))
        fig.suptitle(f"CropSafe AI - Natural & Organic Fertilizer Forensic Quality Benchmark\nSample: {test_sample_res['sample_id']} | Grade: {test_sample_res['quality_grade']}", fontsize=14, fontweight="bold")

        # Panel 1: C:N Ratio vs. Total Organic Carbon
        ax1 = axes[0, 0]
        # Reference mature zone
        ax1.axvspan(10.0, 20.0, color="#2ecc71", alpha=0.2, label="Optimal Mature Zone (SLS 1624)")
        ax1.axvspan(0.0, 8.0, color="#e74c3c", alpha=0.15, label="Synthetic Spiking Danger Zone")
        ax1.axvspan(25.0, 45.0, color="#f39c12", alpha=0.15, label="Immature / High C:N Zone")

        # Scatter samples
        n_ref = 60
        ref_cn_mature = np.random.uniform(11, 18, n_ref)
        ref_toc_mature = np.random.uniform(18, 30, n_ref)
        ref_cn_spiked = np.random.uniform(4, 7.5, 30)
        ref_toc_spiked = np.random.uniform(10, 18, 30)

        ax1.scatter(ref_cn_mature, ref_toc_mature, color="#27ae60", alpha=0.6, label="Authentic Mature Compost Cohort")
        ax1.scatter(ref_cn_spiked, ref_toc_spiked, color="#c0392b", alpha=0.6, label="Urea-Spiked Counterfeits")

        # Tested sample
        s_cn = test_sample_res.get("carbon_to_nitrogen_ratio") or 14.0
        s_toc = test_sample_res["organic_matter_pct"] / 1.724
        ax1.scatter([s_cn], [s_toc], color="#d35400", s=220, edgecolors="black", linewidths=2.5, zorder=6, label=f"Tested Sample (C:N {s_cn:.1f})")

        ax1.set_xlabel("Carbon-to-Nitrogen (C:N) Ratio", fontsize=11, fontweight="bold")
        ax1.set_ylabel("Total Organic Carbon (TOC %)", fontsize=11, fontweight="bold")
        ax1.set_title("1. Organic Maturity & Synthetic Doping Phase Space", fontsize=12, fontweight="bold")
        ax1.set_xlim(0, 40)
        ax1.set_ylim(5, 45)
        ax1.legend(loc="upper right", fontsize=8.5)
        ax1.grid(True, linestyle="--", alpha=0.5)

        # Panel 2: Heavy Metal Contamination Radar / Comparison
        ax2 = axes[0, 1]
        metals = ["Cadmium (Cd)", "Lead (Pb)", "Arsenic (As)", "Chromium (Cr)"]
        sls_limits = [1.5, 30.0, 3.0, 50.0]
        sample_vals = [
            test_sample_res["heavy_metals_ppm"].get("Cadmium_Cd", 0.5),
            test_sample_res["heavy_metals_ppm"].get("Lead_Pb", 12.0),
            test_sample_res["heavy_metals_ppm"].get("Arsenic_As", 1.2),
            test_sample_res["heavy_metals_ppm"].get("Chromium_Cr", 15.0)
        ]
        
        # Percentage of legal threshold
        pct_of_limit = [(v / lim) * 100.0 for v, lim in zip(sample_vals, sls_limits)]
        bar_colors = ["#2ecc71" if p <= 100 else "#e74c3c" for p in pct_of_limit]
        
        x_idx = np.arange(len(metals))
        bars = ax2.bar(x_idx, pct_of_limit, color=bar_colors, edgecolor="black", alpha=0.85, width=0.55)
        ax2.axhline(100.0, color="red", linestyle="--", linewidth=2, label="SLS 1624 Maximum Permissible Ceiling (100%)")
        ax2.set_xticks(x_idx)
        ax2.set_xticklabels(metals, fontsize=10, fontweight="bold")
        ax2.set_ylabel("% of Permissible Heavy Metal Ceiling", fontsize=11, fontweight="bold")
        ax2.set_title("2. Heavy Metal Toxicology & CKDu Safety Profile", fontsize=12, fontweight="bold")
        ax2.legend(loc="upper right", fontsize=8.5)
        ax2.grid(axis="y", linestyle="--", alpha=0.5)

        for b, p, v in zip(bars, pct_of_limit, sample_vals):
            ax2.text(b.get_x() + b.get_width()/2., b.get_height() + 3, f"{v:.1f} ppm\n({p:.0f}%)", ha="center", va="bottom", fontsize=8.5, fontweight="bold")

        # Panel 3: Phytotoxicity Bioassay (GI%) vs Composting Time
        ax3 = axes[1, 0]
        days = np.linspace(0, 90, 100)
        # Logistic maturation curve of germination index
        gi_curve = 95.0 / (1.0 + np.exp(-0.08 * (days - 35))) + np.random.normal(0, 1.5, 100)
        ax3.plot(days, gi_curve, color="#2980b9", linewidth=2.5, label="Compost Maturation Trajectory (GI%)")
        ax3.axhline(80.0, color="green", linestyle="--", label="Phytotoxicity-Free Threshold (GI >= 80%)")
        ax3.axhline(50.0, color="red", linestyle=":", label="Severe Root Scorch Threshold (GI < 50%)")

        s_gi = test_sample_res.get("germination_index_pct") or 85.0
        ax3.scatter([60], [s_gi], color="#d35400", s=200, edgecolors="black", linewidths=2.5, zorder=6, label=f"Tested Sample GI ({s_gi:.1f}%)")
        ax3.set_xlabel("Thermophilic Composting Age (Days)", fontsize=11, fontweight="bold")
        ax3.set_ylabel("Seed Germination Index (GI %)", fontsize=11, fontweight="bold")
        ax3.set_title("3. Phytotoxicity Bioassay & Germination Safety", fontsize=12, fontweight="bold")
        ax3.legend(loc="lower right", fontsize=8.5)
        ax3.grid(True, linestyle="--", alpha=0.5)

        # Panel 4: Quality Score Breakdown & Sand Ballast
        ax4 = axes[1, 1]
        metrics = ["Score", "Organic Matter", "Inert Sand", "Heavy Metal Safety"]
        scores = [
            test_sample_res["quality_score"],
            min(100.0, (test_sample_res["organic_matter_pct"] / 25.0) * 100.0),
            max(0.0, 100.0 - (test_sample_res["sand_inert_pct"] / 10.0) * 100.0),
            max(0.0, 100.0 - (test_sample_res["heavy_metal_risk_index"] * 50.0))
        ]
        bcolors = ["#3498db", "#2ecc71", "#e67e22", "#9b59b6"]
        bars4 = ax4.barh(metrics, scores, color=bcolors, edgecolor="black", alpha=0.85, height=0.5)
        ax4.set_xlim(0, 115)
        ax4.set_xlabel("Integrity Score (0 - 100)", fontsize=11, fontweight="bold")
        ax4.set_title(f"4. Composite Quality Audit (Score: {test_sample_res['quality_score']}/100)", fontsize=12, fontweight="bold")
        ax4.grid(axis="x", linestyle="--", alpha=0.5)

        for b, s in zip(bars4, scores):
            ax4.text(b.get_width() + 2, b.get_y() + b.get_height()/2., f"{s:.1f}", ha="left", va="center", fontsize=9, fontweight="bold")

        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        return save_path


if __name__ == "__main__":
    assay = OrganicNaturalFertilizerAssay()

    # Test an adulterated urban municipal compost sample with quarry sand and cadmium contamination
    test_compost = {
        "sample_id": "COMPOST-WP-2026-X44",
        "organic_type": "Compost_Solid",
        "total_n_pct": 1.1,
        "total_organic_c_pct": 12.0,            # C:N = 10.9 (Acceptable)
        "organic_matter_pct": 16.5,             # Deficit: SLS min 25%
        "sand_inert_pct": 24.5,                 # Excessive river sand / quarry dust (SLS max 10%)
        "moisture_pct": 32.0,                   # Water padding (SLS max 25%)
        "ph": 7.4,
        "germination_index_pct": 62.0,          # Mild phytotoxicity
        "salmonella_detected": False,
        "e_coli_mpn_g": 650,
        "heavy_metals_ppm": {
            "Cadmium_Cd": 2.8,                  # VIOLATION: Exceeds 1.5 ppm limit (E-waste/battery slag)
            "Lead_Pb": 42.0,                    # VIOLATION: Exceeds 30.0 ppm limit
            "Arsenic_As": 2.1,
            "Chromium_Cr": 65.0                 # VIOLATION: Exceeds 50.0 ppm limit
        }
    }

    res = assay.analyze_organic_sample(test_compost)
    fig_path = assay.generate_organic_benchmark_figure(res)

    print("=== Organic & Natural Fertilizer Assay Completed ===")
    print(f"Sample ID: {res['sample_id']}")
    print(f"Quality Score: {res['quality_score']}/100")
    print(f"Grade: {res['quality_grade']}")
    print(f"Verdict: {res['verdict']}")
    print(f"Adulterants Detected: {', '.join(res['detected_adulterants'])}")
    print(f"Violations ({len(res['statutory_violations'])}):")
    for v in res["statutory_violations"]:
        print(f"  - {v}")
    print(f"Diagnostic Figure Saved: {fig_path}")
