"""
CropSafe AI - National Policy & Agrarian Crisis "What-If" Wargame Simulator
Module: src/models/national_policy_wargame_simulator.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Simulates macro-agricultural policy shocks and global geopolitical supply-chain disruptions:
   - Global Urea price spikes (e.g., Red Sea shipping crisis, Persian Gulf export curbs)
   - Maritime cargo vessel import delays at Colombo/Hambantota ports during peak Maha/Yala seasons
   - Sudden chemical subsidy reduction or transition policies
2. Predicts impacts on national paddy harvest (metric tons), rice consumer price inflation (LKR/kg),
   and district-level farmer economic vulnerability.
3. Computes emergency national strategic buffer stock drawdowns and financial contingency requirements.
"""

import os
import sys
import json
import logging
from typing import Dict, List, Any
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("NationalPolicyWargameSimulator")

# Baseline National Parameters for Sri Lanka (Ministry of Agriculture & Central Bank CBSL Data)
NATIONAL_AGRICULTURE_BASELINES = {
    "annual_paddy_production_target_mt": 4500000.0,    # 4.5 Million MT per year (Maha + Yala)
    "annual_urea_requirement_mt": 350000.0,            # 350,000 MT Urea required
    "annual_tsp_requirement_mt": 100000.0,
    "annual_mop_requirement_mt": 120000.0,
    "national_strategic_buffer_urea_mt": 65000.0,      # Government buffer stock in central warehouses
    "baseline_rice_retail_price_lkr_kg": 220.0,        # Baseline Samba/Nadu retail price
    "baseline_global_urea_cif_usd_ton": 380.0,         # Baseline CIF price at Colombo
    "usd_to_lkr_rate": 305.0
}

class NationalPolicyWargameSimulator:
    """Simulates macro-agricultural shocks, policy scenarios, and food security outcomes."""

    def __init__(self):
        self.base = NATIONAL_AGRICULTURE_BASELINES

    def simulate_scenario(
        self,
        scenario_name: str,
        global_urea_price_change_pct: float = 0.0,
        port_arrival_delay_weeks: int = 0,
        chemical_subsidy_cut_pct: float = 0.0,
        organic_substitution_pct: float = 0.0,
        season: str = "Maha"
    ) -> Dict[str, Any]:
        """
        Runs macro-economic and agronomic simulation of a policy shock.
        
        Args:
            scenario_name: Descriptive name of the policy experiment
            global_urea_price_change_pct: Percentage change in global fertilizer prices (e.g. +50.0%)
            port_arrival_delay_weeks: Delay in shipping consignments (0 to 8 weeks)
            chemical_subsidy_cut_pct: Reduction in government subsidy funding (0 to 100%)
            organic_substitution_pct: Percentage forced substitution to organic inputs (e.g. 0 to 50%)
            season: "Maha" (65% national yield) or "Yala" (35% national yield)
        """
        seasonal_weight = 0.65 if season.lower() == "maha" else 0.35
        seasonal_paddy_target_mt = self.base["annual_paddy_production_target_mt"] * seasonal_weight
        seasonal_urea_need_mt = self.base["annual_urea_requirement_mt"] * seasonal_weight

        # 1. Supply Shortfall Modeling
        delay_deficit_ratio = min(0.45, (port_arrival_delay_weeks * 0.08))
        price_drop_adoption_ratio = min(0.35, max(0.0, (global_urea_price_change_pct * 0.003) * (1.0 + chemical_subsidy_cut_pct / 100.0)))

        # Unplanned organic shock penalty (organic nitrogen availability is slower than synthetic urea)
        organic_yield_drop_ratio = (organic_substitution_pct / 100.0) * 0.32

        total_fertilizer_deficit_ratio = min(0.70, delay_deficit_ratio + price_drop_adoption_ratio)

        # Buffer Stock drawdown
        available_buffer_mt = self.base["national_strategic_buffer_urea_mt"] * seasonal_weight
        actual_urea_shortfall_mt = max(0.0, (seasonal_urea_need_mt * total_fertilizer_deficit_ratio) - available_buffer_mt)
        buffer_used_mt = min(available_buffer_mt, seasonal_urea_need_mt * total_fertilizer_deficit_ratio)
        remaining_buffer_mt = available_buffer_mt - buffer_used_mt

        # 2. Predicted Paddy Production Loss
        # In Sri Lanka, every 1% shortage in critical stage Nitrogen causes ~0.65% drop in national paddy harvest
        fertilizer_induced_yield_loss_pct = (actual_urea_shortfall_mt / max(1.0, seasonal_urea_need_mt)) * 65.0
        total_yield_loss_pct = min(60.0, round(fertilizer_induced_yield_loss_pct + (organic_yield_drop_ratio * 100.0), 1))

        simulated_paddy_harvest_mt = round(seasonal_paddy_target_mt * (1.0 - (total_yield_loss_pct / 100.0)), 0)
        paddy_shortfall_mt = round(seasonal_paddy_target_mt - simulated_paddy_harvest_mt, 0)

        # 3. Consumer Rice Price & Food Inflation Projection
        # Price elasticity of rice supply: 10% harvest shortfall leads to ~16% retail price surge
        price_inflation_pct = round((total_yield_loss_pct / 10.0) * 16.5, 1)
        simulated_rice_price_lkr = round(self.base["baseline_rice_retail_price_lkr_kg"] * (1.0 + (price_inflation_pct / 100.0)), 1)

        # 4. National Food Security Risk Tier
        if total_yield_loss_pct < 10.0:
            food_security_status = "STABLE_SECURE"
            severity_color = "GREEN"
            summary_si = "ජාතික ආහාර සුරක්ෂිතතාවය ස්ථාවරයි. පවතින බෆර් තොග මඟින් හිඟය පියවාගත හැක."
        elif total_yield_loss_pct < 25.0:
            food_security_status = "MODERATE_STRESS"
            severity_color = "YELLOW"
            summary_si = "මධ්‍යස්ථ සැපයුම් පීඩනයකි. සහල් සිල්ලර මිල තරමක් ඉහළ යා හැකි අතර හදිසි ඇණවුම් අවශ්‍ය වේ."
        elif total_yield_loss_pct < 40.0:
            food_security_status = "SEVERE_FOOD_SECURITY_WARNING"
            severity_color = "ORANGE"
            summary_si = "දැඩි ආහාර අර්බුද අනතුරු ඇඟවීමක්! සහල් හිඟයක් සහ මිල සීඝ්‍රයෙන් ඉහළ යාමේ අවදානමක් ඇත."
        else:
            food_security_status = "CRITICAL_CATASTROPHIC_CRISIS"
            severity_color = "RED"
            summary_si = "අතිශය විනාශකාරී කෘෂිකාර්මික අර්බුදයක්! 2021 වැනි අස්වනු කඩා වැටීමක් සිදුවිය හැකි බැවින් වහාම මැදිහත් වන්න."

        # Strategic Policy Recommendations
        policy_recs = []
        if remaining_buffer_mt < (available_buffer_mt * 0.3):
            policy_recs.append("1. ජාතික බෆර් සංචිතය 30% ට වඩා අඩු වී ඇත. රාජ්‍ය ණය ආධාර (G2G) යටතේ කඩිනමින් නැව් 2ක් ආනයනය කරන්න.")
        if port_arrival_delay_weeks > 2:
            policy_recs.append("2. වරාය තදබදය මඟහැරීමට හම්බන්තොට සහ ත්‍රිකුණාමල වරායන් වෙත පොහොර නැව් හරවා යවන්න (Port Diversion).")
        if organic_substitution_pct > 20.0:
            policy_recs.append("3. ක්ෂණික කාබනික මාරුවෙන් වළකින්න. රසායනික යූරියා සමඟ 30% කොළ පොහොර මිශ්‍ර ඒකාබද්ධ ක්‍රමයක් (IPNS) ක්‍රියාත්මක කරන්න.")

        return {
            "simulation_timestamp": datetime.now().isoformat(),
            "scenario_name": scenario_name,
            "season": season,
            "simulation_inputs": {
                "global_urea_price_change_pct": global_urea_price_change_pct,
                "port_arrival_delay_weeks": port_arrival_delay_weeks,
                "chemical_subsidy_cut_pct": chemical_subsidy_cut_pct,
                "organic_substitution_pct": organic_substitution_pct
            },
            "national_production_impacts": {
                "seasonal_paddy_target_mt": seasonal_paddy_target_mt,
                "simulated_paddy_harvest_mt": simulated_paddy_harvest_mt,
                "national_paddy_shortfall_mt": paddy_shortfall_mt,
                "projected_yield_loss_pct": total_yield_loss_pct
            },
            "buffer_stock_dynamics_mt": {
                "initial_buffer_mt": round(available_buffer_mt, 0),
                "buffer_drawn_down_mt": round(buffer_used_mt, 0),
                "remaining_buffer_mt": round(remaining_buffer_mt, 0)
            },
            "consumer_market_consequences": {
                "baseline_rice_price_lkr_kg": self.base["baseline_rice_retail_price_lkr_kg"],
                "simulated_rice_price_lkr_kg": simulated_rice_price_lkr,
                "projected_retail_price_inflation_pct": price_inflation_pct
            },
            "food_security_verdict": {
                "status": food_security_status,
                "color_indicator": severity_color,
                "executive_summary_si": summary_si
            },
            "strategic_policy_recommendations_si": policy_recs
        }

