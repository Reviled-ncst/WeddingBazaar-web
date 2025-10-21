# Monitor Render Payment Route Deployment
# Wait for Render to redeploy and then test the /create-intent endpoint

Write-Host "🚀 Monitoring Render deployment..." -ForegroundColor Cyan
Write-Host "⏱️ This will check every 30 seconds for up to 5 minutes" -ForegroundColor Yellow
Write-Host ""

$maxAttempts = 10
$attempt = 0
$deployed = $false

while ($attempt -lt $maxAttempts -and !$deployed) {
    $attempt++
    Write-Host "[$attempt/$maxAttempts] Checking deployment status..." -ForegroundColor Yellow
    
    try {
        # Test the create-intent endpoint
        $testData = @{
            amount = 100000
            currency = "PHP"
            description = "TEST"
            payment_method_allowed = @("card")
            metadata = @{
                booking_id = "test-deployment-check"
            }
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod `
            -Uri "https://weddingbazaar-web.onrender.com/api/payment/create-intent" `
            -Method Post `
            -ContentType "application/json" `
            -Body $testData `
            -TimeoutSec 30 `
            -ErrorAction Stop
        
        # If we get here without error, deployment is successful
        Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Payment Intent Response:" -ForegroundColor Green
        Write-Host ($response | ConvertTo-Json -Depth 5)
        Write-Host ""
        Write-Host "🎉 Payment processing is now LIVE!" -ForegroundColor Green
        Write-Host "🧪 You can now test payments in the frontend!" -ForegroundColor Cyan
        $deployed = $true
        
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 404) {
            Write-Host "⏳ Still deploying... (404 Not Found)" -ForegroundColor Yellow
        } elseif ($statusCode -eq 400) {
            Write-Host "✅ ENDPOINT IS LIVE! (Got expected 400 validation error)" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎉 Payment processing is now LIVE!" -ForegroundColor Green
            Write-Host "🧪 You can now test payments in the frontend!" -ForegroundColor Cyan
            $deployed = $true
        } else {
            Write-Host "⚠️ Got status code: $statusCode" -ForegroundColor Yellow
        }
        
        if (!$deployed -and $attempt -lt $maxAttempts) {
            Write-Host "Waiting 30 seconds before next check..." -ForegroundColor Gray
            Start-Sleep -Seconds 30
        }
    }
}

if (!$deployed) {
    Write-Host ""
    Write-Host "⏱️ Deployment is taking longer than expected" -ForegroundColor Yellow
    Write-Host "Check Render dashboard: https://dashboard.render.com" -ForegroundColor Cyan
    Write-Host "Or try again manually in a few minutes" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
