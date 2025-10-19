# Git Commit and Deploy Script
# Commits your changes and deploys to production in one command

param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

Write-Host "🚀 WeddingBazaar - Commit & Deploy Pipeline" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Git Status
Write-Host "📋 Step 1: Checking Git status..." -ForegroundColor Yellow
git status --short

Write-Host ""
$continue = Read-Host "Continue with commit? (y/n)"
if ($continue -ne "y") {
    Write-Host "❌ Cancelled by user" -ForegroundColor Red
    exit 0
}

# Step 2: Stage all changes
Write-Host ""
Write-Host "📝 Step 2: Staging changes..." -ForegroundColor Yellow
git add -A

# Step 3: Commit
Write-Host ""
Write-Host "💾 Step 3: Committing with message: '$CommitMessage'" -ForegroundColor Yellow
git commit -m "$CommitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git commit failed!" -ForegroundColor Red
    exit 1
}

# Step 4: Push to GitHub
Write-Host ""
Write-Host "☁️ Step 4: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green

# Step 5: Build
Write-Host ""
Write-Host "📦 Step 5: Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Step 6: Deploy
Write-Host ""
Write-Host "🌐 Step 6: Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ COMPLETE PIPELINE SUCCESS!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Code committed to GitHub" -ForegroundColor Green
Write-Host "✅ Frontend built successfully" -ForegroundColor Green
Write-Host "✅ Deployed to production" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Production URL: https://weddingbazaarph.web.app" -ForegroundColor Cyan
Write-Host "📊 Firebase Console: https://console.firebase.google.com/project/weddingbazaarph/overview" -ForegroundColor Cyan
Write-Host "💾 GitHub Repo: https://github.com/Reviled-ncst/WeddingBazaar-web" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tip: Test your changes in production now!" -ForegroundColor Yellow
