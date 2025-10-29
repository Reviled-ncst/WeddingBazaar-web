# 📧 Email Notification Testing Guide

**Date:** October 29, 2025  
**Feature:** Vendor Email Notifications for New Bookings  
**Status:** Code deployed, waiting for Render configuration

---

## 🎯 Testing Overview

We'll test the vendor email notification system by:
1. Creating a test booking as a couple
2. Verifying the vendor receives an email
3. Checking the email content and formatting
4. Verifying backend logs

---

## 📋 Pre-Testing Checklist

### ✅ Before You Start:

- [ ] **Render environment variables added:**
  - `EMAIL_USER` = your Gmail address
  - `EMAIL_PASS` = `jlgswrzgyjcckeyq`
  - `FRONTEND_URL` = `https://weddingbazaarph.web.app`

- [ ] **Render deployment complete:**
  - Check logs show: `✅ Email service configured with: your-email@gmail.com`
  - No errors in deployment

- [ ] **Know a vendor's email:**
  - You need the email of a vendor in your database
  - Check Neon database or use test vendor

---

## 🧪 Test Scenario 1: Complete Email Flow Test

### Step 1: Identify Test Vendor

**Option A: Use Existing Vendor**

Query in Neon database:
```sql
SELECT 
  vp.id as vendor_id,
  vp.business_name,
  u.email as vendor_email,
  vp.category
FROM vendor_profiles vp
JOIN users u ON vp.user_id = u.id
WHERE u.email IS NOT NULL
LIMIT 5;
```

Pick one vendor and note:
- `vendor_id` (e.g., `2-2025-001`)
- `vendor_email` (e.g., `vendor@example.com`)
- `business_name` (e.g., `Perfect Photos`)

**Option B: Use Your Own Email**

Set a vendor's email to your own Gmail:
```sql
UPDATE users
SET email = 'your-email@gmail.com'
WHERE id = (
  SELECT user_id FROM vendor_profiles 
  WHERE id = '2-2025-001'
);
```

---

### Step 2: Create Test Booking

**A. Login as Couple/Individual:**

1. Go to: https://weddingbazaarph.web.app
2. Click "Login"
3. Use couple/individual account (NOT vendor!)
4. Navigate to Services page

**B. Find the Test Vendor:**

1. Browse services or use search
2. Look for the vendor you identified in Step 1
3. Click "View Details" or "Book Now"

**C. Fill Booking Form:**

Use these test values:
```
Service Type: Photography (or vendor's category)
Event Date: 2026-01-15 (future date)
Event Location: Manila, Philippines
Guest Count: 100
Budget Range: ₱50,000 - ₱75,000
Special Requests: "This is a TEST booking for email notification system. Please ignore."
Contact Person: Test Couple
Contact Email: your-email@gmail.com
Contact Phone: 09123456789
```

**D. Submit Booking:**

1. Click "Submit Booking" or "Request Quote"
2. Wait for success message
3. Note the booking ID (if shown)

---

### Step 3: Check Vendor Email Inbox

**A. Open Vendor's Gmail:**

1. Go to: https://mail.google.com/
2. Login with vendor's email address
3. Check inbox (should arrive within 1-2 minutes)

**B. Look For Email:**

- **Subject:** `🎉 New Booking Request from Test Couple - Photography`
- **From:** Your EMAIL_USER address (Wedding Bazaar)
- **Priority:** High priority (may have red flag icon)

**C. Open and Verify Email Contains:**

- [ ] Pink-to-purple gradient header
- [ ] "🎉 New Booking Request!" title
- [ ] Greeting: "Hi [Vendor Name]!"
- [ ] Booking details table with:
  - Couple name: "Test Couple"
  - Email: your-email@gmail.com
  - Service: Photography
  - Event date: January 15, 2026
  - Location: Manila, Philippines
  - Guest count: 100
  - Budget: ₱50,000 - ₱75,000
  - Booking ID
- [ ] Special requests section (yellow box)
- [ ] "View Booking Details" button (pink)
- [ ] 24-hour response reminder
- [ ] Wedding Bazaar footer

**D. Test Email Links:**

1. Click "View Booking Details" button
2. Should open: https://weddingbazaarph.web.app/vendor/bookings
3. Should show vendor dashboard with booking

---

### Step 4: Verify Backend Logs

**A. Open Render Dashboard:**

1. Go to: https://dashboard.render.com/
2. Select: **weddingbazaar-web** service
3. Click: **Logs** tab

**B. Search for These Messages:**

Filter logs for recent entries (last 5-10 minutes):

```
✅ SHOULD SEE:
📝 Creating booking request
💾 Inserting booking with data
📊 Created booking data
📧 Sending new booking notification to vendor: vendor@example.com
✅ Vendor notification sent successfully: <message-id>

❌ SHOULD NOT SEE:
⚠️ Vendor email not found, skipping notification
❌ Failed to send vendor notification email
❌ Error preparing vendor notification
```

**C. Check Email Service Status:**

Look for this on server start:
```
✅ Email service configured with: your-email@gmail.com
```

If you see:
```
⚠️ Email service not configured - emails will be logged to console
```
→ Environment variables not set correctly!

---

## 🧪 Test Scenario 2: Email Failure Test

**Purpose:** Verify booking still succeeds even if email fails

### Step 1: Temporarily Break Email

In Render, change `EMAIL_PASS` to wrong value:
```
EMAIL_PASS = wrongpassword123
```

Save and wait for redeploy.

### Step 2: Create Another Test Booking

Follow same steps as Scenario 1.

### Expected Results:

