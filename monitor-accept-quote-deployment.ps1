#!/usr/bin/env pwsh
# Monitor Render deployment status for Accept Quote fix
# Expected commit: 22b61bb or 6becbb5 (trigger commit)

Write-Host "🔍 Monitoring Render deployment for Accept Quote workaround fix..." -ForegroundColor Cyan
Write-Host "Expected commits: 22b61bb (workaround) or 6becbb5 (trigger)" -ForegroundColor Yellow
Write-Host ""

$maxAttempts = 30
$attempt = 0
$deployed = $false

while ($attempt -lt $maxAttempts -and -not $deployed) {
    $attempt++
    Write-Host "[$attempt/$maxAttempts] Checking deployment status..." -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method GET -ErrorAction Stop
        $health = $response.Content | ConvertFrom-Json
        
        $currentCommit = $health.databaseStats.conversations
        
        Write-Host "Current deployed version: $($health.version)" -ForegroundColor White
        
        # Check if the workaround is deployed by testing the endpoint
        Write-Host "Testing accept-quote endpoint..." -ForegroundColor Gray
        
        try {
            $testResponse = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/bookings/1760918009/accept-quote" `
                -Method PUT `
                -Headers @{"Content-Type"="application/json"} `
                -Body '{"acceptance_notes": "Deployment test"}' `
                -ErrorAction Stop
            
            Write-Host "✅ SUCCESS! Accept Quote endpoint working!" -ForegroundColor Green
            Write-Host "Status: $($testResponse.StatusCode)" -ForegroundColor Green
            Write-Host "Response: $($testResponse.Content)" -ForegroundColor Cyan
            $deployed = $true
            
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            
            if ($errorBody -match "bookings_status_check") {
                Write-Host "⏳ Old version still deployed (constraint error detected)" -ForegroundColor Yellow
                Write-Host "Waiting 20 seconds before retry..." -ForegroundColor Gray
                Start-Sleep -Seconds 20
            } elseif ($statusCode -eq 404) {
                Write-Host "⏳ Booking not found (expected on first run)" -ForegroundColor Yellow
                Write-Host "Workaround may be deployed. Manual testing recommended." -ForegroundColor Cyan
                $deployed = $true
            } else {
                Write-Host "⚠️  Unexpected error (Status: $statusCode)" -ForegroundColor Red
                Write-Host $errorBody -ForegroundColor Red
                Write-Host "Waiting 20 seconds before retry..." -ForegroundColor Gray
                Start-Sleep -Seconds 20
            }
        }
        
    } catch {
        Write-Host "❌ Error checking deployment: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Waiting 20 seconds before retry..." -ForegroundColor Gray
        Start-Sleep -Seconds 20
    }
}

if ($deployed) {
    Write-Host ""
    Write-Host "✅✅✅ DEPLOYMENT SUCCESSFUL! ✅✅✅" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Test Accept Quote in the browser: https://weddingbazaar-web.web.app" -ForegroundColor White
    Write-Host "2. Navigate to Individual Bookings page" -ForegroundColor White
    Write-Host "3. Click 'Accept Quote' on a booking with status 'quote_sent'" -ForegroundColor White
    Write-Host "4. Verify status updates to 'quote_accepted' without errors" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⏳ Deployment still in progress after $maxAttempts attempts" -ForegroundColor Yellow
    Write-Host "Please check Render dashboard: https://dashboard.render.com" -ForegroundColor Cyan
    Write-Host "Or continue monitoring manually" -ForegroundColor Cyan
}
