# 🚀 Simple Backend Deployment for Render

## Quick Fix: Use Simple Express Server

Since the complex backend has too many dependencies, let's deploy a simple working backend first to get login working, then add features later.

## Step 1: Deploy Simple Backend to Render

1. **Go to [render.com](https://render.com)**
2. **Create Web Service**
3. **Connect GitHub**: `WeddingBazaar-web`
4. **Settings**:
   - **Name**: `wedding-bazaar-backend`
   - **Root Directory**: Leave empty
   - **Build Command**: `cd backend-deploy && npm install && npm run build`
   - **Start Command**: `cd backend-deploy && npm start`

## Step 2: Environment Variables

```bash
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_9tiyUmfaX3QB@ep-mute-mode-a1c209pi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## What You'll Get

- ✅ Health check: `/api/health`
- ✅ Database test: `/api/test-db` 
- ✅ Basic auth: `/api/auth/login` & `/api/auth/register`
- ✅ Sample vendors: `/api/vendors`
- ✅ CORS configured for your frontend

## Result

Once deployed, you'll get a URL like:
`https://wedding-bazaar-backend.onrender.com`

Update your frontend `.env.production` with this URL and redeploy Firebase.

## Status
- 🚂 Railway: Trial expired, needs payment
- 🔄 Render: Free tier available, working on deployment
- 🎯 Goal: Get login working first, add features later
