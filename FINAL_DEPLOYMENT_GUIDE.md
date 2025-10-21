# 🚀 FINAL DEPLOYMENT - PayMongo Keys Configuration

## ✅ Current Status
- ✅ Frontend deployed and working (showing "CARD PAYMENT - REAL" logs)
- ✅ Backend code is ready
- ⏳ **PENDING**: Add PayMongo keys to Render backend
- ⏳ **PENDING**: Test real payment flow

---

## 🔑 Your PayMongo API Keys

### TEST Keys (Use these first for testing)
```
Public Key:  pk_test_[REDACTED]
Secret Key:  sk_test_[REDACTED]
```

### LIVE Keys (Use when ready for production)
```
Public Key:  pk_live_[REDACTED]
Secret Key:  sk_live_[REDACTED]
```

---

## 📋 Step-by-Step Deployment (15 minutes)

### Step 1: Add Keys to Render Backend (5 min)

1. **Open Render Dashboard:**
   - Go to: https://dashboard.render.com
   - Login with your credentials

2. **Navigate to Your Service:**
   - Click on: **weddingbazaar-web** service
   - Click on: **Environment** tab

3. **Add PayMongo TEST Keys:**
   - Click: **Add Environment Variable**
   
   **Variable 1:**
   ```
   Key:   PAYMONGO_SECRET_KEY
   Value: sk_test_[REDACTED]
   ```
   
   **Variable 2:**
   ```
   Key:   PAYMONGO_PUBLIC_KEY
   Value: pk_test_[REDACTED]
   ```

4. **Save Changes:**
   - Click: **Save Changes**
   - Render will automatically redeploy (takes 3-5 minutes)

5. **Monitor Deployment:**
   - Click: **Logs** tab
   - Look for these success messages:
   ```
   💳 [PAYMENT SERVICE] Secret Key: ✅ Available
   💳 [PAYMENT SERVICE] Public Key: ✅ Available
   ✅ [PAYMENT SERVICE] PayMongo integration initialized
   Server is running on port 10000
   ==> Your service is live 🎉
   ```

---

### Step 2: Verify Backend Configuration (2 min)

Wait for deployment to complete, then test:

```powershell
# Test backend health
$response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/payment/health" -Method Get
Write-Host "PayMongo Configured: $($response.paymongo_configured)" -ForegroundColor $(if ($response.paymongo_configured) { "Green" } else { "Red" })
Write-Host "Has Secret Key: $($response.has_secret_key)" -ForegroundColor $(if ($response.has_secret_key) { "Green" } else { "Red" })
Write-Host "Has Public Key: $($response.has_public_key)" -ForegroundColor $(if ($response.has_public_key) { "Green" } else { "Red" })
```

**Expected Output:**
```
PayMongo Configured: True
Has Secret Key: True
Has Public Key: True
```

---

### Step 3: Test Real Payment in Production (8 min)

1. **Open Production Site:**
   ```
   https://weddingbazaar-web.web.app
   ```

2. **Login:**
   - Email: vendor0qw@gmail.com
   - Password: (your password)

3. **Navigate to Bookings:**
   - Click: **My Bookings**
   - Find a booking with "quote_accepted" status

4. **Make TEST Payment:**
   - Click: **Pay Deposit**
   - Enter TEST card details:
     ```
     Card Number: 4343 4343 4343 4343
     Expiry: 12/34
     CVC: 123
     Name: Test User
     ```
   - Click: **Pay Now**

5. **Verify Success (Check Console - Press F12):**
   ```
   ✅ Expected logs:
   💳 [CARD PAYMENT - REAL] Processing REAL card payment...
   💳 [STEP 1] Creating PayMongo payment intent...
   ✅ Payment Intent Created: pi_xxxxxxxxxxxx
   💳 [STEP 2] Creating PayMongo payment method...
   ✅ Payment Method Created: pm_xxxxxxxxxxxx
   💳 [STEP 3] Attaching payment method to intent...
   ✅ Payment Attached Successfully
   💳 [STEP 4] Creating receipt in backend...
   📧 Receipt created: WB-2025-XXXX
   ✅ Payment successful!
   ```

6. **Verify in UI:**
   - ✅ Success message appears
   - ✅ Receipt modal displays
   - ✅ Receipt number: WB-2025-XXXX
   - ✅ Booking status updates to "deposit_paid"

