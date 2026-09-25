"""
CropSafe AI - Agrarian Micro-Credit & Fertilizer Financing Risk Scorecard
Module: src/models/agrarian_micro_credit_scorecard.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Implements a multi-pillar Agrarian Credit Scorecard (Score range: 300 - 850) for rural banking (RDB, Sanasa, BOC).
2. Evaluates 5 core agricultural risk dimensions:
   - Land Tenure Security (Deed / Swarnabhoomi / Mahaweli 99-year permit vs Ande tenancy)
   - Historical Yield Stability & Farming Track Record
   - Water & Irrigation Resilience (Major Mahaweli canal vs Agro-well vs Rainfed)
   - Debt-to-Projected-Harvest-Income Ratio (DTI)
   - AAIB Crop Insurance & Agrarian Service Centre (ASC) registration
3. Computes Default Probability, Underwriting Risk Tier, and Maximum Approved Credit Line (LKR).
4. Determines eligibility for concessionary low-interest CBSL agricultural loan schemes (6.5% APR).
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
logger = logging.getLogger("AgrarianMicroCreditScorecard")

TENURE_WEIGHTS = {
    "freehold_deed": 100.0,
    "swarnabhoomi_permit": 90.0,
    "mahaweli_permit": 85.0,
    "statutory_ande_lease": 65.0,
    "informal_tenant": 35.0
}

IRRIGATION_WEIGHTS = {
    "major_irrigation_canal": 100.0,
    "deep_agro_well": 85.0,
    "minor_irrigation_tank": 65.0,
    "strictly_rainfed": 40.0
}

# Seasonal production cost per hectare by crop (DOA Sri Lanka)
CROP_FERTILIZER_BUDGET_PER_HA_LKR = {
    "paddy": 85000.0,
    "tea": 140000.0,
    "vegetable": 190000.0,
    "maize": 75000.0,
    "cinnamon": 95000.0
}

class AgrarianMicroCreditScorecardEngine:
    """Calculates farmer creditworthiness, default probability, and seasonal fertilizer loan terms."""

    def __init__(self):
        self.tenure_db = TENURE_WEIGHTS
        self.irrigation_db = IRRIGATION_WEIGHTS
        self.crop_budgets = CROP_FERTILIZER_BUDGET_PER_HA_LKR

    def evaluate_credit_application(
        self,
        farmer_nic: str,
        farmer_name: str,
        land_area_ha: float,
        crop_type: str,
        land_tenure: str,
        irrigation_source: str,
        farming_experience_years: int,
        historical_yield_avg_tons_ha: float,
        existing_seasonal_debt_lkr: float,
        expected_crop_price_per_kg_lkr: float = 120.0,
        has_aaib_crop_insurance: bool = True
    ) -> Dict[str, Any]:
        """
        Evaluates micro-credit eligibility and computes financial credit scorecard.
        """
        clean_tenure = land_tenure.strip().lower()
        tenure_score = self.tenure_db.get(clean_tenure, 60.0)

        clean_irrig = irrigation_source.strip().lower()
        irrig_score = self.irrigation_db.get(clean_irrig, 60.0)

        # Experience & yield score (0-100)
        exp_score = min(100.0, max(30.0, (farming_experience_years * 3.5) + (historical_yield_avg_tons_ha * 12.0)))

        # Revenue & DTI calculation
        expected_yield_kg = historical_yield_avg_tons_ha * 1000.0 * land_area_ha
        projected_gross_revenue_lkr = expected_yield_kg * expected_crop_price_per_kg_lkr
        
        # Total fertilizer budget needed
        crop_clean = crop_type.strip().lower()
        base_budget_ha = self.crop_budgets.get(crop_clean, 85000.0)
        fertilizer_capital_needed_lkr = base_budget_ha * land_area_ha

        dti_ratio = (existing_seasonal_debt_lkr + fertilizer_capital_needed_lkr) / max(10000.0, projected_gross_revenue_lkr)
        if dti_ratio <= 0.30:
            dti_score = 100.0
        elif dti_ratio <= 0.50:
            dti_score = 80.0
        elif dti_ratio <= 0.70:
            dti_score = 55.0
        else:
            dti_score = 25.0

        # Insurance score
        insurance_score = 100.0 if has_aaib_crop_insurance else 40.0

        # Composite Score Calculation (Scaled 300 to 850)
        # Weights: Tenure 20%, Irrigation 20%, Experience/Yield 25%, DTI 20%, Insurance 15%
        weighted_norm = (
            (tenure_score * 0.20) +
            (irrig_score * 0.20) +
            (exp_score * 0.25) +
            (dti_score * 0.20) +
            (insurance_score * 0.15)
        )
        # Scale: 300 + (weighted_norm / 100) * 550
        credit_score = int(round(300 + (weighted_norm / 100.0) * 550))

        # Risk Classification
        if credit_score >= 740:
            risk_tier = "PRIME_LOW_RISK"
            risk_tier_si = "ප්‍රමුඛ අඩු අවදානම් (Prime Low-Risk)"
            approval_status = "APPROVED"
            apr_pct = 6.5  # Subsidized CBSL Agrarian Scheme
            max_loan_limit = fertilizer_capital_needed_lkr * 1.15
            color = "GREEN"
        elif credit_score >= 640:
            risk_tier = "STANDARD_ACCEPTABLE"
            risk_tier_si = "සම්මත පිළිගත හැකි අවදානම (Standard Acceptable)"
            approval_status = "APPROVED_CONDITIONAL"
            apr_pct = 9.5
            max_loan_limit = fertilizer_capital_needed_lkr * 1.0
            color = "YELLOW"
        elif credit_score >= 540:
            risk_tier = "CAUTION_HIGH_RISK"
            risk_tier_si = "අවවාදාත්මක ඉහළ අවදානම (High Risk - Requires Guarantor)"
            approval_status = "NEEDS_GUARANTOR"
            apr_pct = 13.5
            max_loan_limit = fertilizer_capital_needed_lkr * 0.75
            color = "ORANGE"
        else:
            risk_tier = "UNACCEPTABLE_DEFAULT_RISK"
            risk_tier_si = "ප්‍රතික්ෂේපිත අධික අවදානම (High Default Risk)"
            approval_status = "REJECTED"
            apr_pct = 18.0
            max_loan_limit = 0.0
            color = "RED"

        default_prob_pct = round(max(1.5, min(65.0, (850 - credit_score) / 10.5)), 1)

        return {
            "evaluation_timestamp": datetime.now().isoformat(),
            "farmer_profile": {
                "nic": farmer_nic,
                "name": farmer_name,
                "land_area_ha": land_area_ha,
                "crop": crop_type,
                "projected_revenue_lkr": round(projected_gross_revenue_lkr, 2)
            },
            "scorecard_results": {
                "agrarian_credit_score": credit_score,
                "score_range": "300 - 850",
                "risk_tier": risk_tier,
                "risk_tier_si": risk_tier_si,
                "approval_status": approval_status,
                "estimated_default_probability_pct": default_prob_pct,
                "color_indicator": color
            },
            "pillar_subscores": {
                "land_tenure_score": round(tenure_score, 1),
                "irrigation_resilience_score": round(irrig_score, 1),
                "yield_and_experience_score": round(exp_score, 1),
                "debt_to_income_dti_score": round(dti_score, 1),
                "crop_insurance_score": round(insurance_score, 1)
            },
            "credit_terms": {
                "requested_fertilizer_capital_lkr": round(fertilizer_capital_needed_lkr, 2),
                "approved_maximum_loan_lkr": round(max_loan_limit, 2),
                "applicable_concessionary_apr_pct": apr_pct,
                "loan_tenor_months": 6  # Single cropping season (Maha or Yala)
            },
            "advisory_summary_si": (
                f"ගොවි මහතා: {farmer_name} (NIC: {farmer_nic}). "
                f"ණය ලකුණු සංඛ්‍යාව: {credit_score} ({risk_tier_si}). "
                f"තීරණය: {approval_status}. අනුමත උපරිම පොහොර ණය සීමාව රු. {max_loan_limit:,.0f} "
                f"(වාර්ෂික සහන පොලිය {apr_pct}%). පැහැර හැරීමේ සම්භාවිතාව {default_prob_pct}% කි."
            )
        }

if __name__ == "__main__":
    scorecard = AgrarianMicroCreditScorecardEngine()

    print("=== TEST 1: Prime Low-Risk Farmer (Mahaweli H Area, Deed, Canal Irrigated, AAIB Insured) ===")
    app1 = scorecard.evaluate_credit_application(
        farmer_nic="197412345678",
        farmer_name="R.M. Senarath Bandara",
        land_area_ha=1.5,
        crop_type="paddy",
        land_tenure="freehold_deed",
        irrigation_source="major_irrigation_canal",
        farming_experience_years=15,
        historical_yield_avg_tons_ha=5.2,
        existing_seasonal_debt_lkr=30000.0,
        expected_crop_price_per_kg_lkr=120.0,
        has_aaib_crop_insurance=True
    )
    print(f"Credit Score: {app1['scorecard_results']['agrarian_credit_score']} / 850")
    print(f"Risk Tier: {app1['scorecard_results']['risk_tier_si']}")
    print(f"Decision: {app1['scorecard_results']['approval_status']} (APR: {app1['credit_terms']['applicable_concessionary_apr_pct']}%)")
    print(f"Approved Limit: LKR {app1['credit_terms']['approved_maximum_loan_lkr']:,}")
    print(f"Summary: {app1['advisory_summary_si']}\n")

    print("=== TEST 2: High Risk Rainfed Tenant Farmer (Informal Lease, No Insurance) ===")
    app2 = scorecard.evaluate_credit_application(
        farmer_nic="199298765432",
        farmer_name="G.K. Pushpakumara",
        land_area_ha=1.0,
        crop_type="paddy",
        land_tenure="informal_tenant",
        irrigation_source="strictly_rainfed",
        farming_experience_years=3,
        historical_yield_avg_tons_ha=2.8,
        existing_seasonal_debt_lkr=80000.0,
        expected_crop_price_per_kg_lkr=110.0,
        has_aaib_crop_insurance=False
    )
    print(f"Credit Score: {app2['scorecard_results']['agrarian_credit_score']} / 850")
    print(f"Risk Tier: {app2['scorecard_results']['risk_tier_si']}")
    print(f"Decision: {app2['scorecard_results']['approval_status']}")
