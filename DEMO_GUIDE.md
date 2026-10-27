# 🎬 FraudLens AI - Demo Guide

**5-Minute Demo Script for Hackathon Presentation**

---

## 🎯 Demo Flow

### Minute 1: Introduction (60s)

**SAY**: "FraudLens AI detects fraud patterns in financial transactions using graph-based algorithms. We analyze payment networks to find circular transfers, mule accounts, and rapid fund movement."

**SHOW**:
- Open http://localhost:5173
- Point out the premium fintech UI
- Highlight sidebar navigation

---

### Minute 2: Run Analysis (60s)

**SAY**: "We have 300+ transactions loaded with planted fraud patterns. Let's analyze them."

**DO**:
1. Click **"Run Analysis"**
2. Show it completes in milliseconds
3. Point out metrics:
   - Total transactions: 300+
   - Suspicious patterns found: 20+
   - High-risk alerts: 5+

---

### Minute 3: Explore Alerts (90s)

**SAY**: "Each alert shows exactly which transactions and accounts are suspicious, with evidence."

**DO**:
1. Navigate to **Fraud Alerts**
2. Click a **Circular Transfer** alert
3. Show:
   - Accounts: ACC001 → ACC002 → ACC003 → ACC001
   - Risk score: 30/100
   - Supporting transaction IDs
   - Evidence explanation

**KEY POINT**: "Every alert is backed by real transaction evidence."

---

### Minute 4: Network Visualization (90s)

**SAY**: "The network graph visualizes suspicious connections between accounts."

**DO**:
1. Go to **Network Graph**
2. Show the interactive graph
3. Explain colors:
   - Red nodes = suspicious accounts
   - Orange edges = suspicious transfers
4. Click a high-risk alert in sidebar
5. See it highlight on the graph
6. Search for "ACC100"
7. Show mule account pattern

---

### Minute 5: Wrap-Up (30s)

**SAY**: "FraudLens provides complete investigation workflow—CSV import, transaction search, case management, and configurable detection rules."

**SHOW**:
1. Quick view of **Transactions** page
2. Show **Settings** with configurable thresholds
3. Mention automated tests (13/13 passing)

---

## 🎤 Key Talking Points

✅ **Real Algorithms**: DFS cycle detection, not fake visualization  
✅ **Tested**: 13 automated tests covering all detection rules  
✅ **Complete**: End-to-end workflow from detection to case resolution  
✅ **Explainable**: Transparent scoring with evidence for every alert  
✅ **Production-Ready**: RESTful APIs, validation, error handling  

---

## 📊 Quick Demo Scenarios

### Show Circular Transfer
1. Dashboard → Run Analysis
2. Alerts → Filter: Circular Transfer
3. Click alert → Show ACC001→ACC002→ACC003→ACC001
4. Network Graph → Highlight the cycle

### Show Mule Account
1. Alerts → Filter: Potential Mule
2. Click ACC100
3. Show: 6 sources → ACC100 → 6 destinations
4. Network Graph → Show hub-and-spoke pattern

### Import Custom Data
1. Transactions → Import CSV
2. Paste sample data
3. Dashboard → Run Analysis
4. Show new alerts

---

## 🔧 Quick Commands

```bash
# Start everything
npm run dev

# Run tests
npm test

# Access URLs
Frontend: http://localhost:5173
Backend: http://localhost:3001/api
```

---

## ⚡ Troubleshooting

**Server not running?**
```bash
npm run dev
```

**Need to reset data?**
Dashboard → "Reset Demo" button

**Graph not loading?**
Make sure analysis has been run first

---

## 🎯 Demo Success Checklist

At end of demo, audience should know:

✅ What problem it solves (automated fraud detection)  
✅ How it works (graph algorithms + pattern detection)  
✅ Why it's better (explainable, visual, complete workflow)  
✅ That it's production-ready (tests, docs, polish)  

---

**Good luck! 🚀**
