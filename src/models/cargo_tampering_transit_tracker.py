"""
CropSafe AI - Fertilizer Cargo Transit & Anti-Tampering Telemetry Tracker
Detects en-route adulteration, siphoning, and illegal consignment substitution between
central port depots and rural Agrarian Service Centers (ASCs) using GPS corridor tracking and weighbridge telemetry.
"""

import os
import sys
import numpy as np
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


class CargoTamperingTransitTracker:
    """Monitors transit security, weighbridge variances, and geo-fence compliance for fertilizer consignments."""

    def __init__(self, figures_dir: str = "reports/figures/predictive_prescriptive"):
        self.figures_dir = figures_dir
        os.makedirs(self.figures_dir, exist_ok=True)

    def evaluate_consignment_transit(self, transit_telemetry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes route telemetry, weighbridge differentials, and unscheduled stops.
        """
        consignment_id = transit_telemetry.get("consignment_id", "TRK-LK-9082")
        lorry_plate = transit_telemetry.get("lorry_plate", "WP-ND-4521")
        origin = transit_telemetry.get("origin_depot", "Colombo Port Central Terminal")
        destination = transit_telemetry.get("destination_asc", "Polonnaruwa Agrarian Service Center")
        
        dispatch_weight_mt = transit_telemetry.get("dispatch_gross_weight_mt", 30.0)
        arrival_weight_mt = transit_telemetry.get("arrival_gross_weight_mt", 28.6)
        tare_weight_mt = transit_telemetry.get("lorry_tare_weight_mt", 10.0)

        route_deviation_km = transit_telemetry.get("route_deviation_km", 2.1)
        unscheduled_stops_mins = transit_telemetry.get("unscheduled_stop_duration_mins", 0)
        tamper_seal_intact = transit_telemetry.get("cable_seals_intact", True)

        anomalies = []
        tampering_risk = 0.0

        # 1. Weighbridge delta analysis
        dispatch_net_cargo = dispatch_weight_mt - tare_weight_mt
        arrival_net_cargo = arrival_weight_mt - tare_weight_mt
        weight_deficit_kg = (dispatch_net_cargo - arrival_net_cargo) * 1000.0

        # Permissible moisture/dust loss is < 50 kg per 20 MT (0.25%)
        if weight_deficit_kg > 100.0:
            deficit_pct = (weight_deficit_kg / (dispatch_net_cargo * 1000.0)) * 100.0
            anomalies.append(f"CRITICAL WEIGHBRIDGE DEFICIT: {weight_deficit_kg:.0f} kg ({deficit_pct:.1f}%) missing from consignment!")
            tampering_risk += min(50.0, deficit_pct * 10.0)

        # 2. Geo-fence and corridor deviation
        if route_deviation_km > 10.0:
            anomalies.append(f"UNAUTHORIZED CORRIDOR DEVIATION: Lorry diverged {route_deviation_km:.1f} km off designated highway.")
            tampering_risk += 30.0

        # 3. Unscheduled stop in high-risk black spot
        if unscheduled_stops_mins > 30:
            anomalies.append(f"PROLONGED BLACK-SPOT STOP: Vehicle halted for {unscheduled_stops_mins} mins in secluded sector.")
            tampering_risk += 35.0

        # 4. Tamper-evident cable seal breach
        if not tamper_seal_intact:
            anomalies.append("TAMPER SEAL COMPROMISED: Container cable seal cut or broken prior to arrival.")
            tampering_risk += 45.0

        final_risk = min(100.0, tampering_risk)

        if final_risk >= 70.0:
            status = "CRITICAL_CARGO_TAMPERING_DETECTED"
            directive_en = "IMMEDIATE IMPOUNDMENT: Hold lorry at gate. Mandatory 100% core-sampling of bags for sand/salt substitution."
            directive_si = "වහාම ලොරිය අත්අඩංගුවට ගන්න: අතරමඟ බාලකිරීම් සිදුවී ඇති බවට දැඩි සාක්ෂි ඇත. සියලුම මිටි සාම්පල පරීක්ෂාවට ලක්කරන්න."
        elif final_risk >= 35.0:
            status = "SUSPICIOUS_TRANSIT_VARIANCE"
            directive_en = "Secondary Inspection: Weigh individual bags and inspect stitch lines for re-threading."
            directive_si = "ද්විතීයික පරීක්ෂාව: මිටි වෙන වෙනම කිරා බලා නූල් පාරවල් නැවත මසා ඇත්දැයි පරීක්ෂා කරන්න."
        else:
            status = "SECURE_TRANSIT_CLEARED"
            directive_en = "Transit Cleared: Weighbridge variance within normal moisture tolerances. Authorize unloading."
            directive_si = "ප්‍රවාහන නිෂ්කාශනය ලැබුණි: බර සහ මුද්‍රා නිවැරදියි. ගබඩාවට බෑමට අවසර දෙන්න."

        return {
            "consignment_id": consignment_id,
            "lorry_plate": lorry_plate,
            "route": f"{origin} -> {destination}",
            "tampering_risk_pct": round(final_risk, 1),
            "status": status,
            "weight_deficit_kg": round(weight_deficit_kg, 1),
            "anomalies_detected": anomalies if anomalies else ["Normal highway transit with intact security seals."],
            "enforcement_directive": {
                "en": directive_en,
                "si": directive_si
            }
        }

    def generate_transit_figure(self, transit_res: Dict[str, Any], save_path: str = None) -> str:
        """Visualizes cargo weight bridge deficit and telemetry security status."""
        if save_path is None:
            save_path = os.path.join(self.figures_dir, "cargo_transit_tampering_audit.png")

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 6))
        fig.suptitle(f"CropSafe AI - Consignment Transit & Cargo Tampering Telemetry\nLorry: {transit_res['lorry_plate']} | Risk: {transit_res['tampering_risk_pct']}% | Status: {transit_res['status']}", fontsize=12, fontweight="bold")

        # Left: Risk Gauge
        ax1.pie(
            [transit_res["tampering_risk_pct"], 100.0 - transit_res["tampering_risk_pct"]],
            colors=["#e74c3c" if transit_res["tampering_risk_pct"] >= 50 else "#2ecc71", "#ecf0f1"],
            startangle=90,
            wedgeprops={"edgecolor": "black", "linewidth": 1.5, "width": 0.4}
        )
        ax1.text(0, 0, f"{transit_res['tampering_risk_pct']}%\nRisk", ha="center", va="center", fontsize=16, fontweight="bold")
        ax1.set_title("1. Transit Tampering Risk Meter", fontsize=11, fontweight="bold")

        # Right: Weightbridge & Security Signal Checklist
        checks = [
            "Weighbridge Deficit",
            "Corridor Deviation",
            "Unscheduled Idle",
            "Cable Seal Integrity"
        ]
        has_anom = [
            transit_res["weight_deficit_kg"] > 100.0,
            any("CORRIDOR" in a for a in transit_res["anomalies_detected"]),
            any("BLACK-SPOT" in a for a in transit_res["anomalies_detected"]),
            any("SEAL" in a for a in transit_res["anomalies_detected"])
        ]
        colors = ["#e74c3c" if a else "#2ecc71" for a in has_anom]
        labels = ["VIOLATION" if a else "CLEAR" for a in has_anom]

        y_pos = np.arange(len(checks))
        bars = ax2.barh(y_pos, [100]*len(checks), color=colors, alpha=0.85, edgecolor="black", height=0.5)
        ax2.set_yticks(y_pos)
        ax2.set_yticklabels(checks, fontsize=10, fontweight="bold")
        ax2.set_xlim(0, 110)
        ax2.set_title("2. En-Route Chain of Custody Telemetry Checklist", fontsize=11, fontweight="bold")
        ax2.grid(axis="x", linestyle="--", alpha=0.4)

        for b, l in zip(bars, labels):
            ax2.text(50, b.get_y() + b.get_height()/2., l, ha="center", va="center", color="white", fontsize=11, fontweight="bold")

        plt.tight_layout()
        plt.savefig(save_path, dpi=300)
        plt.close()
        return save_path


if __name__ == "__main__":
    tracker = CargoTamperingTransitTracker()

    # Scenario: Lorry stopped in Habarana forest for 55 mins, lost 1,400 kg of cargo, and seal was broken
    suspicious_transit = {
        "consignment_id": "TRK-LK-2026-X89",
        "lorry_plate": "WP-ND-4521",
        "origin_depot": "Peliyagoda Central Warehouse",
        "destination_asc": "Polonnaruwa Agrarian Service Center",
        "dispatch_gross_weight_mt": 30.0,
        "arrival_gross_weight_mt": 28.6,       # 1.4 MT missing!
        "lorry_tare_weight_mt": 10.0,
        "route_deviation_km": 14.2,            # 14.2 km off route
        "unscheduled_stop_duration_mins": 55,  # 55 mins in forest
        "cable_seals_intact": False            # Seal cut
    }

    res = tracker.evaluate_consignment_transit(suspicious_transit)
    fig_path = tracker.generate_transit_figure(res)

    print("=== Cargo Tampering Transit Tracker Evaluated ===")
    print(f"Lorry: {res['lorry_plate']} ({res['route']})")
    print(f"Tampering Risk: {res['tampering_risk_pct']}% -> {res['status']}")
    print(f"Missing Cargo: {res['weight_deficit_kg']} kg")
    print(f"Directive (Sinhala): {res['enforcement_directive']['si']}")
    for a in res["anomalies_detected"]:
        print(f"  - {a}")
    print(f"Telemetry Audit Figure Saved: {fig_path}")
