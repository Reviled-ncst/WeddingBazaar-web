# PowerShell script to test RegisterModal integration
Write-Host "🧪 Testing RegisterModal Integration..." -ForegroundColor Cyan
Write-Host ""

# Generate unique emails
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

# Test data for couple registration
$coupleData = @{
    firstName = "Test"
    lastName = "Couple" 
    email = "testcouple$timestamp@example.com"
    phone = "+1234567890"
    password = "password123"
    role = "couple"
    receiveUpdates = $true
} | ConvertTo-Json

# Test data for vendor registration  
$vendorData = @{
    firstName = "Test"
    lastName = "Vendor"
    email = "testvendor$timestamp@example.com"
    phone = "+1234567891"
    password = "password123"
    role = "vendor"
    business_name = "Test Photography Studio"
    business_type = "Photography"
    location = "New York, NY"
    receiveUpdates = $false
} | ConvertTo-Json

try {
    # Test couple registration
    Write-Host "1️⃣ Testing Couple Registration..." -ForegroundColor Yellow
    Write-Host "📝 Sending data:" -ForegroundColor Gray
    Write-Host $coupleData -ForegroundColor Gray
    Write-Host ""
    
    $coupleResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $coupleData -ContentType "application/json"
    $coupleResult = $coupleResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Couple Response Status: $($coupleResponse.StatusCode)" -ForegroundColor Green
    Write-Host "✅ Couple Response Data:" -ForegroundColor Green
    Write-Host ($coupleResult | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    
    if ($coupleResponse.StatusCode -eq 201 -and $coupleResult.success) {
        Write-Host "🎉 Couple registration successful! User saved to database." -ForegroundColor Green
    } else {
        Write-Host "❌ Couple registration failed." -ForegroundColor Red
    }
    Write-Host ""
    
    # Test vendor registration
    Write-Host "2️⃣ Testing Vendor Registration..." -ForegroundColor Yellow
    Write-Host "📝 Sending data:" -ForegroundColor Gray
    Write-Host $vendorData -ForegroundColor Gray
    Write-Host ""
    
    $vendorResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $vendorData -ContentType "application/json"
    $vendorResult = $vendorResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Vendor Response Status: $($vendorResponse.StatusCode)" -ForegroundColor Green
    Write-Host "✅ Vendor Response Data:" -ForegroundColor Green
    Write-Host ($vendorResult | ConvertTo-Json -Depth 3) -ForegroundColor Gray
    
    if ($vendorResponse.StatusCode -eq 201 -and $vendorResult.success) {
        Write-Host "🎉 Vendor registration successful! User and vendor profile saved to database." -ForegroundColor Green
    } else {
        Write-Host "❌ Vendor registration failed." -ForegroundColor Red
    }
    Write-Host ""
    
    Write-Host "🏁 RegisterModal Integration Test Complete!" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Test Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Make sure the backend server is running on localhost:3001" -ForegroundColor Yellow
}
}
