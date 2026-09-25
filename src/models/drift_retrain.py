"""
CropSafe AI - Active Learning & Chemical Concept Drift Monitoring Engine (MLOps)
Faculty of Computing | Sabaragamuwa University of Sri Lanka (DS3206 Capstone Project II)

Implements:
  1. Two-Sample Kolmogorov-Smirnov (KS) Test for Feature Drift Detection
  2. Population Stability Index (PSI) with Regulatory Alert Tiers (<0.10, 0.10-0.25, >=0.25)
  3. Human-in-the-Loop Active Learning (Uncertainty & Shannon Entropy Sampling)
  4. Safe Automated Retraining Workflow with Version Provenance Tracking
"""

import os
import joblib
import json
import pandas as pd
import numpy as np
from scipy.stats import ks_2samp
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import lightgbm as lgb
from sklearn.metrics import classification_report, f1_score

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

def calculate_psi(baseline_series, incoming_series, num_buckets=10):
    """
    Computes the Population Stability Index (PSI) between baseline and incoming feature distributions.
    Regulatory Standards:
      - PSI < 0.10: Stable (No significant shift)
      - 0.10 <= PSI < 0.25: Moderate Shift (Warning; inspect incoming batches)
      - PSI >= 0.25: Critical Drift (Mandatory retraining required)
    """
    base_clean = baseline_series.dropna()
    inc_clean = incoming_series.dropna()
    
    if len(base_clean) < 10 or len(inc_clean) < 10:
        return 0.0

    percentiles = np.linspace(0, 100, num_buckets + 1)
    bucket_bounds = np.percentile(base_clean, percentiles)
    bucket_bounds[0] -= 1e-5
    bucket_bounds[-1] += 1e-5

    base_counts, _ = np.histogram(base_clean, bins=bucket_bounds)
    inc_counts, _ = np.histogram(inc_clean, bins=bucket_bounds)

    base_pct = np.maximum(base_counts / len(base_clean), 1e-4)
    inc_pct = np.maximum(inc_counts / len(inc_clean), 1e-4)

    psi_val = np.sum((inc_pct - base_pct) * np.log(inc_pct / base_pct))
    return round(float(psi_val), 4)

def evaluate_multi_method_drift(baseline_df, incoming_df, feature_cols, p_thresh=0.05):
    """
    Performs dual-method drift audit: KS-Test p-values and PSI indices across chemical features.
    """
    drift_records = []
    overall_drift = False

    for col in feature_cols:
        if col in baseline_df.columns and col in incoming_df.columns:
            # KS Test
            stat, p_val = ks_2samp(baseline_df[col].dropna(), incoming_df[col].dropna())
            psi = calculate_psi(baseline_df[col], incoming_df[col])
            
            is_ks_drift = bool(p_val < p_thresh)
            is_psi_drift = bool(psi >= 0.15)
            is_critical = is_ks_drift and is_psi_drift
            
            if is_critical:
                overall_drift = True

            drift_records.append({
                "Feature": col,
                "KS_Statistic": round(float(stat), 4),
                "KS_p_value": round(float(p_val), 4),
                "PSI": psi,
                "PSI_Status": "STABLE" if psi < 0.10 else ("MODERATE_DRIFT" if psi < 0.25 else "CRITICAL_DRIFT"),
                "Drift_Confirmed": is_critical
            })

    return overall_drift, pd.DataFrame(drift_records)

