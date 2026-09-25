"""
CropSafe AI - Trilingual Agri-Legal Knowledge & FAQ Bot
Comprehensive multilingual knowledge retrieval engine resolving common agricultural,
legal, and chemical quality dilemmas faced by Sri Lankan farmers in Sinhala, Tamil, and English.
"""

import os
import sys
import json
from typing import Dict, Any, List

# Windows encoding safety
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


class TrilingualAgriKnowledgeBot:
    """Delivers verified statutory and agronomic guidance in Sinhala, Tamil, and English."""

    FAQ_DATABASE = [
        {
            "faq_id": "FAQ-01",
            "topic": "Fertilizer Caking & Hardening",
            "keywords": ["ගල්", "තද", "caking", "hardened", "கட்டியாதல்", "கட்டி"],
            "question_en": "My fertilizer bag has hardened into solid blocks (caking). Has it lost its nutrient potency?",
            "answer_en": "No, caking is caused by ambient moisture absorption exceeding the Critical Relative Humidity (72.5% CRH for Urea). The nitrogen content is chemically intact. Gently crush the lumps back to granules before spreading. Avoid broadcast if dissolved slurry forms.",
            "question_si": "මගේ පොහොර මිටිය ගල් ගැසී තද වී ඇත. එහි පෝෂක ගුණය නැතිවී තිබේද?",
            "answer_si": "නැත, පොහොර ගල්වීම සිදුවන්නේ වාතයේ අධික ආර්ද්‍රතාවය (72.5% CRH) උරාගැනීමෙනි. එහි ඇති නයිට්‍රජන් ගුණය විනාශ වී නැත. කැට කුඩුකර සාමාන්‍ය පරිදි යෙදිය හැක. එහෙත් දියර වී ඇත්නම් කුඹුරට කෙලින්ම විසි නොකරන්න.",
            "question_ta": "எனது உரப்பை இறுகி கட்டியாகியுள்ளது. அதன் ஊட்டச்சத்து குணம் குறைந்துவிட்டதா?",
            "answer_ta": "இல்லை, ஈரப்பதம் உறிஞ்சப்படுவதால் கட்டியாதல் ஏற்படுகிறது. நைதரசன் சத்து குறையவில்லை. கட்டிகளை உடைத்து வழக்கம்போல் பயன்படுத்தலாம்.",
            "reference": "SLS 618:2014 & DOA Storage Bulletin"
        },
        {
            "faq_id": "FAQ-02",
            "topic": "Merchant Refusing Bill / Price Gouging",
            "keywords": ["බිල", "රිසිට්පත", "bill", "receipt", "overcharge", "விலைப்பட்டியல்", "ரசீது"],
            "question_en": "The shop owner refused to give an official printed receipt and charged Rs. 7,500. What is my legal right?",
            "answer_en": "Under Section 18 of the Consumer Affairs Authority Act No. 9 of 2003, every merchant is legally mandated to issue a bill for all transactions. Charging above the gazetted MRP (Rs. 2,500 for subsidized fertilizer) carries a fine up to Rs. 500,000 and jail time. File an anonymous report on CropSafe AI or call 1920.",
            "question_si": "පොහොර වෙළෙන්දා නිල බිල්පතක් දීම ප්‍රතික්ෂේප කර රු. 7,500ක් අය කළේය. මට ඇති නීතිමය අයිතිය කුමක්ද?",
            "answer_si": "2003 අංක 09 දරන පාරිභෝගික කටයුතු අධිකාරී පනතේ 18 වගන්තිය යටතේ සෑම ගනුදෙනුවකටම බිල්පතක් නිකුත් කිරීම අනිවාර්ය වේ. පාලන මිලට (රු. 2,500) වඩා වැඩිපුර අය කිරීම රු. 500,000 දක්වා දඩ සහ සිරදඬුවම් ලැබිය හැකි වරදකි. වහාම 1920 අමතන්න හෝ CropSafe AI ඔස්සේ පැමිණිලි කරන්න.",
            "question_ta": "வியாபாரி ரசீது தர மறுத்து ரூ. 7,500 அறவிடுகிறார். எனக்குள்ள சட்ட உரிமை என்ன?",
            "answer_ta": "நுகர்வோர் அதிகாரசபை சட்டத்தின்படி ரசீது வழங்குவது கட்டாயமாகும். அரச கட்டுப்பாட்டு விலையை விட அதிகமாக விற்பது தண்டனைக்குரிய குற்றமாகும்.",
            "reference": "CAA Act No. 9 of 2003, Section 18"
        },
        {
            "faq_id": "FAQ-03",
            "topic": "Rainy Day Fertilizer Application",
            "keywords": ["වැස්ස", "මෝසම", "rain", "rainy", "leaching", "மழை"],
            "question_en": "Can I apply Urea or MOP on a rainy day to help it dissolve faster?",
            "answer_en": "DANGER: Applying Urea or MOP immediately before or during rainfall exceeding 15mm causes 60-80% of nutrients to wash away as surface runoff and groundwater leaching. Apply only when light showers or moist soil are expected with no heavy rain forecast for 48 hours.",
            "question_si": "පොහොර ඉක්මනින් දියවීමට වැසි දිනකදී යූරියා හෝ MOP යෙදිය හැකිද?",
            "answer_si": "අනතුරුදායකයි: මි.මී. 15ට වැඩි වැස්සක් පවතින විට පොහොර යෙදුවහොත්, පොහොරවලින් 60-80%ක්ම සේදී ගොස් අපතේ යයි. ඉදිරි පැය 48 තුළ තද වැසි නොමැති තෙතමනය සහිත පසකට පමණක් යොදන්න.",
            "question_ta": "மழைநாளில் உரம் இடுவதால் விரைவாகக் கரையுமா?",
            "answer_ta": "கடும் மழையின்போது உரம் இடுவதால் 80% சத்துக்கள் நீரில் அடித்துச் செல்லப்பட்டு வீணாகும். மழை இல்லாத ஈரப்பதம் உள்ள நிலத்தில் இடவும்.",
            "reference": "DOA Soil Fertility Management Circular 2023"
        },
        {
            "faq_id": "FAQ-04",
            "topic": "Mixing Urea with Lime / Dolomite",
            "keywords": ["ඩොලමයිට්", "හුණු", "මිශ්‍ර", "dolomite", "lime", "mixing", "டொலமைட்", "சுண்ணாம்பு"],
            "question_en": "Can I mix Urea and Dolomite together before spreading to save labor?",
            "answer_en": "STRICTLY PROHIBITED: Dolomite is alkaline (calcium magnesium carbonate). Mixing it with Urea causes an immediate chemical reaction releasing nitrogen as volatile, pungent ammonia gas (NH3). You will lose over 40% of the nitrogen into the air within hours. Apply Dolomite at least 2 weeks prior to planting.",
            "question_si": "වැඩ පහසු කරගැනීමට යූරියා සහ ඩොලමයිට් එකට මිශ්‍ර කර කුඹුරට දැමිය හැකිද?",
            "answer_si": "සපුරා තහනම්: ඩොලමයිට් ක්ෂාරීය ද්‍රව්‍යයකි. යූරියා සමඟ මිශ්‍ර කළ විට ක්ෂණික රසායනික ප්‍රතික්‍රියාවකින් නයිට්‍රජන් වායුවක් ලෙස (ඇමෝනියා) වාෂ්ප වී අහකට යයි. නයිට්‍රජන් 40%කට වඩා අහිමි වේ. ඩොලමයිට් යෙදිය යුත්තේ බිම් සැකසීමේදී සති 2කට පෙරය.",
            "question_ta": "யூரியாவையும் டொலமைட்டையும் ஒன்றாகக் கலந்து இடலாமா?",
            "answer_ta": "முற்றிலும் தவிர்க்கவும். இரண்டும் கலக்கும்போது நைதரசன் வாயுவாக வெளியேறி வீணாகும்.",
            "reference": "Rice Research and Development Institute (RRDI) Guidelines"
        },
        {
            "faq_id": "FAQ-05",
            "topic": "Eppawala Rock Phosphate for Paddy",
            "keywords": ["එප්පාවල", "erp", "rock phosphate", "paddy", "எப்பாவல"],
            "question_en": "Why cannot Eppawala Rock Phosphate (ERP) be used directly on lowland paddy fields?",
            "answer_en": "ERP is an igneous fluoroapatite mineral that dissolves only in strongly acidic soils (like wet-zone tea and rubber soils, pH < 5.0). Lowland paddy soils have neutral to slightly acidic pH where ERP remains completely insoluble and unavailable to rice roots. Lowland paddy requires Triple Super Phosphate (TSP) or High-Grade ERP.",
            "question_si": "දේශීය එප්පාවල රොක් පොස්පේට් (ERP) මඩ කුඹුරුවලට කෙලින්ම යෙදිය නොහැක්කේ ඇයි?",
            "answer_si": "එප්පාවල පොස්පේට් දියවන්නේ තද ආම්ලික පසෙහි (තේ සහ රබර් වගාවල, pH < 5.0) පමණි. මඩ කුඹුරු පසෙහි ආම්ලිකතාවය අඩු බැවින් ERP ජලයේ දියනොවී වී මුල්වලට උරාගත නොහැකි ලෙස පවතී. වී වගාවට අවශ්‍ය වන්නේ ජලයේ දියවන TSP හෝ විශේෂිත HERP පොහොරයි.",
            "question_ta": "எப்பாவல ரொக் பொஸ்பேட்டை நெற்செய்கைக்கு நேரடியாகப் பயன்படுத்த முடியாதா?",
            "answer_ta": "எப்பாவல பொஸ்பேட் தேயிலை, இறப்பர் போன்ற அமில நிலங்களிலேயே கரையும். நெல் நிலத்தில் இது கரைந்து பயிருக்கு கிடைக்காது.",
            "reference": "SLS 977:2018 & Lanka Phosphate Research Review"
        }
    ]

    def __init__(self, output_path: str = "data/processed/trilingual_agri_faq_knowledge_base.json"):
        self.output_path = output_path
        os.makedirs(os.path.dirname(self.output_path), exist_ok=True)
        self._persist_knowledge_base()

    def _persist_knowledge_base(self):
        with open(self.output_path, "w", encoding="utf-8") as f:
            json.dump(self.FAQ_DATABASE, f, indent=2, ensure_ascii=False)

    def search_knowledge_base(self, query: str) -> Dict[str, Any]:
        """
        Fuzzy matches keywords in Sinhala, Tamil, or English and returns the authoritative answer.
        """
        q_lower = query.lower()
        best_match = None
        best_score = 0

        for item in self.FAQ_DATABASE:
            score = 0
            for kw in item["keywords"]:
                if kw.lower() in q_lower:
                    score += 3
            if item["topic"].lower() in q_lower:
                score += 5
            if score > best_score:
                best_score = score
                best_match = item

        if best_match and best_score >= 3:
            return {
                "query": query,
                "matched": True,
                "faq_id": best_match["faq_id"],
                "topic": best_match["topic"],
                "answers": {
                    "sinhala": {"q": best_match["question_si"], "a": best_match["answer_si"]},
                    "tamil": {"q": best_match["question_ta"], "a": best_match["answer_ta"]},
                    "english": {"q": best_match["question_en"], "a": best_match["answer_en"]}
                },
                "statutory_reference": best_match["reference"]
            }
        else:
            return {
                "query": query,
                "matched": False,
                "message": "No direct FAQ matched. Routing to General Agronomic Extension Officer."
            }


if __name__ == "__main__":
    bot = TrilingualAgriKnowledgeBot()

    # Query 1 in Sinhala regarding fertilizer caking
    res1 = bot.search_knowledge_base("මගේ පොහොර මිටිය ගල් වෙලා තද වෙලා තියෙන්නේ මොකක්ද කරන්නේ?")
    
    # Query 2 in English regarding mixing dolomite and urea
    res2 = bot.search_knowledge_base("Can I mix urea with dolomite?")

    print("=== Trilingual Agri Knowledge Bot Evaluated ===")
    print(f"[Query 1]: {res1['query']}")
    print(f"  Topic: {res1['topic']}")
    print(f"  Sinhala Answer:\n  {res1['answers']['sinhala']['a']}")
    print(f"[Query 2]: {res2['query']}")
    print(f"  Topic: {res2['topic']}")
    print(f"  English Answer:\n  {res2['answers']['english']['a']}")
    print(f"Knowledge Base File Saved: {bot.output_path}")
