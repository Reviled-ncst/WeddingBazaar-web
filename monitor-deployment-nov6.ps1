# Backend Deployment Monitor - Nov 6, 2025

Write-Host "🔍 Monitoring Render Backend Deployment..." -ForegroundColor Cyan
Write-Host "📦 Commit: b3e6aa6 - Console cleanup + document fix" -ForegroundColor Yellow
Write-Host ""

$backendUrl = "https://weddingbazaar-web.onrender.com/api/health"
$maxAttempts = 10
$attempt = 0

while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "[$attempt/$maxAttempts] Checking backend health..." -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $backendUrl -Method GET -TimeoutSec 10
        
        if ($response.status -eq "ok") {
            Write-Host ""
            Write-Host "✅ BACKEND IS LIVE!" -ForegroundColor Green
            Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Backend Status:" -ForegroundColor Cyan
            Write-Host "  • Health: $($response.status)" -ForegroundColor White
            Write-Host "  • URL: $backendUrl" -ForegroundColor White
            Write-Host ""
            
            # Test vendor services endpoint
            Write-Host "Testing vendor services endpoint..." -ForegroundColor Cyan
            try {
                $servicesUrl = "https://weddingbazaar-web.onrender.com/api/services/vendor/2-2025-003"
                $servicesResponse = Invoke-RestMethod -Uri $servicesUrl -Method GET -TimeoutSec 10
                
                if ($servicesResponse.success) {
                    Write-Host "✅ Vendor services endpoint working!" -ForegroundColor Green
                    Write-Host "  • Services found: $($servicesResponse.services.Count)" -ForegroundColor White
                } else {
                    Write-Host "⚠️ Vendor services endpoint returned error" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "⚠️ Could not test vendor services endpoint" -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "🧪 Next Steps:" -ForegroundColor Cyan
            Write-Host "  1. Test service creation: vendor0qw@example.com / 123456" -ForegroundColor White
            Write-Host "  2. Click 'Add Service' button" -ForegroundColor White
            Write-Host "  3. Fill out form and submit" -ForegroundColor White
            Write-Host "  4. Verify no document verification error" -ForegroundColor White
            Write-Host "  5. Check browser console - should be clean (no quote logs)" -ForegroundColor White
            Write-Host ""
            
            break
        }
    } catch {
        Write-Host "  ⏳ Backend not responding yet... (waiting 30s)" -ForegroundColor Yellow
    }
    
    if ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 30
    }
}

if ($attempt -eq $maxAttempts) {
    Write-Host ""
    Write-Host "⚠️ Backend deployment taking longer than expected" -ForegroundColor Yellow
    Write-Host "Check Render dashboard: https://dashboard.render.com" -ForegroundColor Cyan
}
