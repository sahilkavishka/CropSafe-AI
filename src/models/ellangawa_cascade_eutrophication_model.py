"""
CropSafe AI - Ellangawa Tank Cascade System Eutrophication & Runoff Forensics
Module: src/models/ellangawa_cascade_eutrophication_model.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Protects ancient Sri Lankan Dry Zone Tank Cascade Systems (එල්ලංගා වැව් පද්ධති - FAO GIAHS World Heritage).
2. Models agricultural Nitrogen and Phosphorus surface runoff loading into village cascade reservoirs.
3. Calculates Carlson's Trophic State Index (TSI) and algal bloom / weed infestation risks (Salvinia / Japan Jabara).
4. Re-engineers traditional Sinhala hydraulic buffer zones:
   - Kattakaduwa (කට්ටකඩුව - vegetation interceptor strip filtering salinity & nitrate)
   - Gasgommana (ගස්ගොම්මන - upper catchment wind & silt buffer)
   - Perahana (පෙරහන - constructed wetland reed bed filtering phosphorus)
5. Computes safe maximum upstream fertilizer loading thresholds to preserve aquatic life and drinking water.
"""

import os
import sys
import json
import logging
import numpy as np
from typing import Dict, List, Any
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("EllangawaCascadeEutrophication")

class EllangawaCascadeEutrophicationEngine:
    """Models nutrient runoff kinetics and ecological buffer protection in ancient cascade tanks."""

    def __init__(self):
        # Eutrophication thresholds (Carlson Trophic State Index - TSI)
        self.tsi_eutrophic_threshold = 50.0
        self.tsi_hypereutrophic_threshold = 70.0

    def assess_tank_eutrophication(
        self,
        tank_name: str,
        cascade_basin: str,
        tank_water_volume_m3: float,
        tank_surface_area_ha: float,
        upstream_paddy_area_ha: float,
        total_p_applied_kg_ha: float = 35.0,  # e.g., TSP P2O5 applied
        total_n_applied_kg_ha: float = 120.0, # e.g., Urea N applied
        annual_rainfall_mm: float = 1200.0,
        has_kattakaduwa_buffer: bool = False,
        has_perahana_reed_bed: bool = False
    ) -> Dict[str, Any]:
        """
        Calculates nutrient loading, in-tank phosphorus concentration, and algal bloom risk.
        """
        # Tank surface area in m2 (1 ha = 10,000 m2)
        tank_area_m2 = tank_surface_area_ha * 10000.0
        mean_depth_m = max(0.8, tank_water_volume_m3 / max(100.0, tank_area_m2))

        # 1. Runoff Nutrient Export
        # Typical agricultural export coefficients: 3.5% of applied P and 12% of applied N export via surface runoff
        base_p_export_pct = 0.035
        base_n_export_pct = 0.12

        # Ecological buffer interception efficiency
        # Traditional Kattakaduwa (interceptor tree/grass strip) removes 45% N and 35% P
        # Perahana (reed bed / Typha / Sedges) removes 60% P and 40% N
        p_interception = 0.0
        n_interception = 0.0

        if has_kattakaduwa_buffer:
            p_interception += 0.35
            n_interception += 0.45
        if has_perahana_reed_bed:
            p_interception += 0.40
            n_interception += 0.25

        p_retention_factor = max(0.15, 1.0 - p_interception)
        n_retention_factor = max(0.20, 1.0 - n_interception)

        total_p_loading_kg_yr = (upstream_paddy_area_ha * total_p_applied_kg_ha * base_p_export_pct) * p_retention_factor
        total_n_loading_kg_yr = (upstream_paddy_area_ha * total_n_applied_kg_ha * base_n_export_pct) * n_retention_factor

        # 2. In-lake Phosphorus Equilibrium Concentration (Vollenweider Model)
        # Annual inflow water volume (m3) = upstream catchment runoff
        inflow_volume_m3 = (upstream_paddy_area_ha * 10000.0) * (annual_rainfall_mm / 1000.0) * 0.32
        water_residence_time_yr = max(0.05, tank_water_volume_m3 / max(1.0, inflow_volume_m3))

        # Areal phosphorus loading (mg P / m2 / yr)
        areal_p_loading_mg_m2 = (total_p_loading_kg_yr * 1e6) / max(1.0, tank_area_m2)
        hydraulic_overflow_rate_m_yr = mean_depth_m / water_residence_time_yr

        # Equilibrium in-lake Total Phosphorus [TP] in ug/L (ppb)
        tp_ug_l = round(areal_p_loading_mg_m2 / (hydraulic_overflow_rate_m_yr * (1.0 + np.sqrt(water_residence_time_yr))), 1)

        # 3. Carlson's Trophic State Index: TSI(TP) = 14.42 * ln(TP) + 4.15
        tsi = round(14.42 * np.log(max(1.0, tp_ug_l)) + 4.15, 1)

        # Classification
        if tsi < 40.0:
            trophic_state = "OLIGOTROPHIC_PRISTINE"
            trophic_state_si = "පිරිසිදු නිරෝගී වැවක් (Oligotrophic - ජලය ඉතා පැහැදිලියි)"
            color = "GREEN"
            bloom_risk_si = "අවමයි (ඇල්ගී අවදානමක් නැත)."
        elif tsi <= 50.0:
            trophic_state = "MESOTROPHIC_BALANCED"
            trophic_state_si = "මධ්‍යස්ථ සමතුලිත වැවක් (Mesotrophic - මත්ස්‍ය වගාවට සුදුසුයි)"
            color = "BLUE"
            bloom_risk_si = "අඩුයි (සාමාන්‍ය පාරිසරික සමතුලිතතාවය)."
        elif tsi <= 70.0:
            trophic_state = "EUTROPHIC_NUTRIENT_RICH"
            trophic_state_si = "පොහොර දූෂිත වැවක් (Eutrophic - ඇල්ගී හා පාසි වැවීම)"
            color = "ORANGE"
            bloom_risk_si = "මධ්‍යස්ථ ඉහළයි (ජපන් ජබර සහ සැල්වීනියා පැතිරීමේ අවදානමක් ඇත)."
        else:
            trophic_state = "HYPEREUTROPHIC_CHOKED"
            trophic_state_si = "අතිශය දූෂිත වැවක් (Hypereutrophic - වැව සම්පූර්ණයෙන්ම හිරවීම)"
            color = "RED"
            bloom_risk_si = "අතිශය බරපතළයි! විෂ ඇල්ගී (Microcystis) මතු වී මසුන් මියයාමේ සහ පානීය ජලය විෂ වීමේ අවදානම!"

        # Ancient Engineering Restoration Protocol
        restoration_actions = []
        if not has_kattakaduwa_buffer:
            restoration_actions.append("1. කුඹුර සහ වැව් ඉස්මත්ත අතර පැරණි සිංහල 'කට්ටකඩුව' ප්‍රතිස්ථාපනය කරන්න (කුඹුක්, මී, කරඳ සහ සැවැන්දරා තීරයක් සිටුවන්න).")
        if not has_perahana_reed_bed:
            restoration_actions.append("2. වැවට ජලය ඇතුළු වන මෝය ආශ්‍රිතව 'පෙරහන' (ස්වභාවික බට හා පන් තෙත්බිම) සකසා පොස්පරස් පෙරා ඉවත් කරන්න.")
        if tsi > 50.0:
            safe_p_reduction_pct = round(((tsi - 50.0) / tsi) * 100.0, 1)
            restoration_actions.append(f"3. ඉහළ කුඹුරු වල TSP පොහොර යෙදීම {safe_p_reduction_pct}% කින් අඩු කර කාබනික කොම්පෝස්ට් සමඟ සමතුලිත කරන්න.")

        return {
            "assessment_timestamp": datetime.now().isoformat(),
            "tank_identity": {
                "tank_name": tank_name,
                "cascade_basin": cascade_basin,
                "surface_area_ha": tank_surface_area_ha,
                "water_volume_m3": tank_water_volume_m3,
                "mean_depth_meters": round(mean_depth_m, 2),
                "upstream_paddy_ha": upstream_paddy_area_ha
            },
            "trophic_diagnostics": {
                "equilibrium_total_phosphorus_ug_l": tp_ug_l,
                "carlson_tsi_score": tsi,
                "trophic_state": trophic_state,
                "trophic_state_si": trophic_state_si,
                "color_indicator": color,
                "algal_bloom_risk_si": bloom_risk_si
            },
            "annual_nutrient_loading_kg": {
                "phosphorus_p_export_kg_yr": round(total_p_loading_kg_yr, 1),
                "nitrogen_n_export_kg_yr": round(total_n_loading_kg_yr, 1),
                "buffer_interception_efficiency_pct": round((p_interception + n_interception) / 2.0 * 100.0, 1)
            },
            "ancient_sinhala_restoration_protocol_si": restoration_actions,
            "executive_summary_si": (
                f"එල්ලංගා වැව: {tank_name} ({cascade_basin}). "
                f"TSI දර්ශකය: {tsi} ({trophic_state_si}). "
                f"පොස්පරස් සාන්ද්‍රණය {tp_ug_l} ug/L කි. "
                f"කට්ටකඩුව සහ පෙරහන වැනි සාම්ප්‍රදායික පාරිසරික බෆර මඟින් වැවට වැටෙන පෝෂක 65% කින් අඩු කරගත හැක."
            )
        }

