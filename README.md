# 🛡️ FraudLens AI - Suspicious Transaction Network Intelligence Platform

**A comprehensive, production-ready fraud detection system for analyzing transaction networks using graph-based algorithms and AI-powered pattern recognition.**

Built for **FT-PS-02: Suspicious Transaction Network Detector** hackathon challenge.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

---

## 🎯 Problem Statement

Financial institutions process millions of transactions daily, making manual fraud detection impossible. FraudLens AI provides an intelligent, automated solution to:

- ✅ Analyze payment records using graph-based fraud detection
- ✅ Identify unusual transaction chains
- ✅ Detect circular money transfers
- ✅ Identify rapid fund movement patterns
- ✅ Detect potential mule-account networks
- ✅ Visualize suspicious relationships between accounts
- ✅ Highlight transaction patterns responsible for every alert

---

## ✨ Key Features

### 🔍 Advanced Fraud Detection Engine

- **Circular Transfer Detection**: Identifies closed-loop money flows (A → B → C → A)
- **Rapid Fund Movement**: Detects accounts receiving and forwarding funds within configurable time windows
- **Suspicious Transaction Chains**: Finds multi-hop transaction sequences across multiple accounts
- **Mule Account Identification**: Detects accounts with high incoming/outgoing activity patterns
- **Transaction Burst Detection**: Identifies unusual spikes in transaction frequency
- **High-Value Transaction Flagging**: Flags transactions exceeding configurable thresholds

### 📊 Premium Fintech UI/UX

- **Dark Navy Theme**: Professional, eye-friendly security operations interface
- **Real-time Analytics Dashboard**: Live metrics, charts, and statistics
- **Interactive Network Graph**: Cytoscape.js-powered visual investigation tool
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 🎓 Explainable AI

- **Transparent Risk Scoring**: 0-100 heuristic score with configurable weights
- **Evidence-Based Alerts**: Every alert references actual transaction IDs
- **Audit Trail**: Complete history of alert status changes and investigator notes
- **Configurable Rules**: Adjust detection thresholds without code changes

### 🛠️ Production-Ready Architecture

- **RESTful APIs**: Clean, validated endpoints with Zod schemas
- **Automated Testing**: Comprehensive test suite for fraud detection algorithms
- **CSV Import/Export**: Easy data migration and reporting
- **Case Management**: Full investigation workflow support

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

1. **Clone the repository**

```bash
cd hackathon
```

2. **Install root dependencies**

```bash
npm install
```

3. **Install client dependencies**

```bash
cd client
npm install
cd ..
```

4. **Create environment file**

```bash
cp .env.example .env
```

### Running the Application

#### Option 1: Run everything together (recommended)

```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:3001`
- Frontend dev server on `http://localhost:5173`

#### Option 2: Run separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 📖 User Guide

### Step 1: Overview Dashboard

When you first open FraudLens AI, you'll see the Overview Dashboard with:

- **Key Metrics**: Total transactions, accounts, alerts, and volume
- **Run Analysis Button**: Click to execute fraud detection on current dataset
- **Recent Alerts**: Latest suspicious patterns detected
- **Risk Distribution Charts**: Visual breakdown of alerts by severity

**👉 Action**: Click **"Run Analysis"** to detect fraud patterns in the demo dataset.

### Step 2: Review Fraud Alerts

Navigate to **Fraud Alerts** from the sidebar:

1. **Browse Alerts**: View all detected suspicious patterns
2. **Filter by Risk**: Critical, High, Medium, or Low
3. **Click an Alert**: See detailed evidence, involved accounts, and transactions
4. **Take Action**:
   - Mark as "Under Review"
   - Escalate to higher-level investigators
   - Clear false positives

### Step 3: Investigate the Network

Click **Network Graph** to open the interactive visualization:

1. **Explore the Graph**: Nodes = Accounts, Edges = Transactions
2. **Suspicious Accounts**: Highlighted in red
3. **Zoom & Pan**: Use controls or mouse wheel
4. **Search Account**: Find specific accounts by ID
5. **Click Alerts**: Highlight related accounts on the graph
6. **Select Nodes/Edges**: View detailed connection information

### Step 4: Explore Transactions

Navigate to **Transaction Explorer**:

1. **Search & Filter**: By account ID, amount range, channel, date
2. **Sort**: Click column headers to sort
3. **Import CSV**: Upload your own transaction data
4. **Export CSV**: Download filtered results for reporting

### Step 5: Create Investigation Cases

Go to **Cases** to manage investigations:

