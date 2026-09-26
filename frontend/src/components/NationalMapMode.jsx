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
  Radio
} from 'lucide-react';
import ThreeSriLankaMap from './ThreeSriLankaMap';

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
    asc_hub: "තඹුත්තේගම ප්‍රධාන ගබඩාව",
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
    asc_hub: "වාරියපොළ ගබඩා සංකීර්ණය",
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
    asc_hub: "තිරුනෙල්වේලි කෘෂි මධ්‍යස්ථානය",
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
    asc_hub: "මහියංගනය කෘෂි ඩිපෝව",
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
    name_si: "කොළඹ වරාය (ජාතික හබ්)", 
    zone: "Import Maritime Hub", 
    zone_category: "hub",
    buffer_mt: 120000, 
    stock_pct: 95, 
    risk: "ප්‍රධාන නැව්ගත සංචිතය", 
    risk_level: "hub",
    top_crop: "ජාතික බෙදාහැරීමේ මධ්‍යස්ථානය",
    asc_hub: "NFS පෑලියගොඩ ප්‍රධාන සංකීර්ණය",
    weather: "29°C, Humid",
    contact: "011-2227788 (NFS Colombo)",
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

export default function NationalMapMode({ language = 'si' }) {
  const tr = (si, en, ta) => {
    if (language === 'ta') return ta || en || si;
    if (language === 'en') return en || si;
    return si;
  };

  const [selectedDistrictName, setSelectedDistrictName] = useState("Anuradhapura");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState("all");
  const [rebalanceTriggered, setRebalanceTriggered] = useState(false);
  const [nationalStats, setNationalStats] = useState({ buffer: 0, alerts: 0, vessels: 0, adequacy: 0 });

  useEffect(() => {
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

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      
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
                      : getBadgeColor(f.cat) + ' opacity-70 hover:opacity-100'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <button 
                  onClick={() => setSelectedZoneFilter('critical')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ml-auto flex items-center space-x-1 ${selectedZoneFilter === 'critical' ? 'bg-rose-600 text-white shadow-md' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'}`}
              >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Critical Only</span>
              </button>
            </div>

            {/* District Horizontal Scroll Strip */}
            <div className="mt-4 overflow-x-auto pb-2 flex gap-3 hide-scrollbar">
              {filteredDistricts.map(name => {
                  const dist = DISTRICT_DETAILS[name];
                  const isSelected = selectedDistrictName === name;
                  return (
                      <button
                          key={name}
                          type="button"
                          onClick={() => setSelectedDistrictName(name)}
                          className={`flex-shrink-0 min-w-[140px] p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                  ? 'bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-500/20 transform scale-[1.02]'
                                  : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                      >
                          <div className="flex justify-between items-start mb-1">
                              <strong className="text-xs font-black text-slate-800">{dist.name_si}</strong>
                              <span className={`w-2 h-2 rounded-full ${getStockColor(dist.stock_pct)}`}></span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mb-2">{name}</span>
                          <div className="flex items-end justify-between">
                              <div className="w-full bg-slate-200 h-1.5 rounded-full mr-2">
                                  <div className={`h-1.5 rounded-full ${getStockColor(dist.stock_pct)}`} style={{width: dist.stock_pct + '%'}}></div>
                              </div>
                              <span className="text-[10px] font-bold">{dist.stock_pct}%</span>
                          </div>
                          <div className="mt-2 flex items-center space-x-1 text-[10px] text-slate-500">
                              {dist.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingUp className="w-3 h-3 text-rose-500 transform rotate-180" />}
                              <span>{dist.buffer_mt} MT</span>
                          </div>
                      </button>
                  )
              })}
            </div>

          </div>

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
          
          <div className="clean-card p-6 border-slate-200 bg-white space-y-4 shadow-lg transition-all animate-slideInRight" key={selectedDistrictName}>
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
                <span className="text-slate-500 font-bold block">ප්‍රධාන ගොවිජන සේවා (ASC):</span>
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
                  ? 'යාපනය දිස්ත්‍රික්කයේ තොග 54% දක්වා පහළ බැස ඇත. අනුරාධපුර මධ්‍යම ගබඩාවෙන් පොහොර මෙට්‍රික් ටොන් 3,000 ක් වහාම මුදාහරින්න.'
                  : `Maintain current distribution flow. ${selectedData.name_si} district has adequate reserves for the upcoming season.`}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
