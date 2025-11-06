# DSS Desktop "Blink" Issue - Root Cause Analysis

## 📋 **Issue Report**
- **Problem**: Text/buttons "blink" or flicker when clicking on desktop
- **Environment**: Desktop browsers only (NOT mobile)
- **User Report**: "i can't select anything i can't even type the guest count"
- **Key Finding**: Issue does NOT occur on mobile devices

---

## 🔍 **Root Cause Analysis**

Since the issue only affects **desktop** and NOT **mobile**, this rules out:
- ❌ Text selection prevention (`userSelect: 'none'`)
- ❌ Click event handlers
- ❌ Modal overlay issues

The problem is **desktop-specific hover effects**:

### **Identified Culprits**

1. **Scale Transform on Hover** (Line 2214)
   ```tsx
   hover:scale-105  // ← Causes button to grow 5% on hover
   ```
   - Desktop: Triggers on mouse movement
   - Mobile: No hover state, so no scaling
   - **Effect**: Button grows/shrinks rapidly = "blink" appearance

2. **Multiple Hover Transitions** (Various lines)
   ```tsx
   hover:shadow-lg    // Shadow appears
   hover:border-pink-300  // Border color changes
   hover:bg-pink-50   // Background changes
   transition-all     // Animates ALL property changes
   ```
   - **Effect**: Multiple CSS properties animating simultaneously

3. **Rapid Hover State Changes**
   - When clicking, mouse might slightly move
   - Hover state activates/deactivates rapidly
   - Combined with `transition-all` = visible flickering

---

## 🎯 **Proposed Solutions**

### **Solution 1: Remove Scale Transform** (Recommended)
Remove `hover:scale-105` from buttons to eliminate the growing/shrinking effect.

**Files to Update**:
- Line 2214: Next/Generate button

### **Solution 2: Optimize Transitions**
Replace `transition-all` with specific transitions:
```tsx
transition-colors duration-200  // Only transition colors
transition-shadow duration-200  // Only transition shadows
```

### **Solution 3: Disable Hover During Click**
Add active state styling to override hover during click:
```tsx
active:scale-100 active:shadow-md
```

---

## 🛠️ **Implementation Plan**

### **Step 1: Remove Problematic Scale**
```tsx
// BEFORE
className="... hover:shadow-lg hover:scale-105 transition-all"

// AFTER
className="... hover:shadow-lg transition-colors transition-shadow duration-200"
```

### **Step 2: Fix Input Field Selectability**
The guest count input MUST allow text selection:
```tsx
<input
  type="number"
  className="..."
  style={{ 
    userSelect: 'text',        // ← Allow selection
    WebkitUserSelect: 'text', 
    MozUserSelect: 'text' 
  }}
/>
```

### **Step 3: Test on Desktop**
1. Open in Chrome/Firefox/Edge
2. Click and hold buttons
3. Verify no flickering/blinking
4. Test input field typing

---

## ✅ **Expected Results After Fix**

### **Desktop Behavior**
- ✅ No button flickering when clicking
- ✅ Smooth hover transitions
- ✅ Input fields fully functional
- ✅ No unwanted scaling effects

### **Mobile Behavior**
- ✅ Unchanged (already working)
- ✅ No hover effects (as expected)
- ✅ Touch interactions smooth

---

## 📝 **Next Actions**

1. Apply the fix to remove `hover:scale-105`
2. Replace `transition-all` with specific transitions
3. Ensure input fields have proper `userSelect: 'text'`
4. Build and deploy
5. Test on desktop browsers

---

**Status**: Ready to implement
**Priority**: High (blocks user input)
**Impact**: Desktop users only
