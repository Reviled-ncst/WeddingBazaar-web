# DSS Testing Session Guide
**Date**: January 2025  
**Feature**: Intelligent Wedding Planner (DSS Module)  
**Production URL**: https://weddingbazaarph.web.app  
**Test Duration**: ~45-60 minutes

---

## 🎯 Testing Objectives
1. Verify all 6 steps work correctly in the live environment
2. Test the guest count number input field (replaced slider)
3. Validate vendor matching algorithm accuracy
4. Test edge cases and error handling
5. Verify UI/UX responsiveness and animations
6. Document any issues or improvements needed

---

## 📋 Pre-Testing Checklist

### ✅ Prerequisites
- [ ] Production site loaded: https://weddingbazaarph.web.app
- [ ] Browser console open (F12) for debugging
- [ ] Test user credentials ready:
  - **Demo User**: demo@example.com / Demo123!
  - **John Doe**: johndoe@example.com / John123!
- [ ] Network tab open to monitor API calls
- [ ] Screenshots tool ready for documentation

### ✅ Initial Setup
1. Open the production site in your browser
2. Open Developer Tools (F12)
3. Check Console for any errors
4. Log in with demo credentials
5. Navigate to: **Services → Intelligent Wedding Planner**

---

## 🧪 TEST 1: Basic Flow Test (15 minutes)

### Step 1: Wedding Type Selection
**Location**: First step of DSS wizard

**Test Actions**:
- [ ] Click on "Traditional Wedding" card
- [ ] Verify card highlights with pink border
- [ ] Verify "Next: Ceremony Details" button is enabled
- [ ] Click Next button

**Expected Results**:
✅ Card should highlight with pink glow effect  
✅ Button should be enabled and clickable  
✅ Should transition to Step 2 with smooth animation  
✅ Progress bar should show 1/6 complete  

**Console Checks**:
```javascript
// Should see:
✅ DSS Progress: Step 1/6 completed
✅ Selected Wedding Type: Traditional Wedding
```

---

### Step 2: Ceremony Details
**Location**: Second step of DSS wizard

**Test Actions**:
- [ ] **Guest Count Input Test** (NEW NUMBER INPUT):
  - Type "150" in the input field
  - Try typing "10" (should reject as < 20)
  - Try typing "600" (should clamp to 500)
  - Try typing "abc" (should reject non-numeric)
  - Type a valid number like "200"
- [ ] **Location Selection**:
  - Click location dropdown
  - Select "Manila, Metro Manila"
- [ ] **Ceremony Date**:
  - Click date picker
  - Select a future date (e.g., June 15, 2025)
- [ ] Click "Next: Budget & Style"

**Expected Results**:
✅ Guest count accepts only numbers 20-500  
✅ Invalid entries are rejected with visual feedback  
✅ Location dropdown shows all Philippines locations  
✅ Date picker only allows future dates  
✅ All fields validate before allowing next step  

**Console Checks**:
```javascript
// Should see:
✅ Guest Count: 200 (validated)
✅ Location: Manila, Metro Manila
✅ Ceremony Date: 2025-06-15
✅ DSS Progress: Step 2/6 completed
```

---

### Step 3: Budget & Style
**Location**: Third step of DSS wizard

**Test Actions**:
- [ ] **Budget Selection**:
  - Click "Moderate ($5,000 - $15,000)" card
  - Verify card highlights
- [ ] **Style Preferences** (Multi-select):
  - Click "Elegant & Classic"
  - Click "Romantic & Soft"
  - Verify both are highlighted
  - Click "Elegant & Classic" again to deselect
- [ ] Click "Next: Service Preferences"

**Expected Results**:
✅ Budget card highlights with pink glow  
✅ Can select multiple style preferences  
✅ Can deselect by clicking again  
✅ Selected styles show pink border and checkmark  
✅ Button enables when budget is selected  

**Console Checks**:
```javascript
// Should see:
✅ Budget Range: $5,000 - $15,000
✅ Selected Styles: ["Romantic & Soft"]
✅ DSS Progress: Step 3/6 completed
```

---

### Step 4: Service Preferences
**Location**: Fourth step of DSS wizard

**Test Actions**:
- [ ] **Venue Preferences**:
  - Toggle "Indoor Preference" switch
  - Toggle "Outdoor Preference" switch
  - Verify both can be on simultaneously
- [ ] **Catering Preferences**:
  - Select "Buffet Style"
  - Select "Filipino Cuisine"
  - Check "Vegetarian Options Required"
