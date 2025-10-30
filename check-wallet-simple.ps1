# Wallet Transaction Diagnostic - SQL Queries

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Wallet Transaction Diagnostic" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run these queries in Neon SQL Console:" -ForegroundColor Yellow
Write-Host "URL: https://console.neon.tech" -ForegroundColor Gray
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Query 1
Write-Host "QUERY 1: Check Completed Bookings" -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host @"
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
"@ -ForegroundColor White
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Query 2
Write-Host "QUERY 2: Check Wallet Transactions" -ForegroundColor Green
Write-Host "-----------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host @"
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
"@ -ForegroundColor White
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Query 3
Write-Host "QUERY 3: Check Vendor Wallet Balances" -ForegroundColor Green
Write-Host "--------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host @"
SELECT 
  vendor_id,
  total_earnings,
  available_balance,
  pending_balance,
  withdrawn_amount,
  updated_at
FROM vendor_wallets
ORDER BY updated_at DESC;
"@ -ForegroundColor White
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Query 4
Write-Host "QUERY 4: Check Receipts" -ForegroundColor Green
Write-Host "-----------------------" -ForegroundColor Gray
Write-Host ""
Write-Host @"
SELECT 
  receipt_number,
  booking_id,
  amount,
  payment_type,
  payment_method,
  paid_by_name,
  created_at
FROM receipts
ORDER BY created_at DESC
LIMIT 10;
"@ -ForegroundColor White
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Query 5: Check Completion to Wallet Mapping
Write-Host "QUERY 5: Check Completion to Wallet Mapping ⭐" -ForegroundColor Green
Write-Host "-----------------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host @"
-- Check if completed bookings have wallet transactions
SELECT 
  b.id as booking_id,
  b.vendor_id,
  b.couple_name,
  b.service_type,
  b.amount as booking_amount,
  b.status,
  b.fully_completed,
  b.fully_completed_at,
  (SELECT COUNT(*) FROM receipts WHERE booking_id = b.id) as receipt_count,
  (SELECT SUM(amount) FROM receipts WHERE booking_id = b.id) / 100 as receipts_total,
  wt.transaction_id,
  wt.amount as wallet_amount,
  wt.created_at as transaction_created,
  CASE 
    WHEN b.fully_completed = true AND wt.id IS NULL THEN '❌ MISSING TRANSACTION'
    WHEN b.fully_completed = true AND wt.id IS NOT NULL THEN '✅ TRANSACTION EXISTS'
    WHEN b.fully_completed = false THEN '⏳ NOT YET COMPLETED'
  END as mapping_status
FROM bookings b
LEFT JOIN wallet_transactions wt ON wt.booking_id = b.id
WHERE b.status = 'completed' 
   OR b.fully_completed = true
   OR b.vendor_completed = true
   OR b.couple_completed = true
ORDER BY b.updated_at DESC
LIMIT 10;
"@ -ForegroundColor White
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "After running these queries, look for:" -ForegroundColor Yellow
Write-Host "1. Your completed booking in QUERY 1" -ForegroundColor White
Write-Host "2. Matching wallet transaction in QUERY 2" -ForegroundColor White
Write-Host "3. Updated vendor wallet in QUERY 3" -ForegroundColor White
Write-Host "4. Payment receipts in QUERY 4" -ForegroundColor White
Write-Host "5. Completion → Wallet mapping in QUERY 5 ⭐" -ForegroundColor Cyan
Write-Host ""
Write-Host "QUERY 5 shows the mapping status:" -ForegroundColor Yellow
Write-Host "  ✅ TRANSACTION EXISTS - Working correctly" -ForegroundColor Green
Write-Host "  ❌ MISSING TRANSACTION - Needs manual fix" -ForegroundColor Red
Write-Host "  ⏳ NOT YET COMPLETED - Waiting for completion" -ForegroundColor Gray
Write-Host ""
Write-Host "If wallet transaction is MISSING, check backend logs:" -ForegroundColor Red
Write-Host "https://dashboard.render.com" -ForegroundColor Gray
Write-Host ""
