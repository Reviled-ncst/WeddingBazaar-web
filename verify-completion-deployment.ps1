#!/usr/bin/env pwsh
# Verify Two-Sided Completion System Deployment

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   COMPLETION SYSTEM DEPLOYMENT VERIFICATION" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Test 1: Frontend Accessibility
Write-Host "Test 1: Frontend Accessibility..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "https://weddingbazaarph.web.app" -Method GET -UseBasicParsing -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "  PASS Frontend is accessible (200 OK)" -ForegroundColor Green
    } else {
        Write-Host "  FAIL Frontend returned status: $($frontendResponse.StatusCode)" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  FAIL Frontend not accessible" -ForegroundColor Red
    $allPassed = $false
}
Write-Host ""

# Test 2: Backend Health Check
Write-Host "Test 2: Backend Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method GET -UseBasicParsing -TimeoutSec 10
    $health = $healthResponse.Content | ConvertFrom-Json
    
    Write-Host "  Status: $($health.status)" -ForegroundColor White
    Write-Host "  Database: $($health.database)" -ForegroundColor White
    Write-Host "  Version: $($health.version)" -ForegroundColor White
    
    if ($health.status -eq "OK" -and $health.database -eq "Connected") {
        Write-Host "  PASS Backend is healthy" -ForegroundColor Green
    } else {
        Write-Host "  FAIL Backend health check failed" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  FAIL Backend health check failed" -ForegroundColor Red
    $allPassed = $false
}
Write-Host ""

# Test 3: Check Source Files
Write-Host "Test 3: Source Files..." -ForegroundColor Yellow

$requiredFiles = @(
    "src/shared/services/completionService.ts",
    "src/shared/services/bookingCompletionService.ts",
    "backend-deploy/routes/booking-completion.cjs",
    "add-completion-tracking.cjs"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  PASS $file" -ForegroundColor Green
    } else {
        Write-Host "  FAIL $file MISSING" -ForegroundColor Red
        $allPassed = $false
    }
}
Write-Host ""

# Summary
Write-Host "================================================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "   ALL TESTS PASSED - SYSTEM OPERATIONAL" -ForegroundColor Green
} else {
    Write-Host "   SOME TESTS FAILED - REVIEW ABOVE" -ForegroundColor Yellow
}
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Manual Verification Steps:" -ForegroundColor Cyan
Write-Host "1. Visit: https://weddingbazaarph.web.app/individual/bookings" -ForegroundColor White
Write-Host "2. Login as a couple user" -ForegroundColor White
Write-Host "3. Find a booking with Fully Paid status" -ForegroundColor White
Write-Host "4. Look for the green Mark as Complete button" -ForegroundColor White
Write-Host "5. Click and verify modal appears" -ForegroundColor White
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  - TWO_SIDED_COMPLETION_DEPLOYED_LIVE.md" -ForegroundColor White
Write-Host "  - TWO_SIDED_COMPLETION_SYSTEM.md" -ForegroundColor White
Write-Host ""
