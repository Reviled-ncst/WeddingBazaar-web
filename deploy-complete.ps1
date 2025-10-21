# Complete PayMongo Deployment Script
# Run this after adding keys to Render

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 PayMongo Complete Deployment Verification          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📋 Deployment Checklist:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Yellow

# Step 1: Verify keys added to Render
Write-Host "1️⃣  Add PayMongo Keys to Render Backend" -ForegroundColor Cyan
Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "   a) Open: https://dashboard.render.com" -ForegroundColor White
Write-Host "   b) Select: weddingbazaar-web service" -ForegroundColor White
Write-Host "   c) Go to: Environment tab" -ForegroundColor White
Write-Host "   d) Add Environment Variables:" -ForegroundColor White
Write-Host ""
Write-Host "      PAYMONGO_SECRET_KEY = sk_test_[YOUR_SECRET_KEY]" -ForegroundColor Green
Write-Host "      PAYMONGO_PUBLIC_KEY = pk_test_[YOUR_PUBLIC_KEY]" -ForegroundColor Green
Write-Host ""
Write-Host "   e) Click: Save Changes (Render will auto-redeploy)" -ForegroundColor White
Write-Host ""

$keysAdded = Read-Host "Have you added the keys and clicked Save Changes? (y/n)"
if ($keysAdded -ne "y") {
    Write-Host "`n❌ Please add keys to Render first." -ForegroundColor Red
    Write-Host "   1. Go to Render Dashboard" -ForegroundColor Yellow
    Write-Host "   2. Add both environment variables" -ForegroundColor Yellow
    Write-Host "   3. Save changes" -ForegroundColor Yellow
    Write-Host "   4. Run this script again`n" -ForegroundColor Yellow
    exit
}

# Step 2: Wait for deployment
Write-Host "`n2️⃣  Waiting for Render Deployment" -ForegroundColor Cyan
Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "   ⏳ Waiting 30 seconds for deployment to start..." -ForegroundColor Yellow

for ($i = 30; $i -gt 0; $i--) {
    Write-Host -NoNewline "`r   ⏳ Time remaining: $i seconds  "
    Start-Sleep -Seconds 1
}

Write-Host "`n   ✅ Initial wait complete" -ForegroundColor Green

# Step 3: Verify backend health
Write-Host "`n3️⃣  Verifying Backend Configuration" -ForegroundColor Cyan
Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$maxAttempts = 3
$attempt = 1
$success = $false

