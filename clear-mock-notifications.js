/**
 * Clear Mock Notifications from Browser Cache
 * Run this in the browser console to clear any cached mock notifications
 */

console.log('🧹 Clearing mock notification cache...');

// Get current vendor ID
const user = JSON.parse(localStorage.getItem('user') || '{}');
const vendorId = user?.id;

if (!vendorId) {
  console.error('❌ No vendor ID found. Please login first.');
} else {
  console.log('🔍 Found vendor ID:', vendorId);
  
  // Clear notification-related localStorage items
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.includes('notification') || 
      key.includes('Notification') ||
      key.includes(`lastNotificationCheck_${vendorId}`)
    )) {
      keysToRemove.push(key);
    }
  }
  
  console.log('🗑️ Removing', keysToRemove.length, 'cached items:', keysToRemove);
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear session storage too
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('notification') || key.includes('Notification'))) {
      sessionStorage.removeItem(key);
    }
  }
  
  console.log('✅ Cache cleared! Now refresh the page (Ctrl+Shift+R or Cmd+Shift+R)');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Hard refresh the page (Ctrl+Shift+R)');
  console.log('2. Check the bell icon - should show 0 notifications');
  console.log('3. Submit a booking as a couple to test real notification creation');
}
