import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Rotate3d, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  ArrowRight, 
  Filter, 
  Check, 
  Droplets, 
  Radio,
  Building2,
  FlaskConical,
  Search,
  Phone,
  Anchor,
  ShieldAlert,
  Award,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import ThreeSriLankaMap from './ThreeSriLankaMap';

const API_BASE = "http://localhost:8000";

const DISTRICT_DETAILS = {
  "Anuradhapura": { 
    name_si: "අනුරාධපුරය", 
    zone: "Dry Zone (වියළි කලාපය)", 
    zone_category: "dry",
    buffer_mt: 38500, 
    stock_pct: 82, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "වී වගාව (Paddy) - හෙක්ටයාර 125,000",
    asc_hub: "තඹුත්තේගම ප්‍රධාන ගබඩාව & සීප්පුකුලම",
    weather: "31°C, Moderate Humidity",
    contact: "025-2221234 (DOA Anuradhapura)",
    trend: "up"
  },
  "Polonnaruwa": { 
    name_si: "පොලොන්නරුව", 
    zone: "Dry Zone (වියළි කලාපය)", 
    zone_category: "dry",
    buffer_mt: 32000, 
    stock_pct: 88, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "වී වගාව (Paddy) - පරාක්‍රම සමුද්‍ර කලාපය",
    asc_hub: "හිඟුරක්ගොඩ මධ්‍යම සංචිතය",
    weather: "32°C, Dry",
    contact: "027-2224567 (DOA Polonnaruwa)",
    trend: "up"
  },
  "Ampara": { 
    name_si: "අම්පාර", 
    zone: "Dry Zone (වියළි කලාපය)", 
    zone_category: "dry",
    buffer_mt: 29500, 
    stock_pct: 64, 
    risk: "මධ්‍යම (Moderate Risk)", 
    risk_level: "moderate",
    top_crop: "වී සහ බඩඉරිඟු (Maize)",
    asc_hub: "උහන ගොවිජන සේවා මධ්‍යස්ථානය",
    weather: "30°C, Occasional Rain",
    contact: "063-2227890 (DOA Ampara)",
    trend: "down"
  },
  "Kurunegala": { 
    name_si: "කුරුණෑගල", 
    zone: "Intermediate (අතරමැදි කලාපය)", 
    zone_category: "intermediate",
    buffer_mt: 41000, 
    stock_pct: 75, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "පොල් සහ වී වගාව",
    asc_hub: "නිකවැරටිය & වාරියපොළ ගබඩා සංකීර්ණ",
    weather: "29°C, Humid",
    contact: "037-2223456 (DOA Kurunegala)",
    trend: "up"
  },
  "Jaffna": { 
    name_si: "යාපනය", 
    zone: "Dry Zone (වියළි කලාපය)", 
    zone_category: "dry",
    buffer_mt: 18500, 
    stock_pct: 35, 
    risk: "අධි අවදානම් (Deficit Risk)", 
    risk_level: "high",
    top_crop: "රතුලූනු, මිරිස්, දුම්කොළ",
    asc_hub: "තිරුනෙල්වේලි & කිලිනොච්චිය හබ්",
    weather: "34°C, Very Dry",
    contact: "021-2229876 (DOA Jaffna)",
    trend: "down"
  },
  "Nuwara Eliya": { 
    name_si: "නුවරඑළිය", 
    zone: "Upcountry Wet (උඩරට තෙත්)", 
    zone_category: "upcountry",
    buffer_mt: 24000, 
    stock_pct: 91, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "උඩරට එළවළු (කැරට්, ලීක්ස්, අර්තාපල්)",
    asc_hub: "සීතාඑළිය ප්‍රධාන ගබඩාව",
    weather: "18°C, Misty",
    contact: "052-2221122 (DOA Nuwara Eliya)",
    trend: "up"
  },
  "Badulla": { 
    name_si: "බදුල්ල", 
    zone: "Upcountry Intermediate", 
    zone_category: "upcountry",
    buffer_mt: 21000, 
    stock_pct: 79, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "තේ, බඩඉරිඟු සහ එළවළු",
    asc_hub: "බිඳුනුවැව ප්‍රාදේශීය සංචිතය",
    weather: "24°C, Clear",
    contact: "055-2223344 (DOA Badulla)",
    trend: "up"
  },
  "Hambantota": { 
    name_si: "හම්බන්තොට", 
    zone: "Dry Zone (වියළි කලාපය)", 
    zone_category: "dry",
    buffer_mt: 23500, 
    stock_pct: 70, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "වී සහ කෙසෙල් වගාව",
    asc_hub: "අම්බලන්තොට කෘෂි පර්යේෂණාගාරය",
    weather: "31°C, Windy",
    contact: "047-2225566 (DOA Hambantota)",
    trend: "up"
  },
  "Colombo Port": { 
    name_si: "හුනුපිටිය / කොළඹ මධ්‍යම හබ්", 
    zone: "Central Hub Complex", 
    zone_category: "hub",
    buffer_mt: 120000, 
    stock_pct: 95, 
    risk: "ප්‍රධාන නැව්ගත සංචිතය", 
    risk_level: "hub",
    top_crop: "ජාතික බෙදාහැරීමේ මධ්‍යස්ථානය",
    asc_hub: "CCF හුනුපිටිය මධ්‍යම සංකීර්ණය",
    weather: "29°C, Humid",
    contact: "011-2948251 (CCF Hunupitiya)",
    trend: "up"
  },
  "Ratnapura": { 
    name_si: "රත්නපුර", 
    zone: "Wet Zone (තෙත් කලාපය)", 
    zone_category: "wet",
    buffer_mt: 19500, 
    stock_pct: 84, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "තේ සහ රබර් වගාව",
    asc_hub: "ඇහැලියගොඩ ගොවිජන සේවා",
    weather: "28°C, Heavy Rain",
    contact: "045-2229900 (DOA Ratnapura)",
    trend: "up"
  }
};

