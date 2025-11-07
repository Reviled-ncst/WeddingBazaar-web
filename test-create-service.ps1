# Test service creation with exact frontend payload structure
# This script replicates what AddServiceForm sends to the backend

$apiUrl = "https://weddingbazaar-web.onrender.com"

# Exact payload structure from frontend AddServiceForm.tsx
$payload = @{
    vendor_id = "2-2025-003"
    
    # Basic info
    name = "Test Package Service with Unit Prices"
    title = "Test Package Service with Unit Prices"
    description = "Testing itemized package prices with unit_price field"
    category = "Photography"
    
    # Pricing
    pricing_type = "package"
    price = 50000
    max_price = 50000
    price_range = "PHP 50,000.00"
    
    # DSS Fields (new required fields)
    years_in_business = 5
    service_tier = "premium"
    wedding_styles = @("Classic", "Modern")
    cultural_specialties = @("Filipino")
    availability = @{
        monday = $true
        tuesday = $true
        wednesday = $true
        thursday = $true
        friday = $true
        saturday = $true
        sunday = $false
    } | ConvertTo-Json -Compress
    
    # Location
    location = "Manila, Philippines"
    location_data = @{
        address = "Manila"
        city = "Manila"
        state = "Metro Manila"
        country = "Philippines"
    } | ConvertTo-Json -Compress
    
    # Package items with unit_price (the critical field!)
    package_items = @(
        @{
            name = "Full Day Coverage"
            category = "service"
            item_type = "service"
            quantity = 1
            unit_price = 15000
            amount = 15000
            description = "8 hours of photo and video coverage"
        },
        @{
            name = "Premium Album"
            category = "product"
            item_type = "product"
            quantity = 2
            unit_price = 5000
            amount = 10000
            description = "30-page premium wedding album"
        },
        @{
            name = "Drone Photography"
            category = "addon"
            item_type = "addon"
            quantity = 1
            unit_price = 8000
            amount = 8000
            description = "Aerial shots with 4K drone"
        },
        @{
            name = "Same-Day Edit Video"
            category = "service"
            item_type = "service"
            quantity = 1
            unit_price = 12000
            amount = 12000
            description = "Highlight video for reception"
        },
        @{
            name = "USB with All Files"
            category = "product"
            item_type = "product"
            quantity = 1
            unit_price = 2500
            amount = 2500
            description = "All raw and edited files"
        },
        @{
            name = "Pre-Wedding Shoot"
            category = "addon"
            item_type = "addon"
            quantity = 1
            unit_price = 2500
            amount = 2500
            description = "1-hour photo session"
        }
    ) | ConvertTo-Json -Compress
    
    # Features
    features = @("Professional", "HD Quality", "Same-Day Edit") | ConvertTo-Json -Compress
    
    # Images (empty for test)
    images = @() | ConvertTo-Json -Compress
    
    # Status
    is_active = $true
    featured = $false
    
    # Contact info
    contact_info = @{
        phone = "+63 912 345 6789"
        email = "test@example.com"
    } | ConvertTo-Json -Compress
    
    # Tags
    tags = @("Photography", "Videography", "Premium") | ConvertTo-Json -Compress
    keywords = "photography videography wedding package premium"
}

Write-Host "Testing service creation with EXACT frontend payload structure..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Payload Preview:" -ForegroundColor Yellow
$payload | ConvertTo-Json -Depth 5 | Write-Host

Write-Host ""
Write-Host "Sending POST request to $apiUrl/api/services..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/api/services" `
        -Method POST `
        -ContentType "application/json" `
        -Body ($payload | ConvertTo-Json -Depth 5) `
        -ErrorAction Stop
    
    Write-Host ""
    Write-Host "SUCCESS! Service created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    Write-Host ""
    Write-Host "Service ID: $($response.service.id)" -ForegroundColor Green
    Write-Host "Service Name: $($response.service.name)" -ForegroundColor Green
    
    if ($response.service.package_items) {
        Write-Host ""
        Write-Host "Package Items:" -ForegroundColor Yellow
        $items = $response.service.package_items | ConvertFrom-Json
        foreach ($item in $items) {
            Write-Host "   - $($item.name): PHP $($item.unit_price) x $($item.quantity) = PHP $($item.amount)" -ForegroundColor White
        }
    }
    
} catch {
    Write-Host ""
    Write-Host "ERROR! Service creation failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Yellow
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
    # Try to read response body
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Yellow
        $responseBody | Write-Host
        
        # Try to parse as JSON
        try {
            $errorJson = $responseBody | ConvertFrom-Json
            Write-Host ""
            Write-Host "Parsed Error:" -ForegroundColor Yellow
            $errorJson | ConvertTo-Json -Depth 5 | Write-Host
            
            if ($errorJson.error) {
                Write-Host ""
                Write-Host "Error Message: $($errorJson.error)" -ForegroundColor Red
            }
            
            if ($errorJson.details) {
                Write-Host "Error Details: $($errorJson.details)" -ForegroundColor Red
            }
            
            if ($errorJson.code) {
                Write-Host "Error Code: $($errorJson.code)" -ForegroundColor Red
            }
            
            if ($errorJson.constraint) {
                Write-Host "Constraint Violated: $($errorJson.constraint)" -ForegroundColor Red
            }
        } catch {
            Write-Host "Could not parse error as JSON" -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "Could not read response body" -ForegroundColor DarkGray
    }
    
    Write-Host ""
    Write-Host "Full Exception:" -ForegroundColor DarkGray
    $_ | Format-List * | Write-Host
}

Write-Host ""
Write-Host "Test complete!" -ForegroundColor Cyan
