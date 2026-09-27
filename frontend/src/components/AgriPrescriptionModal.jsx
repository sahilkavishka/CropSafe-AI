import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Share2, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  User, 
  Scale, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

export default function AgriPrescriptionModal({
  isOpen,
  onClose,
  farmerProfile = {},
  dosageData = {},
  landAcres = 1.0,
  crop = 'paddy',
  variety = 'Bg 352 (3.5 Months)',
  zone = 'Dry Zone',
  season = 'Maha',
  language = 'si'
}) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const tr = (si, en, ta) => {
    if (language === 'ta') return ta || en || si;
    if (language === 'en') return en || si;
    return si;
  };

  const rxId = dosageData.prescription_id || `RX-LK-2026-${(farmerProfile.nic || '841234567').slice(-4)}-${Date.now().toString().slice(-4)}`;
  const dateStr = new Date().toLocaleDateString('si-LK', { year: 'numeric', month: 'long', day: 'numeric' });

  // Calculate bags from dosageData or fallback formulas
  const ureaBags = dosageData.urea_bags_50kg ?? Math.ceil(landAcres * 2.2);
  const tspBags = dosageData.tsp_bags_50kg ?? Math.ceil(landAcres * 0.7);
  const mopBags = dosageData.mop_bags_50kg ?? Math.ceil(landAcres * 0.8);
  const totalBags = ureaBags + tspBags + mopBags;

  const subsidizedCost = totalBags * 2500;
  const commercialCost = ureaBags * 8500 + tspBags * 9200 + mopBags * 8900;
  const savings = Math.max(0, commercialCost - subsidizedCost);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `🌾 *CropSafe AI - නිල කෘෂි පොහොර බෙහෙත් වට්ටෝරුව*
📄 අංකය: ${rxId}
📅 දිනය: ${dateStr}
👤 ගොවි මහතා: ${farmerProfile.name || 'කේ. එම්. බණ්ඩාර'} (NIC: ${farmerProfile.nic || '198425600123'})
📍 ප්‍රදේශය: ${farmerProfile.district || 'Anuradhapura'} (${farmerProfile.ascDivision || 'තඹුත්තේගම ගොවිජන සේවා මධ්‍යස්ථානය'})
🌾 බෝගය: ${crop === 'paddy' ? 'වී වගාව' : crop} (${variety})
📐 ඉඩම් ප්‍රමාණය: අක්කර ${landAcres} (${(landAcres * 0.404686).toFixed(2)} ha) | ${zone} | ${season} කන්නය

📦 *DOA නිර්දේශිත පොහොර මිටි (50kg Bags)*:
• යූරියා (Urea 46% N): මිටි ${ureaBags}
• ටී.එස්.පී (TSP 46% P2O5): මිටි ${tspBags}
• එම්.ඕ.පී (MOP 60% K2O): මිටි ${mopBags}
👉 මුළු මිටි ගණන: ${totalBags}

💰 සහනාධාර පංගුවේ මුළු පිරිවැය: රු. ${subsidizedCost.toLocaleString()}
💵 ගොවියාට ඉතිරිවන මුදල: රු. ${savings.toLocaleString()}

✅ කෘෂිකර්ම දෙපාර්තමේන්තුවේ (DOA) ප්‍රමිතීන්ට අනුකූලව සකසන ලදී.
🌐 CropSafe AI: https://cropsafe.lk`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = () => {
    const text = `CropSafe AI Prescription ${rxId} | Farmer: ${farmerProfile.name} | Total Bags: ${totalBags} (Urea: ${ureaBags}, TSP: ${tspBags}, MOP: ${mopBags}) | Subsidized Cost: LKR ${subsidizedCost}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      {/* Modal Card */}
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-300 w-full max-w-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header - Not printed */}
        <div className="print:hidden p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
              📜
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {tr("නිල කෘෂි පොහොර බෙහෙත් වට්ටෝරුව", "Official Agronomic Fertilizer Prescription", "உர பரிந்துரை சீட்டு")}
              </h2>
              <p className="text-[11px] text-emerald-200">
                {tr("DOA ප්‍රමිතීන්ට අනුකූල මුද්‍රණය කළ හැකි සහ බෙදාගත හැකි සහතිකය", "Printable and shareable DOA-compliant agronomic slip", "அச்சிடக்கூடிய மற்றும் பகிரக்கூடிய சான்றிதழ்")}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Prescription Body */}
        <div id="agri-prescription-print-area" className="p-5 sm:p-7 overflow-y-auto space-y-5 text-slate-800 bg-white">
          
          {/* Slip Header */}
          <div className="border-b-2 border-emerald-700 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🌾</span>
                <span className="text-lg font-black tracking-tight text-emerald-950 uppercase">CropSafe AI • ශ්‍රී ලංකා</span>
              </div>
              <p className="text-[11px] text-slate-600 font-bold mt-0.5">
                කෘෂිකර්ම දෙපාර්තමේන්තුව (DOA) හා ගොවිජන සංවර්ධන දෙපාර්තමේන්තු ප්‍රමිති මාර්ගෝපදේශකය
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-[11px] border border-emerald-300">
                {rxId}
              </span>
              <p className="text-[10px] text-slate-500 font-bold mt-1">දිනය: {dateStr}</p>
            </div>
          </div>

          {/* Farmer & Field Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">ගොවි මහතා:</span>
              <span className="font-black text-slate-900">{farmerProfile.name || 'කේ. එම්. බණ්ඩාර'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">ජා.හැ. අංකය (NIC):</span>
              <span className="font-bold text-slate-800">{farmerProfile.nic || '198425600123'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">ගොවිජන සේවා:</span>
              <span className="font-bold text-slate-800">{farmerProfile.ascDivision || 'තඹුත්තේගම ASC'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">දිස්ත්‍රික්කය:</span>
              <span className="font-bold text-slate-800">{farmerProfile.district || 'Anuradhapura'}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">වගා බෝගය:</span>
              <span className="font-black text-emerald-900">{crop === 'paddy' ? 'වී වගාව' : crop}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">ප්‍රභේදය:</span>
              <span className="font-bold text-slate-800">{variety}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">ඉඩම් ප්‍රමාණය:</span>
              <span className="font-black text-slate-900">{landAcres} අක්කර ({(landAcres * 0.404686).toFixed(2)} ha)</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">කන්නය & කලාපය:</span>
              <span className="font-bold text-slate-800">{season} • {zone}</span>
            </div>
          </div>

          {/* Prescribed Dosage Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center space-x-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-700" />
              <span>නිර්දේශිත 50kg පොහොර මිටි ප්‍රමාණය (Prescribed Fertilizer Bags)</span>
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-emerald-900 text-white font-bold text-[11px]">
                  <tr>
                    <th className="p-3">පොහොර වර්ගය</th>
                    <th className="p-3 text-center">මිටි ගණන (50kg)</th>
                    <th className="p-3 text-center">කිලෝග්‍රෑම්</th>
                    <th className="p-3 text-right">සහනාධාර මිල (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      🌾 යූරියා (Prilled Urea 46% N)
                      <span className="block text-[10px] text-slate-500 font-normal">මතුපිට යෙදීම් 3 සඳහා (දින 14, 28, 45)</span>
                    </td>
                    <td className="p-3 text-center font-black text-emerald-800 text-sm">{ureaBags}</td>
                    <td className="p-3 text-center text-slate-600">{ureaBags * 50} kg</td>
                    <td className="p-3 text-right font-bold text-slate-900">රු. {(ureaBags * 2500).toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      ⚫ ත්‍රිත්ව සුපර් පොස්පේට් (TSP 46% P2O5)
                      <span className="block text-[10px] text-slate-500 font-normal">මූලික පොහොර ලෙස (බිම් සැකසීමේ අවසන් අදියර)</span>
                    </td>
                    <td className="p-3 text-center font-black text-emerald-800 text-sm">{tspBags}</td>
                    <td className="p-3 text-center text-slate-600">{tspBags * 50} kg</td>
                    <td className="p-3 text-right font-bold text-slate-900">රු. {(tspBags * 2500).toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">
                      🔴 මියුරියේට් ඔෆ් පොටෑෂ් (MOP 60% K2O)
                      <span className="block text-[10px] text-slate-500 font-normal">මූලික සහ කරල් පීදෙන අවස්ථාව සඳහා (දින 45)</span>
                    </td>
                    <td className="p-3 text-center font-black text-emerald-800 text-sm">{mopBags}</td>
                    <td className="p-3 text-center text-slate-600">{mopBags * 50} kg</td>
                    <td className="p-3 text-right font-bold text-slate-900">රු. {(mopBags * 2500).toLocaleString()}</td>
                  </tr>
                </tbody>
                <tfoot className="bg-emerald-50/80 font-black text-emerald-950 border-t-2 border-emerald-600">
                  <tr>
                    <td className="p-3 text-xs uppercase">මුළු එකතුව (Total Allocation)</td>
                    <td className="p-3 text-center text-base font-black text-emerald-900">{totalBags}</td>
                    <td className="p-3 text-center text-xs">{totalBags * 50} kg</td>
                    <td className="p-3 text-right text-sm text-emerald-900">රු. {subsidizedCost.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Subsidy Benefit Summary Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">💰</span>
              <div>
                <span className="font-black text-amber-950">රජයේ පොහොර සහනාධාර වාසිය:</span>
                <p className="text-[11px] text-amber-800">
                  සාමාන්‍ය විවෘත වෙළඳපල අගය රු. {commercialCost.toLocaleString()} ක් වන අතර ගොවියාට ඉතිරිවන මුදල:
                </p>
              </div>
            </div>
            <span className="font-black text-sm sm:text-base text-emerald-800 whitespace-nowrap">
              + රු. {savings.toLocaleString()}
            </span>
          </div>

          {/* Slip Footer: Signatures & Verification Badge */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 items-center text-[11px] text-slate-600">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">පරීක්ෂා කළ ක්‍රමය:</span>
              <span className="font-bold text-slate-800 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                <span>DOA Batalagoda Rice Model</span>
              </span>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">වලංගු කාලය:</span>
              <span className="font-bold text-slate-800">2026/27 {season} කන්නය සඳහා</span>
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center justify-end space-x-2">
              <div className="text-right">
                <span className="text-[9px] font-bold text-emerald-800 block uppercase">CropSafe Verified</span>
                <span className="text-[10px] font-mono text-slate-500">SECURE-DOA-HASH</span>
              </div>
              <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-mono text-xs font-black shadow-xs">
                QR
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar - Not printed */}
        <div className="print:hidden p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyText}
            className="py-2.5 px-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-all flex items-center space-x-1.5 shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
            <span>{copied ? "පිටපත් විය ✓" : "විස්තර පිටපත් කරන්න"}</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>WhatsApp මගින් යවන්න</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>මුද්‍රණය / PDF සුරකින්න</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
