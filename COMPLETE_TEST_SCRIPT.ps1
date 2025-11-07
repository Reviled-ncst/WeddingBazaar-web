# ✅ COMPLETE TEST SCRIPT - All 4 Data Loss Issues
# Date: November 8, 2025
# Tests: Pricing, Itemization, DSS Fields, Location Data

Write-Host "`n🧪 COMPLETE DATA LOSS FIX TEST SCRIPT" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Configuration
$vendorId = "2-2025-003"  # Replace with your actual vendor ID
$baseUrl = "https://weddingbazaar-web.onrender.com"
$frontendUrl = "https://weddingbazaarph.web.app"

Write-Host "`n📋 Test Configuration:" -ForegroundColor Yellow
Write-Host "   Vendor ID: $vendorId"
Write-Host "   Backend: $baseUrl"
Write-Host "   Frontend: $frontendUrl"
Write-Host ""

# Test 1: Backend Health Check
Write-Host "`n🏥 TEST 1: Backend Health Check" -ForegroundColor Cyan
Write-Host "-" * 60
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "✅ Backend is LIVE" -ForegroundColor Green
    Write-Host "   Status: $($health.status)"
    Write-Host "   Timestamp: $($health.timestamp)"
} catch {
    Write-Host "❌ Backend is DOWN or deploying" -ForegroundColor Red
    Write-Host "   Wait 5-10 minutes if recently deployed"
    exit
}

