Write-Host "🖼️ Testing Category-Specific Images Fix..." -ForegroundColor Blue

# Wait for deployment
Write-Host "Waiting for Render deployment (45 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

# Test the fixed API
try {
    Write-Host "`nTesting services API with category images..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri 'https://weddingbazaar-web.onrender.com/api/services' -Method Get -TimeoutSec 30
    
    if ($response.success -and $response.services) {
        Write-Host "✅ API Success: $($response.services.Length) services" -ForegroundColor Green
        
        # Check first few services for different images
        Write-Host "`n🎨 Checking image variety:" -ForegroundColor Cyan
        for ($i = 0; $i -lt [Math]::Min(5, $response.services.Length); $i++) {
            $service = $response.services[$i]
            $imageId = $service.image -replace '.*photo-([^?]+).*', '$1'
            Write-Host "  $($service.category): Image ID $imageId" -ForegroundColor Gray
        }
        
        # Count unique images
        $uniqueImages = $response.services | Select-Object -ExpandProperty image | Sort-Object -Unique
        Write-Host "`n📊 Image Statistics:" -ForegroundColor Yellow
        Write-Host "  Total services: $($response.services.Length)" -ForegroundColor White
        Write-Host "  Unique images: $($uniqueImages.Length)" -ForegroundColor White
        
        if ($uniqueImages.Length -gt 1) {
            Write-Host "✅ SUCCESS: Services now have different images!" -ForegroundColor Green
        } else {
            Write-Host "❌ ISSUE: All services still have the same image" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
}