1. Click **"New Case"**
2. Enter case title and notes
3. Link related alert IDs
4. Set priority level
5. Assign to investigators
6. Track case status

### Step 6: Configure Settings

Visit **Settings** to customize:

- **Detection Rules**: Adjust time windows, thresholds, cycle depths
- **Risk Scoring Weights**: Fine-tune pattern importance
- **Graph Display Limits**: Control visualization performance

**⚠️ Important**: After changing settings, return to the Dashboard and click **"Run Analysis"** again to apply the new configuration.

---

## 🧪 Testing

### Run Automated Tests

```bash
npm test
```

This executes the comprehensive test suite covering:

- ✅ Circular transfer detection
- ✅ Rapid fund movement detection
- ✅ Suspicious chain detection
- ✅ Mule account pattern recognition
- ✅ Transaction burst detection
- ✅ High-value transaction flagging
- ✅ Risk score calculation
- ✅ Alert evidence validation
- ✅ Edge cases and error handling

**Expected Output**: 13 tests passing

### Test Coverage

| Test Category | Tests | Status |
|--------------|-------|--------|
| Circular Transfers | 2 | ✅ |
| Rapid Movement | 2 | ✅ |
| Suspicious Chains | 1 | ✅ |
| Mule Accounts | 1 | ✅ |
| Transaction Bursts | 1 | ✅ |
| High Value | 1 | ✅ |
| Risk Scoring | 4 | ✅ |
| Edge Cases | 1 | ✅ |

---

## 📊 Demo Data

The application includes a synthetic dataset with **300+ transactions** featuring:

### Planted Fraud Patterns

1. **3 Circular Transfer Patterns**
   - Example: ACC001 → ACC002 → ACC003 → ACC001
   
2. **3 Rapid Fund Movement Examples**
   - Example: ACC050 receives $12,000, forwards $11,500 within 10 minutes

3. **2 Suspicious Transaction Chains**
   - Example: ACC070 → ACC071 → ACC072 → ACC073 → ACC074

4. **2 Potential Mule Accounts**
   - Example: ACC100 receives from 6 sources, distributes to 6 destinations

5. **1 Transaction Burst**
   - Example: ACC200 executes 12 transactions in 36 minutes

6. **3 High-Value Transactions**
   - Example: $75,000, $95,000, $120,000 transfers

### Normal Activity (Not Suspicious)

- Salary payments
- Vendor invoices
- Customer payments
- Utility bills
- Insurance premiums
- Loan repayments
- Investment transfers
- Retail purchases

**🔄 Reset Demo Data**: Click "Reset Demo" on the Dashboard to restore original dataset.

---

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Recharts** - Data visualization
- **Cytoscape.js** - Network graph visualization
- **React Router** - Client-side routing

#### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Zod** - Schema validation
- **In-Memory Store** - Demo data persistence

### Project Structure

```
fraudlens-ai/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── layout/      # Layout components (Sidebar, TopBar)
│   │   │   └── shared/      # Shared components (Modal, Badge, etc.)
│   │   ├── pages/           # Main application pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── NetworkGraph.jsx
│   │   │   ├── Alerts.jsx
│   │   │   ├── Cases.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/        # API client services
│   │   ├── utils/           # Utility functions
│   │   └── hooks/           # Custom React hooks
│   └── package.json
│
├── server/                   # Backend Node.js application
│   ├── src/
│   │   ├── services/        # Business logic
│   │   │   ├── fraudDetectionService.js    # Core detection engine
│   │   │   ├── graphService.js             # Graph algorithms
│   │   │   └── scoringService.js           # Risk scoring
│   │   ├── routes/          # API endpoints
│   │   ├── repositories/    # Data access layer
│   │   ├── middleware/      # Express middleware
│   │   └── data/           # Demo transaction data
│   └── tests/              # Automated tests
│
├── package.json            # Root dependencies
├── .env.example           # Environment template
└── README.md
```

### API Endpoints

