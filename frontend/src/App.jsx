import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FarmerMode from './components/FarmerMode';
import ChemistLabMode from './components/ChemistLabMode';
import WarehouseMode from './components/WarehouseMode';
import InspectorMode from './components/InspectorMode';
import NationalMapMode from './components/NationalMapMode';
import { translations } from './i18n';
import { Sprout, PhoneCall, ShieldCheck } from 'lucide-react';
import './App.css';

const API_BASE = "http://localhost:8000";

function App() {
  const [currentTab, setCurrentTab] = useState('farmer');
  const [language, setLanguage] = useState('si');
  const [apiOnline, setApiOnline] = useState(false);

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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Friendly Navigation Bar */}
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

      {/* Clean Footer (Facebook / App Style) */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center space-x-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                🌾
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">
                  CropSafe AI — ශ්‍රී ලංකා ජාතික පොහොර බුද්ධි පද්ධතිය
                </p>
                <p className="text-xs text-slate-500">
                  ශ්‍රී ලංකා කෘෂිකර්ම දෙපාර්තමේන්තුව (DOA) සහ ජාතික පොහොර ලේකම් කාර්යාලය (NFS) සමඟ සහයෝගීව • ගොවි සහන සේවය
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                ✓ නිරවද්‍ය DOA ප්‍රමිති
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-800 font-bold border border-cyan-200">
                ✓ 50 AI Modules සක්‍රියයි
              </span>
              <a 
                href="tel:1920" 
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-amber-100 text-amber-900 font-black border border-amber-300 hover:bg-amber-200 transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-800" />
                <span>ගොවි සහන සරණ: 1920</span>
              </a>
            </div>

          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            © 2026 CropSafe AI. ශ්‍රී ලාංකේය ගොවි ජනතාවගේ සුබසිද්ධිය උදෙසා නිර්මාණය කරන ලදී.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
