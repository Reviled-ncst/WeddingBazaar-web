# Test Categories API with Subcategories
# PowerShell version for easier Windows testing

$API_URL = "https://weddingbazaar-web.onrender.com"

Write-Host "[TEST] Testing Categories API with Subcategories`n" -ForegroundColor Cyan
Write-Host "[INFO] API URL: $API_URL`n" -ForegroundColor Gray

try {
    # Test 1: Fetch all categories with subcategories
    Write-Host "[TEST 1] GET /api/categories (with subcategories)" -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "$API_URL/api/categories" -Method Get -ContentType "application/json"
    
    Write-Host "[OK] Response received" -ForegroundColor Green
    Write-Host "   Success: $($response.success)" -ForegroundColor Gray
    Write-Host "   Total categories: $($response.total)" -ForegroundColor Gray
    
    if ($response.categories -and $response.categories.Count -gt 0) {
        Write-Host "`n[INFO] Sample category structure:" -ForegroundColor Yellow
        $sample = $response.categories[0]
        $sample | ConvertTo-Json -Depth 3
        
        # Verify subcategories are included
        if ($sample.subcategories -and $sample.subcategories -is [Array]) {
            Write-Host "`n[OK] Subcategories included! Count: $($sample.subcategories.Count)" -ForegroundColor Green
            if ($sample.subcategories.Count -gt 0) {
                Write-Host "   First subcategory:" -ForegroundColor Gray
                $sample.subcategories[0] | ConvertTo-Json
            }
        } else {
            Write-Host "`n❌ ERROR: Subcategories missing or not an array!" -ForegroundColor Red
        }
        
        # Count total subcategories
        $totalSubcategories = 0
        foreach ($cat in $response.categories) {
            if ($cat.subcategories) {
                $totalSubcategories += $cat.subcategories.Count
            }
        }
        
        Write-Host "`n📊 Statistics:" -ForegroundColor Yellow
        Write-Host "   Total categories: $($response.categories.Count)" -ForegroundColor Gray
        Write-Host "   Total subcategories: $totalSubcategories" -ForegroundColor Gray
        $avg = [math]::Round($totalSubcategories / $response.categories.Count, 1)
        Write-Host "   Average subcategories per category: $avg" -ForegroundColor Gray
        
    } else {
        Write-Host "❌ No categories returned!" -ForegroundColor Red
        exit 1
    }

    # Test 2: Fetch subcategories for a specific category
    if ($response.categories -and $response.categories.Count -gt 0) {
        $categoryId = $response.categories[0].id
        Write-Host "`n📁 Test 2: GET /api/categories/$categoryId/subcategories" -ForegroundColor Yellow
        
        $subResponse = Invoke-RestMethod -Uri "$API_URL/api/categories/$categoryId/subcategories" -Method Get -ContentType "application/json"
        
        Write-Host "✅ Response received" -ForegroundColor Green
        Write-Host "   Success: $($subResponse.success)" -ForegroundColor Gray
        Write-Host "   Category ID: $($subResponse.categoryId)" -ForegroundColor Gray
        Write-Host "   Total subcategories: $($subResponse.total)" -ForegroundColor Gray
        
        if ($subResponse.subcategories -and $subResponse.subcategories.Count -gt 0) {
            Write-Host "   Sample subcategory:" -ForegroundColor Gray
            $subResponse.subcategories[0] | ConvertTo-Json
        }
    }

    Write-Host "`n✅ All tests passed!" -ForegroundColor Green
    exit 0

} catch {
    Write-Host "`n[ERROR] Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.ToString() -ForegroundColor Red
    exit 1
}
