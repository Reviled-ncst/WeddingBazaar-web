# 🐛 DEBUG: Itemization Not Showing - Troubleshooting Guide

**Issue**: PackageBuilder not appearing when "Itemized Pricing" is selected  
**Status**: 🔍 **INVESTIGATING** with debug logging deployed

---

## 🧪 Test the Debug Version Now

### Step 1: Clear Browser Cache (IMPORTANT!)
```javascript
// Open console (F12) and run:
localStorage.clear();
sessionStorage.clear();
location.reload(true); // Hard refresh
```

**OR** press: `Ctrl + Shift + Delete` → Clear cache → Reload

---

### Step 2: Open Add Service Form

1. Visit: https://weddingbazaarph.web.app/vendor/services
2. Click "Add Service" (use bypass if needed)
3. Fill Step 1 (Basic Info):
   - Title: "Test Service"
   - Category: "Photography"  
   - Description: "Test"
4. Click "Next" → Go to Step 2

---

### Step 3: Check Debug Info

You should now see:

```
┌─────────────────────────────────────────────┐
│  Pricing & Availability                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  [Simple] [Itemized] [Custom Quote]         │ ← PricingModeSelector
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  🐛 DEBUG: Current pricingMode = "simple"   │ ← NEW DEBUG BOX
└─────────────────────────────────────────────┘

... (then price range cards OR PackageBuilder)
```

---

### Step 4: Click "Itemized Pricing"

**Watch for**:
1. **Console log**: `🎯 [AddServiceForm] Pricing mode changed to: itemized`
2. **Debug box**: Should change to `pricingMode = "itemized"`
3. **UI change**: Price range cards should disappear, PackageBuilder should appear

---

### Step 5: Report Results

**If it works** ✅:
- Debug box shows: `pricingMode = "itemized"`
- PackageBuilder UI appears (purple/pink section with "📦 Package Builder" title)

**If it doesn't work** ❌:
- Screenshot the debug box value
- Check console for errors
- Check if onClick is firing (console log)

---

## 🔍 What to Look For

### Scenario A: Debug box changes, but UI doesn't update
**Symptom**: Debug box shows `"itemized"`, but still seeing price range cards  
**Cause**: Conditional rendering logic issue  
**Fix**: Need to check the `{pricingMode === 'itemized' ? ...}` logic

### Scenario B: Debug box doesn't change at all
**Symptom**: Debug box stays `"simple"`, no console log appears  
**Cause**: `onChange` callback not firing  
**Fix**: Need to check PricingModeSelector onClick handler

### Scenario C: Console shows error
**Symptom**: Red error in console when clicking  
**Cause**: JavaScript runtime error  
**Fix**: Need to fix the error

---

## 📸 What You Should See (Expected Behavior)

### Initial State (pricingMode = "simple"):
```
┌──────────────────────────────────────────┐
│  🐛 DEBUG: pricingMode = "simple"        │
└──────────────────────────────────────────┘

[5 price range cards: Budget, Mid-Range, Premium, Luxury, Ultra-Luxury]
```

### After Clicking "Itemized Pricing":
```
┌──────────────────────────────────────────┐
│  🐛 DEBUG: pricingMode = "itemized"      │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│       📦 Package Builder                  │
│  Create itemized packages for your service│
├──────────────────────────────────────────┤
│  [🎨 Load Template]  [+ Add Package]     │
│                                           │
│  (Empty state or template packages)       │
└──────────────────────────────────────────┘
```

---

##  Quick Diagnostic Commands

Open console (F12) and run these:

### Check Current Pricing Mode:
```javascript
// This won't work directly, but look for React DevTools
// OR check the debug box on screen
```

### Force Pricing Mode Change:
```javascript
// If you have React DevTools installed:
// 1. Find AddServiceForm component
// 2. Find pricingMode in state
// 3. Manually set to 'itemized'
```

### Check if PackageBuilder is Imported:
```javascript
// Check network tab for:
// vendor-pages-*.js bundle should include PackageBuilder code
```

---

## 🚨 Common Issues & Fixes

### Issue 1: Old Version Cached
**Symptom**: Changes not appearing at all  
**Fix**: 
```javascript
// Hard refresh
Ctrl + F5 (Windows)
Cmd + Shift + R (Mac)

// OR clear everything:
localStorage.clear();
sessionStorage.clear();
caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
location.reload(true);
```

### Issue 2: State Not Updating
**Symptom**: Debug box doesn't change, console log doesn't appear  
**Fix**: Check if onClick is prevented by something (subscription modal?)

### Issue 3: PackageBuilder Import Error
**Symptom**: Console error: "PackageBuilder is not defined"  
**Fix**: Check imports in AddServiceForm.tsx

---

## 📝 Report Back With:

1. **Debug box value** after clicking "Itemized Pricing"
2. **Console logs** (any errors or our debug log)
3. **Screenshot** of what you see
4. **Network tab** - check if new JS files loaded

---

**Deployed**: November 7, 2025 with debug logging  
**Test URL**: https://weddingbazaarph.web.app/vendor/services  
**Status**: 🔍 Waiting for test results
