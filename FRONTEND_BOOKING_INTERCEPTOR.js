/**
 * 🔍 FRONTEND BOOKING REQUEST INTERCEPTOR
 * 
 * PURPOSE: Intercept ALL fetch/XHR calls to see if booking API is being called
 * 
 * HOW TO USE:
 * 1. Open https://weddingbazaarph.web.app in browser
 * 2. Open DevTools Console (F12)
 * 3. Paste this ENTIRE script and press Enter
 * 4. Try to submit a booking request
 * 5. Look for "🚨 BOOKING API CALL DETECTED!" in console
 * 6. Copy ALL console output and send to developer
 */

console.log('🔍 BOOKING REQUEST INTERCEPTOR ACTIVATED');
console.log('📡 Monitoring all API calls...');

// Store original fetch
const originalFetch = window.fetch;

// Intercept fetch calls
window.fetch = function(...args) {
  const url = args[0];
  const options = args[1] || {};
  
  console.log('📡 FETCH CALL DETECTED:', {
    url: url,
    method: options.method || 'GET',
    hasBody: !!options.body,
    timestamp: new Date().toISOString()
  });
  
  // Check if it's a booking request
  if (url.includes('/bookings') || url.includes('/booking')) {
    console.log('🚨 BOOKING API CALL DETECTED!');
    console.log('🎯 URL:', url);
    console.log('📝 Method:', options.method);
    console.log('📦 Body:', options.body);
    console.log('🔑 Headers:', options.headers);
    
    // Parse body if it exists
    if (options.body) {
      try {
        const bodyData = JSON.parse(options.body);
        console.log('📋 Parsed Body Data:', bodyData);
      } catch (e) {
        console.log('⚠️ Could not parse body:', options.body);
      }
    }
  }
  
  // Call original fetch and log response
  return originalFetch.apply(this, args).then(response => {
    if (url.includes('/bookings') || url.includes('/booking')) {
      console.log('✅ BOOKING API RESPONSE:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      // Clone response to read it
      const clonedResponse = response.clone();
      clonedResponse.json().then(data => {
        console.log('📊 Response Data:', data);
      }).catch(e => {
        console.log('⚠️ Could not parse response:', e);
      });
    }
    return response;
  }).catch(error => {
    if (url.includes('/bookings') || url.includes('/booking')) {
      console.error('❌ BOOKING API ERROR:', error);
    }
    throw error;
  });
};

// Store original XMLHttpRequest
const originalXHR = window.XMLHttpRequest;
const XHROpen = originalXHR.prototype.open;
const XHRSend = originalXHR.prototype.send;

// Intercept XHR calls
window.XMLHttpRequest.prototype.open = function(method, url, ...rest) {
  this._url = url;
  this._method = method;
  
  if (url.includes('/bookings') || url.includes('/booking')) {
    console.log('🚨 XHR BOOKING CALL DETECTED!');
    console.log('🎯 URL:', url);
    console.log('📝 Method:', method);
  }
  
  return XHROpen.apply(this, [method, url, ...rest]);
};

window.XMLHttpRequest.prototype.send = function(body) {
  if (this._url && (this._url.includes('/bookings') || this._url.includes('/booking'))) {
    console.log('📦 XHR Body:', body);
    
    // Add load listener
    this.addEventListener('load', function() {
      console.log('✅ XHR Response:', {
        status: this.status,
        statusText: this.statusText,
        response: this.response
      });
    });
    
    // Add error listener
    this.addEventListener('error', function() {
      console.error('❌ XHR Error:', this);
    });
  }
  
  return XHRSend.apply(this, [body]);
};

// Monitor BookingRequestModal specifically
console.log('🎯 Looking for BookingRequestModal component...');

// Try to find the modal in the DOM
setTimeout(() => {
  const modal = document.querySelector('[class*="Modal"]');
  if (modal) {
    console.log('✅ Found modal element:', modal);
  } else {
    console.log('⚠️ No modal found yet - open booking modal first');
  }
}, 1000);

// Monitor form submissions
document.addEventListener('submit', (e) => {
  console.log('📝 FORM SUBMIT DETECTED:', {
    target: e.target,
    action: e.target.action,
    method: e.target.method
  });
}, true);

// Monitor button clicks
document.addEventListener('click', (e) => {
  const target = e.target;
  const isButton = target.tagName === 'BUTTON' || target.closest('button');
  
  if (isButton) {
    const button = target.tagName === 'BUTTON' ? target : target.closest('button');
    const buttonText = button.textContent.toLowerCase();
    
    if (buttonText.includes('book') || buttonText.includes('request') || buttonText.includes('submit')) {
      console.log('🎯 BOOKING BUTTON CLICKED:', {
        text: button.textContent,
        disabled: button.disabled,
        type: button.type,
        classList: Array.from(button.classList)
      });
    }
  }
}, true);

console.log('✅ Interceptor ready! Now try to submit a booking.');
console.log('👀 Watch this console for API calls...');
