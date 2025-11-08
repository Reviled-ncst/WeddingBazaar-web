# Test Script: Service Creation with Vendor ID Fix
# This script tests the vendor ID resolution logic

Write-Host "`n🧪 SERVICE CREATION TEST - Vendor ID Fix`n" -ForegroundColor Cyan

# Configuration
$backendUrl = "https://weddingbazaar-web.onrender.com"
$frontendUrl = "https://weddingbazaarph.web.app"

Write-Host "📋 TEST SCENARIO" -ForegroundColor Yellow
Write-Host "   1. Login as vendor (user.id = 2-2025-019)" -ForegroundColor Gray
Write-Host "   2. Backend looks up vendor record (vendors.user_id = 2-2025-019)" -ForegroundColor Gray
Write-Host "   3. Backend gets vendor.id (UUID)" -ForegroundColor Gray
Write-Host "   4. Service created with vendor.id as vendor_id`n" -ForegroundColor Gray

Write-Host "🔐 STEP 1: Login as Vendor" -ForegroundColor Cyan
Write-Host "   👤 Username: vendor@test.com" -ForegroundColor Gray
Write-Host "   🔑 Password: password123" -ForegroundColor Gray
Write-Host "`n   Navigate to: $frontendUrl/vendor/dashboard`n" -ForegroundColor Yellow

Read-Host "Press Enter when logged in as vendor"

Write-Host "`n📝 STEP 2: Create Service" -ForegroundColor Cyan
Write-Host "   1. Click 'Add Service' button" -ForegroundColor Gray
Write-Host "   2. Fill in service details:" -ForegroundColor Gray
Write-Host "      - Title: Test Service (Vendor ID Fix)" -ForegroundColor Gray
Write-Host "      - Category: Wedding Photography" -ForegroundColor Gray
Write-Host "      - Description: Testing vendor ID resolution" -ForegroundColor Gray
Write-Host "      - Location: Manila" -ForegroundColor Gray
Write-Host "   3. Add at least one package:" -ForegroundColor Gray
Write-Host "      - Name: Basic Package" -ForegroundColor Gray
Write-Host "      - Price: ₱15,000" -ForegroundColor Gray
Write-Host "      - Items: 8 hours coverage, 200 edited photos" -ForegroundColor Gray
Write-Host "   4. Click 'Create Service'`n" -ForegroundColor Gray

Read-Host "Press Enter when form is submitted"

Write-Host "`n🔍 STEP 3: Check Backend Logs" -ForegroundColor Cyan
Write-Host "   Expected log sequence:" -ForegroundColor Gray
Write-Host "   1. 🔑 User ID from frontend: 2-2025-019" -ForegroundColor Green
Write-Host "   2. ✅ User is valid vendor: 2-2025-019" -ForegroundColor Green
Write-Host "   3. ✅ Found vendor record: [UUID] for user: 2-2025-019" -ForegroundColor Green
Write-Host "   4. ✅ Service created successfully" -ForegroundColor Green
Write-Host "   5. 🆔 Service ID: [UUID]`n" -ForegroundColor Green

Write-Host "📊 STEP 4: Verify in Database" -ForegroundColor Cyan
Write-Host "   Run this query in Neon SQL Editor:" -ForegroundColor Yellow
Write-Host "   SELECT s.id, s.title, s.vendor_id, v.business_name, v.user_id" -ForegroundColor White
Write-Host "   FROM services s" -ForegroundColor White
Write-Host "   JOIN vendors v ON s.vendor_id = v.id" -ForegroundColor White
Write-Host "   WHERE s.title LIKE '%Vendor ID Fix%';" -ForegroundColor White
Write-Host "`n   Expected result:" -ForegroundColor Gray
Write-Host "   - vendor_id: [UUID from vendors table]" -ForegroundColor Green
Write-Host "   - user_id: 2-2025-019" -ForegroundColor Green
Write-Host "   - business_name: [Vendor business name]`n" -ForegroundColor Green

Write-Host "✅ SUCCESS CRITERIA" -ForegroundColor Cyan
Write-Host "   ✓ Service created without foreign key error" -ForegroundColor Green
Write-Host "   ✓ Service appears in vendor dashboard" -ForegroundColor Green
Write-Host "   ✓ Package data is saved correctly" -ForegroundColor Green
Write-Host "   ✓ vendor_id is a UUID (not user.id string)" -ForegroundColor Green
Write-Host "   ✓ Service is visible in public services list`n" -ForegroundColor Green

Write-Host "❌ FAILURE SIGNS" -ForegroundColor Yellow
Write-Host "   ✗ Error: foreign key constraint violation" -ForegroundColor Red
Write-Host "   ✗ Error: Vendor profile not found" -ForegroundColor Red
Write-Host "   ✗ Error: Only vendors can create services" -ForegroundColor Red
Write-Host "   ✗ Service not appearing in dashboard" -ForegroundColor Red
Write-Host "   ✗ Package data missing`n" -ForegroundColor Red

Write-Host "📝 RESULT" -ForegroundColor Cyan
$testResult = Read-Host "Did the test pass? (yes/no)"

if ($testResult -eq "yes") {
    Write-Host "`n🎉 TEST PASSED! Vendor ID fix is working!" -ForegroundColor Green
    Write-Host "   ✅ Service creation flow is now operational" -ForegroundColor Green
    Write-Host "   ✅ Vendor ID resolution logic is correct" -ForegroundColor Green
    Write-Host "   ✅ Foreign key constraint is satisfied`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ TEST FAILED" -ForegroundColor Red
    Write-Host "   Please check:" -ForegroundColor Yellow
    Write-Host "   1. Render deployment logs" -ForegroundColor Gray
    Write-Host "   2. Backend API health: $backendUrl/api/health" -ForegroundColor Gray
    Write-Host "   3. Browser console for frontend errors" -ForegroundColor Gray
    Write-Host "   4. Vendor profile exists in database`n" -ForegroundColor Gray
    
    $errorDetails = Read-Host "What was the error message?"
    Write-Host "`n🐛 Error Details: $errorDetails" -ForegroundColor Red
    Write-Host "   Save this information for debugging`n" -ForegroundColor Yellow
}
