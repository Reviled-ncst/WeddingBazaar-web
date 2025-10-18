# 🧪 Visual Testing Guide - Category-Aware DSS

**Test Date:** October 19, 2025  
**Environment:** https://weddingbazaarph.web.app  
**Feature:** Smart Questionnaire & Service Detail Modal  

---

## 🎯 Manual Testing Scenarios

### Test 1: Single Visual Service (Videography)

**Objective:** Verify questionnaire skips venue-related questions

**Steps:**
1. ✅ Navigate to https://weddingbazaarph.web.app
2. ✅ Login as Individual user
3. ✅ Go to Services page
4. ✅ Click "Smart Wedding Planner" button
5. ✅ Complete Step 1 (Wedding Basics)
   - Select wedding type
   - Set guest count
   - Optional: Set date
6. ✅ In Step 2 (Budget & Priorities):
   - Select budget range
   - **Click ONLY "Photography & Video" in service priorities**
   - Continue
7. ✅ Verify Step 3 (Wedding Style) appears ← SHOULD SHOW
8. ✅ Click Next
9. ✅ Verify Step 5 (Must-Have Services) appears ← SHOULD SKIP STEP 4!
10. ✅ Check progress bar shows 4 dots instead of 6
11. ✅ Check counter shows "Step 3 of 4" or "Step 4 of 4"
12. ✅ Complete questionnaire
13. ✅ In results, click a videography service card
14. ✅ Verify modal shows:
    - ✅ Location preferences
    - ✅ Style preferences
    - ❌ NO venue type options
    - ❌ NO dietary considerations
    - ❌ NO cultural requirements

**Expected Result:**
- Questionnaire: 4 steps total (1, 2, 3, 5)
- Steps 4 & 6 automatically skipped
- Modal shows only location and style info

---

### Test 2: Venue + Catering Services

**Objective:** Verify full questionnaire shown for venue services