- [ ] **Special Requirements**:
  - Check "Wheelchair Accessible"
  - Check "Kid-Friendly Amenities"
- [ ] Click "Next: Additional Services"

**Expected Results**:
✅ Toggle switches animate smoothly  
✅ Multiple catering options can be selected  
✅ Checkboxes work independently  
✅ All preferences are saved  
✅ Button enables when at least one preference is set  

**Console Checks**:
```javascript
// Should see:
✅ Venue Preferences: {indoor: true, outdoor: true}
✅ Catering Preferences: {style: "Buffet", cuisine: ["Filipino"], dietary: ["vegetarian"]}
✅ Special Requirements: ["wheelchair_accessible", "kid_friendly"]
✅ DSS Progress: Step 4/6 completed
```

---

### Step 5: Additional Services
**Location**: Fifth step of DSS wizard

**Test Actions**:
- [ ] **Photography**:
  - Check "Photography" checkbox
  - Select "Full Day Coverage" from dropdown
- [ ] **Videography**:
  - Check "Videography" checkbox
  - Select "Highlights + Full Ceremony" from dropdown
- [ ] **Entertainment**:
  - Check "DJ/Band" checkbox
- [ ] **Decoration**:
  - Check "Decoration & Florals" checkbox
- [ ] Click "Next: Review & Match"

**Expected Results**:
✅ Checking service enables its dropdown  
✅ Unchecking service clears its selection  
✅ Can select multiple additional services  
✅ Each service has appropriate options  
✅ Button enables when at least one service is selected  

**Console Checks**:
```javascript
// Should see:
✅ Selected Services: ["photography", "videography", "dj", "decoration"]
✅ Photography Options: {coverage: "Full Day"}
✅ Videography Options: {package: "Highlights + Full Ceremony"}
✅ DSS Progress: Step 5/6 completed
```

---

### Step 6: Review & Match
**Location**: Final step with AI recommendations

**Test Actions**:
- [ ] **Review Summary**:
  - Verify all entered data is displayed correctly
  - Check guest count shows as number (200)
  - Check location, date, budget are correct
- [ ] **Edit Functionality**:
  - Click "Edit" button on any section
  - Verify it jumps back to that step
  - Make a change and proceed back to Review
- [ ] **Get Recommendations**:
  - Click "Get My Perfect Matches" button
  - Wait for loading animation
  - Verify recommendations appear

**Expected Results**:
✅ All data from previous steps is displayed  
✅ Guest count shows as "200 guests" (not a slider)  
✅ Edit buttons navigate back to correct step  
✅ Loading animation displays during matching  
✅ Recommendations appear with vendor cards  
✅ Each vendor shows: name, category, price, rating, location  

**Console Checks**:
```javascript
// Should see:
✅ DSS Matching Algorithm: Processing...
✅ Criteria: {guestCount: 200, location: "Manila", budget: "moderate", styles: [...]}
✅ Matched Vendors: 8 results
✅ Top Recommendations: [venue, catering, photography, etc.]
✅ DSS Progress: 6/6 completed ✓
```

---

## 🧪 TEST 2: Guest Count Number Input Validation (10 minutes)

### Detailed Input Testing

**Test Case 2.1: Valid Range**
- [ ] Enter "20" → Should accept (minimum)
- [ ] Enter "500" → Should accept (maximum)
- [ ] Enter "150" → Should accept (typical)
- [ ] Enter "250" → Should accept (large)

**Test Case 2.2: Below Minimum**
- [ ] Enter "10" → Should reject or clamp to 20
- [ ] Enter "1" → Should reject or clamp to 20
- [ ] Enter "19" → Should reject or clamp to 20

**Test Case 2.3: Above Maximum**
- [ ] Enter "600" → Should clamp to 500
- [ ] Enter "1000" → Should clamp to 500
- [ ] Enter "999999" → Should clamp to 500

**Test Case 2.4: Invalid Input**
- [ ] Enter "abc" → Should reject (non-numeric)
- [ ] Enter "12.5" → Should accept or round to 12/13
- [ ] Enter "-50" → Should reject (negative)
- [ ] Enter "" (empty) → Should show validation error

**Test Case 2.5: Edge Cases**
- [ ] Copy-paste large number → Should clamp to 500
- [ ] Use arrow keys to increment/decrement → Should work
- [ ] Tab to field and type → Should work
- [ ] Use scroll wheel on focused field → Should increment/decrement

**Expected Behavior**:
✅ Only accepts numbers between 20-500  
✅ Provides clear error messages for invalid input  
✅ Clamps values to valid range  
✅ Shows current value clearly  
✅ Allows easy keyboard navigation  

