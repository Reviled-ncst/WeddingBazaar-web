# ✅ Email Service Setup Guide - Complete Integration

## Overview
The authentication email service is **ALREADY INTEGRATED** with vendor booking notifications! The same `emailService.cjs` handles both:
- ✅ User email verification (authentication)
- ✅ Vendor booking notifications
- ✅ Password reset emails

## Current Status

### ✅ IMPLEMENTED (Code Ready)
- [x] Email service class with Gmail SMTP integration
- [x] Vendor booking notification template (beautiful HTML email)
- [x] Integration in booking creation endpoint
- [x] Fallback logging when email not configured
- [x] Error handling (email failures don't break booking creation)
- [x] High-priority email flag for urgent notifications

### ⚠️ PENDING (Configuration Only)
- [ ] Add `EMAIL_USER` environment variable to Render
- [ ] Add `EMAIL_PASS` environment variable to Render
- [ ] Redeploy backend on Render
- [ ] Test email delivery

## 📧 Email Service Features

### 1. **Vendor Booking Notification Email**
**Location**: `backend-deploy/utils/emailService.cjs` (lines 156-375)

**Triggered When**: New booking is created via POST `/api/bookings`

**Email Contains**:
- 🎉 Eye-catching header with gradient colors
- 👫 Couple's name and contact email
- 💍 Service type requested
- 📅 Event date (formatted as "Monday, January 15, 2025")
- 📍 Event location
- 👥 Guest count (if provided)
- 💰 Budget range (if provided)
- 💬 Special requests from couple
- 🔗 Direct link to vendor dashboard
- ⏰ Urgency reminder (respond within 24 hours)

**Subject Line**: `🎉 New Booking Request from {Couple Name} - {Service Type}`

### 2. **Email Verification** (Already Working)
**Location**: `backend-deploy/utils/emailService.cjs` (lines 25-153)

**Triggered When**: User registers

**Email Contains**:
- Welcome message
- Verification link (expires in 24 hours)
- List of features available after verification

### 3. **Fallback Mode** (Current State)
When `EMAIL_USER` and `EMAIL_PASS` are not configured:
- Emails are **logged to console** instead of sent
- Includes full email content and verification/booking URLs
- Prevents booking creation from failing
- Useful for development and debugging

## 🚀 Step-by-Step Setup on Render

### Step 1: Create Gmail App Password

1. **Go to Google Account Settings**:
   - Visit https://myaccount.google.com/security
   - OR go to https://myaccount.google.com/apppasswords (direct link)

2. **Enable 2-Step Verification** (if not already enabled):
   - Click "2-Step Verification"
   - Follow the setup wizard
   - Use your phone for verification

3. **Create App Password**:
   - Search for "App passwords" in settings
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter name: "Wedding Bazaar Backend"
   - Click "Generate"
   - **COPY THE 16-CHARACTER PASSWORD** (e.g., `abcd efgh ijkl mnop`)

4. **Important Notes**:
   - Remove spaces from app password: `abcdefghijklmnop`
   - This is NOT your regular Gmail password
   - Keep this password secure (don't commit to Git)

### Step 2: Configure Environment Variables on Render

1. **Login to Render Dashboard**:
   - Go to https://dashboard.render.com
   - Click on your `weddingbazaar-web` service

2. **Navigate to Environment Tab**:
   - Click "Environment" in the left sidebar
   - You should see existing variables like `DATABASE_URL`, `JWT_SECRET`, etc.

3. **Add Email Variables**:
   
   **Variable 1: EMAIL_USER**
   - Key: `EMAIL_USER`
   - Value: `your-gmail-address@gmail.com` (the Gmail account)
   - Click "Add"

   **Variable 2: EMAIL_PASS**
   - Key: `EMAIL_PASS`
   - Value: `abcdefghijklmnop` (the 16-character app password, NO SPACES)
   - Click "Add"

4. **Save Changes**:
   - Click "Save Changes" at the bottom
   - Render will automatically redeploy your backend

### Step 3: Verify Deployment

1. **Wait for Deployment to Complete** (2-5 minutes):
   - Go to "Logs" tab in Render dashboard
   - Look for: `✅ Email service configured with: your-email@gmail.com`
   - Should NOT see: `⚠️ Email service not configured`

2. **Check Email Service Status**:
   ```bash
   # Test email service health (if endpoint exists)
   curl https://weddingbazaar-web.onrender.com/api/health
   ```

3. **Monitor Logs**:
   - Watch for email-related logs when bookings are created
   - Should see: `📧 Sending new booking notification to vendor: vendor@example.com`
   - Should see: `✅ Vendor notification sent successfully: <message-id>`

## 🧪 Testing Email Delivery

### Test 1: Create a Test Booking

1. **Use the Frontend**:
   - Go to https://weddingbazaarph.web.app
   - Login as a couple/individual user
   - Find a vendor service
   - Click "Request Booking"
   - Fill in the form with your test email
   - Submit the booking

2. **Check Backend Logs on Render**:
   ```
   📧 Sending new booking notification to vendor: vendor@example.com
   ✅ Vendor notification sent successfully: <some-message-id>
   ```

3. **Check Vendor's Email Inbox**:
   - Open the vendor's email inbox
   - Look for email from "Wedding Bazaar <your-gmail@gmail.com>"
   - Subject: "🎉 New Booking Request from {Couple Name} - {Service Type}"
   - Should have beautiful HTML formatting

### Test 2: Test User Registration Email

1. **Register a New User**:
   - Go to https://weddingbazaarph.web.app
   - Click "Register"
   - Enter email and details
   - Submit registration

2. **Check Email Inbox**:
   - Look for "💝 Verify Your Email - Welcome to Wedding Bazaar!"
   - Click verification link
   - Should redirect to frontend with success message

### Test 3: Database Query Test

Run this query in Neon SQL editor to check vendor emails:

```sql
SELECT 
  vp.id as vendor_id,
  vp.business_name,
  u.email as vendor_email,
  u.first_name,
  vp.service_type
FROM vendor_profiles vp
LEFT JOIN users u ON vp.user_id::text = u.id::text
WHERE u.email IS NOT NULL
LIMIT 5;
```

Expected output:
```
vendor_id | business_name | vendor_email | first_name | service_type
----------|---------------|--------------|------------|-------------
uuid-123  | Perfect Wed.. | vendor@ex... | John       | Photography
```

## 📊 Email Service Architecture

### Email Flow Diagram

```
Couple Creates Booking
        ↓
Backend: POST /api/bookings
        ↓
Booking Saved to Database
        ↓
Query: Fetch vendor email
        ↓
emailService.sendNewBookingNotification()
        ↓
    [Email Configured?]
    ├─ YES → Send via Gmail SMTP → Vendor Inbox ✅
    └─ NO  → Log to console → Dev sees output 📝
        ↓
Booking Creation Succeeds
(Email failure doesn't break booking!)
```

### Error Handling Strategy

```javascript
try {
  // Send email notification (fire and forget)
  emailService.sendNewBookingNotification(...)
    .catch(err => {
      // Log error but don't fail booking
      console.error('❌ Failed to send email:', err.message);
    });
} catch (emailError) {
  // Email preparation error - still don't fail booking
  console.error('❌ Error preparing email:', emailError.message);
}

// Booking creation continues regardless
res.json({ success: true, booking: ... });
```

**Key Benefits**:
- Booking creation NEVER fails due to email issues
- Email errors are logged for debugging
- Async "fire and forget" pattern for performance
- Graceful degradation in development

## 🔍 Troubleshooting

### Issue 1: Emails Not Being Sent

**Symptom**: Logs show `⚠️ Email service not configured`

**Solution**:
1. Check Render environment variables exist: `EMAIL_USER` and `EMAIL_PASS`
2. Verify no typos in variable names (case-sensitive)
3. Redeploy backend after adding variables
4. Check logs for: `✅ Email service configured with: your-email@gmail.com`

### Issue 2: Gmail Authentication Failed

**Symptom**: `❌ Email sending failed: Invalid login: 535-5.7.8 Username and Password not accepted`

**Solution**:
1. Verify 2-Step Verification is enabled on Gmail
2. Use **App Password**, not regular password
3. Remove spaces from app password (should be 16 characters)
4. Make sure app password is recent (not revoked)

### Issue 3: Emails Going to Spam

**Symptom**: Email sent successfully but vendor doesn't see it

**Solution**:
1. Check spam/junk folder
2. Add `your-gmail@gmail.com` to contacts
3. Mark as "Not Spam" if found
4. Consider using custom domain email (future improvement)

### Issue 4: Vendor Email Not Found

**Symptom**: Logs show `⚠️ Vendor email not found, skipping notification`

**Solution**:
1. Verify vendor has a linked user account
2. Check user has an email address
3. Run database query to verify:
   ```sql
   SELECT vp.id, vp.business_name, u.email
   FROM vendor_profiles vp
   LEFT JOIN users u ON vp.user_id::text = u.id::text
   WHERE vp.id::text = 'vendor-uuid-here'::text;
   ```

### Issue 5: HTML Email Not Rendering

**Symptom**: Email looks plain or broken

**Solution**:
1. Check email client supports HTML (most do)
2. View in web browser version of email
3. Check logs for any HTML template errors
4. Test in different email clients (Gmail, Outlook, etc.)

## 📝 Email Templates

### Current Templates Available

1. **Verification Email** (`sendVerificationEmail`)
   - Used for: User registration
   - Features: Verification link, 24-hour expiry
   - Status: ✅ Working

2. **Booking Notification** (`sendNewBookingNotification`)
   - Used for: New booking requests
   - Features: Booking details, vendor dashboard link, urgency reminder
   - Status: ✅ Ready (needs email config)

3. **Password Reset** (`sendPasswordResetEmail`)
   - Used for: Forgot password flow
   - Features: Reset link, security warnings
   - Status: 🚧 Placeholder (needs implementation)

### Future Email Templates (To Implement)

4. **Quote Sent Notification** (to couple)
   - Trigger: Vendor sends a quote
   - Content: Quote details, accept/reject buttons

5. **Booking Confirmed** (to both parties)
   - Trigger: Booking status changes to confirmed
   - Content: Confirmation details, next steps

6. **Payment Receipt** (to couple)
   - Trigger: Payment successful
   - Content: Receipt details, remaining balance

7. **Booking Cancelled** (to both parties)
   - Trigger: Booking cancellation
   - Content: Cancellation reason, refund info

8. **Review Request** (to couple)
   - Trigger: Booking completed
   - Content: Request to leave review, rating link

## 🎨 Email Design Features

### Styling
- **Gradient Headers**: Pink to purple gradient (`#ec4899` to `#8b5cf6`)
- **Responsive**: Mobile-friendly design
- **Branded**: Wedding Bazaar logo and colors
- **Professional**: Clean, modern layout

### Content Elements
- **Icons**: Emoji icons for visual appeal (🎉, 💍, 📅, etc.)
- **CTA Buttons**: Large, prominent call-to-action buttons
- **Urgency Indicators**: Yellow warning boxes for time-sensitive info
- **Detail Sections**: Organized booking/user information
- **Footer**: Branding, links, unsubscribe options

### Accessibility
- Plain text fallback for all HTML emails
- High contrast colors
- Clear, readable fonts
- Alt text for icons (when using images)

## 🔒 Security Considerations

### Environment Variables
- ✅ Never commit `EMAIL_PASS` to Git
- ✅ Use `.env` for local development
- ✅ Use Render environment variables for production
- ✅ Rotate app password periodically

### Email Content
- ✅ Don't include sensitive data (passwords, payment details)
- ✅ Use secure HTTPS links only
- ✅ Include unsubscribe options
- ✅ Comply with anti-spam regulations

### Rate Limiting
- ⚠️ Gmail has sending limits (500 emails/day for free accounts)
- 💡 Consider upgrading to Google Workspace for higher limits
- 💡 Or use dedicated email service (SendGrid, Mailgun, etc.)

## 📈 Monitoring & Analytics

### What to Monitor
1. **Email Delivery Rate**: How many emails are successfully sent
2. **Email Open Rate**: How many vendors open the notification
3. **Response Time**: How quickly vendors respond after email
4. **Bounce Rate**: How many emails fail to deliver

### Logging
Current logs to watch:
```
✅ Email service configured with: your-email@gmail.com
📧 Sending new booking notification to vendor: vendor@example.com
✅ Vendor notification sent successfully: <message-id>
❌ Vendor notification email failed: <error>
⚠️ Vendor email not found, skipping notification
```

### Future Improvements
- Add email tracking pixels for open rates
- Use email service with built-in analytics (SendGrid)
- Store email send history in database
- Create admin dashboard for email metrics

## 🚀 Quick Start Checklist

- [ ] **Step 1**: Create Gmail App Password (5 minutes)
- [ ] **Step 2**: Add `EMAIL_USER` to Render (1 minute)
- [ ] **Step 3**: Add `EMAIL_PASS` to Render (1 minute)
- [ ] **Step 4**: Wait for auto-redeploy (3-5 minutes)
- [ ] **Step 5**: Check logs for `✅ Email service configured` (1 minute)
- [ ] **Step 6**: Create test booking (2 minutes)
- [ ] **Step 7**: Verify vendor receives email (1 minute)
- [ ] **Step 8**: Test email verification flow (2 minutes)

**Total Time**: ~15-20 minutes

## 📞 Support

### If You Need Help

1. **Check Render Logs**: Look for error messages
2. **Check Gmail Settings**: Verify app password is correct
3. **Test Email Service**: Use the test script (see below)
4. **Contact Support**: Provide logs and error messages

### Useful Resources
- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [Render Environment Variables](https://render.com/docs/environment-variables)
- [Nodemailer Documentation](https://nodemailer.com/)

## 🎉 Success Criteria

You'll know email service is working when:

1. ✅ Render logs show: `✅ Email service configured with: your-email@gmail.com`
2. ✅ New bookings trigger: `📧 Sending new booking notification to vendor`
3. ✅ Vendor receives beautiful HTML email with booking details
4. ✅ Email contains correct data (couple name, event date, etc.)
5. ✅ Links in email work (vendor dashboard, settings)
6. ✅ User registration sends verification email
7. ✅ Verification links work correctly

## 🔮 Future Enhancements

### Phase 1: Additional Email Templates
- Quote sent notification
- Booking confirmation
- Payment receipt
- Cancellation notification
- Review request

### Phase 2: Email Service Upgrade
- Switch to SendGrid/Mailgun for better deliverability
- Add email tracking and analytics
- Implement email templates in database
- Add admin email customization

### Phase 3: Advanced Features
- SMS notifications (Twilio integration)
- Push notifications (Firebase Cloud Messaging)
- In-app notification center
- Email preference management
- Unsubscribe functionality

---

## 📝 Next Steps (Right Now!)

1. **Create Gmail App Password** (if you haven't already)
2. **Add to Render**:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```
3. **Wait for redeploy** (Render will do this automatically)
4. **Test by creating a booking** (use frontend or API)
5. **Check vendor email inbox** (should receive notification)
6. **Celebrate!** 🎉

**Estimated Time**: 15 minutes total

---

*Last Updated: {{ current_date }}*
*Version: 1.0*
*Status: Ready for Production*
