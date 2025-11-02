# 🚀 QUICK START: Production Testing

**Time**: 30 minutes  
**Focus**: Client CRUD (b) + Wedding CRUD (c)

---

## 🎯 TESTING PRIORITY

### **TODAY'S FOCUS**:
1. ✅ **Phase 2B: Client CRUD** (15 min)
2. ✅ **Phase 2C: Wedding CRUD** (15 min)

---

## 📱 BEFORE YOU START

### 1. Open Production Site
```
URL: https://weddingbazaarph.web.app
```

### 2. Open DevTools (F12)
- Go to **Console** tab
- Go to **Network** tab
- Keep it open during testing

### 3. Prepare Test Account
- Option A: Use existing coordinator account
- Option B: Register new account (faster)

### 4. Open Test Results Document
```
File: PRODUCTION_TEST_RESULTS.md
```

---

## 🧪 PHASE 2B: CLIENT CRUD (15 min)

### **URL**: `/coordinator/clients`

### **Test Flow**:
```
1. CREATE → 2. EDIT → 3. VIEW → 4. DELETE
```

### **Quick Test Data**:
```javascript
// Use this format for consistency
{
  coupleName: "John & Jane Test [TIMESTAMP]",
  contactName: "John Test",
  email: "test+[TIMESTAMP]@example.com",
  phone: "+1234567890",
  weddingDate: "[FUTURE DATE]",
  budget: 50000,
  status: "Active",
  notes: "Production test client"
}
```

### **What to Check**:
- ✅ Modal opens/closes smoothly
- ✅ All fields work
- ✅ API calls succeed (check Network tab)
- ✅ Success messages appear
- ✅ Data updates in real-time
- ✅ No console errors

### **Expected API Calls**:
```
POST   /api/coordinator/clients          (CREATE)
PUT    /api/coordinator/clients/:id      (EDIT)
GET    /api/coordinator/clients/:id      (VIEW)
DELETE /api/coordinator/clients/:id      (DELETE)
```

---

## 🧪 PHASE 2C: WEDDING CRUD (15 min)

### **URL**: `/coordinator/weddings`

### **Test Flow**:
```
1. CREATE → 2. EDIT → 3. VIEW → 4. DELETE
```

### **Quick Test Data**:
```javascript
{
  coupleId: "[SELECT FROM DROPDOWN]",
  weddingDate: "[FUTURE DATE]",
  venue: "Grand Ballroom Test Venue",
  budget: 150000,
  guestCount: 100,
  eventType: "Traditional Wedding",
  status: "Planning",
  notes: "Production test wedding"
}
```

### **What to Check**:
- ✅ Modal opens/closes smoothly
- ✅ Couple dropdown loads clients
- ✅ Date picker works
- ✅ All fields work
- ✅ API calls succeed (check Network tab)
- ✅ Success messages appear
- ✅ Data updates in real-time
- ✅ No console errors

### **Expected API Calls**:
```
GET    /api/coordinator/clients          (for dropdown)
POST   /api/coordinator/weddings         (CREATE)
PUT    /api/coordinator/weddings/:id     (EDIT)
GET    /api/coordinator/weddings/:id     (VIEW)
DELETE /api/coordinator/weddings/:id     (DELETE)
```

---

## 🎬 STEP-BY-STEP EXECUTION

### **STEP 1: Access Site**
1. Open https://weddingbazaarph.web.app
2. Open DevTools (F12)
3. Login as coordinator
4. Navigate to /coordinator/clients

### **STEP 2: Test Client CREATE**
1. Click "Add Client" button
2. Fill in test data (use template above)
3. Click "Create Client"
4. **CHECK**:
   - ✅ Success message appears
   - ✅ Modal closes
   - ✅ New client in list
   - ✅ No console errors

### **STEP 3: Test Client EDIT**
1. Click "Edit" on test client
2. Change couple name to "Jane & John Test [EDITED]"
3. Update budget to 75000
4. Click "Save Changes"
5. **CHECK**:
   - ✅ Success message appears
   - ✅ Modal closes
   - ✅ Changes reflected in card
   - ✅ No console errors

### **STEP 4: Test Client VIEW**
1. Click "View" on test client
2. **CHECK**:
   - ✅ All data displays correctly
   - ✅ Email link works (mailto:)
   - ✅ Phone link works (tel:)
   - ✅ Status badge colored
   - ✅ Close button works

### **STEP 5: Test Client DELETE**
1. Click "Delete" on test client
2. Click "Cancel" (test cancel first)
3. Click "Delete" again
4. Click "Confirm Delete"
5. **CHECK**:
   - ✅ Success message appears
   - ✅ Dialog closes
   - ✅ Client removed from list
   - ✅ No console errors

### **STEP 6: Navigate to Weddings**
```
URL: /coordinator/weddings
```

### **STEP 7-10: Repeat for Weddings**
- Same flow as Client tests
- Use Wedding test data template
- Check couple dropdown works

---

## 📊 QUICK CHECKLIST

### **Client CRUD**:
- [ ] CREATE works
- [ ] EDIT works
- [ ] VIEW works
- [ ] DELETE works
- [ ] No errors

### **Wedding CRUD**:
- [ ] CREATE works
- [ ] EDIT works
- [ ] VIEW works
- [ ] DELETE works
- [ ] No errors

---

## 🐛 IF YOU FIND ISSUES

### **Record in DevTools**:
1. **Console**: Copy error messages
2. **Network**: Check failed API calls
3. **Elements**: Inspect broken UI

### **Document in Test Results**:
1. Open `PRODUCTION_TEST_RESULTS.md`
2. Fill in the "BUGS & ISSUES FOUND" section
3. Include:
   - What you did
   - What happened
   - What should happen
   - Error messages
   - Screenshots (if possible)

---

## ✅ WHEN DONE

### **Fill in Test Results**:
```
File: PRODUCTION_TEST_RESULTS.md
```

### **Update Status**:
- Mark all checkboxes
- Fill in timestamps
- Record any issues
- Add final verdict

### **Report Back**:
- Share test results
- Discuss issues found
- Plan fixes if needed
- Proceed to next phase

---

## 🚨 COMMON ISSUES & FIXES

### **Issue**: Modal doesn't open
- **Fix**: Check console for errors, refresh page

### **Issue**: API call fails (404/500)
- **Fix**: Check Network tab, verify backend is running

### **Issue**: Data doesn't update
- **Fix**: Refresh list, check API response

### **Issue**: Success message doesn't show
- **Fix**: Check toast notification settings

---

## 📞 NEED HELP?

- Check `COORDINATOR_PRODUCTION_TESTING_GUIDE.md` for details
- Review API documentation in backend files
- Test backend directly: https://weddingbazaar-web.onrender.com/api/coordinator/health

---

**Ready to test!** 🚀  
**Start time**: [RECORD]  
**End time**: [RECORD]  
**Total duration**: [CALCULATE]
