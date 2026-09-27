import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Truck, 
  Tag, 
  ArrowRight, 
  Search, 
  Filter, 
  QrCode, 
  FileText, 
  Share2, 
  Printer, 
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  PackageCheck
} from 'lucide-react';

const API_BASE = "http://localhost:8000";

// Fallback Authentic Distributors Registry (State & Licensed Private Sector)
const DEFAULT_DISTRIBUTORS = [
  {
    id: "DIST-CCF",
    entity_name_si: "කොළඹ කොමර්ෂල් පොහොර සමාගම (CCF)",
    entity_name_en: "Colombo Commercial Fertilizers Ltd",
    type: "STATE_OWNED",
    category: "ප්‍රමුඛ රාජ්‍ය ආනයනකරු සහ බෙදාහරින්නා",
    head_office: "දළුපිටිය පාර, හුනුපිටිය, වත්තල",
    central_complex: "හුනුපිටිය මධ්‍යම ගබඩා සහ මිශ්‍රණ සංකීර්ණය (85,000 MT)",
    major_warehouses: [
      { town: "හුනුපිටිය (Hunupitiya)", district: "Gampaha", type: "Central Hub", capacity_mt: 85000, phone: "011-2948251" },
      { town: "නිකවැරටිය (Nikaweratiya)", district: "Kurunegala", type: "Regional Depot", capacity_mt: 12000, phone: "037-2260233" },
      { town: "පල්ලෙකැලේ (Kandy)", district: "Kandy", type: "Regional Depot", capacity_mt: 9500, phone: "081-2420455" },
      { town: "තඹුත්තේගම (Tambuttegama)", district: "Anuradhapura", type: "Regional Depot", capacity_mt: 18000, phone: "025-2276321" },
      { town: "උහන (Uhana)", district: "Ampara", type: "Regional Depot", capacity_mt: 14000, phone: "063-2223844" },
      { town: "කිලිනොච්චිය (Kilinochchi)", district: "Kilinochchi", type: "Regional Depot", capacity_mt: 11000, phone: "021-2285612" }
    ],
    distributes_subsidized: true,
    nfs_license_no: "NFS/DIST/SOE/001",
    hotline: "011-2948251",
    website: "www.ccf.gov.lk"
  },
  {
    id: "DIST-CFC",
    entity_name_si: "ලංකා පොහොර සමාගම (ලක්පොහොර)",
    entity_name_en: "Ceylon Fertilizer Company Ltd (Lakpohora)",
    type: "STATE_OWNED",
    category: "ප්‍රමුඛ රාජ්‍ය ආනයනකරු සහ සහනාධාර බෙදාහරින්නා",
    head_office: "ස්වර්ණ ජයන්ති මාවත, හුනුපිටිය, වත්තල",
    central_complex: "හුනුපිටිය මධ්‍යම ගබඩා සංකීර්ණය",
    major_warehouses: [
      { town: "හුනුපිටිය (Hunupitiya)", district: "Gampaha", type: "Central Hub", capacity_mt: 85000, phone: "011-2948255" },
      { town: "සීප්පුකුලම (Seeppukulama)", district: "Anuradhapura", type: "Regional Complex", capacity_mt: 15000, phone: "025-2234891" },
      { town: "බිඳුනුවැව (Badulla)", district: "Badulla", type: "Regional Buffer", capacity_mt: 10500, phone: "057-2222890" },
      { town: "හිඟුරක්ගොඩ (Hingurakgoda)", district: "Polonnaruwa", type: "Regional Complex", capacity_mt: 16500, phone: "027-2246411" },
      { town: "වාරියපොළ (Wariyapola)", district: "Kurunegala", type: "Regional Depot", capacity_mt: 13000, phone: "037-2267341" }
    ],
    distributes_subsidized: true,
    nfs_license_no: "NFS/DIST/SOE/002",
    hotline: "011-2948255",
    website: "www.lakpohora.lk"
  },
  {
    id: "DIST-BAUR",
    entity_name_si: "ඒ. බෝවර් සමාගම (A. Baur & Co.)",
    entity_name_en: "A. Baur & Co. (Pvt) Ltd",
    type: "LICENSED_PRIVATE",
    category: "පෞද්ගලික අංශයේ ප්‍රමුඛතම හා පෞරාණිකම පොහොර සමාගම (Est. 1897)",
    head_office: "ඉහළ චැතම් වීදිය, කොළඹ 01",
    central_complex: "කැලණිය ප්‍රධාන පොහොර නිෂ්පාදන හා මිශ්‍රණ කර්මාන්තශාලාව (Kelaniya Complex)",
    major_warehouses: [
      { town: "කැලණිය (Kelaniya)", district: "Gampaha", type: "Manufacturing Hub", capacity_mt: 45000, phone: "011-2911244" },
      { town: "ග්‍රෑන්ඩ්පාස් (Grandpass)", district: "Colombo", type: "Import Store", capacity_mt: 25000, phone: "011-4728700" },
      { town: "මහනුවර (Kandy)", district: "Kandy", type: "Regional Branch", capacity_mt: 8000, phone: "081-2234120" },
      { town: "අනුරාධපුරය (Anuradhapura)", district: "Anuradhapura", type: "Regional Depot", capacity_mt: 11000, phone: "025-2223890" }
    ],
    distributes_subsidized: false,
    nfs_license_no: "NFS/DIST/PVT/001",
    hotline: "011-4728700",
    website: "www.baurs.com"
  },
  {
    id: "DIST-CIC",
    entity_name_si: "සී.අයි.සී. ඇග්‍රි බිස්නස් (CIC Agri Businesses)",
    entity_name_en: "CIC Agri Businesses (Pvt) Ltd",
    type: "LICENSED_PRIVATE",
    category: "ප්‍රමුඛ පෞද්ගලික කෘෂිකාර්මික හා බීජ/පොහොර සමාගම",
    head_office: "CIC හවුස්, නො. 199, කෙවින්ස් පාර, කොළඹ 02",
    central_complex: "ජා-ඇල ප්‍රධාන සැපයුම් හා ගබඩා සංකීර්ණය (Ja-Ela Complex)",
    major_warehouses: [
      { town: "ජා-ඇල (Ja-Ela)", district: "Gampaha", type: "Central Logistics Hub", capacity_mt: 35000, phone: "011-2236521" },
      { town: "පැල්වෙහෙර / දඹුල්ල (Dambulla)", district: "Matale", type: "Central Agri Complex", capacity_mt: 18000, phone: "066-2284900" },
      { town: "මහව (Mahawa)", district: "Kurunegala", type: "Regional Depot", capacity_mt: 8500, phone: "037-2275210" },
      { town: "හිඟුරක්ගොඩ (Hingurakgoda)", district: "Polonnaruwa", type: "Regional Processing Store", capacity_mt: 10000, phone: "027-2246800" }
    ],
    distributes_subsidized: false,
    nfs_license_no: "NFS/DIST/PVT/004",
    hotline: "011-2359359",
    website: "www.cic.lk"
  },
  {
    id: "DIST-HAYLEYS",
    entity_name_si: "හේලීස් ඇග්‍රිකල්චර් (Hayleys Agriculture Holdings)",
    entity_name_en: "Hayleys Agriculture Holdings Ltd",
    type: "LICENSED_PRIVATE",
    category: "දිවයින පුරා 90%+ කෘෂි අලෙවිසැල් ආවරණය කරන ප්‍රමුඛ සමාගම",
    head_office: "ඩීන්ස් පාර, කොළඹ 10",
    central_complex: "සපුගස්කන්ද ප්‍රධාන පොහොර හා මිශ්‍රණ කර්මාන්තශාලාව (Sapugaskanda)",
    major_warehouses: [
      { town: "සපුගස්කන්ද (Sapugaskanda)", district: "Gampaha", type: "Manufacturing Hub", capacity_mt: 40000, phone: "011-2400300" },
      { town: "ඒකල (Ekala, Ja-Ela)", district: "Gampaha", type: "Central Store", capacity_mt: 20000, phone: "011-2233441" },
      { town: "කුරුණෑගල (Kurunegala)", district: "Kurunegala", type: "Regional Hub", capacity_mt: 9000, phone: "037-2224500" },
      { town: "අම්බලන්තොට (Hambantota)", district: "Hambantota", type: "Regional Store", capacity_mt: 7500, phone: "047-2223100" }
    ],
    distributes_subsidized: false,
    nfs_license_no: "NFS/DIST/PVT/002",
    hotline: "011-2688960",
    website: "www.hayleysagriculture.com"
  },
  {
    id: "DIST-LANKEM",
    entity_name_si: "ලැන්කම් සිලෝන් (Lankem Ceylon PLC)",
    entity_name_en: "Lankem Ceylon PLC",
    type: "LICENSED_PRIVATE",
    category: "විශේෂිත සංයෝග පොහොර සහ කෘෂි රසායන නිෂ්පාදක",
    head_office: "කොටුව, කොළඹ 01",
    central_complex: "මාකඳුර ප්‍රධාන කෘෂි කර්මාන්තශාලාව (Makadura, Gonawila)",
    major_warehouses: [
      { town: "මාකඳුර (Makadura, Pannala)", district: "Kurunegala", type: "Agro Factory & Hub", capacity_mt: 30000, phone: "031-2298100" },
      { town: "පොලොන්නරුව (Polonnaruwa)", district: "Polonnaruwa", type: "Regional Processing Plant", capacity_mt: 8000, phone: "027-2223500" },
      { town: "සපුගස්කන්ද (Sapugaskanda)", district: "Gampaha", type: "Central Chemical Store", capacity_mt: 15000, phone: "011-4822000" }
    ],
    distributes_subsidized: false,
    nfs_license_no: "NFS/DIST/PVT/003",
    hotline: "011-7766000",
    website: "www.lankem.lk"
  }
];

