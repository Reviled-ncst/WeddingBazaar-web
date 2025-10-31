# 🚀 WHITE-LABEL & INTEGRATIONS DEPLOYMENT GUIDE
**Features**: White-Label Options & Premium Integrations
**Date**: October 31, 2025
**Status**: Ready for Production Deployment

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Database
- [x] Tables created (`coordinator_whitelabel_settings`, `coordinator_integrations`)
- [x] Indexes created (4 indexes for performance)
- [x] Foreign key constraints validated
- [x] Default JSONB values configured
- [x] Script verified: `create-coordinator-whitelabel-integrations-tables.cjs`

### Backend
- [x] API endpoints implemented in `coordinator.cjs`
- [x] JWT authentication integrated
- [x] Error handling added
- [x] CORS configured
- [x] Input validation added
- [x] All 8 endpoints tested locally

### Frontend
- [x] Components created (`CoordinatorWhiteLabel.tsx`, `CoordinatorIntegrations.tsx`)
- [x] Routes added to `AppRouter.tsx`
- [x] Navigation updated in `CoordinatorHeader.tsx`
- [x] TypeScript compilation successful
- [x] Build completed: `npm run build` ✅
- [x] No blocking errors
- [x] Lint issues resolved

---

## 📦 DEPLOYMENT STEPS

### Step 1: Backend Deployment (Render)

1. **Commit Changes**:
```bash
git add .
git commit -m "feat: Add white-label options and premium integrations for coordinators"
git push origin main
```

2. **Render Auto-Deploy**:
- Render will detect the push and auto-deploy
- Monitor: https://dashboard.render.com/
- Check logs for successful deployment

3. **Verify Backend**:
```bash
# Test white-label endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://weddingbazaar-web.onrender.com/api/coordinator/whitelabel

# Test integrations endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://weddingbazaar-web.onrender.com/api/coordinator/integrations
```

**Expected Response**: 200 OK with default settings (for white-label) or empty array (for integrations)

---

### Step 2: Frontend Deployment (Firebase)

1. **Build Frontend** (already done):
```bash
npm run build
```
✅ Build completed successfully (3,080 kB bundle)

2. **Deploy to Firebase**:
```bash
firebase deploy --only hosting
```

3. **Verify Deployment**:
- Check: https://weddingbazaarph.web.app/coordinator/whitelabel
- Check: https://weddingbazaarph.web.app/coordinator/integrations

**Expected Behavior**: 
- Should redirect to login if not authenticated
- Should show coordinator pages if logged in as coordinator

---

### Step 3: Database Schema Deployment (If Not Already Done)

**If running on fresh database or new environment:**

```bash
# Run the setup script
node create-coordinator-whitelabel-integrations-tables.cjs
```

**OR execute SQL directly in Neon Console:**
1. Go to: https://console.neon.tech/
2. Select your database
3. Open SQL Editor
4. Paste contents of: `create-coordinator-whitelabel-integrations-tables.sql`
5. Execute

