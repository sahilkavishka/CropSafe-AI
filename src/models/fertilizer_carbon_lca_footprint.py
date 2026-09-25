"""
CropSafe AI - Fertilizer Carbon Footprint & Life Cycle Assessment (LCA) Calculator
Module: src/models/fertilizer_carbon_lca_footprint.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Conducts cradle-to-farm-gate Life Cycle Assessment (LCA) for synthetic and organic fertilizers.
2. Computes Scope 1, 2, and 3 emissions:
   - Industrial Manufacturing (Haber-Bosch NH3 / Urea synthesis, Rock phosphate acidulation, Potash mining)
   - Maritime & Domestic Freight Transport (Persian Gulf/China -> Colombo Port -> Regional Warehouse)
   - Field Direct Agricultural Emissions (IPCC Tier 1 Nitrous Oxide N2O emissions, GWP = 298)
   - Urea Hydrolysis CO2 volatilization
3. Models carbon sequestration offsets from Biochar and Compost integration.
4. Generates Carbon Intensity Score (Grade A to E) and voluntary Carbon Credit offset valuation (USD & LKR).
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
logger = logging.getLogger("FertilizerCarbonLCAFootprint")

# Emission factors (kg CO2e per kg product) based on IPCC 2019 Refinement & Ecoinvent 3.8
EMISSION_FACTORS = {
    "urea": {
        "production_kg_co2e_per_kg": 2.58,   # Haber-Bosch + CO2 synthesis
        "maritime_freight_kg_co2e_per_kg": 0.045, # 3,500 nm oceanic shipping
        "road_freight_kg_co2e_per_kg": 0.022,     # 150 km diesel lorry transit
        "n_content_pct": 46.0,
        "urea_hydrolysis_co2_kg_per_kg": 0.733    # C emitted upon soil dissolution
    },
    "tsp": {
        "production_kg_co2e_per_kg": 1.15,
        "maritime_freight_kg_co2e_per_kg": 0.045,
        "road_freight_kg_co2e_per_kg": 0.022,
        "n_content_pct": 0.0,
        "urea_hydrolysis_co2_kg_per_kg": 0.0
    },
    "mop": {
        "production_kg_co2e_per_kg": 0.62,
        "maritime_freight_kg_co2e_per_kg": 0.045,
        "road_freight_kg_co2e_per_kg": 0.022,
        "n_content_pct": 0.0,
        "urea_hydrolysis_co2_kg_per_kg": 0.0
    },
    "organic_compost": {
        "production_kg_co2e_per_kg": 0.08,    # Aerobic composting energy
        "maritime_freight_kg_co2e_per_kg": 0.0, # Locally produced in Sri Lanka
        "road_freight_kg_co2e_per_kg": 0.015,
        "n_content_pct": 1.8,
        "urea_hydrolysis_co2_kg_per_kg": 0.0
    },
    "biochar": {
        "production_kg_co2e_per_kg": 0.05,
        "maritime_freight_kg_co2e_per_kg": 0.0,
        "road_freight_kg_co2e_per_kg": 0.015,
        "n_content_pct": 0.5,
        "urea_hydrolysis_co2_kg_per_kg": 0.0,
        "carbon_sink_t_co2e_per_t": -2.85     # Net negative carbon sink
    }
}

class FertilizerCarbonLCAFootprintEngine:
    """Computes cradle-to-grave fertilizer carbon emissions, IPCC Tier 1 field N2O, and carbon credit offsets."""

    def __init__(self):
        self.factors = EMISSION_FACTORS
        self.gwp_n2o = 298.0          # IPCC 100-year Global Warming Potential for N2O
        self.n2o_emission_factor = 0.01 # IPCC Tier 1: 1.0% of applied N emitted as N2O-N
        self.carbon_credit_usd_per_ton = 18.0 # Voluntary carbon market price ($18 / ton CO2e)
        self.usd_to_lkr = 305.0

    def calculate_footprint(
        self,
        urea_kg: float,
        tsp_kg: float = 0.0,
        mop_kg: float = 0.0,
        organic_compost_kg: float = 0.0,
        biochar_kg: float = 0.0,
        land_area_ha: float = 1.0
    ) -> Dict[str, Any]:
        """
        Calculates carbon footprint and life cycle emissions for seasonal fertilizer input.
        """
        # 1. Industrial Production & Transport Emissions
        emissions_prod = 0.0
        emissions_transport = 0.0

        inputs_map = [
            ("urea", urea_kg),
            ("tsp", tsp_kg),
            ("mop", mop_kg),
            ("organic_compost", organic_compost_kg),
            ("biochar", biochar_kg)
        ]

        for item, qty in inputs_map:
            fac = self.factors[item]
            emissions_prod += qty * fac["production_kg_co2e_per_kg"]
            emissions_transport += qty * (fac["maritime_freight_kg_co2e_per_kg"] + fac["road_freight_kg_co2e_per_kg"])

        # 2. Field Direct Emissions
        # Urea hydrolysis CO2
        urea_hydrolysis_co2 = urea_kg * self.factors["urea"]["urea_hydrolysis_co2_kg_per_kg"]

        # Direct Field N2O emissions from applied Nitrogen:
        # Total synthetic and organic N applied (kg)
        total_n_applied_kg = (
            (urea_kg * 0.46) +
            (organic_compost_kg * 0.018) +
            (biochar_kg * 0.005)
        )

        # N2O-N = N_applied * 0.01; N2O = N2O-N * (44 / 28)
        n2o_emitted_kg = total_n_applied_kg * self.n2o_emission_factor * (44.0 / 28.0)
        n2o_co2e_kg = n2o_emitted_kg * self.gwp_n2o

        # 3. Carbon Sequestration Sinks (Biochar net negative emissions)
        biochar_tons = biochar_kg / 1000.0
        carbon_sequestration_kg_co2e = (biochar_tons * abs(self.factors["biochar"]["carbon_sink_t_co2e_per_t"]) * 1000.0)

        # Total Net Emissions
        gross_emissions_kg_co2e = emissions_prod + emissions_transport + urea_hydrolysis_co2 + n2o_co2e_kg
        net_emissions_kg_co2e = gross_emissions_kg_co2e - carbon_sequestration_kg_co2e
        net_emissions_tons_co2e = round(net_emissions_kg_co2e / 1000.0, 3)

        # Per Hectare Intensity
        emissions_per_ha = round(net_emissions_kg_co2e / max(0.01, land_area_ha), 1)

        # Grade Categorization
        if emissions_per_ha < 300.0:
            carbon_grade = "Grade A (Low-Carbon Eco-Certified)"
            grade_color = "GREEN"
        elif emissions_per_ha < 700.0:
            carbon_grade = "Grade B (Moderate Carbon Intensity)"
            grade_color = "YELLOW"
        elif emissions_per_ha < 1200.0:
            carbon_grade = "Grade C (Standard High-Intensity)"
            grade_color = "ORANGE"
        else:
            carbon_grade = "Grade D (Severe Carbon Footprint)"
            grade_color = "RED"

        # Carbon Credit Offset Valuation (if biochar/organic reduces footprint below 500 kg CO2e/ha benchmark)
        baseline_benchmark_kg = 850.0 * land_area_ha  # Conventional high chemical farming emits ~850 kg CO2e/ha
        mitigated_co2e_kg = max(0.0, baseline_benchmark_kg - net_emissions_kg_co2e)
        mitigated_co2e_tons = round(mitigated_co2e_kg / 1000.0, 3)

        carbon_credits_usd = round(mitigated_co2e_tons * self.carbon_credit_usd_per_ton, 2)
        carbon_credits_lkr = round(carbon_credits_usd * self.usd_to_lkr, 2)

        return {
            "evaluation_timestamp": datetime.now().isoformat(),
            "inputs_evaluated": {
                "urea_kg": urea_kg,
                "tsp_kg": tsp_kg,
                "mop_kg": mop_kg,
                "organic_compost_kg": organic_compost_kg,
                "biochar_kg": biochar_kg,
                "land_area_ha": land_area_ha
            },
            "emission_lifecycle_breakdown_kg_co2e": {
                "industrial_production_scope1_2": round(emissions_prod, 1),
                "ocean_and_road_transport_scope3": round(emissions_transport, 1),
                "soil_urea_hydrolysis_co2": round(urea_hydrolysis_co2, 1),
                "field_nitrous_oxide_n2o_co2e": round(n2o_co2e_kg, 1),
                "carbon_sink_sequestration_offset": round(-carbon_sequestration_kg_co2e, 1)
            },
            "carbon_balance_totals": {
                "gross_emissions_kg_co2e": round(gross_emissions_kg_co2e, 1),
                "net_carbon_footprint_kg_co2e": round(net_emissions_kg_co2e, 1),
                "net_carbon_footprint_tons_co2e": net_emissions_tons_co2e,
                "carbon_intensity_kg_co2e_per_ha": emissions_per_ha,
                "carbon_rating": carbon_grade,
                "grade_color": grade_color
            },
            "voluntary_carbon_credits": {
                "mitigated_co2e_tons": mitigated_co2e_tons,
                "carbon_credit_valuation_usd": carbon_credits_usd,
                "carbon_credit_valuation_lkr": carbon_credits_lkr
            },
            "climate_advisory_si": (
                f"මෙම පොහොර යෙදුමෙන් මුදාහැරෙන ශුද්ධ කාබන් විමෝචනය ටොන් {net_emissions_tons_co2e} CO2e "
                f"(හෙක්ටයාරයකට කි.ග්‍රෑ. {emissions_per_ha}) කි. "
                f"කාබනික/දහයියා අඟුරු යෙදීම නිසා සාම්ප්‍රදායික මට්ටමට වඩා ටොන් {mitigated_co2e_tons} CO2e ඉතිරි වී ඇති අතර, "
                f"එහි කාබන් ක්‍රෙඩිට් වටිනාකම රු. {carbon_credits_lkr:,.0f} ($ {carbon_credits_usd}) කි."
            )
        }

if __name__ == "__main__":
    engine = FertilizerCarbonLCAFootprintEngine()

    print("=== TEST 1: Conventional High Chemical Input (150kg Urea, 50kg TSP, 50kg MOP on 1 Ha) ===")
    res1 = engine.calculate_footprint(
        urea_kg=150.0,
        tsp_kg=50.0,
        mop_kg=50.0,
        land_area_ha=1.0
    )
    print(f"Net Emissions: {res1['carbon_balance_totals']['net_carbon_footprint_tons_co2e']} tons CO2e")
    print(f"Carbon Intensity: {res1['carbon_balance_totals']['carbon_intensity_kg_co2e_per_ha']} kg CO2e/ha")
    print(f"Rating: {res1['carbon_balance_totals']['carbon_rating']}\n")

    print("=== TEST 2: Eco-Smart Balanced System (75kg Urea + 500kg Biochar + 1000kg Compost) ===")
    res2 = engine.calculate_footprint(
        urea_kg=75.0,
        organic_compost_kg=1000.0,
        biochar_kg=500.0,
        land_area_ha=1.0
    )
    print(f"Net Emissions: {res2['carbon_balance_totals']['net_carbon_footprint_tons_co2e']} tons CO2e")
    print(f"Carbon Intensity: {res2['carbon_balance_totals']['carbon_intensity_kg_co2e_per_ha']} kg CO2e/ha")
    print(f"Rating: {res2['carbon_balance_totals']['carbon_rating']}")
    print(f"Carbon Credit Value: LKR {res2['voluntary_carbon_credits']['carbon_credit_valuation_lkr']:,} ($ {res2['voluntary_carbon_credits']['carbon_credit_valuation_usd']})")
