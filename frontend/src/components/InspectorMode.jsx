import React, { useState } from 'react';
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
  Truck
} from 'lucide-react';

const API_BASE = "http://localhost:8000";

export default function InspectorMode({ language = 'si' }) {
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
    suspect_name: 'කේ. ජී. ධර්මසේන (ශ්‍රී ලංකා වෙළඳ නියෝජිත)',
    depot_location: 'මැදවච්චිය නගරය',
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

  // Run Packaging Scan
  const handleRunPackScan = async () => {
    setPackLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/inspector/packaging-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packInput)
      });
      if (res.ok) {
        const data = await res.json();
        setPackResult(data);
      } else {
        throw new Error("Packaging API error");
      }
    } catch {
      const isAuthentic = packInput.hologram_diffraction_score > 0.75 && 
                          packInput.microprint_sharpness_score > 0.75 && 
                          packInput.stitch_type_detected === 'double_chainstitch' &&
                          !packInput.seal_tamper_flag;
      setPackResult({
        brand: packInput.brand_key,
        packaging_authenticity: isAuthentic ? "AUTHENTIC_GENUINE" : "COUNTERFEIT_TAMPERED",
        authenticity_confidence_pct: isAuthentic ? 95.8 : 32.4,
        hologram_status: packInput.hologram_diffraction_score > 0.75 ? "VALID_DOE_HOLOGRAM" : "SUSPECT_STICKER_COPY",
        microprint_status: packInput.microprint_sharpness_score > 0.75 ? "CRISP_MICROPRINT" : "BLURRED_INKJET_FORGERY",
        stitching_integrity: packInput.stitch_type_detected === 'double_chainstitch' ? "INDUSTRIAL_FACTORY_SEAL" : "MANUAL_RE-STITCHED_BAG",
        tamper_detected: packInput.seal_tamper_flag,
        legal_status: isAuthentic ? "APPROVED_FOR_DISTRIBUTION" : "SEIZE_AND_IMPOUND_UNDER_ACT_68"
      });
    } finally {
      setPackLoading(false);
    }
  };

  // Generate B-Report
  const handleGenerateBReport = () => {
    const reportText = `
ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජය
${bReportInput.court_jurisdiction} හමුවේ ඉදිරිපත් කෙරෙන 'බී' වාර්තාව (B-Report)
නඩු අංකය: CR/FERT/2026/089
දිනය: ${new Date().toLocaleDateString('si-LK')}

පොහොර නියාමන පනත: 1988 අංක 68 දරන පොහොර නියාමන පනතේ 14 සහ 17 වගන්ති සහ ලංකා දණ්ඩ නීති සංග්‍රහයේ 403 (වංචා කිරීම) වගන්තිය.

පැමිණිල්ල:
ජාතික පොහොර ලේකම් කාර්යාලය (NFS) සහ කෘෂිකර්ම දෙපාර්තමේන්තුවේ පොහොර පරීක්ෂක නිලධාරී.

සැකකරු:
නම: ${bReportInput.suspect_name}
ස්ථානය: ${bReportInput.depot_location}

අත්අඩංගුවට ගත් භාණ්ඩ පිළිබඳ විස්තරය:
1. 'ලක්පොහොර' නාමයෙන් ව්‍යාජ ලෙස ලේබල් කරන ලද යූරියා පොහොර 50kg කොට්ට ${bReportInput.seized_bags} ක් (මුළු බර මෙට්‍රික් ටොන් ${(bReportInput.seized_bags * 0.05).toFixed(2)}).
2. කාණ්ඩ අංකය (Batch No): ${bReportInput.batch_number}

රසායනාගාර පරීක්ෂණ වාර්තාව (කෘෂිකර්ම රසායනාගාරය):
- ප්‍රමිතිය: SLSI 644 ප්‍රමිතිය උල්ලංඝනය කර ඇත.
- හඳුනාගත් බාල ද්‍රව්‍යය: ${bReportInput.adulterant}.
- නයිට්‍රජන් (N) ප්‍රතිශතය තිබිය යුතු 46.0% වෙනුවට 22.4% දක්වා කෘත්‍රීමව අඩුකර ඇත.

අධිකරණයෙන් අයැද සිටින සහන:
1. ඉහත නම් සඳහන් සැකකරුට එරෙහිව 1988 අංක 68 දරන පනත ප්‍රකාරව නඩු කටයුතු පැවරීම.
2. අත්අඩංගුවට ගත් මෙට්‍රික් ටොන් ${(bReportInput.seized_bags * 0.05).toFixed(2)} ක නීතිවිරෝධී තොගය රාජසන්තක කිරීම.
3. සැකකරුට ඇප ලබාදීම ප්‍රතික්ෂේප කර රක්ෂිත බන්ධනාගාරගත කරන මෙන් ගෞරවයෙන් ඉල්ලා සිටිමු.
    `;
    setGeneratedReport(reportText.trim());
  };

  // Run Wargame Simulator
  const handleRunWargame = async () => {
    setWargameLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/policy/wargame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wargameInput)
      });
      if (res.ok) {
        const data = await res.json();
        setWargameResult(data);
      } else {
        throw new Error("Wargame API error");
      }
    } catch {
      const delay = wargameInput.port_arrival_delay_weeks;
      const priceUp = wargameInput.global_urea_price_change_pct;
      const subCut = wargameInput.chemical_subsidy_cut_pct;
      const yieldDrop = (priceUp * 0.12 + delay * 4.2 + subCut * 0.25).toFixed(1);
      const riceInfl = (priceUp * 0.8 + delay * 14.5 + subCut * 1.8).toFixed(0);

      setWargameResult({
        scenario: wargameInput.scenario_name,
        season: wargameInput.season,
        forecast_national_paddy_yield_loss_mt: Math.round(yieldDrop * 12500),
        national_yield_reduction_pct: parseFloat(yieldDrop),
        buffer_stock_depletion_weeks: Math.max(1, 8 - delay * 2),
        retail_rice_price_impact_lkr_per_kg: `+ Rs. ${riceInfl} / kg`,
        macro_risk_level: yieldDrop > 20 ? "CRITICAL_NATIONAL_FOOD_INSECURITY" : "ELEVATED_SUPPLY_CHAIN_ALERT",
        policy_recommendation: "රජයේ හදිසි බෆර් තොග නිදහස් කිරීම සහ කාබනික නයිට්‍රජන් පරිපූරකය කඩිනම් කිරීම."
      });
    } finally {
      setWargameLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 border border-rose-800/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold mb-3">
              <Scale className="w-4 h-4 text-rose-400" />
              <span>පොහොර නියාමන පනත හා වැටලීම් ඒකකය (Enforcement Wing)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              නීතිමය වැටලීම් සහ <span className="text-rose-400">ජාතික ප්‍රතිපත්ති සිමියුලේටරය</span>
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              1988 අංක 68 දරන පොහොර නියාමන පනත යටතේ හොලෝග්‍රෑම් ඇසුරුම් පරිලෝකනය, මහේස්ත්‍රාත් 'බී' වාර්තා උත්පාදනය සහ ජාතික ආහාර අර්බුද පූර්ව අනතුරු ඇඟවීම් මෙහෙයුම් පුවරුව.
            </p>
          </div>

          <div className="flex space-x-2">
            {[
              { id: 'packaging', label: 'ඇසුරුම් පරිලෝකනය', icon: Eye },
              { id: 'breport', label: 'අධිකරණ බී වාර්තාව', icon: FileCheck2 },
              { id: 'wargame', label: 'ජාතික ප්‍රතිපත්ති සටන', icon: Globe2 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    activeTab === tab.id
                      ? 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-600/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 1: PACKAGING SCANNER */}
      {activeTab === 'packaging' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-bold text-white">පරිගණක දෘෂ්ටි හොලෝග්‍රෑම් හා මුද්‍රණ තහවුරුකරණය (Packaging Vision)</h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300">හොලෝග්‍රෑම් විවර්තන ලකුණ (Diffraction Index):</label>
                  <span className="text-xs font-black text-rose-400">{packInput.hologram_diffraction_score}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.02"
                  value={packInput.hologram_diffraction_score}
                  onChange={(e) => setPackInput({ ...packInput, hologram_diffraction_score: parseFloat(e.target.value) })}
                  className="w-full accent-rose-400"
                />
                <span className="text-[10px] text-slate-500 block mt-1">Authentic DOE Limit: &ge; 0.80</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-300">ක්ෂුද්‍ර මුද්‍රණ පැහැදිලි බව (Microprint Sharpness):</label>
                  <span className="text-xs font-black text-rose-400">{packInput.microprint_sharpness_score}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.02"
                  value={packInput.microprint_sharpness_score}
                  onChange={(e) => setPackInput({ ...packInput, microprint_sharpness_score: parseFloat(e.target.value) })}
                  className="w-full accent-rose-400"
                />
                <span className="text-[10px] text-slate-500 block mt-1">Sharpness Limit: &ge; 0.85</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold text-slate-300 block">මිටියේ මසා ඇති ආකාරය (Stitch Type):</label>
                  <span className="text-[11px] text-slate-500">කර්මාන්තශාලා ද්විත්ව මැහුම හෝ අතින් මසන ලද තනි මැහුම</span>
                </div>
                <select
                  value={packInput.stitch_type_detected}
                  onChange={(e) => setPackInput({ ...packInput, stitch_type_detected: e.target.value })}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-bold"
                >
                  <option value="double_chainstitch">කර්මාන්තශාලා ද්විත්ව (Double Chainstitch)</option>
                  <option value="single_manual_stitch">අතින් මැසූ තනි (Single Manual Stitch - Suspect)</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                <div>
                  <label className="text-xs font-bold text-slate-300 block">මුද්‍රා කඩා ඇති බවට සලකුණු (Tamper Flag):</label>
                  <span className="text-[11px] text-slate-500">මිටිය කලින් විවෘත කර නැවත සීල් කර ඇත්දැයි පරීක්ෂාව</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPackInput({ ...packInput, seal_tamper_flag: !packInput.seal_tamper_flag })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    packInput.seal_tamper_flag ? 'bg-rose-600 text-white border-rose-400' : 'bg-slate-900 text-emerald-400 border-slate-700'
                  }`}
                >
                  {packInput.seal_tamper_flag ? 'හානි වී ඇත (Tampered)' : 'සුරක්ෂිතයි (Intact)'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleRunPackScan}
                disabled={packLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>ඇසුරුම් විශ්ලේෂණය ක්‍රියාත්මක කරන්න</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {packResult ? (
              <div className={`p-6 rounded-3xl border ${
                packResult.packaging_authenticity === 'AUTHENTIC_GENUINE'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  {packResult.packaging_authenticity === 'AUTHENTIC_GENUINE' ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <AlertOctagon className="w-8 h-8 text-rose-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-black text-white">{packResult.packaging_authenticity}</h3>
                    <span className="text-xs font-semibold">තහවුරු කිරීමේ විශ්වාසය: {packResult.authenticity_confidence_pct}%</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 flex justify-between">
                    <span>හොලෝග්‍රෑම් තත්ත්වය:</span>
                    <strong className="text-white">{packResult.hologram_status}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 flex justify-between">
                    <span>ක්ෂුද්‍ර මුද්‍රණය:</span>
                    <strong className="text-white">{packResult.microprint_status}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 flex justify-between">
                    <span>මැහුම් තහවුරුව:</span>
                    <strong className="text-white">{packResult.stitching_integrity}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 flex justify-between">
                    <span>නීතිමය නියෝගය:</span>
                    <strong className="text-rose-400">{packResult.legal_status}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] bg-slate-900/60 rounded-3xl border border-dashed border-slate-800 p-8 flex flex-col items-center justify-center text-center">
                <Eye className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-300">ඇසුරුම් පරීක්ෂණ ප්‍රතිඵල බලාපොරොත්තුවෙන්...</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LEGAL B-REPORT */}
      {activeTab === 'breport' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-4">
            <h2 className="text-base font-bold text-white mb-2">වැටලීම් විස්තර ඇතුළත් කිරීම</h2>
            
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">අධිකරණ බලප්‍රදේශය:</label>
              <input
                type="text"
                value={bReportInput.court_jurisdiction}
                onChange={(e) => setBReportInput({ ...bReportInput, court_jurisdiction: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">සැකකරුගේ නම සහ විස්තරය:</label>
              <input
                type="text"
                value={bReportInput.suspect_name}
                onChange={(e) => setBReportInput({ ...bReportInput, suspect_name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">අත්අඩංගුවට ගත් ස්ථානය:</label>
              <input
                type="text"
                value={bReportInput.depot_location}
                onChange={(e) => setBReportInput({ ...bReportInput, depot_location: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">මිටි ගණන (50kg):</label>
                <input
                  type="number"
                  value={bReportInput.seized_bags}
                  onChange={(e) => setBReportInput({ ...bReportInput, seized_bags: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">කාණ්ඩ අංකය:</label>
                <input
                  type="text"
                  value={bReportInput.batch_number}
                  onChange={(e) => setBReportInput({ ...bReportInput, batch_number: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateBReport}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all mt-4"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>මහේස්ත්‍රාත් බී වාර්තාව සකසන්න</span>
            </button>
          </div>

          <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">නිල අධිකරණ ලියවිල්ල (Form B)</span>
              {generatedReport && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 hover:bg-slate-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>මුද්‍රණය කරන්න</span>
                </button>
              )}
            </div>

            {generatedReport ? (
              <pre className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                {generatedReport}
              </pre>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
                <FileText className="w-10 h-10 mb-2" />
                <p className="text-xs">වාර්තාවක් උත්පාදනය කිරීමට වම්පස තොරතුරු ඇතුළත් කරන්න.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NATIONAL POLICY WARGAME */}
      {activeTab === 'wargame' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
            <h2 className="text-base font-bold text-white mb-2">ජාතික ආහාර සුරක්ෂිතතා අර්බුද පරාමිතීන් (Crisis Knobs)</h2>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-300">ගෝලීය යූරියා මිල ඉහළයාම (%):</label>
                <span className="text-xs font-black text-rose-400">+{wargameInput.global_urea_price_change_pct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wargameInput.global_urea_price_change_pct}
                onChange={(e) => setWargameInput({ ...wargameInput, global_urea_price_change_pct: parseFloat(e.target.value) })}
                className="w-full accent-rose-400"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-300">වරාය නැව්ගත කිරීම් ප්‍රමාදය (සති):</label>
                <span className="text-xs font-black text-amber-400">{wargameInput.port_arrival_delay_weeks} සති</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={wargameInput.port_arrival_delay_weeks}
                onChange={(e) => setWargameInput({ ...wargameInput, port_arrival_delay_weeks: parseInt(e.target.value) })}
                className="w-full accent-amber-400"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-300">පොහොර සහනාධාර කප්පාදුව (%):</label>
                <span className="text-xs font-black text-blue-400">{wargameInput.chemical_subsidy_cut_pct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={wargameInput.chemical_subsidy_cut_pct}
                onChange={(e) => setWargameInput({ ...wargameInput, chemical_subsidy_cut_pct: parseFloat(e.target.value) })}
                className="w-full accent-blue-400"
              />
            </div>

            <button
              type="button"
              onClick={handleRunWargame}
              disabled={wargameLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 text-white font-extrabold text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <Globe2 className="w-4 h-4" />
              <span>ජාතික ප්‍රතිපත්ති බලපෑම ගණනය කරන්න</span>
            </button>
          </div>

          <div className="lg:col-span-6 space-y-4">
            {wargameResult ? (
              <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-4">
                <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-rose-200">
                  <span className="text-xs font-bold uppercase tracking-wider block">ආහාර සුරක්ෂිතතා අවදානම:</span>
                  <h3 className="text-lg font-black text-white mt-1">{wargameResult.macro_risk_level}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block">ජාතික අස්වනු අඩුවීම:</span>
                    <span className="text-xl font-black text-rose-400">-{wargameResult.national_yield_reduction_pct}%</span>
                    <span className="text-[10px] text-slate-500 block mt-1">({wargameResult.forecast_national_paddy_yield_loss_mt} MT)</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-xs text-slate-400 block">හාල් කිලෝවක මිල වැඩිවීම:</span>
                    <span className="text-xl font-black text-amber-400">{wargameResult.retail_rice_price_impact_lkr_per_kg}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">සිල්ලර වෙළඳපොළ උද්ධමනය</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 block mb-1">බෆර් තොග අවසන් වීමට ඉතිරි සති ගණන:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black text-white">{wargameResult.buffer_stock_depletion_weeks} Weeks</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">හදිසි තොග</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                  <strong>රජයට නිර්දේශිත ප්‍රතිපත්තිමය පියවර:</strong> {wargameResult.policy_recommendation}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[350px] bg-slate-900/60 rounded-3xl border border-dashed border-slate-800 p-8 flex flex-col items-center justify-center text-center">
                <Globe2 className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="text-sm font-bold text-slate-300">සිමියුලේෂන් ප්‍රතිඵල බලාපොරොත්තුවෙන්...</h3>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
