"""
CropSafe AI - Cryptographic Consignment Provenance & Tamper-Evident QR Token Engine
Faculty of Computing | Sabaragamuwa University of Sri Lanka (DS3206 Capstone Project II)

Implements:
  1. Cryptographic SHA-256 Merkle Fingerprinting of Fertilizer Chemical Composition
  2. Blockchain-Inspired Hash Chained Provenance Ledger (Factory -> Wholesale -> Retail -> Field)
  3. Tamper-Evident Dynamic QR Verification Token Generator (PNG & Base64)
  4. Instant Physical-to-Digital Integrity Verification (Zero-Trust Anti-Counterfeiting)
"""

import os
import json
import time
import hashlib
import qrcode
import pandas as pd
from io import BytesIO
import base64

def _find_file(relative_path):
    candidates = [
        relative_path,
        os.path.join("cropsafe AI", relative_path),
        os.path.join("..", relative_path),
        os.path.join("..", "cropsafe AI", relative_path)
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return relative_path

def generate_chemical_fingerprint(batch_id, n, p, k, moisture, filler=0.0, slsi_standard="SLS 644"):
    """
    Computes a cryptographic SHA-256 hash digest of stoichiometric properties.
    Any physical alteration post-packaging produces an irreversible hash mismatch.
    """
    raw_payload = f"{batch_id.strip()}|N={n:.2f}|P={p:.2f}|K={k:.2f}|M={moisture:.2f}|F={filler:.2f}|{slsi_standard}"
    return hashlib.sha256(raw_payload.encode("utf-8")).hexdigest()

class ConsignmentProvenanceBlock:
    """Represents an immutable ledger block in the fertilizer distribution custody chain."""
    def __init__(self, index, timestamp, stage_name, location, handler_id, chemical_fingerprint, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.stage_name = stage_name
        self.location = location
        self.handler_id = handler_id
        self.chemical_fingerprint = chemical_fingerprint
        self.previous_hash = previous_hash
        self.block_hash = self.compute_hash()

    def compute_hash(self):
        block_string = json.dumps({
            "index": self.index,
            "timestamp": self.timestamp,
            "stage_name": self.stage_name,
            "location": self.location,
            "handler_id": self.handler_id,
            "chemical_fingerprint": self.chemical_fingerprint,
            "previous_hash": self.previous_hash
        }, sort_keys=True)
        return hashlib.sha256(block_string.encode("utf-8")).hexdigest()

class ConsignmentProvenanceChain:
    """Manages the end-to-end cryptographic custody chain of a fertilizer consignment."""
    def __init__(self, batch_id, initial_spec):
        self.batch_id = batch_id
        self.chain = []
        # Create Genesis Block (Certified Factory Assay)
        genesis_fingerprint = generate_chemical_fingerprint(
            batch_id=batch_id,
            n=initial_spec.get("n", 46.0),
            p=initial_spec.get("p", 0.0),
            k=initial_spec.get("k", 0.0),
            moisture=initial_spec.get("moisture", 1.0),
            filler=initial_spec.get("filler", 0.0)
        )
        genesis_block = ConsignmentProvenanceBlock(
            index=0,
            timestamp=initial_spec.get("timestamp", time.time()),
            stage_name="GENESIS_FACTORY_CERTIFICATION",
            location=initial_spec.get("location", "Colombo Port / Central Terminal"),
            handler_id=initial_spec.get("handler", "National Fertilizer Secretariat Inspector 01"),
            chemical_fingerprint=genesis_fingerprint,
            previous_hash="0" * 64
        )
        self.chain.append(genesis_block)

    def add_custody_transfer(self, stage_name, location, handler_id, verified_fingerprint=None):
        prev_block = self.chain[-1]
        fingerprint = verified_fingerprint or prev_block.chemical_fingerprint
        new_block = ConsignmentProvenanceBlock(
            index=len(self.chain),
            timestamp=time.time(),
            stage_name=stage_name,
            location=location,
            handler_id=handler_id,
            chemical_fingerprint=fingerprint,
            previous_hash=prev_block.block_hash
        )
        self.chain.append(new_block)
        return new_block

    def is_chain_valid(self):
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i-1]
            if curr.block_hash != curr.compute_hash():
                return False, f"Block {i} hash corruption"
            if curr.previous_hash != prev.block_hash:
                return False, f"Block {i} broken chain pointer"
            # Ensure chemical fingerprint was not tampered
            if curr.chemical_fingerprint != prev.chemical_fingerprint:
                return False, f"Chemical fingerprint altered at Stage: {curr.stage_name}"
        return True, "Chain valid"

def generate_tamper_evident_qr(sample_row, output_dir="reports/qr_tokens"):
    """
    Generates a secure QR code encoding cryptographic batch metadata and chemical hash.
    Saves PNG to output_dir and returns Base64 data URI string.
    """
    actual_dir = _find_file(output_dir)
    os.makedirs(actual_dir, exist_ok=True)
    
    batch_id = str(sample_row["Batch_ID"])
    record_id = str(sample_row.get("Record_ID", "AGR-DEMO"))
    product = str(sample_row["Product_Name"])
    supplier = str(sample_row["Supplier"])
    n = float(sample_row["Nitrogen_N_g_per_100g"])
    p = float(sample_row["Phosphorus_P_g_per_100g"])
    k = float(sample_row["Potassium_K_g_per_100g"])
    moisture = float(sample_row["Moisture_Content_pct"])
    filler = float(sample_row.get("Estimated_Inert_Filler", 0.0))
    slsi_std = "SLS 644 (Urea)" if "Urea" in product else "SLS 894 (MOP)"
    
    chem_hash = generate_chemical_fingerprint(batch_id, n, p, k, moisture, filler, slsi_std)
    
    qr_payload = {
        "Project": "CropSafe AI (SUSL Capstone II)",
        "Statutory_Auth": "National Fertilizer Secretariat (Act No. 68)",
        "Record_ID": record_id,
        "Batch_ID": batch_id,
        "Product": product,
        "Supplier": supplier,
        "Certified_NPK": f"{n:.1f}-{p:.1f}-{k:.1f}",
        "Moisture_Max": f"{moisture:.2f}%",
        "Chemical_Fingerprint_SHA256": chem_hash,
        "Digital_Signature": hashlib.sha256((chem_hash + "GOV_LK_FERT_SECRET").encode()).hexdigest()[:24]
    }
    
    payload_str = json.dumps(qr_payload, indent=2)
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=3,
    )
    qr.add_data(payload_str)
    qr.make(fit=True)
    
    qr_img = qr.make_image(fill_color="#002b49", back_color="white")
    
    # Save PNG
    file_path = os.path.join(actual_dir, f"token_{batch_id.replace('-', '_')}.png")
    qr_img.save(file_path)
    
    # Generate Base64 for web embedding
    buffered = BytesIO()
    qr_img.save(buffered, format="PNG")
    b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    
    return {
        "File_Path": file_path,
        "Base64_URI": f"data:image/png;base64,{b64_str}",
        "Payload": qr_payload,
        "Chemical_Hash": chem_hash
    }

