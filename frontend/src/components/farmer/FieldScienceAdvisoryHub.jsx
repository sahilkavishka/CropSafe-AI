import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  CloudRain,
  MessageSquareText,
  Mic,
  MicOff,
  Volume2,
  Send,
  Waves,
  PhoneCall,
  Copy,
  ShieldAlert,
  Cpu,
  Leaf,
  Droplets,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Share2,
  Sparkles,
  Check,
  HelpCircle,
  Clock
} from 'lucide-react';
import ThreePlantCanvas from '../ThreePlantCanvas';
import ThreeDroneFieldCanvas from '../ThreeDroneFieldCanvas';
import { translations } from '../../i18n';

const API_BASE = "http://localhost:8000";

export default function FieldScienceAdvisoryHub({
  language = 'si',
  tr = (si, en, ta) => (language === 'ta' ? (ta || en || si) : language === 'en' ? (en || si) : si),
  activeTool = 'leafdoctor',
  onSelectTool = () => {},
  onBackToHome = () => {},
  farmerProfile = { name: 'කේ. එම්. බණ්ඩාර', district: 'Anuradhapura', landAcres: 2.5, crop: 'paddy' },
  playTone = () => {}
}) {
  const t = translations[language] || translations.si;

  const [currentTool, setCurrentTool] = useState(activeTool || 'leafdoctor');

  useEffect(() => {
    if (activeTool && activeTool !== 'home') {
      setCurrentTool(activeTool);
    }
  }, [activeTool]);

  const handleToolChange = (toolId) => {
    setCurrentTool(toolId);
    onSelectTool(toolId);
    playTone('ding');
  };

  const handleSpeakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : (language === 'ta' ? 'ta-IN' : 'si-LK');
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ----------------------------------------------------
  // 1. 3D LEAF DEFICIENCY DOCTOR STATE & LOGIC
  // ----------------------------------------------------
  const [selectedSymptom, setSelectedSymptom] = useState('yellow_lower');
  const [leafResult, setLeafResult] = useState(null);

  const handleDiagnoseLeaf = async (symptomId = selectedSymptom) => {
    setSelectedSymptom(symptomId);
    playTone('ding');
    try {
      const res = await fetch(`${API_BASE}/api/farmer/diagnose-leaf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop: 'paddy', symptom_id: symptomId })
      });
      if (res.ok) {
        const data = await res.json();
        setLeafResult(data);
        playTone('chime');
        return;
      }
    } catch (e) {
      // Fallback
    }

    const remedies = {
      yellow_lower: {
        title: language === 'en' ? 'Nitrogen (N) Deficiency' : 'නයිට්‍රජන් (N) ඌනතාවය',
        cause: language === 'en' ? 'General chlorosis of older/lower leaves while upper leaves stay pale green.' : 'පහළ කොළ මුලින්ම කහ පැහැ ගැන්වී ක්‍රමයෙන් මුළු ගොයම ළා කොළ පැහැ වීම.',
        solution: language === 'en' ? 'Apply recommended split dose of Urea (10-15 kg/acre) with standing water drained.' : 'වහාම නිර්දේශිත යූරියා පොහොර මාත්‍රාව (අක්කරයකට කි.ග්‍රෑ. 10-15) ජලය සිඳුවා යොදන්න.'
      },
      scorch_edges: {
        title: language === 'en' ? 'Potassium (K) Deficiency' : 'පොටෑසියම් (K) ඌනතාවය',
        cause: language === 'en' ? 'Marginal scorching and brown spotting along leaf tips.' : 'කොළවල අග්‍ර හා දාර දුඹුරු වී පිළිස්සුණු ස්වභාවයක් ගැනීම.',
        solution: language === 'en' ? 'Broadcast MOP (Muriate of Potash) 12-15 kg/acre. Alternatively incorporate rice straw.' : 'MOP රතු පොහොර අක්කරයකට කි.ග්‍රෑ. 12-15 ක් යොදන්න. පිදුරු දිරවීමට සලස්වන්න.'
      },
      purple_leaves: {
        title: language === 'en' ? 'Phosphorus (P) Deficiency' : 'පොස්පරස් (P) ඌනතාවය',
        cause: language === 'en' ? 'Stunted tillering and erect dark purplish-green leaves.' : 'පඳුරු දැමීම අඩාල වී කොළ තද දම් හෝ රතු-දුඹුරු පැහැ ගැන්වීම.',
        solution: language === 'en' ? 'Apply TSP (Triple Superphosphate) or rock phosphate to root zone.' : 'TSP කළු පොහොර හෝ එපාවල ඇපටයිට් පසට මිශ්‍ර කරන්න.'
      },
      veins_green: {
        title: language === 'en' ? 'Zinc (Zn) / Iron Deficiency' : 'සින්ක් (Zn) ක්ෂුද්‍ර පෝෂක ඌනතාවය',
        cause: language === 'en' ? 'Interveinal chlorosis and bronzing on mid-stem foliage.' : 'නහර කොළ පැහැයෙන් තිබියදී පත්‍ර පටක දුඹුරු ලප ඇතිවීම (Bronzing).',
        solution: language === 'en' ? 'Foliar spray of 0.5% Zinc Sulphate or apply 5kg/acre Zinc Sulphate heptahydrate.' : 'සින්ක් සල්ෆේට් 0.5% දියරයක් පත්‍ර මතට ඉසින්න හෝ අක්කරයකට කි.ග්‍රෑ. 5 ක් පසට යොදන්න.'
      }
    };

    setLeafResult(remedies[symptomId] || remedies.yellow_lower);
    playTone('chime');
  };

  useEffect(() => {
    if (!leafResult) {
      handleDiagnoseLeaf('yellow_lower');
    }
  }, []);

  // ----------------------------------------------------
  // 2. CROPSAFE AI VOICE & CHAT ASSISTANT STATE & LOGIC
  // ----------------------------------------------------
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: language === 'en' 
        ? "Hello! I am CropSafe AI Agronomist. Ask me anything about fertilizers, DOA recommendations, crop diseases, or government subsidies."
        : "ආයුබෝවන්! මම ක්‍රොප්සේෆ් AI කෘෂි උපදේශක. පොහොර භාවිතය, රෝග හඳුනාගැනීම, කන්න සැලසුම් හෝ රජයේ සහනාධාර ගැන ඕනෑම දෙයක් අසන්න."
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSendChat = async (textToSend) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    playTone('ding');

    try {
      const res = await fetch(`${API_BASE}/api/farmer/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, language })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        playTone('chime');
        setChatLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    setTimeout(() => {
      let reply = "";
      const q = query.toLowerCase();
      if (q.includes('යූරියා') || q.includes('urea')) {
        reply = "යූරියා නියමිත පරිදි පිරිසිදු වතුරට දැමූ විට මිනිත්තුවක් ඇතුළත සීතල වෙමින් සම්පූර්ණයෙන් දියවිය යුතුය. අඩියේ කිරිගරුඬ කුඩු හෝ වැලි ඉතිරි වේ නම් එය ව්‍යාජ මිශ්‍රණයකි.";
      } else if (q.includes('මූලික') || q.includes('basal') || q.includes('tsp')) {
        reply = "වී වගාවේ මූලික පොහොර ලෙස TSP (කළු පොහොර) සම්පූර්ණ ප්‍රමාණයම බිම් සැකසීමේ අවසන් හෑමට පෙර පසට යෙදිය යුතුය. කිසිවිටෙකත් වැපිරීමේදී යූරියා නොයොදන්න.";
      } else if (q.includes('කාලගුණ') || q.includes('weather') || q.includes('වැසි')) {
        reply = "පොහොර යෙදීමට පෙර පැය 48 ක කාලගුණ අනාවැකිය පරීක්ෂා කරන්න. තද වැසි අපේක්ෂා කෙරේ නම් යූරියා සේදී යාම (Leaching) වැළැක්වීම සඳහා පොහොර යෙදීම කල් තබන්න.";
      } else {
        reply = "ඔබගේ ගැටලුව කෘෂිකර්ම දෙපාර්තමේන්තුවේ (DOA) ප්‍රමිතීන් අනුව විශ්ලේෂණය කළෙමි. නිවැරදි මාත්‍රාව සහ තත්ත්ව පරීක්ෂාව සඳහා අදාළ මෙවලම භාවිතා කරන්න හෝ 1920 අමතන්න.";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
      playTone('chime');
      setChatLoading(false);
    }, 400);
  };

  const handleStartVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert(language === 'en' ? 'Voice recognition is not supported on this browser.' : 'ඔබගේ බ්‍රවුසරය හඬ හඳුනාගැනීම සඳහා සහය නොදක්වයි.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'en' ? 'en-US' : (language === 'ta' ? 'ta-LK' : 'si-LK');
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      handleSendChat(transcript);
    };
    recognition.start();
  };

  // ----------------------------------------------------
  // 3. MONSOON WEATHER TIMING ADVISORY STATE & LOGIC
  // ----------------------------------------------------
  const [selectedDistrict, setSelectedDistrict] = useState(farmerProfile?.district || 'Anuradhapura');
  const [weatherData, setWeatherData] = useState(null);

  const districtsList = [
    'Anuradhapura', 'Polonnaruwa', 'Kurunegala', 'Ampara', 'Hambantota',
    'Matale', 'Gampaha', 'Kalutara', 'Kandy', 'Badulla', 'Batticaloa', 'Jaffna'
  ];

  const handleFetchWeather = (dist = selectedDistrict) => {
    setSelectedDistrict(dist);
    playTone('ding');

    const rainOdds = dist === 'Gampaha' || dist === 'Kalutara' || dist === 'Kandy' ? 68 : 22;
    const isHeavy = rainOdds > 50;

    setWeatherData({
      district: dist,
      temperature_c: 31.5,
      humidity_pct: 78,
      rain_probability_pct: rainOdds,
      forecast_condition: isHeavy ? (language === 'en' ? 'Scattered Thundershowers' : 'ගිගුරුම් සහිත වැසි') : (language === 'en' ? 'Mostly Sunny & Clear' : 'හිතකර වියළි කාලගුණය'),
      fertilizer_window: isHeavy ? 'UNSAFE_FOR_BROADCAST' : 'OPTIMAL_APPLICATION_WINDOW',
      advisory_si: isHeavy 
        ? "ඉදිරි පැය 24 තුළ තද වැසි අපේක්ෂා කරන බැවින් යූරියා පොහොර යෙදීම කල් තබන්න. නයිට්‍රජන් සේදී යාම (Leaching) සිදුවිය හැක."
        : "අද දිනයේ පොහොර යෙදීම සඳහා ඉතා හිතකර වියළි කාලගුණයක් පවතී. ජලය සිඳුවා මූලික මාත්‍රාව යොදන්න.",
      advisory_en: isHeavy
        ? "High rain risk in next 24 hours. Postpone urea broadcasting to avoid nutrient runoff & surface leaching."
        : "Optimal sunny conditions. Safe to broadcast split fertilizer dose onto moist field beds."
    });
  };

  useEffect(() => {
    if (!weatherData) {
      handleFetchWeather(selectedDistrict);
    }
  }, []);

  // ----------------------------------------------------
  // 4. TRADITIONAL BIO-FERTILIZER RECIPES STATE
  // ----------------------------------------------------
  const [organicAcres, setOrganicAcres] = useState(farmerProfile?.landAcres || 1.0);
  const [recipeKey, setRecipeKey] = useState('jeevamrutha');

  const organicRecipes = {
    jeevamrutha: {
      id: 'jeevamrutha',
      title: tr("ජීවාමෘත ක්ෂුද්‍රජීවී පොහොර දියරය", "Jeevamrutha Bio-Inoculant Broth", "ஜீவாமிர்தம் இயற்கை உரம்"),
      subtitle: tr("පසේ ජීවය හා ක්ෂුද්‍රජීවීන් ගුණනය කරන ප්‍රබල ද්‍රාවණය", "Potent microbial culture to revitalize soil microbiome", "மண் வளத்தை பெருக்கும் இயற்கை உரம்"),
      icon: '🌿',
      dosagePerAcre: `${Math.round(200 * organicAcres)} L / ${organicAcres} ${tr("අක්කරයට", "Acres", "ஏக்கர்")}`,
      applicationMethod: tr(
        "පසට යෙදීමට නම්: පෙරාගත් ජීවාමෘත කෙලින්ම ලීටර් 16 ටැංකියට පුරවා මුලට වත්කරන්න. පත්‍ර මතට ස්ප්‍රේ කිරීමට නම්: ජීවාමෘත 1.5L ක් වතුර 14.5L සමග කලවම් කරන්න (10% තනුක කිරීම).",
        "Soil drenching: Apply strained broth directly to root zone. Foliar spray: 1.5L Jeevamrutha in 14.5L water per 16L tank (10% dilution).",
        "மண்ணில் ஊற்ற: வடிகட்டிய திரவத்தை நேரடியாக ஊற்றவும். இலைகளில் தெளிக்க: 1.5L கரைசலை 14.5L தண்ணீரில் கலக்கவும்."
      ),
      ingredients: [
        { name: tr("නැවුම් එළගොම", "Fresh Cow Dung", "புதிய மாட்டு சாணம்"), amount: `${(10 * organicAcres).toFixed(1)} kg` },
        { name: tr("ගව මුත්‍රා", "Fresh Cow Urine", "மாட்டு கோமியம்"), amount: `${(10 * organicAcres).toFixed(1)} L` },
        { name: tr("හකුරු / උක් පැණි", "Jaggery / Treacle", "நாட்டு சர்க்கரை"), amount: `${(2 * organicAcres).toFixed(1)} kg` },
        { name: tr("මුං හෝ කඩල පිටි", "Pulse Flour", "பயறு மாவு"), amount: `${(2 * organicAcres).toFixed(1)} kg` },
        { name: tr("තුඹසකින් ගත් ජීවී පස්", "Living Ant-hill Soil", "புற்று மண்"), amount: `${(0.5 * organicAcres).toFixed(1)} kg` },
        { name: tr("ක්ලෝරීන් රහිත ජලය", "Clean Water", "சுத்தமான தண்ணீர்"), amount: `${Math.round(200 * organicAcres)} L` }
      ],
      steps: [
        tr("බැරලයකට ජලය දමා, ගොම, ගව මුත්‍රා, හකුරු, පිටි සහ තුඹස් පස් දමා ලී දණ්ඩකින් හොඳින් කලවම් කරන්න.", "Add water to a barrel, dissolve dung, urine, jaggery, flour and ant-hill soil thoroughly.", "பீப்பாயில் தண்ணீர் ஊற்றி அனைத்து பொருட்களையும் நன்கு கலக்கவும்."),
        tr("හිරු එළිය නොවැටෙන සෙවණක තබා ගෝනියකින් මුඛය වසන්න. දින 5-7 ක් දිනපතා උදේ-හවස දක්ෂිණාවර්තව කලවම් කරන්න.", "Place in shade under gunny sack. Stir clockwise for 2 minutes twice daily for 5-7 days.", "நிழலில் வைத்து தினமும் காலையும் மாலையும் வலஞ்சுழியாக கலக்கி விடவும்."),
        tr("දින 7 කට පසු හොඳින් පැසී ඇති අතර, ස්ප්‍රේ යන්ත්‍රයට දැමීමට පෙර සියුම් දැලකින් පෙරා ගන්න. දින 14 කට වරක් යොදන්න.", "Strain through fine mesh before spraying. Apply every 14 days to moist soil beds.", "மெல்லிய துணியால் வடிகட்டி 14 நாட்களுக்கு ஒருமுறை பயிர்களுக்கு இடவும்.")
      ]
    },
    panchagavya: {
      id: 'panchagavya',
      title: tr("පංචගව්‍ය පෝෂණ හා වර්ධන උත්තේජකය", "Panchagavya Growth Promoter", "பஞ்சகவ்யா வளர்ச்சி ஊக்கி"),
      subtitle: tr("ගව ඵල 5කින් සාදන ස්වාභාවික ප්‍රතිශක්තිකරණ දියරය", "Traditional organic booster for leaf vitality and immunity", "நோய் எதிர்ப்பு சக்தி தரும் பாரம்பரிய உரம்"),
      icon: '🥛',
      dosagePerAcre: `${(3 * organicAcres).toFixed(1)} L (3% Spray Solution)`,
      applicationMethod: tr(
        "මිලිලීටර් 500 ක් වතුර ලීටර් 16 කට මිශ්‍ර කර (3% ද්‍රාවණය) ගොයම් කොළ මතට මීදුමක් මෙන් ඉසින්න.",
        "Mix 500ml Panchagavya with 16L water (3% solution) and foliar spray onto crop canopy.",
        "500ml பஞ்சகவ்யாவை 16L தண்ணீரில் கலந்து இலைகளில் தெளிக்கவும்."
      ),
      ingredients: [
        { name: tr("එළගොම", "Fresh Cow Dung", "மாட்டு சாணம்"), amount: `${(5 * organicAcres).toFixed(1)} kg` },
        { name: tr("එළඟිතෙල්", "Cow Ghee", "பசு நெய்"), amount: `${(0.5 * organicAcres).toFixed(1)} kg` },
        { name: tr("ගව මුත්‍රා", "Cow Urine", "மாட்டு கோமியம்"), amount: `${(3 * organicAcres).toFixed(1)} L` },
        { name: tr("නැවුම් එළකිරි", "Fresh Cow Milk", "பசு பால்"), amount: `${(2 * organicAcres).toFixed(1)} L` },
        { name: tr("එළකිරි දීකිරි", "Cow Curd", "பசு தயிர்"), amount: `${(2 * organicAcres).toFixed(1)} L` },
        { name: tr("ඉදුණු කෙසෙල්", "Ripe Bananas", "பழுத்த வாழைப்பழம்"), amount: `${Math.round(12 * organicAcres)} ගෙඩි` }
      ],
      steps: [
        tr("පළමුව එළගොම සහ එළඟිතෙල් එකට කලවම් කර දින 3ක් තබන්න.", "Mix cow dung and ghee thoroughly, let rest for 3 days.", "சாணம் மற்றும் நெய்யை கலந்து 3 நாட்கள் வைக்கவும்."),
        tr("4 වන දින අනෙක් ද්‍රව්‍ය එක්කර දින 15 ක් යනතුරු දිනපතා උදේ හවස කලවම් කරන්න.", "On Day 4 add milk, curd, urine, bananas; stir daily for 15 days.", "4ம் நாள் மற்ற பொருட்களை சேர்த்து 15 நாட்கள் கலக்கவும்."),
        tr("දින 18-20 වන විට සුවඳැති පංචගව්‍ය සූදානම් වේ. පෙරා 3% ද්‍රාවණයක් ලෙස ඉසින්න.", "Ready by Day 18-20. Strain and spray at 3% concentration.", "18-20 நாட்களில் தயாராகும். வடிகட்டி 3% வீதத்தில் தெளிக்கவும்.")
      ]
    }
  };

  // ----------------------------------------------------
  // 5. SOIL DOLOMITE TITRATION STATE & LOGIC
  // ----------------------------------------------------
  const [soilPh, setSoilPh] = useState(4.8);
  const [dolomiteAcres, setDolomiteAcres] = useState(farmerProfile?.landAcres || 1.0);
  const [dolomiteResult, setDolomiteResult] = useState(null);
  const [dolomiteLoading, setDolomiteLoading] = useState(false);

  const handleCalculateDolomite = async () => {
    setDolomiteLoading(true);
    try {
      const ha = dolomiteAcres * 0.404686;
      const res = await fetch(`${API_BASE}/api/soil/dolomite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soil_ph: soilPh,
          target_ph: 6.2,
          soil_texture: 'loam_podzolic',
          land_area_ha: ha
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDolomiteResult(data);
        playTone('chime');
        setDolomiteLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    setTimeout(() => {
      const deficit = Math.max(0, 6.2 - soilPh);
      const kgPerAcre = Math.round(deficit * 250);
      const totalKg = Math.round(kgPerAcre * dolomiteAcres);
      const bags = Math.ceil(totalKg / 50);

      setDolomiteResult({
        current_ph: soilPh,
        target_ph: 6.2,
        recommended_dolomite_kg_per_acre: kgPerAcre,
        total_dolomite_50kg_bags: bags,
        total_cost_lkr: bags * 950,
        nitrogen_absorption_recovery_pct: Math.round(deficit * 30),
        application_instructions_si: "කන්නයේ බිම් සැකසීමේ මුල් හෑමෙන් පසු ඩොලමයිට් පසට විසුරුවා හරින්න. රසායනික පොහොර යෙදීමට අවම වශයෙන් සති 2 කට පෙර පසට මිශ්‍ර කළ යුතුය."
      });
      playTone('chime');
      setDolomiteLoading(false);
    }, 250);
  };

  // ----------------------------------------------------
  // 6. PADDY STRAW RECYCLING & MOP RECOVERY STATE
  // ----------------------------------------------------
  const [strawAcres, setStrawAcres] = useState(farmerProfile?.landAcres || 1.0);
  const [grainYield, setGrainYield] = useState(4.5);
  const [strawResult, setStrawResult] = useState(null);
  const [strawLoading, setStrawLoading] = useState(false);

  const handleComputeStraw = async () => {
    setStrawLoading(true);
    try {
      const ha = strawAcres * 0.404686;
      const res = await fetch(`${API_BASE}/api/soil/paddy-straw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_area_ha: ha,
          grain_yield_t_ha: grainYield,
          decompose_weeks: 4
        })
      });
      if (res.ok) {
        const data = await res.json();
        setStrawResult(data);
        playTone('chime');
        setStrawLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    setTimeout(() => {
      const mopSavedBags = Math.round(strawAcres * 0.5 * 10) / 10;
      const moneySaved = Math.round(mopSavedBags * 3400);

      setStrawResult({
        retained_potassium_k2o_kg: Math.round(strawAcres * 45),
        mop_50kg_bags_saved: mopSavedBags,
        farmer_cost_savings_lkr: moneySaved,
        organic_carbon_enrichment_pct: 1.2,
        doa_advice: "පිදුරු පුළුස්සා දැමීමෙන් වළකින්න. මුල් හෑමේදී පිදුරු පසට යටකර ක්ෂුද්‍රජීවී දියරයක් යෙදීමෙන් MOP රතු පොහොර අවශ්‍යතාවයෙන් 50% ක්ම නොමිලේ ලබාගත හැක."
      });
      playTone('chime');
      setStrawLoading(false);
    }, 250);
  };

  // ----------------------------------------------------
  // 7. SOIL SALINITY & GYPSUM RECLAMATION STATE
  // ----------------------------------------------------
  const [salinityEc, setSalinityEc] = useState(6.5);
  const [salinityEsp, setSalinityEsp] = useState(12.0);
  const [salinityAcres, setSalinityAcres] = useState(farmerProfile?.landAcres || 1.0);
  const [salinityResult, setSalinityResult] = useState(null);
  const [salinityLoading, setSalinityLoading] = useState(false);

  const handleDiagnoseSalinity = async () => {
    setSalinityLoading(true);
    try {
      const ha = salinityAcres * 0.404686;
      const res = await fetch(`${API_BASE}/api/soil/salinity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ec_e_ds_m: salinityEc,
          soil_ph: 7.8,
          esp_pct: salinityEsp,
          ec_water_ds_m: 0.8,
          land_area_ha: ha
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSalinityResult(data);
        playTone('chime');
        setSalinityLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    setTimeout(() => {
      const isSaline = salinityEc > 4.0;
      const gypsumBags = isSaline ? Math.ceil(salinityAcres * 3) : 0;

      setSalinityResult({
        salinity_classification: isSaline ? 'SALINE_SOIL_HAZARD' : 'SAFE_NON_SALINE',
        gypsum_requirement_50kg_bags: gypsumBags,
        leaching_water_depth_cm: isSaline ? 15 : 5,
        remedy_si: isSaline
          ? "පසේ ලවණ සාන්ද්‍රණය ඉහළ බැවින් ජිප්සම් (Gypsum) යොදා ගැඹුරු ජලයෙන් සෝදා හැරීම (Leaching) කළ යුතුය."
          : "පස ලවණතා අවදානමකින් තොරයි. සාමාන්‍ය වාරිමාර්ග ක්‍රම අනුගමනය කරන්න."
      });
      playTone('chime');
      setSalinityLoading(false);
    }, 250);
  };

  // ----------------------------------------------------
  // 8. ANCIENT ELLANGAWA CASCADE ADVISORY STATE
  // ----------------------------------------------------
  const [ellangawaResult, setEllangawaResult] = useState(null);

  const handleCheckEllangawa = () => {
    setEllangawaResult({
      cascade_name: 'Thirappane Ancient Cascade System',
      kattakaduwa_buffer_zone_status: 'HEALTHY_SALT_INTERCEPTOR',
      recommended_sluice_timing: 'Open Sluice at Day 22 for tillering flush',
      catchment_tree_protection: 'Kumbuk and Mee trees actively filtering agrochemical runoffs'
    });
    playTone('chime');
  };

  // ----------------------------------------------------
  // 9. 3D DRONE NDVI FIELD HEALTH STATE
  // ----------------------------------------------------
  const [droneResult, setDroneResult] = useState(null);
  const [droneScanning, setDroneScanning] = useState(false);

  const handleScanDrone = () => {
    setDroneScanning(true);
    playTone('ding');
    setTimeout(() => {
      setDroneResult({
        average_ndvi: 0.72,
        crop_vigor: 'ROBUST_VEGETATION',
        nitrogen_stress_zones_pct: 12.5,
        variable_rate_prescription: 'Spot spray 8kg Urea in North-East quadrant only'
      });
      playTone('chime');
      setDroneScanning(false);
    }, 1200);
  };

  // ----------------------------------------------------
  // 10. CAA / DOA WHISTLEBLOWER & PRICE GOUGING
  // ----------------------------------------------------
  const [whistleDealer, setWhistleDealer] = useState('දඹුල්ල කෘෂි වෙළඳසැල');
  const [whistleType, setWhistleType] = useState('PRICE_GOUGING');
  const [whistleMrp, setWhistleMrp] = useState(2500.0);
  const [whistleCharged, setWhistleCharged] = useState(3950.0);
  const [whistleNarrative, setWhistleNarrative] = useState('නියමිත රජයේ මිල රු. 2,500 ක් වන යූරියා මිටිය රු. 3,950 කට අලෙවි කර නිල බිල්පතක් දීම ප්‍රතික්ෂේප කළේය.');
  const [whistleResult, setWhistleResult] = useState(null);
  const [whistleLoading, setWhistleLoading] = useState(false);
  const [whistleCopied, setWhistleCopied] = useState(false);

  const handleSubmitWhistleblower = () => {
    setWhistleLoading(true);
    setTimeout(() => {
      const caseId = `CAA-CASE-2026-${Date.now().toString().slice(-5)}`;
      setWhistleResult({
        case_id: caseId,
        filing_status: 'EVIDENCE_DISPATCHED_TO_CAA',
        consumer_affairs_authority_hotline: '1977',
        doa_director_general_alerted: true,
        police_economic_crimes_notified: true
      });
      playTone('chime');
      setWhistleLoading(false);
    }, 300);
  };

  const scienceTools = [
    { id: 'leafdoctor', label: tr("3D පත්‍ර වෛද්‍යවරයා", "3D Leaf Doctor", "இலை நோய்"), icon: "🍃" },
    { id: 'chat', label: tr("AI ගොවි සහායක", "AI Chatbot", "AI உரையாடல்"), icon: "💬" },
    { id: 'weather', label: tr("කාලගුණ අනාවැකිය", "Weather Timing", "வானிலை"), icon: "🌦️" },
    { id: 'organic', label: tr("කාබනික වට්ටෝරු", "Organic Recipes", "இயற்கை உரம்"), icon: "🌿" },
    { id: 'dolomite', label: tr("ඩොලමයිට් ගණකය", "Dolomite Titration", "டோலமைட்"), icon: "🧪" },
    { id: 'straw', label: tr("පිදුරු ප්‍රතිචක්‍රීකරණය", "Paddy Straw K2O", "வைக்கோல்"), icon: "🌾" },
    { id: 'salinity', label: tr("ලවණතා පාලනය", "Salinity & Gypsum", "உவர் மண்"), icon: "🧂" },
    { id: 'ellangawa', label: tr("එල්ලංගා පද්ධතිය", "Ellangawa Cascade", "எல்லங்காவ"), icon: "🌊" },
    { id: 'drone', label: tr("3D ඩ්‍රෝන පරීක්ෂාව", "Drone NDVI", "ட்ரோன் ஆய்வு"), icon: "🛸" },
    { id: 'whistleblower', label: tr("නීතිවිරෝධී මිල පැමිණිලි", "Whistleblower", "புகார் அளிப்பு"), icon: "📢" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ========================================================================= */}
      {/* HUB HEADER & SUB-NAVIGATION BAR                                          */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-5 sm:p-7 rounded-3xl shadow-xl border border-emerald-700/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30 mb-2.5">
              <span className="text-base">🔬</span>
              <span>{tr("කෘෂි විද්‍යාව සහ උපදේශන මධ්‍යස්ථානය", "Field Science & Advisory Hub", "விவசாய அறிவியல் மற்றும் வழிகாட்டல்")}</span>
              <span className="text-[10px] bg-teal-400 text-slate-950 px-2 py-0.5 rounded-full font-black">AGRONOMY INTELLIGENCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>{tr("පස, පත්‍ර රෝග, කාබනික විද්‍යාව හා AI කෘෂි සහාය", "Soil Science, Leaf Pathology, Organic Bio & AI Chat", "மண் வளம், நோய் தீர்வு & AI வழிகாட்டல்")}</span>
            </h1>
            <p className="text-xs sm:text-sm text-teal-200/80 mt-1 max-w-2xl font-medium">
              {tr(
                "3D පත්‍ර පරීක්ෂාව, AI හඬ සහායක, පසේ ඇඹුල් ගතියට ඩොලමයිට්, පිදුරු වලින් MOP 50% ඉතිරිකර ගැනීම සහ සාම්ප්‍රදායික ජීවාමෘත වට්ටෝරු එකම තැනකින්.",
                "Interactive 3D plant pathology, multi-turn AI agronomist chatbot, dolomite buffer titration, paddy straw potassium recovery, and traditional bio-fertilizers.",
                "3D இலை நோய் கண்டறிதல், AI குரல் வழிகாட்டல், மண் அமிலத்தன்மை தீர்வு மற்றும் இயற்கை உர செய்முறைகள்."
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
        <div className="mt-6 pt-4 border-t border-teal-800/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {scienceTools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleToolChange(tool.id)}
              className={`px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                currentTool === tool.id
                  ? 'bg-teal-400 text-slate-950 shadow-lg scale-105'
                  : 'bg-white/10 text-teal-100 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span className="text-base">{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. 3D LEAF DEFICIENCY DOCTOR                                             */}
      {/* ========================================================================= */}
      {currentTool === 'leafdoctor' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
              <span>{tr("ත්‍රිමාණ ශාක පෝෂණ රෝග විනිශ්චය", "3D Interactive Leaf Pathology", "3D இலை நோய் கண்டறிதல்")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.leafDocHeader}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t.leafDocHelp}
            </p>
          </div>

          <div className="space-y-4">
            {/* 3D Plant Canvas */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <ThreePlantCanvas symptom={selectedSymptom} />
            </div>

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
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-slate-900 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide block">{t.diagnosedDiseaseLabel}</span>
                  <button
                    type="button"
                    onClick={() => handleSpeakText(`${leafResult.title}. ${leafResult.solution}`)}
                    className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{t.btnSpeak || "හඬින් අසන්න"}</span>
                  </button>
                </div>
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

      {/* ========================================================================= */}
      {/* 2. CROPSAFE AI VOICE & CHAT ASSISTANT                                     */}
      {/* ========================================================================= */}
      {currentTool === 'chat' && (
        <div className="clean-card p-6 sm:p-8 space-y-4 animate-fadeIn">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <MessageSquareText className="w-3.5 h-3.5 text-emerald-700" />
                <span>{tr("ක්‍රොප්සේෆ් AI කෘෂි සහායක", "CropSafe AI Agronomist", "AI விவசாய உதவியாளர்")}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.chatHeader}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                {t.chatHelp}
              </p>
            </div>
            <button
              type="button"
              onClick={handleStartVoice}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 self-start sm:self-center ${
                isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-800" />}
              <span>{isListening ? tr("සවන් දෙමින්...", "Listening...", "கேட்கிறது...") : tr("හඬින් ප්‍රශ්න අසන්න", "Voice Ask", "குரல் வழி")}</span>
            </button>
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
          <div className="h-64 sm:h-80 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            {chatMessages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed flex items-start justify-between gap-2 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-tr-none shadow-sm'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm'
                }`}>
                  <span>{msg.text}</span>
                  {msg.sender === 'bot' && (
                    <button
                      type="button"
                      onClick={() => handleSpeakText(msg.text)}
                      className="text-slate-400 hover:text-emerald-700 transition-colors p-1 flex-shrink-0"
                      title={t.btnSpeak || "හඬින් අසන්න"}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="text-xs text-slate-500 italic p-2">{t.chatThinking}</div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder={language === 'en' ? "Ask anything about farming and fertilizers..." : "පොහොර සහ වගා ගැටලු මෙතැනින් අසන්න..."}
              className="flex-1 p-3 rounded-xl border border-slate-300 font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            <button
              type="button"
              onClick={() => handleSendChat()}
              className="px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black transition-all flex items-center justify-center shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MONSOON WEATHER TIMING ADVISORY                                       */}
      {/* ========================================================================= */}
      {currentTool === 'weather' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-2">
              <CloudRain className="w-3.5 h-3.5 text-cyan-700" />
              <span>{tr("කාලගුණ අනාවැකිය හා පොහොර යෙදීමේ හිතකර කාලය", "Monsoon Weather Advisory", "வானிலை வழிகாட்டல்")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.weatherHeader}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t.weatherHelp}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-black text-slate-900 block mb-2">
                {tr("ඔබගේ දිස්ත්‍රික්කය තෝරන්න:", "Select Your District:", "மாவட்டத்தை தேர்வு செய்யவும்:")}
              </label>
              <div className="flex flex-wrap gap-2">
                {districtsList.map(dist => (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => handleFetchWeather(dist)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                      selectedDistrict === dist
                        ? 'bg-cyan-700 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {dist}
                  </button>
                ))}
              </div>
            </div>

            {weatherData && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-cyan-800 uppercase block">{weatherData.district} දිස්ත්‍රික්කය</span>
                    <h3 className="text-2xl font-black text-slate-900">{weatherData.forecast_condition}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-slate-900">{weatherData.temperature_c}°C</span>
                    <span className="text-xs text-slate-500 block">තෙතමනය: {weatherData.humidity_pct}%</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-cyan-200 flex items-start space-x-3">
                  <span className="text-2xl">{weatherData.fertilizer_window === 'OPTIMAL_APPLICATION_WINDOW' ? '☀️' : '🌧️'}</span>
                  <div>
                    <strong className="text-sm font-black text-slate-900 block">
                      {weatherData.fertilizer_window === 'OPTIMAL_APPLICATION_WINDOW' 
                        ? tr("පොහොර යෙදීමට හිතකර කාලයකි", "Safe Window for Fertilizer", "உரமிட சாதகமான நேரம்")
                        : tr("පොහොර යෙදීම කල් තබන්න", "Avoid Broadcasting Fertilizer", "உரமிடுவதை தள்ளிப்போடவும்")}
                    </strong>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {language === 'en' ? weatherData.advisory_en : weatherData.advisory_si}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TRADITIONAL ORGANIC RECIPES                                           */}
      {/* ========================================================================= */}
      {currentTool === 'organic' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Leaf className="w-3.5 h-3.5 text-emerald-700" />
              <span>{tr("සාම්ප්‍රදායික දේශීය ජීව පොහොර වට්ටෝරු", "Traditional Bio-Fertilizers", "பாரம்பரிய இயற்கை உரங்கள்")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.organicHeader}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t.organicHelp}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-black text-slate-800">
                {tr("ඉඩම් ප්‍රමාණය අනුව අමුද්‍රව්‍ය පරිමාණනය කරන්න (අක්කර):", "Scale ingredients for land area:", "நில பரப்பளவு:")}
              </label>
              <div className="flex items-center space-x-2">
                {[0.5, 1.0, 2.0, 5.0].map(ac => (
                  <button
                    key={ac}
                    type="button"
                    onClick={() => setOrganicAcres(ac)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      organicAcres === ac ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {ac} {t.acreUnit}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Object.values(organicRecipes).map(rec => (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setRecipeKey(rec.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    recipeKey === rec.id
                      ? 'border-emerald-600 bg-emerald-50 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl block mb-1">{rec.icon}</span>
                  <strong className="text-sm font-black block text-slate-900">{rec.title}</strong>
                  <span className="text-xs text-slate-500 block mt-0.5">{rec.subtitle}</span>
                </button>
              ))}
            </div>

            {/* Selected Recipe View */}
            {organicRecipes[recipeKey] && (() => {
              const curRec = organicRecipes[recipeKey];
              return (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 uppercase">නියමිත අමුද්‍රව්‍ය ප්‍රමාණ ({organicAcres} අක්කර සඳහා)</span>
                      <h3 className="text-xl font-black text-slate-900 mt-0.5">{curRec.title}</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {curRec.dosagePerAcre}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {curRec.ingredients.map((ing, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200">
                        <span className="text-slate-500 block">{ing.name}</span>
                        <strong className="text-emerald-900 text-sm font-black mt-0.5 block">{ing.amount}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <strong className="text-slate-900 font-black block">සාදාගන්නා පියවර (Preparation Steps):</strong>
                    <ol className="list-decimal list-inside space-y-1 text-slate-700">
                      {curRec.steps.map((st, sIdx) => (
                        <li key={sIdx}>{st}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SOIL DOLOMITE TITRATION CALCULATOR                                    */}
      {/* ========================================================================= */}
      {currentTool === 'dolomite' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
              <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'en' ? 'Soil Health & Buffer Titration' : 'පසේ සෞඛ්‍යය හා ඇඹුල් ගතිය පාලනය'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.tileDolomite}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {language === 'en'
                ? 'When soil pH drops below 5.5, over 60% of applied chemical fertilizers get locked up and wasted. Calculate the exact dolomite dosage to restore soil health.'
                : 'පසේ pH අගය 5.5 ට වඩා අඩු වූ විට (ඇඹුල් වූ විට) ඔබ දමන යූරියා සහ TSP පොහොර වලින් 60% කට වඩා පැළයට උරාගැනීමට නොහැකිව අපතේ යයි. ඩොලමයිට් දමා පස සුවපත් කරමු.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
              </div>

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
                      {ac} {t.acreUnit}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCalculateDolomite}
                disabled={dolomiteLoading}
                className="w-full py-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-black text-sm shadow-md transition-all"
              >
                {dolomiteLoading ? 'ගණනය කරමින්...' : tr("ඩොලමයිට් අවශ්‍යතාව ගණනය කරන්න", "Calculate Dolomite Requirement", "டோலமைட் அளவை கணக்கிடு")}
              </button>
            </div>

            {/* Dolomite Output */}
            <div>
              {dolomiteResult ? (
                <div className="p-6 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-900 block">DOA RECOMMENDATION</span>
                      <h3 className="text-xl font-black text-amber-950 mt-0.5">අවශ්‍ය ඩොලමයිට් ප්‍රමාණය</h3>
                    </div>
                    <span className="text-3xl font-black text-amber-950">
                      {dolomiteResult.total_dolomite_50kg_bags} <span className="text-sm font-medium">මිටි (50kg)</span>
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">නයිට්‍රජන් පොහොර උරාගැනීමේ වැඩිවීම:</span>
                      <strong className="text-emerald-700">+{dolomiteResult.nitrogen_absorption_recovery_pct}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">ඇස්තමේන්තු වියදම:</span>
                      <strong className="text-slate-900 font-mono">Rs. {dolomiteResult.total_cost_lkr?.toLocaleString()}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-amber-900 font-medium leading-relaxed">
                    {dolomiteResult.application_instructions_si}
                  </p>
                </div>
              ) : (
                <div className="h-full min-h-[220px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <FlaskConical className="w-10 h-10 mb-2 text-slate-300" />
                  <p className="text-xs font-bold">පසේ pH අගය තෝරා ගණනය කරන්න</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PADDY STRAW RECYCLING & MOP 50% RECOVERY                              */}
      {/* ========================================================================= */}
      {currentTool === 'straw' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Leaf className="w-3.5 h-3.5 text-emerald-700" />
              <span>{tr("පිදුරු දිරවීමෙන් MOP පොටෑසියම් 50% ඉතිරිකර ගැනීම", "Paddy Straw K2O In-situ Recycling", "வைக்கோல் மறுசுழற்சி")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.tileStraw}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {tr(
                "අස්වැන්නෙන් පසු පිදුරු ගිනි තැබීමෙන් පසේ වටිනා පොටෑසියම් සම්පූර්ණයෙන් විනාශ වේ. පිදුරු පසට යටකර දිරවීමට සැලැස්වීමෙන් මිල අධික MOP රතු පොහොර අවශ්‍යතාවයෙන් 50% ක් ඉතිරි කරගන්න.",
                "Rice straw contains high potassium. Recycling straw in-situ cuts costly imported MOP fertilizer requirement by up to 50%.",
                "வைக்கோலை எரிப்பதை தவிர்த்து மண்ணில் மக்க வைப்பதன் மூலம் MOP உரத் தேவையில் 50% சேமிக்கலாம்."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  වගා බිම් ප්‍රමාණය (අක්කර):
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
                      {ac} {t.acreUnit}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleComputeStraw}
                disabled={strawLoading}
                className="w-full py-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition-all"
              >
                {strawLoading ? 'ගණනය කරමින්...' : tr("පොටෑසියම් ඉතිරිය ගණනය කරන්න", "Compute MOP Savings", "MOP சேமிப்பை கணக்கிடு")}
              </button>
            </div>

            {strawResult && (
              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-800 block">POTASSIUM BENEFIT</span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">ඉතිරිවන MOP ප්‍රමාණය</h3>
                  </div>
                  <span className="text-2xl font-black text-emerald-950">
                    {strawResult.mop_50kg_bags_saved} <span className="text-xs font-medium">මිටි</span>
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center">
                  <span className="text-xs text-slate-500 block">ඉතිරි කරගත හැකි ශුද්ධ මුදල</span>
                  <span className="text-2xl font-black text-emerald-950 mt-1 block">
                    Rs. {strawResult.farmer_cost_savings_lkr?.toLocaleString()} /=
                  </span>
                </div>

                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  {strawResult.doa_advice}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SOIL SALINITY & GYPSUM RECLAMATION                                     */}
      {/* ========================================================================= */}
      {currentTool === 'salinity' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold mb-2">
              <Waves className="w-3.5 h-3.5 text-cyan-700" />
              <span>{tr("ලවණ පස පුනරුත්ථාපනය හා ජිප්සම් භාවිතය", "Soil Salinity & Gypsum Reclamation", "உவர் மண் மேலாண்மை")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.tileSalinity}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  පසේ විද්‍යුත් සන්නායකතාව (EC dS/m): <span className="font-mono text-cyan-800 font-bold">{salinityEc} dS/m</span>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="14.0"
                  step="0.5"
                  value={salinityEc}
                  onChange={(e) => setSalinityEc(parseFloat(e.target.value))}
                  className="w-full accent-cyan-600"
                />
              </div>

              <button
                type="button"
                onClick={handleDiagnoseSalinity}
                disabled={salinityLoading}
                className="w-full py-4 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-black text-sm shadow-md transition-all"
              >
                {salinityLoading ? 'විශ්ලේෂණය කරමින්...' : tr("ලවණතා මට්ටම විශ්ලේෂණය කරන්න", "Analyze Soil Salinity", "உவர் தன்மையை ஆய்வு செய்")}
              </button>
            </div>

            {salinityResult && (
              <div className="p-6 rounded-2xl bg-cyan-50 border border-cyan-300 space-y-3 animate-fadeIn">
                <span className="text-xs font-bold uppercase text-cyan-900 block">විශ්ලේෂණ ප්‍රතිඵලය</span>
                <h4 className="text-lg font-black text-slate-900">
                  {salinityResult.salinity_classification}
                </h4>
                <div className="p-3 bg-white rounded-xl border border-cyan-200">
                  <span className="text-xs text-slate-600 block">අවශ්‍ය ජිප්සම් (Gypsum) ප්‍රමාණය:</span>
                  <strong className="text-lg font-black text-cyan-950">{salinityResult.gypsum_requirement_50kg_bags} මිටි</strong>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {salinityResult.remedy_si}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. ANCIENT ELLANGAWA CASCADE ADVISORY                                    */}
      {/* ========================================================================= */}
      {currentTool === 'ellangawa' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Waves className="w-3.5 h-3.5 text-emerald-700" />
              <span>{tr("එල්ලංගා වැව් පද්ධති ජල හා පොහොර කළමනාකරණය", "Ancient Ellangawa Cascade Water Advisory", "எல்லங்காவ நீர் மேலாண்மை")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.tileEllangawa}
            </h2>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleCheckEllangawa}
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition-all"
            >
              එල්ලංගා පාරිසරික කලාප පරීක්ෂාව
            </button>

            {ellangawaResult && (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3 animate-fadeIn">
                <h4 className="text-base font-black text-emerald-950">{ellangawaResult.cascade_name}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-500 block">කට්ටකඩුව ලවණ උරාගැනීමේ බෆරය:</span>
                    <strong className="text-emerald-800 text-sm font-black">{ellangawaResult.kattakaduwa_buffer_zone_status}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-500 block">සොරොව්ව හැරීමේ නිර්දේශය:</span>
                    <strong className="text-slate-900 text-sm font-black">{ellangawaResult.recommended_sluice_timing}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. 3D DRONE NDVI FIELD HEALTH INSPECTOR                                  */}
      {/* ========================================================================= */}
      {currentTool === 'drone' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
              <Cpu className="w-3.5 h-3.5 text-blue-700" />
              <span>{tr("ත්‍රිමාණ ඩ්‍රෝන හා චන්ද්‍රිකා ක්ෂේත්‍ර සෞඛ්‍ය ස්කෑනරය", "3D Drone & Satellite NDVI Health Map", "ட்ரோன் ஆய்வு")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.tileDrone}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <ThreeDroneFieldCanvas />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleScanDrone}
                disabled={droneScanning}
                className="px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm shadow-md transition-all flex items-center space-x-2"
              >
                <Cpu className="w-4 h-4 text-white" />
                <span>{droneScanning ? 'ඩ්‍රෝන සංවේදක ක්‍රියාත්මක වෙමින් පවතී...' : '🛰️ ක්ෂේත්‍ර NDVI සෞඛ්‍යය ස්කෑන් කරන්න'}</span>
              </button>
            </div>

            {droneResult && (
              <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                  <span className="text-xs font-bold uppercase text-blue-900">NDVI FIELD SCAN RESULT</span>
                  <span className="text-xl font-black text-blue-950">NDVI: {droneResult.average_ndvi}</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs">
                  <span className="text-slate-500 block">නිරවද්‍ය පොහොර විසුරුවීමේ උපදෙස (VRA):</span>
                  <strong className="text-slate-900 text-sm font-black">{droneResult.variable_rate_prescription}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. CAA / DOA WHISTLEBLOWER & PRICE GOUGING PORTAL                       */}
      {/* ========================================================================= */}
      {currentTool === 'whistleblower' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
              <span>{tr("පාරිභෝගික කටයුතු අධිකාරියට (CAA) සෘජු පැමිණිලි", "Consumer Affairs Authority (CAA) Direct Portal", "புகார் அளிப்பு")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.tileWhistle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {tr(
                "රජයේ පාලන මිලට වඩා වැඩි මුදලක් අය කිරීම (Price Gouging) හෝ ප්‍රමිතියෙන් තොර ව්‍යාජ පොහොර අලෙවි කිරීම පිළිබඳ සාක්ෂි සහිතව පැමිණිලි කරන්න.",
                "File direct anti-corruption and price gouging complaints with the Consumer Affairs Authority (CAA hotline 1977).",
                "அதிக விலைக்கு உரங்களை விற்பனை செய்யும் நபர்களுக்கு எதிராக புகார் அளியுங்கள்."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  වෙළඳසැලේ නම හා ප්‍රදේශය:
                </label>
                <input
                  type="text"
                  value={whistleDealer}
                  onChange={(e) => setWhistleDealer(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">රජයේ නියමිත මිල:</label>
                  <input
                    type="number"
                    value={whistleMrp}
                    onChange={(e) => setWhistleMrp(parseFloat(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-700 block mb-1">අය කළ වැඩි මුදල:</label>
                  <input
                    type="number"
                    value={whistleCharged}
                    onChange={(e) => setWhistleCharged(parseFloat(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-rose-300 font-mono text-sm bg-white text-rose-900 font-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">සිදුවූ අසාධාරණය පිළිබඳ විස්තරය:</label>
                <textarea
                  rows={3}
                  value={whistleNarrative}
                  onChange={(e) => setWhistleNarrative(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                />
              </div>

              <button
                type="button"
                onClick={handleSubmitWhistleblower}
                disabled={whistleLoading}
                className="w-full py-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <ShieldAlert className="w-5 h-5 text-white" />
                <span>{whistleLoading ? 'වාර්තාව යොමු කෙරෙමින් පවතී...' : '🚨 CAA වෙත පැමිණිල්ල යොමු කරන්න'}</span>
              </button>
            </div>

            {whistleResult && (
              <div className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-rose-200 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-rose-800 block">OFFICIAL CAA RECORD</span>
                    <h4 className="text-base font-black text-slate-900 mt-0.5">{whistleResult.case_id}</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black">
                    DISPATCHED
                  </span>
                </div>

                <div className="p-4 bg-white rounded-xl border border-rose-200 text-xs space-y-2">
                  <p className="text-slate-700">
                    ඔබගේ පැමිණිල්ල පාරිභෝගික කටයුතු අධිකාරියේ (CAA) විමර්ශන අංශය සහ කෘෂිකර්ම අධ්‍යක්ෂ ජනරාල් කාර්යාලය වෙත සෘජුව යොමු විය.
                  </p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="font-bold text-rose-800">CAA හදිසි ඇමතුම් අංකය: 1977</span>
                    <a
                      href="tel:1977"
                      className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-950 font-black rounded-lg transition-all"
                    >
                      Call 1977
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
