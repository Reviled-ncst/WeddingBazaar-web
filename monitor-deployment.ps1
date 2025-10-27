#!/usr/bin/env pwsh
# Monitor Render deployment and test when ready

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🔍 MONITORING BACKEND DEPLOYMENT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Waiting for Render to deploy the payment detection fix..." -ForegroundColor Yellow
Write-Host "   Commit: c047326" -ForegroundColor Gray
Write-Host "   Fix: Detect payment from transactionId, sourceId, paymentIntent.id, payment.id" -ForegroundColor Gray
Write-Host ""

$deployed = $false
$attempts = 0
$maxAttempts = 30 # 5 minutes max (10 second intervals)

while (-not $deployed -and $attempts -lt $maxAttempts) {
    $attempts++
    
    try {
        Write-Host "🔍 Check #$attempts - Querying backend..." -ForegroundColor Cyan
        
        $response = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method GET -UseBasicParsing
        $health = $response.Content | ConvertFrom-Json
        
        $uptime = [math]::Round($health.uptime, 1)
        Write-Host "   Backend uptime: $uptime seconds" -ForegroundColor White
        
        # If uptime is less than 60 seconds, it's a fresh deploy
        if ($uptime -lt 60) {
            Write-Host ""
            Write-Host "✅ NEW DEPLOYMENT DETECTED!" -ForegroundColor Green
            Write-Host "   Uptime: $uptime seconds (fresh deploy)" -ForegroundColor Green
            Write-Host "   Version: $($health.version)" -ForegroundColor White
            Write-Host "   Status: $($health.status)" -ForegroundColor White
            $deployed = $true
        } else {
            Write-Host "   ⏳ Old version still running (uptime: $uptime sec)" -ForegroundColor Yellow
            Write-Host "      Waiting for Render to deploy new version..." -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ⚠️  Backend not responding (this is normal during deployment)" -ForegroundColor Yellow
    }
    
    if (-not $deployed) {
        Start-Sleep -Seconds 10
    }
}

if ($deployed) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "   ✅ BACKEND DEPLOYED - READY TO TEST!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🧪 TEST PRO PLAN UPGRADE NOW:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   1. Go to: https://weddingbazaar-web.web.app" -ForegroundColor White
    Write-Host "   2. Login as vendor (if not already logged in)" -ForegroundColor White
    Write-Host "   3. Navigate to Services page" -ForegroundColor White
    Write-Host "   4. Click 'Upgrade to Pro'" -ForegroundColor White
    Write-Host "   5. Complete payment with test card: 4343 4343 4343 4345" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📊 EXPECTED CONSOLE OUTPUT:" -ForegroundColor Yellow
    Write-Host "   ✅ Step 5: Fetch completed without throwing" -ForegroundColor Green
    Write-Host "   📥 Response status: 200  ← SHOULD BE 200 NOW!" -ForegroundColor Green
    Write-Host "   ✅ Subscription upgraded successfully!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "🔍 BACKEND LOGS TO VERIFY (Render Dashboard):" -ForegroundColor Yellow
    Write-Host "   ✅ Payment already processed by frontend, using reference: pi_xxx" -ForegroundColor Green
    Write-Host "   💳 Payment details from frontend: { ... }" -ForegroundColor Green
    Write-Host "   ✅ Subscription upgraded successfully" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📚 Documentation:" -ForegroundColor Cyan
    Write-Host "   - PAYMENT_DETECTION_FIX.md - Technical details of this fix" -ForegroundColor White
    Write-Host "   - TEST_SUBSCRIPTION_UPGRADE_FINAL.md - Full testing guide" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "⏰ TIMEOUT AFTER 5 MINUTES" -ForegroundColor Yellow
    Write-Host "   Deployment may still be in progress" -ForegroundColor White
    Write-Host "   Check Render dashboard: https://dashboard.render.com" -ForegroundColor White
    Write-Host ""
    Write-Host "   Or manually check backend uptime:" -ForegroundColor White
    Write-Host "   Invoke-WebRequest -Uri 'https://weddingbazaar-web.onrender.com/api/health' -UseBasicParsing" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   MONITORING COMPLETE" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
