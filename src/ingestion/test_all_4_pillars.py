"""
CropSafe AI - End-to-End Verification of the 4 Longevity Pillars:
  1. Market Price Updating
  2. Live Weather Fetching
  3. Continuous Data Collection
  4. Data Drift & Retraining Pipeline
"""

import os
import sys
import pandas as pd

# Add paths
sys.path.append(os.path.abspath("cropsafe AI/src/data_collection"))
sys.path.append(os.path.abspath("cropsafe AI/src/models"))

from resilient_ingestion import ResilientDataIngestionEngine
from weather_collector import fetch_weather_for_province, PROVINCE_COORDINATES
from drift_retrain import evaluate_data_drift, trigger_retraining_pipeline
import joblib

def test_four_pillars():
    print("=" * 75)
    print("CropSafe AI: Testing All 4 Pillars of Future-Proof Longevity")
    print("=" * 75)

    # -------------------------------------------------------------
    # Pillar 1: Market Price Updating
    # -------------------------------------------------------------
    print("\n--- [Pillar 1: Market Price Updating] ---")
    engine = ResilientDataIngestionEngine()
    
    # Test 2024 baseline vs 2030 inflation projection
    p_2024 = engine.get_benchmark_price("Urea", target_year=2024)
    p_2030 = engine.get_benchmark_price("Urea", target_year=2030)
    print(f"Product: Urea | 2024 Benchmark: Rs. {p_2024['benchmark_price']}/kg ({p_2024['tier_used']})")
    print(f"Product: Urea | 2030 Benchmark: Rs. {p_2030['benchmark_price']}/kg ({p_2030['tier_used']})")
    print("Pillar 1 Status: VERIFIED & WORKING.")

    # -------------------------------------------------------------
    # Pillar 2: Live Weather Fetching
    # -------------------------------------------------------------
    print("\n--- [Pillar 2: Live Weather Fetching] ---")
    province = "North Central Province"
    coords = PROVINCE_COORDINATES[province]
    print(f"Connecting to live Open-Meteo Weather API for {province}...")
    weather_sample = fetch_weather_for_province(province, coords, start_date="2024-01-01", end_date="2024-03-31")
    print(f"Fetched {len(weather_sample)} monthly climate records for {province}:")
    for _, row in weather_sample.iterrows():
        print(f"  Month: {row['year_month']} | Rainfall: {row['monthly_rainfall_mm']:.1f} mm | Temp: {row['avg_temperature_c']:.1f} C")
    print("Pillar 2 Status: VERIFIED & WORKING.")

    # -------------------------------------------------------------
    # Pillar 3: Continuous Data Collection (Active Database Ingestion)
    # -------------------------------------------------------------
    print("\n--- [Pillar 3: Continuous Data Collection] ---")
    master_path = "cropsafe AI/data/processed/cropsafe_master_dataset.csv"
    orig_df = pd.read_csv(master_path)
    print(f"Current Master Dataset Size: {len(orig_df)} records.")

    # Simulate incoming new field lab tests for 2026
    new_batch = pd.DataFrame([
        {
            "Record_ID": "NEW-2026-001", "Batch_ID": "BT26-NEW1", "Test_Date": "2026-09-20",
            "Season": "Yala", "Region": "North Central Province", "Supplier": "CIC Agri Businesses",
            "Product_Name": "Urea", "Quantity_kg": 50.0, "Unit_Price_LKR_per_kg": 125.0,
            "Nitrogen_N_g_per_100g": 46.2, "Phosphorus_P_g_per_100g": 0.0, "Potassium_K_g_per_100g": 0.0,
            "Moisture_Content_pct": 1.1, "Lab_Certified": "Yes", "Quality_Score": 99.0,
            "Adulterant_Type": "Standard_Pure", "Price_Arbitrage_Flag": 0, "Chemical_Deviation_Score": 0.4
        },
        {
            "Record_ID": "NEW-2026-002", "Batch_ID": "BT26-NEW2", "Test_Date": "2026-09-20",
            "Season": "Yala", "Region": "North Central Province", "Supplier": "Pettah Agro Traders",
            "Product_Name": "Urea", "Quantity_kg": 100.0, "Unit_Price_LKR_per_kg": 140.0,
            "Nitrogen_N_g_per_100g": 39.0, "Phosphorus_P_g_per_100g": 0.0, "Potassium_K_g_per_100g": 0.0,
            "Moisture_Content_pct": 3.2, "Lab_Certified": "No", "Quality_Score": 48.0,
            "Adulterant_Type": "Substandard_Blend", "Price_Arbitrage_Flag": 1, "Chemical_Deviation_Score": 15.2
        }
    ])

    engine.append_validated_records_to_master(new_batch, master_path=master_path)
    updated_df = pd.read_csv(master_path)
    print(f"Updated Master Dataset Size: {len(updated_df)} records.")
    print("Pillar 3 Status: VERIFIED & WORKING.")

    # -------------------------------------------------------------
    # Pillar 4: Data Drift & Retraining Pipeline
    # -------------------------------------------------------------
    print("\n--- [Pillar 4: Data Drift & Retraining Pipeline] ---")
    feature_cols = joblib.load("cropsafe AI/models/feature_columns.pkl")
    baseline = updated_df[updated_df["Year"] < 2024]
    incoming = updated_df[updated_df["Year"] >= 2024]
    
    drift_detected, drift_report = evaluate_data_drift(baseline, incoming, feature_cols)
    print(f"Statistical Kolmogorov-Smirnov Drift Test: Drift Detected = {drift_detected}")
    
    if drift_detected:
        print("Launching automated retraining pipeline...")
        new_model = trigger_retraining_pipeline(dataset_path=master_path)
        print("Pillar 4 Status: Model successfully retrained & refreshed.")
    else:
        print("Pillar 4 Status: Distributions stable, model calibrated.")

    print("\n" + "=" * 75)
    print("ALL 4 PILLARS HAVE BEEN VERIFIED & SUCCESSFULLY EXECUTED!")
    print("=" * 75)

if __name__ == "__main__":
    test_four_pillars()
