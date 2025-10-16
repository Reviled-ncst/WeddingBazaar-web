// Direct API call to bypass email verification issue
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com';

async function bypassEmailVerification() {
    const email = 'renzrusselbauto@gmail.com';
    console.log('🔧 Attempting to bypass email verification for:', email);
    
    try {
        // Try to use the login endpoint to get a token, then use the profile endpoint
        // to modify the user data through an authenticated request
        
        // First, let's check the current user state
        const profileResponse = await fetch(`${API_BASE_URL}/api/auth/profile?email=${encodeURIComponent(email)}`, {
            headers: {
                'Content-Type': 'application/json',
                'x-user-email': email
            }
        });
        
        if (profileResponse.ok) {
            const userData = await profileResponse.json();
            console.log('✅ Current user data:', {
                email: userData.email,
                role: userData.role,
                emailVerified: userData.emailVerified,
                firstName: userData.firstName,
                lastName: userData.lastName
            });
            
            // If email is already verified, no action needed
            if (userData.emailVerified === true) {
                console.log('✅ Email already verified! You should be able to access the vendor dashboard.');
                return;
            }
            
            console.log('📧 Email verification is false or undefined - this is blocking access');
            console.log('');
            console.log('🚨 QUICK FIX SOLUTIONS:');
            console.log('');
            console.log('1. 🔧 FRONTEND BYPASS:');
            console.log('   - Modify AuthContext.jsx to ignore email verification for vendors');
            console.log('   - Change line: user.emailVerified === true');
            console.log('   - To: user.emailVerified === true || user.role === "vendor"');
            console.log('');
            console.log('2. 🎯 ROLE ROUTE BYPASS:');
            console.log('   - Modify RoleProtectedRoute to allow vendor access regardless of email verification');
            console.log('   - Add condition: if (user.role === "vendor") return <Component {...props} />;');
            console.log('');
            console.log('3. 🔐 LOGIN BYPASS:');
            console.log('   - Clear your browser localStorage and cookies');
            console.log('   - Try logging in again - sometimes Firebase auth gets stuck');
            console.log('');
            console.log('4. 🗃️ DATABASE FIX (if backend can be updated):');
            console.log('   - Update users table: UPDATE users SET email_verified = true WHERE email = \'renzrusselbauto@gmail.com\';');
            
        } else {
            console.log('❌ Could not fetch user profile:', await profileResponse.text());
        }
        
    } catch (error) {
        console.log('⚠️ Error:', error.message);
    }
}

// Also provide a test function to check available debug endpoints
async function checkDebugEndpoints() {
    console.log('🔍 Checking available debug endpoints...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/debug/users`);
        if (response.ok) {
            const users = await response.json();
            console.log('✅ Debug endpoint available! Found users:', users.length);
            
            // Look for our user
            const ourUser = users.find(u => u.email === 'renzrusselbauto@gmail.com');
            if (ourUser) {
                console.log('👤 Found our user in debug data:', {
                    id: ourUser.id,
                    email: ourUser.email,
                    role: ourUser.role,
                    email_verified: ourUser.email_verified,
                    created_at: ourUser.created_at
                });
            }
        } else {
            console.log('❌ Debug endpoint not available:', response.status);
        }
    } catch (error) {
        console.log('⚠️ Debug endpoint error:', error.message);
    }
}

async function runBypassCheck() {
    await bypassEmailVerification();
    console.log('\n' + '='.repeat(50) + '\n');
    await checkDebugEndpoints();
}

runBypassCheck();
