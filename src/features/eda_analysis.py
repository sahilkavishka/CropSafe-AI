"""
CropSafe AI - Exploratory Data Analysis (EDA) & Visual Analytics Engine
Generates publication-ready figures, statistical distributions, and an academic summary report
for the Capstone Project II (DS3206) documentation.
"""

import os
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless execution
import matplotlib.pyplot as plt
import seaborn as sns

def run_eda(dataset_path="cropsafe AI/data/processed/cropsafe_master_dataset.csv",
            output_dir="cropsafe AI/reports/figures"):
    os.makedirs(output_dir, exist_ok=True)
    report_path = "cropsafe AI/reports/eda_summary_report.md"

    print("Loading master dataset for EDA...")
    df = pd.read_csv(dataset_path)

    # Set overall aesthetic style
    sns.set_theme(style="whitegrid", palette="muted")
    plt.rcParams.update({"font.sans-serif": "DejaVu Sans", "font.size": 11})

    # 1. Figure: Quality Score Distribution by Lab Certified Status
    plt.figure(figsize=(9, 5))
    ax = sns.histplot(data=df, x="Quality_Score", hue="Lab_Certified", kde=True, bins=30,
                      palette={"Yes": "#2ecc71", "No": "#e74c3c"}, alpha=0.6)
    plt.title("Distribution of Composite Quality Score (Lab Certified vs Substandard)", fontsize=13, weight="bold")
    plt.xlabel("Composite Quality Score (0 - 100)")
    plt.ylabel("Sample Count")
    plt.tight_layout()
    fig1_path = os.path.join(output_dir, "eda_quality_distribution.png")
    plt.savefig(fig1_path, dpi=300)
    plt.close()
    print(f"Generated: {fig1_path}")

    # 2. Figure: Multi-Class Adulterant Type Breakdown
    plt.figure(figsize=(10, 5))
    adulterant_counts = df["Adulterant_Type"].value_counts()
    colors = ["#27ae60", "#e67e22", "#3498db", "#c0392b", "#8e44ad"]
    ax = sns.barplot(x=adulterant_counts.values, y=adulterant_counts.index, palette=colors[:len(adulterant_counts)])
    plt.title("Distribution of Fertilizer Quality & Adulterant Categories", fontsize=13, weight="bold")
    plt.xlabel("Number of Samples")
    plt.ylabel("Category")
    for i, v in enumerate(adulterant_counts.values):
        ax.text(v + 10, i, str(v), color="black", va="center", weight="bold")
    plt.tight_layout()
    fig2_path = os.path.join(output_dir, "eda_adulterant_breakdown.png")
    plt.savefig(fig2_path, dpi=300)
    plt.close()
    print(f"Generated: {fig2_path}")

    # 3. Figure: Price Arbitrage / Gouging by Province
    plt.figure(figsize=(11, 5))
    arbitrage_by_region = df.groupby("Region")["Price_Arbitrage_Flag"].sum().sort_values(ascending=False)
    ax = sns.barplot(x=arbitrage_by_region.index, y=arbitrage_by_region.values, palette="Reds_r")
    plt.title("Price Arbitrage Incidents by Province (Substandard Sold at Benchmark Price)", fontsize=13, weight="bold")
    plt.xlabel("Province")
    plt.ylabel("Detected Arbitrage Cases")
    plt.xticks(rotation=30, ha="right")
    for i, v in enumerate(arbitrage_by_region.values):
        ax.text(i, v + 1, str(v), color="black", ha="center", weight="bold")
    plt.tight_layout()
    fig3_path = os.path.join(output_dir, "eda_price_arbitrage_by_region.png")
    plt.savefig(fig3_path, dpi=300)
    plt.close()
    print(f"Generated: {fig3_path}")

    # 4. Figure: Chemical Deviation vs Quality Score Scatter
    plt.figure(figsize=(9, 5))
    sns.scatterplot(data=df, x="Chemical_Deviation_Score", y="Quality_Score", hue="Adulterant_Type",
                    palette="tab10", alpha=0.7, s=40)
    plt.title("Correlation: Chemical Deviation Score vs. Composite Quality Score", fontsize=13, weight="bold")
    plt.xlabel("Chemical Deviation Score (%)")
    plt.ylabel("Quality Score (0 - 100)")
    plt.legend(bbox_to_anchor=(1.02, 1), loc="upper left")
    plt.tight_layout()
    fig4_path = os.path.join(output_dir, "eda_chemical_deviation_vs_quality.png")
    plt.savefig(fig4_path, dpi=300)
    plt.close()
    print(f"Generated: {fig4_path}")

    # 5. Figure: Estimated Economic Loss Distribution per Hectare
    plt.figure(figsize=(9, 5))
    substandard_df = df[df["Estimated_Yield_Loss_Pct"] > 0]
    sns.histplot(substandard_df["Estimated_Economic_Loss_LKR_per_ha"], kde=True, color="#d35400", bins=25)
    plt.title("Estimated Economic Loss Distribution (LKR per Hectare on Substandard Fertilizer)", fontsize=13, weight="bold")
    plt.xlabel("Loss in Sri Lankan Rupees (LKR / ha)")
    plt.ylabel("Frequency")
    plt.tight_layout()
    fig5_path = os.path.join(output_dir, "eda_economic_loss_distribution.png")
    plt.savefig(fig5_path, dpi=300)
    plt.close()
    print(f"Generated: {fig5_path}")

    # Generate Markdown Report
    certified_cnt = (df["Lab_Certified"] == "Yes").sum()
    uncertified_cnt = (df["Lab_Certified"] == "No").sum()
    arbitrage_total = df["Price_Arbitrage_Flag"].sum()
    mean_econ_loss = substandard_df["Estimated_Economic_Loss_LKR_per_ha"].mean()

    report_content = f"""# CropSafe AI: Exploratory Data Analysis & Empirical Insights Report
**Dataset:** `cropsafe_master_dataset.csv` | **Sample Size:** {len(df)} records | **Features:** {len(df.columns)}

---

## 1. Executive Summary & Key Empirical Findings
1. **Quality Stratification:** Out of {len(df)} laboratory samples tested across 2022–2024:
   - **{certified_cnt} ({certified_cnt/len(df)*100:.1f}%)** met national standards (Certified Pass).
   - **{uncertified_cnt} ({uncertified_cnt/len(df)*100:.1f}%)** failed compliance benchmarks (Substandard).
2. **Adulteration Categorization:**
   - **Standard / Pure:** {adulterant_counts.get('Standard_Pure', 0)} samples
   - **Substandard Blend:** {adulterant_counts.get('Substandard_Blend', 0)} samples
   - **Moisture Weight Padding:** {adulterant_counts.get('Moisture_Weight_Padding', 0)} samples
   - **Heavy Insoluble Filler (Sand/Clay):** {adulterant_counts.get('Heavy_Insoluble_Filler', 0)} samples
3. **Price Arbitrage & Economic Exploitation:**
   - A total of **{arbitrage_total} instances ({arbitrage_total/len(df)*100:.1f}%)** were identified where dealers sold uncertified/substandard fertilizer at or above official HARTI benchmark prices.
   - Top provinces vulnerable to price arbitrage: {arbitrage_by_region.index[0]} ({arbitrage_by_region.iloc[0]} cases) and {arbitrage_by_region.index[1]} ({arbitrage_by_region.iloc[1]} cases).
4. **Agronomic Impact:**
   - For farmers applying substandard consignments, the mean predicted crop economic loss is **LKR {mean_econ_loss:,.2f} per hectare**, demonstrating substantial harm to agrarian productivity and food security.

---

## 2. Generated Visual Assets
- `eda_quality_distribution.png` - Quality Score histogram by certification.
- `eda_adulterant_breakdown.png` - Breakdown of specific adulterant modalities.
- `eda_price_arbitrage_by_region.png` - Regional distribution of predatory pricing.
- `eda_chemical_deviation_vs_quality.png` - Multi-variate chemical deviation scatter plot.
- `eda_economic_loss_distribution.png` - Agronomic financial impact distribution.
"""
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_content)
    print(f"Summary EDA report written to: {report_path}")

if __name__ == "__main__":
    run_eda()