// Fallback authentic warehouse records
const DEFAULT_WAREHOUSES = [
  {
    id: "WH-CCF-HUNUPITIYA",
    name_si: "හුනුපිටිය මධ්‍යම ගබඩා සහ මිශ්‍රණ සංකීර්ණය",
    name_en: "Hunupitiya Central Storage & Blending Complex",
    operating_entity: "Colombo Commercial Fertilizers Ltd (CCF) & Ceylon Fertilizer Co. Ltd (Lakpohora)",
    type: "CENTRAL_HUB",
    province: "Western",
    district: "Gampaha",
    town: "Wattala / Hunupitiya",
    address: "Dalupitiya Road, Hunupitiya, Wattala",
    capacity_mt: 85000,
    current_stock: { urea_mt: 42000, tsp_mt: 16500, mop_mt: 21000, total_mt: 79500, utilization_pct: 93.5 },
    status: "OPERATIONAL_DISPATCHING",
    phone: "011-2948251 / 011-2948252",
    contact_officer: "ආර්. ඩබ්. ජයසිංහ (ප්‍රධාන ගබඩා අධිකාරී)",
    railway_siding: true,
    linked_ascs: ["බස්නාහිර පළාත් ASC", "ජාතික සංචිත", "දුම්රිය තොග පිටත් කිරීම්"],
    notes: "ශ්‍රී ලංකාවේ ප්‍රධානතම ජාතික පොහොර ගබඩා සහ මිශ්‍රණ මධ්‍යස්ථානය. දුම්රිය මාර්ග පද්ධතිය මගින් දිස්ත්‍රික්ක වෙත තොග පිටත් කර හැරේ."
  },
  {
    id: "WH-CFC-SEEPPUKULAMA",
    name_si: "සීප්පුකුලම ප්‍රාදේශීය පොහොර සංකීර්ණය",
    name_en: "Seeppukulama Regional Fertilizer Complex",
    operating_entity: "Ceylon Fertilizer Co. Ltd (Lakpohora)",
    type: "REGIONAL_DEPOT",
    province: "North Central",
    district: "Anuradhapura",
    town: "Mihintale / Seeppukulama",
    address: "Seeppukulama Junction, Mihintale Road, Anuradhapura",
    capacity_mt: 15000,
    current_stock: { urea_mt: 7200, tsp_mt: 2600, mop_mt: 3100, total_mt: 12900, utilization_pct: 86.0 },
    status: "OPERATIONAL_DISPATCHING",
    phone: "025-2234891",
    contact_officer: "එස්. කේ. දිසානායක (දිස්ත්‍රික් ගබඩා භාරකාර)",
    railway_siding: false,
    linked_ascs: ["මිහින්තලේ", "නොච්චියාගම", "කැකිරාව", "කහටගස්දිගිලිය", "මැදවච්චිය"],
    notes: "රජරට කලාපයේ ප්‍රධාන බෙදාහැරීමේ කේන්ද්‍රස්ථානයක් වන අතර අනුරාධපුර නැගෙනහිර සහ උතුරු ප්‍රදේශවල ගොවිජන සේවා මධ්‍යස්ථාන සඳහා තොග සපයයි."
  },
  {
    id: "WH-CCF-NIKAWERATIYA",
    name_si: "නිකවැරටිය ප්‍රාදේශීය ගබඩා ඩිපෝව",
    name_en: "Nikaweratiya Regional Warehouse Depot",
    operating_entity: "Colombo Commercial Fertilizers Ltd (CCF)",
    type: "REGIONAL_DEPOT",
    province: "North Western",
    district: "Kurunegala",
    town: "Nikaweratiya",
    address: "Anamaduwa Road, Nikaweratiya",
    capacity_mt: 12000,
    current_stock: { urea_mt: 5800, tsp_mt: 2100, mop_mt: 2400, total_mt: 10300, utilization_pct: 85.8 },
    status: "OPERATIONAL_DISPATCHING",
    phone: "037-2260233",
    contact_officer: "ටී. එම්. බණ්ඩාර (ප්‍රාදේශීය නිලධාරී)",
    railway_siding: false,
    linked_ascs: ["නිකවැරටිය", "කොබෙයිගනේ", "වාරියපොළ උතුර", "රස්නායකපුර", "මහව"],
    notes: "වයඹ කලාපයේ වී සහ අතිරේක බෝග වගාකරුවන් සඳහා සහනාධාර පොහොර කඩිනමින් නිකුත් කෙරෙන මූලස්ථානයකි."
  },
  {
    id: "WH-CCF-KANDY-PALLEKELE",
    name_si: "මහනුවර (පල්ලෙකැලේ) කෘෂි ගබඩා සංකීර්ණය",
    name_en: "Kandy (Pallekele) Agro Storage Complex",
    operating_entity: "Colombo Commercial Fertilizers Ltd (CCF)",
    type: "REGIONAL_DEPOT",
    province: "Central",
    district: "Kandy",
    town: "Kundasale / Pallekele",
    address: "BOI Industrial Zone, Pallekele, Kandy",
    capacity_mt: 9500,
    current_stock: { urea_mt: 3900, tsp_mt: 1800, mop_mt: 2600, total_mt: 8300, utilization_pct: 87.4 },
    status: "OPERATIONAL_DISPATCHING",
    phone: "081-2420455",
    contact_officer: "කේ. වී. ගුණවර්ධන (ගබඩා අධිකාරී)",
    railway_siding: false,
    linked_ascs: ["කුණ්ඩසාලේ", "තෙල්දෙණිය", "ගම්පොළ", "හතරලියැද්ද", "මිනිපේ"],
    notes: "මධ්‍යම කඳුකරයේ වී, එළවළු සහ කුළුබඩු වගාකරුවන් සඳහා විශේෂ පොහොර මිශ්‍රණ නිකුත් කිරීම."
  },
  {
    id: "WH-CFC-BADULLA",
    name_si: "බදුල්ල (බිඳුනුවැව) ප්‍රාදේශීය සංචිතය",
    name_en: "Badulla (Bindunuwewa) Regional Buffer Depot",
    operating_entity: "Ceylon Fertilizer Co. Ltd (Lakpohora)",
    type: "REGIONAL_DEPOT",
    province: "Uva",
    district: "Badulla",
    town: "Bandarawela / Bindunuwewa",
    address: "Bindunuwewa Agri Depot, Bandarawela Road, Badulla",
    capacity_mt: 10500,
    current_stock: { urea_mt: 4100, tsp_mt: 2400, mop_mt: 2800, total_mt: 9300, utilization_pct: 88.6 },
    status: "OPERATIONAL_DISPATCHING",
    phone: "057-2222890",
    contact_officer: "එම්. ප්‍රේමතිලක (ඌව පළාත් කළමනාකරු)",
    railway_siding: true,
    linked_ascs: ["බණ්ඩාරවෙල", "වැලිමඩ", "ඌව පරණගම", "මහියංගනය", "පස්සර"],
    notes: "ඌව පළාතේ උඩරට එළවළු සහ අල වගාකරුවන් වෙනුවෙන් සකසන ලද විශේෂ NPK හා MOP පොහොර සංචිත."
  },
  {
    id: "WH-CCF-THAMBUTTEGAMA",
    name_si: "තඹුත්තේගම මධ්‍යම ආර්ථික කලාප ගබඩාව",
    name_en: "Tambuttegama Central Dedicated Agro Depot",
    operating_entity: "Colombo Commercial Fertilizers Ltd (CCF)",
    type: "REGIONAL_DEPOT",
    province: "North Central",
    district: "Anuradhapura",
    town: "Tambuttegama",
    address: "Economic Centre Road, Tambuttegama",
    capacity_mt: 18000,
    current_stock: { urea_mt: 8900, tsp_mt: 3400, mop_mt: 4100, total_mt: 16400, utilization_pct: 91.1 },
    status: "OPERATIONAL_DISPATCHING",
    phone: "025-2276321",
    contact_officer: "ඩී. බී. විජේසිංහ (ඩිපෝ කළමනාකරු)",
    railway_siding: true,
    linked_ascs: ["තඹුත්තේගම", "තලාව", "රාජාංගනය", "එප්පාවල", "නොච්චියාගම"],
    notes: "මහවැලි H කලාපයේ සහ රජරට විශාලතම වී ගොවි ජනතාවට සහනාධාර පොහොර කඩිනමින් සැපයෙන මූලික මධ්‍යස්ථානය."
  },
  {
    id: "WH-CFC-HINGURAKGODA",
    name_si: "හිඟුරක්ගොඩ මධ්‍යම සංචිත සංකීර්ණය",
    name_en: "Hingurakgoda Central Buffer Complex",
    operating_entity: "Ceylon Fertilizer Co. Ltd (Lakpohora)",
    type: "REGIONAL_DEPOT",
    province: "North Central",
    district: "Polonnaruwa",
    town: "Hingurakgoda",
    address: "Airport Road, Hingurakgoda",
    capacity_mt: 16500,
    current_stock: { urea_mt: 8200, tsp_mt: 3100, mop_mt: 3800, total_mt: 15100, utilization_pct: 91.5 },
    status: "OPERATIONAL_DISPATCHING",
    phone: "027-2246411",
    contact_officer: "ඩබ්. එම්. සෝමරත්න (නියෝජ්‍ය අධ්‍යක්ෂ)",
    railway_siding: true,
    linked_ascs: ["හිඟුරක්ගොඩ", "මැදිරිගිරිය", "ඇලහැර", "බකමූණ", "ලංකාපුර"],
    notes: "පොලොන්නරුව දිස්ත්‍රික්කයේ පරාක්‍රම සමුද්‍රය හා මින්නේරිය ව්‍යාපාර වල වී ගොවීන් සඳහා ප්‍රමුඛ ගබඩාව."
  },
  {
    id: "WH-CCF-UHANA-AMPARA",
    name_si: "උහන (අම්පාර) ප්‍රාදේශීය සංචිත මධ්‍යස්ථානය",
    name_en: "Uhana (Ampara) Regional Buffer Depot",
    operating_entity: "Colombo Commercial Fertilizers Ltd (CCF)",
    type: "REGIONAL_DEPOT",
    province: "Eastern",
    district: "Ampara",
    town: "Uhana",
    address: "Uhana Central Junction, Ampara",
    capacity_mt: 14000,
    current_stock: { urea_mt: 6100, tsp_mt: 2400, mop_mt: 2900, total_mt: 11400, utilization_pct: 81.4 },
    status: "OPERATIONAL_DISPATCHING",
    phone: "063-2223844",
    contact_officer: "එස්. ඒ. රහීම් (නැගෙනහිර පළාත් සම්බන්ධීකාරක)",
    railway_siding: false,
    linked_ascs: ["උහන", "අම්පාර", "සමන්තුරේ", "අක්කරපත්තුව", "දමන"],
    notes: "නැගෙනහිර පළාතේ වී සහ බඩඉරිඟු වගා කලාප ආවරණය වන ප්‍රධාන බෙදාහැරීමේ මධ්‍යස්ථානය."
  },
  {
    id: "WH-CFC-WARIYAPOLA",
    name_si: "වාරියපොළ ගබඩා හා සැපයුම් සංකීර්ණය",
    name_en: "Wariyapola Storage & Logistics Complex",
    operating_entity: "Ceylon Fertilizer Co. Ltd (Lakpohora)",
    type: "REGIONAL_DEPOT",
    province: "North Western",
    district: "Kurunegala",
    town: "Wariyapola",
    address: "Chilaw Road, Wariyapola",
    capacity_mt: 13000,
    current_stock: { urea_mt: 6400, tsp_mt: 2500, mop_mt: 3000, total_mt: 11900, utilization_pct: 91.5 },
    status: "OPERATIONAL_DISPATCHING",
    phone: "037-2267341",
    contact_officer: "කේ. සී. හපුආරච්චි (ගබඩා නිලධාරී)",
    railway_siding: false,
    linked_ascs: ["වාරියපොළ", "පාදෙනිය", "කටුපොත", "බිංගිරිය", "කුලියාපිටිය"],
    notes: "වයඹ පළාතේ පොල් ත්‍රිකෝණය සහ කුඹුරු වගාවන් සඳහා පොස්පේට් හා යූරියා අඛණ්ඩව සැපයීම."
  },
  {
    id: "WH-CCF-KILINOCHCHI",
    name_si: "කිලිනොච්චිය උතුරු පළාත් මධ්‍යම ඩිපෝව",
    name_en: "Kilinochchi Northern Province Central Depot",
    operating_entity: "Colombo Commercial Fertilizers Ltd (CCF)",
    type: "REGIONAL_DEPOT",
    province: "Northern",
    district: "Kilinochchi",
    town: "Kilinochchi",
    address: "A9 Highway, Paranthan Junction, Kilinochchi",
    capacity_mt: 11000,
    current_stock: { urea_mt: 4800, tsp_mt: 1900, mop_mt: 2200, total_mt: 8900, utilization_pct: 80.9 },
    status: "OPERATIONAL_DISPATCHING",
    phone: "021-2285612",
    contact_officer: "කේ. සෙල්වරාජා (උතුරු පළාත් භාර නිලධාරී)",
    railway_siding: true,
    linked_ascs: ["පරන්තන්", "කරච්චි", "කණ්ඩාවලයි", "පූනගරි", "යාපනය අර්ධද්වීපය"],
    notes: "උතුරු පළාතේ යාපනය, කිලිනොච්චිය සහ මුලතිව් දිස්ත්‍රික්ක සඳහා ප්‍රධාන දුම්රිය මාර්ග සැපයුම් හබ් එක."
  }
];

