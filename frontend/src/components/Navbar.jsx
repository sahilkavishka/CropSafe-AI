import React from 'react';
import { 
  Sprout, 
  FlaskConical, 
  Building2, 
  Scale, 
  MapPin, 
  PhoneCall, 
  Wifi, 
  WifiOff, 
  Globe 
} from 'lucide-react';
import { translations } from '../i18n';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  language, 
  setLanguage, 
  apiOnline 
}) {
  const t = translations[language] || translations.si;

  const tabs = [
    { id: 'farmer', label: t.tabFarmer, icon: Sprout, color: 'text-emerald-400' },
    { id: 'chemist', label: t.tabChemist, icon: FlaskConical, color: 'text-cyan-400' },
    { id: 'warehouse', label: t.tabWarehouse, icon: Building2, color: 'text-amber-400' },
    { id: 'inspector', label: t.tabInspector, icon: Scale, color: 'text-rose-400' },
    { id: 'map', label: t.tabMap, icon: MapPin, color: 'text-blue-400' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-emerald-900/40 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & University branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('farmer')}>
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-300/30">
                <Sprout className="w-7 h-7 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${apiOnline ? 'bg-emerald-400' : 'bg-red-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${apiOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-white font-sans">
                  Crop<span className="text-emerald-400">Safe</span> <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AI v2.0</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                {t.university}
              </p>
            </div>
          </div>

          {/* Navigation Mode Switcher Tabs */}
          <nav className="hidden md:flex items-center space-x-1 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-lg shadow-emerald-700/30 scale-100 border border-emerald-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar: Language Toggle + Hotline + Status */}
          <div className="flex items-center space-x-3">
            
            {/* Language Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
              {[
                { code: 'si', label: 'සිං' },
                { code: 'en', label: 'EN' },
                { code: 'ta', label: 'த' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                    language === lang.code
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Hotline Badge */}
            <a
              href="tel:1920"
              className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all shadow-sm"
              title="Govi Sahana Sarana Agrarian Hotline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>1920</span>
            </a>

            {/* API Connectivity status */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
              apiOnline 
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' 
                : 'bg-red-950/60 text-red-300 border-red-800/40'
            }`}>
              {apiOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{apiOnline ? 'Online' : 'Offline'}</span>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 no-scrollbar border-t border-slate-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
