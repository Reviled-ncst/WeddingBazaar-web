# Monitor Render Deployment - Document Fix

Write-Host "🔍 Monitoring Render deployment for document fix..." -ForegroundColor Cyan
Write-Host "📦 Commit: 58474ea - Force deployment trigger" -ForegroundColor Yellow
Write-Host "🎯 Expected: Document verification check should be disabled" -ForegroundColor Green
Write-Host ""

$maxAttempts = 15
$attempt = 0
$deploymentDetected = $false

while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "[$attempt/$maxAttempts] Checking backend status..." -ForegroundColor Gray
    
    try {
        # Test service creation endpoint
        $testUrl = "https://weddingbazaar-web.onrender.com/api/health"
        $response = Invoke-RestMethod -Uri $testUrl -Method GET -TimeoutSec 10
        
        Write-Host "  Backend responding: $($response.status)" -ForegroundColor White
        Write-Host "  Version: $($response.version)" -ForegroundColor White
        Write-Host "  Timestamp: $($response.timestamp)" -ForegroundColor White
        
        # Check if deployment happened (version should change or timestamp should be recent)
        $timestamp = [DateTime]::Parse($response.timestamp)
        $now = [DateTime]::UtcNow
        $age = ($now - $timestamp).TotalMinutes
        
        if ($age -lt 2) {
            Write-Host "  ✅ Recent deployment detected! ($([math]::Round($age, 1)) minutes old)" -ForegroundColor Green
            $deploymentDetected = $true
            break
        } else {
            Write-Host "  ⏳ Waiting for deployment... (backend is $([math]::Round($age, 1)) min old)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ⚠️ Backend not responding" -ForegroundColor Yellow
    }
    
    if ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 20
    }
}

if ($deploymentDetected) {
    Write-Host ""
    Write-Host "🎉 DEPLOYMENT DETECTED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 Now test service creation:" -ForegroundColor Cyan
    Write-Host "  1. Refresh browser (Ctrl+Shift+R)" -ForegroundColor White
    Write-Host "  2. Click 'Add Service' button" -ForegroundColor White
    Write-Host "  3. Fill form and submit" -ForegroundColor White
    Write-Host "  4. Expected: ✅ Service created successfully" -ForegroundColor Green
    Write-Host "  5. Expected: ❌ NO 'documents table' error" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️ Deployment not detected yet" -ForegroundColor Yellow
    Write-Host "Check Render dashboard: https://dashboard.render.com" -ForegroundColor Cyan
    Write-Host "Or wait a few more minutes and try service creation again" -ForegroundColor Yellow
}
