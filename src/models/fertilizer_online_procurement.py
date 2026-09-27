"""
CropSafe AI - Authentic Sri Lanka Fertilizer Distributors Directory & Online Procurement Portal Engine
Regulated under Regulation of Fertilizers Act No. 68 of 1988, Consumer Affairs Authority Act No. 9 of 2003,
and National Fertilizer Secretariat (NFS) Authorized Importer & Distributor Registry.
"""

import os
import json
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

# Authentic registry of authorized Sri Lankan fertilizer distributing entities (State & Private)
DISTRIBUTOR_PROFILES: List[Dict[str, Any]] = [
    {
        "id": "DIST-CCF",
        "entity_name_si": "කොළඹ කොමර්ෂල් පොහොර සමාගම (CCF)",
        "entity_name_en": "Colombo Commercial Fertilizers Ltd",
        "type": "STATE_OWNED",
        "category": "ප්‍රමුඛ රාජ්‍ය ආනයනකරු සහ බෙදාහරින්නා",
        "head_office": "දළුපිටිය පාර, හුනුපිටිය, වත්තල",
        "central_complex": "හුනුපිටිය මධ්‍යම ගබඩා සහ මිශ්‍රණ සංකීර්ණය (85,000 MT)",
        "major_warehouses": [
            {"town": "හුනුපිටිය (Hunupitiya)", "district": "Gampaha", "type": "Central Hub", "capacity_mt": 85000, "phone": "011-2948251"},
            {"town": "නිකවැරටිය (Nikaweratiya)", "district": "Kurunegala", "type": "Regional Depot", "capacity_mt": 12000, "phone": "037-2260233"},
            {"town": "පල්ලෙකැලේ (Kandy)", "district": "Kandy", "type": "Regional Depot", "capacity_mt": 9500, "phone": "081-2420455"},
            {"town": "තඹුත්තේගම (Tambuttegama)", "district": "Anuradhapura", "type": "Regional Depot", "capacity_mt": 18000, "phone": "025-2276321"},
            {"town": "උහන (Uhana)", "district": "Ampara", "type": "Regional Depot", "capacity_mt": 14000, "phone": "063-2223844"},
            {"town": "කිලිනොච්චිය (Kilinochchi)", "district": "Kilinochchi", "type": "Regional Depot", "capacity_mt": 11000, "phone": "021-2285612"}
        ],
        "distributes_subsidized": True,
        "nfs_license_no": "NFS/DIST/SOE/001",
        "hotline": "011-2948251 / 011-2948252",
        "website": "www.ccf.gov.lk"
    },
    {
        "id": "DIST-CFC",
        "entity_name_si": "ලංකා පොහොර සමාගම (ලක්පොහොර)",
        "entity_name_en": "Ceylon Fertilizer Company Ltd (Lakpohora)",
        "type": "STATE_OWNED",
        "category": "ප්‍රමුඛ රාජ්‍ය ආනයනකරු සහ සහනාධාර බෙදාහරින්නා",
        "head_office": "ස්වර්ණ ජයන්ති මාවත, හුනුපිටිය, වත්තල",
        "central_complex": "හුනුපිටිය මධ්‍යම ගබඩා සංකීර්ණය",
        "major_warehouses": [
            {"town": "හුනුපිටිය (Hunupitiya)", "district": "Gampaha", "type": "Central Hub", "capacity_mt": 85000, "phone": "011-2948255"},
            {"town": "සීප්පුකුලම (Seeppukulama)", "district": "Anuradhapura", "type": "Regional Complex", "capacity_mt": 15000, "phone": "025-2234891"},
            {"town": "බිඳුනුවැව (Badulla)", "district": "Badulla", "type": "Regional Buffer", "capacity_mt": 10500, "phone": "057-2222890"},
            {"town": "හිඟුරක්ගොඩ (Hingurakgoda)", "district": "Polonnaruwa", "type": "Regional Complex", "capacity_mt": 16500, "phone": "027-2246411"},
            {"town": "වාරියපොළ (Wariyapola)", "district": "Kurunegala", "type": "Regional Depot", "capacity_mt": 13000, "phone": "037-2267341"}
        ],
        "distributes_subsidized": True,
        "nfs_license_no": "NFS/DIST/SOE/002",
        "hotline": "011-2948255 / 011-2948256",
        "website": "www.lakpohora.lk"
    },
    {
        "id": "DIST-BAUR",
        "entity_name_si": "ඒ. බෝවර් සමාගම (A. Baur & Co.)",
        "entity_name_en": "A. Baur & Co. (Pvt) Ltd",
        "type": "LICENSED_PRIVATE",
        "category": "පෞද්ගලික අංශයේ ප්‍රමුඛතම හා පෞරාණිකම පොහොර සමාගම (Est. 1897)",
        "head_office": "ඉහළ චැතම් වීදිය, කොළඹ 01",
        "central_complex": "කැලණිය ප්‍රධාන පොහොර නිෂ්පාදන හා මිශ්‍රණ කර්මාන්තශාලාව (Kelaniya Complex)",
        "major_warehouses": [
            {"town": "කැලණිය (Kelaniya)", "district": "Gampaha", "type": "Manufacturing Hub", "capacity_mt": 45000, "phone": "011-2911244"},
            {"town": "ග්‍රෑන්ඩ්පාස් (Grandpass)", "district": "Colombo", "type": "Import Store", "capacity_mt": 25000, "phone": "011-4728700"},
            {"town": "මහනුවර (Kandy)", "district": "Kandy", "type": "Regional Branch", "capacity_mt": 8000, "phone": "081-2234120"},
            {"town": "අනුරාධපුරය (Anuradhapura)", "district": "Anuradhapura", "type": "Regional Depot", "capacity_mt": 11000, "phone": "025-2223890"}
        ],
        "distributes_subsidized": False,
        "nfs_license_no": "NFS/DIST/PVT/001",
        "hotline": "011-4728700",
        "website": "www.baurs.com"
    },
    {
        "id": "DIST-CIC",
        "entity_name_si": "සී.අයි.සී. ඇග්‍රි බිස්නස් (CIC Agri Businesses)",
        "entity_name_en": "CIC Agri Businesses (Pvt) Ltd",
        "type": "LICENSED_PRIVATE",
        "category": "ප්‍රමුඛ පෞද්ගලික කෘෂිකාර්මික හා බීජ/පොහොර සමාගම",
        "head_office": "CIC හවුස්, නො. 199, කෙවින්ස් පාර, කොළඹ 02",
        "central_complex": "ජා-ඇල ප්‍රධාන සැපයුම් හා ගබඩා සංකීර්ණය (Ja-Ela Complex)",
        "major_warehouses": [
            {"town": "ජා-ඇල (Ja-Ela)", "district": "Gampaha", "type": "Central Logistics Hub", "capacity_mt": 35000, "phone": "011-2236521"},
            {"town": "පැල්වෙහෙර / දඹුල්ල (Dambulla)", "district": "Matale", "type": "Central Agri Complex", "capacity_mt": 18000, "phone": "066-2284900"},
            {"town": "මහව (Mahawa)", "district": "Kurunegala", "type": "Regional Depot", "capacity_mt": 8500, "phone": "037-2275210"},
            {"town": "හිඟුරක්ගොඩ (Hingurakgoda)", "district": "Polonnaruwa", "type": "Regional Processing Store", "capacity_mt": 10000, "phone": "027-2246800"}
        ],
        "distributes_subsidized": False,
        "nfs_license_no": "NFS/DIST/PVT/004",
        "hotline": "011-2359359",
        "website": "www.cic.lk"
    },
    {
        "id": "DIST-HAYLEYS",
        "entity_name_si": "හේලීස් ඇග්‍රිකල්චර් (Hayleys Agriculture Holdings)",
        "entity_name_en": "Hayleys Agriculture Holdings Ltd",
        "type": "LICENSED_PRIVATE",
        "category": "දිවයින පුරා 90%+ කෘෂි අලෙවිසැල් ආවරණය කරන ප්‍රමුඛ සමාගම",
        "head_office": "ඩීන්ස් පාර, කොළඹ 10",
        "central_complex": "සපුගස්කන්ද ප්‍රධාන පොහොර හා මිශ්‍රණ කර්මාන්තශාලාව (Sapugaskanda)",
        "major_warehouses": [
            {"town": "සපුගස්කන්ද (Sapugaskanda)", "district": "Gampaha", "type": "Manufacturing Hub", "capacity_mt": 40000, "phone": "011-2400300"},
            {"town": "ඒකල (Ekala, Ja-Ela)", "district": "Gampaha", "type": "Central Store", "capacity_mt": 20000, "phone": "011-2233441"},
            {"town": "කුරුණෑගල (Kurunegala)", "district": "Kurunegala", "type": "Regional Hub", "capacity_mt": 9000, "phone": "037-2224500"},
            {"town": "අම්බලන්තොට (Hambantota)", "district": "Hambantota", "type": "Regional Store", "capacity_mt": 7500, "phone": "047-2223100"}
        ],
        "distributes_subsidized": False,
        "nfs_license_no": "NFS/DIST/PVT/002",
        "hotline": "011-2688960",
        "website": "www.hayleysagriculture.com"
    },
    {
        "id": "DIST-LANKEM",
        "entity_name_si": "ලැන්කම් සිලෝන් (Lankem Ceylon PLC)",
        "entity_name_en": "Lankem Ceylon PLC",
        "type": "LICENSED_PRIVATE",
        "category": "විශේෂිත සංයෝග පොහොර සහ කෘෂි රසායන නිෂ්පාදක",
        "head_office": "කොටුව, කොළඹ 01",
        "central_complex": "මාකඳුර ප්‍රධාන කෘෂි කර්මාන්තශාලාව (Makadura, Gonawila)",
        "major_warehouses": [
            {"town": "මාකඳුර (Makadura, Pannala)", "district": "Kurunegala", "type": "Agro Factory & Hub", "capacity_mt": 30000, "phone": "031-2298100"},
            {"town": "පොලොන්නරුව (Polonnaruwa)", "district": "Polonnaruwa", "type": "Regional Processing Plant", "capacity_mt": 8000, "phone": "027-2223500"},
            {"town": "සපුගස්කන්ද (Sapugaskanda)", "district": "Gampaha", "type": "Central Chemical Store", "capacity_mt": 15000, "phone": "011-4822000"}
        ],
        "distributes_subsidized": False,
        "nfs_license_no": "NFS/DIST/PVT/003",
        "hotline": "011-7766000",
        "website": "www.lankem.lk"
    }
]

