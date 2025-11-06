#!/usr/bin/env pwsh
# Simple vendor details test

Write-Host "Testing vendor details endpoint..." -ForegroundColor Cyan

$vendorId = "2-2025-003"
$url = "https://weddingbazaar-web.onrender.com/api/vendors/$vendorId/details"

Write-Host "`nURL: $url`n" -ForegroundColor Gray

try {
    $result = Invoke-RestMethod -Uri $url -Method Get
    
    if ($result.success) {
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "`nVendor Details:" -ForegroundColor Cyan
        Write-Host "  Name: $($result.vendor.name)" -ForegroundColor White
        Write-Host "  Category: $($result.vendor.category)" -ForegroundColor White
        Write-Host "  Rating: $($result.vendor.rating)" -ForegroundColor White
        Write-Host "  Location: $($result.vendor.location)" -ForegroundColor White
        Write-Host "  Services Count: $($result.services.Count)" -ForegroundColor White
        Write-Host "  Reviews Count: $($result.reviews.Count)" -ForegroundColor White
        Write-Host "  Price Range: $($result.vendor.pricing.priceRange)" -ForegroundColor White
    } else {
        Write-Host "FAILED: $($result.error)" -ForegroundColor Red
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERROR: Status $statusCode" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($statusCode -eq 500) {
        Write-Host "`nBackend may still be deploying. Wait 1-2 minutes and try again." -ForegroundColor Yellow
        Write-Host "`nCheck Render logs:" -ForegroundColor Cyan
        Write-Host "https://dashboard.render.com/web/srv-ctap0npu0jms73dekhd0/logs" -ForegroundColor White
    }
}
