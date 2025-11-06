# 🔧 Smart Planner Performance Fix Plan

## Problem Analysis
The Smart Planner has unresponsive clicks due to:
1. **Framer Motion animations on buttons** causing event handler delays
2. **Object dependencies in useCallback/useMemo** causing infinite re-renders
3. **Multiple whileHover/whileTap animations** blocking click events

## Root Cause
When Framer Motion animates buttons with `whileHover` and `whileTap`, it:
- Intercepts click events
- Delays event propagation
- Re-renders on every hover state change
- Can cause clicks to be "eaten" by the animation system

## Solution Strategy

### Phase 1: Fix useCallback/useMemo Dependencies ✅ DONE
- [x] Import useCallback
- [x] Move calculateServiceMatch inside useMemo
- [x] Use primitive values as dependencies instead of objects

### Phase 2: Remove ALL Framer Motion from Interactive Buttons 🚧 IN PROGRESS
Need to convert these motion.button elements to regular button elements:

1. **Service Priority Selection** (line ~880)
   - motion.button → button
   - Remove whileHover

2. **Style Selection** (line ~975)
   - motion.button → button  
   - Remove whileHover, whileTap

3. **Color Palette** (line ~1030)
   - motion.button → button
   - Remove whileHover, whileTap

4. **Atmosphere Selection** (line ~1086)
   - motion.button → button
   - Remove whileHover, whileTap

5. **Location/Region Selection** (line ~1155)
   - motion.button → button
   - Remove whileHover, whileTap

6. **Venue Type Selection** (line ~1199)
   - motion.button → button
   - Remove whileHover, whileTap

7. **Venue Features** (line ~1256)
   - motion.button → button
   - Remove whileHover, whileTap

8. **Dietary Restrictions** (line ~1477)
   - motion.button → button
   - Remove whileHover, whileTap

9. **Accessibility Needs** (line ~1517)
   - motion.button → button
   - Remove whileHover, whileTap

10. **Special Requests** (line ~1557)
    - motion.button → button
    - Remove whileHover, whileTap

11. **Package Selection** (line ~1598 in results)
    - motion.button → button
    - Remove whileHover, whileTap

### Phase 3: Keep Framer Motion Only for Non-Interactive Elements ✅
- motion.div for checkmark animations (OK - not clickable)
- motion.div for modal backdrop (OK - not a button)
- AnimatePresence for modal transitions (OK - wrapper only)

## Expected Results
- ✅ Instant button click response
- ✅ No animation delays
- ✅ Smooth CSS transitions for visual feedback
- ✅ No infinite re-renders
- ✅ Better performance overall

## Testing Checklist
- [ ] Wedding type selection responds immediately
- [ ] Budget selection works instantly
- [ ] Guest count input is responsive
- [ ] All selection buttons click on first try
- [ ] No console errors
- [ ] No blinking or looping animations
- [ ] Modal opens/closes smoothly

## Alternative Approach (If Manual Fix is Too Tedious)
Create a simple button wrapper component that handles hover/active states with CSS:
```tsx
const PlannerButton = ({ isSelected, onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`
      ${className}
      transition-all duration-200
      ${isSelected 
        ? 'border-pink-500 bg-pink-50' 
        : 'border-gray-200 bg-white hover:border-pink-400 active:scale-98'
      }
    `}
  >
    {children}
  </button>
);
```

This avoids repetitive manual edits while maintaining consistent styling.
