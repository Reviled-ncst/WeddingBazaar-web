// Quick test for logged in user
console.log('Current user from localStorage:', localStorage.getItem('user'));
console.log('Auth token:', localStorage.getItem('token'));

// If you want to temporarily use the user that has bookings:
// localStorage.setItem('user', JSON.stringify({id: '1-2025-001', email: 'test1757915960106@example.com', user_type: 'couple'}));
// Then refresh the page
