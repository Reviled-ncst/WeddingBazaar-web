# 🧪 Quick Production Test - AddService Form
# Run this test to verify the service creation flow is working

Write-Host "🚀 Testing AddService Form - End-to-End Flow" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Test Configuration
$BACKEND_URL = "https://weddingbazaar-web.onrender.com"
$FRONTEND_URL = "https://weddingbazaarph.web.app"

# Test Vendor Account (Janald)
$TEST_VENDOR_EMAIL = "janald@test.com"
$TEST_VENDOR_ID = "2-2025-12-31-07-28-53-836"

Write-Host "📋 Test Configuration:" -ForegroundColor Yellow
Write-Host "   Backend: $BACKEND_URL"
Write-Host "   Frontend: $FRONTEND_URL"
Write-Host "   Test Vendor: $TEST_VENDOR_EMAIL`n"

# Step 1: Check Backend Health
Write-Host "Step 1: Checking backend health..." -ForegroundColor Green
try {
    $healthCheck = Invoke-RestMethod -Uri "$BACKEND_URL/api/health" -Method Get
    Write-Host "   ✅ Backend is healthy: $($healthCheck.status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend health check failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Verify Vendor Profile Exists
Write-Host "`nStep 2: Verifying vendor profile..." -ForegroundColor Green
Write-Host "   Run this SQL in Neon console:"
Write-Host "   SELECT id, user_id, business_name FROM vendors WHERE user_id = '$TEST_VENDOR_ID';" -ForegroundColor Cyan
Write-Host "   Expected: 1 row with UUID id and business_name"
Write-Host "   Press Enter when verified..." -ForegroundColor Yellow
Read-Host

# Step 3: Test Payload
Write-Host "`nStep 3: Preparing test service payload..." -ForegroundColor Green
$testService = @{
    vendor_id = $TEST_VENDOR_ID
    title = "Test Service - Premium Wedding Photography"
    category = "Photography"
    description = "Full-day wedding photography coverage with professional editing"
    price = 50000
    max_price = 80000
    location = "Metro Manila"
    is_active = $true
    featured = $false
    contact_info = @{
        phone = "+63 912 345 6789"
        email = $TEST_VENDOR_EMAIL
        website = "https://example.com"
        business_name = "Janald Photography"
    }
    packages = @(
        @{
            name = "Full Day Coverage"
            price = 50000
            description = "8-hour coverage with 2 photographers"
            items = @(
                @{
                    name = "Pre-wedding Photoshoot"
                    quantity = 1
                    price = 10000
                }
                @{
                    name = "Ceremony Coverage"
                    quantity = 1
                    price = 20000
                }
                @{
                    name = "Reception Coverage"
                    quantity = 1
                    price = 15000
                }
                @{
                    name = "500 Edited Photos"
                    quantity = 1
                    price = 5000
                }
            )
        }
    )
    images = @(
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800"
    )
    tags = @("wedding", "photography", "premium", "full-day")
    years_in_business = 5
    service_tier = "premium"
    wedding_styles = @("traditional", "modern", "destination")
    availability = "weekends"
}

Write-Host "   ✅ Test payload created" -ForegroundColor Green
Write-Host "   Service Title: $($testService.title)"
Write-Host "   Category: $($testService.category)"
Write-Host "   Price: ₱$($testService.price)"
Write-Host "   Packages: $($testService.packages.Count)"

# Step 4: Show Manual Testing Instructions
Write-Host "`n" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🎯 MANUAL TESTING STEPS" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "1. Open Frontend:" -ForegroundColor Yellow
Write-Host "   $FRONTEND_URL/vendor/services`n"

Write-Host "2. Login as Test Vendor:" -ForegroundColor Yellow
Write-Host "   Email: $TEST_VENDOR_EMAIL"
Write-Host "   Password: <your test password>`n"

Write-Host "3. Click 'Add New Service' Button`n" -ForegroundColor Yellow

Write-Host "4. Fill Out Form with These Details:" -ForegroundColor Yellow
Write-Host "   Title: Test Service - Premium Wedding Photography"
Write-Host "   Category: Photography"
Write-Host "   Description: Full-day wedding photography coverage"
Write-Host "   Base Price: 50000"
Write-Host "   Max Price: 80000"
Write-Host "   Location: Metro Manila`n"

Write-Host "5. Add a Package (Optional):" -ForegroundColor Yellow
Write-Host "   Package Name: Full Day Coverage"
Write-Host "   Price: 50000"
Write-Host "   Description: 8-hour coverage with 2 photographers"
Write-Host "   Add 4 items:
      - Pre-wedding Photoshoot (₱10,000)
      - Ceremony Coverage (₱20,000)
      - Reception Coverage (₱15,000)
      - 500 Edited Photos (₱5,000)`n"

Write-Host "6. Submit the Form`n" -ForegroundColor Yellow

Write-Host "7. Watch for:" -ForegroundColor Yellow
Write-Host "   ✅ Success message displayed"
Write-Host "   ✅ Form closes/resets"
Write-Host "   ✅ New service appears in vendor dashboard"
Write-Host "   ❌ NO 403 Forbidden errors"
Write-Host "   ❌ NO 500 Internal Server errors"
Write-Host "   ❌ NO foreign key constraint errors`n"

Write-Host "================================================`n" -ForegroundColor Cyan

# Step 5: API Test (Optional - requires JWT token)
Write-Host "Step 5: API Test (Optional - for debugging):" -ForegroundColor Green
Write-Host "   If form submission fails, you can test the API directly:"
Write-Host "   1. Get JWT token from browser localStorage"
Write-Host "   2. Use Postman/Insomnia to POST to:"
Write-Host "      $BACKEND_URL/api/services"
Write-Host "   3. Include Authorization header: 'Bearer <token>'"
Write-Host "   4. Send the JSON payload (see test-service-uuid-fix.ps1 for example)`n"

# Step 6: Database Verification
Write-Host "Step 6: Verify in Database:" -ForegroundColor Green
Write-Host "   After successful creation, run this SQL in Neon console:`n"
Write-Host "   -- Check if service was created" -ForegroundColor Cyan
Write-Host "   SELECT id, vendor_id, title, category, price, created_at" -ForegroundColor Cyan
Write-Host "   FROM services" -ForegroundColor Cyan
Write-Host "   ORDER BY created_at DESC" -ForegroundColor Cyan
Write-Host "   LIMIT 5;`n" -ForegroundColor Cyan

Write-Host "   -- Check vendor_id mapping" -ForegroundColor Cyan
Write-Host "   SELECT s.id, s.title, v.business_name, v.user_id" -ForegroundColor Cyan
Write-Host "   FROM services s" -ForegroundColor Cyan
Write-Host "   LEFT JOIN vendors v ON s.vendor_id = v.id" -ForegroundColor Cyan
Write-Host "   ORDER BY s.created_at DESC" -ForegroundColor Cyan
Write-Host "   LIMIT 5;`n" -ForegroundColor Cyan

Write-Host "   -- Check if packages were saved" -ForegroundColor Cyan
Write-Host "   SELECT service_id, name, price, items" -ForegroundColor Cyan
Write-Host "   FROM service_packages" -ForegroundColor Cyan
Write-Host "   WHERE service_id IN (" -ForegroundColor Cyan
Write-Host "     SELECT id FROM services ORDER BY created_at DESC LIMIT 5" -ForegroundColor Cyan
Write-Host "   );`n" -ForegroundColor Cyan

# Final Instructions
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📝 EXPECTED RESULTS" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "✅ SUCCESS CRITERIA:" -ForegroundColor Green
Write-Host "   1. Form submits without errors (200 OK)"
Write-Host "   2. Success message appears"
Write-Host "   3. Service appears in vendor dashboard"
Write-Host "   4. Service has correct vendor_id in database"
Write-Host "   5. Packages are saved (if added)"
Write-Host "   6. Contact info is auto-populated from vendor profile`n"

Write-Host "❌ FAILURE INDICATORS:" -ForegroundColor Red
Write-Host "   1. 403 Forbidden → User is not a vendor (check user_type)"
Write-Host "   2. 400 Bad Request → Missing vendor profile (run fix-vendor-profile-missing.cjs)"
Write-Host "   3. 500 Internal Error → Backend error (check Render logs)"
Write-Host "   4. Foreign key constraint → vendor_id mismatch (check vendors table)`n"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🐛 TROUBLESHOOTING" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "If test fails, check:" -ForegroundColor Yellow
Write-Host "   1. Browser Console (F12 → Console tab)"
Write-Host "   2. Network Tab (F12 → Network → POST /api/services)"
Write-Host "   3. Render Logs (Render dashboard → Logs)"
Write-Host "   4. Neon Database (Run SQL queries above)`n"

Write-Host "Common Fixes:" -ForegroundColor Yellow
Write-Host "   • 403 Error → Check user.user_type = 'vendor' in database"
Write-Host "   • 400 Error → Run: node fix-vendor-profile-missing.cjs"
Write-Host "   • 500 Error → Check Render logs for specific error message`n"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Ready to test! Good luck! 🚀" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan
