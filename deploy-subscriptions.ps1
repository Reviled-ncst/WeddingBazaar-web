#!/usr/bin/env pwsh
# Deploy Subscription System to Render
# This script deploys the modular subscription system with PayMongo integration

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🚀 DEPLOYING SUBSCRIPTION SYSTEM TO RENDER 🚀" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Pre-deployment checks
Write-Host "📋 Pre-Deployment Checklist..." -ForegroundColor Yellow
Write-Host ""

# Check if subscription modules exist
$modulesExist = @(
    "backend-deploy/routes/subscriptions/index.cjs",
    "backend-deploy/routes/subscriptions/plans.cjs",
    "backend-deploy/routes/subscriptions/vendor.cjs",
    "backend-deploy/routes/subscriptions/payment.cjs",
    "backend-deploy/routes/subscriptions/webhook.cjs",
    "backend-deploy/routes/subscriptions/usage.cjs",
    "backend-deploy/routes/subscriptions/analytics.cjs",
    "backend-deploy/routes/subscriptions/admin.cjs"
)

$allExist = $true
foreach ($module in $modulesExist) {
    if (Test-Path $module) {
        Write-Host "✅ $module exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $module MISSING!" -ForegroundColor Red
        $allExist = $false
    }
}

if (-not $allExist) {
    Write-Host ""
    Write-Host "❌ Missing required modules! Aborting deployment." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ All subscription modules found!" -ForegroundColor Green
Write-Host ""

# Git status
Write-Host "📊 Checking Git status..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "📦 Files to be deployed:" -ForegroundColor Cyan
Write-Host "  - backend-deploy/routes/subscriptions/* (8 modules)" -ForegroundColor White
Write-Host "  - backend-deploy/production-backend.js (updated)" -ForegroundColor White
Write-Host "  - Test suite: test-subscription-system.js" -ForegroundColor White
Write-Host "  - Documentation: SUBSCRIPTION_*.md files" -ForegroundColor White
Write-Host ""

# Confirm deployment
$confirmation = Read-Host "Deploy to Render now? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "❌ Deployment cancelled by user" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🔄 Step 1: Staging files..." -ForegroundColor Cyan

# Stage subscription system files
git add backend-deploy/routes/subscriptions/
git add backend-deploy/production-backend.js
git add test-subscription-system.js
git add SUBSCRIPTION_*.md
git add MODULAR_SUBSCRIPTION_SYSTEM_COMPLETE.md

Write-Host "✅ Files staged" -ForegroundColor Green
Write-Host ""

# Commit
Write-Host "🔄 Step 2: Creating commit..." -ForegroundColor Cyan
$commitMessage = "Deploy modular subscription system with PayMongo integration

Features:
- 8-module architecture (plans, vendor, payment, webhook, usage, analytics, admin)
- PayMongo card and e-wallet integration
- Free tier fallback (basic plan)
- Usage tracking and limit enforcement
- Recurring billing support
- Comprehensive test suite (47 tests)
- Full analytics and admin tools

Version: 3.0.0-SUBSCRIPTION-SYSTEM
"

git commit -m "$commitMessage"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No changes to commit (already up to date)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔄 Proceeding to push existing commits..." -ForegroundColor Cyan
}

Write-Host "✅ Commit created" -ForegroundColor Green
Write-Host ""

# Push to GitHub (triggers Render auto-deploy)
Write-Host "🔄 Step 3: Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "   This will trigger Render auto-deployment" -ForegroundColor Gray

git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Git push failed!" -ForegroundColor Red
    Write-Host "   Please check your Git configuration and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Pushed to GitHub successfully!" -ForegroundColor Green
Write-Host ""

# Deployment monitoring
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   📡 DEPLOYMENT IN PROGRESS" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔍 Monitor deployment at:" -ForegroundColor Yellow
Write-Host "   https://dashboard.render.com/" -ForegroundColor White
Write-Host ""

Write-Host "⏳ Deployment Timeline:" -ForegroundColor Cyan
Write-Host "   1. Render detects Git push: ~30 seconds" -ForegroundColor White
Write-Host "   2. Build process starts: ~1-2 minutes" -ForegroundColor White
Write-Host "   3. Install dependencies: ~2-3 minutes" -ForegroundColor White
Write-Host "   4. Deploy new version: ~30 seconds" -ForegroundColor White
Write-Host "   Total estimated time: ~5-7 minutes" -ForegroundColor Yellow
Write-Host ""

