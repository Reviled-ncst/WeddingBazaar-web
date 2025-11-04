/**
 * 🚨 CRITICAL DIAGNOSTIC - WHERE ARE MY CONSOLE LOGS?
 * 
 * Copy this ENTIRE file into browser console
 * It will tell you EXACTLY why console is empty
 */

console.clear();

console.log('%c🔍 CRITICAL DIAGNOSTIC STARTING...', 
  'background: red; color: white; padding: 12px; font-size: 16px; font-weight: bold;');

// ========================================
// TEST 1: CAN YOU SEE THIS?
// ========================================
console.log('\n📋 TEST 1: BASIC CONSOLE CHECK');
console.log('✅ If you can see this, console is working');
console.log('❌ If you cannot see this, console is completely broken');

// ========================================
// TEST 2: ENVIRONMENT CHECK
// ========================================
console.log('\n📋 TEST 2: ENVIRONMENT CHECK');
console.log('URL:', window.location.href);
console.log('Hostname:', window.location.hostname);
console.log('Port:', window.location.port);

try {
  console.log('Mode:', import.meta.env.MODE);
  console.log('Is Production?', import.meta.env.PROD);
  console.log('Is Development?', import.meta.env.DEV);
  console.log('API URL:', import.meta.env.VITE_API_URL);
} catch (e) {
  console.error('❌ Cannot read import.meta.env - You might be in a production build!');
}

// ========================================
// TEST 3: ANALYSIS
// ========================================
console.log('\n📊 ANALYSIS:');

const isLocalhost = window.location.hostname === 'localhost';
const isPort5173 = window.location.port === '5173' || window.location.port === '';
const isFirebase = window.location.hostname.includes('firebase') || window.location.hostname.includes('web.app');
const isFileProtocol = window.location.protocol === 'file:';

if (isLocalhost && isPort5173) {
  console.log('%c✅ ENVIRONMENT: Development Server (localhost:5173)',
    'background: green; color: white; padding: 8px; font-weight: bold;');
  console.log('   This is CORRECT for seeing console logs!');
  console.log('   If logs still don\'t appear during booking:');
  console.log('   → Console filter might be set to "Errors only"');
  console.log('   → Check top-right of console for filter dropdown');
} else if (isFirebase) {
  console.log('%c❌ ENVIRONMENT: Production Deployment (Firebase)',
    'background: red; color: white; padding: 8px; font-weight: bold;');
  console.log('   Console logs are STRIPPED in production builds!');
  console.log('   This is NORMAL and EXPECTED.');
  console.log('\n   🔧 SOLUTION:');
  console.log('   1. Open terminal/PowerShell');
  console.log('   2. Navigate to project folder');
  console.log('   3. Run: npm run dev');
  console.log('   4. Open: http://localhost:5173');
} else if (isFileProtocol) {
  console.log('%c❌ ENVIRONMENT: File System (Built Files)',
    'background: red; color: white; padding: 8px; font-weight: bold;');
  console.log('   You opened built files directly from dist/ folder!');
  console.log('   Console logs are stripped in production builds.');
  console.log('\n   🔧 SOLUTION:');
  console.log('   1. Open terminal/PowerShell');
  console.log('   2. Navigate to project folder');
  console.log('   3. Run: npm run dev');
  console.log('   4. Open: http://localhost:5173');
} else {
  console.log('%c⚠️ ENVIRONMENT: Unknown',
    'background: orange; color: white; padding: 8px; font-weight: bold;');
  console.log('   Cannot determine your environment');
  console.log('   URL:', window.location.href);
  console.log('\n   🔧 RECOMMENDATION:');
  console.log('   Make sure you\'re running: npm run dev');
}

// ========================================
// TEST 4: CONSOLE OVERRIDE CHECK
// ========================================
console.log('\n📋 TEST 4: CONSOLE OVERRIDE CHECK');

const logString = console.log.toString();
const isNative = logString.includes('[native code]');

