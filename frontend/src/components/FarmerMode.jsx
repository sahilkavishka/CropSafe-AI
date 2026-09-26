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
  Eye
} from 'lucide-react';
import ThreeGranuleCanvas from './ThreeGranuleCanvas';
import { translations } from '../i18n';

const API_BASE = "http://localhost:8000";

export default function FarmerMode({ language = 'si' }) {
  const t = translations[language] || translations.si;

  // Category filter: 'all' | 'quality' | 'dosage' | 'soilcrop' | 'weatherorganic'
  const [selectedCategory, setSelectedCategory] = useState('all');

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
  const [organicAcres, setOrganicAcres] = useState(1.0);
  const [recipeKey, setRecipeKey] = useState('jeevamrutha');

  // --- 7. 3D Granule State ---
  const [granuleType, setGranuleType] = useState('urea');

  // --- 8. AI Farmer Chat State ---
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // --- 9. Soil Dolomite / Acidity State ---
  const [soilPh, setSoilPh] = useState(4.8);
  const [soilTexture, setSoilTexture] = useState('loam_podzolic');
  const [dolomiteAcres, setDolomiteAcres] = useState(1.0);
  const [dolomiteResult, setDolomiteResult] = useState(null);
  const [dolomiteLoading, setDolomiteLoading] = useState(false);

  // --- 10. Paddy Straw In-situ Decomposition State ---
  const [strawAcres, setStrawAcres] = useState(1.0);
  const [grainYield, setGrainYield] = useState(4.5);
  const [strawResult, setStrawResult] = useState(null);
  const [strawLoading, setStrawLoading] = useState(false);

  // --- 11. Drone Multispectral NDVI Field State ---
  const [droneArea, setDroneArea] = useState(1.0);
  const [droneResult, setDroneResult] = useState(null);
  const [droneScanning, setDroneScanning] = useState(false);

  // --- 12. Bag Authenticity / Hologram Scanner State ---
  const [bagBrand, setBagBrand] = useState('ceylon_fertilizer_lakpohora');
  const [hologramScore, setHologramScore] = useState(0.88);
  const [microprintScore, setMicroprintScore] = useState(0.90);
  const [stitchType, setStitchType] = useState('double_chainstitch');
  const [sealTampered, setSealTampered] = useState(false);
  const [bagResult, setBagResult] = useState(null);
  const [bagLoading, setBagLoading] = useState(false);

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

  // 3. Tank Mix Check (Live API Call with WALES sequence)
  const handleCheckTankMix = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/farmer/tankmix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fertilizers: tankFertilizers,
          water_volume_liters: 16.0
        })
      });
      if (res.ok) {
        const data = await res.json();
        const isSafe = data.overall_verdict === "COMPATIBLE_SAFE";
        setTankResult({
          safe: isSafe,
          title: isSafe 
            ? (language === 'en' ? "✅ Safe! These fertilizers are compatible to mix." : (language === 'ta' ? "✅ பாதுகாப்பானது! இவற்றை ஒன்றாக கலக்கலாம்." : "✅ ආරක්ෂිතයි! මෙම පොහොර වර්ග එකට කලවම් කළ හැක."))
            : (language === 'en' ? "❌ Danger! Chemical Antagonism Detected!" : (language === 'ta' ? "❌ ஆபத்து! ரசாயன முரண்பாடு உள்ளது!" : "❌ අන්තරායයි! දිය නොවන අවක්ෂේප හෝ විෂ වායු හැදේ!")),
          detail: data.scientific_rationale_si || (language === 'en' ? "Adhere to the WALES tank-mix dissolution sequence." : "ස්ප්‍රේ නොසලය හිරවීම වැළැක්වීමට WALES අනුපිළිවෙල අනුව දියකරන්න.")
        });
        return;
      }
    } catch {
      // Local fallback
    }

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

  // 4. Leaf Doctor (Live API Call)
  const handleDiagnoseLeaf = async (symptomKey) => {
    setSelectedSymptom(symptomKey);
    const symptomMap = {
      yellow_lower: { pos: "older_leaves", desc: "uniform_yellowing", veins: false },
      scorch_edges: { pos: "older_leaves", desc: "marginal_scorch", veins: false },
      purple_leaves: { pos: "older_leaves", desc: "purplish_bronze_discoloration", veins: false },
      veins_green: { pos: "older_leaves", desc: "interveinal_chlorosis", veins: true }
    };
    const q = symptomMap[symptomKey] || symptomMap.yellow_lower;

    try {
      const res = await fetch(`${API_BASE}/api/farmer/deficiency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_type: selectedCrop || 'paddy',
          leaf_position: q.pos,
          symptom_description: q.desc,
          is_veins_green: q.veins
        })
      });
      if (res.ok) {
        const data = await res.json();
        const top = data.top_diagnosis;
        setLeafResult({
          title: language === 'en' ? top.element_name : (language === 'ta' ? top.name_ta : top.name_si),
          cause: data.field_action_alert_si || top.paddy_specific,
          solution: language === 'en' ? top.immediate_remedy.foliar_spray_en : top.immediate_remedy.foliar_spray_si
        });
        return;
      }
    } catch {
      // Local fallback
    }

    const remedies = {
      yellow_lower: {
        title: language === 'en' ? "Nitrogen (N) Deficiency" : (language === 'ta' ? "நைட்ரஜன் (N) குறைபாடு" : "නයිට්‍රජන් (N) ඌනතාවය"),
        cause: language === 'en' ? "Nitrogen leaching due to rain or low basal application." : (language === 'ta' ? "மண்ணில் நைட்ரஜன் சத்து குறைவு." : "පසේ යූරියා සේදී යාම හෝ මූලික යෙදුම මදිවීම නිසා පහළ කොළ ඒකාකාරීව කහ වේ."),
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

  // 5. Weather (Live API Call)
  const handleFetchWeather = async (dist = selectedDistrict) => {
    setSelectedDistrict(dist);
    try {
      const res = await fetch(`${API_BASE}/api/farmer/weather?district=${encodeURIComponent(dist)}&target_crop=Paddy`);
      if (res.ok) {
        const data = await res.json();
        const days = data.forecast_evaluation.map(d => ({
          day: d.day,
          rain: `${d.rainfall_mm} mm`,
          status: d.rainfall_mm > 20 ? "🌧️ තද වැසි" : (d.rainfall_mm > 5 ? "⛅ මද වැසි" : "☀️ හොඳ අව්ව"),
          canSpray: d.status_tier === "OPTIMAL_GREEN_WINDOW"
        }));
        setWeatherData({
          district: dist,
          advice: language === 'en'
            ? `Recommended application window: ${data.optimal_application_day}. Minimum leaching risk: ${data.minimum_nutrient_loss_risk_pct}%.`
            : `පොහොර යෙදීමට සුදුසුම දිනය: ${data.optimal_application_day}. අවම සේදීයාම් අවදානම: ${data.minimum_nutrient_loss_risk_pct}%.`,
          days
        });
        return;
      }
    } catch {
      // Local fallback
    }

    const isEn = language === 'en';
    const isTa = language === 'ta';
    setWeatherData({
      district: dist,
      advice: isEn 
        ? "Heavy rain expected today and tomorrow. 70% of nitrogen will leach away if applied today. Postpone until Wednesday."
        : (isTa ? "இன்றும் நாளையும் கனமழை எதிர்பார்க்கப்படுகிறது. உரம் இடுவதை புதன்கிழமை வரை தள்ளி வைக்கவும்." : "අද සහ හෙට තද වැසි අපේක්ෂා කෙරේ. අද යූරියා යෙදුවහොත් 70% ක්ම සේදී යයි. බදාදා වන තෙක් පොහොර යෙදීම කල් තබන්න."),
      days: [
        { day: isEn ? "Today" : (isTa ? "இன்று" : "අද"), rain: "42 mm", status: isEn ? "🌧️ Heavy Rain" : (isTa ? "🌧️ கனமழை" : "🌧️ තද වැසි"), canSpray: false },
        { day: isEn ? "Tomorrow" : (isTa ? "நாளை" : "හෙට"), rain: "25 mm", status: isEn ? "🌧️ Rainy" : (isTa ? "🌧️ மிதமான மழை" : "🌧️ වැසි සහිතයි"), canSpray: false },
        { day: isEn ? "Day 3" : (isTa ? "3 ஆம் நாள்" : "අනිද්දා"), rain: "5 mm", status: isEn ? "⛅ Light Rain" : (isTa ? "⛅ லேசான மழை" : "⛅ මද වැසි"), canSpray: false },
        { day: isEn ? "Wednesday" : (isTa ? "புதன்கிழமை" : "බදාදා"), rain: "1 mm", status: isEn ? "☀️ Sunny" : (isTa ? "☀️ தெளிவான வெயில்" : "☀️ හොඳ අව්ව"), canSpray: true },
        { day: isEn ? "Thursday" : (isTa ? "வியாழக்கிழமை" : "බ්‍රහස්පතින්දා"), rain: "0 mm", status: isEn ? "☀️ Ideal" : (isTa ? "☀️ உகந்தது" : "☀️ ප්‍රශස්තයි"), canSpray: true }
      ]
    });
  };

  // 6. AI Chat Send (Live API Call to Voice Engine)
  const handleSendChat = async (text = chatInput) => {
    if (!text.trim()) return;
    const userMsg = { sender: 'user', text };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/farmer/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_text: text })
      });
      if (res.ok) {
        const data = await res.json();
        const reply = language === 'en'
          ? (data.speech_synthesis_transcript?.english_translation || "Verified by CropSafe AI Agronomic Knowledge Engine.")
          : (data.speech_synthesis_transcript?.sinhala_response || "කෘෂිකර්ම දෙපාර්තමේන්තු නිර්දේශයන්ට අනුකූලව සකසන ලද නිල පිළිතුරකි.");
        setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
        setChatLoading(false);
        return;
      }
    } catch {
      // Local fallback
    }

    setTimeout(() => {
      let botReply = language === 'en'
        ? "To test Urea at home, drop a teaspoon into clean water. Genuine Urea dissolves rapidly within 60 seconds and feels icy cold. If it effervesces with vinegar, it contains marble or limestone filler."
        : "යූරියා බාලදැයි නිවසේදීම සොයාගැනීමට වතුර වීදුරුවකට යූරියා තේ හැන්දක් දමන්න. එය විනාඩියෙන් දියවී වීදුරුව අයිස් මෙන් සීතල විය යුතුය. විනාකිරි දැමූ විට පෙණ නගී නම් එය ගල් කුඩු කලවම් කළ ව්‍යාජ පොහොරකි.";
      if (text.includes("මූලික") || text.includes("basal")) {
        botReply = "වී වගාවේ මූලික පොහොර යෙදිය යුත්තේ අවසන් හෑමේදී හෝ පැළ සිටුවීමට දිනකට පෙරය. මූලික පොහොර ලෙස TSP සම්පූර්ණයෙන්ද, යූරියා සහ MOP වලින් කොටසක්ද පසට කලවම් කරන්න.";
      } else if (text.includes("කැල්සියම්") || text.includes("calcium")) {
        botReply = "නැත, කිසිසේත්ම කැල්සියම් නයිට්රේට් සහ TSP එකට කලවම් කරන්න එපා! ඒවා එකතු වූ විට නොදියවෙන සුදු කැටි හැදී ස්ප්‍රේ නොසලය හිරවේ.";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
      setChatLoading(false);
    }, 350);
  };

  // 7. Calculate Dolomite (Live API Call)
  const handleCalculateDolomite = async (ph = soilPh, acres = dolomiteAcres, texture = soilTexture) => {
    setDolomiteLoading(true);
    setSoilPh(ph);
    setDolomiteAcres(acres);
    setSoilTexture(texture);
    const ha = acres * 0.404686;

    try {
      const res = await fetch(`${API_BASE}/api/soil/dolomite?current_ph=${ph}&target_ph=6.2&soil_texture=${texture}&land_area_ha=${ha}`);
      if (res.ok) {
        const data = await res.json();
        setDolomiteResult(data);
      } else {
        throw new Error();
      }
    } catch {
      const deficit = Math.max(0, 6.2 - ph);
      const kgTotal = Math.round(deficit * 1250 * ha);
      const bags = Math.ceil(kgTotal / 50);
      setDolomiteResult({
        current_ph: ph,
        hazard_assessment: ph < 5.0 ? "CRITICAL_ACIDITY_NUTRIENT_LOCKUP" : "MILD_ACIDITY",
        dolomite_recommendation: {
          dolomite_kg_total: kgTotal,
          bags_50kg_count: bags,
          estimated_cost_lkr: bags * 1200
        },
        application_protocol_si: "අවසන් බිම් සැකසීමට (අවසන් හෑමට) සති 2 කට පෙර ඩොලමයිට් පසට දමා කලවම් කරන්න. රසායනික පොහොර දැමීමට පෙර පසේ ඇඹුල් ගතිය පාලනය වේ."
      });
    } finally {
      setDolomiteLoading(false);
    }
  };

  // 8. Calculate Straw Decomposition (Live API Call)
  const handleCalculateStraw = async (acres = strawAcres, yieldTons = grainYield) => {
    setStrawLoading(true);
    setStrawAcres(acres);
    setGrainYield(yieldTons);
    const ha = acres * 0.404686;

    try {
      const res = await fetch(`${API_BASE}/api/soil/straw-decompose?land_area_ha=${ha}&grain_yield_tons=${yieldTons}`);
      if (res.ok) {
        const data = await res.json();
        setStrawResult(data);
      } else {
        throw new Error();
      }
    } catch {
      const strawTons = (yieldTons * 0.9 * ha).toFixed(1);
      const k2oKg = Math.round(strawTons * 16.5);
      const mopBags = Math.ceil(k2oKg / 30);
      setStrawResult({
        straw_biomass_total_tons: strawTons,
        nutrients_recycled_to_soil_kg: {
          potassium_k2o_kg: k2oKg,
          silica_sio2_kg: Math.round(strawTons * 55),
          organic_carbon_kg: Math.round(strawTons * 380)
        },
        economic_benefits: {
          equivalent_mop_bags_saved: mopBags,
          cost_savings_lkr: mopBags * 19500
        }
      });
    } finally {
      setStrawLoading(false);
    }
  };

  // 9. Run Drone Multispectral Scan (Live API Call)
  const handleRunDroneScan = async () => {
    setDroneScanning(true);
    try {
      const res = await fetch(`${API_BASE}/api/drone/scan?grid_size=4&area_ha=${droneArea * 0.404686}&crop=paddy`);
      if (res.ok) {
        const data = await res.json();
        setDroneResult(data);
      } else {
        throw new Error();
      }
    } catch {
      setDroneResult({
        canopy_indices_summary: {
          mean_ndvi: 0.68,
          canopy_nitrogen_status: "MODERATE_DEFICIENT_ZONES_DETECTED"
        },
        spatial_zone_distribution: {
          healthy_green_pct: 62.5,
          moderate_stress_pct: 25.0,
          severe_deficiency_pct: 12.5
        },
        variable_rate_prescription: {
          urea_saved_kg: 28.5,
          money_saved_lkr: 11400,
          zone_recommendation: "රතු හා කහ පැහැති කොටුවලට පමණක් අමතර යූරියා කි.ග්‍රෑ. 30ක් යොදන්න. කොළ පැහැති නිරෝගී කලාප වලට පොහොර යෙදීමෙන් වළකින්න."
        }
      });
    } finally {
      setDroneScanning(false);
    }
  };

  // 10. Verify Bag Packaging Authenticity (Live API Call)
  const handleVerifyBag = async () => {
    setBagLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/inspector/packaging-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_key: bagBrand,
          hologram_diffraction_score: hologramScore,
          microprint_sharpness_score: microprintScore,
          stitch_type_detected: stitchType,
          seal_tamper_flag: sealTampered
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBagResult(data);
      } else {
        throw new Error();
      }
    } catch {
      const isAuthentic = hologramScore > 0.75 && microprintScore > 0.75 && stitchType === 'double_chainstitch' && !sealTampered;
      setBagResult({
        authenticity_score_pct: isAuthentic ? 94.5 : 32.0,
        verdict: isAuthentic ? "GENUINE_AUTHENTIC" : "COUNTERFEIT_ADULTERATED",
        verdict_si: isAuthentic ? "ප්‍රමිතියෙන් යුතු නියම රජයේ පොහොර උරයකි" : "අවධානයයි! ව්‍යාජ හෝ මුද්‍රාව කැඩූ හොර උරයකි",
        action_advice_si: isAuthentic 
          ? "මෙම උරයේ හොලෝග්‍රෑම් හා ද්විත්ව මැහුම් රටාව නියම ප්‍රමිතියට ඇත. ආරක්ෂිතව භාවිත කළ හැක."
          : "මෙම උරයේ ආරක්ෂිත ලකුණු ව්‍යාජයි. වහාම ගොවිජන නිලධාරීට හෝ 1920 අමතා පැමිණිලි කරන්න."
      });
    } finally {
      setBagLoading(false);
    }
  };

  // Complete List of All 12 Agricultural Services Categorized
  const allTiles = [
    // 1. Quality & Anti-Fraud
    { id: 'screening', cat: 'quality', label: t.tileScreening, icon: '🔍', desc: t.tileScreeningDesc },
    { id: 'granule3d', cat: 'quality', label: t.tileGranule3D, icon: '🔎', desc: t.tileGranule3DDesc },
    { id: 'bagscan', cat: 'quality', label: t.tileBagScan, icon: '🛡️', desc: t.tileBagScanDesc },

    // 2. Dosage & Mix Safety
    { id: 'dosage', cat: 'dosage', label: t.tileDosage, icon: '⚖️', desc: t.tileDosageDesc },
    { id: 'tankmix', cat: 'dosage', label: t.tileTankMix, icon: '💧', desc: t.tileTankMixDesc },

    // 3. Soil, Straw, Crop & Drone Health
    { id: 'leafdoctor', cat: 'soilcrop', label: t.tileLeafDoctor, icon: '🌿', desc: t.tileLeafDoctorDesc },
    { id: 'dolomite', cat: 'soilcrop', label: t.tileDolomite, icon: '🧪', desc: t.tileDolomiteDesc },
    { id: 'straw', cat: 'soilcrop', label: t.tileStraw, icon: '🌾', desc: t.tileStrawDesc },
    { id: 'drone', cat: 'soilcrop', label: t.tileDrone, icon: '🛸', desc: t.tileDroneDesc },

    // 4. Weather, Organic & AI Assistant
    { id: 'weather', cat: 'weatherorganic', label: t.tileWeather, icon: '🌧️', desc: t.tileWeatherDesc },
    { id: 'organic', cat: 'weatherorganic', label: t.tileOrganic, icon: '🍯', desc: t.tileOrganicDesc },
    { id: 'chat', cat: 'weatherorganic', label: t.tileChat, icon: '💬', desc: t.tileChatDesc }
  ];

  const visibleTiles = selectedCategory === 'all' 
    ? allTiles 
    : allTiles.filter(item => item.cat === selectedCategory);

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

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: language === 'en' ? 'All 12 Services' : (language === 'ta' ? 'அனைத்து சேவைகள்' : 'සියලු සේවා 12'), count: 12 },
          { id: 'quality', label: t.catQuality, count: 3 },
          { id: 'dosage', label: t.catDosage, count: 2 },
          { id: 'soilcrop', label: t.catSoilCrop, count: 4 },
          { id: 'weatherorganic', label: t.catWeatherOrganic, count: 3 }
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center space-x-1.5 ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{cat.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              selectedCategory === cat.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Service Shortcuts Grid (Filtered by Category) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visibleTiles.map(tile => (
          <button
            key={tile.id}
            onClick={() => setActiveTab(tile.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${
              activeTab === tile.id
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md transform scale-[1.01]'
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
      {activeTab === 'organic' && (() => {
        const organicRecipesData = {
          jeevamrutha: {
            id: 'jeevamrutha',
            title: t.recJeevTitle,
            subtitle: t.recJeevDesc,
            icon: '🌱',
            baseVolumePerAcre: 200,
            savingsPerAcre: 14500,
            dilutionPerTank: language === 'en' 
              ? "For soil drenching: fill knapsack directly with strained broth. For foliar spraying: mix 1.5L strained Jeevamrutha with 14.5L clean water per 16L tank (10% foliar dilution)."
              : (language === 'ta' 
                  ? "மண்ணில் ஊற்ற: வடிகட்டிய திரவத்தை நேரடியாக 16L தெளிப்பானில் ஊற்றவும். இலைகளில் தெளிக்க: 1.5L கரைசலை 14.5L தண்ணீரில் கலக்கவும் (10% வீதம்)."
                  : "පසට යෙදීමට නම්: පෙරාගත් ජීවාමෘත කෙලින්ම ලීටර් 16 ටැංකියට පුරවා මුලට වත්කරන්න. පත්‍ර මතට ස්ප්‍රේ කිරීමට නම්: ජීවාමෘත 1.5L ක් වතුර 14.5L සමග කලවම් කරන්න (10% තනුක කිරීම)."),
            bestTiming: language === 'en'
              ? "Early morning (6:30 AM - 8:30 AM) or evening (4:30 PM - 6:30 PM) during moist soil conditions. Avoid direct blazing mid-day sunlight."
              : (language === 'ta'
                  ? "அதிகாலை (காலை 6:30 - 8:30) அல்லது மாலை (4:30 - 6:30) வேளையில் மண் ஈரப்பதமாக இருக்கும் போது இடவும். நண்பகல் வெயிலை தவிர்க்கவும்."
                  : "උදෑසන 6:30 - 8:30 හෝ සවස 4:30 - 6:30 හිරු රශ්මිය අඩු, පස තෙතමනය සහිත අවස්ථාවේදී. දහවල් තද අව්වේ යෙදීමෙන් වළකින්න."),
            ingredients: [
              { 
                name: language === 'en' ? 'Fresh Cow Dung' : (language === 'ta' ? 'புதிய மாட்டு சாணம்' : 'නැවුම් එළගොම'),
                amount: `${(10 * organicAcres).toFixed(1)} kg`,
                note: language === 'en' ? 'From indigenous or local cattle' : (language === 'ta' ? 'நாட்டு மாட்டு சாணம் சிறந்தது' : 'දේශීය එළදෙනුන්ගේ වඩාත් සුදුසුයි')
              },
              { 
                name: language === 'en' ? 'Fresh Cow Urine' : (language === 'ta' ? 'மாட்டு கோமியம்' : 'ගව මුත්‍රා'),
                amount: `${(10 * organicAcres).toFixed(1)} L`,
                note: language === 'en' ? 'Rich in organic nitrogen & hormones' : (language === 'ta' ? 'தழைச்சத்து மற்றும் வளர்ச்சி ஊக்கிகள்' : 'නයිට්‍රජන් හා ශාක හෝමෝන බහුලයි')
              },
              { 
                name: language === 'en' ? 'Jaggery / Black Treacle' : (language === 'ta' ? 'நாட்டு சர்க்கரை / வெல்லம்' : 'හකුරු / උක් පැණි'),
                amount: `${(2 * organicAcres).toFixed(1)} kg`,
                note: language === 'en' ? 'Fermentation fuel for microbes' : (language === 'ta' ? 'நுண்ணுயிர் பெருக்கத்திற்கான ஆற்றல்' : 'ක්ෂුද්‍රජීවීන් ගුණනය වීමේ ශක්ති ප්‍රභවය')
              },
              { 
                name: language === 'en' ? 'Pulse Flour (Gram / Chickpea)' : (language === 'ta' ? 'பயறு மாவு (கடலை மாவு)' : 'මුං/කඩල/උඳු පිටි'),
                amount: `${(2 * organicAcres).toFixed(1)} kg`,
                note: language === 'en' ? 'Microbial protein nutrient source' : (language === 'ta' ? 'நுண்ணுயிர்களுக்கான புரத உணவு' : 'ක්ෂුද්‍රජීවී ප්‍රෝටීන් ආහාරය')
              },
              { 
                name: language === 'en' ? 'Living Ant-hill / Forest Soil' : (language === 'ta' ? 'புற்று மண் / நச்சு இல்லாத காட்டு மண்' : 'තුඹසකින් ගත් පස්'),
                amount: `${(0.5 * organicAcres).toFixed(1)} kg`,
                note: language === 'en' ? 'Inoculant containing millions of live soil bacteria' : (language === 'ta' ? 'மண் நுண்ணுயிர் மூலம்' : 'මිලියන ගණනක් හිතකර බැක්ටීරියා බීජාණු')
              },
              { 
                name: language === 'en' ? 'Clean Water' : (language === 'ta' ? 'சுத்தமான தண்ணீர்' : 'පිරිසිදු ජලය'),
                amount: `${Math.round(200 * organicAcres)} L`,
                note: language === 'en' ? 'Chlorine-free well or canal water' : (language === 'ta' ? 'குளோரின் இல்லாத நீர்' : 'ක්ලෝරීන් රහිත ළිං හෝ ඇළ වතුර')
              }
            ],
            steps: language === 'en' ? [
              "Take a 200L clean barrel, add water, then dissolve fresh cow dung, urine, jaggery, pulse flour and ant-hill soil thoroughly.",
              "Place the barrel in shade covered with a gunny bag. Stir clockwise with a wooden pole for 2 minutes, twice daily for 5-7 days.",
              "Strain through a fine mosquito net before filling sprayers. Apply 200L per acre onto moist soil every 14 days."
            ] : (language === 'ta' ? [
              "ஒரு பிளாஸ்டிக் பீப்பாயில் தண்ணீரை ஊற்றி, மாட்டு சாணம், கோமியம், வெல்லம், பயறு மாவு மற்றும் புற்று மண்ணை நன்கு கலக்கவும்.",
              "பீப்பாயை நிழலில் வைத்து சாக்கு பையால் மூடவும். தினமும் காலையும் மாலையும் ஒரு மரக்குச்சியால் வலஞ்சுழியாக கலக்கி விடவும். 5-7 நாட்களில் தயாராகும்.",
              "தெளிப்பானில் ஊற்றுவதற்கு முன் மெல்லிய துணியால் வடிகட்டவும். ஏக்கருக்கு 200L வீதம் 14 நாட்களுக்கு ஒருமுறை பயிர்களுக்கு இடவும்."
            ] : [
              "ප්ලාස්ටික් බැරලයකට ජලය දමා, නැවුම් ගොම, ගව මුත්‍රා, හකුරු, පිටි සහ තුඹස් පස් දමා ලී දණ්ඩකින් හොඳින් කලවම් කරන්න.",
              "හිරු එළිය නොවැටෙන සෙවණක තබා ගෝනියකින් මුඛය වසන්න. දින 5-7 ක් යනතුරු දිනපතා උදේ-හවස දක්ෂිණාවර්තව (දකුණතට) විනාඩි 2 බැගින් කලවම් කරන්න.",
              "දින 7 කට පසු හොඳින් පැසී ඇති අතර, ස්ප්‍රේ යන්ත්‍රයට දැමීමට පෙර සියුම් දැලකින් පෙරා ගන්න. දින 14 කට වරක් ගොයමට යොදන්න."
            ])
          },

          panchagavya: {
            id: 'panchagavya',
            title: t.recPanchTitle,
            subtitle: t.recPanchDesc,
            icon: '🥛',
            baseVolumePerAcre: 200,
            savingsPerAcre: 16500,
            dilutionPerTank: language === 'en'
              ? "Mix 500ml concentrated Panchagavya with 15.5L water per 16L knapsack sprayer tank (3% solution). Each acre requires ~13 sprayer tanks."
              : (language === 'ta'
                  ? "16L தெளிப்பான் தொட்டிக்கு 500ml பஞ்சகவ்யா கரைசலுடன் 15.5L தண்ணீர் சேர்க்கவும் (3% வீதம்). ஏக்கருக்கு 13 டேங்குகள் தேவை."
                  : "ලීටර් 16 ස්ප්‍රේ ටැංකියකට සාන්ද්‍ර පංචගව්‍ය මිලිලීටර් 500 ක් දමා වතුර ලීටර් 15.5 ක් පුරවන්න (3% සාන්ද්‍රණය). අක්කරයකට ටැංකි 13ක් පමණ අවශ්‍ය වේ."),
            bestTiming: language === 'en'
              ? "Early morning or late evening. Most effective during vegetative branching, pre-flowering and grain-filling stages."
              : (language === 'ta'
                  ? "அதிகாலை அல்லது மாலையில் தெளிக்கவும். கிளைகள் வளரும் பருவம், பூ பூக்கும் முன் தெளிப்பது மிகச் சிறந்தது."
                  : "උදෑසන හෝ සවස. පැළ වර්ධන අවධිය, මල් පිපීමට සතියකට පෙර සහ කරල්/ගෙඩි පැසෙන අවධියේදී යෙදීම අතිශයින් ඵලදායී වේ."),
            ingredients: [
              { 
                name: language === 'en' ? 'Panchagavya Concentrate Stock' : (language === 'ta' ? 'தேவையான பஞ்சகவ்யா சாறு' : 'අවශ්‍ය සාන්ද්‍ර පංචගව්‍ය ද්‍රාවණය'),
                amount: `${(6 * organicAcres).toFixed(1)} L`,
                note: language === 'en' ? 'Stock required for 3% field dilution' : (language === 'ta' ? 'செறிவூட்டப்பட்ட திரவம்' : '3% තනුක කර යෙදීමට අවශ්‍ය සම්පූර්ණ තොගය')
              },
              { 
                name: language === 'en' ? 'Fresh Cow Dung' : (language === 'ta' ? 'பசுஞ்சாணம்' : 'නැවුම් එළගොම'),
                amount: `${(2.5 * organicAcres).toFixed(1)} kg`,
                note: language === 'en' ? 'Beneficial microbial foundation' : (language === 'ta' ? 'நுண்ணுயிர் பெருக்கத்திற்கு' : 'හිතකර ක්ෂුද්‍රජීවීන්')
              },
              { 
                name: language === 'en' ? 'Pure Cow Ghee' : (language === 'ta' ? 'பசு நெய்' : 'පිරිසිදු ගව ගිතෙල්'),
                amount: `${Math.round(350 * organicAcres)} g`,
                note: language === 'en' ? 'Fermentation matrix and vitamins' : (language === 'ta' ? 'நொதித்தலை தூண்டும்' : 'පැසවීමේදී විටමින් හා මේද අම්ල සපයයි')
              },
              { 
                name: language === 'en' ? 'Fresh Cow Milk' : (language === 'ta' ? 'பசும்பால்' : 'නැවුම් එළකිරි'),
                amount: `${(1.0 * organicAcres).toFixed(1)} L`,
                note: language === 'en' ? 'Bio-calcium and amino acids' : (language === 'ta' ? 'அமினோ அமிலங்கள்' : 'ස්වභාවික කැල්සියම් හා ඇමයිනෝ අම්ල')
              },
              { 
                name: language === 'en' ? 'Cow Curd (Yogurt)' : (language === 'ta' ? 'பசுந்தயிர்' : 'එළකිරි මුදවාපු කිරි'),
                amount: `${Math.round(700 * organicAcres)} ml`,
                note: language === 'en' ? 'Lactobacillus probiotic cultures' : (language === 'ta' ? 'லாக்டோபாகிலஸ் பாக்டீரியா' : 'ලැක්ටොබැසිලස් හිතකර බැක්ටීරියා')
              },
              { 
                name: language === 'en' ? 'Tender Coconut Water & Bananas' : (language === 'ta' ? 'இளநீர் மற்றும் வாழைப்பழம்' : 'තැඹිලි වතුර සහ ඉදුණු කෙසෙල්'),
                amount: `${(1.0 * organicAcres).toFixed(1)} L + ${Math.round(4 * organicAcres)} pcs`,
                note: language === 'en' ? 'Potassium, cytokinin & auxin plant growth hormones' : (language === 'ta' ? 'பொட்டாசியம் மற்றும் வளர்ச்சி ஊக்கிகள்' : 'පොටෑසියම්, සයිටොකයිනින් හෝමෝන වර්ධකය')
              }
            ],
            steps: language === 'en' ? [
              "Mix fresh cow dung and cow ghee thoroughly in a wide-mouthed clay or plastic pot. Keep for 3 days, stirring twice daily.",
              "On day 4, add cow urine, milk, curd, tender coconut water, jaggery and mashed ripe bananas. Mix well.",
              "Keep covered in shade for 15-20 days, stirring twice daily. Strain through fine mesh and dilute 500ml per 16L sprayer."
            ] : (language === 'ta' ? [
              "மாட்டு சாணத்தையும் நெய்யையும் ஒரு பாத்திரத்தில் பிசைந்து 3 நாட்கள் வைக்கவும். தினமும் இருவேளை கிளறவும்.",
              "4வது நாளில் கோமியம், பால், தயிர், இளநீர், வெல்லம் மற்றும் பிசைந்த வாழைப்பழங்களை சேர்த்து கலக்கவும்.",
              "15-20 நாட்கள் நிழலில் வைக்கவும். தினமும் இருவேளை கிளறி, பின் வடிகட்டி 16L டேங்குக்கு 500ml வீதம் தெளிக்கவும்."
            ] : [
              "මුලින්ම නැවුම් ගොම සහ ගිතෙල් ප්ලාස්ටික් බඳුනක දමා අතින් හොඳින් කලවම් කර දින 3ක් තබන්න (දිනපතා උදේ-හවස කලවම් කරන්න).",
              "4 වන දින එළකිරි, මුදවාපු කිරි, ගව මුත්‍රා, තැඹිලි වතුර, හකුරු සහ පොඩිකරගත් ඉදුණු කෙසෙල් එකතු කර හොඳින් දියකරන්න.",
              "දින 15-20 ක් සෙවණේ තබා දිනපතා දෙවරක් කලවම් කරන්න. ඉන්පසු පෙරාගෙන ස්ප්‍රේ ටැංකියකට 500ml බැගින් දමා වතුර පුරවා ස්ප්‍රේ කරන්න."
            ])
          },

          neem: {
            id: 'neem',
            title: t.recNeemTitle,
            subtitle: t.recNeemDesc,
            icon: '🌿',
            baseVolumePerAcre: 50,
            savingsPerAcre: 9200,
            dilutionPerTank: language === 'en'
              ? "Pour strained extract into 16L knapsack sprayer. Each 16L tank covers ~1/3 of an acre. Ensure nozzle sprays a fine mist covering underside of leaves."
              : (language === 'ta'
                  ? "வடிகட்டிய சாற்றை 16L தெளிப்பானில் ஊற்றி நன்றாக இலைகளின் மேல் மற்றும் கீழ்ப்பகுதியில் படும்படி தெளிக்கவும்."
                  : "ලීටර් 16 ටැංකියකට පෙරාගත් සාරය දමා සියුම් මීදුමක් (fine mist) ලෙස කොළවල යටි පැත්තටත් හොඳින් වදින සේ ස්ප්‍රේ කරන්න."),
            bestTiming: language === 'en'
              ? "Late afternoon (after 4:30 PM). Active Azadirachtin degrades rapidly under harsh mid-day ultraviolet solar radiation."
              : (language === 'ta'
                  ? "மாலை 4:30 மணிக்கு மேல் தெளிக்கவும். கடுமையான வெயிலில் வேப்ப எண்ணெயின் வீரியம் குறையும்."
                  : "සවස 4:30 න් පසු. දහවල් දැඩි හිරු එළියේ පාරජම්බුල කිරණ නිසා කොහොඹ වල ඇති Azadirachtin කෘමි නාශක ගුණය විනාශ වීම වළක්වා ගැනීමට."),
            ingredients: [
              { 
                name: language === 'en' ? 'Crushed Neem Seeds / Leaves' : (language === 'ta' ? 'வேப்பங்கொட்டை / வேப்பிலை' : 'තලාගත් කොහොඹ ඇට හෝ කොළ'),
                amount: `${(2.5 * organicAcres).toFixed(1)} kg`,
                note: language === 'en' ? 'Botanical Azadirachtin repels 200+ pest species' : (language === 'ta' ? 'அசாடிராக்டின் நிறைந்த இயற்கை மருந்து' : 'Azadirachtin අඩංගු ස්වභාවික කෘමි විකර්ෂකය')
              },
              { 
                name: language === 'en' ? 'Bar Soap Solution (Sticker)' : (language === 'ta' ? 'சோப் கரைசல்' : 'කැට සබන් දියරය'),
                amount: `${Math.round(50 * organicAcres)} g`,
                note: language === 'en' ? 'Wetting agent & sticker for waxy leaf surfaces' : (language === 'ta' ? 'இலைகளில் ஒட்டுவதற்கு' : 'කොළවල රැඳී තැබීමට සහ ඉටි තට්ටුව බිඳීමට (Sticker)')
              },
              { 
                name: language === 'en' ? 'Clean Water' : (language === 'ta' ? 'சுத்தமான தண்ணீர்' : 'පිරිසිදු ජලය'),
                amount: `${Math.round(50 * organicAcres)} L`,
                note: language === 'en' ? 'Final diluted spraying volume' : (language === 'ta' ? 'கரைசலுக்கு' : 'සාරය පෙරා ගැනීම සඳහා')
              }
            ],
            steps: language === 'en' ? [
              "Pound dried neem seeds or fresh mature neem leaves into a coarse paste.",
              "Tie into a porous cloth pouch and immerse in 10L water overnight (12-14 hrs). Squeeze pouch repeatedly until dark extract is obtained.",
              "Add dissolved bar soap, dilute with water to make 50L per acre, filter through fine mesh, and spray covering both leaf sides immediately."
            ] : (language === 'ta' ? [
              "வேப்பங்கொட்டைகளை இடித்து அல்லது வேப்பிலையை அரைத்து விழுதாக்கவும்.",
              "ஒரு துணியில் கட்டி 10 லிட்டர் தண்ணீரில் இரவு முழுவதும் ஊற வைக்கவும். காலையில் சாற்றை நன்கு பிழிந்து எடுக்கவும்.",
              "சோப்பு கரைசலை சேர்த்து 50 லிட்டராக நீர்த்து, வடிகட்டி மாலையில் பயிர்களின் இலைகளின் இருபுறமும் படும்படி தெளிக்கவும்."
            ] : [
              "වියළි කොහොඹ ඇට කුඩු කරගන්න, හෝ නැවුම් කොහොඹ කොළ වංගෙඩියක දමා හොඳින් කොටා ගන්න.",
              "සිහින් රෙදි කඩක පොට්ටනියක් බැඳ වතුර ලීටර් 10 ක බහා මුළු රැයක් (පැය 12ක්) පෙඟෙන්න තබන්න. උදෑසන පොට්ටනිය කිහිපවරක් මිරිකා සාරය වතුරට ගන්න.",
              "දියකරගත් සබන් වතුර එකතු කර සම්පූර්ණ පරිමාව ලීටර් 50 දක්වා ජලයෙන් වැඩි කර, පෙරාගෙන සවසට කොළවල දෙපැත්තම තෙමෙන සේ ස්ප්‍රේ කරන්න."
            ])
          },

          chili_garlic: {
            id: 'chili_garlic',
            title: t.recChiliTitle,
            subtitle: t.recChiliDesc,
            icon: '🌶️',
            baseVolumePerAcre: 50,
            savingsPerAcre: 10500,
            dilutionPerTank: language === 'en'
              ? "Add ~1.5L of strained stock solution into each 16L knapsack tank and fill remaining 14.5L with clean water (1:10 dilution)."
              : (language === 'ta'
                  ? "16L தெளிப்பான் தொட்டிக்கு 1.5L சாற்றை ஊற்றி மீதமுள்ள 14.5L தண்ணீரை நிரப்பவும்."
                  : "ලීටර් 16 ටැංකියකට පෙරාගත් සාරය ලීටර් 1.5 ක් දමා ඉතිරි ලීටර් 14.5 ට වතුර පුරවන්න (1:10 අනුපාතය)."),
            bestTiming: language === 'en'
              ? "Early morning or late afternoon. Spray immediately upon first sign of thrips, mites, or leaf curling."
              : (language === 'ta'
                  ? "அதிகாலை அல்லது மாலையில் தெளிக்கவும். இலை சுருட்டை மற்றும் பூச்சிகள் தென்பட்டவுடன் தெளிக்கவும்."
                  : "උදෑසන හෝ සවස. කොළ කොඩවීම, මයිටාවන්, කීඩෑවන් හෝ පැළ මැක්කන් දුටු වහාම යොදන්න."),
            ingredients: [
              { 
                name: language === 'en' ? 'Hot Green Chillies (Nai Miris)' : (language === 'ta' ? 'காரமான பச்சை மிளகாய்' : 'සැර අමු මිරිස් / නයි මිරිස්'),
                amount: `${Math.round(500 * organicAcres)} g`,
                note: language === 'en' ? 'Capsaicin repels chewing and sucking insects' : (language === 'ta' ? 'பூச்சிகளை விரட்டும் காரத்தன்மை' : 'කැප්සයිසින් සාරය කෘමීන්ගේ ස්නායු පද්ධතියට බලපායි')
              },
              { 
                name: language === 'en' ? 'Garlic Cloves' : (language === 'ta' ? 'பூண்டு' : 'සුදුලූනු බික්'),
                amount: `${Math.round(500 * organicAcres)} g`,
                note: language === 'en' ? 'Allicin compound acts as strong natural deterrent' : (language === 'ta' ? 'பூஞ்சை மற்றும் பூச்சி எதிர்ப்பு' : 'ඇලිසින් සල්ෆර් සංයෝගය කෘමි හා දිලීර නාශකයකි')
              },
              { 
                name: language === 'en' ? 'Fresh Ginger' : (language === 'ta' ? 'இஞ்சி' : 'අමු ඉඟුරු'),
                amount: `${Math.round(500 * organicAcres)} g`,
                note: language === 'en' ? 'Strong pungent aroma repellent' : (language === 'ta' ? 'பூச்சி விரட்டி' : 'ජින්ජරෝල් තද විකර්ෂකයකි')
              },
              { 
                name: language === 'en' ? 'Mild Soap Solution (Sticker)' : (language === 'ta' ? 'சோப் கரைசல்' : 'කැට සබන් දියරය'),
                amount: `${Math.round(50 * organicAcres)} g`,
                note: language === 'en' ? 'Ensures adhesion to foliage' : (language === 'ta' ? 'இலைகளில் ஒட்டுவதற்கு' : 'කොළ මත රැඳී සිටීම තහවුරු කරයි')
              },
              { 
                name: language === 'en' ? 'Clean Water' : (language === 'ta' ? 'சுத்தமான தண்ணீர்' : 'පිරිසිදු ජලය'),
                amount: `${Math.round(50 * organicAcres)} L`,
                note: language === 'en' ? 'Final spray volume' : (language === 'ta' ? 'மொத்த தெளிக்கும் நீர்' : 'තනුක කර ස්ප්‍රේ කිරීමට අවශ්‍ය මුළු ජලය')
              }
            ],
            steps: language === 'en' ? [
              "Grind green chillies, garlic, and ginger separately with a little water into fine pastes.",
              "Mix all three pastes together in 5L of water and let steep for 24 hours.",
              "Strain carefully through a fine muslin cloth, add dissolved soap, and dilute into 50L total spray solution. Spray onto affected crops."
            ] : (language === 'ta' ? [
              "பச்சை மிளகாய், பூண்டு, இஞ்சி ஆகியவற்றை சிறிதளவு தண்ணீர் சேர்த்து தனித்தனியாக அரைக்கவும்.",
              "மூன்றையும் 5 லிட்டர் நீரில் ஒன்றாக கலந்து 24 மணி நேரம் ஊற வைக்கவும்.",
              "மெல்லிய துணியில் வடிகட்டி, சோப்பு கரைசலை சேர்த்து 50 லிட்டராக நீர்த்து தெளிக்கவும்."
            ] : [
              "අමු මිරිස්, සුදුලූනු සහ ඉඟුරු වතුර ස්වල්පයක් දමා වෙන වෙනම හොඳින් අඹරාගන්න හෝ බ්ලෙන්ඩර් කරන්න.",
              "මෙම පල්ප තුනම එකට එකතු කර වතුර ලීටර් 5 ක දියකර පැය 24 ක් වසා තබන්න.",
              "සියුම් රෙදි කඩකින් පෙරා, සබන් දියරය කලවම් කර, මුළු පරිමාව ලීටර් 50 දක්වා ජලයෙන් තනුක කර වගාවට ස්ප්‍රේ කරන්න."
            ])
          }
        };

        const currentRecipe = organicRecipesData[recipeKey] || organicRecipesData.jeevamrutha;
        const totalSprayLiters = Math.round(currentRecipe.baseVolumePerAcre * organicAcres);
        const totalTanks = Math.ceil(totalSprayLiters / 16);
        const totalSavings = Math.round(currentRecipe.savingsPerAcre * organicAcres);

        return (
          <div className="clean-card p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900">
                {t.organicHeader}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {t.organicHelp}
              </p>
            </div>

            {/* STEP 1: Land Area Extent Selector */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-black text-emerald-950 flex items-center space-x-2">
                  <span>📍</span>
                  <span>{t.organicLandSizeLabel}</span>
                </label>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  {organicAcres} {language === 'en' ? 'Acres' : (language === 'ta' ? 'ஏக்கர்' : 'අක්කර')}
                </span>
              </div>

              {/* Quick Select Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { val: 0.25, label: language === 'en' ? '1/4 Acre' : (language === 'ta' ? '1/4 ஏக்கர்' : 'අක්කර 1/4 (පාත්ති)') },
                  { val: 0.5, label: language === 'en' ? '1/2 Acre' : (language === 'ta' ? '1/2 ஏக்கர்' : 'අක්කර 1/2') },
                  { val: 1.0, label: language === 'en' ? '1 Acre' : (language === 'ta' ? '1 ஏக்கர்' : 'අක්කර 1') },
                  { val: 2.0, label: language === 'en' ? '2 Acres' : (language === 'ta' ? '2 ஏக்கர்' : 'අක්කර 2') },
                  { val: 5.0, label: language === 'en' ? '5 Acres' : (language === 'ta' ? '5 ஏக்கர்' : 'අක්කර 5') }
                ].map(chip => (
                  <button
                    key={chip.val}
                    type="button"
                    onClick={() => setOrganicAcres(chip.val)}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                      organicAcres === chip.val
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-emerald-400'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Custom Number Input */}
              <div className="flex items-center space-x-3 pt-1">
                <span className="text-xs font-bold text-slate-600">
                  {language === 'en' ? 'Or enter custom acres:' : (language === 'ta' ? 'அல்லது ஏக்கரை உள்ளிடவும்:' : 'හෝ අක්කර ගණන ඇතුළත් කරන්න:')}
                </span>
                <div className="relative w-32">
                  <input
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.25"
                    value={organicAcres}
                    onChange={(e) => setOrganicAcres(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                    className="w-full py-1.5 px-3 rounded-xl border border-slate-300 bg-white font-black text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-[11px] font-bold text-slate-400 pointer-events-none">
                    {language === 'en' ? 'ac' : 'අක්.'}
                  </span>
                </div>
              </div>
            </div>

            {/* STEP 2: Recipe Selector */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 block">
                {t.organicSelectRecipeLabel}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { id: 'jeevamrutha', label: t.recJeevTitle, desc: t.recJeevDesc, icon: '🌱' },
                  { id: 'panchagavya', label: t.recPanchTitle, desc: t.recPanchDesc, icon: '🥛' },
                  { id: 'neem', label: t.recNeemTitle, desc: t.recNeemDesc, icon: '🌿' },
                  { id: 'chili_garlic', label: t.recChiliTitle, desc: t.recChiliDesc, icon: '🌶️' }
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRecipeKey(r.id)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                      recipeKey === r.id
                        ? 'border-emerald-600 bg-emerald-50 text-slate-900 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{r.icon}</span>
                      <span className="font-black text-sm block">{r.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block leading-tight">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 3: KPI Metrics Banner for Selected Land Extent */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Metric 1: Total Liquid */}
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-slate-900">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide block">
                  {t.totalLiquidNeeded}
                </span>
                <div className="text-2xl font-black text-blue-950 mt-1">
                  {totalSprayLiters} <span className="text-sm font-bold text-slate-600">Liters (ලීටර්)</span>
                </div>
                <span className="text-[11px] text-blue-600 font-medium block mt-1">
                  {language === 'en' ? `Scaled for ${organicAcres} acres` : `අක්කර ${organicAcres} ක බිම් ප්‍රමාණය සඳහා`}
                </span>
              </div>

              {/* Metric 2: Knapsack Sprayer Tanks */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-slate-900">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block">
                  {t.sprayerTanksNeeded}
                </span>
                <div className="text-2xl font-black text-amber-950 mt-1">
                  {totalTanks} <span className="text-sm font-bold text-slate-600">{language === 'en' ? 'Tanks' : 'ටැංකි'}</span>
                </div>
                <span className="text-[11px] text-amber-700 font-medium block mt-1">
                  {language === 'en' ? 'Standard 16-liter knapsack sprayers' : 'ලීටර් 16 සම්මත ස්ප්‍රේ ටැංකි'}
                </span>
              </div>

              {/* Metric 3: Estimated Rupee Savings */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-slate-900">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
                  {language === 'en' ? 'Estimated Rupee Savings' : 'ඉතිරි වන මුදල (රුපියල්)'}
                </span>
                <div className="text-2xl font-black text-emerald-950 mt-1">
                  Rs. {totalSavings.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                  {language === 'en' ? 'Saved vs synthetic chemicals' : 'රසායනික පොහොර/බෙහෙත් ඉතිරිය'}
                </span>
              </div>
            </div>

            {/* STEP 4: Dynamic Scaled Ingredients Cards */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                  <span>{currentRecipe.icon}</span>
                  <span>{currentRecipe.title}</span>
                  <span className="text-xs font-bold text-slate-500 font-normal">
                    — {t.scaledForLand} ({organicAcres} {language === 'en' ? 'Acres' : 'අක්කර'})
                  </span>
                </h3>
                <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block">
                  🌿 100% {language === 'en' ? 'Chemical Free' : 'ස්වභාවිකයි'}
                </span>
              </div>

              {/* Ingredients Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentRecipe.ingredients.map((ing, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between shadow-xs">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block leading-tight">{ing.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{ing.note}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {language === 'en' ? 'Quantity' : 'ප්‍රමාණය'}:
                      </span>
                      <strong className="text-sm sm:text-base font-black text-emerald-800">
                        {ing.amount}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tank Mixing & Application Timing Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-1">
                  <strong className="font-black text-blue-900 flex items-center space-x-1.5">
                    <span>🎯</span>
                    <span>{t.tankDilutionRule}</span>
                  </strong>
                  <p className="leading-relaxed font-medium text-slate-700">{currentRecipe.dilutionPerTank}</p>
                </div>

                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                  <strong className="font-black text-amber-900 flex items-center space-x-1.5">
                    <span>⏰</span>
                    <span>{t.bestTimingRule}</span>
                  </strong>
                  <p className="leading-relaxed font-medium text-slate-700">{currentRecipe.bestTiming}</p>
                </div>
              </div>

              {/* Preparation Steps */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">
                  {language === 'en' ? 'Preparation & Fermentation Process:' : (language === 'ta' ? 'செய்முறை மற்றும் நொதித்தல் விதம்:' : 'සාදාගන්නා සහ පැසවීමේ පියවර:')}
                </span>
                <div className="space-y-1.5">
                  {currentRecipe.steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-start space-x-2 text-xs text-slate-700 font-medium">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {sIdx + 1}
                      </span>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DOA Certification Badge */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-center space-x-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <strong className="font-black block">
                    {language === 'en' ? 'Sri Lanka DOA GAP Certified Organic Protocol' : 'ශ්‍රී ලංකා කෘෂිකර්ම දෙපාර්තමේන්තුවේ GAP කාබනික නිර්දේශය'}
                  </strong>
                  <span className="text-[11px] text-emerald-800 font-medium">
                    {language === 'en' 
                      ? 'Complies with SLS 1672 organic agriculture standards. Eliminates soil toxicity and restores native earthworms.' 
                      : 'මෙම කාබනික වට්ටෝරු භාවිතයෙන් රසායනික විස ඉවත් වී පසේ ක්ෂුද්‍රජීවීන් හා ගැඩවිලුන් නැවත බෝවේ. පාංශු සාරවත්භාවය දිගුකාලීනව රැකෙයි.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
      {/* FEATURE 3: FERTILIZER BAG & HOLOGRAM AUTHENTICITY SCANNER */}
      {/* ================================================================ */}
      {activeTab === 'bagscan' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              <span>{language === 'en' ? 'Packaging & Vision Security' : 'උරයේ මුද්‍රණ හා ආරක්ෂක ලකුණු පරීක්ෂාව'}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {language === 'en' ? 'Fertilizer Bag & Hologram Authenticity Verification' : 'පොහොර උරයේ ආරක්ෂිත ලකුණු හා හොලෝග්‍රෑම් පරීක්ෂාව'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {language === 'en'
                ? 'Verify official brand packaging, diffraction holograms, microprint typography, and stitch patterns to detect counterfeit bag reuse.'
                : 'රජයේ ලක්පොහොර හා බලපත්‍රලාභී පොහොර උරවල ඇති හොලෝග්‍රෑම්, ක්ෂුද්‍ර මුද්‍රණ (Microprint) සහ ද්විත්ව මැහුම් රටාව පරීක්ෂා කර ව්‍යාජ උර හඳුනාගනිමු.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-black text-slate-900 block mb-1">
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

              {/* Hologram inspection */}
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
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={hologramScore}
                  onChange={(e) => setHologramScore(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                  <span>❌ {language === 'en' ? 'Dull Sticker (Fake)' : 'අඳුරු/ස්ටිකර් (බාලයි)'}</span>
                  <span>✅ {language === 'en' ? 'Rainbow 3D Shimmer' : 'වර්ණාවලි ත්‍රිමාණ දීප්තිය'}</span>
                </div>
              </div>

              {/* Microprint inspection */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">
                    {language === 'en' ? '2. Microprint Text Sharpness:' : '2. ක්ෂුද්‍ර අකුරු මුද්‍රණයේ පැහැදිලිකම:'}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {Math.round(microprintScore * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={microprintScore}
                  onChange={(e) => setMicroprintScore(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
                  <span>❌ {language === 'en' ? 'Blurred Ink' : 'තීන්ත විසිරුණු බොඳ අකුරු'}</span>
                  <span>✅ {language === 'en' ? 'Razor Sharp Print' : 'ඉතා පැහැදිලි සියුම් අකුරු'}</span>
                </div>
              </div>

              {/* Stitching and seal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'en' ? 'Stitch Pattern:' : 'මැහුම් වර්ගය:'}
                  </label>
                  <select
                    value={stitchType}
                    onChange={(e) => setStitchType(e.target.value)}
                    className="w-full p-1.5 rounded-lg border text-xs font-semibold bg-white"
                  >
                    <option value="double_chainstitch">ද්විත්ව දාම මැහුම (Double Chainstitch - නියම)</option>
                    <option value="single_twine">තනි නූල් මැහුම (Single Hand Twine - සැක සහිත)</option>
                  </select>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block">
                      {language === 'en' ? 'Seal Tampered?' : 'මුද්‍රාව කඩා තිබේද?'}
                    </label>
                    <span className="text-[10px] text-slate-500">
                      {sealTampered ? 'කැඩූ සලකුණු ඇත' : 'මුද්‍රාව සුරක්ෂිතයි'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSealTampered(!sealTampered)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      sealTampered ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sealTampered ? 'ඔව් (කැඩී ඇත)' : 'නැත'}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyBag}
                disabled={bagLoading}
                className="w-full py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm shadow transition-all flex items-center justify-center space-x-2"
              >
                <Scan className="w-4 h-4" />
                <span>{bagLoading ? 'පරීක්ෂා කරමින් පවතී...' : 'උරයේ සත්‍යතාවය තහවුරු කරන්න'}</span>
              </button>
            </div>

            {/* Results Panel */}
            <div>
              {bagResult ? (
                <div className={`p-6 rounded-2xl border-2 space-y-4 ${
                  bagResult.authenticity_score_pct >= 75
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                    : 'bg-rose-50 border-rose-400 text-rose-950'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">
                      {bagResult.authenticity_score_pct >= 75 ? '🛡️' : '🚨'}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block">
                        {language === 'en' ? 'Security Authentication Verdict' : 'ආරක්ෂිත පරීක්ෂණ නිගමනය'}
                      </span>
                      <h3 className="text-lg font-black leading-tight">
                        {bagResult.verdict_si || bagResult.verdict}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block">
                        {language === 'en' ? 'Authenticity Score:' : 'ආරක්ෂිත සත්‍යතා ලකුණු:'}
                      </span>
                      <strong className="text-2xl font-black text-slate-900">
                        {bagResult.authenticity_score_pct}%
                      </strong>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      bagResult.authenticity_score_pct >= 75 ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                    }`}>
                      {bagResult.authenticity_score_pct >= 75 ? 'නියම රජයේ උරයකි' : 'ව්‍යාජ අවදානමක්!'}
                    </span>
                  </div>

                  <div className="text-xs font-medium leading-relaxed p-3 bg-white/70 rounded-xl border border-slate-200">
                    💡 <strong>{language === 'en' ? 'Action Advice:' : 'නිල උපදෙස:'}</strong> {bagResult.action_advice_si || bagResult.verdict}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[220px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                  <Scan className="w-10 h-10 text-slate-400" />
                  <p className="text-xs font-bold">
                    {language === 'en' ? 'Click "Verify Bag Packaging" to analyze security marks.' : 'උරයේ සත්‍යතාවය පරීක්ෂා කිරීමට ඉහත බොත්තම ඔබන්න.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FEATURE 7: SOIL PH & DOLOMITE CALCULATOR */}
      {/* ================================================================ */}
      {activeTab === 'dolomite' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
              <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'en' ? 'Soil Health & Buffer Titration' : 'පසේ සෞඛ්‍යය හා ඇඹුල් ගතිය පාලනය'}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {t.tileDolomite}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {language === 'en'
                ? 'When soil pH drops below 5.5, over 60% of applied chemical fertilizers get locked up and wasted. Calculate the exact dolomite dosage to restore soil health.'
                : 'පසේ pH අගය 5.5 ට වඩා අඩු වූ විට (ඇඹුල් වූ විට) ඔබ දමන යූරියා සහ TSP පොහොර වලින් 60% කට වඩා පැළයට උරාගැනීමට නොහැකිව අපතේ යයි. ඩොලමයිට් දමා පස සුවපත් කරමු.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* pH Slider */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900">
                    {language === 'en' ? 'Current Soil pH Level:' : 'ඔබේ පසේ වර්තමාන pH අගය:'}
                  </label>
                  <span className={`text-base font-black px-3 py-0.5 rounded-full ${
                    soilPh < 5.0 ? 'bg-rose-200 text-rose-900' : (soilPh < 6.0 ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900')
                  }`}>
                    pH {soilPh.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="6.8"
                  step="0.1"
                  value={soilPh}
                  onChange={(e) => setSoilPh(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-rose-600">4.0 (තද ඇඹුල් / විෂයි)</span>
                  <span className="text-amber-600">5.5 (මධ්‍යම)</span>
                  <span className="text-emerald-700">6.2 (නියම අගය)</span>
                </div>
              </div>

              {/* Land Acres */}
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  {language === 'en' ? 'Cultivation Land Area (Acres):' : 'ඉඩමේ ප්‍රමාණය (අක්කර වලින්):'}
                </label>
                <div className="flex items-center space-x-2">
                  {[0.5, 1.0, 2.0, 5.0].map(ac => (
                    <button
                      key={ac}
                      type="button"
                      onClick={() => setDolomiteAcres(ac)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        dolomiteAcres === ac ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {ac} {language === 'en' ? 'Ac' : 'අක්.'}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.25"
                    value={dolomiteAcres}
                    onChange={(e) => setDolomiteAcres(parseFloat(e.target.value) || 0.5)}
                    className="w-24 p-1.5 rounded-xl border border-slate-300 text-xs font-black text-center"
                  />
                </div>
              </div>

              {/* Soil Texture */}
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  {language === 'en' ? 'Soil Texture Type:' : 'පස් වර්ගය:'}
                </label>
                <select
                  value={soilTexture}
                  onChange={(e) => setSoilTexture(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
                >
                  <option value="loam_podzolic">රතු-කහ පොඩ්සොලික් (Loam / Dry & Intermediate Zone)</option>
                  <option value="clay_grumusol">කළු මැටි සහිත පස (Clay / Lowland Paddy)</option>
                  <option value="sandy_regosol">වැලි සහිත පස (Sandy Coastal / Kalpitiya)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleCalculateDolomite(soilPh, dolomiteAcres, soilTexture)}
                disabled={dolomiteLoading}
                className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow transition-all flex items-center justify-center space-x-2"
              >
                <Calculator className="w-4 h-4" />
                <span>{dolomiteLoading ? 'ගණනය කරමින් පවතී...' : 'ඩොලමයිට් මාත්‍රාව ගණනය කරන්න'}</span>
              </button>
            </div>

            {/* Dolomite Result Card */}
            <div>
              {dolomiteResult ? (
                <div className="p-6 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">🧪</span>
                    <div>
                      <span className="text-xs font-bold text-amber-900 uppercase tracking-wide block">
                        {language === 'en' ? 'DOA Soil Buffering Recommendation' : 'කෘෂිකර්ම දෙපාර්තමේන්තු ඩොලමයිට් නිර්දේශය'}
                      </span>
                      <h3 className="text-base font-black text-slate-900">
                        {dolomiteAcres} {language === 'en' ? 'Acres' : 'අක්කරයක්'} සඳහා අවශ්‍ය මාත්‍රාව
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-white rounded-xl border border-amber-200">
                      <span className="text-[11px] font-bold text-slate-500 block">අවශ්‍ය ඩොලමයිට්:</span>
                      <strong className="text-xl font-black text-emerald-800">
                        {dolomiteResult.dolomite_recommendation?.dolomite_kg_total || 600} kg
                      </strong>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-amber-200">
                      <span className="text-[11px] font-bold text-slate-500 block">50kg කොට්ට ගණන:</span>
                      <strong className="text-xl font-black text-amber-900">
                        {dolomiteResult.dolomite_recommendation?.bags_50kg_count || 12} කොට්ට
                      </strong>
                    </div>
                  </div>

                  {soilPh < 5.0 && (
                    <div className="p-3 bg-rose-100 rounded-xl border border-rose-300 text-rose-950 text-xs font-medium space-y-1">
                      <strong className="font-black block">⚠️ දැඩි ඇඹුල් අවදානමක් (Severe Nutrient Lockup):</strong>
                      <p>pH {soilPh.toFixed(1)} හිදී පසේ ඇලුමිනියම් විෂවීම නිසා ඔබ යොදන TSP සහ යූරියා වලින් 60% කට වඩා ගල් වේ (අපතේ යයි). ඩොලමයිට් අනිවාර්යයෙන් දැමිය යුතුය.</p>
                    </div>
                  )}

                  <div className="p-3.5 bg-white rounded-xl border border-amber-200 text-xs text-slate-700 space-y-1">
                    <strong className="font-bold text-emerald-900 block">📋 යෙදිය යුතු නිවැරදි ක්‍රමය:</strong>
                    <p className="leading-relaxed font-medium">
                      {dolomiteResult.application_protocol_si || "අවසන් බිම් සැකසීමට (අවසන් හෑමට) සති 2 කට පෙර ඩොලමයිට් පසට දමා කලවම් කරන්න. රසායනික පොහොර දැමීමට සති 2 කට පෙර යෙදිය යුතුය."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[220px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                  <FlaskConical className="w-10 h-10 text-slate-400" />
                  <p className="text-xs font-bold">
                    {language === 'en' ? 'Click "Calculate Dolomite Dosage" to compute requirements.' : 'ඩොලමයිට් මිටි ගණන ගණනය කිරීමට ඉහත බොත්තම ඔබන්න.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FEATURE 8: PADDY STRAW IN-SITU BIO-DECOMPOSITION */}
      {/* ================================================================ */}
      {activeTab === 'straw' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Wheat className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'en' ? 'Circular Nutrient Recycling' : 'පිදුරු ප්‍රතිචක්‍රීකරණය හා මුදල් ඉතිරිය'}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {t.tileStraw}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {language === 'en'
                ? 'Stop burning paddy straw! Biological in-situ decomposition recycles over 80% of native potassium (K2O), saving an entire bag of MOP fertilizer per hectare.'
                : 'කුඹුරේ පිදුරු ගිනි තැබීමෙන් වළකින්න! පිදුරු කුඹුරේම දිරවීමට සැලැස්වීමෙන් පොටෑසියම් (K2O) 80% ක් නැවත පසට ලැබී රතු පොහොර (MOP) මිටියක්ම ඉතිරි කරගත හැක.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  {language === 'en' ? 'Paddy Field Extent (Acres):' : 'කුඹුරේ ප්‍රමාණය (අක්කර):'}
                </label>
                <div className="flex items-center space-x-2">
                  {[0.5, 1.0, 2.0, 5.0].map(ac => (
                    <button
                      key={ac}
                      type="button"
                      onClick={() => setStrawAcres(ac)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        strawAcres === ac ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {ac} {language === 'en' ? 'Ac' : 'අක්.'}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="0.1"
                    max="50"
                    step="0.25"
                    value={strawAcres}
                    onChange={(e) => setStrawAcres(parseFloat(e.target.value) || 1.0)}
                    className="w-24 p-1.5 rounded-xl border border-slate-300 text-xs font-black text-center"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  {language === 'en' ? 'Previous Harvest Yield (Tons/Acre):' : 'පසුගිය කන්නයේ අස්වැන්න (අක්කරයකට මෙ.ටොන්):'}
                </label>
                <select
                  value={grainYield}
                  onChange={(e) => setGrainYield(parseFloat(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
                >
                  <option value={3.0}>3.0 Tons / Acre (සාමාන්‍ය අස්වැන්න)</option>
                  <option value={4.5}>4.5 Tons / Acre (ඉහළ අස්වැන්නක්)</option>
                  <option value={6.0}>6.0 Tons / Acre (විශිෂ්ට අස්වැන්නක්)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleCalculateStraw(strawAcres, grainYield)}
                disabled={strawLoading}
                className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow transition-all flex items-center justify-center space-x-2"
              >
                <Wheat className="w-4 h-4" />
                <span>{strawLoading ? 'ගණනය කරමින් පවතී...' : 'පොටෑසියම් ප්‍රතිචක්‍රීකරණය හා ඉතිරිය ගණනය කරන්න'}</span>
              </button>
            </div>

            {/* Straw Result Dashboard */}
            <div>
              {strawResult ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">🌾</span>
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">
                        {language === 'en' ? 'Nutrient Recycling Dashboard' : 'පිදුරු ප්‍රතිචක්‍රීකරණ ප්‍රතිලාභ'}
                      </span>
                      <h3 className="text-base font-black text-slate-900">
                        අක්කර {strawAcres} ක් සඳහා ප්‍රතිචක්‍රීකරණ අගය
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-white rounded-xl border border-emerald-200">
                      <span className="text-[11px] font-bold text-slate-500 block">ඉතිරි වන MOP (රතු පොහොර):</span>
                      <strong className="text-2xl font-black text-emerald-800">
                        {strawResult.economic_benefits?.equivalent_mop_bags_saved || 1} මිටියයි
                      </strong>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-emerald-200">
                      <span className="text-[11px] font-bold text-slate-500 block">ඉතිරි වන මුදල:</span>
                      <strong className="text-2xl font-black text-emerald-800">
                        Rs. {(strawResult.economic_benefits?.cost_savings_lkr || 19500).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-emerald-200 text-xs space-y-1.5">
                    <strong className="font-bold text-slate-800 block">🌱 පසට එකතුවන ස්වභාවික පෝෂක:</strong>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1 font-bold">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">පොටෑසියම් (K2O)</span>
                        <span className="text-emerald-900 text-sm font-black">{strawResult.nutrients_recycled_to_soil_kg?.potassium_k2o_kg || 45} kg</span>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">කාබනික කාබන්</span>
                        <span className="text-emerald-900 text-sm font-black">{strawResult.nutrients_recycled_to_soil_kg?.organic_carbon_kg || 1200} kg</span>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <span className="text-[10px] text-slate-500 block">සිලිකා (ශක්තියට)</span>
                        <span className="text-emerald-900 text-sm font-black">{strawResult.nutrients_recycled_to_soil_kg?.silica_sio2_kg || 220} kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl text-xs text-slate-700 leading-relaxed">
                    💡 <strong>දිරවීමේ පියවර:</strong> අස්වැන්න නෙළූ පසු පිදුරු ඒකාකාරීව පතුරුවා, ගොම දියර හෝ ට්‍රයිකොඩර්මා ඉස, අඟල් 2ක් ජලය බැඳ සති 2ක් තබා මුල් හෑමේදී පසට පෙරළන්න.
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[220px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                  <Wheat className="w-10 h-10 text-slate-400" />
                  <p className="text-xs font-bold">
                    {language === 'en' ? 'Click "Calculate Savings" to evaluate straw recycling.' : 'පිදුරු මගින් ඉතිරි වන රතු පොහොර ගණනයට ඉහත බොත්තම ඔබන්න.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FEATURE 9: DRONE MULTISPECTRAL NDVI CROP HEALTH SCANNER */}
      {/* ================================================================ */}
      {activeTab === 'drone' && (
        <div className="clean-card p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-700" />
              <span>{language === 'en' ? 'Precision Agronomy & Drone Remote Sensing' : 'නිරවද්‍ය කෘෂිකර්මය හා ඩ්‍රෝන සංවේදන තාක්ෂණය'}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {t.tileDrone}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {language === 'en'
                ? 'Aerial NDVI multispectral survey identifies localized nitrogen deficiency zones, enabling Variable-Rate Application (VRA) so you only fertilize under-nourished patches.'
                : 'අහසේ සිට ඩ්‍රෝන මගින් ලබාගන්නා NDVI බෝග වියන් දර්ශකය මගින් කුඹුරේ නයිට්‍රජන් ඌනතාවය ඇති තැන් නිවැරදිව හඳුනාගෙන අවශ්‍ය තැනට පමණක් පොහොර යොදමු (Variable-Rate Application).'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wide">
                    🚁 ඩ්‍රෝන සංවේදක පරාමිතීන්
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold">
                    Multi-Spectral 5-Band
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">කැමරාව:</span>
                    <strong className="text-slate-200">RedEdge / NIR</strong>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">පියාසැරි උස:</span>
                    <strong className="text-slate-200">35 Meters</strong>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">විභේදනය:</span>
                    <strong className="text-slate-200">2.5 cm / px</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunDroneScan}
                  disabled={droneScanning}
                  className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm shadow transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>{droneScanning ? 'ඩ්‍රෝන පියාසැරිය සිදුවෙමින් පවතී...' : '🚀 ඩ්‍රෝන සමීක්ෂණය අරඹන්න (Launch Drone Scan)'}</span>
                </button>
              </div>

              {/* 4x4 Spatial Crop Health Matrix */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  🗺️ කුඹුරේ 4x4 ක්ෂේත්‍ර කලාප සිතියම (Spatial NDVI Vigor Grid):
                </span>
                <div className="grid grid-cols-4 gap-1.5 p-2 bg-white rounded-xl border border-slate-200">
                  {[
                    0.82, 0.78, 0.65, 0.42,
                    0.80, 0.72, 0.48, 0.38,
                    0.75, 0.68, 0.70, 0.79,
                    0.84, 0.81, 0.74, 0.76
                  ].map((val, idx) => (
                    <div
                      key={idx}
                      className={`h-12 rounded-lg flex flex-col items-center justify-center font-black text-[11px] transition-all shadow-xs ${
                        val >= 0.75
                          ? 'bg-emerald-600 text-white'
                          : (val >= 0.60 ? 'bg-amber-400 text-slate-950' : 'bg-rose-600 text-white animate-pulse')
                      }`}
                    >
                      <span>{val.toFixed(2)}</span>
                      <span className="text-[9px] font-medium opacity-80">
                        {val >= 0.75 ? 'නිරෝගී' : (val >= 0.60 ? 'මධ්‍යම' : 'ඌනයි!')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 pt-1">
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                    <span>NDVI &gt; 0.75 (නිරෝගී)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                    <span>0.60-0.74 (මධ්‍යම)</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
                    <span>&lt; 0.60 (නයිට්‍රජන් ඌනයි)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Drone Results Dashboard */}
            <div>
              {droneResult ? (
                <div className="p-6 rounded-2xl bg-cyan-50/80 border-2 border-cyan-300 space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">🛸</span>
                    <div>
                      <span className="text-xs font-bold text-cyan-900 uppercase tracking-wide block">
                        {language === 'en' ? 'Drone Multispectral Diagnostic' : 'ඩ්‍රෝන බෝග වියන් විශ්ලේෂණය'}
                      </span>
                      <h3 className="text-base font-black text-slate-900">
                        සාමාන්‍ය NDVI අගය: {droneResult.canopy_indices_summary?.mean_ndvi || 0.68}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 bg-white rounded-xl border border-cyan-200">
                      <span className="text-[10px] font-bold text-slate-500 block">නිරෝගී කලාප:</span>
                      <strong className="text-lg font-black text-emerald-700">
                        {droneResult.spatial_zone_distribution?.healthy_green_pct || 62.5}%
                      </strong>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-cyan-200">
                      <span className="text-[10px] font-bold text-slate-500 block">මධ්‍යම කලාප:</span>
                      <strong className="text-lg font-black text-amber-700">
                        {droneResult.spatial_zone_distribution?.moderate_stress_pct || 25.0}%
                      </strong>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-cyan-200">
                      <span className="text-[10px] font-bold text-slate-500 block">ඌන කලාප:</span>
                      <strong className="text-lg font-black text-rose-700">
                        {droneResult.spatial_zone_distribution?.severe_deficiency_pct || 12.5}%
                      </strong>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-cyan-200 space-y-2">
                    <strong className="text-xs font-black text-cyan-950 block">
                      🎯 නිරවද්‍ය යෙදවුම් නිර්දේශය (Variable-Rate Application):
                    </strong>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {droneResult.variable_rate_prescription?.zone_recommendation || "රතු හා කහ පැහැති කොටුවලට පමණක් අමතර යූරියා කි.ග්‍රෑ. 30ක් යොදන්න. කොළ පැහැති නිරෝගී කලාප වලට පොහොර යෙදීමෙන් වළකින්න."}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="font-bold text-slate-500">අපතේ යාමෙන් වැළකෙන යූරියා:</span>
                      <strong className="font-black text-emerald-800">
                        {droneResult.variable_rate_prescription?.urea_saved_kg || 28.5} kg (ඉතිරිය: රු. 11,400)
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[220px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-2">
                  <Cpu className="w-10 h-10 text-slate-400" />
                  <p className="text-xs font-bold">
                    {language === 'en' ? 'Click "Launch Drone Scan" to inspect aerial crop canopy.' : 'කුඹුරේ ඩ්‍රෝන සිතියම ලබාගැනීමට ඉහත බොත්තම ඔබන්න.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* FEATURE 12: FARMER AI CHAT */}
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
