# 📧 Vendor Email Notifications Not Working - Diagnostic Report

**Date:** October 29, 2025  
**Issue:** Vendor email notifications not being sent when bookings are created

---

## 🔍 Root Cause Analysis

### Email Service Configuration Check

**File:** `backend-deploy/utils/emailService.cjs` (lines 1-22)

```javascript
constructor() {
  this.transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // ❌ MISSING
      pass: process.env.EMAIL_PASS   // ❌ MISSING
    }
  });

  this.isConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  
  if (!this.isConfigured) {
    console.log('⚠️ Email service not configured - emails will be logged to console');
  }
}
```

### Problem Identified

The email service requires two environment variables on the Render backend:

1. ✅ `EMAIL_USER` - Gmail address to send emails from
2. ✅ `EMAIL_PASS` - Gmail app-specific password

**Current State:** These environment variables are **NOT SET** on Render.

**Result:** 
- `this.isConfigured` evaluates to `false`
- Emails are logged to console instead of being sent
- Vendors don't receive notifications

---

## 🔧 How It Currently Works (When NOT Configured)

**File:** `backend-deploy/utils/emailService.cjs` (lines 363-378)

```javascript
if (this.isConfigured) {
  // Actually send email via Gmail
  const info = await this.transporter.sendMail(mailOptions);
  console.log('✅ Vendor notification sent successfully');
} else {
  // FALLBACK: Just log to console
  console.log('📧 VENDOR NOTIFICATION WOULD BE SENT TO:', email);
  console.log('📧 EMAIL CONTENT:', textContent);
  
  return {
    success: true,
    messageId: 'dev-mode-' + Date.now(),
    devMode: true  // ⚠️ Email NOT actually sent!
  };
}
```

---

## ✅ Solution: Configure Email Service on Render

### Step 1: Get Gmail App Password

1. **Go to Google Account:** https://myaccount.google.com/
2. **Navigate to Security**
3. **Enable 2-Step Verification** (required for app passwords)
4. **Generate App Password:**
   - Search for "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Name it "Wedding Bazaar Backend"
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 2: Add Environment Variables to Render

1. **Login to Render Dashboard:** https://dashboard.render.com/
2. **Select your backend service:** `weddingbazaar-web`
3. **Go to Environment tab**
4. **Add these variables:**

```env
# Email Configuration
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-char-app-password
```

**Example:**
```env
EMAIL_USER=weddingbazaar@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # (remove spaces when entering)
```

### Step 3: Redeploy Backend

After adding environment variables, Render will automatically redeploy your backend.

**Verify in Logs:**
```
✅ Email service configured with: weddingbazaar@gmail.com
```

Instead of:
```
⚠️ Email service not configured - emails will be logged to console
```

---

## 🧪 Testing Email Notifications

### Test 1: Check Backend Logs

After adding environment variables, restart backend and check logs:

```bash
# Look for this message in Render logs:
✅ Email service configured with: your-email@gmail.com

# NOT this:
⚠️ Email service not configured
```

### Test 2: Create Test Booking

1. Navigate to service page
2. Click "Request Booking"
3. Fill out booking form
4. Submit booking request

**Expected Backend Logs:**
```
📧 Sending new booking notification to vendor: vendor@example.com
✅ Vendor notification sent successfully: <message-id>
```

**NOT:**
```
📧 VENDOR NOTIFICATION WOULD BE SENT TO: vendor@example.com
📧 EMAIL CONTENT: ...
```

### Test 3: Check Vendor Email Inbox

Vendor should receive an email with:
- Subject: "🎉 New Booking Request from [Couple Name] - [Service Type]"
- From: "Wedding Bazaar <your-email@gmail.com>"
- Content: Booking details, couple info, action button

---

## 🔍 Diagnostic Commands

### Check Current Environment Variables

**Render Dashboard:**
1. Go to Environment tab
2. Look for `EMAIL_USER` and `EMAIL_PASS`
3. If missing → Add them

**Backend Logs:**
```bash
# Search for email configuration status
grep "Email service" /path/to/logs

# Should show:
✅ Email service configured with: your-email@gmail.com
```

### Manual Email Test (After Configuration)

Create a test script on backend:

