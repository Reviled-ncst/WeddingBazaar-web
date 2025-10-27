# Quick test of subscription upgrade endpoint
Write-Host "🧪 Testing Subscription Upgrade Endpoint" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$url = "https://weddingbazaar-web.onrender.com/api/subscriptions/upgrade"
$testBody = @{
    vendor_id = "test-vendor-$(Get-Date -Format 'yyyyMMddHHmmss')"
    new_plan = "premium"
} | ConvertTo-Json

Write-Host "📡 Endpoint: $url" -ForegroundColor Gray
Write-Host "📝 Request body:" -ForegroundColor Gray
Write-Host $testBody -ForegroundColor DarkGray
Write-Host ""

try {
    Write-Host "⏳ Sending request..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $url `
        -Method PUT `
        -Body $testBody `
        -ContentType "application/json" `
        -TimeoutSec 15 `
        -ErrorAction Stop
    
    Write-Host "✅ SUCCESS! Upgrade endpoint is working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
    Write-Host ""
    Write-Host "🎉 Deployment is LIVE - no more 401 errors!" -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 401) {
        Write-Host "❌ Still getting 401 Unauthorized" -ForegroundColor Red
        Write-Host ""
        Write-Host "This means the old code is still running on Render." -ForegroundColor Yellow
        Write-Host "Please check Render dashboard and manually trigger deployment if needed." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Dashboard: https://dashboard.render.com/" -ForegroundColor Cyan
        
    } elseif ($statusCode -eq 404) {
        Write-Host "❌ 404 Not Found" -ForegroundColor Red
        Write-Host "The endpoint may not be registered properly." -ForegroundColor Yellow
        
    } else {
        Write-Host "⚠️  Unexpected error" -ForegroundColor Yellow
        Write-Host "Status code: $statusCode" -ForegroundColor Gray
        $errorMsg = $_.Exception.Message
        Write-Host "Message: $errorMsg" -ForegroundColor Gray
    }
    
    Write-Host ""
}
