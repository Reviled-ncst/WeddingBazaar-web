#!/usr/bin/env pwsh

# Backend 500 Error Fix - Deployment Monitor
# Monitors the /api/admin/documents endpoint after Render deployment

Write-Host "📡 Backend Fix Deployment Monitor" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

$backendUrl = "https://weddingbazaar-web.onrender.com"
$documentsEndpoint = "$backendUrl/api/admin/documents"
$healthEndpoint = "$backendUrl/api/health"

Write-Host "🎯 Target Endpoints:" -ForegroundColor Yellow
Write-Host "   - Health: $healthEndpoint"
Write-Host "   - Documents: $documentsEndpoint`n"

# Function to test endpoint
function Test-Endpoint {
    param (
        [string]$Url,
        [string]$Name
    )
    
    try {
        Write-Host "Testing $Name..." -NoNewline
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 30 -ErrorAction Stop
        
        if ($response.success) {
            Write-Host " SUCCESS" -ForegroundColor Green
            return $true
        } else {
            Write-Host " Response indicates failure" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host " ERROR" -ForegroundColor Red
        Write-Host "   Details: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
}

# Monitor loop
$maxAttempts = 30
$attemptCount = 0
$deploymentSuccess = $false

Write-Host "⏳ Monitoring deployment..." -ForegroundColor Cyan
Write-Host "   (Will check every 10 seconds for up to 5 minutes)`n"

while ($attemptCount -lt $maxAttempts -and -not $deploymentSuccess) {
    $attemptCount++
    Write-Host "`n🔄 Attempt $attemptCount/$maxAttempts" -ForegroundColor Cyan
    Write-Host "─────────────────────────────"
    
    # Test health endpoint first
    $healthOk = Test-Endpoint -Url $healthEndpoint -Name "Health Check"
    
    if ($healthOk) {
        # Test documents endpoint
        $documentsOk = Test-Endpoint -Url $documentsEndpoint -Name "Documents API"
        
        if ($documentsOk) {
            Write-Host "`n🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
            Write-Host "✅ Backend fix is live and working" -ForegroundColor Green
            $deploymentSuccess = $true
            break
        }
    }
    
    if ($attemptCount -lt $maxAttempts -and -not $deploymentSuccess) {
        Write-Host "`n⏰ Waiting 10 seconds before next check..." -ForegroundColor Gray
        Start-Sleep -Seconds 10
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan

if ($deploymentSuccess) {
    Write-Host "✅ DEPLOYMENT VERIFIED" -ForegroundColor Green
    Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Test frontend: https://weddingbazaarph.web.app/admin/documents"
    Write-Host "   2. Check Render logs for SQL query logs"
    Write-Host "   3. Test status filters (pending, approved, rejected)"
    Write-Host "   4. Verify no 500 errors in browser console"
} else {
    Write-Host "⚠️  DEPLOYMENT VERIFICATION INCOMPLETE" -ForegroundColor Yellow
    Write-Host "`n🔧 Troubleshooting Steps:" -ForegroundColor Yellow
    Write-Host "   1. Check Render dashboard: https://dashboard.render.com"
    Write-Host "   2. View deployment logs in Render"
    Write-Host "   3. Verify GitHub push was successful"
    Write-Host "   4. Check for build errors"
    Write-Host "   5. Manually test: $documentsEndpoint"
}

Write-Host "`n📊 Render Dashboard:" -ForegroundColor Cyan
Write-Host "   https://dashboard.render.com`n"
