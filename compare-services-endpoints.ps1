# Quick test to compare services endpoints
Write-Host "`n=== SERVICES QUERY COMPARISON ===" -ForegroundColor Cyan

$vendorId = "2-2025-003"
$backend = "https://weddingbazaar-web.onrender.com"

Write-Host "`n1. Testing /api/services?vendor_id=$vendorId" -ForegroundColor Yellow
try {
    $services1 = Invoke-RestMethod -Uri "$backend/api/services?vendor_id=$vendorId"
    Write-Host "   Result: $($services1.count) services found" -ForegroundColor $(if ($services1.count -gt 0) { "Green" } else { "Red" })
    if ($services1.count -gt 0) {
        Write-Host "   First service: $($services1.services[0].title)" -ForegroundColor White
        Write-Host "   Price range: $($services1.services[0].price_range)" -ForegroundColor White
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Testing /api/vendors/$vendorId/details" -ForegroundColor Yellow
try {
    $details = Invoke-RestMethod -Uri "$backend/api/vendors/$vendorId/details"
    Write-Host "   Result: $($details.services.Count) services found" -ForegroundColor $(if ($details.services.Count -gt 0) { "Green" } else { "Red" })
    if ($details.services.Count -gt 0) {
        Write-Host "   First service: $($details.services[0].title)" -ForegroundColor White
        Write-Host "   Price range: $($details.services[0].priceRange)" -ForegroundColor White
    }
    Write-Host "   Vendor name: $($details.vendor.name)" -ForegroundColor White
    Write-Host "   Pricing: $($details.vendor.pricing.priceRange)" -ForegroundColor White
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Testing /api/vendors/$vendorId/services (alt route)" -ForegroundColor Yellow
try {
    $services2 = Invoke-RestMethod -Uri "$backend/api/vendors/$vendorId/services"
    Write-Host "   Result: $($services2.count) services found" -ForegroundColor $(if ($services2.count -gt 0) { "Green" } else { "Red" })
    if ($services2.count -gt 0) {
        Write-Host "   First service: $($services2.services[0].title)" -ForegroundColor White
    }
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n"
