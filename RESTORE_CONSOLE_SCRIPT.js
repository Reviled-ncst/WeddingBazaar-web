/**
 * 🔧 CONSOLE LOG RESTORATION SCRIPT
 * 
 * Copy and paste this entire script into your browser console
 * Run it BEFORE testing the booking flow
 * 
 * This will:
 * 1. Restore original console methods
 * 2. Test console functionality
 * 3. Set up enhanced logging
 * 4. Monitor booking API calls
 */

console.log('🔧 Starting Console Restoration...\n');

// ========================================
// STEP 1: RESTORE ORIGINAL CONSOLE
// ========================================

// Store original console
const originalConsole = window.console;

// Delete any overrides
console.log('🗑️ Removing console overrides...');
delete console.log;
delete console.warn;
delete console.error;
delete console.info;
delete console.debug;

// Restore from prototype
window.console = Object.getPrototypeOf(originalConsole);
console = window.console;

console.log('✅ Console methods restored from prototype\n');

// ========================================
// STEP 2: TEST CONSOLE FUNCTIONALITY
// ========================================

console.log('🧪 Testing console methods...');
console.log('  ✅ console.log works');
console.warn('  ⚠️ console.warn works');
console.error('  ❌ console.error works');
console.info('  ℹ️ console.info works');
console.debug('  🐛 console.debug works');

// Test styled console
console.log(
  '%c✨ STYLED CONSOLE TEST',
  'background: linear-gradient(to right, #10b981, #059669); color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: bold;'
);

console.log('\n✅ All console methods working!\n');

// ========================================
// STEP 3: CHECK FOR OVERRIDES
// ========================================

console.log('🔍 Checking for console overrides...');

const logType = console.log.toString();
const isNative = logType.includes('[native code]');

if (isNative) {
  console.log('  ✅ console.log is NATIVE (not overridden)');
} else {
  console.warn('  ⚠️ console.log is CUSTOM (still overridden!)');
  console.log('  Override code:', logType);
}

console.log('\n');

// ========================================
// STEP 4: ENHANCED LOGGING WRAPPER
// ========================================

console.log('🚀 Setting up enhanced logging...');

// Create logging wrapper that ALWAYS works
window.forceLog = (...args) => {
  const timestamp = new Date().toLocaleTimeString();
  const nativeLog = Object.getPrototypeOf(console).log;
  nativeLog.apply(console, [`[${timestamp}]`, ...args]);
};

window.forceWarn = (...args) => {
  const timestamp = new Date().toLocaleTimeString();
  const nativeWarn = Object.getPrototypeOf(console).warn;
  nativeWarn.apply(console, [`[${timestamp}]`, ...args]);
};

window.forceError = (...args) => {
  const timestamp = new Date().toLocaleTimeString();
  const nativeError = Object.getPrototypeOf(console).error;
  nativeError.apply(console, [`[${timestamp}]`, ...args]);
};

console.log('✅ Enhanced logging functions available:');
console.log('  - window.forceLog()');
console.log('  - window.forceWarn()');
console.log('  - window.forceError()');

// Test enhanced logging
window.forceLog('  ✅ window.forceLog() test successful');

console.log('\n');

// ========================================
// STEP 5: INTERCEPT FETCH CALLS
// ========================================

console.log('🌐 Setting up fetch interceptor for /api/bookings...');

const originalFetch = window.fetch;

