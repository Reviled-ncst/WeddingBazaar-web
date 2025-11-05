/**
 * 🔥 ULTRA DIAGNOSTIC - TRACE EVERY SINGLE THING
 * 
 * This will show you EXACTLY what's happening (or not happening)
 * Copy this ENTIRE file into browser console on the PRODUCTION site
 */

console.clear();
console.log('%c🔥 ULTRA DIAGNOSTIC STARTING...', 
  'background: red; color: white; padding: 16px; font-size: 20px; font-weight: bold;');

// ========================================
// STEP 1: ENVIRONMENT CHECK
// ========================================
console.log('\n📋 STEP 1: ENVIRONMENT CHECK');
console.log('URL:', window.location.href);
console.log('Hostname:', window.location.hostname);

// ========================================
// STEP 2: INTERCEPT ALL FETCH CALLS
// ========================================
console.log('\n📋 STEP 2: INTERCEPTING ALL FETCH CALLS...');

const originalFetch = window.fetch;
let fetchCallCount = 0;

window.fetch = function(...args) {
  fetchCallCount++;
  const [url, options] = args;
  
  console.log(`\n%c🌐 FETCH #${fetchCallCount}`, 
    'background: blue; color: white; padding: 8px 16px; font-size: 14px; font-weight: bold;');
  console.log('├─ URL:', url);
  console.log('├─ Full URL:', typeof url === 'string' ? url : url.toString());
  console.log('├─ Method:', options?.method || 'GET');
  console.log('├─ Headers:', options?.headers);
  
  if (options?.body) {
    console.log('├─ Body Type:', typeof options.body);
    try {
      const parsed = JSON.parse(options.body);
      console.log('└─ Parsed Body:', parsed);
    } catch {
      console.log('└─ Raw Body:', options.body.substring(0, 200));
    }
  }
  
  // Special attention to booking calls
  if (url.includes('booking') || url.includes('Booking')) {
    console.log('%c🎯 BOOKING CALL DETECTED!', 
      'background: red; color: white; padding: 12px 20px; font-size: 16px; font-weight: bold;');
    console.log('This is a booking-related API call!');
    
    // Show in DOM
    const div = document.createElement('div');
    div.style.cssText = 'position: fixed; top: 10px; right: 10px; background: red; color: white; padding: 15px; z-index: 99999; font-size: 14px; border-radius: 8px; max-width: 400px;';
    div.innerHTML = `<strong>🎯 BOOKING API CALL!</strong><br>URL: ${url}<br>Method: ${options?.method || 'GET'}`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 10000);
  }
  
  // Call original fetch
  const promise = originalFetch.apply(this, args);
  
  promise.then(response => {
    console.log(`\n%c✅ RESPONSE for FETCH #${fetchCallCount}`, 
      'background: green; color: white; padding: 8px 16px; font-weight: bold;');
    console.log('├─ URL:', url);
    console.log('├─ Status:', response.status);
    console.log('├─ Status Text:', response.statusText);
    console.log('└─ OK:', response.ok);
    
    // Clone and log response body
    response.clone().text().then(text => {
      console.log('Response Body (first 500 chars):', text.substring(0, 500));
      try {
        const json = JSON.parse(text);
        console.log('Parsed Response:', json);
      } catch {
        console.log('(Response is not JSON)');
      }
    });
  }).catch(error => {
    console.error(`\n%c❌ FETCH ERROR for #${fetchCallCount}`, 
      'background: red; color: white; padding: 8px 16px; font-weight: bold;');
    console.error('URL:', url);
    console.error('Error:', error);
  });
  
  return promise;
};

console.log('✅ Fetch interceptor installed!');

// ========================================
// STEP 3: INTERCEPT XMLHttpRequest (if used)
// ========================================
console.log('\n📋 STEP 3: INTERCEPTING XMLHttpRequest...');

const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  this._method = method;
  this._url = url;
  console.log(`\n%c📡 XHR OPEN`, 'background: purple; color: white; padding: 4px 8px;');
  console.log('Method:', method);
  console.log('URL:', url);
  return originalXHROpen.apply(this, [method, url, ...rest]);
};

XMLHttpRequest.prototype.send = function(body) {
  console.log(`\n%c📡 XHR SEND`, 'background: purple; color: white; padding: 4px 8px;');
  console.log('URL:', this._url);
  console.log('Method:', this._method);
  console.log('Body:', body);
  
  this.addEventListener('load', function() {
    console.log(`\n%c✅ XHR RESPONSE`, 'background: green; color: white; padding: 4px 8px;');
    console.log('Status:', this.status);
    console.log('Response:', this.responseText.substring(0, 500));
  });
  
  this.addEventListener('error', function() {
    console.error(`\n%c❌ XHR ERROR`, 'background: red; color: white; padding: 4px 8px;');
    console.error('URL:', this._url);
  });
  
  return originalXHRSend.apply(this, [body]);
};

