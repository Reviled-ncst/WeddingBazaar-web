// Clear localStorage and set to list view
console.log('🔧 Setting bookings to list view...');

// Clear any existing view mode preference
localStorage.removeItem('bookings-view-mode');

// Set explicitly to list
localStorage.setItem('bookings-view-mode', '"list"');

console.log('✅ View mode set to list');
console.log('Current localStorage bookings-view-mode:', localStorage.getItem('bookings-view-mode'));

// Also clear any other booking preferences to reset them
localStorage.removeItem('bookings-filter-status');
localStorage.removeItem('bookings-sort-by');
localStorage.removeItem('bookings-sort-order');

console.log('🎯 All booking preferences reset to defaults with list view');
