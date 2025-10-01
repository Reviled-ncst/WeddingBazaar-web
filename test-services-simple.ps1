Write-Host "Testing Wedding Bazaar Services API..." -ForegroundColor Blue

try {
    $response = Invoke-RestMethod -Uri 'https://weddingbazaar-web.onrender.com/api/services' -Method Get -TimeoutSec 30
    
    Write-Host "API Response Received" -ForegroundColor Green
    Write-Host "Success: $($response.success)" -ForegroundColor White
    Write-Host "Total Services: $($response.total)" -ForegroundColor Yellow
    Write-Host "Services Array Length: $($response.services.Length)" -ForegroundColor Yellow
    
    if ($response.services.Length -gt 0) {
        Write-Host "First service: $($response.services[0].name)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "API Error: $($_.Exception.Message)" -ForegroundColor Red
}