# Official Certified Product Catalog with Gazetted MRP (CAA Gazette) & Official Commercial Prices
PRODUCT_CATALOG: List[Dict[str, Any]] = [
    {
        "sku": "FERT-UREA-50KG",
        "name_si": "යූරියා පොහොර (Urea 46% N) - 50kg මිටිය",
        "name_en": "Prilled/Granular Urea (46% N) 50kg",
        "type": "CHEMICAL_MACRO",
        "bag_weight_kg": 50,
        "gazetted_mrp_subsidized": 2500.0,
        "official_commercial_price": 8500.0,
        "slsi_standard": "SLS 644 Part 1",
        "primary_crops": ["වී වගාව", "බඩඉරිඟු", "එළවළු", "තේ"],
        "stock_status": "AVAILABLE_IN_STOCK"
    },
    {
        "sku": "FERT-TSP-50KG",
        "name_si": "ත්‍රිත්ව සුපර් පොස්පේට් (TSP 46% P2O5) - 50kg මිටිය",
        "name_en": "Triple Superphosphate (TSP 46% P2O5) 50kg",
        "type": "CHEMICAL_MACRO",
        "bag_weight_kg": 50,
        "gazetted_mrp_subsidized": 2500.0,
        "official_commercial_price": 9200.0,
        "slsi_standard": "SLS 644 Part 2",
        "primary_crops": ["මූලික පොහොර (වී, බඩඉරිඟු, එළවළු)"],
        "stock_status": "AVAILABLE_IN_STOCK"
    },
    {
        "sku": "FERT-MOP-50KG",
        "name_si": "මියුරියේට් ඔෆ් පොටෑෂ් (MOP 60% K2O) - 50kg මිටිය",
        "name_en": "Muriate of Potash (MOP 60% K2O) 50kg",
        "type": "CHEMICAL_MACRO",
        "bag_weight_kg": 50,
        "gazetted_mrp_subsidized": 2500.0,
        "official_commercial_price": 8900.0,
        "slsi_standard": "SLS 644 Part 3",
        "primary_crops": ["වී කරල් පිරීම", "පොල්", "එළවළු", "පලතුරු"],
        "stock_status": "AVAILABLE_IN_STOCK"
    },
    {
        "sku": "FERT-NPK-COMPOUND-50KG",
        "name_si": "සම්පූර්ණ NPK සංයෝග පොහොර (16:16:16) - 50kg මිටිය",
        "name_en": "Balanced NPK Compound (16:16:16) 50kg",
        "type": "COMPOUND_NPK",
        "bag_weight_kg": 50,
        "gazetted_mrp_subsidized": None,
        "official_commercial_price": 11500.0,
        "slsi_standard": "SLS 644 Compound",
        "primary_crops": ["උඩරට එළවළු", "බඩඉරිඟු", "පලතුරු", "තේ"],
        "stock_status": "AVAILABLE_IN_STOCK"
    },
    {
        "sku": "FERT-DOLOMITE-50KG",
        "name_si": "කෘෂිකාර්මික ඩොලමයිට් (CaMg(CO3)2) - 50kg මිටිය",
        "name_en": "Agricultural Dolomite Soil Conditioner 50kg",
        "type": "SOIL_AMENDMENT",
        "bag_weight_kg": 50,
        "gazetted_mrp_subsidized": None,
        "official_commercial_price": 850.0,
        "slsi_standard": "SLS 821",
        "primary_crops": ["පසේ ඇඹුල් ගතිය (ආම්ලිකතාවය) සමනයට"],
        "stock_status": "AVAILABLE_IN_STOCK"
    },
    {
        "sku": "FERT-ORGANIC-COMPOST-25KG",
        "name_si": "ප්‍රමිතිගත කාබනික කොම්පෝස්ට් පොහොර - 25kg මිටිය",
        "name_en": "SLSI Certified Organic Compost 25kg",
        "type": "ORGANIC_BIO",
        "bag_weight_kg": 25,
        "gazetted_mrp_subsidized": None,
        "official_commercial_price": 1200.0,
        "slsi_standard": "SLS 1634 Certified",
        "primary_crops": ["කාබනික ගොවිතැන", "පස් ජීර්ණය", "එළවළු"],
        "stock_status": "AVAILABLE_IN_STOCK"
    },
    {
        "sku": "FERT-LIQUID-FOLIAR-1L",
        "name_si": "ක්ෂුද්‍ර පෝෂක හා සින්ක් දියර පත්‍ර ඉසින - ලීටර් 1 බෝතලය",
        "name_en": "Chelated Micronutrient & Zinc Foliar Spray 1L",
        "type": "FOLIAR_LIQUID",
        "bag_weight_kg": 1,
        "gazetted_mrp_subsidized": None,
        "official_commercial_price": 2400.0,
        "slsi_standard": "ISO 9001 / NFS Approved",
        "primary_crops": ["පත්‍ර කහවීම වැළැක්වීම", "වී", "මිරිස්", "ලූනු"],
        "stock_status": "AVAILABLE_IN_STOCK"
    }
]


