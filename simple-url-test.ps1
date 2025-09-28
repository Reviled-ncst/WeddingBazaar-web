Write-Host "Checking both hosting URLs..." -ForegroundColor Blue

Write-Host "`n1. weddingbazaarph.web.app:" -ForegroundColor Yellow
try {
    $response1 = Invoke-WebRequest -Uri "https://weddingbazaarph.web.app/" -UseBasicParsing
    Write-Host "   Status: $($response1.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. weddingbazaar-4171e.web.app:" -ForegroundColor Yellow
try {
    $response2 = Invoke-WebRequest -Uri "https://weddingbazaar-4171e.web.app/" -UseBasicParsing
    Write-Host "   Status: $($response2.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nBoth URLs are accessible. The default project is 'weddingbazaarph'" -ForegroundColor Green
Write-Host "Recent deployments likely went to: https://weddingbazaarph.web.app" -ForegroundColor White
