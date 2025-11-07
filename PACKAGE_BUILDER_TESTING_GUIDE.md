# Package Builder Testing Guide 🧪

**Component**: PackageBuilder with Quantity Segregation  
**Date**: November 7, 2025  
**Status**: Ready for Testing

---

## Quick Test Steps

### 1. Start Development Server
```powershell
npm run dev
```

### 2. Navigate to Vendor Services
```
URL: http://localhost:5173/vendor/services
Login as: Vendor account
```

### 3. Click "Add Service" Button
```
Location: Top right corner of services page
```

### 4. Fill Basic Info (Step 1)
```
Service Name: "Gold Photography Package"
Category: Photography
Description: "Premium wedding photography with full coverage"
Location: "Manila"
```

### 5. Navigate to Step 2 (Pricing)
```
Click "Next Step" button
```

### 6. Scroll to Package Builder Section
```
Look for: "Service Packages" heading with 📦 icon
```

---

## Test Cases

### Test Case 1: Create New Package from Scratch ✅

**Steps**:
1. Click "Add Another Package" button
2. Enter package name: "Gold Package"
3. Enter description: "Our premium offering"
4. Enter price: 50000
5. Click "+ Add inclusion" button

**Expected Result**:
- New inclusion form appears with 4 fields:
  - Item Name (text input)
  - Quantity (number input)
  - Unit (dropdown)
  - Description (text input)

**Verify**:
- [ ] All fields are editable
- [ ] Quantity defaults to 1
- [ ] Unit defaults to "pcs"
- [ ] Description is optional

---

### Test Case 2: Add Multiple Items ✅

**Steps**:
1. Fill first item:
   ```
   Item Name: "Photography Service"
   Quantity: 8
   Unit: hours
   Description: "Full-day coverage"
   ```
2. Click "+ Add inclusion" again
3. Fill second item:
   ```
   Item Name: "Professional Photographer"
   Quantity: 2
   Unit: people
   Description: "Lead + assistant"
   ```

**Expected Result**:
- Both items appear in list
- Each has its own edit/remove buttons
- Package summary shows "2 inclusions"

**Verify**:
- [ ] Can add unlimited items
- [ ] Each item maintains its own state
- [ ] No data loss when adding new items

---

### Test Case 3: Edit Item Quantities ✅

**Steps**:
1. Change quantity from 8 to 12
2. Click elsewhere to blur input
3. Check if value persists

**Expected Result**:
- Quantity updates immediately
- Value persists after blur
- No console errors

**Verify**:
- [ ] Quantity accepts positive integers
- [ ] Negative numbers are rejected
- [ ] Zero is rejected (min: 1)

---

### Test Case 4: Change Unit Types ✅

**Steps**:
1. Open unit dropdown
2. Verify all options are visible:
   - pcs
   - hours
   - days
   - sets
   - items
   - people
   - tables
   - copies
   - sessions
3. Select "hours"

**Expected Result**:
- Dropdown opens smoothly
- All 9 unit options visible
- Selection updates immediately

**Verify**:
- [ ] Dropdown is accessible (keyboard nav works)
- [ ] Selected value shows in dropdown
- [ ] Value persists after selection

---

### Test Case 5: Add Optional Descriptions ✅

**Steps**:
1. Leave description empty for first item
2. Add description for second item: "Lead photographer + assistant"
3. Save package

**Expected Result**:
- Both items save successfully
- Empty description doesn't cause errors
- Filled description is preserved

**Verify**:
- [ ] Optional field truly optional
- [ ] No validation errors for empty description
- [ ] Description text saved correctly

---

### Test Case 6: Remove Items ✅

**Steps**:
1. Click "X" button on second item
2. Confirm removal (if prompted)

**Expected Result**:
- Item removed from list
- Remaining items stay intact
- Package summary updates ("1 inclusion")

**Verify**:
- [ ] Correct item removed
- [ ] Other items unaffected
- [ ] Can remove all items except last one (minimum 1)

---

### Test Case 7: Drag to Reorder ✅

**Steps**:
1. Add 3 items to package
2. Click and hold grip icon (⋮⋮) on item 2
3. Drag to position 1
4. Release

**Expected Result**:
- Item 2 moves to top
- Other items shift down
- Order persists

**Verify**:
- [ ] Drag handle is visible
- [ ] Cursor changes to "grabbing"
- [ ] Smooth animation during drag
- [ ] New order persists

---

### Test Case 8: Load Template ✅

**Steps**:
1. Click "Use Templates" button
2. Click "Photography Template" option
3. Wait for template to load

**Expected Result**:
- Template packages appear
- Each package has structured items with:
  - Name: Converted from old string
  - Quantity: 1 (default)
  - Unit: "pcs" (default)
  - Description: Empty

**Verify**:
- [ ] Template loads successfully
- [ ] All packages converted to new format
- [ ] No data loss during conversion
- [ ] Items are editable after load

---

### Test Case 9: Expand/Collapse Packages ✅

**Steps**:
1. Create package with items
2. Click chevron (▼) to collapse
3. Click chevron (▲) to expand

**Expected Result**:
- Package details hide/show smoothly
- Chevron icon rotates
- State persists during editing

**Verify**:
- [ ] Smooth animation
- [ ] Icon changes correctly
- [ ] Data not lost when collapsed

---

### Test Case 10: Edit Package Name & Price ✅

**Steps**:
1. Click edit icon (✏️) on package header
2. Change name to "Platinum Package"
3. Change price to 75000
4. Click save icon (✓)

**Expected Result**:
- Package name updates in header
- Price updates in summary
- Edit mode exits

**Verify**:
- [ ] Changes save immediately
- [ ] Edit mode toggles correctly
- [ ] No validation errors

