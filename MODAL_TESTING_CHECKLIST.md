# Modal UI/UX Testing Checklist

## 🎯 Quick Testing Guide for Modal Enhancements

### 1. Custom Deposit Modal
**Location**: Individual Bookings → Click "Pay Remaining" on any booking

**Visual Checks**:
- [ ] Modal is centered on screen
- [ ] No content clipping at top/bottom
- [ ] Pink-to-purple gradient on header
- [ ] All preset buttons aligned symmetrically
- [ ] Slider gradient fills correctly from left to right
- [ ] Slider thumb position matches the fill
- [ ] Amount displays with ₱ symbol
- [ ] Modal has subtle shadow and rounded corners
- [ ] Scrollbar appears if content is tall

**Functional Checks**:
- [ ] Preset buttons (25%, 50%, 75%, 100%) update slider
- [ ] Sliding updates amount in real-time
- [ ] Typing in input updates slider position
- [ ] Cannot set amount below minimum
- [ ] Cannot set amount above remaining balance
- [ ] Click outside closes modal
- [ ] "Proceed to Payment" opens payment modal

**Test Cases**:
```
1. Try all preset buttons
2. Drag slider to various positions
3. Type custom amounts (₱1000, ₱5000, etc.)
4. Try scrolling with long content
5. Test on mobile (375px width)
```

---

### 2. Individual Profile Logout Modal
**Location**: Individual Dashboard → Click profile icon → Click "Sign Out"

**Visual Checks**:
- [ ] Modal appears as full-screen overlay (not inside dropdown)
- [ ] Backdrop is semi-transparent with blur
- [ ] Modal is centered vertically and horizontally
- [ ] Red-to-pink gradient icon circle
- [ ] LogOut icon is visible and white
- [ ] "Confirm Logout" title is bold
- [ ] Message text is readable
- [ ] Two buttons side-by-side
- [ ] Cancel button has gray background
- [ ] Sign Out button has red-to-pink gradient
- [ ] Modal has rounded corners and shadow

**Functional Checks**:
- [ ] Clicking "Sign Out" in dropdown opens modal
- [ ] Clicking backdrop closes modal
- [ ] Clicking "Cancel" closes modal without logout
- [ ] Clicking "Sign Out" logs out and redirects to homepage
- [ ] Modal doesn't close when clicking inside it
- [ ] Z-index ensures modal is always on top

**Test Cases**:
```
1. Open dropdown, click "Sign Out"
2. Click backdrop → should close
3. Open again, click "Cancel" → should close
4. Open again, click "Sign Out" → should logout
5. Verify redirect to homepage
```

---

### 3. Vendor Profile Logout Modal
**Location**: Vendor Dashboard → Click profile icon → Click "Sign Out"

**Visual Checks**:
- [ ] Same visual design as individual logout modal
- [ ] Full-screen overlay behavior
- [ ] Gradient icon and colors match
- [ ] Text mentions "vendor account" context

**Functional Checks**:
- [ ] Same functionality as individual logout
- [ ] Redirects to homepage after logout
- [ ] Portal rendering works correctly

**Test Cases**:
```
Same as individual profile logout modal
```

---

### 4. Admin Sidebar Logout Modal
**Location**: Admin Panel → Click "Sign Out" button at bottom of sidebar

**Visual Checks**:
- [ ] Modal appears as full-screen overlay
- [ ] Not clipped by sidebar boundaries
- [ ] Backdrop blur effect works
- [ ] Gradient icon circle (red → pink)
- [ ] "Confirm Logout" title visible
- [ ] "Admin Panel" subtitle visible
- [ ] Message mentions admin features
- [ ] Two-button layout matches other modals

**Functional Checks**:
- [ ] Clicking "Sign Out" in sidebar opens modal
- [ ] Clicking backdrop closes modal
- [ ] Clicking "Cancel" closes modal
- [ ] Clicking "Sign Out" logs out and redirects
- [ ] Modal z-index is correct (above sidebar)
- [ ] Portal renders to document.body

**Test Cases**:
```
1. Login as admin
2. Navigate to any admin page
3. Click "Sign Out" in sidebar
4. Test all close methods (backdrop, Cancel, Sign Out)
5. Verify logout and redirect
```

---

## 🔧 Technical Testing

### Browser Compatibility
Test all modals in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

### Responsive Design
Test all modals at:
- [ ] Desktop: 1920x1080
- [ ] Laptop: 1366x768
- [ ] Tablet: 768px width
- [ ] Mobile: 375px width
- [ ] Mobile landscape: 667px width

### Performance
- [ ] Modals open instantly (< 100ms)
- [ ] No lag when typing/sliding
- [ ] Smooth animations (if any)
- [ ] No memory leaks (check DevTools)
- [ ] Portal cleanup on unmount

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus management is correct
- [ ] ARIA labels present
- [ ] Screen reader friendly
- [ ] High contrast mode supported

---

## 🐛 Common Issues to Check

### Issue: Modal Clipped
**Symptom**: Top/bottom of modal cut off  
**Check**: `overflow-y-auto` and `max-h-[90vh]` present  
**File**: CustomDepositModal.tsx

### Issue: Slider Gradient Wrong
**Symptom**: Fill doesn't match thumb position  
**Check**: Gradient calculation uses normalized percentage  
**Formula**: `((value - min) / (max - min)) * 100`

### Issue: Modal Inside Dropdown
**Symptom**: Logout modal appears clipped in dropdown  
**Check**: Using `createPortal()` to render to `document.body`  
**Z-Index**: Should be `z-[9999]`

### Issue: Can't Click Modal Content
**Symptom**: Clicking inside modal closes it  
**Check**: `onClick={(e) => e.stopPropagation()}` on modal content

### Issue: Modal Behind Other Elements
**Symptom**: Elements appear on top of modal  
**Check**: Z-index hierarchy is correct  
**Fix**: Increase z-index to `z-[9999]`

---

## 📊 Test Results Template

### Test Date: _______________
### Tester: _______________

| Modal | Visual | Functional | Browser | Mobile | Pass/Fail |
|-------|--------|-----------|---------|--------|-----------|
| Custom Deposit | ☐ | ☐ | ☐ | ☐ | ☐ |
| Individual Logout | ☐ | ☐ | ☐ | ☐ | ☐ |
| Vendor Logout | ☐ | ☐ | ☐ | ☐ | ☐ |
| Admin Logout | ☐ | ☐ | ☐ | ☐ | ☐ |

### Issues Found:
```
1. 
2. 
3. 
```

### Screenshots:
- Desktop:
- Mobile:
- Errors (if any):

---

## ✅ Sign-Off

**All tests passed**: ☐ Yes ☐ No

**Ready for production**: ☐ Yes ☐ No

**Notes**:
```


```

**Tested by**: _______________  
**Date**: _______________  
**Signature**: _______________
