# 🚀 QUICK SETUP: Add Email Service to Render (5 Minutes)

## ⚡ Fast Track Setup

### Step 1: Create Gmail App Password (3 minutes)

1. **Go to**: https://myaccount.google.com/apppasswords
2. **Click**: "Select app" → Choose "Mail"
3. **Click**: "Select device" → Choose "Other" → Type "Wedding Bazaar"
4. **Click**: "Generate"
5. **Copy**: The 16-character password (e.g., `abcd efgh ijkl mnop`)
6. **Remove spaces**: `abcdefghijklmnop` ← Use this

### Step 2: Add to Render (2 minutes)

1. **Go to**: https://dashboard.render.com
2. **Click**: Your `weddingbazaar-web` service
3. **Click**: "Environment" tab
4. **Add Variable 1**:
   - Key: `EMAIL_USER`
   - Value: `your-gmail@gmail.com`
5. **Add Variable 2**:
   - Key: `EMAIL_PASS`
   - Value: `abcdefghijklmnop` (app password without spaces)
6. **Click**: "Save Changes"
7. **Wait**: 3-5 minutes for auto-redeploy

### Step 3: Verify (1 minute)

1. **Go to**: Render dashboard → Your service → "Logs" tab
2. **Look for**: `✅ Email service configured with: your-gmail@gmail.com`
3. **Should NOT see**: `⚠️ Email service not configured`

---

## ✅ Success Checklist

- [ ] Gmail App Password created (16 characters, no spaces)
- [ ] `EMAIL_USER` added to Render
- [ ] `EMAIL_PASS` added to Render
- [ ] Render redeployed automatically
- [ ] Logs show "Email service configured"
- [ ] Test booking created
- [ ] Vendor received email notification

---

## 🧪 Test Email Service

### Option 1: Local Test (Requires .env file)

```bash
# Create .env file in project root
echo EMAIL_USER=your-gmail@gmail.com >> .env
echo EMAIL_PASS=your-app-password >> .env

# Run test script
node test-email-service.cjs
```

### Option 2: Production Test (After Render setup)

1. **Create a booking** via frontend:
   - Go to https://weddingbazaarph.web.app
   - Browse vendors
   - Click "Request Booking"
   - Fill form and submit

2. **Check Render logs**:
   ```
   📧 Sending new booking notification to vendor: vendor@example.com
   ✅ Vendor notification sent successfully: <message-id>
   ```

3. **Check vendor email inbox**:
   - Subject: "🎉 New Booking Request from {Couple} - {Service}"
   - Beautiful HTML email with booking details

---

## 🔍 Troubleshooting

### ❌ "Invalid login: 535-5.7.8 Username and Password not accepted"

**Fix**:
- Use **App Password**, not regular Gmail password
- Remove spaces from app password (should be 16 chars)
- Enable 2-Step Verification on Gmail

### ❌ "⚠️ Email service not configured"

**Fix**:
- Check variable names are exactly `EMAIL_USER` and `EMAIL_PASS` (case-sensitive)
- Redeploy backend after adding variables
- Wait for deployment to complete

### ❌ Email sent but not received

**Fix**:
- Check spam/junk folder
- Add sender to contacts
- Use Gmail for testing (other providers may block)

---

## 📧 What You'll Get

### Vendor Booking Notification Email

**Subject**: 🎉 New Booking Request from Jane & Jack - Photography

**Content**:
- Beautiful gradient header (pink to purple)
- Couple's name and contact info
- Service type requested
- Event date, location, guest count
- Budget range (if provided)
- Special requests
- Direct link to vendor dashboard
- Urgency reminder (respond within 24 hours)

**Example**:
```
Hi John! 👋

You have a new booking inquiry!

📋 Booking Details
👫 Couple Name: Jane & Jack Smith
📧 Email: couple@example.com
💍 Service Type: Photography
📅 Event Date: Saturday, February 14, 2025
📍 Location: Grand Ballroom, Manila Hotel
👥 Guest Count: 150 guests
💰 Budget Range: ₱50,000 - ₱100,000

💬 Special Requests:
We would like sunset photos on the beach...

[View Booking Details Button]
```

---

## 🎯 Quick Commands

### Check Email Configuration
```bash
# In Render logs, search for:
grep "Email service" logs.txt
```

### Test SMTP Connection
```bash
node test-email-service.cjs
```

### Check Vendor Emails in Database
```sql
SELECT vp.business_name, u.email
FROM vendor_profiles vp
LEFT JOIN users u ON vp.user_id::text = u.id::text
WHERE u.email IS NOT NULL;
```

---

## 📞 Need Help?

1. **Check logs**: Render dashboard → Logs tab
2. **Verify variables**: Render dashboard → Environment tab
3. **Test locally**: Run `test-email-service.cjs`
4. **Check Gmail settings**: https://myaccount.google.com/security

---

## 🎉 Done!

Once you see vendor emails arriving, you're all set! The authentication email service is now fully integrated with booking notifications.

**Estimated Total Time**: 5 minutes
**Difficulty**: Easy
**Status**: Production Ready ✅
