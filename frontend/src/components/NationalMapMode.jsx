import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import ThreeSriLankaMap from './ThreeSriLankaMap';

const DISTRICT_DETAILS = {
  "Anuradhapura": { 
    name_si: "අනුරාධපුරය", 
    name_ta: "அனுராதபுரம்",
    zone: "Dry Zone (වියළි කලාපය)", 
    zone_category: "dry",
    buffer_mt: 38500, 
    stock_pct: 82, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "වී වගාව (Paddy) - හෙක්ටයාර 125,000",
    asc_hub: "තඹුත්තේගම ප්‍රධාන ගබඩාව"
  },
  "Polonnaruwa": { 
    name_si: "පොලොන්නරුව", 
    name_ta: "பொலன்னறுவை",
    zone: "Dry Zone (වියළි කලාපය)", 
    zone_category: "dry",
    buffer_mt: 32000, 
    stock_pct: 88, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "වී වගාව (Paddy) - පරාක්‍රම සමුද්‍ර කලාපය",
    asc_hub: "හිඟුරක්ගොඩ මධ්‍යම සංචිතය"
  },
  "Ampara": { 
    name_si: "අම්පාර", 
    name_ta: "அம்பாறை",
    zone: "Dry Zone (වියළි කලාපය)", 
    zone_category: "dry",
    buffer_mt: 29500, 
    stock_pct: 64, 
    risk: "මධ්‍යම (Moderate Risk)", 
    risk_level: "moderate",
    top_crop: "වී සහ බඩඉරිඟු (Maize)",
    asc_hub: "උහන ගොවිජන සේවා මධ්‍යස්ථානය"
  },
  "Kurunegala": { 
    name_si: "කුරුණෑගල", 
    name_ta: "குருநாகல்",
    zone: "Intermediate (අතරමැදි කලාපය)", 
    zone_category: "intermediate",
    buffer_mt: 41000, 
    stock_pct: 75, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "පොල් සහ වී වගාව",
    asc_hub: "වාරියපොළ ගබඩා සංකීර්ණය"
  },
  "Jaffna": { 
    name_si: "යාපනය", 
    name_ta: "யாழ்ப்பாணம்",
    zone: "Dry Zone (වියළි කලාපය)", 
    zone_category: "dry",
    buffer_mt: 18500, 
    stock_pct: 54, 
    risk: "අධි අවදානම් (Deficit Risk)", 
    risk_level: "high",
    top_crop: "රතුලූනු, මිරිස්, දුම්කොළ",
    asc_hub: "තිරුනෙල්වේලි කෘෂි මධ්‍යස්ථානය"
  },
  "Nuwara Eliya": { 
    name_si: "නුවරඑළිය", 
    name_ta: "நுவரெலியா",
    zone: "Upcountry Wet (උඩරට තෙත්)", 
    zone_category: "upcountry",
    buffer_mt: 24000, 
    stock_pct: 91, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "උඩරට එළවළු (කැරට්, ලීක්ස්, අර්තාපල්)",
    asc_hub: "සීතාඑළිය ප්‍රධාන ගබඩාව"
  },
  "Badulla": { 
    name_si: "බදුල්ල", 
    name_ta: "பதுளை",
    zone: "Upcountry Intermediate", 
    zone_category: "upcountry",
    buffer_mt: 21000, 
    stock_pct: 79, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "තේ, බඩඉරිඟු සහ එළවළු",
    asc_hub: "මහියංගනය කෘෂි ඩිපෝව"
  },
  "Hambantota": { 
    name_si: "හම්බන්තොට", 
    name_ta: "அம்பாந்தோட்டை",
    zone: "Dry Zone (වියළි කලාපය)", 
    zone_category: "dry",
    buffer_mt: 23500, 
    stock_pct: 70, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "වී සහ කෙසෙල් වගාව",
    asc_hub: "අම්බලන්තොට කෘෂි පර්යේෂණාගාරය"
  },
  "Colombo Port": { 
    name_si: "කොළඹ වරාය (ජාතික හබ්)", 
    name_ta: "கொழும்பு துறைமுகம்",
    zone: "Import Maritime Hub", 
    zone_category: "hub",
    buffer_mt: 120000, 
    stock_pct: 95, 
    risk: "ප්‍රධාන නැව්ගත සංචිතය", 
    risk_level: "hub",
    top_crop: "ජාතික බෙදාහැරීමේ මධ්‍යස්ථානය",
    asc_hub: "NFS පෑලියගොඩ ප්‍රධාන සංකීර්ණය"
  },
  "Ratnapura": { 
    name_si: "රත්නපුර", 
    name_ta: "இரத்தினபுரி",
    zone: "Wet Zone (තෙත් කලාපය)", 
    zone_category: "wet",
    buffer_mt: 19500, 
    stock_pct: 84, 
    risk: "අවම (Low Risk)", 
    risk_level: "low",
    top_crop: "තේ සහ රබර් වගාව",
    asc_hub: "ඇහැලියගොඩ ගොවිජන සේවා"
  }
};

