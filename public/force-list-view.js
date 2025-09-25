// Clear localStorage and force list view
localStorage.removeItem('bookings-view-mode');
localStorage.setItem('bookings-view-mode', '"list"');
console.log('✅ Forced list view mode');
location.reload();
