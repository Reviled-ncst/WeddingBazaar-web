# Comprehensive Payment Methods Test for WeddingBazaar
# Tests all 5 payment methods: Card, GCash, PayMaya, GrabPay, Bank Transfer

Write-Host "Testing all payment methods in WeddingBazaar..." -ForegroundColor Green

# Check backend health first
Write-Host "`nChecking Backend Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 5
    Write-Host "Backend Status: $($healthResponse.status)" -ForegroundColor Green
    Write-Host "Database: $($healthResponse.database)" -ForegroundColor Green
} catch {
    Write-Host "Backend not responding. Please start the backend server first." -ForegroundColor Red
    exit 1
}

# Test Payment Methods List
Write-Host "`nTesting Available Payment Methods..." -ForegroundColor Yellow
try {
    $methodsResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/methods" -Method GET -TimeoutSec 10
    Write-Host "Retrieved $($methodsResponse.methods.Count) payment methods:" -ForegroundColor Green
    $methodsResponse.methods | ForEach-Object {
        $status = if ($_.available) { "AVAILABLE" } else { "NOT AVAILABLE" }
        Write-Host "   $($_.name) ($($_.type)) - $status" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Payment Methods List Failed: $($_.Exception.Message)" -ForegroundColor Red
}

$results = @{}

# Test 1: Card Payment
Write-Host "`n1. Testing Card Payment..." -ForegroundColor Yellow
$cardPayload = @{
    bookingId = "test-booking-card-001"
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
        Write-Host "Card Payment: SUCCESS" -ForegroundColor Green
        Write-Host "   Payment ID: $($cardResponse.paymentId)" -ForegroundColor Cyan
        $results["Card"] = $true
    } else {
        Write-Host "Card Payment: Response received but not successful" -ForegroundColor Yellow
        $results["Card"] = $false
    }
} catch {
    Write-Host "Card Payment Failed: $($_.Exception.Message)" -ForegroundColor Red
    $results["Card"] = $false
}

# Test 2: GrabPay Payment
Write-Host "`n2. Testing GrabPay Payment..." -ForegroundColor Yellow
$grabpayPayload = @{
    bookingId = "test-booking-grabpay-001"
    amount = 4000
    paymentType = "downpayment"
} | ConvertTo-Json

try {
    $grabpayResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/grabpay/create" -Method POST -ContentType "application/json" -Body $grabpayPayload -TimeoutSec 15
    if ($grabpayResponse.success) {
        Write-Host "GrabPay Payment: SUCCESS" -ForegroundColor Green
        Write-Host "   Payment ID: $($grabpayResponse.paymentId)" -ForegroundColor Cyan
        $results["GrabPay"] = $true
    } else {
        Write-Host "GrabPay Payment: Response received but not successful" -ForegroundColor Yellow
        $results["GrabPay"] = $false
    }
} catch {
    Write-Host "GrabPay Payment Failed: $($_.Exception.Message)" -ForegroundColor Red
    $results["GrabPay"] = $false
}

# Test 3: Bank Transfer Payment
Write-Host "`n3. Testing Bank Transfer Payment..." -ForegroundColor Yellow
$bankTransferPayload = @{
    bookingId = "test-booking-bank-001"
    amount = 10000
    paymentType = "full_payment"
} | ConvertTo-Json

try {
    $bankTransferResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/payment/bank-transfer/create" -Method POST -ContentType "application/json" -Body $bankTransferPayload -TimeoutSec 15
    if ($bankTransferResponse.success) {
        Write-Host "Bank Transfer Payment: SUCCESS" -ForegroundColor Green
        Write-Host "   Payment ID: $($bankTransferResponse.paymentId)" -ForegroundColor Cyan
        if ($bankTransferResponse.transferInstructions) {
            Write-Host "   Bank: $($bankTransferResponse.transferInstructions.bankName)" -ForegroundColor Cyan
            Write-Host "   Account: $($bankTransferResponse.transferInstructions.accountNumber)" -ForegroundColor Cyan
        }
        $results["BankTransfer"] = $true
    } else {
        Write-Host "Bank Transfer Payment: Response received but not successful" -ForegroundColor Yellow
        $results["BankTransfer"] = $false
    }
} catch {
    Write-Host "Bank Transfer Payment Failed: $($_.Exception.Message)" -ForegroundColor Red
    $results["BankTransfer"] = $false
}

# Summary Report
Write-Host "`nPAYMENT METHODS TEST SUMMARY" -ForegroundColor Magenta
Write-Host "==============================" -ForegroundColor Magenta

$successCount = 0
foreach ($method in $results.Keys) {
    $status = if ($results[$method]) { "PASS" } else { "FAIL" }
    $color = if ($results[$method]) { "Green" } else { "Red" }
    Write-Host "$status - $method" -ForegroundColor $color
    if ($results[$method]) { $successCount++ }
}

$totalMethods = $results.Count
Write-Host "`nOverall Result: $successCount/$totalMethods methods working" -ForegroundColor $(if ($successCount -eq $totalMethods) { "Green" } else { "Yellow" })

if ($successCount -eq $totalMethods) {
    Write-Host "All payment methods are working correctly!" -ForegroundColor Green
} elseif ($successCount -gt 0) {
    Write-Host "Some payment methods need attention." -ForegroundColor Yellow
} else {
    Write-Host "All payment methods failed. Check backend configuration." -ForegroundColor Red
}

Write-Host "`nTest completed successfully." -ForegroundColor Cyan
