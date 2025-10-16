// Monitor backend deployment status
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com';

async function monitorDeployment() {
    console.log('🔍 Monitoring backend deployment status...');
    
    const email = 'renzrusselbauto@gmail.com';
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        attempts++;
        console.log(`\n📡 Attempt ${attempts}/${maxAttempts} - Testing backend...`);
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/profile?email=${encodeURIComponent(email)}`);
            
            if (response.ok) {
                const data = await response.json();
                const hasEmailVerifiedField = data.user.hasOwnProperty('emailVerified');
                
                console.log(`📊 Response includes emailVerified field: ${hasEmailVerifiedField}`);
                
                if (hasEmailVerifiedField) {
                    console.log(`✅ DEPLOYMENT COMPLETE! emailVerified: ${data.user.emailVerified}`);
                    console.log(`🎯 Backend fix is now live - you can login normally!`);
                    break;
                } else {
                    console.log(`⏳ Deployment still in progress... (missing emailVerified field)`);
                    console.log(`💡 Frontend fallback will handle this gracefully`);
                }
            } else {
                console.log(`❌ API error: ${response.status}`);
            }
        } catch (error) {
            console.log(`⚠️ Network error: ${error.message}`);
        }
        
        if (attempts < maxAttempts) {
            console.log(`⏸️ Waiting 10 seconds before next check...`);
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
    
    if (attempts >= maxAttempts) {
        console.log(`\n🚨 Deployment monitoring completed after ${maxAttempts} attempts`);
        console.log(`💡 If emailVerified field is still missing, the frontend fallback will work`);
        console.log(`✅ You should still be able to login as vendor with the frontend fix`);
    }
}

monitorDeployment();
