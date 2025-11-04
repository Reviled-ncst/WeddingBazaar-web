# ✅ DEBUG ENDPOINT DEPLOYED - Test Now!

**Status**: Debug endpoint added to verify email configuration  
**Action**: Test this endpoint to see if environment variables are loaded

---

## 🔍 Step 1: Wait for Render to Deploy (2-3 minutes)

1. **Go to Render Dashboard**:
   ```
   https://dashboard.render.com/web/srv-ctai0ja3esus73damgt0
   ```

2. **Click "Events" tab** → Look for:
   ```
   ✅ Deploy succeeded
   ```

3. **Wait until deploy finishes** (usually 2-3 minutes)

---

## 🧪 Step 2: Test the Debug Endpoint

**Method 1: Open in Browser**

Just visit this URL in your browser:
```
https://weddingbazaar-web.onrender.com/api/bookings/test-email-config
```

**Method 2: Use PowerShell**

```powershell
Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/bookings/test-email-config" -Method Get | ConvertTo-Json -Depth 10
```

---

## 📊 What You Should See

### ✅ SUCCESS (Email is configured):
```json
{
  "success": true,
  "debug": {
    "emailConfigured": true,
    "emailUser": "renzrusselbauto@gmail.com",
    "emailPassLength": 16,
    "emailPassLastFour": "***hsch",
    "emailPassHasSpaces": false,
    "nodeEnv": "production",
    "port": "10000"
  },
  "message": "✅ Email is configured correctly!",
  "instructions": "Email should be working. Check Render logs for actual email sending attempts.",
  "timestamp": "2025-11-04T..."
}
```

**If you see this** → Environment variables ARE loaded! 
**Next**: Check why emails aren't being sent (vendor email, code execution, etc.)

---

### ❌ FAILURE (Email NOT configured):
```json
{
  "success": true,
  "debug": {
    "emailConfigured": false,
    "emailUser": "NOT SET",
    "emailPassLength": 0,
    "emailPassLastFour": "***T SET",
    "emailPassHasSpaces": false,
    "nodeEnv": "production",
    "port": "10000"
  },
  "message": "❌ Email is NOT configured - environment variables missing",
  "instructions": "Add EMAIL_USER and EMAIL_PASS to Render environment variables, then redeploy.",
  "timestamp": "2025-11-04T..."
}
```

**If you see this** → Environment variables are NOT loading!  
**Action Required**: Fix environment variable configuration

---

## 🔧 If Email NOT Configured (debug shows NOT SET)

### Fix 1: Verify Variables in Render

1. Go to: https://dashboard.render.com/web/srv-ctai0ja3esus73damgt0/env

2. **Check if variables exist**:
   - EMAIL_USER
   - EMAIL_PASS

3. **If missing**: Add them again

4. **If present**: Check for issues:
   - Typos in variable names (must be EXACT: `EMAIL_USER` and `EMAIL_PASS`)
   - Extra spaces before/after the = sign
   - Quotes around values (remove them)
   - Special characters

### Fix 2: Delete and Re-add Variables

Sometimes Render has bugs with variable updates:

1. **Delete both variables**:
   - EMAIL_USER → Delete
   - EMAIL_PASS → Delete
   - Save changes

2. **Wait 1 minute**

3. **Add them back**:
   - EMAIL_USER = `renzrusselbauto@gmail.com`
   - EMAIL_PASS = `shcmjycphrcbhsch` (no spaces!)
   - Save changes

4. **Manual Deploy**:
   - Click "Manual Deploy" tab
   - Click "Deploy latest commit"
   - Wait 2-3 minutes

5. **Test debug endpoint again**

### Fix 3: Try Different Variable Names

If Render is being weird, try alternative names:

1. Change variable names:
   ```
   GMAIL_USER = renzrusselbauto@gmail.com
   GMAIL_PASS = shcmjycphrcbhsch
   ```

2. Update code to use new names (I can help with this)

3. Redeploy

---

## ✅ If Email IS Configured (debug shows configured: true)

**Great!** Environment variables ARE loaded. The issue is elsewhere:

### Next Steps:

#### 1. Check Vendor Email in Database

The vendor must have an email in the database:

```sql
-- Check if vendor has email
SELECT id, business_name, email 
FROM vendor_profiles 
WHERE id = 'YOUR_VENDOR_ID';

-- If email is NULL, update it:
UPDATE vendor_profiles 
SET email = 'vendor@example.com'
WHERE id = 'YOUR_VENDOR_ID';
```

#### 2. Create Test Booking and Check Logs

1. **Create a booking** on your website

2. **Go to Render Logs** immediately

3. **Search for**: `📧` or `Sending`

4. **What you should see**:
   ```
   📧 Sending new booking notification to vendor: vendor@example.com
   ✅ Email sent successfully: <message-id>
   ```

5. **If you see**:
   ```
   ⚠️ Vendor email not found, skipping notification
   ```
   → Add email to vendor record in database

6. **If you see**:
   ```
   ❌ Failed to send vendor notification email: [error]
   ```
   → There's an issue with Gmail (copy the error message)

7. **If you see nothing**:
   → Code might not be executing (check API call succeeded)

#### 3. Check if Booking API Call Succeeds

1. **Open browser DevTools** (F12)

2. **Go to Network tab**

3. **Create a booking**

4. **Look for**: `POST /api/bookings/request`

5. **Status should be**: `200 OK`

6. **Check response**: Should have `"success": true`

---

## 📞 Report Results

After testing the debug endpoint, tell me:

1. **Debug endpoint response**:
   - `emailConfigured: true` or `false`?
   - If false, what shows for emailUser and emailPassLength?

2. **If configured = true**:
   - Did you create a test booking?
   - What do Render logs show?
   - Did vendor receive email?

3. **If configured = false**:
   - Screenshot of Render Environment tab showing variables
   - Did you try delete + re-add?

With this info, I can give you the exact fix! 🎯

---

## 🚀 Quick Test Command

Run this NOW (after Render finishes deploying):

```powershell
# Test debug endpoint
$result = Invoke-RestMethod -Uri "https://weddingbazaar-web.onrender.com/api/bookings/test-email-config"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EMAIL CONFIGURATION TEST RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Email Configured:" $result.debug.emailConfigured
Write-Host "Email User:" $result.debug.emailUser
Write-Host "Email Pass Length:" $result.debug.emailPassLength
Write-Host "Email Pass Ends:" $result.debug.emailPassLastFour
Write-Host "Has Spaces:" $result.debug.emailPassHasSpaces
Write-Host ""
Write-Host "Message:" $result.message
Write-Host ""

if ($result.debug.emailConfigured) {
    Write-Host "✅ SUCCESS! Email is configured!" -ForegroundColor Green
    Write-Host "Next: Create a test booking and check Render logs" -ForegroundColor Yellow
} else {
    Write-Host "❌ PROBLEM! Email is NOT configured!" -ForegroundColor Red
    Write-Host "Action: Fix environment variables in Render" -ForegroundColor Yellow
}
```

---

**Wait for Render to deploy, then run the test! 🚀**
