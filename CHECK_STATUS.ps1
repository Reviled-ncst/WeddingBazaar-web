# 🚀 COMPLETE FIX WORKFLOW
# Run this to see status and next steps

Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  WEDDING BAZAAR - SERVICE CREATION FIX WORKFLOW    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Step 1: Check backend status
Write-Host "`n📡 STEP 1: Checking Backend Status..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -UseBasicParsing | ConvertFrom-Json
    Write-Host "   Database: " -NoNewline -ForegroundColor White
    Write-Host $health.database -ForegroundColor $(if($health.database -eq 'Connected'){'Green'}else{'Red'})
    Write-Host "   Version: " -NoNewline -ForegroundColor White
    Write-Host $health.version -ForegroundColor $(if($health.version -eq '2.7.3-SERVICES-REVERTED'){'Red'}else{'Green'})
    
    if($health.version -eq '2.7.3-SERVICES-REVERTED') {
        Write-Host "`n   ❌ BACKEND NEEDS DEPLOYMENT!" -ForegroundColor Red
        Write-Host "   Current: OLD CODE (queries 'documents' table)" -ForegroundColor Red
        Write-Host "   Required: NEW CODE (queries 'vendor_documents' table)" -ForegroundColor Yellow
        $needsDeploy = $true
    } else {
        Write-Host "`n   ✅ Backend version looks good!" -ForegroundColor Green
        $needsDeploy = $false
    }
} catch {
    Write-Host "   ❌ Cannot reach backend!" -ForegroundColor Red
    $needsDeploy = $true
}

# Step 2: Database verification instructions
Write-Host "`n📊 STEP 2: Database Verification" -ForegroundColor Yellow
Write-Host "   Run VERIFY_DATABASE_READY.sql in Neon Console" -ForegroundColor White
Write-Host "`n   Instructions:" -ForegroundColor Cyan
Write-Host "   1. Open: https://console.neon.tech/" -ForegroundColor White
Write-Host "   2. Click: SQL Editor" -ForegroundColor White
Write-Host "   3. Copy: VERIFY_DATABASE_READY.sql contents" -ForegroundColor White
Write-Host "   4. Paste & Run in SQL Editor" -ForegroundColor White
Write-Host "   5. Check for: '✅ ALL CHECKS PASSED'" -ForegroundColor White

# Step 3: Deploy instructions
if($needsDeploy) {
    Write-Host "`n🚀 STEP 3: Deploy Backend (REQUIRED)" -ForegroundColor Yellow
    Write-Host "   ⚠️ This is CRITICAL - Service creation won't work until deployed!" -ForegroundColor Red
    Write-Host "`n   Deployment Steps:" -ForegroundColor Cyan
    Write-Host "   1. Open: https://dashboard.render.com/" -ForegroundColor White
    Write-Host "   2. Find: 'weddingbazaar-web' service" -ForegroundColor White
    Write-Host "   3. Click: 'Manual Deploy' button (top right)" -ForegroundColor White
    Write-Host "   4. Select: 'Deploy latest commit'" -ForegroundColor White
    Write-Host "   5. Wait: 2-3 minutes for build to complete" -ForegroundColor White
    Write-Host "`n   After deployment, run: .\VERIFY_DEPLOYMENT.ps1" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ STEP 3: Backend Already Deployed" -ForegroundColor Green
}

# Step 4: Test service creation
Write-Host "`n🧪 STEP 4: Test Service Creation" -ForegroundColor Yellow
Write-Host "   After database verification and deployment:" -ForegroundColor White
Write-Host "   1. Go to: https://weddingbazaarph.web.app/vendor/services" -ForegroundColor White
Write-Host "   2. Click: 'Add Service' button" -ForegroundColor White
Write-Host "   3. Fill form with test data" -ForegroundColor White
Write-Host "   4. Upload a document" -ForegroundColor White
Write-Host "   5. Submit and check for success!" -ForegroundColor White

# Summary
Write-Host "`n╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  SUMMARY                                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📋 CURRENT STATUS:" -ForegroundColor Yellow
Write-Host "   • Code Fix: " -NoNewline -ForegroundColor White
Write-Host "✅ Pushed to GitHub (commit 4a6999b)" -ForegroundColor Green
Write-Host "   • Backend Deploy: " -NoNewline -ForegroundColor White
if($needsDeploy) {
    Write-Host "❌ REQUIRED (see STEP 3 above)" -ForegroundColor Red
} else {
    Write-Host "✅ Completed" -ForegroundColor Green
}
Write-Host "   • Database Check: " -NoNewline -ForegroundColor White
Write-Host "⏳ Run VERIFY_DATABASE_READY.sql" -ForegroundColor Yellow
Write-Host "   • Testing: " -NoNewline -ForegroundColor White
Write-Host "⏳ Pending deployment" -ForegroundColor Yellow

Write-Host "`n🎯 NEXT ACTION:" -ForegroundColor Yellow
if($needsDeploy) {
    Write-Host "   DEPLOY BACKEND TO RENDER NOW!" -ForegroundColor Red
    Write-Host "   https://dashboard.render.com/" -ForegroundColor Cyan
} else {
    Write-Host "   Run database verification in Neon Console" -ForegroundColor Green
    Write-Host "   https://console.neon.tech/" -ForegroundColor Cyan
}

Write-Host "`n" -NoNewline
