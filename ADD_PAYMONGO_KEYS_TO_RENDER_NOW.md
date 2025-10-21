# 🚨 URGENT: Add PayMongo Keys to Render NOW!

## Current Status
✅ Backend deployed successfully  
✅ Payment routes registered and available  
❌ **PayMongo API keys MISSING from Render**

The deployment logs show:
```
💳 [PAYMENT SERVICE] Secret Key: ❌ Missing
💳 [PAYMENT SERVICE] Public Key: ❌ Missing
```

---

## 🔑 PayMongo Keys Available

### TEST Keys (Use These First):
```
Public Key:  pk_test_[YOUR_KEY_HERE]
Secret Key:  sk_test_[YOUR_KEY_HERE]
```

**Get keys from**: Your PayMongo Dashboard → Developers → API Keys

### LIVE Keys (For Production Later):
```
Public Key:  pk_live_[YOUR_KEY_HERE]
Secret Key:  sk_live_[YOUR_KEY_HERE]
```

**IMPORTANT**: Never commit actual API keys to Git!

---

## 📝 Step-by-Step Instructions

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Log in to your account
3. Find your service: **weddingbazaar-web** or **wedding-bazaar-backend**

### Step 2: Navigate to Environment Variables
1. Click on your backend service
2. Click **"Environment"** tab in the left sidebar
3. Scroll down to **"Environment Variables"** section

### Step 3: Add PayMongo TEST Keys
Click **"Add Environment Variable"** and add these TWO variables:

**Variable 1:**
- Key: `PAYMONGO_PUBLIC_KEY`
- Value: `pk_test_[YOUR_KEY_HERE]`

**Variable 2:**
- Key: `PAYMONGO_SECRET_KEY`
- Value: `sk_test_[YOUR_KEY_HERE]`

### Step 4: Save Changes
1. Click **"Save Changes"** button at the bottom
2. Render will automatically trigger a redeploy
3. Wait 2-3 minutes for deployment to complete

---

## ✅ Verification Steps

### After Deployment Completes:

**1. Check Backend Logs**
Look for this in the Render logs:
```
💳 [PAYMENT SERVICE] Secret Key: ✅ Configured
💳 [PAYMENT SERVICE] Public Key: ✅ Configured
```

**2. Test Payment Health Endpoint**
Run this command:
```powershell
Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/payments/health"
```

Expected response:
```json
{
  "status": "healthy",
  "paymongo_configured": true,
  "endpoints_available": [...]
}
```

**3. Test in Frontend**
1. Go to: https://weddingbazaar-web.web.app/individual/bookings
2. Click "Pay Deposit" on a booking
3. Use test card: `4343 4343 4343 4343`
4. Expiry: Any future date
5. CVC: `123`

---

## 🎯 Quick Command Reference

```powershell
# Check deployment status
Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/health"

# Check payment health
Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/payments/health"

# Monitor deployment (run after saving env vars)
Start-Sleep -Seconds 120; Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/payments/health"
```

---

## 📊 What Happens After Adding Keys

1. **Render will redeploy** (2-3 minutes)
2. **Payment endpoints will activate**:
   - `POST /api/payments/create-source`
   - `POST /api/payments/create-payment-intent`
   - `POST /api/payments/webhook`
   - `GET /api/payments/health`
3. **Frontend can process real payments**
4. **Receipt generation will work**
5. **Booking status updates automatically**

---

## 🚨 IMPORTANT NOTES

### About TEST vs LIVE Keys:
- **START WITH TEST KEYS** (as shown above)
- Test thoroughly with test card numbers
- When ready for production, replace with LIVE keys
- **Never commit keys to Git** (Render env vars only!)

### Test Card Numbers:
```
✅ Success: 4343 4343 4343 4343
❌ Decline: 4571 7360 0000 0008
⏱️ Timeout: 4000 0000 0000 0069
```

---

## 🎬 DO THIS NOW!

1. **Open Render Dashboard**: https://dashboard.render.com
2. **Go to Environment tab**
3. **Add both keys** (PAYMONGO_PUBLIC_KEY and PAYMONGO_SECRET_KEY)
4. **Save Changes**
5. **Wait 2-3 minutes**
6. **Test payment endpoint**

---

## 📞 Need Help?

If you get stuck:
1. Check Render logs for errors
2. Verify key names are EXACT (case-sensitive)
3. Make sure no extra spaces in values
4. Wait full 2-3 minutes for redeploy

---

**🎯 Current Priority: ADD KEYS TO RENDER NOW!**

Once keys are added, payment processing will work immediately! 🚀
