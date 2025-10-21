# 🎯 QUICK START: Real PayMongo Integration

## ⚡ 3-Minute Setup

### 1. Get PayMongo Keys (1 min)
- Go to: https://dashboard.paymongo.com/developers/api-keys
- Toggle to **Test Mode**
- Copy: `sk_test_...` and `pk_test_...`

### 2. Add to .env (30 sec)
```bash
PAYMONGO_SECRET_KEY=sk_test_paste_your_key_here
PAYMONGO_PUBLIC_KEY=pk_test_paste_your_key_here
VITE_PAYMONGO_SECRET_KEY=sk_test_paste_your_key_here
VITE_PAYMONGO_PUBLIC_KEY=pk_test_paste_your_key_here
```

### 3. Restart & Test (1.5 min)
```powershell
# Terminal 1: Backend
cd backend-deploy
npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Test
curl http://localhost:3001/api/payment/health
```

---

## 💳 Test Card (Memorize This!)

```
Card: 4343 4343 4343 4343
Expiry: 12/34
CVC: 123
Name: Test User
```

---

## ✅ Success Checklist

```
□ Backend logs show: "Secret Key: ✅ Available"
□ /api/payment/health returns: "paymongo_configured": true
□ Console shows: "💳 [CARD PAYMENT - REAL]"
□ Payment completes in 3-5 seconds (not instant)
□ Receipt number starts with: WB-2025-
□ Database has new receipt record
```

---

## 🔍 Quick Debug

**Problem:** API keys not working  
**Fix:** Ensure they start with `sk_test_` and `pk_test_`

**Problem:** Payment fails  
**Fix:** Use exact test card: `4343 4343 4343 4343`

**Problem:** No logs show  
**Fix:** Restart both frontend AND backend

---

## 📖 Full Docs

- **Complete Guide:** `PAYMONGO_REAL_INTEGRATION_COMPLETE.md`
- **Testing Guide:** `PAYMONGO_TEST_SETUP_GUIDE.md`
- **Summary:** `PAYMONGO_TESTING_COMPLETE_SUMMARY.md`

---

**Status:** ✅ REAL PayMongo Integration Complete  
**Last Updated:** January 11, 2025  
**Test Now:** http://localhost:5173 → My Bookings → Pay Deposit

🚀 **You're ready to process real payments!** 🚀
