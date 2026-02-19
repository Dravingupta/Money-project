# Graph-Based Financial Crime Detection Engine

A full-stack system designed to detect complex financial crime patterns such as money muling, smurfing, and shell networks using advanced graph algorithms and behavioral analysis. Built for the Rift hackathon.

## 🚀 Live Demo

-   **Frontend**: [Link to Vercel Deployment]
-   **Backend**: [Link to Render Deployment]

## 🛠 Tech Stack

### Frontend
-   **React**: UI Library for building interactive interfaces.
-   **Vite**: Fast build tool and development server.
-   **Cytoscape.js**: Graph theory library for network visualization and analysis.
-   **Lucide React**: Icon library for a clean UI.
-   **CSS**: Custom styling for a premium, dark-themed aesthetic.

### Backend
-   **Node.js**: JavaScript runtime environment.
-   **Express.js**: Web framework for API handling.
-   **CSV-Parser**: Fast streaming CSV parsing.
-   **Multer**: Middleware for handling file uploads.

## 🏗 System Architecture

The system follows a streamlined pipeline to process transaction data and identify suspicious activities:

1.  **Data Ingestion**: Rapid parsing of uploaded CSV transaction records.
2.  **Graph Construction**: Builds an in-memory graph representation (Adjacency List) and aggregates account statistics.
3.  **Pattern Detection**: Runs specialized algorithms to identify specific money laundering topologies (Cycles, Smurfing, Shell Networks).
4.  **Scoring Engine**: Aggregates detection results and high-frequency behavioral signals to assign a "Suspicion Score" (0-100) to each account.
5.  **Visualization**: Renders the transaction graph interactively, highlighting suspicious nodes and flows.

## 🧠 Algorithm Approach & Complexity

| Algorithm | Description | Complexity |
| :--- | :--- | :--- |
| **Graph Construction** | Builds adjacency lists and account maps from raw transactions. | **O(N)** (where N = transactions) |
| **Cycle Detection (DFS)** | Depth-First Search with depth limit (3-5 hops) to find directed loops preventing infinite recursion. | **O(V + E)** (bounded depth) |
| **Smurfing Detection** | Sliding Window analysis on sorted transactions to detect high fan-in/fan-out within 72h windows. | **O(N log N)** (sorting dominates) |
| **Shell Network Detection** | Recursive DFS to identify layered chains of low-activity accounts. | **O(V)** (efficient pruning) |

**Performance**: Capable of processing 10,000+ transactions in under 2.5 seconds on standard hardware.

## 📊 Suspicion Score Methodology

The engine assigns a suspicion score from **0 to 100** based on weighted signals. A score above **30** is flagged as suspicious.

| Signal | Logic | Weight |
| :--- | :--- | :--- |
| **Cycle Participation** | Account is part of a circular money flow loop. | **+40** |
| **Smurfing Activity** | Account acts as a hub for fan-in (collecting) or fan-out (distributing) funds. | **+25** |
| **Shell Network** | Account is part of a layered chain of intermediaries. | **+15** |
| **High Velocity** | Account performs ≥ 5 transactions within a 24-hour window. | **+10** |
| **Short Lifetime** | Account active for < 3 days. | **+5** |
| **Mitigation (False Positive)** | Account active for > 30 days with > 50 transactions. | **-20** |

**Bonuses**:
-   **High Amount Cycle**: +15 pts (Avg cycle amount > $10k)
-   **Large Smurfing Ring**: +10 pts (15+ participants)

## 💻 Installation & Setup

### Prerequisites
-   Node.js (v16+)
-   npm

### Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm run dev
    # Server runs on http://localhost:3000
    ```

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    # Client runs on http://localhost:5173
    ```

## 📖 Usage Instructions

1.  **Start both Backend and Frontend** servers.
2.  Open the **Frontend** URL in your browser.
3.  **Upload a CSV file** containing transaction data.
    -   *Format*: `transaction_id, sender_id, receiver_id, amount, timestamp`
    -   *Sample files* are available in the `backend/` directory (e.g., `cycles.csv`).
4.  **View the Graph**: Interactive visualization will appear.
    -   **Red Nodes**: Highly suspicious accounts.
    -   **Blue/Green Nodes**: Low suspicion/Safe accounts.
5.  **Analyze Results**:
    -   See **Fraud Summary** cards for total suspicious value.
    -   Check **Suspicion Scores** table for detailed account breakdown.
    -   Identify **Fraud Rings** in the dedicated panel.
6.  **Export**: Click "Download JSON" to get the full analysis report.

## ⚠️ Known Limitations

-   **In-Memory Processing**: The current implementation loads all transactions into RAM. For production scaling to millions of rows, a graph database (Neo4j) or stream processing would be required.
-   **Static Heuristics**: Scoring weights are manually tuned based on common typologies. A production system would benefit from Machine Learning models to dynamically adjust weights.
-   **Depth Limit**: Cycle and Shell detection is limited to 5 hops to ensure real-time performance.

## 👥 Team

-   **Dravin Gupta** - Team Lead
-   **Rishima** - Team Member
-   **Shubham** - Team Member
