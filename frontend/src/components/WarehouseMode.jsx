import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Thermometer, 
  Droplets, 
  Wind, 
  AlertTriangle, 
  CheckCircle2, 
  Rotate3d, 
  Radio, 
  Activity,
  ShieldCheck
} from 'lucide-react';
import ThreeWarehouseCanvas from './ThreeWarehouseCanvas';

const API_BASE = "http://localhost:8000";

export default function WarehouseMode({ language = 'si' }) {
  const [humidity, setHumidity] = useState(68.5);
  const [temp, setTemp] = useState(29.8);
  const [fanActive, setFanActive] = useState(false);
  const [telemetry, setTelemetry] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/inspector/warehouse-twin`)
      .then(res => res.json())
      .then(data => setTelemetry(data))
      .catch(() => {
        // Fallback default
        setTelemetry({
          warehouse_id: "WH-AP-01",
          name: "Anuradhapura Central Depot",
          location: "Anuradhapura",
          capacity_mt: 5000,
          critical_relative_humidity: 72.5
        });
      });
  }, []);

  const isCakingRisk = humidity > 72.5;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border border-amber-800/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold mb-3">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>IoT Smart Warehouse Digital Twin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              3D ඩිජිටල් නිවුන් <span className="text-amber-400">ස්මාර්ට් ගබඩා පාලනය</span>
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              අනුරාධපුර ප්‍රධාන පොහොර ගබඩාවේ 3D ආකෘතිය, තත්‍ය කාලීන උෂ්ණත්ව/ආර්ද්‍රතා සංවේදක සහ යූරියා කැට ගල්වීම (Caking) වළක්වන ස්වයංක්‍රීය වාතාශ්‍ර පද්ධතිය.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">IoT Telemetry Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 3D Isometric Warehouse View */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Rotate3d className="w-5 h-5 text-amber-400" />
              <h3 className="text-white font-bold text-sm sm:text-base">Isometric 3D ගබඩා බිම් සැලැස්ම</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
              ධාරිතාව: 5,000 MT
            </span>
          </div>

          <div className="w-full h-80 sm:h-96 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative shadow-inner">
            <ThreeWarehouseCanvas currentRH={humidity} />
            
            {/* Overlay warning if caking */}
            <div className={`absolute top-3 left-3 right-3 p-3 rounded-xl border flex items-center justify-between backdrop-blur-md ${
              isCakingRisk 
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-200' 
                : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
            }`}>
              <div className="flex items-center space-x-2 text-xs font-bold">
                {isCakingRisk ? <AlertTriangle className="w-4 h-4 text-rose-400" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                <span>
                  {isCakingRisk 
                    ? 'අන්තරායයි: සාපේක්ෂ ආර්ද්‍රතාවය 72.5% ඉක්මවා ඇත! යූරියා ගල්වීමේ (Caking) අවදානම!' 
                    : 'ආරක්ෂිතයි: ආර්ද්‍රතාවය ප්‍රශස්ත මට්ටමේ පවතී.'}
                </span>
              </div>
              <span className="text-[11px] font-black">{humidity}% RH</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            * ත්‍රිමාණ සිතියමේ කහ සහ රතු පැහැයෙන් දැක්වෙන්නේ ආර්ද්‍රතාවය අධික වීමෙන් යූරියා මිටි එකට ඇලී ගල්වීමේ අවදානමක් ඇති තොග තට්ටු (Pallet Stacks) වේ.
          </p>
        </div>

        {/* Right IoT Telemetry & Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-2xl backdrop-blur-xl space-y-5">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-amber-400" />
              <h3 className="text-white font-bold text-base">සජීවී IoT සංවේදක පුවරුව</h3>
            </div>

            {/* Relative Humidity Slider */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>සාපේක්ෂ ආර්ද්‍රතාවය (Relative Humidity):</span>
                </span>
                <span className={`text-sm font-black ${humidity > 72.5 ? 'text-rose-400' : 'text-cyan-400'}`}>{humidity}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="0.5"
                value={humidity}
                onChange={(e) => setHumidity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>40% (වියළි)</span>
                <span className="text-amber-400 font-bold">72.5% (Urea CRH Limit)</span>
                <span>95% (තෙත්)</span>
              </div>
            </div>

            {/* Temperature Slider */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>ගබඩා උෂ්ණත්වය (Temperature):</span>
                </span>
                <span className="text-sm font-black text-amber-400">{temp}°C</span>
              </div>
              <input
                type="range"
                min="18"
                max="42"
                step="0.2"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>18°C (සිසිල්)</span>
                <span>28°C (ප්‍රශස්ත)</span>
                <span>42°C (අධික රස්නය)</span>
              </div>
            </div>

            {/* HVAC Fan Actuator Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-white block">ස්වයංක්‍රීය වාතාශ්‍ර පංකා (Dehumidifier Fans):</span>
                <span className="text-[11px] text-slate-400">ආර්ද්‍රතාවය අඩු කිරීම සඳහා බලපංකා ක්‍රියාත්මක කිරීම</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFanActive(!fanActive);
                  if (!fanActive) {
                    setHumidity(Math.max(55, humidity - 12));
                  }
                }}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                  fanActive 
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30' 
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                <Wind className={`w-4 h-4 ${fanActive ? 'animate-spin' : ''}`} />
                <span>{fanActive ? 'ක්‍රියාත්මකයි' : 'අක්‍රියයි'}</span>
              </button>
            </div>

            {/* Microclimate Advice */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <strong className="text-amber-300 block">ගබඩා පාලන උපදේශය:</strong>
              <p className="leading-relaxed text-slate-400">
                යූරියා වල Critical Relative Humidity (CRH) අගය 30°C දී 72.5% කි. ආර්ද්‍රතාවය මීට වඩා වැඩි වුවහොත් කැට වාතයෙන් ජලය උරාගෙන දියවී එකට ඇලී තද ගල් බවට පත්වේ. පංකා ක්‍රියාත්මක කර ආර්ද්‍රතාවය 65% ට අඩුවෙන් පවත්වා ගන්න.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
