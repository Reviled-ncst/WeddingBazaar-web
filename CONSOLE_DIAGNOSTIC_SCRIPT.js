/**
 * 🔍 CONSOLE DIAGNOSTIC SCRIPT
 * 
 * Run this to diagnose WHY console logs aren't appearing
 * Copy and paste into browser console
 */

console.clear();
console.log('🔍 Starting Console Diagnostics...\n');

// ========================================
// 1. CHECK CONSOLE OBJECT
// ========================================
console.log('1️⃣ CONSOLE OBJECT CHECK:');

console.log('  console object type:', typeof console);
console.log('  console.log type:', typeof console.log);
console.log('  console is frozen:', Object.isFrozen(console));
console.log('  console is sealed:', Object.isSealed(console));

// ========================================
// 2. CHECK FOR OVERRIDES
// ========================================
console.log('\n2️⃣ CONSOLE OVERRIDE CHECK:');

const methods = ['log', 'warn', 'error', 'info', 'debug'];
const overrideDetection = {};

methods.forEach(method => {
  const methodString = console[method].toString();
  const isNative = methodString.includes('[native code]');
  const isCustom = !isNative;
  
  overrideDetection[method] = {
    isNative,
    isCustom,
    signature: isCustom ? methodString.substring(0, 100) + '...' : '[native code]'
  };
  
  console.log(`  console.${method}:`, isNative ? '✅ Native' : '❌ Custom');
  if (isCustom) {
    console.log(`    → Code: ${methodString.substring(0, 80)}...`);
  }
});

// ========================================
// 3. CHECK PROTOTYPE CHAIN
// ========================================
console.log('\n3️⃣ PROTOTYPE CHAIN CHECK:');

const proto = Object.getPrototypeOf(console);
console.log('  console prototype:', proto);
console.log('  prototype has log:', 'log' in proto);
console.log('  prototype.log type:', typeof proto.log);

if (proto.log) {
  const protoLogString = proto.log.toString();
  console.log('  prototype.log is native:', protoLogString.includes('[native code]'));
}

// ========================================
// 4. CHECK GLOBAL SCOPE
// ========================================
console.log('\n4️⃣ GLOBAL SCOPE CHECK:');

console.log('  window.console exists:', typeof window.console !== 'undefined');
console.log('  window.console === console:', window.console === console);
console.log('  globalThis.console exists:', typeof globalThis.console !== 'undefined');

// Check for backup console
if (window._originalConsole) {
  console.log('  ⚠️ Backup console found: window._originalConsole');
}

// ========================================
// 5. CHECK ENVIRONMENT
// ========================================
console.log('\n5️⃣ ENVIRONMENT CHECK:');

try {
  console.log('  import.meta.env.DEV:', import.meta.env.DEV);
  console.log('  import.meta.env.MODE:', import.meta.env.MODE);
  console.log('  import.meta.env.VITE_DEBUG_MODE:', import.meta.env.VITE_DEBUG_MODE);
} catch (e) {
  console.log('  ⚠️ Cannot access import.meta.env (normal in browser console)');
}

console.log('  NODE_ENV:', typeof process !== 'undefined' ? process.env.NODE_ENV : 'N/A');
console.log('  window.location.hostname:', window.location.hostname);
console.log('  window.location.href:', window.location.href);

// ========================================
// 6. CHECK BROWSER DEVTOOLS
// ========================================
console.log('\n6️⃣ DEVTOOLS CHECK:');

const devToolsOpen = /./;
devToolsOpen.toString = function() {
  this.opened = true;
};
console.log('%c', devToolsOpen);

console.log('  DevTools detected:', devToolsOpen.opened === true);

// ========================================
// 7. CHECK CONSOLE FILTERS
// ========================================
console.log('\n7️⃣ CONSOLE FILTER CHECK:');

// These logs test different levels
console.log('  [LOG LEVEL] This is a regular log message');
console.warn('  [WARN LEVEL] This is a warning message');
console.error('  [ERROR LEVEL] This is an error message');
console.info('  [INFO LEVEL] This is an info message');
console.debug('  [DEBUG LEVEL] This is a debug message');

console.log('\n  ❓ Can you see all 5 messages above?');
console.log('     If not, check console filter settings (top-right of console)');

