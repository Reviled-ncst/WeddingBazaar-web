#!/usr/bin/env pwsh
# Monitor Vendor Details Fix Deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 Monitoring Vendor Details Fix Deployment" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$backendUrl = "https://weddingbazaar-web.onrender.com"
$testVendorId = "2-2025-003"  # Known vendor from featured list
$maxAttempts = 20
$attempt = 0
$deploymentComplete = $false

Write-Host "⏳ Waiting for Render to deploy new version..." -ForegroundColor Yellow
Write-Host "📝 Looking for version 'v3' in logs`n" -ForegroundColor Yellow

while (-not $deploymentComplete -and $attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "[$attempt/$maxAttempts] Checking backend health..." -ForegroundColor Gray
    
    try {
        # Check backend health and version
        $health = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method Get -ErrorAction SilentlyContinue
        $version = $health.version
        
        Write-Host "  Backend version: $version" -ForegroundColor White
        
        # Check if new version is deployed (should contain vendor details v3)
        if ($version -like "*2.7*") {
            Write-Host "  ✅ Backend is running" -ForegroundColor Green
            
            # Now test the vendor details endpoint
            Write-Host "`n  Testing vendor details endpoint..." -ForegroundColor Yellow
            
            try {
                $details = Invoke-RestMethod -Uri "$backendUrl/api/vendors/$testVendorId/details" -Method Get -ErrorAction Stop
                
                if ($details.success) {
                    Write-Host "  ✅ Vendor details endpoint is working!" -ForegroundColor Green
                    Write-Host "`n========================================" -ForegroundColor Green
                    Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
                    Write-Host "========================================" -ForegroundColor Green
                    
                    Write-Host "`n📊 Vendor Details:" -ForegroundColor Cyan
                    Write-Host "  Name: $($details.vendor.name)" -ForegroundColor White
                    Write-Host "  Category: $($details.vendor.category)" -ForegroundColor White
                    Write-Host "  Rating: $($details.vendor.rating) - Reviews: $($details.vendor.reviewCount)" -ForegroundColor White
                    Write-Host "  Services: $($details.services.Count)" -ForegroundColor White
                    Write-Host "  Reviews: $($details.reviews.Count)" -ForegroundColor White
                    Write-Host "  Price Range: $($details.vendor.pricing.priceRange)" -ForegroundColor White
                    
                    $deploymentComplete = $true
                } else {
                    Write-Host "  ⚠️ Endpoint returned success=false" -ForegroundColor Yellow
                }
            } catch {
                $statusCode = $_.Exception.Response.StatusCode.value__
                Write-Host "  ❌ Endpoint returned error: $statusCode" -ForegroundColor Red
                Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
    } catch {
        Write-Host "  ⚠️ Backend not responding yet..." -ForegroundColor Yellow
    }
    
    if (-not $deploymentComplete) {
        Write-Host "`n  Waiting 15 seconds before next check...`n" -ForegroundColor Gray
        Start-Sleep -Seconds 15
    }
}

if (-not $deploymentComplete) {
    Write-Host "`n========================================" -ForegroundColor Red
    Write-Host "⏰ Timeout: Deployment taking longer than expected" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "`nPlease check Render logs manually:" -ForegroundColor Yellow
    Write-Host "https://dashboard.render.com/web/srv-ctap0npu0jms73dekhd0" -ForegroundColor Cyan
    Write-Host "`nOr test manually:" -ForegroundColor Yellow
    Write-Host "Invoke-RestMethod -Uri '$backendUrl/api/vendors/$testVendorId/details' -Method Get | ConvertTo-Json -Depth 10" -ForegroundColor Cyan
}

Write-Host "`n✅ Monitoring complete" -ForegroundColor Green
