# 🔍 Wallet Transaction Diagnostic Script

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Wallet Transaction Diagnostic" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if the booking was completed
Write-Host "📋 Step 1: Checking Completed Bookings" -ForegroundColor Yellow
Write-Host ""
Write-Host "SQL Query to run in Neon Console:" -ForegroundColor Gray
Write-Host ""
$completedBookingsQuery = @"
-- Check completed bookings
SELECT 
  id,
  vendor_id,
  couple_name,
  service_type,
  amount,
  status,
  vendor_completed,
  couple_completed,
  fully_completed,
  fully_completed_at
FROM bookings
WHERE status = 'completed'
  OR fully_completed = true
ORDER BY fully_completed_at DESC
LIMIT 10;
"@
Write-Host $completedBookingsQuery -ForegroundColor White
Write-Host ""
Write-Host "👉 Copy this query and run it in Neon SQL Console" -ForegroundColor Green
Write-Host "   URL: https://console.neon.tech" -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter after running the query..."

# Step 2: Check wallet transactions
Write-Host ""
Write-Host "📊 Step 2: Checking Wallet Transactions" -ForegroundColor Yellow
Write-Host ""
Write-Host "SQL Query to run in Neon Console:" -ForegroundColor Gray
Write-Host ""
$walletTransactionsQuery = @"
-- Check wallet transactions
SELECT 
  transaction_id,
  vendor_id,
  booking_id,
  amount,
  payment_method,
  payment_reference,
  description,
  created_at
FROM wallet_transactions
ORDER BY created_at DESC
LIMIT 10;
"@
Write-Host $walletTransactionsQuery -ForegroundColor White
Write-Host ""
Write-Host "👉 Copy this query and run it in Neon SQL Console" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter after running the query..."

# Step 3: Check vendor wallet balances
Write-Host ""
Write-Host "💰 Step 3: Checking Vendor Wallet Balances" -ForegroundColor Yellow
Write-Host ""
Write-Host "SQL Query to run in Neon Console:" -ForegroundColor Gray
Write-Host ""
$vendorWalletsQuery = @"
-- Check vendor wallets
SELECT 
  vendor_id,
  total_earnings,
  available_balance,
  pending_balance,
  withdrawn_amount,
  updated_at
FROM vendor_wallets
ORDER BY updated_at DESC;
"@
Write-Host $vendorWalletsQuery -ForegroundColor White
Write-Host ""
Write-Host "👉 Copy this query and run it in Neon SQL Console" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter after running the query..."

# Step 4: Check for specific booking
Write-Host ""
Write-Host "🔎 Step 4: Trace Specific Booking" -ForegroundColor Yellow
Write-Host ""
$bookingId = Read-Host "Enter the Booking ID you just completed"

if ($bookingId) {
    Write-Host ""
    Write-Host "SQL Query for Booking: $bookingId" -ForegroundColor Gray
    Write-Host ""
    $specificBookingQuery = @"
-- Trace specific booking
SELECT 
  'Booking Info' as source,
  b.id,
  b.vendor_id,
  b.couple_name,
  b.service_type,
  b.amount,
  b.status,
  b.vendor_completed,
  b.couple_completed,
  b.fully_completed,
  b.fully_completed_at
FROM bookings b
WHERE b.id = '$bookingId'

UNION ALL

SELECT 
  'Receipts' as source,
  r.booking_id as id,
  NULL as vendor_id,
  r.paid_by_name as couple_name,
  NULL as service_type,
  r.amount::text as amount,
  NULL as status,
  NULL as vendor_completed,
  NULL as couple_completed,
  NULL as fully_completed,
  r.created_at::text as fully_completed_at
FROM receipts r
WHERE r.booking_id = '$bookingId'

UNION ALL

SELECT 
  'Wallet Transaction' as source,
  wt.booking_id as id,
  wt.vendor_id,
  wt.customer_name as couple_name,
  wt.service_name as service_type,
  wt.amount::text as amount,
  wt.status,
  NULL as vendor_completed,
  NULL as couple_completed,
  NULL as fully_completed,
  wt.created_at::text as fully_completed_at
FROM wallet_transactions wt
WHERE wt.booking_id = '$bookingId';
"@
    Write-Host $specificBookingQuery -ForegroundColor White
    Write-Host ""
    Write-Host "👉 Copy this query and run it in Neon SQL Console" -ForegroundColor Green
}

