# Simple Service Checker
$testIds = @("2-2025-001", "2-2025-002", "2-2025-003", "2-2025-004", "2-2025-005")

Write-Host ""
Write-Host "Checking for services..." -ForegroundColor Cyan
Write-Host ""

foreach ($id in $testIds) {
    Write-Host "Testing $id..." -NoNewline
    
    try {
        $url = "https://weddingbazaar-web.onrender.com/api/services/vendor/$id"
        $response = Invoke-RestMethod -Uri $url -Method Get
        $count = $response.services.Count
        
        if ($count -gt 0) {
            Write-Host " FOUND $count services!" -ForegroundColor Green
            foreach ($s in $response.services) {
                $name = $s.service_name
                $price = $s.base_price
                Write-Host "  - $name (Price: $price)" -ForegroundColor White
            }
        } else {
            Write-Host " No services" -ForegroundColor Gray
        }
    } catch {
        Write-Host " Not found" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
