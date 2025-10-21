# Test Enhanced Endpoint After Deployment
# Wait 2-5 minutes after push, then run this test

Write-Host "🧪 Testing Enhanced Endpoint Quote Fields..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health Check
Write-Host "1️⃣ Testing backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method Get
    Write-Host "✅ Backend is responding" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend health check failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Test 2: Enhanced Endpoint - Couple Bookings
Write-Host "2️⃣ Testing enhanced endpoint for couple..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/bookings/enhanced?coupleId=101" -Method Get
    
    Write-Host "✅ Enhanced endpoint responding" -ForegroundColor Green
    Write-Host "   Bookings found: $($response.bookings.Count)" -ForegroundColor Gray
    
    # Check if quote fields are present
    $hasQuoteFields = $false
    foreach ($booking in $response.bookings) {
        if ($null -ne $booking.quoted_price) {
            Write-Host ""
            Write-Host "✅ QUOTE FIELDS FOUND!" -ForegroundColor Green
            Write-Host "   Booking ID: $($booking.id)" -ForegroundColor Gray
            Write-Host "   Service: $($booking.service_name)" -ForegroundColor Gray
            Write-Host "   Status: $($booking.status)" -ForegroundColor Gray
            Write-Host "   💰 Quoted Price: ₱$($booking.quoted_price)" -ForegroundColor Green
            Write-Host "   💳 Quoted Deposit: ₱$($booking.quoted_deposit)" -ForegroundColor Green
            Write-Host "   📝 Has Itemization: $($null -ne $booking.quote_itemization)" -ForegroundColor Gray
            $hasQuoteFields = $true
        }
    }
    
    if (-not $hasQuoteFields) {
        Write-Host ""
        Write-Host "⚠️ No bookings with quote fields found" -ForegroundColor Yellow
        Write-Host "   This might be expected if no quotes have been sent yet" -ForegroundColor Gray
        
        # Show first booking structure
        if ($response.bookings.Count -gt 0) {
            Write-Host ""
            Write-Host "📋 First booking structure:" -ForegroundColor Gray
            $firstBooking = $response.bookings[0]
            Write-Host "   ID: $($firstBooking.id)" -ForegroundColor Gray
            Write-Host "   Status: $($firstBooking.status)" -ForegroundColor Gray
            Write-Host "   quoted_price: $($firstBooking.quoted_price)" -ForegroundColor $(if ($null -eq $firstBooking.quoted_price) { "Red" } else { "Green" })
            Write-Host "   amount: $($firstBooking.amount)" -ForegroundColor $(if ($null -eq $firstBooking.amount) { "Red" } else { "Green" })
            Write-Host "   total_amount: $($firstBooking.total_amount)" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "❌ Enhanced endpoint test failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎯 DEPLOYMENT TEST SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Backend is live and responding" -ForegroundColor Green
Write-Host "✅ Enhanced endpoint is accessible" -ForegroundColor Green

if ($hasQuoteFields) {
    Write-Host "✅ Quote fields are being returned!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Open frontend: https://weddingbazaar-web.web.app" -ForegroundColor Gray
    Write-Host "2. Do a HARD REFRESH: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)" -ForegroundColor Gray
    Write-Host "3. Navigate to Individual Bookings page" -ForegroundColor Gray
    Write-Host "4. Check if Flower booking shows ₱89,603.36" -ForegroundColor Gray
    Write-Host "5. Open console (F12) and look for '[AMOUNT PRIORITY]' logs" -ForegroundColor Gray
} else {
    Write-Host "⚠️ Quote fields structure may need verification" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Gray
    Write-Host "1. No bookings with quotes exist yet" -ForegroundColor Gray
    Write-Host "2. Backend deployment may not be complete yet (wait 2-3 more minutes)" -ForegroundColor Gray
    Write-Host "3. Database columns may need to be checked" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Try running this script again in 2-3 minutes" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
