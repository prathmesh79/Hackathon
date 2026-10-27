# 🚀 FraudLens AI - Installation Guide

## Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env
```

The default values work out of the box for local development.

### Step 3: Start the Application

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

---

## Verify Installation

### 1. Check Backend is Running

Open: http://localhost:3001/api/health

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T..."
}
```

### 2. Open Frontend

Navigate to: http://localhost:5173

You should see the FraudLens AI dashboard.

### 3. Run Tests

```bash
npm test
```

You should see: **✓ 13 tests passing**

---

## Alternative: Run Separately

If you prefer to run frontend and backend in separate terminals:

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

---

## First Use

1. Open http://localhost:5173
2. Click **"Run Analysis"** on the Dashboard
3. Wait a few seconds for analysis to complete
4. Explore the detected fraud patterns!

---

## Troubleshooting

### Port Already in Use

If port 3001 or 5173 is already in use:

**Change Backend Port:**
Edit `.env`:
```
PORT=3002
```

**Change Frontend Port:**
Edit `client/vite.config.js`:
```js
server: {
  port: 5174
}
```

### Node Version Issues

FraudLens AI requires Node.js v18 or higher.

Check your version:
```bash
node --version
```

If needed, update Node.js from: https://nodejs.org

### Installation Hangs

If `npm install` takes too long:

1. Try: `npm install --legacy-peer-deps`
2. Or use: `yarn install` (if you have Yarn)
3. Check your internet connection

### Tests Fail

If tests fail, ensure:
1. Backend dependencies are installed
2. You're running from the project root
3. Node.js version is 18+

---

## System Requirements

**Minimum:**
- Node.js v18+
- npm v9+
- 2GB RAM
- Modern web browser (Chrome, Firefox, Safari, Edge)

**Recommended:**
- Node.js v20+
- npm v10+
- 4GB RAM
- Chrome or Firefox for best graph visualization

---

## Next Steps

After installation:

1. Read **README.md** for full documentation
2. Check **DEMO_GUIDE.md** for presentation tips
3. Try importing **sample-transactions.csv**
4. Explore the Network Graph visualization

---

## Need Help?

- Check README.md for detailed documentation
- See DEMO_GUIDE.md for common scenarios
- Run `npm test` to verify the system works
- All tests should pass (13/13)

---

**Installation complete! Happy fraud hunting! 🛡️**
