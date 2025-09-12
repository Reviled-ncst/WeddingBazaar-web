# 🚀 Quick Backend Deployment Guide

## Problem
Your frontend is deployed at https://weddingbazaarph.web.app but login doesn't work because there's no backend server running.

## Solution: Deploy Backend to Render

### Step 1: Prepare for Deployment
✅ **DONE**: Backend deployment package created in `backend-deploy/` folder

### Step 2: Deploy to Render

1. **Go to [Render.com](https://render.com)** and sign up with GitHub
2. **Click "New Web Service"**
3. **Connect GitHub and select your repository** `WeddingBazaar-web`
4. **Configure the service:**
   - **Name**: `wedding-bazaar-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend-deploy`

### Step 3: Set Environment Variables in Render

In the Render dashboard, add these environment variables:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:your_password@your_host.neon.tech/neondb?sslmode=require
JWT_SECRET=your_super_secure_jwt_secret_here_make_it_long_and_random
FRONTEND_URL=https://weddingbazaarph.web.app
PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
```

### Step 4: Update Frontend Environment

Once your backend is deployed (you'll get a URL like `https://wedding-bazaar-backend.onrender.com`):

1. **Create `.env.production`** from template:
   ```bash
   cp .env.production.template .env.production
   ```

2. **Update the API URL**:
   ```bash
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

3. **Rebuild and redeploy frontend**:
   ```bash
   npm run build
   firebase deploy
   ```

### Step 5: Test Login

After both frontend and backend are deployed:
1. Go to https://weddingbazaarph.web.app
2. Try to register a new account
3. Try to login

## Alternative: Deploy to Railway (if you want to keep using it)

1. Create a new Railway project
2. Connect your GitHub repository
3. Set the same environment variables
4. Deploy from the `backend-deploy` folder

## Need Neon Database URL?

If you need your Neon database connection string:
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to Connection Details
4. Copy the connection string

## Environment Variables Checklist

- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` (Neon PostgreSQL URL)
- [ ] `JWT_SECRET` (long random string)
- [ ] `FRONTEND_URL=https://weddingbazaarph.web.app`
- [ ] `PAYMONGO_SECRET_KEY` (your PayMongo secret key)
- [ ] `PAYMONGO_PUBLIC_KEY` (your PayMongo public key)

## Expected Result

After deployment:
- ✅ Frontend: https://weddingbazaarph.web.app
- ✅ Backend: https://your-backend-url.onrender.com
- ✅ Database: Neon PostgreSQL
- ✅ Login/Register working
- ✅ PayMongo payments working

## Troubleshooting

If login still doesn't work:
1. Check browser console for CORS errors
2. Verify backend URL in `.env.production`
3. Check that CORS is configured with your frontend URL
4. Verify all environment variables are set correctly
