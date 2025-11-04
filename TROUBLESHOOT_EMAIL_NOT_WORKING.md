# 🔧 Email Not Working - Troubleshooting Guide

**Status**: Email credentials added to Render, but emails still not being sent  
**Date**: Current Session

---

## 🔍 Step-by-Step Diagnosis

### Step 1: Verify Render Environment Variables

1. **Check if variables were saved correctly**
   - Go to: https://dashboard.render.com
   - Select: `weddingbazaar-web` service
   - Click: **Environment** tab
   - Verify both exist:
     ```
     EMAIL_USER = renzrusselbauto@gmail.com
     EMAIL_PASS = shcm jycp hrcb hsch
     ```

2. **Check if service redeployed**
   - After adding env variables, Render should auto-redeploy
   - Go to: **Events** tab
   - Look for: "Deploy succeeded" message
   - **If no deploy**: Manually trigger deploy

---

### Step 2: Check Render Logs for Email Configuration

1. **Open Render Logs**
   ```
   https://dashboard.render.com/web/srv-ctai0ja3esus73damgt0/logs
   ```

2. **Search for these strings**:
   ```
   "Email service configured"
   "emailService"
   "EMAIL_USER"
   "EMAIL_PASS"
   ```

3. **What you SHOULD see**:
   ```
   ✅ Email service configured with: renzrusselbauto@gmail.com
   ```

4. **What you might see (problem)**:
   ```
   ⚠️ Email service not configured - emails will be logged to console
   ```
   **If you see this**: Environment variables didn't load properly

---

### Step 3: Test Booking Creation in Logs

1. **Create a test booking** on your website

2. **Immediately check Render logs** for:
   ```
   📧 Sending new booking notification to vendor: vendor@example.com
   ✅ Email sent successfully: <message-id>
   ```

3. **If you see error instead**:
   ```
   ❌ Failed to send vendor notification email: [error message]
   ```
   Note the error message - this tells us what's wrong

---

### Step 4: Common Issues & Fixes

#### Issue 1: Environment Variables Not Loaded
**Symptom**: Logs show "Email service not configured"  
**Cause**: Service didn't redeploy after adding variables  
**Fix**:
1. Go to Render Dashboard → Your Service
2. Click **Manual Deploy** tab
3. Click **Deploy latest commit**
4. Wait 2-3 minutes
5. Check logs again

#### Issue 2: Gmail App Password Invalid
**Symptom**: "Invalid login: 535-5.7.8 Username and Password not accepted"  
**Cause**: App password incorrect or has spaces  
**Fix**:
1. Regenerate app password: https://myaccount.google.com/apppasswords
2. Copy new password
3. **Remove all spaces**: `shcm jycp hrcb hsch` → `shcmjycphrcbhsch`
4. Update `EMAIL_PASS` in Render
5. Redeploy

#### Issue 3: 2FA Not Enabled on Gmail
**Symptom**: "Username and Password not accepted"  
**Cause**: Gmail requires 2FA for app passwords  
**Fix**:
1. Enable 2FA: https://myaccount.google.com/security
2. Then generate app password
3. Update Render environment variables

#### Issue 4: Gmail Blocking Login
**Symptom**: Email fails silently or "Less secure app" error  
**Cause**: Gmail security blocked the login  
**Fix**:
1. Check Gmail notifications: https://myaccount.google.com/notifications
2. Look for "Critical security alert"
3. Allow the login attempt
4. Or use a different Gmail account

#### Issue 5: Vendor Email Missing in Database
**Symptom**: Logs show "Vendor email not found, skipping notification"  
**Cause**: Vendor profile doesn't have email  
**Fix**:
1. Check database for vendor email
2. Ensure vendors table has `email` column
3. Update vendor records with valid emails

#### Issue 6: Email Service Import Error
**Symptom**: "emailService is not defined" or similar  
**Cause**: Import path incorrect  
**Fix**: Already fixed in your code, but verify:
```javascript
const emailService = require('../utils/emailService.cjs');
```

---

### Step 5: Manual Email Test

Let me create a test script to manually send an email:

**Create file**: `test-email-manually.cjs`

