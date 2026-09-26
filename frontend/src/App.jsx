import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FarmerMode from './components/FarmerMode';
import ChemistLabMode from './components/ChemistLabMode';
import WarehouseMode from './components/WarehouseMode';
import InspectorMode from './components/InspectorMode';
import NationalMapMode from './components/NationalMapMode';
import { translations } from './i18n';
import { Sprout, PhoneCall, ShieldCheck, GraduationCap, Heart, Zap } from 'lucide-react';
import './App.css';

const API_BASE = "http://localhost:8000";

// Splash Screen Component
function SplashScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [currentHint, setCurrentHint] = useState(0);

  const hints = [
    "🌾 ගොවි දත්ත පූරණය කෙරේ...",
    "🔬 AI ආදර්ශ ප්‍රාරම්භ කෙරේ...",
    "🛡️ ආරක්ෂිත සම්බන්ධතාවය පරීක්ෂා කෙරේ...",
    "✅ සූදානම්!"
  ];

  useEffect(() => {
    let pct = 0;
    const timer = setInterval(() => {
      pct += 2;
      setProgress(Math.min(pct, 100));
      setCurrentHint(Math.floor(pct / 28));
      if (pct >= 100) {
        clearInterval(timer);
        setTimeout(onDone, 400);
      }
    }, 25);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] hero-gradient flex flex-col items-center justify-center p-8"
      style={{ animation: progress >= 100 ? 'fadeOut 0.5s ease-out forwards' : undefined }}>
      
      {/* Logo */}
      <div className="flex flex-col items-center space-y-6 mb-10 animate-scaleIn">
        <div className="w-24 h-24 rounded-3xl bg-white/15 border border-white/30 flex items-center justify-center shadow-2xl backdrop-blur-sm animate-float">
          <Sprout className="w-14 h-14 text-white" />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Crop<span className="text-emerald-300">Safe</span> <span className="text-sm px-2 py-0.5 rounded-full bg-white/20 text-white font-bold align-middle">AI</span>
          </h1>
          <p className="text-emerald-200 text-sm font-medium">ශ්‍රී ලංකා ජාතික පොහොර බුද්ධි පද්ධතිය</p>
          <p className="text-emerald-300/70 text-xs">Sabaragamuwa University of Sri Lanka • DS3206</p>
        </div>
      </div>

      {/* Features pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 animate-fadeIn delay-200">
        {['50 AI Models', 'Trilingual', 'Offline Ready', 'Farmer First'].map((f, i) => (
          <span key={i} className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-xs font-bold backdrop-blur-sm">
            ✓ {f}
          </span>
        ))}
      </div>

      {/* Progress */}
      <div className="w-full max-w-xs space-y-3 animate-fadeIn delay-300">
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-300 to-teal-200 rounded-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-emerald-200">
          <span className="font-medium">{hints[Math.min(currentHint, hints.length - 1)]}</span>
          <span className="font-black">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentTab, setCurrentTab] = useState('farmer');
  const [language, setLanguage] = useState('si');
  const [apiOnline, setApiOnline] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [tabTransition, setTabTransition] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const t = translations[language] || translations.si;

  // Check backend API connectivity
  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
        setApiOnline(res.ok);
      } catch {
        setApiOnline(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 10000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts (Ctrl+1 through Ctrl+5)
  useEffect(() => {
    const tabIds = ['farmer', 'chemist', 'warehouse', 'inspector', 'map'];
    const handleKey = (e) => {
      if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        if (tabIds[idx]) handleTabChange(tabIds[idx]);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleTabChange = (tab) => {
    if (tab === currentTab) return;
    setTabTransition(true);
    setTimeout(() => {
      setCurrentTab(tab);
      setTabTransition(false);
    }, 150);
  };

  return (
    <>
      {/* Splash Screen */}
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      <div className={`min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans transition-opacity duration-300 ${showSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

        {/* Top Navigation Bar */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={handleTabChange}
          language={language}
          setLanguage={setLanguage}
          apiOnline={apiOnline}
        />

        {/* Install Banner */}
        {showInstallBanner && (
          <div className="bg-emerald-700 text-white px-4 py-2 flex items-center justify-between text-sm no-print animate-slideInUp">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span className="font-bold">CropSafe AI ඔබේ ජංගම දුරකථනයේ install කරන්න! &#8594; Offline Mode ද ලබාගන්න.</span>
            </div>
            <button onClick={() => setShowInstallBanner(false)} className="text-emerald-200 hover:text-white font-black text-lg ml-4">×</button>
          </div>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 transition-opacity duration-150 ${tabTransition ? 'opacity-0' : 'opacity-100'}`}>
          {currentTab === 'farmer'    && <FarmerMode    language={language} />}
          {currentTab === 'chemist'   && <ChemistLabMode language={language} />}
          {currentTab === 'warehouse' && <WarehouseMode  language={language} />}
          {currentTab === 'inspector' && <InspectorMode  language={language} />}
          {currentTab === 'map'       && <NationalMapMode language={language} />}
        </main>

        {/* Enhanced Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white pt-10 pb-6 text-slate-700 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* 3-Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              
              {/* Col 1: Brand */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-900">CropSafe AI</p>
                    <p className="text-xs text-slate-500">ශ්‍රී ලංකා ජාතික පොහොර බුද්ධි පද්ධතිය</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ශ්‍රී ලංකා කෘෂිකර්ම දෙපාර්තමේන්තුව (DOA), ජාතික පොහොර ලේකම් කාර්යාලය (NFS) හා ගොවිජන සංවර්ධන දෙපාර්තමේන්තුව (DAD) සමඟ සහයෝගීව.
                </p>
                <div className="flex items-center space-x-2 text-[11px] text-emerald-700 font-bold">
                  <Heart className="w-3 h-3 text-rose-500" />
                  <span>Made with love for Sri Lankan Farmers</span>
                </div>
              </div>

              {/* Col 2: Certifications & Stats */}
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">සහතිකය හා ප්‍රමිති</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '✓ DOA ප්‍රමිති', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                    { label: '✓ SLSI 644', color: 'bg-blue-50 text-blue-800 border-blue-200' },
                    { label: '✓ 50 AI Modules', color: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
                    { label: '✓ Trilingual', color: 'bg-purple-50 text-purple-800 border-purple-200' },
                    { label: '✓ NFS Approved', color: 'bg-amber-50 text-amber-800 border-amber-200' },
                    { label: '✓ CAA Integrated', color: 'bg-rose-50 text-rose-800 border-rose-200' },
                  ].map((b, i) => (
                    <span key={i} className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${b.color}`}>{b.label}</span>
                  ))}
                </div>
              </div>

              {/* Col 3: University + Contact */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <GraduationCap className="w-8 h-8 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-black text-slate-900">Sabaragamuwa University of Sri Lanka</p>
                    <p className="text-[11px] text-slate-500">Faculty of Computing • Department of Data Science</p>
                    <p className="text-[11px] text-emerald-700 font-bold">DS3206 Capstone Research Project II</p>
                  </div>
                </div>
                <a 
                  href="tel:1920" 
                  className="flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-black text-sm border border-amber-200 transition-all group"
                >
                  <PhoneCall className="w-4 h-4 text-amber-700 group-hover:animate-bounce" />
                  <div>
                    <span className="block text-[10px] text-amber-700 font-bold uppercase tracking-wider">ගොවි සහන සේවා හොට්ලයින්</span>
                    <span className="text-base font-black">1920</span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 ml-auto" />
                </a>
              </div>

            </div>

            {/* Bottom Row */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <span>© {new Date().getFullYear()} CropSafe AI. ශ්‍රී ලාංකේය ගොවි ජනතාවගේ සුබසිද්ධිය උදෙසා නිර්මාණය කරන ලදී.</span>
              <div className="flex items-center space-x-1 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Powered by Gemini AI & CropSafe Intelligence Engine v2.0</span>
              </div>
            </div>

          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
