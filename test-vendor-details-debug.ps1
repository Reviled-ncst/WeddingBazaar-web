# Vendor Details Endpoint Debugging Script - Simple Version
# Tests the /details endpoint and shows full error output

Write-Host "`n=== VENDOR DETAILS DEBUG SCRIPT v3.2 ===" -ForegroundColor Cyan

$backendUrl = "https://weddingbazaar-web.onrender.com"
$testVendorId = "2-2025-003"

# Test vendor details endpoint
Write-Host "`nTesting: $backendUrl/api/vendors/$testVendorId/details" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/vendors/$testVendorId/details" -Method GET -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success) {
        Write-Host "SUCCESS!" -ForegroundColor Green
        Write-Host "Vendor: $($data.vendor.name)" -ForegroundColor Green
        Write-Host "Category: $($data.vendor.category)" -ForegroundColor Green
        Write-Host "Services: $($data.services.Count)" -ForegroundColor Green
        Write-Host "Reviews: $($data.reviews.Count)" -ForegroundColor Green
        Write-Host "Pricing: $($data.vendor.pricing.priceRange)" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $($data.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "HTTP ERROR: $($_.Exception.Message)" -ForegroundColor Red
    
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $errorData = $responseBody | ConvertFrom-Json
        
        Write-Host "`nError Details:" -ForegroundColor Red
        Write-Host "  Message: $($errorData.error)" -ForegroundColor Red
        Write-Host "  Type: $($errorData.errorType)" -ForegroundColor Red
        Write-Host "  Vendor ID: $($errorData.vendorId)" -ForegroundColor Red
        
        Write-Host "`nFull Response:" -ForegroundColor Yellow
        Write-Host $responseBody -ForegroundColor DarkYellow
    } catch {
        Write-Host "Could not parse error response" -ForegroundColor Red
    }
}

Write-Host "`nCheck Render logs at:" -ForegroundColor Cyan
Write-Host "https://dashboard.render.com/web/srv-ctdj1d5umphs738k8880/logs" -ForegroundColor Blue
Write-Host "`n"
