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


from google import genai
from google.genai import types

class VoiceFarmerAssistant:
    """Conversational voice and natural language bridge for rural farmers (Powered by Gemini AI)."""

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
        self.api_key = os.environ.get("GEMINI_API_KEY")
        self.client = None
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Failed to initialize Gemini Client: {e}")

    def process_voice_query(self, voice_transcript: str) -> Dict[str, Any]:
        """
        Calls Gemini AI for a dynamic conversational response. Falls back to hardcoded logic if no API key is provided.
        """
        session_id = f"VOICE-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}"
        normalized_text = voice_transcript.lower()
        
        # If we have Gemini AI configured, use it for dynamic responses!
        if self.client:
            try:
                prompt = f"""You are 'CropSafe AI', an expert agricultural AI assistant in Sri Lanka helping rural farmers.
Answer the following farmer's question dynamically, accurately, and naturally in Sinhala.
Keep your response conversational but concise (maximum 2-3 sentences).
Focus on fertilizers, paddy, crop diseases, and agronomic advice. Be friendly and professional.

Farmer's Question: {voice_transcript}
"""
                response = self.client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                )
                
                sinhala_reply = response.text.strip()
                
                # Still try to extract intents for UI routing, but use Gemini's text
                intent = self._classify_intent(normalized_text)
                entities = self._extract_entities(normalized_text)
                
                result_payload = {
                    "session_id": session_id,
                    "input_transcript": voice_transcript,
                    "detected_intent": intent if intent != "INTENT_UNKNOWN" else "DYNAMIC_AI_RESPONSE",
                    "extracted_entities": entities,
                    "action_routing": "GENERAL_ASSISTANCE",
                    "speech_synthesis_transcript": {
                        "sinhala_response": sinhala_reply,
                        "english_translation": "Dynamically generated via Gemini AI."
                    },
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                self._log_session(result_payload, session_id)
                return result_payload
                
            except Exception as e:
                print(f"Gemini API Error: {e}")
                # Fallback to hardcoded logic if Gemini fails
        
        # --- FALLBACK HARDCODED LOGIC ---
        return self._hardcoded_fallback_logic(normalized_text, voice_transcript, session_id)

    def _hardcoded_fallback_logic(self, normalized_text: str, voice_transcript: str, session_id: str) -> Dict[str, Any]:
        intent = self._classify_intent(normalized_text)
        entities = self._extract_entities(normalized_text)

        if intent == "INTENT_ADULTERATION_TEST":
            response_si = (
                "ගොවි මහත්මයා, ඔබගේ පොහොර සාම්පලයේ වැලි හෝ දිය නොවන අපද්‍රව්‍ය තැන්පත් වේ නම් එය බාල පොහොරක් වීමට ඉහළ අවදානමක් ඇත. "
                "නියම යූරියා වතුරට දැමූ විගස ජලය අයිස් මෙන් ශීතල විය යුතුය. වහාම විනාකිරි බිංදු කිහිපයක් දමා පරීක්ෂා කරන්න; "
                "බුබුළු නගී නම් හුණු කුඩු මිශ්‍ර කර ඇත. කුඹුරට යෙදීමට පෙර ගොවිජන සේවා මධ්‍යස්ථානයට පෙන්වන්න."
            )
            response_en = "Farmer, if your fertilizer leaves sediment, there is high risk of adulteration."
            action_tag = "DISPATCH_FIELD_WIZARD"

        elif intent == "INTENT_DOSAGE_CALC":
            acres = entities.get("land_extent", 1.0)
            response_si = (
                f"අක්කර {acres:.1f}ක වගාවක් සඳහා කෘෂිකර්ම දෙපාර්තමේන්තුවේ නිර්දේශය වන්නේ යූරියා මිටි {max(1, int(acres * 1.2))}, "
                f"MOP (රතු පොහොර) මිටි {max(1, int(acres * 0.8))}, සහ TSP මිටි {max(1, int(acres * 0.6))} කි. "
                f"රජයේ සහනාධාර මිල අනුව මිටියක් රුපියල් 2,500 බැගින් ලබාගත හැකි අතර වැඩිපුර මිල නොගෙවන්න."
            )
            response_en = f"For {acres:.1f} acres, DOA recommends approximately {max(1, int(acres * 1.2))} bags Urea."
            action_tag = "DISPATCH_DOSAGE_CALCULATOR"

        elif intent == "INTENT_CROP_TOXICITY":
            response_si = (
                "පොහොර යෙදූ පසු කොළ අග කහ වීම හෝ පිච්චීම සිදුවී ඇත්නම්, එය බයියුරෙට් විෂවීමක් හෝ පොහොර සැර වැඩිවීමක් විය හැක. "
                "කඩිනමින් කුඹුරට අඟල් 2-3ක් ජලය බැඳ අතිරික්ත ලවණ සෝදා හරින්න. ඉදිරි සති දෙක තුළ කිසිදු රසායනික පොහොරක් නොයොදන්න."
            )
            response_en = "If leaf tips are turning yellow or scorched, it indicates biuret toxicity or salt burn."
            action_tag = "DISPATCH_TOXICITY_TROUBLESHOOTER"

        elif intent == "INTENT_PRICE_GOUGING":
            response_si = (
                "රජයේ ගැසට් නිවේදනය අනුව සහනාධාර පොහොර මිටියක උපරිම පාලන මිල රුපියල් 2,500 කි. "
                "වෙළෙන්දා ඊට වඩා වැඩි මිලක් අය කරන්නේ නම්, එය නීතිවිරෝධී කළුකඩ වෙළඳාමකි. "
                "අපගේ නිර්නාමික පැමිණිලි පද්ධතිය ඔස්සේ වෙළඳසැලට එරෙහිව පාරිභෝගික කටයුතු අධිකාරියට පැමිණිල්ලක් දැන්ම ලියාපදිංචි කළ හැක."
            )
            response_en = "Gazetted MRP for subsidized fertilizer is LKR 2,500. Charging higher prices is illegal."
            action_tag = "DISPATCH_WHISTLEBLOWER_PORTAL"

        else:
            response_si = "ගොවි මහත්මයා, මට Gemini AI සක්‍රීය කර නොමැති බැවින් සියලුම ප්‍රශ්න වලට පිළිතුරු දීමට නොහැක. කරුණාකර API Key එක ලබා දෙන්න."
            response_en = "Farmer, my Gemini AI is currently inactive. Please provide an API key for dynamic responses."
            action_tag = "GENERAL_ASSISTANCE"

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

        self._log_session(result_payload, session_id)
        return result_payload

    def _log_session(self, payload: Dict[str, Any], session_id: str):
        log_file = os.path.join(self.log_dir, f"{session_id}.json")
        with open(log_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        payload["log_file"] = log_file

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
