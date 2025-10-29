# Quick Diagnostic - Check if Render Deployed

Write-Host "Checking Render deployment status..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is responding
Write-Host "Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -UseBasicParsing
    $healthData = $health.Content | ConvertFrom-Json
    Write-Host "✅ Backend is responding" -ForegroundColor Green
    Write-Host "   Timestamp: $($healthData.timestamp)" -ForegroundColor Gray
    Write-Host "   Version: $($healthData.version)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is not responding" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Check if wallet endpoint exists (will fail but shows if route is registered)
Write-Host "Test 2: Wallet Endpoint Registration" -ForegroundColor Yellow
try {
    # This will likely fail with 401 (Unauthorized) if route exists, 404 if route doesn't exist
    $response = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/wallet/test-123" -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Wallet endpoint exists (unexpected success)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Wallet endpoint EXISTS (returned 401 Unauthorized - route is registered)" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "❌ Wallet endpoint NOT FOUND (returned 404 - route not registered)" -ForegroundColor Red
        Write-Host "   Render hasn't deployed the wallet routes yet!" -ForegroundColor Red
    } elseif ($statusCode -eq 500) {
        Write-Host "⚠️  Wallet endpoint EXISTS but has errors (returned 500)" -ForegroundColor Yellow
        Write-Host "   This means Render deployed the route but there's a bug" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  Unexpected status code: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "=================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If wallet endpoint returns 404:" -ForegroundColor Yellow
Write-Host "  → Render hasn't deployed yet. Wait 2 more minutes or manually deploy in Render dashboard." -ForegroundColor White
Write-Host ""
Write-Host "If wallet endpoint returns 401:" -ForegroundColor Yellow  
Write-Host "  → Route exists! The 500 error is from a database/SQL issue." -ForegroundColor White
Write-Host "  → Check Render logs for the actual SQL error message" -ForegroundColor White
Write-Host ""
Write-Host "If wallet endpoint returns 500:" -ForegroundColor Yellow
Write-Host "  → Route exists but has bugs. Check Render logs for error details." -ForegroundColor White
Write-Host ""
Write-Host "To check Render logs:" -ForegroundColor Cyan
Write-Host "  1. Go to: https://dashboard.render.com" -ForegroundColor White
Write-Host "  2. Click your service" -ForegroundColor White
Write-Host "  3. Click 'Logs' tab" -ForegroundColor White
Write-Host "  4. Look for wallet-related errors" -ForegroundColor White
Write-Host ""
