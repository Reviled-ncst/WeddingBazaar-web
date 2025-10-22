# Simple Backend Deployment Monitor

$url = "https://weddingbazaar-web.onrender.com/api/bookings/enhanced?coupleId=1-2025-001&limit=1"
$maxAttempts = 40
$wait = 15

Write-Host "`nMonitoring backend deployment..." -ForegroundColor Cyan
Write-Host "Checking for payment columns in API response...`n"

for ($i = 1; $i -le $maxAttempts; $i++) {
    Write-Host "Attempt $i of $maxAttempts..." -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
        
        if ($response.bookings -and $response.bookings.Count -gt 0) {
            $booking = $response.bookings[0]
            
            if ($booking.PSObject.Properties['total_paid'] -and $booking.PSObject.Properties['remaining_balance']) {
                Write-Host " SUCCESS!" -ForegroundColor Green
                Write-Host "`nPayment columns found:"
                Write-Host "  Total Paid: $($booking.total_paid)"
                Write-Host "  Remaining: $($booking.remaining_balance)"
                Write-Host "`nDeployment complete! Test at:"
                Write-Host "https://weddingbazaarph.web.app/individual/bookings"
                Write-Host ""
                exit 0
            }
            else {
                Write-Host " Old version (no payment columns)" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host " No data" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host " Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    if ($i -lt $maxAttempts) {
        Start-Sleep -Seconds $wait
    }
}

Write-Host "`nTimeout reached. Check Render dashboard." -ForegroundColor Red
exit 1
