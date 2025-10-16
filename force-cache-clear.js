// 🚀 FORCE CLEAR CACHE AND RELOAD - RUN THIS IN BROWSER CONSOLE
// Copy and paste this entire script into your browser console (F12)

console.log('🔧 FORCE CLEARING BROWSER CACHE...');

// 1. Clear all cache storage
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    console.log('📂 Found cache names:', cacheNames);
    return Promise.all(
      cacheNames.map(cacheName => {
        console.log('🗑️ Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  }).then(() => {
    console.log('✅ All caches cleared');
  });
}

// 2. Unregister service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('🔧 Found service workers:', registrations.length);
    registrations.forEach(registration => {
      console.log('🗑️ Unregistering service worker:', registration.scope);
      registration.unregister();
    });
  });
}

// 3. Clear local storage for auth tokens
const authKeys = ['jwt_token', 'authToken', 'auth_token', 'backend_user', 'weddingbazaar_user_profile'];
authKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log('🔑 Found auth token:', key);
  }
});

// 4. Clear session storage
sessionStorage.clear();
console.log('🗑️ Session storage cleared');

// 5. Force reload with cache bypass
console.log('🔄 Forcing hard reload in 2 seconds...');
setTimeout(() => {
  // Force reload bypassing cache
  window.location.reload(true);
}, 2000);

console.log('⏳ Cache clearing initiated. Page will reload automatically...');
