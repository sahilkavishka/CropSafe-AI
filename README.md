# 🌾 CropSafe AI — National Fertilizer Quality Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-App-FF4B4B?logo=streamlit)](https://streamlit.io/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Machine%20Learning-F7931E?logo=scikit-learn)](https://scikit-learn.org/)
[![Plotly](https://img.shields.io/badge/Plotly-Interactive%20Visualizations-3F4F75?logo=plotly)](https://plotly.com/)
[![Institution](https://img.shields.io/badge/SUSL-Faculty%20of%20Computing-green)](https://www.sab.ac.lk/)

> **Sabaragamuwa University of Sri Lanka | Faculty of Computing | Department of Data Science**  
> *DS3206 Capstone Project II*

CropSafe AI is an end-to-end Machine Learning and Agricultural Intelligence platform engineered to safeguard Sri Lanka's agricultural supply chain against chemical fertilizer adulteration, substandard formulations, and price manipulation.

---

## 📌 Problem Domain & Motivation

Chemical fertilizer quality directly dictates national agricultural output, soil health, and farmer livelihood in Sri Lanka:
1. **Widespread Adulteration:** Low-grade chemical adulterants (e.g., sand, salt, crushed rock) dilute essential NPK macronutrients, leading to crop failure.
2. **Economic & Yield Loss:** Farmers lack scientific means to assess adulteration risk before application, resulting in compounding financial and yield loss.
3. **Market Price Arbitrage:** Black-market price gouging and artificial shortages destabilize fertilizer distribution across farming districts.

CropSafe AI addresses these challenges through a multi-stage machine learning system paired with an interactive decision-support interface.

---

## 🚀 Key Functional Modules & Machine Learning Pipeline

### 1. 🧪 Adulterant Detection & Classification (Two-Stage Classifier)
* **Stage 1 (Binary Gatekeeper):** Rapidly verifies if a sample meets standard quality guidelines or exhibits anomalous adulteration.
* **Stage 2 (Specialist Classifier):** Pinpoints the specific adulterant type (e.g., Sodium Chloride, Sand/Inert Fillers, Ammonium Compounds) with high precision using ensemble trees.

### 2. 🔍 Unsupervised Anomaly Detection
* **Isolation Forest (`iso_forest_chemical.pkl`):** Flags subtle chemical deviations in nitrogen, phosphorus, and potassium ratios that bypass traditional threshold checks.
* **Local Outlier Factor (LOF):** Detects regional price arbitrage anomalies and artificial inflation spikes across market districts.

### 3. 📉 Impact Quantification & Loss Estimation
* **Yield Loss Regressor:** Estimates expected percentage drop in harvest yield based on detected adulterant concentrations.
* **Economic Loss Regressor:** Translates agronomic damage into monetary loss (LKR) per hectare.

### 4. 📈 National Demand & Consumption Forecasting
* **Gradient Boosting Forecaster:** Projects seasonal fertilizer demand across districts to support data-driven procurement and supply resilience.

---

## 🛠️ Tech Stack & Architecture

* **Languages & Core:** Python 3.10+, NumPy, Pandas
* **Machine Learning:** Scikit-Learn, Joblib, Isolation Forest, LOF, Gradient Boosting, Random Forest
* **Visualization:** Plotly Express & Graph Objects, Seaborn, Matplotlib
* **User Interface:** Streamlit (Interactive dashboard featuring multi-page analytics, risk matrices, and spatial district mapping)

---

## 📂 Project Directory Structure

```text
cropsafe AI/
│
├── data/
│   ├── raw/                 # Raw chemical assay data & market price feeds
│   └── processed/           # cropsafe_master_dataset.csv
│
├── figures/                 # Evaluation charts, confusion matrices, ROC curves
├── models/                  # Serialized ML pipelines (.pkl)
│   ├── champion_adulterant_classifier.pkl
│   ├── stage1_binary_gatekeeper.pkl
│   ├── stage2_adulterant_specialist.pkl
│   ├── yield_loss_regressor.pkl
│   ├── economic_loss_regressor.pkl
│   ├── iso_forest_chemical.pkl
│   └── demand_forecaster_gb.pkl
│
├── notebooks/               # Model training, exploratory data analysis & validation
├── src/                     # Core helper modules & feature engineering pipelines
├── streamlit_app.py         # Main interactive web application
└── README.md
```

---

## ⚡ How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/sahilkavishka/CropSafe-AI.git
cd CropSafe-AI
```

### 2. Create and activate a virtual environment
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
# Or core packages:
pip install streamlit pandas numpy scikit-learn plotly joblib
```

### 4. Launch the application
```bash
streamlit run streamlit_app.py
```
The app will open automatically in your browser at `http://localhost:8501`.

---

## 👨‍💻 Author

**Sahil Kavishka**  
*Data Science Undergraduate @ Sabaragamuwa University of Sri Lanka*  
* [LinkedIn](https://www.linkedin.com/in/sahilkavishka/)
* [GitHub](https://github.com/sahilkavishka)
* [Portfolio](https://sahilkavishka.github.io/portfolio/)
