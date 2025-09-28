try {
    Write-Host "🔍 Testing Wedding Bazaar Services API..." -ForegroundColor Blue
    
    $response = Invoke-RestMethod -Uri 'https://weddingbazaar-web.onrender.com/api/services' -Method Get -TimeoutSec 30
    
    Write-Host "✅ API Response Received" -ForegroundColor Green
    Write-Host "📊 Success: $($response.success)" -ForegroundColor White
    Write-Host "📊 Total Services: $($response.total)" -ForegroundColor Yellow
    Write-Host "📊 Services Array Length: $($response.services.Length)" -ForegroundColor Yellow
    
    if ($response.services.Length -gt 0) {
        Write-Host "🎯 First 3 services:" -ForegroundColor Cyan
        for ($i = 0; $i -lt [Math]::Min(3, $response.services.Length); $i++) {
            $service = $response.services[$i]
            Write-Host "  $($i+1). $($service.name) - $($service.category) - Vendor: $($service.vendor_id)" -ForegroundColor Gray
        }
    }
    
    # Check categories
    $categories = $response.services | Group-Object -Property category | Sort-Object Count -Descending
    Write-Host "📈 Services by category:" -ForegroundColor Cyan
    $categories | ForEach-Object {
        Write-Host "  $($_.Name): $($_.Count) services" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "API Error: $($_.Exception.Message)" -ForegroundColor Red
}
