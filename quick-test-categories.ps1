# Simple test for categories API
$URL = "https://weddingbazaar-web.onrender.com/api/categories"
Write-Host "Testing: $URL"
try {
    $result = Invoke-RestMethod -Uri $URL -Method Get
    Write-Host "Success: $($result.success)"
    Write-Host "Total: $($result.total)"
    Write-Host "Categories count: $($result.categories.Count)"
    if ($result.categories[0].subcategories) {
        Write-Host "First category has subcategories: $($result.categories[0].subcategories.Count)"
        Write-Host "PASS: Subcategories are included!"
    } else {
        Write-Host "FAIL: Subcategories missing!"
    }
} catch {
    Write-Host "Error: $_"
}