---

## 🧪 TEST 3: Matching Algorithm Accuracy (15 minutes)

### Test Scenario 3.1: Perfect Match
**Setup**:
- Wedding Type: Traditional
- Guests: 150
- Location: Manila
- Budget: Moderate ($5K-$15K)
- Style: Elegant & Classic

**Expected Matches**:
- [ ] Top venue: Elegant ballroom in Manila, capacity 150+, price $8K-$12K
- [ ] Top catering: Filipino buffet, serves 150+, moderate pricing
- [ ] Photography: Professional, 5+ years, portfolio shows traditional weddings
- [ ] All matches should be **verified vendors** (✓ badge)

**Validation**:
```javascript
// Check in console:
✅ All matches within budget range
✅ All locations are in Manila or nearby
✅ All have capacity >= 150 guests
✅ All have 4.0+ rating
✅ Preference score: 80-100% for top 3 matches
```

---

### Test Scenario 3.2: Budget Constraint
**Setup**:
- Wedding Type: Intimate
- Guests: 50
- Location: Quezon City
- Budget: Budget-Friendly ($2K-$5K)
- Style: Simple & Minimalist

**Expected Matches**:
- [ ] All vendors within $2K-$5K range
- [ ] Smaller venues (capacity 50-100)
- [ ] Budget-tier services (not premium packages)
- [ ] Local vendors in Quezon City area

**Validation**:
```javascript
// Check in console:
✅ No vendors exceed $5K price point
✅ All matches suitable for intimate weddings
✅ Budget-conscious options prioritized
✅ Preference score: 70-90% for budget-appropriate matches
```

---

### Test Scenario 3.3: Location-Specific
**Setup**:
- Wedding Type: Destination
- Guests: 200
- Location: Cebu City
- Budget: Luxury ($25K+)
- Style: Modern & Trendy

**Expected Matches**:
- [ ] Cebu-based vendors only
- [ ] High-end venues and services
- [ ] Modern portfolio styles
- [ ] Premium pricing tier

**Validation**:
```javascript
// Check in console:
✅ All vendors located in Cebu City
✅ All premium/luxury tier services
✅ Modern aesthetic in vendor portfolios
✅ Capacity suitable for 200+ guests
```

---

## 🧪 TEST 4: Edge Cases & Error Handling (10 minutes)

### Test Case 4.1: No Matches Found
**Setup**: Choose very specific criteria that might not have matches
- [ ] Unusual location (e.g., remote province)
- [ ] Very large guest count (500) + very low budget
- [ ] Multiple conflicting preferences

**Expected**:
✅ Shows "No exact matches found" message  
✅ Suggests relaxing some criteria  
✅ Shows similar alternatives  
✅ Doesn't crash or show empty state  

---

### Test Case 4.2: API Error Handling
**Setup**: Simulate network issues
- [ ] Open DevTools → Network tab
- [ ] Set throttling to "Slow 3G"
- [ ] Complete DSS flow and request recommendations

**Expected**:
✅ Shows loading indicator  
✅ Handles slow responses gracefully  
✅ Times out after 30 seconds with user-friendly error  
✅ Allows retry without losing data  

---

### Test Case 4.3: Browser Back/Forward
**Setup**: Test navigation resilience
- [ ] Complete steps 1-3
- [ ] Click browser back button
- [ ] Verify data is retained
- [ ] Click browser forward button
- [ ] Continue from where you left off

**Expected**:
✅ Data persists across browser navigation  
✅ Step progress is maintained  
✅ No data loss when using back/forward  

---

### Test Case 4.4: Session Persistence
**Setup**: Test data preservation
- [ ] Complete steps 1-4
- [ ] Refresh the page (F5)
- [ ] Verify DSS state is restored

**Expected**:
✅ Returns to last completed step  
✅ All entered data is preserved  
✅ Can continue from where you left off  

---

## 🧪 TEST 5: UI/UX Responsiveness (10 minutes)

### Test Case 5.1: Desktop (1920x1080)
- [ ] All cards display in proper grid layout
- [ ] Progress bar is visible and accurate
- [ ] Buttons are appropriately sized
- [ ] Text is readable and well-spaced

### Test Case 5.2: Tablet (768x1024)
- [ ] Cards stack appropriately
- [ ] Touch targets are large enough
- [ ] Progress bar adapts to width
- [ ] All content is accessible

