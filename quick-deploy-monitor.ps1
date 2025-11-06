#!/usr/bin/env pwsh
# Quick deployment monitor

Write-Host "`n🔍 Monitoring Render Deployment..." -ForegroundColor Cyan
Write-Host "Checking every 15 seconds for new deployment`n" -ForegroundColor Gray

$checks = 0
$maxChecks = 20

while ($checks -lt $maxChecks) {
    $checks++
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    try {
        $health = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method Get -ErrorAction Stop
        $uptimeMinutes = [math]::Round($health.uptime / 60, 1)
        
        Write-Host "[$timestamp] Uptime: $uptimeMinutes min | Version: $($health.version)" -ForegroundColor White
        
        # New deployment detected if uptime < 2 minutes
        if ($health.uptime -lt 120) {
            Write-Host "`n🎉 NEW DEPLOYMENT DETECTED!" -ForegroundColor Green
            Write-Host "Waiting 10 seconds for server to stabilize..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
            
            # Test the endpoint
            Write-Host "`nTesting vendor details endpoint..." -ForegroundColor Cyan
            try {
                $result = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/vendors/2-2025-003/details" -Method Get
                if ($result.success) {
                    Write-Host "✅ ENDPOINT WORKING! Modal should now work." -ForegroundColor Green
                    Write-Host "`nVendor: $($result.vendor.name)" -ForegroundColor White
                    Write-Host "Services: $($result.services.Count)" -ForegroundColor White
                    Write-Host "Price Range: $($result.vendor.pricing.priceRange)" -ForegroundColor White
                } else {
                    Write-Host "⚠️ Endpoint returned success=false" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "❌ Still returning 500 error" -ForegroundColor Red
            }
            break
        }
    } catch {
        Write-Host "[$timestamp] ⚠️ Backend not responding" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 15
}

if ($checks -ge $maxChecks) {
    Write-Host "`n⏰ Timeout after $maxChecks checks" -ForegroundColor Red
    Write-Host "Check Render manually: https://dashboard.render.com/web/srv-ctap0npu0jms73dekhd0" -ForegroundColor Cyan
}