// Fallback authentic NFS lab clearance records
const DEFAULT_LAB_CLEARANCES = [
  {
    consignment_id: "NFS/IMP/2026/0842",
    vessel_name: "MV Ocean Pioneer",
    imo_number: "IMO 9481234",
    importer: "Ceylon Fertilizer Co. Ltd (Lakpohora)",
    port_of_entry: "Colombo Port (JCT-4)",
    arrival_date: "2026-02-12",
    clearance_date: "2026-02-18",
    commodity: "Granular Urea (46% N)",
    origin_country: "Oman (OMIFCO Fertilizer Complex)",
    tonnage_mt: 35000,
    testing_laboratory: "Industrial Technology Institute (ITI - Chemical & Environmental Technology)",
    test_report_number: "ITI/CET/2026/FERT-04192",
    test_parameters: {
      nitrogen_pct: { value: 46.2, standard_limit: "min 46.0%", compliant: true },
      biuret_pct: { value: 0.72, standard_limit: "max 1.0%", compliant: true },
      moisture_pct: { value: 0.38, standard_limit: "max 0.5%", compliant: true },
      cadmium_cd_mg_kg: { value: 0.42, standard_limit: "max 3.0 mg/kg", compliant: true },
      arsenic_as_mg_kg: { value: 0.81, standard_limit: "max 5.0 mg/kg", compliant: true },
      lead_pb_mg_kg: { value: 2.10, standard_limit: "max 30.0 mg/kg", compliant: true }
    },
    clearance_status: "APPROVED_RELEASED",
    clearance_certificate_no: "NFS/CERT/2026/QA-8821",
    statutory_order: "Approved for bagging at Hunupitiya Complex and national agrarian dispatch under Act No. 68 of 1988.",
    assigned_depots: ["WH-CCF-HUNUPITIYA", "WH-CFC-SEEPPUKULAMA", "WH-CCF-THAMBUTTEGAMA"]
  },
  {
    consignment_id: "NFS/IMP/2026/0845",
    vessel_name: "MV Pacific Glory",
    imo_number: "IMO 9623811",
    importer: "Colombo Commercial Fertilizers Ltd (CCF)",
    port_of_entry: "Colombo Port (ECT-2)",
    arrival_date: "2026-02-20",
    clearance_date: "2026-02-26",
    commodity: "Muriate of Potash (MOP 60% K2O)",
    origin_country: "Jordan (Arab Potash Co. Safi)",
    tonnage_mt: 28000,
    testing_laboratory: "Sri Lanka Standards Institution (SLSI Testing Laboratory)",
    test_report_number: "SLSI/MAT/2026/AGR-1094",
    test_parameters: {
      potassium_k2o_pct: { value: 60.8, standard_limit: "min 60.0%", compliant: true },
      moisture_pct: { value: 0.41, standard_limit: "max 0.5%", compliant: true },
      cadmium_cd_mg_kg: { value: 0.65, standard_limit: "max 3.0 mg/kg", compliant: true },
      arsenic_as_mg_kg: { value: 1.15, standard_limit: "max 5.0 mg/kg", compliant: true },
      lead_pb_mg_kg: { value: 3.40, standard_limit: "max 30.0 mg/kg", compliant: true }
    },
    clearance_status: "APPROVED_RELEASED",
    clearance_certificate_no: "NFS/CERT/2026/QA-8834",
    statutory_order: "Full compliance with SLS 644 standard. Released for immediate dispatch to Badulla, Kandy, and Kurunegala.",
    assigned_depots: ["WH-CCF-NIKAWERATIYA", "WH-CCF-KANDY-PALLEKELE", "WH-CFC-BADULLA"]
  },
  {
    consignment_id: "NFS/IMP/2026/0849",
    vessel_name: "MV Red Sea Trader",
    imo_number: "IMO 9310945",
    importer: "Ceylon Fertilizer Co. Ltd (Lakpohora)",
    port_of_entry: "Trincomalee Harbour (Ashraff Jetty)",
    arrival_date: "2026-03-02",
    clearance_date: null,
    commodity: "Triple Superphosphate (TSP 46% P2O5)",
    origin_country: "Egypt (Abu Qir Phosphates)",
    tonnage_mt: 22000,
    testing_laboratory: "DOA Central Agricultural Research Lab (HORDI Gannoruwa)",
    test_report_number: "DOA/HORDI/SOIL-CHEM/2026/184",
    test_parameters: {
      water_soluble_p2o5_pct: { value: 46.1, standard_limit: "min 46.0%", compliant: true },
      free_acidity_pct: { value: 2.8, standard_limit: "max 3.0%", compliant: true },
      moisture_pct: { value: 3.1, standard_limit: "max 4.0%", compliant: true },
      cadmium_cd_mg_kg: { value: 2.45, standard_limit: "max 3.0 mg/kg (Strict SLS 644)", compliant: true },
      arsenic_as_mg_kg: { value: 2.10, standard_limit: "max 5.0 mg/kg", compliant: true },
      lead_pb_mg_kg: { value: 7.80, standard_limit: "max 30.0 mg/kg", compliant: true }
    },
    clearance_status: "UNDER_TESTING_QUARANTINE",
    clearance_certificate_no: "PENDING_CONFIRMATION",
    statutory_order: "Consignment held in secure bonded silos in Trincomalee pending secondary ICP-MS heavy metals verification at HORDI Gannoruwa.",
    assigned_depots: ["WH-CCF-UHANA-AMPARA", "WH-CFC-HINGURAKGODA"]
  },
  {
    consignment_id: "NFS/IMP/2026/0831",
    vessel_name: "MV Eastern Voyager",
    imo_number: "IMO 9284712",
    importer: "Commercial Private Consignment (Flagged)",
    port_of_entry: "Colombo Port (West Container Terminal)",
    arrival_date: "2026-01-18",
    clearance_date: "2026-01-25",
    commodity: "Granular Zinc Sulphate & Blend Base",
    origin_country: "Unspecified Third-Party Port",
    tonnage_mt: 4500,
    testing_laboratory: "Sri Lanka Standards Institution (SLSI Testing Laboratory)",
    test_report_number: "SLSI/MAT/2026/REJ-0089",
    test_parameters: {
      zinc_content_pct: { value: 14.2, standard_limit: "min 21.0%", compliant: false },
      cadmium_cd_mg_kg: { value: 8.75, standard_limit: "max 3.0 mg/kg", compliant: false },
      arsenic_as_mg_kg: { value: 9.40, standard_limit: "max 5.0 mg/kg", compliant: false },
      lead_pb_mg_kg: { value: 48.5, standard_limit: "max 30.0 mg/kg", compliant: false }
    },
    clearance_status: "REJECTED_QUARANTINED",
    clearance_certificate_no: "NFS/REJECT/2026/ENF-0012",
    statutory_order: "REJECTED UNDER SECTION 8 OF REGULATION OF FERTILIZERS ACT NO. 68 OF 1988. Immediate re-export ordered under Customs supervision due to toxic heavy metal exceedance.",
    assigned_depots: []
  }
];

