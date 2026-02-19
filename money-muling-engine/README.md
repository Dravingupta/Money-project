# Graph-Based Financial Crime Detection Engine

A full-stack system for detecting money muling, smurfing, and shell networks using graph algorithms and behavioral analysis. Built for the Rift hackathon.

## 🚀 Live Demo
- **Backend**: (Deploy to Render to get URL)
- **Frontend**: (Deploy to Vercel to get URL)

## 📂 Repository
[GitHub Repository Link]

## 🧠 Problem Overview
Financial criminals use complex networks to launder money, often splitting large sums into small transactions ("smurfing") or routing funds through inactive accounts ("shell networks"). Traditional rule-based systems often miss these structural patterns. This engine builds a transaction graph to detect these specific topologies and assigns a suspicion score to each account.

## 🏗 System Architecture
1.  **CSV Ingestion**: rapid parsing of transaction records.
2.  **Graph Construction**: Builds adjacency lists and account statistics (O(N)).
3.  **Pattern Detection**:
    -   **Cycles**: DFS to find directed loops (Length 3-5).
    -   **Smurfing**: Sliding window analysis for Fan-In/Fan-Out patterns (10+ accounts in 72h).
    -   **Shell Networks**: DFS to find layered chains with low-activity intermediates.
4.  **Scoring Engine**: Hybrid scoring based on patterns and high-frequency behavior.
5.  **Visualization**: Interactive graph view using Cytoscape.js.

## 🔍 Detection Algorithms & Complexity

| Algorithm | Method | Complexity |
| :--- | :--- | :--- |
| **Graph Build** | Hash Map Construction | O(N) |
| **Cycle Detection** | Depth-Limited DFS (Max depth 5) | O(V + E) |
| **Smurfing** | Sliding Window on sorted transactions | O(N log N) |
| **Shell Networks** | Recursive DFS with activity checks | O(V) (Bounded) |

*Performance*: Processed 10,000 transactions in < 2.5 seconds on standard hardware.

## 📊 Suspicion Score Methodology
Scores are normalized from 0 to 100.

| Signal | Logic | Weight |
| :--- | :--- | :--- |
| **Cycle Participation** | Part of a money loop | +40 |
| **Shell Network** | Part of a layered chain | +30 |
| **Smurfing** | Hub of fan-in/fan-out activity | +25 |
| **High Velocity** | ≥ 5 transactions in 24h | +10 |
| **Short Lifetime** | Active for < 3 days | +5 |
| **False Positive Mitigation** | Active > 30 days & High Volume | -20 |

## 🛠 False Positive Mitigation
- Accounts with long transaction histories (>30 days) and consistent activity are penalized less.
- Smurfing detection strictly requires 10 distinct counterparties within a narrow 72h window, avoiding false flags for normal high-volume merchants (who usually have spread-out transactions).
- Shell detection ignores intermediates with >3 total transactions.

## 💻 Installation & Usage

### Backend
```bash
cd backend
npm install
# Start server on http://localhost:3000
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Start Vite server on http://localhost:5173
npm run dev
```

### Usage
1.  Open the frontend.
2.  Upload `cycles.csv` (or any test file).
3.  View the detected graph and suspicion scores.
4.  Download the JSON report.

## ☁️ Deployment Guide

### Backend (Render)
1.  Create Web Service.
2.  Repo: `.../money-muling-engine`
3.  Root Directory: `backend`
4.  Build Command: `npm install`
5.  Start Command: `npm start`
6.  Env Var: `PORT=3000`

### Frontend (Vercel)
1.  Import Repo.
2.  Root Directory: `frontend`
3.  Framework: Vite
4.  Env Var: `VITE_API_URL` = [Your Render Backend URL]

## ⚠️ Known Limitations
-   **In-Memory Processing**: Currently loads all transactions into RAM. Optimizable for millions of rows using streams/DB.
-   **Static Rules**: Weights are heuristic-based. Future work could use ML to learn weights.
-   **Depth Limit**: Cycle/Shell detection limited to 5 hops for performance.

## 👥 Team
-   [Your Name] - Full Stack Engineer
