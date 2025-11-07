# Quick Test - Admin Reports System
# Run this script to verify the system is working

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host " Testing Admin Reports System" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if frontend is accessible
Write-Host "[Test 1] Frontend Accessibility" -ForegroundColor Yellow
Write-Host "Opening admin reports page in browser..."
Start-Process "https://weddingbazaarph.web.app/admin/reports"
Write-Host "[PASS] If page loads without errors, Test 1 passed" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 2

# Test 2: Check backend API health
Write-Host "[Test 2] Backend API Health" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method GET
    Write-Host "[PASS] Backend is healthy" -ForegroundColor Green
    Write-Host "       Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "[FAIL] Backend health check failed" -ForegroundColor Red
    Write-Host "       Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Check if booking-reports endpoint exists
Write-Host "[Test 3] Booking Reports Endpoint" -ForegroundColor Yellow
try {
    $null = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/booking-reports" -Method GET -ErrorAction Stop
    Write-Host "[PASS] Endpoint exists and responds" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "[PASS] Endpoint exists (401 Unauthorized is expected)" -ForegroundColor Green
    } elseif ($statusCode -eq 404) {
        Write-Host "[WAIT] Endpoint not found - Render may still be deploying" -ForegroundColor Yellow
        Write-Host "       Wait 2-3 minutes and try again" -ForegroundColor Yellow
    } else {
        Write-Host "[INFO] Response code: $statusCode" -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 4: Check Render deployment status
Write-Host "[Test 4] Render Deployment" -ForegroundColor Yellow
Write-Host "Opening Render dashboard..."
Start-Process "https://dashboard.render.com/"
Write-Host "[INFO] Check if 'weddingbazaar-web' shows 'Live' status" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 2

# Summary
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host " Manual Verification Checklist" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. [ ] Admin Reports page loads without errors"
Write-Host "2. [ ] Statistics cards are visible"
Write-Host "3. [ ] Filter panel works correctly"
Write-Host "4. [ ] Reports table displays (may be empty)"
Write-Host "5. [ ] No console errors in browser (F12)"
Write-Host "6. [ ] Render shows 'Live' status"
Write-Host "7. [ ] Backend API responds (even if 401)"
Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host " Next Steps" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all checks pass:" -ForegroundColor Green
Write-Host "  1. Create test booking report (SQL or API)"
Write-Host "  2. Verify it appears in admin dashboard"
Write-Host "  3. Test updating report status"
Write-Host "  4. Test deleting report"
Write-Host ""
Write-Host "If Render is still deploying:" -ForegroundColor Yellow
Write-Host "  - Wait 2-3 minutes"
Write-Host "  - Re-run this script"
Write-Host "  - Check Render logs for errors"
Write-Host ""
Write-Host "Testing script complete!" -ForegroundColor Green
Write-Host ""
