# Check PayMongo API Key Validity
# This tests if the keys in Render can actually call PayMongo API

Write-Host "🔐 Testing PayMongo API Keys in Production..." -ForegroundColor Cyan
Write-Host ""

# Test with the smallest valid amount (100 centavos = ₱1.00)
$testData = @{
    amount = 10000  # ₱100.00 (minimum recommended for testing)
    currency = "PHP"
    description = "VALIDATION TEST - Please verify API keys"
    payment_method_allowed = @("card")
    metadata = @{
        test = "api_key_validation"
    }
} | ConvertTo-Json

Write-Host "📤 Testing Payment Intent Creation..." -ForegroundColor Yellow
Write-Host "Amount: ₱100.00" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod `
        -Uri "https://weddingbazaar-web.onrender.com/api/payment/create-intent" `
        -Method Post `
        -ContentType "application/json" `
        -Body $testData `
        -TimeoutSec 30 `
        -ErrorAction Stop
    
    Write-Host "✅ SUCCESS! PayMongo keys are VALID!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Payment Intent Created:" -ForegroundColor Green
    Write-Host "  ID: $($response.payment_intent_id)" -ForegroundColor White
    Write-Host "  Status: $($response.status)" -ForegroundColor White
    Write-Host "  Amount: ₱$($response.amount / 100)" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Payment processing is FULLY OPERATIONAL!" -ForegroundColor Green
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    Write-Host "❌ FAILED! Status Code: $statusCode" -ForegroundColor Red
    Write-Host ""
    
    if ($statusCode -eq 401) {
        Write-Host "🔑 ERROR: PayMongo API Keys are INVALID or INCORRECT" -ForegroundColor Red
        Write-Host ""
        Write-Host "Possible Issues:" -ForegroundColor Yellow
        Write-Host "  1. Keys are not from your PayMongo account" -ForegroundColor White
        Write-Host "  2. Keys were copied incorrectly (extra spaces, incomplete)" -ForegroundColor White
        Write-Host "  3. Test keys being used with live mode (or vice versa)" -ForegroundColor White
        Write-Host "  4. Keys have been revoked or expired" -ForegroundColor White
        Write-Host ""
        Write-Host "📋 SOLUTION:" -ForegroundColor Cyan
        Write-Host "  1. Go to PayMongo Dashboard: https://dashboard.paymongo.com" -ForegroundColor White
        Write-Host "  2. Navigate to: Developers → API Keys" -ForegroundColor White
        Write-Host "  3. Copy BOTH keys (Public and Secret) for TEST mode" -ForegroundColor White
        Write-Host "  4. Update in Render: https://dashboard.render.com" -ForegroundColor White
        Write-Host "     - PAYMONGO_PUBLIC_KEY = pk_test_..." -ForegroundColor White
        Write-Host "     - PAYMONGO_SECRET_KEY = sk_test_..." -ForegroundColor White
        Write-Host "  5. Save and wait 2-3 minutes for redeploy" -ForegroundColor White
        
    } elseif ($statusCode -eq 400) {
        Write-Host "⚠️ Request Error (400 Bad Request)" -ForegroundColor Yellow
        Write-Host "The endpoint is working but rejected the request format" -ForegroundColor White
        
        # Try to get error details
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
            Write-Host ""
            Write-Host "Error Details:" -ForegroundColor Yellow
            Write-Host ($errorBody | ConvertTo-Json -Depth 5)
        } catch {}
        
    } elseif ($statusCode -eq 500) {
        Write-Host "💥 Server Error (500 Internal Server Error)" -ForegroundColor Red
        Write-Host "Check Render logs for backend errors" -ForegroundColor White
        
    } else {
        Write-Host "🤔 Unexpected Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
