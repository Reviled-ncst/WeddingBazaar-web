# 🎯 Quick Testing Guide - New Booking Modal

## 🚀 Production URL
**https://weddingbazaarph.web.app**

---

## 📋 Step-by-Step Test Scenario

### Test Case 1: Happy Path (Complete Booking)

1. **Navigate to Services**
   ```
   Go to: https://weddingbazaarph.web.app/individual/services
   Or use: Decision Support System
   ```

2. **Open Modal**
   ```
   Click any service card
   Click "Book This Service" button
   ✅ Modal should open with Step 1 visible
   ```

3. **Complete Step 1: Event Details**
   ```
   Event Date: Select any future date
   Event Time: Enter a time (optional)
   Event Location: Enter a location
   ✅ Click "Next" button
   ✅ Should advance to Step 2
   ```

4. **Complete Step 2: Requirements**
   ```
   Guest Count: Enter a number (e.g., 150)
   Budget Range: Select a range (e.g., ₱50,000-₱100,000)
   Package: Select a package (optional)
   Special Requests: Enter any text (optional)
   ✅ Click "Next" button
   ✅ Should advance to Step 3
   ```

5. **Complete Step 3: Contact Info**
   ```
   Contact Person: Verify auto-filled (or enter manually)
   Phone Number: Verify auto-filled (or enter manually)
   Email: Verify auto-filled (or enter manually)
   Preferred Contact: Select method (email/phone/message)
   ✅ Click "Submit Booking Request" button
   ✅ Should show loading spinner
   ✅ Should show success modal
   ```

6. **Verify Success**
   ```
   ✅ Success modal appears with confetti animation
   ✅ Booking details are displayed correctly
   ✅ "View My Bookings" button works
   ```

---

### Test Case 2: Validation Testing

1. **Step 1 Validation**
   ```
   1. Open modal
   2. Click "Next" without filling anything
   ✅ Red borders should appear on required fields
   ✅ Error messages should display below fields
   ✅ Should NOT advance to Step 2
   
   3. Fill only Event Date
   4. Click "Next"
   ✅ Event Location error should remain
   ✅ Event Date error should clear
   
   5. Fill Event Location
   6. Click "Next"
   ✅ Should advance to Step 2
   ```

2. **Step 2 Validation**
   ```
   1. Click "Next" without filling anything
   ✅ Red borders on Guest Count and Budget Range
   ✅ Error messages appear
   
   2. Enter "abc" in Guest Count
   3. Click "Next"
   ✅ "Please enter a valid number" error
   
   4. Enter "0" in Guest Count
   ✅ "Please enter a valid number" error
   
   5. Enter "150" in Guest Count
   6. Select Budget Range
   7. Click "Next"
   ✅ Should advance to Step 3
   ```

3. **Step 3 Validation**
   ```
   1. Clear all auto-filled fields
   2. Click "Submit"
   ✅ Name and Phone errors appear
   
   3. Enter name and phone
   4. Enter invalid email: "test@"
   5. Click "Submit"
   ✅ "Please enter a valid email" error
   
   6. Enter valid email: "test@example.com"
   7. Click "Submit"
   ✅ Should submit successfully
   ```

---

### Test Case 3: Navigation Testing

1. **Back Button**
   ```
   1. Complete Step 1, advance to Step 2
   2. Click "Back" button
   ✅ Should return to Step 1
   ✅ Step 1 data should still be filled
   
   3. Click "Next" again
   ✅ Should advance to Step 2
   ✅ Step 2 data should still be filled (if any)
   ```

2. **Close Button**
   ```
   1. Open modal at any step
   2. Click X button (top right)
   ✅ Modal should close
   ✅ Data should be cleared
   
   3. Re-open modal
   ✅ Should start at Step 1
   ✅ Only auto-filled data should be present
   ```

3. **Progress Indicator**
   ```
   1. Observe the step indicator at top
   ✅ Step 1 should be highlighted/pink
   2. Advance to Step 2
   ✅ Step 2 should be highlighted/pink
   ✅ Step 1 should show as completed (checkmark)
   3. Advance to Step 3
   ✅ Step 3 should be highlighted/pink
   ✅ Steps 1 & 2 should show as completed
   ```

