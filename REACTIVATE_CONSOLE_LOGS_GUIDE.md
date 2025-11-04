# 🔧 REACTIVATE CONSOLE LOGS - COMPLETE GUIDE

## 📋 Current Status
✅ Console logs ARE present in the code  
❌ Console logs NOT appearing in browser console  
🎯 **Issue**: Something is suppressing or overriding console.log globally

---

## 🔍 WHERE CONSOLE LOGS ARE LOCATED

### 1. **Booking API Service** (`src/services/api/optimizedBookingApiService.ts`)
```typescript
// Line 224
console.log('🚀 [BOOKING API] Starting booking request', {...});

// Line 254
console.log('✅ [BOOKING API] Skipping health check, proceeding with direct API call');

// Line 260
console.log('📡 [BOOKING API] Sending POST /api/bookings/request', {...});

// Line 280
console.log('✅ [BOOKING API] Response received:', {...});

// Line 299
console.error('❌ [OptimizedBooking] API call failed:', error);
```

### 2. **Booking Request Modal** (`src/modules/services/components/BookingRequestModal.tsx`)
```typescript
// Line 136
console.log('Notification permission:', permission);

// Line 349-358 (STYLED SUCCESS LOG)
console.log(
  '%c✅ BOOKING SUCCESS!',
  'background: linear-gradient(to right, #10b981, #059669); color: white; padding: 8px 16px; border-radius: 8px; font-size: 16px; font-weight: bold;',
  '\n📅 Service:', service.name,
  '\n📆 Date:', formData.eventDate,
  // ... more details
);

// Line 371
console.error('Booking submission failed:', error);
```

---

## 🚫 WHAT'S SUPPRESSING THE LOGS

### **Found Issues:**

#### 1. **Test Scripts Override console.log**
**Files:**
- `TEST_MODAL_BOOKING_CONSOLE.js` (Line 124)
- `emergency-bypass.js` (Lines 10-20)

Both contain:
```javascript
console.log = function(...args) {
  originalConsoleLog('[INTERCEPTED]', ...args);
};
```

❌ **DO NOT run these scripts in production!**

#### 2. **Environment Variables**
```bash
# .env.staging
VITE_DEBUG_MODE=true   # ✅ Should enable logs

# .env.production
# No VITE_DEBUG_MODE flag found
```

#### 3. **Vite Build Config**
`vite.config.ts` - Console dropping is **COMMENTED OUT** ✅
```typescript
// drop: ['console', 'debugger'],  // DISABLED for debugging
```

---

## ✅ SOLUTION: HOW TO REACTIVATE CONSOLE LOGS

### **Method 1: Check Browser Console Filters** (QUICKEST)
1. Open DevTools (F12)
2. Go to **Console** tab
3. Check filter settings (top-right of console)
4. **IMPORTANT**: Look for filter dropdowns
   - Ensure "All levels" is selected (not "Errors only")
   - Clear any text filters in search box
   - Check "Preserve log" is UNCHECKED (it can cause confusion)

### **Method 2: Clear Console Overrides** (RECOMMENDED)
Run this in your browser console **BEFORE** testing:
```javascript
// Restore original console methods
delete console.log;
delete console.error;
delete console.warn;
delete console.info;
delete console.debug;

// Or completely reset
console = window.console.__proto__;

console.log('✅ Console restored!');
```

### **Method 3: Add Environment Variable for Production**
**File**: `.env.production`
```bash
# Add this line
VITE_DEBUG_MODE=true
```

Then rebuild:
```powershell
npm run build
firebase deploy
```

### **Method 4: Force Enable Logs in Code** (TEMPORARY)
**File**: `src/services/api/optimizedBookingApiService.ts`

Add at the **TOP** of the file:
```typescript
// 🔧 FORCE ENABLE CONSOLE LOGS - REMOVE AFTER DEBUGGING
const forceLog = (...args: any[]) => {
  const originalLog = Object.getPrototypeOf(console).log;
  originalLog.apply(console, args);
};

// Then replace console.log with forceLog
forceLog('🚀 [BOOKING API] Starting booking request', {...});
```

### **Method 5: Use Debugger Statements** (GUARANTEED TO WORK)
Add `debugger;` statements before key console.logs:

**File**: `src/services/api/optimizedBookingApiService.ts` (Line 223)
```typescript
debugger; // ⚠️ Execution will PAUSE here when DevTools is open
console.log('🚀 [BOOKING API] Starting booking request', {...});
```

**File**: `src/modules/services/components/BookingRequestModal.tsx` (Line 348)
```typescript
debugger; // ⚠️ Execution will PAUSE here
console.log('%c✅ BOOKING SUCCESS!', ...);
```

---

## 🧪 QUICK TEST TO VERIFY CONSOLE WORKS

### **Test 1: Basic Console Check**
Open browser console and run:
```javascript
console.log('Test 1: Basic log works');
console.warn('Test 2: Warning works');
console.error('Test 3: Error works');
console.info('Test 4: Info works');
console.debug('Test 5: Debug works');
```

**Expected Output**: All 5 messages should appear ✅

---

### **Test 2: Check for Console Override**
```javascript
// Check if console.log has been modified
console.log.toString();
```

**Expected Output**:
```
"function log() { [native code] }"  // ✅ GOOD - Native console
```

