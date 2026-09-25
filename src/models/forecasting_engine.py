"""
CropSafe AI - Predictive Intelligence Suite
Faculty of Computing | Sabaragamuwa University of Sri Lanka (DS3206 Capstone Project II)

Provides:
  1. Regional Fertilizer Demand Forecasting (Gradient Boosting Regressor)
  2. Shelf-Life & Clumping Degradation Estimator (Days to Expiry based on Tropical CRH)
  3. Agronomic Yield Loss & Economic Financial Impact Predictor
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error, mean_absolute_percentage_error

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

def train_forecasting_models(data_path="data/processed/cropsafe_master_dataset.csv",
                             models_dir="models",
                             reports_dir="reports"):
    actual_data_path = _find_file(data_path)
    actual_models_dir = _find_file(models_dir)
    actual_reports_dir = _find_file(reports_dir)

    os.makedirs(actual_models_dir, exist_ok=True)
    os.makedirs(actual_reports_dir, exist_ok=True)

    print("Loading master dataset for Predictive Intelligence...")
    df = pd.read_csv(actual_data_path)

    # 1. Regional Fertilizer Demand Forecasting Model
    demand_features = ["Cultivated_Extent_ha", "monthly_rainfall_mm", "avg_temperature_c"]
    df_encoded = pd.get_dummies(df[["Region", "Season", "Product_Name"]], drop_first=True)
    X_demand = pd.concat([df[demand_features], df_encoded], axis=1)
    y_demand = df["Estimated_Regional_Demand_MT"]

    X_train_d, X_test_d, y_train_d, y_test_d = train_test_split(
        X_demand, y_demand, test_size=0.2, random_state=42
    )

    demand_regressor = GradientBoostingRegressor(n_estimators=160, max_depth=5, learning_rate=0.08, random_state=42)
    demand_regressor.fit(X_train_d, y_train_d)
    y_pred_d = demand_regressor.predict(X_test_d)

    r2_demand = r2_score(y_test_d, y_pred_d)
    mae_demand = mean_absolute_error(y_test_d, y_pred_d)
    mape_demand = mean_absolute_percentage_error(y_test_d, y_pred_d) * 100.0
    print(f"Demand Forecaster -> R2: {r2_demand:.4f} | MAE: {mae_demand:.2f} MT | MAPE: {mape_demand:.2f}%")

    joblib.dump(demand_regressor, os.path.join(actual_models_dir, "demand_forecaster_gb.pkl"))
    joblib.dump(list(X_demand.columns), os.path.join(actual_models_dir, "demand_feature_columns.pkl"))

    # 2. Shelf-Life & Clumping Degradation Estimator
    def compute_shelf_life(row):
        baseline_days = 365.0
        moisture = row["Moisture_Content_pct"]
        excess = row["excess_moisture"]
        zone = row.get("Primary_Agro_Zone", "Dry Zone")
        rh_factor = 1.45 if zone == "Wet Zone" else (1.15 if zone == "Intermediate Zone" else 0.85)
        is_adulterated = 1 if row["Adulterant_Type"] != "Standard_Pure" else 0
        decay_rate = (excess * 0.18 * rh_factor) + (moisture * 0.04 * rh_factor) + (is_adulterated * 0.25)
        safe_days = baseline_days * np.exp(-decay_rate)
        return max(7.0, round(safe_days, 1))

    df["Estimated_Shelf_Life_Days"] = df.apply(compute_shelf_life, axis=1)
    print(f"Mean Safe Storage Days: {df['Estimated_Shelf_Life_Days'].mean():.1f} days (Min: {df['Estimated_Shelf_Life_Days'].min():.1f} days)")

    # 3. Agronomic Yield & Economic Loss Predictor
    loss_features = [
        "Chemical_Deviation_Score", "Quality_Score", "excess_moisture",
        "Total_Active_NPK", "Estimated_Inert_Filler", "dev_n", "dev_p", "dev_k",
        "Moisture_Volatilization_Interaction", "Price_Deviation_Pct", "Price_Arbitrage_Flag"
    ]
    X_loss = df[loss_features]
    y_yield = df["Estimated_Yield_Loss_Pct"]
    y_econ = df["Estimated_Economic_Loss_LKR_per_ha"]

    yield_regressor = GradientBoostingRegressor(n_estimators=180, max_depth=5, learning_rate=0.08, random_state=42)
    yield_regressor.fit(X_loss, y_yield)

    econ_regressor = GradientBoostingRegressor(n_estimators=180, max_depth=5, learning_rate=0.08, random_state=42)
    econ_regressor.fit(X_loss, y_econ)

    joblib.dump(yield_regressor, os.path.join(actual_models_dir, "yield_loss_regressor.pkl"))
    joblib.dump(econ_regressor, os.path.join(actual_models_dir, "economic_loss_regressor.pkl"))
    joblib.dump(loss_features, os.path.join(actual_models_dir, "yield_loss_features.pkl"))

    print("Predictive intelligence models trained and serialized successfully.")

if __name__ == "__main__":
    train_forecasting_models()
