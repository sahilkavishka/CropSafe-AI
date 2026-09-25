"""
CropSafe AI - Sinhala Voice & Natural Audio Query Farmer Assistant
Natural language understanding (NLU) and acoustic transcript dialogue engine
enabling Sinhala-speaking rural farmers to interact with CropSafe AI using spoken voice queries.

Capabilities:
  - Phonetic & Sinhala script query intent classification.
  - Entity extraction (Crop, land extent, fertilizer type, symptoms, quoted price).
  - Autonomous routing to domain diagnostic engines (Field Wizard, Dosage Calculator, Toxicity Troubleshooter, Whistleblower Portal).
  - Conversational speech-ready response generation in Sinhala and English.
"""

import os
import sys
import re
import json
from datetime import datetime, timezone
from typing import Dict, Any, List

# Windows encoding safety
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


class VoiceFarmerAssistant:
    """Conversational voice and natural language bridge for rural farmers."""

    INTENT_KEYWORDS = {
        "INTENT_ADULTERATION_TEST": [
            "වතුර", "කිරි", "දිය", "දියවෙන්නෙ", "වැලි", "බාල", "ව්‍යාජ", "ලුණු", "හැන්ද", "පිච්චුව", "අයිස්", "ශීතල",
            "watura", "kiri", "diya", "wali", "bala", "wyaja", "lunu", "ice", "seethala", "fake"
        ],
        "INTENT_DOSAGE_CALC": [
            "අක්කර", "හෙක්ටයාර", "පර්චස්", "මිටි", "කොච්චර", "කීයක්", "ගාන", "මිල", "වියදම", "පොහොර ප්‍රමාණය", "මාත්‍රාව",
            "akkara", "hektayara", "perchas", "miti", "kochchara", "keeyak", "dosage", "bags"
        ],
        "INTENT_CROP_TOXICITY": [
            "කොළ", "කහ", "පිච්චිලා", "කරවෙලා", "මුල්", "මැළවිලා", "විෂ", "හානිය", "අග",
            "kola", "kaha", "picchila", "karawela", "mul", "wisha", "yellow", "burn", "leaf"
        ],
        "INTENT_PRICE_GOUGING": [
            "රුපියල්", "කඩේ", "මුදලාලි", "වැඩි මිල", "පාලන මිල", "කළුකඩේ", "හත්දාහක්", "අටදාහක්", "පැමිණිලි",
            "rupiyal", "kade", "wadi mila", "palana mila", "black market", "overcharge", "complaint"
        ]
    }

    def __init__(self, log_dir: str = "reports/voice_queries"):
        self.log_dir = log_dir
        os.makedirs(self.log_dir, exist_ok=True)

    def process_voice_query(self, voice_transcript: str) -> Dict[str, Any]:
        """
        Classifies speech intent, extracts agronomic entities, and constructs
        a voice response audio transcript in natural conversational Sinhala.
        """
        normalized_text = voice_transcript.lower()
        intent = self._classify_intent(normalized_text)
        entities = self._extract_entities(normalized_text)

        # Generate contextual conversational response
        if intent == "INTENT_ADULTERATION_TEST":
            response_si = (
                "ගොවි මහත්මයා, ඔබගේ පොහොර සාම්පලයේ වැලි හෝ දිය නොවන අපද්‍රව්‍ය තැන්පත් වේ නම් එය බාල පොහොරක් වීමට ඉහළ අවදානමක් ඇත. "
                "නියම යූරියා වතුරට දැමූ විගස ජලය අයිස් මෙන් ශීතල විය යුතුය. වහාම විනාකිරි බිංදු කිහිපයක් දමා පරීක්ෂා කරන්න; "
                "බුබුළු නගී නම් හුණු කුඩු මිශ්‍ර කර ඇත. කුඹුරට යෙදීමට පෙර ගොවිජන සේවා මධ්‍යස්ථානයට පෙන්වන්න."
            )
            response_en = (
                "Farmer, if your fertilizer leaves sediment or milky residue, there is high risk of adulteration. "
                "Genuine urea must cause an instant icy cold reaction. Do not apply to field until checked."
            )
            action_tag = "DISPATCH_FIELD_WIZARD"

        elif intent == "INTENT_DOSAGE_CALC":
            acres = entities.get("land_extent", 1.0)
            response_si = (
                f"අක්කර {acres:.1f}ක වගාවක් සඳහා කෘෂිකර්ම දෙපාර්තමේන්තුවේ නිර්දේශය වන්නේ යූරියා මිටි {max(1, int(acres * 1.2))}, "
                f"MOP (රතු පොහොර) මිටි {max(1, int(acres * 0.8))}, සහ TSP මිටි {max(1, int(acres * 0.6))} කි. "
                f"රජයේ සහනාධාර මිල අනුව මිටියක් රුපියල් 2,500 බැගින් ලබාගත හැකි අතර වැඩිපුර මිල නොගෙවන්න."
            )
            response_en = (
                f"For {acres:.1f} acres, DOA recommends approximately {max(1, int(acres * 1.2))} bags Urea, "
                f"{max(1, int(acres * 0.8))} bags MOP, and {max(1, int(acres * 0.6))} bags TSP at subsidized Rs. 2,500/bag."
            )
            action_tag = "DISPATCH_DOSAGE_CALCULATOR"

        elif intent == "INTENT_CROP_TOXICITY":
            response_si = (
                "පොහොර යෙදූ පසු කොළ අග කහ වීම හෝ පිච්චීම සිදුවී ඇත්නම්, එය බයියුරෙට් විෂවීමක් හෝ පොහොර සැර වැඩිවීමක් විය හැක. "
                "කඩිනමින් කුඹුරට අඟල් 2-3ක් ජලය බැඳ අතිරික්ත ලවණ සෝදා හරින්න. ඉදිරි සති දෙක තුළ කිසිදු රසායනික පොහොරක් නොයොදන්න."
            )
            response_en = (
                "If leaf tips are turning yellow or scorched, it indicates biuret toxicity or salt burn. "
                "Immediately flush the field with 2-3 inches of clean water to leach salts and pause fertilizer application."
            )
            action_tag = "DISPATCH_TOXICITY_TROUBLESHOOTER"

        elif intent == "INTENT_PRICE_GOUGING":
            response_si = (
                "රජයේ ගැසට් නිවේදනය අනුව සහනාධාර පොහොර මිටියක උපරිම පාලන මිල රුපියල් 2,500 කි. "
                "වෙළෙන්දා ඊට වඩා වැඩි මිලක් අය කරන්නේ නම්, එය නීතිවිරෝධී කළුකඩ වෙළඳාමකි. "
                "අපගේ නිර්නාමික පැමිණිලි පද්ධතිය ඔස්සේ වෙළඳසැලට එරෙහිව පාරිභෝගික කටයුතු අධිකාරියට පැමිණිල්ලක් දැන්ම ලියාපදිංචි කළ හැක."
            )
            response_en = (
                "Gazetted MRP for subsidized fertilizer is LKR 2,500. Charging higher prices is illegal black-marketing. "
                "You can log an anonymous complaint directly to the Consumer Affairs Authority via CropSafe AI."
            )
            action_tag = "DISPATCH_WHISTLEBLOWER_PORTAL"

        else:
            response_si = "ගොවි මහත්මයා, ඔබගේ කෘෂිකාර්මික විමසීම CropSafe AI වෙත ලැබුණි. කරුණාකර පොහොර වර්ගය සහ ගැටලුව පැහැදිලි කරන්න."
            response_en = "Farmer, your voice query was received. Please specify the fertilizer type and your concern."
            action_tag = "GENERAL_ASSISTANCE"

        session_id = f"VOICE-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}"
        result_payload = {
            "session_id": session_id,
            "input_transcript": voice_transcript,
            "detected_intent": intent,
            "extracted_entities": entities,
            "action_routing": action_tag,
            "speech_synthesis_transcript": {
                "sinhala_response": response_si,
                "english_translation": response_en
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        # Log session
        log_file = os.path.join(self.log_dir, f"{session_id}.json")
        with open(log_file, "w", encoding="utf-8") as f:
            json.dump(result_payload, f, indent=2, ensure_ascii=False)

        result_payload["log_file"] = log_file
        return result_payload

    def _classify_intent(self, text: str) -> str:
        scores = {}
        for intent, kw_list in self.INTENT_KEYWORDS.items():
            matches = sum(1 for kw in kw_list if kw in text)
            scores[intent] = matches
        best_intent = max(scores, key=scores.get)
        if scores[best_intent] > 0:
            return best_intent
        return "INTENT_UNKNOWN"

    def _extract_entities(self, text: str) -> Dict[str, Any]:
        entities = {}
        
        # Land extent extraction
        extent_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:අක්කර|හෙක්ටයාර|පර්චස්|akkara|acre|acres|ha)", text)
        if extent_match:
            entities["land_extent"] = float(extent_match.group(1))

        # Price extraction
        price_match = re.search(r"(\d{3,5})", text)
        if price_match:
            entities["quoted_price_lkr"] = float(price_match.group(1))

        # Fertilizer type
        if "යූරියා" in text or "urea" in text:
            entities["fertilizer_type"] = "Urea"
        elif "mop" in text or "රතු" in text or "පොටෑෂ්" in text:
            entities["fertilizer_type"] = "MOP"
        elif "tsp" in text or "සුපර්" in text or "පොස්පේට්" in text:
            entities["fertilizer_type"] = "TSP"

        return entities


if __name__ == "__main__":
    assistant = VoiceFarmerAssistant()

    # Test 1: Spoken audio query regarding adulteration in Sinhala
    q1 = "මගේ යූරියා එක වතුරට දැම්මම කිරි පාට වෙලා අඩියේ වැලි තියෙනවා, ශීතල උනෙත් නෑ මොකද කරන්නේ?"
    res1 = assistant.process_voice_query(q1)

    print("=== Sinhala Voice Farmer Assistant Evaluated ===")
    print(f"Session: {res1['session_id']}")
    print(f"Input: {res1['input_transcript']}")
    print(f"Intent: {res1['detected_intent']}")
    print(f"Action: {res1['action_routing']}")
    print(f"Voice Output (Sinhala):\n  {res1['speech_synthesis_transcript']['sinhala_response']}")
    print(f"Logged to: {res1['log_file']}")
