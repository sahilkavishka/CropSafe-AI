"""
CropSafe AI - Farmer Collective Bulk-Buying & Anti-Hoarding Pool
Module: src/models/farmer_collective_bulk_buying_pool.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Pools fertilizer demand across smallholder farmer groups (ගොවි සංවිධාන / Yaya organizations).
2. Bypasses predatory rural middlemen and black-market hoarding markups.
3. Computes shared freight logistics (Lorry capacity, transport surcharge per bag).
4. Calculates collective financial savings compared to local retail price gouging.
5. Generates tamper-proof SHA-256 requisition manifest for Ceylon Fertilizer Co. / Agrarian Service Centres.
"""

import os
import sys
import json
import hashlib
import logging
from typing import Dict, List, Any
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("FarmerCollectiveBulkBuyingPool")

# Statutory price benchmarks vs typical black-market hoarding markups (LKR per 50kg bag)
PRICE_BENCHMARKS_LKR = {
    "urea": {
        "statutory_subsidized": 2500.0,
        "official_commercial_wholesale": 7500.0,
        "black_market_retail_gouging": 10500.0
    },
    "mop": {
        "statutory_subsidized": 4500.0,
        "official_commercial_wholesale": 9000.0,
        "black_market_retail_gouging": 12500.0
    },
    "tsp": {
        "statutory_subsidized": 4000.0,
        "official_commercial_wholesale": 8500.0,
        "black_market_retail_gouging": 11800.0
    },
    "organic_compost": {
        "statutory_subsidized": 1200.0,
        "official_commercial_wholesale": 1600.0,
        "black_market_retail_gouging": 2400.0
    }
}

# Lorry freight capacity tiers in Sri Lanka
LORRY_CAPACITIES = [
    {"type": "Canter / 5-Ton", "max_bags": 100, "base_freight_lkr": 18000.0},
    {"type": "Isuzu Forward / 10-Ton", "max_bags": 200, "base_freight_lkr": 28000.0},
    {"type": "Prime Mover / 16-Ton", "max_bags": 320, "base_freight_lkr": 42000.0}
]

