import React, { useState } from 'react';
import { 
  Sprout, 
  Globe, 
  Bell, 
  ChevronDown, 
  LogOut, 
  ShieldCheck, 
  User, 
  Check, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { translations } from '../i18n';

export default function Navbar({ 
  currentUser,
  onSwitchRole = () => {},
  onLogout = () => {},
  language = 'si', 
  setLanguage = () => {}, 
  apiOnline = true 
}) {
  const t = translations[language] || translations.si;
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const tr = (si, en, ta) => {
    if (language === 'ta') return ta || en || si;
    if (language === 'en') return en || si;
    return si;
  };

  const allRoles = [
    { key: 'farmer', label: tr("👨🏽‍🌾 ලියාපදිංචි ගොවි මහතා (Farmer)", "Registered Farmer", "விவசாயி"), name: "කේ. එම්. බණ්ඩාර", icon: "👨🏽‍🌾" },
    { key: 'warehouse', label: tr("🏢 රාජ්‍ය ගබඩා පාලක (Storekeeper)", "Warehouse Storekeeper", "களஞ்சிய அதிகாரி"), name: "පී. ඒ. ජයසිංහ", icon: "🏢" },
    { key: 'chemist', label: tr("🔬 ප්‍රධාන රසායන විද්‍යාඥ (Chemist)", "Chief Lab Chemist", "வேதியியலாளர்"), name: "ආචාර්ය එන්. විජේසිංහ", icon: "🔬" },
    { key: 'inspector', label: tr("⚖️ බලාත්මක කිරීමේ නිලධාරී (Inspector)", "Field Inspector", "ஆய்வு அதிகாரி"), name: "එස්. කේ. ද සිල්වා", icon: "⚖️" },
    { key: 'director', label: tr("🏛️ ජාතික සැලසුම් අධ්‍යක්ෂ (Director)", "National Director", "தேசிய பணிப்பாளர்"), name: "කේ. ආර්. හේරත්", icon: "🏛️" }
  ];

  const notifications = [
    { icon: '🌧️', text: language === 'en' ? 'Heavy rain forecast for Anuradhapura tomorrow. Postpone urea broadcasting.' : 'හෙට අනුරාධපුරයට ප්‍රබල වැසි. යූරියා යෙදීම කල් දමන්න.', time: '10m', unread: true },
    { icon: '🎫', text: language === 'en' ? 'New fast-track fertilizer token issued for Counter 02.' : 'කවුන්ටර 02 සඳහා නව QR පොහොර වවුචරයක් නිකුත් විය.', time: '1h', unread: true },
    { icon: '🛡️', text: language === 'en' ? 'SLSI 644 Quality audit report ready for Batch LP-2026-N09.' : 'LP-2026-N09 පොහොර කාණ්ඩයේ SLSI 644 විගණන වාර්තාව සූදානම්.', time: '3h', unread: false }
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border-b-2 border-emerald-500/70 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
            <Sprout className="w-6 h-6 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-black tracking-tight text-white leading-none">
                Crop<span className="text-emerald-300">Safe</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/25 text-emerald-200 font-mono font-black border border-emerald-400/40">AI GovNet</span>
            </div>
            <p className="text-[10px] text-emerald-200/90 font-semibold hidden sm:block leading-none mt-0.5">
              {tr("ශ්‍රී ලංකා ජාතික පොහොර බුද්ධි පද්ධතිය", "National Fertilizer Intelligence System", "தேசிய உர நுண்ணறிவு தளம்")}
            </p>
          </div>
        </div>

        {/* Right Section: Role Capsule, Role Switcher, Language & Logout */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Active User Capsule & Quick Switcher */}
          {currentUser && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border-2 border-emerald-400/40 hover:border-emerald-300 text-left transition-all shadow-md backdrop-blur-md"
              >
                <span className="text-2xl flex-shrink-0">{currentUser.avatar_icon || '👨🏽‍🌾'}</span>
                <div className="hidden md:block leading-tight">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-black text-white">{currentUser.full_name_si || currentUser.full_name_en}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black shadow-xs">
                      {currentUser.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-200 block truncate max-w-[160px] font-medium">
                    {currentUser.district_si || currentUser.asc_division || currentUser.facility_name_si || currentUser.agency || 'Sri Lanka'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-200" />
              </button>

              {/* Quick Switch Dropdown */}
              {roleMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border-2 border-emerald-500/40 rounded-3xl shadow-2xl p-2.5 z-50 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                    <span>{tr("භූමිකාව මාරු කරන්න", "Switch Official Role", "பாத்திரத்தை மாற்றுக")}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="space-y-1.5 py-1.5">
                    {allRoles.map(r => {
                      const isActive = currentUser.role?.toLowerCase().includes(r.key);
                      return (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => {
                            setRoleMenuOpen(false);
                            onSwitchRole(r.key);
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                            isActive
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-md'
                              : 'text-slate-200 hover:bg-slate-800 hover:text-white border border-transparent hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="text-xl">{r.icon}</span>
                            <div>
                              <p className="leading-tight">{r.label}</p>
                              <span className={`text-[10px] block font-normal ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>{r.name}</span>
                            </div>
                          </div>
                          {isActive && <Check className="w-4 h-4 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-slate-800 pt-1 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRoleMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-red-400 hover:bg-red-950/40 hover:text-red-300 flex items-center space-x-2 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{tr("ගිණුමෙන් ඉවත් වන්න (Logout)", "Sign Out of Portal", "வெளியேறுக")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition-all"
              title={tr("දැනුම්දීම්", "Alerts", "அறிவிப்புகள்")}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black flex items-center justify-center">
                2
              </span>
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-black text-white">🔔 {tr("ජාතික ගොවි දැනුම්දීම්", "Agrarian Alerts", "அறிவிப்புகள்")}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">2 නව</span>
                </div>
                <div className="divide-y divide-slate-800/80 my-1">
                  {notifications.map((n, idx) => (
                    <div key={idx} className="p-2.5 hover:bg-slate-800/60 rounded-xl transition-all flex items-start space-x-2.5">
                      <span className="text-lg flex-shrink-0">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-200 leading-snug font-medium">{n.text}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">{n.time} {tr("පෙර", "ago", "முன்")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trilingual Switcher */}
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
            <Globe className="w-3.5 h-3.5 text-emerald-400 ml-1.5 mr-0.5 hidden sm:block" />
            {[
              { code: 'si', label: 'සිං' },
              { code: 'en', label: 'EN' },
              { code: 'ta', label: 'தமிழ்' }
            ].map(lang => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  language === lang.code
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Logout Icon Button (Direct) */}
          {currentUser && (
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-300 transition-all hidden sm:flex"
              title={tr("ඉවත් වන්න", "Sign Out", "வெளியேறுக")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