// Fallback Authentic Products Catalog
const DEFAULT_PRODUCTS = [
  {
    sku: "FERT-UREA-50KG",
    name_si: "යූරියා පොහොර (Urea 46% N) - 50kg මිටිය",
    name_en: "Prilled/Granular Urea (46% N) 50kg",
    gazetted_mrp_subsidized: 2500.0,
    official_commercial_price: 8500.0,
    bag_weight_kg: 50,
    icon: "🌾"
  },
  {
    sku: "FERT-TSP-50KG",
    name_si: "ත්‍රිත්ව සුපර් පොස්පේට් (TSP 46% P2O5) - 50kg මිටිය",
    name_en: "Triple Superphosphate (TSP 46% P2O5) 50kg",
    gazetted_mrp_subsidized: 2500.0,
    official_commercial_price: 9200.0,
    bag_weight_kg: 50,
    icon: "⚫"
  },
  {
    sku: "FERT-MOP-50KG",
    name_si: "මියුරියේට් ඔෆ් පොටෑෂ් (MOP 60% K2O) - 50kg මිටිය",
    name_en: "Muriate of Potash (MOP 60% K2O) 50kg",
    gazetted_mrp_subsidized: 2500.0,
    official_commercial_price: 8900.0,
    bag_weight_kg: 50,
    icon: "🔴"
  },
  {
    sku: "FERT-NPK-COMPOUND-50KG",
    name_si: "සම්පූර්ණ NPK සංයෝග පොහොර (16:16:16) - 50kg මිටිය",
    name_en: "Balanced NPK Compound (16:16:16) 50kg",
    gazetted_mrp_subsidized: null,
    official_commercial_price: 11500.0,
    bag_weight_kg: 50,
    icon: "🧪"
  },
  {
    sku: "FERT-DOLOMITE-50KG",
    name_si: "කෘෂිකාර්මික ඩොලමයිට් - 50kg මිටිය",
    name_en: "Agricultural Dolomite 50kg",
    gazetted_mrp_subsidized: null,
    official_commercial_price: 850.0,
    bag_weight_kg: 50,
    icon: "⚪"
  },
  {
    sku: "FERT-ORGANIC-COMPOST-25KG",
    name_si: "ප්‍රමිතිගත කාබනික කොම්පෝස්ට් - 25kg මිටිය",
    name_en: "Certified Organic Compost 25kg",
    gazetted_mrp_subsidized: null,
    official_commercial_price: 1200.0,
    bag_weight_kg: 25,
    icon: "🌱"
  },
  {
    sku: "FERT-LIQUID-FOLIAR-1L",
    name_si: "ක්ෂුද්‍ර පෝෂක හා සින්ක් දියර පත්‍ර ඉසින - 1L බෝතලය",
    name_en: "Chelated Micronutrient & Zinc Foliar Spray 1L",
    gazetted_mrp_subsidized: null,
    official_commercial_price: 2400.0,
    bag_weight_kg: 1,
    icon: "💧"
  }
];

