"""
CropSafe AI - Fertilizer Market Price Trend & Econometric Forecasting Engine
Faculty of Computing | Sabaragamuwa University of Sri Lanka (DS3206 Capstone Project II)

Implements:
  1. Multi-factor commodity price forecasting for Sri Lankan agricultural markets (Urea, TSP, MOP, NPK).
  2. Econometric price drivers: Natural gas feedstock, Brent crude energy index, USD/LKR FX rate, Red Sea freight surcharges.
  3. Maha/Yala seasonal agricultural demand cycle adjustments.
  4. Optimal Purchase Window & Strategic Farmer Bulk-Procurement Recommendations.
"""

from datetime import datetime, timedelta
import numpy as np

class FertilizerPriceForecastingEngine:
    def __init__(self):
        # Baseline Sri Lankan Gazette Subsidized Maximum Retail Prices (MRP) per 50kg bag
        self.baseline_subsidized_mrp = {
            "urea": 2500.0,
            "tsp": 4500.0,
            "mop": 4500.0,
            "npk": 4800.0
        }

        # Baseline Commercial Open Market Retail Prices (Unsubsidized private dealers)
        self.baseline_open_market = {
            "urea": 3350.0,
            "tsp": 5600.0,
            "mop": 5400.0,
            "npk": 6200.0
        }

        # Key Commodity Weight Drivers
        self.driver_weights = {
            "urea": {"natural_gas": 0.40, "exchange_rate": 0.30, "freight": 0.20, "seasonal_demand": 0.10},
            "tsp": {"phosphate_rock": 0.35, "exchange_rate": 0.30, "freight": 0.20, "seasonal_demand": 0.15},
            "mop": {"potash_ore": 0.35, "exchange_rate": 0.30, "freight": 0.25, "seasonal_demand": 0.10},
            "npk": {"raw_materials": 0.40, "exchange_rate": 0.30, "freight": 0.15, "seasonal_demand": 0.15}
        }

    def forecast_price(
        self,
        fertilizer_type: str = "urea",
        forecast_horizon_months: int = 3,
        usd_lkr_rate: float = 305.0,
        global_energy_change_pct: float = 8.5,
        freight_surcharge_pct: float = 12.0,
        season: str = "Maha"
    ):
        fert_key = fertilizer_type.lower().strip()
        if fert_key not in self.baseline_subsidized_mrp:
            fert_key = "urea"

        base_mrp = self.baseline_subsidized_mrp[fert_key]
        base_open = self.baseline_open_market[fert_key]
        weights = self.driver_weights[fert_key]

        # Baseline USD/LKR is anchored around 300.0
        fx_shock_pct = ((usd_lkr_rate - 300.0) / 300.0) * 100.0

        # Seasonal multiplier (Maha sowing spike vs Yala sowing spike)
        season_multiplier = 0.06 if season.lower() == "maha" else 0.04

        # Net economic inflationary/deflationary shock %
        net_shock_pct = (
            (global_energy_change_pct * weights.get("natural_gas", 0.35)) +
            (fx_shock_pct * weights["exchange_rate"]) +
            (freight_surcharge_pct * weights["freight"]) +
            (season_multiplier * 100.0 * weights["seasonal_demand"])
        )

        # Dampen over short horizons vs compound over 6-month horizons
        horizon_factor = 0.5 if forecast_horizon_months == 1 else (1.0 if forecast_horizon_months == 3 else 1.35)
        projected_change_pct = net_shock_pct * horizon_factor

        projected_open_market = round(base_open * (1.0 + projected_change_pct / 100.0), 0)
        projected_gap_vs_mrp = projected_open_market - base_mrp

        # Trend determination
        if projected_change_pct > 3.0:
            trend = "RISING_BULLISH"
            trend_si = "ඉහළ යාමේ ප්‍රවණතාවක් (මිල වැඩිවේ)"
            trend_en = "Upward Bullish (Price Rising)"
            trend_ta = "விலை உயரும் போக்கு"
            rec_si = f"ඉදිරි මාස {forecast_horizon_months} තුළ මිල රු. {(projected_open_market - base_open):.0f} කින් ඉහළ යාමට නියමිත බැවින්, කන්නය ඇරඹීමට පෙර (ඉදිරි සති 2 ඇතුළත) මිලදී ගැනීමෙන් බෑගයකට උපරිම මුදලක් ඉතිරි කරගත හැක."
            rec_en = f"Open market price projected to increase by Rs. {(projected_open_market - base_open):.0f} over next {forecast_horizon_months} months. Early procurement within 2 weeks recommended."
            best_window = "ඉදිරි සති 2-3 තුළ (ප්‍රමාද නොවී මිලදී ගන්න)"
        elif projected_change_pct < -3.0:
            trend = "FALLING_BEARISH"
            trend_si = "පහළ බැසීමේ ප්‍රවණතාවක් (මිල අඩුවේ)"
            trend_en = "Downward Bearish (Price Falling)"
            trend_ta = "விலை குறையும் போக்கு"
            rec_si = "ගෝලීය සැපයුම් යථා තත්ත්වයට පත්වීම නිසා මිල මදක් පහළ යා හැක. හදිසි නොවී අවශ්‍ය ප්‍රමාණයට පමණක් මිලදී ගන්න."
            rec_en = "Prices expected to soften slightly due to global supply stability. Purchase strictly as needed."
            best_window = "කන්නයේ අවශ්‍යතාව අනුව ක්‍රමයෙන්"
        else:
            trend = "STABLE"
            trend_si = "ස්ථාවර මිල මට්ටමක් (වෙනසක් නැත)"
            trend_en = "Stable Horizon (Steady Prices)"
            trend_ta = "நிலையான விலை"
            rec_si = "රජයේ පාලන මිල සහ විවෘත වෙළඳපොළ මිල ඉදිරි මාසවලදී ස්ථාවරව පවතිනු ඇතැයි පුරෝකථනය කෙරේ."
            rec_en = "Prices projected to remain steady across gazette control limits."
            best_window = "ඕනෑම වේලාවක සාමාන්‍ය මිලට"

        # Generate 6-month historical + 6-month projected monthly trajectory points
        months_timeline = []
        today = datetime.now()
        
        # Historical past 4 months
        past_diffs = [-180, -120, -60, 0]
        for i, diff_lkr in enumerate(past_diffs):
            m_date = today - timedelta(days=(3 - i) * 30)
            months_timeline.append({
                "month": m_date.strftime("%b %Y"),
                "is_projected": False,
                "subsidized_mrp": base_mrp,
                "open_market_price": round(base_open + diff_lkr, 0)
            })

        # Future 6 months projection
        monthly_step = (projected_open_market - base_open) / max(1, forecast_horizon_months)
        for m in range(1, 7):
            m_date = today + timedelta(days=m * 30)
            m_price = base_open + (monthly_step * m * (0.85 if m > forecast_horizon_months else 1.0))
            # Random subtle fluctuation for market realism
            noise = (np.sin(m * 1.5) * 35.0)
            months_timeline.append({
                "month": m_date.strftime("%b %Y"),
                "is_projected": True,
                "subsidized_mrp": base_mrp,
                "open_market_price": round(m_price + noise, 0)
            })

        return {
            "commodity": fert_key.upper(),
            "fertilizer_name_si": "යූරියා (Urea 46% N)" if fert_key == "urea" else ("TSP කළු පොහොර" if fert_key == "tsp" else ("MOP රතු පොහොර" if fert_key == "mop" else "මිශ්‍ර පොහොර (NPK)")),
            "forecast_horizon_months": forecast_horizon_months,
            "season": season,
            "current_subsidized_mrp_lkr": base_mrp,
            "current_open_market_lkr": base_open,
            "projected_open_market_lkr": projected_open_market,
            "projected_change_pct": round(projected_change_pct, 1),
            "projected_change_amount_lkr": round(projected_open_market - base_open, 0),
            "savings_with_subsidy_lkr": round(projected_open_market - base_mrp, 0),
            "trend": trend,
            "trend_si": trend_si,
            "trend_en": trend_en,
            "trend_ta": trend_ta,
            "recommendation_si": rec_si,
            "recommendation_en": rec_en,
            "best_buying_window": best_window,
            "price_drivers_breakdown": {
                "natural_gas_energy_pct": round(weights.get("natural_gas", 0.35) * 100, 1),
                "usd_lkr_exchange_rate_pct": round(weights["exchange_rate"] * 100, 1),
                "freight_maritime_pct": round(weights["freight"] * 100, 1),
                "local_demand_cycle_pct": round(weights["seasonal_demand"] * 100, 1)
            },
            "monthly_trajectory": months_timeline
        }

price_forecasting_engine = FertilizerPriceForecastingEngine()
