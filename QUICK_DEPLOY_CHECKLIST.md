# 🚀 QUICK DEPLOY CHECKLIST - Vendor Email Notifications

**Date:** October 29, 2025  
**Status:** Ready to Deploy

---

## ✅ Step 1: Gmail App Password - COMPLETE!

**Generated:** `jlgs wrzg yjcc keyq`  
**Without Spaces:** `jlgswrzgyjcckeyq`

---

## 📋 Step 2: Add to Render Environment Variables

### Go to Render Dashboard:
🔗 https://dashboard.render.com/

### Steps:
1. ✅ Select your service: **weddingbazaar-web**
2. ✅ Click **"Environment"** tab
3. ✅ Click **"Add Environment Variable"** button

### Add These Variables:

#### Variable 1:
```
Key:   EMAIL_USER
Value: your-email@gmail.com
```
*(Replace with your actual Gmail address)*

#### Variable 2:
```
Key:   EMAIL_PASS
Value: jlgswrzgyjcckeyq
```
*(No spaces in the password!)*

#### Variable 3:
```
Key:   FRONTEND_URL
Value: https://weddingbazaarph.web.app
```

4. ✅ Click **"Save Changes"**
5. ✅ Render will automatically redeploy (takes ~2-3 minutes)

---

## 🚢 Step 3: Deploy Backend Code

### Option A: Use Automated Script (Recommended)
```powershell
.\deploy-vendor-notifications.ps1
```

### Option B: Manual Deployment
```powershell
git add backend-deploy/
git commit -m "feat: Add vendor email notifications for bookings"
git push origin main
```

Render will auto-deploy from GitHub.

---

## 🧪 Step 4: Test Email Notifications

### Test Procedure:
1. **Login as Individual/Couple:**
   - Go to: https://weddingbazaarph.web.app
   - Login with couple account

2. **Create Test Booking:**
   - Navigate to: Services page
   - Select a vendor
   - Fill out booking form:
     ```
     Service Type: Photography
     Event Date: 2025-12-15
     Location: Manila, Philippines
     Guest Count: 100
     Budget: ₱50,000 - ₱75,000
     Special Requests: Test booking for email notification
     ```
   - Submit booking

3. **Check Vendor Email:**
   - Open vendor's Gmail inbox
   - Look for: **"🎉 New Booking Request from [Couple Name]"**
   - Verify email contains all booking details
   - Click "View Booking Details" button
   - Confirm it opens vendor dashboard

4. **Check Render Logs:**
   - Go to: https://dashboard.render.com/
   - Select: weddingbazaar-web
   - Click: "Logs" tab
   - Look for:
     ```
     ✅ Email service configured with: your-email@gmail.com
     📧 Sending new booking notification to vendor: vendor@example.com
     ✅ Vendor notification sent successfully: <message-id>
     ```

---

## ✅ Success Criteria

### Email Should Contain:
- [ ] Pink-to-purple gradient header
- [ ] Couple's name and email
- [ ] Service type requested
- [ ] Event date (formatted nicely)
- [ ] Event location
- [ ] Guest count
- [ ] Budget range
- [ ] Special requests
- [ ] Booking ID
- [ ] "View Booking Details" button
- [ ] Direct link to vendor dashboard
- [ ] Wedding Bazaar branding in footer

### Backend Logs Should Show:
- [ ] `✅ Email service configured with: [your-email]`
- [ ] `📧 Sending new booking notification to vendor: [vendor-email]`
- [ ] `✅ Vendor notification sent successfully: <message-id>`

### Booking Should Still Be Created:
- [ ] Even if email fails, booking is saved
- [ ] Vendor can see booking in dashboard
- [ ] All booking details preserved

---

## 🔍 Troubleshooting

### Issue: "Email service not configured"
**Solution:** Environment variables not set in Render. Go back to Step 2.

### Issue: "Invalid login" or "Authentication failed"
**Solution:** 
- Check EMAIL_USER is correct Gmail address
- Check EMAIL_PASS has NO spaces: `jlgswrzgyjcckeyq`
- Verify 2-Step Verification is enabled on Google Account

### Issue: Emails go to spam
**Solution:**
- Check vendor's spam folder
- Mark email as "Not Spam"
- Consider using custom domain email in future

### Issue: Email not received
**Check:**
1. Vendor email exists in database
2. Render logs show email was sent
3. Gmail "Sent" folder (from EMAIL_USER account)
4. Wait 5-10 minutes (Gmail may delay)

---

## 📊 Estimated Timeline

| Step | Time | Status |
|------|------|--------|
| Generate Gmail App Password | 5 min | ✅ DONE |
| Add to Render Environment | 3 min | 🚧 IN PROGRESS |
| Deploy Backend Code | 2 min | ⏳ WAITING |
| Test Email Notifications | 5 min | ⏳ WAITING |
| **Total** | **15 min** | |

---

## 🎯 Current Status

✅ **Completed:**
- Gmail app password generated
- Credentials documented
- Deployment scripts ready

🚧 **In Progress:**
- Add environment variables to Render
- Deploy backend code
- Test email notifications

⏳ **Next Action:**
**→ Add environment variables to Render (Step 2)**

---

## 📞 Quick Links

- **Render Dashboard:** https://dashboard.render.com/
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Frontend:** https://weddingbazaarph.web.app
- **Backend API:** https://weddingbazaar-web.onrender.com

---

## 🔒 Security Reminder

**IMPORTANT:**
- ❌ Do NOT commit `EMAIL_CREDENTIALS.txt` to Git
- ❌ Do NOT share the app password
- ✅ Keep credentials in Render environment only
- ✅ Can revoke app password anytime from Google

---

**Ready to proceed with Step 2?**
Add the environment variables to Render now! 🚀
