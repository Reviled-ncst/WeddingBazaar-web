# Auto-Deployment Setup Guide

## 🚀 Automated Deployment System

Your WeddingBazaar project now has a complete automated deployment system that triggers on every successful change.

---

## 📋 Table of Contents

1. [GitHub Actions Workflows](#github-actions-workflows)
2. [Local Deployment Scripts](#local-deployment-scripts)
3. [Setup Instructions](#setup-instructions)
4. [Usage](#usage)
5. [Troubleshooting](#troubleshooting)

---

## 🤖 GitHub Actions Workflows

### 1. **Production Deployment** (`.github/workflows/deploy-production.yml`)

**Triggers:**
- Push to `main` branch
- Manual trigger via GitHub UI

**Steps:**
1. ✅ Run linter and build tests
2. 🔧 Deploy backend to Render
3. 🌐 Deploy frontend to Firebase
4. ✅ Verify deployment health

**Usage:**
```bash
# Automatic deployment on push to main
git push origin main

# Or manually trigger from GitHub Actions tab
```

---

### 2. **Staging Deployment** (`.github/workflows/deploy-staging.yml`)

**Triggers:**
- Push to `develop` or `staging` branch
- Pull requests

**Steps:**
1. ✅ Run tests
2. 🌐 Deploy preview to Firebase
3. 💬 Comment preview URL on PR

**Usage:**
```bash
# Create preview deployment
git push origin develop
```

---

### 3. **Automated Tests** (`.github/workflows/auto-test.yml`)

**Triggers:**
- Every push to any branch
- All pull requests

**Tests:**
- 🔍 ESLint checks
- 📦 Build verification
- 🔒 Security audit
- 🧪 API integration tests

---

### 4. **Database Migration** (`.github/workflows/database-migration.yml`)

**Triggers:**
- Manual trigger only

**Options:**
- Migration type: categories, subcategories, full
- Environment: production, staging

---

## 💻 Local Deployment Scripts

### Quick Commands

```bash
# Full automated deployment (with tests)
npm run deploy:auto

# Quick deploy (skip tests)
npm run deploy:now

# Frontend only
npm run deploy:frontend

# Verify deployment
npm run verify:deployment
```

### PowerShell Scripts

```powershell
# Full deployment
.\scripts\deploy-auto.ps1

# Quick deploy
.\scripts\quick-deploy.ps1
```

### Bash Scripts

```bash
# Full deployment
bash scripts/deploy-auto.sh

# Quick deploy
bash scripts/quick-deploy.sh
```

---

## 🛠️ Setup Instructions

### 1. GitHub Secrets Configuration

Add these secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

```
RENDER_DEPLOY_HOOK_URL=https://api.render.com/deploy/srv-xxx
FIREBASE_SERVICE_ACCOUNT=<your-firebase-service-account-json>
DATABASE_URL=<your-neon-database-url>
```

#### Getting Render Deploy Hook:
1. Go to Render Dashboard
2. Select your service
3. Settings → Deploy Hook
4. Copy the URL

#### Getting Firebase Service Account:
```bash
firebase init
firebase login
# Download from Firebase Console → Project Settings → Service Accounts
```

---

### 2. Local Environment Setup

Create `.env.production` file:

```env
VITE_API_URL=https://weddingbazaar-web.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

---

### 3. Firebase CLI Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (if not done)
firebase init hosting
```

---

## 📖 Usage Guide

### Automatic Deployment Workflow

```bash
# 1. Make your changes
git add .
git commit -m "feat: add new feature"

# 2. Push to main (triggers auto-deployment)
git push origin main

# 3. Monitor deployment
# - Check GitHub Actions tab
# - Watch Render dashboard
# - Verify at: https://weddingbazaar-web.web.app
```

### Manual Deployment

```bash
# Option 1: Full automated deployment
npm run deploy:auto

# Option 2: Quick deploy (no tests)
npm run deploy:now

# Option 3: Frontend only
npm run deploy:frontend
```

### Deployment Verification

```bash
# Run verification script
npm run verify:deployment

# Manual checks
npm run verify:api
npm run verify:frontend
npm run verify:all
```

---

## 🔍 Monitoring Deployments

### GitHub Actions

1. Go to GitHub repository
2. Click **Actions** tab
3. View workflow runs in real-time

### Render Dashboard

- URL: https://dashboard.render.com
- Monitor backend deployment logs
- View service health

### Firebase Console

- URL: https://console.firebase.google.com
- View hosting deployments
- Check usage metrics

---

## ⚙️ Deployment Options

### Environment-Specific Builds

```bash
# Production build
npm run build:prod

# Staging build
npm run build:staging

# Development build
npm run build
```

### Health Checks

```bash
# Backend health
npm run health:backend

# Frontend health
npm run health:frontend

# Full system health
npm run health:full
```

---

## 🐛 Troubleshooting

### Deployment Failed

```bash
# 1. Check build logs
npm run build:prod

# 2. Check linter
npm run lint

# 3. Verify environment variables
npm run env:check

# 4. Test locally
npm run dev:full
```

### Backend Not Responding

```bash
# 1. Check Render logs
# Go to Render Dashboard → Your Service → Logs

# 2. Verify database connection
npm run health:database

# 3. Test API endpoints
npm run test:api
```

### Frontend Not Loading

```bash
# 1. Check Firebase deployment
firebase hosting:channel:list

# 2. Clear cache
# Browser: Ctrl+Shift+R (hard refresh)

# 3. Verify build output
ls -la dist/
```

### GitHub Actions Failing

```bash
# 1. Check secrets are set correctly
# GitHub → Settings → Secrets and variables → Actions

# 2. Re-run failed workflow
# GitHub → Actions → Select workflow → Re-run jobs

# 3. Check workflow logs
# GitHub → Actions → Select run → View logs
```

---

## 🔐 Security Notes

- ✅ Never commit secrets to Git
- ✅ Use environment variables for sensitive data
- ✅ Rotate API keys regularly
- ✅ Enable branch protection on `main`
- ✅ Require PR reviews before merging

---

## 📊 Deployment Checklist

Before deploying:

- [ ] All tests passing locally
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API endpoints tested
- [ ] Build succeeds
- [ ] Linter checks pass

After deploying:

- [ ] Frontend loads correctly
- [ ] Backend health check passes
- [ ] API endpoints responding
- [ ] No console errors in production
- [ ] Database queries working
- [ ] Authentication functional

---

## 🎯 Best Practices

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and test
npm run dev:full

# 3. Commit changes
git add .
git commit -m "feat: add new feature"

# 4. Push to GitHub
git push origin feature/new-feature

# 5. Create Pull Request
# - GitHub auto-runs tests
# - Deploys preview environment

# 6. Merge to main
# - Auto-deploys to production
```

### Hotfix Workflow

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-fix

# 2. Apply fix and test
npm run dev:full

# 3. Quick deploy for urgent fixes
npm run hotfix:deploy

# 4. Commit and push
git add .
git commit -m "fix: critical bug"
git push origin hotfix/critical-fix

# 5. Merge to main
```

---

## 📞 Support

If deployment issues persist:

1. Check logs in GitHub Actions
2. Review Render deployment logs
3. Check Firebase Console
4. Run `npm run verify:all`
5. Review this guide's troubleshooting section

---

## 🎉 Success!

Your automated deployment system is now set up!

Every push to `main` will:
- ✅ Run tests
- 🔧 Deploy backend to Render
- 🌐 Deploy frontend to Firebase
- ✅ Verify deployment

**No manual deployment needed!** 🚀
