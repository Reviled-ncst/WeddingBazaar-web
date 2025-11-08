# ✅ POST-DEPLOYMENT VERIFICATION SCRIPT
# Run this after Render deployment completes

Write-Host "`n🔍 CHECKING BACKEND DEPLOYMENT..." -ForegroundColor Cyan

# Step 1: Check health endpoint
Write-Host "`n1️⃣ Checking backend health..." -ForegroundColor Yellow
$health = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -UseBasicParsing | ConvertFrom-Json
Write-Host "   Version: $($health.version)" -ForegroundColor White
Write-Host "   Status: $($health.status)" -ForegroundColor White
Write-Host "   Database: $($health.database)" -ForegroundColor White

# Check if version changed
if ($health.version -ne "2.7.3-SERVICES-REVERTED") {
    Write-Host "   ✅ NEW VERSION DEPLOYED!" -ForegroundColor Green
} else {
    Write-Host "   ❌ STILL OLD VERSION - Deployment may not be complete" -ForegroundColor Red
    exit 1
}

# Step 2: Check if vendor_documents logging is present
Write-Host "`n2️⃣ Checking for new logging..." -ForegroundColor Yellow
Write-Host "   Go to Render logs and look for:" -ForegroundColor White
Write-Host "   • '✅ vendor_documents table ready'" -ForegroundColor Cyan
Write-Host "   • '📄 Sample document:'" -ForegroundColor Cyan
Write-Host "   • '🔍 Query: SELECT * FROM vendor_documents'" -ForegroundColor Cyan

# Step 3: Test service creation
Write-Host "`n3️⃣ Test service creation now:" -ForegroundColor Yellow
Write-Host "   1. Go to: https://weddingbazaarph.web.app/vendor/services" -ForegroundColor White
Write-Host "   2. Click 'Add Service'" -ForegroundColor White
Write-Host "   3. Fill form and submit" -ForegroundColor White
Write-Host "   4. Upload document" -ForegroundColor White
Write-Host "   5. Check browser console for errors" -ForegroundColor White

Write-Host "`n✅ VERIFICATION COMPLETE - Ready to test!" -ForegroundColor Green
