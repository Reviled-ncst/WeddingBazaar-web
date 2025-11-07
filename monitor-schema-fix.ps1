#!/usr/bin/env pwsh
# Monitor Schema Fix Deployment

Write-Host "`n=== SCHEMA FIX DEPLOYMENT MONITOR ===" -ForegroundColor Cyan
Write-Host "Waiting for Render to deploy column name fixes..." -ForegroundColor Yellow
Write-Host ""

$maxAttempts = 30
$attempt = 0
$deployed = $false

while ($attempt -lt $maxAttempts -and -not $deployed) {
    $attempt++
    Write-Host "[$attempt/$maxAttempts] Checking deployment status..." -ForegroundColor Gray
    
    try {
        # Check health endpoint
        $response = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -UseBasicParsing -TimeoutSec 10
        $health = $response.Content | ConvertFrom-Json
        
        Write-Host "  Backend version: $($health.version)" -ForegroundColor Cyan
        Write-Host "  Uptime: $([math]::Round($health.uptime, 2)) seconds" -ForegroundColor Gray
        
        # Check if it's a new deployment (uptime < 60 seconds and version changed)
        if ($health.uptime -lt 60) {
            Write-Host "  NEW DEPLOYMENT DETECTED! Testing vendor endpoint..." -ForegroundColor Green
            
            # Test the vendor services endpoint
            try {
                $vendorResponse = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/services/vendor/2-2025-003" -UseBasicParsing -TimeoutSec 10
                $vendorData = $vendorResponse.Content | ConvertFrom-Json
                
                if ($vendorData.success) {
                    Write-Host "`n SUCCESS! Schema fix is LIVE!" -ForegroundColor Green -BackgroundColor Black
                    Write-Host "  Services found: $($vendorData.services.Count)" -ForegroundColor Green
                    
                    if ($vendorData.services.Count -gt 0) {
                        $service = $vendorData.services[0]
                        Write-Host "  Sample service: $($service.title)" -ForegroundColor Cyan
                        Write-Host "  Packages: $($service.packages.Count)" -ForegroundColor Cyan
                        Write-Host "  Add-ons: $($service.addons.Count)" -ForegroundColor Cyan
                    }
                    
                    $deployed = $true
                    break
                }
            } catch {
                $errorBody = ""
                if ($_.Exception.Response) {
                    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                    $errorBody = $reader.ReadToEnd()
                }
                Write-Host "  Still getting error: $errorBody" -ForegroundColor Red
            }
        }
        
        Write-Host "  Waiting 10 seconds before next check..." -ForegroundColor Gray
        Start-Sleep -Seconds 10
        
    } catch {
        Write-Host "  Error checking health: $_" -ForegroundColor Red
        Start-Sleep -Seconds 10
    }
}

if ($deployed) {
    Write-Host "`n=== DEPLOYMENT SUCCESSFUL ===" -ForegroundColor Green
    Write-Host "Schema fixes are now LIVE in production!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Run: .\test-package-persistence.ps1" -ForegroundColor White
    Write-Host "2. Create a test service in the UI" -ForegroundColor White
    Write-Host "3. Verify all packages and items are saved" -ForegroundColor White
} else {
    Write-Host "`n=== TIMEOUT ===" -ForegroundColor Yellow
    Write-Host "Deployment taking longer than expected." -ForegroundColor Yellow
    Write-Host "Check Render dashboard: https://dashboard.render.com" -ForegroundColor Cyan
}

Write-Host ""
