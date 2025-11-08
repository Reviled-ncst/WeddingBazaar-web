# Backend Deployment Verification Script
# Run this after 5 minutes to verify deployment

Write-Host "`n🔍 BACKEND DEPLOYMENT VERIFICATION`n" -ForegroundColor Cyan
Write-Host "Testing Render backend endpoints...`n" -ForegroundColor Yellow

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Green
Write-Host "URL: https://weddingbazaar-web.onrender.com/api/health" -ForegroundColor Gray
try {
    $health = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method Get
    Write-Host "✅ Health check passed!" -ForegroundColor Green
    Write-Host ($health | ConvertTo-Json) -ForegroundColor White
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}

Write-Host "`n---`n" -ForegroundColor Gray

# Test 2: New Endpoint Test
Write-Host "Test 2: New Endpoint - /api/vendors/user/:userId" -ForegroundColor Green
Write-Host "URL: https://weddingbazaar-web.onrender.com/api/vendors/user/2-2025-019" -ForegroundColor Gray
try {
    $vendor = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/vendors/user/2-2025-019" -Method Get
    if ($vendor.success -eq $true) {
        Write-Host "✅ Vendor endpoint working!" -ForegroundColor Green
        Write-Host "Vendor: $($vendor.vendor.business_name)" -ForegroundColor White
        Write-Host "User ID: $($vendor.vendor.user_id)" -ForegroundColor White
        Write-Host "Email: $($vendor.vendor.email)" -ForegroundColor White
    } else {
        Write-Host "⚠️ Endpoint responded but success=false" -ForegroundColor Yellow
        Write-Host ($vendor | ConvertTo-Json -Depth 3) -ForegroundColor White
    }
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host "❌ 404 ERROR - Endpoint still not deployed!" -ForegroundColor Red
        Write-Host "    Backend deployment may have failed or is still in progress." -ForegroundColor Yellow
        Write-Host "    Check Render dashboard: https://dashboard.render.com" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n---`n" -ForegroundColor Gray

# Test 3: Services Endpoint
Write-Host "Test 3: Services Endpoint" -ForegroundColor Green
Write-Host "URL: https://weddingbazaar-web.onrender.com/api/services?vendor_id=2-2025-019" -ForegroundColor Gray
try {
    $services = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/services?vendor_id=2-2025-019" -Method Get
    Write-Host "✅ Services endpoint working!" -ForegroundColor Green
    Write-Host "Total services: $($services.services.Count)" -ForegroundColor White
} catch {
    Write-Host "⚠️ Services endpoint error: $_" -ForegroundColor Yellow
}

Write-Host "`n---`n" -ForegroundColor Gray

# Summary
Write-Host "`n📊 DEPLOYMENT VERIFICATION SUMMARY`n" -ForegroundColor Cyan
Write-Host "If all tests passed:" -ForegroundColor Green
Write-Host "  ✅ Backend is deployed and working" -ForegroundColor Green
Write-Host "  ✅ New endpoint is live" -ForegroundColor Green
Write-Host "  ✅ Vendor service creation should now work" -ForegroundColor Green
Write-Host ""
Write-Host "If tests failed:" -ForegroundColor Red
Write-Host "  ❌ Check Render dashboard for deployment status" -ForegroundColor Red
Write-Host "  ❌ Check deployment logs for errors" -ForegroundColor Red
Write-Host "  ❌ May need manual deployment trigger" -ForegroundColor Red
Write-Host ""
Write-Host "Next: Test service creation at https://weddingbazaarph.web.app/vendor/services`n" -ForegroundColor Yellow
