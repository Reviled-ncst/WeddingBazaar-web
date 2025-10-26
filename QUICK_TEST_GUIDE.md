# 🚀 Quick Test Guide - Subscription Limit Enforcement

## ✅ EVERYTHING IS DEPLOYED AND READY!

### 🔗 Test URL
**Production Site**: https://weddingbazaarph.web.app

### 👤 Test Account
**Email**: elealesantos06@gmail.com  
**Password**: [Use your vendor account password]

---

## 🧪 Test Plan (5 Minutes)

### Test 1: Basic Service Creation ✅
```
1. Login → vendor
2. Click "Manage Services"
3. Click "+ Add Service"
4. Fill form:
   - Title: "Test Service via Fixed Schema"
   - Category: Photography
   - Description: "Testing database fix"
   - Location: "123 Purple Street, Victoria Homes Sapphire Hills, Tunasan, Muntinlupa District 1, Muntinlupa, Southern Manila District, Metro Manila, 1774, Philippines"
   - Price: 5000
5. Click "Create Service"

✅ EXPECTED: Service creates successfully
❌ SHOULD NOT SEE:
   - "vendor_id violates foreign key constraint"
   - "value too long for type character varying(20)"
```

### Test 2: Limit Enforcement ✅
```
1. Count current services (should be < 5 for Basic plan)
2. Create services until you reach 5 total
3. Try to create a 6th service

✅ EXPECTED: 
   - Upgrade modal appears
   - Shows "5/5 services"
   - Shows "Basic Plan"
   - Recommends "Premium Plan"
   - Form closes without making API call

❌ SHOULD NOT SEE:
   - 6th service created
   - API error response
```

---

## 📊 What to Check

### Browser Console (F12 → Console)
**Look for these logs**:
```
✅ Good:
🔍 [VendorServices] Making API request: { vendorId_used: "2-2025-003" }
✅ Service created successfully
🚫 [VendorServices] Service limit reached: {current: 5, limit: 5}

❌ Bad (should NOT see):
vendor_id: "daf1dd71-..." ← UUID instead of vendor ID
❌ Failed to create service
value too long for type character varying(20)
```

### Network Tab (F12 → Network)
**POST /api/services**:
```json
✅ Request Payload should have:
{
  "vendor_id": "2-2025-003",  ← Correct format
  "location": "Long address...",  ← Should work now
  "availability": "{...JSON...}"  ← Should work now
}

✅ Response (201):
{
  "success": true,
  "service": {...}
}

✅ Response (403) when limit reached:
{
  "success": false,
  "error": "Service limit reached",
  "upgrade_required": true
}
```

---

## 🐛 Common Issues

### ❌ "Foreign key constraint error"
**Cause**: vendor_id still using UUID  
**Check**: Browser console for vendor_id value  
**Expected**: vendor_id should be "2-2025-003"  
**Fix**: Already applied, refresh page (Ctrl+Shift+R)

### ❌ "VARCHAR too long" error
**Cause**: Database schema not updated  
**Check**: Which field is too long  
**Expected**: All fields should accept long values now  
**Fix**: Already applied, database migrated

### ❌ Upgrade modal not showing
**Cause**: Frontend limit check not running  
**Check**: Browser console for limit check logs  
**Expected**: Should see log before API call  
**Debug**: Check subscription context loaded

---

## ✅ Success Criteria

- [ ] Can create service with long location
- [ ] vendor_id is "2-2025-003" format
- [ ] No database constraint errors
- [ ] Upgrade modal shows at 5 services
- [ ] 6th service creation blocked
- [ ] All logs look correct

---

## 📝 Report Results

After testing, create a brief summary:

```markdown
## Test Results - [Date]

### Test 1: Service Creation
- Status: ✅ Pass / ❌ Fail
- Notes: [Any issues or observations]

### Test 2: Limit Enforcement
- Status: ✅ Pass / ❌ Fail
- Current count: X/5
- Modal appeared: Yes/No
- Notes: [Any issues or observations]

### Console Logs
[Paste any relevant console messages]

### Screenshots
[Optional: Add screenshots of success/failure]
```

---

## 📞 Need Help?

1. Check `SUBSCRIPTION_MANUAL_TESTING_GUIDE.md`
2. Check `SUBSCRIPTION_COMPLETE_FIX_DEPLOYED.md`
3. Review browser console and network logs
4. Check Render backend logs

---

**Last Updated**: October 26, 2025  
**Status**: ✅ READY FOR TESTING
