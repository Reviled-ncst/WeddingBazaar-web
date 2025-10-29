# Test wallet endpoint
Write-Host "Testing wallet endpoint..." -ForegroundColor Cyan

# You'll need to replace YOUR_TOKEN with a real JWT token from your browser
# To get your token:
# 1. Open browser DevTools (F12)
# 2. Go to Application > Local Storage > https://weddingbazaarph.web.app
# 3. Copy the value of 'auth_token' or 'jwt_token'

$token = Read-Host "Paste your JWT token here"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "No token provided. Skipping authenticated test." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To get your token:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://weddingbazaarph.web.app/vendor" -ForegroundColor White
    Write-Host "2. Open DevTools (F12)" -ForegroundColor White
    Write-Host "3. Go to: Application > Local Storage" -ForegroundColor White
    Write-Host "4. Copy the value of 'auth_token'" -ForegroundColor White
} else {
    Write-Host "Testing wallet for vendor 2-2025-001..." -ForegroundColor Green
    
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/wallet/2-2025-001" -Method GET -Headers $headers
        
        Write-Host "✅ Success! Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host ""
        Write-Host "Response:" -ForegroundColor Cyan
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
        
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Refresh your browser at: https://weddingbazaarph.web.app/vendor/finances" -ForegroundColor White
Write-Host "2. The wallet should now load successfully!" -ForegroundColor White
