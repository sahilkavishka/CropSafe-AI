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
  ShieldCheck,
  Truck,
  Layers,
  Gauge,
  Power,
  RefreshCw,
  Clock,
  ArrowRight,
  XCircle,
  ShieldAlert,
  Cloudy
} from 'lucide-react';
import ThreeWarehouseCanvas from './ThreeWarehouseCanvas';

const API_BASE = "http://localhost:8000";

export default function WarehouseMode({ language = 'si' }) {
  const tr = (si, en, ta) => {
    if (language === 'ta') return ta || en || si;
    if (language === 'en') return en || si;
    return si;
  };

  const [humidity, setHumidity] = useState(68.5);
  const [temp, setTemp] = useState(29.8);
  const [fanActive, setFanActive] = useState(false);
  const [ammoniaPpm, setAmmoniaPpm] = useState(6.2);
  const [telemetry, setTelemetry] = useState(null);
  const [selectedBay, setSelectedBay] = useState('bay_a');
  const [dismissAlert, setDismissAlert] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    fetch(`${API_BASE}/api/inspector/warehouse-twin`)
      .then(res => res.json())
      .then(data => setTelemetry(data))
      .catch(() => {
        setTelemetry({
          warehouse_id: "WH-AP-01",
          name: "Anuradhapura Central Depot",
          location: "Anuradhapura",
          capacity_mt: 5000,
          critical_relative_humidity: 72.5
        });
      });

    const interval = setInterval(() => {
        setLastUpdate(new Date().toLocaleTimeString());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleFan = () => {
    const nextState = !fanActive;
    setFanActive(nextState);
    if (nextState) {
      setHumidity(prev => Math.max(58.0, Number((prev - 9.5).toFixed(1))));
      setTemp(prev => Math.max(25.5, Number((prev - 2.8).toFixed(1))));
      setAmmoniaPpm(3.8);
    } else {
      setHumidity(74.2);
      setTemp(30.4);
      setAmmoniaPpm(8.4);
    }
  };

  const isCakingRisk = humidity > 72.5;

  const bays = {
    bay_a: {
      name: tr("Bay A: ප්‍රිල්ඩ් යූරියා (Prilled Urea)", "Bay A: Prilled Urea", "பகுதி A: யூரியா"),
      commodity: "Urea 46% N",
      stock_mt: 2500,
      max_mt: 3000,
      bags: "50,000 Bags",
      crh: "72.5% CRH",
      pallets: "15cm Treated Hardwood Dunnage",
      status: isCakingRisk ? "CAKING_RISK" : "OPTIMAL_STORAGE",
      color: "emerald",
      lastRestock: "2023-10-12",
      nextDelivery: "2023-11-05"
    },
    bay_b: {
      name: tr("Bay B: ත්‍රිත්ව සුපර් පොස්පේට් (TSP)", "Bay B: Triple Superphosphate (TSP)", "பகுதி B: TSP பாஸ்பேட்"),
      commodity: "TSP 46% P2O5",
      stock_mt: 1000,
      max_mt: 1500,
      bags: "30,000 Bags",
      crh: "84.0% CRH",
      pallets: "Waterproof Plastic Skid Pallets",
      status: "OPTIMAL_STORAGE",
      color: "cyan",
      lastRestock: "2023-09-28",
      nextDelivery: "2023-10-30"
    },
    bay_c: {
      name: tr("Bay C: මියුරියේට් ඔෆ් පොටෑෂ් (MOP)", "Bay C: Muriate of Potash (MOP)", "பகுதி C: MOP பொட்டாஷ்"),
      commodity: "MOP 60% K2O",
      stock_mt: 300,
      max_mt: 1000,
      bags: "20,000 Bags",
      crh: "92.0% CRH",
      pallets: "Heavy-Duty Dunnage Stacks",
      status: "OPTIMAL_STORAGE",
      color: "rose",
      lastRestock: "2023-08-15",
      nextDelivery: "2023-10-25"
    }
  };

  const currentBayData = bays[selectedBay];

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      
      {isCakingRisk && !dismissAlert && (
          <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                  <span className="font-bold text-sm sm:text-base">⚠️ අවදානම්! ගබඩාව තෙතමනය ඉකිවා ඇත! විදීරණ සක්රිය කරන්න</span>
              </div>
              <button onClick={() => setDismissAlert(true)} className="text-white hover:text-red-200">
                  <XCircle className="w-5 h-5" />
              </button>
          </div>
      )}

      {/* Header Banner - Clean Logistics Theme */}
      <div className="clean-card p-6 sm:p-8 bg-gradient-to-r from-amber-50 via-white to-orange-50 border-amber-200 relative overflow-hidden">
        {/* Animated ticker */}
        <div className="absolute top-0 left-0 w-full bg-amber-100 py-1 px-4 flex items-center space-x-2 border-b border-amber-200">
            <Radio className="w-3 h-3 text-amber-700 animate-pulse" />
            <span className="text-[10px] font-bold text-amber-800">Live Sensor Update: {lastUpdate}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-700 text-white flex items-center justify-center text-3xl shadow-md flex-shrink-0">
              🏬
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{tr("තත්‍ය කාලීන IoT සංවේදක සක්‍රියයි", "Live IoT Sensor Stream Active", "நேரலை IoT சென்சார்கள்")}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {tr("3D ඩිජිටල් නිවුන් ස්මාර්ට් ගබඩා පාලන මැදිරිය", "3D Digital Twin Smart Warehouse Management", "3D டிஜிட்டல் களஞ்சிய மேலாண்மை")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {tr("අනුරාධපුර ප්‍රධාන මධ්‍යම පොහොර ගබඩාවේ 5,000 MT තොගය, උෂ්ණත්ව/ආර්ද්‍රතා සංවේදක සහ යූරියා කැට ගල්වීම (Caking) වළක්වන ස්වයංක්‍රීය වාතාශ්‍ර පද්ධතිය.", "Anuradhapura Central 5,000 MT Depot with real-time temperature, RH caking prevention, and automated ventilation.", "அனுராதபுரம் 5,000 MT உரக் களஞ்சியத்தின் வெப்பநிலை மற்றும் உரம் கட்டிபிடிப்பதை தடுக்கும் அமைப்பு.")}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-950 font-black text-xs shadow-xs">
              📍 WH-AP-01 • 5,000 MT
            </span>
          </div>
        </div>
        
        {/* 4 Animated Sensor Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-amber-100/50 p-3 rounded-xl border border-amber-200 flex flex-col items-center justify-center">
                <Thermometer className="w-6 h-6 text-amber-600 mb-1" />
                <span className="text-[10px] text-amber-900 font-bold uppercase">Temperature</span>
                <span className="text-lg font-black text-amber-700">{temp}°C</span>
            </div>
            <div className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-colors ${humidity > 72.5 ? 'bg-red-100/50 border-red-200' : 'bg-blue-100/50 border-blue-200'}`}>
                <Droplets className={`w-6 h-6 mb-1 ${humidity > 72.5 ? 'text-red-600 animate-bounce' : 'text-blue-600'}`} />
                <span className={`text-[10px] font-bold uppercase ${humidity > 72.5 ? 'text-red-900' : 'text-blue-900'}`}>Humidity</span>
                <span className={`text-lg font-black ${humidity > 72.5 ? 'text-red-700' : 'text-blue-700'}`}>{humidity}%</span>
            </div>
            <div className="bg-emerald-100/50 p-3 rounded-xl border border-emerald-200 flex flex-col items-center justify-center">
                <Wind className="w-6 h-6 text-emerald-600 mb-1" />
                <span className="text-[10px] text-emerald-900 font-bold uppercase">Ammonia</span>
                <span className="text-lg font-black text-emerald-700">{ammoniaPpm} ppm</span>
            </div>
            <div className={`p-3 rounded-xl border flex flex-col items-center justify-center ${fanActive ? 'bg-cyan-100/50 border-cyan-200' : 'bg-slate-100/50 border-slate-200'}`}>
                <Power className={`w-6 h-6 mb-1 ${fanActive ? 'text-cyan-600 animate-pulse' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-bold uppercase ${fanActive ? 'text-cyan-900' : 'text-slate-500'}`}>Ventilation</span>
                <span className={`text-lg font-black ${fanActive ? 'text-cyan-700' : 'text-slate-500'}`}>{fanActive ? 'ACTIVE' : 'IDLE'}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-7 space-y-4">
          <div className="clean-card p-6 border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Rotate3d className="w-5 h-5 text-amber-700" />
                <h3 className="text-slate-900 font-black text-sm sm:text-base">
                  {tr("Isometric 3D ගබඩා බිම් සැලැස්ම (Digital Twin)", "Isometric 3D Warehouse Digital Twin", "3D களஞ்சிய மாதிரி")}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center space-x-1 ${
                  fanActive ? 'bg-cyan-100 text-cyan-800 animate-pulse' : 'bg-slate-100 text-slate-600'
                }`}>
                  <RefreshCw className={`w-3 h-3 ${fanActive ? 'animate-spin' : ''}`} />
                  <span>{fanActive ? tr("🌀 වාතාශ්‍රය සක්‍රියයි", "🌀 Exhaust Active", "🌀 காற்றோட்டம் தயார்") : tr("වාතාශ්‍රය අක්‍රියයි", "Ventilation Idle", "இயங்கவில்லை")}</span>
                </span>
              </div>
            </div>

            <div className="w-full h-80 sm:h-96 bg-slate-950 rounded-2xl overflow-hidden relative shadow-inner">
              <ThreeWarehouseCanvas currentRH={humidity} />
              
              <div className={`absolute top-3 left-3 right-3 p-3 rounded-xl border flex items-center justify-between backdrop-blur-md transition-all ${
                isCakingRisk 
                  ? 'bg-rose-950/85 border-rose-500 text-rose-200 shadow-lg' 
                  : 'bg-emerald-950/85 border-emerald-500 text-emerald-200'
              }`}>
                <div className="flex items-center space-x-2 text-xs font-black">
                  {isCakingRisk ? <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  <span>
                    {isCakingRisk 
                      ? tr("අන්තරායයි: සාපේක්ෂ ආර්ද්‍රතාවය 72.5% ඉක්මවා ඇත! යූරියා ගල්වීමේ (Caking) අවදානම!", "DANGER: RH exceeds 72.5% CRH! Urea caking into solid rock risk!", "ஆபத்து: ஈரப்பதம் 72.5% தாண்டியுள்ளது! உரம் கட்டியாகும் அபாயம்!")
                      : tr("ආරක්ෂිතයි: සාපේක්ෂ ආර්ද්‍රතාවය ප්‍රශස්ත තත්ත්වයේ පවතී.", "SAFE: Relative humidity within optimal safe boundary.", "பாதுகாப்பானது: உகந்த ஈரப்பதம் நிலவுகிறது.")
                    }
                  </span>
                </div>
                {isCakingRisk && !fanActive && (
                  <button
                    type="button"
                    onClick={toggleFan}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all flex items-center space-x-1"
                  >
                    <Power className="w-3 h-3" />
                    <span>{tr("විසඳුම: පංකා දමන්න", "Turn Fan ON", "காற்றாடி போடு")}</span>
                  </button>
                )}
              </div>

              <div className="absolute bottom-2 left-3 right-3 text-center text-[10px] text-white/70 bg-black/40 backdrop-blur-xs py-1 rounded-lg">
                {tr("ගබඩාව ත්‍රිමාණව කරකවන්න (Drag to view all 3 bays)", "Drag to inspect storage bays in 360°", "360° சுழற்றி பார்க்கவும்")}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {Object.keys(bays).map(bKey => {
                const bay = bays[bKey];
                const pct = (bay.stock_mt / bay.max_mt) * 100;
                let colorClass = 'bg-emerald-500';
                if (pct < 40) colorClass = 'bg-red-500 animate-pulse';
                else if (pct <= 70) colorClass = 'bg-orange-500';

                return (
                  <button
                    key={bKey}
                    type="button"
                    onClick={() => setSelectedBay(bKey)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col ${
                      selectedBay === bKey
                        ? 'bg-amber-50 border-amber-600 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <strong className="text-xs font-black block z-10">{bay.name.split(':')[0]}</strong>
                    <span className="text-[11px] text-slate-500 block mb-2 z-10">{bay.commodity}</span>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-auto z-10">
                        <div className={`h-1.5 rounded-full ${colorClass}`} style={{ width: pct + '%' }}></div>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          <div className="clean-card p-5 border-slate-200 bg-white space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>{tr("තෝරාගත් අංශයේ තත්ත්ව වාර්තාව", "Bay Integrity & Pallet Specification", "பிரிவு தணிக்கை அறிக்கை")}</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block font-bold">වත්මන් තොගය:</span>
                <strong className="text-slate-900 font-black text-sm">{currentBayData.stock_mt} MT</strong>
                <span className="text-[10px] text-slate-400 block">{currentBayData.bags}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-bold">පැලට් ආරක්ෂාව:</span>
                <strong className="text-slate-900 font-black text-xs">{currentBayData.pallets}</strong>
                <span className="text-[10px] text-emerald-700 font-bold block">✓ තෙතමන ආරක්ෂිතයි</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block font-bold">ගබඩා තත්ත්වය:</span>
                <strong className={`text-xs font-black block ${isCakingRisk && selectedBay === 'bay_a' ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {isCakingRisk && selectedBay === 'bay_a' ? '⚠️ ගල්වීමේ අවදානමක්' : '✓ ප්‍රශස්ත සුරක්ෂිතයි'}
                </strong>
                <span className="text-[10px] text-slate-400 block">SLSI Storage Audit</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-1 sm:col-span-1 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 font-bold">Last Restocked:</span>
                  <span className="text-xs font-black">{currentBayData.lastRestock}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-1 sm:col-span-2 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-500 font-bold">Next Delivery:</span>
                  <span className="text-xs font-black text-blue-700">{currentBayData.nextDelivery}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="lg:col-span-5 space-y-4">
          
          <div className="clean-card p-6 border-slate-200 bg-white space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Gauge className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-black text-slate-900">
                  {tr("IoT සංවේදක හා දේශගුණ පාලකය", "Climate & IoT Control Dashboard", "IoT காலநிலை கட்டுப்பாடு")}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">LIVE 10s</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1.5 text-xs font-black text-slate-800">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span>{tr("සාපේක්ෂ ආර්ද්‍රතාවය (Relative Humidity)", "Relative Humidity (RH %)", "ஈரப்பதம்")}</span>
                </div>
                <span className={`text-base font-black ${isCakingRisk ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {humidity}%
                </span>
              </div>
              <input
                type="range"
                min="45"
                max="95"
                step="0.5"
                value={humidity}
                onChange={(e) => setHumidity(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>ප්‍රශස්ත: &lt; 70.0%</span>
                <span className="text-rose-600 font-bold">යූරියා CRH සීමාව: 72.5%</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1.5 text-xs font-black text-slate-800">
                  <Thermometer className="w-4 h-4 text-amber-600" />
                  <span>{tr("ගබඩා උෂ්ණත්වය (Temperature)", "Ambient Temperature (°C)", "வெப்பநிலை")}</span>
                </div>
                <span className="text-base font-black text-amber-900">
                  {temp} °C
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="42"
                step="0.2"
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>ප්‍රශස්ත: 24 - 28 °C</span>
                <span>උපරිම අවසර ලත්: 32 °C</span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
                <button className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 flex items-center justify-center space-x-1 border border-slate-300">
                    <Thermometer className="w-3 h-3 text-rose-500" />
                    <span>Temp Alert</span>
                </button>
                <button className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 flex items-center justify-center space-x-1 border border-slate-300">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span>Dehumidify</span>
                </button>
                <button className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 flex items-center justify-center space-x-1 border border-slate-300">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    <span>Alert Sup.</span>
                </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={toggleFan}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                  fanActive
                    ? 'bg-rose-700 hover:bg-rose-800 text-white ring-2 ring-rose-400'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${fanActive ? 'animate-spin' : ''}`} />
                <span>
                  {fanActive
                    ? tr("කර්මාන්තශාලා වාතාශ්‍ර පංකා අක්‍රිය කරන්න (Stop Fans)", "Turn Exhaust Fans OFF", "காற்றாடியை நிறுத்து")
                    : tr("🌀 ස්වයංක්‍රීය වාතාශ්‍ර පංකා ක්‍රියාත්මක කරන්න (Start Fans)", "Activate Automatic Exhaust Fans", "காற்றாடியை இயக்கு")}
                </span>
              </button>
            </div>

          </div>

          <div className="clean-card p-5 border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-slate-700" />
                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  {tr("අද දින පොහොර බෙදාහැරීමේ ලොරි රථ පිටත්වීම්", "Today's Dispatch & Gate Outflows", "இன்றைய லாரி விநியோகம்")}
                </h4>
              </div>
              <span className="text-[11px] text-emerald-700 font-bold">Gate Active</span>
            </div>

            <div className="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4 py-2">
              {[
                { reg: "WP-ND-8491", to: "තඹුත්තේගම ගොවිජන සේවා (ASC)", qty: "20 MT", status: "DELIVERED ✓", statusColor: "text-emerald-700 bg-emerald-100" },
                { reg: "NC-GA-3104", to: "මැදවච්චිය කෘෂි මධ්‍යස්ථානය", qty: "15 MT", status: "IN TRANSIT 🚛", statusColor: "text-blue-700 bg-blue-100 animate-pulse" },
                { reg: "CP-SP-9022", to: "කැකිරාව සහන ගබඩාව", qty: "25 MT", status: "PENDING ⏳", statusColor: "text-amber-700 bg-amber-100" },
                { reg: "EP-DD-1122", to: "ත්‍රිකුණාමලය මධ්‍යස්ථානය", qty: "10 MT", status: "PENDING ⏳", statusColor: "text-amber-700 bg-amber-100" },
                { reg: "SP-QQ-9921", to: "ගාල්ල දිස්ත්‍රික්", qty: "30 MT", status: "PENDING ⏳", statusColor: "text-amber-700 bg-amber-100" }
              ].map((truck, idx) => (
                <div key={idx} className="relative animate-fadeIn">
                  <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-white ${truck.status.includes('DELIVERED') ? 'bg-emerald-500' : truck.status.includes('IN TRANSIT') ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                  <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-slate-900 block font-mono text-xs">{truck.reg}</strong>
                        <span className="text-[10px] text-slate-500">{truck.to} • {truck.qty}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${truck.statusColor}`}>
                        {truck.status}
                      </span>
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
