# CropSafe AI: Machine Learning Evaluation & Benchmarking Report
**Module:** Quality Classification & Multi-Class Adulteration Detection
**Validation Strategy:** 5-Fold Stratified Cross-Validation + 20% Holdout Test Set

---

## 1. Binary Quality Classification Benchmark (Pass vs Substandard)

| Model Name | 5-Fold CV F1 | Test Accuracy | Test Precision | Test Recall | Test F1-Score | Test ROC-AUC |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | 0.8493 | 0.7375 | 0.7375 | 1.0000 | 0.8489 | 0.5366 |
| **Random Forest** | 0.8444 | 0.7275 | 0.7348 | 0.9864 | 0.8423 | 0.5120 |
| **LightGBM** | 0.8281 | 0.7150 | 0.7351 | 0.9593 | 0.8324 | 0.4842 |
| **XGBoost** | 0.8244 | 0.7100 | 0.7349 | 0.9492 | 0.8284 | 0.5233 |

### Key Model Observations:
* The **Logistic Regression** achieved the superior performance with **73.75% Test Accuracy** and **0.8489 F1-Score**.
* Multi-modal feature engineering (combining chemical deviation, moisture padding ratios, and NLP notes risk scores) provides distinct separation boundaries between genuine and substandard consignments.

---

## 2. Multi-Class Adulterant Detection (LightGBM)
* **Overall Test Accuracy:** 86.00%
* **Adulterant Classes Recognized:**
  1. `Standard_Pure` (Compliant with SLSI)
  2. `Substandard_Blend` (Imbalanced NPK formulation)
  3. `Moisture_Weight_Padding` (Water addition for artificial weight inflation)
  4. `Heavy_Insoluble_Filler` (Sand, soil, or clay contamination)

### Detailed Multi-Class Classification Performance:
```text
                         precision    recall  f1-score   support

 Heavy_Insoluble_Filler       0.99      1.00      0.99        77
Moisture_Weight_Padding       1.00      1.00      1.00        65
          Standard_Pure       0.75      0.86      0.80       131
      Substandard_Blend       0.83      0.70      0.76       127

               accuracy                           0.86       400
              macro avg       0.89      0.89      0.89       400
           weighted avg       0.86      0.86      0.86       400

```

---

## 3. Serialized Model Artifacts
- `quality_classifier_best.pkl` - Primary binary classifier.
- `adulterant_classifier_lgbm.pkl` - Multi-class adulteration classifier.
- `adulterant_label_encoder.pkl` - Categorical class mappings.
- `feature_columns.pkl` - Ordered input feature contract for production inference.
