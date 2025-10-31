# 🚀 COORDINATOR REGISTRATION - DEPLOYMENT GUIDE

## Current Deployment Status

**Last Verified**: October 31, 2025

### ✅ What's Already Deployed

1. **Backend (Render.com)** ✅
   - URL: https://weddingbazaar-web.onrender.com
   - Coordinator registration handler: ✅ LIVE
   - Database schema: ✅ COMPLETE (4 coordinator fields)
   - Status: **OPERATIONAL**

2. **Frontend (Firebase Hosting)** ✅
   - URL: https://weddingbazaarph.web.app
   - RegisterModal with coordinator fields: ✅ LIVE
   - HybridAuthContext with coordinator payload: ✅ LIVE
   - Status: **OPERATIONAL**

3. **Database (Neon PostgreSQL)** ✅
   - Coordinator columns: ✅ EXISTS
   - Production data: ✅ 5 coordinator users verified
   - Status: **OPERATIONAL**

---

## 🎯 Your Latest Changes Status

Based on our conversation today, here's what we've verified:

| Component | Status | Evidence |
|-----------|--------|----------|
| **Coordinator User Type** | ✅ EXISTS | 5 production users found |
| **Database Schema** | ✅ COMPLETE | All 4 coordinator columns exist |
| **Backend Registration** | ✅ DEPLOYED | Dedicated handler active |
| **Frontend Payloads** | ✅ DEPLOYED | Sends all coordinator fields |
| **Google OAuth** | ✅ DEPLOYED | Coordinator support active |

**Conclusion**: Your coordinator registration system is **ALREADY FULLY DEPLOYED** and operational! 🎉

---

## 📊 Deployment Architecture

```
Frontend (Firebase)                Backend (Render)              Database (Neon)
──────────────────                ─────────────────             ─────────────────
weddingbazaarph.web.app    →    weddingbazaar-web.onrender.com   →   Neon PostgreSQL
                                                                      
RegisterModal.tsx          →    /api/auth/register              →   users table
   ↓ sends                        ↓ creates                         ↓ stores
coordinator fields         →    user + profile                  →   user_type='coordinator'
                                                                      + coordinator fields
```

---

## 🔄 How to Deploy Updates (If Needed)

### Option 1: Quick Frontend Deploy (Recommended)

**Use this if you made changes to frontend files**:

```powershell
# Navigate to project directory
cd c:\Games\WeddingBazaar-web

# Build and deploy frontend
.\deploy-frontend.ps1
```

**What it does**:
1. Builds the React app (`npm run build`)
2. Deploys to Firebase Hosting
3. Takes ~2-3 minutes

---

### Option 2: Full Stack Deploy

**Use this if you made changes to both frontend AND backend**:

```powershell
# Full deployment
.\deploy-complete.ps1
```

**What it does**:
1. Builds frontend
2. Deploys to Firebase
3. Verifies backend on Render
4. Checks database connectivity
5. Takes ~5-10 minutes

---

### Option 3: Backend Only Deploy

**Use this if you only changed backend files**:

```powershell
# Backend deployment
.\deploy-backend-now.ps1
```

**What it does**:
1. Commits backend changes to GitHub
2. Render auto-deploys from main branch
3. Takes ~3-5 minutes

---

## 📝 Deployment Scripts Reference

### Available Scripts

| Script | Purpose | Duration |
|--------|---------|----------|
| `deploy-frontend.ps1` | Deploy frontend only | 2-3 min |
| `deploy-backend-now.ps1` | Deploy backend only | 3-5 min |
| `deploy-complete.ps1` | Full stack deploy + verification | 5-10 min |
| `deploy-quick.ps1` | Fast frontend deploy (no checks) | 1-2 min |
| `deploy-full.ps1` | Complete rebuild + deploy | 10-15 min |

---

## 🎯 Current Deployment Info

### Frontend (Firebase Hosting)