// ========================================
// 8. TEST STYLED CONSOLE
// ========================================
console.log('\n8️⃣ STYLED CONSOLE TEST:');

console.log(
  '%c✨ STYLED TEST',
  'background: linear-gradient(to right, #10b981, #059669); color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold;'
);

console.log('  ❓ Can you see the styled message above with green gradient?');

// ========================================
// 9. CHECK FOR BLOCKERS
// ========================================
console.log('\n9️⃣ BLOCKER CHECK:');

// Check for known blocker scripts
const blockerScripts = [
  'TEST_MODAL_BOOKING_CONSOLE.js',
  'emergency-bypass.js'
];

const allScripts = Array.from(document.scripts).map(s => s.src);
const foundBlockers = allScripts.filter(src => 
  blockerScripts.some(blocker => src.includes(blocker))
);

if (foundBlockers.length > 0) {
  console.warn('  ⚠️ Blocker scripts detected:');
  foundBlockers.forEach(script => {
    console.warn('    →', script);
  });
} else {
  console.log('  ✅ No known blocker scripts found');
}

// Check for console interceptors
if (window._consoleInterceptor || window._logInterceptor) {
  console.warn('  ⚠️ Console interceptor detected in window object');
}

// ========================================
// 10. PERFORMANCE CHECK
// ========================================
console.log('\n🔟 PERFORMANCE CHECK:');

const startTime = performance.now();
for (let i = 0; i < 1000; i++) {
  console.log('Perf test');
}
const endTime = performance.now();

console.log('  Time for 1000 console.log calls:', (endTime - startTime).toFixed(2), 'ms');
console.log('  Average per call:', ((endTime - startTime) / 1000).toFixed(4), 'ms');

if (endTime - startTime > 100) {
  console.warn('  ⚠️ Console logging is slow (possible override with heavy processing)');
} else {
  console.log('  ✅ Console performance is normal');
}

// ========================================
// SUMMARY & RECOMMENDATIONS
// ========================================
console.log('\n📋 DIAGNOSTIC SUMMARY:');

const issues = [];
const recommendations = [];

// Analyze results
if (overrideDetection.log.isCustom) {
  issues.push('console.log has been overridden');
  recommendations.push('Run: delete console.log; console = Object.getPrototypeOf(console);');
}

if (foundBlockers.length > 0) {
  issues.push('Blocker scripts detected');
  recommendations.push('Remove or disable blocker scripts');
}

if (endTime - startTime > 100) {
  issues.push('Console performance is degraded');
  recommendations.push('Check for heavy console interceptors');
}

if (issues.length === 0) {
  console.log('  ✅ No major issues detected');
  console.log('  ✅ Console should be working normally');
  console.log('\n  💡 If you still don\'t see booking logs:');
  console.log('     1. Check console filter settings');
  console.log('     2. Try Incognito mode');
  console.log('     3. Check Network tab instead');
} else {
  console.warn('  ⚠️ Issues found:');
  issues.forEach(issue => console.warn('    -', issue));
  
  console.log('\n  🔧 Recommended fixes:');
  recommendations.forEach(rec => console.log('    -', rec));
}

// ========================================
// PROVIDE FIX SCRIPT
// ========================================
console.log('\n🔧 QUICK FIX SCRIPT:');
console.log('  Copy and paste this to fix console issues:\n');

const fixScript = `
// Delete overrides
delete console.log;
delete console.warn;
delete console.error;

// Restore from prototype
console = Object.getPrototypeOf(console);

// Test
console.log('✅ Console restored!');
console.log('%c✅ Styled console works!', 'background:green; color:white; padding:8px; border-radius:4px; font-weight:bold;');
`;

console.log(fixScript);

// ========================================
// FINAL MESSAGE
// ========================================
console.log('\n' + '='.repeat(60));
console.log('🎯 DIAGNOSTIC COMPLETE');
console.log('='.repeat(60));

console.log('\n📊 RESULTS SAVED TO: window.consoleDiagnostics');

// Save results to window object
window.consoleDiagnostics = {
  overrideDetection,
  issues,
  recommendations,
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent
};

console.log('\n💡 TIP: Run this script again after applying fixes to verify');
