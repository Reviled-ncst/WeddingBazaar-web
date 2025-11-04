# 🔧 Quick Guide: Check Render Email Configuration

**Time Required**: 2 minutes  
**Goal**: Verify email notifications are configured in production

---

## Step 1: Access Render Dashboard

1. Open browser and go to: https://dashboard.render.com
2. Log in with your Render account
3. Select your service: **weddingbazaar-web**

---

## Step 2: Check Environment Variables

1. In the left sidebar, click **"Environment"**
2. Look for these variables:

```bash
✅ EMAIL_USER = your-gmail@gmail.com
✅ EMAIL_PASS = (hidden 16-character app password)
✅ FRONTEND_URL = https://weddingbazaarph.web.app
```

---

## Step 3: Interpret Results

### ✅ If All Variables Exist
**Emails should be working!** Test by:
1. Creating a new booking
2. Checking vendor's email inbox
3. Checking Render logs for success message

### ⚠️ If Variables Are Missing
**Emails are NOT being sent.** You need to:

1. **Generate Gmail App Password**:
   - Go to https://myaccount.google.com/security
   - Enable 2-Factor Authentication
   - Go to https://myaccount.google.com/apppasswords
   - Generate password for "Mail" → "Wedding Bazaar Backend"
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

2. **Add to Render**:
   - Click "Add Environment Variable"
   - Add:
     ```
     EMAIL_USER = your-gmail@gmail.com
     EMAIL_PASS = abcdefghijklmnop  (no spaces!)
     ```
   - Click "Save Changes"
   - Backend will auto-redeploy (takes 2-3 minutes)

---

## Step 4: Test Email Notifications

### Option A: Create Real Booking
1. Go to https://weddingbazaarph.web.app
2. Log in as a couple
3. Create a new booking request
4. Check vendor's email inbox (within 30 seconds)

### Option B: Check Render Logs
1. In Render dashboard, click **"Logs"** tab
2. Create a booking on your site
3. Look for these log messages:
   ```
   ✅ Email service configured with: your-gmail@gmail.com
   📧 Sending new booking notification to vendor: vendor@email.com
   ```

---

## 🚨 Troubleshooting

### Email Logs Say "not configured"
```
⚠️ Email service not configured - emails will be logged to console
```
**Solution**: Add `EMAIL_USER` and `EMAIL_PASS` to Render environment variables.

### Email Logs Say "failed to send"
```
❌ Failed to send vendor notification email: Invalid login
```
**Solution**: 
- Verify you're using Gmail App Password (not regular password)
- Ensure 2-Factor Authentication is enabled on Gmail
- Regenerate App Password if needed

### Vendor Email Not Found
```
⚠️ Vendor email not found, skipping notification
```
**Solution**: Ensure vendor's user account has an email address in the database.

---

## 📊 Expected Log Output (Success)

```
[INFO] New booking created: abc123-def456
✅ Email service configured with: weddingbazaar@gmail.com
📧 Sending new booking notification to vendor: vendor@example.com
✅ Booking successfully integrated with vendor calendar
```

---

## ⏱️ Next Steps

**After adding environment variables**:
1. ✅ Backend auto-redeploys (2-3 minutes)
2. ✅ Email service initializes
3. ✅ Create test booking
4. ✅ Check vendor email inbox
5. ✅ Confirm notification received!

**IMPORTANT**: Make sure to use **Gmail App Password**, NOT your regular Gmail password. Regular passwords will not work for SMTP authentication.

---

**Quick Links**:
- Render Dashboard: https://dashboard.render.com
- Gmail Security: https://myaccount.google.com/security
- App Passwords: https://myaccount.google.com/apppasswords

**Report Back**: After checking, let me know if the environment variables exist or if you need help setting them up!
