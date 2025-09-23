# 🚨 RENDER DEPLOYMENT FIX - Manual Setup

## Issue: "Could not open requirements file [Errno 2] No such file or directory: 'requirements.txt'"

### 🔧 SOLUTION: Use Manual Deployment (Recommended)

**Instead of using render.yaml, deploy manually through Render dashboard:**

---

## 📋 Step-by-Step Manual Deployment

### 1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Login to your account

### 2. **Create New Web Service**
   - Click **"New"** → **"Web Service"**
   - Choose **"Build and deploy from a Git repository"**
   - Connect your GitHub account if not already connected

### 3. **Select Repository**
   - Find and select: **`plagiasense-ios-design`**
   - Click **"Connect"**

### 4. **Configure Service Settings**
   ```
   Name: plagiasense-backend
   Runtime: Python 3
   Branch: main
   Root Directory: (leave blank)
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn backend.api:app --host 0.0.0.0 --port $PORT
   ```

### 5. **Set Environment Variables**
   In the "Environment Variables" section, add:
   ```
   PYTHONPATH = ./backend
   ALLOWED_ORIGINS = https://your-vercel-app.vercel.app
   ```

### 6. **Deploy**
   - Click **"Create Web Service"**
   - Wait for deployment (5-10 minutes)

---

## 🔍 Why This Fixes The Issue

- ✅ Render can properly detect the requirements.txt in root directory
- ✅ No render.yaml configuration conflicts
- ✅ Better error visibility and debugging
- ✅ More reliable build process

---

## 🚨 Alternative: Quick Fix for render.yaml

If you prefer using render.yaml, try this updated version:

```yaml
services:
  - type: web
    name: plagiasense-backend
    env: python
    buildCommand: |
      ls -la
      pip install --upgrade pip
      pip install -r requirements.txt
    startCommand: uvicorn backend.api:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHONPATH
        value: ./backend
```

---

## 📞 Next Steps

1. **Try Manual Deployment First** (most reliable)
2. If successful, get your service URL: `https://your-service.onrender.com`
3. Update Vercel environment: `VITE_API_URL = https://your-service.onrender.com`
4. Test the connection

**Manual deployment should resolve the requirements.txt issue!** 🎉