```javascript
// test-email.cjs
const emailService = require('./backend-deploy/utils/emailService.cjs');

(async () => {
  const result = await emailService.sendNewBookingNotification({
    email: 'test-vendor@example.com',
    businessName: 'Test Vendor',
    firstName: 'John'
  }, {
    id: '1234',
    coupleName: 'Test Couple',
    coupleEmail: 'test@example.com',
    serviceType: 'Photography',
    eventDate: '2025-12-25',
    eventLocation: 'Manila',
    guestCount: 100,
    budgetRange: '₱50,000 - ₱100,000',
    specialRequests: 'Test request'
  });
  
  console.log('Test result:', result);
})();
```

Run:
```bash
node test-email.cjs
```

---

## 📋 Environment Variables Checklist

Add these to Render:

- [ ] `EMAIL_USER` - Your Gmail address
- [ ] `EMAIL_PASS` - Gmail app password (16 characters)
- [ ] `FRONTEND_URL` - Frontend URL (already exists)

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Invalid login" Error

**Cause:** App password not generated or incorrect

**Fix:**
1. Make sure 2-Step Verification is enabled
2. Generate new app password
3. Copy password WITHOUT spaces
4. Update `EMAIL_PASS` on Render

### Issue 2: "Less secure app access" Error

**Cause:** Gmail blocking access

**Fix:**
- Use App Passwords (not regular password)
- Don't use "Allow less secure apps" option (deprecated)

### Issue 3: Emails Going to Spam

**Cause:** Gmail treating automated emails as spam

**Fix:**
1. Add sender to contacts
2. Mark first email as "Not Spam"
3. Create Gmail filter to whitelist sender

### Issue 4: Email Delay

**Cause:** Gmail rate limiting or server delay

**Fix:**
- Wait a few minutes
- Check Gmail "All Mail" folder
- Check backend logs for `messageId`

---

## 🎯 Expected Flow (After Fix)

### Before Fix (Current)
```
1. Couple creates booking
2. Backend creates booking in database ✅
3. Backend tries to send email
4. Email service is NOT configured ❌
5. Email logged to console (not sent) ❌
6. Vendor doesn't receive notification ❌
```

### After Fix
```
1. Couple creates booking
2. Backend creates booking in database ✅
3. Backend tries to send email
4. Email service IS configured ✅
5. Email sent via Gmail SMTP ✅
6. Vendor receives notification ✅
```

---

## 📝 Quick Fix Commands

### 1. Login to Render
```
https://dashboard.render.com/
```

### 2. Navigate to Environment
```
Services → weddingbazaar-web → Environment
```

### 3. Add Variables
```
EMAIL_USER = your-gmail@gmail.com
EMAIL_PASS = abcdefghijklmnop
```

### 4. Save & Deploy
```
Click "Save Changes"
Wait for auto-deploy
Check logs for: ✅ Email service configured
```

### 5. Test Booking
```
Create booking → Check vendor email inbox
```

---

## ✅ Verification Steps

After adding environment variables:

1. **Check Render Logs:**
   ```
   ✅ Email service configured with: your-email@gmail.com
   ```

2. **Create Test Booking:**
   - Go to service page
   - Submit booking request

3. **Check Backend Logs:**
   ```
   📧 Sending new booking notification to vendor: vendor@example.com
   ✅ Vendor notification sent successfully: <message-id>
   ```

4. **Check Email Inbox:**
   - Vendor should receive email
   - Subject: "🎉 New Booking Request from..."
   - Contains booking details and action button

---

## 💡 Alternative: Use Different Email Provider

If Gmail doesn't work, you can use:

### Option 1: SendGrid (Recommended for Production)
```javascript
// In emailService.cjs
this.transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

**Render Environment:**
```
SENDGRID_API_KEY = SG.xxxxxxxxxxxxx
```

### Option 2: Mailgun
```javascript
this.transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASS
  }
});
```

### Option 3: Custom SMTP
```javascript
this.transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
```

---

## 🚀 Immediate Action Required

1. **Get Gmail App Password** (5 minutes)
2. **Add to Render Environment** (2 minutes)
3. **Wait for Redeploy** (3-5 minutes)
4. **Test Booking** (2 minutes)
5. **Verify Email Received** ✅

**Total Time:** ~15 minutes

---

## 📞 Support

If you still don't receive emails after configuration:

1. **Check Render Logs:** Look for email-related errors
2. **Verify Gmail App Password:** Make sure it's correct
3. **Test Gmail Connection:** Use test script above
4. **Check Spam Folder:** Email might be filtered
5. **Try Different Email:** Test with another Gmail account

---

**Current Status:** ❌ EMAIL NOT CONFIGURED  
**Next Step:** Add `EMAIL_USER` and `EMAIL_PASS` to Render  
**ETA to Fix:** ~15 minutes
