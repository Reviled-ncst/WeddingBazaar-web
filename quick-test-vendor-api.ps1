# Quick Vendor Details API Test (No Wait)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Quick Vendor Details API Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing API endpoint: /api/vendors/{id}/details" -ForegroundColor White
Write-Host ""

# Test vendor VEN-00002
$testVendorId = "VEN-00002"

Write-Host "Testing vendor ID: $testVendorId" -ForegroundColor Cyan
Write-Host ""

try {
    Write-Host "Making API call..." -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/vendors/$testVendorId/details" -UseBasicParsing -TimeoutSec 30
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success) {
        Write-Host "✅ SUCCESS! API returned data" -ForegroundColor Green
        Write-Host ""
        Write-Host "Vendor Information:" -ForegroundColor White
        Write-Host "==================" -ForegroundColor White
        Write-Host ("Name: " + $data.vendor.name) -ForegroundColor Gray
        Write-Host ("Category: " + $data.vendor.category) -ForegroundColor Gray
        Write-Host ("Location: " + $data.vendor.location) -ForegroundColor Gray
        Write-Host ("Rating: " + $data.vendor.rating + " ⭐ (" + $data.vendor.reviewCount + " reviews)") -ForegroundColor Gray
        Write-Host ("Verified: " + $data.vendor.verified) -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Contact Information:" -ForegroundColor White
        Write-Host "====================" -ForegroundColor White
        Write-Host ("Email: " + $data.vendor.contact.email) -ForegroundColor Gray
        Write-Host ("Phone: " + $data.vendor.contact.phone) -ForegroundColor Gray
        Write-Host ("Website: " + $data.vendor.contact.website) -ForegroundColor Gray
        Write-Host ("Instagram: " + $data.vendor.contact.instagram) -ForegroundColor Gray
        Write-Host ("Facebook: " + $data.vendor.contact.facebook) -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Pricing:" -ForegroundColor White
        Write-Host "========" -ForegroundColor White
        Write-Host ("Price Range: " + $data.vendor.pricing.priceRange) -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Services:" -ForegroundColor White
        Write-Host "=========" -ForegroundColor White
        Write-Host ("Total Services: " + $data.services.Length) -ForegroundColor Gray
        if ($data.services.Length -gt 0) {
            foreach ($service in $data.services) {
                Write-Host ("  - " + $service.title + " (" + $service.priceDisplay + ")") -ForegroundColor Gray
            }
        }
        Write-Host ""
        
        Write-Host "Reviews:" -ForegroundColor White
        Write-Host "========" -ForegroundColor White
        Write-Host ("Total Reviews: " + $data.reviews.Length) -ForegroundColor Gray
        Write-Host ("Average Rating: " + $data.vendor.stats.averageRating) -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "Statistics:" -ForegroundColor White
        Write-Host "===========" -ForegroundColor White
        Write-Host ("Total Bookings: " + $data.vendor.stats.totalBookings) -ForegroundColor Gray
        Write-Host ("Completed Bookings: " + $data.vendor.stats.completedBookings) -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✅ VENDOR DETAILS API IS WORKING!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "The modal should now load correctly in production!" -ForegroundColor Green
        Write-Host "Test it at: https://weddingbazaarph.web.app" -ForegroundColor Cyan
        Write-Host ""
        
    } else {
        Write-Host "❌ API returned success=false" -ForegroundColor Red
        Write-Host ("Error: " + $data.error) -ForegroundColor Red
    }
    
} catch {
    $errorMessage = $_.Exception.Message
    $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "N/A" }
    
    Write-Host "❌ API call failed!" -ForegroundColor Red
    Write-Host ("HTTP Status: " + $statusCode) -ForegroundColor Red
    Write-Host ("Error: " + $errorMessage) -ForegroundColor Red
    Write-Host ""
    
    if ($statusCode -eq 500) {
        Write-Host "⚠️ 500 Error - Backend may still be deploying or there's a server error" -ForegroundColor Yellow
        Write-Host "   Wait 1-2 minutes and try again" -ForegroundColor Yellow
    } elseif ($statusCode -eq 404) {
        Write-Host "⚠️ 404 Error - Vendor ID not found in database" -ForegroundColor Yellow
        Write-Host "   Try a different vendor ID" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host ("Test run at: " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) -ForegroundColor Gray
Write-Host ""
