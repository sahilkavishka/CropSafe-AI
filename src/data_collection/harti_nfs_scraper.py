"""
CropSafe AI - HARTI and National Fertilizer Secretariat (NFS) Price & Standard Collector
Scrapes HARTI bulletin links and compiles official Sri Lanka benchmark prices and SLSI chemical standards.
"""

import os
import requests
from bs4 import BeautifulSoup
import pandas as pd

# SLSI Official Chemical Standards (Sri Lanka Standards Institute)
SLSI_FERTILIZER_STANDARDS = {
    "Urea": {
        "expected_n": 46.0, "expected_p": 0.0, "expected_k": 0.0,
        "max_moisture_pct": 1.5, "typical_adulterants": "Sand, Low-grade Urea, Salt, Water"
    },
    "TSP (Triple Super Phosphate)": {
        "expected_n": 0.0, "expected_p": 46.0, "expected_k": 0.0,
        "max_moisture_pct": 3.0, "typical_adulterants": "Inert red soil, Rock powder, Crushed brick"
    },
    "MOP (Muriate of Potash)": {
        "expected_n": 0.0, "expected_p": 0.0, "expected_k": 60.0,
        "max_moisture_pct": 2.0, "typical_adulterants": "Table salt (NaCl), Red dyed sand, Sand"
    },
    "NPK 15-15-15": {
        "expected_n": 15.0, "expected_p": 15.0, "expected_k": 15.0,
        "max_moisture_pct": 2.0, "typical_adulterants": "Inert filler, Clay, Sand"
    },
    "NPK 12-12-17": {
        "expected_n": 12.0, "expected_p": 12.0, "expected_k": 17.0,
        "max_moisture_pct": 2.0, "typical_adulterants": "Inert filler, Clay, Sand"
    },
    "Ammonium Sulfate (SOA)": {
        "expected_n": 21.0, "expected_p": 0.0, "expected_k": 0.0,
        "max_moisture_pct": 1.5, "typical_adulterants": "Industrial gypsum, Salt, Water"
    },
    "Dolomite": {
        "expected_n": 0.0, "expected_p": 0.0, "expected_k": 0.0,
        "max_moisture_pct": 2.5, "typical_adulterants": "Limestone powder, Sand"
    },
    "Compost / Organic": {
        "expected_n": 1.5, "expected_p": 1.0, "expected_k": 1.2,
        "max_moisture_pct": 25.0, "typical_adulterants": "Raw soil, Debris, Non-composted waste"
    },
    "Eppawala Rock Phosphate (ERP)": {
        "expected_n": 0.0, "expected_p": 28.0, "expected_k": 0.0,
        "max_moisture_pct": 2.0, "typical_adulterants": "Inert soil, River sand"
    }
}

# Sri Lanka Benchmark Prices (HARTI Monthly Bulletins & Ministry of Agriculture Gazette MRP 2022-2024 in LKR/kg)
# Reflecting 2022 crisis peak, 2023 transition, and 2024 post-subsidy market benchmarks
YEARLY_BENCHMARK_PRICES = {
    "Urea": {2022: 180.0, 2023: 120.0, 2024: 105.0},
    "TSP (Triple Super Phosphate)": {2022: 210.0, 2023: 160.0, 2024: 145.0},
    "MOP (Muriate of Potash)": {2022: 240.0, 2023: 195.0, 2024: 175.0},
    "NPK 15-15-15": {2022: 290.0, 2023: 255.0, 2024: 235.0},
    "NPK 12-12-17": {2022: 310.0, 2023: 275.0, 2024: 250.0},
    "Ammonium Sulfate (SOA)": {2022: 160.0, 2023: 135.0, 2024: 120.0},
    "Dolomite": {2022: 45.0, 2023: 35.0, 2024: 30.0},
    "Compost / Organic": {2022: 50.0, 2023: 40.0, 2024: 35.0},
    "Eppawala Rock Phosphate (ERP)": {2022: 60.0, 2023: 50.0, 2024: 45.0}
}

def scrape_harti_bulletin_catalog():
    """Scrapes available bulletin resources from HARTI official portal."""
    base_url = "http://www.harti.gov.lk/monthly-price.php"
    bulletins = []
    try:
        r = requests.get(base_url, timeout=15)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, "html.parser")
            for a in soup.find_all("a"):
                href = a.get("href")
                if href and ".pdf" in href.lower():
                    bulletins.append({
                        "title": a.get_text(strip=True) or href.split("/")[-1],
                        "url": href if href.startswith("http") else f"http://www.harti.gov.lk/{href}"
                    })
    except Exception as e:
        print(f"HARTI Scraping notice: {e}")
    return bulletins

def save_benchmarks_and_standards(output_dir="cropsafe AI/data/scraped"):
    os.makedirs(output_dir, exist_ok=True)
    
    # Save standards
    standards_df = pd.DataFrame.from_dict(SLSI_FERTILIZER_STANDARDS, orient="index").reset_index()
    standards_df.rename(columns={"index": "Product_Name"}, inplace=True)
    standards_df.to_csv(os.path.join(output_dir, "slsi_fertilizer_standards.csv"), index=False)
    
    # Save price benchmarks
    price_rows = []
    for prod, yr_dict in YEARLY_BENCHMARK_PRICES.items():
        for yr, price in yr_dict.items():
            price_rows.append({"Product_Name": prod, "Year": yr, "Benchmark_Price_LKR_kg": price})
    price_df = pd.DataFrame(price_rows)
    price_df.to_csv(os.path.join(output_dir, "harti_price_benchmarks_2022_2024.csv"), index=False)
    
    # Scrape HARTI catalog
    bulletins = scrape_harti_bulletin_catalog()
    if bulletins:
        pd.DataFrame(bulletins).to_csv(os.path.join(output_dir, "harti_scraped_bulletin_index.csv"), index=False)
        print(f"Scraped and indexed {len(bulletins)} HARTI monthly bulletins.")
        
    print(f"Saved SLSI standards and HARTI price benchmarks to {output_dir}")

if __name__ == "__main__":
    save_benchmarks_and_standards()