7. **Verify in PayMongo Dashboard:**
   - Open: https://dashboard.paymongo.com
   - Go to: **Payments** → **All Payments**
   - ✅ Should see your test payment
   - ✅ Amount matches
   - ✅ Status: succeeded

---

### Step 4: Test Invalid Card (Should Fail!) (2 min)

**Important Test:** Verify that invalid cards are rejected

1. **Try Payment Again** with invalid card:
   ```
   Card Number: 4111 1111 1111 1111 (Invalid test card)
   Expiry: 12/34
   CVC: 123
   ```

2. **Expected Result:**
   - ❌ Payment should FAIL
   - ❌ Error message: "Invalid card" or "Payment declined"
   - ❌ Booking status should NOT change
   - ❌ No receipt generated

---

## 🎯 Success Checklist

After completing all steps, verify:

### Backend
- [ ] Render deployment completed successfully
- [ ] Backend logs show PayMongo keys configured
- [ ] Health endpoint returns `paymongo_configured: true`
- [ ] No errors in Render logs

### Frontend
- [ ] Console shows "CARD PAYMENT - REAL" logs
- [ ] Console shows all 4 STEPS (1-4)
- [ ] Payment takes 3-5 seconds (not instant)
- [ ] No "simulation" text in console

### Payment Flow
- [ ] TEST card (4343...) payment succeeds
- [ ] Invalid card (4111...) payment fails
- [ ] Receipt generated with format WB-2025-XXXX
- [ ] Booking status updates correctly
- [ ] Payment appears in PayMongo dashboard

### Error Handling
- [ ] Invalid card shows proper error message
- [ ] Network errors handled gracefully
- [ ] User-friendly error messages displayed

---

## 🔄 Quick Deployment Script

Save this as `deploy-complete.ps1` and run it after adding keys to Render:

```powershell
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PayMongo Complete Deployment Verification              ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Check if keys are added to Render
Write-Host "📋 Step 1: Have you added PayMongo keys to Render?" -ForegroundColor Yellow
Write-Host "   Go to: https://dashboard.render.com" -ForegroundColor Gray
Write-Host "   Service: weddingbazaar-web → Environment" -ForegroundColor Gray
Write-Host "   Add: PAYMONGO_SECRET_KEY and PAYMONGO_PUBLIC_KEY`n" -ForegroundColor Gray

$keysAdded = Read-Host "Have you added the keys and saved changes? (y/n)"
if ($keysAdded -ne "y") {
    Write-Host "❌ Please add keys to Render first, then run this script again." -ForegroundColor Red
    exit
}

# Step 2: Wait for deployment
Write-Host "`n⏳ Step 2: Waiting for Render deployment..." -ForegroundColor Yellow
Write-Host "   This usually takes 3-5 minutes" -ForegroundColor Gray
Start-Sleep -Seconds 30

# Step 3: Verify backend health
Write-Host "`n✅ Step 3: Verifying backend configuration..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/payment/health" -Method Get
    
    Write-Host "`n   Backend Health Check:" -ForegroundColor Cyan
    Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    if ($response.paymongo_configured) {
        Write-Host "   ✅ PayMongo Configured: YES" -ForegroundColor Green
    } else {
        Write-Host "   ❌ PayMongo Configured: NO" -ForegroundColor Red
    }
    
    if ($response.has_secret_key) {
        Write-Host "   ✅ Secret Key: Present" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Secret Key: Missing" -ForegroundColor Red
    }
    
    if ($response.has_public_key) {
        Write-Host "   ✅ Public Key: Present" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Public Key: Missing" -ForegroundColor Red
    }
    
    Write-Host "`n   📊 Environment: $($response.environment)" -ForegroundColor Cyan
    
    if ($response.paymongo_configured) {
        Write-Host "`n🎉 SUCCESS! Backend is ready for payments!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  WARNING: Backend not fully configured" -ForegroundColor Yellow
        Write-Host "   Please check Render environment variables" -ForegroundColor Yellow
        exit
    }
    
} catch {
    Write-Host "`n❌ Failed to connect to backend" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n   Render might still be deploying. Wait a few minutes and try again." -ForegroundColor Yellow
    exit
}

# Step 4: Instructions for testing
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🧪 NEXT: Test Payment in Production" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n1️⃣  Open Production Site:" -ForegroundColor White
Write-Host "   https://weddingbazaar-web.web.app" -ForegroundColor Cyan

Write-Host "`n2️⃣  Login → My Bookings → Pay Deposit" -ForegroundColor White

