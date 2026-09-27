import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sprout,
  Building2,
  FlaskConical,
  Scale,
  MapPin,
  ArrowRight,
  Globe,
  UserCheck,
  CheckCircle2,
  Lock,
  PhoneCall,
  Sparkles,
  Award,
  Check,
  Search
} from 'lucide-react';
import { translations } from '../../i18n';

const API_BASE = "http://localhost:8000";

export default function LoginPortal({
  language = 'si',
  setLanguage = () => {},
  onLogin = () => {}
}) {
  const t = translations[language] || translations.si;

  const tr = (si, en, ta) => {
    if (language === 'ta') return ta || en || si;
    if (language === 'en') return en || si;
    return si;
  };

  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'direct'
  const [directId, setDirectId] = useState('');
  const [directRole, setDirectRole] = useState('farmer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/profiles`);
        if (res.ok) {
          const data = await res.json();
          setProfiles(data);
          return;
        }
      } catch (e) {}

      // Fallback
      setProfiles([
        {
          role: "FARMER",
          role_title_si: "ලියාපදිංචි ගොවි මහතා",
          role_title_en: "Registered Paddy Farmer",
          role_title_ta: "பதிவுசெய்த விவசாயி",
          full_name_si: "කේ. එම්. බණ්ඩාර",
          full_name_en: "K. M. Bandara",
          nic: "198425600123",
          district_si: "අනුරාධපුරය (තඹුත්තේගම)",
          district_en: "Anuradhapura (Tambuttegama)",
          land_acres: 2.5,
          crop: "paddy",
          dad_farmer_id: "DAD-ANU-1984-8841",
          avatar_icon: "👨🏽‍🌾",
          theme_color: "emerald"
        },
        {
          role: "WAREHOUSE_OFFICER",
          role_title_si: "රාජ්‍ය ගබඩා පාලක නිලධාරී",
          role_title_en: "State Warehouse Storekeeper",
          role_title_ta: "அரசு களஞ்சிய பொறுப்பாளர்",
          full_name_si: "පී. ඒ. ජයසිංහ",
          full_name_en: "P. A. Jayasinghe",
          service_id: "WMS-ASC-7701",
          facility_name_si: "තඹුත්තේගම ගොවිජන සේවා පොහොර ගබඩාව",
          facility_name_en: "Tambuttegama ASC Warehouse",
          avatar_icon: "🏢",
          theme_color: "amber"
        },
        {
          role: "LAB_CHEMIST",
          role_title_si: "ප්‍රධාන රසායන විද්‍යාඥ & SLSI විගණක",
          role_title_en: "Chief Chemist & SLSI Auditor",
          role_title_ta: "தலைமை உர வேதியியலாளர்",
          full_name_si: "ආචාර්ය එන්. විජේසිංහ (Ph.D.)",
          full_name_en: "Dr. N. Wijesinghe, Ph.D.",
          service_id: "SLSI-CH-2026",
          laboratory_name_si: "ජාතික පොහොර තත්ත්ව පරීක්ෂණාගාරය (වැලිසර)",
          laboratory_name_en: "National Quality Lab (Welisara)",
          avatar_icon: "🔬",
          theme_color: "blue"
        },
        {
          role: "FIELD_INSPECTOR",
          role_title_si: "කෘෂිකර්ම බලාත්මක කිරීමේ නිලධාරී",
          role_title_en: "Agrarian Enforcement Officer",
          role_title_ta: "கள ஆய்வு அதிகாரி",
          full_name_si: "එස්. කේ. ද සිල්වා",
          full_name_en: "S. K. De Silva",
          badge_id: "DOA-ENF-418",
          jurisdiction_si: "උතුරු මැද පළාත් වැටලීම් ඒකකය",
          jurisdiction_en: "North Central Enforcement Unit",
          avatar_icon: "⚖️",
          theme_color: "rose"
        },
        {
          role: "NATIONAL_DIRECTOR",
          role_title_si: "ජාතික පොහොර සැලසුම් අධ්‍යක්ෂ",
          role_title_en: "National Director of Fertilizer",
          role_title_ta: "தேசிய உர பணிப்பாளர்",
          full_name_si: "කේ. ආර්. හේරත් (SLAS)",
          full_name_en: "K. R. Herath, SLAS",
          service_id: "MOA-DIR-001",
          ministry: "කෘෂිකර්ම අමාත්‍යාංශය (Govijana Mandiraya)",
          avatar_icon: "🏛️",
          theme_color: "purple"
        }
      ]);
    };

    fetchProfiles();
  }, []);

  const handleSelectRole = async (targetRole, customId = null) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: targetRole,
          identifier: customId,
          demo_mode: !customId
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          try {
            localStorage.setItem('cropsafe_active_user', JSON.stringify(data.user));
          } catch (e) {}
          onLogin(data.user);
          return;
        }
      }
    } catch (e) {}

    // Fallback if offline
    const matched = profiles.find(p => p.role.toLowerCase() === targetRole.toLowerCase());
    if (matched) {
      try {
        localStorage.setItem('cropsafe_active_user', JSON.stringify(matched));
      } catch (e) {}
      onLogin(matched);
    } else {
      setErrorMsg(tr("පිවිසුම අසාර්ථක විය. කරුණාකර නැවත උත්සාහ කරන්න.", "Authentication failed. Please retry.", "உள்நுழைவு தோல்வியடைந்தது."));
    }
    setLoading(false);
  };

  const handleDirectSubmit = (e) => {
    e.preventDefault();
    if (!directId.trim()) {
      setErrorMsg(tr("කරුණාකර ඔබගේ හැඳුනුම්පත් අංකය ඇතුළත් කරන්න.", "Please enter your National Identity Card or Service ID.", "அடையாள அட்டை எண்ணை உள்ளிடவும்."));
      return;
    }
    handleSelectRole(directRole, directId.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/40 to-teal-50/50 text-slate-900 flex flex-col justify-between font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Top GovTech Authority Bar - Crisp White & Vibrant Emerald */}
      <header className="border-b border-emerald-100 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-600/30 flex-shrink-0">
            <Sprout className="w-6 h-6 text-white font-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight text-slate-900">
                Crop<span className="text-emerald-600">Safe</span> <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-black border border-emerald-300">AI GovNet v2.0</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold">
              {tr("ශ්‍රී ලංකා ජාතික පොහොර බුද්ධි සහ ගොවි සේවා ද්වාරය", "Sri Lanka National Fertilizer Intelligence & Agrarian Gateway", "இலங்கை தேசிய உர மற்றும் விவசாய போர்டல்")}
            </p>
          </div>
        </div>

        {/* Trilingual Language Selector - Vibrant Pill */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 shadow-inner">
          <Globe className="w-3.5 h-3.5 text-emerald-700 ml-2 mr-1 hidden sm:block" />
          {[
            { code: 'si', label: 'සිංහල' },
            { code: 'en', label: 'English' },
            { code: 'ta', label: 'தமிழ்' }
          ].map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                language === lang.code
                  ? 'bg-emerald-600 text-white shadow-sm font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Authentication Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        
        {/* Hero Title & National Accreditation */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black shadow-xs mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>{tr("කෘෂිකර්ම දෙපාර්තමේන්තුව (DOA) සහ DAD නිල අනුමැතිය ලත් ජාතික පද්ධතිය", "Approved by Department of Agriculture & Agrarian Development", "விவசாய திணைக்களத்தின் உத்தியோகபூர்வ போர்டல்")}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight leading-tight">
            {tr("ඔබගේ නිල භූමිකාව තෝරා පද්ධතියට පිවිසෙන්න", "Select Your Official Role to Enter Portal", "உங்கள் உத்தியோகபூர்வ பாத்திரத்தை தேர்வுசெய்க")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
            {tr(
              "ගොවි ප්‍රජාව, රාජ්‍ය ගබඩා පාලකයන්, පරීක්ෂණාගාර රසායන විද්‍යාඥයන් සහ බලාත්මක කිරීමේ නිලධාරීන් සඳහා වෙන් වූ අධි-වේගී ඒකාබද්ධ ද්වාරය.",
              "Dedicated, secure portals for Farmers, State Storekeepers, Forensic Chemist Auditors, and Enforcement Inspectors.",
              "விவசாயிகள், களஞ்சிய அதிகாரிகள் மற்றும் ஆய்வாளர்களுக்கான பிரத்யேக டிஜிட்டல் தளம்."
            )}
          </p>
        </div>

        {/* Tab Controls: 1-Click Verified vs Direct ID */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-2xl border-2 border-emerald-200 shadow-md flex max-w-md w-full">
            <button
              type="button"
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'demo'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50'
              }`}
            >
              <span>🏛️</span>
              <span>{tr("1-Click නිල ගිණුම් (Verified Roles)", "1-Click Official Roles", "உடனடி உள்நுழைவு")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'direct'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-emerald-50'
              }`}
            >
              <span>🆔</span>
              <span>{tr("හැඳුනුම්පත මගින් (NIC / ID)", "NIC / Service ID Login", "அடையாள அட்டை வழி")}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="max-w-md mx-auto mb-6 p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-900 text-xs font-bold text-center shadow-xs">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* TAB 1: 1-CLICK VERIFIED ROLE CARDS (RADIANT HIGH-CONTRAST PALETTE) */}
        {activeTab === 'demo' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* 1. FARMER PROFILE - LUSH EMERALD THEME */}
            <div 
              onClick={() => handleSelectRole('farmer')}
              className="bg-gradient-to-b from-white via-emerald-50/50 to-emerald-100/60 border-2 border-emerald-500 hover:border-emerald-600 rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/20 group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black px-3.5 py-1 rounded-bl-2xl font-mono uppercase tracking-wider shadow-xs">
                🌾 PRIMARY PORTAL
              </div>

              <div>
                <div className="flex items-center space-x-3.5 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-3xl shadow-md shadow-emerald-600/30 group-hover:scale-110 transition-transform flex-shrink-0">
                    👨🏽‍🌾
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-950 group-hover:text-emerald-800 transition-colors">
                      {tr("කේ. එම්. බණ්ඩාර", "K. M. Bandara", "கே. எம். பண்டார")}
                    </h2>
                    <p className="text-xs text-emerald-800 font-extrabold flex items-center space-x-1">
                      <span>{tr("ලියාපදිංචි ගොවි මහතා", "Registered Paddy Farmer", "விவசாயி")}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                    </p>
                    <span className="text-[11px] text-slate-500 font-mono font-bold block mt-0.5">
                      NIC: 198425600123
                    </span>
                  </div>
                </div>

                <div className="bg-white/95 rounded-2xl p-3.5 border border-emerald-200/80 shadow-xs space-y-2 text-xs text-slate-700 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("කලාපය:", "Location:", "இடம்:")}</span>
                    <span className="font-black text-slate-900">{tr("අනුරාධපුරය (තඹුත්තේගම)", "Anuradhapura (Tambuttegama)", "அனுராதபுரம்")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("කුඹුරු ඉඩම:", "Land Extent:", "நிலம்:")}</span>
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      2.5 {tr("අක්කර (වී වගාව)", "Acres (Paddy)", "ஏக்கர்")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("DAD අංකය:", "DAD ID:", "DAD எண்:")}</span>
                    <span className="font-mono text-[11px] font-bold text-slate-800">DAD-ANU-1984-8841</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-600/30 group-hover:shadow-lg"
              >
                <span>{tr("ගොවි පුවරුවට පිවිසෙන්න", "Enter Farmer Portal", "விவசாயி போர்டல்")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2. STATE WAREHOUSE STOREKEEPER - WARM AMBER THEME */}
            <div 
              onClick={() => handleSelectRole('warehouse')}
              className="bg-gradient-to-b from-white via-amber-50/50 to-amber-100/60 border-2 border-amber-400 hover:border-amber-500 rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-amber-500/10 hover:shadow-xl hover:shadow-amber-500/20 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3.5 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center text-3xl shadow-md shadow-amber-500/30 group-hover:scale-110 transition-transform flex-shrink-0">
                    🏢
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-950 group-hover:text-amber-800 transition-colors">
                      {tr("පී. ඒ. ජයසිංහ", "P. A. Jayasinghe", "பி. ஏ. ஜயசிங்க")}
                    </h2>
                    <p className="text-xs text-amber-800 font-extrabold flex items-center space-x-1">
                      <span>{tr("රාජ්‍ය ගබඩා පාලක (Storekeeper)", "State Storekeeper", "களஞ்சிய அதிகாரி")}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 inline" />
                    </p>
                    <span className="text-[11px] text-slate-500 font-mono font-bold block mt-0.5">
                      Service ID: WMS-ASC-7701
                    </span>
                  </div>
                </div>

                <div className="bg-white/95 rounded-2xl p-3.5 border border-amber-200/80 shadow-xs space-y-2 text-xs text-slate-700 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("ගබඩා සංකීර්ණය:", "Facility:", "களஞ்சியம்:")}</span>
                    <span className="font-black text-slate-900 text-[11px]">{tr("තඹුත්තේගම ASC ගබඩාව", "Tambuttegama ASC Warehouse", "தம்புக்தேகம")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("විශේෂ කාර්යය:", "Capability:", "செயல்பாடு:")}</span>
                    <span className="font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                      {tr("ගොවි QR ස්කෑන් & නිකුත් කිරීම", "QR Scan & Quota Dispense", "QR ஸ்கேன்")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("අනුබද්ධය:", "Agency:", "நிறுவனம்:")}</span>
                    <span className="font-bold text-slate-800">{tr("ලක්පොහොර / DAD", "Lakpohora / DAD", "லக் உரம்")}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-amber-500/20"
              >
                <span>{tr("ගබඩා පද්ධතියට පිවිසෙන්න", "Enter Warehouse WMS", "களஞ்சிய போர்டல்")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 3. LAB CHEMIST AUDITOR - COBALT ELECTRIC BLUE THEME */}
            <div 
              onClick={() => handleSelectRole('chemist')}
              className="bg-gradient-to-b from-white via-blue-50/50 to-blue-100/60 border-2 border-blue-400 hover:border-blue-500 rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3.5 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-3xl shadow-md shadow-blue-600/30 group-hover:scale-110 transition-transform flex-shrink-0">
                    🔬
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-950 group-hover:text-blue-800 transition-colors">
                      {tr("ආචාර්ය එන්. විජේසිංහ", "Dr. N. Wijesinghe, Ph.D.", "டாக்டர் என். விஜேசிங்க")}
                    </h2>
                    <p className="text-xs text-blue-800 font-extrabold flex items-center space-x-1">
                      <span>{tr("ප්‍රධාන රසායන විද්‍යාඥ & SLSI", "Chief Chemist & SLSI Auditor", "தலைமை வேதியியலாளர்")}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline" />
                    </p>
                    <span className="text-[11px] text-slate-500 font-mono font-bold block mt-0.5">
                      Service ID: SLSI-CH-2026
                    </span>
                  </div>
                </div>

                <div className="bg-white/95 rounded-2xl p-3.5 border border-blue-200/80 shadow-xs space-y-2 text-xs text-slate-700 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("රසායනාගාරය:", "Laboratory:", "ஆய்வகம்:")}</span>
                    <span className="font-black text-slate-900 text-[11px]">{tr("ජාතික පොහොර පරීක්ෂණාගාරය", "National Quality Lab, Welisara", "தேசிய ஆய்வகம்")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("ප්‍රමිතිය:", "Accreditation:", "தரம்:")}</span>
                    <span className="font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      SLSI 644 / ISO 17025
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("කාර්යභාරය:", "Role:", "பணி:")}</span>
                    <span className="font-bold text-slate-800">{tr("Spectrometry & CoA සහතික", "Spectrometry & CoA Issuance", "CoA சான்றிதழ்")}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-600/30"
              >
                <span>{tr("රසායනාගාරයට පිවිසෙන්න", "Enter Chemist LIMS", "ஆய்வக போர்டல்")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 4. FIELD INSPECTOR & LEGAL ENFORCEMENT - CRIMSON / ROSE THEME */}
            <div 
              onClick={() => handleSelectRole('inspector')}
              className="bg-gradient-to-b from-white via-rose-50/50 to-rose-100/60 border-2 border-rose-400 hover:border-rose-500 rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-rose-500/10 hover:shadow-xl hover:shadow-rose-500/20 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3.5 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 text-white flex items-center justify-center text-3xl shadow-md shadow-rose-600/30 group-hover:scale-110 transition-transform flex-shrink-0">
                    ⚖️
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-950 group-hover:text-rose-800 transition-colors">
                      {tr("එස්. කේ. ද සිල්වා", "S. K. De Silva", "எஸ். கே. டி சில்வா")}
                    </h2>
                    <p className="text-xs text-rose-800 font-extrabold flex items-center space-x-1">
                      <span>{tr("බලාත්මක කිරීමේ නිලධාරී", "Agrarian Enforcement Officer", "கள ஆய்வு அதிகாரி")}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 inline" />
                    </p>
                    <span className="text-[11px] text-slate-500 font-mono font-bold block mt-0.5">
                      Badge: DOA-ENF-418
                    </span>
                  </div>
                </div>

                <div className="bg-white/95 rounded-2xl p-3.5 border border-rose-200/80 shadow-xs space-y-2 text-xs text-slate-700 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("බලාත්මක කලාපය:", "Command Zone:", "வலயம்:")}</span>
                    <span className="font-black text-slate-900 text-[11px]">{tr("උතුරු මැද පළාත් වැටලීම් ඒකකය", "North Central Command", "வடமத்திய பிரிவு")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("නීතිමය බලය:", "Legal Authority:", "அதிகாரம்:")}</span>
                    <span className="font-black text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                      {tr("පොහොර පනත 34 වගන්තිය", "Fertilizer Act Sec 34", "உர சட்டம் பிரிவு 34")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("විශේෂාංගය:", "Feature:", "அம்சம்:")}</span>
                    <span className="font-bold text-slate-800">{tr("අධිකරණ B-වාර්තා & Wargame", "Court B-Reports & Wargame", "நீதிமன்ற அறிக்கை")}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-rose-600/30"
              >
                <span>{tr("බලාත්මක ද්වාරයට පිවිසෙන්න", "Enter Inspector Portal", "ஆய்வு போர்டல்")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 5. NATIONAL DIRECTOR & GIS STRATEGY - ROYAL PURPLE THEME */}
            <div 
              onClick={() => handleSelectRole('director')}
              className="bg-gradient-to-b from-white via-purple-50/50 to-purple-100/60 border-2 border-purple-400 hover:border-purple-500 rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.02] shadow-lg shadow-purple-500/10 hover:shadow-xl hover:shadow-purple-500/20 group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3.5 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center text-3xl shadow-md shadow-purple-600/30 group-hover:scale-110 transition-transform flex-shrink-0">
                    🏛️
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-950 group-hover:text-purple-800 transition-colors">
                      {tr("කේ. ආර්. හේරත් (SLAS)", "K. R. Herath, SLAS", "கே. ஆர். ஹேரத்")}
                    </h2>
                    <p className="text-xs text-purple-800 font-extrabold flex items-center space-x-1">
                      <span>{tr("ජාතික සැලසුම් අධ්‍යක්ෂ", "National Fertilizer Director", "தேசிய பணிப்பாளர்")}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 inline" />
                    </p>
                    <span className="text-[11px] text-slate-500 font-mono font-bold block mt-0.5">
                      ID: MOA-DIR-001
                    </span>
                  </div>
                </div>

                <div className="bg-white/95 rounded-2xl p-3.5 border border-purple-200/80 shadow-xs space-y-2 text-xs text-slate-700 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("අමාත්‍යාංශය:", "Ministry:", "அமைச்சு:")}</span>
                    <span className="font-black text-slate-900 text-[11px]">{tr("කෘෂිකර්ම අමාත්‍යාංශය", "Ministry of Agriculture", "விவசாய அமைச்சு")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("ප්‍රධාන මෙවලම:", "Key Tool:", "கருவி:")}</span>
                    <span className="font-black text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      {tr("දිස්ත්‍රික් 25 GIS සිතියම", "25-District GIS Buffer Map", "GIS வரைபடம்")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">{tr("නිරීක්ෂණය:", "Monitoring:", "கண்காணிப்பு:")}</span>
                    <span className="font-bold text-slate-800">{tr("වරාය නෞකා & සංචිත ආරක්ෂාව", "Port Cargo & Buffer Stocks", "துறைமுக சரக்கு")}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-purple-600/30"
              >
                <span>{tr("ජාතික සිතියමට පිවිසෙන්න", "Enter National GIS Portal", "தேசிய போர்டல்")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: DIRECT NIC / SERVICE ID LOGIN FORM */}
        {activeTab === 'direct' && (
          <div className="max-w-md mx-auto w-full bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-xl">
            <form onSubmit={handleDirectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">
                  {tr("ඔබගේ භූමිකාව තෝරන්න:", "Select Role:", "பாத்திரத்தை தேர்ந்தெடுக்கவும்:")}
                </label>
                <select
                  value={directRole}
                  onChange={(e) => setDirectRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-sm font-bold focus:outline-none focus:border-emerald-600"
                >
                  <option value="farmer">👨🏽‍🌾 {tr("ගොවි මහතා (Farmer - NIC)", "Farmer (NIC)", "விவசாயி")}</option>
                  <option value="warehouse">🏢 {tr("ගබඩා පාලක නිලධාරී (Storekeeper)", "Warehouse Storekeeper", "களஞ்சிய அதிகாரி")}</option>
                  <option value="chemist">🔬 {tr("රසායන විද්‍යාඥ (Lab Chemist)", "Lab Chemist", "வேதியியலாளர்")}</option>
                  <option value="inspector">⚖️ {tr("පරීක්ෂක නිලධාරී (Field Inspector)", "Field Inspector", "ஆய்வு அதிகாரி")}</option>
                  <option value="director">🏛️ {tr("ජාතික සැලසුම් අධ්‍යක්ෂ (National Director)", "National Director", "தேசிய பணிப்பாளர்")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">
                  {directRole === 'farmer' 
                    ? tr("ජාතික හැඳුනුම්පත් අංකය (NIC):", "National Identity Card (NIC):", "தேசிய அடையாள அட்டை எண்:")
                    : tr("සේවා හැඳුනුම්පත් අංකය (Service ID / Badge):", "Service ID / Badge ID:", "சேவை அடையாள எண்:")}
                </label>
                <input
                  type="text"
                  value={directId}
                  onChange={(e) => setDirectId(e.target.value)}
                  placeholder={directRole === 'farmer' ? "198425600123 හෝ 761234567V" : "WMS-ASC-7701"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-sm font-mono font-bold focus:outline-none focus:border-emerald-600"
                />
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  {directRole === 'farmer'
                    ? tr("DAD යාය ලේඛනයේ ලියාපදිංචි 10 හෝ 12 ඉලක්කම් හැඳුනුම්පත.", "10 or 12 digit NIC registered with DAD Yaya Cadastre.", "பதிவு செய்யப்பட்ட அடையாள எண்.")
                    : tr("රාජ්‍ය ආයතනික සේවා හැඳුනුම්පත් අංකය.", "Institutional service credential.", "அரசு சேவை எண்.")}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-600/30"
                >
                  {loading ? (
                    <span>{tr("සත්‍යාපනය වෙමින් පවතී...", "Authenticating...", "சரிபார்க்கிறது...")}</span>
                  ) : (
                    <>
                      <span>{tr("පද්ධතියට ඇතුල් වන්න", "Authenticate & Enter", "உள்நுழைக")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-100 bg-white/80 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold">© 2026 CropSafe AI • Sabaragamuwa University of Sri Lanka (DS3206 Capstone Project II)</span>
          <div className="flex items-center space-x-3 text-slate-600 text-[11px] font-bold">
            <span className="text-emerald-700 font-black">✓ DOA Certified</span>
            <span>•</span>
            <span className="text-blue-700 font-black">✓ SLSI 644 Standards</span>
            <span>•</span>
            <span className="text-amber-700 font-black">✓ DAD GovNet Integration</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
