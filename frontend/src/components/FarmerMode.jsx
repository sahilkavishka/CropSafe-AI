import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FlaskConical, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calculator, 
  Layers, 
  Stethoscope, 
  CloudRain, 
  Leaf, 
  MessageSquareText, 
  Rotate3d, 
  ArrowRight,
  ShieldCheck,
  Send,
  Droplets,
  Flame,
  Check,
  HelpCircle,
  Wheat,
  Sun,
  Scan,
  ShieldAlert,
  Cpu,
  Activity,
  Play,
  RefreshCw,
  Eye,
  Mic,
  MicOff,
  Volume2,
  Printer,
  Landmark,
  FileText,
  Copy,
  PhoneCall,
  Calendar,
  Clock,
  Bell,
  Sparkle,
  Waves,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Camera,
  Search,
  User,
  Lock,
  Unlock,
  QrCode,
  VideoOff,
  Share2
} from 'lucide-react';
import DailyOperationsHub from './farmer/DailyOperationsHub';
import MarketProcurementHub from './farmer/MarketProcurementHub';
import FieldScienceAdvisoryHub from './farmer/FieldScienceAdvisoryHub';
import AgriPrescriptionModal from './AgriPrescriptionModal';
import InteractiveTourModal from './InteractiveTourModal';
import { translations } from '../i18n';

const API_BASE = "http://localhost:8000";

