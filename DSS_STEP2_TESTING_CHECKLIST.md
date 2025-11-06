# DSS Step 2 - Quick Testing Checklist

## 🚀 Quick Test (5 minutes)

### 1. Access & Open
- [ ] Go to https://weddingbazaarph.web.app
- [ ] Login as individual user
- [ ] Navigate to Services page
- [ ] Click "Intelligent Wedding Planner" button
- [ ] Open browser console (F12)

### 2. Get to Step 2
- [ ] Fill in Step 1 basics
- [ ] Click "Next" to reach Step 2

### 3. Test Budget Buttons (30 seconds)
- [ ] Click "Budget-Friendly" button
  - **Check**: Pink highlight appears
  - **Check**: Console shows: `[DSS Step 2] Budget button clicked: budget`
- [ ] Click "Moderate" button
  - **Check**: Pink highlight moves
  - **Check**: Previous selection cleared
- [ ] Click "Upscale" button
- [ ] Click "Luxury" button
- **PASS**: All buttons clickable, one selected at a time ✅

### 4. Test Priority Buttons (2 minutes)
- [ ] Click "Venue" button
  - **Check**: Pink highlight + number "1" + checkmark
  - **Check**: Console shows: `[DSS Step 2] Priority button clicked: venue isSelected: false`
- [ ] Click "Catering" button
  - **Check**: Pink highlight + number "2" + checkmark
  - **Check**: Both buttons highlighted
- [ ] Click "Photography" button
  - **Check**: Number "3" appears
- [ ] Click "Venue" again (deselect)
  - **Check**: Venue unhighlights, numbers reorder (Catering=1, Photography=2)
  - **Check**: Console shows: `isSelected: true`
- **PASS**: Multiple selections, reordering works ✅

### 5. Test Flexibility Buttons (15 seconds)
- [ ] Click "Strict Budget"
  - **Check**: Pink highlight + checkmark
- [ ] Click "Flexible"
  - **Check**: Selection switches
- **PASS**: One selected at a time ✅

### 6. Verify Console Logs
**Expected logs pattern:**
```
[DSS] Fetching service categories from database...
[DSS] Categories fetched: 12 categories
[DSS Step 2] Budget button mousedown: [value]
[DSS Step 2] Budget button clicked: [value]
[DSS] updatePreferences called with: { budgetRange: '[value]' }
[DSS] New preferences: { ... }
[DSS Step 2] Priority button mousedown: [value]
[DSS Step 2] Priority button clicked: [value] isSelected: [bool]
[DSS] updatePreferences called with: { servicePriorities: [...] }
```

**PASS**: All logs present and correct ✅

---

## 🐛 Common Issues

### ❌ Buttons Not Clickable
**Quick Fix**: Hard refresh (Ctrl+Shift+R)

### ❌ No Console Logs
**Quick Fix**: 
1. Clear cache (DevTools → Application → Clear storage)
2. Refresh page
3. Open DSS modal again

### ❌ Empty Priorities Section
**Check**: 
```javascript
fetch('https://weddingbazaar-web.onrender.com/api/categories')
  .then(r => r.json())
  .then(console.log)
```
**Expected**: Array of 12+ categories

---

## ✅ If All Tests Pass

### Next Actions:
1. ✅ Mark Step 2 as complete in main documentation
2. 🧹 Clean up debug logs (remove console.log statements)
3. 🚀 Deploy cleaned version
4. 📝 Update .github/copilot-instructions.md with final status

### Cleanup Commands:
```bash
# Remove debug logs from file
# Then rebuild and redeploy
npm run build
firebase deploy --only hosting
```

---

## ❌ If Tests Fail

### Investigate:
1. Check browser console for errors
2. Verify network requests (Network tab)
3. Check element inspector (Elements tab)
4. Test in different browser

### Report:
- Which button(s) failed
- Console error messages
- Network request failures
- Browser used (Chrome/Firefox/Safari/Edge)

---

## 📊 Success Rate

**Expected**: 100% of buttons clickable and functional  
**Minimum Acceptable**: 95% (at most 1 minor issue)

**If < 95%**: Investigation required before cleaning up debug logs

---

**Test Date**: _____________  
**Tester**: _____________  
**Browser**: _____________  
**Result**: PASS / FAIL  
**Notes**: _____________