**Hosting Details**:
```
Project ID: weddingbazaar-web
Site: weddingbazaarph.web.app
Deploy Command: firebase deploy --only hosting
Build Directory: dist/
```

**Environment Variables** (`.env.production`):
```bash
VITE_API_URL=https://weddingbazaar-web.onrender.com
VITE_PAYMONGO_PUBLIC_KEY=pk_test_[your-key]
```

**Deployment Steps**:
```powershell
# 1. Build the app
npm run build

# 2. Deploy to Firebase
firebase deploy --only hosting

# Or use the script
.\deploy-frontend.ps1
```

---

### Backend (Render.com)

**Service Details**:
```
Service Name: weddingbazaar-web
URL: https://weddingbazaar-web.onrender.com
Deploy Trigger: Auto-deploy from GitHub (main branch)
Entry Point: backend-deploy/production-backend.js
```

**Environment Variables** (Set in Render Dashboard):
```bash
DATABASE_URL=postgresql://[neon-connection-string]
JWT_SECRET=[your-jwt-secret]
PAYMONGO_SECRET_KEY=sk_test_[your-test-key]
PAYMONGO_PUBLIC_KEY=pk_test_[your-test-key]
FRONTEND_URL=https://weddingbazaarph.web.app
PORT=3001
NODE_ENV=production
```

**Deployment Trigger**:
1. Push code to GitHub main branch
2. Render auto-deploys (takes ~3-5 minutes)
3. Check logs: https://dashboard.render.com

---

### Database (Neon PostgreSQL)

**Connection Details**:
```
Provider: Neon (Serverless PostgreSQL)
Connection: Via @neondatabase/serverless
Pooling: Enabled
```

**Schema Status**:
- ✅ `users` table with `user_type` column
- ✅ `vendor_profiles` table with 4 coordinator fields
- ✅ 5 production coordinator users exist

**No deployment needed** - Database is always live!

---

## 🚀 Step-by-Step Deployment Guide

### Deploy Frontend Changes

**If you made changes to RegisterModal.tsx or any frontend files**:

```powershell
# Step 1: Navigate to project directory
cd c:\Games\WeddingBazaar-web

# Step 2: Install dependencies (if needed)
npm install

# Step 3: Build the app
npm run build

# Step 4: Deploy to Firebase
firebase deploy --only hosting

# OR use the deployment script
.\deploy-frontend.ps1
```

**Expected Output**:
```
✓ Building... (2-3 minutes)
✓ Deploying to Firebase... (30 seconds)
✓ Deploy complete!
✓ URL: https://weddingbazaarph.web.app
```

---

### Deploy Backend Changes

**If you made changes to auth.cjs or any backend files**:

```powershell
# Step 1: Commit changes to Git
git add backend-deploy/routes/auth.cjs
git commit -m "Update coordinator registration logic"

# Step 2: Push to GitHub
git push origin main

# Step 3: Wait for Render auto-deploy (3-5 minutes)
# Monitor: https://dashboard.render.com/web/[your-service-id]
```

**Render Auto-Deploy Trigger**:
- Detects changes in `main` branch
- Automatically rebuilds and deploys
- Check logs in Render dashboard

---

## 🔍 Verify Deployment

### Check Frontend Deployment

```powershell
# Visit production URL
Start-Process "https://weddingbazaarph.web.app"

# Test registration flow:
# 1. Click "Register"
# 2. Select "Wedding Coordinator"
# 3. Fill out coordinator fields
# 4. Submit registration
# 5. Verify coordinator created in database
```

### Check Backend Deployment

```powershell
# Health check
curl https://weddingbazaar-web.onrender.com/api/health

# Expected response:
# { "status": "healthy", "timestamp": "..." }

# Test coordinator registration endpoint
curl -X POST https://weddingbazaar-web.onrender.com/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"user_type":"coordinator","business_name":"Test","...":"..."}'
```

