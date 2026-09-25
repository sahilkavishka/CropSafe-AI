"""
CropSafe AI - Game-Theoretic Black-Market Smuggling & Arbitrage Equilibrium Engine
Faculty of Computing | Sabaragamuwa University of Sri Lanka (DS3206 Capstone Project II)

Implements:
  1. Game-Theoretic Strategic Interaction Model (Illicit Adulterator vs State Regulator)
  2. Expected Profit Payoff Matrix under Asymmetric Information & Risk
  3. Nash Equilibrium Critical Deterrence Inspection Probability (P*) Formula
  4. Cross-Provincial Deterrence Policy Calibration (Anuradhapura, Kurunegala, Jaffna, Badulla)
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

def _find_file(relative_path):
    candidates = [
        relative_path,
        os.path.join("cropsafe AI", relative_path),
        os.path.join("..", relative_path),
        os.path.join("..", "cropsafe AI", relative_path)
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return relative_path

def compute_deterrence_equilibrium(market_price_lkr_kg, adulterant_cost_lkr_kg, batch_size_mt=50.0,
                                   statutory_fine_lkr=50000.0, legal_seizure_rate=1.0):
    """
    Computes expected payoffs and critical inspection probability P* that reduces illicit profit to zero.
    """
    q_kg = batch_size_mt * 1000.0
    
    # Payoff when successful (no inspection)
    revenue = market_price_lkr_kg * q_kg
    cost_adulterated = adulterant_cost_lkr_kg * q_kg
    profit_evade = revenue - cost_adulterated
    
    # Payoff when apprehended by NFS / Police inspectors
    # Lost inventory value + statutory court fine
    loss_seizure = (cost_adulterated * legal_seizure_rate)
    profit_caught = -(statutory_fine_lkr + loss_seizure)
    
    # Critical Inspection Probability P* where E[Profit] = 0 (Nash Indifference Boundary)
    # (1 - P*) * profit_evade + P* * profit_caught = 0
    # profit_evade - P* * (profit_evade - profit_caught) = 0
    p_star = profit_evade / (profit_evade - profit_caught)
    p_star = np.clip(p_star, 0.01, 0.99)
    
    return {
        "Batch_Size_MT": batch_size_mt,
        "Market_Price_LKR_kg": market_price_lkr_kg,
        "Adulterant_Cost_LKR_kg": adulterant_cost_lkr_kg,
        "Illicit_Evade_Profit_LKR": round(profit_evade, 2),
        "Apprehended_Loss_LKR": round(profit_caught, 2),
        "Critical_Deterrence_P_Star": round(float(p_star), 4),
        "Deterrence_Percentage": f"{p_star*100:.1f}%"
    }

def analyze_provincial_deterrence_equilibria(output_dir="reports/figures/predictive_prescriptive"):
    actual_dir = _find_file(output_dir)
    os.makedirs(actual_dir, exist_ok=True)
    
    # Regional market benchmarks under HARTI and Department of Agriculture data
    provincial_scenarios = [
        {"Region": "North Central (Anuradhapura)", "Market_Price": 140.0, "Adulterant_Cost": 42.0, "Batch_MT": 60, "Fine": 100000.0, "Current_Audit_Rate": 0.18},
        {"Region": "North Western (Kurunegala)",  "Market_Price": 135.0, "Adulterant_Cost": 40.0, "Batch_MT": 50, "Fine": 75000.0,  "Current_Audit_Rate": 0.22},
        {"Region": "Northern (Jaffna)",            "Market_Price": 160.0, "Adulterant_Cost": 48.0, "Batch_MT": 35, "Fine": 100000.0, "Current_Audit_Rate": 0.12},
        {"Region": "Uva (Badulla/Monaragala)",     "Market_Price": 145.0, "Adulterant_Cost": 44.0, "Batch_MT": 40, "Fine": 50000.0,  "Current_Audit_Rate": 0.10},
        {"Region": "Western (Colombo / Gampaha)",   "Market_Price": 125.0, "Adulterant_Cost": 38.0, "Batch_MT": 80, "Fine": 100000.0, "Current_Audit_Rate": 0.35}
    ]
    
    records = []
    for sc in provincial_scenarios:
        res = compute_deterrence_equilibrium(
            market_price_lkr_kg=sc["Market_Price"],
            adulterant_cost_lkr_kg=sc["Adulterant_Cost"],
            batch_size_mt=sc["Batch_MT"],
            statutory_fine_lkr=sc["Fine"]
        )
        p_star = res["Critical_Deterrence_P_Star"]
        curr_p = sc["Current_Audit_Rate"]
        gap = round((p_star - curr_p) * 100.0, 1)
        
        records.append({
            "Region": sc["Region"],
            "Market_Price_LKR": sc["Market_Price"],
            "Adulterant_Cost_LKR": sc["Adulterant_Cost"],
            "Batch_MT": sc["Batch_MT"],
            "Illicit_Profit_if_Evaded_LKR": res["Illicit_Evade_Profit_LKR"],
            "Loss_if_Caught_LKR": res["Apprehended_Loss_LKR"],
            "Required_P_Star_Pct": round(p_star * 100.0, 1),
            "Current_Audit_Rate_Pct": round(curr_p * 100.0, 1),
            "Deterrence_Deficit_Pct": gap,
            "Enforcement_Policy_Directive": "CRITICAL RAID SURGE REQUIRED" if gap > 20 else ("MODERATE INCREASE" if gap > 0 else "EFFECTIVE DETERRENCE")
        })

    eq_df = pd.DataFrame(records)
    
    # 2-panel visualization: Payoff Curve and Regional P* Deficit
    fig, axes = plt.subplots(1, 2, figsize=(16, 5))
    
    # Plot 1: Expected Profit vs Inspection Probability Curve (Anuradhapura Case)
    p_range = np.linspace(0.0, 1.0, 100)
    profit_evade_sample = eq_df.iloc[0]["Illicit_Profit_if_Evaded_LKR"]
    loss_caught_sample = eq_df.iloc[0]["Loss_if_Caught_LKR"]
    expected_profits = (1.0 - p_range) * profit_evade_sample + p_range * loss_caught_sample
    
    axes[0].plot(p_range * 100.0, expected_profits / 1e6, lw=2.5, color="#d62728", label="Expected Illicit Payoff E[Profit]")
    axes[0].axhline(0, color="black", linestyle="--", lw=1.5, label="Break-Even / Indifference Boundary")
    p_star_val = eq_df.iloc[0]["Required_P_Star_Pct"]
    axes[0].axvline(p_star_val, color="green", linestyle="-.", lw=2, label=f"Critical P* Threshold ({p_star_val:.1f}%)")
    axes[0].set_title("Smuggler Payoff Curve vs Inspection Intensity (North Central)", fontweight="bold")
    axes[0].set_xlabel("State Inspection Probability (%)")
    axes[0].set_ylabel("Expected Smuggler Profit (Million LKR)")
    axes[0].legend(loc="upper right")
    
    # Plot 2: Regional Required P* vs Current Audit Rate
    x = np.arange(len(eq_df))
    width = 0.35
    axes[1].bar(x - width/2, eq_df["Required_P_Star_Pct"], width, label="Required P* for Complete Deterrence", color="#d62728", alpha=0.85)
    axes[1].bar(x + width/2, eq_df["Current_Audit_Rate_Pct"], width, label="Current Regional Inspection Rate", color="#1f77b4", alpha=0.85)
    axes[1].set_title("Regional Inspection Deterrence Gaps Across Sri Lanka", fontweight="bold")
    axes[1].set_xticks(x)
    axes[1].set_xticklabels([r.split()[0] for r in eq_df["Region"]], rotation=20)
    axes[1].set_ylabel("Inspection Probability (%)")
    axes[1].legend(loc="upper right")

    plt.tight_layout()
    fig_path = os.path.join(actual_dir, "game_theoretic_deterrence_equilibrium.png")
    plt.savefig(fig_path, dpi=300)
    plt.close()
    print(f"Game-theoretic deterrence equilibrium graphic saved to: {fig_path}")

    return eq_df

if __name__ == "__main__":
    print("Testing Game-Theoretic Smuggling Deterrence Equilibrium Engine...")
    summary = analyze_provincial_deterrence_equilibria()
    print("\nRegional Equilibrium & Deterrence Matrix:")
    print(summary[["Region", "Illicit_Profit_if_Evaded_LKR", "Required_P_Star_Pct", "Current_Audit_Rate_Pct", "Enforcement_Policy_Directive"]])