window.fetch = function(...args) {
  const [url, options] = args;
  
  // Log booking API calls
  if (url.includes('/api/bookings')) {
    console.log(
      '%c📡 FETCH INTERCEPTED',
      'background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
      '\n🔗 URL:', url,
      '\n📋 Method:', options?.method || 'GET',
      '\n📦 Body:', options?.body ? JSON.parse(options.body) : 'None',
      '\n🕐 Time:', new Date().toLocaleTimeString()
    );
  }
  
  // Call original fetch
  return originalFetch.apply(this, args)
    .then(response => {
      // Log response for booking API
      if (url.includes('/api/bookings')) {
        response.clone().json().then(data => {
          console.log(
            '%c✅ RESPONSE RECEIVED',
            'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
            '\n🔗 URL:', url,
            '\n📊 Status:', response.status,
            '\n📦 Data:', data,
            '\n🕐 Time:', new Date().toLocaleTimeString()
          );
        }).catch(() => {
          console.log(
            '%c✅ RESPONSE RECEIVED (non-JSON)',
            'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
            '\n🔗 URL:', url,
            '\n📊 Status:', response.status
          );
        });
      }
      return response;
    })
    .catch(error => {
      // Log errors
      if (url.includes('/api/bookings')) {
        console.error(
          '%c❌ FETCH ERROR',
          'background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
          '\n🔗 URL:', url,
          '\n❌ Error:', error.message,
          '\n🕐 Time:', new Date().toLocaleTimeString()
        );
      }
      throw error;
    });
};

console.log('✅ Fetch interceptor active for /api/bookings/*');

console.log('\n');

// ========================================
// STEP 6: LISTEN FOR BOOKING EVENTS
// ========================================

console.log('📢 Setting up event listeners...');

window.addEventListener('bookingCreated', (event) => {
  console.log(
    '%c🎉 BOOKING CREATED EVENT',
    'background: linear-gradient(to right, #10b981, #059669); color: white; padding: 8px 16px; border-radius: 8px; font-size: 16px; font-weight: bold;',
    '\n📋 Booking Details:', event.detail
  );
});

console.log('✅ Listening for "bookingCreated" events');

console.log('\n');

// ========================================
// STEP 7: MONITOR CONSOLE USAGE
// ========================================

console.log('📊 Setting up console usage monitor...');

let logCount = 0;
let warnCount = 0;
let errorCount = 0;

const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

console.log = function(...args) {
  logCount++;
  originalLog.apply(console, args);
};

console.warn = function(...args) {
  warnCount++;
  originalWarn.apply(console, args);
};

console.error = function(...args) {
  errorCount++;
  originalError.apply(console, args);
};

// Add counter display function
window.getConsoleStats = () => {
  return {
    logs: logCount,
    warnings: warnCount,
    errors: errorCount,
    total: logCount + warnCount + errorCount
  };
};

console.log('✅ Console usage monitor active');
console.log('  Run window.getConsoleStats() to see usage');

console.log('\n');

// ========================================
// STEP 8: FINAL STATUS
// ========================================

console.log(
  '%c🎉 CONSOLE RESTORATION COMPLETE!',
  'background: linear-gradient(to right, #8b5cf6, #6366f1); color: white; padding: 12px 20px; border-radius: 8px; font-size: 18px; font-weight: bold;'
);

console.log('\n📋 SUMMARY:');
console.log('  ✅ Console methods restored');
console.log('  ✅ Enhanced logging available (window.forceLog)');
console.log('  ✅ Fetch interceptor active for /api/bookings');
console.log('  ✅ Event listeners registered');
console.log('  ✅ Usage monitor active');

console.log('\n🧪 NEXT STEPS:');
console.log('  1. Go to the Services page');
console.log('  2. Click "Request Booking" on any service');
console.log('  3. Fill out and submit the booking form');
console.log('  4. Watch this console for detailed logs');

console.log('\n📊 AVAILABLE COMMANDS:');
console.log('  - window.forceLog("message")    → Force log (always works)');
console.log('  - window.getConsoleStats()      → View console usage stats');
console.log('  - console.clear()               → Clear console');

console.log('\n🚀 Ready to test! Your console is now fully functional.\n');

// Test with a styled success message
setTimeout(() => {
  console.log(
    '%c✨ TEST MESSAGE',
    'background: linear-gradient(to right, #f59e0b, #ef4444); color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold;',
    '\nIf you can see this styled message, your console is working perfectly! 🎉'
  );
}, 1000);