**Steps:**
1. ✅ Start DSS
2. ✅ Complete Step 1
3. ✅ In Step 2, select **"Venue"** AND **"Catering"**
4. ✅ Continue through ALL steps
5. ✅ Verify Step 3 (Style) appears
6. ✅ Verify Step 4 (Location & Venue) appears ← SHOULD SHOW
7. ✅ Verify Step 5 (Services) appears
8. ✅ Verify Step 6 (Special Requirements) appears ← SHOULD SHOW
9. ✅ Check progress shows 6 dots
10. ✅ Check counter shows "Step X of 6"
11. ✅ Complete questionnaire
12. ✅ Click venue service card
13. ✅ Verify modal shows ALL categories:
    - ✅ Location preferences
    - ✅ Style preferences
    - ✅ Venue type options
    - ✅ Atmosphere
    - ✅ Cultural requirements
    - ❌ NO dietary (venue doesn't need this)
14. ✅ Click catering service card
15. ✅ Verify modal shows:
    - ✅ Location
    - ✅ Venue compatibility
    - ✅ Dietary options ← IMPORTANT FOR CATERING
    - ✅ Cultural requirements
    - ❌ NO style preferences

**Expected Result:**
- Questionnaire: 6 steps total (full flow)
- All steps shown
- Modal adapts per service category

---

### Test 3: Music/DJ Only

**Objective:** Verify minimal questionnaire for non-visual, non-venue services

**Steps:**
1. ✅ Start DSS
2. ✅ Complete Step 1
3. ✅ In Step 2, select **"Music & Entertainment"** ONLY
4. ✅ Continue
5. ✅ Verify Step 3 (Style) is SKIPPED
6. ✅ Goes directly to Step 5 (Must-Have Services)
7. ✅ Check progress shows 3 dots
8. ✅ Check counter shows "Step 3 of 3"
9. ✅ Complete questionnaire
10. ✅ Click music/DJ service card
11. ✅ Verify modal shows:
    - ✅ Location preferences
    - ✅ Budget info
    - ❌ NO style
    - ❌ NO venue
    - ❌ NO dietary
    - ❌ NO cultural

**Expected Result:**
- Questionnaire: 3 steps total (1, 2, 5)
- Steps 3, 4, 6 automatically skipped
- Modal shows only location and budget

---

### Test 4: Mixed Services (Photography + Venue)

**Objective:** Verify questionnaire shows all steps when venue is included

**Steps:**
1. ✅ Start DSS
2. ✅ In Step 2, select **"Photography"** AND **"Venue"**
3. ✅ Verify ALL 6 steps shown (venue requires full flow)
4. ✅ Complete questionnaire
5. ✅ Click photography service
6. ✅ Verify modal shows:
    - ✅ Location
    - ✅ Style ← Relevant for photography
    - ❌ NO dietary
    - ❌ NO cultural
7. ✅ Click venue service
8. ✅ Verify modal shows:
    - ✅ Location
    - ✅ Style
    - ✅ Venue type
    - ✅ Atmosphere
    - ✅ Cultural
    - ❌ NO dietary (venue doesn't need)

**Expected Result:**
- Full questionnaire shown (6 steps)
- Each service modal shows category-specific info
- Photography modal ≠ Venue modal content

---

### Test 5: Modal Interaction

**Objective:** Verify modal functionality

**Steps:**
1. ✅ Complete questionnaire (any services)
2. ✅ In results view, click first service card in a package
3. ✅ Verify modal opens with smooth animation
4. ✅ Check header shows:
    - Service category badge
    - Service name
    - Match score percentage
    - Verification badge (if verified)
5. ✅ Scroll through modal content
6. ✅ Verify only relevant preference sections shown
7. ✅ Click "Book Service" button
8. ✅ Verify booking flow starts
9. ✅ Open modal again
10. ✅ Click "Message Vendor" button
11. ✅ Verify messaging flow starts
12. ✅ Open modal again
13. ✅ Click X button to close
14. ✅ Verify modal closes smoothly
15. ✅ Click outside modal to close
16. ✅ Verify modal closes

**Expected Result:**
- Modal opens/closes smoothly
- Content is category-specific
- Action buttons work correctly
- Close methods all function

---

### Test 6: Progress Bar Behavior

**Objective:** Verify progress bar updates correctly

**Steps:**
1. ✅ Start DSS with videography only (4 steps)
2. ✅ Check progress bar shows 4 dots
3. ✅ Complete Step 1
4. ✅ Check first dot is highlighted pink
5. ✅ Complete Step 2
6. ✅ Check second dot is pink
7. ✅ Notice Step 3 counter shows "Step 3 of 4"
8. ✅ Check progress percentage is ~75%
9. ✅ Go back one step
10. ✅ Check progress updates backward
11. ✅ Complete questionnaire
12. ✅ Check progress bar disappears in results view

**Expected Result:**
- Progress bar shows correct number of dots
- Dots highlight as steps complete
- Percentage matches current position
- Progress bar hidden in results view

---

### Test 7: Service Card Click-to-View

**Objective:** Verify service cards are clickable

**Steps:**
1. ✅ Complete questionnaire
2. ✅ In results, find a package card
3. ✅ Look at "Included Services" section
4. ✅ Hover over first service name
5. ✅ Verify hover effect (background changes to gray-50)
6. ✅ Click service name
7. ✅ Verify modal opens with that service's details
8. ✅ Close modal
9. ✅ Click second service name
10. ✅ Verify different service details shown
11. ✅ Close modal
12. ✅ Click "View Service Details" button
13. ✅ Verify modal opens with first service

**Expected Result:**
- All service names are clickable
- Hover effect visible
- Each click shows correct service
- Modal content changes per service

---

### Test 8: Edge Case - No Services Selected

**Objective:** Verify behavior when user hasn't selected priorities

**Steps:**
1. ✅ Start DSS
2. ✅ Complete Step 1
3. ✅ In Step 2, DO NOT select any service priorities
4. ✅ Click Next
5. ✅ Verify all 6 steps are shown (default behavior)
6. ✅ Check progress shows 6 dots
7. ✅ Complete all steps
8. ✅ Verify results still generated

**Expected Result:**
- Full questionnaire shown as default
- No errors
- Results generated based on other preferences

---

### Test 9: Edge Case - No Matching Services

**Objective:** Verify empty state handling

**Steps:**
1. ✅ Complete questionnaire with very specific filters
2. ✅ If no services match:
    - ✅ Verify "No matches found" message displays
    - ✅ Check Sparkles icon shows
    - ✅ Verify helpful message displayed
    - ✅ Click "Start Over" button
    - ✅ Verify returns to Step 1
3. ✅ Adjust preferences to get matches
4. ✅ Verify results display correctly

**Expected Result:**
- Empty state shows gracefully
- User can restart questionnaire
- No errors or crashes

---

### Test 10: Responsive Design

**Objective:** Verify mobile compatibility

**Steps:**
1. ✅ Open DSS on mobile device or responsive mode
2. ✅ Verify questionnaire adapts to screen size
3. ✅ Check buttons are touch-friendly
4. ✅ Verify modal fits mobile screen
5. ✅ Check progress bar displays correctly
6. ✅ Test service card clicks on mobile
7. ✅ Verify modal scrolls smoothly
8. ✅ Check all text is readable

**Expected Result:**
- Fully responsive on all screen sizes
- Touch interactions work smoothly
- Content readable on mobile
- No horizontal scrolling

---

## 📊 Test Results Template

### Test Session Information
```
Date: _______________
Tester: _______________
Browser: _______________
Device: _______________
```

### Results Checklist

| Test # | Test Name | Pass | Fail | Notes |
|--------|-----------|------|------|-------|
| 1 | Videography Only | ☐ | ☐ | |
| 2 | Venue + Catering | ☐ | ☐ | |
| 3 | Music/DJ Only | ☐ | ☐ | |
| 4 | Mixed Services | ☐ | ☐ | |
| 5 | Modal Interaction | ☐ | ☐ | |
| 6 | Progress Bar | ☐ | ☐ | |
| 7 | Service Card Click | ☐ | ☐ | |
| 8 | No Services Selected | ☐ | ☐ | |
| 9 | No Matching Services | ☐ | ☐ | |
| 10 | Responsive Design | ☐ | ☐ | |

---

## 🐛 Bug Report Template

If you find any issues:

```
Bug #: ___
Test: ___ 
Step: ___
Expected: ___
Actual: ___
Severity: [ ] Critical [ ] Major [ ] Minor
Screenshot: ___
```

---

## ✅ Acceptance Criteria

All tests must pass for production approval:

- [ ] Questionnaire adapts to service selection
- [ ] Progress bar updates correctly
- [ ] Steps skip appropriately
- [ ] Modal shows category-specific info
- [ ] All interactive elements work
- [ ] No console errors
- [ ] Smooth animations
- [ ] Responsive on all devices
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Fast performance (<1s for step transitions)

---

**Testing Status:** Ready for QA  
**Priority:** High  
**Target Browsers:** Chrome, Firefox, Safari, Edge (latest)  
**Devices:** Desktop, Tablet, Mobile
