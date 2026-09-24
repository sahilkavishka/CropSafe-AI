"""
CropSafe AI - Sri Lanka Fertilizer Regulatory & Standards Knowledge Base Compiler
Creates structured, domain-accurate markdown and text documents for the 2026 RAG AI Chatbot.
Covers:
  1. Regulation of Fertilizer Act No. 68 of 1988
  2. National Fertilizer Secretariat (NFS) Licensing & Sampling Guidelines
  3. Sri Lanka Standards Institution (SLSI) Specifications (SLS 644, 894, 847, 1247)
  4. Inspection Protocols, Adulteration Penalties, and Enforcement Procedures
"""

import os

KB_DOCUMENTS = {
    "regulation_of_fertilizer_act_no_68_1988.md": """# Regulation of Fertilizer Act No. 68 of 1988 (Sri Lanka)
## Summary of Key Legal Provisions

### 1. Short Title and Commencement
This Act may be cited as the Regulation of Fertilizer Act, No. 68 of 1988. It governs the licensing, manufacture, importation, blending, packaging, and distribution of chemical and organic fertilizers in the Democratic Socialist Republic of Sri Lanka.

### 2. Licensing Requirements (Section 4 & 5)
* No person or corporate entity shall import, manufacture, formulate, or blend any fertilizer without a valid license granted by the Director of the National Fertilizer Secretariat (NFS).
* Every dealer, wholesale distributor, and retail stockist must register their retail premises and maintain traceable Batch Numbers for every consignment received.

### 3. Prohibition of Adulteration (Section 8)
* Any person who manufactures, imports, offers for sale, or distributes any fertilizer that:
  - Is adulterated with inert fillers, sand, clay, salt, or toxic waste,
  - Deviates significantly from the registered chemical formulation (NPK percentages),
  - Exceeds the permissible moisture limits, thereby artificially increasing weight,
  shall be guilty of an offense under this Act.

### 4. Penalties and Forfeiture (Section 19)
* Conviction for selling adulterated or substandard fertilizer carries mandatory fines, cancellation of business license, and confiscation/forfeiture of the entire consignment.
* Repeat offenders are subject to imprisonment under the Code of Criminal Procedure.
""",

    "slsi_official_standards_specifications.md": """# Sri Lanka Standards Institution (SLSI) - Chemical Fertilizer Specifications

### 1. SLS 644: Specification for Agricultural Urea
* **Total Nitrogen (N) Content:** Minimum 46.0% by weight (on dry basis).
* **Biuret Content:** Maximum 1.0% by weight (excess biuret is toxic to seedlings and tea).
* **Moisture Content:** Maximum 1.5% by weight.
* **Physical State:** Free-flowing white prills or granules, free from foreign matter and lumps.
* **Common Adulterations:** Crushed common salt (NaCl), low-grade industrial urea, moisture addition.

### 2. SLS 894: Specification for Muriate of Potash (MOP / Potassium Chloride)
* **Water Soluble Potassium (as K2O):** Minimum 60.0% by weight.
* **Moisture Content:** Maximum 2.0% by weight.
* **Sodium (as NaCl):** Maximum 3.5% by weight.
* **Physical State:** Reddish-pink or white crystalline granules.
* **Common Adulterations:** Red brick dust, red sand, ordinary common salt (NaCl).

### 3. SLS 847: Specification for Triple Super Phosphate (TSP)
* **Total Phosphorus (as P2O5):** Minimum 46.0% by weight.
* **Water Soluble P2O5:** Minimum 38.0% by weight.
* **Moisture Content:** Maximum 3.0% by weight.
* **Free Phosphoric Acid:** Maximum 4.0% by weight.
* **Common Adulterations:** Insoluble rock phosphate, red dry soil, silt.

### 4. Compound NPK Mixtures (SLS 1500 Series)
* **NPK 15-15-15:** Nitrogen >= 15.0%, P2O5 >= 15.0%, K2O >= 15.0%, Moisture <= 2.0%.
* **NPK 12-12-17:** Nitrogen >= 12.0%, P2O5 >= 12.0%, K2O >= 17.0%, Moisture <= 2.0%.

### 5. SLS 1247: Specification for Organic Compost
* **Organic Carbon:** Minimum 15.0% by weight.
* **C:N Ratio:** Less than 20:1 (ensures proper nitrogen mineralization).
* **pH Range:** 6.5 to 8.5.
* **Moisture Content:** 20.0% to 25.0%.
* **Heavy Metal Tolerances:** Cadmium < 1.5 mg/kg, Lead < 100 mg/kg, Arsenic < 5 mg/kg.
""",

    "nfs_inspection_sampling_protocols.md": """# National Fertilizer Secretariat (NFS) & Department of Agriculture
## Standard Operating Procedures for Field Inspections & Sampling

### 1. Inspection Authority
Agricultural Instructors (AI), Authorized Officers of the National Fertilizer Secretariat, and Agrarian Development Officers (ARPA) have statutory powers to:
* Enter and inspect any commercial warehouse, retail depot, or transport vehicle.
* Examine procurement invoices, import declarations, and storage conditions.
* Draw official representative samples for verification testing.

### 2. Representative Sampling Protocol
* For consignments up to 50 bags: Sample drawn randomly from at least 5 bags.
* For consignments 51 to 500 bags: Sample drawn randomly from at least 15 bags.
* For bulk consignments: Multi-point core sampler used to draw top, middle, and bottom composites.
* Total composite sample mass: Minimum 1.0 kg divided into 3 sealed airtight jars:
  1. Jar 1: Submitted to Government Analyst / Approved Testing Laboratory.
  2. Jar 2: Handed to vendor/stockist with official acknowledgement receipt.
  3. Jar 3: Retained in regulatory custody as referee reserve.

### 3. Price Arbitrage and Overpricing Enforcement
* The Ministry of Agriculture and NFS publish Maximum Retail Prices (MRP) in government gazettes.
* Selling above MRP or packaging substandard product in branded bags of licensed companies (Hayleys, CIC, Browns, Lankem) constitutes both trademark infringement and criminal fraud.
"""
}

def build_knowledge_base(output_dir="cropsafe AI/data/knowledge_base"):
    os.makedirs(output_dir, exist_ok=True)
    for filename, content in KB_DOCUMENTS.items():
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"Created RAG Knowledge Base document: {filepath}")
    print(f"Knowledge Base successfully built at {output_dir} with {len(KB_DOCUMENTS)} core regulatory documents.")

if __name__ == "__main__":
    build_knowledge_base()