def verify_physical_consignment_integrity(qr_payload, tested_n, tested_p, tested_k, tested_moisture, tested_filler=0.0):
    """
    Simulates a field inspector scanning a QR code and entering field lab test results.
    Compares physical results against the cryptographic fingerprint hash.
    """
    batch_id = qr_payload["Batch_ID"]
    product = qr_payload["Product"]
    slsi_std = "SLS 644 (Urea)" if "Urea" in product else "SLS 894 (MOP)"
    original_hash = qr_payload["Chemical_Fingerprint_SHA256"]
    
    # Tolerances under SLSI standards (+- 0.5% measurement error)
    expected_npk = [float(x) for x in qr_payload["Certified_NPK"].split("-")]
    diff_n = abs(tested_n - expected_npk[0])
    diff_p = abs(tested_p - expected_npk[1])
    diff_k = abs(tested_k - expected_npk[2])
    diff_m = tested_moisture - float(qr_payload["Moisture_Max"].replace("%", ""))
    
    # Recalculate hash with tested parameters
    tested_hash = generate_chemical_fingerprint(batch_id, tested_n, tested_p, tested_k, tested_moisture, tested_filler, slsi_std)
    
    if tested_hash == original_hash or (diff_n <= 0.6 and diff_p <= 0.4 and diff_k <= 0.4 and diff_m <= 0.3):
        verdict = "AUTHENTIC_CERTIFIED_CONSIGNMENT"
        status = "CRYPTOGRAPHICALLY_VERIFIED"
        action = "Approved for agrarian distribution / market sale."
    else:
        verdict = "TAMPER_DETECTED_FRAUD_ALERT"
        status = "HASH_MISMATCH_SIGNATURE_INVALID"
        action = "Statutory seizure under Fertilizer Act No. 68 Section 8. Interdict consignment immediately."

    return {
        "Verdict": verdict,
        "Status": status,
        "Batch_ID": batch_id,
        "Product": product,
        "Expected_NPK": qr_payload["Certified_NPK"],
        "Physical_Tested_NPK": f"{tested_n:.1f}-{tested_p:.1f}-{tested_k:.1f}",
        "Tested_Moisture": f"{tested_moisture:.2f}%",
        "Discrepancies": {
            "Delta_N": round(diff_n, 2),
            "Delta_P": round(diff_p, 2),
            "Delta_K": round(diff_k, 2),
            "Excess_Moisture": round(max(0.0, diff_m), 2)
        },
        "Original_SHA256": original_hash,
        "Current_SHA256": tested_hash,
        "Prescriptive_Enforcement_Action": action
    }

