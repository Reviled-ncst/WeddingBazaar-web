#!/usr/bin/env pwsh

Write-Host "`n🚀 MONITORING PAYMENT ROUTES DEPLOYMENT`n" -ForegroundColor Cyan
Write-Host "Waiting for Render to rebuild and deploy..." -ForegroundColor Yellow
Write-Host "This usually takes 2-3 minutes.`n" -ForegroundColor Yellow

$maxAttempts = 12
$attemptCount = 0
$deployed = $false

while ($attemptCount -lt $maxAttempts -and -not $deployed) {
    $attemptCount++
    $timeLeft = (($maxAttempts - $attemptCount) * 15)
    
    Write-Host "[$attemptCount/$maxAttempts] Checking payment endpoint... ($timeLeft seconds remaining)" -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/payment/health" -TimeoutSec 10 -ErrorAction Stop
        
        Write-Host "`n✅ PAYMENT ENDPOINT IS LIVE!`n" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 5
        
        Write-Host "`n🎉 SUCCESS! Payment routes are now deployed!`n" -ForegroundColor Green
        
        if ($response.paymongo_configured) {
            Write-Host "✅ PayMongo is configured and ready!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  PayMongo API keys not configured yet" -ForegroundColor Yellow
            Write-Host "   Add keys in Render dashboard to enable payments" -ForegroundColor Yellow
        }
        
        $deployed = $true
        
    } catch {
        if ($_.Exception.Message -like "*404*") {
            Write-Host "   Still deploying... (404 Not Found)" -ForegroundColor Yellow
        } elseif ($_.Exception.Message -like "*503*") {
            Write-Host "   Server restarting... (503 Service Unavailable)" -ForegroundColor Yellow
        } else {
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
        if ($attemptCount -lt $maxAttempts) {
            Write-Host "   Waiting 15 seconds before retry...`n" -ForegroundColor Gray
            Start-Sleep -Seconds 15
        }
    }
}

if (-not $deployed) {
    Write-Host "`n⚠️  Deployment taking longer than expected`n" -ForegroundColor Yellow
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "  1. Check Render dashboard: https://dashboard.render.com" -ForegroundColor White
    Write-Host "  2. View deployment logs for errors" -ForegroundColor White
    Write-Host "  3. Wait a bit longer and try again`n" -ForegroundColor White
}
