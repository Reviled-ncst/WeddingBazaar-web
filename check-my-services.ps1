# 🔥 EMERGENCY VENDOR SERVICES CHECKER
# Run this script to check if your services are in the database

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔥 EMERGENCY VENDOR SERVICES CHECKER" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Backend URL
$API_URL = "https://weddingbazaar-web.onrender.com"

# Step 1: Check backend health
Write-Host "Step 1: Checking backend..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$API_URL/api/health" -UseBasicParsing
    Write-Host "✅ Backend is ONLINE" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Database: $($health.database)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Backend is DOWN or unreachable!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get vendor ID from user
Write-Host "Step 2: Enter your vendor ID" -ForegroundColor Cyan
Write-Host "   (Usually looks like: 2-2025-001 or 2-2025-003)" -ForegroundColor Gray
$vendorId = Read-Host "Enter your vendor ID"

if ([string]::IsNullOrWhiteSpace($vendorId)) {
    Write-Host "❌ No vendor ID provided!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Test API for this vendor
Write-Host "Step 3: Fetching services for vendor: $vendorId" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$API_URL/api/services/vendor/$vendorId" -UseBasicParsing
    
    if ($response.success -eq $true) {
        $serviceCount = $response.services.Count
        
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host "✅ API RESPONSE RECEIVED" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host ""
        Write-Host "Success: $($response.success)" -ForegroundColor Gray
        Write-Host "Services Found: $serviceCount" -ForegroundColor Yellow
        Write-Host ""
        
        if ($serviceCount -eq 0) {
            Write-Host "⚠️  NO SERVICES FOUND!" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "This means either:" -ForegroundColor Gray
            Write-Host "  1. You haven't created any services yet (normal)" -ForegroundColor Gray
            Write-Host "  2. Services exist but with different vendor_id" -ForegroundColor Gray
            Write-Host "  3. Vendor ID doesn't exist in database" -ForegroundColor Gray
            Write-Host ""
            Write-Host "📊 SQL to check database:" -ForegroundColor Cyan
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
            Write-Host "-- Check YOUR services" -ForegroundColor Gray
            Write-Host "SELECT * FROM services WHERE vendor_id = '$vendorId';" -ForegroundColor White
            Write-Host ""
            Write-Host "-- Check ALL vendor_ids" -ForegroundColor Gray
            Write-Host "SELECT vendor_id, COUNT(*) FROM services GROUP BY vendor_id;" -ForegroundColor White
            Write-Host ""
            Write-Host "-- Check if vendor exists" -ForegroundColor Gray
            Write-Host "SELECT * FROM vendors WHERE id = '$vendorId';" -ForegroundColor White
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
            
        } else {
            Write-Host "🎉 SERVICES FOUND! Here they are:" -ForegroundColor Green
            Write-Host ""
            
            $i = 1
            foreach ($service in $response.services) {
                Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
                Write-Host "Service #$i" -ForegroundColor Cyan
                Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
                Write-Host "  Name:       $($service.service_name)" -ForegroundColor White
                Write-Host "  Category:   $($service.service_category)" -ForegroundColor Gray
                Write-Host "  Price:      ₱$($service.base_price)" -ForegroundColor Yellow
                Write-Host "  Active:     $(if ($service.is_active) { '✅ Yes' } else { '❌ No' })" -ForegroundColor $(if ($service.is_active) { 'Green' } else { 'Red' })
                Write-Host "  Vendor ID:  $($service.vendor_id)" -ForegroundColor Gray
                Write-Host "  Service ID: $($service.id)" -ForegroundColor DarkGray
                Write-Host ""
                $i++
            }
            
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
            Write-Host "✅ DIAGNOSIS: YOUR SERVICES ARE IN THE DATABASE!" -ForegroundColor Green
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
            Write-Host ""
            Write-Host "If they're not showing on your vendor page:" -ForegroundColor Yellow
            Write-Host "  1. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor Gray
            Write-Host "  2. Hard refresh page (Ctrl+Shift+R)" -ForegroundColor Gray
            Write-Host "  3. Apply vendorId fix (see instructions)" -ForegroundColor Gray
            Write-Host "  4. Check browser console for errors (F12)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "🔧 Quick Fix (paste in browser console):" -ForegroundColor Cyan
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
            Write-Host "const u=JSON.parse(localStorage.getItem('weddingbazaar_user'));" -ForegroundColor White
            Write-Host "u.vendorId='$vendorId';" -ForegroundColor White
            Write-Host "localStorage.setItem('weddingbazaar_user',JSON.stringify(u));" -ForegroundColor White
            Write-Host "location.reload();" -ForegroundColor White
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        }
        
    } else {
        Write-Host "❌ API returned success=false" -ForegroundColor Red
        Write-Host "Response: $($response | ConvertTo-Json)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ ERROR calling API!" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "⚠️  This vendor ID might not exist in the database!" -ForegroundColor Yellow
        Write-Host "   Double-check your vendor ID" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Check complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Need more help? Check these files:" -ForegroundColor Gray
Write-Host "  - EMERGENCY_SERVICE_CHECKER.html (interactive tool)" -ForegroundColor Gray
Write-Host "  - DEBUG_SERVICES_NOW.md (complete guide)" -ForegroundColor Gray
Write-Host ""

# Keep window open
Read-Host "Press Enter to exit"
