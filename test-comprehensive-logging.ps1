# Test Vendor Services and Comprehensive Logging
# Run this after Render deployment completes

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🧪 TESTING FIXES - Comprehensive Logging" -ForegroundColor Cyan
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
    Write-Host "❌ Backend health check failed: $_" -ForegroundColor Red
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
        Write-Host "📦 First Service Details:" -ForegroundColor Cyan
        $first = $services.services[0]
        Write-Host "   ID: $($first.id)" -ForegroundColor Gray
        Write-Host "   Title: $($first.title)" -ForegroundColor Gray
        Write-Host "   Category: $($first.category)" -ForegroundColor Gray
        Write-Host "   Packages: $($first.packages.Count) packages" -ForegroundColor Gray
        
        if ($first.packages.Count -gt 0) {
            Write-Host ""
            Write-Host "   📦 Packages:" -ForegroundColor Cyan
            foreach ($pkg in $first.packages) {
                Write-Host "      - $($pkg.package_name): ₱$($pkg.base_price)" -ForegroundColor Gray
                $itemCount = if ($first.package_items -and $first.package_items[$pkg.id]) { $first.package_items[$pkg.id].Count } else { 0 }
                Write-Host "        Items: $itemCount" -ForegroundColor Gray
            }
        }
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "❌ Failed to get vendor services: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Check Render Logs
Write-Host "Test 3: Render Logs Instructions" -ForegroundColor Yellow
Write-Host "To verify comprehensive logging:" -ForegroundColor White
Write-Host "1. Go to: https://dashboard.render.com" -ForegroundColor Gray
Write-Host "2. Click on 'weddingbazaar-web' service" -ForegroundColor Gray
Write-Host "3. Click 'Logs' tab" -ForegroundColor Gray
Write-Host "4. Look for recent POST /api/services requests" -ForegroundColor Gray
Write-Host ""
Write-Host "Expected Log Patterns:" -ForegroundColor White
Write-Host "   ✅ '📊 [DATABASE INSERT] Complete data sent to services table'" -ForegroundColor Gray
Write-Host "   ✅ '📦 [FULL PACKAGES DATA]: [...]'" -ForegroundColor Gray
Write-Host "   ✅ '📦 [PACKAGE INSERT] Sending package to database'" -ForegroundColor Gray
Write-Host "   ✅ '📦 [ITEM INSERT #N] Sending item to database'" -ForegroundColor Gray
Write-Host "   ✅ '✅ Package created successfully'" -ForegroundColor Gray
Write-Host "   ✅ '✅ Item #N inserted'" -ForegroundColor Gray
Write-Host ""

# Test 4: Database Query (Optional)
Write-Host "Test 4: Direct Database Verification (Optional)" -ForegroundColor Yellow
Write-Host "To verify data in database:" -ForegroundColor White
Write-Host "1. Go to: https://console.neon.tech" -ForegroundColor Gray
Write-Host "2. Open SQL Editor" -ForegroundColor Gray
Write-Host "3. Run these queries:" -ForegroundColor Gray
Write-Host ""
Write-Host "-- Check services for vendor" -ForegroundColor Cyan
Write-Host "SELECT id, title, category, price FROM services" -ForegroundColor Cyan
Write-Host "WHERE vendor_id = '$vendorId'" -ForegroundColor Cyan
Write-Host "ORDER BY created_at DESC LIMIT 5;" -ForegroundColor Cyan
Write-Host ""
Write-Host "-- Check packages for latest service" -ForegroundColor Cyan
Write-Host "SELECT sp.id, sp.package_name, sp.base_price," -ForegroundColor Cyan
Write-Host "       (SELECT COUNT(*) FROM package_items pi WHERE pi.package_id = sp.id) as item_count" -ForegroundColor Cyan
Write-Host "FROM service_packages sp" -ForegroundColor Cyan
Write-Host "WHERE sp.service_id IN (" -ForegroundColor Cyan
Write-Host "  SELECT id FROM services WHERE vendor_id = '$vendorId'" -ForegroundColor Cyan
Write-Host "  ORDER BY created_at DESC LIMIT 1" -ForegroundColor Cyan
Write-Host ");" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. ✅ If Test 2 passed: 500 error is FIXED" -ForegroundColor White
Write-Host "2. 🔍 Check Render logs for comprehensive logging" -ForegroundColor White
Write-Host "3. 🧪 Create a new test service in the frontend" -ForegroundColor White
Write-Host "4. 📊 Verify all packages and items are saved" -ForegroundColor White
Write-Host ""
Write-Host "Frontend URL: https://weddingbazaarph.web.app/vendor/services" -ForegroundColor Cyan
Write-Host "Backend URL: $baseUrl" -ForegroundColor Cyan
Write-Host ""
