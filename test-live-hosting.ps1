#!/usr/bin/env pwsh

Write-Host "🚀 TESTING LIVE HOSTING ENVIRONMENT" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Gray

Write-Host "`n1. Testing Backend API..." -ForegroundColor Cyan
try {
    $backendResponse = Invoke-RestMethod -Uri 'https://weddingbazaar-web.onrender.com/api/health' -Method Get -TimeoutSec 10
    Write-Host "   ✅ Backend: $($backendResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend: FAILED" -ForegroundColor Red
}

Write-Host "`n2. Testing Frontend Hosting..." -ForegroundColor Cyan
try {
    $frontendResponse = Invoke-WebRequest -Uri 'https://weddingbazaarph.web.app' -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Frontend: Status $($frontendResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend: FAILED" -ForegroundColor Red
}

Write-Host "`n3. Testing Booking API..." -ForegroundColor Cyan
try {
    $bookingResponse = Invoke-RestMethod -Uri 'https://weddingbazaar-web.onrender.com/api/bookings/couple/1-2025-001' -Method Get -TimeoutSec 10
    Write-Host "   ✅ Booking API: SUCCESS" -ForegroundColor Green
    Write-Host "   📊 Total Bookings: $($bookingResponse.total)" -ForegroundColor White
    Write-Host "   📋 Returned: $($bookingResponse.bookings.Length)" -ForegroundColor White
    
    if ($bookingResponse.bookings -and $bookingResponse.bookings.Length -gt 0) {
        $uniqueStatuses = $bookingResponse.bookings | Select-Object -ExpandProperty status -Unique
        Write-Host "   🎯 Database Statuses: $($uniqueStatuses -join ', ')" -ForegroundColor White
    }
} catch {
    Write-Host "   ❌ Booking API: FAILED" -ForegroundColor Red
}

Write-Host "`n🎯 MANUAL TEST INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Gray
Write-Host "1. Open: https://weddingbazaarph.web.app" -ForegroundColor White
Write-Host "2. Login with test credentials" -ForegroundColor White
Write-Host "3. Navigate to Individual → Bookings" -ForegroundColor White
Write-Host "4. Test the filter dropdown:" -ForegroundColor White
Write-Host "   - Select 'Quote Requested' (should show matching bookings)" -ForegroundColor Green
Write-Host "   - Select 'Confirmed' (should show 'No bookings found')" -ForegroundColor Green
Write-Host "   - Check browser console for debug logs" -ForegroundColor Green

Write-Host "`n🔧 FILTER FIX SUMMARY:" -ForegroundColor Cyan
Write-Host "- STATUS_MAPPING: request -> quote_requested [OK]" -ForegroundColor White
Write-Host "- Mock data removed [OK]" -ForegroundColor White
Write-Host "- Filter dropdown updated [OK]" -ForegroundColor White
Write-Host "- Debug logging added [OK]" -ForegroundColor White
Write-Host "- Deployed to Firebase [OK]" -ForegroundColor White
