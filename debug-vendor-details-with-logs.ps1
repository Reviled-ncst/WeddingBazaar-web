#!/usr/bin/env pwsh
# Vendor Details Endpoint Debugging Script with Enhanced Logging
# This script monitors deployment and tests the /details endpoint with full error output

Write-Host "`n🔍 VENDOR DETAILS DEBUGGING SCRIPT v3.2-DEBUG" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

$backendUrl = "https://weddingbazaar-web.onrender.com"
$testVendorId = "2-2025-003"

# Function to test endpoint with full error details
function Test-VendorDetails {
    param($vendorId)
    
    Write-Host "`n📋 Testing: $backendUrl/api/vendors/$vendorId/details" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$backendUrl/api/vendors/$vendorId/details" `
            -Method GET `
            -ErrorAction Stop `
            -ContentType "application/json"
        
        $data = $response.Content | ConvertFrom-Json
        
        if ($data.success) {
            Write-Host "✅ SUCCESS!" -ForegroundColor Green
            Write-Host "   Vendor: $($data.vendor.name)" -ForegroundColor Green
            Write-Host "   Category: $($data.vendor.category)" -ForegroundColor Green
            Write-Host "   Rating: $($data.vendor.rating) ⭐" -ForegroundColor Green
            Write-Host "   Services: $($data.services.Count)" -ForegroundColor Green
            Write-Host "   Reviews: $($data.reviews.Count)" -ForegroundColor Green
            
            if ($data.vendor.pricing) {
                Write-Host "   💰 Pricing:" -ForegroundColor Green
                Write-Host "      Range: $($data.vendor.pricing.priceRange)" -ForegroundColor Green
                Write-Host "      Min: $($data.vendor.pricing.priceRangeMin)" -ForegroundColor Green
                Write-Host "      Max: $($data.vendor.pricing.priceRangeMax)" -ForegroundColor Green
            }
            
            return $true
        } else {
            Write-Host "❌ API Error: $($data.error)" -ForegroundColor Red
            return $false
        }
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ HTTP ERROR: $statusCode" -ForegroundColor Red
        
        # Try to get response body
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $errorData = $responseBody | ConvertFrom-Json
            
            Write-Host "   Error Message: $($errorData.error)" -ForegroundColor Red
            Write-Host "   Error Type: $($errorData.errorType)" -ForegroundColor Red
            Write-Host "   Vendor ID: $($errorData.vendorId)" -ForegroundColor Red
            Write-Host "   Timestamp: $($errorData.timestamp)" -ForegroundColor Red
            
            if ($responseBody) {
                Write-Host "`n📄 Full Error Response:" -ForegroundColor Red
                Write-Host $responseBody -ForegroundColor DarkRed
            }
        } catch {
            Write-Host "   Could not parse error response" -ForegroundColor Red
        }
        
        return $false
    }
}

# Step 1: Check backend health
Write-Host "`n🏥 Step 1: Checking backend health..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "$backendUrl/api/health" -Method GET
    Write-Host "✅ Backend is healthy" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor White
    Write-Host "   Database: $($health.database)" -ForegroundColor White
    Write-Host "   Uptime: $($health.uptime)s" -ForegroundColor White
} catch {
    Write-Host "❌ Backend health check failed" -ForegroundColor Red
    exit 1
}

# Step 2: Wait for deployment (check uptime)
Write-Host "`n⏳ Step 2: Checking if deployment is fresh..." -ForegroundColor Cyan
if ($health.uptime -lt 120) {
    Write-Host "⚡ Fresh deployment detected (uptime: $($health.uptime)s)" -ForegroundColor Yellow
    Write-Host "   Waiting 15 seconds for complete initialization..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
} else {
    Write-Host "✅ Backend has been running for $($health.uptime)s" -ForegroundColor Green
}

# Step 3: Test vendor details endpoint
Write-Host "`n🧪 Step 3: Testing vendor details endpoint..." -ForegroundColor Cyan
$success = Test-VendorDetails -vendorId $testVendorId

# Step 4: Try with different vendor IDs
if (-not $success) {
    Write-Host "`n🔄 Step 4: Trying alternative vendor IDs..." -ForegroundColor Cyan
    
    $alternativeIds = @("1-2025-001", "3-2025-004", "4-2025-005", "5-2025-006")
    
    foreach ($altId in $alternativeIds) {
        Write-Host "`n   Testing vendor: $altId" -ForegroundColor Yellow
        $altSuccess = Test-VendorDetails -vendorId $altId
        if ($altSuccess) {
            Write-Host "   ✅ This vendor ID works!" -ForegroundColor Green
            break
        }
    }
}

# Step 5: Check Render logs reminder
Write-Host "`n📊 Step 5: Render Logs Check" -ForegroundColor Cyan
Write-Host "   If errors persist, check Render logs at:" -ForegroundColor Yellow
Write-Host "   https://dashboard.render.com/web/srv-ctdj1d5umphs738k8880/logs" -ForegroundColor Blue
Write-Host "`n   Look for these log markers:" -ForegroundColor Yellow
Write-Host "   - [VENDORS] GET /api/vendors/*/details called" -ForegroundColor White
Write-Host "   - [VENDORS] Querying vendor: *" -ForegroundColor White
Write-Host "   - [VENDORS] Found vendor: *" -ForegroundColor White
Write-Host "   - [VENDORS] Calculating pricing for vendor *" -ForegroundColor White
Write-Host "   - [VENDORS] * error: *" -ForegroundColor White

Write-Host "`n" -NoNewline
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "🔍 Debugging Complete!" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "`n"
