#!/usr/bin/env pwsh

Write-Host "`n🎉 PAYMENT SYSTEM INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

$testResults = @{
    BackendHealth = $false
    PaymentHealth = $false
    PayMongoConfigured = $false
    BookingsAPI = $false
    DatabaseConnected = $false
}

# Test 1: Backend Health
Write-Host "🔍 Test 1: Backend Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health" -TimeoutSec 10
    if ($health.status -eq "healthy") {
        Write-Host "   ✅ Backend is healthy" -ForegroundColor Green
        Write-Host "   📊 Version: $($health.version)" -ForegroundColor Gray
        Write-Host "   💾 Database: $($health.database)" -ForegroundColor Gray
        $testResults.BackendHealth = $true
        $testResults.DatabaseConnected = ($health.database -eq "Connected")
    }
} catch {
    Write-Host "   ❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 2: Payment System Health
Write-Host "`n🔍 Test 2: Payment System Health..." -ForegroundColor Yellow
try {
    $paymentHealth = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/payments/health" -TimeoutSec 10
    if ($paymentHealth.status -eq "healthy") {
        Write-Host "   ✅ Payment system is healthy" -ForegroundColor Green
        Write-Host "   💳 PayMongo configured: $($paymentHealth.paymongo_configured)" -ForegroundColor Gray
        Write-Host "   🧪 Test mode: $($paymentHealth.test_mode)" -ForegroundColor Gray
        Write-Host "   📡 Available endpoints:" -ForegroundColor Gray
        foreach ($endpoint in $paymentHealth.endpoints) {
            Write-Host "      • $endpoint" -ForegroundColor DarkGray
        }
        $testResults.PaymentHealth = $true
        $testResults.PayMongoConfigured = $paymentHealth.paymongo_configured
    }
} catch {
    Write-Host "   ❌ Payment health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 3: Bookings API
Write-Host "`n🔍 Test 3: Bookings API..." -ForegroundColor Yellow
try {
    $bookings = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/bookings/enhanced?coupleId=1-2025-001&page=1&limit=5" -TimeoutSec 10
    if ($bookings.success) {
        Write-Host "   ✅ Bookings API is working" -ForegroundColor Green
        Write-Host "   📊 Found $($bookings.count) bookings" -ForegroundColor Gray
        $testResults.BookingsAPI = $true
        
        if ($bookings.count -gt 0) {
            Write-Host "   📋 Sample booking:" -ForegroundColor Gray
            $booking = $bookings.bookings[0]
            Write-Host "      • ID: $($booking.id)" -ForegroundColor DarkGray
            Write-Host "      • Status: $($booking.status)" -ForegroundColor DarkGray
            Write-Host "      • Service: $($booking.service_name)" -ForegroundColor DarkGray
            Write-Host "      • Amount: ₱$($booking.total_amount)" -ForegroundColor DarkGray
        }
    }
} catch {
    Write-Host "   ❌ Bookings API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 4: Frontend Accessibility
Write-Host "`n🔍 Test 4: Frontend Accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://weddingbazaar-web.web.app" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend is accessible" -ForegroundColor Green
        Write-Host "   🌐 URL: https://weddingbazaar-web.web.app" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Frontend check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "📊 TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

$passed = 0
$total = $testResults.Count

foreach ($test in $testResults.GetEnumerator()) {
    $icon = if ($test.Value) { "✅" } else { "❌" }
    $color = if ($test.Value) { "Green" } else { "Red" }
    Write-Host "   $icon $($test.Key): $($test.Value)" -ForegroundColor $color
    if ($test.Value) { $passed++ }
}

Write-Host "`n📈 Score: $passed/$total tests passed" -ForegroundColor Cyan

# Overall Status
Write-Host "`n======================================" -ForegroundColor Cyan
if ($testResults.PayMongoConfigured -and $testResults.PaymentHealth -and $testResults.BackendHealth) {
    Write-Host "🎉 PAYMENT SYSTEM IS FULLY OPERATIONAL!" -ForegroundColor Green
    Write-Host "======================================`n" -ForegroundColor Cyan
    
    Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Visit: https://weddingbazaar-web.web.app/individual/bookings" -ForegroundColor White
    Write-Host "   2. Click 'Pay Deposit' on a booking" -ForegroundColor White
    Write-Host "   3. Use test card: 4343 4343 4343 4343" -ForegroundColor White
    Write-Host "   4. Expiry: 12/25, CVC: 123" -ForegroundColor White
    Write-Host "   5. Process payment and verify receipt!`n" -ForegroundColor White
    
    Write-Host "📋 Test Card Numbers:" -ForegroundColor Cyan
    Write-Host "   ✅ Success: 4343 4343 4343 4343" -ForegroundColor Green
    Write-Host "   ❌ Decline: 4571 7360 0000 0008" -ForegroundColor Red
    Write-Host "   ⏱️  Timeout: 4000 0000 0000 0069`n" -ForegroundColor Yellow
    
} else {
    Write-Host "⚠️  PAYMENT SYSTEM NEEDS ATTENTION" -ForegroundColor Yellow
    Write-Host "======================================`n" -ForegroundColor Cyan
    
    if (-not $testResults.BackendHealth) {
        Write-Host "   ⚠️  Backend health check failed" -ForegroundColor Red
    }
    if (-not $testResults.PaymentHealth) {
        Write-Host "   ⚠️  Payment endpoint not responding" -ForegroundColor Red
    }
    if (-not $testResults.PayMongoConfigured) {
        Write-Host "   ⚠️  PayMongo keys not configured" -ForegroundColor Red
        Write-Host "   📝 Action: Add keys to Render environment variables" -ForegroundColor Yellow
    }
}

Write-Host "`n📄 For detailed information, see: PAYMENT_SUCCESS.md`n" -ForegroundColor Cyan
