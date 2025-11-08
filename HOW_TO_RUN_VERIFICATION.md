# 🔍 HOW TO RUN DATABASE VERIFICATION

## 📋 Steps to Run VERIFY_DATABASE_READY.sql

### **Option 1: Neon SQL Console (RECOMMENDED)**

1. **Open Neon Console**: https://console.neon.tech/
2. **Select your project**: "weddingbazaar" (or your project name)
3. **Click "SQL Editor"** in the left sidebar
4. **Copy the entire contents** of `VERIFY_DATABASE_READY.sql`
5. **Paste into SQL Editor**
6. **Click "Run"** or press `Ctrl+Enter`
7. **Review Results**: Check each step for ✅ or ❌

### **Expected Results:**

```
Step 1: VENDOR CHECK
✅ Vendor is verified

Step 2: DOCUMENTS CHECK  
✅ Document approved

Step 3: SCHEMA CHECK
✅ Correct (VARCHAR)

Step 4: FOREIGN KEY CHECK
✅ Links to vendors.user_id

Step 5: SERVICE COLUMNS CHECK
✅ All required fields exist

Step 6: CONSTRAINT TEST
✅ Constraints OK

Step 7: CURRENT SERVICES
✅ No services yet - ready to create first

Step 8: FINAL SUMMARY
✅ ALL CHECKS PASSED - Ready for service creation!
```

### **If Any Step Fails:**

Look at the bottom of `VERIFY_DATABASE_READY.sql` for **QUICK FIX QUERIES**.

Uncomment and run the appropriate fix based on which step failed.

---

## 🚀 Quick Database Connection Test

Run this in PowerShell to test if database is reachable:

```powershell
# Test backend database connection
Invoke-WebRequest -Uri "https://weddingbazaar-web.onrender.com/api/health" -UseBasicParsing | ConvertFrom-Json | Select-Object -Property database, databaseStats
```

---

## 📊 What Each Step Checks:

| Step | What It Checks | Why It Matters |
|------|----------------|----------------|
| 1 | Vendor exists and verified | Can't create services without verified vendor |
| 2 | Documents uploaded & approved | Backend checks this before allowing service creation |
| 3 | vendor_documents schema correct | Prevents type mismatch errors |
| 4 | Foreign key constraint | Ensures data integrity |
| 5 | Service table columns | All required fields present |
| 6 | Database constraints | No blocking constraints |
| 7 | Current service count | Shows existing services |
| 8 | Overall status | Final go/no-go check |

---

## ⚠️ Common Issues & Fixes:

### **Issue: "vendor_id is UUID instead of VARCHAR"**
**Fix**: Run the commented-out ALTER TABLE commands at bottom of script

### **Issue: "No documents found"**
**Fix**: Upload document at `/vendor/profile` page first

### **Issue: "Vendor not verified"**
**Fix**: Run `UPDATE vendors SET is_verified = true WHERE user_id = '2-2025-003';`

---

## 🎯 After Verification Passes:

1. **Deploy Backend** (if not done yet): See `VERIFY_DEPLOYMENT.ps1`
2. **Test Service Creation**: Go to `/vendor/services` → "Add Service"
3. **Monitor Logs**: Check Render logs for any errors
4. **Verify Success**: Service should appear in services list

---

## 📞 Need Help?

If verification fails after running fixes:
1. Copy the error output
2. Check Render backend logs
3. Review `SCHEMA_MISMATCH_ANALYSIS.md`
4. Run `.\VERIFY_DEPLOYMENT.ps1` to check backend version
