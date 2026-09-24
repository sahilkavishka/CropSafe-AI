"""
CropSafe AI - Master Dataset Builder & Feature Engineering Pipeline
Merges laboratory tests with scraped HARTI benchmark prices, DCS agrarian statistics,
Open-Meteo climate data, DoA crop nutrient/yield baselines, 25-district geo-spatial data,
and applies domain-specific multi-modal feature engineering.
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
    crop_path = "cropsafe AI/data/scraped/crop_nutrient_guidelines.csv"
    geo_path = "cropsafe AI/data/scraped/sri_lanka_25_districts_geo.csv"
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

    df["expected_n"] = df["expected_n"].fillna(0.0)
    df["expected_p"] = df["expected_p"].fillna(0.0)
    df["expected_k"] = df["expected_k"].fillna(0.0)
    df["max_moisture_pct"] = df["max_moisture_pct"].fillna(2.0)

    # 3. Chemical Deviations
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

    # 7. Merge Provincial Spatial Coordinates & Agro-Climatic Zone
    geo_df = pd.read_csv(geo_path)
    prov_geo = geo_df.groupby("Province").agg(
        Provincial_Center_Lat=("Latitude", "mean"),
        Provincial_Center_Lon=("Longitude", "mean"),
        Primary_Agro_Zone=("Zone", "first")
    ).reset_index()
    prov_geo.rename(columns={"Province": "Region"}, inplace=True)
    df = df.merge(prov_geo, on="Region", how="left")

    # 8. Agronomic Yield Impact & Economic Loss Modeling
    # Based on DoA paddy baseline (4.8 MT/ha at Rs. 115/kg = Rs. 552,000 baseline revenue/ha)
    base_yield_mt_ha = 4.8
    base_price_lkr_kg = 115.0
    
    # Calculate yield loss % proportionally to chemical deviation & substandard category
    def calculate_yield_loss_pct(row):
        if row["Adulterant_Type"] == "Standard_Pure":
            return 0.0
        # Yield loss scales with chemical deviation and moisture padding
        loss = (row["Chemical_Deviation_Score"] * 0.5) + (row["excess_moisture"] * 2.5)
        return float(np.clip(np.round(loss, 2), 2.0, 42.0))

    df["Estimated_Yield_Loss_Pct"] = df.apply(calculate_yield_loss_pct, axis=1)
    
    # Economic loss in LKR per hectare
    df["Estimated_Economic_Loss_LKR_per_ha"] = np.round(
        (df["Estimated_Yield_Loss_Pct"] / 100.0) * (base_yield_mt_ha * 1000.0) * base_price_lkr_kg, 2
    )

    # 9. Multi-Modal NLP Text Mining on 'Notes'
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

    # 10. Advanced Agronomic Stoichiometric & Economic Exploitation Features
    df['Total_Active_NPK'] = df['Nitrogen_N_g_per_100g'] + df['Phosphorus_P_g_per_100g'] + df['Potassium_K_g_per_100g']
    df['Estimated_Inert_Filler'] = np.maximum(0.0, 100.0 - (df['Total_Active_NPK'] + df['Moisture_Content_pct']))
    df['Ratio_N_to_P'] = np.round(df['Nitrogen_N_g_per_100g'] / np.maximum(df['Phosphorus_P_g_per_100g'], 0.1), 2)
    df['Ratio_N_to_K'] = np.round(df['Nitrogen_N_g_per_100g'] / np.maximum(df['Potassium_K_g_per_100g'], 0.1), 2)
    df['Moisture_Volatilization_Interaction'] = np.round(df['Moisture_Content_pct'] * df['dev_n'], 3)
    df['Cost_per_Gram_Active_Nutrient'] = np.round(df['Unit_Price_LKR_per_kg'] / (np.maximum(df['Total_Active_NPK'], 0.5) * 10.0), 3)
    df['Moisture_Cost_Waste_LKR_kg'] = np.round(df['Unit_Price_LKR_per_kg'] * (df['excess_moisture'] / 100.0), 2)

    # Save to processed
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Master dataset successfully created at: {output_path}")
    print(f"Total Records: {len(df)}, Total Columns: {len(df.columns)}")
    print("\nAdulterant Distribution:\n", df["Adulterant_Type"].value_counts())
    print("\nPrice Arbitrage Cases Detected:\n", df["Price_Arbitrage_Flag"].value_counts())
    print("\nMean Economic Loss on Substandard Batches: Rs.", 
          df[df["Estimated_Yield_Loss_Pct"] > 0]["Estimated_Economic_Loss_LKR_per_ha"].mean())
    return df

if __name__ == "__main__":
    load_and_enrich_dataset()
