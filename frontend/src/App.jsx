import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import LoginPortal from './components/auth/LoginPortal';
import FarmerMode from './components/FarmerMode';
import { translations } from './i18n';
import { 
  Sprout, 
  PhoneCall, 
  ShieldCheck, 
  GraduationCap, 
  Heart, 
  Zap, 
  Layers
} from 'lucide-react';
import './App.css';

// Lazy-load heavier specialized officer and institutional portals
const ChemistLabMode = lazy(() => import('./components/ChemistLabMode'));
const WarehouseMode = lazy(() => import('./components/WarehouseMode'));
const InspectorMode = lazy(() => import('./components/InspectorMode'));
const NationalMapMode = lazy(() => import('./components/NationalMapMode'));

const API_BASE = "http://localhost:8000";

// Clean Suspense Fallback Loader
function PortalLoader({ title }) {
  return (
    <div className="clean-card p-12 text-center space-y-4 my-8 animate-fadeIn max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-spin">
        <Layers className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-base font-black text-slate-800">{title || "ද්වාරය සූදානම් කෙරේ..."}</h3>
        <p className="text-xs text-slate-500 mt-1">කෘෂිකාර්මික දත්ත හා පද්ධතිය පූරණය වෙමින් පවතී</p>
      </div>
    </div>
  );
}

