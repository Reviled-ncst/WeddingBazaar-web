# Monitor Workaround Deployment

Write-Host "`n🔍 MONITORING ACCEPT QUOTE WORKAROUND DEPLOYMENT`n" -ForegroundColor Cyan

$bookingId = "1760918009"
$maxAttempts = 20
$attempt = 0
$deploymentLive = $false

Write-Host "📊 Will test booking ID: $bookingId" -ForegroundColor Yellow
Write-Host "⏱️  Checking every 10 seconds (max 20 attempts = ~3 minutes)`n" -ForegroundColor Yellow

while ($attempt -lt $maxAttempts -and -not $deploymentLive) {
    $attempt++
    Write-Host "[$attempt/$maxAttempts] Testing deployment..." -ForegroundColor Gray
    
    try {
        # Test the accept-quote endpoint
        $body = @{ acceptance_notes = "Testing workaround deployment" } | ConvertTo-Json
        
        $response = Invoke-RestMethod `
            -Uri "https://weddingbazaar-web.onrender.com/api/bookings/$bookingId/accept-quote" `
            -Method PATCH `
            -ContentType "application/json" `
            -Body $body `
            -TimeoutSec 10 `
            -ErrorAction Stop
        
        # Success!
        Write-Host "`n✅ DEPLOYMENT LIVE! Endpoint returned:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor Green
        
        # Check if it's the workaround or real fix
        if ($response.booking.status -eq 'confirmed' -or $response.booking.notes -like '*QUOTE_ACCEPTED*') {
            Write-Host "`n🎉 WORKAROUND IS WORKING!" -ForegroundColor Green
            Write-Host "   - Database status: $($response.booking.status)" -ForegroundColor Gray
            Write-Host "   - Frontend sees: quote_accepted" -ForegroundColor Gray
            Write-Host "   - Notes contain: QUOTE_ACCEPTED" -ForegroundColor Gray
        }
        
        $deploymentLive = $true
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 500) {
            Write-Host "   ❌ Still getting 500 error - deployment may not be live yet" -ForegroundColor Red
        } elseif ($statusCode -eq 404) {
            Write-Host "   ⏳ Got 404 - Render still deploying..." -ForegroundColor Yellow
        } elseif ($statusCode -eq 400) {
            Write-Host "   ⚠️  Got 400 - Check booking exists and has quote" -ForegroundColor Yellow
            # 400 means endpoint is live, just wrong booking
            $deploymentLive = $true
        } else {
            Write-Host "   ⚠️  Status: $statusCode" -ForegroundColor Yellow
        }
        
        if ($attempt -lt $maxAttempts -and -not $deploymentLive) {
            Write-Host "   ⏳ Waiting 10 seconds before retry..." -ForegroundColor Gray
            Start-Sleep -Seconds 10
        }
    }
}

if (-not $deploymentLive) {
    Write-Host "`n❌ DEPLOYMENT NOT DETECTED AFTER $maxAttempts ATTEMPTS" -ForegroundColor Red
    Write-Host "   Check Render dashboard: https://dashboard.render.com" -ForegroundColor Yellow
    Write-Host "   Check deployment logs for errors" -ForegroundColor Yellow
} else {
    Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "   1. Test in browser: https://weddingbazaar-web.web.app" -ForegroundColor White
    Write-Host "   2. Log in as couple" -ForegroundColor White
    Write-Host "   3. Go to Bookings, View Details, Accept Quote" -ForegroundColor White
    Write-Host "   4. Should see success toast!" -ForegroundColor White
    Write-Host "`n📖 Read full details: ACCEPT_QUOTE_WORKAROUND_DEPLOYED.md" -ForegroundColor Cyan
}
