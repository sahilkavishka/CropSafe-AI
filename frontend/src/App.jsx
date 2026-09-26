import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import FarmerMode from './components/FarmerMode';
import { translations } from './i18n';
import { 
  Sprout, 
  PhoneCall, 
  ShieldCheck, 
  GraduationCap, 
  Heart, 
  Zap, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  UserCheck, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight,
  Layers
} from 'lucide-react';
import './App.css';

// Code-split heavy modes with React.lazy for instant mobile loading & optimal bundle size
const ChemistLabMode = lazy(() => import('./components/ChemistLabMode'));
const WarehouseMode = lazy(() => import('./components/WarehouseMode'));
const InspectorMode = lazy(() => import('./components/InspectorMode'));
const NationalMapMode = lazy(() => import('./components/NationalMapMode'));

const API_BASE = "http://localhost:8000";

// Splash Screen Component
function SplashScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [currentHint, setCurrentHint] = useState(0);

  const hints = [
    "🌾 ගොවි දත්ත හා පැතිකඩ පූරණය කෙරේ...",
    "🔬 AI පර්යේෂණ ආදර්ශ ප්‍රාරම්භ කෙරේ...",
    "🛡️ රාජ්‍ය ආරක්ෂිත ද්වාර පරීක්ෂා කෙරේ...",
    "✅ සාදරයෙන් පිළිගනිමු!"
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
        {['50 AI Models', 'Trilingual', 'Farmer Profile', 'Live Camera', 'Officer RBAC'].map((f, i) => (
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

// Suspense Fallback Loader
function TabLoader({ title }) {
  return (
    <div className="clean-card p-12 text-center space-y-4 my-8 animate-fadeIn">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center animate-spin">
        <Layers className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-base font-black text-slate-800">{title || "මොඩියුලය පූරණය වෙමින් පවතී..."}</h3>
        <p className="text-xs text-slate-500 mt-1">කෘෂිකාර්මික දත්ත හා 3D පරිසරය සූදානම් කෙරේ</p>
      </div>
    </div>
  );
}

// Institutional Officer Authentication Modal
function OfficerAuthModal({ targetTab, onAuthenticate, onCancel, language }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const roleMeta = {
    chemist: {
      name: language === 'en' ? 'SLSI Certified Chemist Lab' : 'SLSI සහතිකලත් රසායනාගාරය',
      dept: 'Sri Lanka Standards Institution (SLSI 644)',
      badge: 'CHEM-LAB-SLSI',
      desc: 'නිල රසායනාගාර පරීක්ෂණ, ව්‍යාජ සංයුති වර්ගීකරණය හා SLSI විශ්ලේෂණ වාර්තා (CoA) සැකසීම.'
    },
    warehouse: {
      name: language === 'en' ? 'Government Warehouse & Buffer Depot' : 'රජයේ පොහොර මධ්‍යම ගබඩාව',
      dept: 'National Fertilizer Secretariat (NFS)',
      badge: 'WH-AP-01-NFS',
      desc: 'ජාතික පොහොර සංචිත කළමනාකරණය, IoT ඩිජිටල් නිවුන් පද්ධතිය හා නිකුත් කිරීම් පාලනය.'
    },
    inspector: {
      name: language === 'en' ? 'Enforcement & Legal Inspection Wing' : 'නීති බලාත්මක හා වැටලීම් ඒකකය',
      dept: 'Consumer Affairs Authority & Fertilizer Act No. 68',
      badge: 'LEGAL-INSP-2026',
      desc: 'අධිකරණ B-වාර්තා සැකසීම, පැමිණිලි විමර්ශනය හා ජාතික ප්‍රතිපත්ති ආරක්ෂණ පද්ධතිය.'
    }
  }[targetTab] || {
    name: 'රාජකාරි පිවිසුම',
    dept: 'Department of Agriculture',
    badge: 'DOA-OFFICER',
    desc: 'නිලධාරී අංශය වෙත පිවිසීම.'
  };

  const handleVerify = (e) => {
    e?.preventDefault();
    // Default Officer PINs: 1234, 1920, 2026, or 'admin'
    if (['1234', '1920', '2026', 'admin', 'cropsafe'].includes(pin.trim())) {
      onAuthenticate({ mode: 'OFFICER', badgeId: roleMeta.badge });
    } else {
      setError(true);
    }
  };

  const handleDemoGuest = () => {
    onAuthenticate({ mode: 'GUEST_DEMO', badgeId: 'DEMO-OBSERVER' });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 space-y-6 animate-scaleIn">
        
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-7 h-7 text-amber-700" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider">
              <Lock className="w-3 h-3 text-amber-700" />
              <span>නිලධාරී පිවිසුම් ද්වාරය</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mt-1">{roleMeta.name}</h3>
            <p className="text-xs text-slate-500 font-semibold">{roleMeta.dept}</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
          {roleMeta.desc}
        </p>

        {/* PIN Entry Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5 flex items-center justify-between">
              <span>රාජකාරි PIN අංකය (Officer PIN)</span>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Demo PIN: 1234
              </span>
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError(false); }}
                placeholder="PIN අංකය ඇතුළත් කරන්න (උදා: 1234)"
                className="w-full p-3.5 pl-11 rounded-2xl border border-slate-300 font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                autoFocus
              />
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            {error && (
              <p className="text-xs font-bold text-rose-600 mt-1.5 animate-fadeIn">
                ❌ PIN අංකය වැරදිය. (නිරීක්ෂණය සඳහා පහත ආදර්ශන බොත්තම ඔබන්න)
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <Unlock className="w-4 h-4" />
              <span>තහවුරු කර පිවිසෙන්න</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all"
            >
              ආපසු
            </button>
          </div>
        </form>

        {/* Demo / Evaluator Bypass Option */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={handleDemoGuest}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center space-x-2 border border-slate-200"
          >
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>නිරීක්ෂණ මාදිලියෙන් පිවිසෙන්න (Guest / Evaluator Demo Mode)</span>
          </button>
          <p className="text-[10px] text-slate-400 mt-1.5">
            විශ්වවිද්‍යාල ඇගයීම් හා පර්යේෂණ නිරීක්ෂණ සඳහා PIN රහිතව සම්පූර්ණ දසුන ලබාගත හැක.
          </p>
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

  // Institutional RBAC Authentication State
  const [pendingTab, setPendingTab] = useState(null);
  const [authorizedRoles, setAuthorizedRoles] = useState(() => {
    try {
      const saved = sessionStorage.getItem('cropsafe_authorized_roles');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

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
  }, [authorizedRoles]);

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

    // Secure tabs check: Chemist, Warehouse, Inspector require authentication
    if (['chemist', 'warehouse', 'inspector'].includes(tab) && !authorizedRoles[tab]) {
      setPendingTab(tab);
      return;
    }

    setTabTransition(true);
    setTimeout(() => {
      setCurrentTab(tab);
      setTabTransition(false);
    }, 150);
  };

  const handleAuthenticate = (roleData) => {
    if (!pendingTab) return;
    const updated = { ...authorizedRoles, [pendingTab]: roleData };
    setAuthorizedRoles(updated);
    try {
      sessionStorage.setItem('cropsafe_authorized_roles', JSON.stringify(updated));
    } catch {}
    const dest = pendingTab;
    setPendingTab(null);
    setTabTransition(true);
    setTimeout(() => {
      setCurrentTab(dest);
      setTabTransition(false);
    }, 150);
  };

  return (
    <>
      {/* Splash Screen */}
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      {/* Officer Authentication Modal */}
      {pendingTab && (
        <OfficerAuthModal
          targetTab={pendingTab}
          onAuthenticate={handleAuthenticate}
          onCancel={() => setPendingTab(null)}
          language={language}
        />
      )}

      <div className={`min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans transition-opacity duration-300 ${showSplash ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

        {/* Top Navigation Bar */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={handleTabChange}
          language={language}
          setLanguage={setLanguage}
          apiOnline={apiOnline}
        />

        {/* Role Status Banner when inside restricted mode */}
        {authorizedRoles[currentTab] && currentTab !== 'farmer' && currentTab !== 'map' && (
          <div className="bg-emerald-900 text-emerald-100 px-4 py-1.5 text-xs font-semibold flex items-center justify-between no-print border-b border-emerald-800">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {authorizedRoles[currentTab].mode === 'OFFICER' 
                  ? `තහවුරු කළ නිලධාරී සැසිය: [${authorizedRoles[currentTab].badgeId}]` 
                  : `ආදර්ශන නිරීක්ෂණ මාදිලිය (Guest Demo Mode) සක්‍රියයි`}
              </span>
            </div>
            <button
              onClick={() => {
                const next = { ...authorizedRoles };
                delete next[currentTab];
                setAuthorizedRoles(next);
                try { sessionStorage.setItem('cropsafe_authorized_roles', JSON.stringify(next)); } catch {}
                setCurrentTab('farmer');
              }}
              className="text-[11px] font-bold text-emerald-300 hover:text-white underline ml-4"
            >
              ඉවත් වන්න (Logout)
            </button>
          </div>
        )}

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

        {/* Main Content Area with Code Splitting & Suspense */}
        <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 transition-opacity duration-150 ${tabTransition ? 'opacity-0' : 'opacity-100'}`}>
          {currentTab === 'farmer' && <FarmerMode language={language} />}

          <Suspense fallback={<TabLoader title={currentTab === 'chemist' ? 'රසායනාගාරය පූරණය වේ...' : currentTab === 'warehouse' ? 'ස්මාර්ට් ගබඩාව පූරණය වේ...' : currentTab === 'inspector' ? 'නීති හා වැටලීම් පද්ධතිය පූරණය වේ...' : 'ජාතික සිතියම පූරණය වේ...'} />}>
            {currentTab === 'chemist'   && <ChemistLabMode language={language} officerRole={authorizedRoles.chemist} />}
            {currentTab === 'warehouse' && <WarehouseMode  language={language} officerRole={authorizedRoles.warehouse} />}
            {currentTab === 'inspector' && <InspectorMode  language={language} officerRole={authorizedRoles.inspector} />}
            {currentTab === 'map'       && <NationalMapMode language={language} />}
          </Suspense>
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
