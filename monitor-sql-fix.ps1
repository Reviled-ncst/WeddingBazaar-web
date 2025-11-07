# Monitor SQL Fix Deployment
Write-Host "Monitoring Render Deployment..." -ForegroundColor Cyan
Write-Host ("="*60)
Write-Host ""

$backendUrl = "https://weddingbazaar-web.onrender.com"
$vendorId = "2-2025-003"
$maxAttempts = 20
$attempt = 0

Write-Host "Starting deployment monitor..." -ForegroundColor Yellow
Write-Host "Checking every 15 seconds for up to 5 minutes"
Write-Host ""

while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "[$attempt/$maxAttempts] Testing endpoint..." -NoNewline
    
    try {
        # Test health endpoint first
        $null = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method GET -TimeoutSec 5
        Write-Host " Backend is UP" -ForegroundColor Green
        
        # Now test the vendor services endpoint
        Write-Host "Testing vendor services..." -NoNewline
        $services = Invoke-RestMethod -Uri "$backendUrl/api/services/vendor/$vendorId" -Method GET -TimeoutSec 10
        
        Write-Host " FIXED!" -ForegroundColor Green
        Write-Host ""
        Write-Host ("="*60)
        Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
        Write-Host ("="*60)
        Write-Host ""
        Write-Host "Results:" -ForegroundColor Cyan
        Write-Host "Services found: $($services.count)"
        Write-Host "Has itemization: $($services.services[0].has_itemization)"
        Write-Host "Packages: $($services.services[0].packages.Count)"
        Write-Host ""
        Write-Host "Ready to run full test script!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Run: .\COMPLETE_TEST_SCRIPT.ps1" -ForegroundColor Yellow
        Write-Host ""
        exit 0
        
    } catch {
    } catch {
        if ($_.Exception.Message -like "*500*") {
            Write-Host " Still 500 (deploying...)" -ForegroundColor Yellow
        } elseif ($_.Exception.Message -like "*timeout*" -or $_.Exception.Message -like "*Unable to connect*") {
            Write-Host " Backend starting up..." -ForegroundColor Yellow
        } else {
            Write-Host " Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    if ($attempt -lt $maxAttempts) {
        Write-Host "Waiting 15 seconds..." -ForegroundColor Gray
        Start-Sleep -Seconds 15
    }
}

Write-Host ""
Write-Host ("="*60)
Write-Host "Deployment taking longer than expected" -ForegroundColor Yellow
Write-Host ("="*60)
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Check Render dashboard"
Write-Host "2. Look for build/deploy errors"
Write-Host "3. Try again in 2-3 minutes"
Write-Host "4. Or run: .\COMPLETE_TEST_SCRIPT.ps1"
Write-Host ""
