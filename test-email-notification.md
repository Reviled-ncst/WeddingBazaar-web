# 📧 Email Notification Testing Guide

## ✅ Environment Variables Added to Render

You've successfully added:
- ✅ `EMAIL_USER`: renzrusselbauto@gmail.com
- ✅ `EMAIL_PASS`: shcm jycp hrcb hsch

**Status**: Render is automatically redeploying your backend with these credentials.

---

## 🔍 Step 1: Wait for Render Redeploy (2-3 minutes)

1. **Go to Render Dashboard**
   ```
   https://dashboard.render.com
   ```

2. **Select Your Service**
   - Click: `weddingbazaar-web`

3. **Check Deploy Status**
   - Look for: "Deploy succeeded" or "Live"
   - Status should change from "Deploying..." to "Live"

4. **Check Logs for Email Configuration**
   - Click: "Logs" tab
   - Look for one of these messages:
     ```
     ✅ Email service configured with: renzrusselbauto@gmail.com
     ```
     or
     ```
     ⚠️ Email service not configured - emails will be logged to console
     ```

---

## ✅ Step 2: Verify Email Service is Active

### Check Backend Logs

Once deployment is complete, check the Render logs for:

**What to Look For**:
```
✅ Email service configured with: renzrusselbauto@gmail.com
```

**If You See This Instead**:
```
⚠️ Email service not configured - emails will be logged to console
```
**Action**: Environment variables may not have loaded. Try restarting the service:
- Render Dashboard → Your Service → Manual Deploy → "Deploy latest commit"

---

## 🧪 Step 3: Test Booking Flow (End-to-End)

### Test Case 1: Create New Booking

1. **Go to Your Website**
   ```
   https://weddingbazaarph.web.app
   ```

2. **Browse Services**
   - Click: "Services" or "Browse Vendors"
   - Select any service (e.g., Photography, Catering)

3. **Request a Booking**
   - Click: "Book Now" or "Request Quote"
   - Fill in the booking form:
     - Event Date: Any future date
     - Guest Count: 100
     - Location: Manila
     - Special Requests: "This is a test booking"
   - Click: "Submit Booking Request"

4. **Check Frontend Success Feedback**
   - ✅ Success modal should appear
   - ✅ Toast notification (top-right corner)
   - ✅ "Booking Request Sent!" message

5. **Check Your Individual Bookings Page**
   ```
   https://weddingbazaarph.web.app/individual/bookings
   ```
   - ✅ New booking should appear with status "Awaiting Quote"

### Test Case 2: Check Email Delivery

**Immediately After Creating Booking**:

1. **Check Vendor's Email Inbox**
   - Look for email from: "Wedding Bazaar <renzrusselbauto@gmail.com>"
   - Subject: "🎉 New Booking Request!"
   - Should arrive within **5-30 seconds**

2. **Expected Email Content**:
   ```
   Subject: 🎉 New Booking Request!
   From: Wedding Bazaar <renzrusselbauto@gmail.com>
   
   Hi [Vendor Name]!
   
   You have a new booking inquiry!
   
   Booking Details:
   - Couple Name: [Your Name]
   - Email: [Your Email]
   - Service Type: [Photography/Catering/etc]
   - Event Date: [Selected Date]
   - Location: Manila
   - Guest Count: 100 guests
   
   Special Requests:
   This is a test booking
   
   [View Booking Details] button
   ```

3. **If No Email Received**:
   - Check **Spam/Junk folder**
   - Check **All Mail folder** (Gmail)
   - Check **Render logs** for email sending errors

---

## 🔍 Step 4: Check Render Logs for Email Activity

### What to Look For in Logs:

**Successful Email Sending**:
```
📧 Sending new booking notification to vendor: vendor@example.com
✅ Email sent successfully: <message-id-12345>
```

**Email Configuration Confirmed**:
```
✅ Email service configured with: renzrusselbauto@gmail.com
```

**If You See Errors**:
```
❌ Failed to send vendor notification email: Invalid login
```
**Action**: Check if App Password is correct and has no spaces.

```
❌ Error preparing vendor notification: Vendor email not found
```
**Action**: Ensure vendor has an email address in the database.