---

### Test Case 4: Mobile Testing

**Test on iPhone/Android**:
```
1. Open modal on mobile device
✅ Modal should fit screen properly
✅ No horizontal scrolling
✅ Text should be readable
✅ Buttons should be easily tappable (48px min)

2. Fill out form
✅ Keyboard should not cover input fields
✅ Date picker should work on mobile
✅ Dropdowns should work properly

3. Submit booking
✅ Success modal should display correctly
✅ Confetti animation should play
```

---

### Test Case 5: Edge Cases

1. **Very Long Text**
   ```
   Special Requests: Enter 500+ characters
   ✅ Text area should scroll
   ✅ Form should still submit
   ```

2. **Special Characters**
   ```
   Location: "Café Déjà Vu & Co."
   ✅ Should accept special characters
   ✅ Should submit correctly
   ```

3. **Past Date**
   ```
   Event Date: Select date in the past
   ✅ Should show availability error (if implemented)
   ✅ Or allow selection for testing purposes
   ```

4. **Network Error**
   ```
   1. Turn off internet
   2. Submit booking
   ✅ Should show error message
   ✅ Should not lose form data
   
   3. Turn on internet
   4. Click submit again
   ✅ Should retry successfully
   ```

---

## 🐛 What to Look For

### Visual Issues
- [ ] Modal properly centered on screen
- [ ] No overlapping text or elements
- [ ] Colors match Wedding Bazaar theme (pink/white/black)
- [ ] Buttons have proper hover effects
- [ ] Progress indicator shows correct state
- [ ] Success modal animation plays smoothly

### Functional Issues
- [ ] All required fields validated correctly
- [ ] Optional fields don't show errors when empty
- [ ] Back button preserves data
- [ ] Close button resets form
- [ ] Submit button disabled while loading
- [ ] Success modal shows correct booking details

### Performance Issues
- [ ] Modal opens quickly (< 1 second)
- [ ] Form interactions are smooth
- [ ] No lag when typing
- [ ] Step transitions are smooth
- [ ] Success animation doesn't stutter

### Accessibility Issues
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Error messages are announced (screen readers)
- [ ] Focus states are visible
- [ ] Color contrast is sufficient
- [ ] Touch targets are large enough (mobile)

---

## 📊 Expected Results

### Success Metrics
✅ Modal opens in < 1 second  
✅ Validation errors appear instantly  
✅ Step transitions are smooth  
✅ Form submission completes in < 3 seconds  
✅ Success modal appears with animation  
✅ Works on mobile, tablet, and desktop  

### Known Issues
⚠️ Some accessibility warnings (non-blocking)  
⚠️ Inline styles used (to be moved to CSS)  

---

## 🚨 If Something Breaks

### Console Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Screenshot any errors
4. Report to development team

### Network Errors
1. Open DevTools (F12)
2. Go to Network tab
3. Look for failed requests (red)
4. Check request/response details
5. Report to development team

### Visual Glitches
1. Screenshot the issue
2. Note device and browser
3. Note screen size/resolution
4. Report to development team

---

## ✅ Sign-Off Checklist

After testing, confirm:

- [ ] All 3 steps can be completed
- [ ] Validation works correctly
- [ ] Back/Next buttons work
- [ ] Submit creates booking
- [ ] Success modal displays
- [ ] Works on mobile
- [ ] Works on tablet
- [ ] Works on desktop
- [ ] No console errors
- [ ] No visual glitches

**If all checkboxes are checked: ✅ APPROVED FOR PRODUCTION**

**If any issues found: 🚨 DOCUMENT AND REPORT**

---

**Testing Date**: _____________  
**Tested By**: _____________  
**Device/Browser**: _____________  
**Status**: [ ] PASS  [ ] FAIL  
**Notes**: _____________

---

**Quick Links**:
- Production: https://weddingbazaarph.web.app
- Backend: https://weddingbazaar-web.onrender.com
- Console: https://console.firebase.google.com/project/weddingbazaarph
