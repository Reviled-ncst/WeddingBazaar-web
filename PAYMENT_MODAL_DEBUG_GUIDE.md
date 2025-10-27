# 🐛 PAYMENT MODAL NOT SHOWING - DEBUG GUIDE

## Issue
When clicking on a subscription plan in the UpgradePrompt modal, the PayMongoPaymentModal should open but isn't showing up.

## Current Setup ✅

### 1. UpgradePrompt Component
**File**: `src/shared/components/subscription/UpgradePrompt.tsx`

**Plan Click Handler** (Line 243):
```typescript
const handleUpgradeClick = (plan: any) => {
  if (isProcessing) return;
  setIsProcessing(true);
  
  if (plan.price === 0) {
    handleFreeUpgrade(plan);
  } else {
    // ✅ This sets the state for paid plans
    setSelectedPlan(plan);
    setPaymentModalOpen(true); // 👈 Payment modal should open
    setTimeout(() => setIsProcessing(false), 1000);
  }
};
```

**PayMongoPaymentModal Render** (Line 621):
```tsx
{selectedPlan && (
  <PayMongoPaymentModal
    isOpen={paymentModalOpen}  // 👈 Should be true
    onClose={() => {
      setPaymentModalOpen(false);
      setSelectedPlan(null);
      setIsProcessing(false);
    }}
    booking={{
      id: `subscription-${Date.now()}`,
      vendorName: 'Wedding Bazaar',
      serviceType: `${selectedPlan.name} Subscription`,
      eventDate: new Date().toISOString(),
      bookingReference: `SUB-${selectedPlan.name.toUpperCase()}-${Date.now()}`
    }}
    paymentType="full_payment"
    amount={selectedPlan.price * currency.rate}
    currency={currency.code}
    currencySymbol={currency.symbol}
    onPaymentSuccess={handlePaymentSuccess}
    onPaymentError={handlePaymentError}
  />
)}
```

### 2. Z-Index Levels
- **UpgradePrompt**: `z-[99999]` (Line 387)
- **PayMongoPaymentModal**: `z-[999999]` (higher) ✅

## Debugging Steps

### Step 1: Add Console Logs
Add these logs to verify the flow:

**In `handleUpgradeClick`**:
```typescript
const handleUpgradeClick = (plan: any) => {
  console.log('🎯 handleUpgradeClick called', { plan, isProcessing });
  
  if (isProcessing) {
    console.log('⚠️ Payment already in progress, ignoring click');
    return;
  }

  setIsProcessing(true);
  
  if (plan.price === 0) {
    handleFreeUpgrade(plan);
  } else {
    console.log('💳 Opening payment modal for paid plan:', plan.name);
    console.log('💰 Amount:', plan.price * currency.rate, currency.code);
    setSelectedPlan(plan);
    setPaymentModalOpen(true);
    console.log('✅ Payment modal state set to TRUE');
    
    setTimeout(() => setIsProcessing(false), 1000);
  }
};
```

**Before PayMongoPaymentModal render**:
```tsx
{selectedPlan && console.log('🔍 Rendering PayMongoPaymentModal:', {
  selectedPlan,
  paymentModalOpen,
  amount: selectedPlan.price * currency.rate
})}

{selectedPlan && (
  <PayMongoPaymentModal
    isOpen={paymentModalOpen}
    // ... rest of props
  />
)}
```

### Step 2: Check Browser Console
1. Open browser DevTools (F12)
2. Click on a paid plan (Premium/Pro/Enterprise)
3. Look for these logs:
   ```
   🎯 handleUpgradeClick called { plan: {...}, isProcessing: false }
   💳 Opening payment modal for paid plan: Premium
   💰 Amount: 5 PHP
   ✅ Payment modal state set to TRUE
   🔍 Rendering PayMongoPaymentModal: { selectedPlan: {...}, paymentModalOpen: true }
   ```

### Step 3: Check React DevTools
1. Install React DevTools extension
2. Open React DevTools
3. Search for "PayMongoPaymentModal"
4. Check if it's rendered
5. Check its `isOpen` prop value

### Step 4: Check DOM
1. Open Elements tab
2. Search for "PayMongoPaymentModal" or "fixed inset-0 z-[999999]"
3. See if the modal is in the DOM but hidden

## Possible Issues

### Issue 1: AnimatePresence Not Working
**Symptom**: Modal is in DOM but not visible

