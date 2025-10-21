# 🚀 QUICK START - Deploy PayMongo Now!

## ⚡ 3-Step Deployment (15 minutes)

### Step 1: Add Keys to Render (5 min)
1. Open: https://dashboard.render.com
2. Click: **weddingbazaar-web** → **Environment**
3. Add TWO variables:
   ```
   PAYMONGO_SECRET_KEY = sk_test_[REDACTED]
   PAYMONGO_PUBLIC_KEY = pk_test_[REDACTED]
   ```
4. Click: **Save Changes** (service auto-redeploys)

---

### Step 2: Run Verification Script (5 min)
```powershell
.\deploy-complete.ps1
```

This will:
- ✅ Check backend health
- ✅ Verify keys are configured
- ✅ Show testing instructions

---

### Step 3: Test Payment (5 min)
1. Open: https://weddingbazaar-web.web.app
2. Login → My Bookings → Pay Deposit
3. Use: `4343 4343 4343 4343` (TEST card)
4. Verify: Receipt displays, status updates

---

## ✅ Success Checklist
- [ ] Keys added to Render
- [ ] Backend health check passes
- [ ] Test payment works
- [ ] Receipt generated (WB-2025-XXXX)
- [ ] Invalid card rejected

---

## 🔑 Your PayMongo Keys

**TEST (use now):**
```
Secret: sk_test_[REDACTED]
Public: pk_test_[REDACTED]
```

**LIVE (use when ready):**
```
Secret: sk_live_[REDACTED]
Public: pk_live_[REDACTED]
```

---

## 💳 Test Cards

**Valid (should succeed):**
```
Card: 4343 4343 4343 4343
Expiry: 12/34
CVC: 123
```

**Invalid (should fail):**
```
Card: 4111 1111 1111 1111
Expiry: 12/34
CVC: 123
```

---

## 🔗 Quick Links
- **Production:** https://weddingbazaar-web.web.app
- **Render:** https://dashboard.render.com
- **PayMongo:** https://dashboard.paymongo.com

---

## 📚 Full Documentation
See: `FINAL_DEPLOYMENT_GUIDE.md` for complete instructions

---

**Ready?** Run: `.\deploy-complete.ps1` 🚀