export default function NationalMapMode({ language = 'si' }) {
  // Trilingual Text Helper
  const tr = (si, en, ta) => {
    if (language === 'ta') return ta || en || si;
    if (language === 'en') return en || si;
    return si;
  };

  const [selectedDistrictName, setSelectedDistrictName] = useState("Anuradhapura");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState("all");
  const [rebalanceTriggered, setRebalanceTriggered] = useState(false);

  const selectedData = DISTRICT_DETAILS[selectedDistrictName] || DISTRICT_DETAILS["Anuradhapura"];

  const filteredDistricts = Object.keys(DISTRICT_DETAILS).filter(key => {
    if (selectedZoneFilter === "all") return true;
    return DISTRICT_DETAILS[key].zone_category === selectedZoneFilter;
  });

  const handleTriggerRebalance = () => {
    setRebalanceTriggered(true);
    setTimeout(() => {
      setRebalanceTriggered(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      
      {/* Header Banner - Clean Geospatial Command Theme */}
      <div className="clean-card p-6 sm:p-8 bg-gradient-to-r from-blue-50 via-white to-indigo-50 border-blue-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-700 text-white flex items-center justify-center text-3xl shadow-md flex-shrink-0">
              🗺️
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-black mb-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>{tr("භූ-දත්ත ත්‍රිමාණ ජාතික සිතියම", "Geospatial 3D National Buffer Network", "தேசிய 3D வரைபடம்")}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {tr("ජාතික පොහොර සැපයුම් 3D සහන සිතියම", "National Fertilizer Supply & 3D Island Buffer Map", "தேசிய உர விநியோகம் & 3D வரைபடம்")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {tr("ශ්‍රී ලංකාවේ දිස්ත්‍රික්ක 25 හි බෆර් තොග සංචිත, කොළඹ වරායේ සිට ප්‍රධාන කෘෂිකාර්මික කලාප වෙත ප්‍රවාහන මාර්ග සහ හිඟතා අවදානම් තත්ත්‍වය.", "District-by-district 50,000 MT buffer reserves, transit streams from Colombo Port, and deficit early warnings.", "இலங்கையின் 25 மாவட்டங்களின் உர கையிருப்பு மற்றும் துறைமுக போக்குவரத்து நிலை.")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="p-3 bg-white rounded-2xl border border-blue-200 text-right shadow-xs">
              <span className="text-[10px] text-slate-400 uppercase font-black block">ජාතික සංචිතය (Total Island Buffer)</span>
              <strong className="text-base font-black text-blue-950">387,500 MT</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 3D WebGL Island Map + District Intel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: 3D Interactive Map */}
        <div className="lg:col-span-8 space-y-4">
          <div className="clean-card p-6 border-slate-200 bg-white">
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

              {/* Floating Active District Pill */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 flex items-center space-x-2 shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>
                  තෝරාගත් දිස්ත්‍රික්කය: <strong className="text-slate-900 font-black">{selectedData.name_si} ({selectedDistrictName})</strong>
                </span>
              </div>
            </div>

            {/* Zone Filter Tabs */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5" />
                <span>කලාපය:</span>
              </span>
              {[
                { id: 'all', label: 'සියල්ල (All)' },
                { id: 'dry', label: 'වියළි කලාපය (Dry)' },
                { id: 'intermediate', label: 'අතරමැදි (Inter)' },
                { id: 'upcountry', label: 'උඩරට (Upcountry)' },
                { id: 'wet', label: 'තෙත් (Wet)' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedZoneFilter(f.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedZoneFilter === f.id
                      ? 'bg-blue-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* District Quick Select Pills */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {filteredDistricts.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedDistrictName(name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedDistrictName === name
                      ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {DISTRICT_DETAILS[name].name_si}
                </button>
              ))}
            </div>

          </div>

          {/* Colombo Port Supply Freight Dispatch Banner */}
          <div className="clean-card p-5 border-blue-200 bg-gradient-to-r from-blue-50/50 via-white to-cyan-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🚢</span>
              <div>
                <strong className="text-sm font-black text-slate-900 block">
                  කොළඹ වරාය - ජාතික පොහොර ප්‍රවාහන දුම්රිය හා ලොරි පෙළපාලි
                </strong>
                <span className="text-xs text-slate-600">
                  දිනපතා රාත්‍රී දුම්රිය 4ක් මඟින් අනුරාධපුරය හා පොළොන්නරුව මධ්‍යම ගබඩා වෙත පොහොර 2,400 MT ක් ප්‍රවාහනය වේ.
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

        {/* Right Column: Selected District Intel & Deficit Risk Card */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="clean-card p-6 border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider block">
                District Agrarian Telemetry
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                {selectedData.name_si} ({selectedDistrictName})
              </h3>
              <span className="text-xs text-slate-500 font-bold block">{selectedData.zone}</span>
            </div>

            {/* Buffer Stock Gauge */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>බෆර් සංචිතය (Stock Level):</span>
                <span className="text-base font-black text-blue-900">{selectedData.buffer_mt.toLocaleString()} MT</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    selectedData.stock_pct > 75 
                      ? 'bg-emerald-600' 
                      : (selectedData.stock_pct > 60 ? 'bg-amber-500' : 'bg-rose-600')
                  }`}
                  style={{ width: `${selectedData.stock_pct}%` }} 
                />
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>ප්‍රශස්ත ධාරිතාවෙන්: {selectedData.stock_pct}%</span>
                <span className={selectedData.risk_level === 'high' ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                  {selectedData.risk}
                </span>
              </div>
            </div>

            {/* Crop & ASC Information */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-bold block">ප්‍රධාන වගා ක්ෂේත්‍රය:</span>
                <strong className="text-slate-900 font-black block mt-0.5">{selectedData.top_crop}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-bold block">ප්‍රධාන ගොවිජන සේවා (ASC) මධ්‍යස්ථානය:</span>
                <strong className="text-slate-900 font-black block mt-0.5">{selectedData.asc_hub}</strong>
              </div>
            </div>

            {/* Action Advice Card */}
            <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
              selectedData.risk_level === 'high'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <strong className="font-black block">
                {selectedData.risk_level === 'high' ? '⚠️ ක්ෂණික සහන පියවර:' : '✓ තොග සුරක්ෂිතයි:'}
              </strong>
              <p className="leading-relaxed">
                {selectedData.risk_level === 'high'
                  ? 'යාපනය දිස්ත්‍රික්කයේ තොග 54% දක්වා පහළ බැස ඇත. අනුරාධපුර මධ්‍යම ගබඩාවෙන් පොහොර මෙට්‍රික් ටොන් 3,000 ක් වහාම මුදාහරින්න.'
                  : `${selectedData.name_si} දිස්ත්‍රික්කයේ ඉදිරි කන්නය සඳහා ප්‍රමාණවත් පොහොර සංචිතයක් සුරක්ෂිතව පවතී.`}
              </p>
            </div>

          </div>

          {/* Island-wide Buffer Ranking Overview */}
          <div className="clean-card p-5 border-slate-200 bg-white space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              දිස්ත්‍රික්ක සංචිත සාරාංශය (Buffer Reserves)
            </h4>
            <div className="divide-y divide-slate-100 text-xs">
              {Object.keys(DISTRICT_DETAILS).slice(0, 5).map(dName => (
                <div 
                  key={dName} 
                  onClick={() => setSelectedDistrictName(dName)}
                  className="py-2 flex items-center justify-between cursor-pointer hover:bg-slate-50 rounded-lg px-1 transition-all"
                >
                  <span className="font-bold text-slate-800">{DISTRICT_DETAILS[dName].name_si}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">{DISTRICT_DETAILS[dName].buffer_mt.toLocaleString()} MT</span>
                    <span className={`w-2 h-2 rounded-full ${
                      DISTRICT_DETAILS[dName].stock_pct > 75 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
