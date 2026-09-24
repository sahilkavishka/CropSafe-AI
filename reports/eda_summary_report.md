# CropSafe AI: Exploratory Data Analysis & Empirical Insights Report
**Dataset:** `cropsafe_master_dataset.csv` | **Sample Size:** 2000 records | **Features:** 51

---

## 1. Executive Summary & Key Empirical Findings
1. **Quality Stratification:** Out of 2000 laboratory samples tested across 2022–2024:
   - **1477 (73.9%)** met national standards (Certified Pass).
   - **523 (26.2%)** failed compliance benchmarks (Substandard).
2. **Adulteration Categorization:**
   - **Standard / Pure:** 638 samples
   - **Substandard Blend:** 604 samples
   - **Moisture Weight Padding:** 384 samples
   - **Heavy Insoluble Filler (Sand/Clay):** 374 samples
3. **Price Arbitrage & Economic Exploitation:**
   - A total of **275 instances (13.8%)** were identified where dealers sold uncertified/substandard fertilizer at or above official HARTI benchmark prices.
   - Top provinces vulnerable to price arbitrage: Southern Province (38 cases) and Sabaragamuwa Province (38 cases).
4. **Agronomic Impact:**
   - For farmers applying substandard consignments, the mean predicted crop economic loss is **LKR 86,853.80 per hectare**, demonstrating substantial harm to agrarian productivity and food security.

---

## 2. Generated Visual Assets
- `eda_quality_distribution.png` - Quality Score histogram by certification.
- `eda_adulterant_breakdown.png` - Breakdown of specific adulterant modalities.
- `eda_price_arbitrage_by_region.png` - Regional distribution of predatory pricing.
- `eda_chemical_deviation_vs_quality.png` - Multi-variate chemical deviation scatter plot.
- `eda_economic_loss_distribution.png` - Agronomic financial impact distribution.
