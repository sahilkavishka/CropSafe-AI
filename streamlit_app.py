"""
🌾 CropSafe AI — National Fertilizer Quality Intelligence Platform
Sabaragamuwa University of Sri Lanka | Faculty of Computing | Department of Data Science
DS3206 Capstone Project II — Viva Presentation Ready
"""

import os, sys
import numpy as np
import pandas as pd
import joblib
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from datetime import datetime

# ─── Project Root ───────────────────────────────────────────
PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# ─── Load Dataset ───────────────────────────────────────────
@st.cache_data
def load_dataset():
    path = os.path.join(PROJECT_ROOT, "data", "processed", "cropsafe_master_dataset.csv")
    return pd.read_csv(path) if os.path.exists(path) else pd.DataFrame()

# ─── Load ML Models ─────────────────────────────────────────
@st.cache_resource
def load_models():
    m = {}
    d = os.path.join(PROJECT_ROOT, "models")
    files = {
        "classifier": "champion_adulterant_classifier.pkl",
        "preprocessor": "feature_preprocessor_pipeline.pkl",
        "feature_cols": "final_feature_columns.pkl",
        "label_encoder": "adulterant_label_encoder.pkl",
        "stage1": "stage1_binary_gatekeeper.pkl",
        "stage2": "stage2_adulterant_specialist.pkl",
        "yield_loss": "yield_loss_regressor.pkl",
        "yield_loss_features": "yield_loss_features.pkl",
        "economic_loss": "economic_loss_regressor.pkl",
        "iso_forest": "iso_forest_chemical.pkl",
        "quality_clf": "quality_classifier_best.pkl",
        "demand_forecaster": "demand_forecaster_gb.pkl",
        "demand_features": "demand_feature_columns.pkl",
        "scaler_chem": "scaler_chem_anomaly.pkl",
        "scaler_price": "scaler_price_anomaly.pkl",
        "lof_price": "lof_price_arbitrage.pkl",
    }
    for k, f in files.items():
        try:
            m[k] = joblib.load(os.path.join(d, f))
        except Exception:
            pass
    return m

df = load_dataset()
models = load_models()