### Test Case 5.3: Mobile (375x667)
- [ ] Single-column layout
- [ ] Guest count input is thumb-friendly
- [ ] Buttons are easily tappable
- [ ] No horizontal scrolling
- [ ] All text remains readable

**Testing Method**:
1. Open DevTools (F12)
2. Click "Toggle Device Toolbar" (Ctrl+Shift+M)
3. Test each breakpoint listed above
4. Verify layout adjusts properly

---

## 🧪 TEST 6: Performance & Optimization (5 minutes)

### Test Case 6.1: Load Time
- [ ] Open DevTools → Performance tab
- [ ] Record page load
- [ ] Check time to interactive (should be < 3 seconds)

### Test Case 6.2: Animation Smoothness
- [ ] Verify card hover effects are smooth (60fps)
- [ ] Check step transitions are fluid
- [ ] Validate loading animations don't stutter

### Test Case 6.3: Memory Usage
- [ ] Open DevTools → Memory tab
- [ ] Complete full DSS flow
- [ ] Check for memory leaks
- [ ] Verify memory returns to baseline after completion

---

## 📊 Test Results Template

### ✅ PASSED Tests
```
□ Basic Flow (Steps 1-6): ___/6 steps passed
□ Guest Count Input Validation: ___/5 test cases passed
□ Matching Algorithm: ___/3 scenarios passed
□ Edge Cases: ___/4 test cases passed
□ Responsiveness: ___/3 viewports passed
□ Performance: ___/3 metrics passed
```

### ❌ FAILED Tests
```
1. Test Name: _____________________
   Expected: _____________________
   Actual: _____________________
   Severity: Critical / Major / Minor
   
2. Test Name: _____________________
   Expected: _____________________
   Actual: _____________________
   Severity: Critical / Major / Minor
```

### 🐛 Bugs Found
```
□ Bug #1: _____________________
  Reproduction Steps: _____________________
  Expected: _____________________
  Actual: _____________________
  Screenshot: _____________________

□ Bug #2: _____________________
  Reproduction Steps: _____________________
  Expected: _____________________
  Actual: _____________________
  Screenshot: _____________________
```

### 💡 Improvement Suggestions
```
□ Suggestion #1: _____________________
  Current State: _____________________
  Proposed Improvement: _____________________
  Priority: High / Medium / Low

□ Suggestion #2: _____________________
  Current State: _____________________
  Proposed Improvement: _____________________
  Priority: High / Medium / Low
```

---

## 🎯 Post-Testing Actions

### Immediate (Critical Issues)
- [ ] Fix any critical bugs found
- [ ] Update documentation for any breaking changes
- [ ] Create GitHub issues for major bugs

### Short-term (Within 1 week)
- [ ] Implement high-priority improvements
- [ ] Add additional validation as needed
- [ ] Enhance error messages based on testing feedback

### Long-term (Next Sprint)
- [ ] Optimize matching algorithm based on results
- [ ] Add more vendor fields to form (per implementation plan)
- [ ] Implement advanced filtering options

---

## 📝 Testing Notes & Observations

### Session Information
- **Tester**: ___________________
- **Date**: ___________________
- **Browser**: ___________________
- **Screen Resolution**: ___________________
- **Testing Duration**: ___________ minutes

### General Observations
```
[Write your observations here]

- Overall user experience:
- Performance issues:
- UI/UX feedback:
- Algorithm accuracy:
- Guest count input usability:
- Areas needing improvement:
```

---

## ✅ Testing Completion Checklist

### Before Submitting Results
- [ ] All 6 test suites completed
- [ ] Screenshots taken for any issues
- [ ] Console logs captured for errors
- [ ] Network requests reviewed for API issues
- [ ] Test results template filled out
- [ ] Bugs documented with reproduction steps
- [ ] Improvement suggestions listed with priority

### Final Sign-off
- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Documentation updated
- [ ] Ready for production/next phase

**Testing Completed By**: ___________________  
**Date**: ___________________  
**Overall Status**: ✅ PASSED / ⚠️ PASSED WITH ISSUES / ❌ FAILED

---

## 🔗 Quick Reference Links

- **Production URL**: https://weddingbazaarph.web.app
- **DSS Feature**: /individual/services/wedding-planner
- **Test User Credentials**: demo@example.com / Demo123!
- **Implementation Plan**: DSS_VENDOR_FIELDS_IMPLEMENTATION_PLAN.md
- **Testing Guide**: DSS_COMPREHENSIVE_TESTING_GUIDE.md
- **Change Log**: DSS_SLIDER_TO_NUMBER_INPUT_CHANGE.md

---

**Happy Testing! 🎉**
