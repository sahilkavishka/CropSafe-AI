import React, { useState } from 'react';
import { 
  Sprout, 
  PhoneCall, 
  CheckCircle,
  AlertCircle,
  Globe,
  Bell,
  ChevronRight,
  Zap
} from 'lucide-react';
import { translations } from '../i18n';

const SHORTCUT_KEYS = ['1', '2', '3', '4', '5'];

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  language, 
  setLanguage, 
  apiOnline 
}) {
  const t = translations[language] || translations.si;
  const [notifOpen, setNotifOpen] = useState(false);

  const tabs = [
    { id: 'farmer',    label: t.tabFarmer,    color: 'emerald' },
    { id: 'chemist',   label: t.tabChemist,   color: 'blue' },
    { id: 'warehouse', label: t.tabWarehouse, color: 'amber' },
    { id: 'inspector', label: t.tabInspector, color: 'rose' },
    { id: 'map',       label: t.tabMap,       color: 'purple' },
  ];

  // Farmer-relevant alerts
  const notifications = [
    { icon: '🌧️', text: language === 'en' ? 'Heavy rain expected tomorrow. Delay fertilizer application.' : 'හෙට ප්‍රබල වැසි. පොහොර යෙදීම කල් දමන්න.', time: '5m', unread: true },
    { icon: '📈', text: language === 'en' ? 'Urea open market price rising. Buy at ASC now.' : 'යූරියා විවෘත මිල ඉහළ යයි. ASC හරහා දැන් ගන්න.', time: '1h', unread: true },
    { icon: '⚠️', text: language === 'en' ? 'Batch LP-2026-N09 under quality investigation.' : 'LP-2026-N09 කාණ්ඩය පරීක්ෂාවේ.', time: '3h', unread: true },
  ];

  return (
    <header className="sticky top-0 z-50 text-white shadow-xl" style={{
      background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)'
    }}>
      
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentTab('farmer')} 
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-md flex-shrink-0 group-hover:bg-white/25 transition-all backdrop-blur-sm">
            <Sprout className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-100 group-hover:text-white transition-colors" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans leading-none">
                Crop<span className="text-emerald-300">Safe</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-black border border-white/20">AI</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-bold border border-emerald-400/30 hidden sm:inline">v2.0</span>
            </div>
            <p className="text-[10px] text-emerald-200/80 font-medium hidden sm:block leading-none mt-0.5">
              {t.subTitle}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          
          {/* API Status Indicator */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-black/15 border border-white/10 text-[10px] font-bold">
            {apiOnline ? (
              <>
                <span className="status-dot-online" />
                <span className="text-emerald-200">{t.apiOnline || 'Online'}</span>
              </>
            ) : (
              <>
                <span className="status-dot-offline" />
                <span className="text-red-300">{t.apiOffline || 'Offline'}</span>
              </>
            )}
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
              title={language === 'en' ? 'Farmer Alerts' : 'ගොවි දැනුම්දීම්'}
            >
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black flex items-center justify-center animate-pulse-slow">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-slideInUp">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">
                    {language === 'en' ? '🔔 Farmer Alerts' : '🔔 ගොවි දැනුම්දීම්'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">3 නව</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {notifications.map((n, i) => (
                    <div key={i} className={`px-4 py-3 hover:bg-slate-50 transition-all cursor-pointer flex items-start space-x-3 ${n.unread ? 'bg-emerald-50/50' : ''}`}>
                      <span className="text-xl flex-shrink-0">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-800 leading-relaxed font-medium">{n.text}</p>
                        <span className="text-[10px] text-slate-400 font-bold">{n.time} {language === 'en' ? 'ago' : 'කළ'}</span>
                      </div>
                      {n.unread && <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                  <button onClick={() => setNotifOpen(false)} className="text-xs text-emerald-700 font-black hover:text-emerald-900">
                    {language === 'en' ? 'Mark All Read' : 'ඔක්කොම කියවූ ලෙස සලකුණු කරන්න'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Trilingual Toggle */}
          <div className="flex items-center bg-black/20 rounded-xl p-1 border border-white/10 shadow-inner">
            <Globe className="w-3.5 h-3.5 text-emerald-300 ml-1.5 mr-1 hidden sm:block" />
            {[
              { code: 'si', label: 'සිං' },
              { code: 'en', label: 'EN' },
              { code: 'ta', label: 'தமிழ்' }
            ].map(lang => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                    isSelected
                      ? 'bg-white text-emerald-900 shadow-sm scale-105'
                      : 'text-emerald-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>

          {/* Hotline Button */}
          <a
            href="tel:1920"
            className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-lg transition-all transform hover:scale-105 active:scale-95 hover:shadow-amber-500/40"
            style={{ boxShadow: '0 4px 15px rgba(251,191,36,0.35)' }}
          >
            <PhoneCall className="w-4 h-4 text-amber-950 flex-shrink-0" />
            <div className="text-left hidden sm:block">
              <span className="block text-[9px] uppercase tracking-wider font-extrabold text-amber-900 leading-none">
                {t.hotlineSub}
              </span>
              <span className="text-sm font-black leading-tight">
                {t.hotline}
              </span>
            </div>
            <span className="sm:hidden font-black text-base">1920</span>
          </a>

        </div>

      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-black/20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto py-1.5 no-scrollbar items-center">
          {tabs.map((tab, idx) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                title={`Ctrl+${idx + 1}`}
                className={`group flex-shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center space-x-1.5 relative ${
                  isActive
                    ? 'bg-white text-emerald-900 shadow-lg font-black'
                    : 'text-emerald-100/90 hover:bg-white/15 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-80" />
                )}
                {/* Keyboard shortcut tooltip */}
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Ctrl+{idx + 1}
                </span>
              </button>
            );
          })}
          
          {/* Separator + API status mobile */}
          <div className="ml-auto flex-shrink-0 flex items-center space-x-1.5 pl-2 sm:hidden">
            {apiOnline ? (
              <span className="status-dot-online" />
            ) : (
              <span className="status-dot-offline" />
            )}
          </div>
        </div>
      </div>

      {/* Thin gradient bottom line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, #059669, #0891b2, #7c3aed, #059669)' }} />

    </header>
  );
}
