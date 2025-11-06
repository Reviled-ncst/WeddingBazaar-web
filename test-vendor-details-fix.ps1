# Test Vendor Details API Fix
# This script tests if the vendor details API is working after the fix

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Vendor Details API Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wait for deployment (Render takes ~2-3 minutes)
Write-Host "⏰ Waiting 3 minutes for Render deployment..." -ForegroundColor Yellow
Write-Host "   (Deployment started at: $(Get-Date -Format 'HH:mm:ss'))" -ForegroundColor Gray
Start-Sleep -Seconds 180

Write-Host ""
Write-Host "🔍 Step 1: Check backend health..." -ForegroundColor Green
try {
    $healthResponse = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -UseBasicParsing
    $health = $healthResponse.Content | ConvertFrom-Json
    Write-Host "   ✅ Backend is healthy!" -ForegroundColor Green
    Write-Host "   Database: $($health.database)" -ForegroundColor Gray
    Write-Host "   Timestamp: $($health.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend health check failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Step 2: Get featured vendors..." -ForegroundColor Green
try {
    $vendorsResponse = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/vendors/featured" -UseBasicParsing
    $vendors = ($vendorsResponse.Content | ConvertFrom-Json).vendors
    Write-Host "   ✅ Found $($vendors.Length) featured vendors" -ForegroundColor Green
    
    if ($vendors.Length -eq 0) {
        Write-Host "   ⚠️ No vendors found, cannot test details API" -ForegroundColor Yellow
        exit 0
    }
    
    # Display vendor list
    Write-Host ""
    Write-Host "   Available vendors:" -ForegroundColor Gray
    foreach ($vendor in $vendors) {
        Write-Host "   - [$($vendor.id)] $($vendor.name) ($($vendor.category))" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Failed to fetch featured vendors!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Step 3: Test vendor details API..." -ForegroundColor Green

$testResults = @()

foreach ($vendor in $vendors) {
    Write-Host ""
    Write-Host "   Testing vendor: $($vendor.name) [$($vendor.id)]" -ForegroundColor Cyan
    
    try {
        $detailsResponse = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/vendors/$($vendor.id)/details" -UseBasicParsing
        $details = $detailsResponse.Content | ConvertFrom-Json
        
        if ($details.success) {
            Write-Host "   ✅ SUCCESS! API returned data" -ForegroundColor Green
            Write-Host "      - Name: $($details.vendor.name)" -ForegroundColor Gray
            Write-Host "      - Category: $($details.vendor.category)" -ForegroundColor Gray
            Write-Host "      - Location: $($details.vendor.location)" -ForegroundColor Gray
            Write-Host ("      - Rating: " + $details.vendor.rating + " (" + $details.vendor.reviewCount + " reviews)") -ForegroundColor Gray
            Write-Host ("      - Contact Email: " + $details.vendor.contact.email) -ForegroundColor Gray
            Write-Host ("      - Contact Phone: " + $details.vendor.contact.phone) -ForegroundColor Gray
            Write-Host ("      - Price Range: " + $details.vendor.pricing.priceRange) -ForegroundColor Gray
            Write-Host ("      - Services Count: " + $details.services.Length) -ForegroundColor Gray
            Write-Host ("      - Reviews Count: " + $details.reviews.Length) -ForegroundColor Gray
            
            $testResults += @{
                VendorId = $vendor.id
                VendorName = $vendor.name
                Status = "✅ PASS"
                Error = $null
            }
        } else {
            Write-Host "   ❌ FAILED! API returned success=false" -ForegroundColor Red
            Write-Host "      Error: $($details.error)" -ForegroundColor Red
            
            $testResults += @{
                VendorId = $vendor.id
                VendorName = $vendor.name
                Status = "❌ FAIL"
                Error = $details.error
            }
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   ❌ FAILED! HTTP $statusCode" -ForegroundColor Red
        Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
        
        $testResults += @{
            VendorId = $vendor.id
            VendorName = $vendor.name
            Status = "❌ FAIL"
            Error = "HTTP $statusCode - $($_.Exception.Message)"
        }
    }
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Results Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passCount = ($testResults | Where-Object { $_.Status -eq "✅ PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "❌ FAIL" }).Count

Write-Host "Total Tests: $($testResults.Count)" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Vendor details API is working correctly!" -ForegroundColor Green
    Write-Host "✅ Modal should now load vendor data in production!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Test the modal at: https://weddingbazaarph.web.app" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "⚠️ SOME TESTS FAILED!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Failed vendors:" -ForegroundColor Yellow
    foreach ($result in $testResults | Where-Object { $_.Status -eq "❌ FAIL" }) {
        Write-Host "   - $($result.VendorName) [$($result.VendorId)]" -ForegroundColor Red
        Write-Host "     Error: $($result.Error)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host ("Test completed at: " + (Get-Date -Format 'HH:mm:ss')) -ForegroundColor Gray
Write-Host ""
