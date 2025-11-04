# Test Cancel Booking in Production
# This script tests the cancel booking endpoint with detailed logging

Write-Host "🧪 Testing Cancel Booking in Production" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$apiUrl = "https://weddingbazaar-web.onrender.com"
$bookingId = "Read from user input"
$userId = "Read from user input"

Write-Host "📋 INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Open your browser to: https://weddingbazaarph.web.app/individual/bookings" -ForegroundColor White
Write-Host "2. Open Developer Tools (F12)" -ForegroundColor White
Write-Host "3. Go to Console tab" -ForegroundColor White
Write-Host "4. Type: localStorage.getItem('userId')" -ForegroundColor White
Write-Host "5. Copy the userId value (the number without quotes)" -ForegroundColor White
Write-Host ""

$userId = Read-Host "Enter your userId from localStorage"
Write-Host ""

Write-Host "6. Now look at your bookings list" -ForegroundColor White
Write-Host "7. Find a booking with status 'Awaiting Quote' or 'Request'" -ForegroundColor White
Write-Host "8. Copy the booking ID from the browser console when you click cancel" -ForegroundColor White
Write-Host "   OR use the Network tab to see the booking ID in the API request" -ForegroundColor White
Write-Host ""

$bookingId = Read-Host "Enter the booking ID to cancel"
Write-Host ""

# Prepare request
$body = @{
    userId = $userId
    reason = "Testing cancellation from PowerShell script"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "📤 Sending cancellation request..." -ForegroundColor Cyan
Write-Host "   URL: $apiUrl/api/bookings/$bookingId/cancel" -ForegroundColor Gray
Write-Host "   User ID: $userId" -ForegroundColor Gray
Write-Host "   Booking ID: $bookingId" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/api/bookings/$bookingId/cancel" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
} catch {
    Write-Host "❌ ERROR!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host ""
    
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
        Write-Host "Error Response:" -ForegroundColor Yellow
        $errorBody | ConvertTo-Json -Depth 10 | Write-Host
    } catch {
        Write-Host "Could not parse error response" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔍 TROUBLESHOOTING:" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you got a 403 error, check:" -ForegroundColor White
Write-Host "1. The userId matches what's in localStorage" -ForegroundColor White
Write-Host "2. The booking actually belongs to this user" -ForegroundColor White
Write-Host "3. Check Render logs at: https://dashboard.render.com" -ForegroundColor White
Write-Host "4. Look for [CANCEL-BOOKING] logs to see the comparison" -ForegroundColor White
Write-Host ""
Write-Host "If deployment hasn't completed:" -ForegroundColor White
Write-Host "1. Go to https://dashboard.render.com" -ForegroundColor White
Write-Host "2. Find 'weddingbazaar-web' service" -ForegroundColor White
Write-Host "3. Click 'Manual Deploy' > 'Deploy latest commit'" -ForegroundColor White
Write-Host "4. Wait 2-3 minutes and try again" -ForegroundColor White
