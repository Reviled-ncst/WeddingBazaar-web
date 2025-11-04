# Check Render deployment status
Write-Host "🔍 Checking Render deployment status..." -ForegroundColor Cyan
Write-Host ""

# Check if backend is responding
$backendUrl = "https://weddingbazaar-web.onrender.com/api/health"
Write-Host "📡 Testing backend health endpoint..." -ForegroundColor Yellow
Write-Host "   URL: $backendUrl"

try {
    $response = Invoke-WebRequest -Uri $backendUrl -Method GET -TimeoutSec 10
    Write-Host "✅ Backend is LIVE!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "⏳ Backend is still deploying or offline..." -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 Check deployment status manually:" -ForegroundColor Cyan
Write-Host "   1. Go to: https://dashboard.render.com/" -ForegroundColor White
Write-Host "   2. Login to your account" -ForegroundColor White
Write-Host "   3. Click on 'weddingbazaar-web' service" -ForegroundColor White
Write-Host "   4. Check 'Events' tab for deployment progress" -ForegroundColor White
Write-Host ""
Write-Host "💡 Options while waiting:" -ForegroundColor Cyan
Write-Host "   A) Wait for auto-deploy (usually 5-10 minutes)" -ForegroundColor White
Write-Host "   B) Test the fix locally first" -ForegroundColor White
Write-Host "   C) Check Render logs for errors" -ForegroundColor White
Write-Host ""
