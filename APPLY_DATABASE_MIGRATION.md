# 🔧 Apply Database Migration to Neon PostgreSQL

## ⚠️ CRITICAL: This migration MUST be applied for Accept Quote to work

The backend is deployed and ready, but the database constraint is blocking new booking statuses.

## 📋 Prerequisites
- Access to Neon PostgreSQL console: https://console.neon.tech
- The migration file: `database-migrations/001-fix-bookings-status-constraint.sql`
- 5-10 minutes of time

---

## 🚀 Step-by-Step Migration Guide

### Step 1: Access Neon Console
1. Go to https://console.neon.tech
2. Log in to your account
3. Select your **WeddingBazaar** project
4. Click on **SQL Editor** in the left sidebar

### Step 2: Copy the Migration SQL
1. Open `database-migrations/001-fix-bookings-status-constraint.sql`
2. Copy the ENTIRE contents of the file (all 148 lines)

### Step 3: Run the Migration
1. In the SQL Editor, paste the migration script
2. Click **Run** or press `Ctrl+Enter`
3. Wait for execution (should take 2-5 seconds)

### Step 4: Verify Success
You should see output like:
```
✅ Old constraint dropped successfully
✅ New constraint added successfully
✅ All existing bookings have valid statuses
✅ Test booking created with quote_accepted status
✅ MIGRATION COMPLETE!
```

If you see any errors:
- Check if the constraint already exists
- Verify you're connected to the correct database
- Check the error message and consult troubleshooting below

---

## 🧪 Test After Migration

### Test 1: Direct Database Query
Run this in Neon SQL Editor:
```sql
-- Check the new constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'bookings_status_check';

-- Expected: You should see all 9 statuses including 'quote_accepted'
```

### Test 2: Create Test Booking (Optional)
```sql
-- Try to insert a booking with new status
INSERT INTO bookings (
  couple_id, vendor_id, event_date, status, 
  service_name, service_type, created_at, updated_at
) VALUES (
  '1-2025-TEST', '2-2025-TEST', '2025-12-31', 
  'quote_accepted', 'Test Service', 'test', NOW(), NOW()
);

-- If successful, clean up:
DELETE FROM bookings WHERE couple_id = '1-2025-TEST';
```

### Test 3: Frontend Accept Quote Test
1. Open browser: https://weddingbazaar-web.web.app
2. Log in as a couple
3. Go to Bookings page
4. Find a booking with "Quote Sent" status
5. Click "View Details"
6. Click **"Accept Quote"** button
7. ✅ Success: Status should change to "Quote Accepted"
8. ❌ Failure: Check browser console and network tab

---

## 🐛 Troubleshooting

### Error: "constraint bookings_status_check does not exist"
**Solution:** The constraint may have been dropped already. This is safe - just continue with the migration. The script will create the new constraint.

### Error: "duplicate key value violates unique constraint"
**Solution:** This is unrelated to our migration. Check for duplicate couple_id or vendor_id values in your test data.

### Error: "permission denied"
**Solution:** Make sure you're logged in as the database owner in Neon console.

### Migration runs but Accept Quote still fails
**Checklist:**
1. ✅ Verify backend is deployed: https://weddingbazaar-web.onrender.com/api/health
2. ✅ Check endpoint exists: `curl https://weddingbazaar-web.onrender.com/api/bookings/1/accept-quote -X PATCH`
3. ✅ Verify frontend is using correct API URL (check .env or config)
4. ✅ Check browser console for JavaScript errors
5. ✅ Check Network tab for 500 errors

---

## 📊 What This Migration Does

### Before Migration
```
Allowed statuses: request, pending, confirmed, cancelled, completed
❌ quote_accepted → ERROR: violates check constraint
```

### After Migration
```
Allowed statuses: 
  - request
  - pending
  - confirmed
  - cancelled
  - completed
  - quote_sent         ← NEW
  - quote_accepted     ← NEW (fixes Accept Quote)
  - deposit_paid       ← NEW (for future payment features)
  - fully_paid         ← NEW (for future payment features)
  - payment_pending    ← NEW (for future payment features)

✅ quote_accepted → SUCCESS: booking status updated
```

---

## 🔄 Rollback (Emergency Only)

If something goes wrong and you need to rollback:

```sql
-- EMERGENCY ROLLBACK - Only use if critical issues occur
BEGIN;

ALTER TABLE bookings DROP CONSTRAINT bookings_status_check;

ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('request', 'pending', 'confirmed', 'cancelled', 'completed'));

COMMIT;
```

**⚠️ WARNING:** Rolling back will break Accept Quote functionality again.

---

## ✅ Success Checklist

- [ ] Migration script ran without errors
- [ ] Constraint definition shows 9 statuses
- [ ] No existing bookings affected
- [ ] Test booking with `quote_accepted` succeeds
- [ ] Backend endpoint returns 200 OK
- [ ] Frontend Accept Quote button works
- [ ] Booking status updates in UI

---

## 📞 Next Steps After Migration

1. **Test Accept Quote in browser** - This should now work!
2. **Monitor for errors** - Check Render logs and browser console
3. **Verify booking status updates** - Check database after accepting quote
4. **Document any issues** - Report back for quick fixes

---

## 🎯 Expected Timeline

| Step | Time | Status |
|------|------|--------|
| Copy SQL script | 1 min | ⏳ |
| Paste into Neon | 30 sec | ⏳ |
| Run migration | 5 sec | ⏳ |
| Verify output | 1 min | ⏳ |
| Test in browser | 2 min | ⏳ |
| **TOTAL** | **~5 min** | ⏳ |

---

## 🔗 Related Files
- Migration script: `database-migrations/001-fix-bookings-status-constraint.sql`
- Backend endpoint: `backend-deploy/routes/bookings.cjs` (lines 450-500)
- Frontend component: `src/pages/users/individual/bookings/components/QuoteDetailsModal.tsx`
- API base URL: `backend-deploy/index.ts` (line 15)

---

**Last Updated:** 2025-10-21  
**Status:** ✅ Ready to apply  
**Risk Level:** 🟢 Low (backward compatible, no data loss)
