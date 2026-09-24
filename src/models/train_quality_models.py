"""
CropSafe AI - Core Machine Learning Training Pipeline
Trains, evaluates, and benchmarks:
  1. Binary Quality Classification (Certified Pass vs Substandard Fail)
  2. Multi-Class Adulterant Detection (Standard, Moisture, Sand/Filler, Blend)
Uses Stratified K-Fold CV, computes comprehensive metrics, and serializes production models.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import (accuracy_score, precision_score, recall_score, f1_score,
                             roc_auc_score, classification_report, confusion_matrix)
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
import xgboost as xgb
import lightgbm as lgb

def train_and_evaluate(data_path="cropsafe AI/data/processed/cropsafe_master_dataset.csv",
                       models_dir="cropsafe AI/models",
                       reports_dir="cropsafe AI/reports"):
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    print("Loading processed master dataset...")
    df = pd.read_csv(data_path)

    # 1. Feature Selection
    feature_cols = [
        "Nitrogen_N_g_per_100g", "Phosphorus_P_g_per_100g", "Potassium_K_g_per_100g",
        "Moisture_Content_pct", "Chemical_Deviation_Score", "Quality_Score",
        "dev_n", "dev_p", "dev_k", "excess_moisture",
        "Unit_Price_LKR_per_kg", "Benchmark_Price_LKR_kg", "Price_Deviation_Pct",
        "NLP_Risk_Score"
    ]

    # Target 1: Binary Certification (1 = Certified Pass, 0 = Substandard)
    y_binary = (df["Lab_Certified"] == "Yes").astype(int)

    # Target 2: Multi-Class Adulterant Category
    le_adulterant = LabelEncoder()
    y_multiclass = le_adulterant.fit_transform(df["Adulterant_Type"])

    X = df[feature_cols].copy()

    # Train/Test Split (80/20 Stratified)
    X_train, X_test, y_bin_train, y_bin_test, y_multi_train, y_multi_test = train_test_split(
        X, y_binary, y_multiclass, test_size=0.20, random_state=42, stratify=y_binary
    )

    print(f"Training Samples: {len(X_train)}, Testing Samples: {len(X_test)}")

    # -------------------------------------------------------------
    # 2. Binary Quality Classification Benchmarking
    # -------------------------------------------------------------
    candidate_models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=150, max_depth=10, random_state=42),
        "XGBoost": xgb.XGBClassifier(n_estimators=150, max_depth=5, learning_rate=0.08,
                                     eval_metric="logloss", random_state=42),
        "LightGBM": lgb.LGBMClassifier(n_estimators=150, max_depth=5, learning_rate=0.08,
                                       random_state=42, verbose=-1)
    }

    results = []
    trained_bin_models = {}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    print("\n--- Benchmarking Binary Classification Models (5-Fold CV) ---")
    for name, model in candidate_models.items():
        cv_scores = cross_val_score(model, X_train, y_bin_train, cv=cv, scoring="f1")
        model.fit(X_train, y_bin_train)
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_bin_test, y_pred)
        prec = precision_score(y_bin_test, y_pred)
        rec = recall_score(y_bin_test, y_pred)
        f1 = f1_score(y_bin_test, y_pred)
        auc = roc_auc_score(y_bin_test, y_prob)

        results.append({
            "Model": name,
            "CV_F1_Mean": round(float(np.mean(cv_scores)), 4),
            "Test_Accuracy": round(acc, 4),
            "Test_Precision": round(prec, 4),
            "Test_Recall": round(rec, 4),
            "Test_F1_Score": round(f1, 4),
            "Test_ROC_AUC": round(auc, 4)
        })
        trained_bin_models[name] = model
        print(f"[{name}] Test Accuracy: {acc:.4f} | F1-Score: {f1:.4f} | ROC-AUC: {auc:.4f}")

    results_df = pd.DataFrame(results).sort_values(by="Test_F1_Score", ascending=False)
    best_bin_model_name = results_df.iloc[0]["Model"]
    best_bin_model = trained_bin_models[best_bin_model_name]

    # Save Best Binary Model
    joblib.dump(best_bin_model, os.path.join(models_dir, "quality_classifier_best.pkl"))
    print(f"\nBest Binary Model: {best_bin_model_name} (Saved to quality_classifier_best.pkl)")

    # -------------------------------------------------------------
    # 3. Multi-Class Adulterant Detection Model (LightGBM)
    # -------------------------------------------------------------
    print("\n--- Training Multi-Class Adulterant Identification Model ---")
    multi_model = lgb.LGBMClassifier(n_estimators=180, max_depth=6, learning_rate=0.07,
                                     random_state=42, verbose=-1)
    multi_model.fit(X_train, y_multi_train)
    y_multi_pred = multi_model.predict(X_test)

    multi_acc = accuracy_score(y_multi_test, y_multi_pred)
    multi_report = classification_report(y_multi_test, y_multi_pred,
                                         target_names=le_adulterant.classes_, output_dict=False)
    print(f"Multi-Class Overall Accuracy: {multi_acc:.4f}")
    print("\nClassification Report:\n", multi_report)

    # Save Multi-Class Model and Label Encoder
    joblib.dump(multi_model, os.path.join(models_dir, "adulterant_classifier_lgbm.pkl"))
    joblib.dump(le_adulterant, os.path.join(models_dir, "adulterant_label_encoder.pkl"))
    joblib.dump(feature_cols, os.path.join(models_dir, "feature_columns.pkl"))

    # -------------------------------------------------------------
    # 4. Generate Comprehensive Evaluation Report
    # -------------------------------------------------------------
    report_md = f"""# CropSafe AI: Machine Learning Evaluation & Benchmarking Report
