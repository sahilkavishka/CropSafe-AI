"""
CropSafe AI - Court Charge Sheet & B-Report Generator
Generates formal, court-admissible Magistrate's Court Charge Sheets and Police B-Reports
under the Regulation of Fertilizers Act No. 68 of 1988 and Code of Criminal Procedure Act No. 15 of 1979.
"""

import os
import sys
from datetime import datetime, timezone
from typing import Dict, Any, List

# Windows encoding safety
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


class CourtChargeSheetGenerator:
    """Generates official Magistrate's Court filings for fertilizer adulteration prosecution."""

    def __init__(self, output_dir: str = "reports/court_charge_sheets"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_b_report(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Compiles statutory legal documents including B-Report and Charge Sheet.
        """
        court_jurisdiction = case_data.get("court_jurisdiction", "Magistrate's Court of Dambulla")
        case_no = case_data.get("case_ref", f"CR-{datetime.now(timezone.utc).strftime('%Y')}-FERT-089")
        officer_name = case_data.get("officer_name", "K.M. Dharmasiri, Authorized Fertilizer Officer")
        officer_designation = case_data.get("officer_designation", "Director of Fertilizer Quality Control")
        accused_name = case_data.get("accused_name", "Rajapakse Agro-Chemicals Pvt Ltd & D.M. Sunil Shantha (Managing Director)")
        accused_address = case_data.get("accused_address", "No. 45, Kurunegala Road, Dambulla")
        batch_id = case_data.get("batch_id", "BATCH-LK-2026-X89")
        fertilizer_type = case_data.get("fertilizer_type", "Urea (Granular)")
        sls_standard = case_data.get("sls_standard", "SLS 618:2014")
        seizure_date = case_data.get("seizure_date", datetime.now(timezone.utc).strftime("%d-%m-%Y"))
        seizure_qty_mt = case_data.get("seizure_qty_mt", 120.0)
        adulterant = case_data.get("adulterant", "Crushed Gypsum & Industrial Urea Slag")
        crypto_hash = case_data.get("crypto_hash", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")

        # Statement of offense
        statutory_counts = [
            {
                "count_no": 1,
                "statement": "Sale, storage, and distribution of adulterated fertilizer contrary to Section 8(1) of the Regulation of Fertilizers Act No. 68 of 1988.",
                "particulars": (
                    f"That the said Accused on or about {seizure_date} at {accused_address}, within the jurisdiction "
                    f"of this Court, did possess, distribute, and offer for commercial sale {seizure_qty_mt} Metric Tons "
                    f"of fertilizer bearing Batch No: {batch_id} labeled as '{fertilizer_type}', which had been materially "
                    f"adulterated with {adulterant}, thereby failing to comply with the compulsory quality standards "
                    f"prescribed under {sls_standard}, an offense punishable under Section 19(1) of Act No. 68 of 1988."
                )
            },
            {
                "count_no": 2,
                "statement": "Failure to maintain statutory specifications and distribution of prohibited substances contrary to Section 19(2) of Act No. 68 of 1988.",
                "particulars": (
                    f"That the Accused at the same time and place aforesaid did introduce non-nutritive foreign matter "
                    f"into commercial fertilizer streams causing hazard to agriculture and food safety, thereby rendering "
                    f"the seized consignment of {seizure_qty_mt} MT liable to complete forfeiture and destruction."
                )
            }
        ]

        # Schedule of Productions
        productions = [
            f"Production 'P-1': Certified Forensic Spectrometry Certificate from National Fertilizer Lab (Ref: NFL-2026-QA78)",
            f"Production 'P-2': Sealed reference sample bottle bearing Government Analyst Seal No: GA-7890/26",
            f"Production 'P-3': Chain of Custody & Seizure Memo executed on {seizure_date} by Authorized Officer",
            f"Production 'P-4': Tamper-evident Cryptographic Blockchain Merkle Provenance Ledger (SHA-256: {crypto_hash[:16]}...)"
        ]

        # Schedule of Witnesses
        witnesses = [
            f"1. {officer_name}, {officer_designation} (Complainant)",
            "2. Government Analyst or Authorized Forensic Chemist, National Fertilizer Secretariat",
            "3. Regional Agrarian Development Officer, Dambulla Agrarian Services Center",
            "4. Sub-Inspector of Police, Police Station Dambulla (Assisting Officer)"
        ]

        # Prayers to Court
        prayers = [
            "1. Issue Summons on the Accused named above to appear and answer to the charges preferred herein.",
            f"2. Issue an Interim Order under Section 16(2) of Act No. 68 of 1988 directing the detention and safe impoundment of {seizure_qty_mt} MT of the seized fertilizer.",
            "3. Upon conviction, impose the maximum statutory fine of LKR 500,000 and/or term of imprisonment pursuant to Section 19(1).",
            "4. Make an Order of Forfeiture directing the destruction or disposal of the adulterated consignment under Section 19(2)."
        ]

        report_payload = {
            "court_jurisdiction": court_jurisdiction,
            "case_no": case_no,
            "complainant": officer_name,
            "accused": accused_name,
            "accused_address": accused_address,
            "batch_id": batch_id,
            "statutory_counts": statutory_counts,
            "productions": productions,
            "witnesses": witnesses,
            "prayers": prayers,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }

        # Write HTML Charge Sheet
        html_path = os.path.join(self.output_dir, f"Charge_Sheet_{batch_id}.html")
        md_path = os.path.join(self.output_dir, f"Charge_Sheet_{batch_id}.md")

        self._write_html(html_path, report_payload)
        self._write_markdown(md_path, report_payload)

        report_payload["html_path"] = html_path
        report_payload["markdown_path"] = md_path
        return report_payload

    def _write_html(self, filepath: str, data: Dict[str, Any]):
        counts_html = "".join([
            f"<div class='count'><h4>COUNT {c['count_no']}: {c['statement']}</h4><p>{c['particulars']}</p></div>"
            for c in data["statutory_counts"]
        ])
        prods_html = "".join([f"<li>{p}</li>" for p in data["productions"]])
        wits_html = "".join([f"<li>{w}</li>" for w in data["witnesses"]])
        prayers_html = "".join([f"<li>{pr}</li>" for pr in data["prayers"]])

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>B-Report & Charge Sheet - {data['case_no']}</title>
<style>
  body {{ font-family: 'Times New Roman', serif; margin: 40px; line-height: 1.6; color: #111; }}
  .header {{ text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }}
  .header h2 {{ margin: 0; text-transform: uppercase; font-size: 18pt; }}
  .header h3 {{ margin: 5px 0; font-size: 14pt; }}
  .case-meta {{ margin-bottom: 20px; }}
  .case-meta table {{ width: 100%; border-collapse: collapse; }}
  .case-meta td {{ padding: 6px; vertical-align: top; }}
  .section-title {{ font-weight: bold; text-decoration: underline; margin-top: 25px; font-size: 13pt; text-transform: uppercase; }}
  .count {{ background: #fdfaf3; border-left: 4px solid #b33939; padding: 12px 18px; margin: 15px 0; }}
  .count h4 {{ margin: 0 0 8px 0; color: #b33939; }}
  ul {{ padding-left: 20px; }}
  li {{ margin-bottom: 6px; }}
  .signature-box {{ margin-top: 50px; display: flex; justify-content: space-between; }}
  .sig {{ border-top: 1px dotted #000; width: 40%; text-align: center; padding-top: 8px; }}
  .seal {{ text-align: center; border: 2px dashed #888; padding: 10px; width: 180px; margin: 20px auto; font-size: 10pt; color: #555; }}
</style>
</head>
<body>
<div class="header">
  <h2>IN THE {data['court_jurisdiction'].upper()}</h2>
  <h3>REPORT UNDER SECTION 136(1)(a) OF THE CODE OF CRIMINAL PROCEDURE ACT NO. 15 OF 1979</h3>
  <p><strong>CASE NO: {data['case_no']}</strong></p>
</div>

<div class="case-meta">
  <table>
    <tr>
      <td style="width: 20%;"><strong>COMPLAINANT:</strong></td>
      <td>{data['complainant']}</td>
    </tr>
    <tr>
      <td><strong>VS.</strong></td>
      <td></td>
    </tr>
    <tr>
      <td><strong>ACCUSED:</strong></td>
      <td><strong>{data['accused']}</strong><br>{data['accused_address']}</td>
    </tr>
    <tr>
      <td><strong>BATCH TRACE:</strong></td>
      <td><code>{data['batch_id']}</code></td>
    </tr>
  </table>
</div>

<div class="section-title">STATEMENT OF OFFENSES & CHARGES</div>
{counts_html}

<div class="section-title">SCHEDULE OF PRODUCTIONS (EVIDENCE)</div>
<ul>
{prods_html}
</ul>

<div class="section-title">SCHEDULE OF WITNESSES</div>
<ul>
{wits_html}
</ul>

<div class="section-title">PRAYERS / RELIEFS SOUGHT</div>
<ul>
{prayers_html}
</ul>

<div class="seal">
  OFFICIAL COURT SEAL<br>NATIONAL FERTILIZER SECRETARIAT
</div>

<div class="signature-box">
  <div class="sig">
    <strong>Authorized Officer</strong><br>
    Complainant under Act No. 68
  </div>
  <div class="sig">
    <strong>Registrar of the Court</strong><br>
    Magistrate's Court
  </div>
</div>
</body>
</html>"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html_content)

    def _write_markdown(self, filepath: str, data: Dict[str, Any]):
        md_content = f"""# IN THE {data['court_jurisdiction'].upper()}
## B-Report & Charge Sheet under Regulation of Fertilizers Act No. 68 of 1988
**Case Reference:** `{data['case_no']}` | **Filing Date:** {data['generated_at'][:10]}

---

### PARTIES
- **Complainant:** {data['complainant']}
- **Accused:** {data['accused']}
- **Address:** {data['accused_address']}
- **Consignment Batch:** `{data['batch_id']}`

---

### STATUTORY CHARGES
"""
        for c in data["statutory_counts"]:
            md_content += f"\n#### Count {c['count_no']}: {c['statement']}\n{c['particulars']}\n"

        md_content += "\n### PRODUCTIONS (EVIDENCE)\n"
        for p in data["productions"]:
            md_content += f"- {p}\n"

        md_content += "\n### WITNESSES\n"
        for w in data["witnesses"]:
            md_content += f"- {w}\n"

        md_content += "\n### PRAYERS\n"
        for pr in data["prayers"]:
            md_content += f"- {pr}\n"

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(md_content)


if __name__ == "__main__":
    generator = CourtChargeSheetGenerator()
    test_case = {
        "court_jurisdiction": "Magistrate's Court of Dambulla",
        "case_ref": "MC-DAMBULLA-2026-FERT-089",
        "officer_name": "W.A. Sarath Kumara, Senior Inspector of Fertilizers",
        "officer_designation": "National Fertilizer Secretariat Authorized Officer",
        "accused_name": "Lanka Agro-Chemical Distributors Ltd & K.V. Jinadasa (Chairman)",
        "accused_address": "Economic Center Wholesale Complex, Block D, Dambulla",
        "batch_id": "BATCH-LK-2026-X89",
        "fertilizer_type": "Urea (Granular)",
        "sls_standard": "SLS 618:2014",
        "seizure_date": "24-09-2026",
        "seizure_qty_mt": 120.0,
        "adulterant": "Crushed Gypsum & Recycled Industrial Slag (18.5% by weight)",
        "crypto_hash": "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"
    }

    res = generator.generate_b_report(test_case)
    print("=== Court Charge Sheet Generated Successfully ===")
    print(f"HTML File: {res['html_path']}")
    print(f"Markdown File: {res['markdown_path']}")
    print(f"Counts: {len(res['statutory_counts'])} statutory counts filed.")
