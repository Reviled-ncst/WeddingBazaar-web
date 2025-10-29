// Monitor Render Deployment Status
// Run this every minute to check if new code is deployed

const https = require('https');

function checkDeployment() {
  const url = 'https://weddingbazaar-web.onrender.com/api/health';
  
  https.get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const health = JSON.parse(data);
        const uptimeSeconds = health.uptime;
        const uptimeMinutes = (uptimeSeconds / 60).toFixed(1);
        
        console.log('\n' + '='.repeat(60));
        console.log('⏰ Deployment Check:', new Date().toLocaleTimeString());
        console.log('='.repeat(60));
        console.log(`🔧 Server Version: ${health.version}`);
        console.log(`⏱️  Server Uptime: ${uptimeSeconds.toFixed(0)} seconds (${uptimeMinutes} minutes)`);
        console.log(`📊 Database: ${health.database}`);
        console.log(`🌍 Environment: ${health.environment}`);
        
        if (uptimeSeconds < 300) {
          console.log('\n🎉 🎉 🎉 NEW DEPLOYMENT DETECTED! 🎉 🎉 🎉');
          console.log('✅ Server has been running for less than 5 minutes');
          console.log('✅ This means Render just deployed the new code!');
          console.log('\n👉 NEXT STEPS:');
          console.log('   1. Refresh your browser (Ctrl + Shift + R)');
          console.log('   2. Try the subscription upgrade again');
          console.log('   3. Payment should succeed WITHOUT 500 error!');
          console.log('\n');
          process.exit(0);
        } else {
          console.log('\n⏳ Still waiting for deployment...');
          console.log(`   Server has been up for ${uptimeMinutes} minutes`);
          console.log('   Deployment typically takes 5-10 minutes');
          console.log('   Will check again in 60 seconds...\n');
        }
        
      } catch (err) {
        console.error('❌ Error parsing health response:', err.message);
      }
    });
    
  }).on('error', (err) => {
    console.error('❌ Error checking deployment:', err.message);
  });
}

console.log('🔍 Starting Render Deployment Monitor...');
console.log('📡 Checking: https://weddingbazaar-web.onrender.com/api/health');
console.log('⏰ Will check every 60 seconds until new deployment detected\n');

// Check immediately
checkDeployment();

// Then check every 60 seconds
setInterval(checkDeployment, 60000);
