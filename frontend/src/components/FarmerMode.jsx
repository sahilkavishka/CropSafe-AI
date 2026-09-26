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
  Sun
} from 'lucide-react';
import ThreeGranuleCanvas from './ThreeGranuleCanvas';
import { translations } from '../i18n';

const API_BASE = "http://localhost:8000";

export default function FarmerMode({ language = 'si' }) {
  const t = translations[language] || translations.si;

  // Active Action Tab inside Farmer Mode
  const [activeTab, setActiveTab] = useState('screening');

  // --- 1. DIY Screening State ---
  const [test1Water, setTest1Water] = useState('fast_cold'); // 'fast_cold' vs 'slow_sediment'
  const [test2Vinegar, setTest2Vinegar] = useState('no_bubbles'); // 'no_bubbles' vs 'has_bubbles'
  const [test3Heat, setTest3Heat] = useState('white_melt'); // 'white_melt', 'clay_char', 'rock_ash'
  const [screeningResult, setScreeningResult] = useState(null);
  const [screeningLoading, setScreeningLoading] = useState(false);

  // --- 2. Precision Dosage State ---
  const [selectedCrop, setSelectedCrop] = useState('paddy');
  const [landAcres, setLandAcres] = useState(1.0);
  const [dosageResult, setDosageResult] = useState(null);
  const [dosageLoading, setDosageLoading] = useState(false);

  // --- 3. Tank Mix State ---
  const [tankFertilizers, setTankFertilizers] = useState(['urea', 'mop']);
  const [tankResult, setTankResult] = useState(null);

  // --- 4. Leaf Doctor State ---
  const [selectedSymptom, setSelectedSymptom] = useState('yellow_lower');
  const [leafResult, setLeafResult] = useState(null);

  // --- 5. Weather State ---
  const [selectedDistrict, setSelectedDistrict] = useState('Anuradhapura');
  const [weatherData, setWeatherData] = useState(null);

  // --- 6. Organic Recipe State ---
  const [recipeKey, setRecipeKey] = useState('jeevamrutha');

  // --- 7. 3D Granule State ---
  const [granuleType, setGranuleType] = useState('urea');

  // --- 8. AI Farmer Chat State ---
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Reset or update localized defaults on language change
  useEffect(() => {
    setChatMessages([
      {
        sender: 'bot',
        text: t.chatInitBot
      }
    ]);
    // Clear screening banner if present so language updates cleanly
    if (screeningResult) {
      setScreeningResult(null);
    }
  }, [language]);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  // 1. Run DIY Screening
  const handleCheckFertilizer = async () => {
    setScreeningLoading(true);
    const isFake = test1Water === 'slow_sediment' || test2Vinegar === 'has_bubbles' || test3Heat === 'rock_ash';
    const isSuspicious = test3Heat === 'clay_char';

    try {
      const res = await fetch(`${API_BASE}/api/farmer/screening`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sample_type: 'urea',
          dissolution_time_sec: test1Water === 'fast_cold' ? 45.0 : 150.0,
          endothermic_chill_c: test1Water === 'fast_cold' ? 16.0 : 28.0,
          effervescence_bubbles: test2Vinegar === 'has_bubbles',
          spoon_residue_type: test3Heat === 'white_melt' ? 'white_biuret_melt' : (test3Heat === 'clay_char' ? 'clay_charred' : 'rock_dust_ash')
        })
      });
      if (res.ok) {
        const data = await res.json();
        setScreeningResult({
          is_genuine: data.sample_verdict === "STANDARD_COMPLIANT",
          confidence: data.purity_confidence_pct,
          adulterants: data.detected_adulterants,
          title: data.sample_verdict === "STANDARD_COMPLIANT" ? t.genuineTitle : t.fakeTitle,
          description: data.sample_verdict === "STANDARD_COMPLIANT" ? t.genuineDesc : t.fakeDesc
        });
      } else {
        throw new Error();
      }
    } catch {
      // Localized fallback
      if (isFake) {
        setScreeningResult({
          is_genuine: false,
          confidence: 25.0,
          adulterants: test2Vinegar === 'has_bubbles' ? ["Dolomite / Limestone (Carbonate)"] : ["Gypsum / Insoluble Sand"],
          title: t.fakeTitle,
          description: t.fakeDesc
        });
      } else if (isSuspicious) {
        setScreeningResult({
          is_genuine: false,
          confidence: 48.0,
          adulterants: ["Organic Residue / Clay Filler"],
          title: t.fakeTitle,
          description: t.fakeDesc
        });
      } else {
        setScreeningResult({
          is_genuine: true,
          confidence: 98.5,
          adulterants: [],
          title: t.genuineTitle,
          description: t.genuineDesc
        });
      }
    } finally {
      setScreeningLoading(false);
    }
  };

  // 2. Calculate Dosage
  const handleCalculateDosage = async (crop = selectedCrop, acres = landAcres) => {
    setDosageLoading(true);
    setSelectedCrop(crop);
    setLandAcres(acres);

    try {
      const ha = acres * 0.404686;
      const res = await fetch(`${API_BASE}/api/farmer/dosage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_type: crop,
          land_area_ha: ha,
          soil_zone: 'Dry_Zone',
          current_growth_stage: 'basal'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDosageResult(data);
      } else {
        throw new Error();
      }
    } catch {
      const ureaBags = Math.ceil(acres * 2.2);
      const mopBags = Math.ceil(acres * 1.0);
      const tspBags = Math.ceil(acres * 0.9);
      setDosageResult({
        crop_key: crop,
        bags_50kg_required: {
          Urea_Bags: ureaBags,
          MOP_Bags: mopBags,
          TSP_Bags: tspBags,
          Total_Bags: ureaBags + mopBags + tspBags
        },
        cost_breakdown_lkr: {
          farmer_savings_lkr: Math.round(acres * 14200)
        }
      });
    } finally {
      setDosageLoading(false);
    }
  };

  // 3. Tank Mix Check
  const handleCheckTankMix = () => {
    const hasCa = tankFertilizers.includes('calcium_nitrate');
    const hasTSP = tankFertilizers.includes('tsp');
    const hasCopper = tankFertilizers.includes('copper');
    const hasUrea = tankFertilizers.includes('urea');

    if (hasCa && hasTSP) {
      setTankResult({
        safe: false,
        title: language === 'en' 
          ? "❌ Danger! Do not mix Calcium Nitrate with TSP!" 
          : (language === 'ta' ? "❌ ஆபத்து! கால்சியம் நைட்ரேட் மற்றும் TSP ஐ ஒன்றாக கலக்காதீர்கள்!" : "❌ අන්තරායයි! කැල්සියම් නයිට්රේට් සහ TSP එකට කලවම් කරන්න එපා!"),
        detail: language === 'en'
          ? "Forms insoluble Calcium Phosphate precipitate. Spray nozzles will severely clog and crops cannot absorb phosphorus."
          : (language === 'ta' ? "கால்சியம் பாஸ்பேட் படிவுகள் உருவாகி ஸ்ப்ரே நாசில்களை அடைக்கும்." : "කැල්සියම් නයිට්රේට් සහ TSP එකට මිශ්‍ර කළ විට දිය නොවන සුදු කැටි හැදේ. ස්ප්‍රේ නොසලය මුළුමනින්ම හිරවන අතර ශාකයට පොස්පරස් උරාගත නොහැක.")
      });
    } else if (hasCopper && hasUrea) {
      setTankResult({
        safe: false,
        title: language === 'en'
          ? "⚠️ Warning! Do not mix Copper Fungicide with Urea!"
          : (language === 'ta' ? "⚠️ எச்சரிக்கை! தாமிர பூஞ்சைக் கொல்லியை யூரியாவுடன் கலக்காதீர்கள்!" : "⚠️ අනතුරු ඇඟවීමයි! කොපර් සහ යූරියා මිශ්‍ර නොකරන්න!"),
        detail: language === 'en'
          ? "Releases toxic free ammonia vapor and causes severe foliar scorch."
          : (language === 'ta' ? "நச்சு வாயு வெளியாகி இலைகள் கருகிவிடும்." : "කොපර් දිලීර නාශක යූරියා සමඟ දැමූ විට ඇමෝනියා වායුව පිටවී ගොයමේ කොළ පිළිස්සී යයි.")
      });
    } else {
      setTankResult({
        safe: true,
        title: language === 'en'
          ? "✅ Safe! These fertilizers are compatible to mix."
          : (language === 'ta' ? "✅ பாதுகாப்பானது! இவற்றை ஒன்றாக கலக்கலாம்." : "✅ ආරක්ෂිතයි! මේවා එකට කලවම් කළ හැක."),
        detail: language === 'en'
          ? "No adverse chemical antagonism detected. You can safely dissolve and spray."
          : (language === 'ta' ? "எந்தவித ரசாயன பாதிப்பும் இல்லை. பாதுகாப்பாக தெளிக்கலாம்." : "මෙම පොහොර වර්ග එකිනෙක ගැටෙන්නේ නැත. සාමාන්‍ය පරිදි වතුරට දියකර ස්ප්‍රේ කරන්න.")
      });
    }
  };

  // 4. Leaf Doctor
  const handleDiagnoseLeaf = (symptomKey) => {
    setSelectedSymptom(symptomKey);
    const remedies = {
      yellow_lower: {
        title: language === 'en' ? "Nitrogen (N) Deficiency" : (language === 'ta' ? "நைட்ரஜன் (N) குறைபாடு" : "නයිට්‍රජන් (N) ඌනතාවය"),
        cause: language === 'en' ? "Nitrogen leaching due to rain or low basal application." : (language === 'ta' ? "மண்ணில் நைட்ரஜன் சத்து குறைவு." : "පසේ යූරියා සේදී යාම හෝ මූලික යෙදුම මදිවීම."),
        solution: language === 'en' ? "Dissolve 160g Urea in a 16L knapsack sprayer (1.0% foliar spray) and spray early morning. Leaves recover in 3-4 days." : (language === 'ta' ? "16L ஸ்ப்ரே டேங்கில் 160g யூரியாவை கரைத்து காலையில் தெளிக்கவும்." : "වතුර ලීටර් 16 ක ස්ප්‍රේ ටැංකියකට යූරියා ග්‍රෑම් 160ක් දියකර උදෑසන ගොයමට ඉසින්න. දින 3-4 කින් කොළ නැවත තද කොළ පැහැයට හැරේ.")
      },
      scorch_edges: {
        title: language === 'en' ? "Potassium (K) Deficiency" : (language === 'ta' ? "பொட்டாசியம் (K) குறைபாடு" : "පොටෑසියම් (K) ඌනතාවය"),
        cause: language === 'en' ? "Lack of available potash resulting in marginal leaf scorch." : (language === 'ta' ? "பொட்டாஷ் சத்து குறைபாடு." : "පොටෑෂ් මදිවීම නිසා කොළ වල දාර වේලී පිච්චී ගොස් ඇත."),
        solution: language === 'en' ? "Apply MOP (Muriate of Potash) fertilizer to soil and maintain adequate irrigation." : (language === 'ta' ? "MOP சிவப்பு உரத்தை மண்ணில் இட்டு தேவையான ஈரப்பதத்தை பராமரிக்கவும்." : "MOP රතු පොහොර පසට යොදන්න. ප්‍රමාණවත් තරම් වතුර කුඹුරේ රඳවා ගන්න.")
      },
      purple_leaves: {
        title: language === 'en' ? "Phosphorus (P) Deficiency" : (language === 'ta' ? "பாஸ்பரஸ் (P) குறைபாடு" : "පොස්පරස් (P) ඌනතාවය"),
        cause: language === 'en' ? "Poor root development and purple bronzing of older leaves." : (language === 'ta' ? "வேர் வளர்ச்சி குறைபாடு." : "මුල් ඇදීම බාල වී කොළ දම් හෝ තද රතු පැහැයට හැරී ඇත."),
        solution: language === 'en' ? "Apply Triple Superphosphate (TSP) or Rock Phosphate mixed with organic compost." : (language === 'ta' ? "TSP உரத்தை உரமாக இட்டு மண்ணுடன் கலக்கவும்." : "TSP කළු පොහොර හෝ රොක් පොස්පේට් දමා පස් කරන්න.")
      },
      veins_green: {
        title: language === 'en' ? "Magnesium (Mg) Deficiency" : (language === 'ta' ? "மெக்னீசியம் (Mg) குறைபாடு" : "මැග්නීසියම් (Mg) ඌනතාවය"),
        cause: language === 'en' ? "Interveinal chlorosis where veins remain green while leaf turns yellow." : (language === 'ta' ? "இடை நரம்பு மஞ்சள் நிறமாதல்." : "නහර කොළ පැහැව තිබියදී අතරමැද කහ පැහැ වී ඇත."),
        solution: language === 'en' ? "Dissolve 80g Magnesium Sulphate (Epsom salt) in 16L water and foliar spray." : (language === 'ta' ? "80g மெக்னீசியம் சல்பேட் (எப்சம் உப்பு) கரைத்து தெளிக்கவும்." : "මැග්නීසියම් සල්ෆේට් (එප්සම් ලුණු) ග්‍රෑම් 80ක් වතුර ලීටර් 16 ට දියකර ඉසින්න.")
      }
    };
    setLeafResult(remedies[symptomKey]);
  };

  // 5. Weather
  const handleFetchWeather = (dist = selectedDistrict) => {
    setSelectedDistrict(dist);
    const isEn = language === 'en';
    const isTa = language === 'ta';
    setWeatherData({
      district: dist,
      advice: isEn 
        ? "Heavy rain expected today and tomorrow. 70% of nitrogen will leach away if applied today. Postpone until Wednesday."
        : (isTa ? "இன்றும் நாளையும் கனமழை எதிர்பார்க்கப்படுகிறது. உரம் இடுவதை புதன்கிழமை வரை தள்ளி வைக்கவும்." : "අද සහ හෙට තද වැසි අපේක්ෂා කෙරේ. අද යූරියා යෙදුවහොත් 70% ක්ම සේදී යයි. බදාදා වන තෙක් පොහොර යෙදීම කල් තබන්න."),
      days: [
        { day: isEn ? "Today" : (isTa ? "இன்று" : "අද"), rain: "45 mm", status: isEn ? "🌧️ Heavy Rain" : (isTa ? "🌧️ கனமழை" : "🌧️ තද වැසි"), canSpray: false },
        { day: isEn ? "Tomorrow" : (isTa ? "நாளை" : "හෙට"), rain: "35 mm", status: isEn ? "🌧️ Rainy" : (isTa ? "🌧️ மிதமான மழை" : "🌧️ වැසි සහිතයි"), canSpray: false },
        { day: isEn ? "Day 3" : (isTa ? "3 ஆம் நாள்" : "අනිද්දා"), rain: "10 mm", status: isEn ? "⛅ Light Rain" : (isTa ? "⛅ லேசான மழை" : "⛅ මද වැසි"), canSpray: false },
        { day: isEn ? "Wednesday" : (isTa ? "புதன்கிழமை" : "බදාදා"), rain: "2 mm", status: isEn ? "☀️ Sunny" : (isTa ? "☀️ தெளிவான வெயில்" : "☀️ හොඳ අව්ව"), canSpray: true },
        { day: isEn ? "Thursday" : (isTa ? "வியாழக்கிழமை" : "බ්‍රහස්පතින්දා"), rain: "0 mm", status: isEn ? "☀️ Ideal" : (isTa ? "☀️ உகந்தது" : "☀️ ප්‍රශස්තයි"), canSpray: true }
      ]
    });
  };

  // 6. AI Chat Send
  const handleSendChat = (text = chatInput) => {
    if (!text.trim()) return;
    const userMsg = { sender: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    setTimeout(() => {
      let botReply = language === 'en'
        ? "To test Urea at home, drop a teaspoon into half a glass of clean water. Genuine Urea dissolves within 60 seconds and makes the water intensely icy cold. If it bubbles with vinegar, it is adulterated with stone powder."
        : (language === 'ta' 
          ? "யூரியாவை சோதிக்க ஒரு கரண்டி உரத்தை தண்ணீரில் போடவும். ஒரு நிமிடத்தில் கரைந்து பனிக்கட்டி போல் குளிர்ந்தால் அது தூய உரம்."
          : "යූරියා බාලදැයි නිවසේදීම සොයාගැනීමට වතුර වීදුරුවකට යූරියා තේ හැන්දක් දමන්න. එය විනාඩියෙන් දියවී වීදුරුව අයිස් මෙන් සීතල විය යුතුය. විනාකිරි දැමූ විට පෙණ නගී නම් එය ගල් කුඩු කලවම් කළ ව්‍යාජ පොහොරකි.");

      if (text.includes("මූලික") || text.includes("basal") || text.includes("அடிப்படை")) {
        botReply = language === 'en'
          ? "Basal fertilizer for paddy must be incorporated during the final ploughing before planting. Apply all TSP and a portion of MOP and Urea."
          : (language === 'ta' ? "கடைசி உழவின் போது அடிப்படை உரங்களை மண்ணில் இடவும்." : "වී වගාවේ මූලික පොහොර යෙදිය යුත්තේ අවසන් හෑමේදී හෝ පැළ සිටුවීමට දිනකට පෙරය. මූලික පොහොර ලෙස TSP සම්පූර්ණයෙන්ද, යූරියා සහ MOP වලින් කොටසක්ද පසට කලවම් කරන්න.");
      } else if (text.includes("කැල්සියම්") || text.includes("calcium") || text.includes("கால்சியம்")) {
        botReply = language === 'en'
          ? "No! Never mix Calcium Nitrate with TSP. They react to form insoluble rock-hard chalk that clogs spray nozzles."
          : (language === 'ta' ? "கால்சியம் நைட்ரேட் மற்றும் TSP ஐ ஒன்றாக கலக்காதீர்கள். நாசில்கள் அடைக்கும்." : "නැත, කිසිසේත්ම කැල්සියම් නයිට්රේට් සහ TSP එකට කලවම් කරන්න එපා! ඒවා එකතු වූ විට නොදියවෙන සුදු කැටි හැදී ස්ප්‍රේ නොසලය හිරවේ.");
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      setChatLoading(false);
    }, 400);
  };

  const mainTiles = [
    { id: 'screening', label: t.tileScreening, icon: '🔍', desc: t.tileScreeningDesc },
    { id: 'dosage', label: t.tileDosage, icon: '⚖️', desc: t.tileDosageDesc },
    { id: 'tankmix', label: t.tileTankMix, icon: '💧', desc: t.tileTankMixDesc },
    { id: 'leafdoctor', label: t.tileLeafDoctor, icon: '🌿', desc: t.tileLeafDoctorDesc },
    { id: 'weather', label: t.tileWeather, icon: '🌧️', desc: t.tileWeatherDesc },
    { id: 'organic', label: t.tileOrganic, icon: '🍯', desc: t.tileOrganicDesc },
    { id: 'granule3d', label: t.tileGranule3D, icon: '🔎', desc: t.tileGranule3DDesc },
    { id: 'chat', label: t.tileChat, icon: '💬', desc: t.tileChatDesc }
  ];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Friendly Welcome Card (Clean Facebook Style) */}
      <div className="clean-card p-6 bg-gradient-to-r from-emerald-50 via-white to-green-50 border-emerald-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md flex-shrink-0">
              🌾
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.welcomeGreeting}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {t.welcomeSub}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveTab('screening')}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow transition-all flex items-center space-x-1.5"
            >
              <span>{t.btnCheckNow}</span>
            </button>
            <button 
              onClick={() => setActiveTab('dosage')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 font-bold text-sm border border-emerald-300 shadow-sm transition-all flex items-center space-x-1.5"
            >
              <span>{t.btnCalcNow}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Service Shortcuts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {mainTiles.map(tile => (
          <button
            key={tile.id}
            onClick={() => setActiveTab(tile.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeTab === tile.id
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md transform scale-[1.02]'
                : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 shadow-sm'
            }`}
          >
            <span className="text-2xl block mb-2">{tile.icon}</span>
            <span className="text-sm font-black block leading-snug">{tile.label}</span>
            <span className={`text-xs block mt-1 line-clamp-1 ${activeTab === tile.id ? 'text-emerald-100' : 'text-slate-500'}`}>
              {tile.desc}
            </span>
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* FEATURE 1: DIY FIELD SCREENING */}
      {/* ================================================================ */}
      {activeTab === 'screening' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <span>{t.screeningStepTag}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {t.screeningHeader}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t.screeningHelp}
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Step 1: Water test */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 block">
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
              <label className="text-sm font-black text-slate-900 block">
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
              <label className="text-sm font-black text-slate-900 block">
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
              <div className={`p-6 rounded-2xl border-2 text-left transition-all ${
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
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FEATURE 2: DOSAGE CALCULATOR */}
      {/* ================================================================ */}
      {activeTab === 'dosage' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">
              {t.dosageHeader}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t.dosageHelp}
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Step 1: Crop Chooser */}
            <div>
              <label className="text-sm font-black text-slate-900 block mb-2">
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
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-sm'
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
              <label className="text-sm font-black text-slate-900 block mb-2">
                {t.landSizeLabel}
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[0.5, 1.0, 2.0, 3.0, 5.0].map(ac => (
                  <button
                    key={ac}
                    type="button"
                    onClick={() => handleCalculateDosage(selectedCrop, ac)}
                    className={`px-4 py-2.5 rounded-xl border font-black text-sm transition-all ${
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
                    className="w-24 p-2 rounded-xl border border-slate-300 text-center font-bold text-sm"
                  />
                  <span className="text-xs text-slate-600 font-bold">{t.acreUnit}</span>
                </div>
              </div>
            </div>

            {/* Output Display Card */}
            {dosageResult && (
              <div className="space-y-4 pt-2">
                
                {/* Bags required highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-xs font-bold text-emerald-800 uppercase block">{t.ureaLabel}</span>
                    <span className="text-3xl font-black text-emerald-950 mt-1 block">
                      {dosageResult.bags_50kg_required?.Urea_Bags || 2} <span className="text-sm font-medium">{t.bagUnit}</span>
                    </span>
                    <span className="text-[11px] text-emerald-700">{t.bag50kgNote}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <span className="text-xs font-bold text-amber-800 uppercase block">{t.mopLabel}</span>
                    <span className="text-3xl font-black text-amber-950 mt-1 block">
                      {dosageResult.bags_50kg_required?.MOP_Bags || 1} <span className="text-sm font-medium">{t.bagUnit}</span>
                    </span>
                    <span className="text-[11px] text-amber-700">{t.bag50kgNote}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-center">
                    <span className="text-xs font-bold text-cyan-800 uppercase block">{t.tspLabel}</span>
                    <span className="text-3xl font-black text-cyan-950 mt-1 block">
                      {dosageResult.bags_50kg_required?.TSP_Bags || 1} <span className="text-sm font-medium">{t.bagUnit}</span>
                    </span>
                    <span className="text-[11px] text-cyan-700">{t.bag50kgNote}</span>
                  </div>
                </div>

                {/* Money savings banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs text-green-100 font-bold uppercase tracking-wider block">
                      {t.savingsTitle}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black mt-0.5 block">
                      Rs. {dosageResult.cost_breakdown_lkr?.farmer_savings_lkr?.toLocaleString() || '14,200'} /=
                    </span>
                    <span className="text-xs text-green-100">{t.savingsSub}</span>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>

                {/* Stage Schedule */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {t.scheduleHeader}
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900 block text-sm">{t.stageBasal}</strong>
                        <span className="text-slate-500">{t.stageBasalSub}</span>
                      </div>
                      <span className="font-bold text-emerald-800">{t.stageBasalDose}</span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900 block text-sm">{t.stageTop1}</strong>
                        <span className="text-slate-500">{t.stageTop1Sub}</span>
                      </div>
                      <span className="font-bold text-emerald-800">{t.stageTop1Dose}</span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900 block text-sm">{t.stageTop2}</strong>
                        <span className="text-slate-500">{t.stageTop2Sub}</span>
                      </div>
                      <span className="font-bold text-emerald-800">{t.stageTop2Dose}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FEATURE 3: TANK MIX CHECKER */}
      {/* ================================================================ */}
      {activeTab === 'tankmix' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">
              {t.tankMixHeader}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t.tankMixHelp}
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-slate-900 block">
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
              <div className={`p-5 rounded-2xl border-2 ${
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

      {/* ================================================================ */}
      {/* FEATURE 4: LEAF DOCTOR */}
      {/* ================================================================ */}
      {activeTab === 'leafdoctor' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">
              {t.leafDocHeader}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t.leafDocHelp}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'yellow_lower', label: t.symptomYellowLower, sub: t.symptomYellowLowerSub },
                { id: 'scorch_edges', label: t.symptomScorch, sub: t.symptomScorchSub },
                { id: 'purple_leaves', label: t.symptomPurple, sub: t.symptomPurpleSub },
                { id: 'veins_green', label: t.symptomVeinsGreen, sub: t.symptomVeinsGreenSub }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleDiagnoseLeaf(s.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedSymptom === s.id
                      ? 'border-emerald-600 bg-emerald-50 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="font-black text-sm block">{s.label}</span>
                  <span className="text-xs text-slate-500 mt-1 block">{s.sub}</span>
                </button>
              ))}
            </div>

            {leafResult && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-slate-900 space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">{t.diagnosedDiseaseLabel}</span>
                <h3 className="text-lg font-black text-emerald-950">{leafResult.title}</h3>
                <p className="text-xs text-slate-600">{leafResult.cause}</p>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 mt-2">
                  <strong className="text-xs font-bold text-emerald-900 block mb-1">{t.prescribedRemedyLabel}</strong>
                  <p className="text-sm font-medium text-slate-800 leading-relaxed">{leafResult.solution}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FEATURE 5: WEATHER ADVISORY */}
      {/* ================================================================ */}
      {activeTab === 'weather' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">
              {t.weatherHeader}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t.weatherHelp}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-black text-slate-900 block mb-2">{t.selectDistrictLabel}</label>
              <div className="flex flex-wrap gap-2">
                {["Anuradhapura", "Polonnaruwa", "Kurunegala", "Ampara", "Badulla", "Hambantota"].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleFetchWeather(d)}
                    className={`px-3.5 py-2 rounded-xl border font-bold text-xs transition-all ${
                      selectedDistrict === d
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {weatherData && (
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-medium text-sm leading-relaxed">
                  💡 <strong>{t.weatherAdviceLabel}</strong> {weatherData.advice}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {weatherData.days.map((item, idx) => (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-xl border text-center ${
                        item.canSpray 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                          : 'bg-rose-50 border-rose-300 text-rose-950'
                      }`}
                    >
                      <span className="font-bold text-xs block text-slate-600">{item.day}</span>
                      <span className="text-sm font-black my-1 block">{item.status}</span>
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-full inline-block ${
                        item.canSpray ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                      }`}>
                        {item.canSpray ? t.canSprayTag : t.cantSprayTag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FEATURE 6: ORGANIC BIO-RECIPES */}
      {/* ================================================================ */}
      {activeTab === 'organic' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">
              {t.organicHeader}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {t.organicHelp}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'jeevamrutha', label: t.recJeevTitle, desc: t.recJeevDesc },
                { id: 'panchagavya', label: t.recPanchTitle, desc: t.recPanchDesc },
                { id: 'neem', label: t.recNeemTitle, desc: t.recNeemDesc }
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRecipeKey(r.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    recipeKey === r.id
                      ? 'border-emerald-600 bg-emerald-50 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="font-black text-sm block">{r.label}</span>
                  <span className="text-xs text-slate-500 mt-1 block">{r.desc}</span>
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-base font-black text-slate-900">
                {recipeKey === 'jeevamrutha' ? (language === 'en' ? 'Jeevamrutha 200L Preparation Formulation:' : 'ජීවාමෘත ලීටර් 200 ක් සාදාගන්නා ක්‍රමය:') : (recipeKey === 'panchagavya' ? 'Panchagavya Preparation:' : 'Neem Leaf Extract Spray:')}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">{language === 'en' ? 'Cow Dung:' : 'නැවුම් ගොම:'}</span>
                  <strong className="text-sm font-black text-emerald-800">10 kg</strong>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">{language === 'en' ? 'Cow Urine:' : 'ගව මුත්‍රා:'}</span>
                  <strong className="text-sm font-black text-emerald-800">10 Liters</strong>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">{language === 'en' ? 'Jaggery / Molasses:' : 'හකුරු / පැණි:'}</span>
                  <strong className="text-sm font-black text-emerald-800">2 kg</strong>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">{language === 'en' ? 'Pulse Flour:' : 'කඩල/මුං පිටි:'}</span>
                  <strong className="text-sm font-black text-emerald-800">2 kg</strong>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-1 pt-2">
                <p>1. {language === 'en' ? 'Mix fresh cow dung, urine, jaggery, flour, and a handful of fertile virgin soil into 200L water.' : 'බැරලයකට වතුර දමා ඉහත ද්‍රව්‍ය සහ තුඹසකින් ගත් පස් අතලොස්සක් දමා කලවම් කරන්න.'}</p>
                <p>2. {language === 'en' ? 'Keep in shade for 5-7 days and stir clockwise twice daily with a wooden stick.' : 'දින 5-7 ක් සෙවණේ තබා දිනකට දෙවරක් ලී දණ්ඩකින් දක්ෂිණාවර්තව කලවම් කරන්න.'}</p>
                <p>3. {language === 'en' ? 'Dilute 10:1 with water and apply 200L per acre during moist soil conditions.' : 'වතුර 10:1 අනුපාතයට තනුක කර අක්කරයකට ලීටර් 200 ක් ගොයමට යොදන්න.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FEATURE 7: 3D GRANULE INSPECTION */}
      {/* ================================================================ */}
      {activeTab === 'granule3d' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">
              {t.granule3DHeader}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
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

      {/* ================================================================ */}
      {/* FEATURE 8: FARMER AI CHAT */}
      {/* ================================================================ */}
      {activeTab === 'chat' && (
        <div className="clean-card p-6 sm:p-8 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-black text-slate-900">
              {t.chatHeader}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {t.chatHelp}
            </p>
          </div>

          {/* Quick Questions */}
          <div className="flex flex-wrap gap-1.5">
            {[
              language === 'en' ? "How to test Urea purity at home?" : "යූරියා බාලද කියලා ගෙදරදි හොයාගන්නේ කොහොමද?",
              language === 'en' ? "When should I apply basal fertilizer for paddy?" : "වී වගාවට මූලික පොහොර යොදන්නේ කවදාද?",
              language === 'en' ? "Can I mix Calcium Nitrate and TSP?" : "කැල්සියම් නයිට්රේට් සහ TSP කලවම් කරන්න පුලුවන්ද?",
              language === 'en' ? "Paddy bottom leaves turning yellow, what is the remedy?" : "ගොයමේ කොළ කහ වෙලා, මොකද්ද බෙහෙත?"
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendChat(q)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all text-left"
              >
                💬 {q}
              </button>
            ))}
          </div>

          {/* Message Thread */}
          <div className="h-64 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {chatMessages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none shadow-sm'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="text-xs text-slate-500 italic">{t.chatThinking}</div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t.chatPlaceholder}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 p-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleSendChat()}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow transition-all"
            >
              {t.btnSend}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