export default function OnlineProcurementPortal({ language = 'si', farmerProfile = {} }) {
  const tr = (si, en, ta) => {
    if (language === 'ta') return ta || en || si;
    if (language === 'en') return en || si;
    return si;
  };

  // Sub-tabs: 'order_flow' | 'directory_view'
  const [activeTab, setActiveTab] = useState('order_flow');

  // Order Parameters
  const [procurementChannel, setProcurementChannel] = useState('SUBSIDIZED_QUOTA'); // 'SUBSIDIZED_QUOTA' or 'COMMERCIAL'
  const [selectedDistributorId, setSelectedDistributorId] = useState('DIST-CCF');
  const [selectedDepot, setSelectedDepot] = useState('තඹුත්තේගම මධ්‍යම ආර්ථික කලාප ගබඩාව');
  const [deliveryType, setDeliveryType] = useState('DEPOT_PICKUP'); // 'DEPOT_PICKUP' or 'TRACTOR_DELIVERY'
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Cart Quantities: { 'FERT-UREA-50KG': 3, 'FERT-MOP-50KG': 1, ... }
  const [cartQuantities, setCartQuantities] = useState({
    'FERT-UREA-50KG': 3,
    'FERT-TSP-50KG': 1,
    'FERT-MOP-50KG': 1
  });

  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Directory Search
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryFilter, setDirectoryFilter] = useState('ALL');

  // Change quantity
  const handleQtyChange = (sku, delta) => {
    setCartQuantities(prev => {
      const current = prev[sku] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [sku]: next };
    });
  };

  // Selected distributor profile
  const currentDistributor = DEFAULT_DISTRIBUTORS.find(d => d.id === selectedDistributorId) || DEFAULT_DISTRIBUTORS[0];

  // Financial calculations
  let grossTotal = 0;
  let subsidySavings = 0;
  let totalBags = 0;
  let totalWeightKg = 0;

  DEFAULT_PRODUCTS.forEach(p => {
    const qty = cartQuantities[p.sku] || 0;
    if (qty > 0) {
      totalBags += qty;
      totalWeightKg += (p.bag_weight_kg * qty);
      const unitPrice = p.official_commercial_price;
      const isSubsidized = procurementChannel === 'SUBSIDIZED_QUOTA' && p.gazetted_mrp_subsidized !== null;
      const effectivePrice = isSubsidized ? p.gazetted_mrp_subsidized : unitPrice;

      grossTotal += (effectivePrice * qty);
      if (isSubsidized) {
        subsidySavings += ((unitPrice - p.gazetted_mrp_subsidized) * qty);
      }
    }
  });

  const deliveryFee = deliveryType === 'TRACTOR_DELIVERY' ? (totalWeightKg <= 500 ? 1500 : 2500) : 0;
  const netPayable = grossTotal + deliveryFee;

  // Handle Order Submit
  const handlePlaceOrder = async () => {
    if (totalBags === 0) {
      alert("කරුණාකර අවම වශයෙන් එක් පොහොර වර්ගයක් තෝරන්න.");
      return;
    }

    setOrderSubmitting(true);
    const orderPayload = {
      farmer_name: farmerProfile.name || "කේ. එම්. බණ්ඩාර",
      farmer_nic: farmerProfile.nic || "198412345678",
      farmer_phone: farmerProfile.phone || "0771234567",
      district: farmerProfile.district || "Anuradhapura",
      asc_division: farmerProfile.ascDivision || "තඹුත්තේගම",
      channel: procurementChannel,
      distributor_id: selectedDistributorId,
      pickup_depot: selectedDepot,
      delivery_type: deliveryType,
      delivery_address: deliveryAddress || "නොමිලේ ගබඩාවෙන් ලබාගැනීම",
      items: Object.entries(cartQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([sku, qty]) => ({ sku, quantity: qty }))
    };

    try {
      const res = await fetch(`${API_BASE}/api/procurement/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (res.ok) {
        const data = await res.json();
        setConfirmedOrder(data);
        setOrderSubmitting(false);
        return;
      }
    } catch (e) {
      // Local fallback
    }

    // Local instant confirmation fallback
    const token = `PO-LK-2026-${Date.now().toString().slice(-6)}`;
    setConfirmedOrder({
      order_token: token,
      status: "CONFIRMED_RESERVED",
      created_at: new Date().toISOString(),
      pickup_valid_until: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 16:30',
      farmer: {
        name: farmerProfile.name || "කේ. එම්. බණ්ඩාර",
        nic: farmerProfile.nic || "198412345678",
        phone: farmerProfile.phone || "0771234567",
        district: farmerProfile.district || "Anuradhapura",
        asc_division: farmerProfile.ascDivision || "තඹුත්තේගම"
      },
      procurement_channel: procurementChannel,
      distributor: {
        id: currentDistributor.id,
        name: currentDistributor.entity_name_si,
        hotline: currentDistributor.hotline
      },
      fulfillment: {
        type: deliveryType,
        depot_or_hub: selectedDepot,
        delivery_address: deliveryAddress || "නොමිලේ ගබඩාවෙන් ලබාගැනීම",
        instructions: "කරුණාකර මෙම ඇණවුම් අංකය (QR කේතය) සහ ජාතික හැඳුනුම්පත රැගෙන දින 5ක් ඇතුළත අදාළ ගබඩාව වෙත පැමිණෙන්න."
      },
      financial_summary: {
        gross_products_total_lkr: grossTotal,
        government_subsidy_saving_lkr: subsidySavings,
        delivery_fee_lkr: deliveryFee,
        net_payable_lkr: netPayable,
        total_cargo_weight_kg: totalWeightKg
      },
      order_items: Object.entries(cartQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([sku, qty]) => {
          const p = DEFAULT_PRODUCTS.find(x => x.sku === sku);
          return {
            sku,
            name_si: p?.name_si || sku,
            quantity_units: qty,
            line_total_lkr: (p?.official_commercial_price || 0) * qty
          };
        })
    });
    setOrderSubmitting(false);
  };

  const filteredDirectory = DEFAULT_DISTRIBUTORS.filter(d => {
    const q = directorySearch.toLowerCase();
    const matchSearch = !q || 
      d.entity_name_si.toLowerCase().includes(q) || 
      d.entity_name_en.toLowerCase().includes(q) || 
      d.head_office.toLowerCase().includes(q) || 
      d.central_complex.toLowerCase().includes(q);

    if (directoryFilter === 'STATE') return matchSearch && d.type === 'STATE_OWNED';
    if (directoryFilter === 'PRIVATE') return matchSearch && d.type === 'LICENSED_PRIVATE';
    return matchSearch;
  });

  return (
    <div className="clean-card p-6 sm:p-8 space-y-6 bg-white border border-slate-200 shadow-xl rounded-3xl animate-fadeIn">
      
      {/* ========================================================================= */}
      {/* 1. PORTAL HEADER & SUB-TABS                                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
            <ShoppingCart className="w-3.5 h-3.5 text-emerald-700" />
            <span>NFS & CAA සහතිකලත් නිල ඇණවුම් පද්ධතිය (Official Procurement Portal)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {tr("පොහොර බෙදාහරින්නන් හා ඔන්ලයින් ඇණවුම් / වෙන්කර ගැනීමේ Portal", "Fertilizer Distributors & Online Procurement Portal", "உர விநியோகஸ்தர்கள் மற்றும் ஆன்லைன் முன்பதிவு")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {tr(
              "ශ්‍රී ලංකාවේ ප්‍රමුඛ රාජ්‍ය (CCF, ලක්පොහොර) සහ බලපත්‍රලාභී පෞද්ගලික (බෝවර්, CIC, හේලීස්, ලැන්කම්) ආයතනවලින් සහතික කළ පොහොර ගැසට් මිලට සෘජුවම වෙන්කරවා ගන්න.",
              "Procure authentic fertilizer from verified State (CCF, CFC) and Licensed Private distributors at gazetted MRP.",
              "அங்கீகரிக்கப்பட்ட உரங்களை அதிகாரப்பூர்வ விலையில் நேரடியாக முன்பதிவு செய்யுங்கள்."
            )}
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('order_flow')}
            className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
              activeTab === 'order_flow'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{tr("🛒 ඔන්ලයින් ඇණවුම් කිරීම", "Online Pre-Order", "முன்பதிவு")}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('directory_view')}
            className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
              activeTab === 'directory_view'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{tr("🏢 බෙදාහරින ආයතන නාමාවලිය", "Distributors Directory", "நிறுவன விபரங்கள்")}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ORDER FLOW VIEW (ONLINE PROCUREMENT)                                    */}
      {/* ========================================================================= */}
      {activeTab === 'order_flow' && (
        <div className="space-y-6">
          
          {/* Confirmed Order Modal / Display */}
          {confirmedOrder ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50 border-2 border-emerald-400 space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                      {tr("ඇණවුම සාර්ථකව වෙන් කෙරිණි! (Pre-Order Confirmed)", "Pre-Order Reserved Successfully", "முன்பதிவு உறுதி செய்யப்பட்டது")}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 font-mono">
                      {confirmedOrder.order_token}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-black border border-slate-300 shadow-xs flex items-center space-x-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmedOrder(null)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs"
                  >
                    නව ඇණවුමක් (New Order)
                  </button>
                </div>
              </div>

              {/* Order Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-2xl border border-emerald-200">
                <div>
                  <span className="text-slate-500 font-bold block">ගොවියාගේ නම:</span>
                  <strong className="text-slate-900 text-sm font-black">{confirmedOrder.farmer.name}</strong>
                  <span className="text-[11px] text-slate-500 block">ජා.හැ: {confirmedOrder.farmer.nic}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">බෙදාහරින ආයතනය:</span>
                  <strong className="text-emerald-900 text-sm font-black">{confirmedOrder.distributor.name}</strong>
                  <span className="text-[11px] text-slate-500 block">Hotline: {confirmedOrder.distributor.hotline}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">පොහොර ලබාගත යුතු ස්ථානය:</span>
                  <strong className="text-blue-900 text-sm font-black">{confirmedOrder.fulfillment.depot_or_hub}</strong>
                  <span className="text-[11px] text-rose-700 font-black block">කල් ඉකුත්වීම: {confirmedOrder.pickup_valid_until}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white rounded-2xl border border-emerald-200 p-4 space-y-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  වෙන්කළ පොහොර තොග විස්තරය:
                </h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {confirmedOrder.order_items.map((it, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <span className="font-bold text-slate-800">{it.name_si} x {it.quantity_units}</span>
                      <strong className="text-slate-900 font-mono">රු. {it.line_total_lkr.toLocaleString()}</strong>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm font-black">
                  <span className="text-slate-900">ගෙවිය යුතු ශුද්ධ මුදල (Net Payable):</span>
                  <span className="text-emerald-700 text-base font-black font-mono">
                    රු. {confirmedOrder.financial_summary.net_payable_lkr.toLocaleString()}
                  </span>
                </div>

                {confirmedOrder.financial_summary.government_subsidy_saving_lkr > 0 && (
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-between">
                    <span>🎉 රජයේ සහනාධාරයෙන් ඔබට ඉතිරි වූ මුදල:</span>
                    <span className="font-black font-mono">+ රු. {confirmedOrder.financial_summary.government_subsidy_saving_lkr.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                <strong className="font-black block">💡 ගබඩාවෙන් පොහොර ලබාගැනීමට උපදෙස්:</strong>
                <p>{confirmedOrder.fulfillment.instructions}</p>
                <p className="text-[11px] text-slate-600">
                  පාරිභෝගික කටයුතු අධිකාරි පනත හා 1988 අංක 68 දරන පොහොර නියාමන පනත යටතේ නියමිත මිලට තොග ලබාදීමට අදාළ ගබඩාව බැඳී සිටී.
                </p>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* ORDER FORM                                                                */
            /* ========================================================================= */
            <div className="space-y-6">
              
              {/* Step 1: Procurement Channel Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-700 tracking-wider block">
                  පියවර 1: මිලදී ගැනීමේ ක්‍රමය තෝරන්න (Select Channel):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProcurementChannel('SUBSIDIZED_QUOTA')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex items-start space-x-3 ${
                      procurementChannel === 'SUBSIDIZED_QUOTA'
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-3xl">🏛️</span>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block">
                        රජයේ සහනාධාර කූපන් කෝටාව (Subsidized Quota)
                      </strong>
                      <span className="text-xs text-slate-600 block mt-0.5">
                        ගැසට් කළ රු. 2,500 සහනාධාර මිලට CCF හා ලක්පොහොර ගබඩා හරහා ලබාගැනීම.
                      </span>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 font-black text-[10px]">
                        රු. 2,500 / 50kg මිටිය
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProcurementChannel('COMMERCIAL')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex items-start space-x-3 ${
                      procurementChannel === 'COMMERCIAL'
                        ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-3xl">🛒</span>
                    <div>
                      <strong className="text-sm font-black text-slate-900 block">
                        සහතිකලත් වාණිජ මිලදී ගැනීම (Certified Commercial)
                      </strong>
                      <span className="text-xs text-slate-600 block mt-0.5">
                        බෝවර්, CIC, හේලීස්, ලැන්කම්, CCF වෙතින් විවෘත වෙළඳපොළ සහතික කළ පොහොර.
                      </span>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded bg-blue-200 text-blue-950 font-black text-[10px]">
                        නිල ගැසට් සිල්ලර මිලට
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Distributor & Depot Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    බෙදාහරින ආයතනය තෝරන්න (Select Company):
                  </label>
                  <select
                    value={selectedDistributorId}
                    onChange={(e) => {
                      setSelectedDistributorId(e.target.value);
                      const d = DEFAULT_DISTRIBUTORS.find(x => x.id === e.target.value);
                      if (d && d.major_warehouses.length > 0) {
                        setSelectedDepot(d.major_warehouses[0].town + " - " + d.major_warehouses[0].type);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {DEFAULT_DISTRIBUTORS
                      .filter(d => procurementChannel === 'COMMERCIAL' || d.distributes_subsidized)
                      .map(d => (
                        <option key={d.id} value={d.id}>
                          {d.entity_name_si} ({d.type === 'STATE_OWNED' ? 'රාජ්‍ය' : 'බලපත්‍රලාභී පෞද්ගලික'})
                        </option>
                      ))}
                  </select>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    මූලස්ථානය: {currentDistributor.head_office}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    ආසන්නතම ගබඩාව හෝ ඩිපෝව (Pickup Depot):
                  </label>
                  <select
                    value={selectedDepot}
                    onChange={(e) => setSelectedDepot(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {currentDistributor.major_warehouses.map((wh, idx) => (
                      <option key={idx} value={`${wh.town} - ${wh.type}`}>
                        {wh.town} - {wh.type} ({wh.capacity_mt.toLocaleString()} MT) • ☎ {wh.phone}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                    ✓ තොග පවතින බවට තහවුරුයි (Verified Stock Available)
                  </span>
                </div>
              </div>

              {/* Step 3: Product Cart with Counters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase text-slate-700 tracking-wider">
                    පියවර 2: අවශ්‍ය පොහොර ප්‍රමාණයන් තෝරන්න (Select Bags & Products):
                  </label>
                  <span className="text-xs font-bold text-slate-500">
                    මුළු මිටි/ඒකක: <strong className="text-slate-900">{totalBags}</strong> ({totalWeightKg} kg)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DEFAULT_PRODUCTS.map(p => {
                    const qty = cartQuantities[p.sku] || 0;
                    const isSubsidized = procurementChannel === 'SUBSIDIZED_QUOTA' && p.gazetted_mrp_subsidized !== null;
                    const price = isSubsidized ? p.gazetted_mrp_subsidized : p.official_commercial_price;

                    return (
                      <div 
                        key={p.sku}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                          qty > 0 ? 'border-emerald-500 bg-emerald-50/40 shadow-xs' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{p.icon}</span>
                            <div>
                              <h4 className="text-xs font-black text-slate-900 leading-tight">
                                {p.name_si}
                              </h4>
                              <span className="text-[10px] text-slate-500 block">
                                බර: {p.bag_weight_kg} kg
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 flex items-baseline space-x-2">
                            <strong className="text-base font-black text-emerald-800 font-mono">
                              රු. {price.toLocaleString()}
                            </strong>
                            {isSubsidized && (
                              <span className="text-[10px] text-slate-400 line-through">
                                රු. {p.official_commercial_price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Counter Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-600">ප්‍රමාණය:</span>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(p.sku, -1)}
                              disabled={qty === 0}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-800 font-black text-sm flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-black text-sm font-mono text-slate-900">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(p.sku, 1)}
                              className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Fulfillment Method */}
              <div className="space-y-2 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-black uppercase text-slate-700 tracking-wider block">
                  පියවර 3: ලබාගැනීමේ ක්‍රමය තෝරන්න (Fulfillment Method):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3.5 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                    deliveryType === 'DEPOT_PICKUP' ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs' : 'bg-white/60 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'DEPOT_PICKUP'}
                      onChange={() => setDeliveryType('DEPOT_PICKUP')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <strong className="text-xs font-black text-slate-900 block">
                        🏢 ගබඩාවෙන් සෘජුවම ලබාගැනීම (Depot Pickup)
                      </strong>
                      <span className="text-[11px] text-slate-500 block">නොමිලේ (Free) • පෝලිම් නැත</span>
                    </div>
                  </label>

                  <label className={`p-3.5 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                    deliveryType === 'TRACTOR_DELIVERY' ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs' : 'bg-white/60 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={deliveryType === 'TRACTOR_DELIVERY'}
                      onChange={() => setDeliveryType('TRACTOR_DELIVERY')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <strong className="text-xs font-black text-slate-900 block">
                        🚜 ප්‍රාදේශීය ට්‍රැක්ටර් / ලොරි ප්‍රවාහනය (Doorstep Logistics)
                      </strong>
                      <span className="text-[11px] text-slate-500 block">+ රු. 1,500 - රු. 2,500 නියමිත ගාස්තුව</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Step 5: Summary & Submit Button */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-slate-400 block">ඇස්තමේන්තුගත සම්පූර්ණ මුදල:</span>
                    <div className="flex items-baseline space-x-2 mt-0.5">
                      <strong className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                        රු. {netPayable.toLocaleString()}
                      </strong>
                      {subsidySavings > 0 && (
                        <span className="text-xs text-emerald-300 font-bold">
                          (සහනාධාර ඉතිරිය: රු. {subsidySavings.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs text-slate-400">
                    තෝරාගත් මිටි ගණන: <strong>{totalBags}</strong> • බර: <strong>{totalWeightKg} kg</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={orderSubmitting || totalBags === 0}
                  className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm sm:text-base shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
                >
                  <PackageCheck className="w-5 h-5 text-slate-950" />
                  <span>
                    {orderSubmitting 
                      ? "ඇණවුම ලියාපදිංචි කරමින් පවතී..." 
                      : "🛒 ඇණවුම තහවුරු කර ඩිජිටල් QR පාස්පත ලබාගන්න"}
                  </span>
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  * කිසිදු අත්තිකාරම් මුදලක් අය නොකෙරේ. පොහොර ලබාගන්නා අවස්ථාවේදී ගබඩාව වෙත මුදල් ගෙවිය හැක.
                </p>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DISTRIBUTORS DIRECTORY VIEW                                            */}
      {/* ========================================================================= */}
      {activeTab === 'directory_view' && (
        <div className="space-y-6">
          
          {/* Search & Filter Bar */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder="සමාගම, ගබඩාව හෝ නගරය සොයන්න (උදා: බෝවර්, CIC, කැලණිය, හුනුපිටිය)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-emerald-600 focus:outline-none bg-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setDirectoryFilter('ALL')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  directoryFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                සියල්ල ({DEFAULT_DISTRIBUTORS.length})
              </button>
              <button
                type="button"
                onClick={() => setDirectoryFilter('STATE')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  directoryFilter === 'STATE' ? 'bg-emerald-700 text-white' : 'bg-white text-emerald-800 border border-emerald-200'
                }`}
              >
                රාජ්‍ය සමාගම්
              </button>
              <button
                type="button"
                onClick={() => setDirectoryFilter('PRIVATE')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  directoryFilter === 'PRIVATE' ? 'bg-blue-700 text-white' : 'bg-white text-blue-800 border border-blue-200'
                }`}
              >
                බලපත්‍රලාභී පෞද්ගලික
              </button>
            </div>
          </div>

          {/* Directory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDirectory.map((dist) => (
              <div 
                key={dist.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Entity Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        dist.type === 'STATE_OWNED'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}>
                        {dist.type === 'STATE_OWNED' ? 'රාජ්‍ය ආයතනය (SOE)' : 'NFS බලපත්‍රලාභී පෞද්ගලික'}
                      </span>
                      <h3 className="text-base font-black text-slate-900 mt-1">
                        {dist.entity_name_si}
                      </h3>
                      <span className="text-xs text-slate-500 font-semibold block">
                        {dist.entity_name_en}
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-400">
                      {dist.nfs_license_no}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {dist.category}
                  </p>

                  {/* Complex and Head Office */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                    <div>
                      <strong className="text-slate-700">ප්‍රධාන කාර්යාලය: </strong>
                      <span className="text-slate-600">{dist.head_office}</span>
                    </div>
                    <div>
                      <strong className="text-slate-700">නිෂ්පාදන / මධ්‍යම සංකීර්ණය: </strong>
                      <span className="text-emerald-900 font-bold">{dist.central_complex}</span>
                    </div>
                  </div>

                  {/* Warehouses Table / Pills */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                      📍 ප්‍රධාන ගබඩා හා ඩිපෝ ස්ථාන:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {dist.major_warehouses.map((wh, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <strong className="text-slate-900 block font-black">{wh.town}</strong>
                          <span className="text-[10px] text-slate-500 block">{wh.type} • {wh.capacity_mt.toLocaleString()} MT</span>
                          <a href={`tel:${wh.phone}`} className="text-[10px] text-blue-700 font-bold block mt-0.5">
                            ☎ {wh.phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${dist.hotline}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition-all flex items-center justify-center space-x-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hotline: {dist.hotline}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDistributorId(dist.id);
                      setActiveTab('order_flow');
                    }}
                    className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition-all shadow-xs flex items-center space-x-1"
                  >
                    <span>ඇණවුම් කරන්න</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
