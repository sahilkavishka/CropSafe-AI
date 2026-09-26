import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  ShieldAlert, 
  FileCheck2, 
  Sliders, 
  Eye, 
  AlertOctagon, 
  FileText, 
  Printer, 
  TrendingUp, 
  Globe2, 
  CheckCircle2, 
  XCircle,
  Truck,
  Rotate3d,
  Check,
  ShieldCheck,
  Award,
  Clock,
  AlertTriangle
} from 'lucide-react';
import ThreeBagCanvas from './ThreeBagCanvas';

const API_BASE = "http://localhost:8000";

export default function InspectorMode({ language = 'si' }) {
  const tr = (si, en, ta) => {
    if (language === 'ta') return ta || en || si;
    if (language === 'en') return en || si;
    return si;
  };

  const [activeTab, setActiveTab] = useState('packaging'); 

  // Packaging Vision State
  const [packInput, setPackInput] = useState({
    brand_key: 'ceylon_fertilizer_lakpohora',
    hologram_diffraction_score: 0.88,
    microprint_sharpness_score: 0.92,
    stitch_type_detected: 'double_chainstitch',
    seal_tamper_flag: false
  });
  const [packResult, setPackResult] = useState(null);
  const [packLoading, setPackLoading] = useState(false);

  // Legal B-Report State
  const [bReportInput, setBReportInput] = useState({
    court_jurisdiction: 'අනුරාධපුර මහේස්ත්‍රාත් අධිකරණය',
    suspect_name: 'කේ. ජී. ධර්මසේන (ලක්පොහොර නියෝජිත වෙළඳසැල)',
    depot_location: 'මැදවච්චිය ප්‍රධාන වීදිය',
    seized_bags: 250,
    batch_number: 'LP-2026-N09',
    adulterant: 'ගල් කුඩු (Crushed Marble Powder) 38.5%'
  });
  const [generatedReport, setGeneratedReport] = useState(null);

  // Policy Wargame State
  const [wargameInput, setWargameInput] = useState({
    scenario_name: 'රතු මුහුදේ නාවික අර්බුදය හා ගෝලීය යූරියා මිල ඉහළයාම',
    global_urea_price_change_pct: 45.0,
    port_arrival_delay_weeks: 3,
    chemical_subsidy_cut_pct: 15.0,
    organic_substitution_pct: 10.0,
    season: 'Maha'
  });
  const [wargameResult, setWargameResult] = useState(null);
  const [wargameLoading, setWargameLoading] = useState(false);

  // Counters for Wargame
  const [counter1, setCounter1] = useState(0);
  const [counter2, setCounter2] = useState(0);

  const handleRunPackScan = async () => {
    setPackLoading(true);
    setTimeout(() => {
      const isAuthentic = packInput.hologram_diffraction_score > 0.75 && 
                          packInput.microprint_sharpness_score > 0.75 && 
                          packInput.stitch_type_detected === 'double_chainstitch' &&
                          !packInput.seal_tamper_flag;
      
      const score = Math.round(
          ((packInput.hologram_diffraction_score + packInput.microprint_sharpness_score) / 2) * 100
      ) - (packInput.stitch_type_detected !== 'double_chainstitch' ? 30 : 0) - (packInput.seal_tamper_flag ? 40 : 0);
      
      setPackResult({
        brand: packInput.brand_key,
        packaging_authenticity: isAuthentic ? "AUTHENTIC_GENUINE" : "COUNTERFEIT_TAMPERED",
        authenticity_confidence_pct: isAuthentic ? 95.8 : 32.4,
        hologram_status: packInput.hologram_diffraction_score > 0.75 ? "VALID_DOE_HOLOGRAM" : "SUSPECT_STICKER_COPY",
        microprint_status: packInput.microprint_sharpness_score > 0.75 ? "CRISP_MICROPRINT" : "BLURRED_INKJET_FORGERY",
        stitching_integrity: packInput.stitch_type_detected === 'double_chainstitch' ? "INDUSTRIAL_FACTORY_SEAL" : "MANUAL_RE-STITCHED_BAG",
        tamper_detected: packInput.seal_tamper_flag,
        legal_status: isAuthentic ? "APPROVED_FOR_DISTRIBUTION" : "SEIZE_AND_IMPOUND_UNDER_ACT_68",
        risk_score: Math.max(0, 100 - score)
      });
      setPackLoading(false);
    }, 1200);
  };

  const calculateCourtDate = () => {
      const date = new Date();
      date.setDate(date.getDate() + 14);
      return date.toLocaleDateString();
  };

  const getSeverity = () => {
      if (bReportInput.seized_bags > 500) return { label: "CRITICAL", color: "bg-red-600" };
      if (bReportInput.seized_bags > 100) return { label: "MAJOR", color: "bg-orange-500" };
      return { label: "MINOR", color: "bg-yellow-500" };
  };

  const handleGenerateBReport = () => {
    const reportText = `
ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජය
${bReportInput.court_jurisdiction} හමුවේ ඉදිරිපත් කෙරෙන 'බී' වාර්තාව (B-Report)
නඩු අංකය: CR/FERT/2026/089
දිනය: ${new Date().toLocaleDateString('si-LK')}
ඇස්තමේන්තුගත අධිකරණ දිනය: ${calculateCourtDate()}

පොහොර නියාමන පනත: 1988 අංක 68 දරන පොහොර නියාමන පනතේ 14 සහ 17 වගන්ති සහ ලංකා දණ්ඩ නීති සංග්‍රහයේ 403 (වංචා කිරීම) වගන්තිය.

පැමිණිල්ල:
ජාතික පොහොර ලේකම් කාර්යාලයේ (NFS) සහ කෘෂිකර්ම දෙපාර්තමේන්තුවේ බලයලත් පොහොර පරීක්ෂක නිලධාරීන් විසින් 2026 දින ${bReportInput.depot_location} හි පිහිටි සැකකාර ${bReportInput.suspect_name} හට අයත් ගබඩා පරිශ්‍රය පරීක්ෂාවට ලක් කරන ලදී.

අත්අඩංගුවට ගත් භාණ්ඩ:
1. නීතිවිරෝධී ලෙස ප්‍රමිතියෙන් තොර බාල යූරියා පොහොර අඩංගු මිටි ${bReportInput.seized_bags} ක් (කාණ්ඩ අංකය: ${bReportInput.batch_number}).
2. සොයාගත් අනවසර සංයුතිය: ${bReportInput.adulterant} අඩංගු බවට Optuna ML සහ රජයේ රස පරීක්ෂක මූලික රසායනාගාර වාර්තාව මඟින් තහවුරු වී ඇත.

අධිකරණයෙන් අයැද සිටින නියෝග:
1. අත්අඩංගුවට ගත් පොහොර මිටි ${bReportInput.seized_bags} නඩු භාණ්ඩ ලෙස රජයේ ගබඩාවක මුද්‍රා තැබීමට නියෝග කිරීම.
2. සැකකරුට එරෙහිව 1988 අංක 68 දරන පොහොර නියාමන පනත යටතේ නඩු පැවරීම සඳහා අවසර ලබාදීම.
`;
    setGeneratedReport(reportText.trim());
  };

  const handleRunWargame = () => {
    setWargameLoading(true);
    setCounter1(0); setCounter2(0);
    setTimeout(() => {
        const result = {
            scenario: wargameInput.scenario_name,
            season: wargameInput.season,
            projected_national_buffer_runway_weeks: Math.max(3.2, (12.0 - wargameInput.port_arrival_delay_weeks * 1.8)).toFixed(1),
            national_paddy_yield_deficit_pct: (wargameInput.chemical_subsidy_cut_pct * 0.45 + wargameInput.port_arrival_delay_weeks * 2.1).toFixed(1),
            emergency_fiscal_impact_lkr_billions: (wargameInput.global_urea_price_change_pct * 0.38 + 4.2).toFixed(1),
            strategic_recommendation_si: "කොළඹ වරායේ බෆර් තොග වහාම දිස්ත්‍රික් මධ්‍යස්ථාන වෙත මුදාහරින්න. පිදුරු දිරවීම හා ජීවාමෘත මඟින් රසායනික යූරියා 30%ක් කාබනිකව විස්ථාපනය කරන්න."
        };
        setWargameResult(result);
        setWargameLoading(false);
        
        let c1 = 0, c2 = 0;
        const interval = setInterval(() => {
            if (c1 < parseFloat(result.national_paddy_yield_deficit_pct)) c1 += 0.5;
            if (c2 < parseFloat(result.emergency_fiscal_impact_lkr_billions)) c2 += 0.2;
            setCounter1(c1);
            setCounter2(c2);
            if (c1 >= parseFloat(result.national_paddy_yield_deficit_pct) && c2 >= parseFloat(result.emergency_fiscal_impact_lkr_billions)) clearInterval(interval);
        }, 50);
    }, 1500);
  };

  const loadScenario = (type) => {
      if (type === 'red_sea') {
          setWargameInput({...wargameInput, scenario_name: 'Red Sea Crisis (Emergency)', global_urea_price_change_pct: 60, port_arrival_delay_weeks: 5});
      } else if (type === 'subsidy') {
          setWargameInput({...wargameInput, scenario_name: 'Subsidy Cut Shock', chemical_subsidy_cut_pct: 30, global_urea_price_change_pct: 10});
      } else if (type === 'maha') {
          setWargameInput({...wargameInput, scenario_name: 'Maha Season Demand Surge', season: 'Maha', port_arrival_delay_weeks: 2, global_urea_price_change_pct: 25});
      }
  };

  const renderStars = (score) => {
      const stars = Math.round(score * 5);
      return (
          <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className={s <= stars ? "text-yellow-500" : "text-gray-300"}>★</span>
              ))}
          </div>
      );
  };

  const tabColors = {
      'packaging': 'bg-emerald-600 text-white',
      'breport': 'bg-blue-600 text-white',
      'wargame': 'bg-purple-600 text-white'
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="clean-card p-6 sm:p-8 bg-gradient-to-r from-slate-50 via-white to-red-50 border-slate-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl shadow-md flex-shrink-0">
              ⚖️
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-red-100 text-red-900 text-xs font-black mb-1.5">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span>{tr("1988 අංක 68 පොහොර නියාමන පනත", "Fertilizer Regulation Act No. 68 of 1988", "உர ஒழுங்குமுறை சட்டம்")}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {tr("පොහොර පරීක්ෂක හා නීති බලාත්මක කිරීමේ ඒකකය", "Fertilizer Inspector & Legal Enforcement Directorate", "உர ஆய்வாளர் மற்றும் சட்ட அமலாக்க பிரிவு")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {tr("ව්‍යාජ උර හොලෝග්‍රෑම් විමර්ශනය, මහේස්ත්‍රාත් අධිකරණ 'බී' වාර්තා නිකුත් කිරීම සහ ජාතික පොහොර සැපයුම් අර්බුද කළමනාකරණය.", "Computer vision counterfeit bag scanning, official Magistrate Court B-Report filing, and geopolitical supply shock wargaming.", "போலி உரம் ஆய்வு, நீதிமன்ற 'B' அறிக்கை தயாரிப்பு மற்றும் விநியோக இடர் மேலாண்மை.")}
              </p>
            </div>
          </div>

          {/* Action Tabs with specific colors */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 relative">
            {[
              { id: 'packaging', label: tr('🔍 3D උරය', '🔍 Packaging Scan', '🔍 3D பை'), icon: Eye, color: 'bg-emerald-600' },
              { id: 'breport', label: tr('⚖️ අධිකරණ බී-වාර්තාව', '⚖️ B-Report Generator', '⚖️ நீதிமன்ற அறிக்கை'), icon: Scale, color: 'bg-blue-600' },
              { id: 'wargame', label: tr('🌍 සැපයුම් අර්බුද', '🌍 Policy Wargame', '🌍 இடர் பகுப்பாய்வு'), icon: Globe2, color: 'bg-purple-600' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 relative overflow-hidden ${
                  activeTab === tab.id
                    ? `${tabColors[tab.id]} shadow-md transform scale-105`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {activeTab === tab.id && <span className="absolute inset-0 bg-white/20 animate-pulse"></span>}
                <tab.icon className="w-4 h-4" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB 1: 3D PACKAGING VISION & HOLOGRAM SCANNER */}
      {activeTab === 'packaging' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="clean-card p-6 border-emerald-200 bg-white space-y-4 shadow-emerald-900/5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-emerald-800" />
                  <h3 className="text-base font-black text-slate-900">
                    {tr("පොහොර උරයේ ආරක්ෂණ මුද්‍රා පරාමිතීන්", "Bag Packaging Security Features", "உரப்பை பாதுகாப்பு அளவுருக்கள்")}
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-bold">SLSI Packaging Spec</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  {tr("පරීක්ෂා කරන පොහොර වෙළඳ නාමය:", "Select Fertilizer Brand:", "உர பிராண்ட்:")}
                </label>
                <select
                  value={packInput.brand_key}
                  onChange={(e) => setPackInput({ ...packInput, brand_key: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                >
                  <option value="ceylon_fertilizer_lakpohora">ලක්පොහොර (Ceylon Fertilizer Co. Ltd)</option>
                  <option value="colombo_commercial_fertilizer">කොළඹ කොමර්ෂල් ෆර්ටිලයිසර්ස් (CCF)</option>
                  <option value="cic_agri_businesses">CIC කෘෂි ව්‍යාපාර (CIC Agri)</option>
                  <option value="baurs_a_baur_co">බවර් සමාගම (A. Baur & Co.)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-slate-800">
                  <span>DOE Hologram Diffraction Score</span>
                  <div className="flex items-center space-x-2">
                      <span className={packInput.hologram_diffraction_score >= 0.75 ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'}>
                        {(packInput.hologram_diffraction_score * 100).toFixed(0)}%
                      </span>
                      {renderStars(packInput.hologram_diffraction_score)}
                  </div>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.02"
                  value={packInput.hologram_diffraction_score}
                  onChange={(e) => setPackInput({ ...packInput, hologram_diffraction_score: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-black text-slate-800">
                  <span>Microprint Optical Sharpness</span>
                  <div className="flex items-center space-x-2">
                      <span className={packInput.microprint_sharpness_score >= 0.75 ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'}>
                        {(packInput.microprint_sharpness_score * 100).toFixed(0)}%
                      </span>
                      {renderStars(packInput.microprint_sharpness_score)}
                  </div>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.02"
                  value={packInput.microprint_sharpness_score}
                  onChange={(e) => setPackInput({ ...packInput, microprint_sharpness_score: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 block">
                  {tr("උරයේ මුවවිට මැහුම් ක්‍රමය (Stitching Method):", "Bag Stitching Method:", "தையல் முறை:")}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'double_chainstitch', label: '✓ ද්විත්ව දම්වැල් මැහුම', valid: true },
                    { id: 'single_lockstitch', label: '⚠️ තනි මැහුම', valid: false },
                    { id: 'manual_restitched', label: '✗ අතින් නැවත මැසූ', valid: false }
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setPackInput({ ...packInput, stitch_type_detected: s.id })}
                      className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                        packInput.stitch_type_detected === s.id
                          ? (s.valid ? 'bg-emerald-50 border-emerald-600 text-emerald-950' : 'bg-rose-50 border-rose-600 text-rose-950')
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  {tr("උරය කපා නැවත අලවා ඇති බවට ලකුණු තිබේද? (Physical Tampering)", "Evidence of Cut & Re-sealed Bag?", "சேதப்படுத்தப்பட்ட முத்திரை?")}
                </span>
                <input
                  type="checkbox"
                  checked={packInput.seal_tamper_flag}
                  onChange={(e) => setPackInput({ ...packInput, seal_tamper_flag: e.target.checked })}
                  className="w-4 h-4 accent-rose-600 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleRunPackScan}
                disabled={packLoading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Eye className="w-4 h-4 text-emerald-200" />
                <span>{packLoading ? "විමර්ශනය කෙරේ..." : "🔍 AI ඇසුරුම් ආරක්ෂණ විමර්ශනය"}</span>
              </button>

            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            
            <div className="clean-card p-5 border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Rotate3d className="w-4 h-4 text-slate-800" />
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    {tr("3D පොහොර උරය (360° Inspection)", "3D 50kg Bag Digital Twin", "3D உரப்பை")}
                  </h4>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">50 kg</span>
              </div>

              <div className="w-full h-64 bg-slate-950 rounded-2xl overflow-hidden relative shadow-inner">
                <ThreeBagCanvas 
                  hologramScore={packInput.hologram_diffraction_score} 
                  isTampered={packInput.seal_tamper_flag || packInput.stitch_type_detected !== 'double_chainstitch'} 
                />
              </div>
            </div>

            {packResult && (
              <div className={`clean-card p-5 border-2 animate-fadeIn space-y-4 relative overflow-hidden ${
                packResult.packaging_authenticity === "AUTHENTIC_GENUINE"
                  ? 'bg-emerald-50/70 border-emerald-400'
                  : 'bg-rose-50/70 border-rose-400'
              }`}>
                {/* Stamp Effect */}
                <div className={`absolute -right-4 -bottom-4 opacity-10 transform -rotate-12 pointer-events-none text-8xl font-black ${
                  packResult.packaging_authenticity === "AUTHENTIC_GENUINE" ? "text-emerald-900" : "text-rose-900"
                }`}>
                  {packResult.packaging_authenticity === "AUTHENTIC_GENUINE" ? "PASS" : "FAIL"}
                </div>
                
                <div className="flex items-center space-x-2">
                  {packResult.packaging_authenticity === "AUTHENTIC_GENUINE" ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-700 flex-shrink-0 animate-bounce" />
                  ) : (
                    <AlertOctagon className="w-8 h-8 text-rose-700 flex-shrink-0 animate-pulse" />
                  )}
                  <div className="z-10 relative">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">
                      Forensic Vision Verdict
                    </span>
                    <h3 className="text-sm font-black text-slate-900 leading-snug">
                      {packResult.packaging_authenticity === "AUTHENTIC_GENUINE"
                        ? "ප්‍රමිතිගත සැබෑ රජයේ පොහොර උරයකි (AUTHENTIC)"
                        : "ව්‍යාජ / වෙනස් කළ හොර පොහොර උරයකි! (COUNTERFEIT)"
                      }
                    </h3>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-3 mb-2 z-10 relative">
                    <div className={`h-3 rounded-full ${packResult.risk_score > 50 ? 'bg-rose-600' : 'bg-emerald-500'}`} style={{width: (packResult.risk_score) + '%'}}></div>
                </div>
                <div className="text-right text-[10px] font-bold text-slate-600 mb-4 z-10 relative">Counterfeit Risk Score: {packResult.risk_score}/100</div>

                <div className="space-y-2 text-xs text-slate-700 divide-y divide-slate-200 z-10 relative">
                  <div className="pt-2 flex justify-between">
                    <span>Hologram Security:</span>
                    <strong className="font-mono">{packResult.hologram_status}</strong>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span>Microprint Integrity:</span>
                    <strong className="font-mono">{packResult.microprint_status}</strong>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span>Stitching Verification:</span>
                    <strong className="font-mono">{packResult.stitching_integrity}</strong>
                  </div>
                  <div className="pt-2 flex justify-between font-bold text-sm">
                    <span>Legal Directive:</span>
                    <strong className={packResult.packaging_authenticity === "AUTHENTIC_GENUINE" ? 'text-emerald-800' : 'text-rose-800'}>
                      {packResult.legal_status}
                    </strong>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: LEGAL B-REPORT GENERATOR */}
      {activeTab === 'breport' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="clean-card p-6 border-blue-200 bg-white space-y-3.5 shadow-blue-900/5">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Scale className="w-5 h-5 text-blue-900" />
                <h3 className="text-base font-black text-slate-900">
                  {tr("අධිකරණ 'බී' වාර්තා දත්ත ඇතුළත් කිරීම", "Magistrate Court B-Report Details", "நீதிமன்ற அறிக்கை விவரங்கள்")}
                </h3>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">අදාළ මහේස්ත්‍රාත් අධිකරණය:</label>
                <input
                  type="text"
                  value={bReportInput.court_jurisdiction}
                  onChange={(e) => setBReportInput({ ...bReportInput, court_jurisdiction: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">සැකකාර වෙළඳසැල / පුද්ගලයා:</label>
                <input
                  type="text"
                  value={bReportInput.suspect_name}
                  onChange={(e) => setBReportInput({ ...bReportInput, suspect_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">වැටලීම සිදුකළ ස්ථානය:</label>
                <input
                  type="text"
                  value={bReportInput.depot_location}
                  onChange={(e) => setBReportInput({ ...bReportInput, depot_location: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1 relative">
                  <label className="text-xs font-black text-slate-700 block flex items-center justify-between">
                      <span>අත්අඩංගුවට ගත් මිටි:</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded text-white ${getSeverity().color}`}>{getSeverity().label}</span>
                  </label>
                  <input
                    type="number"
                    value={bReportInput.seized_bags}
                    onChange={(e) => setBReportInput({ ...bReportInput, seized_bags: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700 block">කාණ්ඩ අංකය (Batch No):</label>
                  <input
                    type="text"
                    value={bReportInput.batch_number}
                    onChange={(e) => setBReportInput({ ...bReportInput, batch_number: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700 block">හඳුනාගත් ව්‍යාජ කලවම (Adulterant):</label>
                <input
                  type="text"
                  value={bReportInput.adulterant}
                  onChange={(e) => setBReportInput({ ...bReportInput, adulterant: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="pt-2">
                  <div className="bg-slate-100 p-2 rounded-lg mb-4 flex items-center space-x-2 text-xs">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-700">Estimated Court Date: <span className="text-blue-800">{calculateCourtDate()}</span></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateBReport}
                    className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs shadow transition-all flex items-center justify-center space-x-2"
                  >
                    <FileCheck2 className="w-4 h-4 text-blue-200" />
                    <span>{tr("📜 අධිකරණ 'බී' වාර්තාව සකසන්න", "Generate Magistrate Court B-Report", "நீதிமன்ற 'B' அறிக்கை உருவாக்கு")}</span>
                  </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {generatedReport ? (
              <div className="clean-card p-6 border-slate-300 bg-white space-y-4 shadow-xl relative">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🏛️</span>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        නිල අධිකරණ 'බී' වාර්තාව (Official Magistrate B-Report)
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">DOA/LEGAL/SEC68/2026</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow flex items-center space-x-1.5 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>මුද්‍රණය (Print)</span>
                  </button>
                </div>

                <div className="p-8 bg-amber-50/30 border border-slate-200 font-serif text-sm text-slate-900 whitespace-pre-line leading-relaxed min-h-[420px] shadow-inner relative">
                  <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center text-9xl font-black">CONFIDENTIAL</div>
                  {generatedReport}
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span className="flex items-center"><CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500"/> 1988 No. 68 Section 14 Authorized Seal</span>
                  <span>National Fertilizer Secretariat Legal Dept.</span>
                </div>
              </div>
            ) : (
              <div className="clean-card p-10 text-center space-y-3 bg-white border-slate-200 border-dashed border-2">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-black text-slate-600">නීතිමය 'බී' වාර්තාව මෙතැනින් උත්පාදනය වේ</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  වම් පසින් විමර්ශන තොරතුරු ඇතුළත් කර 'අධිකරණ බී වාර්තාව සකසන්න' ක්ලික් කරන්න.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: GLOBAL SUPPLY SHOCK WARGAME */}
      {activeTab === 'wargame' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          
          <div className="lg:col-span-6 space-y-4">
            <div className="clean-card p-6 border-purple-200 bg-white space-y-5 shadow-purple-900/5">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Globe2 className="w-5 h-5 text-purple-700" />
                <h3 className="text-base font-black text-slate-900">
                  {tr("භූ-දේශපාලනික අර්බුද පරාමිතීන්", "Geopolitical Shock Parameters", "விநியோக இடர் அளவுருக்கள்")}
                </h3>
              </div>
              
              {/* Scenario Templates */}
              <div>
                  <span className="text-xs font-black text-slate-700 block mb-2">Scenario Templates:</span>
                  <div className="flex space-x-2">
                      <button onClick={() => loadScenario('red_sea')} className="flex-1 bg-red-50 text-red-700 border border-red-200 rounded-lg p-2 text-[10px] font-bold hover:bg-red-100 transition-colors">🔴 Red Sea Crisis</button>
                      <button onClick={() => loadScenario('subsidy')} className="flex-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg p-2 text-[10px] font-bold hover:bg-yellow-100 transition-colors">⚡ Subsidy Cut Shock</button>
                      <button onClick={() => loadScenario('maha')} className="flex-1 bg-green-50 text-green-700 border border-green-200 rounded-lg p-2 text-[10px] font-bold hover:bg-green-100 transition-colors">🌡️ Maha Surge</button>
                  </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="text-xs font-black text-slate-700 block">අර්බුදයේ ස්වභාවය:</label>
                <input
                  type="text"
                  value={wargameInput.scenario_name}
                  onChange={(e) => setWargameInput({ ...wargameInput, scenario_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-black text-slate-800">
                  <span>Global Urea Price Spike</span>
                  <span className="text-rose-700 font-black bg-rose-100 px-2 py-0.5 rounded-full">+{wargameInput.global_urea_price_change_pct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={wargameInput.global_urea_price_change_pct}
                  onChange={(e) => setWargameInput({ ...wargameInput, global_urea_price_change_pct: parseFloat(e.target.value) })}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-black text-slate-800">
                  <span>Port Arrival Delay</span>
                  <span className="text-amber-800 font-black bg-amber-100 px-2 py-0.5 rounded-full">{wargameInput.port_arrival_delay_weeks} Weeks</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={wargameInput.port_arrival_delay_weeks}
                  onChange={(e) => setWargameInput({ ...wargameInput, port_arrival_delay_weeks: parseInt(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-black text-slate-800">
                  <span>Chemical Subsidy Cut</span>
                  <span className="text-slate-800 font-black bg-slate-200 px-2 py-0.5 rounded-full">{wargameInput.chemical_subsidy_cut_pct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={wargameInput.chemical_subsidy_cut_pct}
                  onChange={(e) => setWargameInput({ ...wargameInput, chemical_subsidy_cut_pct: parseFloat(e.target.value) })}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleRunWargame}
                disabled={wargameLoading}
                className="w-full py-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black text-xs shadow-lg shadow-purple-700/20 transition-all flex items-center justify-center space-x-2"
              >
                <TrendingUp className={`w-4 h-4 ${wargameLoading ? 'animate-bounce' : ''}`} />
                <span>{wargameLoading ? "අනුකරණය වෙමින් පවතී..." : "🚀 ජාතික සැපයුම් අර්බුද අනුකරණය"}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            {wargameResult ? (
              <div className="clean-card p-6 border-slate-200 bg-white space-y-5 animate-fadeIn shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl animate-pulse">🌐</span>
                    <h4 className="text-base font-black text-slate-900">
                      ජාතික ප්‍රතිපත්ති අනුකරණ ප්‍රතිඵල
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-purple-700 font-mono bg-purple-100 px-2 py-1 rounded">SIM-2026-NFS</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 relative overflow-hidden">
                    <AlertTriangle className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-100 opacity-50" />
                    <span className="text-xs text-amber-900 font-bold block relative z-10">බෆර් තොග පැවැත්ම (Runway):</span>
                    <strong className="text-3xl font-black text-amber-950 mt-1 block relative z-10">
                      {wargameResult.projected_national_buffer_runway_weeks} <span className="text-sm font-bold">Weeks</span>
                    </strong>
                  </div>

                  <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 relative overflow-hidden">
                    <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-rose-100 opacity-50 transform rotate-45" />
                    <span className="text-xs text-rose-900 font-bold block relative z-10">අස්වනු හිඟතා අවදානම:</span>
                    <strong className="text-3xl font-black text-rose-600 mt-1 block relative z-10">
                      -{counter1.toFixed(1)}%
                    </strong>
                    <span className="text-[10px] text-rose-800 relative z-10">Farmer Impact</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                      <span className="text-xs text-slate-500 font-bold block">රාජ්‍ය භාණ්ඩාගාරයට වන අමතර බර:</span>
                      <strong className="text-2xl font-black text-slate-900 block mt-0.5">
                        LKR {counter2.toFixed(1)} <span className="text-sm font-bold">Billion</span>
                      </strong>
                  </div>
                  <Activity className="w-10 h-10 text-slate-300" />
                </div>

                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 space-y-1 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-l-xl"></div>
                  <strong className="text-xs font-black text-purple-950 block ml-2">උපායමාර්ගික නිර්දේශය:</strong>
                  <p className="text-xs text-purple-900 leading-relaxed font-medium ml-2">
                    {wargameResult.strategic_recommendation_si}
                  </p>
                </div>
              </div>
            ) : (
              <div className="clean-card p-10 text-center space-y-3 bg-white border-slate-200 border-dashed border-2">
                <Globe2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-black text-slate-600">ප්‍රතිපත්ති අනුකරණ ප්‍රතිඵල මෙතැනින්</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  නාවික හා මිල අර්බුද පරාමිතීන් සකසා 'ජාතික සැපයුම් අර්බුද අනුකරණය' බොත්තම ඔබන්න.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
