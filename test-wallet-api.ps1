# ============================================
# TEST WALLET API WITH PROPER AUTH
# ============================================

Write-Host "`n=== WALLET API TEST ===" -ForegroundColor Cyan

# First, login to get a real token
Write-Host "`n1. Logging in to get auth token..." -ForegroundColor Yellow
$loginBody = @{
    email = "vendor@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "✅ Login successful! Token: $($token.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test wallet summary endpoint
Write-Host "`n2. Testing wallet summary endpoint..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $walletResponse = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/wallet/2-2025-001" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✅ Wallet API Success!" -ForegroundColor Green
    Write-Host "Wallet Data:" -ForegroundColor Cyan
    $walletResponse | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Wallet API Failed!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get response body
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nResponse Body:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}

# Test transactions endpoint
Write-Host "`n3. Testing transactions endpoint..." -ForegroundColor Yellow
try {
    $transactionsResponse = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/wallet/2-2025-001/transactions" `
        -Method GET `
        -Headers $headers
    
    Write-Host "✅ Transactions API Success!" -ForegroundColor Green
    Write-Host "Transactions Count: $($transactionsResponse.transactions.Count)" -ForegroundColor Cyan
    $transactionsResponse | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Transactions API Failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETE ===" -ForegroundColor Cyan
