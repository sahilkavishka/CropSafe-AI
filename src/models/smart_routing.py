"""
CropSafe AI - Prescriptive Smart Inspection Routing & Agronomic Advisor Engine
Faculty of Computing | Sabaragamuwa University of Sri Lanka (DS3206 Capstone Project II)

Provides:
  1. Prescriptive Inspector Routing (2-Opt TSP optimization over high-risk retail stores)
  2. Precision Nutrient Compensation & Crop Reallocation Advisor
  3. Statutory Legal Penalty Evaluator (Fertilizer Act No. 68 of 1988)
"""

import os
import numpy as np
import pandas as pd

def _find_file(relative_path):
    """Finds a file whether run from workspace root, cropsafe AI, or subdirectories."""
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

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculates great-circle distance between two points on Earth in kilometers."""
    R = 6371.0 # Earth radius in km
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    delta_phi = np.radians(lat2 - lat1)
    delta_lambda = np.radians(lon2 - lon1)
    a = np.sin(delta_phi / 2.0)**2 + np.cos(phi1) * np.cos(phi2) * np.sin(delta_lambda / 2.0)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return R * c

def solve_2opt_tsp(coords):
    """Solves TSP using iterative 2-Opt local search algorithm."""
    n = len(coords)
    if n <= 2:
        return list(range(n)), 0.0
    
    route = list(range(n))
    def calculate_total_dist(curr_route):
        return sum(haversine_distance(coords[curr_route[i]][0], coords[curr_route[i]][1],
                                      coords[curr_route[i+1]][0], coords[curr_route[i+1]][1])
                   for i in range(len(curr_route)-1))
    
    improved = True
    best_dist = calculate_total_dist(route)
    
    while improved:
        improved = False
        for i in range(1, n - 1):
            for j in range(i + 1, n):
                if j - i == 1:
                    continue
                new_route = route[:i] + route[i:j][::-1] + route[j:]
                new_dist = calculate_total_dist(new_route)
                if new_dist < best_dist:
                    route = new_route
                    best_dist = new_dist
                    improved = True
                    break
            if improved:
                break
    return route, best_dist

def get_prescriptive_inspector_route(region="North Central Province", top_k=6,
                                     data_path="data/processed/cropsafe_master_dataset.csv",
                                     geo_path="data/scraped/sri_lanka_25_districts_geo.csv"):
    """
    Ranks high-risk retail suppliers in a given region and designs an optimized sequential inspection itinerary.
    """
    actual_data_path = _find_file(data_path)
    actual_geo_path = _find_file(geo_path)
    
    df = pd.read_csv(actual_data_path)
    geo_df = pd.read_csv(actual_geo_path)

    # Filter regional consignments
    reg_df = df[df["Region"] == region].copy()
    if reg_df.empty:
        reg_df = df.copy()

    # Calculate Risk Score per supplier based on substandard history and price arbitrage
    supplier_risk = reg_df.groupby("Supplier").agg(
        Total_Tested=("Record_ID", "count"),
        Substandard_Count=("Lab_Certified", lambda x: (x == "No").sum()),
        Arbitrage_Count=("Price_Arbitrage_Flag", "sum"),
        Mean_Quality_Score=("Quality_Score", "mean"),
        Latest_Batch=("Batch_ID", "last")
    ).reset_index()

    supplier_risk["Risk_Probability_Pct"] = np.round(
        ((supplier_risk["Substandard_Count"] * 1.5 + supplier_risk["Arbitrage_Count"] * 2.0) /
         supplier_risk["Total_Tested"]) * 100.0, 1
    )
    supplier_risk["Risk_Probability_Pct"] = np.clip(supplier_risk["Risk_Probability_Pct"], 5.0, 96.0)

    # Sort descending by risk
    top_targets = supplier_risk.sort_values(by="Risk_Probability_Pct", ascending=False).head(top_k).copy()

    # Base coordinates of provincial center
    base_lat = reg_df["Provincial_Center_Lat"].iloc[0] if "Provincial_Center_Lat" in reg_df else 8.3114
    base_lon = reg_df["Provincial_Center_Lon"].iloc[0] if "Provincial_Center_Lon" in reg_df else 80.4037

    # Assign realistic coordinates for retail hubs around center
    np.random.seed(42)
    coords = []
    store_records = []
    
    for idx, row in top_targets.iterrows():
        lat_offset = np.random.uniform(-0.15, 0.15)
        lon_offset = np.random.uniform(-0.15, 0.15)
        s_lat = round(base_lat + lat_offset, 4)
        s_lon = round(base_lon + lon_offset, 4)
        coords.append((s_lat, s_lon))
        store_records.append({
            "Supplier": row["Supplier"],
            "Target_Batch": row["Latest_Batch"],
            "Risk_Probability_Pct": row["Risk_Probability_Pct"],
            "Substandard_History": f"{row['Substandard_Count']}/{row['Total_Tested']} failed",
            "Arbitrage_Cases": row["Arbitrage_Count"],
            "Lat": s_lat,
            "Lon": s_lon
        })

    # Solve 2-Opt TSP
    opt_indices, opt_distance_km = solve_2opt_tsp(coords)

    # Build sequence itinerary
    itinerary = []
    cum_dist = 0.0
    for stop_order, node_idx in enumerate(opt_indices, 1):
        store = store_records[node_idx]
        if stop_order == 1:
            leg_dist = 0.0
        else:
            prev_store = store_records[opt_indices[stop_order - 2]]
            leg_dist = round(haversine_distance(prev_store["Lat"], prev_store["Lon"], store["Lat"], store["Lon"]), 1)
        cum_dist += leg_dist

        itinerary.append({
            "Stop_Order": stop_order,
            "Supplier_Store": store["Supplier"],
            "Target_Batch": store["Target_Batch"],
            "Risk_Probability_Pct": store["Risk_Probability_Pct"],
            "Inspection_Priority": "CRITICAL RAID" if store["Risk_Probability_Pct"] >= 60 else "ELEVATED AUDIT",
            "Leg_Distance_km": leg_dist,
            "Cumulative_km": round(cum_dist, 1),
            "Latitude": store["Lat"],
            "Longitude": store["Lon"],
            "Recommended_Action": "Full Seizure & Laboratory Assay" if store["Risk_Probability_Pct"] >= 60 else "Random Bag Core Sampling"
        })

    itinerary_df = pd.DataFrame(itinerary)
    metrics = {
        "Total_Optimized_Distance_km": round(cum_dist, 1),
        "Estimated_Inspection_Time_Hours": round(cum_dist / 40.0 + (len(opt_indices) * 0.75), 1), # 40km/h patrol + 45min audit per store
        "Target_Count": len(opt_indices),
        "Region": region
    }
    return itinerary_df, metrics

def recommend_nutrient_adaptation(product_name, actual_n, actual_p, actual_k, moisture,
                                  inert_filler=0.0, target_crop="Paddy (Rice)",
                                  crop_guide_path="data/scraped/crop_nutrient_guidelines.csv",
                                  standards_path="data/scraped/slsi_fertilizer_standards.csv"):
    """
    Computes stoichiometric nutrient deficiency against SLSI standards and provides precision agronomic compensation.
    """
    actual_crop_path = _find_file(crop_guide_path)
    actual_std_path = _find_file(standards_path)

    crop_df = pd.read_csv(actual_crop_path)
    std_df = pd.read_csv(actual_std_path)

    # Standard expected values
    p_std = std_df[std_df["Product_Name"] == product_name]
    expected_n = p_std["expected_n"].values[0] if not p_std.empty else 46.0
    expected_p = p_std["expected_p"].values[0] if not p_std.empty else 0.0
    expected_k = p_std["expected_k"].values[0] if not p_std.empty else 0.0

    # Deficits
    def_n = max(0.0, expected_n - actual_n)
    def_p = max(0.0, expected_p - actual_p)
    def_k = max(0.0, expected_k - actual_k)

    crop_info = crop_df[crop_df["Crop_Name"] == target_crop]
    rec_n_rate = crop_info["Recommended_N_kg_ha"].values[0] if not crop_info.empty else 105.0

    # Compensation calculation
    compensation_kg = 0.0
    if expected_n > 0 and def_n > 0:
        compensation_kg = round((def_n / max(actual_n, 1.0)) * 100.0, 1)

    # Suitability decision
    if def_n < 2.0 and def_p < 2.0 and def_k < 2.0 and moisture < 2.0:
        verdict = "CERTIFIED_PURITY_SAFE"
        advice = f"Fertilizer complies fully with SLSI specification. Apply standard recommended rate of {rec_n_rate} kg/ha for {target_crop}."
        alt_crops = [target_crop]
    elif def_n <= 12.0 and inert_filler < 30.0 and moisture < 4.0:
        verdict = "RECOVERABLE_WITH_COMPENSATION"
        advice = (f"Nutrient concentration is moderately depleted ({def_n:.1f}% N deficit). "
                  f"Do not discard. Compensate by applying an additional {compensation_kg} kg/ha of Urea, "
                  f"or reallocate to less nutrient-sensitive crops.")
        alt_crops = [target_crop, "Maize", "Sugarcane", "Coconut"]
    else:
        verdict = "CRITICAL_HAZARD_REJECT"
        advice = (f"Severe adulteration detected ({def_n:.1f}% N deficit, {inert_filler:.1f}% inert filler). "
                  f"Applying to {target_crop} risks toxic shock, root rot, and severe harvest decline. Discontinue application.")
        alt_crops = ["Coconut (Cocos nucifera)", "Rubber (Hevea brasiliensis)", "Timber Agroforestry"]

    statutory_fine = 0.0
    if def_n > 2.0 or moisture > 2.0 or inert_filler > 10.0:
        statutory_fine = min(100000.0, 25000.0 + (def_n * 2500.0) + (inert_filler * 1500.0))

    return {
        "Verdict": verdict,
        "Nutrient_Deficits": {"N_Deficit_Pct": round(def_n, 2), "P_Deficit_Pct": round(def_p, 2), "K_Deficit_Pct": round(def_k, 2)},
        "Additional_Compensation_kg_ha": compensation_kg,
        "Agronomic_Advice": advice,
        "Alternative_Suitable_Crops": alt_crops,
        "Statutory_Fine_LKR": round(statutory_fine, 2)
    }

if __name__ == "__main__":
    print("Testing Inspector Routing...")
    route_df, metrics = get_prescriptive_inspector_route()
    print(route_df[["Stop_Order", "Supplier_Store", "Risk_Probability_Pct", "Inspection_Priority", "Leg_Distance_km", "Cumulative_km"]])
    print("Metrics:", metrics)

    print("\nTesting Smart Nutrient Advisor for substandard sample...")
    advice = recommend_nutrient_adaptation("Urea", actual_n=39.5, actual_p=0.0, actual_k=0.0, moisture=2.2, inert_filler=18.0)
    print("Verdict:", advice["Verdict"])
    print("Compensation:", advice["Additional_Compensation_kg_ha"], "kg/ha")
    print("Advice:", advice["Agronomic_Advice"])
    print("Alternative Crops:", advice["Alternative_Suitable_Crops"])
    print(f"Statutory Penalty: LKR {advice['Statutory_Fine_LKR']:,.2f}")
