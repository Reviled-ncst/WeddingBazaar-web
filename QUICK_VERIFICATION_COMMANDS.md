# ⚡ Quick Verification Commands

## 🚀 Just Pushed - Wait 5 Minutes, Then Run These:

### 1️⃣ Health Check (First Test)
```bash
curl https://weddingbazaar-web.onrender.com/api/health
```
**Expected**: `{"status":"ok","timestamp":"...","environment":"production","database":"connected"}`

---

### 2️⃣ Subscription Plans (Core Feature)
```bash
curl https://weddingbazaar-web.onrender.com/api/subscriptions/plans
```
**Expected**: Array with 3 plans (basic, professional, premium)
```json
[
  {
    "code": "basic",
    "name": "Free Plan",
    "price": 0,
    "features": {
      "max_services": 1,
      "max_bookings_per_month": 5,
      "analytics_access": false,
      "priority_support": false,
      "featured_listing": false
    }
  },
  {
    "code": "professional",
    "name": "Professional Plan",
    "price": 29900,
    "features": {
      "max_services": 10,
      "max_bookings_per_month": 50,
      "analytics_access": true,
      "priority_support": false,
      "featured_listing": false
    }
  },
  {
    "code": "premium",
    "name": "Premium Plan",
    "price": 59900,
    "features": {
      "max_services": -1,
      "max_bookings_per_month": -1,
      "analytics_access": true,
      "priority_support": true,
      "featured_listing": true
    }
  }
]
```

---

### 3️⃣ All Endpoints Test (Comprehensive)
```bash
# Copy and paste this entire block:

echo "Testing Health..."
curl -s https://weddingbazaar-web.onrender.com/api/health | jq .

echo -e "\nTesting Plans..."
curl -s https://weddingbazaar-web.onrender.com/api/subscriptions/plans | jq .

echo -e "\nTesting Ping..."
curl -s https://weddingbazaar-web.onrender.com/api/ping

echo -e "\n✅ Basic tests complete!"
```

---

## 🔐 Authenticated Endpoint Tests

### Get Your Auth Token First
1. Login to frontend: https://weddingbazaar-web.web.app
2. Open browser console (F12)
3. Run: `localStorage.getItem('token')`
4. Copy the token (looks like: `eyJhbGciOiJIUzI1NiIs...`)

### Then Test These Endpoints
```bash
# Replace YOUR_TOKEN_HERE with your actual token

# 1. Get vendor subscription
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  https://weddingbazaar-web.onrender.com/api/subscriptions/vendor

# 2. Check usage limits
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  https://weddingbazaar-web.onrender.com/api/subscriptions/usage/limits

# 3. Get current usage
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  https://weddingbazaar-web.onrender.com/api/subscriptions/usage/current
```

---

## 🎯 Expected Results

### ✅ Success Indicators
- Health endpoint: `200 OK` with `status: "ok"`
- Plans endpoint: `200 OK` with 3 plans
- Vendor endpoint: `200 OK` with subscription data OR `404` if no subscription (fallback to basic)
- Usage limits: `200 OK` with limit data

### ❌ Failure Indicators
- `502 Bad Gateway`: Server not started yet (wait 2 more minutes)
- `503 Service Unavailable`: Server starting (wait 1 more minute)
- `404 Not Found` on `/api/subscriptions/*`: Routes not registered (check logs)
- `500 Internal Server Error`: Check Render logs immediately

---

## 🐛 If Tests Fail

### 1. Check Render Deployment Status
Go to: https://dashboard.render.com/
- Click your service: `weddingbazaar-web`
- Check "Events" tab - should show "Live" status
- If "Deploy failed", click on deployment for error logs

### 2. Check Server Logs
```bash
# In Render dashboard, click "Logs" tab
# Look for these messages:

✅ "Server running on port 3001"
✅ "✓ Subscription system initialized"
✅ "Database connected successfully"

❌ "Error: Cannot find module..."
❌ "SyntaxError: Unexpected token..."
❌ "Error connecting to database..."
```