# ─── Page Config ────────────────────────────────────────────
st.set_page_config(
    page_title="CropSafe AI — National Fertilizer Intelligence",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .metric-card {
        background: #1e293b !important;
        color: #f8fafc !important;
        border-radius: 12px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-left: 5px solid #10b981 !important;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    }
    .metric-card h4 {
        color: #34d399 !important;
        margin-top: 0;
        margin-bottom: 12px;
        font-weight: 700;
        font-size: 1.15rem;
    }
    .metric-card p {
        color: #f1f5f9 !important;
        margin: 6px 0;
        font-size: 0.95rem;
    }
    .metric-card b {
        color: #38bdf8 !important;
    }
    .badge-pure {
        background-color: #d1fae5;
        color: #065f46;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    .badge-adulterated {
        background-color: #fee2e2;
        color: #991b1b;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 12px;
    }
    .stTabs [data-baseweb="tab"] {
        padding: 8px 20px;
        border-radius: 8px;
    }
</style>
""", unsafe_allow_html=True)

# ─── Sidebar ────────────────────────────────────────────────
st.sidebar.markdown("## 🌾 CropSafe AI")
st.sidebar.caption("National Fertilizer Quality Intelligence Platform")

PAGES = {
    "🏠 Executive Dashboard": "home",
    "📊 Dataset & Visual Explorer": "explorer",
    "🧪 ML Quality Classification": "quality",
    "📉 Crop & Economic Loss Predictor": "loss",
    "🔍 Chemical & Price Anomaly Detection": "anomaly",
    "💰 Market Price Intelligence": "price",
    "📈 Regional Demand Forecaster": "demand",
    "🗺️ Provincial Risk Analytics": "regional",
}
page_label = st.sidebar.radio("Navigation", list(PAGES.keys()), label_visibility="collapsed")
sel = PAGES[page_label]

st.sidebar.markdown("---")
st.sidebar.metric("Dataset Repository", f"{len(df):,} Samples")
st.sidebar.metric("Active ML Models", f"{len(models)} Deployed")
st.sidebar.caption(f"System Time: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
st.sidebar.markdown("---")
st.sidebar.markdown("""
<div style='font-size:0.8rem; color:#6b7280; line-height:1.4;'>
    <b>Sabaragamuwa University of Sri Lanka</b><br>
    Faculty of Computing | Department of Data Science<br>
    DS3206 Capstone Project II — 2026
</div>
""", unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════
#  EXECUTIVE DASHBOARD
# ═══════════════════════════════════════════════════════════
if sel == "home":
    st.markdown("""
    <div style="background:linear-gradient(135deg,#065f46 0%,#047857 50%,#0d9488 100%);padding:2rem 2.5rem;border-radius:16px;color:white;margin-bottom:1.5rem;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
        <h1 style="margin:0; font-size:2.2rem; font-weight:700;">🌾 CropSafe AI</h1>
        <p style="margin:0.5rem 0 0;font-size:1.15rem;opacity:0.95;font-weight:400;">
            National Fertilizer Quality Intelligence & Economic Loss Forecasting Platform
        </p>
        <p style="margin:0.3rem 0 0;font-size:0.85rem;opacity:0.8;">
            Direct Machine Learning Pipeline ground-truthed on 2,002 Empirical Laboratory Tests across 9 Sri Lankan Provinces
        </p>
    </div>
    """, unsafe_allow_html=True)

    pure = len(df[df["Adulterant_Type"] == "Standard_Pure"])
    adult = len(df[df["Adulterant_Type"] != "Standard_Pure"])

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Standard Compliant", f"{pure:,}", f"{pure/len(df)*100:.1f}% Genuine")
    c2.metric("Counterfeit / Adulterated", f"{adult:,}", f"{adult/len(df)*100:.1f}% Flagged", delta_color="inverse")
    c3.metric("National Avg Quality Score", f"{df['Quality_Score'].mean():.1f} / 100")
    c4.metric("Mean Projected Yield Loss", f"{df['Estimated_Yield_Loss_Pct'].mean():.1f}%", "-Impact", delta_color="inverse")

    st.markdown("---")
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("🧪 Adulterant Distribution Analysis")
        ad_counts = df["Adulterant_Type"].value_counts().reset_index()
        ad_counts.columns = ["Adulterant Category", "Sample Count"]
        fig_pie = px.pie(
            ad_counts, 
            values="Sample Count", 
            names="Adulterant Category",
            hole=0.45,
            color_discrete_sequence=px.colors.qualitative.Bold
        )
        fig_pie.update_layout(margin=dict(t=20, b=20, l=20, r=20), height=320)
        st.plotly_chart(fig_pie, width="stretch")

    with col2:
        st.subheader("📦 Commodity Sample Distribution")
        pr_counts = df["Product_Name"].value_counts().reset_index()
        pr_counts.columns = ["Commodity", "Total Tested"]
        fig_bar = px.bar(
            pr_counts,
            x="Total Tested",
            y="Commodity",
            orientation="h",
            color="Total Tested",
            color_continuous_scale="Mint"
        )
        fig_bar.update_layout(margin=dict(t=20, b=20, l=20, r=20), height=320, yaxis={'categoryorder':'total ascending'})
        st.plotly_chart(fig_bar, width="stretch")

    st.markdown("---")
    st.subheader("🧠 Validated Machine Learning Architecture")
    models_df = pd.DataFrame([
        {"Pipeline Name": "Champion Adulterant Classifier", "Algorithm": "LightGBM", "Objective": "Multi-Class Authentication (4 Target Classes)", "Status": "Production Active"},
        {"Pipeline Name": "Stage-1 Gatekeeper", "Algorithm": "LightGBM Binary", "Objective": "Rapid Pure vs Tampered Screening", "Status": "Production Active"},
        {"Pipeline Name": "Stage-2 Specialist", "Algorithm": "LightGBM Multi", "Objective": "Specific Adulterant Composition Diagnostics", "Status": "Production Active"},
        {"Pipeline Name": "Crop Yield Loss Regressor", "Algorithm": "Gradient Boosting", "Objective": "Predicts Farm-Level Harvest Deficit (%)", "Status": "Production Active"},
        {"Pipeline Name": "Economic Loss Regressor", "Algorithm": "Gradient Boosting", "Objective": "Predicts Monetary Farm Loss (LKR/ha)", "Status": "Production Active"},
        {"Pipeline Name": "Chemical Anomaly Engine", "Algorithm": "Isolation Forest", "Objective": "Unsupervised Multi-Nutrient Deviation Flagging", "Status": "Production Active"},
        {"Pipeline Name": "Price Arbitrage Detector", "Algorithm": "Local Outlier Factor (LOF)", "Objective": "Detects Illegal Markup and Fertilizer Hoarding", "Status": "Production Active"},
        {"Pipeline Name": "Demand Forecaster", "Algorithm": "Gradient Boosting", "Objective": "Regional Seasonal Fertilizer Requisition (MT)", "Status": "Production Active"},
    ])
    st.dataframe(models_df, hide_index=True, width="stretch")


# ═══════════════════════════════════════════════════════════
#  DATASET & VISUAL EXPLORER (NO DULL TABLES!)
# ═══════════════════════════════════════════════════════════
elif sel == "explorer":
    st.header("📊 Dataset & Visual Explorer")
    st.caption("Comprehensive exploratory analysis of 2,002 laboratory test certificates without static plain tables.")

    # Global interactive filters
    fc1, fc2, fc3 = st.columns(3)
    with fc1:
        prod_filter = st.multiselect("Filter Commodity", df["Product_Name"].dropna().unique(), default=["Urea", "MOP (Muriate of Potash)"])
    with fc2:
        reg_filter = st.multiselect("Filter Province", df["Region"].dropna().unique())
    with fc3:
        adult_filter = st.multiselect("Filter Quality Status", df["Adulterant_Type"].dropna().unique())

    filtered_df = df.copy()
    if prod_filter:
        filtered_df = filtered_df[filtered_df["Product_Name"].isin(prod_filter)]
    if reg_filter:
        filtered_df = filtered_df[filtered_df["Region"].isin(reg_filter)]
    if adult_filter:
        filtered_df = filtered_df[filtered_df["Adulterant_Type"].isin(adult_filter)]

    # Dynamic KPI ribbon
    k1, k2, k3, k4 = st.columns(4)
    k1.metric("Selected Batches", f"{len(filtered_df):,} units")
    k2.metric("Mean Purity Index", f"{filtered_df['Quality_Score'].mean():.1f} / 100" if len(filtered_df) else "N/A")
    k3.metric("Average Nitrogen Content", f"{filtered_df['Nitrogen_N_g_per_100g'].mean():.2f} g/100g" if len(filtered_df) else "N/A")
    k4.metric("Avg Retail Price", f"Rs. {filtered_df['Unit_Price_LKR_per_kg'].mean():.1f} / kg" if len(filtered_df) else "N/A")

    st.markdown("---")

    tab_vis, tab_card, tab_raw = st.tabs(["📈 Interactive Visualizations", "🗂️ Interactive Sample Card Inspector", "📋 Tabular Registry View"])

    with tab_vis:
        c_left, c_right = st.columns(2)
        with c_left:
            st.markdown("##### 🔬 Active Nutrient vs. Quality Score Correlation")
            scatter_df = filtered_df.dropna(subset=["Total_Active_NPK", "Quality_Score"]).copy()
            scatter_df["Yield_Loss_Bubble"] = pd.to_numeric(scatter_df["Estimated_Yield_Loss_Pct"], errors="coerce").fillna(0.0).clip(lower=1.0)
            fig_scatter = px.scatter(
                scatter_df,
                x="Total_Active_NPK",
                y="Quality_Score",
                color="Adulterant_Type",
                size="Yield_Loss_Bubble",
                hover_data=["Record_ID", "Product_Name", "Supplier", "Unit_Price_LKR_per_kg"],
                labels={"Total_Active_NPK": "Total Active NPK (g/100g)", "Quality_Score": "Overall Quality Score (0-100)"},
                color_discrete_sequence=px.colors.qualitative.Vivid
            )
            fig_scatter.update_layout(height=380, margin=dict(t=20, b=20, l=20, r=20))
            st.plotly_chart(fig_scatter, width="stretch")

        with c_right:
            st.markdown("##### 📦 Quality Score Distribution by Commodity")
            fig_box = px.box(
                filtered_df,
                x="Product_Name",
                y="Quality_Score",
                color="Product_Name",
                points="outliers",
                labels={"Quality_Score": "Quality Score", "Product_Name": "Fertilizer Type"}
            )
            fig_box.update_layout(showlegend=False, height=380, margin=dict(t=20, b=20, l=20, r=20))
            st.plotly_chart(fig_box, width="stretch")

        c_down1, c_down2 = st.columns(2)
        with c_down1:
            st.markdown("##### 💧 Moisture Content vs. Volatilization Risk")
            fig_hist = px.histogram(
                filtered_df,
                x="Moisture_Content_pct",
                color="Adulterant_Type",
                marginal="box",
                nbins=30,
                labels={"Moisture_Content_pct": "Moisture Content (%)"}
            )
            fig_hist.update_layout(height=340, margin=dict(t=20, b=20, l=20, r=20))
            st.plotly_chart(fig_hist, width="stretch")

        with c_down2:
            st.markdown("##### 💸 Price Spread Distribution (LKR/kg)")
            fig_price_hist = px.histogram(
                filtered_df,
                x="Unit_Price_LKR_per_kg",
                color="Product_Name",
                marginal="violin",
                nbins=25,
                labels={"Unit_Price_LKR_per_kg": "Unit Price (LKR per kg)"}
            )
            fig_price_hist.update_layout(height=340, margin=dict(t=20, b=20, l=20, r=20))
            st.plotly_chart(fig_price_hist, width="stretch")

    with tab_card:
        st.markdown("##### 🔍 Individual Batch Quality Dossier")
        selected_record = st.selectbox("Select Sample Record ID to Inspect", filtered_df["Record_ID"].unique() if len(filtered_df) else ["No Data Available"])
        
        if selected_record and selected_record != "No Data Available":
            row = filtered_df[filtered_df["Record_ID"] == selected_record].iloc[0]
            
            card_col1, card_col2, card_col3 = st.columns([1, 1, 1])
            with card_col1:
                st.markdown(f"""
                <div class="metric-card" style="background:#1e293b; color:#ffffff; border-radius:12px; padding:18px; border-left:5px solid #10b981; box-shadow:0 4px 12px rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.1);">
                    <h4 style="color:#34d399; margin-top:0; margin-bottom:12px; font-weight:700; font-size:1.15rem;">Batch: {row.get('Batch_ID', 'N/A')}</h4>
                    <p style="color:#f8fafc; margin:6px 0; font-size:0.95rem;"><b style="color:#38bdf8;">Product:</b> {row.get('Product_Name', 'N/A')}</p>
                    <p style="color:#f8fafc; margin:6px 0; font-size:0.95rem;"><b style="color:#38bdf8;">Supplier:</b> {row.get('Supplier', 'N/A')}</p>
                    <p style="color:#f8fafc; margin:6px 0; font-size:0.95rem;"><b style="color:#38bdf8;">Province:</b> {row.get('Region', 'N/A')}</p>
                    <p style="color:#f8fafc; margin:6px 0; font-size:0.95rem;"><b style="color:#38bdf8;">Season:</b> {row.get('Season', 'N/A')}</p>
                    <p style="color:#f8fafc; margin:6px 0; font-size:0.95rem;"><b style="color:#38bdf8;">Tested Date:</b> {row.get('Test_Date', 'N/A')}</p>
                </div>
                """, unsafe_allow_html=True)

            with card_col2:
                # Radial NPK bar chart
                npk_data = pd.DataFrame({
                    "Nutrient": ["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)", "Moisture"],
                    "Value (g/100g)": [
                        row.get("Nitrogen_N_g_per_100g", 0),
                        row.get("Phosphorus_P_g_per_100g", 0),
                        row.get("Potassium_K_g_per_100g", 0),
                        row.get("Moisture_Content_pct", 0)
                    ]
                })
                fig_npk = px.bar(
                    npk_data, 
                    x="Nutrient", 
                    y="Value (g/100g)", 
                    color="Nutrient",
                    color_discrete_sequence=["#10b981", "#3b82f6", "#f59e0b", "#06b6d4"]
                )
                fig_npk.update_layout(height=240, margin=dict(t=10, b=10, l=10, r=10), showlegend=False)
                st.plotly_chart(fig_npk, width="stretch")

            with card_col3:
                # Gauge indicator for Quality Score
                q_val = float(row.get("Quality_Score", 0))
                fig_gauge = go.Figure(go.Indicator(
                    mode="gauge+number",
                    value=q_val,
                    title={'text': "Quality Compliance Index"},
                    gauge={
                        'axis': {'range': [0, 100]},
                        'bar': {'color': "#047857" if q_val > 70 else "#dc2626"},
                        'steps': [
                            {'range': [0, 50], 'color': "#fee2e2"},
                            {'range': [50, 75], 'color': "#fef3c7"},
                            {'range': [75, 100], 'color': "#d1fae5"}
                        ]
                    }
                ))
                fig_gauge.update_layout(height=240, margin=dict(t=30, b=10, l=20, r=20))
                st.plotly_chart(fig_gauge, width="stretch")

            st.markdown(f"""
            > **Laboratory Verdict:** Status: **`{row.get('Adulterant_Type', 'Unknown')}`** | 
            > Projected Yield Loss: **`{row.get('Estimated_Yield_Loss_Pct', 0):.1f}%`** | 
            > Per Hectare Loss: **`Rs. {row.get('Estimated_Economic_Loss_LKR_per_ha', 0):,.0f}`**
            """)

    with tab_raw:
        st.markdown("##### Filtered Registry Dataset")
        disp_cols = ["Record_ID", "Batch_ID", "Product_Name", "Supplier", "Region", "Quality_Score", 
                     "Adulterant_Type", "Nitrogen_N_g_per_100g", "Unit_Price_LKR_per_kg", "Estimated_Yield_Loss_Pct"]
        st.dataframe(filtered_df[[c for c in disp_cols if c in filtered_df.columns]], hide_index=True, width="stretch")


# ═══════════════════════════════════════════════════════════
#  ML QUALITY CLASSIFICATION
# ═══════════════════════════════════════════════════════════
elif sel == "quality":
    st.header("🧪 Machine Learning Fertilizer Quality Classification")
    st.caption("Real-time inference using the Champion LightGBM Multi-Class Classifier trained on 14 empirical chemical indicators.")

    if "classifier" not in models:
        st.error("Model checkpoint not found. Verify models directory.")
        st.stop()

    feat_cols = models["feature_cols"]
    labels_info = {
        "Total_Active_NPK": ("Total Active NPK (g/100g)", "Sum of pure Nitrogen, Phosphorus, Potassium", 0.0, 100.0, 46.0),
        "Estimated_Inert_Filler": ("Inert Filler Material (%)", "Insoluble sand, clay, rock powder residue", 0.0, 100.0, 20.0),
        "excess_moisture": ("Excess Moisture Content (%)", "Moisture exceeding standard maximum threshold", 0.0, 20.0, 0.0),
        "dev_n": ("Nitrogen Deviation (Fraction)", "Normalized deviation from certified target N", 0.0, 1.0, 0.01),
        "dev_p": ("Phosphorus Deviation (Fraction)", "Normalized deviation from certified target P", 0.0, 1.0, 0.0),
        "dev_k": ("Potassium Deviation (Fraction)", "Normalized deviation from certified target K", 0.0, 1.0, 0.0),
        "Quality_Score": ("Empirical Quality Score (0-100)", "Overall composite quality metric", 0.0, 100.0, 95.0),
        "Chemical_Deviation_Score": ("Chemical Deviation Score", "Aggregate spectroscopic variance (lower is purer)", 0.0, 100.0, 2.0),
        "Cost_per_Gram_Active_Nutrient": ("Cost / Gram Active Nutrient (LKR)", "Economic efficiency of active nutrients", 0.0, 5.0, 0.2),
        "Price_Deviation_Pct": ("Retail Price Deviation (%)", "Variance against gazetted benchmark price", -50.0, 100.0, 0.0),
        "Moisture_Cost_Waste_LKR_kg": ("Moisture Economic Waste (LKR/kg)", "Financial penalty from water padding", 0.0, 50.0, 0.0),
        "Ratio_N_to_P": ("Nitrogen to Phosphorus Ratio", "Stoichiometric nutrient balance ratio", 0.0, 500.0, 300.0),
        "NLP_Risk_Score": ("Textual Bag OCR Risk Score", "Risk score derived from packaging anomaly keywords", 0.0, 1.0, 0.1),
        "Moisture_Volatilization_Interaction": ("Moisture Volatilization Interaction", "Interaction term for urea caking and nitrogen loss", 0.0, 1.0, 0.01),
    }

    PRESETS = {
        "pure": {
            "Total_Active_NPK": 46.5, "Estimated_Inert_Filler": 52.0, "Quality_Score": 98.0, 
            "Chemical_Deviation_Score": 1.0, "dev_n": 0.01, "dev_p": 0.0, "dev_k": 0.0, 
            "excess_moisture": 0.0, "Cost_per_Gram_Active_Nutrient": 0.22, "Price_Deviation_Pct": -2.0, 
            "Moisture_Cost_Waste_LKR_kg": 0.0, "Ratio_N_to_P": 310.0, "NLP_Risk_Score": 0.1, 
            "Moisture_Volatilization_Interaction": 0.01
        },
        "substandard": {
            "Total_Active_NPK": 30.0, "Estimated_Inert_Filler": 65.0, "Quality_Score": 40.0, 
            "Chemical_Deviation_Score": 35.0, "dev_n": 0.35, "dev_p": 0.1, "dev_k": 0.1, 
            "excess_moisture": 0.0, "Cost_per_Gram_Active_Nutrient": 0.45, "Price_Deviation_Pct": 10.0, 
            "Moisture_Cost_Waste_LKR_kg": 0.0, "Ratio_N_to_P": 150.0, "NLP_Risk_Score": 0.3, 
            "Moisture_Volatilization_Interaction": 0.05
        },
        "heavy_filler": {
            "Total_Active_NPK": 18.0, "Estimated_Inert_Filler": 78.0, "Quality_Score": 22.0, 
            "Chemical_Deviation_Score": 55.0, "dev_n": 0.60, "dev_p": 0.2, "dev_k": 0.2, 
            "excess_moisture": 3.0, "Cost_per_Gram_Active_Nutrient": 0.85, "Price_Deviation_Pct": -12.0, 
            "Moisture_Cost_Waste_LKR_kg": 8.0, "Ratio_N_to_P": 80.0, "NLP_Risk_Score": 0.7, 
            "Moisture_Volatilization_Interaction": 0.25
        }
    }

    def apply_preset(preset_key):
        p_dict = PRESETS[preset_key]
        for k, v in p_dict.items():
            st.session_state[f"chem_{k}"] = float(v)
        st.session_state["execute_chem_diag"] = True

    # Initialize all session state keys if not already present
    for c in feat_cols:
        if f"chem_{c}" not in st.session_state:
            default_v = labels_info.get(c, (c, "", 0.0, 100.0, 50.0))[4]
            st.session_state[f"chem_{c}"] = float(default_v)

    st.markdown("#### ⚡ Quick Diagnostic Presets (Click to Auto-Diagnose)")
    p1, p2, p3 = st.columns(3)
    p1.button("🟢 Standard Pure Urea Sample", on_click=apply_preset, args=("pure",), use_container_width=True)
    p2.button("🟡 Substandard Blend Sample", on_click=apply_preset, args=("substandard",), use_container_width=True)
    p3.button("🔴 Heavy Filler Adulteration", on_click=apply_preset, args=("heavy_filler",), use_container_width=True)

    col1, col2 = st.columns(2)
    features = {}
    for i, c in enumerate(feat_cols):
        info = labels_info.get(c, (c, "", 0.0, 100.0, 50.0))
        with (col1 if i % 2 == 0 else col2):
            features[c] = st.number_input(
                info[0], 
                min_value=info[2], 
                max_value=info[3], 
                help=info[1], 
                key=f"chem_{c}"
            )

    st.markdown("---")
    exec_clicked = st.button("🚀 Execute Machine Learning Diagnostic", type="primary", use_container_width=True)
    should_run = exec_clicked or st.session_state.get("execute_chem_diag", False)
    if should_run:
        st.session_state["execute_chem_diag"] = False
        input_df = pd.DataFrame([features])
        transformed = models["preprocessor"].transform(input_df[feat_cols])
        pred_idx = models["classifier"].predict(transformed)[0]
        pred_label = models["label_encoder"].inverse_transform([pred_idx])[0]
        probs = models["classifier"].predict_proba(transformed)[0]
        confidence = float(np.max(probs) * 100)

        st.markdown("### 📋 Diagnostic Assessment Report")

        verdicts = {
            "Standard_Pure": (
                "✅ Standard Compliant (Pure)", 
                "Laboratory chemistry satisfies official SLSI standard specifications. Fully certified for agrarian application.", 
                "success"
            ),
            "Substandard_Blend": (
                "⚠️ Substandard Nutrient Dilution", 
                "Active chemical concentrations fail standard statutory specifications. Nutrient density is deficient.", 
                "warning"
            ),
            "Heavy_Insoluble_Filler": (
                "🚨 Illegal Tampering: Insoluble Inert Filler Detected", 
                "Contaminated with bulk insoluble fillers (crushed limestone, quarry dust, or sand). Violates Fertilizer Act No. 68.", 
                "error"
            ),
            "Moisture_Weight_Padding": (
                "🚨 Weight Fraud: Artificial Moisture Padding", 
                "Excessive water content added to artificially inflate weight. Triggers accelerated volatilization and caking.", 
                "error"
            ),
        }

        v_title, v_desc, v_type = verdicts.get(pred_label, ("Unknown Classification", "", "info"))
        getattr(st, v_type)(f"### {v_title}")
        st.markdown(f"> {v_desc}")

        # Metrics overview
        m1, m2, m3 = st.columns(3)
        m1.metric("Model Classification Confidence", f"{confidence:.1f}%")

        yl_feats = models.get("yield_loss_features", feat_cols)
        yl_input = pd.DataFrame([{c: features.get(c, 0.0) for c in yl_feats}])
        try:
            yl_val = max(0.0, float(models["yield_loss"].predict(yl_input)[0]))
            m2.metric("Projected Farm Yield Loss", f"{yl_val:.1f}%")
        except:
            m2.metric("Projected Farm Yield Loss", "N/A")

        try:
            el_val = max(0.0, float(models["economic_loss"].predict(yl_input)[0]))
            m3.metric("Projected Economic Loss", f"Rs. {el_val:,.0f} / ha")
        except:
            m3.metric("Projected Economic Loss", "N/A")

        # Visual Probability Bar Chart
        st.markdown("##### Model Class Probability Distribution")
        prob_df = pd.DataFrame({
            "Class Name": [models["label_encoder"].inverse_transform([i])[0] for i in range(len(probs))],
            "Probability (%)": [round(p * 100, 2) for p in probs]
        })
        fig_prob = px.bar(
            prob_df,
            x="Class Name",
            y="Probability (%)",
            color="Class Name",
            text="Probability (%)",
            color_discrete_sequence=["#ef4444", "#f97316", "#10b981", "#eab308"]
        )
        fig_prob.update_layout(showlegend=False, height=260, margin=dict(t=10, b=10, l=10, r=10))
        st.plotly_chart(fig_prob, width="stretch")


# ═══════════════════════════════════════════════════════════
#  CROP & ECONOMIC LOSS PREDICTOR
# ═══════════════════════════════════════════════════════════
elif sel == "loss":
    st.header("📉 Crop & Economic Loss Forecaster")
    st.caption("Calculates harvest deficit percentage and monetary farmer damage caused by counterfeit inputs.")

    yl_feats = models.get("yield_loss_features", [])
    if not yl_feats:
        st.error("Yield Loss model weights missing.")
        st.stop()

    c1, c2 = st.columns(2)
    with c1:
        quality_in = st.slider("Quality Score Index (0 - 100)", 0, 100, 60, help="100 indicates optimal certified purity")
        deviation_in = st.slider("Chemical Deviation Score", 0, 100, 25, help="Variance from certified standard")
        inert_in = st.slider("Inert Filler Proportion (%)", 0, 100, 30)
    with c2:
        moisture_in = st.slider("Excess Moisture Content (%)", 0.0, 20.0, 2.5, 0.5)
        dev_n_in = st.slider("Nitrogen Nutrient Deficit (0 to 1)", 0.0, 1.0, 0.15, 0.01)
        farm_size_acres = st.number_input("Cultivated Farm Size (Acres)", 0.5, 100.0, 3.0, 0.5)

    if st.button("📊 Calculate Loss Projections", type="primary", use_container_width=True):
        inp = {c: 0.0 for c in yl_feats}
        inp.update({
            "Quality_Score": quality_in,
            "Chemical_Deviation_Score": deviation_in,
            "Estimated_Inert_Filler": inert_in,
            "excess_moisture": moisture_in,
            "dev_n": dev_n_in,
            "Total_Active_NPK": max(0.0, 100.0 - inert_in)
        })
        idf = pd.DataFrame([inp])[yl_feats]

        raw_yl = float(models["yield_loss"].predict(idf)[0])
        raw_el = float(models["economic_loss"].predict(idf)[0])
        
        # Clamp practically non-negative
        yl_res = max(0.0, raw_yl)
        el_res = max(0.0, raw_el)

        farm_size_ha = farm_size_acres * 0.4047
        total_farm_loss = el_res * farm_size_ha

        st.markdown("---")
        st.markdown("### 📋 Agronomic Impact Projections")

        k1, k2, k3 = st.columns(3)
        k1.metric("Yield Loss Deficit", f"{yl_res:.1f}%", f"-{yl_res:.1f}% Expected Harvest", delta_color="inverse")
        k2.metric("Economic Loss / Hectare", f"Rs. {el_res:,.0f} / ha")
        k3.metric("Total Farmer Financial Loss", f"Rs. {total_farm_loss:,.0f}", f"Across {farm_size_acres} Acres")

        # Visual indicator
        fig_loss_gauge = go.Figure(go.Indicator(
            mode="gauge+number",
            value=yl_res,
            title={'text': "Projected Crop Yield Deficit (%)"},
            gauge={
                'axis': {'range': [0, 50]},
                'bar': {'color': "#dc2626" if yl_res > 15 else ("#f59e0b" if yl_res > 5 else "#10b981")},
                'steps': [
                    {'range': [0, 5], 'color': "#d1fae5"},
                    {'range': [5, 15], 'color': "#fef3c7"},
                    {'range': [15, 50], 'color': "#fee2e2"}
                ]
            }
        ))
        fig_loss_gauge.update_layout(height=260, margin=dict(t=30, b=10, l=20, r=20))
        st.plotly_chart(fig_loss_gauge, width="stretch")


# ═══════════════════════════════════════════════════════════
#  ANOMALY DETECTION
# ═══════════════════════════════════════════════════════════
elif sel == "anomaly":
    st.header("🔍 Unsupervised Anomaly Detection")
    st.caption("Identifies anomalous chemical compositions and abnormal price arbitrage using Isolation Forest and LOF.")

    tab1, tab2 = st.tabs(["🧪 Chemical Composition Outliers", "💸 Price Arbitrage & Markup Outliers"])

    with tab1:
        if "iso_forest" in models and "scaler_chem" in models:
            chem_cols = ["Nitrogen_N_g_per_100g", "Phosphorus_P_g_per_100g", "Potassium_K_g_per_100g", "Moisture_Content_pct", "Chemical_Deviation_Score"]
            valid = [c for c in chem_cols if c in df.columns]
            chem_data = df[valid].dropna()
            scaled = models["scaler_chem"].transform(chem_data)
            preds = models["iso_forest"].predict(scaled)
            anomaly_mask = preds == -1
            n_anom = anomaly_mask.sum()

            c1, c2, c3 = st.columns(3)
            c1.metric("Detected Anomalous Batches", f"{n_anom:,}")
            c2.metric("Normal Regulated Batches", f"{len(chem_data) - n_anom:,}")
            c3.metric("Anomaly Ratio", f"{n_anom/len(chem_data)*100:.1f}%")

            # 2D scatter of anomaly distribution
            plot_df = chem_data.copy()
            plot_df["Status"] = np.where(anomaly_mask, "Anomalous Sample", "Conforming Sample")
            fig_anom = px.scatter(
                plot_df,
                x="Nitrogen_N_g_per_100g",
                y="Chemical_Deviation_Score",
                color="Status",
                color_discrete_map={"Anomalous Sample": "#ef4444", "Conforming Sample": "#10b981"},
                title="Isolation Forest Anomaly Frontier"
            )
            fig_anom.update_layout(height=350, margin=dict(t=30, b=20, l=20, r=20))
            st.plotly_chart(fig_anom, width="stretch")

    with tab2:
        if "Price_Deviation_Pct" in df.columns:
            high_price_df = df[df["Price_Deviation_Pct"] > 15].copy()
            st.metric("Price Gouging Incidents (>15% Markup)", f"{len(high_price_df)} batches")

            fig_price_box = px.box(
                df,
                x="Region",
                y="Price_Deviation_Pct",
                color="Region",
                title="Regional Fertilizer Price Variance (%)"
            )
            fig_price_box.update_layout(height=350, showlegend=False, margin=dict(t=30, b=20, l=20, r=20))
            st.plotly_chart(fig_price_box, width="stretch")


# ═══════════════════════════════════════════════════════════
#  MARKET PRICE INTELLIGENCE
# ═══════════════════════════════════════════════════════════
elif sel == "price":
    st.header("💰 Fertilizer Market Price Intelligence")
    st.caption("Empirical price analytics across distributor networks, provincial hubs, and product categories.")

    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Regional Mean Price (LKR per kg)")
        reg_price = df.groupby("Region")["Unit_Price_LKR_per_kg"].mean().reset_index()
        fig_rp = px.bar(reg_price, x="Region", y="Unit_Price_LKR_per_kg", color="Unit_Price_LKR_per_kg", color_continuous_scale="Viridis")
        fig_rp.update_layout(height=340, margin=dict(t=20, b=20, l=20, r=20))
        st.plotly_chart(fig_rp, width="stretch")

    with col2:
        st.subheader("Price Spread by Supplier")
        sup_price = df.groupby("Supplier")["Unit_Price_LKR_per_kg"].mean().reset_index().sort_values("Unit_Price_LKR_per_kg")
        fig_sp = px.bar(sup_price, x="Unit_Price_LKR_per_kg", y="Supplier", orientation="h", color="Unit_Price_LKR_per_kg", color_continuous_scale="Teal")
        fig_sp.update_layout(height=340, margin=dict(t=20, b=20, l=20, r=20))
        st.plotly_chart(fig_sp, width="stretch")

    # Quality vs Price trade-off insight
    st.markdown("---")
    st.subheader("⚖️ Empirical Insight: Discounted Prices Correlate with Lower Purity")
    low_price_samples = df[df["Price_Deviation_Pct"] < -10]
    high_price_samples = df[df["Price_Deviation_Pct"] > 10]
    
    lp1, lp2 = st.columns(2)
    lp1.metric("Discounted Batches (>10% below benchmark)", f"{len(low_price_samples)} batches", f"Mean Quality: {low_price_samples['Quality_Score'].mean():.1f}/100")
    lp2.metric("Premium Batches (>10% markup)", f"{len(high_price_samples)} batches", f"Mean Quality: {high_price_samples['Quality_Score'].mean():.1f}/100")


# ═══════════════════════════════════════════════════════════
#  REGIONAL DEMAND FORECAST
# ═══════════════════════════════════════════════════════════
elif sel == "demand":
    st.header("📈 Regional Demand Forecaster")
    st.caption("Gradient Boosting Regressor predicting metric tons (MT) of seasonal fertilizer requirements based on agro-climatic parameters.")

    if "demand_forecaster" not in models or "demand_features" not in models:
        st.error("Demand forecasting pipeline checkpoints missing.")
        st.stop()

    dm_feats = models["demand_features"]
    c1, c2 = st.columns(2)
    with c1:
        sel_region = st.selectbox("Target Province", [
            "Central Province", "Eastern Province", "North Central Province",
            "North Western Province", "Northern Province", "Sabaragamuwa Province",
            "Southern Province", "Uva Province", "Western Province"
        ])
        sel_season = st.selectbox("Cultivation Season", ["Maha", "Yala", "Off-Season"])
        sel_product = st.selectbox("Commodity", [
            "Urea", "MOP (Muriate of Potash)", "TSP (Triple Super Phosphate)",
            "NPK 15-15-15", "NPK 12-12-17", "Compost / Organic", "Dolomite", 
            "Eppawala Rock Phosphate (ERP)", "Ammonium Sulfate (SOA)"
        ])
    with c2:
        cultivated_ha = st.number_input("Target Cultivated Extent (Hectares)", 1000, 250000, 45000, 2500)
        rainfall_mm = st.number_input("Projected Monthly Rainfall (mm)", 0, 600, 180)
        temp_c = st.number_input("Mean Regional Temperature (°C)", 18.0, 38.0, 28.5, 0.5)

    if st.button("📊 Generate Demand Forecast", type="primary", use_container_width=True):
        inp = {c: 0.0 for c in dm_feats}
        inp["Cultivated_Extent_ha"] = cultivated_ha
        inp["monthly_rainfall_mm"] = rainfall_mm
        inp["avg_temperature_c"] = temp_c

        # Set one-hot encodings
        if f"Region_{sel_region}" in inp: inp[f"Region_{sel_region}"] = 1.0
        if f"Season_{sel_season}" in inp: inp[f"Season_{sel_season}"] = 1.0
        if f"Product_Name_{sel_product}" in inp: inp[f"Product_Name_{sel_product}"] = 1.0

        idf = pd.DataFrame([inp])[dm_feats]
        forecast_mt = float(models["demand_forecaster"].predict(idf)[0])

        st.markdown("---")
        st.markdown("### 📋 Demand Forecast Result")

        r1, r2, r3 = st.columns(3)
        r1.metric("Forecasted Requisition", f"{forecast_mt:,.0f} MT")
        r2.metric("Province / Season", f"{sel_region} — {sel_season}")
        r3.metric("Cultivated Extent", f"{cultivated_ha:,} ha")

        st.info(f"💡 Under current climatic projections ({rainfall_mm} mm rainfall, {temp_c} °C), the projected buffer allocation for **{sel_product}** in **{sel_region}** is **{forecast_mt:,.0f} Metric Tons**.")


# ═══════════════════════════════════════════════════════════
#  PROVINCIAL RISK ANALYTICS
# ═══════════════════════════════════════════════════════════
elif sel == "regional":
    st.header("🗺️ Provincial Fertilizer Risk Analytics")
    st.caption("Spatial quality distribution and fraud exposure across all 9 Sri Lankan administrative provinces.")

    prov_agg = df.groupby("Region").agg({
        "Quality_Score": "mean",
        "Chemical_Deviation_Score": "mean",
        "Estimated_Yield_Loss_Pct": "mean",
        "Unit_Price_LKR_per_kg": "mean",
        "Record_ID": "count"
    }).reset_index()

    prov_agg.columns = ["Province", "Mean Quality Score", "Mean Deviation", "Yield Loss (%)", "Mean Price (LKR)", "Total Samples"]

    col_l, col_r = st.columns(2)
    with col_l:
        st.subheader("Regional Quality Index")
        fig_prov_q = px.bar(
            prov_agg.sort_values("Mean Quality Score"),
            x="Mean Quality Score",
            y="Province",
            orientation="h",
            color="Mean Quality Score",
            color_continuous_scale="RdYlGn"
        )
        fig_prov_q.update_layout(height=360, margin=dict(t=20, b=20, l=20, r=20))
        st.plotly_chart(fig_prov_q, width="stretch")

    with col_r:
        st.subheader("Regional Expected Harvest Deficit (%)")
        fig_prov_y = px.bar(
            prov_agg.sort_values("Yield Loss (%)", ascending=False),
            x="Yield Loss (%)",
            y="Province",
            orientation="h",
            color="Yield Loss (%)",
            color_continuous_scale="Reds"
        )
        fig_prov_y.update_layout(height=360, margin=dict(t=20, b=20, l=20, r=20))
        st.plotly_chart(fig_prov_y, width="stretch")

    st.markdown("---")
    st.subheader("Provincial Adulteration Matrix")
    crosstab_df = pd.crosstab(df["Region"], df["Adulterant_Type"]).reset_index()
    fig_heat = px.imshow(
        pd.crosstab(df["Region"], df["Adulterant_Type"]),
        text_auto=True,
        aspect="auto",
        color_continuous_scale="YlOrRd",
        labels=dict(x="Adulteration Category", y="Province", color="Incident Count")
    )
    fig_heat.update_layout(height=380, margin=dict(t=20, b=20, l=20, r=20))
    st.plotly_chart(fig_heat, width="stretch")


# ═══════════════════════════════════════════════════════════
#  FOOTER
# ═══════════════════════════════════════════════════════════
st.markdown("---")
st.markdown("""
<div style="text-align:center;color:#64748b;padding:1.5rem;">
    <strong>🌾 CropSafe AI v2.0</strong> — Sri Lanka National Fertilizer Quality Intelligence Platform<br>
    <small>Sabaragamuwa University of Sri Lanka | Faculty of Computing | Department of Data Science<br>
    DS3206 Capstone Project II </small>
</div>
""", unsafe_allow_html=True)
