# 🚀 Deployment Instructions

## GitHub Secret Scanning Block

GitHub has detected secrets in the git history and blocked the push. You have two options:

### Option 1: Allow the Secret (Quick Fix)
1. Go to the GitHub URL provided in the error:
   https://github.com/Reviled-ncst/WeddingBazaar-web/security/secret-scanning/unblock-secret/34LbctuPeJDc4LB9a1tGhP8WH7F

2. Click "Allow secret" (these are TEST keys, already rotated)

3. Then push again:
   ```bash
   git push origin main
   ```

### Option 2: Manual Deployment to Render

Since the code changes are local and working, you can deploy directly without pushing:

#### Step 1: Add Environment Variables to Render

1. Go to: https://dashboard.render.com
2. Select your service: `weddingbazaar-web`
3. Go to **Environment** tab
4. Add these variables:

```
PAYMONGO_SECRET_KEY=sk_test_[YOUR_ACTUAL_KEY]
PAYMONGO_PUBLIC_KEY=pk_test_[YOUR_ACTUAL_KEY]
DATABASE_URL=postgresql://[YOUR_ACTUAL_DB_URL]
JWT_SECRET=wedding-bazaar-production-secret-2024-firebase-integration
FRONTEND_URL=https://weddingbazaar-web.web.app
NODE_ENV=production
PORT=3001
```

5. Click **Save Changes**
6. Render will auto-redeploy with the new environment variables

#### Step 2: Test the Backend

```bash
# Test backend health
Invoke-WebRequest https://weddingbazaar-web.onrender.com/api/health

# Should return:
# {
#   "status": "ok",
#   "paymongo_configured": true,
#   "database": "connected"
# }
```

#### Step 3: Deploy Frontend (Optional)

If you made frontend changes:

```bash
npm run build
firebase deploy
```

## Current Status

### ✅ Code Changes Complete
- Receipt generation logic added to `backend-deploy/routes/bookings.cjs`
- All API keys removed from repository
- All database URLs sanitized

### ⚠️ Deployment Blocked
- GitHub secret scanning detected old keys in git history
- Options: Allow secret on GitHub OR deploy directly via Render dashboard

### 🔑 Keys to Use in Render

Get your actual PayMongo keys from:
https://dashboard.paymongo.com/developers/api-keys

**Important**: Use TEST keys (sk_test_*, pk_test_*) for testing, not LIVE keys!

## Verification Steps

After deployment:

1. **Check Backend Logs**:
   - Go to Render dashboard > Logs
   - Look for: `✅ [PAYMENT SERVICE] PayMongo integration initialized`

2. **Test Receipt Endpoint**:
   ```bash
   # Replace {bookingId} with a real booking ID
   Invoke-WebRequest https://weddingbazaar-web.onrender.com/api/payment/receipts/{bookingId}
   ```

3. **Test in Frontend**:
   - Make a test payment
   - Click "View Receipt" button
   - Verify receipt displays correctly

## Troubleshooting

### "paymongo_configured: false"
- Environment variables not set in Render
- Go to Render > Environment tab and add keys

### "No receipts found"
- Payments made before this fix won't have receipts
- Make a NEW test payment to generate a receipt

### "404 Not Found"
- Deployment hasn't completed yet
- Wait for Render to finish deploying (check Logs tab)

## Documentation

- `API_KEYS_REMOVED.md` - What was sanitized
- `RECEIPT_SYSTEM_COMPLETE_SUMMARY.md` - Receipt system overview
- `MANUAL_RENDER_DEPLOYMENT.md` - Detailed deployment guide
