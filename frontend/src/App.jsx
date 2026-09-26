import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FarmerMode from './components/FarmerMode';
import ChemistLabMode from './components/ChemistLabMode';
import WarehouseMode from './components/WarehouseMode';
import InspectorMode from './components/InspectorMode';
import NationalMapMode from './components/NationalMapMode';
import { translations } from './i18n';
import { Sprout, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';
import './App.css';

const API_BASE = "http://localhost:8000";

function App() {
  const [currentTab, setCurrentTab] = useState('farmer');
  const [language, setLanguage] = useState('si');
  const [apiOnline, setApiOnline] = useState(false);

  const t = translations[language] || translations.si;

  // Check backend API connectivity
  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
        if (res.ok) {
          setApiOnline(true);
        } else {
          setApiOnline(false);
        }
      } catch {
        setApiOnline(false);
      }
    };

    checkApi();
    const interval = setInterval(checkApi, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Sticky Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        apiOnline={apiOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'farmer' && <FarmerMode language={language} />}
        {currentTab === 'chemist' && <ChemistLabMode language={language} />}
        {currentTab === 'warehouse' && <WarehouseMode language={language} />}
        {currentTab === 'inspector' && <InspectorMode language={language} />}
        {currentTab === 'map' && <NationalMapMode language={language} />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center space-x-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  CropSafe AI <span className="text-emerald-400">v2.0</span> — Department of Data Science
                </p>
                <p className="text-xs text-slate-400">
                  Faculty of Computing | Sabaragamuwa University of Sri Lanka (SUSL) • DS3206 Capstone Project II
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 font-semibold">
                ✓ 50 Core Domain Modules Loaded
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 font-semibold">
                ✓ Optuna LightGBM Champion Model
              </span>
              <a 
                href="tel:1920" 
                className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/20"
              >
                <PhoneCall className="w-3 h-3 text-amber-400" />
                <span>ගොවි සහන: 1920</span>
              </a>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-slate-900 text-center text-[11px] text-slate-500">
            © 2026 CropSafe AI Project. Designed & Engineered with care for the hardworking farmers of Sri Lanka.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
