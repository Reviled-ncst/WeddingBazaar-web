# Quick Test - Admin Reports System
# Run this script to verify the system is working

Write-Host "🧪 Testing Admin Reports System..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if frontend is accessible
Write-Host "📱 Test 1: Frontend Accessibility" -ForegroundColor Yellow
Write-Host "Opening admin reports page in browser..."
Start-Process "https://weddingbazaarph.web.app/admin/reports"
Write-Host "✅ If page loads without errors, Test 1 passed" -ForegroundColor Green
Write-Host ""

# Test 2: Check backend API health
Write-Host "🔧 Test 2: Backend API Health" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method GET
    Write-Host "✅ Backend is healthy: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Check if booking-reports endpoint exists
Write-Host "📊 Test 3: Booking Reports Endpoint" -ForegroundColor Yellow
try {
    # This will fail without auth, but we're just checking if the endpoint exists
    Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/booking-reports" -Method GET -ErrorAction Stop
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Endpoint exists (401 Unauthorized is expected without auth)" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "❌ Endpoint not found (404) - Render may still be deploying" -ForegroundColor Red
    } else {
        Write-Host "⚠️  Unexpected response: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 4: Check Render deployment status
Write-Host "🚀 Test 4: Render Deployment Status" -ForegroundColor Yellow
Write-Host "Opening Render dashboard..."
Start-Process "https://dashboard.render.com/"
Write-Host "✅ Check if 'weddingbazaar-web' shows 'Live' status" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📋 MANUAL VERIFICATION CHECKLIST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. [ ] Admin Reports page loads (https://weddingbazaarph.web.app/admin/reports)"
Write-Host "2. [ ] Statistics cards are visible"
Write-Host "3. [ ] Filter panel works"
Write-Host "4. [ ] Reports table displays"
Write-Host "5. [ ] No console errors in browser DevTools (F12)"
Write-Host "6. [ ] Render shows 'Live' status"
Write-Host "7. [ ] Backend API responds (even if 401)"
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎯 NEXT STEPS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all checks pass:"
Write-Host "  1. Create test booking report (SQL or API)"
Write-Host "  2. Verify it appears in admin dashboard"
Write-Host "  3. Test updating report status"
Write-Host "  4. Test deleting report"
Write-Host ""
Write-Host "If Render is still deploying:"
Write-Host "  - Wait 2-3 minutes"
Write-Host "  - Re-run this script"
Write-Host "  - Check Render logs for errors"
Write-Host ""
Write-Host "✅ Testing script complete!" -ForegroundColor Green