if __name__ == "__main__":
    wargame = NationalPolicyWargameSimulator()

    print("=== TEST 1: Global Price Surge & 3-Week Port Congestion (Maha Season) ===")
    sim1 = wargame.simulate_scenario(
        scenario_name="Red Sea Geopolitical Crisis & Port Delay",
        global_urea_price_change_pct=65.0,
        port_arrival_delay_weeks=3,
        chemical_subsidy_cut_pct=25.0,
        season="Maha"
    )
    print(f"Scenario: {sim1['scenario_name']}")
    print(f"Projected Yield Loss: {sim1['national_production_impacts']['projected_yield_loss_pct']}% (Shortfall: {sim1['national_production_impacts']['national_paddy_shortfall_mt']:,} MT)")
    print(f"Projected Rice Price: LKR {sim1['consumer_market_consequences']['simulated_rice_price_lkr_kg']}/kg (+{sim1['consumer_market_consequences']['projected_retail_price_inflation_pct']}%)")
    print(f"Verdict: {sim1['food_security_verdict']['status']} - {sim1['food_security_verdict']['executive_summary_si']}\n")

    print("=== TEST 2: Extreme 2021-Style Overnight Chemical Fertilizer Ban ===")
    sim2 = wargame.simulate_scenario(
        scenario_name="Total Chemical Import Ban Simulation",
        chemical_subsidy_cut_pct=100.0,
        organic_substitution_pct=80.0,
        season="Maha"
    )
    print(f"Scenario: {sim2['scenario_name']}")
    print(f"Projected Yield Loss: {sim2['national_production_impacts']['projected_yield_loss_pct']}%")
    print(f"Projected Rice Price: LKR {sim2['consumer_market_consequences']['simulated_rice_price_lkr_kg']}/kg")
    print(f"Verdict: {sim2['food_security_verdict']['status']} - {sim2['food_security_verdict']['executive_summary_si']}")
