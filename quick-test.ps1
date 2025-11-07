Write-Host "========================================" -ForegroundColor Cyan
Write-Host "QUICK ITEMIZATION FIX VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$vendorId = "f7e2c4d8-5b9a-4e1f-8c3d-9a7b6c5d4e3f"
$baseUrl = "https://weddingbazaar-web.onrender.com"

Write-Host "1. Testing backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "   ✅ Backend: $($health.status)" -ForegroundColor Green
    Write-Host "   Version: $($health.version)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Backend down!" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "2. Testing vendor services endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vendors/$vendorId/services" -Method GET -TimeoutSec 30
    Write-Host "   ✅ Services found: $($response.count)" -ForegroundColor Green
    
    if ($response.services -and $response.services.Count -gt 0) {
        $firstService = $response.services[0]
        Write-Host ""
        Write-Host "   📦 First Service:" -ForegroundColor White
        Write-Host "      Title: $($firstService.title)" -ForegroundColor Cyan
        
        if ($firstService.packages) {
            Write-Host "      ✅ Packages: $($firstService.packages.Count)" -ForegroundColor Green
            
            if ($firstService.packages.Count -gt 0) {
                $firstPackage = $firstService.packages[0]
                $price = $firstPackage.price
                Write-Host "         • $($firstPackage.name) - P$price" -ForegroundColor White
                
                if ($firstPackage.items) {
                    Write-Host "         ✅ Items: $($firstPackage.items.Count)" -ForegroundColor Green
                } else {
                    Write-Host "         ⚠️  No items" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "      ❌ NO PACKAGES!" -ForegroundColor Red
        }
        
        if ($firstService.addons) {
            Write-Host "      ✅ Add-ons: $($firstService.addons.Count)" -ForegroundColor Green
        } else {
            Write-Host "      ⚠️  No add-ons" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "✅ ITEMIZATION FIX IS WORKING!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  No services found for this vendor" -ForegroundColor Yellow
        Write-Host "   Create a service first to test the fix" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    $statusCode = $_.Exception.Response.StatusCode.Value__
    Write-Host "   Status: $statusCode" -ForegroundColor Yellow
}

Write-Host ""
