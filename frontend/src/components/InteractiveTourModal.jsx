import React, { useState } from 'react';
import { 
  Compass, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle2, 
  Scale, 
  Search, 
  TrendingUp, 
  ShoppingCart, 
  Sparkles,
  Award
} from 'lucide-react';

export default function InteractiveTourModal({
  isOpen,
  onClose,
  onNavigateTab,
  language = 'si'
}) {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(0);

  const tr = (si, en, ta) => {
    if (language === 'ta') return ta || en || si;
    if (language === 'en') return en || si;
    return si;
  };

  const steps = [
    {
      stepNumber: 1,
      badge: "පියවර 01: නියම පොහොර මාත්‍රාව",
      badgeEn: "Step 01: Accurate Dosage",
      title: "අක්කර ගණන අනුව DOA පොහොර මාත්‍රාව ගණනය කිරීම",
      titleEn: "DOA Fertilizer Dosage Calculation by Acreage",
      icon: "⚖️",
      color: "from-amber-600 to-orange-700",
      accentBg: "bg-amber-50 border-amber-200 text-amber-950",
      description: "ගොවියාගේ බෝගය (වී, බඩඉරිඟු, එළවළු) සහ වගා කරන අක්කර ප්‍රමාණය ඇතුළත් කළ විට, කෘෂිකර්ම දෙපාර්තමේන්තුවේ (DOA) නිල නිර්දේශ අනුව අවශ්‍ය යූරියා, TSP, MOP 50kg මිටි ප්‍රමාණය, මුදල් ඉතිරිය සහ මුද්‍රණය කළ හැකි වට්ටෝරුවක් ක්ෂණිකව ලබාදේ.",
      targetTab: "dosage",
      actionText: "මාත්‍රා ගණකය විවෘත කරන්න ➔",
      actionTextEn: "Open Dosage Calculator ➔"
    },
    {
      stepNumber: 2,
      badge: "පියවර 02: ව්‍යාජ පොහොර හඳුනාගැනීම",
      badgeEn: "Step 02: Anti-Fraud Screening",
      title: "ගෙදරදීම බාල / ව්‍යාජ පොහොර අල්ලා ගැනීම",
      titleEn: "At-Home Fertilizer Quality & Fraud Screening",
      icon: "🔍",
      color: "from-emerald-600 to-teal-700",
      accentBg: "bg-emerald-50 border-emerald-200 text-emerald-950",
      description: "වතුර වීදුරුවකට දමා තත්පර 60ක සීතල වීමේ පරීක්ෂාව (Cold water endothermic test) සහ උණුසුම් හැන්දක රත්කිරීමෙන් ඇමෝනියා වායුව පිටවීම පරීක්ෂා කර, ගල් කුඩු හෝ ලුණු කලවම් කළ වංචා ගොවියාට ගෙදරදීම හඳුනාගත හැක.",
      targetTab: "screening",
      actionText: "ක්ෂේත්‍ර පරීක්ෂාව බලන්න ➔",
      actionTextEn: "View Screening Wizard ➔"
    },
    {
      stepNumber: 3,
      badge: "පියවර 03: මිල පුරෝකථනය",
      badgeEn: "Step 03: Price Trend Forecast",
      title: "ඉදිරි මාස 6 පොහොර වෙළඳපොළ මිල අනාවැකිය",
      titleEn: "6-Month Fertilizer Market Price Trend Forecast",
      icon: "📈",
      color: "from-blue-600 to-indigo-700",
      accentBg: "bg-blue-50 border-blue-200 text-blue-950",
      description: "ස්වාභාවික වායු (Natural Gas) මිල, ඩොලරයේ අගය සහ නැව් ගාස්තු දත්ත යොදාගෙන, ඉදිරි මාස 6 තුළ පොහොර මිල ඉහළ පහළ යන ආකාරය සහ වඩාත්ම ලාභදායී මිලදී ගැනීමේ කාලසීමාව (Best buying window) කල්තියා ගොවියාට පෙන්වයි.",
      targetTab: "priceforecast",
      actionText: "මිල අනාවැකිය බලන්න ➔",
      actionTextEn: "View Price Forecast ➔"
    },
    {
      stepNumber: 4,
      badge: "පියවර 04: ළඟම ගබඩාවෙන් වෙන්කරවා ගැනීම",
      badgeEn: "Step 04: Depot Procurement",
      title: "නියම රාජ්‍ය ගැසට් මිලට පොහොර පෙර-ඇණවුම (Pre-Order)",
      titleEn: "Online Fertilizer Pre-Order & Depot Reservation",
      icon: "🛒",
      color: "from-emerald-700 to-slate-900",
      accentBg: "bg-teal-50 border-teal-200 text-teal-950",
      description: "CCF (හුනුපිටිය), ලක්පොහොර (සීප්පුකුලම), බවර්, CIC ආදී බලයලත් ආයතනවලින් රජයේ සහනාධාර කූපනයට (රු. 2,500) හෝ ගැසට් සිල්ලර මිලට පොහොර වෙන්කරවා ගෙන, දින 5ක් වලංගු ඩිජිටල් QR ටෝකනයක් සහිතව පෝලිම්වල නොසිට ලබාගැනීම.",
      targetTab: "procurement",
      actionText: "ඔන්ලයින් ඇණවුම් පෝටලය බලන්න ➔",
      actionTextEn: "Open Procurement Portal ➔"
    }
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGoToFeature = () => {
    onNavigateTab(current.targetTab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-400 w-full max-w-xl overflow-hidden flex flex-col">
        
        {/* Header with Step Indicator */}
        <div className={`p-5 sm:p-6 bg-gradient-to-r ${current.color} text-white relative`}>
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black">
              <Compass className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>{tr("CropSafe AI ක්‍රියාකාරී නිරූපණය", "CropSafe AI Interactive Tour", "ஊடாடும் சுற்றுப்பயணம்")}</span>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center space-x-3">
            <span className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
              {current.icon}
            </span>
            <div>
              <span className="text-[11px] font-bold text-emerald-200 block uppercase tracking-wider">
                {current.badge}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                {current.title}
              </h3>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center space-x-2 mt-5">
            {steps.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-8 bg-amber-300' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Step Details Body */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${current.accentBg}`}>
            <p className="font-medium text-slate-800">
              {current.description}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-xs text-slate-400 font-bold">
              පියවර {currentStep + 1} / {steps.length}
            </span>

            <button
              type="button"
              onClick={handleGoToFeature}
              className="py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md transition-all hover:scale-105 active:scale-95 flex items-center space-x-1.5"
            >
              <span>{current.actionText}</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all ${
              currentStep === 0
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ආපසු</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md flex items-center space-x-1.5 transition-all hover:scale-105 active:scale-95"
          >
            <span>{currentStep === steps.length - 1 ? "චාරිකාව අවසන් කරන්න ✓" : "ඊළඟ පියවර ➔"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
