"""
CropSafe AI - IoT Warehouse Digital Twin & Real-Time Sensor Telemetry Simulator
Faculty of Computing | Sabaragamuwa University of Sri Lanka (DS3206 Capstone Project II)

Implements:
  1. IoT Telemetry Streaming Simulator (Hourly Temp, RH %, Air Exchange, Dew Point)
  2. Multi-Warehouse Micro-Climatic Digital Twin (Anuradhapura, Kurunegala, Hambantota, Nuwara Eliya)
  3. Real-Time Granular Free-Flow & Caking Degradation Integration (Dynamic Shelf-Life Decay)
  4. Automated FIFO Clearance Dispatch & Emergency Agrarian Siren Notifications
"""

import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

def _find_file(relative_path):
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

class WarehouseDigitalTwin:
    """Simulates real-time IoT sensory telemetry and dynamic degradation within agrarian fertilizer depots."""
    def __init__(self, warehouse_id, name, location, capacity_mt, baseline_rh, baseline_temp):
        self.warehouse_id = warehouse_id
        self.name = name
        self.location = location
        self.capacity_mt = capacity_mt
        self.baseline_rh = baseline_rh
        self.baseline_temp = baseline_temp
        
    def simulate_telemetry_stream(self, hours=72, seed=42):
        """Generates realistic hourly environmental sensor telemetry over a multi-day timeline."""
        np.random.seed(seed)
        t = np.arange(hours)
        
        # Diurnal temperature cycle: peaks at 14:00, lowest at 04:00
        temp_cycle = 4.5 * np.sin((2 * np.pi * t / 24) - (np.pi / 2))
        temp = self.baseline_temp + temp_cycle + np.random.normal(0, 0.6, hours)
        
        # Relative Humidity inversely correlates with temperature, spikes during tropical monsoonal rain
        rh_cycle = -8.0 * np.sin((2 * np.pi * t / 24) - (np.pi / 2))
        rh = self.baseline_rh + rh_cycle + np.random.normal(0, 1.2, hours)
        
        # Add a monsoonal humidity shock at t = 24 to 48 hours for wet depots
        if "Wet" in self.location or "Intermediate" in self.location:
            rh[24:52] += np.linspace(8.0, 14.0, 28)
            
        rh = np.clip(rh, 35.0, 98.0)
        
        # Dew point approximation: T_dew = T - ((100 - RH) / 5)
        dew_point = temp - ((100.0 - rh) / 5.0)
        
        # Critical Relative Humidity for Urea: 72.5% at 30C
        # Air condensation / deliquescence risk occurs when Ambient RH > Urea CRH
        urea_crh = 72.5
        deliquescence_active = rh > urea_crh
        
        # Cumulative Hours under active moisture sorption
        consecutive_danger_hours = np.zeros(hours, dtype=int)
        count = 0
        for i, danger in enumerate(deliquescence_active):
            if danger:
                count += 1
            else:
                count = max(0, count - 1)
            consecutive_danger_hours[i] = count
            
        # Dynamic remaining shelf-life days (starts at 365 days, degrades rapidly when RH > CRH)
        initial_shelf_life = 365.0
        shelf_life_stream = np.zeros(hours)
        curr_shelf_life = initial_shelf_life
        
        for i in range(hours):
            if deliquescence_active[i]:
                # Degradation penalty: each hour above CRH burns ~1.2 to 2.8 days of warehouse life
                decay_rate = 1.8 * (rh[i] / urea_crh) ** 2
                curr_shelf_life = max(14.0, curr_shelf_life - decay_rate)
            else:
                curr_shelf_life = max(14.0, curr_shelf_life - (1.0 / 24.0))
            shelf_life_stream[i] = round(curr_shelf_life, 1)

        telemetry_df = pd.DataFrame({
            "Hour": t,
            "Warehouse_ID": self.warehouse_id,
            "Temperature_C": np.round(temp, 1),
            "Relative_Humidity_Pct": np.round(rh, 1),
            "Dew_Point_C": np.round(dew_point, 1),
            "Deliquescence_Active": deliquescence_active,
            "Consecutive_Danger_Hours": consecutive_danger_hours,
            "Dynamic_Shelf_Life_Days": shelf_life_stream
        })
        
        # Generate automated dispatch status
        latest_danger = consecutive_danger_hours[-1]
        latest_life = shelf_life_stream[-1]
        
        if latest_danger >= 36 or latest_life < 60:
            alert_status = "CRITICAL_EMERGENCY_DISPATCH (Mandatory 48-Hour Clearance / Sale)"
            alert_level = "RED"
        elif latest_danger >= 18 or latest_life < 120:
            alert_status = "ELEVATED_MOISTURE_WARNING (Prioritize FIFO Distribution)"
            alert_level = "AMBER"
        else:
            alert_status = "STABLE_CONDITIONS (Nominal Buffer Inventory)"
            alert_level = "GREEN"
            
        return telemetry_df, {"Alert_Status": alert_status, "Alert_Level": alert_level, "Final_Shelf_Life": latest_life}

