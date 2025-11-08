# Test Service Creation - Full Flow
# ====================================

Write-Host "Testing Service Creation Flow - Full End-to-End" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login as vendor
Write-Host "Step 1: Logging in as vendor..." -ForegroundColor Yellow
$loginBody = @{
  email = "vendor0qw@gmail.com"
  password = "test123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginBody

if ($loginResponse.token) {
  Write-Host "Login successful!" -ForegroundColor Green
  Write-Host "User ID: $($loginResponse.user.id)" -ForegroundColor Gray
  Write-Host "User Type: $($loginResponse.user.user_type)" -ForegroundColor Gray
  Write-Host ""
  
  $token = $loginResponse.token
  $userId = $loginResponse.user.id
  
  # Step 2: Get vendor profile
  Write-Host "Step 2: Getting vendor profile..." -ForegroundColor Yellow
  $vendorResponse = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/vendors/user/$userId" `
    -Method GET `
    -Headers @{
      "Authorization" = "Bearer $token"
    }
  
  if ($vendorResponse.id) {
    Write-Host "Vendor profile found!" -ForegroundColor Green
    Write-Host "Vendor ID: $($vendorResponse.id)" -ForegroundColor Gray
    Write-Host "Business Name: $($vendorResponse.business_name)" -ForegroundColor Gray
    Write-Host ""
    
    $vendorId = $vendorResponse.id
    
    # Step 3: Create test service with package
    Write-Host "Step 3: Creating test service with package..." -ForegroundColor Yellow
    
    $timestamp = Get-Date -Format "HHmmss"
    $randomNum = Get-Random
    
    $serviceData = @{
      vendor_id = $vendorId
      service_name = "Ultimate Wedding Photo Package - Test $timestamp"
      service_type = "Photography"
      subcategory = "Wedding Photography"
      description = "Complete wedding photography coverage with advanced editing and premium prints"
      location = "Metro Manila"
      base_price = 50000
      price_type = "package"
      packages = @(
        @{
          id = "pkg-basic-$randomNum"
          name = "Basic Coverage"
          description = "6 hours coverage, 200 edited photos, online gallery"
          price = 35000
          duration_hours = 6
          inclusions = @("6 hours coverage", "1 photographer", "200 edited photos", "Online gallery access")
          is_popular = $false
        },
        @{
          id = "pkg-premium-$randomNum"
          name = "Premium Package"
          description = "10 hours coverage, 400 edited photos, prints, album"
          price = 50000
          duration_hours = 10
          inclusions = @("10 hours coverage", "2 photographers", "400 edited photos", "20x20 album", "50 premium prints")
          is_popular = $true
        }
      )
      itemization_enabled = $true
      image_url = "https://images.unsplash.com/photo-1519741497674-611481863552"
      images = @(
        "https://images.unsplash.com/photo-1519741497674-611481863552",
        "https://images.unsplash.com/photo-1606800052052-a08af7148866"
      )
      is_active = $true
    }
    
    $serviceBody = $serviceData | ConvertTo-Json -Depth 10
    
    try {
      $serviceResponse = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/services" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{
          "Authorization" = "Bearer $token"
        } `
        -Body $serviceBody
      
      Write-Host "Service created successfully!" -ForegroundColor Green
      Write-Host "Service ID: $($serviceResponse.id)" -ForegroundColor Gray
      Write-Host "Service Name: $($serviceResponse.service_name)" -ForegroundColor Gray
      Write-Host "Service Type: $($serviceResponse.service_type)" -ForegroundColor Gray
      Write-Host "Base Price: $($serviceResponse.base_price)" -ForegroundColor Gray
      Write-Host "Packages Count: $($serviceResponse.packages.Count)" -ForegroundColor Gray
      Write-Host ""
      
      # Step 4: Verify service in database
      Write-Host "Step 4: Verifying service in database..." -ForegroundColor Yellow
      $verifyResponse = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/services/$($serviceResponse.id)" `
        -Method GET
      
      Write-Host "Service verified in database!" -ForegroundColor Green
      
      $idMatch = $verifyResponse.id -eq $serviceResponse.id
      $vendorMatch = $verifyResponse.vendor_id -eq $vendorId
      $hasPackages = $verifyResponse.packages -ne $null
      
      Write-Host "ID matches: $idMatch" -ForegroundColor $(if ($idMatch) {'Green'} else {'Red'})
      Write-Host "Vendor ID matches: $vendorMatch" -ForegroundColor $(if ($vendorMatch) {'Green'} else {'Red'})
      Write-Host "Has packages: $hasPackages" -ForegroundColor $(if ($hasPackages) {'Green'} else {'Red'})
      Write-Host ""
      
      Write-Host "FULL FLOW TEST PASSED!" -ForegroundColor Green -BackgroundColor DarkGreen
      
    } catch {
      Write-Host "Service creation failed!" -ForegroundColor Red
      Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
      if ($_.ErrorDetails.Message) {
        Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
      }
    }
    
  } else {
    Write-Host "Vendor profile not found!" -ForegroundColor Red
  }
  
} else {
  Write-Host "Login failed!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete." -ForegroundColor Cyan
