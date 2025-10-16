// Use the new fix endpoint to verify your email
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com';

async function fixEmailVerification() {
    const email = 'renzrusselbauto@gmail.com';
    console.log(`🔧 Using new backend endpoint to fix verification for: ${email}`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/fix-verification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log(`✅ SUCCESS! Email verification fixed:`);
            console.log(`   - Email: ${result.user.email}`);
            console.log(`   - Email Verified: ${result.user.email_verified}`);
            console.log(`   - Message: ${result.message}`);
            console.log(`🎯 You should now be able to access /vendor!`);
            console.log(`🔄 Refresh your browser and try logging in again.`);
        } else {
            const errorText = await response.text();
            console.log(`⚠️ Error ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.log(`⚠️ Network error: ${error.message}`);
    }
}

// Wait a bit for deployment then run
setTimeout(fixEmailVerification, 30000);