---

### Test Case 11: Form Submission ✅

**Steps**:
1. Fill complete service form (all 6 steps)
2. Create 1+ package with 2+ items
3. Click "Create Service" button
4. Wait for success message

**Expected Result**:
- Service saves successfully
- Check browser console for:
  ```
  📦 [PackageBuilder] Synced packages to window: 1
  ```
- Check `window.__tempPackageData.packages` in console:
  ```javascript
  [{
    name: "Gold Package",
    price: 50000,
    items: [
      {
        category: "deliverable",
        name: "Photography Service",
        quantity: 8,
        unit: "hours",
        description: "Full-day coverage"
      }
    ]
  }]
  ```

**Verify**:
- [ ] No console errors
- [ ] Data structure matches expected format
- [ ] Backend receives correct data
- [ ] Service appears in vendor's service list

---

### Test Case 12: Validation Messages ✅

**Steps**:
1. Try to save package with empty name
2. Try to save package with zero price
3. Try to save package with no items

**Expected Result**:
- Yellow warning: "Add at least one package..."
- Red error: "All packages must have a name and price > 0"
- Form prevents submission

**Verify**:
- [ ] Validation messages appear
- [ ] Messages are clear and helpful
- [ ] Form blocks submission
- [ ] User can fix errors easily

---

### Test Case 13: Multiple Packages ✅

**Steps**:
1. Create "Bronze Package" with 3 items
2. Create "Silver Package" with 5 items
3. Create "Gold Package" with 8 items
4. Verify all packages saved

**Expected Result**:
- All 3 packages visible
- Each maintains separate item lists
- Can edit any package independently
- Can reorder packages by dragging

**Verify**:
- [ ] No limit on package count
- [ ] Each package isolated
- [ ] No data cross-contamination
- [ ] Performance stays smooth

---

### Test Case 14: Browser Compatibility ✅

**Test in**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

**Expected Result**:
- All features work across browsers
- UI renders correctly
- Drag-and-drop works (except mobile)
- Touch interactions work on mobile

---

### Test Case 15: Accessibility ✅

**Steps**:
1. Navigate using keyboard only (Tab key)
2. Use screen reader (NVDA/JAWS)
3. Check all buttons have labels

**Expected Result**:
- All inputs accessible via keyboard
- Screen reader announces labels correctly
- No "unlabeled button" errors

**Verify**:
- [ ] Tab order logical
- [ ] All buttons have aria-labels
- [ ] Form is fully accessible

---

## Performance Testing

### Load Time
```
Expected: < 100ms for component render
Expected: < 50ms for item add/remove
Expected: < 200ms for template load
```

**Steps**:
1. Open Chrome DevTools
2. Go to Performance tab
3. Start recording
4. Add 20 items to a package
5. Stop recording
6. Check rendering times

**Verify**:
- [ ] No janky animations
- [ ] No layout shifts
- [ ] Smooth 60 FPS

---

## Data Integrity Testing

### Check Window Object
```javascript
// Open browser console
console.log(window.__tempPackageData);

// Should see:
{
  packages: [{
    name: "Gold Package",
    price: 50000,
    is_default: true,
    is_active: true,
    items: [{
      category: "deliverable",
      name: "Photography Service",
      quantity: 8,
      unit: "hours",
      description: "Full-day coverage"
    }]
  }],
  addons: [],
  pricingRules: []
}
```

**Verify**:
- [ ] Structure matches expected format
- [ ] All fields present
- [ ] Data types correct (numbers are numbers, not strings)
- [ ] No undefined or null values

---

## Edge Cases

### 1. Very Long Item Names
```
Item Name: "Professional full-frame DSLR camera with 24-70mm f/2.8 lens, backup body, and complete lighting equipment including softboxes, reflectors, and continuous LED lights"
```
**Expected**: Text wraps or truncates gracefully

### 2. Very Large Quantities
```
Quantity: 999999
```
**Expected**: Accepts large numbers without breaking

### 3. Special Characters
```
Item Name: "5★ Premium Package™ (50% off!)"
Description: "Includes <special> equipment & extras"
```
**Expected**: Characters preserved, no XSS vulnerabilities

### 4. Rapid Clicking
- Click "Add inclusion" 10 times rapidly
**Expected**: All 10 items added, no duplicates

### 5. Network Failure During Save
- Disconnect internet
- Try to save service
**Expected**: Clear error message, data not lost

---

## Bug Reporting Template

```markdown
### Bug Report

**Title**: [Brief description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Screenshots**:
[If applicable]

**Console Errors**:
```
[Paste error messages]
```

**Environment**:
- Browser: 
- OS: 
- Screen Size: 

**Severity**:
- [ ] Critical (blocks functionality)
- [ ] High (major feature broken)
- [ ] Medium (workaround exists)
- [ ] Low (cosmetic issue)
```

---

## Success Criteria ✅

The feature is ready for production when:

- [ ] All 15 test cases pass
- [ ] No console errors or warnings
- [ ] Works in all major browsers
- [ ] Accessible (WCAG 2.1 AA compliant)
- [ ] Performance < 100ms for operations
- [ ] Data integrity verified
- [ ] All edge cases handled
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] No TypeScript errors

---

## Quick Smoke Test (2 minutes)

1. Add service → Photography
2. Go to Step 2 (Pricing)
3. Click "Add Another Package"
4. Name: "Test"
5. Price: 10000
6. Add inclusion:
   - Name: "Camera"
   - Quantity: 2
   - Unit: pcs
7. Click through to Step 6
8. Click "Create Service"
9. Success? ✅

If all steps work → Feature is working!

---

**Happy Testing! 🎉**
