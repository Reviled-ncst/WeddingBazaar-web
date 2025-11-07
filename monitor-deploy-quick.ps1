# Quick Deployment Monitor

$baseUrl = "https://weddingbazaar-web.onrender.com"
$vendorId = "2-2025-003"

Write-Host "Monitoring deployment (Commit: e718f45)..." -ForegroundColor Cyan
Write-Host ""

for ($i = 1; $i -le 15; $i++) {
    Write-Host "[$i/15] Testing..." -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/services/vendor/$vendorId" -TimeoutSec 10
        Write-Host " ✅ WORKING!" -ForegroundColor Green
        Write-Host "Services found: $($response.count)" -ForegroundColor White
        break
    }
    catch {
        Write-Host " Still deploying..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
    }
}
