# 🎯 Services UI/UX - Quick Test Guide

## ✅ What to Test (5-Minute Checklist)

### 1️⃣ Package Selection (30 seconds)
```
1. Open any service modal
2. Check: Default package is selected (checkmark visible)
3. Click another package
4. Check: Selection moves to new package
5. Check: Purple border + ring appears
```

**Expected Result**: ✓ Package selection works smoothly

---

### 2️⃣ Dynamic Pricing (30 seconds)
```
1. Open service modal
2. Note price in top-right corner
3. Select different package
4. Check: Price updates immediately
5. Check: Booking button shows new price
6. Check: Summary at bottom shows new price
```

**Expected Result**: ✓ All prices update in sync

---

### 3️⃣ Gallery Viewer (30 seconds)
```
1. Scroll to gallery section (bottom of modal)
2. Hover over an image
3. Check: Image zooms + overlay appears
4. Click the image
5. Check: Full gallery viewer opens
6. Check: Can navigate left/right
7. Press X or ESC to close
```

**Expected Result**: ✓ Gallery opens and navigates properly

---

### 4️⃣ Booking Validation (30 seconds)
```
Scenario A: With packages
1. Open modal with packages
2. Deselect current package (if possible)
3. Check: Button shows "⚠️ Select Package First"
4. Check: Button is disabled (gray color)
5. Select a package
6. Check: Button shows "Book [Package Name] - ₱[Price]"
7. Check: Button is enabled (purple gradient)

Scenario B: Without packages
1. Open modal without packages
2. Check: Button shows "Request Booking"
3. Check: Button is always enabled
```

**Expected Result**: ✓ Booking button validates correctly

---

### 5️⃣ Responsive Design (30 seconds)
```
1. Resize browser to mobile width (< 768px)
2. Check: Gallery becomes 2 columns
3. Check: Package items stack vertically
4. Check: Modal scrolls smoothly
5. Check: Buttons are large enough to tap
```

**Expected Result**: ✓ Mobile layout works perfectly

---

## 🎨 Visual Reference

### Package Selection States

```
┌─────────────────────────────────────────┐
│ ◉ Premium Package           ₱50,000    │  ← SELECTED
│   ✓ Selected                            │     Purple border
│   Wedding photography & videography     │     Ring shadow
└─────────────────────────────────────────┘     Checkmark

┌─────────────────────────────────────────┐
│ ○ Standard Package          ₱30,000    │  ← NOT SELECTED
│   ✓ Recommended                         │     Blue border
│   Professional wedding photography      │     No ring
└─────────────────────────────────────────┘     No checkmark

┌─────────────────────────────────────────┐
│ ○ Basic Package             ₱20,000    │  ← NOT SELECTED
│                                         │     Gray border
│   Essential wedding coverage            │     No special effects
└─────────────────────────────────────────┘
```

---

### Gallery Layout

```
Desktop (4 columns):
┌────┬────┬────┬────┐
│ 1  │ 2  │ 3  │ 4  │
├────┼────┼────┼────┤
│ 5  │ 6  │ 7  │ 8  │
└────┴────┴────┴────┘

Mobile (2 columns):
┌────┬────┐
│ 1  │ 2  │
├────┼────┤
│ 3  │ 4  │
├────┼────┤
│ 5  │ 6  │
└────┴────┘

Hover Effect:
┌────────────┐
│            │
│  🔍 ZOOM   │  ← Dark overlay + icon
│            │
└────────────┘
```

---

### Booking Button States

```
State 1: No package selected
┌────────────────────────────────────┐
│  ⚠️ Select Package First          │  ← DISABLED
└────────────────────────────────────┘     Gray background

State 2: Package selected
┌────────────────────────────────────┐
│  Book Premium Package - ₱50,000   │  ← ENABLED
└────────────────────────────────────┘     Purple gradient

State 3: No packages available
┌────────────────────────────────────┐
│  Request Booking                   │  ← ENABLED
└────────────────────────────────────┘     Purple gradient
```

---

### Current Selection Summary

```
┌─────────────────────────────────────────────┐
│  Currently Selected:                        │
│  Premium Package                            │
│                                             │
│  Package Price:                             │
│  ₱50,000                                    │
└─────────────────────────────────────────────┘
    Purple/Pink gradient background
    Appears at bottom of packages section
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Default package not selected
**Symptom**: Modal opens with no package selected  
**Check**: Look for `is_default: true` in package data  
**Solution**: First package auto-selected as fallback

### Issue 2: Price not updating
**Symptom**: Price stays same when package selected  
**Check**: Browser console for errors  
**Solution**: Refresh page, check state management

### Issue 3: Gallery not opening
**Symptom**: Click does nothing  
**Check**: Console for errors  
**Solution**: Verify gallery images exist

### Issue 4: Booking button stays disabled
**Symptom**: Button gray even with package selected  
**Check**: `selectedPackage` state  
**Solution**: Try selecting another package

### Issue 5: Mobile layout broken
**Symptom**: Grid doesn't stack on mobile  
**Check**: Browser width < 768px  
**Solution**: Hard refresh (Ctrl+Shift+R)

---

## 📸 Screenshots to Verify

### Desktop View
- [ ] Service card grid (3-4 columns)
- [ ] Modal with package selection
- [ ] Gallery in 4-column grid
- [ ] Selected package with purple border
- [ ] Booking button with package price

### Mobile View
- [ ] Service card list (1 column)
- [ ] Modal scrolling smoothly
- [ ] Gallery in 2-column grid
- [ ] Touch-friendly package selection
- [ ] Large booking button

---

## ✅ Final Checklist

Before marking as complete:

- [ ] Package selection works
- [ ] Price updates dynamically
- [ ] Gallery viewer opens and navigates
- [ ] Booking validation prevents no-selection
- [ ] Mobile responsive works
- [ ] No console errors
- [ ] All images load
- [ ] Smooth animations
- [ ] Clear visual feedback
- [ ] User-friendly experience

---

## 🎉 Success Indicators

You know it's working when:

✅ Default package is selected on modal open  
✅ Clicking package shows checkmark instantly  
✅ Price changes when you select different package  
✅ Gallery images zoom on hover  
✅ Gallery viewer opens when you click image  
✅ Booking button is disabled without selection  
✅ Booking button shows package name + price  
✅ Mobile layout stacks properly  
✅ Everything feels smooth and responsive  
✅ No errors in browser console  

---

## 🚀 Quick Test Commands

### Build Test
```bash
npm run build
# Should complete without errors
```

### Local Test
```bash
npm run dev
# Open http://localhost:5173/individual/services
```

### Production Test
```bash
# Visit: https://weddingbazaarph.web.app/individual/services
```

---

## 📞 Support

If something doesn't work:

1. **Check browser console** for errors
2. **Hard refresh** (Ctrl+Shift+R)
3. **Clear cache** and reload
4. **Try different browser** (Chrome recommended)
5. **Check network tab** for API errors

---

**Happy Testing! 🎊**
