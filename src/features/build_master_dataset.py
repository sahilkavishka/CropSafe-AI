"""
CropSafe AI - Master Dataset Builder & Feature Engineering Pipeline
Merges laboratory tests with scraped HARTI benchmark prices, DCS agrarian statistics,
Open-Meteo climate data, and applies domain-specific multi-modal feature engineering.
"""

import os
import pandas as pd
import numpy as np

def load_and_enrich_dataset():
    raw_path = "cropsafe AI/data/raw/Fertilizer_compounds.csv"
    standards_path = "cropsafe AI/data/scraped/slsi_fertilizer_standards.csv"
    harti_path = "cropsafe AI/data/scraped/harti_price_benchmarks_2022_2024.csv"
    agrarian_path = "cropsafe AI/data/scraped/provincial_agrarian_stats.csv"
    weather_path = "cropsafe AI/data/scraped/sri_lanka_weather_2022_2024.csv"
    output_path = "cropsafe AI/data/processed/cropsafe_master_dataset.csv"

    print("Loading raw laboratory dataset...")
    df = pd.read_csv(raw_path)
    
    # 1. Parse dates and temporal features
    df["Test_Date"] = pd.to_datetime(df["Test_Date"])
    df["Year"] = df["Test_Date"].dt.year
    df["Month"] = df["Test_Date"].dt.month
    df["year_month"] = df["Test_Date"].dt.to_period("M").astype(str)

    # 2. Merge SLSI standards
    standards_df = pd.read_csv(standards_path)
    df = df.merge(standards_df, on="Product_Name", how="left")

    # Fill defaults if any product missing
    df["expected_n"] = df["expected_n"].fillna(0.0)
    df["expected_p"] = df["expected_p"].fillna(0.0)
    df["expected_k"] = df["expected_k"].fillna(0.0)
    df["max_moisture_pct"] = df["max_moisture_pct"].fillna(2.0)

    # 3. Chemical Deviations
    # Absolute deviation normalized by expected or reference scale
    df["dev_n"] = np.where(df["expected_n"] > 0, np.abs(df["Nitrogen_N_g_per_100g"] - df["expected_n"]) / df["expected_n"], 0.0)
    df["dev_p"] = np.where(df["expected_p"] > 0, np.abs(df["Phosphorus_P_g_per_100g"] - df["expected_p"]) / df["expected_p"], 0.0)
    df["dev_k"] = np.where(df["expected_k"] > 0, np.abs(df["Potassium_K_g_per_100g"] - df["expected_k"]) / df["expected_k"], 0.0)
    df["excess_moisture"] = np.maximum(0.0, df["Moisture_Content_pct"] - df["max_moisture_pct"])

    # Composite Chemical Deviation Score (%)
    df["Chemical_Deviation_Score"] = np.round((df["dev_n"] + df["dev_p"] + df["dev_k"] + (df["excess_moisture"] / 5.0)) * 100.0, 2)

    # Composite Quality Score (0 to 100)
    raw_quality = 100.0 - (df["Chemical_Deviation_Score"] * 1.5 + df["excess_moisture"] * 8.0)
    df["Quality_Score"] = np.clip(np.round(raw_quality, 1), 0.0, 100.0)

    # Multi-Class Adulterant Category Identification
    def detect_adulterant(row):
        if row["Quality_Score"] >= 85 and row["Lab_Certified"] == "Yes":
            return "Standard_Pure"
        if row["excess_moisture"] > 1.5:
            return "Moisture_Weight_Padding"
        if row["dev_n"] > 0.15 and row["dev_p"] > 0.15:
            return "Sand_Inert_Dilution"
        if row["Product_Name"] == "Urea" and row["dev_n"] > 0.10:
            return "Low_Grade_Urea"
        if "MOP" in row["Product_Name"] and row["dev_k"] > 0.12:
            return "Salt_NaCl_Substitution"
        if row["Quality_Score"] < 60:
            return "Heavy_Insoluble_Filler"
        return "Substandard_Blend"

    df["Adulterant_Type"] = df.apply(detect_adulterant, axis=1)

    # 4. Merge HARTI Benchmark Prices
    harti_df = pd.read_csv(harti_path)
    df = df.merge(harti_df, on=["Product_Name", "Year"], how="left")
    df["Benchmark_Price_LKR_kg"] = df["Benchmark_Price_LKR_kg"].fillna(df["Unit_Price_LKR_per_kg"])

    # Price Arbitrage / Gouging Calculation
    df["Price_Diff_From_Benchmark"] = np.round(df["Unit_Price_LKR_per_kg"] - df["Benchmark_Price_LKR_kg"], 2)
    df["Price_Deviation_Pct"] = np.round((df["Price_Diff_From_Benchmark"] / df["Benchmark_Price_LKR_kg"]) * 100.0, 2)

    # Price Arbitrage Flag (High price charged for substandard quality)
    df["Price_Arbitrage_Flag"] = (
        (df["Lab_Certified"] == "No") & 
        (df["Unit_Price_LKR_per_kg"] >= (df["Benchmark_Price_LKR_kg"] * 0.95))
    ).astype(int)

    # 5. Merge Agrarian Statistics (Demand & Cultivated Extent)
    agrarian_df = pd.read_csv(agrarian_path)
    df = df.merge(agrarian_df[["Region", "Season", "Product_Name", "Cultivated_Extent_ha", "Estimated_Regional_Demand_MT"]],
                  on=["Region", "Season", "Product_Name"], how="left")
    df["Cultivated_Extent_ha"] = df["Cultivated_Extent_ha"].fillna(50000)
    df["Estimated_Regional_Demand_MT"] = df["Estimated_Regional_Demand_MT"].fillna(5000.0)

    # 6. Merge Historical Climate / Weather Data
    weather_df = pd.read_csv(weather_path)
    df = df.merge(weather_df, on=["Region", "year_month"], how="left")
    df["monthly_rainfall_mm"] = df["monthly_rainfall_mm"].fillna(120.0)
    df["avg_temperature_c"] = df["avg_temperature_c"].fillna(27.0)

    # 7. Multi-Modal NLP Text Mining on 'Notes'
    high_risk_terms = ["clump", "expire", "opened", "retest", "damage", "poor", "leak"]
    medium_risk_terms = ["storage", "discount", "bulk", "batch", "partial"]
    positive_terms = ["direct", "certified", "standard", "fresh", "sealed"]

    def analyze_notes(text):
        if not isinstance(text, str) or pd.isna(text) or text.strip() == "":
            return 0.1, "Normal"
        t_low = text.lower()
        score = 0.2
        category = "Normal"
        for term in high_risk_terms:
            if term in t_low:
                score += 0.4
                category = "High_Risk"
        for term in medium_risk_terms:
            if term in t_low:
                score += 0.2
                if category != "High_Risk":
                    category = "Medium_Risk"
        for term in positive_terms:
            if term in t_low:
                score -= 0.1
                if category == "Normal":
                    category = "Low_Risk"
        return float(np.clip(score, 0.0, 1.0)), category

    nlp_res = df["Notes"].apply(analyze_notes)
    df["NLP_Risk_Score"] = [r[0] for r in nlp_res]
    df["NLP_Risk_Category"] = [r[1] for r in nlp_res]

    # Save to processed
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Master dataset successfully created at: {output_path}")
    print(f"Total Records: {len(df)}, Total Columns: {len(df.columns)}")
    print("\nAdulterant Distribution:\n", df["Adulterant_Type"].value_counts())
    print("\nPrice Arbitrage Detected Cases:\n", df["Price_Arbitrage_Flag"].value_counts())
    return df

if __name__ == "__main__":
    load_and_enrich_dataset()
