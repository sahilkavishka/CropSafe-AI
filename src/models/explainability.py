"""
CropSafe AI - Explainable AI (XAI) Engine with SHAP
Computes feature importance, SHAP beeswarm plots, and generates individual sample diagnostic explanations.
"""

import os
import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import shap

def run_explainability(data_path="cropsafe AI/data/processed/cropsafe_master_dataset.csv",
                       models_dir="cropsafe AI/models",
                       output_dir="cropsafe AI/reports/figures"):
    os.makedirs(output_dir, exist_ok=True)
    print("Loading data and model for Explainable AI (SHAP)...")

    df = pd.read_csv(data_path)
    feature_cols = joblib.load(os.path.join(models_dir, "feature_columns.pkl"))
    model = joblib.load(os.path.join(models_dir, "adulterant_classifier_lgbm.pkl"))
    le = joblib.load(os.path.join(models_dir, "adulterant_label_encoder.pkl"))

    X = df[feature_cols].copy()

    # Compute SHAP values with TreeExplainer
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X.iloc[:400]) # Representative subset for speed & clarity

    # Generate and save SHAP summary plot
    plt.figure(figsize=(10, 6))
    if isinstance(shap_values, list):
        # Multi-class list of arrays
        shap.summary_plot(shap_values, X.iloc[:400], class_names=le.classes_, show=False)
    else:
        shap.summary_plot(shap_values, X.iloc[:400], show=False)
    
    plt.title("SHAP Multi-Class Feature Importance Summary (CropSafe AI)", fontsize=13, weight="bold")
    plt.tight_layout()
    shap_plot_path = os.path.join(output_dir, "xai_shap_summary.png")
    plt.savefig(shap_plot_path, dpi=300, bbox_inches="tight")
    plt.close()
    print(f"SHAP summary plot successfully saved to: {shap_plot_path}")

    # Function to generate human-readable diagnostic report for any individual sample
    def explain_sample(sample_row):
        explanations = []
        if sample_row["excess_moisture"] > 0:
            explanations.append(f"Excess moisture of {sample_row['excess_moisture']:.1f}% detected above SLSI safety limits (Risk of clumping and weight inflation).")
        if sample_row["dev_n"] > 0.10:
            explanations.append(f"Nitrogen (N) deviates by {sample_row['dev_n']*100:.1f}% from expected standard formulation.")
        if sample_row["dev_p"] > 0.10:
            explanations.append(f"Phosphorus (P) is deficient by {sample_row['dev_p']*100:.1f}%.")
        if sample_row["dev_k"] > 0.10:
            explanations.append(f"Potassium (K) deviates by {sample_row['dev_k']*100:.1f}%.")
        if sample_row["Price_Deviation_Pct"] > 15:
            explanations.append(f"Price is inflated by {sample_row['Price_Deviation_Pct']:.1f}% above official benchmark.")
        if not explanations:
            explanations.append("All chemical parameters and price metrics comply with standard regulatory tolerances.")
        return explanations

    # Test explanation on first substandard sample
    sub_sample = df[df["Adulterant_Type"] != "Standard_Pure"].iloc[0]
    sample_diag = explain_sample(sub_sample)
    print("\n--- Example Auto-Generated Diagnostic Report ---")
    print(f"Sample Batch: {sub_sample.get('Batch_ID', 'BATCH-001')} | Adulterant: {sub_sample['Adulterant_Type']}")
    for d in sample_diag:
        print(f" • {d}")

if __name__ == "__main__":
    run_explainability()
