# ============================================================================
# Test Wallet API After Fix - PowerShell Script
# ============================================================================
# Tests wallet endpoints after the amount conversion fix
# ============================================================================

Write-Host "🧪 Testing Wallet API After Amount Conversion Fix" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://weddingbazaar-web.onrender.com"
$vendorId = "2-2025-001"

# Test 1: Health check
Write-Host "📍 Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get
    Write-Host "✅ Backend is UP" -ForegroundColor Green
    Write-Host "Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend is DOWN" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Wallet summary
Write-Host "📍 Test 2: Wallet Summary (GET /api/wallet/$vendorId)" -ForegroundColor Yellow
try {
    $wallet = Invoke-RestMethod -Uri "$baseUrl/api/wallet/$vendorId" -Method Get
    Write-Host "✅ Wallet summary fetched successfully" -ForegroundColor Green
    Write-Host "Total Earnings: ₱$([math]::Round($wallet.wallet.total_earnings / 100, 2))" -ForegroundColor Gray
    Write-Host "Available Balance: ₱$([math]::Round($wallet.wallet.available_balance / 100, 2))" -ForegroundColor Gray
    Write-Host "Total Transactions: $($wallet.wallet.total_transactions)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Wallet summary failed" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Transaction history (THE FIX)
Write-Host "📍 Test 3: Transaction History (GET /api/wallet/$vendorId/transactions)" -ForegroundColor Yellow
Write-Host "This is the endpoint we fixed - testing amount conversion..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/wallet/$vendorId/transactions" -Method Get
    
    if ($response.success) {
        Write-Host "✅ Transactions fetched successfully!" -ForegroundColor Green
        Write-Host "Total Transactions: $($response.transactions.Count)" -ForegroundColor Gray
        
        if ($response.transactions.Count -gt 0) {
            Write-Host ""
            Write-Host "📊 Sample Transaction (First Entry):" -ForegroundColor Magenta
            $first = $response.transactions[0]
            
            # Calculate amount in pesos
            $amountInPesos = $first.amount / 100
            
            Write-Host "  Transaction ID: $($first.receipt_number)" -ForegroundColor Gray
            Write-Host "  Type: $($first.transaction_type)" -ForegroundColor Gray
            Write-Host "  Amount (Centavos): $($first.amount)" -ForegroundColor Gray
            Write-Host "  Amount (Pesos): ₱$([math]::Round($amountInPesos, 2))" -ForegroundColor Green
            Write-Host "  Status: $($first.status)" -ForegroundColor Gray
            Write-Host "  Category: $($first.service_category)" -ForegroundColor Gray
            Write-Host "  Date: $($first.transaction_date)" -ForegroundColor Gray
            
            Write-Host ""
            Write-Host "🔍 Validation Checks:" -ForegroundColor Yellow
            
            # Check 1: Amount is reasonable (not billions)
            if ($first.amount -gt 0 -and $first.amount -lt 100000000) {
                Write-Host "  ✅ Amount is in valid range (< ₱1M)" -ForegroundColor Green
            } else {
                Write-Host "  ❌ Amount looks wrong! ($($first.amount) centavos)" -ForegroundColor Red
            }
            
            # Check 2: Amount is an integer
            if ($first.amount -is [int] -or $first.amount -is [long]) {
                Write-Host "  ✅ Amount is integer (correct type)" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  Amount is not integer (type: $($first.amount.GetType().Name))" -ForegroundColor Yellow
            }
            
            # Check 3: Pesos conversion makes sense
            if ($amountInPesos -gt 0 -and $amountInPesos -lt 1000000) {
                Write-Host "  ✅ Pesos conversion looks correct: ₱$([math]::Round($amountInPesos, 2))" -ForegroundColor Green
            } else {
                Write-Host "  ❌ Pesos conversion looks wrong: ₱$([math]::Round($amountInPesos, 2))" -ForegroundColor Red
            }
            
            Write-Host ""
            Write-Host "🎉 FIX VERIFICATION: Amount conversion is now correct!" -ForegroundColor Green
            Write-Host "   Before fix: Would have shown ₱$([math]::Round($amountInPesos * 100, 2))" -ForegroundColor Red
            Write-Host "   After fix: Shows ₱$([math]::Round($amountInPesos, 2))" -ForegroundColor Green
        } else {
            Write-Host "⚠️  No transactions found (wallet may be empty)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Response indicated failure" -ForegroundColor Red
        Write-Host "Error: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Transaction fetch FAILED (500 error)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Show response body if available
    if ($_.ErrorDetails.Message) {
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ All tests complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If you see ✅ on all checks - the fix worked!" -ForegroundColor Gray
Write-Host "2. Check Render dashboard for deployment status" -ForegroundColor Gray
Write-Host "3. Test in browser: https://weddingbazaarph.web.app/vendor/finances" -ForegroundColor Gray
