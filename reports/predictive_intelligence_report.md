# CropSafe AI: Predictive & Prescriptive Intelligence Report
**Modules:** Demand Forecasting, Shelf-Life Survival Estimation, Yield Impact Regression

---

## 1. Fertilizer Demand Forecasting (Shortage Early Warning)
* **Model Algorithm:** Gradient Boosting Regressor (GBR)
* **Variance Explained (R2 Score):** 0.9999 (100.0%)
* **Mean Absolute Error (MAE):** 73.52 Metric Tons
* **Strategic Role:** Predicts regional seasonal consumption requirements. When regional demand exceeds recorded imports, the system issues a **Fertilizer Shortage Warning**, proactively alerting officers to heightened risks of adulterated fertilizer inflow.

---

## 2. Shelf-Life & Clumping Degradation Model
* **Empirical Observation:** High moisture (>2.5%) rapidly destabilizes Urea and NPK granules, reducing safe warehouse storage from 365 days to as low as **116 days**.
* **Prescriptive Action:** Automatically recommends immediate clearance or discounting for lots with shelf-life < 60 days.

---

## 3. Agronomic Yield & Economic Loss Predictor
* **Baseline Paddy Yield:** 4.8 MT/ha | Farmgate Benchmark: Rs. 115/kg
* **Predicted Loss Range:** 0% (Standard) up to 42% (Heavily adulterated/filler)
* **Direct Financial Loss:** Up to Rs. 231,840 per hectare for severe chemical deficiency.
