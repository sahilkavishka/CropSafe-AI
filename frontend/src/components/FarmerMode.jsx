import React, { useState } from 'react';
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

const API_BASE = "http://localhost:8000";

export default function FarmerMode({ language = 'si' }) {
  // Active Action Tab inside Farmer Mode
  const [activeTab, setActiveTab] = useState('screening');

  // --- 1. DIY Screening State (Zero confusing sliders!) ---
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
  const [tankLoading, setTankLoading] = useState(false);

  // --- 4. Leaf Doctor State ---
  const [selectedSymptom, setSelectedSymptom] = useState('yellow_lower');
  const [leafResult, setLeafResult] = useState(null);

  // --- 5. Weather State ---
  const [selectedDistrict, setSelectedDistrict] = useState('Anuradhapura');
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // --- 6. Organic Recipe State ---
  const [recipeKey, setRecipeKey] = useState('jeevamrutha');
  const [recipeLiters, setRecipeLiters] = useState(200);

  // --- 7. 3D Granule State ---
  const [granuleType, setGranuleType] = useState('urea');

  // --- 8. AI Farmer Chat State ---
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'ආයුබෝවන් ගොවි මහතාණෙනි! 🙏 ඔබගේ වගාවේ පොහොර ගැටලුව හෝ බෝග රෝගය ගැන ඕනෑම දෙයක් මෙතැනින් අසන්න.'
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

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
        setScreeningResult(data);
      } else {
        throw new Error();
      }
    } catch {
      // Friendly localized fallback
      if (isFake) {
        setScreeningResult({
          sample_verdict: "ADULTERATED_SUSPICIOUS",
          purity_confidence_pct: 25.0,
          detected_adulterants: test2Vinegar === 'has_bubbles' ? ["ගල් කුඩු / ඩොලමයිට් (Dolomite Stone Powder)"] : ["දිය නොවන වැලි / ජිප්සම් (Gypsum & Sand)"],
          recommendation: "ප්‍රවේශම් වන්න! මෙම පොහොර සාම්පලයේ ගල් කුඩු හෝ ඩොලමයිට් කලවම් කර ඇති බවට තහවුරු විය. මෙය කුඹුරට යෙදීමෙන් වළකින්න. වහාම ගොවිජන සේවා නිලධාරී මහතාට හෝ 1920 අමතන්න."
        });
      } else if (isSuspicious) {
        setScreeningResult({
          sample_verdict: "ADULTERATED_SUSPICIOUS",
          purity_confidence_pct: 48.0,
          detected_adulterants: ["කාබනික අපද්‍රව්‍ය / මැටි (Clay Impurities)"],
          recommendation: "මෙම පොහොරවල කාබනික අපද්‍රව්‍ය හෝ මැටි අඩංගු බවට සැක සහිතයි. ප්‍රමිතිය බාල විය හැකි බැවින් ගොවිජන සේවා මධ්‍යස්ථානයට සාම්පලයක් පෙන්වන්න."
        });
      } else {
        setScreeningResult({
          sample_verdict: "STANDARD_COMPLIANT",
          purity_confidence_pct: 98.5,
          detected_adulterants: [],
          recommendation: "සුබ ආරංචියක්! මෙම යූරියා සාම්පලය නියම ප්‍රමිතියෙන් යුක්තයි. කිසිදු බියකින් තොරව ඔබේ වගාවට යොදන්න පුළුවන්."
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
          subsidized_total_lkr: (ureaBags + mopBags + tspBags) * 2500,
          commercial_total_lkr: ureaBags * 8500 + mopBags * 9000 + tspBags * 10500,
          farmer_savings_lkr: Math.round(acres * 14200)
        },
        stage_specific_schedule: {
          "1. මූලික පොහොර (බිම් සකසන විට)": {
            urea_kg: Math.round(acres * 10),
            tsp_kg: Math.round(acres * 22),
            mop_kg: Math.round(acres * 8),
            instruction: "අවසාන හෑමේදී පසට දමා කලවම් කරන්න"
          },
          "2. පළමු ඉහිරවීම (පැළ වී සති 3 කින්)": {
            urea_kg: Math.round(acres * 18),
            tsp_kg: 0,
            mop_kg: 0,
            instruction: "පැළ ගොයම හොඳින් වැවීමට යූරියා පමණක් ඉසින්න"
          },
          "3. දෙවන ඉහිරවීම (කරල් එන විට - සති 7-8)": {
            urea_kg: Math.round(acres * 15),
            tsp_kg: 0,
            mop_kg: Math.round(acres * 10),
            instruction: "කරල් පිරී බර වීම සඳහා යූරියා සමඟ රතු පොහොර (MOP) යොදන්න"
          }
        }
      });
    } finally {
      setDosageLoading(false);
    }
  };

  // 3. Tank Mix Check
  const handleCheckTankMix = () => {
    setTankLoading(true);
    const hasCa = tankFertilizers.includes('calcium_nitrate');
    const hasTSP = tankFertilizers.includes('tsp');
    const hasCopper = tankFertilizers.includes('copper');
    const hasUrea = tankFertilizers.includes('urea');

    setTimeout(() => {
      if (hasCa && hasTSP) {
        setTankResult({
          safe: false,
          title: "❌ අන්තරායයි! මේවා එකට කලවම් කරන්න එපා!",
          detail: "කැල්සියම් නයිට්රේට් සහ TSP එකට මිශ්‍ර කළ විට දිය නොවන සුදු කැටි හැදේ. ස්ප්‍රේ නොසලය මුළුමනින්ම හිරවන අතර ශාකයට පොස්පරස් හා කැල්සියම් උරාගත නොහැක."
        });
      } else if (hasCopper && hasUrea) {
        setTankResult({
          safe: false,
          title: "⚠️ අනතුරු ඇඟවීමයි! කොපර් සහ යූරියා මිශ්‍ර නොකරන්න!",
          detail: "කොපර් දිලීර නාශක යූරියා සමඟ දැමූ විට ඇමෝනියා වායුව පිටවී ගොයමේ කොළ පිළිස්සී යයි."
        });
      } else {
        setTankResult({
          safe: true,
          title: "✅ ආරක්ෂිතයි! මේවා එකට කලවම් කළ හැක.",
          detail: "මෙම පොහොර වර්ග එකිනෙක ගැටෙන්නේ නැත. සාමාන්‍ය පරිදි වතුරට දියකර ස්ප්‍රේ කරන්න."
        });
      }
      setTankLoading(false);
    }, 300);
  };

  // 4. Leaf Doctor Diagnose
  const handleDiagnoseLeaf = (symptomKey) => {
    setSelectedSymptom(symptomKey);
    const remedies = {
      yellow_lower: {
        title: "නයිට්‍රජන් (N) ඌනතාවය",
        cause: "පසේ යූරියා සේදී යාම හෝ මූලික යෙදුම මදිවීම.",
        solution: "වතුර ලීටර් 16 ක ස්ප්‍රේ ටැංකියකට යූරියා ග්‍රෑම් 160ක් දියකර උදෑසන ගොයමට ඉසින්න. දින 3-4 කින් කොළ නැවත තද කොළ පැහැයට හැරේ."
      },
      scorch_edges: {
        title: "පොටෑසියම් (K) ඌනතාවය",
        cause: "පොටෑෂ් මදිවීම නිසා කොළ වල දාර වේලී පිච්චී ගොස් ඇත.",
        solution: "MOP රතු පොහොර පසට යොදන්න. ප්‍රමාණවත් තරම් වතුර කුඹුරේ රඳවා ගන්න."
      },
      purple_leaves: {
        title: "පොස්පරස් (P) ඌනතාවය",
        cause: "මුල් ඇදීම බාල වී කොළ දම් හෝ තද රතු පැහැයට හැරී ඇත.",
        solution: "TSP කළු පොහොර හෝ රොක් පොස්පේට් දමා පස් කරන්න."
      },
      veins_green: {
        title: "මැග්නීසියම් (Mg) ඌනතාවය",
        cause: "නහර කොළ පැහැව තිබියදී අතරමැද කහ පැහැ වී ඇත.",
        solution: "මැග්නීසියම් සල්ෆේට් (එප්සම් ලුණු) ග්‍රෑම් 80ක් වතුර ලීටර් 16 ට දියකර ඉසින්න."
      }
    };
    setLeafResult(remedies[symptomKey]);
  };

  // 5. Weather Advisory Fetch
  const handleFetchWeather = (dist = selectedDistrict) => {
    setSelectedDistrict(dist);
    setWeatherLoading(true);
    setTimeout(() => {
      setWeatherData({
        district: dist,
        advice: "අද සහ හෙට තද වැසි අපේක්ෂා කෙරේ. අද යූරියා යෙදුවහොත් 70% ක්ම සේදී යයි. බදාදා වන තෙක් පොහොර යෙදීම කල් තබන්න.",
        days: [
          { day: "අද", rain: "45 mm", status: "🌧️ තද වැසි", canSpray: false },
          { day: "හෙට", rain: "35 mm", status: "🌧️ වැසි සහිතයි", canSpray: false },
          { day: "අනිද්දා", rain: "10 mm", status: "⛅ මද වැසි", canSpray: false },
          { day: "බදාදා", rain: "2 mm", status: "☀️ හොඳ අව්ව", canSpray: true },
          { day: "බ්‍රහස්පතින්දා", rain: "0 mm", status: "☀️ ප්‍රශස්තයි", canSpray: true }
        ]
      });
      setWeatherLoading(false);
    }, 300);
  };

  // 6. AI Farmer Chat
  const handleSendChat = (text = chatInput) => {
    if (!text.trim()) return;
    const userMsg = { sender: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    setTimeout(() => {
      let botReply = "යූරියා බාලදැයි නිවසේදීම සොයාගැනීමට වතුර වීදුරුවකට යූරියා තේ හැන්දක් දමන්න. එය විනාඩියෙන් දියවී වීදුරුව අයිස් මෙන් සීතල විය යුතුය. විනාකිරි දැමූ විට පෙණ නගී නම් එය ගල් කුඩු කලවම් කළ ව්‍යාජ පොහොරකි.";
      if (text.includes("මූලික") || text.includes("කවදාද")) {
        botReply = "වී වගාවේ මූලික පොහොර යෙදිය යුත්තේ අවසන් හෑමේදී හෝ පැළ සිටුවීමට දිනකට පෙරය. මූලික පොහොර ලෙස TSP (කළු පොහොර) සම්පූර්ණයෙන්ද, යූරියා සහ MOP වලින් කොටසක්ද පසට කලවම් කරන්න.";
      } else if (text.includes("කැල්සියම්") || text.includes("TSP")) {
        botReply = "නැත, කිසිසේත්ම කැල්සියම් නයිට්රේට් සහ TSP එකට කලවම් කරන්න එපා! ඒවා එකතු වූ විට නොදියවෙන සුදු කැටි හැදී ස්ප්‍රේ නොසලය හිරවී බෝගයට හානි සිදුවේ.";
      } else if (text.includes("කහ") || text.includes("ලෙඩ")) {
        botReply = "යටි කොළ මුලින්ම කහ වේ නම් එය නයිට්‍රජන් ඌනතාවයයි. වතුර ලීටර් 16 ටැංකියකට යූරියා ග්‍රෑම් 160ක් දියකර කොළ වලට ඉසින්න.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      setChatLoading(false);
    }, 400);
  };

  // Main Nav Tiles
  const mainTiles = [
    { id: 'screening', label: 'පොහොර බාලද බලමු', icon: '🔍', desc: 'වතුරෙන් සහ විනාකිරෙන් ගෙදරදීම' },
    { id: 'dosage', label: 'පොහොර ගණන් හදමු', icon: '⚖️', desc: 'අවශ්‍ය මිටි ගණන සහ මුදල් ඉතිරිය' },
    { id: 'tankmix', label: 'එකට කලවම් කළ හැකිද?', icon: '💧', desc: 'ටැංකි මිශ්‍රණ අනතුරු ඇඟවීම්' },
    { id: 'leafdoctor', label: 'කොළ කහවීම හා ලෙඩ රෝග', icon: '🌿', desc: 'පත්‍රයේ ලක්ෂණ අනුව බෙහෙත්' },
    { id: 'weather', label: 'අද පොහොර දාන්න හොඳද?', icon: '🌧️', desc: 'සේදීයාම වළක්වන කාලගුණය' },
    { id: 'organic', label: 'කාබනික දියර පොහොර', icon: '🍯', desc: 'ජීවාමෘත හා කොහොඹ වට්ටෝරු' },
    { id: 'granule3d', label: '3D පොහොර කැටය බලන්න', icon: '🔎', desc: 'සැබෑ සහ ව්‍යාජ කැටය ත්‍රිමාණව' },
    { id: 'chat', label: 'ගොවි AI උපදේශක', icon: '💬', desc: 'ඕනෑම ප්‍රශ්නයක් අසන්න' }
  ];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Friendly Welcome Card (Facebook / App Style) */}
      <div className="clean-card p-6 bg-gradient-to-r from-emerald-50 via-white to-green-50 border-emerald-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md flex-shrink-0">
              🌾
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                ආයුබෝවන් ගොවි මහතාණෙනි! 🙏
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                ඔබේ වගාවට අවශ්‍ය නියම පොහොර ප්‍රමාණය, බාල පොහොර හඳුනාගැනීම සහ කෘෂි උපදෙස් මෙතැනින් ලබාගන්න.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveTab('screening')}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow transition-all flex items-center space-x-1.5"
            >
              <span>🔍 පොහොර පරීක්ෂාව</span>
            </button>
            <button 
              onClick={() => setActiveTab('dosage')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-emerald-800 font-bold text-sm border border-emerald-300 shadow-sm transition-all flex items-center space-x-1.5"
            >
              <span>⚖️ පොහොර ගණකය</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Service Shortcuts Grid (Like Facebook / Mobile Banking Shortcuts) */}
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
      {/* FEATURE 1: DIY FIELD SCREENING (Zero Numbers, Just Clear Questions) */}
      {/* ================================================================ */}
      {activeTab === 'screening' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <span>පියවර 1, 2, 3 සරල පරීක්ෂාව</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              ගෙදරදීම හෝ කුඹුරේදීම පොහොර බාලදැයි පරීක්ෂා කරමු
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              පහත ප්‍රශ්න 3 ට ඔබේ පොහොර සාම්පලයේ සිදුවූ දේ තෝරන්න.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Step 1: Water test */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 block">
                1. පිරිසිදු වතුර වීදුරුවකට පොහොර හැන්දක් දැමූ විට කුමක් සිදුවීද?
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
                    <span className="font-black text-sm block">✅ විනාඩියෙන් දියවී, වතුර අයිස් වගේ සීතල වුණා</span>
                    <span className="text-xs text-slate-500 block mt-1">නියම යූරියා වල ලක්ෂණයකි (Good)</span>
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
                    <span className="font-black text-sm block">❌ දියවුණේ නෑ / අඩියේ ගල් කුඩු සහ වැලි ඉතිරි වුණා</span>
                    <span className="text-xs text-slate-500 block mt-1">ගල් කුඩු හෝ ජිප්සම් කලවමකි (Suspect)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 2: Vinegar test */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 block">
                2. පොහොර ස්වල්පයකට විනාකිරි බිංදු කිහිපයක් දැමූ විට:
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
                    <span className="font-black text-sm block">✅ පෙණ ආවේ නෑ, සාමාන්‍යයි</span>
                    <span className="text-xs text-slate-500 block mt-1">ඩොලමයිට් හෝ හුණුගල් නැත (Safe)</span>
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
                    <span className="font-black text-sm block">❌ සබන් වගේ පෙණ බුබුළු දැම්මා</span>
                    <span className="text-xs text-slate-500 block mt-1">ගල් කුඩු හෝ ඩොලමයිට් කලවම් කර ඇත!</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 3: Flame / Spoon test */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 block">
                3. ලෝහ හැන්දක පොහොර ටිකක් දමා ලිපේ රත් කළ විට:
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
                    <span className="font-black text-xs sm:text-sm block">✅ සුදු පාටට දියවී වාෂ්ප වුණා</span>
                    <span className="text-[11px] text-slate-500 block mt-1">නියම පිරිසිදු යූරියා</span>
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
                    <span className="font-black text-xs sm:text-sm block">⚠️ කළු වී පිළිස්සුණා</span>
                    <span className="text-[11px] text-slate-500 block mt-1">කුණු හෝ මැටි කලවම්</span>
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
                    <span className="font-black text-xs sm:text-sm block">❌ ගල් කැට වගේ ඉතුරු වුණා</span>
                    <span className="text-[11px] text-slate-500 block mt-1">ගල් කුඩු (Marble)</span>
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
                <span>පරීක්ෂා කරමින් පවතී...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>පොහොර තත්ත්වය පරීක්ෂා කරන්න</span>
                </>
              )}
            </button>

            {/* Big Friendly Result Banner */}
            {screeningResult && (
              <div className={`p-6 rounded-2xl border-2 text-left transition-all ${
                screeningResult.sample_verdict === 'STANDARD_COMPLIANT'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                  : 'bg-rose-50 border-rose-500 text-rose-950'
              }`}>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-3xl">
                    {screeningResult.sample_verdict === 'STANDARD_COMPLIANT' ? '🟢' : '🔴'}
                  </span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black">
                      {screeningResult.sample_verdict === 'STANDARD_COMPLIANT'
                        ? 'ප්‍රමිතියෙන් යුතු නියම යූරියා පොහොර!'
                        : 'ප්‍රවේශම් වන්න! බාල හෝ කලවම් කළ පොහොරක්!'}
                    </h3>
                    <span className="text-xs font-bold text-slate-600">
                      විශ්වාසනීයත්වය: {screeningResult.purity_confidence_pct}%
                    </span>
                  </div>
                </div>

                <p className="text-sm font-medium mt-3 leading-relaxed">
                  {screeningResult.recommendation}
                </p>

                {screeningResult.detected_adulterants && screeningResult.detected_adulterants.length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-rose-200 text-xs text-rose-800 font-bold">
                    හඳුනාගත් කලවම් ද්‍රව්‍ය: {screeningResult.detected_adulterants.join(', ')}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FEATURE 2: DOSAGE CALCULATOR (Clean & Simple) */}
      {/* ================================================================ */}
      {activeTab === 'dosage' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">
              කුඹුරට හෝ වගාවට අවශ්‍ය නියම පොහොර ප්‍රමාණය ගණනය කරමු
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              අධික පොහොර නාස්තිය වළක්වා රුපියල් දහස් ගණනක් ඉතිරි කරගන්න.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* Step 1: Crop Chooser */}
            <div>
              <label className="text-sm font-black text-slate-900 block mb-2">
                1. ඔබේ බෝග වර්ගය තෝරන්න:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { id: 'paddy', label: 'වී වගාව', icon: '🌾' },
                  { id: 'maize', label: 'බඩඉරිඟු', icon: '🌽' },
                  { id: 'tea', label: 'තේ වගාව', icon: '🍃' },
                  { id: 'vegetables', label: 'එළවළු / අල', icon: '🥦' },
                  { id: 'chilli', label: 'මිරිස්', icon: '🌶️' }
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
                2. ඉඩමේ ප්‍රමාණය (අක්කර වලින්):
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
                    අක්කර {ac}
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
                  <span className="text-xs text-slate-600 font-bold">අක්කර</span>
                </div>
              </div>
            </div>

            {/* Output Display Card */}
            {dosageResult && (
              <div className="space-y-4 pt-2">
                
                {/* Bags required highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-xs font-bold text-emerald-800 uppercase block">සුදු පොහොර (යූරියා)</span>
                    <span className="text-3xl font-black text-emerald-950 mt-1 block">
                      {dosageResult.bags_50kg_required?.Urea_Bags || 2} <span className="text-sm font-medium">කොට්ට</span>
                    </span>
                    <span className="text-[11px] text-emerald-700">50kg මිටි</span>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <span className="text-xs font-bold text-amber-800 uppercase block">රතු පොහොර (MOP)</span>
                    <span className="text-3xl font-black text-amber-950 mt-1 block">
                      {dosageResult.bags_50kg_required?.MOP_Bags || 1} <span className="text-sm font-medium">කොට්ට</span>
                    </span>
                    <span className="text-[11px] text-amber-700">පොටෑසියම් සඳහා</span>
                  </div>

                  <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-center">
                    <span className="text-xs font-bold text-cyan-800 uppercase block">කළු පොහොර (TSP)</span>
                    <span className="text-3xl font-black text-cyan-950 mt-1 block">
                      {dosageResult.bags_50kg_required?.TSP_Bags || 1} <span className="text-sm font-medium">කොට්ට</span>
                    </span>
                    <span className="text-[11px] text-cyan-700">මුල් ඇදීම සඳහා</span>
                  </div>
                </div>

                {/* Money savings card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-xs text-green-100 font-bold uppercase tracking-wider block">
                      නියම මාත්‍රාව යෙදීමෙන් ඔබ ඉතිරි කරගන්නා මුදල:
                    </span>
                    <span className="text-2xl sm:text-3xl font-black mt-0.5 block">
                      රු. {dosageResult.cost_breakdown_lkr?.farmer_savings_lkr?.toLocaleString() || '14,200'} /=
                    </span>
                    <span className="text-xs text-green-100">අධිකව පොහොර නොදැමීමෙන් එක් කන්නයකට ඉතිරි වේ.</span>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>

                {/* Stage Schedule */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    පොහොර යෙදිය යුතු නිවැරදි වෙලාවල්:
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900 block text-sm">1. බිම් සකසන විට (මූලික පොහොර)</strong>
                        <span className="text-slate-500">අවසාන හෑමේදී පසට කලවම් කරන්න</span>
                      </div>
                      <span className="font-bold text-emerald-800">TSP සම්පූර්ණයෙන්ම + MOP ටිකක්</span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900 block text-sm">2. පැළ වී සති 3 කින් (පළමු ඉහිරවීම)</strong>
                        <span className="text-slate-500">ගොයම හොඳින් පඳුරු දැමීමට</span>
                      </div>
                      <span className="font-bold text-emerald-800">යූරියා පමණක්</span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900 block text-sm">3. කරල් එන විට (සති 7-8 දෙවන ඉහිරවීම)</strong>
                        <span className="text-slate-500">කරල් පිරී බර වීම සඳහා</span>
                      </div>
                      <span className="font-bold text-emerald-800">යූරියා + MOP (රතු පොහොර)</span>
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
              පොහොර එකට කලවම් කරන්න පුළුවන්ද? (ටැංකි මිශ්‍රණ පරීක්ෂාව)
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              එකට මිශ්‍ර නොකළ යුතු පොහොර එකට දැමීමෙන් බෝගය පිලිස්සී ස්ප්‍රේ නොසල් හිරවේ.
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-slate-900 block">
              ඔබ එකට කලවම් කිරීමට හදන පොහොර වර්ග තෝරන්න:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'urea', label: 'යූරියා (Urea)' },
                { id: 'mop', label: 'MOP (රතු පොහොර)' },
                { id: 'tsp', label: 'TSP (කළු පොහොර)' },
                { id: 'calcium_nitrate', label: 'කැල්සියම් නයිට්රේට්' },
                { id: 'copper', label: 'කොපර් දිලීර නාශක' },
                { id: 'zinc', label: 'සින්ක් සල්ෆේට්' }
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
              මිශ්‍රණය ගැළපේදැයි පරීක්ෂා කරන්න
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
              කොළ කහවීම සහ බෝග ලෙඩ රෝග හඳුනාගැනීම
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              කොළ වල පෙනෙන ලක්ෂණය තෝරා ගත යුතු නිවැරදි බෙහෙත ක්ෂණිකව දැනගන්න.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'yellow_lower', label: 'යටි කොළ මුලින්ම සම්පූර්ණයෙන්ම කහ වෙලාද?', sub: 'නයිට්‍රජන් ඌනතාවය' },
                { id: 'scorch_edges', label: 'කොළ වල දාර පිච්චිලා දුඹුරු පාට වෙලාද?', sub: 'පොටෑසියම් ඌනතාවය' },
                { id: 'purple_leaves', label: 'කොළ දම් පාට හෝ තද රතු පාට වෙලාද?', sub: 'පොස්පරස් ඌනතාවය' },
                { id: 'veins_green', label: 'නහර කොළ පාටව තියෙද්දි මැද කහ වෙලාද?', sub: 'මැග්නීසියම් ඌනතාවය' }
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
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">හඳුනාගත් රෝගය:</span>
                <h3 className="text-lg font-black text-emerald-950">{leafResult.title}</h3>
                <p className="text-xs text-slate-600">{leafResult.cause}</p>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 mt-2">
                  <strong className="text-xs font-bold text-emerald-900 block mb-1">නිර්දේශිත පිළියම:</strong>
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
              අද පොහොර දාන්න හොඳද? (කාලගුණ හා සේදීයාම් අනාවැකිය)
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              තද වැසි දිනවල පොහොර යෙදීමෙන් වැළකී සේදීයාම සහ මුදල් අපතේ යාම වළක්වන්න.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-black text-slate-900 block mb-2">ඔබේ දිස්ත්‍රික්කය තෝරන්න:</label>
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
                  💡 <strong>කාලගුණ උපදෙස:</strong> {weatherData.advice}
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
                        {item.canSpray ? 'පොහොර දැමිය හැක' : 'සේදී යයි!'}
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
              සාම්ප්‍රදායික කාබනික දියර පොහොර හා කෘමි විකර්ෂක වට්ටෝරු
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              පස සරු කරන ක්ෂුද්‍රජීවී ජීවාමෘත සහ ස්වභාවික කොහොඹ කෘමි විකර්ෂකය නිවසේදීම සාදාගනිමු.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'jeevamrutha', label: 'ජීවාමෘත (Jeevamrutha)', desc: 'පසේ පණ ගැන්වීමට' },
                { id: 'panchagavya', label: 'පංචගව්‍ය (Panchagavya)', desc: 'බෝග වර්ධනයට' },
                { id: 'neem', label: 'කොහොඹ සාරය (Neem Spray)', desc: 'ස්වභාවික කෘමි විකර්ෂකය' }
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
                {recipeKey === 'jeevamrutha' ? 'ජීවාමෘත ලීටර් 200 ක් සාදාගන්නා ක්‍රමය:' : (recipeKey === 'panchagavya' ? 'පංචගව්‍ය සාදාගන්නා ක්‍රමය:' : 'කොහොඹ කොළ සාරය සාදාගන්නා ක්‍රමය:')}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">නැවුම් ගොම:</span>
                  <strong className="text-sm font-black text-emerald-800">10 kg</strong>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">ගව මුත්‍රා:</span>
                  <strong className="text-sm font-black text-emerald-800">10 Liters</strong>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">හකුරු / පැණි:</span>
                  <strong className="text-sm font-black text-emerald-800">2 kg</strong>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">කඩල/මුං පිටි:</span>
                  <strong className="text-sm font-black text-emerald-800">2 kg</strong>
                </div>
              </div>

              <div className="text-xs text-slate-700 space-y-1 pt-2">
                <p>1. බැරලයකට වතුර දමා ඉහත ද්‍රව්‍ය සහ තුඹසකින් ගත් පස් අතලොස්සක් දමා කලවම් කරන්න.</p>
                <p>2. දින 5-7 ක් සෙවණේ තබා දිනකට දෙවරක් ලී දණ්ඩකින් දක්ෂිණාවර්තව කලවම් කරන්න.</p>
                <p>3. වතුර 10:1 අනුපාතයට තනුක කර අක්කරයකට ලීටර් 200 ක් ගොයමට යොදන්න.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FEATURE 7: 3D GRANULE INSPECTION (Clean Studio Backdrop) */}
      {/* ================================================================ */}
      {activeTab === 'granule3d' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-black text-slate-900">
              3D පොහොර කැටය ත්‍රිමාණව නිරීක්ෂණය කරමු (360° Visualizer)
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              පොහොර කැටය මවුස් එකෙන් හෝ ඇඟිල්ලෙන් කරකවා සැබෑ සහ ව්‍යාජ පොහොර අතර වෙනස බලන්න.
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
                👆 ඇඟිල්ලෙන් හෝ මවුස් එකෙන් කරකවන්න (Touch & Rotate)
              </div>
            </div>

            <div className="lg:col-span-5 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">පරීක්ෂා කිරීමට කැටය තෝරන්න:</span>
              
              {[
                { id: 'urea', title: 'පිරිසිදු යූරියා (Pure Urea)', desc: 'වීදුරු බෝලයක් මෙන් සිනිඳුයි, විනිවිද පෙනේ.' },
                { id: 'marble', title: 'ගල් කුඩු කලවම (Crushed Marble)', desc: 'රළුයි, උල් ඇත, වතුරේ දිය නොවේ.' },
                { id: 'mop', title: 'MOP රතු පොහොර (Potash Salt)', desc: 'රතු-රෝස පැහැති ස්ඵටික කැට.' }
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
      {/* FEATURE 8: FARMER AI CHAT (WhatsApp / Facebook Messenger Style) */}
      {/* ================================================================ */}
      {activeTab === 'chat' && (
        <div className="clean-card p-6 sm:p-8 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-black text-slate-900">
              ගොවි AI උපදේශක (Farmer Assistant)
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              ඔබට ඇති ඕනෑම කෘෂි ගැටලුවක් පහතින් අසන්න.
            </p>
          </div>

          {/* Quick Questions */}
          <div className="flex flex-wrap gap-1.5">
            {[
              "යූරියා බාලද කියලා ගෙදරදි හොයාගන්නේ කොහොමද?",
              "වී වගාවට මූලික පොහොර යොදන්නේ කවදාද?",
              "කැල්සියම් නයිට්රේට් සහ TSP කලවම් කරන්න පුලුවන්ද?",
              "ගොයමේ කොළ කහ වෙලා, මොකද්ද බෙහෙත?"
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
              <div className="text-xs text-slate-500 italic">CropSafe AI පිළිතුර සකසමින් පවතී...</div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="ඔබට ඇති ගැටලුව මෙහි ලියා යවන්න..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 p-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleSendChat()}
              className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow transition-all"
            >
              යවන්න
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