console.log('✅ XHR interceptor installed!');

// ========================================
// STEP 4: MONITOR FORM SUBMISSIONS
// ========================================
console.log('\n📋 STEP 4: MONITORING FORM SUBMISSIONS...');

document.addEventListener('submit', function(e) {
  console.log('%c📝 FORM SUBMISSION DETECTED!', 
    'background: orange; color: white; padding: 8px 16px; font-weight: bold;');
  console.log('Form:', e.target);
  console.log('Action:', e.target.action);
  console.log('Method:', e.target.method);
}, true);

console.log('✅ Form submission monitor active!');

// ========================================
// STEP 5: MONITOR BUTTON CLICKS
// ========================================
console.log('\n📋 STEP 5: MONITORING BUTTON CLICKS...');

document.addEventListener('click', function(e) {
  const target = e.target;
  if (target.tagName === 'BUTTON' || target.closest('button')) {
    const button = target.tagName === 'BUTTON' ? target : target.closest('button');
    console.log('%c🖱️ BUTTON CLICKED', 
      'background: teal; color: white; padding: 4px 8px;');
    console.log('Button text:', button.textContent.trim().substring(0, 50));
    console.log('Button type:', button.type);
    console.log('Button classes:', button.className);
    
    // Check if it's a booking-related button
    const text = button.textContent.toLowerCase();
    if (text.includes('book') || text.includes('submit') || text.includes('request')) {
      console.log('%c🎯 BOOKING BUTTON CLICKED!', 
        'background: red; color: white; padding: 8px 16px; font-size: 14px; font-weight: bold;');
      console.log('This might trigger a booking request!');
      console.log('Watch for fetch/XHR calls above...');
    }
  }
}, true);

console.log('✅ Button click monitor active!');

// ========================================
// STEP 6: CHECK API CONFIGURATION
// ========================================
console.log('\n📋 STEP 6: CHECKING API CONFIGURATION...');

try {
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('MODE:', import.meta.env.MODE);
  console.log('PROD:', import.meta.env.PROD);
  console.log('DEV:', import.meta.env.DEV);
} catch (e) {
  console.warn('Cannot access import.meta.env (production build)');
}

// Try to find API URL in window object
console.log('\n🔍 Searching for API URL in window object...');
const apiKeys = ['API_URL', 'VITE_API_URL', 'apiUrl', 'baseURL', 'baseUrl'];
apiKeys.forEach(key => {
  if (window[key]) {
    console.log(`Found: window.${key} =`, window[key]);
  }
});

// ========================================
// STEP 7: SUMMARY
// ========================================
console.log('\n' + '='.repeat(60));
console.log('%c🎯 ULTRA DIAGNOSTIC ACTIVE!', 
  'background: linear-gradient(to right, #10b981, #059669); color: white; padding: 12px 20px; border-radius: 8px; font-size: 16px; font-weight: bold;');
console.log('='.repeat(60));

console.log('\n📊 WHAT THIS WILL SHOW:');
console.log('  ✅ Every fetch call (even failed ones)');
console.log('  ✅ Every XHR request');
console.log('  ✅ Every form submission');
console.log('  ✅ Every button click');
console.log('  ✅ Special alerts for booking-related actions');

console.log('\n🎯 NOW DO THIS:');
console.log('  1. Go to the Services page');
console.log('  2. Click "Request Booking" on any service');
console.log('  3. Fill out the form');
console.log('  4. Click Submit');
console.log('  5. Watch THIS console for activity');

console.log('\n❓ WHAT TO LOOK FOR:');
console.log('  ✅ "🖱️ BUTTON CLICKED" - Confirms button was clicked');
console.log('  ✅ "🌐 FETCH #X" - Confirms API call was made');
console.log('  ✅ "🎯 BOOKING CALL DETECTED" - Confirms it\'s a booking call');
console.log('  ✅ "✅ RESPONSE" - Confirms server responded');
console.log('  ❌ If NONE appear - Button click is not triggering API call!');

console.log('\n💡 COMMON ISSUES:');
console.log('  ❌ No button click logged → Button event not working');
console.log('  ❌ Button click but no fetch → API call prevented by code');
console.log('  ❌ Fetch but no response → Network/CORS issue');
console.log('  ❌ Fetch wrong URL → API URL misconfigured');

console.log('\n✅ Diagnostic ready! Try submitting a booking now...');

// Alert
alert('🔥 ULTRA DIAGNOSTIC ACTIVE!\n\nNow submit a booking and watch the console.\n\nEvery action will be logged!');

// Save state
window.DIAGNOSTIC_STATE = {
  installed: true,
  fetchCount: 0,
  startTime: new Date().toISOString()
};

console.log('\n💾 Diagnostic state saved to: window.DIAGNOSTIC_STATE');
