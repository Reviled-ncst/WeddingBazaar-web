#!/usr/bin/env pwsh
# Test Package Persistence - Check what's actually being saved in database
# This script verifies that all packages and items from frontend are persisted correctly

Write-Host "`nPACKAGE PERSISTENCE TEST - Checking database storage" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray

# Get the most recent service ID
Write-Host "`n1. Getting most recent service..." -ForegroundColor Yellow
$servicesResponse = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/services?limit=1" -UseBasicParsing
$servicesData = $servicesResponse.Content | ConvertFrom-Json

if ($servicesData.services.Count -eq 0) {
    Write-Host "❌ No services found in database!" -ForegroundColor Red
    exit 1
}

$latestService = $servicesData.services[0]
$serviceId = $latestService.id
$serviceTitle = $latestService.title

Write-Host "✅ Latest service: $serviceTitle (ID: $serviceId)" -ForegroundColor Green
Write-Host "   Vendor ID: $($latestService.vendor_id)" -ForegroundColor Gray
Write-Host "   Category: $($latestService.category)" -ForegroundColor Gray
Write-Host "   Created: $($latestService.created_at)" -ForegroundColor Gray

# Get packages for this service
Write-Host "`n2. Checking packages for service $serviceId..." -ForegroundColor Yellow
$vendorId = $latestService.vendor_id

try {
    $vendorServicesResponse = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/services/vendor/$vendorId" -UseBasicParsing
    $vendorData = $vendorServicesResponse.Content | ConvertFrom-Json
    
    # Find our service in the vendor's services
    $serviceWithPackages = $vendorData.services | Where-Object { $_.id -eq $serviceId }
    
    if ($null -eq $serviceWithPackages) {
        Write-Host "❌ Service not found in vendor's services!" -ForegroundColor Red
        exit 1
    }
    
    # Check packages
    Write-Host "`nPACKAGES FOUND IN DATABASE:" -ForegroundColor Cyan
    if ($serviceWithPackages.packages -and $serviceWithPackages.packages.Count -gt 0) {
        Write-Host "   Total packages: $($serviceWithPackages.packages.Count)" -ForegroundColor Green
        
        foreach ($pkg in $serviceWithPackages.packages) {
            Write-Host "`n   Package: $($pkg.package_name)" -ForegroundColor Yellow
            Write-Host "   - ID: $($pkg.id)" -ForegroundColor Gray
            Write-Host "   - Price: ₱$($pkg.base_price)" -ForegroundColor Gray
            Write-Host "   - Tier: $($pkg.tier)" -ForegroundColor Gray
            Write-Host "   - Default: $($pkg.is_default)" -ForegroundColor Gray
            
            # Check items for this package
            if ($serviceWithPackages.package_items -and $serviceWithPackages.package_items.ContainsKey($pkg.id)) {
                $items = $serviceWithPackages.package_items[$pkg.id]
                Write-Host "   - Items: $($items.Count)" -ForegroundColor Green
                
                foreach ($item in $items) {
                    Write-Host "      • $($item.item_name) (Qty: $($item.quantity) $($item.unit_type), Unit Price: ₱$($item.unit_price))" -ForegroundColor Gray
                }
            } else {
                Write-Host "   - Items: 0 ⚠️ NO ITEMS FOUND!" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "❌ NO PACKAGES FOUND IN DATABASE!" -ForegroundColor Red
        Write-Host "   This means packages from frontend were NOT saved!" -ForegroundColor Red
    }
    
    # Check add-ons
    Write-Host "`nADD-ONS FOUND IN DATABASE:" -ForegroundColor Cyan
    if ($serviceWithPackages.addons -and $serviceWithPackages.addons.Count -gt 0) {
        Write-Host "   Total add-ons: $($serviceWithPackages.addons.Count)" -ForegroundColor Green
        foreach ($addon in $serviceWithPackages.addons) {
            Write-Host "   • $($addon.name) - ₱$($addon.price)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   No add-ons (this is OK if none were created)" -ForegroundColor Gray
    }
    
    # Check pricing rules
    Write-Host "`nPRICING RULES FOUND IN DATABASE:" -ForegroundColor Cyan
    if ($serviceWithPackages.pricing_rules -and $serviceWithPackages.pricing_rules.Count -gt 0) {
        Write-Host "   Total rules: $($serviceWithPackages.pricing_rules.Count)" -ForegroundColor Green
        foreach ($rule in $serviceWithPackages.pricing_rules) {
            Write-Host "   • $($rule.rule_name) ($($rule.rule_type))" -ForegroundColor Gray
        }
    } else {
        Write-Host "   No pricing rules (this is OK if none were created)" -ForegroundColor Gray
    }
    
    # Summary
    Write-Host "`n" -NoNewline
    Write-Host "=" * 70 -ForegroundColor Gray
    Write-Host "`nSUMMARY:" -ForegroundColor Cyan
    
    $packageCount = if ($serviceWithPackages.packages) { $serviceWithPackages.packages.Count } else { 0 }
    $itemCount = 0
    if ($serviceWithPackages.package_items) {
        foreach ($pkgId in $serviceWithPackages.package_items.Keys) {
            $itemCount += $serviceWithPackages.package_items[$pkgId].Count
        }
    }
    $addonCount = if ($serviceWithPackages.addons) { $serviceWithPackages.addons.Count } else { 0 }
    $ruleCount = if ($serviceWithPackages.pricing_rules) { $serviceWithPackages.pricing_rules.Count } else { 0 }
    
    Write-Host "   Service: $serviceTitle" -ForegroundColor White
    Write-Host "   Packages: $packageCount" -ForegroundColor $(if ($packageCount -gt 0) { "Green" } else { "Red" })
    Write-Host "   Total Items: $itemCount" -ForegroundColor $(if ($itemCount -gt 0) { "Green" } else { "Red" })
    Write-Host "   Add-ons: $addonCount" -ForegroundColor Gray
    Write-Host "   Pricing Rules: $ruleCount" -ForegroundColor Gray
    
    Write-Host "`n" -NoNewline
    if ($packageCount -eq 0) {
        Write-Host "🚨 CRITICAL: NO PACKAGES SAVED! Data loss confirmed!" -ForegroundColor Red
        Write-Host "   Frontend is sending packages but backend is NOT saving them!" -ForegroundColor Red
    } elseif ($itemCount -eq 0 -and $packageCount -gt 0) {
        Write-Host "⚠️  WARNING: Packages saved but NO ITEMS inside them!" -ForegroundColor Yellow
        Write-Host "   Package items are not being persisted correctly!" -ForegroundColor Yellow
    } else {
        Write-Host "✅ SUCCESS: Packages and items are being saved correctly!" -ForegroundColor Green
    }
    
} catch {
    Write-Host "`n❌ Error fetching vendor services: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n"