export default function FarmerMode({ language = 'si', currentUser = null }) {
  const t = translations[language] || translations.si;

  // Trilingual Text Helper (Guarantees Tamil, English, and Sinhala parity)
  const tr = (si, en, ta) => {
    if (language === 'ta') return ta || en || si;
    if (language === 'en') return en || si;
    return si;
  };

  // --- Workspace & Navigation State ---
  // Workspaces: 'home' | 'operations' | 'market' | 'science'
  const [activeWorkspace, setActiveWorkspace] = useState('home');
  const [activeTool, setActiveTool] = useState('dosage');

  // Category filter on Home dashboard: 'all' | 'quality' | 'dosage' | 'finance' | 'advisory'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Home Dashboard Animated Stats & Tips ---
  const [animatedStats, setAnimatedStats] = useState({ crops: 0, adulterants: 0, standards: "SLSI 644", districts: 0 });
  const [tipIndex, setTipIndex] = useState(0);
  const [recentTools, setRecentTools] = useState([]);

  // --- Accessibility & Sunlight Mode ---
  const [fontSize, setFontSize] = useState('normal'); // 'normal' | 'large' | 'xlarge'
  const [sunlightMode, setSunlightMode] = useState(false);

  // --- Printable Agronomic Prescription State ---
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(null);

  // --- Persistent Farmer Profile State ---
  const [farmerProfile, setFarmerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('cropsafe_farmer_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'කේ. එම්. බණ්ඩාර',
      district: 'Anuradhapura',
      ascDivision: 'තඹුත්තේගම ගොවිජන සේවා මධ්‍යස්ථානය',
      landAcres: 2.5,
      crop: 'paddy',
      nic: '198425600123',
      phone: '0771234567'
    };
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempProfile, setTempProfile] = useState({ ...farmerProfile });
  const [showTourModal, setShowTourModal] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'FARMER' || currentUser.nic)) {
      setFarmerProfile(prev => ({
        ...prev,
        name: currentUser.full_name_si || currentUser.full_name_en || prev.name,
        nic: currentUser.nic || prev.nic,
        district: currentUser.district || prev.district,
        ascDivision: currentUser.asc_division || prev.ascDivision,
        landAcres: currentUser.land_acres || prev.landAcres,
        crop: currentUser.crop || prev.crop
      }));
    }
  }, [currentUser]);

  const handleSaveProfile = (e) => {
    e?.preventDefault();
    setFarmerProfile(tempProfile);
    try {
      localStorage.setItem('cropsafe_farmer_profile', JSON.stringify(tempProfile));
    } catch (err) {}
    playTone('chime');
    setShowProfileModal(false);
  };

  // Web Audio Chime generator for tactile feedback
  const playTone = (type = 'ding') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'chime') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'buzz') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (e) {}
  };

  useEffect(() => {
    // Load recent tools on mount
    try {
      const stored = localStorage.getItem('recentFarmerTools');
      if (stored) setRecentTools(JSON.parse(stored));
    } catch(e) {}
  }, []);

  useEffect(() => {
    // Rotating tips
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    // Animate stats on load
    if (activeWorkspace === 'home') {
      let start = 0;
      const duration = 1500;
      const incrementTime = 50;
      const steps = duration / incrementTime;
      const targets = { crops: 12, adulterants: 5, districts: 25 };
      
      const timer = setInterval(() => {
        start += 1;
        if (start > steps) {
          clearInterval(timer);
          setAnimatedStats({ crops: 12, adulterants: 5, standards: "SLSI 644", districts: 25 });
        } else {
          setAnimatedStats({
            crops: Math.floor((targets.crops / steps) * start),
            adulterants: Math.floor((targets.adulterants / steps) * start),
            standards: "SLSI 644",
            districts: Math.floor((targets.districts / steps) * start)
          });
        }
      }, incrementTime);
      return () => clearInterval(timer);
    }
  }, [activeWorkspace]);

  // Open Tool and Route to Appropriate Workspace
  const handleOpenTool = (toolId) => {
    const operationsTools = ['dosage', 'calendar', 'screening', 'bagscan', 'tankmix', 'granule3d'];
    const marketTools = ['govpassbook', 'procurement', 'distributors', 'priceforecast', 'subsidy', 'credit', 'carbonlca'];
    const scienceTools = ['leafdoctor', 'chat', 'weather', 'organic', 'dolomite', 'straw', 'salinity', 'ellangawa', 'drone', 'whistleblower'];

    if (operationsTools.includes(toolId)) {
      setActiveWorkspace('operations');
      setActiveTool(toolId);
    } else if (marketTools.includes(toolId)) {
      setActiveWorkspace('market');
      setActiveTool(toolId === 'distributors' ? 'procurement' : toolId);
    } else if (scienceTools.includes(toolId)) {
      setActiveWorkspace('science');
      setActiveTool(toolId);
    } else {
      setActiveWorkspace('home');
      setActiveTool('home');
    }

    setRecentTools(prev => {
      const newTools = [toolId, ...prev.filter(t => t !== toolId)].slice(0, 3);
      try { localStorage.setItem('recentFarmerTools', JSON.stringify(newTools)); } catch(e) {}
      return newTools;
    });

    playTone('ding');
  };

  const handleLaunchPrescriptionModal = (rxData) => {
    const docId = `DOA-RX-2026-${Date.now().toString().slice(-6)}`;
    setPrescriptionData({
      docId,
      issueDate: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'si-LK', { year: 'numeric', month: 'long', day: 'numeric' }),
      issueTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      crop: rxData.crop || farmerProfile.crop,
      landAcres: rxData.landAcres || farmerProfile.landAcres,
      landHa: ((rxData.landAcres || farmerProfile.landAcres) * 0.404686).toFixed(2),
      ureaBags: rxData.ureaBags || 2,
      mopBags: rxData.mopBags || 1,
      tspBags: rxData.tspBags || 1,
      totalBags: (rxData.ureaBags || 2) + (rxData.mopBags || 1) + (rxData.tspBags || 1),
      savingsLkr: rxData.savingsLkr || 14200,
      verificationHash: `DOA-AGR-VERIFIED-${docId}`
    });
    setShowPrescriptionModal(true);
  };

  // Master Tile Registry for Home Navigation
  const allTiles = [
    // 1. Daily Operations Hub (දෛනික මෙහෙයුම්)
    { id: 'dosage', hub: 'operations', cat: 'dosage', label: t.tileDosage, icon: '⚖️', desc: t.dosageHelp, popular: true },
    { id: 'calendar', hub: 'operations', cat: 'dosage', label: tr("වී වර්ධන අවධි හා කන්න දින දර්ශනය", "DOA Paddy Growth Stage Calendar", "நெல் வளர்ச்சி காலண்டர்"), icon: '🌾', desc: tr("බිම් සැකසීමේ සිට අස්වැන්න දක්වා දිනෙන් දින පොහොර හා ජල නිර්දේශ", "Day-by-day fertilizer and water depth advice from Basal to Milk stage", "விதைப்பு முதல் அறுவடை வரை தினசரி உர வழிகாட்டல்"), popular: true },
    { id: 'screening', hub: 'operations', cat: 'quality', label: t.tileScreening, icon: '🔍', desc: t.screeningHelp, popular: true },
    { id: 'bagscan', hub: 'operations', cat: 'quality', label: tr("පොහොර උරයේ මුද්‍රණ හා හොලෝග්‍රෑම් ස්කෑනරය", "Bag Packaging & Security Scanner", "உர பை சரிபார்ப்பு"), icon: '📦', desc: tr("රජයේ ලක්පොහොර හා CCF උරවල හොලෝග්‍රෑම්, ද්විත්ව මැහුම් පරීක්ෂාව", "Authenticity check for diffraction hologram, microprint & chainstitch", "ஹோலோகிராம் மற்றும் இரட்டை தையல் பரிசோதனை") },
    { id: 'tankmix', hub: 'operations', cat: 'dosage', label: t.tileTankMix, icon: '🧪', desc: t.tankMixHelp },
    { id: 'granule3d', hub: 'operations', cat: 'quality', label: t.tileGranule3D, icon: '🧊', desc: t.granule3DHelp },

    // 2. Market & Procurement Hub (වෙළඳපොළ සහ ප්‍රසම්පාදන)
    { id: 'govpassbook', hub: 'market', cat: 'finance', label: tr("ඩිජිටල් ගොවි පොත සහ DAD ද්වාරය", "Digital Govi Passbook & GovNet", "டிஜிட்டல் உர புத்தகம்"), icon: '🪪', desc: tr("DAD ගොවි ලියාපදිංචිය, යාය ලේඛනය, කන්න කෝටා සහ පෝලිම් රහිත QR වවුචරය", "Verified DAD Registry, Yaya cadastre, season quota balance & fast-track QR pass", "அரசு விவசாயி பதிவு, நில விபரம், பருவ உர ஒதுக்கீடு மற்றும் QR டோக்கன்"), popular: true },
    { id: 'procurement', hub: 'market', cat: 'finance', label: tr("ඔන්ලයින් පොහොර මිලදී ගැනීම් හා පෙර-ඇණවුම්", "Online Fertilizer Procurement & Pre-orders", "ஆன்லைன் உர கொள்முதல்"), icon: '🛒', desc: tr("රජයේ හා බලපත්‍රලාභී සමාගම්වලින් සෘජුවම සහන මිලට පොහොර වෙන්කරවා ගැනීම", "Reserve verified fertilizers directly from state and licensed private distributors", "அரசு மற்றும் தனியார் நிறுவனங்களிடம் இருந்து நேரடி உர கொள்முதல்"), popular: true },
    { id: 'priceforecast', hub: 'market', cat: 'finance', label: tr("පොහොර වෙළඳපොළ මිල අනාවැකි (මාස 6)", "6-Month Fertilizer Market Price Forecaster", "உர சந்தை விலை கணிப்பு"), icon: '📈', desc: tr("ගෝලීය බොරතෙල්, USD/LKR හා නැව් ගාස්තු අනුව ඉදිරි මාසවල මිල පුරෝකථනය", "Econometric retail price trend prediction to spot the most profitable buy window", "எதிர்கால உர விலை மாற்றங்களை முன்கூட்டியே அறிந்து சேமிக்கவும்") },
    { id: 'distributors', hub: 'market', cat: 'finance', label: tr("පොහොර බෙදාහරින ආයතන හා ගබඩා නාමාවලිය", "Distributors & Warehouses Directory", "உர விநியோகஸ்தர்கள் மற்றும் களஞ்சியங்கள்"), icon: '🏢', desc: tr("CCF, ලක්පොහොර, බෝවර්, CIC, හේලීස්, ලැන්කම් ගබඩා තොරතුරු හා දුරකථන", "Authorized state and private distributor warehouses, capacity & contacts", "அரசு மற்றும் தனியார் உர நிறுவன களஞ்சியங்கள்") },
    { id: 'subsidy', hub: 'market', cat: 'finance', label: tr("රජයේ පොහොර සහනාධාර ඊ-පසුම්බිය", "Govt Subsidy E-Wallet", "அரசு மானிய மின்-பை"), icon: '💳', desc: tr("රු. 15,000 සහනාධාර වවුචර ශේෂය සහ කාබන් දීමනාව", "Check Rs. 15,000 quota and green carbon bonus", "ரூ. 15,000 மானிய இருப்பு மற்றும் கார்பன் நிதி") },
    { id: 'credit', hub: 'market', cat: 'finance', label: tr("සහන කෘෂි ණය ශ්‍රේණිය", "Agrarian Concessionary Credit Score", "விவசாய கடன் தகுதி"), icon: '🏦', desc: tr("6.5% අඩු පොලී කෘෂි ණය සඳහා සුදුසුකම් පරීක්ෂාව", "Scorecard for CBSL supported 6.5% agricultural loans", "6.5% குறைந்த வட்டி விவசாய கடன் மதிப்பீடு") },
    { id: 'carbonlca', hub: 'market', cat: 'finance', label: tr("කාබන් පියසටහන හා Green Credits", "Carbon LCA & Green Credits", "கார்பன் தடம் & கிரெடிட்"), icon: '🌱', desc: tr("හරිතාගාර වායු විමෝචනය අවම කර කාබන් මුදල් දීමනා ගණනය", "Measure CO2 footprint and carbon credit offset rewards", "CO2 தடம் மற்றும் கார்பன் வரவு மதிப்பீடு") },

    // 3. Field Science & Advisory Hub (කෘෂි විද්‍යාව සහ උපදෙස්)
    { id: 'leafdoctor', hub: 'science', cat: 'advisory', label: t.tileLeafDoc, icon: '🍃', desc: t.leafDocHelp, popular: true },
    { id: 'chat', hub: 'science', cat: 'advisory', label: tr("CropSafe AI ගොවි සහයක (හඬින් හා ලිවීමෙන්)", "Farmer AI Voice & Chat Assistant", "விவசாய AI குரல் & அரட்டை"), icon: '💬', desc: tr("ඕනෑම කෘෂි ගැටලුවකට සිංහලෙන් හෝ දෙමළෙන් ක්ෂණික පිළිතුරු", "Instant expert answers in Sinhala, Tamil, or English", "சிங்களம் அல்லது தமிழில் உடனடி விவசாய ஆலோசனைகள்") },
    { id: 'weather', hub: 'science', cat: 'advisory', label: tr("කාලගුණය හා පොහොර යෙදීමට සුදුසු දින", "Agronomic Weather Advisory", "வானிலை & உரம் இடல்"), icon: '🌧️', desc: tr("වැස්සට පොහොර සේදීයාම වළක්වා නිවැරදි දින තෝරාගනිමු", "Rain risk forecasting to prevent fertilizer runoff washouts", "மழையால் உரம் வீணாவதை தடுக்கும் வானிலை அறிவுரை") },
    { id: 'organic', hub: 'science', cat: 'advisory', label: tr("කාබනික පොහොර හා ජීවාමෘත වට්ටෝරු", "Organic Bio-Fertilizer Recipes", "இயற்கை திரவ உரம்"), icon: '🍯', desc: tr("ජීවාමෘත, පංචගව්‍ය හා කොහොඹ කෘමිනාශක නිවසේදීම හදමු", "Home preparation of Jeevamrutha, Panchagavya & Neem extracts", "ஜீவாமிர்தம், பஞ்சகவ்யா தயாரிக்கும் முறைகள்") },
    { id: 'dolomite', hub: 'science', cat: 'advisory', label: tr("පසෙහි ආම්ලිකතාවය හා ඩොලමයිට්", "Soil Acidity & Dolomite Guide", "மண் அமிலத்தன்மை & டோலமைட்"), icon: '🧪', desc: tr("පස ඇඹුල් වීම (pH < 5.5) සුවපත් කර අස්වැන්න වැඩි කරමු", "Neutralize soil acidity to unlock trapped phosphorus", "மண் அமிலத்தன்மையை குறைத்து விளைச்சலை அதிகரிக்க") },
    { id: 'straw', hub: 'science', cat: 'advisory', label: tr("පිදුරු දිරවීමෙන් MOP 50% ඉතිරිකර ගැනීම", "Rice Straw K2O In-situ Recycling", "வைக்கோல் மறுசுழற்சி"), icon: '🌾', desc: tr("පිදුරු ගිනි නොතබා පසට යටකර පොටෑසියම් ස්වාභාවිකව ලබාගැනීම", "In-situ straw decomposition saves up to 50% imported MOP Potash", "வைக்கோலை மண்ணில் மக்க வைப்பதன் மூலம் MOP உரத்தில் 50% சேமிக்கலாம்") },
    { id: 'salinity', hub: 'science', cat: 'advisory', label: tr("කිවුල් / ලවණ පස් සුවපත් කිරීම", "Soil Salinity & Gypsum Remediation", "உவர் மண் சீரமைப்பு"), icon: '🌊', desc: tr("ජිප්සම් යොදා කිවුල් කුඹුරු යථා තත්ත්වයට පත් කිරීම", "Gypsum and leaching calculator for coastal/dry zone soils", "ஜிப்சம் மூலம் உவர் நிலத்தை சீரமைக்கும் முறை") },
    { id: 'ellangawa', hub: 'science', cat: 'advisory', label: tr("එල්ලංගා වැව හා ජල පෝෂක සංරක්ෂණය", "Cascade Runoff Protection", "பாரம்பரிய குளம் பாதுகாப்பு"), icon: '🏛️', desc: tr("පුරාණ වැව් පද්ධතිය රැකගෙන පොහොර සේදීයාම වැළැක්වීම", "Ancient village cascade system watershed protection", "பாரம்பரிய குளங்களை பாதுகாத்து உரம் வீணாவதை தடுக்க") },
    { id: 'drone', hub: 'science', cat: 'advisory', label: tr("ත්‍රිමාණ ඩ්‍රෝන ක්ෂේත්‍ර සෞඛ්‍ය ස්කෑනරය", "3D Drone Multispectral NDVI Health Scanner", "ட்ரோன் ஆய்வு"), icon: '🛸', desc: tr("චන්ද්‍රිකා සහ ඩ්‍රෝන NDVI මගින් පොහොර හිඟ ප්‍රදේශ හඳුනාගැනීම", "Spot nitrogen deficiency zones via vegetation index sensors", "சென்சார்கள் மூலம் பயிர் வளர்ச்சி குறைபாடுகளை கண்டறிய") },
    { id: 'whistleblower', hub: 'science', cat: 'advisory', label: tr("නීතිවිරෝධී මිල හා ව්‍යාජ පොහොර පැමිණිලි (CAA)", "CAA Whistleblower & Price Gouging Portal", "விலை புகார் அளிப்பு"), icon: '📢', desc: tr("වැඩි මිලට පොහොර විකිණීම හා ව්‍යාජ ජාවාරම්කරුවන් පාරිභෝගික අධිකාරියට වාර්තා කිරීම", "Report black market prices and counterfeit dealers anonymously", "அதிக விலைக்கு உரம் விற்பனை செய்பவர்கள் மீது புகார் அளிக்க") }
  ];

  const visibleTiles = allTiles.filter(tile => {
    const matchesCategory = selectedCategory === 'all' || tile.cat === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      tile.label.toLowerCase().includes(q) || 
      tile.desc.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`space-y-6 pb-20 ${sunlightMode ? 'contrast-125 filter' : ''} ${fontSize === 'large' ? 'text-base' : (fontSize === 'xlarge' ? 'text-lg' : '')}`}>
      
      {/* ========================================================================= */}
      {/* 1. MASTER WORKSPACE SEGMENTED SWITCHER                                     */}
      {/* ========================================================================= */}
      <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'home', label: tr("🏠 ප්‍රධාන පුවරුව", "🏠 All Hubs", "🏠 முதன்மை"), desc: "Portal Overview" },
          { id: 'operations', label: tr("🌾 දෛනික මෙහෙයුම්", "🌾 Daily Operations", "🌾 தினசரி செயல்பாடுகள்"), desc: "Dosage, Calendar, Screening" },
          { id: 'market', label: tr("💰 වෙළඳපොළ සහ ඇණවුම්", "💰 Market & Orders", "💰 சந்தை & முன்பதிவு"), desc: "Procurement, Forecast, Subsidy" },
          { id: 'science', label: tr("🔬 කෘෂි විද්‍යාව සහ උපදෙස්", "🔬 Field Science & AI", "🔬 விவசாய அறிவியல்"), desc: "Leaf Doctor, Chatbot, Soil" }
        ].map((ws) => (
          <button
            key={ws.id}
            type="button"
            onClick={() => {
              setActiveWorkspace(ws.id);
              playTone('ding');
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all flex items-center space-x-2 ${
              activeWorkspace === ws.id
                ? 'bg-emerald-700 text-white shadow-md transform scale-[1.02]'
                : 'bg-transparent text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
            }`}
          >
            <span>{ws.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 2. GRAND FARMER HOME PORTAL (activeWorkspace === 'home')                   */}
      {/* ========================================================================= */}
      {activeWorkspace === 'home' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Offline Mode Indicator Banner */}
          {isOffline && (
            <div className="bg-amber-500 text-slate-950 p-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-between shadow-md">
              <div className="flex items-center space-x-2">
                <span className="text-base animate-pulse">📡</span>
                <span>{tr("නොබැඳි මාදිලිය (Offline Mode) සක්‍රියයි - පොහොර මාත්‍රා ගණනය හා උපදෙස් අන්තර්ජාලය නොමැතිවද ක්‍රියාත්මක වේ.", "Offline Mode Active - Fertilizer calculations and guidance remain fully functional without internet.", "ஆஃப்லைன் பயன்முறை செயலில் உள்ளது.")}</span>
              </div>
              <span className="text-[10px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded-full font-mono uppercase font-black">
                PWA READY
              </span>
            </div>
          )}
          
          {/* Consolidated Farmer Identity & Welcome Banner */}
          <div className={`clean-card overflow-hidden bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white shadow-lg ${sunlightMode ? 'border-2 border-slate-900' : 'border-0'}`}>
            <div className="p-5 sm:p-7 relative z-10 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Farmer Profile Info */}
                <div className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30 flex-shrink-0">
                    👨🏽‍🌾
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-xl sm:text-2xl font-black text-white">
                        {farmerProfile.name}
                      </h1>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-400/30 text-emerald-100 font-bold border border-emerald-300/40">
                        {tr("ලියාපදිංචි ගොවි", "Registered Farmer", "விவசாயி")}
                      </span>
                    </div>
                    <div className="text-xs text-emerald-100/90 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 font-medium">
                      <span>📍 {farmerProfile.district} • {farmerProfile.ascDivision}</span>
                      <span>🌾 {farmerProfile.crop === 'paddy' ? 'වී වගාව' : farmerProfile.crop}</span>
                      <span>📐 {farmerProfile.landAcres} {tr("අක්කර", "Acres", "ஏக்கர்")}</span>
                      <button
                        type="button"
                        onClick={() => { setTempProfile({ ...farmerProfile }); setShowProfileModal(true); }}
                        className="text-amber-300 hover:text-white underline font-bold text-[11px] transition-colors"
                      >
                        {tr("පැතිකඩ වෙනස් කරන්න ✏️", "Edit Profile ✏️", "விவரங்களை மாற்ற ✏️")}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hotline, Demo Tour & Accessibility Controls */}
                <div className="flex items-center flex-wrap gap-2.5 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => { playTone('ding'); setShowTourModal(true); }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-md flex items-center space-x-1.5 transition-all hover:scale-105 active:scale-95"
                    title={tr("ක්‍රියාකාරී ආදර්ශන චාරිකාව", "Interactive Demo Tour", "மாதிரி உலா")}
                  >
                    <span>🚀</span>
                    <span>{tr("ආදර්ශන චාරිකාව", "Demo Tour", "மாதிரி உலா")}</span>
                  </button>

                  <a
                    href="tel:1920"
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs shadow-md flex items-center space-x-1.5 transition-all hover:scale-105 active:scale-95"
                    title={tr("කෘෂිකර්ම උපදේශන සේවය", "Department of Agriculture Hotline", "விவசாய உதவி")}
                  >
                    <PhoneCall className="w-4 h-4 text-amber-950" />
                    <span>{tr("නොමිලේ 1920", "Hotline: 1920", "அழைப்பு: 1920")}</span>
                  </a>

                  {/* Font Zoom Controls */}
                  <div className="flex items-center bg-black/25 rounded-xl p-0.5 border border-white/20 backdrop-blur-sm">
                    {[
                      { id: 'normal', label: 'A' },
                      { id: 'large', label: 'A+' },
                      { id: 'xlarge', label: 'A++' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontSize(f.id)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                          fontSize === f.id ? 'bg-white text-emerald-950 shadow-sm' : 'text-white/80 hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Sunlight Contrast Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => setSunlightMode(!sunlightMode)}
                    className={`p-2 rounded-xl border transition-all ${
                      sunlightMode 
                        ? 'bg-amber-300 text-slate-950 border-amber-400 shadow-md font-black' 
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                    title={tr("හිරු එළිය වැඩි මාදිලිය (Outdoor Sunlight Mode)", "Outdoor High Contrast", "சூரிய ஒளி முறை")}
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Authentic Farmer & Seasonal Quota Telemetry */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/15">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/10">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">{tr("ලියාපදිංචි ඉඩම", "Registered Land", "பதிவு நிலம்")}</span>
                  <span className="text-base sm:text-lg font-black text-white">{farmerProfile.landAcres} {tr("අක්කර (වී)", "Acres (Paddy)", "ஏக்கர்")}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/10">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">{tr("මාස් කන්න කෝටාව", "Maha Quota", "பருவ ஒதுக்கீடு")}</span>
                  <span className="text-base sm:text-lg font-black text-emerald-300">යූරියා 6 | MOP 2</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/10">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">{tr("ඉතිරි පොහොර ශේෂය", "Remaining Quota", "மீதமுள்ள உரம்")}</span>
                  <span className="text-base sm:text-lg font-black text-amber-300">මිටි 4 {tr("ඉතිරියි", "Bags Left", "மீதம்")}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/10">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">{tr("සහනාධාර තත්ත්වය", "DBT Subsidy", "மானியம்")}</span>
                  <span className="text-base sm:text-lg font-black text-white">BOC බැරවිය ✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rotating Agronomic Tip Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 rounded-2xl p-3.5 px-4 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-2.5">
              <span className="text-lg animate-bounce">💡</span>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                <span className="text-emerald-800 font-black mr-1">{tr("අද දවසේ කෘෂි උපදෙස:", "Daily Tip:", "இன்றைய குறிப்பு:")}</span>
                {[
                  tr("යූරියා ජලයට දැමූ විට විනාඩියකින් සම්පූර්ණයෙන් සීතල වෙමින් දියවිය යුතුය. අඩියේ වැලි හෝ කුඩු නොතිබිය යුතුය.", "Genuine Urea dissolves cold in water within 60 seconds with 0 sediment.", "யூரியா 60 வினாடிகளில் குளிர்ந்து கரைய வேண்டும்."),
                  tr("කන්නයේ පළමු දිනවල TSP සහ MOP මූලික පොහොර ලෙස යෙදිය යුතු අතර වැපිරීමේදී යූරියා නොයොදන්න.", "Apply TSP and MOP as basal fertilizers at land prep; never broadcast Urea at sowing.", "விதைப்பின் போது யூரியா இட வேண்டாம்; TSP மற்றும் MOP இடவும்."),
                  tr("පිදුරු කුඹුරේම දිරවීමට සැලැස්වීමෙන් මිල අධික MOP රතු පොහොර අවශ්‍යතාවයෙන් 50% ක් ඉතිරි කරගත හැක.", "Recycling paddy straw in-situ saves up to 50% of expensive imported MOP potash.", "வைக்கோலை மக்க வைப்பதன் மூலம் MOP உரத்தில் 50% சேமிக்கலாம்.")
                ][tipIndex]}
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
              DOA ADVISORY
            </span>
          </div>

          {/* 4 Hero Quick-Action Workspace Launchers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <button
              type="button"
              onClick={() => handleOpenTool('dosage')}
              className="p-5 rounded-2xl bg-white hover:bg-emerald-50/70 border-2 border-emerald-200 text-left transition-all hover:scale-[1.02] shadow-sm group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mb-3 shadow-xs group-hover:scale-110 transition-transform">
                ⚖️
              </div>
              <strong className="text-base font-black text-slate-900 block group-hover:text-emerald-800">
                {t.tileDosage}
              </strong>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {t.dosageHelp}
              </p>
              <div className="mt-3 flex items-center space-x-1 text-xs font-black text-emerald-700">
                <span>{tr("ගණනය කරන්න", "Calculate Now", "கணக்கிடு")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleOpenTool('calendar')}
              className="p-5 rounded-2xl bg-white hover:bg-teal-50/70 border-2 border-teal-200 text-left transition-all hover:scale-[1.02] shadow-sm group"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl mb-3 shadow-xs group-hover:scale-110 transition-transform">
                🌾
              </div>
              <strong className="text-base font-black text-slate-900 block group-hover:text-teal-800">
                {tr("කන්න දින දර්ශනය", "DOA Crop Calendar", "பயிர் காலண்டர்")}
              </strong>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {tr("බිම් සැකසීමේ සිට අස්වැන්න දක්වා දිනෙන් දින පොහොර උපදෙස්", "Day-by-day fertilizer & water instructions for your crop", "தினசரி உர வழிகாட்டல்")}
              </p>
              <div className="mt-3 flex items-center space-x-1 text-xs font-black text-teal-700">
                <span>{tr("දින දර්ශනය බලන්න", "Open Calendar", "காலண்டர்")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleOpenTool('procurement')}
              className="p-5 rounded-2xl bg-white hover:bg-blue-50/70 border-2 border-blue-200 text-left transition-all hover:scale-[1.02] shadow-sm group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl mb-3 shadow-xs group-hover:scale-110 transition-transform">
                🛒
              </div>
              <strong className="text-base font-black text-slate-900 block group-hover:text-blue-800">
                {tr("ඔන්ලයින් ඇණවුම් & ගබඩා", "Online Orders & Depots", "உர முன்பதிவு")}
              </strong>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {tr("රජයේ ලක්පොහොර හා CCF ගබඩාවලින් සෘජුවම වෙන්කරවා ගන්න", "Direct booking from CCF and Lakpohora warehouses", "நேரடி முன்பதிவு")}
              </p>
              <div className="mt-3 flex items-center space-x-1 text-xs font-black text-blue-700">
                <span>{tr("ඇණවුම් කරන්න", "Pre-order Now", "முன்பதிவு செய்")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleOpenTool('leafdoctor')}
              className="p-5 rounded-2xl bg-white hover:bg-emerald-50/70 border-2 border-emerald-200 text-left transition-all hover:scale-[1.02] shadow-sm group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mb-3 shadow-xs group-hover:scale-110 transition-transform">
                🍃
              </div>
              <strong className="text-base font-black text-slate-900 block group-hover:text-emerald-800">
                {t.tileLeafDoc}
              </strong>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {t.leafDocHelp}
              </p>
              <div className="mt-3 flex items-center space-x-1 text-xs font-black text-emerald-700">
                <span>{tr("රෝගය බලන්න", "Diagnose Leaf", "நோய் அறிதல்")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Search & Category Filter Header */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tr("ඕනෑම කෘෂි සේවාවක් නමෙන් සොයන්න (උදා: මාත්‍රාව, ඩොලමයිට්, ඇණවුම්)...", "Search any agricultural service or tool...", "சேவைகளை தேடுக...")}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: tr("සියල්ල", "All", "அனைத்தும்"), count: allTiles.length },
                  { id: 'quality', label: tr("තත්ත්ව පරීක්ෂණ", "Quality", "தரம்"), count: allTiles.filter(t => t.cat === 'quality').length },
                  { id: 'dosage', label: tr("මාත්‍රා & කන්න", "Dosage & Stages", "அளவு"), count: allTiles.filter(t => t.cat === 'dosage').length },
                  { id: 'finance', label: tr("වෙළඳපොළ & මුදල්", "Market & Finance", "நிதி"), count: allTiles.filter(t => t.cat === 'finance').length },
                  { id: 'advisory', label: tr("පස & උපදෙස්", "Soil & Advisory", "ஆலோசனை"), count: allTiles.filter(t => t.cat === 'advisory').length }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setSelectedCategory(cat.id); playTone('ding'); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                      selectedCategory === cat.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat.id ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recently Used Tools Bar */}
            {recentTools.length > 0 && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 pt-1">
                <span className="font-bold flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tr("මෑතකදී භාවිත කළ මෙවලම්:", "Recently Used:", "சமீபத்தில் பயன்படுத்தியவை:")}</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {recentTools.map(rtId => {
                    const tile = allTiles.find(t => t.id === rtId);
                    if (!tile) return null;
                    return (
                      <button
                        key={rtId}
                        type="button"
                        onClick={() => handleOpenTool(rtId)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-200 text-[11px] transition-all"
                      >
                        {tile.icon} {tile.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Master Tool Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {visibleTiles.map(tile => (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleOpenTool(tile.id)}
                className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md text-left transition-all hover:scale-[1.01] flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{tile.icon}</span>
                    <div className="flex items-center space-x-1.5">
                      {tile.popular && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          POPULAR
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {tile.hub === 'operations' ? '🌾 මෙහෙයුම්' : (tile.hub === 'market' ? '💰 වෙළඳපොළ' : '🔬 කෘෂි විද්‍යාව')}
                      </span>
                    </div>
                  </div>
                  <strong className="text-sm sm:text-base font-black text-slate-900 block group-hover:text-emerald-700 transition-colors">
                    {tile.label}
                  </strong>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {tile.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-600 group-hover:text-emerald-700">
                  <span>{tr("විවෘත කරන්න", "Launch Service", "தொடங்கு")}</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WORKSPACE 1: DAILY OPERATIONS HUB                                     */}
      {/* ========================================================================= */}
      {activeWorkspace === 'operations' && (
        <DailyOperationsHub
          language={language}
          tr={tr}
          activeTool={activeTool}
          onSelectTool={(toolId) => setActiveTool(toolId)}
          onBackToHome={() => setActiveWorkspace('home')}
          onOpenPrescription={handleLaunchPrescriptionModal}
          farmerProfile={farmerProfile}
          playTone={playTone}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. WORKSPACE 2: MARKET & PROCUREMENT HUB                                  */}
      {/* ========================================================================= */}
      {activeWorkspace === 'market' && (
        <MarketProcurementHub
          language={language}
          tr={tr}
          activeTool={activeTool}
          onSelectTool={(toolId) => setActiveTool(toolId)}
          onBackToHome={() => setActiveWorkspace('home')}
          farmerProfile={farmerProfile}
          onUpdateProfile={(updated) => setFarmerProfile(prev => ({ ...prev, ...updated }))}
          playTone={playTone}
        />
      )}

      {/* ========================================================================= */}
      {/* 5. WORKSPACE 3: FIELD SCIENCE & ADVISORY HUB                              */}
      {/* ========================================================================= */}
      {activeWorkspace === 'science' && (
        <FieldScienceAdvisoryHub
          language={language}
          tr={tr}
          activeTool={activeTool}
          onSelectTool={(toolId) => setActiveTool(toolId)}
          onBackToHome={() => setActiveWorkspace('home')}
          farmerProfile={farmerProfile}
          playTone={playTone}
        />
      )}

      {/* ========================================================================= */}
      {/* MODALS: PROFILE, TOUR & AGRONOMIC PRESCRIPTION                            */}
      {/* ========================================================================= */}

      {/* 1. Farmer Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 border border-emerald-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <span>👨🏽‍🌾</span>
                <span>{tr("ගොවි පැතිකඩ තොරතුරු", "Farmer Profile Settings", "விவசாயி சுயவிவரம்")}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  {tr("නම:", "Full Name:", "பெயர்:")}
                </label>
                <input
                  type="text"
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  {tr("ජාතික හැඳුනුම්පත් අංකය (NIC):", "National Identity Card (NIC):", "தேசிய அடையாள அட்டை:")}
                </label>
                <input
                  type="text"
                  value={tempProfile.nic}
                  onChange={(e) => setTempProfile({ ...tempProfile, nic: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1">
                    {tr("දිස්ත්‍රික්කය:", "District:", "மாவட்டம்:")}
                  </label>
                  <select
                    value={tempProfile.district}
                    onChange={(e) => setTempProfile({ ...tempProfile, district: e.target.value })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                  >
                    {['Anuradhapura', 'Polonnaruwa', 'Kurunegala', 'Ampara', 'Hambantota', 'Matale', 'Kandy', 'Badulla', 'Gampaha', 'Kalutara', 'Jaffna'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1">
                    {tr("ඉඩම (අක්කර):", "Land (Acres):", "ஏக்கர்:")}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.25"
                    max="100"
                    value={tempProfile.landAcres}
                    onChange={(e) => setTempProfile({ ...tempProfile, landAcres: parseFloat(e.target.value) || 1 })}
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  {tr("ගොවිජන සේවා මධ්‍යස්ථානය (ASC):", "Agrarian Services Center:", "விவசாய சேவை மையம்:")}
                </label>
                <input
                  type="text"
                  value={tempProfile.ascDivision}
                  onChange={(e) => setTempProfile({ ...tempProfile, ascDivision: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700"
                >
                  {tr("අවලංගු කරන්න", "Cancel", "ரத்து")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md"
                >
                  {tr("සුරකින්න", "Save Profile", "சேமிக்க")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Interactive Guided Tour Modal */}
      {showTourModal && (
        <InteractiveTourModal
          isOpen={showTourModal}
          onClose={() => setShowTourModal(false)}
          onNavigate={(targetTab) => {
            setShowTourModal(false);
            handleOpenTool(targetTab);
          }}
          language={language}
        />
      )}

      {/* 3. Official Printable Agronomic Prescription Modal */}
      {showPrescriptionModal && (
        <AgriPrescriptionModal
          isOpen={showPrescriptionModal}
          onClose={() => setShowPrescriptionModal(false)}
          farmerProfile={farmerProfile}
          prescriptionData={prescriptionData}
          dosageData={prescriptionData || {}}
          language={language}
        />
      )}

      {/* ========================================================================= */}
      {/* MOBILE STICKY BOTTOM NAVIGATION BAR                                      */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => {
            setActiveWorkspace('home');
            playTone('ding');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeWorkspace === 'home' ? 'text-emerald-700 font-black scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] tracking-tight">{tr("මුල් පිටුව", "Home", "முகப்பு")}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveWorkspace('operations');
            setActiveTool('calendar');
            playTone('ding');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeWorkspace === 'operations' && activeTool === 'calendar' ? 'text-emerald-700 font-black scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-xl">🌾</span>
          <span className="text-[10px] tracking-tight">{tr("කන්නය", "Calendar", "காலண்டர்")}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveWorkspace('market');
            setActiveTool('procurement');
            playTone('ding');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeWorkspace === 'market' ? 'text-emerald-700 font-black scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-xl">🛒</span>
          <span className="text-[10px] tracking-tight">{tr("ඇණවුම්", "Orders", "முன்பதிவு")}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveWorkspace('operations');
            setActiveTool('dosage');
            playTone('ding');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeWorkspace === 'operations' && activeTool === 'dosage' ? 'text-emerald-700 font-black scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-xl">⚖️</span>
          <span className="text-[10px] tracking-tight">{tr("මාත්‍රාව", "Dosage", "அளவு")}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveWorkspace('science');
            setActiveTool('leafdoctor');
            playTone('ding');
          }}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
            activeWorkspace === 'science' ? 'text-emerald-700 font-black scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="text-xl">🍃</span>
          <span className="text-[10px] tracking-tight">{tr("පත්‍ර රෝග", "Leaf Doc", "இலை நோய்")}</span>
        </button>
      </div>

    </div>
  );
}
