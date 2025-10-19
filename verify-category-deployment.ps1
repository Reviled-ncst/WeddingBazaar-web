#!/usr/bin/env pwsh

# ============================================================================
# CATEGORY ENDPOINTS DEPLOYMENT VERIFICATION
# ============================================================================
# This script verifies that the category routes are properly deployed
# and returning data from the production backend.
#
# Usage: .\verify-category-deployment.ps1
# ============================================================================

Write-Host "🎯 Wedding Bazaar - Category Endpoints Verification" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""

$BACKEND_URL = "https://wedding-bazaar-backend.onrender.com"
$ENDPOINTS = @(
    @{ Name = "Health Check"; Url = "$BACKEND_URL/api/health"; Required = $true }
    @{ Name = "Categories List"; Url = "$BACKEND_URL/api/categories"; Required = $true }
    @{ Name = "Category Features"; Url = "$BACKEND_URL/api/categories/1/features"; Required = $false }
    @{ Name = "Common Features"; Url = "$BACKEND_URL/api/categories/features/common"; Required = $false }
    @{ Name = "Price Ranges"; Url = "$BACKEND_URL/api/categories/price-ranges"; Required = $false }
)

$results = @{
    Passed = 0
    Failed = 0
    Warnings = 0
    Details = @()
}

# Function to test an endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [bool]$Required
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 10
        
        # Check if response has expected structure
        if ($response.success -eq $true) {
            Write-Host " ✅ PASS" -ForegroundColor Green
            
            # Additional checks based on endpoint
            if ($Name -eq "Categories List" -and $response.categories) {
                Write-Host "  → Found $($response.total) categories" -ForegroundColor Gray
                
                if ($response.total -eq 0) {
                    Write-Host "  ⚠️  WARNING: No categories in database (expected 15)" -ForegroundColor Yellow
                    $results.Warnings++
                } elseif ($response.total -lt 15) {
                    Write-Host "  ⚠️  WARNING: Only $($response.total) categories (expected 15)" -ForegroundColor Yellow
                    $results.Warnings++
                } else {
                    Write-Host "  ✅ Correct number of categories" -ForegroundColor Green
                }
                
                # Show sample categories
                if ($response.categories.Count -gt 0) {
                    Write-Host "  → Sample categories:" -ForegroundColor Gray
                    $response.categories | Select-Object -First 3 | ForEach-Object {
                        Write-Host "    • $($_.display_name) ($($_.name))" -ForegroundColor DarkGray
                    }
                }
            }
            
            $results.Passed++
            return @{ Success = $true; Response = $response }
        } else {
            Write-Host " ❌ FAIL: Invalid response format" -ForegroundColor Red
            Write-Host "  → Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor DarkRed
            $results.Failed++
            return @{ Success = $false; Error = "Invalid response format" }
        }
    } catch {
        $errorMsg = $_.Exception.Message
        
        if ($errorMsg -like "*404*") {
            Write-Host " ❌ FAIL: Endpoint not found (404)" -ForegroundColor Red
            $results.Failed++
            return @{ Success = $false; Error = "404 Not Found - Route not registered" }
        } elseif ($errorMsg -like "*timeout*") {
            Write-Host " ⚠️  WARNING: Timeout" -ForegroundColor Yellow
            $results.Warnings++
            return @{ Success = $false; Error = "Timeout - Backend may be cold starting" }
        } else {
            Write-Host " ❌ FAIL: $errorMsg" -ForegroundColor Red
            if ($Required) {
                $results.Failed++
            } else {
                $results.Warnings++
            }
            return @{ Success = $false; Error = $errorMsg }
        }
    }
}

# Test all endpoints
Write-Host "📡 Testing Category Endpoints..." -ForegroundColor Cyan
Write-Host ""

foreach ($endpoint in $ENDPOINTS) {
    $result = Test-Endpoint -Name $endpoint.Name -Url $endpoint.Url -Required $endpoint.Required
    $results.Details += @{
        Name = $endpoint.Name
        Url = $endpoint.Url
        Required = $endpoint.Required
        Result = $result
    }
    Write-Host ""
}

# Summary
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host "📊 Verification Summary" -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Gray
Write-Host ""
Write-Host "  ✅ Passed: $($results.Passed)" -ForegroundColor Green
Write-Host "  ❌ Failed: $($results.Failed)" -ForegroundColor Red
Write-Host "  ⚠️  Warnings: $($results.Warnings)" -ForegroundColor Yellow
Write-Host ""

# Detailed results
Write-Host "📋 Detailed Results:" -ForegroundColor Cyan
Write-Host ""
foreach ($detail in $results.Details) {
    $status = if ($detail.Result.Success) { "✅ PASS" } else { "❌ FAIL" }
    $required = if ($detail.Required) { "[REQUIRED]" } else { "[OPTIONAL]" }
    
    Write-Host "  $status $($detail.Name) $required" -ForegroundColor $(if ($detail.Result.Success) { "Green" } else { "Red" })
    Write-Host "    URL: $($detail.Url)" -ForegroundColor DarkGray
    
    if (-not $detail.Result.Success -and $detail.Result.Error) {
        Write-Host "    Error: $($detail.Result.Error)" -ForegroundColor DarkRed
    }
    Write-Host ""
}

# Final verdict
Write-Host "=" * 70 -ForegroundColor Gray
if ($results.Failed -eq 0) {
    Write-Host "🎉 DEPLOYMENT VERIFICATION PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ All category endpoints are working correctly!" -ForegroundColor Green
    Write-Host "✅ Frontend can now load categories dynamically!" -ForegroundColor Green
    Write-Host ""
    
    if ($results.Warnings -gt 0) {
        Write-Host "⚠️  There are $($results.Warnings) warnings that should be addressed." -ForegroundColor Yellow
    }
    
    exit 0
} else {
    Write-Host "❌ DEPLOYMENT VERIFICATION FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "❌ $($results.Failed) critical endpoint(s) failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔍 Troubleshooting Steps:" -ForegroundColor Yellow
    Write-Host "1. Check Render deployment logs" -ForegroundColor Gray
    Write-Host "2. Verify database migration ran successfully" -ForegroundColor Gray
    Write-Host "3. Check if production-backend.js registered the routes" -ForegroundColor Gray
    Write-Host "4. Test endpoints manually: $BACKEND_URL/api/categories" -ForegroundColor Gray
    Write-Host ""
    
    exit 1
}