#### Transactions
- `GET /api/transactions` - List all transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions/import` - Import CSV data
- `GET /api/transactions/export/csv` - Export as CSV

#### Analysis
- `GET /api/analysis/summary` - Get analysis summary
- `POST /api/analysis/run` - Run fraud detection
- `GET /api/analysis/graph` - Get network graph data

#### Alerts
- `GET /api/alerts` - List alerts with filters
- `GET /api/alerts/:id` - Get alert details
- `PATCH /api/alerts/:id/status` - Update alert status
- `POST /api/alerts/:id/notes` - Add investigator notes
- `GET /api/alerts/export/csv` - Export alerts as CSV

#### Cases
- `GET /api/cases` - List all cases
- `GET /api/cases/:id` - Get case details
- `POST /api/cases` - Create new case
- `PATCH /api/cases/:id` - Update case

#### Settings
- `GET /api/settings` - Get current settings
- `PUT /api/settings` - Update settings

#### Demo
- `POST /api/demo/reset` - Reset to demo data

---

## 🧠 Fraud Detection Algorithms

### 1. Circular Transfer Detection

**Algorithm**: Depth-First Search (DFS) with cycle detection

**How it works**:
1. Build directed graph from transactions
2. For each account, explore paths up to configurable depth
3. Track visited nodes to detect cycles back to origin
4. Normalize cycles to avoid duplicates (A→B→C→A same as B→C→A→B)

**Configuration**:
- `maxCycleLength`: Maximum cycle depth (default: 5)

### 2. Rapid Fund Movement

**Algorithm**: Temporal window analysis

**How it works**:
1. Group transactions by account
2. For each account, compare incoming and outgoing transactions
3. Flag when funds are received and forwarded within time window
4. Calculate time difference between related transfers

**Configuration**:
- `rapidTransferWindowMinutes`: Time window in minutes (default: 30)

### 3. Suspicious Transaction Chains

**Algorithm**: Path traversal with temporal constraints

**How it works**:
1. Sort transactions by timestamp
2. Build chains by following connected transactions
3. Check if subsequent transfers occur within time window
4. Flag chains exceeding minimum length threshold

**Configuration**:
- `minChainLength`: Minimum accounts in chain (default: 3)
- `rapidTransferWindowMinutes`: Maximum time between hops (default: 30)

### 4. Mule Account Detection

**Algorithm**: Network centrality analysis

**How it works**:
1. Calculate statistics for each account:
   - Incoming transaction count and volume
   - Outgoing transaction count and volume
   - Unique source and destination counts
2. Compute mule score based on:
   - High degree (many connections)
   - Balanced in/out flow
   - High transaction volume
3. Flag accounts exceeding threshold

**Scoring Factors**:
- Many incoming sources (+0.3)
- Many outgoing destinations (+0.3)
- High volume (+0.2)
- Balanced in/out ratio (+0.2)

### 5. Transaction Burst Detection

**Algorithm**: Sliding window frequency analysis

**How it works**:
1. Sort transactions by timestamp
2. Use 1-hour sliding window
3. Count transactions within each window
4. Flag when count exceeds threshold

**Configuration**:
- `burstThreshold`: Minimum transactions to trigger (default: 10)

### 6. Risk Scoring

**Algorithm**: Weighted heuristic scoring

**Formula**:
```
Risk Score = min(100, 
  circularTransferWeight * hasCircularTransfer +
  rapidMovementWeight * hasRapidMovement +
  suspiciousChainWeight * hasSuspiciousChain +
  muleAccountWeight * hasMuleAccount +
  unusualActivityWeight * hasUnusualActivity
)
```

**Risk Bands**:
- **CRITICAL**: 80-100
- **HIGH**: 60-79
- **MEDIUM**: 30-59
- **LOW**: 0-29

**Default Weights**:
- Circular Transfer: 30
- Rapid Movement: 20
- Suspicious Chain: 15
- Mule Account: 20
- Unusual Activity: 10

---

## 🎨 Design Philosophy

### Visual Language

**Color Palette**:
- **Primary Background**: Dark Navy (#0a1929)
- **Secondary Background**: Navy Blue (#102a43)
- **Accent**: Electric Cyan (#06b6d4)
- **Danger**: Coral Red (#ef4444)
- **Warning**: Amber (#f59e0b)
- **Success**: Green (#10b981)

**Typography**:
- **Headings**: System fonts, bold weights
- **Body**: -apple-system, sans-serif
- **Code/Data**: Monospace fonts

**UI Principles**:
1. **Clarity over Complexity**: Essential information at a glance
2. **Progressive Disclosure**: Details on demand
3. **Consistent Spacing**: 4px base unit
4. **Accessible Contrast**: WCAG AA compliant
5. **Responsive First**: Mobile to desktop

---

## ⚠️ Important Limitations

### This is a Demonstration Platform

1. **Synthetic Data Only**: All transactions are computer-generated
2. **Not Connected to Real Systems**: No actual banking integrations
3. **Heuristic Scoring**: Risk scores are rule-based, not ML probabilities
4. **Requires Investigation**: Alerts need human review and verification
5. **Not a Fraud Verdict**: Patterns indicate risk, not confirmed fraud

### Security Considerations

- **Do not use real financial data** in this demo application
- **Do not expose** this application publicly without authentication
- **Do not trust** automated decisions without human oversight
- **Always validate** findings with domain experts

---

## 🔮 Future Enhancements

### Planned Features

- [ ] Machine Learning integration (anomaly detection)
- [ ] Real-time transaction streaming
- [ ] Multi-currency support with exchange rates
- [ ] Advanced graph algorithms (community detection)
- [ ] Natural language alert explanations
- [ ] Email/SMS alert notifications
- [ ] Multi-user authentication and RBAC
- [ ] MongoDB/PostgreSQL persistence
- [ ] Audit log export and compliance reports
- [ ] API rate limiting and security hardening
- [ ] Docker containerization
- [ ] Kubernetes deployment configs

---

## 📝 CSV Import Format

### Required Headers

```csv
id,sender,receiver,amount,currency,timestamp
```

### Optional Headers

```csv
channel,status,reference
```

### Example CSV

```csv
id,sender,receiver,amount,currency,timestamp,channel,status
TX1001,ACC001,ACC002,1500,USD,2024-01-15T10:00:00Z,WIRE,COMPLETED
TX1002,ACC002,ACC003,1450,USD,2024-01-15T10:15:00Z,WIRE,COMPLETED
TX1003,ACC004,ACC005,250,USD,2024-01-15T10:30:00Z,ACH,COMPLETED
```

### Validation Rules

- `id`: Unique transaction identifier (required)
- `sender`: Account ID (required, non-empty)
- `receiver`: Account ID (required, non-empty)
- `amount`: Positive number (required)
- `currency`: ISO currency code (default: USD)
- `timestamp`: ISO 8601 datetime (required)
- `channel`: Transaction type (optional)
- `status`: Transaction status (optional)

---

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use ES6+ features
- Follow existing naming conventions
- Add JSDoc comments for complex functions
- Write tests for new detection rules
- Keep components focused and reusable

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🙏 Acknowledgments

- **Problem Statement**: Financial Technology Hackathon FT-PS-02
- **Icons**: Lucide React icon library
- **Graph Visualization**: Cytoscape.js community
- **UI Inspiration**: Modern fintech security platforms

---

## 📧 Support

For questions, issues, or feedback:

- **GitHub Issues**: [Report a bug](https://github.com/your-repo/issues)
- **Documentation**: See this README
- **Demo Data**: Reset from Settings page

---

## 🎯 Hackathon Compliance

### FT-PS-02 Requirements ✅

| Requirement | Status | Implementation |
|------------|--------|----------------|
| Analyze payment records | ✅ Complete | 300+ transaction demo dataset |
| Graph-based detection | ✅ Complete | Cytoscape.js with DFS algorithms |
| Detect unusual chains | ✅ Complete | Multi-hop path analysis |
| Detect circular transfers | ✅ Complete | Cycle detection with normalization |
| Detect rapid movement | ✅ Complete | Temporal window analysis |
| Identify mule accounts | ✅ Complete | Network centrality scoring |
| Visualize relationships | ✅ Complete | Interactive network graph |
| Highlight patterns | ✅ Complete | Evidence-based alerts with transaction IDs |

### Deliverables ✅

- ✅ Working web application (not mockup)
- ✅ Complete vertical workflow
- ✅ Automated tests
- ✅ Comprehensive documentation
- ✅ Setup instructions
- ✅ Demo data with planted patterns
- ✅ CSV import/export functionality

---

## 🚀 Quick Demo Scenarios

### Scenario 1: Detect Circular Money Flow

1. Open the application
2. Click **"Run Analysis"** on Dashboard
3. Navigate to **Fraud Alerts**
4. Filter by "Circular Transfer" category
5. Click an alert to see the cycle: ACC001 → ACC002 → ACC003 → ACC001
6. Go to **Network Graph** to visualize the loop

### Scenario 2: Investigate Mule Account

1. Run analysis if not already done
2. Go to **Fraud Alerts**
3. Filter by "Potential Mule" category
4. Select ACC100 alert
5. See: 6 incoming sources + 6 outgoing destinations
6. View network connections on graph

### Scenario 3: Import Custom Data

1. Navigate to **Transactions**
2. Click **"Import CSV"**
3. Paste CSV data (see format above)
4. Click **"Import"**
5. Return to Dashboard
6. Click **"Run Analysis"**
7. Review new alerts

---

**Built with ❤️ for the Financial Technology Hackathon**

**FraudLens AI - Making Financial Networks Transparent**
