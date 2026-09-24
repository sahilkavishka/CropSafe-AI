"""
CropSafe AI - Sri Lanka 25 Districts & Key Agrarian Hubs Geo-Data Collector
Compiles spatial coordinates, agrarian zones, and district agrarian development centers
across all 25 administrative districts in Sri Lanka.
Used for:
  1. Geo-Spatial Fraud Heatmaps (Folium / Leaflet / Power BI)
  2. Spatial Anomaly Clustering
  3. Smart Routing for Agricultural Inspectors
"""

import os
import pandas as pd

# Comprehensive spatial registry of all 25 districts with primary agrarian hubs and coordinates
SRI_LANKA_DISTRICT_AGRARIAN_REGISTRY = [
    # North Central Province
    {"Province": "North Central Province", "District": "Anuradhapura", "Primary_Agrarian_Hub": "Anuradhapura Central Agrarian Hub", "Latitude": 8.3114, "Longitude": 80.4037, "Zone": "Dry Zone", "Agri_Priority": "Very High"},
    {"Province": "North Central Province", "District": "Polonnaruwa", "Primary_Agrarian_Hub": "Polonnaruwa Rice Belt Hub", "Latitude": 7.9403, "Longitude": 81.0188, "Zone": "Dry Zone", "Agri_Priority": "Very High"},
    
    # Eastern Province
    {"Province": "Eastern Province", "District": "Ampara", "Primary_Agrarian_Hub": "Ampara Digamadulla Hub", "Latitude": 7.2912, "Longitude": 81.6724, "Zone": "Dry Zone", "Agri_Priority": "Very High"},
    {"Province": "Eastern Province", "District": "Batticaloa", "Primary_Agrarian_Hub": "Batticaloa Coastal Agrarian Hub", "Latitude": 7.7310, "Longitude": 81.6747, "Zone": "Dry Zone", "Agri_Priority": "High"},
    {"Province": "Eastern Province", "District": "Trincomalee", "Primary_Agrarian_Hub": "Trincomalee Agri Trading Center", "Latitude": 8.5874, "Longitude": 81.2152, "Zone": "Dry Zone", "Agri_Priority": "Medium"},

    # North Western Province
    {"Province": "North Western Province", "District": "Kurunegala", "Primary_Agrarian_Hub": "Kurunegala Wayamba Agri Complex", "Latitude": 7.4863, "Longitude": 80.3623, "Zone": "Intermediate Zone", "Agri_Priority": "Very High"},
    {"Province": "North Western Province", "District": "Puttalam", "Primary_Agrarian_Hub": "Puttalam Agro-Fisheries Hub", "Latitude": 8.0362, "Longitude": 79.8283, "Zone": "Dry Zone", "Agri_Priority": "Medium"},

    # Central Province
    {"Province": "Central Province", "District": "Kandy", "Primary_Agrarian_Hub": "Kandy Peradeniya Agri Center", "Latitude": 7.2906, "Longitude": 80.6337, "Zone": "Wet Zone", "Agri_Priority": "High"},
    {"Province": "Central Province", "District": "Matale", "Primary_Agrarian_Hub": "Matale Spice & Vegetable Center", "Latitude": 7.4675, "Longitude": 80.6234, "Zone": "Intermediate Zone", "Agri_Priority": "High"},
    {"Province": "Central Province", "District": "Nuwara Eliya", "Primary_Agrarian_Hub": "Nuwara Eliya Upcountry Vegetable Hub", "Latitude": 6.9497, "Longitude": 80.7891, "Zone": "Wet Zone - Montane", "Agri_Priority": "Very High"},

    # Uva Province
    {"Province": "Uva Province", "District": "Badulla", "Primary_Agrarian_Hub": "Badulla Uva Agri Development Center", "Latitude": 6.9934, "Longitude": 81.0550, "Zone": "Intermediate Zone", "Agri_Priority": "High"},
    {"Province": "Uva Province", "District": "Monaragala", "Primary_Agrarian_Hub": "Monaragala Commercial Farming Hub", "Latitude": 6.8728, "Longitude": 81.3507, "Zone": "Dry Zone", "Agri_Priority": "High"},

    # Southern Province
    {"Province": "Southern Province", "District": "Hambantota", "Primary_Agrarian_Hub": "Hambantota Ruhunu Agrarian Center", "Latitude": 6.1429, "Longitude": 81.1212, "Zone": "Dry Zone", "Agri_Priority": "Very High"},
    {"Province": "Southern Province", "District": "Matara", "Primary_Agrarian_Hub": "Matara Agri Supplies Center", "Latitude": 5.9549, "Longitude": 80.5550, "Zone": "Wet Zone", "Agri_Priority": "Medium"},
    {"Province": "Southern Province", "District": "Galle", "Primary_Agrarian_Hub": "Galle Southern Agro Hub", "Latitude": 6.0535, "Longitude": 80.2210, "Zone": "Wet Zone", "Agri_Priority": "Medium"},

    # Northern Province
    {"Province": "Northern Province", "District": "Jaffna", "Primary_Agrarian_Hub": "Jaffna Peninsula Agri Depot", "Latitude": 9.6615, "Longitude": 80.0255, "Zone": "Dry Zone", "Agri_Priority": "High"},
    {"Province": "Northern Province", "District": "Kilinochchi", "Primary_Agrarian_Hub": "Kilinochchi Paddy & Seed Hub", "Latitude": 9.3803, "Longitude": 80.3770, "Zone": "Dry Zone", "Agri_Priority": "High"},
    {"Province": "Northern Province", "District": "Mannar", "Primary_Agrarian_Hub": "Mannar Agri Marketing Center", "Latitude": 8.9810, "Longitude": 79.9044, "Zone": "Dry Zone", "Agri_Priority": "Medium"},
    {"Province": "Northern Province", "District": "Vavuniya", "Primary_Agrarian_Hub": "Vavuniya Agrarian Transit Center", "Latitude": 8.7514, "Longitude": 80.4971, "Zone": "Dry Zone", "Agri_Priority": "Medium"},
    {"Province": "Northern Province", "District": "Mullaitivu", "Primary_Agrarian_Hub": "Mullaitivu Farming Support Center", "Latitude": 9.2671, "Longitude": 80.8142, "Zone": "Dry Zone", "Agri_Priority": "Medium"},

    # Sabaragamuwa Province
    {"Province": "Sabaragamuwa Province", "District": "Ratnapura", "Primary_Agrarian_Hub": "Ratnapura Plantation & Paddy Hub", "Latitude": 6.6828, "Longitude": 80.4037, "Zone": "Wet Zone", "Agri_Priority": "High"},
    {"Province": "Sabaragamuwa Province", "District": "Kegalle", "Primary_Agrarian_Hub": "Kegalle Agri Services Center", "Latitude": 7.2513, "Longitude": 80.3464, "Zone": "Wet Zone", "Agri_Priority": "Medium"},

    # Western Province
    {"Province": "Western Province", "District": "Colombo", "Primary_Agrarian_Hub": "Colombo Commercial & Harbor Hub", "Latitude": 6.9271, "Longitude": 79.8612, "Zone": "Wet Zone", "Agri_Priority": "High"},
    {"Province": "Western Province", "District": "Gampaha", "Primary_Agrarian_Hub": "Gampaha Peri-Urban Agro Center", "Latitude": 7.0840, "Longitude": 79.9939, "Zone": "Wet Zone", "Agri_Priority": "Medium"},
    {"Province": "Western Province", "District": "Kalutara", "Primary_Agrarian_Hub": "Kalutara Plantation Belt Hub", "Latitude": 6.5854, "Longitude": 79.9607, "Zone": "Wet Zone", "Agri_Priority": "Medium"}
]

def save_geo_agrarian_data(output_path="cropsafe AI/data/scraped/sri_lanka_25_districts_geo.csv"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df = pd.DataFrame(SRI_LANKA_DISTRICT_AGRARIAN_REGISTRY)
    df.to_csv(output_path, index=False)
    print(f"Saved Sri Lanka 25 Districts Geo-Registry to {output_path} ({len(df)} districts).")
    return df

if __name__ == "__main__":
    save_geo_agrarian_data()
