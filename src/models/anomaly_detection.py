"""
CropSafe AI - Unsupervised Anomaly Detection & Price Arbitrage Engine
Applies Isolation Forest and Local Outlier Factor (LOF) to automatically discover:
  1. Subtle, previously unseen chemical adulterations (Chemical Outliers)
  2. Predatory price gouging / Arbitrage patterns (Price Outliers)
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import StandardScaler

def train_anomaly_detectors(data_path="cropsafe AI/data/processed/cropsafe_master_dataset.csv",
                            models_dir="cropsafe AI/models",
                            reports_dir="cropsafe AI/reports"):
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    print("Loading master dataset for Unsupervised Anomaly Detection...")
    df = pd.read_csv(data_path)

    # 1. Chemical Composition Features for Anomaly Detection
    chem_features = [
        "Nitrogen_N_g_per_100g", "Phosphorus_P_g_per_100g", "Potassium_K_g_per_100g",
        "Moisture_Content_pct", "Chemical_Deviation_Score"
    ]
    
    # 2. Price-Quality Features for Arbitrage Anomaly Detection
    price_features = [
        "Unit_Price_LKR_per_kg", "Benchmark_Price_LKR_kg", "Price_Deviation_Pct", "Quality_Score"
    ]

    scaler_chem = StandardScaler()
    X_chem_scaled = scaler_chem.fit_transform(df[chem_features])

    scaler_price = StandardScaler()
    X_price_scaled = scaler_price.fit_transform(df[price_features])

    # 3. Isolation Forest for Chemical Adulteration Outliers
    # Contamination set to approx 25% based on empirical substandard prevalence
    iso_forest = IsolationForest(n_estimators=150, contamination=0.25, random_state=42)
    iso_forest.fit(X_chem_scaled)
    df["Chem_Anomaly_Prediction"] = iso_forest.predict(X_chem_scaled) # -1 = Outlier, 1 = Inlier
    df["Chem_Anomaly_Score"] = iso_forest.decision_function(X_chem_scaled)

    # 4. Local Outlier Factor (LOF) for Price Arbitrage Outliers
    lof = LocalOutlierFactor(n_neighbors=20, contamination=0.15, novelty=True)
    lof.fit(X_price_scaled)
    df["Price_Anomaly_Prediction"] = lof.predict(X_price_scaled) # -1 = Outlier, 1 = Inlier
    df["Price_Anomaly_Score"] = lof.decision_function(X_price_scaled)

    # Save models and scalers
    joblib.dump(iso_forest, os.path.join(models_dir, "iso_forest_chemical.pkl"))
    joblib.dump(scaler_chem, os.path.join(models_dir, "scaler_chem_anomaly.pkl"))
    joblib.dump(lof, os.path.join(models_dir, "lof_price_arbitrage.pkl"))
    joblib.dump(scaler_price, os.path.join(models_dir, "scaler_price_anomaly.pkl"))

    chem_outliers = (df["Chem_Anomaly_Prediction"] == -1).sum()
    price_outliers = (df["Price_Anomaly_Prediction"] == -1).sum()

    print(f"Chemical Outliers Detected: {chem_outliers} ({chem_outliers/len(df)*100:.1f}%)")
    print(f"Price Arbitrage Outliers Detected: {price_outliers} ({price_outliers/len(df)*100:.1f}%)")

    # Generate Summary Report
    report_md = f"""# CropSafe AI: Unsupervised Anomaly Detection & Price Arbitrage Report
**Techniques:** Isolation Forest (Chemical Anomalies) & Local Outlier Factor (Price Arbitrage)

---

## 1. Unsupervised Chemical Adulteration Detection (Isolation Forest)
* **Outliers Flagged:** {chem_outliers} consignments ({chem_outliers/len(df)*100:.1f}%)
* **Significance:** Detects consignments exhibiting abnormal NPK moisture relationships without requiring explicit human labeling.

## 2. Unsupervised Price Arbitrage Discovery (Local Outlier Factor)
* **Price Gouging Outliers:** {price_outliers} consignments ({price_outliers/len(df)*100:.1f}%)
* **Significance:** Flags consignments where low chemical quality deviates substantially from local peer price neighborhoods.
"""
    with open(os.path.join(reports_dir, "anomaly_detection_report.md"), "w", encoding="utf-8") as f:
        f.write(report_md)
    print("Anomaly detection models and report saved successfully.")

if __name__ == "__main__":
    train_anomaly_detectors()
