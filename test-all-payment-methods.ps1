#!/usr/bin/env pwsh
# Comprehensive Payment Methods Test for WeddingBazaar
# Tests all 5 payment methods: Card, GCash, PayMaya, GrabPay, Bank Transfer

Write-Host "🧪 Comprehensive Payment Methods Test for WeddingBazaar" -ForegroundColor Magenta
Write-Host "=====================================================" -ForegroundColor Magenta

# Check backend health first
Write-Host "`n🏥 Checking Backend Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend Status: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "✅ Database: $($healthResponse.database)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not responding. Please start the backend server first." -ForegroundColor Red
    exit 1
}

# Test Payment Methods List
Write-Host "`n📋 Testing Available Payment Methods..." -ForegroundColor Yellow
try {
    $methodsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/methods" -Method GET -TimeoutSec 10
    Write-Host "✅ Retrieved $($methodsResponse.methods.Count) payment methods:" -ForegroundColor Green
    $methodsResponse.methods | ForEach-Object {
        $status = if ($_.available) { "✅" } else { "❌" }
        Write-Host "   $status $($_.name) ($($_.type))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Payment Methods List Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Initialize results tracking
$results = @{
    "Card" = $false
    "GCash" = $false
    "PayMaya" = $false
    "GrabPay" = $false
    "BankTransfer" = $false
}

# Test 1: Card Payment
Write-Host "`n💳 1. Testing Card Payment..." -ForegroundColor Yellow
$cardPayload = @{
    bookingId = "test-booking-card-$(Get-Date -Format 'yyyyMMddHHmmss')"
    amount = 5000
    paymentType = "downpayment"
    cardDetails = @{
        number = "4343434343434345"
        expiry = "12/25"
        cvc = "123"
        name = "Test Customer"
    }
} | ConvertTo-Json -Depth 3

try {
    $cardResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/card/create" -Method POST -ContentType "application/json" -Body $cardPayload -TimeoutSec 15
    if ($cardResponse.success) {
        Write-Host "✅ Card Payment: SUCCESS" -ForegroundColor Green
        Write-Host "   Payment ID: $($cardResponse.paymentId)" -ForegroundColor Cyan
        Write-Host "   Intent ID: $($cardResponse.paymentIntentId)" -ForegroundColor Cyan
        $results.Card = $true
    } else {
        Write-Host "⚠️ Card Payment: Response received but not successful" -ForegroundColor Yellow
        Write-Host "   Response: $($cardResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Card Payment Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: GCash Payment (using specific endpoint)
Write-Host "`n📱 2. Testing GCash Payment..." -ForegroundColor Yellow
$gcashPayload = @{
    bookingId = "test-booking-gcash-$(Get-Date -Format 'yyyyMMddHHmmss')"
    amount = 3000
    paymentType = "downpayment"
} | ConvertTo-Json

try {
    $gcashResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/gcash/create" -Method POST -ContentType "application/json" -Body $gcashPayload -TimeoutSec 15
    if ($gcashResponse.success) {
        Write-Host "✅ GCash Payment: SUCCESS" -ForegroundColor Green
        Write-Host "   Payment ID: $($gcashResponse.paymentId)" -ForegroundColor Cyan
        Write-Host "   Source ID: $($gcashResponse.sourceId)" -ForegroundColor Cyan
        Write-Host "   Checkout URL: $($gcashResponse.checkoutUrl)" -ForegroundColor Cyan
        $results.GCash = $true
    } else {
        Write-Host "⚠️ GCash Payment: Response received but not successful" -ForegroundColor Yellow
        Write-Host "   Response: $($gcashResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ GCash Payment Failed: $($_.Exception.Message)" -ForegroundColor Red
    # Try to get more details from the response
    if ($_.Exception.Response) {
        try {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorContent = $reader.ReadToEnd()
            Write-Host "   Error Details: $errorContent" -ForegroundColor Gray
        } catch {
            Write-Host "   Could not read error details" -ForegroundColor Gray
        }
    }
}

# Test 3: PayMaya Payment (using specific endpoint)
Write-Host "`n💰 3. Testing PayMaya Payment..." -ForegroundColor Yellow
$paymayaPayload = @{
    bookingId = "test-booking-paymaya-$(Get-Date -Format 'yyyyMMddHHmmss')"
    amount = 2500
    paymentType = "downpayment"
} | ConvertTo-Json

try {
    $paymayaResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/paymaya/create" -Method POST -ContentType "application/json" -Body $paymayaPayload -TimeoutSec 15
    if ($paymayaResponse.success) {
        Write-Host "✅ PayMaya Payment: SUCCESS" -ForegroundColor Green
        Write-Host "   Payment ID: $($paymayaResponse.paymentId)" -ForegroundColor Cyan
        Write-Host "   Source ID: $($paymayaResponse.sourceId)" -ForegroundColor Cyan
        Write-Host "   Checkout URL: $($paymayaResponse.checkoutUrl)" -ForegroundColor Cyan
        $results.PayMaya = $true
    } else {
        Write-Host "⚠️ PayMaya Payment: Response received but not successful" -ForegroundColor Yellow
        Write-Host "   Response: $($paymayaResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ PayMaya Payment Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: GrabPay Payment (using specific endpoint)
Write-Host "`n🚗 4. Testing GrabPay Payment..." -ForegroundColor Yellow
$grabpayPayload = @{
    bookingId = "test-booking-grabpay-$(Get-Date -Format 'yyyyMMddHHmmss')"
    amount = 4000
    paymentType = "downpayment"
} | ConvertTo-Json

try {
    $grabpayResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/grabpay/create" -Method POST -ContentType "application/json" -Body $grabpayPayload -TimeoutSec 15
    if ($grabpayResponse.success) {
        Write-Host "✅ GrabPay Payment: SUCCESS" -ForegroundColor Green
        Write-Host "   Payment ID: $($grabpayResponse.paymentId)" -ForegroundColor Cyan
        Write-Host "   Source ID: $($grabpayResponse.sourceId)" -ForegroundColor Cyan
        Write-Host "   Checkout URL: $($grabpayResponse.checkoutUrl)" -ForegroundColor Cyan
        $results.GrabPay = $true
    } else {
        Write-Host "⚠️ GrabPay Payment: Response received but not successful" -ForegroundColor Yellow
        Write-Host "   Response: $($grabpayResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ GrabPay Payment Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Bank Transfer Payment
Write-Host "`n🏦 5. Testing Bank Transfer Payment..." -ForegroundColor Yellow
$bankTransferPayload = @{
    bookingId = "test-booking-bank-$(Get-Date -Format 'yyyyMMddHHmmss')"
    amount = 10000
    paymentType = "full_payment"
} | ConvertTo-Json

try {
    $bankTransferResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/bank-transfer/create" -Method POST -ContentType "application/json" -Body $bankTransferPayload -TimeoutSec 15
    if ($bankTransferResponse.success) {
        Write-Host "✅ Bank Transfer Payment: SUCCESS" -ForegroundColor Green
        Write-Host "   Payment ID: $($bankTransferResponse.paymentId)" -ForegroundColor Cyan
        if ($bankTransferResponse.transferInstructions) {
            Write-Host "   Bank: $($bankTransferResponse.transferInstructions.bankName)" -ForegroundColor Cyan
            Write-Host "   Account: $($bankTransferResponse.transferInstructions.accountNumber)" -ForegroundColor Cyan
            Write-Host "   Reference: $($bankTransferResponse.transferInstructions.referenceNumber)" -ForegroundColor Cyan
            Write-Host "   Amount: ₱$($bankTransferResponse.transferInstructions.amount)" -ForegroundColor Cyan
        }
        $results.BankTransfer = $true
    } else {
        Write-Host "⚠️ Bank Transfer Payment: Response received but not successful" -ForegroundColor Yellow
        Write-Host "   Response: $($bankTransferResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Bank Transfer Payment Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary Report
Write-Host "`n📊 PAYMENT METHODS TEST SUMMARY" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Magenta

$successCount = ($results.Values | Where-Object { $_ -eq $true }).Count
$totalMethods = $results.Count

$results.GetEnumerator() | ForEach-Object {
    $status = if ($_.Value) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($_.Value) { "Green" } else { "Red" }
    Write-Host "$status $($_.Key)" -ForegroundColor $color
}

Write-Host "`n🎯 Overall Result: $successCount/$totalMethods methods working" -ForegroundColor $(if ($successCount -eq $totalMethods) { "Green" } else { "Yellow" })

if ($successCount -eq $totalMethods) {
    Write-Host "🎉 All payment methods are working correctly!" -ForegroundColor Green
} elseif ($successCount -gt 0) {
    Write-Host "⚠️ Some payment methods need attention." -ForegroundColor Yellow
} else {
    Write-Host "❌ All payment methods failed. Check backend configuration." -ForegroundColor Red
}

Write-Host "`nTest completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