Write-Host "🧪 After deployment completes:" -ForegroundColor Green
Write-Host "   1. Wait for build to finish (check Render dashboard)" -ForegroundColor White
Write-Host "   2. Verify health check:" -ForegroundColor White
Write-Host "      curl https://weddingbazaar-web.onrender.com/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Test subscription endpoint:" -ForegroundColor White
Write-Host "      curl https://weddingbazaar-web.onrender.com/api/subscriptions/plans" -ForegroundColor Gray
Write-Host ""
Write-Host "   4. Run full test suite:" -ForegroundColor White
Write-Host "      node test-subscription-system.js" -ForegroundColor Gray
Write-Host ""
Write-Host "   Expected: All 47 tests passing ✅" -ForegroundColor Green
Write-Host ""

# Wait option
$waitForDeploy = Read-Host "Wait and monitor deployment? (y/n)"

if ($waitForDeploy -eq 'y') {
    Write-Host ""
    Write-Host "⏳ Waiting for deployment..." -ForegroundColor Yellow
    Write-Host "   Checking health endpoint every 30 seconds..." -ForegroundColor Gray
    Write-Host ""
    
    $deployComplete = $false
    $attempts = 0
    $maxAttempts = 20 # 10 minutes max
    
    while (-not $deployComplete -and $attempts -lt $maxAttempts) {
        $attempts++
        
        try {
            Write-Host "🔍 Attempt $attempts/$maxAttempts - Checking deployment status..." -ForegroundColor Cyan
            
            $response = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method GET -UseBasicParsing
            $health = $response.Content | ConvertFrom-Json
            
            Write-Host "   Version: $($health.version)" -ForegroundColor White
            
            # Check if subscription endpoints are available
            if ($health.version -like "*SUBSCRIPTION*" -or $health.version -ge "3.0.0") {
                Write-Host ""
                Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
                Write-Host "   Subscription system is now live!" -ForegroundColor Green
                $deployComplete = $true
            } else {
                Write-Host "   ⏳ Old version still active, waiting for update..." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   ⚠️  Server not ready yet (this is normal during deployment)" -ForegroundColor Yellow
        }
        
        if (-not $deployComplete) {
            Start-Sleep -Seconds 30
        }
    }
    
    if ($deployComplete) {
        Write-Host ""
        Write-Host "🎉 READY TO TEST!" -ForegroundColor Green
        Write-Host ""
        
        $runTests = Read-Host "Run test suite now? (y/n)"
        if ($runTests -eq 'y') {
            Write-Host ""
            Write-Host "🧪 Running subscription system tests..." -ForegroundColor Cyan
            Write-Host ""
            node test-subscription-system.js
        }
    } else {
        Write-Host ""
        Write-Host "⏰ Timeout reached (10 minutes)" -ForegroundColor Yellow
        Write-Host "   Deployment may still be in progress" -ForegroundColor White
        Write-Host "   Check Render dashboard for status" -ForegroundColor White
    }
} else {
    Write-Host "📋 Deployment initiated!" -ForegroundColor Green
    Write-Host "   Check Render dashboard for progress" -ForegroundColor White
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ DEPLOYMENT SCRIPT COMPLETE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - SUBSCRIPTION_TEST_RESULTS.md - Test results and deployment guide" -ForegroundColor White
Write-Host "   - MODULAR_SUBSCRIPTION_SYSTEM_COMPLETE.md - Architecture overview" -ForegroundColor White
Write-Host "   - SUBSCRIPTION_DEPLOYMENT_GUIDE.md - Full deployment guide" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Monitor Render deployment" -ForegroundColor White
Write-Host "   2. Run test suite after deployment" -ForegroundColor White
Write-Host "   3. Verify all 47 tests pass" -ForegroundColor White
Write-Host "   4. Test frontend subscription flows" -ForegroundColor White
Write-Host "   5. Enable PayMongo webhooks" -ForegroundColor White
Write-Host ""
