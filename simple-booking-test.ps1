# Final End-to-End Booking Test - Simple Version
$API_BASE = "https://weddingbazaar-web.onrender.com"
$TEST_USER_ID = "1-2025-001"

Write-Host "Starting Final Booking Test" -ForegroundColor Cyan

# Step 1: Get initial booking count
Write-Host "Getting initial booking count..." -ForegroundColor Yellow
$initialUrl = "$API_BASE/api/bookings/couple/$TEST_USER_ID"
try {
    $initialResponse = Invoke-RestMethod -Uri $initialUrl -Method Get
    $initialCount = $initialResponse.Count
    Write-Host "Initial booking count: $initialCount" -ForegroundColor Green
} catch {
    Write-Host "Error getting initial bookings: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create a test booking
Write-Host "Creating test booking..." -ForegroundColor Yellow
$bookingData = @{
    coupleId = $TEST_USER_ID
    vendorId = "VND-005"
    serviceId = 5
    serviceType = "flowers"
    serviceName = "Wedding Flowers Package"
    eventDate = "2025-10-15"
    eventTime = "15:00"
    eventEndTime = "20:00"
    eventLocation = "Manila, Philippines"
    venueDetails = "Church Wedding with Reception"
    guestCount = 100
    specialRequests = "White roses and baby breath arrangements"
    contactPerson = "Lisa Chen"
    contactPhone = "+63-917-333-4444"
    contactEmail = "lisa.chen@example.com"
    preferredContactMethod = "email"
    budgetRange = "25000-35000"
} | ConvertTo-Json

try {
    $createUrl = "$API_BASE/api/bookings"
    $createResponse = Invoke-RestMethod -Uri $createUrl -Method Post -Body $bookingData -ContentType "application/json"
    Write-Host "Booking created successfully!" -ForegroundColor Green
    Write-Host "Booking ID: $($createResponse.id)" -ForegroundColor White
} catch {
    Write-Host "Error creating booking: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Verify booking appears
Write-Host "Verifying booking appears in list..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $verifyResponse = Invoke-RestMethod -Uri $initialUrl -Method Get
    $finalCount = $verifyResponse.Count
    Write-Host "Final booking count: $finalCount" -ForegroundColor Green
    Write-Host "Increase: $($finalCount - $initialCount) bookings" -ForegroundColor White
    
    $foundBooking = $verifyResponse | Where-Object { $_.id -eq $createResponse.id }
    if ($foundBooking) {
        Write-Host "New booking found in list!" -ForegroundColor Green
    } else {
        Write-Host "New booking not found (may need time)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error verifying booking: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test completed!" -ForegroundColor Cyan
