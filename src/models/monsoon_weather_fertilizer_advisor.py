"""
CropSafe AI - Monsoon & Weather-Adaptive Fertilizer Timing Advisor
Optimizes agricultural fertilizer application windows against 5-day meteorological forecasts,
preventing severe nutrient runoff, leaching, and water-body eutrophication during monsoons in Sri Lanka.
"""

import os
import sys
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from typing import Dict, Any, List
from datetime import datetime, timezone

# Windows encoding safety
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


class MonsoonWeatherFertilizerAdvisor:
    """Predicts optimal fertilization timing windows based on rainfall, soil moisture, and monsoon patterns."""

    def __init__(self, figures_dir: str = "reports/figures/predictive_prescriptive"):
        self.figures_dir = figures_dir
        os.makedirs(self.figures_dir, exist_ok=True)

    def evaluate_application_window(self, district: str, forecast_5day: List[Dict[str, Any]], fertilizer_type: str = "Urea") -> Dict[str, Any]:
        """
        Evaluates 5-day weather telemetry, calculates leaching risk, and recommends optimal application days.
        """
        daily_evals = []
        best_day = None
        min_risk = 999.0

        for day in forecast_5day:
            day_name = day.get("day", "Day 1")
            rain_mm = day.get("rainfall_mm", 0.0)
            rain_prob = day.get("rain_prob_pct", 0.0)
            soil_saturation = day.get("soil_saturation_pct", 50.0)
            temp_c = day.get("temp_c", 30.0)

            # Leaching & Runoff Risk Calculation
            # Heavy rain + saturated soil = catastrophic runoff loss
            rain_factor = min(100.0, (rain_mm / 35.0) * 100.0)
            sat_factor = max(0.0, (soil_saturation - 60.0) / 40.0) * 100.0 if soil_saturation > 60 else 0.0
            runoff_risk = (rain_factor * 0.7) + (sat_factor * 0.3)

            # Volatilization Risk (Dry soil + high temperature)
            volatilization_risk = 0.0
            if fertilizer_type == "Urea" and soil_saturation < 35.0 and temp_c > 32.0:
                volatilization_risk = (temp_c - 30.0) * 15.0

            composite_risk = min(100.0, max(runoff_risk, volatilization_risk))

            if composite_risk >= 70.0:
                tier = "HALT_DANGER"
                rec_en = f"DO NOT APPLY! {rain_mm:.1f}mm heavy rain expected. Runoff loss ~{composite_risk:.0f}%."
                rec_si = f"පොහොර යෙදීමෙන් වළකින්න! මි.මී. {rain_mm:.1f}ක තද වැස්සක් නිසා පොහොර සේදීයාමේ අවදානම {composite_risk:.0f}%කි."
            elif composite_risk >= 40.0:
                tier = "CAUTION_SUBOPTIMAL"
                rec_en = "Moderate risk. Delay application until soil drains or rain passes."
                rec_si = "මධ්‍යම අවදානමක් ඇත. වැස්ස අඩුවන තුරු හෝ පස වියළෙන තුරු රැඳෙන්න."
            else:
                tier = "OPTIMAL_GREEN_WINDOW"
                rec_en = "EXCELLENT WINDOW! Moist soil with low rainfall ensures maximum plant uptake."
                rec_si = "පොහොර යෙදීමට සුදුසුම වේලාව! පෝෂක උපරිමයෙන් ශාකයට උරාගැනේ."

            daily_evals.append({
                "day": day_name,
                "rainfall_mm": rain_mm,
                "rain_prob_pct": rain_prob,
                "soil_saturation_pct": soil_saturation,
                "composite_risk_pct": round(composite_risk, 1),
                "status_tier": tier,
                "recommendation_en": rec_en,
                "recommendation_si": rec_si
            })

            if composite_risk < min_risk:
                min_risk = composite_risk
                best_day = day_name

        return {
            "district": district,
            "fertilizer_type": fertilizer_type,
            "forecast_evaluation": daily_evals,
            "optimal_application_day": best_day,
            "minimum_nutrient_loss_risk_pct": round(min_risk, 1),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    def generate_weather_advisory(self, district_name: str = "Anuradhapura", target_crop: str = "Paddy") -> Dict[str, Any]:
        """Generates 5-day weather leaching schedule and fertilizer advisory for any Sri Lankan district."""
        wet_zone_districts = ["Galle", "Matara", "Kalutara", "Ratnapura", "Kegalle", "Colombo", "Gampaha", "Kandy", "Nuwara Eliya"]
        is_wet = district_name in wet_zone_districts

        days_labels = ["අද (Today)", "හෙට (Tomorrow)", "අනිද්දා (Day 3)", "4 වන දිනය (Day 4)", "5 වන දිනය (Day 5)"]
        if is_wet:
            rains = [38.5, 26.0, 14.0, 7.5, 1.5]
            sats = [85, 80, 70, 58, 48]
        else:
            rains = [42.0, 24.5, 4.0, 1.0, 0.0]
            sats = [78, 72, 52, 44, 38]

        forecast_5day = [
            {
                "day": days_labels[i],
                "rainfall_mm": rains[i],
                "rain_prob_pct": min(95, int(rains[i] * 2 + 10)),
                "soil_saturation_pct": sats[i],
                "temp_c": round(29.0 + i * 0.6, 1)
            }
            for i in range(5)
        ]

        res = self.evaluate_application_window(district=district_name, forecast_5day=forecast_5day, fertilizer_type="Urea")
        res["target_crop"] = target_crop
        return res

    def generate_weather_schedule_figure(self, schedule_res: Dict[str, Any], save_path: str = None) -> str:
        """Visualizes 5-day rainfall vs leaching risk curves."""
        if save_path is None:
            save_path = os.path.join(self.figures_dir, "monsoon_weather_fertilizer_schedule.png")

        fig, ax1 = plt.subplots(figsize=(11, 6))
        fig.suptitle(f"CropSafe AI - 5-Day Weather & Monsoon Fertilizer Advisory\nDistrict: {schedule_res['district']} | Fertilizer: {schedule_res['fertilizer_type']} | Best Window: {schedule_res['optimal_application_day']}", fontsize=12, fontweight="bold")

        days = [d["day"] for d in schedule_res["forecast_evaluation"]]
        rain = [d["rainfall_mm"] for d in schedule_res["forecast_evaluation"]]
        risk = [d["composite_risk_pct"] for d in schedule_res["forecast_evaluation"]]

        x = np.arange(len(days))

        # Rain bars on left axis
        bars = ax1.bar(x, rain, width=0.45, color="#3498db", alpha=0.75, edgecolor="black", label="Expected Rainfall (mm)")
        ax1.set_ylabel("Rainfall (mm)", color="#2980b9", fontsize=11, fontweight="bold")
        ax1.set_xticks(x)
        ax1.set_xticklabels(days, fontsize=10, fontweight="bold")
        ax1.set_ylim(0, max(rain) * 1.4 + 5)
        ax1.grid(axis="y", linestyle="--", alpha=0.3)

        # Risk line on right axis
        ax2 = ax1.twinx()
        line = ax2.plot(x, risk, color="#e74c3c", marker="o", linewidth=3, markersize=8, label="Nutrient Leaching / Loss Risk (%)")
        ax2.axhline(70, color="red", linestyle="--", alpha=0.7, label="Severe Runoff Hazard (> 70%)")
        ax2.axhline(40, color="green", linestyle=":", alpha=0.7, label="Safe Application Ceiling (< 40%)")
        ax2.set_ylabel("Nutrient Loss Risk (%)", color="#c0392b", fontsize=11, fontweight="bold")
        ax2.set_ylim(0, 110)

        # Annotate optimal day
        opt_idx = days.index(schedule_res["optimal_application_day"])
        ax2.annotate("OPTIMAL APPLICATION DAY", xy=(opt_idx, risk[opt_idx]), xytext=(opt_idx, risk[opt_idx] + 20),
                     arrowprops=dict(facecolor="#27ae60", shrink=0.08, width=2),
                     ha="center", fontsize=9.5, fontweight="bold", color="#27ae60",
                     bbox=dict(boxstyle="round,pad=0.3", fc="#e8f8f5", ec="#27ae60", lw=1.5))

        for b, r in zip(bars, rain):
            ax1.text(b.get_x() + b.get_width()/2., b.get_height() + 0.8, f"{r:.1f} mm", ha="center", va="bottom", fontsize=9, fontweight="bold")

        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        return save_path


if __name__ == "__main__":
    advisor = MonsoonWeatherFertilizerAdvisor()

    # Scenario: Northeast monsoon forecast for Polonnaruwa district
    polonnaruwa_forecast = [
        {"day": "Mon (Day 1)", "rainfall_mm": 42.0, "rain_prob_pct": 90, "soil_saturation_pct": 85, "temp_c": 28.0},
        {"day": "Tue (Day 2)", "rainfall_mm": 28.5, "rain_prob_pct": 75, "soil_saturation_pct": 90, "temp_c": 29.0},
        {"day": "Wed (Day 3)", "rainfall_mm": 6.0,  "rain_prob_pct": 30, "soil_saturation_pct": 65, "temp_c": 31.0},
        {"day": "Thu (Day 4)", "rainfall_mm": 1.2,  "rain_prob_pct": 15, "soil_saturation_pct": 50, "temp_c": 31.5},
        {"day": "Fri (Day 5)", "rainfall_mm": 0.0,  "rain_prob_pct": 10, "soil_saturation_pct": 42, "temp_c": 32.0}
    ]

    res = advisor.evaluate_application_window("Polonnaruwa", polonnaruwa_forecast, fertilizer_type="Urea")
    fig_path = advisor.generate_weather_schedule_figure(res)

    print("=== Monsoon Weather Fertilizer Advisor Evaluated ===")
    print(f"District: {res['district']}")
    print(f"Optimal Application Day: {res['optimal_application_day']}")
    print(f"Minimum Risk: {res['minimum_nutrient_loss_risk_pct']}%")
    for d in res["forecast_evaluation"]:
        print(f"  [{d['day']}] Rain: {d['rainfall_mm']}mm -> Risk: {d['composite_risk_pct']}% ({d['status_tier']})")
    print(f"Schedule Figure Saved: {fig_path}")
