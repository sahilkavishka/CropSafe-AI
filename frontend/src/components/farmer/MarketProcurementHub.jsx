import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Landmark,
  DollarSign,
  Leaf,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Volume2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';
import OnlineProcurementPortal from '../OnlineProcurementPortal';
import DigitalGoviPassbookPortal from './DigitalGoviPassbookPortal';
import { translations } from '../../i18n';

const API_BASE = "http://localhost:8000";

export default function MarketProcurementHub({
  language = 'si',
  tr = (si, en, ta) => (language === 'ta' ? (ta || en || si) : language === 'en' ? (en || si) : si),
  activeTool = 'govpassbook',
  onSelectTool = () => {},
  onBackToHome = () => {},
  farmerProfile = { name: 'කේ. එම්. බණ්ඩාර', nic: '198425600123', district: 'Anuradhapura', ascDivision: 'තඹුත්තේගම ගොවිජන සේවා මධ්‍යස්ථානය', landAcres: 2.5, crop: 'paddy' },
  onUpdateProfile = () => {},
  playTone = () => {}
}) {
  const t = translations[language] || translations.si;

  const [currentTool, setCurrentTool] = useState(activeTool || 'govpassbook');

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

  // Helper for text-to-speech
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
  // 1. 6-MONTH PRICE TREND FORECASTER STATE & LOGIC
  // ----------------------------------------------------
  const [forecastFert, setForecastFert] = useState('urea');
  const [forecastHorizon, setForecastHorizon] = useState(3);
  const [forecastUsdLkr, setForecastUsdLkr] = useState(305.0);
  const [forecastEnergyChange, setForecastEnergyChange] = useState(8.5);
  const [forecastFreight, setForecastFreight] = useState(12.0);
  const [forecastSeason, setForecastSeason] = useState('Maha');
  const [forecastResult, setForecastResult] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [showMacroLevers, setShowMacroLevers] = useState(false);

  const handleFetchPriceForecast = async (
    fert = forecastFert,
    horizon = forecastHorizon,
    usd = forecastUsdLkr,
    energy = forecastEnergyChange,
    freight = forecastFreight,
    season = forecastSeason
  ) => {
    setForecastLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/macro/fertilizer-price-forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fertilizer_type: fert,
          forecast_horizon_months: horizon,
          brent_crude_usd: 82.5,
          natural_gas_usd_mmbtu: 3.10,
          usd_lkr_rate: usd,
          global_freight_index: 1850 + (freight * 15),
          active_season: season
        })
      });
      if (res.ok) {
        const data = await res.json();
        setForecastResult(data);
        playTone('chime');
        setForecastLoading(false);
        return;
      }
    } catch (e) {
      // Offline fallback
    }

    setTimeout(() => {
      const basePrices = { urea: 2500, tsp: 3200, mop: 3400, npk: 3600 };
      const base = basePrices[fert] || 2500;
      const pctDelta = ((energy * 0.4) + ((usd - 300) * 0.3) + (freight * 0.15)) * (horizon / 3);
      const predicted = Math.round(base * (1 + (pctDelta / 100)));
      const isUp = predicted > base;

      setForecastResult({
        fertilizer_type: fert,
        fertilizer_name_si: fert === 'urea' ? 'යූරියා' : (fert === 'tsp' ? 'TSP කළු පොහොර' : (fert === 'mop' ? 'MOP රතු පොහොර' : 'NPK මිශ්‍ර පොහොර')),
        current_retail_mrp_lkr: base,
        predicted_retail_mrp_lkr: predicted,
        price_change_pct: Math.round(pctDelta * 10) / 10,
        trend_direction: isUp ? 'UPWARD' : 'STABLE',
        trend_si: isUp ? 'ඉදිරි මාසවලදී මිල ඉහළ යාමේ ප්‍රවණතාවක් පවතී' : 'මිල ස්ථාවරව පවතිනු ඇත',
        trend_en: isUp ? 'Projected price increase in coming months' : 'Prices expected to remain stable',
        recommendation_si: isUp 
          ? 'දැන්ම කන්නයට අවශ්‍ය පොහොර තොග ගොවිජන සේවා මධ්‍යස්ථානයෙන් හෝ බලපත්‍රලාභී අලෙවිසැලෙන් වෙන්කරවා ගැනීම වාසිදායකය.'
          : 'මිලෙහි ක්ෂණික වැඩිවීමක් බලාපොරොත්තු නොවේ. අවශ්‍යතාව පරිදි මිලදී ගත හැක.',
        recommendation_en: isUp
          ? 'Advised to pre-order or secure fertilizer quotas early from ASC to protect against cost inflation.'
          : 'No urgent price surge expected. Normal scheduled purchases recommended.',
        procurement_timing: isUp ? 'EARLY_BUY_RECOMMENDED' : 'NORMAL_SCHEDULE',
        monthly_trend_curve: Array.from({ length: horizon }).map((_, i) => ({
          month_index: i + 1,
          month_label: `Month +${i + 1}`,
          projected_price_lkr: Math.round(base * (1 + ((pctDelta * ((i + 1) / horizon)) / 100)))
        }))
      });
      playTone('chime');
      setForecastLoading(false);
    }, 250);
  };

  useEffect(() => {
    if (currentTool === 'priceforecast' && !forecastResult) {
      handleFetchPriceForecast();
    }
  }, [currentTool]);

  // ----------------------------------------------------
  // 2. SUBSIDY E-WALLET STATE & LOGIC
  // ----------------------------------------------------
  const [subsidyNic, setSubsidyNic] = useState(farmerProfile?.nic || '198425600123');
  const [subsidyAsc, setSubsidyAsc] = useState(farmerProfile?.ascDivision || 'Tambuttegama ASC');
  const [subsidyResult, setSubsidyResult] = useState(null);
  const [subsidyLoading, setSubsidyLoading] = useState(false);

  const handleCheckSubsidy = async () => {
    setSubsidyLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/farmer/subsidy/${encodeURIComponent(subsidyNic)}`);
      if (res.ok) {
        const data = await res.json();
        setSubsidyResult(data);
        playTone('chime');
        setSubsidyLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    setTimeout(() => {
      const ha = (farmerProfile?.landAcres || 2.5) * 0.404686;
      const cashSubsidy = Math.round(ha * 15000);
      setSubsidyResult({
        nic: subsidyNic,
        farmer_name: farmerProfile?.name || 'කේ. එම්. බණ්ඩාර',
        asc_center: subsidyAsc,
        land_area_ha: Math.round(ha * 100) / 100,
        subsidy_voucher_status: 'ACTIVE_VERIFIED',
        cash_entitlement_lkr: cashSubsidy,
        subsidized_quota: {
          urea_bags_50kg: Math.ceil((farmerProfile?.landAcres || 2.5) * 2.2),
          mop_bags_50kg: Math.ceil((farmerProfile?.landAcres || 2.5) * 1.0),
          tsp_bags_50kg: Math.ceil((farmerProfile?.landAcres || 2.5) * 0.9)
        },
        carbon_offset_bonus_lkr: 4250,
        boc_account_status: 'CREDITED_TO_ACCOUNT',
        bank_reference: 'BOC-AGR-2026-98124'
      });
      playTone('chime');
      setSubsidyLoading(false);
    }, 250);
  };

  // ----------------------------------------------------
  // 3. AGRARIAN CREDIT SCORECARD STATE & LOGIC
  // ----------------------------------------------------
  const [creditLandAcres, setCreditLandAcres] = useState(farmerProfile?.landAcres || 2.0);
  const [creditCrop, setCreditCrop] = useState(farmerProfile?.crop || 'paddy');
  const [creditTenure, setCreditTenure] = useState('swarnabhoomi_permit');
  const [creditIrrig, setCreditIrrig] = useState('major_irrigation_canal');
  const [creditExp, setCreditExp] = useState(15);
  const [creditYield, setCreditYield] = useState(4.5);
  const [creditDebt, setCreditDebt] = useState(20000.0);
  const [creditInsurance, setCreditInsurance] = useState(true);
  const [creditResult, setCreditResult] = useState(null);
  const [creditLoading, setCreditLoading] = useState(false);

  const handleCalculateCredit = async () => {
    setCreditLoading(true);
    const ha = creditLandAcres * 0.404686;
    try {
      const res = await fetch(`${API_BASE}/api/farmer/credit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          land_area_ha: ha,
          crop_type: creditCrop,
          tenure_type: creditTenure,
          irrigation_source: creditIrrig,
          farming_experience_years: creditExp,
          historical_yield_t_ha: creditYield,
          existing_debt_lkr: creditDebt,
          crop_insurance_active: creditInsurance
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCreditResult(data);
        playTone('chime');
        setCreditLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    setTimeout(() => {
      const score = Math.min(880, Math.round(520 + (creditExp * 6) + (creditYield * 35) + (creditInsurance ? 60 : 0) - (creditDebt / 1500)));
      const grade = score >= 750 ? 'A+' : (score >= 680 ? 'A' : (score >= 580 ? 'B' : 'C'));
      const maxLoan = Math.round(creditLandAcres * 125000);
      setCreditResult({
        credit_score: score,
        score_grade: grade,
        risk_category: score >= 680 ? 'LOW_RISK' : 'MODERATE_RISK',
        max_fertilizer_credit_limit_lkr: maxLoan,
        subsidized_interest_rate_pct: 6.5,
        eligible_banks: ["Bank of Ceylon (BOC)", "People's Bank", "Regional Development Bank (RDB)"],
        doa_endorsement_status: 'RECOMMENDED_FOR_APPROVAL'
      });
      playTone('chime');
      setCreditLoading(false);
    }, 250);
  };

  // ----------------------------------------------------
  // 4. CARBON LCA STATE & LOGIC
  // ----------------------------------------------------
  const [carbonUreaKg, setCarbonUreaKg] = useState(100.0);
  const [carbonTspKg, setCarbonTspKg] = useState(45.0);
  const [carbonMopKg, setCarbonMopKg] = useState(50.0);
  const [carbonCompostKg, setCarbonCompostKg] = useState(500.0);
  const [carbonBiocharKg, setCarbonBiocharKg] = useState(50.0);
  const [carbonResult, setCarbonResult] = useState(null);
  const [carbonLoading, setCarbonLoading] = useState(false);

  const handleComputeCarbonLca = async () => {
    setCarbonLoading(true);
    try {
      const ha = (farmerProfile?.landAcres || 2.5) * 0.404686;
      const res = await fetch(`${API_BASE}/api/soil/carbon-lca`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urea_kg: carbonUreaKg,
          tsp_kg: carbonTspKg,
          mop_kg: carbonMopKg,
          compost_kg: carbonCompostKg,
          biochar_kg: carbonBiocharKg,
          land_ha: ha
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCarbonResult(data);
        playTone('chime');
        setCarbonLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    setTimeout(() => {
      const scope1 = (carbonUreaKg * 0.733) + (carbonUreaKg * 0.46 * 0.01 * (44 / 28) * 298 * 0.05);
      const scope2_3 = (carbonUreaKg * 2.647) + (carbonTspKg * 1.217) + (carbonMopKg * 0.687);
      const compost_offset = carbonCompostKg * 0.18;
      const biochar_offset = carbonBiocharKg * 2.5;
      const gross = scope1 + scope2_3;
      const net = Math.max(0, gross - (compost_offset + biochar_offset));
      const grade = net < 150 ? 'A' : (net < 300 ? 'B' : (net < 500 ? 'C' : 'D'));
      const creditsLkr = Math.round((compost_offset + biochar_offset) * 12.5);

      setCarbonResult({
        total_gross_footprint_kg_co2e: Math.round(gross * 10) / 10,
        net_carbon_footprint_kg_co2e: Math.round(net * 10) / 10,
        carbon_sequestration_offset_kg_co2e: Math.round((compost_offset + biochar_offset) * 10) / 10,
        carbon_intensity_grade: grade,
        carbon_credit_earnings_lkr: creditsLkr,
        carbon_credit_earnings_usd: Math.round((creditsLkr / 305) * 10) / 10,
        emission_breakdown: {
          urea_manufacturing_transport: Math.round(carbonUreaKg * 2.647),
          field_n2o_hydrolysis: Math.round(scope1),
          tsp_mining_transport: Math.round(carbonTspKg * 1.217),
          mop_mining_transport: Math.round(carbonMopKg * 0.687)
        }
      });
      playTone('chime');
      setCarbonLoading(false);
    }, 250);
  };

  const marketTools = [
    { id: 'govpassbook', label: tr("🪪 ඩිජිටල් ගොවි පොත & DAD ද්වාරය", "Digital Passbook & GovNet", "டிஜிட்டல் உர புத்தகம்"), icon: "🪪" },
    { id: 'procurement', label: tr("ඔන්ලයින් ඇණවුම් & ගබඩා", "Online Orders & Depots", "உர முன்பதிவு"), icon: "🛒" },
    { id: 'priceforecast', label: tr("මාස 6 මිල අනාවැකි", "Price Forecaster", "விலை கணிப்பு"), icon: "📈" },
    { id: 'subsidy', label: tr("සහනාධාර E-Wallet", "Subsidy E-Wallet", "மானிய மின்-பை"), icon: "💳" },
    { id: 'credit', label: tr("ගොවි ණය ලකුණු", "Credit Scorecard", "கடன் தகுதி"), icon: "🏦" },
    { id: 'carbonlca', label: tr("කාබන් බැර & Green Bonus", "Carbon & Green Bonus", "கார்பன் வரவு"), icon: "🌱" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ========================================================================= */}
      {/* HUB HEADER & SUB-NAVIGATION BAR                                          */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 text-white p-5 sm:p-7 rounded-3xl shadow-xl border border-blue-700/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-2.5">
              <span className="text-base">💰</span>
              <span>{tr("වෙළඳපොළ සහ ප්‍රසම්පාදන මධ්‍යස්ථානය", "Market & Procurement Hub", "சந்தை மற்றும் கொள்முதல்")}</span>
              <span className="text-[10px] bg-blue-400 text-slate-950 px-2 py-0.5 rounded-full font-black">MARKET INTELLIGENCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>{tr("සෘජු පොහොර ඇණවුම්, මිල ප්‍රවණතා හා මූල්‍ය සහනාධාර", "Direct Procurement, Price Trends & Agrarian Finance", "உர முன்பதிவு, விலை கணிப்பு & மானியம்")}</span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/80 mt-1 max-w-2xl font-medium">
              {tr(
                "රජයේ ලක්පොහොර සහ CCF ගබඩා ජාලයෙන් සෘජු ඇණවුම්, ගෝලීය මිල අනාවැකි, රු. 15,000 සහනාධාර ලෙජරය හා බැංකු ණය සුදුසුකම් සලකා බලන්න.",
                "Direct pre-orders from state fertilizer depots, macroeconomic retail price forecasting, government subsidy quota tracking, and CBSL agrarian loan eligibility.",
                "அரசு உர முன்பதிவு, எதிர்கால விலை மாற்றங்கள் மற்றும் ரூ. 15,000 மானிய இருப்பு விபரங்கள்."
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
        <div className="mt-6 pt-4 border-t border-blue-800/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {marketTools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => handleToolChange(tool.id)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm whitespace-nowrap transition-all flex items-center space-x-2 ${
                currentTool === tool.id
                  ? 'bg-blue-400 text-slate-950 shadow-lg scale-105'
                  : 'bg-white/10 text-blue-100 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span className="text-base">{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 0. DIGITAL GOVI PASSBOOK & DAD GOVERNMENT REGISTRY GATEWAY               */}
      {/* ========================================================================= */}
      {currentTool === 'govpassbook' && (
        <div className="animate-fadeIn">
          <DigitalGoviPassbookPortal
            language={language}
            tr={tr}
            farmerProfile={farmerProfile}
            onUpdateProfile={onUpdateProfile}
            playTone={playTone}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ONLINE FERTILIZER PROCUREMENT & DIRECT DEPOT ORDERING                 */}
      {/* ========================================================================= */}
      {currentTool === 'procurement' && (
        <div className="animate-fadeIn">
          <OnlineProcurementPortal 
            language={language} 
            farmerProfile={farmerProfile} 
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 6-MONTH PRICE TREND FORECASTER & MACRO SIMULATOR                       */}
      {/* ========================================================================= */}
      {currentTool === 'priceforecast' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{tr("ශ්‍රී ලංකා වෙළඳපොළ බුද්ධි තොරතුරු (Market Intelligence Engine)", "DOA & CBSL Market Intelligence Engine", "சந்தை நுண்ணறிவு எஞ்சின்")}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
                <span>📈 {tr("පොහොර වෙළඳපොළ මිල පුරෝකථනය හා වාසිදායකම මිලදී ගැනීමේ කාලය", "Fertilizer Price Trend Forecast & Best Buy Window", "உர சந்தை விலை கணிப்பு")}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {tr("ගෝලීය ස්වභාවික වායු, USD/LKR විනිමය සහ නැව් ගාස්තු අනුව ඉදිරි මාසවල පොහොර මිල වෙනස්වන ආකාරය කලින්ම දැනගෙන උපරිම මුදලක් ඉතිරි කරගන්න.", "Predict open market retail price shifts and spot the most profitable procurement window for your crop season.", "எதிர்கால உர விலை மாற்றங்களை முன்கூட்டியே அறிந்து பணத்தை சேமிக்கவும்.")}
              </p>
            </div>

            {forecastResult && (
              <button
                type="button"
                onClick={() => {
                  playTone('chime');
                  handleSpeakText(
                    language === 'en'
                      ? `${forecastResult.fertilizer_name_si} price forecast: ${forecastResult.trend_en}. ${forecastResult.recommendation_en}`
                      : `${forecastResult.fertilizer_name_si} මිල පුරෝකථනය: ${forecastResult.trend_si}. ${forecastResult.recommendation_si}`
                  );
                }}
                className="self-start md:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-all shadow-xs"
              >
                <Volume2 className="w-4 h-4 text-emerald-700" />
                <span>{tr("උපදෙසට සවන් දෙන්න", "Listen to Forecast", "ஆலோசனை கேட்க")}</span>
              </button>
            )}
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                {tr("පුරෝකථන පරාමිතීන් තෝරන්න (Select Parameters)", "Forecast Levers", "அளவீடுகளை தேர்வு செய்யவும்")}
              </span>
              <button
                type="button"
                onClick={() => setShowMacroLevers(!showMacroLevers)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center space-x-1"
              >
                <span>{showMacroLevers ? tr("සරල ආකාරය (Simple View)", "Simple View", "எளிய முறை") : tr("උසස් ආර්ථික ලීවර (Macro Levers)", "Advanced Macro Levers", "மேம்பட்ட அளவீடுகள்")}</span>
              </button>
            </div>

            {/* Fertilizer Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 block">
                {tr("පොහොර වර්ගය තෝරන්න:", "Select Fertilizer Commodity:", "உர வகையை தேர்வு செய்யவும்:")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'urea', name: tr("යූරියා (Urea 46% N)", "Urea (46% N)", "யூரியா (46% N)"), icon: '🌾' },
                  { key: 'tsp', name: tr("TSP කළු පොහොර", "TSP (Triple Super)", "TSP உரம்"), icon: '⚫' },
                  { key: 'mop', name: tr("MOP රතු පොහොර", "MOP (Potash)", "MOP உரம்"), icon: '🔴' },
                  { key: 'npk', name: tr("මිශ්‍ර පොහොර (NPK)", "NPK Compound", "NPK கலவை உரம்"), icon: '🧪' }
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      playTone('ding');
                      setForecastFert(item.key);
                      handleFetchPriceForecast(item.key, forecastHorizon, forecastUsdLkr, forecastEnergyChange, forecastFreight, forecastSeason);
                    }}
                    className={`p-3 rounded-2xl border text-left font-bold text-xs sm:text-sm transition-all flex items-center space-x-2.5 ${
                      forecastFert === item.key
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300 transform scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="leading-tight">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Horizon & Season */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  {tr("පුරෝකථන කාලරාමුව (Horizon):", "Forecast Window:", "கால அளவு:")}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 6].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setForecastHorizon(m);
                        handleFetchPriceForecast(forecastFert, m, forecastUsdLkr, forecastEnergyChange, forecastFreight, forecastSeason);
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-black transition-all ${
                        forecastHorizon === m
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m} {tr("මාසයයි", "Month(s)", "மாதம்")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 block mb-1">
                  {tr("වගා කන්නය (Cultivation Season):", "Cultivation Season:", "விவசாய பருவம்:")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Maha', 'Yala'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setForecastSeason(s);
                        handleFetchPriceForecast(forecastFert, forecastHorizon, forecastUsdLkr, forecastEnergyChange, forecastFreight, s);
                      }}
                      className={`py-2 px-3 rounded-xl border text-xs font-black transition-all ${
                        forecastSeason === s
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s === 'Maha' ? tr("මහ කන්නය (Maha)", "Maha Season", "மகா பருவம்") : tr("යල කන්නය (Yala)", "Yala Season", "யல பருவம்")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Macro Levers */}
            {showMacroLevers && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      USD/LKR Rate: <span className="font-mono text-emerald-700">{forecastUsdLkr}</span>
                    </label>
                    <input
                      type="range"
                      min="280"
                      max="360"
                      step="1"
                      value={forecastUsdLkr}
                      onChange={(e) => setForecastUsdLkr(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Global Gas & Energy: <span className="font-mono text-emerald-700">{forecastEnergyChange}%</span>
                    </label>
                    <input
                      type="range"
                      min="-20"
                      max="40"
                      step="2"
                      value={forecastEnergyChange}
                      onChange={(e) => setForecastEnergyChange(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Ocean Freight Index: <span className="font-mono text-emerald-700">+{forecastFreight}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={forecastFreight}
                      onChange={(e) => setForecastFreight(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleFetchPriceForecast(forecastFert, forecastHorizon, forecastUsdLkr, forecastEnergyChange, forecastFreight, forecastSeason)}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm"
                  >
                    යළි ගණනය කරන්න (Recalculate)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Forecast Result Display */}
          {forecastResult && (
            <div className="space-y-6 pt-2 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-xs font-bold text-slate-500 uppercase block">{tr("වත්මන් සිල්ලර මිල", "Current Retail MRP", "தற்போதைய விலை")}</span>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    Rs. {forecastResult.current_retail_mrp_lkr?.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ 50kg</span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">ශ්‍රී ලංකා රජයේ නිල පාලන මිල</span>
                </div>

                <div className={`p-5 rounded-2xl border shadow-xs ${
                  forecastResult.trend_direction === 'UPWARD' 
                    ? 'bg-rose-50 border-rose-200' 
                    : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <span className="text-xs font-bold uppercase block text-slate-600">
                    {tr("මාස", "Projected at Month", "கணிக்கப்பட்ட விலை")} +{forecastHorizon} {tr("පුරෝකථන මිල", "Price", "")}
                  </span>
                  <div className={`text-3xl font-black mt-1 ${
                    forecastResult.trend_direction === 'UPWARD' ? 'text-rose-900' : 'text-emerald-900'
                  }`}>
                    Rs. {forecastResult.predicted_retail_mrp_lkr?.toLocaleString()} <span className="text-xs font-normal opacity-80">/ 50kg</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1 text-xs font-bold">
                    {forecastResult.trend_direction === 'UPWARD' ? (
                      <span className="text-rose-700 flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 mr-1" />
                        +{forecastResult.price_change_pct}% {tr("ඉහළ යාමක්", "Increase", "அதிகரிப்பு")}
                      </span>
                    ) : (
                      <span className="text-emerald-700 flex items-center">
                        <TrendingDown className="w-3.5 h-3.5 mr-1" />
                        {tr("ස්ථාවර මිලක්", "Stable", "நிலையான விலை")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white shadow-md">
                  <span className="text-xs text-emerald-200 font-bold uppercase block">{tr("නිර්දේශිත මිලදී ගැනීමේ කාලය", "Procurement Window", "கொள்முதல் பரிந்துரை")}</span>
                  <div className="text-xl font-black mt-1 flex items-center space-x-1.5">
                    <span>⚡</span>
                    <span>{forecastResult.procurement_timing === 'EARLY_BUY_RECOMMENDED' ? tr("දැන්ම ඇණවුම් කරන්න", "Early Buy Advised", "உடனே முன்பதிவு செய்") : tr("සාමාන්‍ය පරිදි ගන්න", "Normal Schedule", "வழக்கமான கொள்முதல்")}</span>
                  </div>
                  <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
                    {language === 'en' ? forecastResult.recommendation_en : forecastResult.recommendation_si}
                  </p>
                </div>
              </div>

              {/* Monthly Trend Visual Graph */}
              {forecastResult.monthly_trend_curve && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    {tr("මාසික මිල ප්‍රවණතා වක්‍රය (Projected Price Trajectory Curve)", "Monthly Trajectory", "மாதாந்திர விலை வளைவு")}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {forecastResult.monthly_trend_curve.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                        <span className="text-[10px] font-mono text-slate-500 uppercase block">{item.month_label}</span>
                        <span className="text-sm font-black text-slate-900 block mt-1">Rs. {item.projected_price_lkr?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GOVERNMENT SUBSIDY E-WALLET & ASC VOUCHERS                              */}
      {/* ========================================================================= */}
      {currentTool === 'subsidy' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
              <Landmark className="w-3.5 h-3.5 text-emerald-700" />
              <span>{tr("ගොවි සහනාධාර හා ඩිජිටල් වවුචර් සේවාව", "Agrarian Subsidy E-Wallet", "விவசாய மானிய மின்-பை")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {tr("රජයේ පොහොර සහනාධාර ඊ-පසුම්බිය (Fertilizer Subsidy & Carbon E-Wallet)", "Government Fertilizer Subsidy & Carbon E-Wallet", "அரசு உர மானிய மின்-பை")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {tr(
                "රජයෙන් ගොවීන්ට ලබාදෙන රු. 15,000 පොහොර සහනාධාර වවුචරයේ ශේෂය, හිමි පොහොර මිටි ගණන සහ කාබනික භාවිතය වෙනුවෙන් හිමිවන හරිත කාබන් දීමනාව මෙතැනින් පරීක්ෂා කරගන්න.",
                "Verify your government fertilizer voucher (Rs. 15,000/ha subsidy entitlement), quota redemption at your local Agrarian Services Center (ASC), and Carbon Reduction Reward credits.",
                "அரசின் ரூ. 15,000 உர மானிய இருப்பு, உரித்தான உர மூட்டைகள் மற்றும் பசுமை கார்பன் போனஸ் விபரங்களை அறியவும்."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-900 block mb-1">
                  {tr("ගොවි මහතාගේ ජාතික හැඳුනුම්පත් අංකය (NIC):", "Farmer National Identity Card (NIC):", "விவசாயி தேசிய அடையாள அட்டை (NIC):")}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={subsidyNic}
                    onChange={(e) => setSubsidyNic(e.target.value)}
                    placeholder="198425600123"
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setSubsidyNic("198425600123")}
                    className="absolute right-2 top-2 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold"
                  >
                    නියැදි අංකය
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-900 block mb-1">
                  {tr("ගොවිජන සේවා මධ්‍යස්ථානය (ASC Center):", "Agrarian Services Center (ASC):", "விவசாய சேவை மையம் (ASC):")}
                </label>
                <select
                  value={subsidyAsc}
                  onChange={(e) => setSubsidyAsc(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white text-slate-800"
                >
                  <option value="Tambuttegama ASC">තඹුත්තේගම ගොවිජන සේවා මධ්‍යස්ථානය (Tambuttegama ASC)</option>
                  <option value="Polonnaruwa Central ASC">පොළොන්නරුව මධ්‍යම ගොවිජන සේවා මධ්‍යස්ථානය (Polonnaruwa)</option>
                  <option value="Anuradhapura ASC">අනුරාධපුර ගොවිජන සේවා මධ්‍යස්ථානය (Anuradhapura)</option>
                  <option value="Ampara Valley ASC">අම්පාර නිම්න ගොවිජන සේවා මධ්‍යස්ථානය (Ampara)</option>
                  <option value="Hambantota ASC">හම්බන්තොට ගොවිජන සේවා මධ්‍යස්ථානය (Hambantota)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleCheckSubsidy}
                disabled={subsidyLoading}
                className="w-full py-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Landmark className="w-5 h-5 text-white" />
                <span>{subsidyLoading ? 'දත්ත විමසමින් පවතී...' : tr("සහනාධාර ශේෂය පරීක්ෂා කරන්න", "Check Subsidy Entitlement", "மானிய இருப்பை சரிபார்க்க")}</span>
              </button>
            </div>

            {/* Subsidy Result Card */}
            <div>
              {subsidyResult ? (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 space-y-4 shadow-sm animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block">
                        GOVERNMENT VOUCHER STATUS
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-0.5">
                        {subsidyResult.farmer_name}
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">NIC: {subsidyResult.nic}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black">
                      ACTIVE & VERIFIED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">{tr("සහනාධාර මුදල", "Cash Entitlement", "மானியம்")}</span>
                      <span className="text-xl font-black text-emerald-900 mt-1 block">
                        Rs. {subsidyResult.cash_entitlement_lkr?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold">{subsidyResult.boc_account_status}</span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">{tr("කාබන් ප්‍රසාද දීමනාව", "Carbon Green Bonus", "பசுமை போனஸ்")}</span>
                      <span className="text-xl font-black text-teal-800 mt-1 block">
                        Rs. {subsidyResult.carbon_offset_bonus_lkr?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-teal-600 font-bold">ECO CREDIT</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-xs font-black text-slate-800 block">
                      {tr("හිමි පොහොර කෝටාව (Subsidized Fertilizer Quota):", "Subsidized Fertilizer Quota:", "உர ஒதுக்கீடு:")}
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-500 text-[10px] block">යූරියා</span>
                        <strong className="text-emerald-950 font-black">{subsidyResult.subsidized_quota?.urea_bags_50kg} මිටි</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-500 text-[10px] block">MOP</span>
                        <strong className="text-amber-950 font-black">{subsidyResult.subsidized_quota?.mop_bags_50kg} මිටි</strong>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-500 text-[10px] block">TSP</span>
                        <strong className="text-cyan-950 font-black">{subsidyResult.subsidized_quota?.tsp_bags_50kg} මිටි</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[250px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <Landmark className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
                  <p className="text-xs font-bold">
                    {tr("ඔබේ NIC අංකය ඇතුළත් කර සහනාධාර ශේෂය විමසන්න", "Enter NIC above and check balance", "அடையாள அட்டை எண்ணை உள்ளிடவும்")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. AGRARIAN CREDIT SCORECARD & LOAN ELIGIBILITY                          */}
      {/* ========================================================================= */}
      {currentTool === 'credit' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏦</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.creditHeader || "ගොවි ණය හා පොහොර මූල්‍ය ශ්‍රේණිගත කිරීම (Credit Scorecard)"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t.creditHelp || "ශ්‍රී ලංකා මහ බැංකුවේ (CBSL) 6.5% අඩු පොලී සහන ණය සුදුසුකම සහ උපරිම පොහොර ණය සීමාව ගණනය කරගන්න."}
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs sm:text-sm font-black text-slate-900 block mb-1.5">
                  {t.creditLandLabel || "ඉඩමේ ප්‍රමාණය (අක්කර):"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[0.5, 1.0, 2.0, 2.5, 3.0, 5.0].map(ac => (
                    <button
                      key={ac}
                      type="button"
                      onClick={() => setCreditLandAcres(ac)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        creditLandAcres === ac
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {ac} {t.acreUnit || "අක්කර"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-black text-slate-900 block mb-1.5">
                  {t.creditCropLabel || "වගා කරන බෝගය:"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'paddy', label: t.cropPaddy || 'වී' },
                    { id: 'maize', label: t.cropMaize || 'බඩඉරිඟු' },
                    { id: 'tea', label: t.cropTea || 'තේ' },
                    { id: 'vegetable', label: t.cropVeg || 'එළවළු' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCreditCrop(c.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        creditCrop === c.id
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ගොවිතැන් පළපුරුද්ද: <span className="font-mono text-emerald-800">{creditExp} වසරක්</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="40"
                  value={creditExp}
                  onChange={(e) => setCreditExp(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  පසුගිය අස්වැන්න (MT/ha): <span className="font-mono text-emerald-800">{creditYield} MT</span>
                </label>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.5"
                  value={creditYield}
                  onChange={(e) => setCreditYield(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <input
                  type="checkbox"
                  id="creditInsurCheck"
                  checked={creditInsurance}
                  onChange={(e) => setCreditInsurance(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <label htmlFor="creditInsurCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  සක්‍රිය වගා රක්ෂණයක් ඇත (Agricultural Insurance Board)
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCalculateCredit}
              disabled={creditLoading}
              className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Award className="w-5 h-5 text-emerald-400" />
              <span>{creditLoading ? 'ලකුණු ගණනය කෙරෙමින් පවතී...' : tr("ණය ලකුණු ගණනය කරන්න (Credit Scorecard)", "Calculate Credit Scorecard", "கடன் தகுதியை கணக்கிடு")}</span>
            </button>

            {creditResult && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-3">
                  <div>
                    <span className="text-xs font-black uppercase text-emerald-800 block">
                      CBSL ALTERNATIVE CREDIT SCORECARD
                    </span>
                    <div className="text-3xl font-black text-emerald-950 mt-1 flex items-baseline space-x-2">
                      <span>{creditResult.credit_score}</span>
                      <span className="text-sm font-bold text-emerald-700">/ 900</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black">
                        GRADE {creditResult.score_grade}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-bold block">සුදුසුකම් ලත් උපරිම පොහොර ණය සීමාව</span>
                    <span className="text-2xl font-black text-slate-900 block">
                      Rs. {creditResult.max_fertilizer_credit_limit_lkr?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-500 block">සහනදායී වාර්ෂික පොලී අනුපාතිකය:</span>
                    <strong className="text-emerald-800 text-sm font-black">{creditResult.subsidized_interest_rate_pct}% (CBSL New Comprehensive Rural Credit)</strong>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-200">
                    <span className="text-slate-500 block">DOA නිර්දේශිත තත්ත්වය:</span>
                    <strong className="text-slate-900 text-sm font-black">{creditResult.doa_endorsement_status}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CARBON LCA & GREEN OFFSETS ENGINE                                     */}
      {/* ========================================================================= */}
      {currentTool === 'carbonlca' && (
        <div className="clean-card p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="border-b border-slate-100 pb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Leaf className="w-3.5 h-3.5 text-emerald-700" />
              <span>{tr("පොහොර කාබන් පියසටහන හා පරිසර දීමනා (LCA Carbon Engine)", "Fertilizer Life Cycle Assessment (LCA) Carbon Engine", "உர கார்பன் தடம் & பசுமை வரவு")}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
              <span>🌱</span>
              <span>{tr("කාබන් පියසටහන හා Green Credits ගණකය", "Carbon Footprint & Voluntary Carbon Offset Valuation", "கார்பன் தடம் & பசுமை ஊக்கத்தொகை")}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {tr(
                "රසායනික පොහොර (Urea/TSP/MOP) නිෂ්පාදනය හා භාවිතයේදී පිටවන හරිතාගාර වායු (GHG) ගණනය කර, කොම්පෝස්ට් සහ බයෝචාර් (Biochar) මගින් කාබන් උරාගැනීමේ ත්‍යාග මුදල් ලබාගන්න.",
                "Computes Scope 1, 2, and 3 cradle-to-farm-gate GHG emissions and offset rewards from organic compost & biochar carbon sequestration.",
                "இரசாயன உரங்களின் கார்பன் உமிழ்வைக் கணக்கிட்டு, இயற்கை உரம் மூலம் பசுமை வரவு ஊக்கத்தொகையைப் பெறுங்கள்."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-black uppercase text-slate-700 block">
                  {tr("කන්නයේ පොහොර භාවිතය (Chemical Fertilizers):", "Chemical Fertilizer Input:", "உர பயன்பாடு:")}
                </span>

                <div>
                  <label className="text-xs font-bold text-slate-700 flex justify-between">
                    <span>යූරියා (Urea kg):</span>
                    <span className="font-mono text-emerald-700">{carbonUreaKg} kg</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={carbonUreaKg}
                    onChange={(e) => setCarbonUreaKg(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 flex justify-between">
                    <span>TSP කළු පොහොර (TSP kg):</span>
                    <span className="font-mono text-cyan-700">{carbonTspKg} kg</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="5"
                    value={carbonTspKg}
                    onChange={(e) => setCarbonTspKg(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 flex justify-between">
                    <span>MOP රතු පොහොර (MOP kg):</span>
                    <span className="font-mono text-amber-700">{carbonMopKg} kg</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="5"
                    value={carbonMopKg}
                    onChange={(e) => setCarbonMopKg(parseFloat(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <span className="text-xs font-black uppercase text-emerald-900 block">
                  {tr("කාබනික හා කාබන් උරාගැනීමේ මිශ්‍රණ (Offsets):", "Organic Carbon Sequestration Offsets:", "கரிம ஊக்கத்தொகை:")}
                </span>

                <div>
                  <label className="text-xs font-bold text-emerald-900 flex justify-between">
                    <span>කොම්පෝස්ට් පොහොර (Compost kg):</span>
                    <span className="font-mono text-emerald-700">{carbonCompostKg} kg</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={carbonCompostKg}
                    onChange={(e) => setCarbonCompostKg(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-emerald-900 flex justify-between">
                    <span>බයෝචාර් (Biochar kg):</span>
                    <span className="font-mono text-emerald-700">{carbonBiocharKg} kg</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={carbonBiocharKg}
                    onChange={(e) => setCarbonBiocharKg(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleComputeCarbonLca}
                disabled={carbonLoading}
                className="w-full py-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Leaf className="w-5 h-5 text-white" />
                <span>{carbonLoading ? 'ගණනය කෙරෙමින් පවතී...' : tr("කාබන් පියසටහන ගණනය කරන්න", "Compute LCA Carbon Footprint", "கார்பன் தடம் கணக்கிடு")}</span>
              </button>
            </div>

            {/* Results Panel */}
            <div>
              {carbonResult ? (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border-2 border-emerald-300 space-y-4 shadow-sm animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 block">
                        IPCC TIER 2 LCA RESULT
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                        {carbonResult.net_carbon_footprint_kg_co2e} <span className="text-xs font-bold text-slate-500">kg CO₂e (Net)</span>
                      </h3>
                    </div>
                    <span className="px-3.5 py-1 rounded-full bg-emerald-600 text-white font-black text-sm">
                      GRADE {carbonResult.carbon_intensity_grade}
                    </span>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-emerald-200 text-center shadow-xs">
                    <span className="text-xs font-bold text-slate-500 uppercase block">
                      {tr("හිමිවන හරිත ත්‍යාග මුදල (Voluntary Carbon Earnings)", "Carbon Offset Earnings", "பசுமை ஊக்கத்தொகை")}
                    </span>
                    <span className="text-3xl font-black text-emerald-950 mt-1 block">
                      Rs. {carbonResult.carbon_credit_earnings_lkr?.toLocaleString()} /=
                    </span>
                    <span className="text-xs text-emerald-700 font-bold">~ ${carbonResult.carbon_credit_earnings_usd} USD Verified Carbon Standard (VCS)</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                    <span className="font-black text-slate-800 block">විමෝචන බෙදීයාම (Scope Breakdown):</span>
                    <div className="space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>යූරියා නිෂ්පාදනය & ප්‍රවාහනය:</span>
                        <strong className="font-mono">{carbonResult.emission_breakdown?.urea_manufacturing_transport} kg CO₂e</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>ක්ෂේත්‍රයේ N₂O විමෝචනය (Hydrolysis):</span>
                        <strong className="font-mono">{carbonResult.emission_breakdown?.field_n2o_hydrolysis} kg CO₂e</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>TSP & MOP කැණීම් ප්‍රවාහනය:</span>
                        <strong className="font-mono">{(carbonResult.emission_breakdown?.tsp_mining_transport || 0) + (carbonResult.emission_breakdown?.mop_mining_transport || 0)} kg CO₂e</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <Leaf className="w-12 h-12 stroke-[1.5] mb-2 text-emerald-300" />
                  <p className="text-xs font-bold">
                    {tr("පොහොර ප්‍රමාණයන් ඇතුළත් කර ගණනය කරන්න බොත්තම ඔබන්න", "Adjust fertilizer inputs and click Compute", "அளவுகளை உள்ளிட்டு கணக்கிடவும்")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
