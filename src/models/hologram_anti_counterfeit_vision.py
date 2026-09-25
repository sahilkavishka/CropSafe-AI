"""
CropSafe AI - Anti-Counterfeit Packaging, Security Hologram & Stitching Pattern Verifier
Module: src/models/hologram_anti_counterfeit_vision.py
Author: Sabaragamuwa University of Sri Lanka (SUSL) - DS3206 Capstone Project II

Functionality:
1. Computer Vision & optical inspection engine for fertilizer packaging authenticity.
2. Evaluates state fertilizer corporations (Ceylon Fertilizer Co. / Commercial Fertilizer Co. / "ලක්පොහොර").
3. Inspects:
   - Security Hologram Optical Diffraction & Kinetic Rainbow Reflection (Laser-embossed vs flat foil)
   - Micro-print Typography & Edge Bleed (Gravure vs counterfeit silkscreen blur)
   - Industrial Bag Hem Stitching Integrity (ISO 4915 Double-thread chainstitch vs fake manual nylon lockstitch)
   - Tamper-Evident Seal Indicator
4. Generates an Authenticity Score (0-100%) and instant CAA/Police seizure alerts.
"""

import os
import sys
import json
import logging
import numpy as np
from typing import Dict, List, Any
from datetime import datetime

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("HologramAntiCounterfeitVision")

# Genuine statutory packaging benchmarks
GENUINE_SPEC_BENCHMARKS = {
    "ceylon_fertilizer_lakpohora": {
        "brand_name": "Ceylon Fertilizer Co. (Lakpohora - ලක්පොහොර)",
        "hologram_diffraction_min_contrast": 0.72,
        "micro_text_fidelity_min": 0.85,
        "stitch_pattern": "ISO_4915_Type_401_Double_Chainstitch",
        "official_color_hex": "#1E824C"
    },
    "commercial_fertilizer_ltd": {
        "brand_name": "Colombo Commercial Fertilizers Ltd.",
        "hologram_diffraction_min_contrast": 0.70,
        "micro_text_fidelity_min": 0.82,
        "stitch_pattern": "ISO_4915_Type_401_Double_Chainstitch",
        "official_color_hex": "#2980B9"
    }
}