function App() {
  const [language, setLanguage] = useState('si');
  const [apiOnline, setApiOnline] = useState(false);
  const [tabTransition, setTabTransition] = useState(false);

  // Authenticated User State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cropsafe_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const t = translations[language] || translations.si;

  const tr = (si, en, ta) => {
    if (language === 'ta') return ta || en || si;
    if (language === 'en') return en || si;
    return si;
  };

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

  // Handle Switching Role (e.g., from Navbar dropdown)
  const handleSwitchRole = async (targetRoleKey) => {
    setTabTransition(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRoleKey, demo_mode: true })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          try {
            localStorage.setItem('cropsafe_active_user', JSON.stringify(data.user));
          } catch {}
          setTimeout(() => setTabTransition(false), 150);
          return;
        }
      }
    } catch {}

    // Fallback switch if API offline
    const roleMap = {
      farmer: { role: "FARMER", full_name_si: "කේ. එම්. බණ්ඩාර", nic: "198425600123", avatar_icon: "👨🏽‍🌾", district_si: "අනුරාධපුරය" },
      warehouse: { role: "WAREHOUSE_OFFICER", full_name_si: "පී. ඒ. ජයසිංහ", service_id: "WMS-ASC-7701", avatar_icon: "🏢", facility_name_si: "තඹුත්තේගම ASC ගබඩාව" },
      chemist: { role: "LAB_CHEMIST", full_name_si: "ආචාර්ය එන්. විජේසිංහ", service_id: "SLSI-CH-2026", avatar_icon: "🔬", laboratory_name_si: "වැලිසර රසායනාගාරය" },
      inspector: { role: "FIELD_INSPECTOR", full_name_si: "එස්. කේ. ද සිල්වා", badge_id: "DOA-ENF-418", avatar_icon: "⚖️", jurisdiction_si: "උතුරු මැද වැටලීම් ඒකකය" },
      director: { role: "NATIONAL_DIRECTOR", full_name_si: "කේ. ආර්. හේරත් (SLAS)", service_id: "MOA-DIR-001", avatar_icon: "🏛️", ministry: "කෘෂිකර්ම අමාත්‍යාංශය" }
    };
    if (roleMap[targetRoleKey]) {
      setCurrentUser(roleMap[targetRoleKey]);
      try { localStorage.setItem('cropsafe_active_user', JSON.stringify(roleMap[targetRoleKey])); } catch {}
    }
    setTimeout(() => setTabTransition(false), 150);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('cropsafe_active_user');
    } catch {}
    setCurrentUser(null);
  };

  // If user is not logged in, render the clean, authoritative Login Portal
  if (!currentUser) {
    return (
      <LoginPortal
        language={language}
        setLanguage={setLanguage}
        onLogin={(user) => setCurrentUser(user)}
      />
    );
  }

  // Normalize role to determine which dedicated portal to render
  const roleStr = (currentUser.role || 'farmer').toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navigation Bar with Active Profile & Quick Switcher */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        language={language}
        setLanguage={setLanguage}
        apiOnline={apiOnline}
      />

      {/* Main Content Area - Renders Dedicated Portal per User Role */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 transition-opacity duration-150 ${tabTransition ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* 1. FARMER PORTAL */}
        {roleStr === 'FARMER' && (
          <FarmerMode 
            language={language} 
            currentUser={currentUser} 
          />
        )}

        {/* 2. STATE WAREHOUSE STOREKEEPER PORTAL */}
        {roleStr === 'WAREHOUSE_OFFICER' && (
          <Suspense fallback={<PortalLoader title={tr("ගබඩා පද්ධතිය පූරණය වෙමින් පවතී...", "Loading Warehouse WMS...", "களஞ்சிய போர்டல்...")} />}>
            <WarehouseMode 
              language={language} 
              currentUser={currentUser} 
            />
          </Suspense>
        )}

        {/* 3. FORENSIC CHEMIST & SLSI AUDITOR PORTAL */}
        {roleStr === 'LAB_CHEMIST' && (
          <Suspense fallback={<PortalLoader title={tr("රසායනාගාර පද්ධතිය පූරණය වෙමින් පවතී...", "Loading Chemist LIMS...", "ஆய்வக போர்டல்...")} />}>
            <ChemistLabMode 
              language={language} 
              currentUser={currentUser} 
            />
          </Suspense>
        )}

        {/* 4. FIELD INSPECTOR & LEGAL ENFORCEMENT PORTAL */}
        {roleStr === 'FIELD_INSPECTOR' && (
          <Suspense fallback={<PortalLoader title={tr("බලාත්මක කිරීමේ පද්ධතිය පූරණය වෙමින් පවතී...", "Loading Inspector Portal...", "ஆய்வு போர்டல்...")} />}>
            <InspectorMode 
              language={language} 
              currentUser={currentUser} 
            />
          </Suspense>
        )}

        {/* 5. NATIONAL DIRECTOR & GIS STRATEGY PORTAL */}
        {roleStr === 'NATIONAL_DIRECTOR' && (
          <Suspense fallback={<PortalLoader title={tr("ජාතික සිතියම් පද්ධතිය පූරණය වෙමින් පවතී...", "Loading National GIS Portal...", "தேசிய போர்டல்...")} />}>
            <NationalMapMode 
              language={language} 
              currentUser={currentUser} 
            />
          </Suspense>
        )}

      </main>

      {/* Official GovTech Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white pt-8 pb-6 text-slate-700 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            
            {/* Col 1: Brand & National Integration */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Sprout className="w-5 h-5" />
                </div>
                <span className="text-base font-black text-slate-900">CropSafe AI</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {tr(
                  "ශ්‍රී ලංකා කෘෂිකර්ම දෙපාර්තමේන්තුව (DOA), ජාතික පොහොර ලේකම් කාර්යාලය (NFS) සහ ගොවිජන සංවර්ධන දෙපාර්තමේන්තුව (DAD) සමඟ සහයෝගීව.",
                  "In collaboration with Department of Agriculture (DOA), National Fertilizer Secretariat (NFS), and Department of Agrarian Development (DAD).",
                  "விவசாய திணைக்களம் மற்றும் தேசிய உர செயலகத்தின் உத்தியோகபூர்வ போர்டல்."
                )}
              </p>
            </div>

            {/* Col 2: Institutional Standards */}
            <div>
              <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                {tr("ප්‍රමිති සහ නීතිමය පදනම", "Standards & Legal Framework", "தரநிலைகள்")}
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">SLSI 644 (යූරියා)</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">SLSI 814 (MOP)</span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200">SLSI 826 (TSP)</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">1988 අංක 68 පොහොර පනත</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">DAD යාය ලේඛනය</span>
              </div>
            </div>

            {/* Col 3: Research Attribution & Hotline */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <GraduationCap className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span className="font-bold">Sabaragamuwa University of Sri Lanka • DS3206 Capstone</span>
              </div>
              <a 
                href="tel:1920" 
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold w-fit transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-700" />
                <span>{tr("කෘෂිකර්ම උපදේශන සේවය: 1920 (නොමිලේ)", "Agri Advisory Hotline: 1920 (Toll Free)", "உதவி எண்: 1920")}</span>
              </a>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>© {new Date().getFullYear()} CropSafe AI • National Agrarian Intelligence Platform</span>
            <span>Empowering 847,000+ Sri Lankan Farmers with Precision Agronomy & Transparency</span>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default App;