export default function NationalMapMode({ language = 'si' }) {
  const tr = (si, en, ta) => {
    if (language === 'ta') return ta || en || si;
    if (language === 'en') return en || si;
    return si;
  };

  // Main Mode Tabs: 'district_map' | 'warehouse_network' | 'nfs_lab_clearance'
  const [activeMainTab, setActiveMainTab] = useState('district_map');

  const [selectedDistrictName, setSelectedDistrictName] = useState("Anuradhapura");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState("all");
  const [rebalanceTriggered, setRebalanceTriggered] = useState(false);
  const [nationalStats, setNationalStats] = useState({ buffer: 0, alerts: 0, vessels: 0, adequacy: 0 });

  // Supply Chain Directory State
  const [warehouses, setWarehouses] = useState(DEFAULT_WAREHOUSES);
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [warehouseEntityFilter, setWarehouseEntityFilter] = useState('all');
  const [selectedWarehouseModal, setSelectedWarehouseModal] = useState(null);

  // NFS Lab Quality Clearance State
  const [labClearances, setLabClearances] = useState(DEFAULT_LAB_CLEARANCES);
  const [labFilter, setLabFilter] = useState('ALL');

  useEffect(() => {
    // Animate summary stats
    let b = 0, a = 0, v = 0, ad = 0;
    const interval = setInterval(() => {
      if (b < 485000) b += 15000;
      if (a < 3) a += 1;
      if (v < 2) v += 1;
      if (ad < 89) ad += 3;
      
      if (b >= 485000) b = 485000;
      if (a >= 3) a = 3;
      if (v >= 2) v = 2;
      if (ad >= 89) ad = 89;
      
      setNationalStats({ buffer: b, alerts: a, vessels: v, adequacy: ad });
      if (b === 485000 && a === 3 && v === 2 && ad === 89) clearInterval(interval);
    }, 50);

    // Fetch live backend warehouses
    fetch(`${API_BASE}/api/supply-chain/warehouses`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setWarehouses(data);
      })
      .catch(() => {});

    // Fetch live backend NFS lab clearances
    fetch(`${API_BASE}/api/supply-chain/nfs-lab-clearances`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setLabClearances(data);
      })
      .catch(() => {});

    return () => clearInterval(interval);
  }, []);

  const selectedData = DISTRICT_DETAILS[selectedDistrictName] || DISTRICT_DETAILS["Anuradhapura"];

  const filteredDistricts = Object.keys(DISTRICT_DETAILS).filter(key => {
    if (selectedZoneFilter === "critical") return DISTRICT_DETAILS[key].risk_level === 'high' || DISTRICT_DETAILS[key].stock_pct < 40;
    if (selectedZoneFilter === "all") return true;
    return DISTRICT_DETAILS[key].zone_category === selectedZoneFilter;
  });

  const handleTriggerRebalance = () => {
    setRebalanceTriggered(true);
    setTimeout(() => {
      setRebalanceTriggered(false);
    }, 4000);
  };

  const getStockColor = (pct) => {
    if (pct > 75) return 'bg-emerald-500';
    if (pct > 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };
  
  const getBadgeColor = (zone) => {
    switch(zone) {
      case 'dry': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'intermediate': return 'bg-lime-100 text-lime-800 border-lime-200';
      case 'upcountry': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'wet': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'critical': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Filtered warehouses
  const filteredWarehouses = warehouses.filter(w => {
    const q = warehouseSearch.toLowerCase();
    const matchSearch = !q || 
      w.name_si.toLowerCase().includes(q) || 
      w.name_en.toLowerCase().includes(q) || 
      w.town.toLowerCase().includes(q) || 
      w.district.toLowerCase().includes(q);

    if (warehouseEntityFilter === 'CCF') {
      return matchSearch && w.operating_entity.includes('Colombo Commercial');
    }
    if (warehouseEntityFilter === 'LAKPOHORA') {
      return matchSearch && (w.operating_entity.includes('Lakpohora') || w.operating_entity.includes('Ceylon Fertilizer'));
    }
    return matchSearch;
  });

  // Filtered NFS Lab Clearances
  const filteredLabClearances = labClearances.filter(c => {
    if (labFilter === 'ALL') return true;
    return c.clearance_status === labFilter;
  });

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      
      {/* ========================================================================= */}
      {/* 3-WAY SUB-NAVIGATION: DISTRICT MAP / WAREHOUSE DIRECTORY / NFS LAB AUDIT */}
      {/* ========================================================================= */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveMainTab('district_map')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
            activeMainTab === 'district_map'
              ? 'bg-blue-700 text-white shadow-md shadow-blue-200'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Rotate3d className="w-4 h-4" />
          <span>{tr("🗺️ දිස්ත්‍රික් සංචිත සිතියම (3D Model)", "🗺️ District Buffer Map (3D)", "🗺️ மாவட்ட கையிருப்பு வரைபடம்")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('warehouse_network')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
            activeMainTab === 'warehouse_network'
              ? 'bg-emerald-700 text-white shadow-md shadow-emerald-200'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{tr("🏢 ප්‍රාදේශීය ගබඩා ජාලය (CCF & ලක්පොහොර)", "🏢 State Warehouse Directory (CCF & CFC)", "🏢 பிராந்திய களஞ்சிய சாலைகள்")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab('nfs_lab_clearance')}
          className={`flex-1 min-w-[200px] py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
            activeMainTab === 'nfs_lab_clearance'
              ? 'bg-purple-700 text-white shadow-md shadow-purple-200'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>{tr("🔬 NFS ආනයන ලැබ් පරීක්ෂණ Dashboard", "🔬 NFS Import Lab Quality Tracker", "🔬 தேசிய உர செயலக ஆய்வக பரிசோதனை")}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: 3D DISTRICT BUFFER STOCK MAP & REGIONAL TELEMETRY */}
      {/* ========================================================================= */}
      {activeMainTab === 'district_map' && (
        <div className="space-y-6">
          {/* National Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Buffer Stock</span>
              <span className="text-2xl font-black text-blue-900">{nationalStats.buffer.toLocaleString()} MT</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Districts on Alert</span>
              <span className="text-2xl font-black text-rose-600">{nationalStats.alerts}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Colombo Port</span>
              <div className="flex items-center space-x-1">
                <Truck className="w-5 h-5 text-indigo-500" />
                <span className="text-2xl font-black text-indigo-900">{nationalStats.vessels} Incoming</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Supply Adequacy</span>
              <span className="text-2xl font-black text-emerald-600">{nationalStats.adequacy}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: 3D Interactive Map */}
            <div className="lg:col-span-8 space-y-4">
              <div className="clean-card p-6 border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Rotate3d className="w-5 h-5 text-blue-700" />
                    <h3 className="text-slate-900 font-black text-sm sm:text-base">
                      {tr("ශ්‍රී ලංකා ත්‍රිමාණ භූගෝලීය ආකෘතිය (WebGL 3D Island Map)", "Sri Lanka 3D Terrain Model", "இலங்கை 3D மாதிரி")}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {tr("මවුසයෙන් කරකවා දිස්ත්‍රික්කය තෝරන්න", "Drag to rotate & click pin to inspect", "சுழற்றி பார்க்கவும்")}
                  </span>
                </div>

                {/* 3D Map Viewport */}
                <div className="w-full h-80 sm:h-[420px] bg-slate-950 rounded-2xl overflow-hidden relative shadow-inner">
                  <ThreeSriLankaMap onSelectDistrict={(dist) => setSelectedDistrictName(dist.name)} />

                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 flex items-center space-x-2 shadow-md animate-fadeIn">
                    <span className={`w-2.5 h-2.5 rounded-full animate-ping ${selectedData.risk_level === 'high' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                    <span>
                      තෝරාගත් දිස්ත්‍රික්කය: <strong className="text-slate-900 font-black">{selectedData.name_si} ({selectedDistrictName})</strong>
                    </span>
                  </div>
                </div>

                {/* Zone Filter Tabs */}
                <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 flex items-center space-x-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>කලාපය:</span>
                  </span>
                  {[
                    { id: 'all', label: 'All', cat: 'all' },
                    { id: 'dry', label: 'Dry Zone', cat: 'dry' },
                    { id: 'intermediate', label: 'Inter', cat: 'intermediate' },
                    { id: 'upcountry', label: 'Upcountry', cat: 'upcountry' },
                    { id: 'wet', label: 'Wet Zone', cat: 'wet' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedZoneFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedZoneFilter === f.id
                          ? getBadgeColor(f.cat) + ' border-transparent ring-2 ring-offset-1 shadow-md'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedZoneFilter('critical')}
                    className={`ml-auto px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1 ${
                      selectedZoneFilter === 'critical'
                        ? 'bg-rose-600 text-white border-transparent ring-2 ring-rose-400 shadow-md'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    <span>Critical Only</span>
                  </button>
                </div>

                {/* District Selection Chips */}
                <div className="mt-3 flex overflow-x-auto gap-2 pb-2 scrollbar-thin">
                  {filteredDistricts.map(key => {
                    const d = DISTRICT_DETAILS[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedDistrictName(key)}
                        className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border flex items-center space-x-2 transition-all ${
                          selectedDistrictName === key
                            ? 'bg-blue-50 border-blue-600 text-blue-950 ring-1 ring-blue-500 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${d.risk_level === 'high' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                        <span>{d.name_si}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rail Logistics Bar */}
              <div className="clean-card p-5 border-blue-200 bg-gradient-to-r from-blue-50/50 via-white to-cyan-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🚆</span>
                  <div>
                    <strong className="text-sm font-black text-slate-900 block">
                      හුනුපිටිය මධ්‍යම ගබඩාව - ජාතික පොහොර ප්‍රවාහන දුම්රිය මාර්ග ජාලය
                    </strong>
                    <span className="text-xs text-slate-600">
                      හුනුපිටිය සිට සීප්පුකුලම, බිඳුනුවැව, තඹුත්තේගම හා හිඟුරක්ගොඩ මධ්‍යම ගබඩා වෙත දිනපතා දුම්රිය මඟින් තොග ප්‍රවාහනය කෙරේ.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerRebalance}
                  className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-black shadow transition-all flex items-center space-x-1.5 flex-shrink-0"
                >
                  <Truck className="w-4 h-4" />
                  <span>{rebalanceTriggered ? "සංචිත හුවමාරු කෙරේ... ✓" : "අතිරික්ත සංචිත හුවමාරුව"}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Selected District Intel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="clean-card p-6 border-slate-200 bg-white space-y-4 shadow-lg transition-all" key={selectedDistrictName}>
                <div className="border-b border-slate-100 pb-3 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider block">
                      District Agrarian Telemetry
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">
                      {selectedData.name_si} ({selectedDistrictName})
                    </h3>
                    <span className="text-xs text-slate-500 font-bold block">{selectedData.zone}</span>
                  </div>
                  <div className={`p-2 rounded-xl text-center ${selectedData.risk_level === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    <span className="block text-[10px] uppercase font-bold">Status</span>
                    <span className="block font-black text-sm">{selectedData.risk_level === 'high' ? 'ALERT' : 'SAFE'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative overflow-hidden">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>බෆර් සංචිතය (Stock Level):</span>
                    <span className="text-base font-black text-blue-900">{selectedData.buffer_mt.toLocaleString()} MT</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full transition-all ${getStockColor(selectedData.stock_pct)}`}
                      style={{ width: selectedData.stock_pct + '%' }} 
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>ප්‍රශස්ත ධාරිතාවෙන්: {selectedData.stock_pct}%</span>
                    <span className={selectedData.risk_level === 'high' ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                      {selectedData.risk}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                    <span className="text-slate-500 font-bold block">ප්‍රධාන වගා ක්ෂේත්‍රය:</span>
                    <strong className="text-slate-900 font-black block mt-0.5 flex items-center"><Layers className="w-3.5 h-3.5 mr-1 text-amber-600"/> {selectedData.top_crop}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                    <span className="text-slate-500 font-bold block">ප්‍රධාන ගොවිජන සේවා (ASC) මධ්‍යස්ථානය:</span>
                    <strong className="text-slate-900 font-black block mt-0.5 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-blue-600"/> {selectedData.asc_hub}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-1">
                    <span className="text-slate-500 font-bold block">Weather Zone:</span>
                    <strong className="text-slate-900 font-black block mt-0.5 flex items-center"><Droplets className="w-3.5 h-3.5 mr-1 text-cyan-500"/> {selectedData.weather}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-1">
                    <span className="text-slate-500 font-bold block">Officer Contact:</span>
                    <strong className="text-slate-900 font-black block mt-0.5 flex items-center"><Radio className="w-3.5 h-3.5 mr-1 text-indigo-500"/> {selectedData.contact}</strong>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border text-xs space-y-1 relative overflow-hidden ${
                  selectedData.risk_level === 'high'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}>
                  <div className={`absolute top-0 left-0 w-1 h-full ${selectedData.risk_level === 'high' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                  <strong className="font-black block ml-2">
                    {selectedData.risk_level === 'high' ? '⚠️ ක්ෂණික සහන පියවර:' : '✓ Recommended Action:'}
                  </strong>
                  <p className="leading-relaxed ml-2">
                    {selectedData.risk_level === 'high'
                      ? 'යාපනය දිස්ත්‍රික්කයේ තොග 35% දක්වා පහළ බැස ඇත. අනුරාධපුර සීප්පුකුලම හෝ තඹුත්තේගම මධ්‍යම ගබඩාවෙන් පොහොර මෙට්‍රික් ටොන් 3,000 ක් වහාම මුදාහරින්න.'
                      : `ප්‍රශස්ත සංචිත මට්ටමක් පවතී. ${selectedData.name_si} දිස්ත්‍රික්කයේ කන්නය සඳහා සහනාධාර පොහොර බෙදාහැරීම සාමාන්‍ය පරිදි සිදුවේ.`}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CCF & LAKPOHORA STATE WAREHOUSE NETWORK DIRECTORY */}
      {/* ========================================================================= */}
      {activeMainTab === 'warehouse_network' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="clean-card p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-4xl space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <Building2 className="w-3.5 h-3.5" />
                <span>රාජ්‍ය පොහොර සමාගම් ගබඩා ජාලය (State Store Directory)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {tr("කොළඹ කොමර්ෂල් පොහොර සමාගම (CCF) හා ලක්පොහොර ගබඩා ජාලය", "Colombo Commercial Fertilizers & Ceylon Fertilizer Co. Depots", "கொழும்பு வர்த்தக உரம் & லாக்பொஹோர களஞ்சியங்கள்")}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                {tr(
                  "හුනුපිටිය මධ්‍යම ගබඩා සංකීර්ණය සහ දිවයින පුරා පිහිටි ප්‍රාදේශීය ගබඩා ජාලයන් (සීප්පුකුලම, නිකවැරටිය, මහනුවර, බදුල්ල, තඹුත්තේගම ආදී) හි පවතින සත්‍ය පොහොර සංචිත, ධාරිතාව සහ ගොවීන්ට තොග ලබාගත හැකි ආකාරය.",
                  "Real-time stock availability, capacity, and agrarian contact directory across Hunupitiya central hub and regional depots (Seeppukulama, Nikaweratiya, Kandy, Badulla, etc.).",
                  "ஹுனுபிட்டிய மத்திய களஞ்சியம் மற்றும் பிராந்திய களஞ்சிய சாலைகளின் நேரடி கையிருப்பு தகவல்கள்."
                )}
              </p>
            </div>
          </div>

          {/* Search & Entity Filter */}
          <div className="clean-card p-4 bg-white border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={warehouseSearch}
                onChange={(e) => setWarehouseSearch(e.target.value)}
                placeholder="ගබඩාව, නගරය හෝ දිස්ත්‍රික්කය සොයන්න (උදා: සීප්පුකුලම, නිකවැරටිය, හුනුපිටිය, බදුල්ල)..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500">ආයතනය:</span>
              <button
                type="button"
                onClick={() => setWarehouseEntityFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  warehouseEntityFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                සියල්ල ({warehouses.length})
              </button>
              <button
                type="button"
                onClick={() => setWarehouseEntityFilter('CCF')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  warehouseEntityFilter === 'CCF'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                CCF පමණි
              </button>
              <button
                type="button"
                onClick={() => setWarehouseEntityFilter('LAKPOHORA')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  warehouseEntityFilter === 'LAKPOHORA'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                ලක්පොහොර
              </button>
            </div>
          </div>

          {/* Warehouses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWarehouses.map((wh) => (
              <div 
                key={wh.id}
                className="clean-card p-5 bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      wh.type === 'CENTRAL_HUB'
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : 'bg-blue-100 text-blue-900 border border-blue-200'
                    }`}>
                      {wh.type === 'CENTRAL_HUB' ? '★ ජාතික මධ්‍යම හබ්' : 'ප්‍රාදේශීය ඩිපෝව'}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                      {wh.status === 'OPERATIONAL_DISPATCHING' ? '✓ බෙදාහැරීම් සක්‍රියයි' : wh.status}
                    </span>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {wh.name_si}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      {wh.town} | {wh.district} දිස්ත්‍රික්කය ({wh.province} පළාත)
                    </p>
                    <span className="text-[11px] font-bold text-teal-800 block mt-1">
                      🏛️ {wh.operating_entity}
                    </span>
                  </div>

                  {/* Stock Bar */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-600">පවතින සම්පූර්ණ තොග:</span>
                      <strong className="text-sm font-black text-slate-900">
                        {wh.current_stock.total_mt.toLocaleString()} MT
                      </strong>
                    </div>

                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          wh.current_stock.utilization_pct > 80 ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, wh.current_stock.utilization_pct)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                      <span>ධාරිතාව: {wh.capacity_mt.toLocaleString()} MT</span>
                      <span className="font-bold text-emerald-700">පිරී ඇත: {wh.current_stock.utilization_pct}%</span>
                    </div>

                    {/* Breakdown Chips */}
                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-200 text-center">
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-500 block">යූරියා</span>
                        <strong className="text-[11px] font-black text-blue-900">{wh.current_stock.urea_mt} MT</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-500 block">TSP</span>
                        <strong className="text-[11px] font-black text-amber-900">{wh.current_stock.tsp_mt} MT</strong>
                      </div>
                      <div className="bg-white p-1 rounded border border-slate-200">
                        <span className="text-[9px] text-slate-500 block">MOP</span>
                        <strong className="text-[11px] font-black text-rose-900">{wh.current_stock.mop_mt} MT</strong>
                      </div>
                    </div>
                  </div>

                  {/* Serving ASCs */}
                  <div className="text-xs space-y-1">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      📍 සේවා සපයන ගොවිජන සේවා (ASC) මධ්‍යස්ථාන:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {wh.linked_ascs.map((asc, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                          {asc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Railway Link Badge */}
                  {wh.railway_siding && (
                    <div className="p-2 bg-blue-50/70 rounded-lg border border-blue-200 text-[11px] font-bold text-blue-900 flex items-center space-x-1.5">
                      <span>🚆</span>
                      <span>දුම්රිය මාර්ග සැපයුම් සම්බන්ධතාවය සහිතයි</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${wh.phone.split('/')[0].trim()}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-black transition-all flex items-center justify-center space-x-1 border border-slate-200"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{wh.phone.split('/')[0].trim()}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedWarehouseModal(wh)}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-sm flex items-center space-x-1"
                  >
                    <span>විස්තර</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredWarehouses.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <span className="text-3xl">🔍</span>
              <h4 className="text-sm font-bold text-slate-700">ගබඩා හමු නොවීය</h4>
              <p className="text-xs text-slate-500">කරුණාකර සෙවුම් වචනය වෙනස් කර නැවත උත්සාහ කරන්න.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: NFS IMPORT LAB QUALITY TESTING & CLEARANCE DASHBOARD */}
      {/* ========================================================================= */}
      {activeMainTab === 'nfs_lab_clearance' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="clean-card p-6 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-4xl space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-400/30">
                <FlaskConical className="w-3.5 h-3.5" />
                <span>1988 අංක 68 දරන පොහොර නියාමන පනත හා SLSI 644 (2026) ප්‍රමිතිය</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {tr("ජාතික පොහොර ලේකම් කාර්යාලය (NFS) - ආනයන ලැබ් පරීක්ෂණ Dashboard", "National Fertilizer Secretariat - Import Lab Quality Clearance", "தேசிய உர செயலக இறக்குமதி ஆய்வக பரிசோதனை")}
              </h2>
              <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
                {tr(
                  "කොළඹ හා ත්‍රිකුණාමලය වරායන් වෙත පැමිණෙන සෑම පොහොර නෞකාවක්ම ගොඩබෑමට පෙර හා පසු ITI (කාර්මික තාක්ෂණ ආයතනය), SLSI හා හෝර්ඩි (HORDI) මගින් බැර ලෝහ (Cadmium, Lead, Arsenic), Biuret හා පෝෂක මට්ටම් පරීක්ෂා කර නිකුත් කරන ලද නිල තත්ත්ව සහතික.",
                  "Official statutory quarantine and laboratory test clearance registry verifying heavy metals compliance (SLSI 644) before port release.",
                  "இலங்கை தர நிர்ணய நிறுவனம் மற்றும் ஐ.ரி.ஐ நிறுவனங்களின் உத்தியோகபூர்வ ஆய்வக அனுமதி பதிவுகள்."
                )}
              </p>
            </div>
          </div>

          {/* Audit Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">පරීක්ෂා කළ මුළු තොගය</span>
              <span className="text-2xl font-black text-purple-900">89,500 MT</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">අනුමත කර නිදහස් කළ</span>
              <span className="text-2xl font-black text-emerald-600">2 Consignments</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">නිරෝධායන පරීක්ෂණ මට්ටමේ</span>
              <span className="text-2xl font-black text-amber-600">1 Consignment</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">ප්‍රතික්ෂේප කළ විෂ තොග</span>
              <span className="text-2xl font-black text-rose-600">1 Rejected</span>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'සියලුම තොග (All)' },
              { id: 'APPROVED_RELEASED', label: '✓ නියැදි සමත් - නිදහස් කළ (Released)' },
              { id: 'UNDER_TESTING_QUARANTINE', label: '⏳ ලැබ් පරීක්ෂණ මට්ටමේ (Quarantined)' },
              { id: 'REJECTED_QUARANTINED', label: '🚨 ප්‍රමිතියෙන් තොර - ප්‍රතික්ෂේප කළ (Rejected)' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setLabFilter(f.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  labFilter === f.id
                    ? 'bg-purple-900 text-white border-purple-900 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Consignment Cards */}
          <div className="space-y-4">
            {filteredLabClearances.map(c => {
              const isApproved = c.clearance_status === 'APPROVED_RELEASED';
              const isTesting = c.clearance_status === 'UNDER_TESTING_QUARANTINE';
              const isRejected = c.clearance_status === 'REJECTED_QUARANTINED';

              return (
                <div 
                  key={c.consignment_id}
                  className={`clean-card p-6 bg-white border-2 space-y-4 shadow-md ${
                    isApproved ? 'border-emerald-300' : isTesting ? 'border-amber-300' : 'border-rose-400 bg-rose-50/20'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🚢</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-black text-slate-900">{c.vessel_name}</h3>
                          <span className="text-xs font-mono font-bold text-slate-500">({c.imo_number})</span>
                        </div>
                        <span className="text-xs text-slate-600 block mt-0.5">
                          නියැදි අංකය: <strong className="font-mono text-purple-900">{c.consignment_id}</strong> | ආනයනකරු: <strong>{c.importer}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : isTesting
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-rose-600 text-white border-rose-700 animate-pulse'
                      }`}>
                        {isApproved ? '✓ නියැදි සමත් - බෙදාහැරීමට අනුමතයි' : isTesting ? '⏳ විද්‍යාගාර පරීක්ෂණ මට්ටමේ' : '🚨 ප්‍රතික්ෂේප කළ තොගයකි'}
                      </span>
                    </div>
                  </div>

                  {/* Consignment Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block">පොහොර වර්ගය:</span>
                      <strong className="text-slate-900 font-bold">{c.commodity}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">පැමිණි වරාය:</span>
                      <strong className="text-slate-900 font-bold">{c.port_of_entry}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">තොග ප්‍රමාණය:</span>
                      <strong className="text-slate-900 font-bold">{c.tonnage_mt.toLocaleString()} MT ({c.origin_country})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">පරීක්ෂා කළ ආයතනය:</span>
                      <strong className="text-purple-900 font-bold">{c.testing_laboratory}</strong>
                    </div>
                  </div>

                  {/* Lab Test Results Table */}
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Award className="w-3.5 h-3.5 text-purple-600" />
                      <span>විද්‍යාගාර පරීක්ෂණ ප්‍රතිඵල (SLSI 644 ප්‍රමිතියට අනුකූලතාවය):</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {Object.entries(c.test_parameters).map(([key, param]) => (
                        <div 
                          key={key}
                          className={`p-2.5 rounded-xl border text-center ${
                            param.compliant
                              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                              : 'bg-rose-100 border-rose-300 text-rose-950 font-bold'
                          }`}
                        >
                          <span className="text-[10px] text-slate-500 block capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <strong className="text-xs font-black block mt-0.5">
                            {param.value} {typeof param.value === 'number' && key.includes('pct') ? '%' : key.includes('mg_kg') ? 'mg/kg' : ''}
                          </strong>
                          <span className="text-[9px] block text-slate-500 mt-0.5">
                            සීමාව: {param.standard_limit}
                          </span>
                          <span className={`text-[9px] font-black block mt-1 ${param.compliant ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {param.compliant ? '✓ PASS' : '✗ FAIL'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statutory Order */}
                  <div className={`p-3 rounded-xl border text-xs ${
                    isApproved ? 'bg-slate-50 border-slate-200 text-slate-700' : isTesting ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-100 border-rose-300 text-rose-950'
                  }`}>
                    <strong>නීතිමය නියෝගය හා ක්‍රියාමාර්ගය: </strong>
                    <span>{c.statutory_order}</span>
                    <div className="mt-1 flex items-center space-x-4 text-[11px] text-slate-500 font-mono">
                      <span>සහතික අංකය: {c.clearance_certificate_no}</span>
                      <span>වාර්තා අංකය: {c.test_report_number}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WAREHOUSE DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedWarehouseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                  State Fertilizer Depot Profile
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  {selectedWarehouseModal.name_si}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedWarehouseModal.operating_entity}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWarehouseModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-black text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div><strong>ලිපිනය:</strong> {selectedWarehouseModal.address}</div>
                <div><strong>නිලධාරී:</strong> {selectedWarehouseModal.contact_officer}</div>
                <div><strong>දුරකථනය:</strong> <a href={`tel:${selectedWarehouseModal.phone}`} className="text-blue-700 font-bold underline">{selectedWarehouseModal.phone}</a></div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-1">ගොවීන්ට තොග ලබාගැනීමේ ක්‍රමවේදය:</h4>
                <p className="text-slate-600 leading-relaxed">
                  අදාළ ගොවිජන සේවා මධ්‍යස්ථානය (ASC) මඟින් නිකුත් කරන ලද සහනාධාර කූපනය සහ ජාතික හැඳුනුම්පත ඉදිරිපත් කර මෙම ගබඩාවෙන් සෘජුවම සහනාධාර පොහොර මිටි ලබාගත හැක.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                <strong className="block font-black">සටහන:</strong>
                <p>{selectedWarehouseModal.notes}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedWarehouseModal(null)}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              වසන්න (Close)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
