# Test Deployment Script
# Run this after Render deployment completes

Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🧪 Testing Render Deployment                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$baseUrl = "https://weddingbazaar-web.onrender.com"

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod "$baseUrl/api/health"
    Write-Host "✅ Backend is online" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   PayMongo: $($health.paymongo_configured)" -ForegroundColor Gray
    Write-Host "   Database: $($health.database)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 2: Ping Check
Write-Host "Test 2: Ping Check" -ForegroundColor Yellow
try {
    $ping = Invoke-RestMethod "$baseUrl/api/ping"
    Write-Host "✅ API is responding" -ForegroundColor Green
    Write-Host "   Message: $($ping.message)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Ping failed: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 3: Receipt Endpoint (with sample ID)
Write-Host "Test 3: Receipt Endpoint Structure" -ForegroundColor Yellow
try {
    # Try with a test booking ID (will return 404 if no receipts, but that's OK)
    $response = Invoke-WebRequest "$baseUrl/api/payment/receipts/test-123" -ErrorAction Stop
    Write-Host "✅ Receipt endpoint is available" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "✅ Receipt endpoint is working (404 is expected for test ID)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Unexpected response: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ✅ Deployment Test Complete                        ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Make a test payment in the frontend" -ForegroundColor White
Write-Host "2. Click 'View Receipt' button on the booking" -ForegroundColor White
Write-Host "3. Verify the receipt displays correctly`n" -ForegroundColor White

Write-Host "Frontend URL: https://weddingbazaar-web.web.app" -ForegroundColor Cyan
Write-Host "Backend URL: $baseUrl`n" -ForegroundColor Cyan
