"""
CropSafe AI - Crop Nutrient Requirements & Economic Yield Baseline Collector
Official nutrient recommendations from the Department of Agriculture (DoA) Sri Lanka,
Tea Research Institute (TRI), and baseline yield & farmgate price data from HARTI.
Used for:
  1. Smart Nutrient Compensation (calculating deficit kg if fertilizer is substandard)
  2. Alternative Crop Recommendations
  3. Yield Loss & Economic Impact Regression Modeling
"""

import os
import pandas as pd

# Official DoA & Research Institute Nutrient Recommendations (kg/hectare) and Baseline Yields
CROP_NUTRIENT_GUIDELINES = [
    {
        "Crop_Name": "Paddy (Rice)",
        "Category": "Cereal",
        "Typical_Season": "Maha & Yala",
        "Recommended_N_kg_ha": 105.0,
        "Recommended_P2O5_kg_ha": 25.0,
        "Recommended_K2O_kg_ha": 35.0,
        "Tolerance_Moisture_Sensitivity": "High",
        "Avg_Yield_MT_per_ha": 4.8,
        "Avg_Market_Price_LKR_per_kg": 115.0,
        "Critical_Deficiency_Impact": "Stunted tillering, unfilled grains, severe yield reduction (up to 40%)"
    },
    {
        "Crop_Name": "Maize (Corn)",
        "Category": "Grain / Feed",
        "Typical_Season": "Maha",
        "Recommended_N_kg_ha": 120.0,
        "Recommended_P2O5_kg_ha": 45.0,
        "Recommended_K2O_kg_ha": 40.0,
        "Tolerance_Moisture_Sensitivity": "Medium",
        "Avg_Yield_MT_per_ha": 5.2,
        "Avg_Market_Price_LKR_per_kg": 140.0,
        "Critical_Deficiency_Impact": "Poor cob filling, yellowing leaves, up to 35% yield reduction"
    },
    {
        "Crop_Name": "Tea (Mature VP)",
        "Category": "Plantation",
        "Typical_Season": "Year-round",
        "Recommended_N_kg_ha": 140.0,
        "Recommended_P2O5_kg_ha": 30.0,
        "Recommended_K2O_kg_ha": 90.0,
        "Tolerance_Moisture_Sensitivity": "Low",
        "Avg_Yield_MT_per_ha": 2.2,  # Made tea yield MT/ha
        "Avg_Market_Price_LKR_per_kg": 260.0,  # Green leaf benchmark
        "Critical_Deficiency_Impact": "Shoot elongation decline, chlorosis, long-term bush degradation"
    },
    {
        "Crop_Name": "Chili (Green Chili)",
        "Category": "Spice / Cash Crop",
        "Typical_Season": "Yala & Maha",
        "Recommended_N_kg_ha": 90.0,
        "Recommended_P2O5_kg_ha": 60.0,
        "Recommended_K2O_kg_ha": 60.0,
        "Tolerance_Moisture_Sensitivity": "High",
        "Avg_Yield_MT_per_ha": 8.5,
        "Avg_Market_Price_LKR_per_kg": 450.0,
        "Critical_Deficiency_Impact": "Flower drop, pod abortion, pod distortion, high financial loss"
    },
    {
        "Crop_Name": "Big Onion",
        "Category": "Vegetable / Cash Crop",
        "Typical_Season": "Yala",
        "Recommended_N_kg_ha": 80.0,
        "Recommended_P2O5_kg_ha": 70.0,
        "Recommended_K2O_kg_ha": 80.0,
        "Tolerance_Moisture_Sensitivity": "High",
        "Avg_Yield_MT_per_ha": 15.0,
        "Avg_Market_Price_LKR_per_kg": 220.0,
        "Critical_Deficiency_Impact": "Small bulb size, neck rot vulnerability, splitting"
    },
    {
        "Crop_Name": "Potato",
        "Category": "Tuber / Up-country",
        "Typical_Season": "Yala & Maha",
        "Recommended_N_kg_ha": 110.0,
        "Recommended_P2O5_kg_ha": 150.0,
        "Recommended_K2O_kg_ha": 120.0,
        "Tolerance_Moisture_Sensitivity": "High",
        "Avg_Yield_MT_per_ha": 18.0,
        "Avg_Market_Price_LKR_per_kg": 280.0,
        "Critical_Deficiency_Impact": "Tuber size reduction, scab susceptibility, severe economic drop"
    },
    {
        "Crop_Name": "Tomato",
        "Category": "Vegetable",
        "Typical_Season": "Year-round",
        "Recommended_N_kg_ha": 100.0,
        "Recommended_P2O5_kg_ha": 80.0,
        "Recommended_K2O_kg_ha": 70.0,
        "Tolerance_Moisture_Sensitivity": "High",
        "Avg_Yield_MT_per_ha": 22.0,
        "Avg_Market_Price_LKR_per_kg": 180.0,
        "Critical_Deficiency_Impact": "Blossom end rot (calcium/moisture imbalance), fruit softening"
    },
    {
        "Crop_Name": "Banana",
        "Category": "Fruit Crop",
        "Typical_Season": "Year-round",
        "Recommended_N_kg_ha": 160.0,
        "Recommended_P2O5_kg_ha": 40.0,
        "Recommended_K2O_kg_ha": 220.0,
        "Tolerance_Moisture_Sensitivity": "Medium",
        "Avg_Yield_MT_per_ha": 25.0,
        "Avg_Market_Price_LKR_per_kg": 130.0,
        "Critical_Deficiency_Impact": "Bunch weight loss, fragile peduncle, finger tip rot"
    },
    {
        "Crop_Name": "Coconut",
        "Category": "Plantation",
        "Typical_Season": "Year-round",
        "Recommended_N_kg_ha": 80.0,
        "Recommended_P2O5_kg_ha": 30.0,
        "Recommended_K2O_kg_ha": 110.0,
        "Tolerance_Moisture_Sensitivity": "Low",
        "Avg_Yield_MT_per_ha": 7.0,  # Nuts equivalent
        "Avg_Market_Price_LKR_per_kg": 90.0,
        "Critical_Deficiency_Impact": "Nut fall, yellowing of fronds, reduced copra content"
    },
    {
        "Crop_Name": "Rubber",
        "Category": "Plantation",
        "Typical_Season": "Year-round",
        "Recommended_N_kg_ha": 60.0,
        "Recommended_P2O5_kg_ha": 40.0,
        "Recommended_K2O_kg_ha": 40.0,
        "Tolerance_Moisture_Sensitivity": "Low",
        "Avg_Yield_MT_per_ha": 1.5,  # Dry rubber MT/ha
        "Avg_Market_Price_LKR_per_kg": 650.0,
        "Critical_Deficiency_Impact": "Latex yield reduction, bark renewal delay"
    }
]

def save_crop_nutrient_data(output_path="cropsafe AI/data/scraped/crop_nutrient_guidelines.csv"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df = pd.DataFrame(CROP_NUTRIENT_GUIDELINES)
    df.to_csv(output_path, index=False)
    print(f"Saved DoA crop nutrient & yield guidelines to {output_path} ({len(df)} crops).")
    return df

if __name__ == "__main__":
    save_crop_nutrient_data()
