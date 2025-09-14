# Test vendor registration with proper vendor profile fields

$testVendor = @{
    email = "newvendor@test.com"
    password = "securepassword123"
    firstName = "Premium"
    lastName = "Vendor"
    role = "vendor"
    phone = "555-999-0000"
    business_name = "Premium Wedding Solutions"
    business_type = "Photography"
    business_description = "High-end wedding photography and videography services"
    years_in_business = 8
    website_url = "https://premiumweddingsolutions.com"
    location = "Beverly Hills, CA"
    specialties = @("Luxury Weddings", "Destination Photography", "Custom Albums")
    service_areas = @("Los Angeles", "Orange County", "San Diego")
}

$body = $testVendor | ConvertTo-Json -Depth 10

try {
    Write-Host "🧪 Testing vendor registration..." -ForegroundColor Yellow
    Write-Host "Data being sent:" -ForegroundColor Cyan
    Write-Host $body -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/auth/register" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "✅ Registration successful!" -ForegroundColor Green
    Write-Host "Status Code:" $response.StatusCode -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "❌ Registration failed!" -ForegroundColor Red
    Write-Host "Error:" $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Response:" $errorBody -ForegroundColor Red
    }
}