class FarmerCollectiveBulkBuyingPool:
    """Manages community fertilizer pooling, shared logistics, and anti-gouging arbitrage."""

    def __init__(self):
        self.prices = PRICE_BENCHMARKS_LKR
        self.lorries = LORRY_CAPACITIES

    def aggregate_pool_order(
        self,
        pool_name: str,
        agrarian_division: str,
        farmer_orders: List[Dict[str, Any]],
        transport_distance_km: float = 35.0
    ) -> Dict[str, Any]:
        """
        Aggregates fertilizer demand from multiple farmers into a single bulk order.
        
        Args:
            pool_name: Name of farmer organization (e.g. "Parakrama Yaya Govi Samithiya")
            agrarian_division: DS Division / ASC jurisdiction (e.g. "Hingurakgoda")
            farmer_orders: List of dicts [{"farmer_id": "...", "name": "...", "urea_bags": 5, "mop_bags": 2, "tsp_bags": 2}]
            transport_distance_km: Distance from regional buffer warehouse to village drop-off point
        """
        if not farmer_orders:
            return {"status": "ERROR", "message": "No farmer orders provided for pool."}

        total_urea = sum(f.get("urea_bags", 0) for f in farmer_orders)
        total_mop = sum(f.get("mop_bags", 0) for f in farmer_orders)
        total_tsp = sum(f.get("tsp_bags", 0) for f in farmer_orders)
        total_compost = sum(f.get("compost_bags", 0) for f in farmer_orders)

        total_bags = total_urea + total_mop + total_tsp + total_compost
        total_weight_metric_tons = round((total_bags * 50.0) / 1000.0, 2)

        # Determine logistics freight
        assigned_lorry = self._assign_transport(total_bags, transport_distance_km)
        total_freight_lkr = assigned_lorry["total_freight_lkr"]
        freight_per_bag_lkr = round(total_freight_lkr / max(1, total_bags), 2)

        # Financial comparison: Direct Bulk vs Black-Market Retail Gouging
        cost_bulk_subsidized = (
            (total_urea * self.prices["urea"]["statutory_subsidized"]) +
            (total_mop * self.prices["mop"]["statutory_subsidized"]) +
            (total_tsp * self.prices["tsp"]["statutory_subsidized"]) +
            (total_compost * self.prices["organic_compost"]["statutory_subsidized"])
        )

        cost_black_market = (
            (total_urea * self.prices["urea"]["black_market_retail_gouging"]) +
            (total_mop * self.prices["mop"]["black_market_retail_gouging"]) +
            (total_tsp * self.prices["tsp"]["black_market_retail_gouging"]) +
            (total_compost * self.prices["organic_compost"]["black_market_retail_gouging"])
        )

        net_community_savings_lkr = (cost_black_market - (cost_bulk_subsidized + total_freight_lkr))
        savings_percentage = round((net_community_savings_lkr / max(1.0, cost_black_market)) * 100.0, 1)

        # Individual Farmer Breakdown
        farmer_breakdown = []
        for f in farmer_orders:
            u = f.get("urea_bags", 0)
            m = f.get("mop_bags", 0)
            t = f.get("tsp_bags", 0)
            c = f.get("compost_bags", 0)
            bags = u + m + t + c

            f_bulk_cost = (
                (u * self.prices["urea"]["statutory_subsidized"]) +
                (m * self.prices["mop"]["statutory_subsidized"]) +
                (t * self.prices["tsp"]["statutory_subsidized"]) +
                (c * self.prices["organic_compost"]["statutory_subsidized"])
            )
            f_freight = round(bags * freight_per_bag_lkr, 2)
            f_total_due = round(f_bulk_cost + f_freight, 2)

            f_market_cost = (
                (u * self.prices["urea"]["black_market_retail_gouging"]) +
                (m * self.prices["mop"]["black_market_retail_gouging"]) +
                (t * self.prices["tsp"]["black_market_retail_gouging"]) +
                (c * self.prices["organic_compost"]["black_market_retail_gouging"])
            )
            f_saved = round(f_market_cost - f_total_due, 2)

            farmer_breakdown.append({
                "farmer_id": f.get("farmer_id", "UNKNOWN"),
                "name": f.get("name", "Govi Mahatha"),
                "total_bags": bags,
                "fertilizer_cost_lkr": f_bulk_cost,
                "shared_freight_lkr": f_freight,
                "net_payable_lkr": f_total_due,
                "money_saved_lkr": f_saved
            })

        # Cryptographic Manifest Hash for Anti-Tamper Consignment Delivery
        timestamp = datetime.now().isoformat()
        manifest_raw = f"{pool_name}|{agrarian_division}|{total_bags}|{cost_bulk_subsidized}|{timestamp}"
        manifest_token = hashlib.sha256(manifest_raw.encode("utf-8")).hexdigest()[:16].upper()

        return {
            "manifest_token": f"CS-POOL-{manifest_token}",
            "pool_name": pool_name,
            "agrarian_division": agrarian_division,
            "order_timestamp": timestamp,
            "participating_farmers_count": len(farmer_orders),
            "total_demand_summary": {
                "total_bags": total_bags,
                "total_weight_metric_tons": total_weight_metric_tons,
                "urea_bags": total_urea,
                "mop_bags": total_mop,
                "tsp_bags": total_tsp,
                "organic_compost_bags": total_compost
            },
            "logistics_transport": {
                "vehicle_type": assigned_lorry["type"],
                "total_freight_cost_lkr": total_freight_lkr,
                "freight_surcharge_per_bag_lkr": freight_per_bag_lkr,
                "distance_km": transport_distance_km
            },
            "financial_arbitrage": {
                "total_bulk_fertilizer_cost_lkr": cost_bulk_subsidized,
                "total_freight_lkr": total_freight_lkr,
                "total_pool_investment_lkr": cost_bulk_subsidized + total_freight_lkr,
                "black_market_gouging_cost_lkr": cost_black_market,
                "net_community_savings_lkr": round(net_community_savings_lkr, 2),
                "savings_percentage": savings_percentage
            },
            "farmer_ledger": farmer_breakdown,
            "official_requisition_summary_si": (
                f"ගොවි සංවිධානය: {pool_name} ({agrarian_division}). "
                f"සහභාගී වූ ගොවීන් ගණන: {len(farmer_orders)}. මුළු පොහොර බෑග්: {total_bags} (ටොන් {total_weight_metric_tons}). "
                f"කළුකඩ මිල ගණන් වෙනුවට සෘජු ඇණවුම මඟින් ගමේ ගොවීන්ට ඉතිරි වන මුළු මුදල රු. {round(net_community_savings_lkr, 0):,} "
                f"({savings_percentage}% ක ඉතිරියක්!)."
            )
        }

    def _assign_transport(self, total_bags: int, distance_km: float) -> Dict[str, Any]:
        """Assigns the most cost-effective lorry and computes freight charges."""
        selected = self.lorries[-1]
        for lorry in self.lorries:
            if total_bags <= lorry["max_bags"]:
                selected = lorry
                break

        # Base rate + distance fuel adjustment (LKR 180/km for distance > 20km)
        dist_surcharge = max(0.0, (distance_km - 20.0) * 180.0)
        total_freight = selected["base_freight_lkr"] + dist_surcharge

        return {
            "type": selected["type"],
            "max_bags": selected["max_bags"],
            "total_freight_lkr": round(total_freight, 2)
        }

