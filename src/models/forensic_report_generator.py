"""
CropSafe AI - Production Statutory Forensic Report Generator
Grounded in Fertilizer Act No. 68 of 1988 and SLSI Standards SLS 644/894/847/1247.
"""
import numpy as np
import pandas as pd

def generate_statutory_certificate_dict(sample_dict, model, preprocessor, features, class_names):
    sample_df = pd.DataFrame([sample_dict])[features]
    x_proc = preprocessor.transform(sample_df)
    probs = model.predict_proba(x_proc)[0]
    pred_idx = int(np.argmax(probs))
    pred_class = class_names[pred_idx]
    confidence = float(probs[pred_idx])

    violations = []
    enforcement = ""

    if pred_class == "Heavy_Insoluble_Filler":
        violations.append("Section 8(1)(a) of Fertilizer Act No. 68 of 1988 (Inert Matter Prohibition)")
        violations.append("SLS 894 / SLS 847: Insoluble foreign matter exceeds permissible ceiling.")
        enforcement = "SEIZURE & FORFEITURE: Impound consignment under Section 12. Notice for prosecution under Section 19."
    elif pred_class == "Moisture_Weight_Padding":
        violations.append("Section 8(1)(c) of Fertilizer Act No. 68 of 1988 (Moisture Weight Inflation)")
        violations.append("SLS 644 / SLS 894: Measured moisture exceeds statutory ceiling.")
        enforcement = "QUARANTINE ORDER: Commercial detention under Section 13. Mandatory re-drying or forfeiture."
    elif pred_class == "Substandard_Blend":
        violations.append("Section 8(1)(b) of Fertilizer Act No. 68 of 1988 (Nutrient Divergence)")
        violations.append("SLS 1247: Active nutrient deficit exceeds tolerance margin.")
        enforcement = "LICENSE SUSPENSION NOTICE: Sale prohibited under Section 5. Mandatory penalty and re-formulation."
    else:
        violations.append("None. Consignment complies with all SLSI and NFS standards.")
        enforcement = "CERTIFIED COMPLIANT: Cleared for unrestricted agrarian distribution."

    return {
        "certificate_id": f"NFS-CERT-2026-{sample_dict.get('Batch_ID', 'BATCH')}",
        "batch_id": sample_dict.get('Batch_ID', 'BATCH'),
        "product_name": sample_dict.get('Product_Name', 'Fertilizer'),
        "supplier": sample_dict.get('Supplier', 'Unknown'),
        "region": sample_dict.get('Region', 'Sri Lanka'),
        "verdict": pred_class,
        "is_compliant": (pred_class == "Standard_Pure"),
        "confidence_pct": round(confidence * 100, 2),
        "violations": violations,
        "enforcement_directive": enforcement
    }
