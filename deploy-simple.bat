@echo off
REM Simple Git Deployment for Backend
REM Just git add, commit, and push

echo 🚀 Simple Backend Deployment
echo ============================

REM Check if in right directory
if not exist "backend-deploy\index.js" (
    echo ❌ Error: Run from project root directory
    pause
    exit /b 1
)

echo 📦 Adding files to git...
git add .

echo 📝 Committing changes...
git commit -m "feat: Deploy vendor off-days API endpoints - %date% %time%"

echo 🚀 Pushing to production...
git push origin main

if errorlevel 1 (
    echo ❌ Push failed
    pause
    exit /b 1
)

echo ✅ Deployment successful!
echo Wait 2-3 minutes for Render to deploy
pause
