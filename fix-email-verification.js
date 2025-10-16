// Fix email verification for your account
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com';

async function fixEmailVerification() {
    const email = 'renzrusselbauto@gmail.com';
    console.log(`🔧 Fixing email verification for: ${email}`);
    
    try {
        // Update the user to mark email as verified
        const response = await fetch(`${API_BASE_URL}/api/auth/update-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                emailVerified: true,
                action: 'force_verify'
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ SUCCESS! Email verification updated:`);
            console.log(`   - Email: ${email}`);
            console.log(`   - Verified: true`);
            console.log(`   - Result:`, result.message || 'Updated successfully');
            console.log(`🎯 You should now be able to access /vendor!`);
        } else {
            const errorText = await response.text();
            console.log(`⚠️ Error ${response.status}: ${errorText}`);
            
            // Fallback: Try direct database update
            console.log(`🔄 Trying alternative method...`);
            await tryDirectUpdate(email);
        }
    } catch (error) {
        console.log(`⚠️ Network error: ${error.message}`);
        console.log(`🔄 Trying alternative method...`);
        await tryDirectUpdate(email);
    }
}

async function tryDirectUpdate(email) {
    try {
        // Try using the profile update endpoint
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-user-email': email
            },
            body: JSON.stringify({
                email: email,
                emailVerified: true,
                updateVerification: true
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ Alternative method SUCCESS!`);
            console.log(`   - Email verification fixed for: ${email}`);
            console.log(`🎯 Try logging in again now!`);
        } else {
            console.log(`⚠️ Alternative method failed: ${response.status}`);
            console.log(`📞 Manual intervention needed - contact admin`);
        }
    } catch (error) {
        console.log(`⚠️ Alternative method error: ${error.message}`);
        console.log(`📞 Manual intervention needed`);
    }
}

// Also check current verification status
async function checkCurrentStatus() {
    const email = 'renzrusselbauto@gmail.com';
    console.log(`🔍 Checking current verification status...`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile?email=${encodeURIComponent(email)}`, {
            headers: {
                'Content-Type': 'application/json',
                'x-user-email': email
            }
        });

        if (response.ok) {
            const responseData = await response.json();
            const userData = responseData.user || responseData;
            console.log(`📊 Current Status:`);
            console.log(`   - Email: ${userData.email}`);
            console.log(`   - Role: ${userData.role}`);
            console.log(`   - Email Verified: ${userData.emailVerified || userData.email_verified || 'unknown'}`);
            console.log(`   - Created: ${userData.createdAt}`);
        }
    } catch (error) {
        console.log(`⚠️ Status check error: ${error.message}`);
    }
    console.log('---');
}

async function runFix() {
    await checkCurrentStatus();
    await fixEmailVerification();
}

runFix();
