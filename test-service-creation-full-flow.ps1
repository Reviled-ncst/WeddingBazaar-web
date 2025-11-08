# Test Service Creation - Full Flow
# ====================================

Write-Host "🧪 Testing Service Creation Flow - Full End-to-End" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login as vendor
Write-Host "📝 Step 1: Logging in as vendor..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body (@{
    email = "vendor0qw@gmail.com"
    password = "test123"
  } | ConvertTo-Json)

if ($loginResponse.token) {
  Write-Host "✅ Login successful!" -ForegroundColor Green
  Write-Host "   User ID: $($loginResponse.user.id)" -ForegroundColor Gray
  Write-Host "   User Type: $($loginResponse.user.user_type)" -ForegroundColor Gray
  Write-Host ""
  
  $token = $loginResponse.token
  $userId = $loginResponse.user.id
  
  # Step 2: Get vendor profile
  Write-Host "📝 Step 2: Getting vendor profile..." -ForegroundColor Yellow
  $vendorResponse = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/vendors/by-user/$userId" `
    -Method GET `
    -Headers @{
      "Authorization" = "Bearer $token"
    }
  
  if ($vendorResponse.id) {
    Write-Host "✅ Vendor profile found!" -ForegroundColor Green
    Write-Host "   Vendor ID: $($vendorResponse.id)" -ForegroundColor Gray
    Write-Host "   Business Name: $($vendorResponse.business_name)" -ForegroundColor Gray
    Write-Host ""
    
    $vendorId = $vendorResponse.id
    
    # Step 3: Create test service with package
    Write-Host "📝 Step 3: Creating test service with package..." -ForegroundColor Yellow
    
    $serviceData = @{
      vendor_id = $vendorId
      service_name = "Ultimate Wedding Photo Package - Test $(Get-Date -Format 'HHmmss')"
      service_type = "Photography"
      subcategory = "Wedding Photography"
      description = "Complete wedding photography coverage with advanced editing and premium prints"
      location = "Metro Manila"
      base_price = 50000
      price_type = "package"
      packages = @(
        @{
          id = "pkg-basic-$(Get-Random)"
          name = "Basic Coverage"
          description = "6 hours coverage, 200 edited photos, online gallery"
          price = 35000
          duration_hours = 6
          inclusions = @("6 hours coverage", "1 photographer", "200 edited photos", "Online gallery access")
          is_popular = $false
        },
        @{
          id = "pkg-premium-$(Get-Random)"
          name = "Premium Package"
          description = "10 hours coverage, 400 edited photos, prints, album"
          price = 50000
          duration_hours = 10
          inclusions = @("10 hours coverage", "2 photographers", "400 edited photos", "20x20 album", "50 premium prints")
          is_popular = $true
        },
        @{
          id = "pkg-deluxe-$(Get-Random)"
          name = "Deluxe All-Inclusive"
          description = "Full day coverage, unlimited photos, premium deliverables"
          price = 75000
          duration_hours = 12
          inclusions = @("12 hours coverage", "2 photographers + videographer", "Unlimited edited photos", "30x30 album", "100 premium prints", "Same-day edit video")
          is_popular = $false
        }
      )
      itemization_enabled = $true
      image_url = "https://images.unsplash.com/photo-1519741497674-611481863552"
      images = @(
        "https://images.unsplash.com/photo-1519741497674-611481863552",
        "https://images.unsplash.com/photo-1606800052052-a08af7148866",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc"
      )
      is_active = $true
    }
    
    try {
      $serviceResponse = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/services" `
        -Method POST `
        -ContentType "application/json" `
        -Headers @{
          "Authorization" = "Bearer $token"
        } `
        -Body ($serviceData | ConvertTo-Json -Depth 10)
      
      Write-Host "✅ Service created successfully!" -ForegroundColor Green
      Write-Host "   Service ID: $($serviceResponse.id)" -ForegroundColor Gray
      Write-Host "   Service Name: $($serviceResponse.service_name)" -ForegroundColor Gray
      Write-Host "   Service Type: $($serviceResponse.service_type)" -ForegroundColor Gray
      Write-Host "   Base Price: ₱$($serviceResponse.base_price)" -ForegroundColor Gray
      Write-Host "   Packages: $($serviceResponse.packages.Count)" -ForegroundColor Gray
      Write-Host ""
      
      # Step 4: Verify service in database
      Write-Host "📝 Step 4: Verifying service in database..." -ForegroundColor Yellow
      $verifyResponse = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/services/$($serviceResponse.id)" `
        -Method GET
      
      Write-Host "✅ Service verified in database!" -ForegroundColor Green
      Write-Host "   ID matches: $(if ($verifyResponse.id -eq $serviceResponse.id) {'YES'} else {'NO'})" -ForegroundColor Gray
      Write-Host "   Vendor ID matches: $(if ($verifyResponse.vendor_id -eq $vendorId) {'YES'} else {'NO'})" -ForegroundColor Gray
      Write-Host "   Has packages: $(if ($verifyResponse.packages) {'YES'} else {'NO'})" -ForegroundColor Gray
      Write-Host ""
      
      Write-Host "🎉 FULL FLOW TEST PASSED!" -ForegroundColor Green -BackgroundColor DarkGreen
      
    } catch {
      Write-Host "❌ Service creation failed!" -ForegroundColor Red
      Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
      Write-Host "   Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
  } else {
    Write-Host "❌ Vendor profile not found!" -ForegroundColor Red
  }
  
} else {
  Write-Host "❌ Login failed!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test complete." -ForegroundColor Cyan
