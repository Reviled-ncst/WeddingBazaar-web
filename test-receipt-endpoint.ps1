# Simple Receipt Endpoint Test Script

Write-Host "`n🚀 Testing Receipt Endpoint Fix`n" -ForegroundColor Cyan

$backendUrl = "https://weddingbazaar-web.onrender.com"
$testBookingId = "1761031420"

Write-Host "Testing receipt endpoint for booking: $testBookingId`n" -ForegroundColor Yellow

$maxAttempts = 30
$delaySeconds = 20

for ($i = 1; $i -le $maxAttempts; $i++) {
    Write-Host "[$i/$maxAttempts] Checking..." -NoNewline
    
    try {
        $receiptUrl = "$backendUrl/api/payment/receipts/$testBookingId"
        $response = Invoke-RestMethod -Uri $receiptUrl -Method Get -TimeoutSec 10
        
        if ($response.success) {
            Write-Host " SUCCESS!" -ForegroundColor Green
            Write-Host "`nFound $($response.receipts.Count) receipt(s):" -ForegroundColor Green
            foreach ($receipt in $response.receipts) {
                Write-Host "  - Receipt: $($receipt.receipt_number)" -ForegroundColor White
                Write-Host "    Amount: $([math]::Round($receipt.amount / 100, 2))" -ForegroundColor White
                Write-Host "    Type: $($receipt.payment_type)" -ForegroundColor White
            }
            Write-Host "`n✅ DEPLOYMENT VERIFIED!`n" -ForegroundColor Green
            exit 0
        }
    }
    catch {
        Write-Host " Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    if ($i -lt $maxAttempts) {
        Start-Sleep -Seconds $delaySeconds
    }
}

Write-Host "`n⚠️ Max attempts reached`n" -ForegroundColor Yellow