if __name__ == "__main__":
    pool_engine = FarmerCollectiveBulkBuyingPool()

    sample_farmers = [
        {"farmer_id": "F-PL-101", "name": "K.B. Bandara", "urea_bags": 6, "mop_bags": 2, "tsp_bags": 2, "compost_bags": 4},
        {"farmer_id": "F-PL-102", "name": "W.M. Jinadasa", "urea_bags": 8, "mop_bags": 3, "tsp_bags": 3, "compost_bags": 0},
        {"farmer_id": "F-PL-103", "name": "S.P. Dharmasena", "urea_bags": 12, "mop_bags": 4, "tsp_bags": 4, "compost_bags": 8},
        {"farmer_id": "F-PL-104", "name": "M.G. Somawathi", "urea_bags": 4, "mop_bags": 1, "tsp_bags": 1, "compost_bags": 2},
        {"farmer_id": "F-PL-105", "name": "H.M. Chandrasiri", "urea_bags": 10, "mop_bags": 3, "tsp_bags": 3, "compost_bags": 5}
    ]

    manifest = pool_engine.aggregate_pool_order(
        pool_name="පරාක්‍රම සමුද්‍ර යාය ගොවි සංවිධානය",
        agrarian_division="Hingurakgoda ASC",
        farmer_orders=sample_farmers,
        transport_distance_km=45.0
    )

    print("=== FARMER COLLECTIVE BULK-BUYING MANIFEST ===")
    print(f"Manifest Token: {manifest['manifest_token']}")
    print(f"Total Bags: {manifest['total_demand_summary']['total_bags']} bags ({manifest['total_demand_summary']['total_weight_metric_tons']} MT)")
    print(f"Assigned Lorry: {manifest['logistics_transport']['vehicle_type']} (Freight/bag: LKR {manifest['logistics_transport']['freight_surcharge_per_bag_lkr']})")
    print(f"Direct Bulk Cost: LKR {manifest['financial_arbitrage']['total_pool_investment_lkr']:,}")
    print(f"Black-Market Cost: LKR {manifest['financial_arbitrage']['black_market_gouging_cost_lkr']:,}")
    print(f"Community Savings: LKR {manifest['financial_arbitrage']['net_community_savings_lkr']:,} ({manifest['financial_arbitrage']['savings_percentage']}%)")
    print(f"Advisory: {manifest['official_requisition_summary_si']}")