Write-Host "`n3️⃣  Use TEST Card:" -ForegroundColor White
Write-Host "   Card: 4343 4343 4343 4343" -ForegroundColor Cyan
Write-Host "   Expiry: 12/34" -ForegroundColor Cyan
Write-Host "   CVC: 123" -ForegroundColor Cyan

Write-Host "`n4️⃣  Verify Success:" -ForegroundColor White
Write-Host "   • Payment takes 3-5 seconds" -ForegroundColor Gray
Write-Host "   • Console shows REAL PayMongo API calls (F12)" -ForegroundColor Gray
Write-Host "   • Receipt displays with WB-2025-XXXX format" -ForegroundColor Gray
Write-Host "   • Booking status updates to deposit_paid" -ForegroundColor Gray

Write-Host "`n5️⃣  Test Invalid Card (Should Fail):" -ForegroundColor White
Write-Host "   Card: 4111 1111 1111 1111" -ForegroundColor Cyan
Write-Host "   Expected: Payment rejected with error message" -ForegroundColor Yellow

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor Cyan

# Open browser
$openBrowser = Read-Host "Open production site in browser? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process "https://weddingbazaar-web.web.app"
}

Write-Host "`n✨ Deployment verification complete! 🚀`n" -ForegroundColor Green
```

---

## 🔒 When Ready to Go LIVE

After all tests pass with TEST keys:

1. **Update Render Environment Variables:**
   - Go back to Render Dashboard
   - Edit `PAYMONGO_SECRET_KEY`:
     - Change to: `sk_live_[REDACTED]`
   - Edit `PAYMONGO_PUBLIC_KEY`:
     - Change to: `pk_live_[REDACTED]`
   - Save changes (service will redeploy)

2. **Test with Real Card:**
   - Use a real credit/debit card
   - Small amount for testing (e.g., ₱100)
   - **Real money will be charged!**

3. **Monitor Closely:**
   - Check first few payments
   - Verify receipts generate correctly
   - Monitor PayMongo dashboard

---

## 🆘 Troubleshooting

### Issue: Backend health returns `paymongo_configured: false`

**Solution:**
1. Check Render Dashboard → Environment
2. Verify both keys are added exactly:
   - `PAYMONGO_SECRET_KEY`
   - `PAYMONGO_PUBLIC_KEY`
3. No extra spaces or quotes
4. Keys start with `sk_test_` and `pk_test_`
5. Click "Save Changes" again
6. Wait 3-5 minutes for redeploy

### Issue: Payment fails with "Configuration error"

**Solution:**
1. Check Render logs for errors
2. Verify keys are correct (no typos)
3. Try regenerating keys in PayMongo dashboard
4. Restart Render service manually

### Issue: Payment succeeds but no receipt

**Solution:**
1. Check backend logs in Render
2. Verify `receipts` table exists in database
3. Check for receipt generation errors
4. Verify PayMongo webhook (if configured)

---

## 📊 What Happens After Deployment

### With TEST Keys:
- ✅ No real money charged
- ✅ Test card always succeeds
- ✅ Appears in PayMongo TEST dashboard
- ✅ Perfect for development/testing
- ✅ Can share with QA team

### With LIVE Keys:
- ⚠️ **Real money charged!**
- ✅ Real cards processed
- ✅ Appears in PayMongo LIVE dashboard
- ✅ Ready for actual customers
- ⚠️ Monitor closely at first

---

## 🎉 Final Checklist

Before considering deployment complete:

- [ ] PayMongo TEST keys added to Render
- [ ] Render deployed successfully
- [ ] Backend health check passes
- [ ] Frontend shows real API logs
- [ ] Test payment succeeds
- [ ] Invalid card rejected
- [ ] Receipt generated
- [ ] Booking status updates
- [ ] Payment in PayMongo dashboard
- [ ] No errors in console
- [ ] All documentation reviewed

---

## 📚 Quick Reference

**Production URLs:**
- Frontend: https://weddingbazaar-web.web.app
- Backend: https://weddingbazaar-web.onrender.com
- PayMongo: https://dashboard.paymongo.com
- Render: https://dashboard.render.com

**Test Card:**
- Number: 4343 4343 4343 4343
- Expiry: 12/34
- CVC: 123

**Health Check:**
```powershell
Invoke-RestMethod "https://weddingbazaar-web.onrender.com/api/payment/health"
```

---

**Ready to deploy?** Follow Step 1 above to add keys to Render! 🚀
