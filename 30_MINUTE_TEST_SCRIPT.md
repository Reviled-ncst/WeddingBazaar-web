# 🎯 30-MINUTE PRODUCTION TEST SCRIPT

**⏰ START TIME**: ________  
**📍 LOCATION**: Browser + DevTools open  
**📋 DOCUMENT**: PRODUCTION_TEST_RESULTS.md open side-by-side

---

## ✅ PRE-TEST SETUP (2 min)

1. **Open Production**: https://weddingbazaarph.web.app
2. **Open DevTools**: Press `F12`
3. **Login/Register**: Use coordinator account
4. **Open Test Results**: `PRODUCTION_TEST_RESULTS.md`

---

## 🧪 TEST 1: CLIENT CREATE (3 min)

### **Navigate**: `/coordinator/clients`

### **Actions**:
1. ✅ Click "Add Client"
2. ✅ Fill form:
   ```
   Couple: John & Jane Test 2025
   Contact: John Test
   Email: test+2025@example.com
   Phone: +1234567890
   Date: [Pick future date]
   Budget: 50000
   Status: Active
   Notes: Test client
   ```
3. ✅ Click "Create Client"

### **Verify**:
- [ ] Success message
- [ ] Modal closes
- [ ] Client appears in list
- [ ] No console errors

### **Record in Test Results**: Section 2B.2

---

## 🧪 TEST 2: CLIENT EDIT (2 min)

### **Actions**:
1. ✅ Click "Edit" on test client
2. ✅ Change couple name: "Jane & John Test EDITED"
3. ✅ Change budget: 75000
4. ✅ Click "Save Changes"

### **Verify**:
- [ ] Success message
- [ ] Changes reflected in card
- [ ] No console errors

### **Record in Test Results**: Section 2B.3

---

## 🧪 TEST 3: CLIENT VIEW (2 min)

### **Actions**:
1. ✅ Click "View" on test client
2. ✅ Check all data displays
3. ✅ Test email link
4. ✅ Test phone link
5. ✅ Click "Close"

### **Verify**:
- [ ] All data correct
- [ ] Links work
- [ ] Status badge colored
- [ ] Modal closes smoothly

### **Record in Test Results**: Section 2B.4

---

## 🧪 TEST 4: CLIENT DELETE (2 min)

### **Actions**:
1. ✅ Click "Delete" on test client
2. ✅ Click "Cancel" (test cancel)
3. ✅ Click "Delete" again
4. ✅ Click "Confirm Delete"

### **Verify**:
- [ ] Warning shown
- [ ] Cancel works
- [ ] Success message
- [ ] Client removed from list

### **Record in Test Results**: Section 2B.5

---

## ⏸️ CHECKPOINT (11 min elapsed)

**Client CRUD Status**: _____ (Pass/Fail)  
**Issues Found**: _____

---

## 🧪 TEST 5: WEDDING CREATE (4 min)

### **Navigate**: `/coordinator/weddings`

### **Actions**:
1. ✅ Click "Create Wedding"
2. ✅ Fill form:
   ```
   Couple: [Select from dropdown - create new client if needed]
   Date: [Future date]
   Venue: Grand Ballroom Test
   Budget: 150000
   Guests: 100
   Type: Traditional Wedding
   Status: Planning
   Notes: Test wedding
   ```
3. ✅ Click "Create Wedding"

### **Verify**:
- [ ] Couple dropdown works
- [ ] Success message
- [ ] Modal closes
- [ ] Wedding appears in list
- [ ] No console errors

### **Record in Test Results**: Section 2C.2

---

## 🧪 TEST 6: WEDDING EDIT (3 min)

### **Actions**:
1. ✅ Click "Edit" on test wedding
2. ✅ Change venue: "Updated Grand Ballroom EDITED"
3. ✅ Change guests: 150
4. ✅ Change budget: 200000
5. ✅ Click "Save Changes"

### **Verify**:
- [ ] Success message
- [ ] Changes reflected in card
- [ ] No console errors

### **Record in Test Results**: Section 2C.3

---

## 🧪 TEST 7: WEDDING VIEW (3 min)

### **Actions**:
1. ✅ Click "View" on test wedding
2. ✅ Check all data displays
3. ✅ Verify formatting
4. ✅ Click "Close"

### **Verify**:
- [ ] All data correct
- [ ] Date formatted
- [ ] Budget formatted with commas
- [ ] Status badge colored
- [ ] Modal closes smoothly

### **Record in Test Results**: Section 2C.4

---

## 🧪 TEST 8: WEDDING DELETE (3 min)

### **Actions**:
1. ✅ Click "Delete" on test wedding
2. ✅ Click "Cancel" (test cancel)
3. ✅ Click "Delete" again
4. ✅ Click "Confirm Delete"

### **Verify**:
- [ ] Warning shown
- [ ] Cancel works
- [ ] Success message
- [ ] Wedding removed from list

### **Record in Test Results**: Section 2C.5

---

## ⏸️ FINAL CHECKPOINT (30 min elapsed)

**Wedding CRUD Status**: _____ (Pass/Fail)  
**Overall Status**: _____ (Pass/Fail)  
**Total Issues**: _____

---

## 📊 FILL TEST RESULTS (5 min)

### **Complete These Sections**:
1. ✅ Test Summary table
2. ✅ All Phase 2B checkboxes
3. ✅ All Phase 2C checkboxes
4. ✅ Bugs & Issues section
5. ✅ Final Verdict section

---

## 🎉 WHEN COMPLETE

### **Total Time**: _____ minutes

### **Next Steps**:
1. Share `PRODUCTION_TEST_RESULTS.md`
2. Discuss any issues found
3. Plan fixes if needed
4. Proceed to Vendor CRUD (Phase 3)

---

## 🚨 QUICK TROUBLESHOOTING

| Issue | Check | Fix |
|-------|-------|-----|
| Modal won't open | Console errors | Refresh page |
| API fails | Network tab | Verify backend running |
| Data won't save | Response status | Check request payload |
| List won't refresh | Console | Manually refresh |

---

## 📞 BACKEND STATUS

**Health Check**: https://weddingbazaar-web.onrender.com/api/health  
**Status**: ✅ LIVE (verified at 13:27 UTC)

---

**⏰ END TIME**: ________  
**✅ TESTS COMPLETE**: [ ]
