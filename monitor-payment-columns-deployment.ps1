# Monitor Backend Deployment - Payment Columns Fix
# Wait for Render to deploy the backend with payment tracking columns

$backendUrl = "https://weddingbazaar-web.onrender.com"
$testEndpoint = "$backendUrl/api/bookings/enhanced?coupleId=1-2025-001&limit=1"
$maxWaitMinutes = 10
$checkIntervalSeconds = 15

Write-Host "`n🚀 MONITORING BACKEND DEPLOYMENT" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host "`n📍 Backend URL: $backendUrl"
Write-Host "📍 Test Endpoint: $testEndpoint"
Write-Host "⏰ Max Wait: $maxWaitMinutes minutes"
Write-Host "⏱️  Check Interval: $checkIntervalSeconds seconds"
Write-Host "`n" + ("=" * 60) + "`n"

$startTime = Get-Date
$endTime = $startTime.AddMinutes($maxWaitMinutes)
$attemptNumber = 0

function Test-PaymentColumns {
    try {
        $response = Invoke-RestMethod -Uri $testEndpoint -Method Get -TimeoutSec 10
        
        if ($response.bookings -and $response.bookings.Count -gt 0) {
            $booking = $response.bookings[0]
            
            # Check if payment tracking columns exist
            $hasColumns = $null -ne $booking.PSObject.Properties['total_paid'] -and
                         $null -ne $booking.PSObject.Properties['remaining_balance']
            
            return @{
                Success = $true
                HasPaymentColumns = $hasColumns
                TotalPaid = $booking.total_paid
                RemainingBalance = $booking.remaining_balance
                Status = $booking.status
                BookingId = $booking.id
            }
        }
        
        return @{
            Success = $false
            HasPaymentColumns = $false
            Error = "No bookings returned"
        }
    }
    catch {
        return @{
            Success = $false
            HasPaymentColumns = $false
            Error = $_.Exception.Message
        }
    }
}

Write-Host "🔍 Starting deployment check...`n"

while ((Get-Date) -lt $endTime) {
    $attemptNumber++
    $elapsed = (Get-Date) - $startTime
    $elapsedFormatted = "{0:mm}:{0:ss}" -f $elapsed
    
    Write-Host "[$elapsedFormatted] Attempt #$attemptNumber - Checking..." -NoNewline
    
    $result = Test-PaymentColumns
    
    if ($result.Success -and $result.HasPaymentColumns) {
        Write-Host " ✅ SUCCESS!" -ForegroundColor Green
        Write-Host "`n" + ("=" * 60)
        Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
        Write-Host ("=" * 60)
        Write-Host "`n📊 Payment Columns Verified:"
        Write-Host "   Booking ID: $($result.BookingId)"
        Write-Host "   Status: $($result.Status)"
        Write-Host "   Total Paid: ₱$($result.TotalPaid)"
        Write-Host "   Remaining Balance: ₱$($result.RemainingBalance)"
        Write-Host "`n✅ Backend is now serving payment tracking data!"
        Write-Host "✅ Frontend balance display should now be correct!"
        Write-Host "`n🌐 Test URL: https://weddingbazaarph.web.app/individual/bookings"
        Write-Host "`n⚠️  Remember to hard refresh (Ctrl+Shift+R) to see changes!`n"
        exit 0
    }
    elseif ($result.Success) {
        Write-Host " ⏳ Deployed but NO payment columns" -ForegroundColor Yellow
        Write-Host "   Still waiting for new version..."
    }
    else {
        Write-Host " ⏳ Waiting..." -ForegroundColor Yellow
        if ($result.Error) {
            Write-Host "   Error: $($result.Error)" -ForegroundColor DarkGray
        }
    }
    
    Start-Sleep -Seconds $checkIntervalSeconds
}

Write-Host "`n⏰ Timeout reached after $maxWaitMinutes minutes" -ForegroundColor Red
Write-Host "`n❌ Deployment may still be in progress."
Write-Host "📝 Check Render dashboard: https://dashboard.render.com/"
Write-Host "📝 Manual test: $testEndpoint"
Write-Host ""
exit 1