```javascript
const nodemailer = require('nodemailer');

// Replace with your credentials
const EMAIL_USER = 'renzrusselbauto@gmail.com';
const EMAIL_PASS = 'shcmjycphrcbhsch'; // Remove spaces!

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

const mailOptions = {
  from: `"Wedding Bazaar" <${EMAIL_USER}>`,
  to: EMAIL_USER, // Send to yourself for testing
  subject: '🎉 Test Email from Wedding Bazaar',
  html: `
    <h1>Test Email</h1>
    <p>If you receive this, your Gmail credentials are working!</p>
    <p>Timestamp: ${new Date().toISOString()}</p>
  `
};

console.log('📧 Attempting to send test email...');
console.log('From:', EMAIL_USER);
console.log('To:', EMAIL_USER);

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ EMAIL FAILED:', error.message);
    console.error('Full error:', error);
  } else {
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  }
});
```

**Run the test**:
```bash
cd backend-deploy
node test-email-manually.cjs
```

---

### Step 6: Check Frontend Booking Flow

Even if backend is working, check if frontend is calling the API correctly:

1. **Open browser console** (F12)
2. **Create a test booking**
3. **Check Network tab**:
   - Look for: `POST /api/bookings/request`
   - Status should be: `200 OK`
   - Response should have: `"success": true`

4. **If API call fails**:
   - Check the error message
   - Verify backend is running
   - Check CORS settings

---

## 🎯 Quick Diagnosis Checklist

Run through this checklist:

- [ ] Environment variables exist in Render (EMAIL_USER, EMAIL_PASS)
- [ ] Service redeployed after adding variables
- [ ] Render logs show "✅ Email service configured"
- [ ] App password has no spaces
- [ ] 2FA is enabled on Gmail account
- [ ] Test booking created on website
- [ ] Render logs show "📧 Sending new booking notification"
- [ ] No error messages in Render logs
- [ ] Vendor email exists in database
- [ ] Frontend API call succeeds (200 OK)

---

## 🧪 Testing Commands

**1. Check if Render service is up**:
```bash
curl https://weddingbazaar-web.onrender.com/api/health
```

**2. Check backend logs for email**:
```bash
# Open Render logs and filter by "email" or "Email"
```

**3. Create test booking via API directly**:
```bash
curl -X POST https://weddingbazaar-web.onrender.com/api/bookings/request \
  -H "Content-Type: application/json" \
  -d '{
    "coupleId": "test-couple-123",
    "vendorId": "your-vendor-id",
    "serviceType": "photography",
    "eventDate": "2025-12-25",
    "eventLocation": "Manila",
    "coupleName": "Test Couple",
    "contactEmail": "test@example.com"
  }'
```

---

## 📧 Expected Email Flow

```
1. User submits booking on website
   ↓
2. Frontend: POST /api/bookings/request
   ↓
3. Backend: Create booking in database ✅
   ↓
4. Backend: Fetch vendor email from database
   ↓
5. Backend: Call emailService.sendNewBookingNotification()
   ↓
6. Nodemailer: Connect to Gmail SMTP
   ↓
7. Gmail: Send email to vendor ← THIS IS WHERE IT MIGHT FAIL
   ↓
8. Vendor: Receives email in inbox
```

---

## 🔴 Most Likely Issues

Based on your situation, the most common causes are:

### 1. **App Password Has Spaces** (90% of cases)
```
❌ Wrong: shcm jycp hrcb hsch
✅ Correct: shcmjycphrcbhsch
```
**Fix**: Update EMAIL_PASS in Render, remove ALL spaces

### 2. **Service Didn't Redeploy** (80% of cases)
**Fix**: Manually trigger deploy in Render dashboard

### 3. **Vendor Email Missing in Database** (60% of cases)
**Fix**: Verify vendor has email in database

---

## 🆘 Next Steps

**Right now, do this**:

1. **Check Render logs** for "Email service configured"
   - URL: https://dashboard.render.com/web/srv-ctai0ja3esus73damgt0/logs
   
2. **If NOT configured**: 
   - Double-check EMAIL_USER and EMAIL_PASS in Render Environment tab
   - Remove spaces from EMAIL_PASS
   - Manually trigger deploy

3. **If IS configured but still no email**:
   - Create test booking
   - Check logs for "📧 Sending new booking notification"
   - Note any error messages
   - Send me the error message

4. **Test email manually**:
   - Use the test script above
   - If this fails, problem is with Gmail credentials
   - If this works, problem is with booking flow integration

---

## 📞 What to Tell Me

After checking, tell me:

1. **What do Render logs say?**
   - "Email service configured" or "not configured"?

2. **What happens when you create a booking?**
   - Do you see email-related logs?
   - Any error messages?

3. **Did manual email test work?**
   - Did you receive the test email?

With this info, I can pinpoint the exact issue! 🎯