# Step 5: Check backend logs
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Next: Check Backend Logs" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Go to Render Dashboard:" -ForegroundColor Yellow
Write-Host "https://dashboard.render.com" -ForegroundColor Gray
Write-Host ""
Write-Host "Look for these log messages:" -ForegroundColor Yellow
Write-Host "  ✅ '💰 Creating wallet transaction for vendor:'" -ForegroundColor Green
Write-Host "  ✅ '📄 Found X receipt(s) for booking'" -ForegroundColor Green
Write-Host "  ✅ '💵 Total paid from receipts:'" -ForegroundColor Green
Write-Host "  ✅ '✅ Wallet transaction created:'" -ForegroundColor Green
Write-Host "  ✅ '✅ Wallet updated. Added:'" -ForegroundColor Green
Write-Host "  ✅ '🎉 Wallet integration complete'" -ForegroundColor Green
Write-Host ""
Write-Host "If you see these, the transaction was created!" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see errors like:" -ForegroundColor Yellow
Write-Host "  ❌ '❌ Error creating wallet transaction:'" -ForegroundColor Red
Write-Host "  ❌ 'No receipts found'" -ForegroundColor Red
Write-Host ""
Write-Host "Then we need to investigate why the transaction failed." -ForegroundColor Yellow
Write-Host ""

# Step 6: Manual transaction creation (if needed)
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Manual Fix (if needed)" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If the transaction wasn't created automatically," -ForegroundColor Yellow
Write-Host "you can create it manually using this SQL:" -ForegroundColor Yellow
Write-Host ""

if ($bookingId) {
    $manualFixQuery = @"
-- Manual wallet transaction creation
-- STEP 1: Get booking and receipt info
SELECT 
  b.id as booking_id,
  b.vendor_id,
  b.couple_name,
  b.service_type,
  b.amount as booking_amount,
  (SELECT SUM(amount) FROM receipts WHERE booking_id = b.id) / 100 as receipts_total,
  b.event_date
FROM bookings b
WHERE b.id = '$bookingId';

-- STEP 2: If receipts exist, create transaction with receipts total
-- STEP 3: If no receipts, use booking amount
-- Replace values below with data from STEP 1

INSERT INTO wallet_transactions (
  transaction_id,
  vendor_id,
  booking_id,
  transaction_type,
  amount,
  currency,
  status,
  description,
  payment_method,
  payment_reference,
  service_name,
  customer_name,
  event_date,
  created_at,
  updated_at
) VALUES (
  'TXN-$bookingId-MANUAL-' || EXTRACT(EPOCH FROM NOW())::bigint,
  'VENDOR_ID_HERE', -- Replace with vendor_id from STEP 1
  '$bookingId',
  'earning',
  0.00, -- Replace with receipts_total or booking_amount from STEP 1
  'PHP',
  'completed',
  'Manual transaction creation for completed booking',
  'manual',
  'MANUAL-ENTRY',
  'SERVICE_TYPE_HERE', -- Replace with service_type from STEP 1
  'COUPLE_NAME_HERE', -- Replace with couple_name from STEP 1
  'EVENT_DATE_HERE', -- Replace with event_date from STEP 1
  NOW(),
  NOW()
);

-- STEP 4: Update vendor wallet
UPDATE vendor_wallets
SET 
  total_earnings = total_earnings + 0.00, -- Replace with amount
  available_balance = available_balance + 0.00, -- Replace with amount
  updated_at = NOW()
WHERE vendor_id = 'VENDOR_ID_HERE'; -- Replace with vendor_id
"@
    Write-Host $manualFixQuery -ForegroundColor White
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To troubleshoot:" -ForegroundColor Yellow
Write-Host "1. ✅ Check if booking is fully_completed = true" -ForegroundColor White
Write-Host "2. ✅ Check if receipts exist for the booking" -ForegroundColor White
Write-Host "3. ✅ Check if wallet transaction was created" -ForegroundColor White
Write-Host "4. ✅ Check backend logs for errors" -ForegroundColor White
Write-Host "5. ✅ Manually create transaction if needed" -ForegroundColor White
Write-Host ""
Write-Host "Need help? Check these files:" -ForegroundColor Cyan
Write-Host "  - PAYMENT_TRANSFER_SYSTEM.md" -ForegroundColor Gray
Write-Host "  - DEPLOYMENT_STATUS_PAYMENT_TRANSFER.md" -ForegroundColor Gray
Write-Host ""
