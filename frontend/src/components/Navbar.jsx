import React from 'react';
import { 
  Sprout, 
  PhoneCall, 
  CheckCircle,
  AlertCircle,
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
    { id: 'farmer', label: t.tabFarmer },
    { id: 'chemist', label: t.tabChemist },
    { id: 'warehouse', label: t.tabWarehouse },
    { id: 'inspector', label: t.tabInspector },
    { id: 'map', label: t.tabMap },
  ];

  return (
    <header className="sticky top-0 z-50 bg-emerald-700 text-white shadow-lg border-b border-emerald-800">
      
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setCurrentTab('farmer')} 
          className="flex items-center space-x-3 cursor-pointer select-none"
        >
          <div className="w-11 h-11 rounded-2xl bg-white text-emerald-700 flex items-center justify-center shadow-md flex-shrink-0">
            <Sprout className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-white font-sans">
                Crop<span className="text-emerald-200">Safe</span> <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-800 text-white font-bold">AI</span>
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium hidden sm:block">
              {t.subTitle}
            </p>
          </div>
        </div>

        {/* Right Section: Language Switcher + Emergency Hotline */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Functional Trilingual Toggle */}
          <div className="flex items-center bg-emerald-800/90 rounded-xl p-1 border border-emerald-600/70 shadow-inner">
            <Globe className="w-4 h-4 text-emerald-300 ml-1.5 mr-1 hidden sm:block" />
            {[
              { code: 'si', label: 'සිංහල' },
              { code: 'en', label: 'English' },
              { code: 'ta', label: 'தமிழ்' }
            ].map(lang => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    isSelected
                      ? 'bg-white text-emerald-900 shadow-sm scale-105'
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-700/50'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>

          {/* Hotline Call Button */}
          <a
            href="tel:1920"
            className="flex items-center space-x-2 px-3.5 sm:px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-md transition-all transform hover:scale-105"
          >
            <PhoneCall className="w-4 h-4 text-amber-950 animate-bounce flex-shrink-0" />
            <div className="text-left hidden sm:block">
              <span className="block text-[9px] uppercase tracking-wider font-extrabold text-amber-900 leading-none">
                {t.hotlineSub}
              </span>
              <span className="text-sm font-black leading-tight">
                {t.hotline}
              </span>
            </div>
            <span className="sm:hidden font-black">1920</span>
          </a>

        </div>

      </div>

      {/* Navigation Mode Switcher Tabs */}
      <div className="bg-emerald-800/95 border-t border-emerald-600/60">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                  isActive
                    ? 'bg-white text-emerald-900 shadow-md font-black scale-100'
                    : 'text-emerald-100 hover:bg-emerald-700/60 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </header>
  );
}