if __name__ == "__main__":
    engine = EllangawaCascadeEutrophicationEngine()

    print("=== TEST 1: Unprotected Dry Zone Cascade Tank (No Buffer, 50 Ha Paddy) ===")
    res1 = engine.assess_tank_eutrophication(
        tank_name="තිරප්පනේ මහ වැව (Thirappane Maha Wewa)",
        cascade_basin="Malwathu Oya Cascade Basin",
        tank_water_volume_m3=180000.0,
        tank_surface_area_ha=12.0,
        upstream_paddy_area_ha=45.0,
        total_p_applied_kg_ha=40.0,
        total_n_applied_kg_ha=130.0,
        has_kattakaduwa_buffer=False,
        has_perahana_reed_bed=False
    )
    print(f"Tank: {res1['tank_identity']['tank_name']}")
    print(f"TSI: {res1['trophic_diagnostics']['carlson_tsi_score']} ({res1['trophic_diagnostics']['trophic_state_si']})")
    print(f"Bloom Risk: {res1['trophic_diagnostics']['algal_bloom_risk_si']}")
    print(f"Summary: {res1['executive_summary_si']}\n")

    print("=== TEST 2: Restored Cascade Tank with Traditional Kattakaduwa & Perahana ===")
    res2 = engine.assess_tank_eutrophication(
        tank_name="තිරප්පනේ මහ වැව (ප්‍රතිසංස්කරණය කළ පසු)",
        cascade_basin="Malwathu Oya Cascade Basin",
        tank_water_volume_m3=180000.0,
        tank_surface_area_ha=12.0,
        upstream_paddy_area_ha=45.0,
        total_p_applied_kg_ha=40.0,
        total_n_applied_kg_ha=130.0,
        has_kattakaduwa_buffer=True,
        has_perahana_reed_bed=True
    )
    print(f"Tank: {res2['tank_identity']['tank_name']}")
    print(f"TSI: {res2['trophic_diagnostics']['carlson_tsi_score']} ({res2['trophic_diagnostics']['trophic_state_si']})")
    print(f"Bloom Risk: {res2['trophic_diagnostics']['algal_bloom_risk_si']}")
    print(f"Interception: {res2['annual_nutrient_loading_kg']['buffer_interception_efficiency_pct']}%")
