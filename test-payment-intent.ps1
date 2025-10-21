# Test Payment Intent Creation
# This script tests the payment intent endpoint directly

Write-Host "Testing Payment Intent Creation..." -ForegroundColor Cyan
Write-Host ""

$testData = @{
    amount = 100000
    currency = "PHP"
    description = "TEST - Wedding Bazaar Booking Payment"
    payment_method_allowed = @("card")
    metadata = @{
        booking_id = "test-001"
        payment_type = "deposit"
    }
} | ConvertTo-Json

Write-Host "Request Data:" -ForegroundColor Yellow
Write-Host $testData
Write-Host ""

Write-Host "Sending request... (may take 10-30 seconds)" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/payment/create-intent" -Method Post -ContentType "application/json" -Body $testData -TimeoutSec 60
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
    
} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
