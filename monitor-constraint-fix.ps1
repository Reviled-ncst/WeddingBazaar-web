Write-Host "`n🎯 MONITORING CONSTRAINT FIX DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$backendUrl = "https://weddingbazaar-web.onrender.com"
$maxAttempts = 20
$attempt = 0

Write-Host "⏳ Waiting for Render deployment to complete..." -ForegroundColor Yellow
Write-Host "   This usually takes 2-5 minutes.`n" -ForegroundColor Gray

while ($attempt -lt $maxAttempts) {
    $attempt++
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    try {
        Write-Host "[$timestamp] Attempt $attempt/$maxAttempts - Checking backend..." -NoNewline
        
        $response = Invoke-WebRequest -Uri "$backendUrl/api/health" -Method GET -TimeoutSec 10
        $healthData = $response.Content | ConvertFrom-Json
        
        if ($response.StatusCode -eq 200) {
            Write-Host " ✅ ONLINE" -ForegroundColor Green
            Write-Host "`n🎉 Backend deployment successful!" -ForegroundColor Green
            Write-Host "`n📊 Health Check Response:" -ForegroundColor Cyan
            Write-Host ($healthData | ConvertTo-Json -Depth 3)
            
            Write-Host "`n✅ DEPLOYMENT COMPLETE" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "`n🚀 NEXT STEPS:" -ForegroundColor Yellow
            Write-Host "   1. Go to vendor dashboard" -ForegroundColor White
            Write-Host "   2. Click 'Add Service'" -ForegroundColor White
            Write-Host "   3. Create service with 3 packages" -ForegroundColor White
            Write-Host "   4. Check if all 3 packages are saved" -ForegroundColor White
            Write-Host "`n   📖 See CONSTRAINT_VIOLATION_FIXED.md for details" -ForegroundColor Gray
            break
        }
    }
    catch {
        Write-Host " ⏳ Deploying..." -ForegroundColor Yellow
    }
    
    if ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 15
    }
}

if ($attempt -eq $maxAttempts) {
    Write-Host "`n⚠️  Timeout: Deployment taking longer than expected" -ForegroundColor Yellow
    Write-Host "   Check Render dashboard: https://dashboard.render.com" -ForegroundColor Gray
}

Write-Host "`n"
