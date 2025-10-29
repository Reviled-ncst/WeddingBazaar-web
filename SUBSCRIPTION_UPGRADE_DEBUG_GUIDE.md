# 🔍 Subscription Upgrade Payment Modal Debug Guide

**Date:** October 29, 2025  
**Status:** ✅ Enhanced Logging Deployed & LIVE IN PRODUCTION  
**URL:** https://weddingbazaarph.web.app  
**Last Deployment:** Just now (October 28, 2025)

---

## 🎯 Issue

When clicking "Upgrade to [Plan]" button, the payment modal doesn't appear - just shows loading state.

---

## 🔧 Logging Added

### **1. Upgrade Button Click Logging**

When you click any "Upgrade to..." button, you'll see:

```javascript
🔥 [UpgradePrompt] handleUpgradeClick called
   {
     planName: "Premium",
     planPrice: 5,
     isProcessing: false
   }
```

**For Free Plans:**
```javascript
💰 [UpgradePrompt] Free plan selected, calling handleFreeUpgrade
```

**For Paid Plans:**
```javascript
💳 [UpgradePrompt] Paid plan selected
   {
     originalPrice: 5,
     convertedAmount: 5,
     currency: "PHP"
   }
📝 [UpgradePrompt] Setting selectedPlan and paymentModalOpen to true
📝 [UpgradePrompt] Selected Plan Details:
   {
     id: "premium",
     name: "Premium",
     price: 5,
     displayPrice: "₱5.00"
   }
✅ [UpgradePrompt] setSelectedPlan called
✅ [UpgradePrompt] setPaymentModalOpen(true) called
📊 [UpgradePrompt] State after setters (may not be updated yet):
   {
     paymentModalOpen: "should be true on next render",
     selectedPlan: "should be set on next render"
   }
```

---

### **2. State Change Monitoring**

After clicking upgrade, you should see:

```javascript
🔄 [UpgradePrompt] Payment Modal State Changed:
   {
     paymentModalOpen: true,
     hasSelectedPlan: true,
     selectedPlanName: "Premium",
     selectedPlanPrice: 5
   }
```

---

### **3. Render Condition Check**

Every render, the component logs whether the modal WILL or WON'T render:

**✅ When It SHOULD Render:**
```javascript
🔍 [UpgradePrompt] Payment Modal Render Check:
   {
     hasSelectedPlan: true,
     selectedPlanName: "Premium",
     selectedPlanPrice: 5,
     paymentModalOpen: true,
     willRender: true,
     timestamp: "2025-10-29T..."
   }
✅ [UpgradePrompt] WILL RENDER PayMongoPaymentModal
```

**❌ When It WON'T Render:**
```javascript
🔍 [UpgradePrompt] Payment Modal Render Check:
   {
     hasSelectedPlan: false,
     selectedPlanName: undefined,
     selectedPlanPrice: undefined,
     paymentModalOpen: false,
     willRender: false,
     timestamp: "2025-10-29T..."
   }
❌ [UpgradePrompt] WILL NOT RENDER PayMongoPaymentModal because:
   {
     reason: "No selected plan"  // or "paymentModalOpen is false"
   }
```

---

### **4. Modal Open/Close Tracking**

When the UpgradePrompt opens:
```javascript
🔄 [UpgradePrompt] isOpen prop changed:
   {
     isOpen: true,
     timestamp: "2025-10-29T..."
   }
```

When PayMongoPaymentModal closes:
```javascript
🚪 [PayMongoPaymentModal] onClose called
```

---

## 🧪 How to Debug

### **Step 1: Open Browser Console**
1. Visit https://weddingbazaarph.web.app
2. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Go to "Console" tab

### **Step 2: Trigger the Upgrade**
1. Log in as a vendor
2. Try to create more than 5 services (or trigger upgrade prompt)
3. Click "Upgrade to Premium" button

### **Step 3: Watch the Console Logs**

**Expected Flow (Working):**
```
1. 🔥 handleUpgradeClick called
2. 💳 Paid plan selected
3. 📝 Setting selectedPlan and paymentModalOpen
4. ✅ setSelectedPlan called
5. ✅ setPaymentModalOpen(true) called
6. 🔄 Payment Modal State Changed (paymentModalOpen: true)
7. 🔍 Payment Modal Render Check (willRender: true)
8. ✅ WILL RENDER PayMongoPaymentModal
   → Payment modal appears on screen
```

**Broken Flow (Not Working):**
```
1. 🔥 handleUpgradeClick called
2. 💳 Paid plan selected
3. 📝 Setting selectedPlan and paymentModalOpen
4. ✅ setSelectedPlan called
5. ✅ setPaymentModalOpen(true) called
6. ❌ NO state change log appears
   OR
7. 🔍 Payment Modal Render Check (willRender: false)
8. ❌ WILL NOT RENDER because: "paymentModalOpen is false"
   → Payment modal does NOT appear
```

