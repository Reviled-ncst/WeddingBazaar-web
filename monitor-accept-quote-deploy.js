// Monitor accept-quote endpoint deployment
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com';
const BOOKING_ID = '1760918159';

async function monitorDeployment() {
    console.log('🔍 Monitoring Accept-Quote Endpoint Deployment\n');
    console.log('=' .repeat(70));
    console.log('Commit: 372bd1f');
    console.log('Target: /api/bookings/:id/accept-quote');
    console.log('Issue: Fixing 404 Not Found');
    console.log('=' .repeat(70));
    
    const maxAttempts = 20;
    let attempt = 0;
    
    while (attempt < maxAttempts) {
        attempt++;
        const timestamp = new Date().toLocaleTimeString();
        
        console.log(`\n[${timestamp}] Attempt ${attempt}/${maxAttempts}`);
        console.log('-'.repeat(70));
        
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/bookings/${BOOKING_ID}/accept-quote`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                }
            );
            
            console.log(`Status: ${response.status} ${response.statusText}`);
            
            if (response.status === 404) {
                console.log('⏳ Still deploying... (404 - endpoint not found yet)');
            } else if (response.ok) {
                const data = await response.json();
                console.log('\n✅ ✅ ✅ DEPLOYMENT COMPLETE! ✅ ✅ ✅');
                console.log('Accept-quote endpoint is now LIVE!');
                console.log('\nResponse:');
                console.log(JSON.stringify(data, null, 2));
                console.log('\n🎉 You can now test in browser!');
                console.log('   URL: https://weddingbazaarph.web.app/individual/bookings');
                console.log('   Action: Click "Accept Quote" on any booking with quote');
                return;
            } else {
                const errorText = await response.text();
                console.log(`⚠️ Endpoint exists but returned ${response.status}`);
                console.log('Response:', errorText);
                if (response.status === 500) {
                    console.log('(500 error may be normal - endpoint exists, might be data issue)');
                }
            }
            
        } catch (error) {
            console.log(`❌ Network error: ${error.message}`);
        }
        
        if (attempt < maxAttempts) {
            console.log('Waiting 30 seconds before next check...');
            await new Promise(resolve => setTimeout(resolve, 30000));
        }
    }
    
    console.log('\n⚠️ Deployment monitoring timeout');
    console.log('Please check Render dashboard manually:');
    console.log('https://dashboard.render.com');
}

monitorDeployment().catch(console.error);