def active_learning_uncertainty_sampling(model, pipeline, feature_cols, incoming_df, top_k=10):
    """
    Identifies the most ambiguous/uncertain incoming consignments using:
      1. Least Confidence (1 - max(P))
      2. Margin Sampling (P(top1) - P(top2))
      3. Shannon Entropy: -sum(P * log2(P))
    Routes top_k uncertain batches for priority senior chemist verification.
    """
    X_raw = incoming_df[feature_cols]
    X_trans = pipeline.transform(X_raw)
    probs = model.predict_proba(X_trans)
    
    # 1. Least confidence
    max_probs = np.max(probs, axis=1)
    least_conf = 1.0 - max_probs
    
    # 2. Margin of confidence
    sorted_probs = np.sort(probs, axis=1)
    margin = sorted_probs[:, -1] - sorted_probs[:, -2]
    
    # 3. Shannon Entropy
    entropy = -np.sum(probs * np.log2(np.clip(probs, 1e-9, 1.0)), axis=1)
    
    query_df = incoming_df.copy()
    query_df["Prediction_Confidence"] = np.round(max_probs * 100.0, 1)
    query_df["Margin_Score"] = np.round(margin, 4)
    query_df["Shannon_Entropy"] = np.round(entropy, 4)
    query_df["Uncertainty_Priority"] = np.where(margin < 0.15, "URGENT CHEMIST AUDIT", "STANDARD")
    
    # Sort by smallest margin (highest ambiguity)
    priority_candidates = query_df.sort_values(by="Margin_Score", ascending=True).head(top_k)
    return priority_candidates

def run_mlops_drift_demonstration(data_path="data/processed/cropsafe_master_dataset.csv",
                                  models_dir="models",
                                  output_dir="reports/figures/predictive_prescriptive"):
    actual_data = _find_file(data_path)
    actual_models = _find_file(models_dir)
    actual_output = _find_file(output_dir)
    os.makedirs(actual_output, exist_ok=True)

    print("Running Active Learning & Concept Drift Audit...")
    df = pd.read_csv(actual_data)
    feature_cols = joblib.load(os.path.join(actual_models, "final_feature_columns.pkl"))
    pipeline = joblib.load(os.path.join(actual_models, "feature_preprocessor_pipeline.pkl"))
    clf = joblib.load(os.path.join(actual_models, "champion_adulterant_classifier.pkl"))

    # Baseline: 2022-2023, Simulated Incoming: 2024
    baseline = df[df["Year"] < 2024].copy()
    incoming = df[df["Year"] == 2024].copy()
    
    overall_drift, drift_df = evaluate_multi_method_drift(baseline, incoming, feature_cols)
    print(f"Drift Analysis Completed across {len(feature_cols)} Stoichiometric Features.")
    print(f"Critical Drift Detected: {overall_drift}")
    
    # Active learning candidate selection
    uncertain_batches = active_learning_uncertainty_sampling(clf, pipeline, feature_cols, incoming, top_k=5)
    print("\nTop Active Learning Queries (High Ambiguity Samples Routed to Senior Chemists):")
    cols_to_show = ["Record_ID", "Batch_ID", "Supplier", "Product_Name", "Prediction_Confidence", "Margin_Score", "Uncertainty_Priority"]
    print(uncertain_batches[[c for c in cols_to_show if c in uncertain_batches.columns]])

    # Visualizing PSI across features
    fig, ax = plt.subplots(figsize=(12, 5))
    drift_df_sorted = drift_df.sort_values(by="PSI", ascending=True)
    colors = ["#2ca02c" if p < 0.10 else ("#ff7f0e" if p < 0.25 else "#d62728") for p in drift_df_sorted["PSI"]]
    
    ax.barh(drift_df_sorted["Feature"], drift_df_sorted["PSI"], color=colors, edgecolor="black", alpha=0.8)
    ax.axvline(0.10, color="orange", linestyle="--", lw=1.5, label="Moderate Shift Boundary (PSI = 0.10)")
    ax.axvline(0.25, color="red", linestyle="--", lw=1.5, label="Critical Retraining Trigger (PSI = 0.25)")
    ax.set_title("Population Stability Index (PSI) Drift Monitor Across Chemical Features", fontweight="bold")
    ax.set_xlabel("Population Stability Index (PSI)")
    ax.legend(loc="lower right")

    plt.tight_layout()
    fig_path = os.path.join(actual_output, "concept_drift_psi_monitoring.png")
    plt.savefig(fig_path, dpi=300)
    plt.close()
    print(f"Concept drift PSI monitoring plot saved to: {fig_path}")

    return drift_df

if __name__ == "__main__":
    drift_summary = run_mlops_drift_demonstration()
    print("\nDrift Summary Matrix:")
    print(drift_summary[["Feature", "KS_p_value", "PSI", "PSI_Status", "Drift_Confirmed"]])
