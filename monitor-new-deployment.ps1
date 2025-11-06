# Monitor New Render Deployment
# Check every 30 seconds for new version

Write-Host ""
Write-Host "🔄 MONITORING RENDER DEPLOYMENT - v2.7.2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏰ Started at: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Yellow
Write-Host "🎯 Looking for version: 2.7.2-RENDER-CACHE-FIX" -ForegroundColor Yellow
Write-Host ""

$maxAttempts = 20  # 10 minutes max (20 x 30 seconds)
$attempt = 0
$success = $false

while ($attempt -lt $maxAttempts -and -not $success) {
    $attempt++
    Write-Host "[$attempt/$maxAttempts] Checking deployment status..." -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health" -TimeoutSec 10
        
        if ($response.version -eq "2.7.2-RENDER-CACHE-FIX") {
            Write-Host ""
            Write-Host "🎉 SUCCESS! NEW VERSION DEPLOYED!" -ForegroundColor Green
            Write-Host "=================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Version: $($response.version)" -ForegroundColor Green
            Write-Host "Database: $($response.database)" -ForegroundColor Green
            Write-Host "Environment: $($response.environment)" -ForegroundColor Green
            Write-Host "Uptime: $([math]::Round($response.uptime, 2)) seconds" -ForegroundColor Green
            Write-Host ""
            Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
            Write-Host "⏰ Completed at: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Green
            Write-Host ""
            
            # Test services endpoint
            Write-Host "🧪 Testing services endpoint..." -ForegroundColor Cyan
            try {
                $services = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/services" -TimeoutSec 10
                Write-Host "✅ Services API working: $($services.length) services found" -ForegroundColor Green
            } catch {
                Write-Host "⚠️ Services API test failed: $($_.Exception.Message)" -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "🚀 NEXT STEPS:" -ForegroundColor Cyan
            Write-Host "1. Login to vendor account: https://weddingbazaarph.web.app/vendor/login" -ForegroundColor White
            Write-Host "2. Go to services page: https://weddingbazaarph.web.app/vendor/services" -ForegroundColor White
            Write-Host "3. You should see 29 services displayed" -ForegroundColor White
            Write-Host ""
            
            $success = $true
        } else {
            Write-Host "   Old version still running: $($response.version)" -ForegroundColor Yellow
            Write-Host "   Waiting for new deployment..." -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ⏳ Server not responding yet (this is normal during deployment)" -ForegroundColor Gray
    }
    
    if (-not $success) {
        if ($attempt -lt $maxAttempts) {
            Write-Host "   Next check in 30 seconds..." -ForegroundColor DarkGray
            Start-Sleep -Seconds 30
        }
    }
}

if (-not $success) {
    Write-Host ""
    Write-Host "⚠️ TIMEOUT - Deployment taking longer than expected" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "1. Render free tier cold start (can take 10-15 minutes)" -ForegroundColor White
    Write-Host "2. Build process running (check Render dashboard)" -ForegroundColor White
    Write-Host "3. Health checks not passing yet" -ForegroundColor White
    Write-Host ""
    Write-Host "Check Render dashboard: https://dashboard.render.com/" -ForegroundColor Cyan
    Write-Host ""
}
