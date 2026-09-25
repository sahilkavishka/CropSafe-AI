"""
CropSafe AI - Provincial Fertilizer Stockout & Scarcity Early Warning Engine
Monitors buffer stock levels across Sri Lanka's 25 districts and 560+ Agrarian Service Centers (ASCs),
calculating daily consumption burn rates, forecasting days of stock cover (DCR), and triggering inter-district rebalancing.
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


class StockoutEarlyWarningEngine:
    """Predicts regional fertilizer shortages and formulates preventative logistics replenishment directives."""

    def __init__(self, figures_dir: str = "reports/figures/predictive_prescriptive"):
        self.figures_dir = figures_dir
        os.makedirs(self.figures_dir, exist_ok=True)

    def evaluate_regional_stock_cover(self, inventory_records: List[Dict[str, Any]], season: str = "Maha") -> Dict[str, Any]:
        """
        Calculates burn rates and Days of Stock Cover (DCR) for each district,
        classifying risk tiers and prescribing emergency freight transfers.
        """
        district_assessments = []
        critical_districts = []
        surplus_districts = []

        # Seasonal burn rate multiplier (Maha cultivation requires higher peak urea demand)
        season_multiplier = 1.35 if season.lower() == "maha" else 1.0

        for rec in inventory_records:
            district = rec.get("district", "Unknown")
            stock_mt = rec.get("current_urea_stock_mt", 0.0)
            cultivated_ha = rec.get("paddy_cultivation_ha", 10000.0)
            stage = rec.get("cropping_stage", "Vegetative_Top_Dressing")

            # Daily demand estimation grounded in 135 kg/ha seasonal requirement spread across critical split stages
            stage_intensity = 1.6 if "Top_Dressing" in stage else 0.7
            daily_burn_rate_mt = max(0.5, (cultivated_ha * 0.135 / 80.0) * stage_intensity * season_multiplier)

            days_cover = round(stock_mt / daily_burn_rate_mt, 1)

            if days_cover < 7.0:
                tier = "CRITICAL_RED_STOCKOUT"
                urgency = "IMMINENT_DEPLETION_RISK"
                critical_districts.append({"district": district, "deficit_mt": round((14.0 - days_cover) * daily_burn_rate_mt, 1), "dcr": days_cover})
            elif days_cover < 14.0:
                tier = "WARNING_ORANGE_LOW_STOCK"
                urgency = "REPLENISHMENT_REQUIRED"
            elif days_cover > 20.0:
                tier = "SURPLUS_GREEN"
                urgency = "SAFE_RESERVE"
                surplus_districts.append({"district": district, "surplus_mt": round((days_cover - 15.0) * daily_burn_rate_mt, 1), "dcr": days_cover})
            else:
                tier = "ADEQUATE_GREEN"
                urgency = "BALANCED"

            district_assessments.append({
                "district": district,
                "current_stock_mt": stock_mt,
                "daily_burn_rate_mt": round(daily_burn_rate_mt, 1),
                "days_of_stock_cover": days_cover,
                "status_tier": tier,
                "urgency_level": urgency
            })

        # Formulate Inter-District Logistics Rebalancing Orders
        rebalance_orders = []
        for crit in critical_districts:
            needed = crit["deficit_mt"]
            for surp in surplus_districts:
                if surp["surplus_mt"] > 0 and needed > 0:
                    transfer_amt = min(needed, surp["surplus_mt"])
                    rebalance_orders.append({
                        "source_surplus_district": surp["district"],
                        "target_deficit_district": crit["district"],
                        "transfer_volume_mt": round(transfer_amt, 1),
                        "urgency": "IMMEDIATE_DISPATCH"
                    })
                    needed -= transfer_amt
                    surp["surplus_mt"] -= transfer_amt

        return {
            "season": season,
            "total_districts_audited": len(inventory_records),
            "critical_stockout_districts": len(critical_districts),
            "district_assessments": district_assessments,
            "prescribed_rebalance_orders": rebalance_orders,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

    def generate_stockout_figure(self, assessment_res: Dict[str, Any], save_path: str = None) -> str:
        """Produces a horizontal bar chart of Days of Stock Cover (DCR) across districts."""
        if save_path is None:
            save_path = os.path.join(self.figures_dir, "provincial_stockout_early_warning.png")

        fig, ax = plt.subplots(figsize=(12, 7))
        fig.suptitle(f"CropSafe AI - Provincial Fertilizer Stockout & Scarcity Early Warning ({assessment_res['season']} Season)\nCritical Districts: {assessment_res['critical_stockout_districts']} | Rebalance Directives Queued: {len(assessment_res['prescribed_rebalance_orders'])}", fontsize=12, fontweight="bold")

        districts = [d["district"] for d in assessment_res["district_assessments"]]
        dcr_vals = [d["days_of_stock_cover"] for d in assessment_res["district_assessments"]]
        tiers = [d["status_tier"] for d in assessment_res["district_assessments"]]

        colors = ["#e74c3c" if "CRITICAL" in t else "#f39c12" if "WARNING" in t else "#2ecc71" for t in tiers]

        y_pos = np.arange(len(districts))
        bars = ax.barh(y_pos, dcr_vals, color=colors, edgecolor="black", height=0.6, alpha=0.85)

        ax.axvline(7.0, color="red", linestyle="--", linewidth=2, label="Critical Emergency Ceiling (7 Days)")
        ax.axvline(14.0, color="#f39c12", linestyle=":", linewidth=2, label="Safe Buffer Ceiling (14 Days)")

        ax.set_yticks(y_pos)
        ax.set_yticklabels(districts, fontsize=10, fontweight="bold")
        ax.set_xlabel("Days of Stock Cover Remaining (Days)", fontsize=11, fontweight="bold")
        ax.legend(loc="lower right", fontsize=9.5)
        ax.grid(axis="x", linestyle="--", alpha=0.4)

        for b, v in zip(bars, dcr_vals):
            ax.text(b.get_width() + 0.8, b.get_y() + b.get_height()/2., f"{v:.1f} d", ha="left", va="center", fontsize=9, fontweight="bold")

        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        return save_path


if __name__ == "__main__":
    engine = StockoutEarlyWarningEngine()

    # Provincial inventory sample covering major rice/agricultural basins in Sri Lanka
    provincial_inventory = [
        {"district": "Polonnaruwa", "current_urea_stock_mt": 180.0, "paddy_cultivation_ha": 32000.0, "cropping_stage": "Vegetative_Top_Dressing"}, # Deficit
        {"district": "Anuradhapura", "current_urea_stock_mt": 310.0, "paddy_cultivation_ha": 48000.0, "cropping_stage": "Vegetative_Top_Dressing"}, # Deficit
        {"district": "Ampara", "current_urea_stock_mt": 240.0, "paddy_cultivation_ha": 42000.0, "cropping_stage": "Vegetative_Top_Dressing"},       # Deficit
        {"district": "Kurunegala", "current_urea_stock_mt": 680.0, "paddy_cultivation_ha": 35000.0, "cropping_stage": "Basal_Planting"},
        {"district": "Hambantota", "current_urea_stock_mt": 1250.0, "paddy_cultivation_ha": 20000.0, "cropping_stage": "Harvest"},                  # Surplus
        {"district": "Matale", "current_urea_stock_mt": 420.0, "paddy_cultivation_ha": 15000.0, "cropping_stage": "Basal_Planting"},
        {"district": "Gampaha", "current_urea_stock_mt": 950.0, "paddy_cultivation_ha": 8000.0, "cropping_stage": "Harvest"}                       # Surplus
    ]

    res = engine.evaluate_regional_stock_cover(provincial_inventory, season="Maha")
    fig = engine.generate_stockout_figure(res)

    print("=== Provincial Stockout Early Warning Evaluated ===")
    print(f"Season: {res['season']}")
    print(f"Critical Stockout Districts: {res['critical_stockout_districts']}")
    for d in res["district_assessments"]:
        print(f"  [{d['district']}] Stock: {d['current_stock_mt']} MT | DCR: {d['days_of_stock_cover']} days ({d['status_tier']})")
    print(f"Rebalance Directives: {len(res['prescribed_rebalance_orders'])}")
    for order in res["prescribed_rebalance_orders"]:
        print(f"  -> Transfer {order['transfer_volume_mt']} MT from {order['source_surplus_district']} to {order['target_deficit_district']}")
    print(f"Chart Saved: {fig}")
