-- ============================================================================
-- DIAGNOSTIC: Check if wallet tables exist
-- ============================================================================
-- Run this in Neon SQL Console to verify tables were created
-- ============================================================================

-- Check if vendor_wallets table exists
SELECT 
  'vendor_wallets' as table_name,
  COUNT(*) as row_count
FROM vendor_wallets
UNION ALL
SELECT 
  'wallet_transactions' as table_name,
  COUNT(*) as row_count
FROM wallet_transactions;

-- If you get an error like "relation does not exist", the tables weren't created
-- If you see results, the tables exist!

-- ============================================================================
-- NEXT: View actual data
-- ============================================================================

SELECT * FROM vendor_wallets ORDER BY created_at DESC LIMIT 5;

SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 5;

-- ============================================================================
-- EXPECTED: You should see vendor wallets and transactions with real data
-- ============================================================================