class HologramAntiCounterfeitVisionEngine:
    """Evaluates fertilizer bag packaging, security hologram, and industrial closure stitching."""

    def __init__(self):
        self.specs = GENUINE_SPEC_BENCHMARKS

    def verify_packaging(
        self,
        brand_key: str,
        hologram_diffraction_score: float,   # 0.0 to 1.0 (optical rainbow shimmer)
        microprint_sharpness_score: float,   # 0.0 to 1.0 (micro-font edge gradient)
        stitch_type_detected: str,          # "double_chainstitch", "single_lockstitch", "irregular_handsewn"
        seal_tamper_flag: bool = False
    ) -> Dict[str, Any]:
        """
        Conducts forensic vision packaging evaluation.
        
        Args:
            brand_key: Key in GENUINE_SPEC_BENCHMARKS
            hologram_diffraction_score: Measured spectral reflection variance
            microprint_sharpness_score: Gradient edge sharpness of regulatory text
            stitch_type_detected: Stitch pattern detected along the top bag closure hem
            seal_tamper_flag: True if tear-strip or puncture marks observed
        """
        clean_key = brand_key.strip().lower()
        if clean_key not in self.specs:
            clean_key = "ceylon_fertilizer_lakpohora"

        spec = self.specs[clean_key]
        anomalies = []

        # 1. Hologram verification
        hologram_pass = hologram_diffraction_score >= spec["hologram_diffraction_min_contrast"]
        if not hologram_pass:
            anomalies.append({
                "component": "Security Hologram",
                "issue_en": "Flat non-diffractive reflective foil sticker detected; lacks authentic 3D laser kinetic grating.",
                "issue_si": "ව්‍යාජ පැතලි ස්ටිකරයකි. නියම ත්‍රිමාණ ලේසර් Hologram වර්ණාවලිය නොමැත."
            })

        # 2. Micro-print Typography
        print_pass = microprint_sharpness_score >= spec["micro_text_fidelity_min"]
        if not print_pass:
            anomalies.append({
                "component": "Micro-print Typography",
                "issue_en": "Silkscreen ink bleed detected on statutory text; low-resolution printing plates used.",
                "issue_si": "අකුරු වල තීන්ත විසිරී ඇති අඩු තාක්ෂණික තිර මුද්‍රණයකි (Screen-print). නියම රජයේ මුද්‍රණ තත්ත්වය නොවේ."
            })

        # 3. Stitching Pattern
        stitch_clean = stitch_type_detected.strip().lower()
        stitch_pass = "double_chainstitch" in stitch_clean
        if not stitch_pass:
            anomalies.append({
                "component": "Closure Stitching",
                "issue_en": f"Non-standard bag closure detected: '{stitch_type_detected}'. Factory uses Type 401 double-thread chainstitch.",
                "issue_si": "අත් මැහුම් යන්ත්‍රයකින් මසන ලද ලිහිල් තනි නූල් මැස්මකි. කර්මාන්තශාලා ද්විත්ව ආරක්ෂිත මැස්ම නොවේ."
            })

        # 4. Tamper check
        if seal_tamper_flag:
            anomalies.append({
                "component": "Tamper-Evident Seal",
                "issue_en": "Bag closure shows evidence of re-stitching or secondary puncture holes.",
                "issue_si": "උරයේ මැහුම ගලවා නැවත මැසූ සිදුරු දක්නට ඇත (Re-stitched repackaging)."
            })

        # Composite Authenticity Score (0-100)
        score = (
            (hologram_diffraction_score * 35.0) +
            (microprint_sharpness_score * 35.0) +
            (30.0 if stitch_pass else 5.0) -
            (35.0 if seal_tamper_flag else 0.0)
        )
        authenticity_score = round(max(0.0, min(100.0, score)), 1)

        # Verdict
        if authenticity_score >= 82.0:
            verdict = "GENUINE_FACTORY_SEALED"
            verdict_si = "සත්‍ය කර්මාන්තශාලා මුද්‍රණයකි (නියම රජයේ පොහොර උරයකි)"
            color = "GREEN"
            action_si = "පොහොර උරයේ ආරක්ෂිත මුද්‍රණය තහවුරුයි. බෙදාහැරීම හෝ භාවිතය ආරක්ෂිතයි."
        elif authenticity_score >= 50.0:
            verdict = "SUSPECTED_TAMPERED_PACKAGING"
            verdict_si = "සැකකටයුතු උරයකි (නැවත ඇසුරුම් කළ හෝ හානි වූ මුද්‍රණයකි)"
            color = "YELLOW"
            action_si = "උරයේ මැහුම් හෝ ලාංඡනයේ විෂමතා ඇත. රසායනික පරීක්ෂාවක් (Lab assay) සිදුකරන්න."
        else:
            verdict = "COUNTERFEIT_FAKE_SACK"
            verdict_si = "ව්‍යාජ ලෙස හොර රහසේ මුද්‍රණය කළ හොර උරයකි (Counterfeit Bag)"
            color = "RED"
            action_si = "වහාම පොලීසියට සහ පාරිභෝගික අධිකාරියට (CAA) දන්වා මෙම තොගය අත්අඩංගුවට ගන්න!"

        return {
            "evaluation_timestamp": datetime.now().isoformat(),
            "brand_inspected": spec["brand_name"],
            "authenticity_score_pct": authenticity_score,
            "verdict": verdict,
            "verdict_si": verdict_si,
            "color_indicator": color,
            "inspection_breakdown": {
                "hologram_pass": hologram_pass,
                "microprint_pass": print_pass,
                "stitching_pass": stitch_pass,
                "tamper_detected": seal_tamper_flag
            },
            "anomalies_detected": anomalies,
            "field_enforcement_advisory_si": action_si
        }

if __name__ == "__main__":
    verifier = HologramAntiCounterfeitVisionEngine()

    print("=== TEST 1: Genuine Factory-Sealed Lakpohora Bag ===")
    res1 = verifier.verify_packaging(
        brand_key="ceylon_fertilizer_lakpohora",
        hologram_diffraction_score=0.88,
        microprint_sharpness_score=0.92,
        stitch_type_detected="double_chainstitch",
        seal_tamper_flag=False
    )
    print(f"Brand: {res1['brand_inspected']}")
    print(f"Authenticity Score: {res1['authenticity_score_pct']}%")
    print(f"Verdict: {res1['verdict_si']}")
    print(f"Action: {res1['field_enforcement_advisory_si']}\n")

    print("=== TEST 2: Counterfeit Bag with Fake Sticker & Hand Stitching ===")
    res2 = verifier.verify_packaging(
        brand_key="ceylon_fertilizer_lakpohora",
        hologram_diffraction_score=0.25,
        microprint_sharpness_score=0.42,
        stitch_type_detected="single_lockstitch",
        seal_tamper_flag=True
    )
    print(f"Brand: {res2['brand_inspected']}")
    print(f"Authenticity Score: {res2['authenticity_score_pct']}%")
    print(f"Verdict: {res2['verdict_si']}")
    print(f"Anomalies: {len(res2['anomalies_detected'])}")
    print(f"Action: {res2['field_enforcement_advisory_si']}")
