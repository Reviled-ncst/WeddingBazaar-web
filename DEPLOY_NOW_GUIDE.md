# 🚀 QUICK DEPLOYMENT GUIDE

## ⚡ DEPLOY NOW (Quick Commands)

### **Frontend Only (Firebase):**
```powershell
# Quick deploy (already built)
npm run deploy:quick

# Or manual steps:
npm run build:prod
firebase deploy --only hosting
```

### **Backend Only (Render):**
```powershell
# Backend auto-deploys from GitHub
# Just push to main branch:
git add .
git commit -m "Your message"
git push origin main
```

### **Full Stack Deploy:**
```powershell
# 1. Build frontend
npm run build:prod

# 2. Deploy frontend
firebase deploy --only hosting

# 3. Push backend (auto-deploys on Render)
git add .
git commit -m "Deploy: [your message]"
git push origin main
```

---

## 🎯 YOUR DEPLOYMENT URLS

### **Frontend (Firebase):**
- Production: https://weddingbazaarph.web.app
- Command: `npm run deploy:quick`

### **Backend (Render):**
- Production: https://weddingbazaar-web.onrender.com
- Auto-deploys: On git push to main

### **Database (Neon):**
- Always live, no deployment needed
- Connection managed by backend

---

## 📝 DEPLOYMENT CHECKLIST

Before deploying, check:
- [ ] Code builds without errors: `npm run build:prod`
- [ ] Backend is running: `npm run health:backend`
- [ ] Environment variables are set correctly
- [ ] Git is committed: `git status`

---

## 🚀 RECOMMENDED DEPLOYMENT WORKFLOW

### **Option 1: Quick Deploy (Frontend Only)**
```powershell
npm run deploy:quick
```
**Use when:** Only frontend changes, backend is already deployed

### **Option 2: Full Deploy**
```powershell
# Step 1: Build and deploy frontend
npm run build:prod
firebase deploy --only hosting

# Step 2: Push backend changes
git add .
git commit -m "Deploy: backend + frontend updates"
git push origin main

# Step 3: Wait for Render to auto-deploy
# Check: https://dashboard.render.com
```
**Use when:** Both frontend and backend changes

### **Option 3: Safe Deploy (with health checks)**
```powershell
npm run deploy:safe
```
**Use when:** Want to verify everything before deploying

---

## ⏱️ DEPLOYMENT TIMES

| Service | Time | Auto-Deploy |
|---------|------|-------------|
| Frontend (Firebase) | 1-2 minutes | ❌ Manual |
| Backend (Render) | 3-5 minutes | ✅ On git push |
| Database (Neon) | Instant | Always live |

---

## 🔍 VERIFY DEPLOYMENT

### **Check Frontend:**
```powershell
npm run health:frontend
# Or open: https://weddingbazaarph.web.app
```

### **Check Backend:**
```powershell
npm run health:backend
# Or open: https://weddingbazaar-web.onrender.com/api/health
```

### **Check Full Stack:**
```powershell
npm run health:full
```

---

## 🎯 DEPLOY RIGHT NOW

**Copy-paste this in PowerShell:**

```powershell
# Full deployment in one go
Write-Host "🚀 Starting deployment..." -ForegroundColor Green

# 1. Build frontend
Write-Host "📦 Building frontend..." -ForegroundColor Cyan
npm run build:prod

# 2. Deploy to Firebase
Write-Host "🔥 Deploying to Firebase..." -ForegroundColor Yellow
firebase deploy --only hosting

# 3. Commit and push backend
Write-Host "📤 Pushing to GitHub (Render auto-deploy)..." -ForegroundColor Magenta
git add .
git commit -m "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Frontend: https://weddingbazaarph.web.app" -ForegroundColor Cyan
Write-Host "Backend: https://weddingbazaar-web.onrender.com" -ForegroundColor Cyan
Write-Host "Wait 3-5 minutes for Render backend deployment" -ForegroundColor Yellow
```

---

## 📊 DEPLOYMENT STATUS

**Current Status:**
- Frontend URL: https://weddingbazaarph.web.app
- Backend URL: https://weddingbazaar-web.onrender.com
- Backend Status: Check at https://dashboard.render.com

**After Deployment:**
1. ✅ Wait 1-2 minutes for Firebase
2. ✅ Wait 3-5 minutes for Render backend
3. ✅ Test booking flow on production
4. ✅ Check Network tab (Console logs won't show in production)

---

## ⚠️ IMPORTANT NOTES

### **Console Logs in Production:**
❌ Console logs are STRIPPED in production builds  
✅ Use Network tab to debug instead  
✅ Or check backend logs on Render dashboard  

### **If Deployment Fails:**
```powershell
# Check build errors
npm run build:prod

# Check Firebase login
firebase login

# Check Git status
git status

# Check Render dashboard
# https://dashboard.render.com
```

---

## 🎯 QUICK COMMANDS REFERENCE

```powershell
# Frontend only
npm run deploy:quick

# Frontend manual
npm run build:prod
firebase deploy --only hosting

# Backend (auto-deploys)
git push origin main

# Health checks
npm run health:backend
npm run health:frontend
npm run health:full

# View logs
firebase hosting:channel:list      # Frontend
# Render logs: https://dashboard.render.com
```

---

**Ready to deploy? Run one of the commands above!** 🚀

**Recommended:** Use the "Deploy right now" script for full stack deployment.