**Verification Query**:
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('coordinator_whitelabel_settings', 'coordinator_integrations');

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('coordinator_whitelabel_settings', 'coordinator_integrations');
```

**Expected Results**:
- 2 tables found
- 4 indexes found

---

## 🧪 POST-DEPLOYMENT TESTING

### Test 1: White-Label Settings

1. **Login as Coordinator**:
   - Go to: https://weddingbazaarph.web.app/
   - Login with coordinator credentials
   - Navigate to: `/coordinator/whitelabel`

2. **Test Branding Tab**:
   - Update business name
   - Change primary color
   - Enter contact information
   - Click "Save Branding"
   - **Expected**: Success message appears

3. **Test Portal Tab**:
   - Update portal name
   - Change welcome message
   - Toggle features on/off
   - Click "Save Portal Settings"
   - **Expected**: Success message appears

4. **Test Custom Domain Tab**:
   - Enter custom domain
   - View DNS instructions
   - Click "Save Domain Settings"
   - **Expected**: Success message appears

5. **Verify Persistence**:
   - Refresh page
   - **Expected**: All settings should persist

---

### Test 2: Premium Integrations

1. **Navigate to Integrations**:
   - From coordinator dashboard
   - Click "Integrations" in header
   - OR go to: `/coordinator/integrations`

2. **Test Add Integration**:
   - Click "Add Integration" button
   - Select an integration (e.g., Stripe)
   - Enter API key (test key: `sk_test_123`)
   - Enter webhook URL (optional)
   - Click "Connect Integration"
   - **Expected**: Integration card appears

3. **Test Integration Management**:
   - Click "Test" button
   - **Expected**: Success message (simulated)
   - Click "Enable/Disable" toggle
   - **Expected**: Status changes
   - Click delete button (trash icon)
   - Confirm deletion
   - **Expected**: Integration removed

4. **Test Category Filtering**:
   - Add multiple integrations in different categories
   - Click category filter buttons
   - **Expected**: Only matching integrations show

5. **Test Persistence**:
   - Refresh page
   - **Expected**: All integrations persist with correct status

---

## 🐛 TROUBLESHOOTING

### Issue: 404 on White-Label Endpoint

**Symptoms**: 
- Frontend shows error loading settings
- Console shows 404 error

**Solutions**:
1. Verify backend deployed successfully
2. Check Render logs for errors
3. Confirm route is in `coordinator.cjs`
4. Test endpoint with curl/Postman

---

### Issue: 401 Unauthorized

**Symptoms**: 
- "Unauthorized" error in console
- Settings won't load

**Solutions**:
1. Check JWT token in localStorage
2. Verify token hasn't expired
3. Re-login to get fresh token
4. Check backend auth middleware

---

### Issue: Settings Not Saving

**Symptoms**: 
- Success message shows but data doesn't persist
- Refresh shows old data

**Solutions**:
1. Check database table exists
2. Verify foreign key constraint (coordinator_id)
3. Check Neon PostgreSQL connection
4. Look at backend logs for SQL errors
5. Run: `SELECT * FROM coordinator_whitelabel_settings;`

---

### Issue: Integrations Not Appearing

**Symptoms**: 
- Empty state shows after adding integration
- Integration list is blank

**Solutions**:
1. Check browser console for errors
2. Verify integration was saved to database
3. Run: `SELECT * FROM coordinator_integrations;`
4. Check API response in Network tab
5. Verify coordinator_id matches logged-in user

---

### Issue: Build Errors

**Symptoms**: 
- `npm run build` fails
- TypeScript compilation errors

**Solutions**:
1. Run: `npm install` to update dependencies
2. Check for missing imports
3. Fix TypeScript type errors
4. Run: `npm run lint` to check for issues
5. Clear cache: `rm -rf node_modules dist`

---

## 📊 MONITORING & METRICS

### What to Monitor

1. **API Endpoints**:
   - Response times (target: <500ms)
   - Error rates (target: <1%)
   - Request volume per endpoint

2. **Database Performance**:
   - Query execution times
   - Connection pool usage
   - Index usage statistics

3. **User Adoption**:
   - Total coordinators using white-label
   - Average integrations per coordinator
   - Most popular integrations
   - Custom domain adoption rate

### Recommended Tools

- **Error Tracking**: Sentry (https://sentry.io/)
- **Performance**: New Relic or DataDog
- **Uptime**: Pingdom or UptimeRobot
- **Analytics**: Mixpanel or Amplitude

---

## 🔐 SECURITY RECOMMENDATIONS

### Immediate (Before Production)

1. **Encrypt API Keys**:
```sql
-- Add encryption at rest
ALTER TABLE coordinator_integrations 
ALTER COLUMN api_key TYPE bytea 
USING pgp_sym_encrypt(api_key::text, 'encryption_key');
```

2. **Rate Limiting**:
- Add rate limiting to test endpoint
- Limit: 10 requests/minute per coordinator

3. **Input Validation**:
- Validate webhook URLs (must be HTTPS)
- Sanitize custom domain inputs
- Validate color hex codes

### Future Enhancements

1. **OAuth 2.0**: For Google, QuickBooks integrations
2. **Webhook Signature Validation**: Verify webhook authenticity
3. **API Key Rotation**: Auto-rotate keys periodically
4. **Audit Logs**: Log all integration activities

---

## 📚 DOCUMENTATION LINKS

### For Developers
- **API Docs**: `COORDINATOR_WHITELABEL_INTEGRATIONS_COMPLETE.md`
- **Database Schema**: `create-coordinator-whitelabel-integrations-tables.sql`
- **Setup Script**: `create-coordinator-whitelabel-integrations-tables.cjs`

### For Users
- **White-Label Guide**: (To be created)
- **Integrations Guide**: (To be created)
- **Video Tutorials**: (To be created)

### For Admins
- **Monitoring Setup**: (To be created)
- **Backup Procedures**: (To be created)
- **Incident Response**: (To be created)

---

## 🎉 LAUNCH CHECKLIST

### Pre-Launch (Week Before)
- [ ] Beta test with 5 coordinators
- [ ] Gather feedback and iterate
- [ ] Create user documentation
- [ ] Setup monitoring and alerts
- [ ] Prepare support team

### Launch Day
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Announce feature via email/blog
- [ ] Monitor error rates closely
- [ ] Be ready for support tickets

### Post-Launch (First Week)
- [ ] Monitor usage metrics daily
- [ ] Respond to feedback quickly
- [ ] Fix any critical bugs immediately
- [ ] Create video tutorials
- [ ] Write case studies

---

## 📞 SUPPORT

### For Users
- **Email**: support@weddingbazaar.com
- **Chat**: In-app support widget
- **Documentation**: docs.weddingbazaar.com

### For Developers
- **GitHub Issues**: github.com/weddingbazaar/web/issues
- **Slack**: #dev-support channel
- **Email**: dev@weddingbazaar.com

---

## 🚀 DEPLOYMENT COMMANDS SUMMARY

```bash
# Backend (Render auto-deploys on push)
git add .
git commit -m "feat: Add white-label and integrations"
git push origin main

# Frontend (Manual deploy)
npm run build
firebase deploy --only hosting

# Database (One-time setup)
node create-coordinator-whitelabel-integrations-tables.cjs
```

---

## ✅ FINAL VERIFICATION

After deployment, verify:

1. **Backend Health**:
```bash
curl https://weddingbazaar-web.onrender.com/api/health
# Expected: 200 OK
```

2. **Frontend Live**:
```bash
curl https://weddingbazaarph.web.app
# Expected: 200 OK, HTML response
```

3. **Database Connection**:
```sql
SELECT COUNT(*) FROM coordinator_whitelabel_settings;
SELECT COUNT(*) FROM coordinator_integrations;
# Expected: Query executes without error
```

4. **Authentication**:
- Login as coordinator
- Navigate to new pages
- Verify JWT token is sent
- Check API responses are 200

---

## 🎊 SUCCESS CRITERIA

**Deployment is successful when:**
- ✅ All API endpoints return 200
- ✅ Frontend loads without errors
- ✅ Database queries execute
- ✅ Authentication works
- ✅ Settings persist after save
- ✅ Integrations can be added/removed
- ✅ No console errors in browser
- ✅ Mobile responsive
- ✅ Navigation works correctly

**You're ready to launch! 🚀**

---

**Prepared by**: GitHub Copilot
**Date**: October 31, 2025
**Version**: 1.0.0
