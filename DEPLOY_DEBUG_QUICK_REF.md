# 🚨 DEPLOY & DEBUG - Quick Reference

## ⚡ 3-Step Process

### 1️⃣ DEPLOY (2 minutes)
```
Go to: https://dashboard.render.com/
Click: "Manual Deploy"
Select: main branch
Click: "Deploy"
Wait: 3-5 minutes
```

### 2️⃣ MONITOR (Real-time)
```
Stay on Render Dashboard
Click: "Logs" tab
Watch: Real-time log output
Look for: ✅ or ❌ emoji indicators
```

### 3️⃣ TEST (1 minute)
```
Go to: https://weddingbazaarph.web.app/vendor/services
Login as: vendor0qw@gmail.com
Create: Test service
Watch: Render logs update in real-time
```

---

## 📊 What Logs to Watch For

### ✅ SUCCESS PATTERN
```
✅ [Database] Connection successful!
✅ [Document Check] vendor_documents table exists
✅ [Document Check] Query successful! Returned 1 documents
✅ [Document Check] All required documents verified
✅ Service created successfully
```

### ❌ ERROR PATTERNS

**Pattern 1: Old Code Still Running**
```
❌ [Document Check] SQL Query Error
message: 'relation "documents" does not exist'
```
**Fix**: Redeploy - Render didn't pick up changes

**Pattern 2: Table Missing**
```
❌ [Document Check] vendor_documents table NOT FOUND
```
**Fix**: Run SQL migration in Neon

**Pattern 3: No Documents**
```
✅ [Document Check] Query successful! Returned 0 documents
❌ [Document Check] Missing required documents: Business License
```
**Fix**: Upload and approve document for vendor

**Pattern 4: Connection Failed**
```
❌ [Database] Connection failed: timeout
```
**Fix**: Check Render environment variables (DATABASE_URL)

---

## 🔍 Log Emoji Legend

| Emoji | Meaning | Action |
|-------|---------|--------|
| 📤 | Request received | Normal - request started |
| 🔌 | Database test | Check connection |
| ✅ | Success | Good! Continue |
| ❌ | Error | Stop! Read message |
| 🔍 | Checking | Normal - verification in progress |
| 📋 | Info | Normal - informational |
| 📡 | Executing | Normal - query running |
| 📄 | Result | Normal - data returned |
| 🆔 | Generated ID | Normal - service ID created |
| 💾 | Saving | Normal - inserting to DB |

---

## 🎯 Quick Diagnosis

### If You See "documents does not exist"
**Problem**: Render has OLD code  
**Solution**: Manual deploy didn't work, trigger again  
**Verification**: Check logs for table verification step

### If You See "vendor_documents table NOT FOUND"
**Problem**: Database schema issue  
**Solution**: Run SQL migration (`RUN_THIS_IN_NEON_NOW.sql`)  
**Verification**: Query Neon console for table

### If You See "Returned 0 documents"
**Problem**: No approved documents for vendor  
**Solution**: Upload business license via Documents page  
**Verification**: Check `vendor_documents` table in Neon

### If You See "Connection failed"
**Problem**: Database connection issue  
**Solution**: Check Render env vars for `DATABASE_URL`  
**Verification**: Test health endpoint

---

## 📝 Copy-Paste Commands

### Test Backend Health
```powershell
curl https://weddingbazaar-web.onrender.com/api/health
```

### Check Latest Git Commit
```powershell
git log --oneline -1
# Should show: 4a6999b feat(services): Add comprehensive database...
```

### Test Service Creation (Direct API)
```powershell
Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/services" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"vendor_id":"2-2025-003","title":"Test","category":"Photography","description":"test"}'
```

---

## 🚨 Emergency Checklist

If service creation fails:

```
[ ] 1. Check Render logs show NEW logging format
[ ] 2. Verify "vendor_documents table exists" message
[ ] 3. Confirm query returned documents (not 0)
[ ] 4. Check no "documents does not exist" error
[ ] 5. Verify service ID was generated (SRV-XXXXX)
[ ] 6. Confirm "Service created successfully" message
```

If ANY step fails:
- ❌ Step 1: Redeploy on Render
- ❌ Step 2-3: Run SQL migration in Neon
- ❌ Step 4: Check git commit on Render
- ❌ Step 5-6: Check database constraints

---

## 🎉 Success Looks Like

**Render Logs**:
```
[12:34:56] 📤 [POST /api/services] Creating new service
[12:34:57] ✅ [Database] Connection successful!
[12:34:59] ✅ [Document Check] vendor_documents table exists
[12:35:00] ✅ [Document Check] Query successful! Returned 1 documents
[12:35:02] ✅ Service created successfully
```

**Frontend**:
```
✅ Service created successfully!
[Modal shows success animation]
[Service appears in list]
```

**Database** (Neon):
```sql
SELECT * FROM services WHERE vendor_id = '2-2025-003';
-- Should show new service with title "Test Service"
```

---

## 📞 Quick Links

- **Render Dashboard**: https://dashboard.render.com/
- **Frontend Services**: https://weddingbazaarph.web.app/vendor/services
- **Neon Console**: https://console.neon.tech/
- **Backend Health**: https://weddingbazaar-web.onrender.com/api/health

---

**Last Updated**: November 8, 2025  
**Commit**: 4a6999b  
**Next Action**: 🚨 **DEPLOY TO RENDER NOW!**
