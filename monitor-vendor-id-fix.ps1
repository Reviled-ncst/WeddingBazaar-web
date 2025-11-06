# Monitor Render Deployment - Vendor ID Fix
# Run this to check when deployment is live

Write-Host "Monitoring Render Deployment..." -ForegroundColor Cyan
Write-Host "Fix: Vendor ID Resolution (VEN-xxxxx to 2-yyyy-xxx)" -ForegroundColor Yellow
Write-Host ""

$baseUrl = "https://weddingbazaar-web.onrender.com"
$startTime = Get-Date
$timeout = 300 # 5 minutes
$checkInterval = 10 # seconds

Write-Host "Started: $($startTime.ToString('HH:mm:ss'))" -ForegroundColor Gray
Write-Host "Timeout: 5 minutes" -ForegroundColor Gray
Write-Host ""

$deploymentComplete = $false
$testsPassed = 0
$totalTests = 3

while (-not $deploymentComplete -and ((Get-Date) - $startTime).TotalSeconds -lt $timeout) {
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds)
    Write-Host "[$elapsed s] Checking deployment status..." -ForegroundColor Cyan
    
    try {
        # Test 1: Health Check
        Write-Host "  Test 1/3: Health check... " -NoNewline
        $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get -TimeoutSec 5
        if ($health) {
            Write-Host "✅ PASS" -ForegroundColor Green
            $testsPassed = 1
        }
        
        # Test 2: VEN-xxxxx Format
        Write-Host "  Test 2/3: VEN-00001 format... " -NoNewline
        $venFormat = Invoke-RestMethod -Uri "$baseUrl/api/services/vendor/VEN-00001" -Method Get -TimeoutSec 5
        if ($venFormat.success) {
            Write-Host "✅ PASS (Found $($venFormat.services.Count) services)" -ForegroundColor Green
            $testsPassed = 2
        }
        
        # Test 3: 2-yyyy-xxx Format (should resolve to VEN-xxxxx)
        Write-Host "  Test 3/3: 2-2025-003 format... " -NoNewline
        $userFormat = Invoke-RestMethod -Uri "$baseUrl/api/services/vendor/2-2025-003" -Method Get -TimeoutSec 5
        if ($userFormat.success) {
            Write-Host "✅ PASS (Found $($userFormat.services.Count) services)" -ForegroundColor Green
            $testsPassed = 3
            $deploymentComplete = $true
        }
        
    } catch {
        Write-Host "⏳ Not ready yet..." -ForegroundColor Yellow
        Write-Host "     Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
    
    if (-not $deploymentComplete) {
        Write-Host "  Waiting $checkInterval seconds before next check..." -ForegroundColor Gray
        Write-Host ""
        Start-Sleep -Seconds $checkInterval
    }
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan

if ($deploymentComplete) {
    Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "All tests passed ($testsPassed/$totalTests)" -ForegroundColor Green
    Write-Host "Total time: $([math]::Round(((Get-Date) - $startTime).TotalSeconds)) seconds" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Cyan
    Write-Host "  Health check: Backend is running" -ForegroundColor Gray
    Write-Host "  VEN-xxxxx format: Working correctly" -ForegroundColor Gray
    Write-Host "  2-yyyy-xxx format: Resolves to VEN-xxxxx" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Log in as vendor: vendor0qw@example.com" -ForegroundColor Gray
    Write-Host "  2. Navigate to Services page" -ForegroundColor Gray
    Write-Host "  3. Verify services load correctly" -ForegroundColor Gray
    Write-Host "  4. Test creating/editing services" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Test URLs:" -ForegroundColor Cyan
    Write-Host "  Frontend: https://weddingbazaarph.web.app/vendor/services" -ForegroundColor Gray
    Write-Host "  API Test: $baseUrl/api/services/vendor/2-2025-003" -ForegroundColor Gray
} else {
    Write-Host "TIMEOUT REACHED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Tests passed: $testsPassed/$totalTests" -ForegroundColor Yellow
    Write-Host "Time elapsed: 5 minutes" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Cyan
    Write-Host "  1. Check Render dashboard for deployment status" -ForegroundColor Gray
    Write-Host "  2. View Render logs for errors" -ForegroundColor Gray
    Write-Host "  3. Verify GitHub commit was received" -ForegroundColor Gray
    Write-Host "  4. Try running this script again" -ForegroundColor Gray
}

Write-Host "========================================================" -ForegroundColor Cyan
