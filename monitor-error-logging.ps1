# Monitor Render Deployment and Test Service Creation
# This script checks when deployment completes and provides detailed error info

Write-Host "🔍 MONITORING RENDER DEPLOYMENT - Enhanced Error Logging" -ForegroundColor Cyan
Write-Host "=" * 80

$apiUrl = "https://weddingbazaar-web.onrender.com"
$healthUrl = "$apiUrl/api/health"
$expectedVersion = "2.7.5-ENHANCED-ERROR-LOGGING"

Write-Host "`n📊 Checking current backend status..." -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri $healthUrl -Method Get
    $currentVersion = $health.version
    
    Write-Host "✅ Backend is responsive" -ForegroundColor Green
    Write-Host "   Current version: $currentVersion" -ForegroundColor White
    Write-Host "   Expected version: $expectedVersion" -ForegroundColor White
    
    if ($currentVersion -eq $expectedVersion) {
        Write-Host "`n🎉 NEW VERSION DEPLOYED!" -ForegroundColor Green
        Write-Host "   Enhanced error logging is now active" -ForegroundColor Green
    } else {
        Write-Host "`n⏳ Old version still running, deployment in progress..." -ForegroundColor Yellow
        Write-Host "   This typically takes 2-3 minutes" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Backend not responding" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host "`n" + ("=" * 80)
Write-Host "📝 NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Wait for deployment to complete (check Render dashboard)" -ForegroundColor White
Write-Host "   URL: https://dashboard.render.com" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Try creating service again with itemized packages" -ForegroundColor White
Write-Host "   URL: https://weddingbazaarph.web.app/vendor/services" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Check browser console for detailed error response" -ForegroundColor White
Write-Host "   Look for: error code, constraint name, detail message" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Check Render logs for backend error details" -ForegroundColor White
Write-Host "   Look for: ❌ [POST /api/services] Error code/constraint/detail" -ForegroundColor Gray
Write-Host ""
Write-Host "=" * 80
Write-Host ""
Write-Host "Run this script again in 2-3 minutes to check deployment status" -ForegroundColor Cyan
Write-Host ""
