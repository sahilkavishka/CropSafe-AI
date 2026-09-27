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
  Award
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

  // Load profiles from backend or fallback to built-in verified profiles
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
          district_en: "Anuradhapura (Thambuththegama)",
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 font-sans">
      
      {/* Top GovTech Authority Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <Sprout className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-white">
                Crop<span className="text-emerald-400">Safe</span> <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">AI GovNet</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {tr("ශ්‍රී ලංකා ජාතික පොහොර බුද්ධි සහ ගොවි සේවා ද්වාරය", "Sri Lanka National Fertilizer Intelligence & Agrarian Gateway", "இலங்கை தேசிய உர மற்றும் விவசாய போர்டல்")}
            </p>
          </div>
        </div>

        {/* Trilingual Language Selector */}
        <div className="flex items-center bg-slate-800/80 rounded-xl p-1 border border-slate-700">
          <Globe className="w-3.5 h-3.5 text-emerald-400 ml-2 mr-1 hidden sm:block" />
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
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Authentication Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        
        {/* Hero Title & National Accreditation */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{tr("කෘෂිකර්ම දෙපාර්තමේන්තුව (DOA) සහ DAD නිල අනුමැතිය ලත් පද්ධතිය", "Approved by Department of Agriculture & Agrarian Development", "விவசாய திணைக்களத்தின் உத்தியோகபூர்வ போர்டல்")}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {tr("ඔබගේ නිල භූමිකාව තෝරා පිවිසෙන්න", "Select Your Official Role to Enter Portal", "உங்கள் உத்தியோகபூர்வ பாத்திரத்தை தேர்வுசெய்க")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {tr(
              "ගොවි ප්‍රජාවට, රාජ්‍ය ගබඩා පාලකයන්ට, පරීක්ෂණාගාර විද්‍යාඥයන්ට සහ බලාත්මක කිරීමේ නිලධාරීන්ට වෙන් වූ ඒකාබද්ධ ඩිජිටල් පද්ධතිය.",
              "Dedicated, secure portals for Farmers, State Storekeepers, Forensic Chemist Auditors, and Enforcement Inspectors.",
              "விவசாயிகள், களஞ்சிய அதிகாரிகள் மற்றும் ஆய்வாளர்களுக்கான பிரத்யேக டிஜிட்டல் தளம்."
            )}
          </p>
        </div>

        {/* Tab Controls: 1-Click Verified vs Direct ID */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-800/80 p-1 rounded-2xl border border-slate-700 flex max-w-md w-full">
            <button
              type="button"
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'demo'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🏛️</span>
              <span>{tr("1-Click නිල ගිණුම් (Verified Roles)", "1-Click Official Roles", "உடனடி உத்தியோகபூர்வ உள்நுழைவு")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'direct'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🆔</span>
              <span>{tr("හැඳුනුම්පත මගින් (NIC / ID)", "NIC / Service ID Login", "அடையாள அட்டை வழி")}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="max-w-md mx-auto mb-6 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* TAB 1: 1-CLICK VERIFIED ROLE CARDS */}
        {activeTab === 'demo' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. FARMER PROFILE */}
            <div 
              onClick={() => handleSelectRole('farmer')}
              className="bg-slate-800/70 hover:bg-slate-800 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-bl-xl font-mono uppercase tracking-wider">
                PRIMARY PORTAL
              </div>

              <div>
                <div className="flex items-center space-x-3.5 mb-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                    👨🏽‍🌾
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                      {tr("කේ. එම්. බණ්ඩාර", "K. M. Bandara", "கே. எம். பண்டார")}
                    </h2>
                    <p className="text-xs text-emerald-400 font-bold">
                      {tr("ලියාපදිංචි ගොවි මහතා (Farmer)", "Registered Farmer", "விவசாயி")}
                    </p>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      NIC: 198425600123
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/60 space-y-1.5 text-xs text-slate-300 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("කලාපය:", "Location:", "இடம்:")}</span>
                    <span className="font-bold text-white">{tr("අනුරාධපුරය (තඹුත්තේගම)", "Anuradhapura (Tambuttegama)", "அனுராதபுரம்")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("කුඹුරු ඉඩම:", "Land Extent:", "நிலம்:")}</span>
                    <span className="font-bold text-emerald-300">2.5 {tr("අක්කර (වී වගාව)", "Acres (Paddy)", "ஏக்கர்")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("DAD අංකය:", "DAD ID:", "DAD எண்:")}</span>
                    <span className="font-mono text-[11px] text-slate-300">DAD-ANU-1984-8841</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md group-hover:shadow-emerald-500/20"
              >
                <span>{tr("ගොවි පුවරුවට පිවිසෙන්න", "Enter Farmer Portal", "விவசாயி போர்டல்")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2. STATE WAREHOUSE STOREKEEPER */}
            <div 
              onClick={() => handleSelectRole('warehouse')}
              className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/70 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3.5 mb-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                    🏢
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                      {tr("පී. ඒ. ජයසිංහ", "P. A. Jayasinghe", "பி. ஏ. ஜயசிங்க")}
                    </h2>
                    <p className="text-xs text-amber-400 font-bold">
                      {tr("රාජ්‍ය ගබඩා පාලක (Storekeeper)", "State Warehouse Storekeeper", "களஞ்சிய பொறுப்பாளர்")}
                    </p>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      Service ID: WMS-ASC-7701
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/60 space-y-1.5 text-xs text-slate-300 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("ගබඩා සංකීර්ණය:", "Facility:", "களஞ்சியம்:")}</span>
                    <span className="font-bold text-white text-[11px]">{tr("තඹුත්තේගම ASC ගබඩාව", "Tambuttegama ASC Warehouse", "தம்புக்தேகம")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("විශේෂ කාර්යය:", "Capability:", "செயல்பாடு:")}</span>
                    <span className="font-bold text-amber-300">{tr("ගොවි QR ස්කෑන් & නිකුත් කිරීම", "QR Scan & Quota Dispense", "QR ஸ்கேன்")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("අනුබද්ධය:", "Agency:", "நிறுவனம்:")}</span>
                    <span className="text-[11px] text-slate-300">{tr("ලක්පොහොර / DAD", "Lakpohora / DAD", "லக் உரம்")}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md"
              >
                <span>{tr("ගබඩා පද්ධතියට පිවිසෙන්න", "Enter Warehouse WMS", "களஞ்சிய போர்டல்")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 3. LAB CHEMIST AUDITOR */}
            <div 
              onClick={() => handleSelectRole('chemist')}
              className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/70 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3.5 mb-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-950/60 border border-blue-500/40 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                    🔬
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white group-hover:text-blue-300 transition-colors">
                      {tr("ආචාර්ය එන්. විජේසිංහ", "Dr. N. Wijesinghe, Ph.D.", "டாக்டர் என். விஜேசிங்க")}
                    </h2>
                    <p className="text-xs text-blue-400 font-bold">
                      {tr("ප්‍රධාන රසායන විද්‍යාඥ (Chemist)", "Chief Lab Chemist & SLSI Auditor", "தலைமை வேதியியலாளர்")}
                    </p>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      Service ID: SLSI-CH-2026
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/60 space-y-1.5 text-xs text-slate-300 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("රසායනාගාරය:", "Laboratory:", "ஆய்வகம்:")}</span>
                    <span className="font-bold text-white text-[11px]">{tr("ජාතික පොහොර පරීක්ෂණාගාරය", "National Quality Lab, Welisara", "தேசிய ஆய்வகம்")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("ප්‍රමිතිය:", "Accreditation:", "தரம்:")}</span>
                    <span className="font-bold text-blue-300">SLSI 644 / ISO 17025</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("කාර්යභාරය:", "Role:", "பணி:")}</span>
                    <span className="text-[11px] text-slate-300">{tr("Spectrometry & CoA සහතික", "Spectrometry & CoA Issuance", "CoA சான்றிதழ்")}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md"
              >
                <span>{tr("රසායනාගාරයට පිවිසෙන්න", "Enter Chemist LIMS", "ஆய்வக போர்டல்")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 4. FIELD INSPECTOR & LEGAL ENFORCEMENT */}
            <div 
              onClick={() => handleSelectRole('inspector')}
              className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/70 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3.5 mb-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                    ⚖️
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white group-hover:text-rose-300 transition-colors">
                      {tr("එස්. කේ. ද සිල්වා", "S. K. De Silva", "எஸ். கே. டி சில்வா")}
                    </h2>
                    <p className="text-xs text-rose-400 font-bold">
                      {tr("බලාත්මක කිරීමේ නිලධාරී (Inspector)", "Agrarian Enforcement Officer", "கள ஆய்வு அதிகாரி")}
                    </p>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      Badge: DOA-ENF-418
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/60 space-y-1.5 text-xs text-slate-300 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("බලාත්මක කලාපය:", "Command Zone:", "வலயம்:")}</span>
                    <span className="font-bold text-white text-[11px]">{tr("උතුරු මැද පළාත් වැටලීම් ඒකකය", "North Central Command", "வடமத்திய பிரிவு")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("නීතිමය බලය:", "Legal Authority:", "அதிகாரம்:")}</span>
                    <span className="font-bold text-rose-300">{tr("පොහොර පනත 34 වගන්තිය", "Fertilizer Act Sec 34", "உர சட்டம் பிரிவு 34")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("විශේෂාංගය:", "Feature:", "அம்சம்:")}</span>
                    <span className="text-[11px] text-slate-300">{tr("අධිකරණ B-වාර්තා & Wargame", "Court B-Reports & Wargame", "நீதிமன்ற அறிக்கை")}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md"
              >
                <span>{tr("බලාත්මක ද්වාරයට පිවිසෙන්න", "Enter Inspector Portal", "ஆய்வு போர்டல்")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 5. NATIONAL DIRECTOR & GIS STRATEGY */}
            <div 
              onClick={() => handleSelectRole('director')}
              className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/70 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3.5 mb-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                    🏛️
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white group-hover:text-purple-300 transition-colors">
                      {tr("කේ. ආර්. හේරත් (SLAS)", "K. R. Herath, SLAS", "கே. ஆர். ஹேரத்")}
                    </h2>
                    <p className="text-xs text-purple-400 font-bold">
                      {tr("ජාතික සැලසුම් අධ්‍යක්ෂ (Director)", "National Fertilizer Director", "தேசிய பணிப்பாளர்")}
                    </p>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      ID: MOA-DIR-001
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/60 space-y-1.5 text-xs text-slate-300 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("අමාත්‍යාංශය:", "Ministry:", "அமைச்சு:")}</span>
                    <span className="font-bold text-white text-[11px]">{tr("කෘෂිකර්ම අමාත්‍යාංශය", "Ministry of Agriculture", "விவசாய அமைச்சு")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("ප්‍රධාන මෙවලම:", "Key Tool:", "கருவி:")}</span>
                    <span className="font-bold text-purple-300">{tr("දිස්ත්‍රික් 25 GIS සිතියම", "25-District GIS Buffer Map", "GIS வரைபடம்")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{tr("නිරීක්ෂණය:", "Monitoring:", "கண்காணிப்பு:")}</span>
                    <span className="text-[11px] text-slate-300">{tr("වරාය නෞකා & සංචිත ආරක්ෂාව", "Port Cargo & Buffer Stocks", "துறைமுக சரக்கு")}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md"
              >
                <span>{tr("ජාතික සිතියමට පිවිසෙන්න", "Enter National GIS Portal", "தேசிய போர்டல்")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: DIRECT NIC / SERVICE ID LOGIN FORM */}
        {activeTab === 'direct' && (
          <div className="max-w-md mx-auto w-full bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <form onSubmit={handleDirectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  {tr("ඔබගේ භූමිකාව තෝරන්න:", "Select Role:", "பாத்திரத்தை தேர்ந்தெடுக்கவும்:")}
                </label>
                <select
                  value={directRole}
                  onChange={(e) => setDirectRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="farmer">👨🏽‍🌾 {tr("ගොවි මහතා (Farmer - NIC)", "Farmer (NIC)", "விவசாயி")}</option>
                  <option value="warehouse">🏢 {tr("ගබඩා පාලක නිලධාරී (Storekeeper)", "Warehouse Storekeeper", "களஞ்சிய அதிகாரி")}</option>
                  <option value="chemist">🔬 {tr("රසායන විද්‍යාඥ (Lab Chemist)", "Lab Chemist", "வேதியியலாளர்")}</option>
                  <option value="inspector">⚖️ {tr("පරීක්ෂක නිලධාරී (Field Inspector)", "Field Inspector", "ஆய்வு அதிகாரி")}</option>
                  <option value="director">🏛️ {tr("ජාතික සැලසුම් අධ්‍යක්ෂ (National Director)", "National Director", "தேசிய பணிப்பாளர்")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  {directRole === 'farmer' 
                    ? tr("ජාතික හැඳුනුම්පත් අංකය (NIC):", "National Identity Card (NIC):", "தேசிய அடையாள அட்டை எண்:")
                    : tr("සේවා හැඳුනුම්පත් අංකය (Service ID / Badge):", "Service ID / Badge ID:", "சேவை அடையாள எண்:")}
                </label>
                <input
                  type="text"
                  value={directId}
                  onChange={(e) => setDirectId(e.target.value)}
                  placeholder={directRole === 'farmer' ? "198425600123 හෝ 761234567V" : "WMS-ASC-7701"}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {directRole === 'farmer'
                    ? tr("DAD යාය ලේඛනයේ ලියාපදිංචි 10 හෝ 12 ඉලක්කම් හැඳුනුම්පත.", "10 or 12 digit NIC registered with DAD Yaya Cadastre.", "பதிவு செய்யப்பட்ட அடையாள எண்.")
                    : tr("රාජ්‍ය ආයතනික සේවා හැඳුනුම්පත් අංකය.", "Institutional service credential.", "அரசு சேவை எண்.")}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/20"
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
      <footer className="border-t border-slate-800 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 CropSafe AI • Sabaragamuwa University of Sri Lanka (DS3206 Capstone Project II)</span>
          <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
            <span>DOA Certified</span>
            <span>•</span>
            <span>SLSI 644 Standards</span>
            <span>•</span>
            <span>DAD GovNet Integration</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
