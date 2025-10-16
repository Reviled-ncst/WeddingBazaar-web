// Quick frontend fix - temporarily bypass email verification check
// This will allow you to access vendor dashboard immediately

console.log('🔧 EMERGENCY BYPASS: Checking for email verification blocks...');

// Check if there are any components checking for email verification
const originalConsoleLog = console.log;
let emailVerificationBlocks = [];

console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('email') && (message.includes('verify') || message.includes('verification'))) {
        emailVerificationBlocks.push(message);
    }
    originalConsoleLog.apply(console, args);
};

// Restore after a few seconds
setTimeout(() => {
    console.log = originalConsoleLog;
    console.log('🔍 Email verification related logs found:', emailVerificationBlocks);
}, 5000);

// QUICK FIX: Override the user object to always show emailVerified: true
// This is a temporary hack to get you unblocked
if (window.location.href.includes('localhost:5173')) {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const promise = originalFetch.apply(this, args);
        
        return promise.then(response => {
            if (response.url.includes('/api/auth/profile') && response.ok) {
                return response.clone().json().then(data => {
                    // Force emailVerified to true
                    if (data.user && data.user.email === 'renzrusselbauto@gmail.com') {
                        data.user.emailVerified = true;
                        console.log('🔧 EMERGENCY BYPASS: Forced emailVerified to true');
                    }
                    
                    // Return a new response with modified data
                    return new Response(JSON.stringify(data), {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    });
                });
            }
            return response;
        });
    };
    
    console.log('🚀 EMERGENCY BYPASS ACTIVATED - emailVerified will be forced to true');
    console.log('💡 Try logging in again now - you should be able to access vendor dashboard');
} else {
    console.log('❌ This bypass only works on localhost:5173');
}
