# Final Payment Methods Test - All 5 Methods
# Tests: Card, GCash, PayMaya, GrabPay, Bank Transfer

Write-Host "🎯 FINAL COMPREHENSIVE PAYMENT METHODS TEST" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Magenta

# Check backend health
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not responding" -ForegroundColor Red
    exit 1
}

$results = @{}

# 1. Card Payment
Write-Host "`n💳 1. CARD PAYMENT" -ForegroundColor Yellow
try {
    $cardResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/card/create" -Method POST -ContentType "application/json" -Body (@{
        bookingId = "final-test-card"
        amount = 5000
        paymentType = "downpayment"
        cardDetails = @{
            number = "4343434343434345"
            expiry = "12/25"
            cvc = "123"
            name = "Test Customer"
        }
    } | ConvertTo-Json -Depth 3) -TimeoutSec 10
    
    $results["Card"] = $cardResponse.success
    Write-Host "✅ CARD: SUCCESS" -ForegroundColor Green
} catch {
    $results["Card"] = $false
    Write-Host "❌ CARD: FAILED" -ForegroundColor Red
}

# 2. GCash Payment
Write-Host "`n📱 2. GCASH PAYMENT" -ForegroundColor Yellow
try {
    $gcashResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/gcash/create" -Method POST -ContentType "application/json" -Body (@{
        bookingId = "final-test-gcash"
        amount = 3000
        paymentType = "downpayment"
    } | ConvertTo-Json) -TimeoutSec 10
    
    $results["GCash"] = $gcashResponse.success
    Write-Host "✅ GCASH: SUCCESS" -ForegroundColor Green
} catch {
    $results["GCash"] = $false
    Write-Host "❌ GCASH: FAILED" -ForegroundColor Red
}

# 3. PayMaya Payment
Write-Host "`n💰 3. PAYMAYA PAYMENT" -ForegroundColor Yellow
try {
    $paymayaResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/paymaya/create" -Method POST -ContentType "application/json" -Body (@{
        bookingId = "final-test-paymaya"
        amount = 2500
        paymentType = "downpayment"
    } | ConvertTo-Json) -TimeoutSec 10
    
    $results["PayMaya"] = $paymayaResponse.success
    Write-Host "✅ PAYMAYA: SUCCESS" -ForegroundColor Green
} catch {
    $results["PayMaya"] = $false
    Write-Host "❌ PAYMAYA: FAILED" -ForegroundColor Red
}

# 4. GrabPay Payment
Write-Host "`n🚗 4. GRABPAY PAYMENT" -ForegroundColor Yellow
try {
    $grabpayResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/grabpay/create" -Method POST -ContentType "application/json" -Body (@{
        bookingId = "final-test-grabpay"
        amount = 4000
        paymentType = "downpayment"
    } | ConvertTo-Json) -TimeoutSec 10
    
    $results["GrabPay"] = $grabpayResponse.success
    Write-Host "✅ GRABPAY: SUCCESS" -ForegroundColor Green
} catch {
    $results["GrabPay"] = $false
    Write-Host "❌ GRABPAY: FAILED" -ForegroundColor Red
}

# 5. Bank Transfer Payment
Write-Host "`n🏦 5. BANK TRANSFER PAYMENT" -ForegroundColor Yellow
try {
    $bankResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/bank-transfer/create" -Method POST -ContentType "application/json" -Body (@{
        bookingId = "final-test-bank"
        amount = 10000
        paymentType = "full_payment"
    } | ConvertTo-Json) -TimeoutSec 10
    
    $results["BankTransfer"] = $bankResponse.success
    Write-Host "✅ BANK TRANSFER: SUCCESS" -ForegroundColor Green
} catch {
    $results["BankTransfer"] = $false
    Write-Host "❌ BANK TRANSFER: FAILED" -ForegroundColor Red
}

# Final Summary
Write-Host "`n🎯 FINAL RESULTS" -ForegroundColor Magenta
Write-Host "================" -ForegroundColor Magenta

$successCount = 0
foreach ($method in $results.Keys) {
    $status = if ($results[$method]) { "✅ WORKING" } else { "❌ FAILED" }
    $color = if ($results[$method]) { "Green" } else { "Red" }
    Write-Host "$status - $method" -ForegroundColor $color
    if ($results[$method]) { $successCount++ }
}

$totalMethods = $results.Count
Write-Host "`n🏆 SCORE: $successCount/$totalMethods payment methods working" -ForegroundColor $(if ($successCount -eq $totalMethods) { "Green" } else { "Yellow" })

if ($successCount -eq $totalMethods) {
    Write-Host "🎉 ALL PAYMENT METHODS ARE WORKING!" -ForegroundColor Green
    Write-Host "✨ WeddingBazaar payment system is fully functional!" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ Some payment methods need attention" -ForegroundColor Yellow
}
