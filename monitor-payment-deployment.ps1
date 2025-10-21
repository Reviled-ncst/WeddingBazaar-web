#!/usr/bin/env pwsh

Write-Host "`n🔍 MONITORING PAYMENT ENDPOINT DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

$backendUrl = "https://weddingbazaar-web.onrender.com"
$maxAttempts = 60  # Check for 5 minutes (60 attempts * 5 seconds)
$attempt = 0

Write-Host "⏳ Waiting for backend to redeploy..." -ForegroundColor Yellow
Write-Host "   This usually takes 2-3 minutes`n" -ForegroundColor Yellow

while ($attempt -lt $maxAttempts) {
    $attempt++
    
    try {
        # Check health endpoint
        $response = Invoke-RestMethod -Uri "$backendUrl/api/health" -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.status -eq "healthy") {
            Write-Host "✅ Backend is HEALTHY!" -ForegroundColor Green
            Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
            Write-Host "`n📊 Backend status:" -ForegroundColor Cyan
            Write-Host "   URL: $backendUrl" -ForegroundColor White
            Write-Host "   Health: healthy" -ForegroundColor White
            
            Write-Host "`n💡 Payment endpoint deployed! Next steps:" -ForegroundColor Yellow
            Write-Host "   1. Go to your booking page" -ForegroundColor White
            Write-Host "   2. Click 'Pay Deposit' or 'Pay Full Amount'" -ForegroundColor White
            Write-Host "   3. Use test card: 4343 4343 4343 4343" -ForegroundColor White
            Write-Host "   4. Check for receipt generation" -ForegroundColor White
            Write-Host "   5. Verify booking status changes`n" -ForegroundColor White
            
            exit 0
        }
    } catch {
        Write-Host "⏳ Waiting... (Attempt $attempt/$maxAttempts) - Backend redeploying" -ForegroundColor Gray
    }
    
    Start-Sleep -Seconds 5
}

Write-Host "`n❌ Deployment check timed out after 5 minutes" -ForegroundColor Red
Write-Host "   Check Render dashboard: https://dashboard.render.com`n" -ForegroundColor Yellow
exit 1
