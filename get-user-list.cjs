// Get complete user list to find correct login credentials
const fetch = require('node-fetch');

async function getUserList() {
    try {
        const response = await fetch('https://weddingbazaar-web.onrender.com/api/debug/users');
        const data = await response.json();
        
        console.log('🔍 Complete user list from database:\n');
        
        if (data.users && data.users.length > 0) {
            data.users.forEach((user, index) => {
                console.log(`${index + 1}. Email: ${user.email}`);
                console.log(`   Type: ${user.user_type}`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Created: ${user.created_at}`);
                console.log('   ---');
            });
            
            console.log('\n🎯 Test these emails with common passwords:');
            console.log('   - password123');
            console.log('   - test123');
            console.log('   - 123456');
            console.log('   - password');
            
        } else {
            console.log('❌ No users found in database');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

getUserList();