**Fix**: Check if ` AnimatePresence` has proper exit animations

**UpgradePrompt render** (Line 372):
```tsx
<AnimatePresence>
  {isOpen && (
    <div className="fixed inset-0 z-[99999] overflow-auto">
      {/* ... UpgradePrompt content ... */}
    </div>
  )}
  
  {/* ⚠️ ISSUE: PayMongoPaymentModal is INSIDE AnimatePresence */}
  {/* but OUTSIDE the UpgradePrompt isOpen check! */}
  {selectedPlan && (
    <PayMongoPaymentModal ... />
  )}
</AnimatePresence>
```

**Problem**: The payment modal might be affected by the outer AnimatePresence.

**Solution**: Move PayMongoPaymentModal outside AnimatePresence or ensure it has its own AnimatePresence.

### Issue 2: State Not Updating
**Symptom**: Console shows logs but modal doesn't render

**Check**:
1. Is `paymentModalOpen` actually updating?
2. Is `selectedPlan` actually set?
3. Are there multiple renders interfering?

**Add to component**:
```typescript
// Debug state changes
useEffect(() => {
  console.log('📊 Payment Modal State Changed:', {
    paymentModalOpen,
    selectedPlan: selectedPlan?.name,
    timestamp: new Date().toISOString()
  });
}, [paymentModalOpen, selectedPlan]);
```

### Issue 3: Modal Rendering But Hidden
**Symptom**: Modal is in DOM but CSS is hiding it

**Check**:
1. CSS overflow issues
2. Z-index conflicts
3. Opacity/visibility issues

**Test**:
```javascript
// In browser console
document.querySelector('[class*="z-[999999]"]')?.style.display = 'block';
document.querySelector('[class*="z-[999999]"]')?.style.opacity = '1';
```

## Quick Fix to Test

### Option A: Simple Test Modal
Replace the PayMongoPaymentModal temporarily with a simple test:

```tsx
{selectedPlan && paymentModalOpen && (
  <div 
    className="fixed inset-0 z-[999999] bg-red-500/50 flex items-center justify-center"
    onClick={() => setPaymentModalOpen(false)}
  >
    <div className="bg-white p-8 rounded-lg">
      <h2>TEST MODAL - Payment for {selectedPlan.name}</h2>
      <p>Amount: {currency.symbol}{(selectedPlan.price * currency.rate).toFixed(2)}</p>
      <button 
        onClick={() => setPaymentModalOpen(false)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Close
      </button>
    </div>
  </div>
)}
```

**If this shows**: The issue is with PayMongoPaymentModal component
**If this doesn't show**: The issue is with state management

### Option B: Check PayMongoPaymentModal isOpen Handling

**File**: `src/shared/components/PayMongoPaymentModal.tsx`

**Check Line 693**:
```tsx
<AnimatePresence>
  {isOpen && (  // 👈 Check if this condition is working
    <div className="fixed inset-0 z-[999999] overflow-auto">
      {/* ... modal content ... */}
    </div>
  )}
</AnimatePresence>
```

**Add debug log**:
```tsx
{console.log('💳 PayMongoPaymentModal render:', { isOpen, booking })}
<AnimatePresence>
  {isOpen && (
    // ... modal content
  )}
</AnimatePresence>
```

## Expected Flow

1. **User clicks plan** → `handleUpgradeClick(plan)` called
2. **State updates** → `selectedPlan` set, `paymentModalOpen` set to true
3. **Re-render** → `{selectedPlan && ...}` condition becomes true
4. **PayMongoPaymentModal renders** with `isOpen={paymentModalOpen}`
5. **PayMongoPaymentModal shows** → `isOpen && (...)` renders modal div

## Test Checklist

- [ ] Console logs show `handleUpgradeClick` called
- [ ] Console logs show `paymentModalOpen` set to true
- [ ] Console logs show `selectedPlan` has data
- [ ] Console logs show PayMongoPaymentModal rendering
- [ ] React DevTools shows PayMongoPaymentModal in component tree
- [ ] React DevTools shows `isOpen={true}` prop
- [ ] DOM has element with `z-[999999]` class
- [ ] Modal is visible on screen

## Next Steps

1. ✅ Add console logs to both components
2. ✅ Test plan click
3. ✅ Check browser console
4. ✅ Check React DevTools
5. ✅ If still not working, try the simple test modal
6. ✅ Report findings for further debugging
