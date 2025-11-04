# 🚀 Production Deployment Commands

## Deploy Frontend to Firebase

```powershell
# Build production version
npm run build:prod

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Or use the deployment script
.\deploy-frontend.ps1
```

## Deploy Backend to Render

Backend auto-deploys from GitHub when you push to the `main` branch.

```powershell
# Commit and push changes
git add .
git commit -m "Update booking modal UX"
git push origin main

# Render will automatically detect and deploy
# Monitor at: https://dashboard.render.com
```

## Deploy Full Stack (Both)

```powershell
# Use the complete deployment script
.\deploy-complete.ps1
```

## Current Production URLs

- **Frontend**: https://weddingbazaarph.web.app
- **Backend**: https://weddingbazaar-web.onrender.com
- **Admin Dashboard**: https://dashboard.render.com

## Verify Deployment

```powershell
# Check frontend
curl https://weddingbazaarph.web.app

# Check backend health
curl https://weddingbazaar-web.onrender.com/api/health

# Check specific endpoint
curl https://weddingbazaar-web.onrender.com/api/ping
```

## Production Testing

After deployment, test at:
- https://weddingbazaarph.web.app

Login with test account:
- Email: test@example.com
- Role: Individual/Couple user
