# Test booking request directly to backend
$body = @{
    coupleId = "test-couple-001"
    vendorId = "670f36ff-f5df-4b61-9aa3-bc9b1f45bbb0"
    serviceId = "test-service-001"
    serviceName = "Test Photography Service"
    serviceType = "Photography"
    eventDate = "2025-12-15"
    eventTime = "14:00"
    eventLocation = "Manila, Philippines"
    guestCount = 100
    budgetRange = "50000-100000"
    specialRequests = "Test booking from PowerShell script"
    contactPerson = "Test User"
    contactPhone = "+63 912 345 6789"
    contactEmail = "renzrusselbauto@gmail.com"
    coupleName = "Test Couple"
    vendorName = "Test Vendor"
} | ConvertTo-Json

Write-Host "Sending test booking request..." -ForegroundColor Yellow
Write-Host "URL: https://weddingbazaar-web.onrender.com/api/bookings/request" -ForegroundColor Gray
Write-Host "Body:" -ForegroundColor Gray
Write-Host $body -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/bookings/request" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -UseBasicParsing
    
    Write-Host "✅ Success! Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    Write-Host $response.Content -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
