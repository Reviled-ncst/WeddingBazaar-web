# Monitor Render Deployment and Test Receipt Endpoint
# This script checks deployment status and tests the fixed receipt endpoint

Write-Host "`n🚀 RECEIPT ENDPOINT FIX - DEPLOYMENT MONITOR`n" -ForegroundColor Cyan

$backendUrl = "https://weddingbazaar-web.onrender.com"
$testBookingId = "1761031420"  # Booking with 1 receipt
$maxAttempts = 30
$delaySeconds = 20

Write-Host "📋 Fix Applied:" -ForegroundColor Green
Write-Host "   - Changed u.full_name to CONCAT(u.first_name, u.last_name)" -ForegroundColor White
Write-Host "   - Fixed column name mismatch in users table JOIN`n" -ForegroundColor White

Write-Host "🔍 Monitoring deployment status...`n" -ForegroundColor Yellow

for ($i = 1; $i -le $maxAttempts; $i++) {
    Write-Host "[$i/$maxAttempts] Checking backend health..." -NoNewline
    
    try {
        $healthResponse = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method Get -TimeoutSec 10
        Write-Host " ✅ Backend is live!" -ForegroundColor Green
        
        # Test the receipt endpoint
        Write-Host "`n🧪 Testing receipt endpoint for booking $testBookingId..." -ForegroundColor Cyan
        
        try {
            $receiptUrl = "$backendUrl/api/payment/receipts/$testBookingId"
            $receiptResponse = Invoke-RestMethod -Uri $receiptUrl -Method Get -TimeoutSec 10
            
            if ($receiptResponse.success -and $receiptResponse.receipts) {
                $receiptCount = $receiptResponse.receipts.Count
                Write-Host "`n✅ SUCCESS! Receipt endpoint is working!" -ForegroundColor Green
                Write-Host "   - Found $receiptCount receipt(s)" -ForegroundColor White
                Write-Host "   - First receipt: $($receiptResponse.receipts[0].receipt_number)" -ForegroundColor White
                Write-Host "   - Amount: ₱$($receiptResponse.receipts[0].amount / 100)" -ForegroundColor White
                Write-Host "   - Payment Type: $($receiptResponse.receipts[0].payment_type)" -ForegroundColor White
                
                Write-Host "`n🎉 DEPLOYMENT COMPLETE AND VERIFIED!" -ForegroundColor Green
                Write-Host "`n📊 Next Steps:" -ForegroundColor Cyan
                Write-Host "   1. Test in production: https://weddingbazaarph.web.app/individual/bookings" -ForegroundColor White
                Write-Host "   2. Click 'View Receipt' button on any paid booking" -ForegroundColor White
                Write-Host "   3. Verify receipt details display correctly" -ForegroundColor White
                
                exit 0
            } else {
                Write-Host "`n⚠️ No receipts returned. Response:" -ForegroundColor Yellow
                Write-Host ($receiptResponse | ConvertTo-Json -Depth 3) -ForegroundColor Gray
            }
            
        } catch {
            $errorMessage = $_.Exception.Message
            
            if ($errorMessage -like "*column*does not exist*") {
                Write-Host "`n❌ Still getting column error. Deployment may not be complete yet." -ForegroundColor Red
                Write-Host "   Waiting for new deployment to finish...`n" -ForegroundColor Yellow
            } elseif ($errorMessage -like "*500*" -or $errorMessage -like "*Internal Server Error*") {
                Write-Host "`n⚠️ Server error. Checking error details..." -ForegroundColor Yellow
                Write-Host "   Error: $errorMessage`n" -ForegroundColor Gray
            } else {
                Write-Host "`n⚠️ Endpoint error: $errorMessage`n" -ForegroundColor Yellow
            }
        }
        
    } catch {
        Write-Host " ⏳ Backend restarting..." -ForegroundColor Yellow
    }
    
    if ($i -lt $maxAttempts) {
        Write-Host "Waiting $delaySeconds seconds before next check...`n" -ForegroundColor Gray
        Start-Sleep -Seconds $delaySeconds
    }
}

Write-Host "`n⚠️ Max attempts reached. Deployment may still be in progress." -ForegroundColor Yellow
Write-Host "Check Render dashboard: https://dashboard.render.com`n" -ForegroundColor Cyan
