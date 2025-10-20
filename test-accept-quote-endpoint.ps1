# Test Accept Quote Endpoint
# This script tests the /api/bookings/:id/accept-quote endpoint

$bookingId = "1760918159"
$backendUrl = "https://weddingbazaar-web.onrender.com"

Write-Host "`n🔍 Testing Accept Quote Endpoint..." -ForegroundColor Cyan
Write-Host "Booking ID: $bookingId"
Write-Host "Backend URL: $backendUrl"

# Test PATCH method
Write-Host "`n📤 Testing PATCH /api/bookings/$bookingId/accept-quote..." -ForegroundColor Yellow

$body = @{
    acceptance_notes = "Test acceptance from PowerShell script"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$backendUrl/api/bookings/$bookingId/accept-quote" `
        -Method PATCH `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    Write-Host "✅ PATCH Request Successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
} catch {
    Write-Host "❌ PATCH Request Failed!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to read error response body
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Error Body:" -ForegroundColor Red
        Write-Host $errorBody
    } catch {
        Write-Host "Could not read error response body"
    }
}

Write-Host "`n✅ Test Complete" -ForegroundColor Cyan
