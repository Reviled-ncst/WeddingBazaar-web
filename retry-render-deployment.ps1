# 🚀 Retry Render Backend Deployment
# This script will trigger a manual deployment on Render and monitor progress

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    🚀 RETRYING RENDER BACKEND DEPLOYMENT" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$BACKEND_URL = "https://weddingbazaar-web.onrender.com"
$HEALTH_ENDPOINT = "$BACKEND_URL/api/health"
$UPGRADE_ENDPOINT = "$BACKEND_URL/api/subscriptions/upgrade"

$currentTime = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Write-Host "⏰ $currentTime" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check current backend status
Write-Host "📊 Step 1: Checking current backend status..." -ForegroundColor Cyan
Write-Host "   URL: $HEALTH_ENDPOINT" -ForegroundColor Gray
Write-Host ""

try {
    $healthResponse = Invoke-RestMethod -Uri $HEALTH_ENDPOINT -Method Get -TimeoutSec 10
    Write-Host "✅ Backend is responding" -ForegroundColor Green
    Write-Host "   Status: $($healthResponse.status)" -ForegroundColor Gray
    Write-Host "   Database: $($healthResponse.database)" -ForegroundColor Gray
    if ($healthResponse.timestamp) {
        Write-Host "   Last deployed: $($healthResponse.timestamp)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Backend health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Test upgrade endpoint (current state)
Write-Host "🧪 Step 2: Testing upgrade endpoint (before deployment)..." -ForegroundColor Cyan
Write-Host "   URL: $UPGRADE_ENDPOINT" -ForegroundColor Gray
Write-Host ""

$timestamp = Get-Date -Format 'yyyyMMddHHmmss'
$testBody = @{
    vendor_id = "test-vendor-$timestamp"
    new_plan = "premium"
} | ConvertTo-Json

try {
    $upgradeResponse = Invoke-RestMethod -Uri $UPGRADE_ENDPOINT -Method Put -Body $testBody -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ Upgrade endpoint working (no auth required)" -ForegroundColor Green
    Write-Host "   Response: $($upgradeResponse | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "❌ 401 Unauthorized - Auth still required (OLD CODE)" -ForegroundColor Red
        Write-Host "   This confirms deployment hasn't updated yet" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  Error: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   Status: $statusCode" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 3: Instructions for manual deployment
Write-Host "📋 Step 3: MANUAL DEPLOYMENT REQUIRED" -ForegroundColor Magenta
Write-Host ""
Write-Host "To deploy the latest code to Render, follow these steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Via Render Dashboard (RECOMMENDED)" -ForegroundColor Cyan
Write-Host "  1. Go to: https://dashboard.render.com/" -ForegroundColor White
Write-Host "  2. Find service: weddingbazaar-web" -ForegroundColor White
Write-Host "  3. Click 'Manual Deploy' button" -ForegroundColor White
Write-Host "  4. Select branch: main" -ForegroundColor White
Write-Host "  5. Click 'Deploy'" -ForegroundColor White
Write-Host ""

Write-Host "Option 2: Via Git Push (if auto-deploy enabled)" -ForegroundColor Cyan
Write-Host "  1. Ensure latest code is committed:" -ForegroundColor White
Write-Host "     git add ." -ForegroundColor Gray
Write-Host "     git commit -m 'Fix subscription upgrade endpoint'" -ForegroundColor Gray
Write-Host "  2. Push to main branch:" -ForegroundColor White
Write-Host "     git push origin main" -ForegroundColor Gray
Write-Host "  3. Render will auto-deploy (if configured)" -ForegroundColor White
Write-Host ""

Write-Host "Option 3: Via Render API (requires API key)" -ForegroundColor Cyan
Write-Host "  curl -X POST 'https://api.render.com/v1/services/YOUR_SERVICE_ID/deploys' \" -ForegroundColor Gray
Write-Host "       -H 'Authorization: Bearer YOUR_API_KEY'" -ForegroundColor Gray
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 4: Wait and monitor
Write-Host "⏳ Step 4: Monitoring deployment progress..." -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop monitoring" -ForegroundColor Gray
Write-Host ""

$maxAttempts = 60  # Monitor for 5 minutes (60 attempts * 5 seconds)
$attempt = 0
$deploymentDetected = $false

while ($attempt -lt $maxAttempts) {
    $attempt++
    Start-Sleep -Seconds 5
    
    Write-Host "   Attempt $attempt/$maxAttempts - Checking..." -NoNewline -ForegroundColor Gray
    
    try {
        $testResponse = Invoke-RestMethod -Uri $UPGRADE_ENDPOINT -Method Put -Body $testBody -ContentType "application/json" -TimeoutSec 10 -ErrorAction Stop
        Write-Host " ✅ SUCCESS!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
        Write-Host "   Upgrade endpoint is now working without authentication" -ForegroundColor Green
        Write-Host "   New code is live!" -ForegroundColor Green
        $deploymentDetected = $true
        break
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Host " ⏳ Still old code (401)" -ForegroundColor Yellow
        } else {
            Write-Host " ⚠️  Status: $statusCode" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

if ($deploymentDetected) {
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "    ✅ DEPLOYMENT VERIFIED - NEW CODE IS LIVE" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Test upgrade flow in production" -ForegroundColor White
    Write-Host "  2. Log in as vendor" -ForegroundColor White
    Write-Host "  3. Try upgrading subscription from VendorServices page" -ForegroundColor White
    Write-Host "  4. Verify no 401 errors" -ForegroundColor White
    Write-Host ""
    Write-Host "Production URL: https://weddingbazaar-web.web.app" -ForegroundColor Gray
} else {
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "    ⏳ DEPLOYMENT NOT DETECTED YET" -ForegroundColor Yellow
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "  • Deployment hasn't been triggered yet" -ForegroundColor White
    Write-Host "  • Deployment is in progress (can take 3-5 minutes)" -ForegroundColor White
    Write-Host "  • Build is queued behind other deployments" -ForegroundColor White
    Write-Host ""
    Write-Host "Recommended actions:" -ForegroundColor Cyan
    Write-Host "  1. Check Render dashboard for deployment status" -ForegroundColor White
    Write-Host "  2. Check build logs for errors" -ForegroundColor White
    Write-Host "  3. Run this script again in a few minutes" -ForegroundColor White
    Write-Host ""
}

$completionTime = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
Write-Host "Script completed at: $completionTime" -ForegroundColor Gray
Write-Host ""