**Module:** Quality Classification & Multi-Class Adulteration Detection
**Validation Strategy:** 5-Fold Stratified Cross-Validation + 20% Holdout Test Set

---

## 1. Binary Quality Classification Benchmark (Pass vs Substandard)

| Model Name | 5-Fold CV F1 | Test Accuracy | Test Precision | Test Recall | Test F1-Score | Test ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
"""
    for _, r in results_df.iterrows():
        report_md += f"| **{r['Model']}** | {r['CV_F1_Mean']:.4f} | {r['Test_Accuracy']:.4f} | {r['Test_Precision']:.4f} | {r['Test_Recall']:.4f} | {r['Test_F1_Score']:.4f} | {r['Test_ROC_AUC']:.4f} |\n"

    report_md += f"""
### Key Model Observations:
* The **{best_bin_model_name}** achieved the superior performance with **{results_df.iloc[0]['Test_Accuracy']*100:.2f}% Test Accuracy** and **{results_df.iloc[0]['Test_F1_Score']:.4f} F1-Score**.
* Multi-modal feature engineering (combining chemical deviation, moisture padding ratios, and NLP notes risk scores) provides distinct separation boundaries between genuine and substandard consignments.

---

## 2. Multi-Class Adulterant Detection (LightGBM)
* **Overall Test Accuracy:** {multi_acc*100:.2f}%
* **Adulterant Classes Recognized:**
  1. `Standard_Pure` (Compliant with SLSI)
  2. `Substandard_Blend` (Imbalanced NPK formulation)
  3. `Moisture_Weight_Padding` (Water addition for artificial weight inflation)
  4. `Heavy_Insoluble_Filler` (Sand, soil, or clay contamination)

### Detailed Multi-Class Classification Performance:
```text
{multi_report}
```

---

## 3. Serialized Model Artifacts
- `quality_classifier_best.pkl` - Primary binary classifier.
- `adulterant_classifier_lgbm.pkl` - Multi-class adulteration classifier.
- `adulterant_label_encoder.pkl` - Categorical class mappings.
- `feature_columns.pkl` - Ordered input feature contract for production inference.
"""

    report_file = os.path.join(reports_dir, "model_evaluation_report.md")
    with open(report_file, "w", encoding="utf-8") as f:
        f.write(report_md)
    print(f"Model evaluation report successfully generated at: {report_file}")

if __name__ == "__main__":
    train_and_evaluate()