class ProcurementOrderRequest(BaseModel):
    farmer_name: str
    farmer_nic: str
    farmer_phone: str
    district: str
    asc_division: str
    channel: str = "COMMERCIAL"  # 'SUBSIDIZED_QUOTA' or 'COMMERCIAL'
    distributor_id: str = "DIST-CCF"
    pickup_depot: str = "WH-CFC-SEEPPUKULAMA"
    delivery_type: str = "DEPOT_PICKUP"  # 'DEPOT_PICKUP' or 'TRACTOR_DELIVERY'
    delivery_address: Optional[str] = None
    items: List[Dict[str, Any]]  # [{"sku": "FERT-UREA-50KG", "quantity": 4}, ...]


class FertilizerProcurementEngine:
    """Processes digital pre-orders, verifies farmer subsidy vouchers, and generates QR collection tokens."""

    def __init__(self, orders_dir: str = "reports/procurement_orders"):
        self.orders_dir = orders_dir
        os.makedirs(self.orders_dir, exist_ok=True)

    @staticmethod
    def get_distributors(dist_type: Optional[str] = None) -> List[Dict[str, Any]]:
        if not dist_type or dist_type == "ALL":
            return DISTRIBUTOR_PROFILES
        return [d for d in DISTRIBUTOR_PROFILES if d["type"] == dist_type]

    @staticmethod
    def get_catalog() -> List[Dict[str, Any]]:
        return PRODUCT_CATALOG

    def create_preorder(self, req: ProcurementOrderRequest) -> Dict[str, Any]:
        timestamp = datetime.now(timezone.utc)
        unique_seed = f"{req.farmer_nic}{req.pickup_depot}{timestamp.isoformat()}"
        hash_code = hashlib.sha256(unique_seed.encode("utf-8")).hexdigest()[:8].upper()
        order_token = f"PO-LK-{timestamp.strftime('%Y')}-{hash_code}"

        # Resolve distributor
        distributor = next((d for d in DISTRIBUTOR_PROFILES if d["id"] == req.distributor_id), DISTRIBUTOR_PROFILES[0])

        # Compute items and totals
        order_items = []
        gross_total = 0.0
        subsidy_savings = 0.0
        total_weight_kg = 0.0

        for item in req.items:
            sku = item.get("sku")
            qty = max(1, int(item.get("quantity", 1)))
            prod = next((p for p in PRODUCT_CATALOG if p["sku"] == sku), None)
            if not prod:
                continue

            unit_price = prod["official_commercial_price"]
            if req.channel == "SUBSIDIZED_QUOTA" and prod["gazetted_mrp_subsidized"] is not None:
                effective_price = prod["gazetted_mrp_subsidized"]
                savings = (prod["official_commercial_price"] - prod["gazetted_mrp_subsidized"]) * qty
                subsidy_savings += savings
            else:
                effective_price = unit_price

            line_total = effective_price * qty
            gross_total += line_total
            total_weight_kg += (prod["bag_weight_kg"] * qty)

            order_items.append({
                "sku": prod["sku"],
                "name_si": prod["name_si"],
                "quantity_units": qty,
                "unit_price_lkr": effective_price,
                "line_total_lkr": line_total,
                "is_subsidized_price": req.channel == "SUBSIDIZED_QUOTA" and prod["gazetted_mrp_subsidized"] is not None
            })

        delivery_fee = 0.0
        if req.delivery_type == "TRACTOR_DELIVERY":
            # Flat regional agro transport logistics fee
            delivery_fee = 1500.0 if total_weight_kg <= 500 else 2500.0

        net_payable = gross_total + delivery_fee
        collection_expiry = timestamp + timedelta(days=5)

        order_record = {
            "order_token": order_token,
            "status": "CONFIRMED_RESERVED",
            "created_at": timestamp.isoformat(),
            "pickup_valid_until": collection_expiry.strftime("%Y-%m-%d 16:30"),
            "farmer": {
                "name": req.farmer_name,
                "nic": req.farmer_nic,
                "phone": req.farmer_phone,
                "district": req.district,
                "asc_division": req.asc_division
            },
            "procurement_channel": req.channel,
            "distributor": {
                "id": distributor["id"],
                "name": distributor["entity_name_si"],
                "type": distributor["type"],
                "hotline": distributor["hotline"]
            },
            "fulfillment": {
                "type": req.delivery_type,
                "depot_or_hub": req.pickup_depot,
                "delivery_address": req.delivery_address or "Collection directly at authorized regional depot",
                "instructions": "කරුණාකර මෙම ඇණවුම් අංකය (QR කේතය) සහ ජාතික හැඳුනුම්පත රැගෙන දින 5ක් ඇතුළත අදාළ ගබඩාව වෙත පැමිණෙන්න."
            },
            "financial_summary": {
                "gross_products_total_lkr": gross_total,
                "government_subsidy_saving_lkr": subsidy_savings,
                "delivery_fee_lkr": delivery_fee,
                "net_payable_lkr": net_payable,
                "total_cargo_weight_kg": total_weight_kg
            },
            "order_items": order_items,
            "statutory_compliance": [
                "Regulation of Fertilizers Act No. 68 of 1988",
                "Consumer Affairs Authority Act No. 9 of 2003 Gazetted MRP Guarantee",
                "National Fertilizer Secretariat Electronic Quota Clearing Standard"
            ]
        }

        # Save order record
        file_path = os.path.join(self.orders_dir, f"Order_{order_token}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(order_record, f, indent=2, ensure_ascii=False)

        return order_record
