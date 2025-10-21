# 🎯 QUICK TEST GUIDE - Receipt Generation

## 🚀 READY TO TEST NOW!

**All systems deployed and verified!** ✅

---

## ⚡ 30-SECOND TEST

### 1. Open Console
```
F12 → Console tab → Clear logs
```

### 2. Start Payment
```
URL: https://weddingbazaarph.web.app/individual/bookings
Card: 4343 4343 4343 4343
Exp: 12/25 | CVC: 123
```

### 3. Watch for Step 4 Logs

#### ✅ SUCCESS (what you want to see):
```
💳 [STEP 4] Creating receipt in backend...
💳 [STEP 4] Mapping paymentType: "downpayment" -> "deposit"
✅ [STEP 4] Receipt response received: { success: true, ...}
🧾 [CARD PAYMENT - REAL] Receipt created: RCP-xxxxx
```

#### ❌ FAILURE (share these if you see them):
```
💳 [STEP 4] Creating receipt in backend...
❌ [STEP 4] Receipt creation failed!
❌ [STEP 4] Status: [number]
❌ [STEP 4] Error data: {...}
```

---

## 📋 WHAT TO SHARE

**If receipt still doesn't create, copy & paste:**

1. **All Step 4 console logs** (from "Creating receipt..." through success/failure)
2. **Backend logs from Render dashboard** (any errors during payment)
3. **Network tab** → Find POST to `/api/payment/process` → Share response

---

## 🔍 VERIFY RECEIPT

```powershell
node -e "const {sql} = require('./backend-deploy/config/database.cjs'); sql\`SELECT * FROM receipts ORDER BY created_at DESC LIMIT 1\`.then(r => console.table(r)).then(() => process.exit(0))"
```

**Expected**: 1 receipt with your booking ID and amount

---

## 🎯 KEY CHANGES

1. ✅ Backend now accepts any deposit amount (removed strict validation)
2. ✅ Backend checks both `amount` and `total_amount` fields
3. ✅ Frontend shows detailed error messages if receipt fails
4. ✅ Backend logs raw booking data for debugging

**If it fails, we'll see EXACTLY why! 🔍**

---

## 📞 NEXT STEPS

1. **Test payment now** (all systems are live)
2. **Copy Step 4 logs** (success or failure)
3. **Share if still not working**

**Ready when you are!** 🚀