- [ ] Booking created successfully ✅
- [ ] Vendor can see booking in dashboard ✅
- [ ] Backend logs show:
  ```
  ❌ Failed to send vendor notification email: Invalid login
  ```
- [ ] But booking creation still succeeds!

### Step 3: Fix Email

Change `EMAIL_PASS` back to correct value:
```
EMAIL_PASS = jlgswrzgyjcckeyq
```

---

## 🧪 Test Scenario 3: No Vendor Email Test

**Purpose:** Test when vendor has no email in database

### Step 1: Find Vendor Without Email

```sql
SELECT vp.id, vp.business_name
FROM vendor_profiles vp
LEFT JOIN users u ON vp.user_id = u.id
WHERE u.email IS NULL OR u.email = '';
```

### Step 2: Create Booking for That Vendor

Follow standard booking steps.

### Expected Results:

- [ ] Booking created successfully ✅
- [ ] Backend logs show:
  ```
  ⚠️ Vendor email not found, skipping notification
  ```
- [ ] No email sent (expected)
- [ ] Booking still saved in database

---

## 🧪 Test Scenario 4: Multiple Bookings

**Purpose:** Test rapid-fire bookings

### Steps:

1. Create 3 bookings in quick succession (1 minute apart)
2. All for the same vendor
3. Different event dates

### Expected Results:

- [ ] 3 emails received by vendor
- [ ] Each email has correct booking details
- [ ] All bookings saved in database
- [ ] Backend logs show 3 successful email sends

---

## 📊 Verification Checklist

### Email Content Quality:

- [ ] **Design:** Pink gradient header looks professional
- [ ] **Responsive:** Email looks good on mobile
- [ ] **Readable:** Text is clear and well-formatted
- [ ] **Complete:** All booking info present
- [ ] **Actionable:** Button links to correct page
- [ ] **Branded:** Wedding Bazaar logo/branding visible

### Technical Quality:

- [ ] **Delivery:** Email arrives within 1-2 minutes
- [ ] **Not Spam:** Email in inbox, not spam folder
- [ ] **Priority:** Marked as high priority
- [ ] **Plain Text:** Has text version (check "Show original")

### Functional Quality:

- [ ] **Non-Blocking:** Booking succeeds even if email fails
- [ ] **Accurate:** Email data matches booking data
- [ ] **Links Work:** All links functional
- [ ] **Logs Clear:** Backend logs informative

---

## 🔍 Troubleshooting

### Issue: No Email Received

**Check:**

1. **Render logs** - Was email sent?
   ```
   ✅ Vendor notification sent successfully
   ```

2. **Gmail "Sent" folder** - Check from EMAIL_USER account

3. **Spam folder** - Check vendor's spam

4. **Email address** - Verify vendor email in database:
   ```sql
   SELECT u.email 
   FROM vendor_profiles vp 
   JOIN users u ON vp.user_id = u.id 
   WHERE vp.id = 'vendor-id';
   ```

5. **Wait time** - Can take 2-5 minutes sometimes

---

### Issue: Email in Spam

**Solutions:**

1. Mark as "Not Spam" in Gmail
2. Add sender to contacts
3. Set up SPF/DKIM (advanced, for production)

---

### Issue: Wrong Booking Details

**Check:**

1. Frontend form data
2. Backend booking creation logs
3. Email service parameters
4. Database booking record

---

### Issue: Email Fails but Booking Succeeds

**This is EXPECTED behavior!** ✅

The system is designed to:
- Save booking first
- Send email second
- If email fails, booking is still saved
- Vendor can see booking in dashboard

---

## 📈 Success Metrics

### Minimum Acceptable:

- ✅ Email delivered within 5 minutes
- ✅ Email contains all booking info
- ✅ Links work correctly
- ✅ Booking saved even if email fails

### Ideal Performance:

- ✅ Email delivered within 1 minute
- ✅ Email not in spam
- ✅ Professional appearance
- ✅ Mobile-responsive
- ✅ 100% delivery rate

---

## 🎯 Production Testing Plan

### Phase 1: Internal Testing (Now)

- [ ] Test with your own email
- [ ] Test 5-10 bookings
- [ ] Test error scenarios
- [ ] Verify logs

### Phase 2: Beta Testing (Next Week)

- [ ] Select 2-3 real vendors
- [ ] Inform them about new feature
- [ ] Monitor their feedback
- [ ] Track delivery rates

### Phase 3: Full Rollout (After Beta)

- [ ] Enable for all vendors
- [ ] Monitor email metrics
- [ ] Track vendor response times
- [ ] Measure booking conversions

---

## 📞 Quick Reference

### Test Booking Template:
```
Couple: Test Couple
Email: your-email@gmail.com
Service: Photography
Date: 2026-01-15
Location: Manila, Philippines
Guests: 100
Budget: ₱50,000 - ₱75,000
Special: "TEST booking for email notification"
```

### Expected Email Subject:
```
🎉 New Booking Request from Test Couple - Photography
```

### Backend Success Log:
```
📧 Sending new booking notification to vendor: vendor@example.com
✅ Vendor notification sent successfully: <1234567890.mail@gmail.com>
```

---

## ✅ Testing Complete When:

- [ ] Received at least 1 test email successfully
- [ ] Email looks professional and complete
- [ ] Links work correctly
- [ ] Booking created even when email fails
- [ ] Backend logs show clear status
- [ ] Ready for real vendor testing

---

**Ready to test? Start with Scenario 1!** 🚀

**Questions or issues?** Check the troubleshooting section or review backend logs.
