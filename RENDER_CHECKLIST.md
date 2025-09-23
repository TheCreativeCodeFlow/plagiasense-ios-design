# 🚀 Render Deployment Quick Checklist

## Pre-Deployment Checklist
- [ ] All files committed to GitHub
- [ ] `requirements.txt` updated
- [ ] `render.yaml` configured
- [ ] CORS settings updated in `backend/api.py`
- [ ] Repository pushed to GitHub

## Render Service Setup
- [ ] Render account created
- [ ] Repository connected
- [ ] Service configuration:
  - [ ] Name: `plagiasense-backend`
  - [ ] Runtime: Python 3
  - [ ] Build Command: `pip install -r requirements.txt`
  - [ ] Start Command: `uvicorn backend.api:app --host 0.0.0.0 --port $PORT`

## Environment Variables
- [ ] `PYTHONPATH` = `./backend`
- [ ] `ALLOWED_ORIGINS` = `https://your-vercel-app.vercel.app`

## Post-Deployment
- [ ] Service builds successfully
- [ ] Health check passes at `/`
- [ ] API endpoints respond correctly
- [ ] Update Vercel `VITE_API_URL` environment variable
- [ ] Test frontend-backend connection

## Validation Commands
```bash
# Test health endpoint
curl https://your-app.onrender.com/

# Test API endpoints  
curl https://your-app.onrender.com/api/models

# Run health check script
python health_check.py https://your-app.onrender.com
```

## Your Service URLs
- **Backend**: `https://your-service-name.onrender.com`
- **API Docs**: `https://your-service-name.onrender.com/docs`
- **Health**: `https://your-service-name.onrender.com/`

## Next Steps
1. Deploy backend to Render
2. Get your Render service URL  
3. Update Vercel environment variable `VITE_API_URL`
4. Test complete application flow

🎉 **Ready for deployment!**