# SQL Fix Deployment Monitor
# Monitors the Render deployment and checks when the new version goes live

Write-Host "🔍 SQL Fix Deployment Monitor" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

$targetVersion = "2.7.0-SQL-FIX-DEPLOYED"
$apiUrl = "https://weddingbazaar-web.onrender.com/api/health"
$maxAttempts = 20
$attemptCount = 0
$deploymentLive = $false

Write-Host "Target Version: $targetVersion" -ForegroundColor Yellow
Write-Host "Checking every 30 seconds...`n" -ForegroundColor Gray

while ($attemptCount -lt $maxAttempts -and -not $deploymentLive) {
    $attemptCount++
    Write-Host "[Attempt $attemptCount/$maxAttempts] Checking backend version..." -ForegroundColor White
    
    try {
        $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 10
        $health = $response.Content | ConvertFrom-Json
        
        $currentVersion = $health.version
        $uptime = [math]::Round($health.uptime / 60, 2)
        $dbStatus = $health.database
        
        Write-Host "  Version: $currentVersion" -ForegroundColor $(if ($currentVersion -eq $targetVersion) { "Green" } else { "Yellow" })
        Write-Host "  Uptime: $uptime minutes" -ForegroundColor Gray
        Write-Host "  Database: $dbStatus" -ForegroundColor Gray
        
        if ($currentVersion -eq $targetVersion) {
            Write-Host "`n✅ SUCCESS! New version is LIVE!" -ForegroundColor Green
            Write-Host "================================`n" -ForegroundColor Green
            
            # Display full health info
            Write-Host "Full Health Check:" -ForegroundColor Cyan
            $health | ConvertTo-Json -Depth 3 | Write-Host
            
            $deploymentLive = $true
            
            Write-Host "`n🎉 SQL Fix Deployment Complete!" -ForegroundColor Green
            Write-Host "================================`n" -ForegroundColor Green
            Write-Host "Next Steps:" -ForegroundColor Yellow
            Write-Host "1. Test deposit payment" -ForegroundColor White
            Write-Host "2. Test balance payment" -ForegroundColor White
            Write-Host "3. Test full payment" -ForegroundColor White
            Write-Host "4. Verify receipt viewing works" -ForegroundColor White
            Write-Host "5. Check database for saved payment data`n" -ForegroundColor White
            
        } else {
            Write-Host "  Status: Still deploying (old version running)...`n" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  Backend may be restarting...`n" -ForegroundColor Yellow
    }
    
    if (-not $deploymentLive -and $attemptCount -lt $maxAttempts) {
        Write-Host "Waiting 30 seconds before next check...`n" -ForegroundColor Gray
        Start-Sleep -Seconds 30
    }
}

if (-not $deploymentLive) {
    Write-Host "`n⚠️ WARNING: Deployment not detected after $($maxAttempts * 30 / 60) minutes" -ForegroundColor Red
    Write-Host "================================`n" -ForegroundColor Red
    Write-Host "Possible Issues:" -ForegroundColor Yellow
    Write-Host "1. Render deployment still in progress (check dashboard)" -ForegroundColor White
    Write-Host "2. Build errors (check Render logs)" -ForegroundColor White
    Write-Host "3. Service not starting (check Render logs)`n" -ForegroundColor White
    
    Write-Host "Check Render Dashboard:" -ForegroundColor Cyan
    Write-Host "https://dashboard.render.com/`n" -ForegroundColor Blue
}

Write-Host "Monitor session ended." -ForegroundColor Gray
