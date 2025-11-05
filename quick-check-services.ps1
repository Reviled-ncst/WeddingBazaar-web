# 🚨 TELL ME YOUR VENDOR ID - INSTANT CHECK

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔥 INSTANT SERVICE CHECKER" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Common vendor IDs to test
$testIds = @("2-2025-001", "2-2025-002", "2-2025-003", "2-2025-004", "2-2025-005")

Write-Host "Testing common vendor IDs..." -ForegroundColor Yellow
Write-Host ""

foreach ($id in $testIds) {
    Write-Host "Testing: $id..." -ForegroundColor Cyan -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/services/vendor/$id" -UseBasicParsing -ErrorAction Stop
        $count = $response.services.Count
        
        if ($count -gt 0) {
            Write-Host " ✅ FOUND $count SERVICES!" -ForegroundColor Green
            foreach ($service in $response.services) {
                Write-Host "    - $($service.service_name) (₱$($service.base_price))" -ForegroundColor White
            }
        } else {
            Write-Host " No services" -ForegroundColor Gray
        }
    } catch {
        Write-Host " Error or not found" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see your services above, your vendor ID is the one with services!" -ForegroundColor Yellow
Write-Host ""
Write-Host "To fix your session, use that vendor ID in the browser console fix." -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"
