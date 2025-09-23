# PlagiaSense Deployment Guide

## Vercel Deployment

### Frontend Deployment

1. **Prepare your repository:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Import the project
   - Configure environment variables:
     - `VITE_API_URL`: Your backend API URL

3. **Environment Variables:**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add the following variables:
     ```
     VITE_API_URL = https://your-backend-service.vercel.app
     ```

### Backend Deployment Options

#### Option 1: Separate Backend Service (Recommended)

Deploy the backend separately using:
- **Railway**: Easy Python deployment
- **Render**: Free tier available
- **Heroku**: Classic PaaS option
- **AWS Lambda**: Serverless option

#### Option 2: Backend on Vercel (Serverless Functions)

For a simpler single-platform deployment, you can use Vercel's serverless functions, but note limitations:
- File size limits
- Execution time limits
- Cold start issues with ML models

### Backend Deployment Steps (Railway Example)

1. **Create a new Railway project:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway create
   railway up
   ```

2. **Configure environment variables in Railway:**
   - Set Python version
   - Configure startup command: `uvicorn backend.api:app --host 0.0.0.0 --port $PORT`

3. **Update frontend environment variable:**
   - In Vercel dashboard, update `VITE_API_URL` to your Railway app URL

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   cd backend && pip install -r requirements.txt
   ```

2. **Start services:**
   ```bash
   # Terminal 1: Backend
   cd backend
   uvicorn api:app --reload --port 8000
   
   # Terminal 2: Frontend
   npm run dev
   ```

### Production Checklist

- [ ] Frontend builds successfully (`npm run build`)
- [ ] Environment variables configured
- [ ] API endpoints accessible
- [ ] CORS configured for production domain
- [ ] SSL/HTTPS enabled
- [ ] Error handling for production

### Troubleshooting

**Build Issues:**
- Check Node.js version compatibility
- Ensure all dependencies are installed
- Verify TypeScript compilation

**API Connection Issues:**
- Verify `VITE_API_URL` environment variable
- Check CORS configuration in backend
- Ensure backend is running and accessible

**Performance Issues:**
- Enable Vercel Edge Functions for better global performance
- Optimize bundle size with code splitting
- Use CDN for static assets