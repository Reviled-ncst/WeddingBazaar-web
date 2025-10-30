# 🚀 Deploy Enhanced Payment Transfer System

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Enhanced Payment Transfer System" -ForegroundColor Cyan
Write-Host "  Deployment Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BACKEND_DIR = "backend-deploy"
$RENDER_REPO = "https://github.com/YOUR_REPO/weddingbazaar-web.git"

Write-Host "📋 Deployment Checklist:" -ForegroundColor Yellow
Write-Host "✅ Enhanced payment transfer logic in booking-completion.cjs" -ForegroundColor Green
Write-Host "✅ Fetches actual payment amounts from receipts table" -ForegroundColor Green
Write-Host "✅ Supports multiple payments per booking" -ForegroundColor Green
Write-Host "✅ Stores full payment history in transaction metadata" -ForegroundColor Green
Write-Host ""

# Step 1: Test backend files
Write-Host "📁 Step 1: Verifying backend files..." -ForegroundColor Cyan
if (Test-Path "$BACKEND_DIR\routes\booking-completion.cjs") {
    Write-Host "✅ booking-completion.cjs found" -ForegroundColor Green
} else {
    Write-Host "❌ booking-completion.cjs not found!" -ForegroundColor Red
    exit 1
}

if (Test-Path "$BACKEND_DIR\routes\vendor-wallet.cjs") {
    Write-Host "✅ vendor-wallet.cjs found" -ForegroundColor Green
} else {
    Write-Host "❌ vendor-wallet.cjs not found!" -ForegroundColor Red
    exit 1
}

# Step 2: Git commit and push
Write-Host ""
Write-Host "📤 Step 2: Committing changes to Git..." -ForegroundColor Cyan

try {
    git add backend-deploy/routes/booking-completion.cjs
    git add PAYMENT_TRANSFER_SYSTEM.md
    git add WALLET_SYSTEM_COMPLETE_DOCUMENTATION.md
    
    $commitMessage = "feat: Enhanced payment transfer system with receipt integration

- Pull actual payment amounts from receipts table
- Support multiple payments per booking (deposit + balance)
- Track all payment methods and receipt numbers
- Store full payment history in transaction metadata
- Convert amounts correctly from centavos to PHP
- Fallback to booking amount if no receipts found
- Enhanced logging for debugging
- Updated documentation with complete flow"

    git commit -m $commitMessage
    
    Write-Host "✅ Changes committed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Git commit failed: $_" -ForegroundColor Red
    Write-Host "⚠️  You may need to commit manually" -ForegroundColor Yellow
}

