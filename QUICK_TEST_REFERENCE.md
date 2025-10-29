# 🎯 Quick Test Reference Card

## ✅ What We Fixed Today

| Fix | Status | Priority |
|-----|--------|----------|
| **Payment Modal** | ✅ Deployed | ⭐⭐⭐ High |
| **Signout Dialog** | ✅ Deployed | ⭐⭐⭐ High |
| **Email Notifications** | ⚠️ Needs Config | ⭐⭐ Medium |

---

## 🚀 Quick Test Commands

### 1. Verify Deployment
```bash
node verify-deployment.cjs
```
**Expected**: All green checkmarks except "Email Service" (needs config)

### 2. Test Payment Modal
1. Open: https://weddingbazaarph.web.app/individual/premium
2. Login as couple
3. Click "Upgrade Now"
4. **✅ Expected**: Modal opens immediately

### 3. Test Signout Dialog
1. Open: https://weddingbazaarph.web.app/individual/dashboard
2. Click profile icon (top-right)
3. Click "Sign Out"
4. **✅ Expected**: Confirmation modal appears, dropdown stays open
5. Click "Cancel"
6. **✅ Expected**: Still logged in

### 4. Setup Email Notifications
```bash
# In Render Dashboard:
# 1. Go to weddingbazaar-web service
# 2. Environment → Add Variables:
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# 3. Redeploy backend
# 4. Test by creating a booking
```

---

## 📊 Test URLs

| Service | URL | Status |
|---------|-----|--------|
| Frontend | https://weddingbazaarph.web.app | ✅ LIVE |
| Backend | https://weddingbazaar-web.onrender.com | ✅ LIVE |
| Health Check | https://weddingbazaar-web.onrender.com/api/health | ✅ OK |

---

## 🔍 Debugging Commands

### Check Browser Console
```
F12 → Console tab → Look for errors
```

### Check Backend Logs
```
Render Dashboard → weddingbazaar-web → Logs
```

### Test Email Service
```bash
node backend-deploy/utils/test-email-service.cjs
```

---

## 📝 Quick Test Checklist

### Payment Modal ⭐⭐⭐
- [ ] Opens immediately on "Upgrade Now" click
- [ ] Shows correct plan details
- [ ] Payment methods selectable
- [ ] Closes properly on cancel
- [ ] No console errors

### Signout Dialog ⭐⭐⭐
- [ ] Confirmation modal appears
- [ ] Dropdown stays open
- [ ] "Cancel" keeps user logged in
- [ ] "Sign Out" logs out user
- [ ] No console errors

### Email Notifications ⭐⭐
- [ ] Environment variables added to Render
- [ ] Backend redeployed
- [ ] Test booking created
- [ ] Vendor receives email within 60s
- [ ] Email content is correct

---

## 🆘 If Something Fails

### Payment Modal Not Opening
1. Clear browser cache (Ctrl+Shift+Delete)
2. Try incognito mode
3. Check console for errors
4. File: `src/shared/components/subscription/UpgradePrompt.tsx`

### Signout Dialog Not Working
1. Refresh page
2. Try different browser
3. Check console for errors
4. Files: 
   - `src/pages/users/individual/landing/CoupleHeader.tsx`
   - `src/pages/users/individual/components/header/modals/ProfileDropdownModal.tsx`

### Email Not Received
1. Check Render environment variables
2. Check vendor email in database
3. Check spam folder
4. Check Render logs for email errors
5. Run: `node test-email-service.cjs`

---

## 📖 Full Documentation

| Document | Purpose |
|----------|---------|
| `TEST_RUN_SUMMARY.md` | Overall test summary |
| `MANUAL_TEST_PLAN.md` | Detailed test procedures |
| `RENDER_EMAIL_SETUP_QUICK.md` | Email setup guide |

---

## ✅ Success Criteria

All tests pass when:
- ✅ Payment modal opens on click
- ✅ Signout requires confirmation
- ✅ Vendor receives booking emails
- ✅ No console errors
- ✅ No backend crashes

---

**Last Updated**: January 29, 2025  
**Status**: Ready for Manual Testing  
**Priority**: High (Payment & Signout), Medium (Email)
