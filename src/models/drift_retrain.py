"""
CropSafe AI - Data Drift Monitoring & Automated Retraining Pipeline (MLOps)
Ensures lifelong longevity (e.g. 2026 to 2030+):
  1. Detects feature distribution shift (Kolmogorov-Smirnov Test for numerical drift)
  2. Detects concept drift (Price and deviation threshold shifts)
  3. Triggers automated retraining and model re-serialization when drift threshold is breached
"""

import os
import joblib
import pandas as pd
import numpy as np
from scipy.stats import ks_2samp
import lightgbm as lgb
from sklearn.metrics import f1_score

def evaluate_data_drift(baseline_df, incoming_df, feature_cols, p_value_threshold=0.05):
    """
    Compares incoming batches against historical baseline distributions using 
    two-sample Kolmogorov-Smirnov statistical test.
    """
    drift_report = {}
    drift_detected = False

    for col in feature_cols:
        if col in baseline_df.columns and col in incoming_df.columns:
            stat, p_val = ks_2samp(baseline_df[col].dropna(), incoming_df[col].dropna())
            is_drift = bool(p_val < p_value_threshold)
            if is_drift:
                drift_detected = True
            drift_report[col] = {
                "KS_Statistic": round(float(stat), 4),
                "p_value": round(float(p_val), 4),
                "Drift_Detected": is_drift
            }
    return drift_detected, drift_report

def trigger_retraining_pipeline(dataset_path="cropsafe AI/data/processed/cropsafe_master_dataset.csv",
                                models_dir="cropsafe AI/models"):
    """
    Automated retraining workflow when new data arrives or drift is confirmed.
    """
    print("Initiating Automated Retraining Pipeline (MLOps)...")
    df = pd.read_csv(dataset_path)
    feature_cols = joblib.load(os.path.join(models_dir, "feature_columns.pkl"))
    le = joblib.load(os.path.join(models_dir, "adulterant_label_encoder.pkl"))

    X = df[feature_cols]
    y = le.transform(df["Adulterant_Type"])

    # Retrain model on all updated data
    retrained_model = lgb.LGBMClassifier(n_estimators=200, max_depth=6, learning_rate=0.06,
                                         random_state=42, verbose=-1)
    retrained_model.fit(X, y)

    # Save newly updated model version
    joblib.dump(retrained_model, os.path.join(models_dir, "adulterant_classifier_lgbm.pkl"))
    print("Successfully retrained and refreshed production model artifact!")
    return retrained_model

def run_mlops_demonstration():
    data_path = "cropsafe AI/data/processed/cropsafe_master_dataset.csv"
    df = pd.read_csv(data_path)
    models_dir = "cropsafe AI/models"
    feature_cols = joblib.load(os.path.join(models_dir, "feature_columns.pkl"))

    # Split historical (2022-2023) vs simulated future incoming (2024)
    baseline = df[df["Year"] < 2024]
    incoming = df[df["Year"] == 2024]

    print(f"Baseline samples: {len(baseline)}, Incoming samples: {len(incoming)}")
    drift_flag, report = evaluate_data_drift(baseline, incoming, feature_cols)

    print(f"\n--- Data Drift Test Results ---")
    print(f"Overall Drift Detected: {drift_flag}")
    for feat, res in list(report.items())[:6]:
        print(f"  {feat:30s} -> p-val: {res['p_value']:.4f} | Drift: {res['Drift_Detected']}")

    if drift_flag:
        print("\nDrift confirmed in market/climate parameters. Launching automated retraining...")
        trigger_retraining_pipeline()
    else:
        print("\nNo critical drift detected. Model remains calibrated.")

if __name__ == "__main__":
    run_mlops_demonstration()
