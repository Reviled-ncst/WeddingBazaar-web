# Render Deployment Status Checker
Write-Host "=== RENDER DEPLOYMENT STATUS ===" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "https://weddingbazaar-web.onrender.com"

Write-Host "Testing Backend Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend is LIVE" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "❌ Backend is DOWN or DEPLOYING" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing Services Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$backendUrl/api/services?vendor_id=VEN-00002" -Method GET -TimeoutSec 10
    Write-Host "✅ Services endpoint is LIVE" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Services returned: $($data.Count)" -ForegroundColor White
} catch {
    Write-Host "❌ Services endpoint error" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== RENDER DASHBOARD INFO ===" -ForegroundColor Cyan
Write-Host "Dashboard: https://dashboard.render.com/" -ForegroundColor White
Write-Host "Service: weddingbazaar-web" -ForegroundColor White
Write-Host ""
Write-Host "Possible reasons for long deployment:" -ForegroundColor Yellow
Write-Host "1. Cold start (first deploy after inactivity)" -ForegroundColor White
Write-Host "2. npm install taking time (large dependencies)" -ForegroundColor White
Write-Host "3. Build process running" -ForegroundColor White
Write-Host "4. Health checks waiting for server to respond" -ForegroundColor White
Write-Host "5. Render free tier queue (if on free plan)" -ForegroundColor White
Write-Host ""
Write-Host "Typical deploy time: 2-5 minutes" -ForegroundColor Cyan
Write-Host "Long deploy time: 5-15 minutes (cold start)" -ForegroundColor Yellow
Write-Host ""
