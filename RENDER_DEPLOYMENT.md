# PlagiaSense Backend Deployment on Render

## 🚀 Step-by-Step Render Deployment Guide

### Prerequisites
- GitHub repository with your PlagiaSense code
- Render account (free tier available)

---

## 📋 Deployment Steps

### 1. **Prepare Your Repository**

Ensure these files are in your repository root:
- ✅ `requirements.txt` - Python dependencies
- ✅ `render.yaml` - Render service configuration  
- ✅ `start.sh` - Startup script
- ✅ `backend/api.py` - Your FastAPI application

### 2. **Deploy to Render**

#### Option A: Using Render Dashboard (Recommended)

1. **Go to [render.com](https://render.com) and sign up/login**

2. **Create a New Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your `plagiasense-ios-design` repository

3. **Configure the Service:**
   ```
   Name: plagiasense-backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn backend.api:app --host 0.0.0.0 --port $PORT
   ```

4. **Set Environment Variables:**
   ```
   PYTHONPATH = ./backend
   ALLOWED_ORIGINS = https://your-vercel-app.vercel.app,https://plagiasense.vercel.app
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for build and deployment (5-10 minutes)

#### Option B: Using render.yaml (Infrastructure as Code)

1. **Ensure `render.yaml` is in your repository root**
2. **Go to Render Dashboard**
3. **Click "New" → "Blueprint"**
4. **Connect repository and deploy**

### 3. **Configure Environment Variables**

In your Render service dashboard → Environment:

| Variable | Value | Description |
|----------|--------|-------------|
| `PYTHONPATH` | `./backend` | Python module path |
| `ALLOWED_ORIGINS` | `https://your-vercel-app.vercel.app` | CORS allowed origins |
| `PORT` | (auto-set by Render) | Service port |

### 4. **Update Frontend Configuration**

Once deployed, update your Vercel environment variables:

```bash
VITE_API_URL = https://your-render-service.onrender.com
```

---

## 🔧 Configuration Details

### **Requirements.txt Optimizations:**
- Uses CPU-only PyTorch for faster builds
- Includes all necessary ML dependencies
- Optimized for Render's environment

### **Startup Process:**
1. Downloads NLTK data automatically
2. Sets Python path correctly
3. Starts FastAPI with proper host/port binding

### **CORS Configuration:**
- Allows your Vercel frontend domain
- Supports development and production URLs
- Configurable via environment variables

---

## 📊 Resource Requirements

### **Free Tier Limitations:**
- ⏱️ 750 build hours/month
- 💾 512MB RAM
- 🕐 Apps sleep after 15 min of inactivity
- 🔄 Cold start delay (10-30 seconds)

### **Paid Tier Benefits:**
- 🚀 No sleep mode
- 📈 More RAM/CPU options
- ⚡ Faster builds
- 🔒 Private services

---

## 🐛 Troubleshooting

### **Build Issues:**

**Problem:** `torch` installation fails
**Solution:** Use CPU-only version in requirements.txt
```
torch==2.0.1+cpu
```

**Problem:** NLTK data not found
**Solution:** Startup script automatically downloads required data

**Problem:** Module import errors
**Solution:** Ensure `PYTHONPATH=./backend` is set

### **Runtime Issues:**

**Problem:** CORS errors
**Solution:** Add your Vercel domain to `ALLOWED_ORIGINS`

**Problem:** Cold starts
**Solution:** Upgrade to paid tier or use external monitoring

**Problem:** Memory errors with large models
**Solution:** Use smaller models or upgrade service plan

---

## 🔍 Monitoring & Logs

### **Access Logs:**
1. Go to your service dashboard
2. Click "Logs" tab
3. Monitor real-time application logs

### **Health Checks:**
- Render automatically monitors `/` endpoint
- Check service status in dashboard
- Set up external monitoring if needed

---

## 🎯 Production Checklist

- [ ] Service deploys successfully
- [ ] Health check endpoint responds
- [ ] CORS configured for frontend domain
- [ ] Environment variables set
- [ ] Frontend can connect to backend
- [ ] API endpoints return expected responses
- [ ] File uploads work correctly
- [ ] Error handling works properly

---

## 📞 Support

- **Render Docs:** [render.com/docs](https://render.com/docs)
- **PlagiaSense Issues:** Check GitHub repository issues
- **FastAPI Docs:** [fastapi.tiangolo.com](https://fastapi.tiangolo.com)

---

## 🔄 Updates & Maintenance

### **Auto-Deploy:**
- Push to main branch triggers automatic deployment
- Check deployment status in Render dashboard
- Monitor logs for any issues

### **Manual Deploy:**
- Use "Manual Deploy" button in dashboard
- Useful for troubleshooting or quick fixes

Your backend will be available at: `https://your-service-name.onrender.com` 🎉