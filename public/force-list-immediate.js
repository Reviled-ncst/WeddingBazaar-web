// Force list view immediately
localStorage.clear();
localStorage.setItem('bookings-view-mode', '"list"');
console.log('✅ Forced to list view mode');
location.reload();
