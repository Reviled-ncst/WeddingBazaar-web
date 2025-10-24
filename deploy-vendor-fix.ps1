# Quick Deploy Script - Firebase Vendor Login Fix
# This script builds and deploys the fixed frontend

Write-Host "`n" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  WEDDING BAZAAR - FIREBASE FIX DEPLOYMENT" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean old build
Write-Host "🧹 Step 1: Cleaning old build..." -ForegroundColor Yellow
if (Test-Path dist) {
    Remove-Item -Recurse -Force dist
    Write-Host "✅ Cleaned dist folder" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No dist folder to clean" -ForegroundColor Gray
}

# Step 2: Build with fixed Firebase config
Write-Host "`n🔨 Step 2: Building with fixed Firebase configuration..." -ForegroundColor Yellow
npm run build 2>&1 | Out-Null
if (($LASTEXITCODE -eq 0) -and (Test-Path ".\dist\index.html")) {
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Deploy to Firebase
Write-Host "`n🚀 Step 3: Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting 2>&1 | Tee-Object -Variable output | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "`n📱 Production URL: https://weddingbazaar-web.web.app" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host $output
    exit 1
}

# Summary
Write-Host "`n" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Firebase API key fix deployed" -ForegroundColor Green
Write-Host "✅ Vendor login should now work correctly" -ForegroundColor Green
Write-Host "✅ No more infinite login loops" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test vendor login in production" -ForegroundColor White
Write-Host "  2. Verify no 'api-key-not-valid' errors in console" -ForegroundColor White
Write-Host "  3. Confirm verification flags display correctly" -ForegroundColor White
Write-Host ""