def simulate_national_warehouse_digital_twins(output_dir="reports/figures/predictive_prescriptive"):
    actual_dir = _find_file(output_dir)
    os.makedirs(actual_dir, exist_ok=True)
    
    warehouses = [
        WarehouseDigitalTwin("WH-NCP-01", "Anuradhapura Central Depot", "North Central (Dry Zone)", 2500, baseline_rh=66.0, baseline_temp=30.5),
        WarehouseDigitalTwin("WH-NWP-02", "Kurunegala Agrarian Warehouse", "North Western (Intermediate Zone)", 1800, baseline_rh=75.0, baseline_temp=29.0),
        WarehouseDigitalTwin("WH-SP-03",  "Hambantota Fertilizer Hub", "Southern Province (Semi-Arid)", 1200, baseline_rh=68.0, baseline_temp=31.0),
        WarehouseDigitalTwin("WH-CP-04",  "Nuwara Eliya Hill Depot", "Central Province (Highland Wet)", 800, baseline_rh=84.0, baseline_temp=18.5)
    ]
    
    twin_results = []
    fig, axes = plt.subplots(2, 2, figsize=(16, 10))
    
    for idx, wh in enumerate(warehouses):
        ax = axes[idx // 2, idx % 2]
        df_stream, status = wh.simulate_telemetry_stream(hours=72, seed=100 + idx)
        twin_results.append({
            "Warehouse": wh.name,
            "Location": wh.location,
            "Capacity_MT": wh.capacity_mt,
            "Mean_RH_Pct": round(df_stream["Relative_Humidity_Pct"].mean(), 1),
            "Max_Danger_Hours": int(df_stream["Consecutive_Danger_Hours"].max()),
            "Final_Shelf_Life_Days": status["Final_Shelf_Life"],
            "Alert_Level": status["Alert_Level"],
            "Prescriptive_Directive": status["Alert_Status"]
        })
        
        # Dual axis: RH and Shelf Life
        ax.plot(df_stream["Hour"], df_stream["Relative_Humidity_Pct"], color="#1f77b4", lw=2, label="Sensory RH (%)")
        ax.axhline(72.5, color="red", linestyle="--", lw=1.5, label="Urea CRH (72.5%)")
        ax.set_title(f"{wh.name} [{status['Alert_Level']}]\n{wh.location}", fontweight="bold", fontsize=10)
        ax.set_xlabel("Elapsed Time (Hours)")
        ax.set_ylabel("Relative Humidity (%)", color="#1f77b4")
        ax.tick_params(axis='y', labelcolor="#1f77b4")
        ax.set_ylim(40, 105)
        
        ax2 = ax.twinx()
        ax2.plot(df_stream["Hour"], df_stream["Dynamic_Shelf_Life_Days"], color="#d62728", lw=2, linestyle="-.", label="Dynamic Shelf-Life (Days)")
        ax2.set_ylabel("Remaining Safe Days", color="#d62728")
        ax2.tick_params(axis='y', labelcolor="#d62728")
        ax2.set_ylim(0, 380)

    plt.tight_layout()
    fig_path = os.path.join(actual_dir, "iot_warehouse_digital_twin_telemetry.png")
    plt.savefig(fig_path, dpi=300)
    plt.close()
    print(f"IoT Warehouse Digital Twin telemetry graphic saved to: {fig_path}")

    summary_df = pd.DataFrame(twin_results)
    return summary_df

if __name__ == "__main__":
    print("Testing IoT Warehouse Digital Twin Telemetry Engine...")
    summary = simulate_national_warehouse_digital_twins()
    print("\nNational Warehouse Digital Twin Operational Status:")
    print(summary[["Warehouse", "Mean_RH_Pct", "Final_Shelf_Life_Days", "Alert_Level", "Prescriptive_Directive"]])