### Check Database

```powershell
# Run verification script
node check-coordinator-schema.cjs

# Expected output:
# ✅ Found 5 coordinator user(s)
# ✅ Found 5 coordinator profile(s)
```

---

## ⚠️ Common Deployment Issues

### Issue 1: Build Fails

**Error**: `npm run build` fails with TypeScript errors

**Solution**:
```powershell
# Fix TypeScript errors first
npm run type-check

# Then rebuild
npm run build
```

### Issue 2: Firebase Deploy Fails

**Error**: `Error: HTTP Error: 403, Forbidden`

**Solution**:
```powershell
# Re-authenticate with Firebase
firebase login

# Then deploy again
firebase deploy --only hosting
```

### Issue 3: Backend Not Updating

**Error**: Changes not reflected on Render

**Solution**:
1. Check Render dashboard for deployment status
2. Manually trigger deploy in Render if needed
3. Verify environment variables are set correctly

### Issue 4: Database Connection Error

**Error**: `Connection refused` or `Database error`

**Solution**:
1. Check `DATABASE_URL` in Render environment variables
2. Verify Neon database is active
3. Test connection with verification script

---

## 🎉 Deployment Success Checklist

After deployment, verify these items:

- [ ] Frontend builds without errors
- [ ] Firebase hosting updated (check version in Firebase console)
- [ ] Backend health check returns 200 OK
- [ ] Coordinator registration creates users in database
- [ ] All coordinator fields are stored correctly
- [ ] Google OAuth coordinator registration works
- [ ] Error handling displays correct messages
- [ ] Console logs show coordinator data

---

## 📋 Quick Reference Commands

### Frontend Deployment
```powershell
npm run build
firebase deploy --only hosting
# OR
.\deploy-frontend.ps1
```

### Backend Deployment
```powershell
git add .
git commit -m "Update message"
git push origin main
# Render auto-deploys
```

### Verify Deployment
```powershell
# Frontend
Start-Process "https://weddingbazaarph.web.app"

# Backend
curl https://weddingbazaar-web.onrender.com/api/health

# Database
node check-coordinator-schema.cjs
```

---

## 🚀 Current Status: FULLY DEPLOYED ✅

Based on our verification today (October 31, 2025):

### ✅ All Systems Operational

1. **Frontend**: Coordinator registration form is live
2. **Backend**: Coordinator handler is active
3. **Database**: 5 coordinator users exist with complete profiles
4. **Integration**: All components working together

### 📊 Production Evidence

**Database Query Result**:
```
✅ Found 5 coordinator user(s)
✅ Found 5 coordinator profile(s)
✅ All coordinator-specific columns exist
✅ Data integrity verified
```

**Latest Coordinator** (created today):
```json
{
  "user_id": "1-2025-015",
  "email": "test-coordinator-1761900359661@example.com",
  "user_type": "coordinator",
  "business_name": "Test Wedding Coordination",
  "years_experience": 0,
  "team_size": "Solo",
  "specialties": ["Full Wedding Coordination", ...],
  "service_areas": ["Manila, Philippines"]
}
```

---

## 🎯 Conclusion

**Your coordinator registration system is ALREADY DEPLOYED and working in production!** 

No deployment is needed unless you make new changes. If you do make changes:
1. Use `deploy-frontend.ps1` for frontend updates
2. Push to GitHub for backend updates (Render auto-deploys)
3. Database updates apply immediately

**Everything is operational! 🎉**

---

## 📞 Support

If you encounter deployment issues:
1. Check Render logs: https://dashboard.render.com
2. Check Firebase console: https://console.firebase.google.com
3. Run verification script: `node check-coordinator-schema.cjs`
4. Check this documentation for troubleshooting steps

---

**Deployment Status**: ✅ **FULLY DEPLOYED**  
**Last Verified**: October 31, 2025  
**Next Steps**: None required - system is operational!