if (isNative) {
  console.log('✅ console.log is NATIVE (not overridden)');
} else {
  console.log('%c❌ console.log is OVERRIDDEN!',
    'background: red; color: white; padding: 8px; font-weight: bold;');
  console.log('Override code:', logString.substring(0, 150) + '...');
  console.log('\n   🔧 SOLUTION:');
  console.log('   Run this to restore:');
  console.log('   delete console.log; console = Object.getPrototypeOf(console);');
}

// ========================================
// TEST 5: CONSOLE FILTER CHECK
// ========================================
console.log('\n📋 TEST 5: CONSOLE FILTER CHECK');
console.log('Can you see ALL of these messages?');
console.log('1️⃣ Regular log');
console.info('2️⃣ Info message');
console.warn('3️⃣ Warning message');
console.error('4️⃣ Error message');
console.debug('5️⃣ Debug message');

console.log('\n❓ If you CANNOT see all 5 messages above:');
console.log('   → Your console filter is set to show only certain levels');
console.log('   → Look at top-right of console');
console.log('   → Click filter dropdown');
console.log('   → Select "All levels" or "Verbose"');

// ========================================
// TEST 6: STYLED CONSOLE TEST
// ========================================
console.log('\n📋 TEST 6: STYLED CONSOLE TEST');
console.log(
  '%c✨ STYLED MESSAGE TEST',
  'background: linear-gradient(to right, #10b981, #059669); color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold;'
);
console.log('❓ Can you see the styled message above with GREEN GRADIENT background?');
console.log('   ✅ YES → Your console supports styling');
console.log('   ❌ NO → Your browser might have styling disabled');

// ========================================
// FINAL VERDICT
// ========================================
console.log('\n' + '='.repeat(60));
console.log('%c🎯 FINAL VERDICT', 
  'background: blue; color: white; padding: 8px 16px; font-weight: bold; font-size: 16px;');
console.log('='.repeat(60));

let verdict = '';
let solution = '';

if (isFirebase) {
  verdict = '❌ You are on PRODUCTION deployment';
  solution = 'Run "npm run dev" and use localhost:5173';
} else if (isFileProtocol) {
  verdict = '❌ You opened BUILT FILES directly';
  solution = 'Run "npm run dev" and use localhost:5173';
} else if (!isNative) {
  verdict = '❌ Console.log is OVERRIDDEN by a script';
  solution = 'Run: delete console.log; console = Object.getPrototypeOf(console);';
} else if (isLocalhost && isPort5173) {
  verdict = '✅ Environment is CORRECT (development server)';
  solution = 'Check console FILTER settings (top-right, select "All levels")';
} else {
  verdict = '⚠️ Unknown issue';
  solution = 'Share this output and a screenshot';
}

console.log('\n📌 VERDICT:', verdict);
console.log('🔧 SOLUTION:', solution);

// ========================================
// NEXT STEPS
// ========================================
console.log('\n📝 NEXT STEPS:');
console.log('1. Read the verdict above');
console.log('2. Apply the recommended solution');
console.log('3. Refresh page and test booking');
console.log('4. Console logs should now appear');

console.log('\n✅ Diagnostic complete!');
console.log('📸 If still not working, take a screenshot of THIS OUTPUT');

// Save results to window object
window.CONSOLE_DIAGNOSTIC_RESULT = {
  canSeeThisLog: true,
  environment: {
    url: window.location.href,
    hostname: window.location.hostname,
    port: window.location.port,
    isLocalhost,
    isFirebase,
    isFileProtocol,
    isPort5173
  },
  consoleOverridden: !isNative,
  verdict,
  solution,
  timestamp: new Date().toISOString()
};

console.log('\n💾 Results saved to: window.CONSOLE_DIAGNOSTIC_RESULT');

// Alert as backup
alert('🔍 DIAGNOSTIC COMPLETE!\n\n' + verdict + '\n\nSolution:\n' + solution + '\n\nCheck console for full details.');
