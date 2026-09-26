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
  Activity
} from 'lucide-react';
import ThreeSriLankaMap from './ThreeSriLankaMap';

const DISTRICT_DETAILS = {
  "Anuradhapura": { name_si: "අනුරාධපුරය", zone: "Dry Zone (වියළි)", buffer_mt: 38500, stock_pct: 82, risk: "අවම (Low Risk)", top_crop: "වී වගාව (Paddy)" },
  "Polonnaruwa": { name_si: "පොලොන්නරුව", zone: "Dry Zone (වියළි)", buffer_mt: 32000, stock_pct: 88, risk: "අවම (Low Risk)", top_crop: "වී වගාව (Paddy)" },
  "Ampara": { name_si: "අම්පාර", zone: "Dry Zone (වියළි)", buffer_mt: 29500, stock_pct: 64, risk: "මධ්‍යම (Moderate)", top_crop: "වී සහ බඩඉරිඟු" },
  "Kurunegala": { name_si: "කුරුණෑගල", zone: "Intermediate (අතරමැදි)", buffer_mt: 41000, stock_pct: 75, risk: "අවම (Low Risk)", top_crop: "පොල් සහ වී" },
  "Jaffna": { name_si: "යාපනය", zone: "Dry Zone (වියළි)", buffer_mt: 18500, stock_pct: 54, risk: "අවදානම් (High Risk)", top_crop: "රතුලූනු, මිරිස්" },
  "Nuwara Eliya": { name_si: "නුවරඑළිය", zone: "Upcountry Wet", buffer_mt: 24000, stock_pct: 91, risk: "අවම (Low Risk)", top_crop: "උඩරට එළවළු, අල" },
  "Badulla": { name_si: "බදුල්ල", zone: "Upcountry Intermediate", buffer_mt: 21000, stock_pct: 79, risk: "අවම (Low Risk)", top_crop: "තේ සහ එළවළු" },
  "Hambantota": { name_si: "හම්බන්තොට", zone: "Dry Zone (වියළි)", buffer_mt: 23500, stock_pct: 70, risk: "අවම (Low Risk)", top_crop: "වී සහ කෙසෙල්" },
  "Colombo Port": { name_si: "කොළඹ වරාය (ප්‍රධාන හබ්)", zone: "Import Maritime Hub", buffer_mt: 120000, stock_pct: 95, risk: "නැව්ගත මධ්‍යස්ථානය", top_crop: "ජාතික බෙදාහැරීම" },
  "Ratnapura": { name_si: "රත්නපුර", zone: "Wet Zone (තෙත්)", buffer_mt: 19500, stock_pct: 84, risk: "අවම (Low Risk)", top_crop: "තේ සහ රබර්" }
};

export default function NationalMapMode({ language = 'si' }) {
  const [selectedDistrictName, setSelectedDistrictName] = useState("Anuradhapura");

  const selectedData = DISTRICT_DETAILS[selectedDistrictName] || DISTRICT_DETAILS["Anuradhapura"];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-blue-800/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold mb-3">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Geospatial 3D Island Buffer & Supply Stream</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              ජාතික පොහොර සැපයුම් <span className="text-blue-400">3D සහන සිතියම</span>
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              ශ්‍රී ලංකාවේ දිස්ත්‍රික්ක 25 හි බෆර් තොග සංචිත, කොළඹ වරායේ සිට ප්‍රධාන කෘෂිකාර්මික කලාප වෙත ප්‍රවාහන මාර්ග සහ හිඟතා අවදානම් තත්ත්‍වය.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              ජාතික සංචිතය: 387,000 MT
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 3D Map Canvas */}
        <div className="lg:col-span-8 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Rotate3d className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-bold text-sm sm:text-base">ශ්‍රී ලංකා ත්‍රිමාණ භූගෝලීය ආකෘතිය (WebGL 3D)</h3>
            </div>
            <span className="text-xs text-slate-400">Mouse මඟින් 3D කරකවන්න</span>
          </div>

          <div className="w-full h-96 sm:h-[480px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner">
            <ThreeSriLankaMap onSelectDistrict={(dist) => setSelectedDistrictName(dist.name)} />

            {/* Floating indicator */}
            <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>සක්‍රිය දිස්ත්‍රික්කය: <strong className="text-white">{selectedData.name_si} ({selectedDistrictName})</strong></span>
            </div>
          </div>

          {/* Quick District selector pills */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {Object.keys(DISTRICT_DETAILS).map(name => (
              <button
                key={name}
                onClick={() => setSelectedDistrictName(name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  selectedDistrictName === name
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {DISTRICT_DETAILS[name].name_si}
              </button>
            ))}
          </div>
        </div>

        {/* Right District Profile Details */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-5">
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">දිස්ත්‍රික් විස්තරය:</span>
              <h2 className="text-2xl font-black text-white">{selectedData.name_si}</h2>
              <span className="text-xs text-slate-400 block">{selectedData.zone}</span>
            </div>

            {/* Stock Level Bar */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">බෆර් තොග මට්ටම:</span>
                <span className="font-bold text-white">{selectedData.stock_pct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${selectedData.stock_pct > 70 ? 'bg-emerald-500' : (selectedData.stock_pct > 50 ? 'bg-amber-500' : 'bg-rose-500')}`}
                  style={{ width: `${selectedData.stock_pct}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>පවතින තොගය:</span>
                <strong className="text-emerald-400">{selectedData.buffer_mt?.toLocaleString()} MT</strong>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">හිඟතා අවදානම:</span>
                <strong className={selectedData.risk.includes('අවම') ? "text-emerald-400" : "text-amber-400"}>{selectedData.risk}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">ප්‍රධාන බෝගය:</span>
                <strong className="text-white">{selectedData.top_crop}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">වරාය සිට ප්‍රවාහනය:</span>
                <strong className="text-blue-400">දුම්රිය + ලොරි රථ (Direct Vector)</strong>
              </div>
            </div>

            {/* Supply Vector Details */}
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 leading-relaxed">
              <strong className="block mb-1 text-white">සැපයුම් ජාල ආරක්ෂණය:</strong>
              කොළඹ වරායේ සිට {selectedData.name_si} දක්වා භාණ්ඩ ප්‍රවාහන දුම්රිය මඟින් දින 2ක් තුළ පොහොර මෙට්‍රික් ටොන් 1,200 ක් රැගෙන යාමේ හැකියාව ඇත.
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