# Step 3: Push to GitHub (triggers Render auto-deploy)
Write-Host ""
Write-Host "🚀 Step 3: Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "This will trigger automatic deployment on Render" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Push to GitHub and deploy to Render? (y/n)"
if ($confirm -eq 'y' -or $confirm -eq 'Y') {
    try {
        git push origin main
        Write-Host "✅ Pushed to GitHub successfully" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Deployment initiated!" -ForegroundColor Green
        Write-Host "Render will automatically deploy the changes" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Git push failed: $_" -ForegroundColor Red
        Write-Host "⚠️  You may need to push manually" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏸️  Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

# Step 4: Monitor deployment
Write-Host ""
Write-Host "📊 Step 4: Monitoring deployment..." -ForegroundColor Cyan
Write-Host "Opening Render dashboard..." -ForegroundColor Yellow
Start-Process "https://dashboard.render.com/web/srv-YOUR_SERVICE_ID"

Write-Host ""
Write-Host "⏳ Waiting for deployment to complete..." -ForegroundColor Yellow
Write-Host "This usually takes 2-3 minutes" -ForegroundColor Gray
Start-Sleep -Seconds 5

# Step 5: Verify deployment
Write-Host ""
Write-Host "🔍 Step 5: Verifying deployment..." -ForegroundColor Cyan
Write-Host "Checking backend health..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health" -Method Get
    if ($response.status -eq "ok") {
        Write-Host "✅ Backend is online and healthy" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend responded but status is: $($response.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Cannot reach backend. Deployment may still be in progress." -ForegroundColor Red
    Write-Host "Check Render dashboard for status" -ForegroundColor Yellow
}

# Step 6: Testing instructions
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  🧪 TESTING INSTRUCTIONS" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test the enhanced payment transfer system:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Create a test booking" -ForegroundColor White
Write-Host "   → POST /api/bookings" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Make a payment via PayMongo" -ForegroundColor White
Write-Host "   → POST /api/payment/process" -ForegroundColor Gray
Write-Host "   → This creates a receipt in the receipts table" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Mark booking as complete (couple side)" -ForegroundColor White
Write-Host "   → POST /api/bookings/:id/mark-completed" -ForegroundColor Gray
Write-Host "   → Body: { completed_by: 'couple' }" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Mark booking as complete (vendor side)" -ForegroundColor White
Write-Host "   → POST /api/bookings/:id/mark-completed" -ForegroundColor Gray
Write-Host "   → Body: { completed_by: 'vendor' }" -ForegroundColor Gray
Write-Host "   → This TRIGGERS the payment transfer!" -ForegroundColor Green
Write-Host ""
Write-Host "5. Verify wallet balance" -ForegroundColor White
Write-Host "   → GET /api/vendor/wallet/balance" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Check transaction history" -ForegroundColor White
Write-Host "   → GET /api/vendor/wallet/transactions" -ForegroundColor Gray
Write-Host "   → Should show transaction with receipt details" -ForegroundColor Gray
Write-Host ""

# Step 7: SQL verification
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  🔍 SQL VERIFICATION QUERIES" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run these in Neon SQL Console to verify:" -ForegroundColor Yellow
Write-Host ""

$sqlQueries = @"
-- 1. Check receipts for a booking
SELECT * FROM receipts WHERE booking_id = 'YOUR_BOOKING_ID';

-- 2. Check wallet transaction created
SELECT * FROM wallet_transactions WHERE booking_id = 'YOUR_BOOKING_ID';

-- 3. Verify amount matches receipts
SELECT 
  b.id as booking_id,
  (SELECT SUM(amount) FROM receipts WHERE booking_id = b.id) / 100 as total_from_receipts,
  wt.amount as amount_in_wallet,
  CASE 
    WHEN (SELECT SUM(amount) FROM receipts WHERE booking_id = b.id) / 100 = wt.amount 
    THEN '✅ Match' 
    ELSE '❌ Mismatch' 
  END as status
FROM bookings b
LEFT JOIN wallet_transactions wt ON wt.booking_id = b.id
WHERE b.id = 'YOUR_BOOKING_ID';

-- 4. Check vendor wallet balance
SELECT * FROM vendor_wallets WHERE vendor_id = 'YOUR_VENDOR_ID';

-- 5. View transaction metadata (see receipt details)
SELECT 
  transaction_id,
  amount,
  payment_reference,
  metadata->>'receipts' as receipt_details,
  created_at
FROM wallet_transactions 
WHERE booking_id = 'YOUR_BOOKING_ID';
"@

Write-Host $sqlQueries -ForegroundColor Gray
Write-Host ""

# Step 8: Documentation
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  📚 DOCUMENTATION UPDATED" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ PAYMENT_TRANSFER_SYSTEM.md" -ForegroundColor Green
Write-Host "   Complete flow documentation with examples" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ WALLET_SYSTEM_COMPLETE_DOCUMENTATION.md" -ForegroundColor Green
Write-Host "   Updated with enhanced payment transfer logic" -ForegroundColor Gray
Write-Host ""

# Step 9: Final checklist
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  ✅ DEPLOYMENT COMPLETE CHECKLIST" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend Deployment:" -ForegroundColor Yellow
Write-Host "  [ ] Code pushed to GitHub" -ForegroundColor White
Write-Host "  [ ] Render auto-deploy triggered" -ForegroundColor White
Write-Host "  [ ] Health check passed" -ForegroundColor White
Write-Host ""
Write-Host "Database Verification:" -ForegroundColor Yellow
Write-Host "  [ ] Receipts table exists" -ForegroundColor White
Write-Host "  [ ] Wallet tables exist" -ForegroundColor White
Write-Host "  [ ] Sample receipts have data" -ForegroundColor White
Write-Host ""
Write-Host "Testing:" -ForegroundColor Yellow
Write-Host "  [ ] Create test booking" -ForegroundColor White
Write-Host "  [ ] Make test payment" -ForegroundColor White
Write-Host "  [ ] Complete booking (both sides)" -ForegroundColor White
Write-Host "  [ ] Verify wallet balance" -ForegroundColor White
Write-Host "  [ ] Check transaction details" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  [ ] Read PAYMENT_TRANSFER_SYSTEM.md" -ForegroundColor White
Write-Host "  [ ] Review updated WALLET_SYSTEM docs" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Deployment script complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Wait for Render deployment to finish (~2-3 minutes)" -ForegroundColor White
Write-Host "2. Test the payment transfer flow in production" -ForegroundColor White
Write-Host "3. Verify wallet balances match receipt totals" -ForegroundColor White
Write-Host "4. Check transaction metadata contains receipt details" -ForegroundColor White
Write-Host ""
Write-Host "Need help? Check the documentation:" -ForegroundColor Yellow
Write-Host "  - PAYMENT_TRANSFER_SYSTEM.md (complete flow)" -ForegroundColor Gray
Write-Host "  - WALLET_SYSTEM_COMPLETE_DOCUMENTATION.md (system overview)" -ForegroundColor Gray
Write-Host ""
