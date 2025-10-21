# 🎯 DEPLOYMENT QUICK REFERENCE

## Most Common Deployment Scenarios

### ✏️ Made Backend Code Changes?
```bash
git add .
git commit -m "Description of change"
git push origin main
# ✅ Backend auto-deploys from main branch
```

### 🎨 Made Frontend Code Changes?
```bash
npm run build
firebase deploy
# ✅ Frontend deployed to Firebase
```

### 🔧 Added/Changed Environment Variables?
1. Go to Render Dashboard: https://dashboard.render.com
2. Select your service: weddingbazaar-web
3. Go to "Environment" tab
4. Add/update variables
5. Click "Save Changes"
6. Wait for auto-redeploy (~2-3 minutes)

### 📦 Made Both Backend & Frontend Changes?
```bash
# Method 1: Use the script
.\deploy-complete.ps1

# Method 2: Manual
git add .
git commit -m "Description of changes"
git push origin main
npm run build
firebase deploy
```

---

## ⚡ Super Quick Commands

```bash
# Check if you need to deploy
.\remind-deploy.ps1

# Check deployment status
.\check-deployment-status.ps1

# Deploy everything
.\deploy-complete.ps1

# Deploy only frontend
.\deploy-frontend.ps1

# View backend logs
# Go to: https://dashboard.render.com → Logs tab
```

---

## 🔗 Important URLs

| Service | URL | Dashboard |
|---------|-----|-----------|
| **Backend** | https://weddingbazaar-web.onrender.com | https://dashboard.render.com |
| **Frontend** | https://weddingbazaar-web.web.app | https://console.firebase.google.com |
| **Database** | Neon PostgreSQL | https://console.neon.tech |
| **Backend Health** | /api/health | Check at: https://weddingbazaar-web.onrender.com/api/health |
| **PayMongo Health** | /api/payment/health | Check at: https://weddingbazaar-web.onrender.com/api/payment/health |

---

## 🚨 Deployment Troubleshooting

### Backend not updating?
1. Check Render logs: https://dashboard.render.com
2. Verify Git push succeeded: `git log -1 --oneline`
3. Check build status in Render dashboard
4. Wait 2-3 minutes for deployment to complete

### Frontend not updating?
1. Clear browser cache (Ctrl+Shift+R)
2. Check Firebase console for deployment errors
3. Verify build succeeded: `npm run build`
4. Try incognito mode to test

### Environment variables not working?
1. Verify they're added in Render dashboard
2. Check variable names (case-sensitive)
3. Wait for auto-redeploy after saving
4. Verify with health endpoint

---

## 📱 AFTER DEPLOYING: Verify!

### Backend Verification
```bash
# Check health
curl https://weddingbazaar-web.onrender.com/api/health

# Check PayMongo integration
curl https://weddingbazaar-web.onrender.com/api/payment/health
```

### Frontend Verification
1. Visit: https://weddingbazaar-web.web.app
2. Open browser console (F12)
3. Check for errors
4. Test the feature you changed

### Full Integration Test
1. Create a booking
2. Process payment
3. Verify receipt generation
4. Check database records
5. Test error handling

---

## 💾 Git Workflow Reminder

```bash
# Before making changes
git pull origin main

# After making changes
git status                    # See what changed
git add .                     # Stage all changes
git commit -m "Description"   # Commit with message
git push origin main          # Deploy backend

# If you forgot to commit
git add .
git commit -m "Quick fix"
git push origin main
```

---

## 🎓 Pro Tips

1. **Always test locally first**: `npm run dev:full`
2. **Check health endpoints after deploying**
3. **Monitor Render logs during first deploy**
4. **Keep environment variables backed up**
5. **Test in incognito after frontend deploy**
6. **PayMongo changes require backend redeploy**
7. **Database migrations: Run before code deploy**

---

## ⏱️ Deployment Times

- **Backend (Render)**: 2-3 minutes
- **Frontend (Firebase)**: 30-60 seconds
- **Environment Variable Update**: Triggers redeploy (~2-3 min)
- **Database Migration**: 10-30 seconds

---

## 🆘 Emergency Rollback

### Backend Rollback
1. Go to Render Dashboard
2. Find previous successful deployment
3. Click "Redeploy" on that version

### Frontend Rollback
```bash
# Deploy a previous version from Git
git checkout <previous-commit-hash>
npm run build
firebase deploy
git checkout main
```

---

**Remember: No changes are live until deployed! 🚀**

Run `.\remind-deploy.ps1` anytime to see this reminder.