---

## 🐛 Troubleshooting

### Issue 1: "⚠️ Email service not configured" Still Showing

**Solution**:
1. Go to Render Dashboard → Environment tab
2. Verify variables are saved:
   - `EMAIL_USER` = renzrusselbauto@gmail.com
   - `EMAIL_PASS` = shcm jycp hrcb hsch
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait 2-3 minutes for redeploy
5. Check logs again

### Issue 2: Email Not Received

**Check 1**: Spam/Junk Folder
- Gmail may flag first-time sender as spam
- Mark as "Not Spam" if found

**Check 2**: Vendor Email in Database
```sql
-- Check if vendor has email
SELECT vp.business_name, u.email 
FROM vendor_profiles vp
LEFT JOIN users u ON vp.user_id::text = u.id::text
WHERE vp.id = 'vendor-id-here';
```

**Check 3**: Gmail App Password
- Ensure password has no spaces: `shcmjycphrcbhsch`
- Verify 2FA is enabled on Gmail account

**Check 4**: Render Logs
- Look for "📧 Sending new booking notification"
- Check for error messages

### Issue 3: "Invalid login: 535-5.7.8"

**Solution**:
1. Regenerate Gmail App Password:
   - Visit: https://myaccount.google.com/apppasswords
   - Delete old password
   - Generate new one
2. Update `EMAIL_PASS` in Render
3. Redeploy

### Issue 4: Success Modal Not Showing

**This is a separate issue from email**:
- Check browser console for JavaScript errors (F12)
- Clear browser cache (Ctrl+Shift+Delete)
- Try different browser
- Check network tab for API response

---

## ✅ Success Criteria

### Email System is Working When:

1. ✅ Render logs show: "✅ Email service configured with: renzrusselbauto@gmail.com"
2. ✅ After creating booking, logs show: "📧 Sending new booking notification to vendor"
3. ✅ Logs show: "✅ Email sent successfully: <message-id>"
4. ✅ Vendor receives email within 30 seconds
5. ✅ Email has correct booking details
6. ✅ "View Booking Details" button works

---

## 📊 Test Results Checklist

After testing, verify:

- [ ] Environment variables saved in Render
- [ ] Render deployment completed successfully
- [ ] Logs show "Email service configured"
- [ ] Created test booking successfully
- [ ] Frontend showed success modal
- [ ] Booking appears in bookings page
- [ ] Vendor received email notification
- [ ] Email has correct content and formatting
- [ ] Email links work correctly
- [ ] No errors in Render logs

---

## 🚀 Next Steps After Successful Test

1. **Test with Real Vendors**
   - Create bookings with actual vendor emails
   - Verify they receive notifications

2. **Monitor Email Delivery**
   - Check Render logs daily
   - Monitor for failed sends

3. **Consider Upgrading Email Provider** (For Production)
   - Gmail SMTP: 500 emails/day limit
   - Upgrade to SendGrid/AWS SES for better deliverability

4. **Add Email Monitoring**
   - Track email open rates
   - Monitor delivery failures
   - Set up alerts for email errors

---

## 📞 Getting Help

If email still doesn't work after following this guide:

1. **Check Render Logs First**
   - Look for exact error messages
   - Note the timestamp of the error

2. **Verify Gmail Settings**
   - Confirm 2FA is enabled
   - Verify App Password is active
   - Check for "Security alerts" in Gmail

3. **Test Email Service Manually**
   - Use online SMTP tester
   - Verify credentials work outside of app

---

## 🎯 Quick Test Summary

**Total Time**: ~5 minutes

1. Wait for Render redeploy (2-3 min)
2. Check logs for "Email service configured" (30 sec)
3. Create test booking (1 min)
4. Check vendor email (30 sec)
5. Verify email content (30 sec)

**Expected Result**: Vendor receives beautiful HTML email with booking details within 30 seconds of booking creation.

---

**Current Status**: ⏳ Waiting for Render to redeploy with new email credentials  
**Next Action**: Check Render logs in 2-3 minutes for "Email service configured" message  
**Then**: Create test booking and check vendor email inbox
