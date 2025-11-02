# 🎴 TESTING QUICK REFERENCE CARD

## 🔗 PRODUCTION URLS
```
Frontend: https://weddingbazaarph.web.app
Backend:  https://weddingbazaar-web.onrender.com
Health:   https://weddingbazaar-web.onrender.com/api/health
```

## 📂 TEST DOCUMENTS
```
START HERE → 30_MINUTE_TEST_SCRIPT.md
FILL THIS  → PRODUCTION_TEST_RESULTS.md
REFERENCE  → TESTING_QUICK_START.md
FLOWCHART  → TESTING_FLOWCHART.md
```

## 🧪 TEST DATA

### Client:
```
Couple: John & Jane Test 2025
Contact: John Test
Email: test+2025@example.com
Phone: +1234567890
Date: [Future date]
Budget: 50000
Status: Active
Notes: Test client
```

### Wedding:
```
Couple: [Select dropdown]
Date: [Future date]
Venue: Grand Ballroom Test
Budget: 150000
Guests: 100
Type: Traditional Wedding
Status: Planning
Notes: Test wedding
```

## ✅ 8 TESTS IN 30 MINUTES

### Client CRUD (15 min):
1. ➕ CREATE (3 min)
2. ✏️ EDIT (2 min)
3. 👁️ VIEW (2 min)
4. 🗑️ DELETE (2 min)

### Wedding CRUD (15 min):
5. ➕ CREATE (4 min)
6. ✏️ EDIT (3 min)
7. 👁️ VIEW (3 min)
8. 🗑️ DELETE (3 min)

## 🔍 WHAT TO CHECK

Every test:
- [ ] Success message
- [ ] Modal closes
- [ ] Data updates
- [ ] No console errors
- [ ] API returns 200/201

## 🚨 COMMON ISSUES

| Issue | Fix |
|-------|-----|
| Modal won't open | Refresh page |
| API fails | Check Network tab |
| No data | Check auth token |
| Won't save | Check console |

## 📊 API ENDPOINTS

```
POST   /api/coordinator/clients          CREATE
PUT    /api/coordinator/clients/:id      EDIT
GET    /api/coordinator/clients/:id      VIEW
DELETE /api/coordinator/clients/:id      DELETE

POST   /api/coordinator/weddings         CREATE
PUT    /api/coordinator/weddings/:id     EDIT
GET    /api/coordinator/weddings/:id     VIEW
DELETE /api/coordinator/weddings/:id     DELETE
```

## 🎯 SUCCESS = ALL PASS

✅ 8/8 tests complete  
✅ All API calls succeed  
✅ No critical errors  
✅ UI works smoothly

## 📝 DOCUMENT ISSUES

For each issue:
1. What you did
2. What happened
3. What should happen
4. Error message
5. Severity (Critical/Major/Minor)

## ⏱️ TIMING

```
Setup:          2 min
Client tests:  11 min
Wedding tests: 13 min
Fill results:   5 min
─────────────────────
TOTAL:         31 min
```

## 🎓 TIPS

1. Keep DevTools open (F12)
2. Check console for errors
3. Test cancel before confirm
4. Screenshot issues
5. Copy error messages
6. Take your time

## 🚀 START COMMAND

```
1. Open: https://weddingbazaarph.web.app
2. Press: F12 (DevTools)
3. Login: Coordinator account
4. Follow: 30_MINUTE_TEST_SCRIPT.md
5. Fill: PRODUCTION_TEST_RESULTS.md
6. Report: When done
```

## ✨ YOU'RE READY!

**Status**: ✅ ALL SYSTEMS GO  
**Backend**: ✅ LIVE  
**Frontend**: ✅ DEPLOYED  
**Docs**: ✅ READY

**Start**: _______  
**End**: _______  
**Duration**: _______

---

**Print this card and keep it handy during testing!** 📋
