# Frontend Deployment Script - Fix Payment Simulation Issue
# This script rebuilds and redeploys the frontend to Firebase

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚨 URGENT: Frontend Deployment Required               ║" -ForegroundColor Cyan
Write-Host "║  Fix: Payment still simulated in production             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📋 Issue Detected:" -ForegroundColor Yellow
Write-Host "   Production frontend is using OLD CODE that simulates payments" -ForegroundColor White
Write-Host "   Console shows: '💳 [CARD PAYMENT] Starting card payment simulation...'" -ForegroundColor Red
Write-Host "   Should show: '💳 [CARD PAYMENT - REAL] Processing REAL card payment...'" -ForegroundColor Green
Write-Host ""

$continue = Read-Host "Continue with deployment? (y/n)"
if ($continue -ne "y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit
}

# Step 1: Clean previous build
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "1️⃣  Cleaning previous build..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if (Test-Path dist) {
    Remove-Item -Path dist -Recurse -Force
    Write-Host "✅ Previous build cleaned" -ForegroundColor Green
} else {
    Write-Host "✅ No previous build to clean" -ForegroundColor Green
}

# Step 2: Build for production
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "2️⃣  Building for production..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed! Check errors above." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path dist\index.html)) {
    Write-Host "`n❌ Build failed! dist/index.html not found." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Build successful!" -ForegroundColor Green
Write-Host "   📦 Build location: dist/" -ForegroundColor Gray

# Show build size
$distSize = (Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "   📊 Build size: $([math]::Round($distSize, 2)) MB" -ForegroundColor Gray

# Step 3: Verify PayMongo code in build
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "3️⃣  Verifying real PayMongo integration in build..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$jsFiles = Get-ChildItem -Path dist\assets -Filter "*.js"
$hasRealIntegration = $false

foreach ($file in $jsFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "CARD PAYMENT - REAL") {
        $hasRealIntegration = $true
        Write-Host "✅ Real PayMongo integration found in: $($file.Name)" -ForegroundColor Green
        break
    }
}

if (-not $hasRealIntegration) {
    Write-Host "⚠️  WARNING: Could not verify real PayMongo integration in build" -ForegroundColor Yellow
    Write-Host "   This might be normal if code is minified" -ForegroundColor Gray
    $continueAnyway = Read-Host "   Continue deployment anyway? (y/n)"
    if ($continueAnyway -ne "y") {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit
    }
} else {
    Write-Host "✅ Verified: Real PayMongo integration is in the build" -ForegroundColor Green
}

# Step 4: Check Firebase login
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "4️⃣  Checking Firebase authentication..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

firebase projects:list 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Firebase" -ForegroundColor Red
    Write-Host "   Run: firebase login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Firebase authentication OK" -ForegroundColor Green

# Step 5: Deploy to Firebase
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "5️⃣  Deploying to Firebase Hosting..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    Write-Host "   Check errors above for details" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Deployment complete!" -ForegroundColor Green

# Step 6: Wait for propagation
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "6️⃣  Waiting for deployment to propagate..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "   ⏳ Waiting 10 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 10
Write-Host "   ✅ Deployment should be live now" -ForegroundColor Green

# Success summary
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Deployment Successful!                              ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📋 CRITICAL NEXT STEPS:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

Write-Host "`n1️⃣  CLEAR YOUR BROWSER CACHE (REQUIRED!):" -ForegroundColor Cyan
Write-Host "   • Press: Ctrl + Shift + Delete (Windows)" -ForegroundColor White
Write-Host "   • Or use: Incognito/Private browsing window" -ForegroundColor White
Write-Host "   • Or press: Ctrl + Shift + R (hard refresh)" -ForegroundColor White

Write-Host "`n2️⃣  OPEN PRODUCTION SITE:" -ForegroundColor Cyan
Write-Host "   https://weddingbazaar-web.web.app" -ForegroundColor White

Write-Host "`n3️⃣  VERIFY CONSOLE LOGS (F12):" -ForegroundColor Cyan
Write-Host "   ✅ Should see: '💳 [CARD PAYMENT - REAL]'" -ForegroundColor Green
Write-Host "   ✅ Should see: '💳 [STEP 1] Creating PayMongo...'" -ForegroundColor Green
Write-Host "   ❌ Should NOT see: 'simulation'" -ForegroundColor Red

Write-Host "`n4️⃣  TEST WITH TEST CARD:" -ForegroundColor Cyan
Write-Host "   Card: 4343 4343 4343 4343" -ForegroundColor White
Write-Host "   Expiry: 12/34" -ForegroundColor White
Write-Host "   CVC: 123" -ForegroundColor White

Write-Host "`n5️⃣  TEST WITH INVALID CARD (Should FAIL!):" -ForegroundColor Cyan
Write-Host "   Card: 4111 1111 1111 1111" -ForegroundColor White
Write-Host "   Expected: Payment should be rejected ❌" -ForegroundColor Yellow

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n✅ Success Indicators:" -ForegroundColor Green
Write-Host "   • Payment takes 3-5 seconds (not instant)" -ForegroundColor White
Write-Host "   • Console shows PayMongo API calls" -ForegroundColor White
Write-Host "   • Receipt generated with WB-2025-XXXX format" -ForegroundColor White
Write-Host "   • Invalid cards are rejected" -ForegroundColor White
Write-Host "   • Payment appears in PayMongo dashboard" -ForegroundColor White

Write-Host "`n🔗 Quick Links:" -ForegroundColor Cyan
Write-Host "   Production: https://weddingbazaar-web.web.app" -ForegroundColor White
Write-Host "   PayMongo Dashboard: https://dashboard.paymongo.com" -ForegroundColor White
Write-Host "   Firebase Console: https://console.firebase.google.com" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "   See: URGENT_FRONTEND_DEPLOYMENT_REQUIRED.md" -ForegroundColor White

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Open browser reminder
$openBrowser = Read-Host "Open production site in default browser? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process "https://weddingbazaar-web.web.app"
    Write-Host "`n🌐 Browser opened. Don't forget to clear cache!" -ForegroundColor Yellow
}

Write-Host "`n✨ Deployment complete! Happy testing! 🚀`n" -ForegroundColor Green
