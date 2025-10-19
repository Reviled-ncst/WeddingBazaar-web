# Quick Deploy Script for Hosting-Driven Development
# This script builds and deploys to Firebase Hosting in one command

Write-Host "🚀 WeddingBazaar - Quick Deploy to Production" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build
Write-Host "📦 Step 1: Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy
Write-Host "🌐 Step 2: Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "🌐 Production URL: https://weddingbazaarph.web.app" -ForegroundColor Cyan
Write-Host "📊 Firebase Console: https://console.firebase.google.com/project/weddingbazaarph/overview" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: Test your changes in production now!" -ForegroundColor Yellow
