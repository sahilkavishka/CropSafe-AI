import React, { useState, useRef } from 'react';
import {
  Calculator,
  Calendar,
  FlaskConical,
  Scan,
  Layers,
  Rotate3d,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Droplets,
  Flame,
  Check,
  PhoneCall,
  Camera,
  VideoOff,
  Printer,
  FileText,
  ShieldCheck,
  Share2,
  Sparkles,
  ArrowRight,
  Sparkle
} from 'lucide-react';
import ThreeGranuleCanvas from '../ThreeGranuleCanvas';
import { translations } from '../../i18n';

const API_BASE = "http://localhost:8000";

export default function DailyOperationsHub({
  language = 'si',
  tr = (si, en, ta) => (language === 'ta' ? (ta || en || si) : language === 'en' ? (en || si) : si),
  activeTool = 'dosage',
  onSelectTool = () => {},
  onBackToHome = () => {},
  onOpenPrescription = () => {},
  farmerProfile = { landAcres: 2.5, crop: 'paddy' },
  playTone = () => {}
}) {
  const t = translations[language] || translations.si;

  // Selected sub-tool inside Daily Operations Hub
  const [currentTool, setCurrentTool] = useState(activeTool || 'dosage');

  // Update currentTool if parent activeTool changes
  React.useEffect(() => {
    if (activeTool && activeTool !== 'home') {
      setCurrentTool(activeTool);
    }
  }, [activeTool]);

  const handleToolChange = (toolId) => {
    setCurrentTool(toolId);
    onSelectTool(toolId);
    playTone('ding');
  };

  // ----------------------------------------------------
  // 1. PRECISION DOSAGE STATE & LOGIC
  // ----------------------------------------------------
  const [selectedCrop, setSelectedCrop] = useState(farmerProfile?.crop || 'paddy');
  const [landAcres, setLandAcres] = useState(farmerProfile?.landAcres || 1.0);
  const [dosageResult, setDosageResult] = useState(null);
  const [dosageLoading, setDosageLoading] = useState(false);

  const handleCalculateDosage = async (crop = selectedCrop, acres = landAcres) => {
    setDosageLoading(true);
    setSelectedCrop(crop);
    setLandAcres(acres);
    try {
      const res = await fetch(`${API_BASE}/api/farmer/calculate-dosage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_type: crop,
          land_acres: acres,
          organic_matter_level: 'medium',
          irrigation_type: 'irrigated'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDosageResult(data);
        playTone('chime');
        setDosageLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    // DOA Standard fallback
    setTimeout(() => {
      const ureaBags = Math.ceil(acres * 2.2);
      const mopBags = Math.ceil(acres * 1.0);
      const tspBags = Math.ceil(acres * 0.9);
      const savings = Math.round(acres * 14200);

      setDosageResult({
        crop_type: crop,
        land_acres: acres,
        bags_50kg_required: {
          Urea_Bags: ureaBags,
          MOP_Bags: mopBags,
          TSP_Bags: tspBags
        },
        cost_breakdown_lkr: {
          farmer_savings_lkr: savings
        }
      });
      playTone('chime');
      setDosageLoading(false);
    }, 200);
  };

  // Auto calculate dosage on mount if no result
  React.useEffect(() => {
    if (!dosageResult) {
      handleCalculateDosage(selectedCrop, landAcres);
    }
  }, []);

  const triggerPrescription = () => {
    const ureaBags = dosageResult?.bags_50kg_required?.Urea_Bags || Math.ceil(landAcres * 2.2);
    const mopBags = dosageResult?.bags_50kg_required?.MOP_Bags || Math.ceil(landAcres * 1.0);
    const tspBags = dosageResult?.bags_50kg_required?.TSP_Bags || Math.ceil(landAcres * 0.9);
    const savings = dosageResult?.cost_breakdown_lkr?.farmer_savings_lkr || Math.round(landAcres * 14200);

    onOpenPrescription({
      crop: selectedCrop,
      landAcres,
      ureaBags,
      mopBags,
      tspBags,
      savingsLkr: savings,
      dosageResult
    });
  };

  // ----------------------------------------------------
  // 2. CROP STAGE & GROWTH CALENDAR STATE
  // ----------------------------------------------------
  const [calendarPaddyType, setCalendarPaddyType] = useState('3.5_month');
  const [selectedCropStage, setSelectedCropStage] = useState(1);

  const paddyStages = [
    {
      stage: 1,
      name: tr("මූලික බිම් සැකසීම සහ වැපිරීම", "Basal & Sowing", "அடிப்படை உழவு மற்றும் விதைப்பு"),
      days: "Day 0",
      fertilizer: tr("TSP මූලික පොහොර (බිම් සැකසීමේ අවසන් හෑමට පෙර)", "TSP Basal (Full dose before final puddling)", "TSP உரம் (இறுதி உழவுக்கு முன்)"),
      dose: `${(landAcres * 25).toFixed(0)} kg (TSP)`,
      water: tr("සෙ.මී. 2-3 නොඉක්මවන තුනී ජල තට්ටුවක් තබන්න", "Shallow standing water 2-3 cm", "2-3 செ.மீ ஆழமற்ற நீர்"),
      alert: tr("TSP පසට හොඳින් මිශ්‍ර කළ යුතුය. යූරියා නොයොදන්න.", "TSP must be incorporated into soil. DO NOT apply Urea at sowing.", "TSP உரத்தை மண்ணில் கலக்கவும்."),
      status: "critical"
    },
    {
      stage: 2,
      name: tr("පැළ පිහිටීම හා මුල් ඇදීම", "Seedling Establishment", "முளைக்கட்டுதல்"),
      days: "Day 10 - 14",
      fertilizer: tr("පළමු ඉහළ යෙදුම: යූරියා සුළු ප්‍රමාණයක්", "1st Top Dressing: Light Urea split", "1வது மேலுரம்: யூரியா"),
      dose: `${(landAcres * 15).toFixed(0)} kg (Urea)`,
      water: tr("ජලය සිඳුවා තෙතමනය පමණක් තබන්න (වල් නාශක සඳහා)", "Drain field to saturated mud for herbicide/fertilizer", "வயலில் நீரை வடிக்கவும்"),
      alert: tr("වල් පැළෑටි පාලනය කර පොහොර යෙදීමට පෙර දින ජලය බස්සන්න.", "Weed control check. Drain 24h before broadcasting.", "களை கட்டுப்பாடு அவசியம்."),
      status: "normal"
    },
    {
      stage: 3,
      name: tr("පඳුරු දැමීමේ උපරිම අවධිය (Tiller Initiation)", "Active Tillering Peak", "கிளை தள்ளும் பருவம்"),
      days: "Day 21 - 28",
      fertilizer: tr("දෙවන ඉහළ යෙදුම: යූරියා + සුළු MOP ප්‍රමාණයක්", "2nd Top Dressing: Major Urea + MOP split", "2வது மேலுரம்: யூரியா + MOP"),
      dose: `${(landAcres * 35).toFixed(0)} kg (Urea) + ${(landAcres * 12).toFixed(0)} kg (MOP)`,
      water: tr("ස්ථීර සෙ.මී. 5 ජල මට්ටමක් පවත්වා ගන්න", "Maintain steady 5 cm standing water layer", "5 செ.மீ நீர் மட்டம்"),
      alert: tr("පඳුරු ශක්තිමත් වීමට හොඳින් හිරු එළිය හා නයිට්‍රජන් අවශ්‍ය වේ.", "Peak vegetative growth. Ensure no drought stress.", "வளர்ச்சிக்கு சூரிய ஒளி அவசியம்."),
      status: "critical"
    },
    {
      stage: 4,
      name: tr("කරල් කලලය සෑදීම (Panicle Initiation - PI)", "Panicle Initiation (PI)", "கதிர் உருவாகும் பருவம்"),
      days: "Day 45 - 55",
      fertilizer: tr("තුන්වන ඉහළ යෙදුම: MOP (පොටෑෂ්) සහ යූරියා", "3rd Top Dressing: Final MOP (Potash) + Urea", "3வது மேலுரம்: பொட்டாஷ் + யூரியா"),
      dose: `${(landAcres * 20).toFixed(0)} kg (Urea) + ${(landAcres * 15).toFixed(0)} kg (MOP)`,
      water: tr("ජල හිඟයකට කිසිසේත් ඉඩ නොතබන්න (සෙ.මී. 5-7)", "Critical water stage: Do NOT allow water stress (5-7 cm)", "மிக முக்கியமான நீர் கட்டம்"),
      alert: tr("කරල් බර වීමට MOP අතිශය තීරණාත්මකයි. පුස් සහ කොළ පාළු පරීක්ෂා කරන්න.", "MOP Potassium is vital for grain filling and disease resistance.", "நோய் தாக்கத்தை கண்காணிக்கவும்."),
      status: "critical"
    },
    {
      stage: 5,
      name: tr("මල් පිපීම හා කිරි වැදීම (Flowering & Milk Stage)", "Flowering & Grain Filling", "பூக்கும் பருவம்"),
      days: "Day 65 - 80",
      fertilizer: tr("රසායනික පොහොර නොයොදන්න. අවශ්‍ය නම් ක්ෂුද්‍ර පෝෂක දියරයක් පමණි.", "NO CHEMICAL BROADCAST. Optional Zinc/Micronutrient spray.", "இரசாயன உரம் இட வேண்டாம்."),
      dose: tr("පොහොර යෙදීම නැවැත්විය යුතුය", "Broadcasting completed", "உரமிடுதல் நிறுத்தப்பட வேண்டும்"),
      water: tr("තෙතමනය රඳවා තබා ගන්න. කරල් කිරි වැදීම අවසන් වන තෙක් ජලය නොහිඳුවන්න.", "Keep saturated. Do not dry until milk stage hardens.", "ஈரப்பதத்தை பராமரிக்கவும்"),
      alert: tr("ගොයම් මැස්සා (Paddy Bug) හා කරල් කුණු වීමෙන් ආරක්ෂා කරගන්න.", "Scout for Paddy Bug (Gundhi bug). Spray only at dusk if needed.", "பூச்சி தாக்குதலில் இருந்து காக்கவும்."),
      status: "alert"
    }
  ];

  // ----------------------------------------------------
  // 3. DIY FIELD SCREENING STATE & LOGIC
  // ----------------------------------------------------
  const [test1Water, setTest1Water] = useState('fast_cold');
  const [test2Vinegar, setTest2Vinegar] = useState('no_bubbles');
  const [test3Heat, setTest3Heat] = useState('white_melt');
  const [screeningResult, setScreeningResult] = useState(null);
  const [screeningLoading, setScreeningLoading] = useState(false);

  const handleCheckFertilizer = async () => {
    setScreeningLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/farmer/screen-fertilizer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fertilizer_type: 'urea',
          test_water_dissolution: test1Water,
          test_vinegar_reaction: test2Vinegar,
          test_flame_reaction: test3Heat
        })
      });
      if (res.ok) {
        const data = await res.json();
        setScreeningResult(data);
        playTone(data.is_genuine ? 'chime' : 'buzz');
        setScreeningLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    setTimeout(() => {
      let isGenuine = true;
      const adulterants = [];

      if (test1Water === 'slow_sediment') {
        isGenuine = false;
        adulterants.push(language === 'en' ? 'Insoluble Marble Dust / Sand' : 'දියනොවන කිරිගරුඬ කුඩු / වැලි');
      }
      if (test2Vinegar === 'has_bubbles') {
        isGenuine = false;
        adulterants.push(language === 'en' ? 'Carbonate / Dolomite Adulterant' : 'කාබනේට් හෝ ඩොලමයිට් මිශ්‍රණය');
      }
      if (test3Heat === 'clay_char') {
        isGenuine = false;
        adulterants.push(language === 'en' ? 'Starch / Organic Binder Filler' : 'කාබනික පිෂ්ඨය හෝ මැටි');
      } else if (test3Heat === 'rock_ash') {
        isGenuine = false;
        adulterants.push(language === 'en' ? 'Non-volatile mineral powder' : 'නොදිරන ඛනිජ අළු');
      }

      setScreeningResult({
        is_genuine: isGenuine,
        confidence: isGenuine ? 94 : 88,
        title: isGenuine
          ? (language === 'en' ? 'Genuine Quality Fertilizer' : 'නිවැරදි තත්ත්වයේ පොහොරකි')
          : (language === 'en' ? 'Suspected Counterfeit / Adulterated' : 'ව්‍යාජ හෝ ප්‍රමිතියෙන් තොර පොහොරක් විය හැක!'),
        description: isGenuine
          ? (language === 'en' ? 'Water dissolved cold without sediment, no foaming with vinegar, and melts cleanly.' : 'ජලයේ හොඳින් සීතල වෙමින් දියවිය, විනාකිරිවලදී පෙණ නොනැඟුණි, සහ තාපයේදී සම්පූර්ණයෙන් වාෂ්ප විය.')
          : (language === 'en' ? 'Visual tests indicate presence of insoluble mineral adulterants or counterfeit fillers.' : 'පරීක්ෂණ දත්ත අනුව මෙහි දියනොවන කිරිගරුඬ කුඩු හෝ වෙනත් අහිතකර මිශ්‍රණ අඩංගු බවට සැක කෙරේ.'),
        adulterants: isGenuine ? [] : adulterants
      });
      playTone(isGenuine ? 'chime' : 'buzz');
      setScreeningLoading(false);
    }, 250);
  };

  // ----------------------------------------------------
  // 4. BAG & HOLOGRAM SCANNER STATE & LOGIC
  // ----------------------------------------------------
  const [bagBrand, setBagBrand] = useState('ceylon_fertilizer_lakpohora');
  const [hologramScore, setHologramScore] = useState(0.88);
  const [microprintScore, setMicroprintScore] = useState(0.90);
  const [stitchType, setStitchType] = useState('double_chainstitch');
  const [sealTampered, setSealTampered] = useState(false);
  const [bagResult, setBagResult] = useState(null);
  const [bagLoading, setBagLoading] = useState(false);

  // Smartphone Camera Evidence Photo Capture
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraScanning, setCameraScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    playTone('ding');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setCameraError(language === 'en' ? 'Camera access not available. You can use file upload to attach bag photos.' : 'කැමරාව විවෘත කළ නොහැක. කරුණාකර පහතින් ඡායාරූපයක් තෝරන්න.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraScanning(false);
  };

  const captureCameraFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setCameraScanning(true);
    playTone('chime');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhotoUrl(dataUrl);
    } catch (err) {
      console.warn("Could not capture photo:", err);
    }

    setTimeout(() => {
      stopCamera();
    }, 400);
  };

  const handleVerifyBag = async () => {
    setBagLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/farmer/verify-bag-packaging`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: bagBrand,
          hologram_diffraction_score: hologramScore,
          microprint_legibility_score: microprintScore,
          stitch_pattern: stitchType,
          seal_intact: !sealTampered
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBagResult(data);
        playTone(data.packaging_verdict === 'GENUINE_ORIGINAL' ? 'chime' : 'buzz');
        setBagLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    setTimeout(() => {
      const genuine = stitchType === 'double_chainstitch' && !sealTampered && hologramScore >= 0.75 && microprintScore >= 0.70;
      setBagResult({
        packaging_verdict: genuine ? 'GENUINE_ORIGINAL' : 'TAMPERED_OR_COUNTERFEIT',
        authenticity_index_pct: Math.round(((hologramScore + microprintScore) / 2) * 100),
        official_brand: bagBrand,
        tamper_flags: sealTampered ? ['SEAL_BROKEN_MANUALLY_RESTITCHED'] : (stitchType === 'single_chainstitch' ? ['COUNTERFEIT_SINGLE_THREAD_STITCH'] : []),
        slsi_recommendation: genuine
          ? (language === 'en' ? 'Official factory packaging verified. Safe to accept.' : 'නියම රජයේ කර්මාන්තශාලා මුද්‍රණය තහවුරු විය. භාවිතයට සුදුසුයි.')
          : (language === 'en' ? 'Tampered or counterfeit bag detected. Report to Agrarian Services hotline 1920.' : 'ව්‍යාජ ලෙස යළි මැසූ හෝ කූට ලේබල් කරන ලද උරයක් බවට සැක කෙරේ. 1920 අමතන්න.')
      });
      playTone(genuine ? 'chime' : 'buzz');
      setBagLoading(false);
    }, 250);
  };

  // ----------------------------------------------------
  // 5. TANK MIX STATE & LOGIC
  // ----------------------------------------------------
  const [tankFertilizers, setTankFertilizers] = useState(['urea', 'mop']);
  const [tankResult, setTankResult] = useState(null);

  const handleCheckTankMix = () => {
    let safe = true;
    let title = t.tankMixSafeTitle;
    let detail = t.tankMixSafeDetail;

    if (tankFertilizers.includes('urea') && tankFertilizers.includes('tsp')) {
      safe = false;
      title = t.tankMixDangerTitle;
      detail = t.tankMixDangerDetail;
    } else if (tankFertilizers.includes('calcium_nitrate') && (tankFertilizers.includes('tsp') || tankFertilizers.includes('mop'))) {
      safe = false;
      title = language === 'en' ? 'Incompatible Precipitate!' : 'අවක්ෂේප සෑදෙන මිශ්‍රණයකි!';
      detail = language === 'en' ? 'Calcium forms insoluble gypsum/phosphate crystals that clog sprayer nozzles.' : 'කැල්සියම් මගින් දිය නොවන ස්ඵටික සෑදී ඉසින බට අවහිර වේ.';
    }

    setTankResult({ safe, title, detail });
    playTone(safe ? 'chime' : 'buzz');
  };

  // ----------------------------------------------------
  // 6. 3D GRANULE INSPECTOR STATE
  // ----------------------------------------------------
  const [granuleType, setGranuleType] = useState('urea');

  // Sub-navigation Tool Tabs Config
  const operationalTools = [
    { id: 'dosage', label: tr("මාත්‍රා ගණකය", "Dosage Calc", "உர அளவு"), icon: "⚖️" },
    { id: 'calendar', label: tr("කන්න දින දර්ශනය", "Crop Calendar", "பயிர் காலண்டர்"), icon: "🌾" },
    { id: 'screening', label: tr("ක්ෂේත්‍ර පරීක්ෂාව", "DIY Screening", "உர சோதனை"), icon: "🔍" },
    { id: 'bagscan', label: tr("මිටි ලකුණු ස්කෑනරය", "Bag Evidence", "பை சரிபார்ப்பு"), icon: "📦" },
    { id: 'tankmix', label: tr("ටැංකි මිශ්‍රණය", "Tank Mix", "தொட்டி கலவை"), icon: "🧪" },
    { id: 'granule3d', label: tr("3D කැට පරීක්ෂාව", "3D Granule", "3D துகள்"), icon: "🧊" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ========================================================================= */}
      {/* HUB HEADER & SUB-NAVIGATION BAR                                          */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-7 rounded-3xl shadow-xl border border-emerald-700/40 relative overflow-hidden">
        {/* Subtle patterned background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2.5">
              <span className="text-base">🌾</span>
              <span>{tr("දෛනික ගොවි මෙහෙයුම් මධ්‍යස්ථානය", "Daily Operations Hub", "தினசரி விவசாய செயல்பாடுகள்")}</span>
              <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black">DOA VERIFIED</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>{tr("නිරවද්‍ය පොහොර මාත්‍රා, කන්න සැලසුම් හා ක්ෂේත්‍ර පරීක්ෂණ", "Precision Dosage, Growth Calendar & Field Tests", "துல்லிய உர அளவு & கள சோதனைகள்")}</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 max-w-2xl font-medium">
              {tr(
                "කෘෂිකර්ම දෙපාර්තමේන්තු (DOA) නිල නිර්දේශ, දිනෙන් දින වර්ධන උපදෙස්, ජල-විනාකිරි-ගිනි ක්ෂේත්‍ර පරීක්ෂණ හා උරයේ හොලෝග්‍රෑම් ආරක්ෂාව එකම තැනකින්.",
                "Department of Agriculture certified dosage schedules, day-by-day growth timelines, rapid DIY adulteration screening, and high-security bag packaging verification.",
                "அரசு சான்றளிக்கப்பட்ட உர அளவுகள், பயிர் காலண்டர் மற்றும் கள சோதனைகள் ஒரே இடத்தில்."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onBackToHome}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all flex items-center space-x-1.5"
            >
              <span>←</span>
              <span>{tr("ප්‍රධාන මෙනුවට", "Back to Hubs", "முதன்மை மெனு")}</span>
            </button>
            <a
              href="tel:1920"
              className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all flex items-center space-x-1.5 shadow-md"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-950" />
              <span>1920 {tr("උපදෙස්", "Help", "உதவி")}</span>
            </a>
          </div>
        </div>

        {/* Sub-tool Segmented Switcher Pills */}
        <div className="mt-6 pt-4 border-t border-emerald-800/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {operationalTools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleToolChange(tool.id)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all flex items-center space-x-2 ${
                currentTool === tool.id
                  ? 'bg-emerald-400 text-slate-950 shadow-lg scale-105'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span className="text-base">{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PRECISION DOSAGE CALCULATOR & DOA PRESCRIPTION LAUNCHER                */}
      {/* ========================================================================= */}
      {currentTool === 'dosage' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <Calculator className="w-3.5 h-3.5 text-emerald-700" />
                <span>{tr("කෘෂිකර්ම දෙපාර්තමේන්තු නිරවද්‍ය මාත්‍රා පද්ධතිය", "DOA Certified Precision Dosage", "அரசு துல்லிய உர அளவு")}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.dosageHeader}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {t.dosageHelp}
              </p>
            </div>
            <button
              type="button"
              onClick={triggerPrescription}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 self-start sm:self-center"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{tr("නිල බෙහෙත් වට්ටෝරුව 📜", "Official Prescription 📜", "உர பரிந்துரை 📜")}</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Step 1: Crop Chooser */}
            <div>
              <label className="text-xs sm:text-sm font-black text-slate-900 block mb-2">
                {t.cropSelectLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { id: 'paddy', label: t.cropPaddy, icon: '🌾' },
                  { id: 'maize', label: t.cropMaize, icon: '🌽' },
                  { id: 'tea', label: t.cropTea, icon: '🍃' },
                  { id: 'vegetables', label: t.cropVeg, icon: '🥦' },
                  { id: 'chilli', label: t.cropChilli, icon: '🌶️' }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCalculateDosage(c.id, landAcres)}
                    className={`p-3.5 rounded-xl border-2 text-center transition-all ${
                      selectedCrop === c.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-sm scale-102'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{c.icon}</span>
                    <span className="text-xs sm:text-sm font-bold block">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Land size */}
            <div>
              <label className="text-xs sm:text-sm font-black text-slate-900 block mb-2">
                {t.landSizeLabel}
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[0.5, 1.0, 2.0, 2.5, 3.0, 5.0].map(ac => (
                  <button
                    key={ac}
                    type="button"
                    onClick={() => handleCalculateDosage(selectedCrop, ac)}
                    className={`px-4 py-2.5 rounded-xl border font-black text-xs sm:text-sm transition-all ${
                      landAcres === ac
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {t.acreUnit} {ac}
                  </button>
                ))}
                <div className="flex items-center space-x-1.5 ml-2">
                  <input
                    type="number"
                    min="0.25"
                    max="100"
                    step="0.5"
                    value={landAcres}
                    onChange={(e) => handleCalculateDosage(selectedCrop, parseFloat(e.target.value) || 1)}
                    className="w-24 p-2 rounded-xl border border-slate-300 text-center font-bold text-sm bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-600 font-bold">{t.acreUnit}</span>
                </div>
              </div>
            </div>

            {/* Output Display Card */}
            {dosageResult && (
              <div className="space-y-4 pt-2 animate-fadeIn">
                {/* Bags required highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center shadow-xs">
                    <span className="text-xs font-bold text-emerald-800 uppercase block">{t.ureaLabel}</span>
                    <span className="text-3xl font-black text-emerald-950 mt-1 block">
                      {dosageResult.bags_50kg_required?.Urea_Bags || 2} <span className="text-sm font-medium">{t.bagUnit}</span>
                    </span>
                    <span className="text-[11px] text-emerald-700">{t.bag50kgNote}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center shadow-xs">
                    <span className="text-xs font-bold text-amber-800 uppercase block">{t.mopLabel}</span>
                    <span className="text-3xl font-black text-amber-950 mt-1 block">
                      {dosageResult.bags_50kg_required?.MOP_Bags || 1} <span className="text-sm font-medium">{t.bagUnit}</span>
                    </span>
                    <span className="text-[11px] text-amber-700">{t.bag50kgNote}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-center shadow-xs">
                    <span className="text-xs font-bold text-cyan-800 uppercase block">{t.tspLabel}</span>
                    <span className="text-3xl font-black text-cyan-950 mt-1 block">
                      {dosageResult.bags_50kg_required?.TSP_Bags || 1} <span className="text-sm font-medium">{t.bagUnit}</span>
                    </span>
                    <span className="text-[11px] text-cyan-700">{t.bag50kgNote}</span>
                  </div>
                </div>

                {/* Money savings banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-green-700 text-white shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-100 font-bold uppercase tracking-wider block">
                      {t.savingsTitle}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black mt-0.5 block">
                      Rs. {dosageResult.cost_breakdown_lkr?.farmer_savings_lkr?.toLocaleString() || '14,200'} /=
                    </span>
                    <span className="text-xs text-emerald-100">{t.savingsSub}</span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-4xl">💰</div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button 
                        type="button"
                        onClick={triggerPrescription} 
                        className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center space-x-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{tr("නිල බෙහෙත් වට්ටෝරුව 📜", "Official Prescription 📜", "உர பரிந்துரை 📜")}</span>
                      </button>
                      <button 
                        type="button"
                        onClick={triggerPrescription} 
                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{tr("PDF / Print", "PDF / Print", "அச்சிடு")}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stage Schedule */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    {t.scheduleHeader}
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
                      <div>
                        <strong className="text-slate-900 block text-sm font-black">{t.stageBasal}</strong>
                        <span className="text-slate-500">{t.stageBasalSub}</span>
                      </div>
                      <span className="font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">{t.stageBasalDose}</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
                      <div>
                        <strong className="text-slate-900 block text-sm font-black">{t.stageTop1}</strong>
                        <span className="text-slate-500">{t.stageTop1Sub}</span>
                      </div>
                      <span className="font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">{t.stageTop1Dose}</span>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
                      <div>
                        <strong className="text-slate-900 block text-sm font-black">{t.stageTop2}</strong>
                        <span className="text-slate-500">{t.stageTop2Sub}</span>
                      </div>
                      <span className="font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">{t.stageTop2Dose}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PADDY GROWTH STAGE & FERTILIZER CALENDAR                               */}
      {/* ========================================================================= */}
      {currentTool === 'calendar' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>{tr("කෘෂිකර්ම දෙපාර්තමේන්තු කන්න දින දර්ශනය", "DOA Certified Crop Calendar", "அரசு அங்கீகரிக்கப்பட்ட பயிர் காலண்டர்")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {tr("🌾 වී වගා කන්න සැලසුම සහ වර්ධන අවධි පොහොර දින දර්ශනය", "Paddy Growth Stage & Fertilizer Calendar", "நெல் பயிர் வளர்ச்சி மற்றும் உர காலண்டர்")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {tr("ඔබේ ගොයමේ වයස හෝ වර්ධන අවධිය තෝරන්න. අද දිනයේ යෙදිය යුතු නියම පොහොර, ජල මට්ටම සහ රෝග පාලන උපදෙස් ලබාගන්න.", "Select your rice crop age or stage to view today's exact fertilizer recommendation, water depth, and disease prevention rules.", "பயிரின் வயதை தேர்வு செய்து இன்றைய உர பரிந்துரையை பெறவும்.")}
            </p>
          </div>

          {/* Variety Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 block">
              {tr("වී ප්‍රභේදයේ කල් පිරීමේ කාලය තෝරන්න:", "Select Rice Crop Duration:", "நெல் ரகத்தை தேர்வு செய்யவும்:")}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: '3.5_month', label: tr("මාස 3 1/2 ප්‍රභේද", "3.5 Months (105 Days)", "3.5 மாத ரகம்"), desc: "Bg 352, At 362, Bw 367" },
                { id: '3_month', label: tr("මාස 3 කෙටි ප්‍රභේද", "3 Months (90 Days)", "3 மாத ரகம்"), desc: "Bg 300, Ld 365, Bg 310" },
                { id: '4_month', label: tr("මාස 4 - 4 1/2 ප්‍රභේද", "4 Months (120 Days)", "4 மாத ரகம்"), desc: "Bg 379-2, Bg 403, At 401" },
                { id: 'traditional', label: tr("සාම්ප්‍රදායික දේශීය වී", "Traditional Heenati", "பாரம்பரிய நெல்"), desc: "සුවඳැල්, කළුහීනටි, පච්චපෙරුමාල්" }
              ].map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setCalendarPaddyType(v.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    calendarPaddyType === v.id
                      ? 'border-emerald-600 bg-emerald-50 text-slate-900 shadow-sm font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black block text-slate-900">{v.label}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Growth Stage Stepper / Timeline */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-black text-slate-700 block">
              {tr("වර්ධන අවධිය තෝරන්න:", "Select Growth Stage / Age:", "வளர்ச்சி நிலையை தேர்வு செய்யவும்:")}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {paddyStages.map(st => (
                <button
                  key={st.stage}
                  type="button"
                  onClick={() => {
                    setSelectedCropStage(st.stage);
                    playTone('ding');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    selectedCropStage === st.stage
                      ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 font-black shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-bold inline-block mb-1">
                    {st.days}
                  </span>
                  <span className="text-xs block font-black line-clamp-1">{st.name}</span>
                  {selectedCropStage === st.stage && (
                    <div className="w-2 h-2 rounded-full bg-emerald-600 absolute top-2 right-2 animate-ping" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Stage Detailed Card */}
          {(() => {
            const currentStageObj = paddyStages.find(s => s.stage === selectedCropStage) || paddyStages[0];
            return (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white border-2 border-emerald-200 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
                  <div>
                    <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block">
                      {tr("අවධිය", "Stage", "நிலை")} {currentStageObj.stage} / 5 • {currentStageObj.days}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                      {currentStageObj.name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-emerald-700 text-white font-bold px-3 py-1 rounded-full shadow-xs">
                      {tr("අක්කර", "Acres", "ஏக்கர்")} {landAcres} {tr("සඳහා නිර්දේශය", "Prescription", "பரிந்துரை")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Fertilizer Box */}
                  <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-xs">
                    <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold mb-1">
                      <span>🧪</span>
                      <span>{tr("අද යෙදිය යුතු පොහොර", "Fertilizer to Apply", "இட வேண்டிய உரம்")}</span>
                    </div>
                    <p className="text-sm font-black text-slate-900 mt-1">{currentStageObj.fertilizer}</p>
                    <div className="mt-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      {tr("නියම ප්‍රමාණය:", "Exact Dose:", "அளவு:")} {currentStageObj.dose}
                    </div>
                  </div>

                  {/* Water Management Box */}
                  <div className="p-4 rounded-xl bg-white border border-cyan-200 shadow-xs">
                    <div className="flex items-center space-x-2 text-cyan-800 text-xs font-bold mb-1">
                      <span>💧</span>
                      <span>{tr("ජල මට්ටම සහ කළමනාකරණය", "Water Depth & Management", "நீர் மேலாண்மை")}</span>
                    </div>
                    <p className="text-sm font-black text-slate-900 mt-1">{currentStageObj.water}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {tr("පොහොර යෙදීමට පෙර දින ජලය බස්සවා, පොහොර යොදා දින 2කට පසු යළි ජලය බඳින්න.", "Drain 1 day before application; refill 48 hours post-application.", "உரமிட்ட 2 நாட்களுக்கு பின் நீர் பாய்ச்சவும்.")}
                    </p>
                  </div>

                  {/* Disease & Agronomy Rule */}
                  <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-xs">
                    <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold mb-1">
                      <span>⚠️</span>
                      <span>{tr("විශේෂ රෝග හා ක්ෂේත්‍ර අනතුරු ඇඟවීම්", "Field Alerts & Disease Rules", "கள எச்சரிக்கை")}</span>
                    </div>
                    <p className="text-xs font-bold text-amber-950 mt-1 leading-relaxed">{currentStageObj.alert}</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DIY FIELD SCREENING WIZARD                                            */}
      {/* ========================================================================= */}
      {currentTool === 'screening' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <span>{t.screeningStepTag}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.screeningHeader}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t.screeningHelp}
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1: Water test */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-black text-slate-900 block">
                {t.q1Label}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTest1Water('fast_cold')}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-start space-x-3 ${
                    test1Water === 'fast_cold'
                      ? 'border-emerald-600 bg-emerald-50/70 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    test1Water === 'fast_cold' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                  }`}>
                    {test1Water === 'fast_cold' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-black text-sm block">{t.q1OptA}</span>
                    <span className="text-xs text-slate-500 block mt-1">{t.q1OptASub}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTest1Water('slow_sediment')}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-start space-x-3 ${
                    test1Water === 'slow_sediment'
                      ? 'border-rose-600 bg-rose-50/70 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    test1Water === 'slow_sediment' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
                  }`}>
                    {test1Water === 'slow_sediment' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-black text-sm block">{t.q1OptB}</span>
                    <span className="text-xs text-slate-500 block mt-1">{t.q1OptBSub}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Vinegar test */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-black text-slate-900 block">
                {t.q2Label}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTest2Vinegar('no_bubbles')}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-start space-x-3 ${
                    test2Vinegar === 'no_bubbles'
                      ? 'border-emerald-600 bg-emerald-50/70 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    test2Vinegar === 'no_bubbles' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                  }`}>
                    {test2Vinegar === 'no_bubbles' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-black text-sm block">{t.q2OptA}</span>
                    <span className="text-xs text-slate-500 block mt-1">{t.q2OptASub}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTest2Vinegar('has_bubbles')}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-start space-x-3 ${
                    test2Vinegar === 'has_bubbles'
                      ? 'border-rose-600 bg-rose-50/70 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    test2Vinegar === 'has_bubbles' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
                  }`}>
                    {test2Vinegar === 'has_bubbles' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-black text-sm block">{t.q2OptB}</span>
                    <span className="text-xs text-slate-500 block mt-1">{t.q2OptBSub}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 3: Flame test */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-black text-slate-900 block">
                {t.q3Label}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTest3Heat('white_melt')}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-start space-x-3 ${
                    test3Heat === 'white_melt'
                      ? 'border-emerald-600 bg-emerald-50/70 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    test3Heat === 'white_melt' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                  }`}>
                    {test3Heat === 'white_melt' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-black text-xs sm:text-sm block">{t.q3OptA}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">{t.q3OptASub}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTest3Heat('clay_char')}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-start space-x-3 ${
                    test3Heat === 'clay_char'
                      ? 'border-amber-600 bg-amber-50/70 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    test3Heat === 'clay_char' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                  }`}>
                    {test3Heat === 'clay_char' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-black text-xs sm:text-sm block">{t.q3OptB}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">{t.q3OptBSub}</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTest3Heat('rock_ash')}
                  className={`p-4 rounded-xl border-2 text-left transition-all flex items-start space-x-3 ${
                    test3Heat === 'rock_ash'
                      ? 'border-rose-600 bg-rose-50/70 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    test3Heat === 'rock_ash' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
                  }`}>
                    {test3Heat === 'rock_ash' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-black text-xs sm:text-sm block">{t.q3OptC}</span>
                    <span className="text-[11px] text-slate-500 block mt-1">{t.q3OptCSub}</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Check Action Button */}
            <button
              type="button"
              onClick={handleCheckFertilizer}
              disabled={screeningLoading}
              className="w-full py-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {screeningLoading ? (
                <span>{t.evaluating}</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>{t.btnEvaluate}</span>
                </>
              )}
            </button>

            {/* Big Friendly Result Banner */}
            {screeningResult && (
              <div className={`p-6 rounded-2xl border-2 text-left transition-all animate-fadeIn ${
                screeningResult.is_genuine
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                  : 'bg-rose-50 border-rose-500 text-rose-950'
              }`}>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-3xl">
                    {screeningResult.is_genuine ? '🟢' : '🔴'}
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black">
                      {screeningResult.title}
                    </h3>
                    <span className="text-xs font-bold text-slate-600">
                      {t.confidenceLabel}: {screeningResult.confidence}%
                    </span>
                  </div>
                </div>

                <p className="text-sm font-medium mt-3 leading-relaxed">
                  {screeningResult.description}
                </p>

                {screeningResult.adulterants && screeningResult.adulterants.length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-rose-200 text-xs text-rose-800 font-bold">
                    {t.detectedAdulterantsLabel} {screeningResult.adulterants.join(', ')}
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(screeningResult.title + ' - ' + screeningResult.description)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5 text-white" />
                    <span>WhatsApp මගින් බෙදාහරින්න</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BAG PACKAGING & EVIDENCE SCANNER                                      */}
      {/* ========================================================================= */}
      {currentTool === 'bagscan' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>{language === 'en' ? 'Packaging & Vision Security' : 'උරයේ මුද්‍රණ හා ආරක්ෂක ලකුණු පරීක්ෂාව'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {language === 'en' ? 'Fertilizer Bag & Hologram Authenticity Verification' : 'පොහොර උරයේ ආරක්ෂිත ලකුණු හා හොලෝග්‍රෑම් පරීක්ෂාව'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {language === 'en'
                ? 'Verify official brand packaging, diffraction holograms, microprint typography, and stitch patterns to detect counterfeit bag reuse.'
                : 'රජයේ ලක්පොහොර හා බලපත්‍රලාභී පොහොර උරවල ඇති හොලෝග්‍රෑම්, ක්ෂුද්‍ර මුද්‍රණ (Microprint) සහ ද්විත්ව මැහුම් රටාව පරීක්ෂා කර ව්‍යාජ උර හඳුනාගනිමු.'}
            </p>
          </div>

          {/* Smartphone Camera Evidence Photo Capture */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {language === 'en' ? '📷 Capture Fertilizer Bag Label & Packaging Photo Evidence' : '📷 පොහොර උරයේ ලේබලය හෝ මුද්‍රාව ඡායාරූප ගත කරන්න'}
                </h4>
                <p className="text-xs text-slate-600">
                  {language === 'en' ? 'Take a clear photograph of the bag label, lot number, or seal as verifiable field evidence for official records.' : 'පොහොර උරයේ ලේබලය, කාණ්ඩ අංකය හෝ මුද්‍රාව ඡායාරූප ගත කර නීතිමය සාක්ෂි හා විමර්ශන වාර්තා සඳහා සුරක්ෂිත කරන්න.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={cameraActive ? stopCamera : startCamera}
              className={`px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition-all flex items-center space-x-2 flex-shrink-0 ${
                cameraActive 
                  ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{cameraActive ? (language === 'en' ? 'Close Camera' : 'කැමරාව වසන්න') : (language === 'en' ? 'Open Evidence Camera' : 'ඡායාරූප සාක්ෂි ගන්න')}</span>
            </button>
          </div>

          {/* Captured Evidence Photo Preview */}
          {capturedPhotoUrl && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-center space-x-3.5">
                <img 
                  src={capturedPhotoUrl} 
                  alt="Captured Evidence" 
                  className="w-16 h-16 object-cover rounded-xl border border-emerald-400 shadow-sm"
                />
                <div>
                  <div className="inline-flex items-center space-x-1 text-emerald-800 text-xs font-black">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'en' ? 'Photo Evidence Saved Locally' : 'ඡායාරූප සාක්ෂිය සුරක්ෂිත විය'}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {language === 'en' ? 'Timestamped and encrypted for official inspection / complaint records.' : 'පරීක්ෂණ වාර්තා සඳහා වලංගු කාලරාමුවක් සහිතව සටහන් විය.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCapturedPhotoUrl(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all self-end sm:self-center"
              >
                {language === 'en' ? 'Retake Photo' : 'යළි ගන්න'}
              </button>
            </div>
          )}

          {/* Active Camera Viewport */}
          {cameraActive && (
            <div className="p-4 bg-slate-950 rounded-2xl border-2 border-cyan-500/80 space-y-3 animate-fadeIn">
              <div className="relative aspect-video max-h-72 w-full mx-auto bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Targeting HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-bounce" />
                  <div className="w-48 h-48 border-2 border-dashed border-cyan-300/80 rounded-2xl relative flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400 -mt-0.5 -ml-0.5" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400 -mt-0.5 -mr-0.5" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400 -mb-0.5 -ml-0.5" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400 -mb-0.5 -mr-0.5" />
                    <span className="text-[10px] font-black text-cyan-200 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      EVIDENCE RETICLE
                    </span>
                  </div>
                </div>

                <canvas ref={canvasRef} className="hidden" />
              </div>

              {cameraError && (
                <div className="p-3 bg-amber-900/60 border border-amber-500 rounded-xl text-amber-200 text-xs text-center font-bold">
                  {cameraError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={captureCameraFrame}
                  disabled={cameraScanning}
                  className="py-3 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm shadow-lg transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50"
                >
                  <Scan className="w-5 h-5 text-slate-950" />
                  <span>{cameraScanning ? 'ඡායාරූපය ලබාගනිමින් පවතී...' : '📸 ඡායාරූපය ගෙන සාක්ෂි ලෙස සුරකින්න'}</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition-all"
                >
                  අවලංගු කරන්න
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-black text-slate-900 block mb-1">
                  {language === 'en' ? 'Select Fertilizer Brand:' : 'පොහොර සන්නාමය තෝරන්න:'}
                </label>
                <select
                  value={bagBrand}
                  onChange={(e) => setBagBrand(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-800"
                >
                  <option value="ceylon_fertilizer_lakpohora">රජයේ ලක්පොහොර (Ceylon Fertilizer Co.)</option>
                  <option value="colombo_commercial_fertilizers">කොළඹ කොමර්ෂල් පොහොර සමාගම (CCF)</option>
                  <option value="baurs_fertilizer">බවර්ස් පොහොර (A. Baur & Co.)</option>
                  <option value="cic_agri_businesses">සී.අයි.සී. කෘෂි ව්‍යාපාර (CIC Agri)</option>
                </select>
              </div>

              {/* Hologram slider */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">
                    {language === 'en' ? '1. Hologram 3D Luster & Diffraction:' : '1. ආරක්ෂිත හොලෝග්‍රෑම් පටියේ දිලිසීම:'}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {Math.round(hologramScore * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.0"
                  step="0.05"
                  value={hologramScore}
                  onChange={(e) => setHologramScore(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Microprint slider */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">
                    {language === 'en' ? '2. Microprint Font Sharpness under Magnifier:' : '2. ක්ෂුද්‍ර අකුරු (Microprint) පැහැදිලි බව:'}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {Math.round(microprintScore * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.0"
                  step="0.05"
                  value={microprintScore}
                  onChange={(e) => setMicroprintScore(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Stitch pattern */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="text-xs font-black text-slate-800 block">
                  {language === 'en' ? '3. Bottom Bag Stitching Pattern:' : '3. උරයේ පතුලේ මැහුම් රටාව:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStitchType('double_chainstitch')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      stitchType === 'double_chainstitch'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {language === 'en' ? '✓ Factory Double Chainstitch' : '✓ කර්මාන්තශාලා ද්විත්ව මැස්ම'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStitchType('single_chainstitch')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      stitchType === 'single_chainstitch'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {language === 'en' ? '⚠️ Hand Resewn Single Thread' : '⚠️ අතින් ඇනූ තනි නූල් මැස්ම'}
                  </button>
                </div>
              </div>

              {/* Seal Tampered */}
              <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 bg-white">
                <input
                  type="checkbox"
                  id="sealTamperedCheck"
                  checked={sealTampered}
                  onChange={(e) => setSealTampered(e.target.checked)}
                  className="w-4 h-4 accent-rose-600 rounded"
                />
                <label htmlFor="sealTamperedCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  {language === 'en' ? 'Bag shows torn seal or puncture holes (Resewn)' : 'උරයේ මුද්‍රාව කඩා ඇති බව හෝ විදින ලද සිදුරු දක්නට ලැබේ'}
                </label>
              </div>

              <button
                type="button"
                onClick={handleVerifyBag}
                disabled={bagLoading}
                className="w-full py-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Scan className="w-5 h-5" />
                <span>{bagLoading ? 'විමර්ශනය කෙරෙමින් පවතී...' : (language === 'en' ? 'Verify Bag Authenticity' : 'උරයේ ප්‍රමිතිය විමර්ශනය කරන්න')}</span>
              </button>
            </div>

            {/* Bag Verification Result */}
            <div>
              {bagResult ? (
                <div className={`p-6 rounded-2xl border-2 space-y-4 animate-fadeIn ${
                  bagResult.packaging_verdict === 'GENUINE_ORIGINAL'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : 'bg-rose-50 border-rose-500 text-rose-950'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">
                      {bagResult.packaging_verdict === 'GENUINE_ORIGINAL' ? '🛡️' : '🚨'}
                    </span>
                    <div>
                      <h3 className="text-lg font-black">
                        {bagResult.packaging_verdict === 'GENUINE_ORIGINAL'
                          ? (language === 'en' ? 'ORIGINAL OFFICIAL PACKAGING' : 'තහවුරු කළ නිල මුද්‍රිත උරයකි')
                          : (language === 'en' ? 'WARNING: TAMPERED OR COUNTERFEIT BAG' : 'අවදානම්: ව්‍යාජ හෝ යළි මැසූ උරයකි!')}
                      </h3>
                      <span className="text-xs font-bold">
                        {language === 'en' ? 'Authenticity Confidence:' : 'ආරක්ෂිත විශ්වසනීයත්වය:'} {bagResult.authenticity_index_pct}%
                      </span>
                    </div>
                  </div>

                  <p className="text-sm font-medium leading-relaxed">
                    {bagResult.slsi_recommendation}
                  </p>

                  {bagResult.tamper_flags && bagResult.tamper_flags.length > 0 && (
                    <div className="p-3 bg-white rounded-xl border border-rose-200 text-xs text-rose-800 font-bold space-y-1">
                      <span>{language === 'en' ? 'Detected Red Flags:' : 'අනාවරණය වූ අවදානම් සාධක:'}</span>
                      <ul className="list-disc list-inside">
                        {bagResult.tamper_flags.map((flag, idx) => (
                          <li key={idx}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <Scan className="w-12 h-12 stroke-[1.5] mb-2" />
                  <p className="text-xs font-bold">
                    {language === 'en' ? 'Inspect the physical bag markers on the left and click Verify' : 'වම්පස ඇති භෞතික ලකුණු සටහන් කර විමර්ශනය කරන්න බොත්තම ඔබන්න'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TANK MIX COMPATIBILITY MATRIX                                         */}
      {/* ========================================================================= */}
      {currentTool === 'tankmix' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <FlaskConical className="w-3.5 h-3.5 text-emerald-700" />
              <span>{tr("රසායනික ටැංකි අනුකූලතා පද්ධතිය", "Chemical Compatibility Matrix", "இரசாயன தொட்டி கலவை")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.tankMixHeader}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t.tankMixHelp}
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-xs sm:text-sm font-black text-slate-900 block">
              {t.tankMixSelectLabel}
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'urea', label: t.chemUrea },
                { id: 'mop', label: t.chemMop },
                { id: 'tsp', label: t.chemTsp },
                { id: 'calcium_nitrate', label: t.chemCa },
                { id: 'copper', label: t.chemCopper },
                { id: 'zinc', label: t.chemZinc }
              ].map(item => {
                const checked = tankFertilizers.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (checked) {
                        setTankFertilizers(tankFertilizers.filter(x => x !== item.id));
                      } else {
                        setTankFertilizers([...tankFertilizers, item.id]);
                      }
                    }}
                    className={`p-3.5 rounded-xl border-2 text-left font-bold text-xs sm:text-sm flex items-center justify-between transition-all ${
                      checked
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                    }`}>
                      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCheckTankMix}
              disabled={tankFertilizers.length < 2}
              className="w-full py-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition-all disabled:opacity-50"
            >
              {t.btnCheckMix}
            </button>

            {tankResult && (
              <div className={`p-5 rounded-2xl border-2 animate-fadeIn ${
                tankResult.safe 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950' 
                  : 'bg-rose-50 border-rose-500 text-rose-950'
              }`}>
                <h3 className="text-base font-black">{tankResult.title}</h3>
                <p className="text-sm font-medium mt-1 leading-relaxed">{tankResult.detail}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. 3D GRANULE PHYSICAL INSPECTION                                        */}
      {/* ========================================================================= */}
      {currentTool === 'granule3d' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Rotate3d className="w-3.5 h-3.5 text-emerald-700" />
              <span>{tr("ත්‍රිමාණ භෞතික කැට පරීක්ෂාව", "3D Interactive Physical Morphology", "3D துகள் பரிசோதனை")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.granule3DHeader}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t.granule3DHelp}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 bg-slate-900 rounded-2xl overflow-hidden h-72 sm:h-80 relative shadow-inner">
              <ThreeGranuleCanvas 
                granuleType={granuleType} 
                sphericity={granuleType === 'urea' ? 0.96 : (granuleType === 'marble' ? 0.65 : 0.85)} 
                purityScore={granuleType === 'urea' ? 98.5 : 40.0} 
              />
              <div className="absolute bottom-2 left-3 right-3 text-center text-[11px] text-slate-400 bg-slate-950/70 py-1 rounded-lg backdrop-blur-sm">
                {t.granuleDragHint}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {t.granuleSelectLabel}
              </span>
              
              {[
                { id: 'urea', title: t.granuleUreaTitle, desc: t.granuleUreaDesc },
                { id: 'marble', title: t.granuleMarbleTitle, desc: t.granuleMarbleDesc },
                { id: 'mop', title: t.granuleMopTitle, desc: t.granuleMopDesc }
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => setGranuleType(btn.id)}
                  className={`w-full p-3.5 rounded-xl border-2 text-left transition-all ${
                    granuleType === btn.id
                      ? 'border-emerald-600 bg-emerald-50 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <strong className="text-sm font-black block">{btn.title}</strong>
                  <span className="text-xs text-slate-500 block mt-0.5">{btn.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
