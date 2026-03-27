# FinForensics (Money Muling Detection Engine)

An advanced, full-stack application designed to detect and visualize complex money laundering topologies—specifically focusing on *money muling* behaviors, circular fund routing, smurfing, and layered shell networks.

## 🏗️ Project Architecture Overview

The project is built as a highly decoupled, full-stack application divided into a Node.js API backend and a React-based frontend.

1. **Backend (Node.js/Express):** Acts as the analytical engine. It exposes an upload endpoint (`/api/upload`) using `multer` that sequentially streams and parses transaction CSVs. Upon ingestion, it constructs an in-memory directed graph encompassing account relationships and passes this graph through a sequence of algorithmic "detectors" to highlight suspicious patterns.
2. **Frontend (React/Vite):** A Single Page Application (SPA) designed as an analyst dashboard. It allows users to upload datasets, highlights engine performance metrics (processing time, accounts analyzed), and uses `cytoscape.js` to render interactive network graphs of the detected fraudulent structures.

## 💻 Tech Stack

### Frontend
* **React 19 & Vite:** Fast, modern UI development.
* **Axios:** For seamless API requests.
* **Framer Motion:** For fluid interface animations.
* **Cytoscape.js:** For interactive, detailed network graph visualizations of fraudulent rings.
* **Lucide React:** Iconography.

### Backend
* **Node.js & Express.js:** Scalable API and server logic.
* **Multer:** For robust multipart form and CSV file upload handling.
* **CSV-Parser:** For streaming transaction data into the engine.

## ⚙️ Core Services & Detection Engine

The application relies heavily on graph theory and algorithmic heuristics. The process starts in `graphBuilder.js`, which converts the tabular transaction data into adjacency lists and aggregates base statistics per account (in-degrees, out-degrees, transaction velocity).

From there, the engine passes the graph to four specialized core services:

### 1. `cycleDetector.js` (Circular Fund Routing)
Detects individuals routing money in circles to obscure trails (e.g., A → B → C → A).
* **Algorithm:** Executes a tailored Depth-First Search (DFS) to find directed cycles strictly between lengths 3 and 5.
* **Feature:** De-duplicates rotations of the same ring and normalizes the output.

### 2. `smurfingDetector.js` (Fan-in / Fan-out Analysis)
Identifies "smurfing"—where large illicit transfers are broken down into many smaller ones.
* **Algorithm:** Employs a 72-hour sliding window over transaction chronologies, flagging any instances of 10+ distinct counterparties interacting with a single hub account. Finds both "Fan-In" (many sending to one) and "Fan-Out" (one sending to many) behaviors.
* **False Positive Filtering:** Includes intelligent variance filters. If an all-receive hub has highly varied transaction amounts averaging under $1000, it marks it as a legitimate retail merchant (preventing false flags on stores). If an all-send hub has extremely uniform outgoing amounts, it flags it as legitimate payroll.

### 3. `shellDetector.js` (Layered Shell Networks)
Spots continuous chains of dummy accounts used purely for money layering.
* **Algorithm:** Identifies "shell candidates" (accounts with 3 or fewer lifetime transactions). It runs a directed DFS to find chains of 3+ hops (≥ 4 nodes) where *all* intermediate routing nodes are shell candidates.
* **Feature:** Automatically prunes chains that are mere subsets of previously detected cycle rings to avoid redundant reporting.

### 4. `scoringEngine.js` (Suspicion Scoring)
Instead of a simple binary flag, the engine evaluates accounts against a weighted point system that caps at 100. Accounts crossing a score threshold (30) are officially marked as suspicious.
* **Heavy Penalties:**
  * Cycle involvement gives +40 pts. Nuanced behavior grants bonuses: average cycle amounts >$10k (+15 pts), tight 24-hr execution windows (+10 pts), and strict amount decay along the cycle (+10 pts).
  * Smurfing base +25 pts (large rings of 15+ actors get a +10 pt bonus).
  * Shell layering participation gives +15 pts.
  * Behavioral red flags like account lifespan < 3 days (+5 pts) or extreme high-velocity bursts (+10 pts).
* **Mitigations (Negative points):**
  * If an account is old (> 30 days) and naturally high-volume (> 50 typical distinct transactions), the engine applies a mitigation score of -20 pts to prevent overly aggressive system flags on legitimate power users.

## 🚀 Getting Started

1. **Clone the repository.**
2. **Install backend dependencies:**
   ```bash
   cd money-muling-engine/backend
   npm install
   ```
3. **Start the backend server:**
   ```bash
   npm run start
   ```
4. **Install frontend dependencies:**
   ```bash
   cd money-muling-engine/frontend
   npm install
   ```
5. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
