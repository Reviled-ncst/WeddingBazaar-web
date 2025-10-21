# 🚀 DEPLOYMENT REMINDER

## ⚠️ IMPORTANT: ALWAYS DEPLOY AFTER CHANGES

After making ANY changes to the codebase, you MUST deploy to ensure changes are live in production.

---

## 🎯 QUICK DEPLOYMENT COMMANDS

### Backend Deployment (Render)
```bash
# Commit and push changes
git add .
git commit -m "Your change description"
git push origin main

# Render will auto-deploy from main branch
# Check deployment status at: https://dashboard.render.com
```

### Frontend Deployment (Firebase)
```bash
# Build and deploy frontend
npm run build
firebase deploy

# Or use the deployment script
.\deploy-frontend.ps1
```

### Full Stack Deployment (Both)
```bash
# Deploy everything at once
.\deploy-complete.ps1
```

---

## 📋 DEPLOYMENT CHECKLIST

Before deploying, ensure:
- ✅ All changes are committed to Git
- ✅ Environment variables are set correctly
- ✅ No console errors in local testing
- ✅ Database migrations are applied (if any)
- ✅ API endpoints are tested locally

After deploying:
- ✅ Verify backend health: https://weddingbazaar-web.onrender.com/api/health
- ✅ Verify frontend: https://weddingbazaar-web.web.app
- ✅ Test critical user flows
- ✅ Check browser console for errors

---

## 🔗 DEPLOYMENT URLS

**Backend (Render):**
- Production: https://weddingbazaar-web.onrender.com
- Dashboard: https://dashboard.render.com

**Frontend (Firebase):**
- Production: https://weddingbazaar-web.web.app
- Console: https://console.firebase.google.com

**Database (Neon):**
- Console: https://console.neon.tech

---

## 🚨 CURRENT DEPLOYMENT STATUS

### Backend
- Platform: Render
- Auto-deploy: ✅ Enabled (from main branch)
- Last Deploy: Check Render dashboard

### Frontend
- Platform: Firebase Hosting
- Auto-deploy: ❌ Manual deployment required
- Last Deploy: Check Firebase console

### PayMongo Integration
- Test Keys: ✅ Configured in Render
- Live Keys: 📝 Ready to add when needed
- Webhooks: 📝 Configure after adding keys

---

## 💡 DEPLOYMENT TIPS

1. **Backend Changes**: Auto-deploys when you push to `main` branch
2. **Frontend Changes**: Requires manual `firebase deploy` command
3. **Environment Variables**: Update in Render dashboard for backend
4. **Database Changes**: Run migration scripts before deploying code
5. **PayMongo Keys**: Add to Render env vars, wait for redeploy

---

## 🎬 NEXT STEPS AFTER THIS CHANGE

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

2. **Deploy backend:**
   ```bash
   git push origin main
   ```

3. **Deploy frontend:**
   ```bash
   npm run build
   firebase deploy
   ```

4. **Verify deployment:**
   - Check backend health endpoint
   - Test the changed feature in production
   - Monitor for errors

---

## 📞 NEED HELP?

If deployment fails:
1. Check Render logs for backend errors
2. Check Firebase deployment logs
3. Verify environment variables are correct
4. Test locally first with `npm run dev:full`

---

**Remember: Changes are NOT live until deployed! 🚀**
