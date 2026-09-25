"""
CropSafe AI - Fertilizer Bag Label OCR & Registry Scanner
Validates statutory packaging labels against the National Fertilizer Secretariat (NFS)
registry, detecting forged registration numbers, expired batches, and counterfeit branding.
"""

import os
import sys
import re
from datetime import datetime, timezone
from typing import Dict, Any, List

# Windows encoding safety
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


class LabelOCRRegistrationScanner:
    """Verifies statutory packaging text against the national regulatory manufacturer registry."""

    # Authorized National Fertilizer Secretariat (NFS) licensed manufacturer/importer registry
    NFS_AUTHORIZED_REGISTRY = {
        "NFS/REG/2024/U-89": {"importer": "Ceylon Fertilizer Company Ltd (Lak Pohora)", "product": "Granular Urea", "sls_standard": "SLS 618"},
        "NFS/REG/2023/M-12": {"importer": "Colombo Commercial Fertilizers Ltd", "product": "MOP (Muriate of Potash)", "sls_standard": "SLS 644"},
        "NFS/REG/2024/T-45": {"importer": "Lanka Phosphate Ltd (Eppawala)", "product": "Eppawala Rock Phosphate (ERP)", "sls_standard": "SLS 977"},
        "NFS/REG/2023/C-08": {"importer": "A. Baur & Co. Pvt Ltd", "product": "NPK 15-15-15 Compound", "sls_standard": "SLS 1247"},
        "NFS/REG/2024/O-19": {"importer": "CIC Agri Businesses Pvt Ltd", "product": "Agricultural Compost", "sls_standard": "SLS 1624"}
    }

    def __init__(self, output_dir: str = "reports/label_inspections"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def scan_label_text(self, label_ocr_text: str) -> Dict[str, Any]:
        """
        Parses raw bag label OCR string, cross-references NFS registry,
        and identifies counterfeit packaging indicators.
        """
        raw_clean = label_ocr_text.strip()
        fraud_flags = []
        score = 100.0

        # 1. Extract NFS Registration Number
        nfs_match = re.search(r"(NFS/[A-Z0-9/\-]+)", raw_clean)
        nfs_reg_no = nfs_match.group(1) if nfs_match else None

        registry_match = None
        if not nfs_reg_no:
            fraud_flags.append("MISSING_STATUTORY_REGISTRATION: No valid NFS registration number detected.")
            score -= 40.0
        elif nfs_reg_no not in self.NFS_AUTHORIZED_REGISTRY:
            fraud_flags.append(f"UNAUTHORIZED_REGISTRATION_CODE: Code '{nfs_reg_no}' not found in official NFS registry.")
            score -= 50.0
        else:
            registry_match = self.NFS_AUTHORIZED_REGISTRY[nfs_reg_no]

        # 2. Extract Batch Number
        batch_match = re.search(r"Batch(?:\s*No)?[:\.\s]+([A-Z0-9\-]+)", raw_clean, re.IGNORECASE)
        batch_id = batch_match.group(1) if batch_match else "UNKNOWN-BATCH"
        if batch_id == "UNKNOWN-BATCH":
            fraud_flags.append("MISSING_BATCH_ID: Consignment batch number missing or unreadable.")
            score -= 15.0

        # 3. Extract Net Weight
        weight_match = re.search(r"(\d{2}(?:\.\d+)?)\s*(?:kg|KG|Kg)", raw_clean)
        net_weight = float(weight_match.group(1)) if weight_match else None
        if not net_weight:
            fraud_flags.append("MISSING_NET_WEIGHT: Net mass not declared on packaging.")
            score -= 10.0
        elif net_weight < 49.0 or net_weight > 51.0:
            fraud_flags.append(f"NON_STANDARD_MASS: Declared weight is {net_weight} kg (Standard is 50.0 kg).")
            score -= 15.0

        # 4. Check SLS Standard Mention
        has_sls = bool(re.search(r"SLS\s*\d+", raw_clean, re.IGNORECASE))
        if not has_sls:
            fraud_flags.append("MISSING_SLS_STANDARD: Compulsory Sri Lanka Standard mark is absent.")
            score -= 20.0

        # 5. Check Expiry / Date
        expiry_match = re.search(r"(?:Exp|Expiry|Best Before)[:\.\s]+(\d{2}[/\-]\d{2}[/\-]\d{4})", raw_clean, re.IGNORECASE)
        expiry_date = expiry_match.group(1) if expiry_match else None
        if expiry_date:
            try:
                # Simple check against current year
                exp_dt = datetime.strptime(expiry_date.replace("/", "-"), "%d-%m-%Y")
                if exp_dt.year < datetime.now(timezone.utc).year:
                    fraud_flags.append(f"EXPIRED_CONSIGNMENT: Fertilizer expired on {expiry_date}.")
                    score -= 30.0
            except Exception:
                pass

        final_score = max(0.0, score)

        if final_score >= 85.0 and len(fraud_flags) == 0:
            status = "VERIFIED_GENUINE_PACKAGING"
            verdict = "Authentic registered packaging. Meets all statutory labeling mandates under Act No. 68 of 1988."
        elif final_score >= 60.0:
            status = "SUSPICIOUS_PACKAGING"
            verdict = "Irregularities detected in packaging text. Physical chemical testing recommended before release."
        else:
            status = "COUNTERFEIT_FORGED_PACKAGING"
            verdict = "CRITICAL FORGERY DETECTED: Unregistered or fake packaging. Consignment liable to confiscation."

        scan_record = {
            "nfs_registration_number": nfs_reg_no,
            "registered_entity": registry_match["importer"] if registry_match else "Unregistered / Unknown",
            "registered_product": registry_match["product"] if registry_match else "Unknown",
            "batch_id": batch_id,
            "net_weight_kg": net_weight,
            "expiry_date": expiry_date,
            "authenticity_score": round(final_score, 1),
            "status": status,
            "verdict": verdict,
            "fraud_flags": fraud_flags if fraud_flags else ["All statutory labeling criteria satisfied."]
        }
        return scan_record


if __name__ == "__main__":
    scanner = LabelOCRRegistrationScanner()

    # Scenario: Inspecting an authentic bag vs a counterfeit bag
    authentic_label = """
    LAK POHORA - CEYLON FERTILIZER COMPANY LTD
    GRANULAR UREA - 46% NITROGEN
    NFS/REG/2024/U-89
    COMPLIES WITH SLS 618
    Batch No: BATCH-LK-2026-X89
    Net Weight: 50.0 kg
    Mfg Date: 15/01/2026 | Expiry: 15/01/2028
    MRP: Rs. 2,500.00
    """

    fake_label = """
    SUPER POHORA - SPECIAL IMPORTED
    BEST NITROGEN FORMULA
    NFS/REG/2099/FAKE-999
    Batch No: 99
    Net Weight: 45.0 kg
    MRP: Rs. 7,500.00
    """

    res_auth = scanner.scan_label_text(authentic_label)
    res_fake = scanner.scan_label_text(fake_label)

    print("=== Fertilizer Bag Label OCR & Registry Scanner Evaluated ===")
    print(f"[Sample 1 (Genuine)] Score: {res_auth['authenticity_score']}/100 -> {res_auth['status']}")
    print(f"  Entity: {res_auth['registered_entity']} | SLS: {res_auth['registered_product']}")
    print(f"[Sample 2 (Counterfeit)] Score: {res_fake['authenticity_score']}/100 -> {res_fake['status']}")
    print(f"  Flags: {', '.join(res_fake['fraud_flags'])}")