while ($attempt -le $maxAttempts -and -not $success) {
    Write-Host "   🔍 Attempt $attempt/$maxAttempts - Checking backend health..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/payment/health" -Method Get -TimeoutSec 10
        
        Write-Host "`n   📊 Backend Health Check Results:" -ForegroundColor Cyan
        Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        
        if ($response.paymongo_configured) {
            Write-Host "   ✅ PayMongo Configured: YES" -ForegroundColor Green
            $success = $true
        } else {
            Write-Host "   ❌ PayMongo Configured: NO" -ForegroundColor Red
        }
        
        if ($response.has_secret_key) {
            Write-Host "   ✅ Secret Key: Present" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Secret Key: Missing" -ForegroundColor Red
        }
        
        if ($response.has_public_key) {
            Write-Host "   ✅ Public Key: Present" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Public Key: Missing" -ForegroundColor Red
        }
        
        Write-Host "   📌 Environment: $($response.environment)" -ForegroundColor Cyan
        
        if ($response.paymongo_configured) {
            Write-Host "`n   🎉 SUCCESS! Backend is ready for payments!" -ForegroundColor Green
            break
        } else {
            Write-Host "`n   ⚠️  Keys not detected yet..." -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "`n   ⚠️  Connection attempt failed" -ForegroundColor Yellow
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
    
    if ($attempt -lt $maxAttempts -and -not $success) {
        Write-Host "`n   ⏳ Waiting 20 seconds before retry..." -ForegroundColor Yellow
        Start-Sleep -Seconds 20
    }
    
    $attempt++
}

if (-not $success) {
    Write-Host "`n❌ Backend not fully configured after $maxAttempts attempts" -ForegroundColor Red
    Write-Host "`n📋 Troubleshooting Steps:" -ForegroundColor Yellow
    Write-Host "   1. Check Render Dashboard → Logs for errors" -ForegroundColor White
    Write-Host "   2. Verify environment variables are correct" -ForegroundColor White
    Write-Host "   3. No extra spaces or quotes in keys" -ForegroundColor White
    Write-Host "   4. Keys start with sk_test_ and pk_test_" -ForegroundColor White
    Write-Host "   5. Try manually restarting service in Render" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Success - Show testing instructions
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Deployment Successful!                              ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🧪 NEXT: Test Payment in Production" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n📱 Step-by-Step Testing Instructions:" -ForegroundColor Yellow

Write-Host "`n1️⃣  Open Production Site:" -ForegroundColor White
Write-Host "   https://weddingbazaar-web.web.app" -ForegroundColor Cyan

Write-Host "`n2️⃣  Login to Your Account:" -ForegroundColor White
Write-Host "   Email: vendor0qw@gmail.com" -ForegroundColor Gray
Write-Host "   (Use your password)" -ForegroundColor Gray

Write-Host "`n3️⃣  Navigate:" -ForegroundColor White
Write-Host "   My Bookings → Select a booking → Pay Deposit" -ForegroundColor Gray

Write-Host "`n4️⃣  Enter TEST Card Details:" -ForegroundColor White
Write-Host "   Card Number: 4343 4343 4343 4343" -ForegroundColor Cyan
Write-Host "   Expiry Date: 12/34" -ForegroundColor Cyan
Write-Host "   CVC: 123" -ForegroundColor Cyan
Write-Host "   Name: Test User" -ForegroundColor Cyan

Write-Host "`n5️⃣  Click 'Pay Now' and Wait (3-5 seconds)" -ForegroundColor White

Write-Host "`n6️⃣  Verify in Browser Console (Press F12):" -ForegroundColor White
Write-Host "   ✅ Look for: '💳 [CARD PAYMENT - REAL]'" -ForegroundColor Green
Write-Host "   ✅ Look for: '💳 [STEP 1] Creating PayMongo...'" -ForegroundColor Green
Write-Host "   ✅ Look for: '✅ Payment Intent Created: pi_xxx'" -ForegroundColor Green
Write-Host "   ✅ Look for: '📧 Receipt created: WB-2025-XXXX'" -ForegroundColor Green
Write-Host "   ❌ Should NOT see: 'simulation'" -ForegroundColor Red

Write-Host "`n7️⃣  Verify Success Indicators:" -ForegroundColor White
Write-Host "   • Success message appears" -ForegroundColor Gray
Write-Host "   • Receipt modal displays" -ForegroundColor Gray
Write-Host "   • Receipt number: WB-2025-XXXX format" -ForegroundColor Gray
Write-Host "   • Booking status: deposit_paid" -ForegroundColor Gray
Write-Host "   • Payment takes 3-5 seconds (not instant)" -ForegroundColor Gray

Write-Host "`n8️⃣  Verify in PayMongo Dashboard:" -ForegroundColor White
Write-Host "   a) Open: https://dashboard.paymongo.com" -ForegroundColor Cyan
Write-Host "   b) Go to: Payments → All Payments" -ForegroundColor Gray
Write-Host "   c) Check: Payment appears with correct amount" -ForegroundColor Gray
Write-Host "   d) Verify: Status = succeeded" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚨 IMPORTANT: Test Invalid Card" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n9️⃣  Test with Invalid Card (Should FAIL):" -ForegroundColor White
Write-Host "   Card Number: 4111 1111 1111 1111" -ForegroundColor Red
Write-Host "   Expiry: 12/34" -ForegroundColor Gray
Write-Host "   CVC: 123" -ForegroundColor Gray

Write-Host "`n   ✅ Expected Result:" -ForegroundColor Green
Write-Host "   • Payment should be REJECTED" -ForegroundColor Gray
Write-Host "   • Error message displays" -ForegroundColor Gray
Write-Host "   • Booking status does NOT change" -ForegroundColor Gray
Write-Host "   • No receipt generated" -ForegroundColor Gray

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Open browser prompt
$openBrowser = Read-Host "Open production site in browser now? (y/n)"
if ($openBrowser -eq "y") {
    Write-Host "`n🌐 Opening browser..." -ForegroundColor Cyan
    Start-Process "https://weddingbazaar-web.web.app"
    Write-Host "✅ Browser opened!" -ForegroundColor Green
}

# Final summary
Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  📊 Deployment Summary                                   ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n✅ Completed Steps:" -ForegroundColor Green
Write-Host "   • Frontend deployed to Firebase" -ForegroundColor White
Write-Host "   • Backend deployed to Render" -ForegroundColor White
Write-Host "   • PayMongo TEST keys configured" -ForegroundColor White
Write-Host "   • Backend health check passed" -ForegroundColor White

Write-Host "`n⏳ Your Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Test payment with TEST card (4343...)" -ForegroundColor White
Write-Host "   2. Verify receipt generation" -ForegroundColor White
Write-Host "   3. Test invalid card rejection (4111...)" -ForegroundColor White
Write-Host "   4. Check PayMongo dashboard" -ForegroundColor White
Write-Host "   5. When ready: Switch to LIVE keys" -ForegroundColor White

Write-Host "`n🔗 Quick Links:" -ForegroundColor Cyan
Write-Host "   Production: https://weddingbazaar-web.web.app" -ForegroundColor White
Write-Host "   PayMongo:   https://dashboard.paymongo.com" -ForegroundColor White
Write-Host "   Render:     https://dashboard.render.com" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "   See: FINAL_DEPLOYMENT_GUIDE.md for detailed info" -ForegroundColor White

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n✨ Deployment Complete! Happy testing! 🚀`n" -ForegroundColor Green

# Optional: Show PayMongo dashboard link
$openPaymongo = Read-Host "Open PayMongo Dashboard to verify payments? (y/n)"
if ($openPaymongo -eq "y") {
    Start-Process "https://dashboard.paymongo.com/payments"
    Write-Host "`n📊 PayMongo Dashboard opened!`n" -ForegroundColor Green
}
