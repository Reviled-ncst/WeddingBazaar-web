#!/usr/bin/env pwsh
# Monitor Vendor Service Fix Deployment
# Checks Render deployment status and tests services endpoint

Write-Host "🔍 MONITORING VENDOR SERVICE FIX DEPLOYMENT" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

$renderUrl = "https://weddingbazaar-web.onrender.com"
$vendorUuid = "6fe3dc77-6774-4de8-ae2e-81a8ffb258f6"
$expectedServiceCount = 29

# Function to test endpoint
function Test-Endpoint {
    param($url, $name)
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $name - OK (200)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  $name - Status: $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ $name - ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to count services
function Test-ServicesEndpoint {
    param($url)
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 10
        $count = $response.services.Count
        
        Write-Host "`n📊 SERVICES RESPONSE:" -ForegroundColor Cyan
        Write-Host "   Services Found: $count" -ForegroundColor $(if($count -gt 0){"Green"}else{"Red"})
        Write-Host "   Expected: $expectedServiceCount" -ForegroundColor White
        
        if ($count -eq $expectedServiceCount) {
            Write-Host "   ✅ SERVICE COUNT MATCHES!" -ForegroundColor Green
            
            # Show first 3 services
            Write-Host "`n   Sample Services:" -ForegroundColor Cyan
            $response.services | Select-Object -First 3 | ForEach-Object {
                Write-Host "      - $($_.service_name) (PHP $($_.base_price))" -ForegroundColor White
            }
            
            return $true
        } elseif ($count -gt 0) {
            Write-Host "   ⚠️  Found $count services, expected $expectedServiceCount" -ForegroundColor Yellow
            return $false
        } else {
            Write-Host "   ❌ NO SERVICES FOUND" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main monitoring loop
$attempt = 1
$maxAttempts = 10
$waitSeconds = 20

Write-Host "Starting deployment monitoring..." -ForegroundColor White
Write-Host "Will check every $waitSeconds seconds for up to $maxAttempts attempts`n" -ForegroundColor Gray

while ($attempt -le $maxAttempts) {
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host "🔄 Attempt $attempt of $maxAttempts" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Gray
    
    # Test health endpoint
    Write-Host "`n1️⃣ Testing Backend Health..." -ForegroundColor White
    $healthOk = Test-Endpoint "$renderUrl/api/health" "Health Endpoint"
    
    if ($healthOk) {
        # Test services endpoint
        Write-Host "`n2️⃣ Testing Vendor Services Endpoint..." -ForegroundColor White
        $servicesUrl = "$renderUrl/api/vendors/$vendorUuid/services"
        Write-Host "   URL: $servicesUrl" -ForegroundColor Gray
        
        $servicesOk = Test-ServicesEndpoint $servicesUrl
        
        if ($servicesOk) {
            Write-Host "`n" + ("=" * 60) -ForegroundColor Green
            Write-Host "🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
            Write-Host ("=" * 60) -ForegroundColor Green
            Write-Host "`n✅ Backend is live and returning all $expectedServiceCount services" -ForegroundColor Green
            Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
            Write-Host "   1. Login to: https://weddingbazaarph.web.app/vendor/login" -ForegroundColor White
            Write-Host "   2. Navigate to My Services" -ForegroundColor White
            Write-Host "   3. Verify all services are visible" -ForegroundColor White
            Write-Host "   4. Check Add Service button is enabled`n" -ForegroundColor White
            exit 0
        }
    }
    
    if ($attempt -lt $maxAttempts) {
        Write-Host "`n⏳ Waiting $waitSeconds seconds before next check..." -ForegroundColor Yellow
        Start-Sleep -Seconds $waitSeconds
    }
    
    $attempt++
    Write-Host "`n"
}

Write-Host "=" * 60 -ForegroundColor Red
Write-Host "⚠️  DEPLOYMENT TIMEOUT" -ForegroundColor Red
Write-Host "=" * 60 -ForegroundColor Red
Write-Host "`nBackend did not respond as expected after $maxAttempts attempts." -ForegroundColor Yellow
Write-Host "`n📋 Troubleshooting Steps:" -ForegroundColor Cyan
Write-Host "   1. Check Render dashboard: https://dashboard.render.com/web/srv-crsjqtij1k6c73c9kgsg" -ForegroundColor White
Write-Host "   2. View deployment logs in Render" -ForegroundColor White
Write-Host "   3. Check for error messages" -ForegroundColor White
Write-Host "   4. Verify environment variables are set" -ForegroundColor White
Write-Host "`n🔗 Manual Test:" -ForegroundColor Cyan
Write-Host "   curl $renderUrl/api/health" -ForegroundColor Gray
Write-Host "   curl $renderUrl/api/vendors/$vendorUuid/services`n" -ForegroundColor Gray

exit 1
