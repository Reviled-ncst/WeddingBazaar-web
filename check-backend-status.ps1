Write-Host "Checking Wedding Bazaar Backend Status..." -ForegroundColor Blue

# Test health endpoint
try {
    $healthResponse = Invoke-RestMethod -Uri 'https://weddingbazaar-web.onrender.com/api/health' -Method Get -TimeoutSec 10
    Write-Host "Health Check: OK - $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "Health Check: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test services endpoint  
try {
    $servicesResponse = Invoke-RestMethod -Uri 'https://weddingbazaar-web.onrender.com/api/services' -Method Get -TimeoutSec 30
    Write-Host "Services API: OK - $($servicesResponse.total) services" -ForegroundColor Green
} catch {
    Write-Host "Services API: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

# Test vendors endpoint as fallback
try {
    $vendorsResponse = Invoke-RestMethod -Uri 'https://weddingbazaar-web.onrender.com/api/vendors/featured' -Method Get -TimeoutSec 20
    Write-Host "Vendors API: OK - Found vendors" -ForegroundColor Green
} catch {
    Write-Host "Vendors API: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}
