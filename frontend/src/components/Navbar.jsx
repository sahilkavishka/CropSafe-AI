import React from 'react';
import { 
  Sprout, 
  FlaskConical, 
  Building2, 
  Scale, 
  MapPin, 
  PhoneCall, 
  CheckCircle,
  AlertCircle
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
    { id: 'farmer', label: '🌾 ගොවි අත්වැල', en: 'Farmer Mode', sub: 'ගොවිබිමට අවශ්‍ය සියල්ල' },
    { id: 'chemist', label: '🔬 රසායනාගාරය', en: 'Chemist Lab', sub: 'රසායනික පරීක්ෂණ' },
    { id: 'warehouse', label: '🏬 ස්මාර්ට් ගබඩාව', en: 'IoT Warehouse', sub: '3D ගබඩා පාලනය' },
    { id: 'inspector', label: '⚖️ නීති හා වැටලීම්', en: 'Law & Raids', sub: 'ව්‍යාජ වෙළඳ වැටලීම්' },
    { id: 'map', label: '🗺️ ජාතික සිතියම', en: 'National Map', sub: 'දිස්ත්‍රික් 25 තොග' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-emerald-800 text-white shadow-md border-b-2 border-emerald-900">
      
      {/* Top Utility Bar */}
      <div className="bg-emerald-950/70 border-b border-emerald-700/60 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-200">
            <span className="font-medium">🏛️ සබරගමුව විශ්වවිද්‍යාලය | දත්ත විද්‍යා අධ්‍යයනාංශය (DS3206 Capstone)</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live API Health indicator */}
            <div className="flex items-center space-x-1.5 font-medium">
              {apiOnline ? (
                <span className="inline-flex items-center text-emerald-300">
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  <span>පද්ධතිය සක්‍රියයි</span>
                </span>
              ) : (
                <span className="inline-flex items-center text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  <span>Offline (නොබැඳි)</span>
                </span>
              )}
            </div>

            {/* Trilingual Selector */}
            <div className="flex items-center bg-emerald-900 rounded-lg p-0.5 border border-emerald-700 text-xs">
              {[
                { code: 'si', label: 'සිංහල' },
                { code: 'en', label: 'English' },
                { code: 'ta', label: 'தமிழ்' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    language === lang.code 
                      ? 'bg-white text-emerald-900 shadow-sm' 
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand & Action Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Brand */}
        <div 
          onClick={() => setCurrentTab('farmer')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-white text-emerald-700 flex items-center justify-center shadow-md shadow-emerald-900/30">
            <Sprout className="w-7 h-7 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-white font-sans">
                Crop<span className="text-emerald-300">Safe</span> <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold ml-1">AI</span>
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium">
              ශ්‍රී ලංකා ජාතික පොහොර තත්ත්ව සහතිකකරණ සහ ගොවි සහන සේවය
            </p>
          </div>
        </div>

        {/* Big Agrarian Hotline Call Button */}
        <a
          href="tel:1920"
          className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-sm shadow-md transition-all transform hover:scale-105"
        >
          <PhoneCall className="w-5 h-5 text-amber-950 animate-bounce" />
          <div className="text-left">
            <span className="block text-[10px] uppercase tracking-wide font-extrabold text-amber-900 leading-none">ගොවි සහන සරණ</span>
            <span className="text-base font-black leading-tight">1920 ඇමතුම්</span>
          </div>
        </a>

      </div>

      {/* Clean Bottom Tab Navigation (Facebook / App Style) */}
      <div className="bg-emerald-900/80 border-t border-emerald-700/50">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-2 ${
                  isActive
                    ? 'bg-white text-emerald-900 shadow-md font-black'
                    : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
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
