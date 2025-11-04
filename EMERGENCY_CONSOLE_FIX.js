/**
 * 🚨 EMERGENCY CONSOLE FIX - COPY THIS ENTIRE FILE INTO BROWSER CONSOLE
 * 
 * This will:
 * 1. Test if console works at all
 * 2. Remove any overrides
 * 3. Show you exactly what's blocking logs
 */

console.clear();

// ========================================
// STEP 1: TEST BASIC CONSOLE
// ========================================
try {
  console.log('🧪 TEST 1: Can you see this message?');
  console.warn('🧪 TEST 2: Can you see this warning?');
  console.error('🧪 TEST 3: Can you see this error?');
} catch (e) {
  alert('❌ Console is completely broken: ' + e.message);
}

// ========================================
// STEP 2: CHECK FOR OVERRIDES
// ========================================
const logString = console.log.toString();
const isNative = logString.includes('[native code]');

if (!isNative) {
  console.warn('⚠️ FOUND PROBLEM: console.log is overridden!');
  console.warn('Current console.log code:', logString.substring(0, 200));
  
  // Try to restore
  try {
    delete console.log;
    delete console.warn;
    delete console.error;
    delete console.info;
    
    console = Object.getPrototypeOf(console);
    
    console.log('✅ Console restored from prototype!');
  } catch (e) {
    console.error('❌ Failed to restore console:', e.message);
  }
}

// ========================================
// STEP 3: CHECK FILTER SETTINGS
// ========================================
console.log('%c📋 CHECKLIST: Can you see ALL of these?', 'font-size: 16px; font-weight: bold; color: blue;');
console.log('1️⃣ Regular log message');
console.info('2️⃣ Info message');
console.warn('3️⃣ Warning message');
console.error('4️⃣ Error message');
console.debug('5️⃣ Debug message');

console.log('%c❓ If you can\'t see ALL 5 messages above, your console filter is set to "Errors only"', 
  'background: yellow; color: black; padding: 8px; font-weight: bold;');

// ========================================
// STEP 4: INJECT BOOKING LOG INTERCEPTOR
// ========================================
console.log('%c🔧 Setting up booking log interceptor...', 'color: green; font-weight: bold;');

// Save original fetch
const originalFetch = window.fetch;

// Override fetch to log booking API calls
window.fetch = function(...args) {
  const [url, options] = args;
  
  // Log ALL fetch calls for debugging
  console.log('%c🌐 FETCH DETECTED', 'background: blue; color: white; padding: 4px 8px; font-weight: bold;');
  console.log('  URL:', url);
  console.log('  Method:', options?.method || 'GET');
  
  if (url.includes('/api/bookings') || url.includes('bookings')) {
    console.log('%c🎯 BOOKING API CALL!', 'background: red; color: white; padding: 8px 16px; font-size: 14px; font-weight: bold;');
    console.log('  Full URL:', url);
    console.log('  Method:', options?.method);
    if (options?.body) {
      try {
        console.log('  Payload:', JSON.parse(options.body));
      } catch {
        console.log('  Payload:', options.body);
      }
    }
  }
  
  // Call original fetch
  return originalFetch.apply(this, args).then(response => {
    if (url.includes('/api/bookings') || url.includes('bookings')) {
      console.log('%c✅ BOOKING RESPONSE', 'background: green; color: white; padding: 8px 16px; font-size: 14px; font-weight: bold;');
      console.log('  Status:', response.status);
      console.log('  OK:', response.ok);
      
      // Clone response to read it
      response.clone().json().then(data => {
        console.log('  Data:', data);
      }).catch(() => {
        console.log('  (Response is not JSON)');
      });
    }
    return response;
  });
};

console.log('✅ Fetch interceptor active!');

// ========================================
// STEP 5: FORCE ENABLE ALL LOGS
// ========================================
console.log('%c🔓 Creating force logging functions...', 'color: purple; font-weight: bold;');

// Create force log that ALWAYS works
window.FORCE_LOG = function(...args) {
  const timestamp = new Date().toLocaleTimeString();
  const nativeLog = Object.getPrototypeOf(console).log;
  
  // Also show in DOM as backup
  const div = document.createElement('div');
  div.style.cssText = 'position: fixed; top: 10px; right: 10px; background: green; color: white; padding: 10px; z-index: 99999; font-size: 12px; max-width: 400px; border-radius: 8px;';
  div.textContent = `[${timestamp}] ${args.join(' ')}`;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 5000);
  
  nativeLog.apply(console, [`[${timestamp}] FORCE:`, ...args]);
};

window.FORCE_LOG('✅ Force logging enabled! Use window.FORCE_LOG("message") to log');

// ========================================
// STEP 6: TEST EVERYTHING
// ========================================
console.log('%c🎉 SETUP COMPLETE!', 'background: linear-gradient(to right, #10b981, #059669); color: white; padding: 12px 20px; border-radius: 8px; font-size: 18px; font-weight: bold;');

console.log('%c📊 SUMMARY:', 'font-size: 14px; font-weight: bold;');
console.log('  ✅ Console tested');
console.log('  ✅ Overrides removed (if any)');
console.log('  ✅ Fetch interceptor active');
console.log('  ✅ Force logging available');

console.log('%c🎯 NEXT STEPS:', 'font-size: 14px; font-weight: bold; color: blue;');
console.log('  1. Check if you saw ALL test messages above');
console.log('  2. If not, your console filter is wrong');
console.log('  3. Click the filter dropdown (top-right of console)');
console.log('  4. Select "All levels" (not "Errors only")');
console.log('  5. Then submit a booking request');
console.log('  6. Watch for 🎯 BOOKING API CALL! message');

console.log('%c⚠️ IMPORTANT: If you still see nothing, take a screenshot and share it!', 
  'background: red; color: white; padding: 8px; font-weight: bold; font-size: 12px;');

// Final test with styled output
console.log(
  '%c✨ FINAL TEST',
  'background: linear-gradient(to right, #f59e0b, #ef4444); color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold;',
  '\nIf you can see this STYLED message with colors, your console is working! 🎉'
);

// Alert as backup
alert('🔧 Console fix script loaded!\n\nCheck the console now for test messages.\n\nIf console is still empty:\n1. Check console filter (top-right)\n2. Select "All levels"\n3. Clear search box\n4. Try again');