### 3. Quick Fixes
```bash
# If deployment failed due to syntax error:
# 1. Fix the error locally
# 2. Commit and push again:
git add .
git commit -m "Fix deployment error"
git push origin main

# If environment variables missing:
# 1. Go to Render Dashboard > Environment
# 2. Add missing variables (DATABASE_URL, JWT_SECRET, etc.)
# 3. Click "Save Changes" (triggers redeploy)
```

---

## 📊 What to Look For in Render Logs

### During Deployment (Building)
```
==> Installing dependencies...
npm install
✓ Dependencies installed

==> Starting build...
✓ Build complete

==> Starting server...
node backend-deploy/production-backend.js
```

### After Deployment (Running)
```
Server running on port 3001
✓ Subscription system initialized
Database connected successfully
Express server listening at http://localhost:3001
```

### Healthy Server Logs
```
GET /api/health 200 - 5ms
GET /api/subscriptions/plans 200 - 12ms
GET /api/subscriptions/vendor 200 - 8ms
```

### Problem Logs (Red Flags)
```
❌ Error: Cannot find module './routes/subscriptions/index.cjs'
❌ SyntaxError: Unexpected token } in JSON at position 123
❌ Error: connect ECONNREFUSED (database connection failed)
❌ UnhandledPromiseRejectionWarning: Error: ...
```

---

## 🕐 Timeline Reference

| Time Since Push | Action | Expected Result |
|----------------|--------|-----------------|
| 0-1 min | Render detects commit | "Deploy triggered" in dashboard |
| 1-3 min | Building | "Installing dependencies..." |
| 3-4 min | Starting server | "Starting server..." |
| 4-5 min | Health check | Server responds to requests |
| 5+ min | **YOU TEST** | Run verification commands |

---

## 🎉 Success Confirmation

Run this final test after all individual tests pass:

```bash
echo "🚀 Final Verification Test"
echo "=========================="

# 1. Health
HEALTH=$(curl -s https://weddingbazaar-web.onrender.com/api/health)
if [[ $HEALTH == *"ok"* ]]; then
  echo "✅ Health: PASS"
else
  echo "❌ Health: FAIL"
fi

# 2. Plans
PLANS=$(curl -s https://weddingbazaar-web.onrender.com/api/subscriptions/plans)
if [[ $PLANS == *"basic"* ]] && [[ $PLANS == *"professional"* ]] && [[ $PLANS == *"premium"* ]]; then
  echo "✅ Plans: PASS (3 plans found)"
else
  echo "❌ Plans: FAIL"
fi

# 3. Ping
PING=$(curl -s https://weddingbazaar-web.onrender.com/api/ping)
if [[ $PING == *"pong"* ]]; then
  echo "✅ Ping: PASS"
else
  echo "❌ Ping: FAIL"
fi

echo "=========================="
echo "🎯 Deployment Verification Complete!"
```

---

## 📝 Quick Notes

- **Production URL**: https://weddingbazaar-web.onrender.com
- **Frontend URL**: https://weddingbazaar-web.web.app
- **Database**: Neon PostgreSQL (auto-connected)
- **PayMongo**: TEST mode (switch to LIVE after testing)

**First-Time Setup**:
1. Wait 5 minutes after push
2. Run health check
3. Run plans check
4. If both pass: ✅ Deployment successful!
5. If either fails: 🐛 Check Render logs

**Free Tier Behavior**:
- Vendors without subscription automatically get "basic" plan
- Service limit: 0/1 (can add 1 service)
- Booking limit: 5/month
- No analytics access
- No featured listing

**Paid Plan Testing**:
- Use PayMongo test card: `4343434343434345`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- Will create subscription and receipt in database

---

**Remember**: First deployment after major changes may take up to 10 minutes. Be patient! ⏰
