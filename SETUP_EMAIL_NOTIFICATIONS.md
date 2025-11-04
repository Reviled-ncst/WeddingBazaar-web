# 📧 Setup Email Notifications for Wedding Bazaar

## Problem
Users don't receive email notifications when booking requests are submitted because email credentials are not configured in the Render deployment.

## Solution: Add Gmail SMTP Credentials to Render

### Step 1: Generate Gmail App Password

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/security
   - Sign in with your Gmail account

2. **Enable 2-Factor Authentication** (Required for App Passwords)
   - Click "2-Step Verification"
   - Follow the setup wizard
   - Verify your phone number

3. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Or search for "App passwords" in Google Account settings
   - Select "Mail" as the app
   - Select "Other" as the device and name it "Wedding Bazaar"
   - Click "Generate"
   - **Copy the 16-character password** (you won't see it again!)

### Step 2: Add Environment Variables to Render

1. **Login to Render**
   - Visit: https://dashboard.render.com
   - Go to your "weddingbazaar-web" service

2. **Navigate to Environment Variables**
   - Click on your service name
   - Go to "Environment" tab on the left sidebar
   - Click "Add Environment Variable"

3. **Add EMAIL_USER Variable**
   - Key: `EMAIL_USER`
   - Value: Your Gmail address (e.g., `your-email@gmail.com`)
   - Click "Save"

4. **Add EMAIL_PASS Variable**
   - Key: `EMAIL_PASS`
   - Value: The 16-character App Password you generated (e.g., `abcd efgh ijkl mnop`)
   - **Remove spaces**: Should be `abcdefghijklmnop`
   - Click "Save"

### Step 3: Redeploy Backend

After adding the environment variables, Render will automatically redeploy your service.

**Manual Deploy (if needed)**:
```powershell
# From project root
.\deploy-paymongo.ps1
```

Or trigger deploy from Render dashboard:
- Go to "Manual Deploy" tab
- Click "Deploy latest commit"

### Step 4: Verify Email Configuration

1. **Check Render Logs**
   ```
   Look for: "✅ Email service configured with: your-email@gmail.com"
   Instead of: "⚠️ Email service not configured - emails will be logged to console"
   ```

2. **Test Booking Flow**
   - Create a test booking on your website
   - Check vendor's email inbox
   - Should receive email with subject: "🎉 New Booking Request!"

3. **Check Logs for Email Sending**
   ```
   Look for:
   "📧 Sending new booking notification to vendor: vendor@example.com"
   "✅ Email sent successfully: <message-id>"
   ```

## Environment Variables Required

```bash
# Add these to Render Environment Variables
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

## Email Templates

The system sends the following emails:

### 1. **New Booking Notification** (To Vendor)
- **When**: User submits a booking request
- **Subject**: "🎉 New Booking Request!"
- **Contains**: Couple name, event date, service type, budget, special requests
- **Template**: Beautiful HTML with Wedding Bazaar branding

### 2. **Verification Email** (To Users)
- **When**: User registers an account
- **Subject**: "💝 Verify Your Email - Welcome to Wedding Bazaar!"
- **Contains**: Verification link (24-hour expiry)

## Troubleshooting

### Email Not Being Sent?

1. **Check Render Logs**
   ```
   Render Dashboard → Your Service → Logs tab
   Search for "Email" or "📧"
   ```

2. **Verify Environment Variables**
   ```
   Render Dashboard → Your Service → Environment tab
   Confirm EMAIL_USER and EMAIL_PASS exist
   ```

3. **Check Gmail Settings**
   - Ensure 2FA is enabled
   - Verify App Password is correct
   - Check if Gmail blocked the login attempt:
     - Visit: https://myaccount.google.com/notifications
     - Look for "Critical security alert"

4. **Test Email Service Manually**
   ```javascript
   // In Render Shell or locally
   const nodemailer = require('nodemailer');
   
   const transporter = nodemailer.createTransporter({
     service: 'gmail',
     auth: {
       user: 'your-email@gmail.com',
       pass: 'your-app-password'
     }
   });
   
   transporter.sendMail({
     from: 'your-email@gmail.com',
     to: 'test@example.com',
     subject: 'Test Email',
     text: 'If you receive this, email is working!'
   }, (error, info) => {
     console.log(error || info);
   });
   ```

### Common Issues

**Issue**: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solution**: 
- Regenerate App Password
- Ensure no spaces in password
- Try different Gmail account

**Issue**: "⚠️ Email service not configured"
**Solution**: 
- Verify EMAIL_USER and EMAIL_PASS are set in Render
- Redeploy service after adding variables

**Issue**: Emails going to Spam
**Solution**: 
- Add your domain to Gmail's authorized senders
- Use a custom domain email (not @gmail.com) in production
- Configure SPF, DKIM, and DMARC records

## Production Recommendations

For production, consider upgrading from Gmail SMTP to:

1. **SendGrid** (Free tier: 100 emails/day)
   ```javascript
   SENDGRID_API_KEY=your-sendgrid-key
   ```

2. **AWS SES** (Pay as you go)
   ```javascript
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_SES_REGION=us-east-1
   ```

3. **Mailgun** (Free tier: 5,000 emails/month)
   ```javascript
   MAILGUN_API_KEY=your-key
   MAILGUN_DOMAIN=your-domain
   ```

## Email Flow Diagram

```
User submits booking
    ↓
Frontend: BookingRequestModal.tsx
    ↓
API Call: POST /api/bookings/request
    ↓
Backend: routes/bookings.cjs
    ├─→ Create booking in database
    ├─→ Fetch vendor email from DB
    └─→ Send email via emailService.cjs
         ↓
    nodemailer + Gmail SMTP
         ↓
    📧 Email delivered to vendor
         ↓
Frontend: Shows success modal + toast
```

## Testing Checklist

- [ ] Generate Gmail App Password
- [ ] Add EMAIL_USER to Render
- [ ] Add EMAIL_PASS to Render
- [ ] Redeploy backend
- [ ] Check logs for "✅ Email service configured"
- [ ] Create test booking
- [ ] Verify vendor receives email
- [ ] Check email content and formatting
- [ ] Test email links (booking URL)

## Next Steps After Email Setup

1. **Test with Real Vendors**
   - Ensure vendor emails are correct in database
   - Send test bookings to verify delivery

2. **Monitor Email Delivery**
   - Check Render logs regularly
   - Set up email delivery monitoring

3. **Enhance Email Templates**
   - Add company logo
   - Customize branding
   - Add social media links

4. **Consider Email Queue**
   - For high volume, implement job queue
   - Use Bull, Bee-Queue, or AWS SQS

---

## 🚀 Quick Start

```powershell
# 1. Generate App Password
Open: https://myaccount.google.com/apppasswords

# 2. Add to Render
Render Dashboard → weddingbazaar-web → Environment
Add: EMAIL_USER = your-email@gmail.com
Add: EMAIL_PASS = your-app-password

# 3. Redeploy
./deploy-paymongo.ps1

# 4. Test
Create booking → Check vendor email ✅
```

---

**Status**: ⚠️ Email notifications currently disabled (no credentials)  
**Action Required**: Add EMAIL_USER and EMAIL_PASS to Render  
**Time to Fix**: ~5 minutes  
**Impact**: High (vendors won't receive booking notifications)
