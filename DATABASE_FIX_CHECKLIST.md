# 📋 Database Fix Checklist

## Current Status: ⏳ PENDING

---

## Problem Summary
- ❌ Receipt viewing returns 500 error
- ❌ Error: `column r.payment_type does not exist`
- ❌ Receipts table missing required columns
- ❌ Payment progress column may be wrong type

---

## Fix Steps

### Step 1: Prepare
- [ ] Read `RUN_DATABASE_FIX_NOW.md`
- [ ] Open Neon Console SQL Editor
- [ ] Backup existing receipts (if any exist)

### Step 2: Run SQL Script
- [ ] Copy `COMPLETE_DATABASE_FIX.sql` contents
- [ ] Paste into Neon SQL Editor
- [ ] Click "Run" button
- [ ] Verify all commands succeed (no red errors)

### Step 3: Verify Fix
- [ ] Run verification query 1 (bookings columns)
- [ ] Confirm all 4 columns are `numeric` type
- [ ] Run verification query 2 (receipts structure)
- [ ] Confirm 16 columns exist including `payment_type`
- [ ] Run verification query 3 (indexes)
- [ ] Confirm 3 indexes created

### Step 4: Run Verification Script (Optional)
- [ ] Open terminal in project root
- [ ] Run: `node verify-database-fix.cjs`
- [ ] Confirm all checks pass with ✅

### Step 5: Test in Production
- [ ] Open production app: https://weddingbazaar-web.web.app
- [ ] Log in as test user
- [ ] Navigate to a booking with "Quote Accepted" status
- [ ] Click "Pay Deposit" button
- [ ] Enter test card: `4343434343434345`
- [ ] Complete payment
- [ ] Verify payment success message appears
- [ ] Click "View Receipt" button
- [ ] Verify receipt displays correctly with all fields

### Step 6: Monitor
- [ ] Check Render logs for any SQL errors
- [ ] Verify no 500 errors in browser console
- [ ] Test all payment types (deposit, balance, full)
- [ ] Verify receipts generated for all payment types

### Step 7: Document Results
- [ ] Update `PAYMENT_SYSTEM_STATUS.md`
- [ ] Create `DATABASE_FIX_SUCCESS_REPORT.md`
- [ ] Mark this checklist as COMPLETE

---

## Expected Results After Fix

### Database
✅ `payment_progress` column is DECIMAL(10,2)
✅ `receipts` table has 16 columns
✅ `payment_type` column exists in receipts
✅ All indexes created successfully

### Application
✅ Payments save to database correctly
✅ Receipt viewing works without errors
✅ Booking statuses update properly
✅ Payment progress tracks accurately

### Backend Logs
✅ No SQL syntax errors
✅ No "column does not exist" errors
✅ Successful receipt queries
✅ Proper payment flow logs

---

## Rollback Plan (If Needed)

If something goes wrong:

### Option 1: Restore from Backup
```sql
-- If you created a backup before running the fix
DROP TABLE receipts;
ALTER TABLE receipts_backup RENAME TO receipts;
```

### Option 2: Re-run Fix
- Simply re-run `COMPLETE_DATABASE_FIX.sql`
- The script is idempotent (safe to run multiple times)

### Option 3: Manual Column Addition
```sql
-- If only payment_type is missing
ALTER TABLE receipts ADD COLUMN payment_type VARCHAR(50) NOT NULL DEFAULT 'full';
```

---

## Known Issues & Limitations

### Data Loss
⚠️ **WARNING**: Running the fix will DELETE any existing receipts because the receipts table is dropped and recreated.

**Mitigation**:
- Check if receipts exist: `SELECT COUNT(*) FROM receipts;`
- If count > 0, backup first: `CREATE TABLE receipts_backup AS SELECT * FROM receipts;`
- If count = 0, safe to proceed

### Downtime
- Database update takes ~30 seconds
- No application downtime expected
- Receipts table will be empty after fix

### Testing Required
- All payment flows must be tested after fix
- Receipts must be regenerated through new payments
- Old receipt data (if any) will not be migrated

---

## Success Criteria

### ✅ Fix is successful when:
1. All SQL commands run without errors
2. Verification queries show correct structure
3. Test payment completes successfully
4. Receipt displays correctly with all fields
5. No 500 errors in browser or backend logs
6. All payment types work (deposit, balance, full)

### ❌ Fix is NOT successful if:
1. SQL commands fail with errors
2. Verification shows missing columns
3. Receipt viewing still returns 500 error
4. Payment data not persisting
5. Backend logs show SQL errors

---

## Timeline

- **Preparation**: 5 minutes
- **SQL execution**: 2-3 minutes
- **Verification**: 2-3 minutes
- **Testing**: 10-15 minutes
- **Total**: ~25 minutes

---

## Contact

If you encounter issues:
1. Take screenshots of errors
2. Copy exact error messages
3. Note which step failed
4. Check Render logs
5. Consult with senior developer

---

## Status Updates

### Before Fix
- [ ] Database has incorrect schema
- [ ] Receipt viewing returns 500 error
- [ ] Payment data may not persist correctly

### After Fix
- [ ] Database schema corrected
- [ ] Receipt viewing works
- [ ] Payment data persists correctly
- [ ] All tests passing

---

## Last Updated
- **Date**: [TO BE FILLED]
- **By**: [YOUR NAME]
- **Status**: ⏳ PENDING → ✅ COMPLETE

---

## Notes
- Add any observations or issues encountered during the fix
- Document any deviations from the plan
- Note any additional testing performed