---

## 🔍 What to Look For

### **Problem 1: State Not Updating**
If you see:
```javascript
✅ setPaymentModalOpen(true) called
❌ WILL NOT RENDER because: "paymentModalOpen is false"
```

**Diagnosis:** React state update isn't happening  
**Possible Causes:**
- Component is unmounting/remounting
- State is being reset somewhere else
- Parent component is overriding the state

---

### **Problem 2: Modal Condition Never True**
If `willRender: false` never changes to `willRender: true`:

**Check:**
1. Is `selectedPlan` being set? Look for:
   ```
   hasSelectedPlan: true
   selectedPlanName: "Premium"
   ```

2. Is `paymentModalOpen` true? Look for:
   ```
   paymentModalOpen: true
   ```

---

### **Problem 3: No Logs At All**
If clicking "Upgrade" shows NO logs:

**Possible Causes:**
- Button `onClick` handler not firing
- `isProcessing` is stuck at `true`
- Event is being stopped/prevented somewhere

**Check for:**
```javascript
⚠️ [UpgradePrompt] Already processing, ignoring click
```

---

## 📋 Common Issues & Fixes

### **Issue 1: "Already processing" Warning**
```javascript
🔥 handleUpgradeClick called { isProcessing: true }
⚠️ Already processing, ignoring click
```

**Fix:** The button is disabled because a previous click hasn't finished  
**Solution:** Wait 1 second and try again, or refresh the page

---

### **Issue 2: Modal Opens Then Closes Immediately**
```javascript
✅ WILL RENDER PayMongoPaymentModal
🚪 [PayMongoPaymentModal] onClose called
❌ WILL NOT RENDER (closed immediately)
```

**Diagnosis:** Something is calling `onClose()` right after opening  
**Possible Causes:**
- Parent component re-rendering and resetting state
- Backdrop click handler firing
- ESC key handler

---

### **Issue 3: State Updates But Modal Doesn't Render**
```javascript
🔄 Payment Modal State Changed: { paymentModalOpen: true }
🔍 Render Check: { willRender: true }
✅ WILL RENDER PayMongoPaymentModal
(But modal still doesn't appear on screen)
```

**Diagnosis:** Modal is rendering but not visible  
**Possible Causes:**
- CSS z-index issue (modal is behind other elements)
- `createPortal` target is wrong
- Modal has `display: none` or `opacity: 0`

**Check:**
- Open DevTools → Elements
- Search for `PayMongoPaymentModal`
- Check if it exists in the DOM

---

## 🛠️ Additional Debug Commands

### **Check if PayMongoPaymentModal Exists**
In browser console:
```javascript
document.querySelector('[class*="PayMongo"]')
```

**Expected:** Should return `null` when closed, an element when open

---

### **Check Portal Root**
```javascript
document.body.children
```

**Expected:** Should see a modal element when open

---

### **Force State Check**
If you suspect state isn't updating:
```javascript
// In React DevTools:
// 1. Find UpgradePrompt component
// 2. Look at hooks
// 3. Check paymentModalOpen value
// 4. Check selectedPlan value
```

---

## ✅ Success Indicators

When everything works correctly, you'll see this sequence:

```javascript
1. 🔥 [UpgradePrompt] handleUpgradeClick called
2. 💳 [UpgradePrompt] Paid plan selected
3. 📝 [UpgradePrompt] Setting selectedPlan and paymentModalOpen to true
4. ✅ [UpgradePrompt] setSelectedPlan called
5. ✅ [UpgradePrompt] setPaymentModalOpen(true) called
6. 🔄 [UpgradePrompt] Payment Modal State Changed: {
     paymentModalOpen: true,
     hasSelectedPlan: true,
     selectedPlanName: "Premium",
     selectedPlanPrice: 5
   }
7. 🔍 [UpgradePrompt] Payment Modal Render Check: {
     willRender: true
   }
8. ✅ [UpgradePrompt] WILL RENDER PayMongoPaymentModal
```

**Then:** PayMongo payment modal appears on screen ✨

---

## 📞 Next Steps

1. **Test the upgrade flow** at https://weddingbazaarph.web.app
2. **Copy the console logs** exactly as they appear
3. **Share the logs** to identify where the flow breaks
4. **Screenshot the browser** if modal doesn't appear but logs show it should

---

## 🎯 Key Files

- **UpgradePrompt.tsx**: Main component with logging
- **SubscriptionContext.tsx**: State management
- **PayMongoPaymentModal.tsx**: The actual payment modal

---

**Last Updated:** October 29, 2025  
**Deployed:** Firebase Hosting  
**Status:** ✅ Comprehensive Logging Active
