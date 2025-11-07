# 🔍 MONITOR VENDORS.CJS FIX DEPLOYMENT
# Real-time monitoring of Render deployment and endpoint testing

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VENDORS.CJS FIX DEPLOYMENT MONITOR  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://weddingbazaar-web.onrender.com"
$testVendorId = "2-2025-003"
$maxAttempts = 10
$delaySeconds = 30

Write-Host "📊 Deployment Details:" -ForegroundColor Yellow
Write-Host "   Backend URL: $baseUrl"
Write-Host "   Test Vendor: $testVendorId"
Write-Host "   Max Attempts: $maxAttempts"
Write-Host "   Check Interval: $delaySeconds seconds"
Write-Host ""

for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "🔄 ATTEMPT $attempt of $maxAttempts" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    # Step 1: Health Check
    Write-Host "1️⃣ Backend Health Check..." -ForegroundColor Yellow
    try {
        $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get -ErrorAction Stop
        Write-Host "   ✅ Status: $($healthResponse.status)" -ForegroundColor Green
        Write-Host "   📦 Version: $($healthResponse.version)" -ForegroundColor Green
        Write-Host "   🗄️  Database: $($healthResponse.database)" -ForegroundColor Green
        
        # Check if version includes the fix
        if ($healthResponse.version -match "VENDORS-FIX" -or $healthResponse.version -match "2.7.5") {
            Write-Host "   🎉 NEW VERSION DETECTED! Fix is deployed!" -ForegroundColor Magenta
        }
    } catch {
        Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "⏳ Waiting $delaySeconds seconds before retry..." -ForegroundColor Yellow
        Start-Sleep -Seconds $delaySeconds
        continue
    }
    
    Write-Host ""
    
    # Step 2: Test Vendor Services Endpoint
    Write-Host "2️⃣ Testing Vendor Services Endpoint..." -ForegroundColor Yellow
    try {
        $servicesResponse = Invoke-RestMethod -Uri "$baseUrl/api/vendors/$testVendorId/services" -Method Get -ErrorAction Stop
        
        Write-Host "   ✅ ENDPOINT WORKING!" -ForegroundColor Green
        Write-Host "   📊 Services Found: $($servicesResponse.services.Count)" -ForegroundColor Green
        Write-Host ""
        
        if ($servicesResponse.services.Count -gt 0) {
            Write-Host "3️⃣ Service Details:" -ForegroundColor Yellow
            foreach ($service in $servicesResponse.services) {
                Write-Host "   📦 Service: $($service.title)" -ForegroundColor Cyan
                Write-Host "      ID: $($service.id)"
                Write-Host "      Category: $($service.category)"
                Write-Host "      Packages: $($service.packages.Count)" -ForegroundColor Green
                
                if ($service.packages -and $service.packages.Count -gt 0) {
                    foreach ($pkg in $service.packages) {
                        $itemsCount = if ($pkg.items) { $pkg.items.Count } else { 0 }
                        Write-Host "         └─ $($pkg.package_name): ₱$($pkg.base_price) ($itemsCount items)" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "         ⚠️  No packages found" -ForegroundColor Yellow
                }
                Write-Host ""
            }
            
            # Success! Fix is working
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
            Write-Host "🎉 SUCCESS! VENDORS.CJS FIX IS LIVE!" -ForegroundColor Green
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
            Write-Host ""
            Write-Host "✅ Endpoint: GET /api/vendors/:vendorId/services" -ForegroundColor Green
            Write-Host "✅ Status: 200 OK" -ForegroundColor Green
            Write-Host "✅ Services: $($servicesResponse.services.Count)" -ForegroundColor Green
            Write-Host "✅ Packages: Retrieved successfully" -ForegroundColor Green
            Write-Host ""
            Write-Host "📝 Next Steps:" -ForegroundColor Yellow
            Write-Host "   1. Test service creation with multiple packages"
            Write-Host "   2. Verify all packages and items save correctly"
            Write-Host "   3. Test frontend display"
            Write-Host "   4. Update VENDORS_CJS_FIX_STATUS.md"
            Write-Host ""
            
            exit 0
            
        } else {
            Write-Host "   ⚠️  Endpoint works but returned 0 services" -ForegroundColor Yellow
            Write-Host "   This might be normal if vendor has no services yet" -ForegroundColor Yellow
        }
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   ❌ Endpoint failed: HTTP $statusCode" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($statusCode -eq 500) {
            Write-Host "   🔍 Still getting 500 error - deployment may not be complete" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    
    if ($attempt -lt $maxAttempts) {
        Write-Host "⏳ Waiting $delaySeconds seconds before next check..." -ForegroundColor Yellow
        Write-Host ""
        Start-Sleep -Seconds $delaySeconds
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "⚠️  MAX ATTEMPTS REACHED" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host ""
Write-Host "Deployment may still be in progress." -ForegroundColor Yellow
Write-Host "Check Render dashboard: https://dashboard.render.com/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Manual test command:" -ForegroundColor Cyan
Write-Host 'Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/vendors/2-2025-003/services"' -ForegroundColor Cyan
