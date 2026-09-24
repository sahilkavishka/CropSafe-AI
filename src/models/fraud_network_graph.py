"""
CropSafe AI - Graph-Based Fraud Network & Ring Detection Engine
Constructs network graphs linking Suppliers, Regions, and Batches using NetworkX
to automatically isolate coordinated counterfeit syndicates and 'Fraud Rings'.
"""

import os
import networkx as nx
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

def analyze_fraud_networks(data_path="cropsafe AI/data/processed/cropsafe_master_dataset.csv",
                           output_dir="cropsafe AI/reports/figures",
                           reports_dir="cropsafe AI/reports"):
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    print("Building Graph-Based Fraud Network...")
    df = pd.read_csv(data_path)

    # Filter records flagged for Substandard Quality or Price Arbitrage
    flagged_df = df[(df["Lab_Certified"] == "No") | (df["Price_Arbitrage_Flag"] == 1)].copy()

    # Create Undirected Graph
    G = nx.Graph()

    # Add nodes and edges: Supplier <-> Region, Supplier <-> Product
    for _, row in flagged_df.iterrows():
        supplier_node = f"SUPP: {row['Supplier']}"
        region_node = f"REG: {row['Region'].replace(' Province', '')}"
        
        G.add_node(supplier_node, node_type="Supplier")
        G.add_node(region_node, node_type="Region")

        # If edge exists, increment weight (incident frequency)
        if G.has_edge(supplier_node, region_node):
            G[supplier_node][region_node]["weight"] += 1
        else:
            G.add_edge(supplier_node, region_node, weight=1)

    print(f"Graph constructed: {G.number_of_nodes()} nodes, {G.number_of_edges()} relationships.")

    # Graph Centrality Analytics
    degree_cent = nx.degree_centrality(G)
    betweenness_cent = nx.betweenness_centrality(G, weight="weight")

    # Rank highest-risk supplier nodes
    supplier_rankings = []
    for node, deg in degree_cent.items():
        if node.startswith("SUPP:"):
            supplier_rankings.append({
                "Supplier": node.replace("SUPP: ", ""),
                "Degree_Centrality": round(deg, 4),
                "Betweenness_Centrality": round(betweenness_cent[node], 4),
                "Connected_Regions_Count": G.degree(node)
            })

    rank_df = pd.DataFrame(supplier_rankings).sort_values(by="Connected_Regions_Count", ascending=False)

    # Detect Communities / Fraud Rings (Connected Subgraphs)
    connected_subgraphs = list(nx.connected_components(G))
    print(f"Identified {len(connected_subgraphs)} distinct syndicates / network components.")

    # Visualize the Fraud Network Graph
    plt.figure(figsize=(14, 10))
    pos = nx.spring_layout(G, k=0.6, seed=42)

    # Separate colors by node type
    supplier_nodes = [n for n, d in G.nodes(data=True) if d.get("node_type") == "Supplier"]
    region_nodes = [n for n, d in G.nodes(data=True) if d.get("node_type") == "Region"]

    # Draw nodes
    nx.draw_networkx_nodes(G, pos, nodelist=supplier_nodes, node_color="#e74c3c",
                           node_size=1100, label="Suppliers (Flagged)", alpha=0.85)
    nx.draw_networkx_nodes(G, pos, nodelist=region_nodes, node_color="#3498db",
                           node_size=1600, label="Regions / Distribution Belts", alpha=0.85)

    # Draw edges with thickness according to incident count
    weights = [G[u][v]["weight"] * 0.4 for u, v in G.edges()]
    nx.draw_networkx_edges(G, pos, width=weights, edge_color="#7f8c8d", alpha=0.6)

    # Labels
    nx.draw_networkx_labels(G, pos, font_size=8, font_weight="bold", font_family="DejaVu Sans")

    plt.title("CropSafe AI: Graph-Based Fraud Network & Supplier Clustered Belts", fontsize=14, weight="bold")
    plt.legend(loc="upper right", frameon=True)
    plt.axis("off")
    plt.tight_layout()

    fig_path = os.path.join(output_dir, "fraud_network_graph.png")
    plt.savefig(fig_path, dpi=300)
    plt.close()
    print(f"Fraud network graph image saved to: {fig_path}")

    # Generate Report
    report_md = f"""# CropSafe AI: Graph-Based Fraud Network & Syndicate Analysis
**Technology:** NetworkX Graph Topology & Multi-Relational Centrality Analysis

---

## 1. Network Topology Summary
* **Total Nodes:** {G.number_of_nodes()} (Suppliers & Regional Hubs)
* **Active Cross-Border Ties:** {G.number_of_edges()} edges
* **Connected Syndicates Identified:** {len(connected_subgraphs)}

---

## 2. Top Coordinated High-Risk Suppliers Across Multiple Regions

| Supplier | Cross-Regional Reach | Degree Centrality | Betweenness Centrality |
| :--- | :--- | :--- | :--- |
"""
    for _, r in rank_df.head(8).iterrows():
        report_md += f"| **{r['Supplier']}** | {r['Connected_Regions_Count']} Provinces | {r['Degree_Centrality']:.4f} | {r['Betweenness_Centrality']:.4f} |\n"

    report_md += """
### Operational Insight:
Dealers with high betweenness centrality act as cross-provincial conduits for counterfeit fertilizers. Interdicting consignments at these specific supplier hubs provides maximum enforcement leverage.
"""
    report_file = os.path.join(reports_dir, "fraud_network_report.md")
    with open(report_file, "w", encoding="utf-8") as f:
        f.write(report_md)
    print(f"Fraud network report written to: {report_file}")

if __name__ == "__main__":
    analyze_fraud_networks()
