# Quick Status Check - Accept Quote Deployment

Write-Host ""
Write-Host "CHECKING DEPLOYMENT STATUS..." -ForegroundColor Cyan
Write-Host ("=" * 60)

# Check server health
try {
    $health = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method GET | ConvertFrom-Json
    $uptime = [math]::Round($health.uptime)
    
    Write-Host ""
    Write-Host "SERVER STATUS:" -ForegroundColor Yellow
    Write-Host "  Version: $($health.version)"
    Write-Host "  Uptime: $uptime seconds"
    Write-Host "  Database: $($health.database)"
    
    if ($uptime -lt 180) {
        Write-Host ""
        Write-Host "SUCCESS - SERVER RECENTLY RESTARTED!" -ForegroundColor Green
        Write-Host "  New code likely deployed" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "WARNING - OLD DEPLOYMENT STILL RUNNING" -ForegroundColor Red
        Write-Host "  Uptime > 3 minutes means old code still active" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  ACTION REQUIRED: Manual deploy via Render Dashboard" -ForegroundColor Red
        Write-Host "  URL: https://dashboard.render.com" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Cannot reach server" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)"
    exit 1
}

# Test accept-quote endpoint
Write-Host "`n🧪 TESTING ACCEPT-QUOTE ENDPOINT:" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest `
        -Uri "https://weddingbazaar-web.onrender.com/api/bookings/1760918009/accept-quote" `
        -Method PATCH `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"acceptance_notes":"Deployment verification test"}' `
        -ErrorAction Stop
    
    Write-Host "  ✅ SUCCESS! Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  Response:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5 | Write-Host
    
    Write-Host "`n🎉 ACCEPT QUOTE IS WORKING!" -ForegroundColor Green
    Write-Host "  You can now test in the browser" -ForegroundColor Cyan
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "  ❌ FAILED! Status: $statusCode" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        
        if ($errorBody -match "bookings_status_check") {
            Write-Host "`n  🔴 CONSTRAINT ERROR STILL PRESENT!" -ForegroundColor Red
            Write-Host "  This means the workaround hasn't been deployed yet." -ForegroundColor Yellow
            Write-Host "`n  REQUIRED ACTION:" -ForegroundColor Red
            Write-Host "  1. Go to https://dashboard.render.com" -ForegroundColor White
            Write-Host "  2. Find service: weddingbazaar-web" -ForegroundColor White
            Write-Host "  3. Click 'Manual Deploy' button" -ForegroundColor White
            Write-Host "  4. Wait 3-5 minutes" -ForegroundColor White
            Write-Host "  5. Run this script again to verify" -ForegroundColor White
        } elseif ($statusCode -eq 404) {
            Write-Host "`n  ⚠️  Booking not found (404)" -ForegroundColor Yellow
            Write-Host "  This could mean:" -ForegroundColor Gray
            Write-Host "  - Booking ID 1760918009 doesn't exist" -ForegroundColor Gray
            Write-Host "  - Endpoint is working but booking is missing" -ForegroundColor Gray
            Write-Host "`n  Try testing with a different booking ID from your database" -ForegroundColor Cyan
        } else {
            Write-Host "`n  Error response:" -ForegroundColor Gray
            Write-Host "  $errorBody" -ForegroundColor Red
        }
    }
}

Write-Host "`n" + ("=" * 60)
Write-Host "Check complete. See above for status and next steps.`n" -ForegroundColor Cyan