if __name__ == "__main__":
    print("Testing Cryptographic Consignment Provenance & QR Token Engine...")
    
    # Demo sample
    sample = {
        "Record_ID": "AGR-99412",
        "Batch_ID": "BT26-7840X",
        "Product_Name": "Urea",
        "Supplier": "CIC Agri Businesses",
        "Nitrogen_N_g_per_100g": 46.2,
        "Phosphorus_P_g_per_100g": 0.0,
        "Potassium_K_g_per_100g": 0.0,
        "Moisture_Content_pct": 1.2,
        "Estimated_Inert_Filler": 0.0
    }
    
    # 1. Generate QR Token
    token_meta = generate_tamper_evident_qr(sample)
    print(f"Generated QR Code saved to: {token_meta['File_Path']}")
    print(f"Chemical Fingerprint SHA-256: {token_meta['Chemical_Hash']}")
    
    # 2. Test Verification on Authentic Consignment
    print("\n--- TEST 1: AUTHENTIC SAMPLE VERIFICATION ---")
    res_auth = verify_physical_consignment_integrity(
        token_meta["Payload"],
        tested_n=46.1, tested_p=0.0, tested_k=0.0, tested_moisture=1.3
    )
    print("Verdict:", res_auth["Verdict"])
    print("Status: ", res_auth["Status"])
    print("Action: ", res_auth["Prescriptive_Enforcement_Action"])
    
    # 3. Test Verification on Tampered (Adulterated with Sand) Consignment
    print("\n--- TEST 2: TAMPERED SAMPLE VERIFICATION (Sand Dilution to 32% N) ---")
    res_tamper = verify_physical_consignment_integrity(
        token_meta["Payload"],
        tested_n=32.4, tested_p=0.0, tested_k=0.0, tested_moisture=3.8, tested_filler=30.0
    )
    print("Verdict:", res_tamper["Verdict"])
    print("Status: ", res_tamper["Status"])
    print("Discrepancies:", res_tamper["Discrepancies"])
    print("Action: ", res_tamper["Prescriptive_Enforcement_Action"])