# Test 2: Get Vendor Services
Write-Host "`n📦 TEST 2: Get Vendor Services (With Itemization)" -ForegroundColor Cyan
Write-Host "-" * 60
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/services/vendor/$vendorId" -Method GET
    $serviceCount = $response.services.Count
    
    Write-Host "✅ Found $serviceCount services" -ForegroundColor Green
    
    if ($serviceCount -eq 0) {
        Write-Host "⚠️  No services found. Create a service first!" -ForegroundColor Yellow
        Write-Host "   Go to: $frontendUrl/vendor/services"
        exit
    }
    
    # Test first service
    $service = $response.services[0]
    
    Write-Host "`n📊 Testing Service: $($service.title)" -ForegroundColor White
    Write-Host "   ID: $($service.id)"
    Write-Host ""
    
    # Issue 1: Pricing Data
    Write-Host "💰 ISSUE 1: PRICING DATA" -ForegroundColor Magenta
    if ($service.price -ne $null) {
        Write-Host "   ✅ price: ₱$($service.price)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ price: NULL" -ForegroundColor Red
    }
    
    if ($service.max_price -ne $null) {
        Write-Host "   ✅ max_price: ₱$($service.max_price)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ max_price: NULL" -ForegroundColor Red
    }
    
    if ($service.price_range -ne $null) {
        Write-Host "   ✅ price_range: $($service.price_range)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ price_range: NULL" -ForegroundColor Red
    }
    
    # Issue 2: Itemization Data
    Write-Host "`n📦 ISSUE 2: ITEMIZATION DATA" -ForegroundColor Magenta
    if ($service.packages -ne $null) {
        $pkgCount = $service.packages.Count
        Write-Host "   ✅ packages: $pkgCount found" -ForegroundColor Green
        
        if ($pkgCount -gt 0) {
            foreach ($pkg in $service.packages) {
                Write-Host "      - $($pkg.package_name): ₱$($pkg.base_price)" -ForegroundColor White
                
                if ($service.package_items -ne $null) {
                    $items = $service.package_items[$pkg.id]
                    if ($items -ne $null) {
                        Write-Host "        Items: $($items.Count)" -ForegroundColor Gray
                    }
                }
            }
        }
    } else {
        Write-Host "   ❌ packages: NULL or undefined" -ForegroundColor Red
    }
    
    if ($service.has_itemization -ne $null) {
        Write-Host "   ✅ has_itemization: $($service.has_itemization)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  has_itemization: Not set" -ForegroundColor Yellow
    }
    
    if ($service.addons -ne $null) {
        Write-Host "   ✅ addons: $($service.addons.Count) found" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  addons: NULL" -ForegroundColor Yellow
    }
    
    # Issue 3: DSS Fields
    Write-Host "`n🎯 ISSUE 3: DSS FIELDS" -ForegroundColor Magenta
    if ($service.wedding_styles -ne $null) {
        Write-Host "   ✅ wedding_styles: $($service.wedding_styles -join ', ')" -ForegroundColor Green
    } else {
        Write-Host "   ❌ wedding_styles: NULL" -ForegroundColor Red
    }
    
    if ($service.cultural_specialties -ne $null) {
        Write-Host "   ✅ cultural_specialties: $($service.cultural_specialties -join ', ')" -ForegroundColor Green
    } else {
        Write-Host "   ❌ cultural_specialties: NULL" -ForegroundColor Red
    }
    
    if ($service.availability -ne $null) {
        Write-Host "   ✅ availability: $($service.availability)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ availability: NULL" -ForegroundColor Red
    }
    
    # Issue 4: Location Data
    Write-Host "`n📍 ISSUE 4: LOCATION DATA" -ForegroundColor Magenta
    if ($service.location_data -ne $null) {
        Write-Host "   ✅ location_data: Present" -ForegroundColor Green
        try {
            $locData = $service.location_data | ConvertFrom-Json
            Write-Host "      City: $($locData.city)" -ForegroundColor Gray
            Write-Host "      State: $($locData.state)" -ForegroundColor Gray
        } catch {
            Write-Host "      Raw: $($service.location_data)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ location_data: NULL" -ForegroundColor Red
    }
    
    if ($service.location_coordinates -ne $null) {
        Write-Host "   ✅ location_coordinates: Present" -ForegroundColor Green
        try {
            $coords = $service.location_coordinates | ConvertFrom-Json
            Write-Host "      Lat: $($coords.lat)" -ForegroundColor Gray
            Write-Host "      Lng: $($coords.lng)" -ForegroundColor Gray
        } catch {
            Write-Host "      Raw: $($service.location_coordinates)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ location_coordinates: NULL" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error fetching services" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)"
    exit
}

# Test 3: Frontend Validation Test
Write-Host "`n🌐 TEST 3: Frontend Validation (Manual)" -ForegroundColor Cyan
Write-Host "-" * 60
Write-Host "Please perform these manual tests:"
Write-Host ""
Write-Host "1. Open: $frontendUrl/vendor/services" -ForegroundColor White
Write-Host "2. Click 'Add New Service'" -ForegroundColor White
Write-Host "3. Fill Step 1 and click Next" -ForegroundColor White
Write-Host "4. Fill Step 2 (create packages) and click Next" -ForegroundColor White
Write-Host "5. In Step 3, try to click Next WITHOUT selecting:" -ForegroundColor White
Write-Host "   - Wedding styles" -ForegroundColor Gray
Write-Host "   - Cultural specialties" -ForegroundColor Gray
Write-Host "   - Availability" -ForegroundColor Gray
Write-Host "6. Expected: RED error messages should appear ❌" -ForegroundColor Yellow
Write-Host "7. Select required fields and proceed ✅" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "`n📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 60

$issuesFixed = 0
$issuesRemaining = 0

if ($service.price -ne $null -and $service.max_price -ne $null -and $service.price_range -ne $null) {
    Write-Host "✅ Issue 1: Pricing Data - FIXED" -ForegroundColor Green
    $issuesFixed++
} else {
    Write-Host "❌ Issue 1: Pricing Data - NOT FIXED" -ForegroundColor Red
    $issuesRemaining++
}

if ($service.packages -ne $null -and $service.packages.Count -gt 0) {
    Write-Host "✅ Issue 2: Itemization Data - FIXED" -ForegroundColor Green
    $issuesFixed++
} else {
    Write-Host "❌ Issue 2: Itemization Data - NOT FIXED" -ForegroundColor Red
    $issuesRemaining++
}

if ($service.wedding_styles -ne $null -and $service.cultural_specialties -ne $null) {
    Write-Host "✅ Issue 3: DSS Fields - FIXED" -ForegroundColor Green
    $issuesFixed++
} else {
    Write-Host "❌ Issue 3: DSS Fields - NOT FIXED" -ForegroundColor Red
    $issuesRemaining++
}

if ($service.location_data -ne $null -and $service.location_coordinates -ne $null) {
    Write-Host "✅ Issue 4: Location Data - FIXED" -ForegroundColor Green
    $issuesFixed++
} else {
    Write-Host "❌ Issue 4: Location Data - NOT FIXED" -ForegroundColor Red
    $issuesRemaining++
}

Write-Host "`n📈 Results: $issuesFixed/4 issues fixed" -ForegroundColor $(if ($issuesFixed -eq 4) { "Green" } else { "Yellow" })

if ($issuesFixed -eq 4) {
    Write-Host "`n🎉 ALL ISSUES FIXED! Service creation working perfectly!" -ForegroundColor Green
} elseif ($issuesRemaining -gt 0) {
    Write-Host "`n⚠️  $issuesRemaining issues still need attention" -ForegroundColor Yellow
    Write-Host "   This may be because no new service was created after deployment"
    Write-Host "   Create a new service to test all fixes"
}

Write-Host "`n✅ Test script completed" -ForegroundColor Cyan
Write-Host "=" * 60
