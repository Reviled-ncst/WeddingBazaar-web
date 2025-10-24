# Monitor Render Deployment - Admin Endpoints Fix

Write-Host "`n🔍 Monitoring Render Deployment Status" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

$maxAttempts = 20
$attempt = 0
$deployed = $false

Write-Host "`n⏳ Waiting for deployment to complete..." -ForegroundColor Yellow
Write-Host "   Expected time: 3-5 minutes`n" -ForegroundColor Gray

while ($attempt -lt $maxAttempts -and -not $deployed) {
    $attempt++
    
    try {
        Write-Host "[Attempt $attempt/$maxAttempts] Checking backend health..." -NoNewline
        
        $response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method Get -TimeoutSec 10
        
        if ($response.status -eq "OK") {
            Write-Host " ✅ Online" -ForegroundColor Green
            Write-Host "   Version: $($response.version)" -ForegroundColor Gray
            Write-Host "   Uptime: $([math]::Round($response.uptime / 60, 2)) minutes" -ForegroundColor Gray
            
            # Check if uptime is less than 2 minutes (indicates recent deployment)
            if ($response.uptime -lt 120) {
                Write-Host "`n🎉 NEW DEPLOYMENT DETECTED!" -ForegroundColor Green
                Write-Host "   Backend was recently restarted (uptime: $([math]::Round($response.uptime / 60, 2)) min)" -ForegroundColor Green
                $deployed = $true
            } else {
                Write-Host "   Status: Waiting for deployment (uptime too high)" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host " ❌ Offline or Error" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
    
    if (-not $deployed) {
        Write-Host "   Next check in 15 seconds...`n" -ForegroundColor Gray
        Start-Sleep -Seconds 15
    }
}

if ($deployed) {
    Write-Host "`n" -ForegroundColor Green
    Write-Host "=" * 80 -ForegroundColor Green
    Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host "=" * 80 -ForegroundColor Green
    
    Write-Host "`n📊 Testing new endpoints..." -ForegroundColor Cyan
    
    # Test if the new endpoint exists (even without auth, it should return 401 instead of 404)
    Write-Host "`n1. Testing approve endpoint..." -NoNewline
    try {
        $approveTest = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/admin/documents/test-id/approve" -Method POST -SkipHttpErrorCheck
        
        if ($approveTest.StatusCode -eq 404) {
            Write-Host " ❌ NOT DEPLOYED (404)" -ForegroundColor Red
        } elseif ($approveTest.StatusCode -eq 401 -or $approveTest.StatusCode -eq 403) {
            Write-Host " ✅ ENDPOINT EXISTS (Auth required)" -ForegroundColor Green
        } else {
            Write-Host " ⚠️  Status: $($approveTest.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ⚠️  Could not test" -ForegroundColor Yellow
    }
    
    Write-Host "`n2. Testing reject endpoint..." -NoNewline
    try {
        $rejectTest = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/admin/documents/test-id/reject" -Method POST -SkipHttpErrorCheck
        
        if ($rejectTest.StatusCode -eq 404) {
            Write-Host " ❌ NOT DEPLOYED (404)" -ForegroundColor Red
        } elseif ($rejectTest.StatusCode -eq 401 -or $rejectTest.StatusCode -eq 403) {
            Write-Host " ✅ ENDPOINT EXISTS (Auth required)" -ForegroundColor Green
        } else {
            Write-Host " ⚠️  Status: $($rejectTest.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ⚠️  Could not test" -ForegroundColor Yellow
    }
    
    Write-Host "`n`n✨ Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Open admin panel: https://weddingbazaarph.web.app" -ForegroundColor White
    Write-Host "   2. Login with admin credentials" -ForegroundColor White
    Write-Host "   3. Navigate to Document Verification" -ForegroundColor White
    Write-Host "   4. Test approve/reject buttons" -ForegroundColor White
    Write-Host "   5. Check browser console for errors`n" -ForegroundColor White
    
} else {
    Write-Host "`n" -ForegroundColor Red
    Write-Host "=" * 80 -ForegroundColor Red
    Write-Host "⏰ TIMEOUT - Deployment may still be in progress" -ForegroundColor Red
    Write-Host "=" * 80 -ForegroundColor Red
    Write-Host "`n📊 Manual Verification:" -ForegroundColor Yellow
    Write-Host "   1. Check Render dashboard: https://dashboard.render.com" -ForegroundColor White
    Write-Host "   2. Look for 'Deploy live' event" -ForegroundColor White
    Write-Host "   3. Re-run this script: .\monitor-admin-deployment.ps1`n" -ForegroundColor White
}

Write-Host "`n🔗 Useful Links:" -ForegroundColor Cyan
Write-Host "   Backend: https://weddingbazaar-web.onrender.com/api/health" -ForegroundColor White
Write-Host "   Frontend: https://weddingbazaarph.web.app" -ForegroundColor White
Write-Host "   Render Dashboard: https://dashboard.render.com`n" -ForegroundColor White
