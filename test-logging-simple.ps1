# Test Vendor Services and Comprehensive Logging
# Run this after Render deployment completes

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Testing Fixes - Comprehensive Logging" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://weddingbazaar-web.onrender.com"
$vendorId = "2-2025-003"

# Test 1: Backend Health
Write-Host "Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Write-Host "✅ Backend is healthy" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend health check failed" -ForegroundColor Red
}
Write-Host ""

# Test 2: Vendor Services (Fixed 500 Error)
Write-Host "Test 2: GET /api/services/vendor/$vendorId (Previously 500)" -ForegroundColor Yellow
try {
    $services = Invoke-RestMethod -Uri "$baseUrl/api/services/vendor/$vendorId" -Method Get
    Write-Host "✅ Vendor services retrieved successfully" -ForegroundColor Green
    Write-Host "   Success: $($services.success)" -ForegroundColor Gray
    Write-Host "   Count: $($services.count) services" -ForegroundColor Gray
    
    if ($services.count -gt 0) {
        Write-Host ""
        Write-Host "First Service Details:" -ForegroundColor Cyan
        $first = $services.services[0]
        Write-Host "   ID: $($first.id)" -ForegroundColor Gray
        Write-Host "   Title: $($first.title)" -ForegroundColor Gray
        Write-Host "   Category: $($first.category)" -ForegroundColor Gray
        
        if ($first.packages) {
            Write-Host "   Packages: $($first.packages.Count)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Failed to get vendor services" -ForegroundColor Red
}
Write-Host ""

# Test 3: Instructions
Write-Host "Test 3: Render Logs Instructions" -ForegroundColor Yellow
Write-Host "To verify comprehensive logging:" -ForegroundColor White
Write-Host "1. Go to: https://dashboard.render.com" -ForegroundColor Gray
Write-Host "2. Click on weddingbazaar-web service" -ForegroundColor Gray
Write-Host "3. Click Logs tab" -ForegroundColor Gray
Write-Host "4. Look for recent POST /api/services requests" -ForegroundColor Gray
Write-Host ""

Write-Host "Expected Log Patterns:" -ForegroundColor White
Write-Host "   DATABASE INSERT Complete data sent to services table" -ForegroundColor Gray
Write-Host "   FULL PACKAGES DATA" -ForegroundColor Gray
Write-Host "   PACKAGE INSERT Sending package to database" -ForegroundColor Gray
Write-Host "   ITEM INSERT Sending item to database" -ForegroundColor Gray
Write-Host ""

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: https://weddingbazaarph.web.app/vendor/services" -ForegroundColor Cyan
Write-Host "Backend: $baseUrl" -ForegroundColor Cyan
Write-Host ""