**Bad Output**:
```
"function (...args) { ... }"        // ❌ BAD - Custom override detected
```

---

### **Test 3: Restore Console (If Override Detected)**
```javascript
// Save reference to original console
const originalConsole = window.console;

// Delete any overrides
delete console.log;
delete console.warn;
delete console.error;

// Restore from prototype
console = Object.getPrototypeOf(originalConsole);

// Test
console.log('✅ Console fully restored!');
```

---

## 🔄 FULL RESET PROCEDURE

### **Step 1: Clear Browser Cache**
```
1. Open DevTools (F12)
2. Right-click on Reload button
3. Select "Empty Cache and Hard Reload"
```

### **Step 2: Restore Console**
Run in browser console:
```javascript
// Full reset
window.console = Object.getPrototypeOf(window.console);
console.log('✅ Reset complete');
```

### **Step 3: Restart Development Server**
```powershell
# Stop current server (Ctrl+C)
npm run dev
```

### **Step 4: Test Booking Flow**
1. Go to Services page
2. Click "Request Booking" on any service
3. Fill out the booking form
4. Submit booking
5. **Watch DevTools Console tab**

**Expected Console Output:**
```
🚀 [BOOKING API] Starting booking request {...}
✅ [BOOKING API] Skipping health check, proceeding with direct API call
📡 [BOOKING API] Sending POST /api/bookings/request {...}
✅ [BOOKING API] Response received: {...}
✅ BOOKING SUCCESS! (styled in green gradient)
  📅 Service: [service name]
  📆 Date: [date]
  ...
```

---

## 🚨 COMMON ISSUES & FIXES

### Issue 1: "Console is empty"
**Fix**: Check console filter level (All levels vs Errors only)

### Issue 2: "Only errors show, no logs"
**Fix**: Run console restore script above

### Issue 3: "Logs appear in Network tab but not Console"
**Fix**: The API is working, but console is being suppressed. Use Method 2 above.

### Issue 4: "After page reload, logs disappear again"
**Fix**: Browser extension might be interfering. Test in Incognito mode.

---

## 📱 ALTERNATIVE: USE NETWORK TAB

If console logs still won't appear, use Network tab as workaround:

### **How to Monitor Booking API via Network Tab:**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click **Clear** (🚫 icon)
4. Submit a booking
5. Look for **POST** request to `/api/bookings/request`
6. Click on it to see:
   - **Headers** tab: Request headers and payload
   - **Response** tab: Server response
   - **Preview** tab: Formatted JSON

---

## 🎯 RECOMMENDED WORKFLOW FOR DEBUGGING

### **Setup (Once)**
```javascript
// Run in console ONCE per session
delete console.log;
console = Object.getPrototypeOf(console);
console.log('✅ Console enabled');
```

### **Testing (Every Time)**
1. Open DevTools **BEFORE** clicking booking button
2. Go to **Console** tab
3. Clear console (🚫 icon)
4. Submit booking
5. Watch for logs in real-time

### **If Logs Still Don't Appear:**
1. Check **Network** tab for API request
2. Add `debugger;` statements in code
3. Use `alert()` as last resort:
   ```typescript
   alert('Booking submitted!');
   ```

---

## ✅ SUCCESS CRITERIA

After following this guide, you should see:
- ✅ Console logs appear in DevTools Console tab
- ✅ Styled success message with green gradient
- ✅ Detailed booking information logged
- ✅ API request/response logs visible

---

## 📝 NOTES

- **Test scripts** (`TEST_MODAL_BOOKING_CONSOLE.js`, `emergency-bypass.js`) are **DEV TOOLS ONLY**
- Never include them in production builds
- They were created for debugging but can interfere with normal logging
- If you see `[INTERCEPTED]` in console output, those scripts are active

---

## 🆘 STILL NOT WORKING?

**Last Resort Debugging:**

### Option 1: Use Alerts
```typescript
// src/modules/services/components/BookingRequestModal.tsx (Line 349)
alert('✅ BOOKING SUCCESS!\nBooking ID: ' + successData.id);
```

### Option 2: Write to DOM
```typescript
// Add to page body
document.body.insertAdjacentHTML('beforeend', 
  `<div style="position:fixed; top:10px; right:10px; background:green; color:white; padding:20px; z-index:9999">
    ✅ BOOKING SUCCESS! ID: ${successData.id}
  </div>`
);
```

### Option 3: Check Backend Logs
Go to Render dashboard and check server logs for:
```
📧 [EMAIL DEBUG] Looking up vendor email for vendor_id: ...
✅ [EMAIL] Vendor email found: ...
📧 [EMAIL] Sending notification email...
✅ [EMAIL] Email sent successfully!
```

---

## 📚 RELATED FILES

- `src/services/api/optimizedBookingApiService.ts` - Main booking API
- `src/modules/services/components/BookingRequestModal.tsx` - Booking form UI
- `.env.staging` - Staging environment (has VITE_DEBUG_MODE=true)
- `.env.production` - Production environment (add VITE_DEBUG_MODE=true)
- `vite.config.ts` - Build config (console dropping disabled)

---

**Last Updated**: December 2024  
**Status**: Console logs present in code, need to troubleshoot browser/environment suppression
