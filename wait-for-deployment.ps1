# Wait for Render Deployment to Complete

Write-Host "🚀 Waiting for Render deployment to complete..." -ForegroundColor Cyan
Write-Host ""

$apiUrl = "https://weddingbazaar-web.onrender.com/api/health"
$maxAttempts = 20
$attempt = 0
$initialUptime = 1263  # Current uptime in seconds

Write-Host "📊 Initial State:" -ForegroundColor Yellow
Write-Host "   Uptime: $initialUptime seconds (21 minutes)" -ForegroundColor Gray
Write-Host "   Status: OLD CODE - needs restart" -ForegroundColor Red
Write-Host ""
Write-Host "⏳ Checking every 10 seconds for deployment..." -ForegroundColor Cyan
Write-Host ""

while ($attempt -lt $maxAttempts) {
    $attempt++
    
    try {
        $response = Invoke-RestMethod -Uri $apiUrl -ErrorAction Stop
        $currentUptime = [math]::Round($response.uptime)
        $timestamp = $response.timestamp
        
        Write-Host "[$attempt/$maxAttempts] Uptime: $currentUptime seconds | Time: $timestamp" -ForegroundColor White
        
        # Check if server restarted (uptime is less than before)
        if ($currentUptime -lt 60) {
            Write-Host ""
            Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📊 New State:" -ForegroundColor Yellow
            Write-Host "   Uptime: $currentUptime seconds" -ForegroundColor Gray
            Write-Host "   Version: $($response.version)" -ForegroundColor Gray
            Write-Host "   Timestamp: $timestamp" -ForegroundColor Gray
            Write-Host ""
            Write-Host "🎉 Backend is running with the FIX!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🧪 Next Steps:" -ForegroundColor Cyan
            Write-Host "   1. Go to: https://weddingbazaarph.web.app/individual/bookings" -ForegroundColor White
            Write-Host "   2. Try canceling a booking" -ForegroundColor White
            Write-Host "   3. Should work without 403 error!" -ForegroundColor White
            Write-Host ""
            
            # Beep to alert user
            [console]::beep(800, 300)
            [console]::beep(1000, 300)
            [console]::beep(1200, 500)
            
            break
        }
        
    } catch {
        Write-Host "[$attempt/$maxAttempts] ⚠️ Server unreachable (might be restarting...)" -ForegroundColor Yellow
    }
    
    if ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 10
    }
}

if ($attempt -eq $maxAttempts) {
    Write-Host ""
    Write-Host "⏱️ Timeout: Deployment taking longer than expected" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔍 Manual Check:" -ForegroundColor Cyan
    Write-Host "   1. Go to: https://dashboard.render.com" -ForegroundColor White
    Write-Host "   2. Check deployment status" -ForegroundColor White
    Write-Host "   3. View logs for any errors" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
