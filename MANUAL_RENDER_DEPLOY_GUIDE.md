# 🚀 MANUAL RENDER DEPLOYMENT GUIDE

## ⚡ QUICK DEPLOY - 5 MINUTE PROCESS

### 🎯 What We're Deploying
**Fixed Code**: Wallet transactions endpoint (no more 500 errors!)  
**Commit**: `ef36d14` - "FIX: Wallet transactions endpoint - Fixed sql.join() error"  
**Branch**: `main`

---

## 📋 STEP-BY-STEP DEPLOYMENT

### Step 1: Open Render Dashboard
1. Go to: https://dashboard.render.com
2. Log in with your credentials
3. Find the service: **weddingbazaar-web** (or similar name for backend)

### Step 2: Initiate Manual Deploy
1. Click on the backend service name
2. Look for the **"Manual Deploy"** button in the top right
3. Click it
4. A dropdown will appear

### Step 3: Select Branch and Deploy
1. **Branch to Deploy**: Select `main` (should be default)
2. **Latest Commit**: You should see `ef36d14` - "FIX: Wallet transactions endpoint"
3. Click the **"Deploy"** button

### Step 4: Monitor Build Progress
Watch the build log (it will auto-open):

```
✅ Build started...
✅ Installing dependencies...
✅ npm install
✅ Build successful
✅ Starting service...
✅ Deploy live
✅ Health checks passing
```

**Expected Time**: 2-3 minutes

### Step 5: Verify Deployment
Once you see **"Deploy live"**:

1. **Check Service Status**: Should show green "Live" indicator
2. **Note the URL**: Should be `https://weddingbazaar-web.onrender.com`

---

## 🧪 POST-DEPLOYMENT TESTING

### Test 1: Health Check
```bash
curl https://weddingbazaar-web.onrender.com/api/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX..."
}
```

### Test 2: Wallet Summary (Should Already Work)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://weddingbazaar-web.onrender.com/api/wallet/2-2025-001
```

**Expected**: 200 OK with wallet data

### Test 3: Transactions Endpoint (THE FIX!)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://weddingbazaar-web.onrender.com/api/wallet/2-2025-001/transactions
```

**Expected**: 
- ✅ Status: `200 OK` (not 500!)
- ✅ Response: `{ "success": true, "transactions": [...] }`

---

## 🔍 GETTING A JWT TOKEN (If Needed)

If you need a fresh JWT token for testing:

```bash
# Login as vendor
curl -X POST https://weddingbazaar-web.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@test.com",
    "password": "test123"
  }'
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "role": "vendor",
    "vendorId": "2-2025-001"
  }
}
```

Copy the `token` value and use it in the Authorization header.

---

## 📊 WHAT TO EXPECT AFTER DEPLOYMENT

### Backend (Render)
- ✅ Service status: **Live** (green indicator)
- ✅ `/api/wallet/:vendorId/transactions` returns `200 OK`
- ✅ No 500 errors in logs
- ✅ Transactions array populated

### Frontend (Firebase - Already Deployed)
Once backend is live:
1. Visit: https://weddingbazaarph.web.app/vendor/finances
2. Log in as vendor
3. Go to **Transactions** tab
4. **Transaction history should now load!** 🎉

---

## ⚠️ TROUBLESHOOTING

### Issue: Build Fails
**Check**: 
- Render logs for error messages
- Ensure `package.json` has all dependencies
- Verify Node version compatibility

### Issue: Deploy Succeeds but Still 500 Error
**Check**:
1. Render logs for runtime errors
2. Database connection (DATABASE_URL env var)
3. Test with cURL to isolate issue

### Issue: "Manual Deploy" Button Disabled
**Reason**: Previous deploy in progress  
**Solution**: Wait for current deploy to finish (check Logs tab)

---

## 🎯 SUCCESS CRITERIA

You'll know it worked when:

1. ✅ Render dashboard shows **"Live"** status
2. ✅ Health check endpoint returns 200
3. ✅ Wallet summary endpoint returns 200
4. ✅ **Transactions endpoint returns 200** (was 500 before!)
5. ✅ Frontend displays transaction history
6. ✅ No errors in Render logs

---

## 📞 NEXT STEPS AFTER SUCCESSFUL DEPLOYMENT

1. **Verify in Frontend**:
   - Open https://weddingbazaarph.web.app/vendor/finances
   - Check Transactions tab loads
   - Verify data displays correctly

2. **Test Filters**:
   - Try date range filter
   - Try status filter
   - Verify CSV export works

3. **Mark Complete**:
   - Update project tracker
   - Close related GitHub issue
   - Document in changelog

---

## 🎉 DEPLOYMENT COMMAND SHORTCUT

For future deployments via Render CLI (optional):

```bash
# Install Render CLI
npm install -g render-cli

# Deploy from command line
render deploy --service weddingbazaar-web --branch main
```

---

**TIME TO DEPLOY**: ⏱️ **3 minutes**  
**DIFFICULTY**: 🟢 **Easy** - Just click buttons!  
**CONFIDENCE**: 🟢 **High** - Fix is tested and verified

**READY TO GO!** 🚀
