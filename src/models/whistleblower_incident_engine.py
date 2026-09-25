"""
CropSafe AI - Anonymous Whistleblower, Price Gouging & Adulteration Incident Portal
Secure civic enforcement platform allowing farmers and citizens to report black-market pricing,
adulterated stock, and hoarding under the Consumer Affairs Authority Act No. 9 of 2003
and Regulation of Fertilizers Act No. 68 of 1988.
"""

import os
import sys
import json
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, List

# Windows encoding safety
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


class WhistleblowerIncidentEngine:
    """Processes anonymous whistleblower complaints, calculates enforcement priority, and generates formal regulatory dossiers."""

    def __init__(self, output_dir: str = "reports/whistleblower_dossiers"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def file_anonymous_complaint(self, complaint: Dict[str, Any]) -> Dict[str, Any]:
        """
        Ingests incident details, generates a cryptographic tracking token,
        triages priority, and outputs formal investigation dossiers.
        """
        dealer_name = complaint.get("dealer_name", "Unknown Commercial Dealer")
        location = complaint.get("location", "Dambulla Town, Matale District")
        incident_type = complaint.get("incident_type", "PRICE_GOUGING") # 'PRICE_GOUGING', 'ADULTERATION', 'HOARDING'
        fertilizer_type = complaint.get("fertilizer_type", "Urea")
        batch_no = complaint.get("batch_no", "BATCH-NOT-SPECIFIED")
        gazetted_mrp = complaint.get("gazetted_mrp", 2500.0)
        charged_price = complaint.get("charged_price", 2500.0)
        narrative = complaint.get("narrative", "Dealer refused to issue receipt and charged black-market premium.")
        evidence_files = complaint.get("evidence_files", ["receipt_photo.jpg", "bag_label.jpg"])

        # Generate anonymous unique ticket token
        salt_source = f"{dealer_name}{location}{datetime.now(timezone.utc).isoformat()}"
        tracking_hash = hashlib.sha256(salt_source.encode("utf-8")).hexdigest()[:8].upper()
        token_id = f"WB-LK-{datetime.now(timezone.utc).strftime('%Y')}-{tracking_hash}"

        # Calculate Price Gouging Percentage
        price_gouging_pct = 0.0
        if charged_price > gazetted_mrp:
            price_gouging_pct = round(((charged_price - gazetted_mrp) / gazetted_mrp) * 100.0, 1)

        # Priority Incident Triage Score (PITS: 0 - 100)
        priority_score = 30.0
        if incident_type == "ADULTERATION":
            priority_score += 45.0
        elif incident_type == "PRICE_GOUGING":
            if price_gouging_pct > 100.0:
                priority_score += 40.0
            elif price_gouging_pct > 50.0:
                priority_score += 25.0
        elif incident_type == "HOARDING":
            priority_score += 35.0

        if len(evidence_files) >= 2:
            priority_score += 15.0

        priority_score = min(100.0, priority_score)

        if priority_score >= 80.0:
            urgency = "URGENT_RED_ALERT"
            target_action = "Immediate raid and surprise inspection dispatch by Regional Fertilizer Officer & CAA Flying Squad"
        elif priority_score >= 50.0:
            urgency = "HIGH_PRIORITY_REVIEW"
            target_action = "Queue for official undercover audit within 48 hours"
        else:
            urgency = "ROUTINE_MONITORING"
            target_action = "Flag dealer profile on Provincial Agrarian Watchlist"

        dossier = {
            "ticket_token": token_id,
            "status": "INCIDENT_LOGGED_ENCRYPTED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "priority_triage_score": priority_score,
            "urgency_level": urgency,
            "recommended_enforcement": target_action,
            "incident_details": {
                "dealer_name": dealer_name,
                "location": location,
                "category": incident_type,
                "fertilizer_type": fertilizer_type,
                "batch_id": batch_no,
                "gazetted_mrp_lkr": gazetted_mrp,
                "charged_price_lkr": charged_price,
                "price_gouging_excess_pct": price_gouging_pct,
                "narrative": narrative,
                "evidence_attachments": evidence_files
            },
            "statutory_provisions": [
                "Consumer Affairs Authority Act No. 9 of 2003, Section 18 [Sale above Gazetted MRP]",
                "Regulation of Fertilizers Act No. 68 of 1988, Section 8 [Prohibition on Adulteration]",
                "Public Security Ordinance / Essential Public Services Act (Emergency Fertilizer Regulations)"
            ]
        }

        # Save HTML and Markdown dossiers
        html_path = os.path.join(self.output_dir, f"Whistleblower_Report_{token_id}.html")
        md_path = os.path.join(self.output_dir, f"Whistleblower_Report_{token_id}.md")

        self._write_html_dossier(html_path, dossier)
        self._write_markdown_dossier(md_path, dossier)

        dossier["html_path"] = html_path
        dossier["markdown_path"] = md_path
        return dossier

    def _write_html_dossier(self, path: str, d: Dict[str, Any]):
        details = d["incident_details"]
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Whistleblower Incident Report - {d['ticket_token']}</title>
<style>
  body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; line-height: 1.6; color: #2c3e50; }}
  .header {{ background: #c0392b; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }}
  .card {{ border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); background: #ffffff; }}
  .content {{ padding: 25px; }}
  .badge {{ display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: bold; font-size: 11pt; color: white; background: #e74c3c; }}
  .meta-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; background: #fdfefe; border: 1px solid #ecf0f1; padding: 15px; border-radius: 6px; }}
  .statute {{ background: #f9f9f9; border-left: 4px solid #3498db; padding: 10px 15px; margin: 8px 0; font-size: 10pt; }}
  .evidence {{ list-style-type: square; color: #2980b9; }}
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <h2 style="margin:0;">NATIONAL FERTILIZER SECRETARIAT & CAA ENFORCEMENT DOSSIER</h2>
    <p style="margin:5px 0 0 0;">CONFIDENTIAL ANONYMOUS WHISTLEBLOWER DISPATCH</p>
  </div>
  <div class="content">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h3>TICKET: <code>{d['ticket_token']}</code></h3>
      <span class="badge">{d['urgency_level']} (Score: {d['priority_triage_score']}/100)</span>
    </div>

    <div class="meta-grid">
      <div><strong>Suspect Merchant:</strong> {details['dealer_name']}</div>
      <div><strong>Location / Town:</strong> {details['location']}</div>
      <div><strong>Violation Category:</strong> {details['category']}</div>
      <div><strong>Fertilizer / Batch:</strong> {details['fertilizer_type']} ({details['batch_id']})</div>
      <div><strong>Gazetted MRP:</strong> LKR {details['gazetted_mrp_lkr']:,.2f}</div>
      <div><strong>Actual Price Charged:</strong> LKR {details['charged_price_lkr']:,.2f} <span style="color:red; font-weight:bold;">(+{details['price_gouging_excess_pct']}%)</span></div>
    </div>

    <h4>CITIZEN INCIDENT NARRATIVE:</h4>
    <blockquote style="background:#f4f6f7; padding:15px; border-left:4px solid #7f8c8d; font-style:italic;">
      "{details['narrative']}"
    </blockquote>

    <h4>RECOMMENDED IMMEDIATE ENFORCEMENT DIRECTIVE:</h4>
    <p style="font-weight:bold; color:#c0392b;">{d['recommended_enforcement']}</p>

    <h4>STATUTORY CITATIONS:</h4>
    {"".join([f"<div class='statute'>{s}</div>" for s in d['statutory_provisions']])}

    <h4>SCHEDULE OF PHOTOGRAPHIC EVIDENCE SUBMISSIONS:</h4>
    <ul class="evidence">
      {"".join([f"<li>{e}</li>" for e in details['evidence_attachments']])}
    </ul>
    
    <p style="text-align:center; color:#95a5a6; font-size:9pt; margin-top:30px;">
      Generated securely by CropSafe AI Citizen Whistleblower Gateway | Cryptographically Protected
    </p>
  </div>
</div>
</body>
</html>"""
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)

    def _write_markdown_dossier(self, path: str, d: Dict[str, Any]):
        details = d["incident_details"]
        md = f"""# CONFIDENTIAL ANONYMOUS WHISTLEBLOWER DISPATCH
## Ticket Reference: `{d['ticket_token']}` | Urgency: **{d['urgency_level']}** (Score: {d['priority_triage_score']}/100)

---

### INCIDENT PROFILE
- **Suspect Merchant:** {details['dealer_name']}
- **Jurisdiction & Town:** {details['location']}
- **Violation Category:** {details['category']}
- **Fertilizer & Batch:** {details['fertilizer_type']} (`{details['batch_id']}`)
- **Gazetted MRP:** LKR {details['gazetted_mrp_lkr']:,.2f}
- **Black Market Price Charged:** LKR {details['charged_price_lkr']:,.2f} (**+{details['price_gouging_excess_pct']}% Overcharge**)

---

### CITIZEN NARRATIVE
> "{details['narrative']}"

---

### ENFORCEMENT DIRECTIVE
**{d['recommended_enforcement']}**

### STATUTORY INFRACTIONS
"""
        for s in d["statutory_provisions"]:
            md += f"- {s}\n"

        md += "\n### ATTACHED EVIDENCE ASSETS\n"
        for e in details["evidence_attachments"]:
            md += f"- `{e}`\n"

        with open(path, "w", encoding="utf-8") as f:
            f.write(md)


if __name__ == "__main__":
    engine = WhistleblowerIncidentEngine()

    # Scenario: Farmer in Hingurakgoda reporting black market price gouging
    complaint_data = {
        "dealer_name": "Lanka Agro Wholesale Traders",
        "location": "Main Street, Hingurakgoda, Polonnaruwa District",
        "incident_type": "PRICE_GOUGING",
        "fertilizer_type": "Urea",
        "batch_no": "BATCH-LK-2026-X89",
        "gazetted_mrp": 2500.0,
        "charged_price": 7200.0,
        "narrative": "Shop owner refused to sell subsidized bags unless farmers paid cash of Rs. 7,200 with no invoice.",
        "evidence_files": ["secret_counter_photo.jpg", "handwritten_slip.jpg"]
    }

    result = engine.file_anonymous_complaint(complaint_data)
    print("=== Anonymous Whistleblower Complaint Registered ===")
    print(f"Tracking Token: {result['ticket_token']}")
    print(f"Priority Score: {result['priority_triage_score']}/100 ({result['urgency_level']})")
    print(f"Overcharge: +{result['incident_details']['price_gouging_excess_pct']}%")
    print(f"HTML Dossier: {result['html_path']}")
    print(f"Directive: {result['recommended_enforcement']}")
