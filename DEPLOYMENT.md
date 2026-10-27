# Deployment Guide for FraudLens AI

## Deploying to Vercel

This project consists of two parts:
1. **Frontend** (React + Vite) - Deploy to Vercel
2. **Backend** (Node.js + Express) - Deploy separately (e.g., Render, Railway, or Vercel Serverless)

### Option 1: Frontend Only (Demo Mode - Recommended for Quick Deploy)

The frontend works standalone with demo data and doesn't require a backend.

#### Steps:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `prathmesh79/Hackathon`
4. Configure the build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

That's it! Your FraudLens AI dashboard will be live with demo data.

### Option 2: Full Stack Deployment (Frontend + Backend)

#### Backend Deployment (Choose one):

**Option A: Deploy to Render.com**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Create new "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Port**: 5000
5. Deploy and copy the backend URL (e.g., `https://your-app.onrender.com`)

**Option B: Deploy to Railway.app**
1. Go to [Railway](https://railway.app/)
2. Create new project from GitHub
3. Configure environment:
   - **Root Directory**: `server`
   - **Start Command**: `node src/server.js`
4. Deploy and copy the backend URL

#### Frontend Deployment:
1. Go to Vercel Dashboard
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend.onrender.com`)
5. Deploy

#### Update API Configuration:
After deployment, update `client/src/services/api.js`:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
```

### Quick Fix for Current Deployment

Since your current Vercel deployment is showing 404, you need to:

1. **In Vercel Dashboard**:
   - Go to your project settings
   - Change **Root Directory** to: `client`
   - Keep Framework Preset as: `Vite`
   - Redeploy

2. **Or redeploy from GitHub**:
   - Delete current Vercel project
   - Create new project
   - Select your repository
   - Set Root Directory to `client`
   - Deploy

## Environment Variables

### Frontend (.env in client folder)
```
VITE_API_BASE_URL=your-backend-url-here
```

### Backend (.env in root folder)
```
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
```

## Troubleshooting

### 404 Error on Vercel
- **Cause**: Vercel is looking for files in root, but your app is in `client` folder
- **Fix**: Set Root Directory to `client` in Vercel project settings

### API Errors
- **Cause**: Frontend can't reach backend
- **Fix**: Deploy backend separately and set `VITE_API_BASE_URL` environment variable

### Build Fails
- **Cause**: Missing dependencies
- **Fix**: Ensure `package.json` and `package-lock.json` exist in client folder

## Demo Data

The application includes built-in demo data, so the frontend works perfectly without a backend for:
- Dashboard statistics
- Network graph visualization
- Transaction list
- Alerts and cases
- All interactive features

The backend is only needed if you want to:
- Import real CSV data
- Persist data between sessions
- Run custom fraud detection algorithms
- Generate real-time alerts

## Live Demo URL Structure

After successful deployment:
- **Frontend**: https://your-project.vercel.app
- **Backend** (optional): https://your-backend.render.com

Enjoy your deployed FraudLens AI! 🎉
