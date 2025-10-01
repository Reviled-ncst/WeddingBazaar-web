Write-Host "Checking Services API Status..." -ForegroundColor Blue

# Wait for deployment
Write-Host "Waiting for Render deployment (60 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Test services API
try {
    Write-Host "Testing /api/services endpoint..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri 'https://weddingbazaar-web.onrender.com/api/services' -Method Get -TimeoutSec 30
    
    if ($response.success -and $response.services) {
        Write-Host "SUCCESS: Services API working!" -ForegroundColor Green
        Write-Host "Services returned: $($response.services.Length)" -ForegroundColor Yellow
        Write-Host "Total field: $($response.total)" -ForegroundColor Yellow
        Write-Host "First service: $($response.services[0].name) - $($response.services[0].category)" -ForegroundColor Gray
    } else {
        Write-Host "API responded but data format unexpected" -ForegroundColor Orange
        Write-Host "Response keys: $($response.PSObject.Properties.Name -join ', ')" -ForegroundColor Gray
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try health check
    try {
        Write-Host "Checking backend health..." -ForegroundColor Cyan
        $health = Invoke-RestMethod -Uri 'https://weddingbazaar-web.onrender.com/api/health' -Method Get -TimeoutSec 10
        Write-Host "Backend health: $($health.status)" -ForegroundColor Green
    } catch {
        Write-Host "Backend health check also failed" -ForegroundColor Red
    }
}
