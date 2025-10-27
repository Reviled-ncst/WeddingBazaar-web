/**
 * 🔄 RENDER DEPLOYMENT MONITOR
 * 
 * This script monitors the Render deployment status by checking if the
 * subscription upgrade endpoint accepts requests without authentication.
 * 
 * When deployed correctly, the endpoint should return 400 (invalid plan)
 * instead of 401 (unauthorized).
 */

const API_URL = 'https://weddingbazaar-web.onrender.com';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

async function checkDeployment() {
  console.log(`${colors.cyan}🔍 Checking Render deployment status...${colors.reset}\n`);
  
  let attempt = 0;
  const maxAttempts = 20; // 20 attempts = ~5 minutes
  const delayMs = 15000; // 15 seconds between checks
  
  while (attempt < maxAttempts) {
    attempt++;
    
    try {
      console.log(`${colors.yellow}Attempt ${attempt}/${maxAttempts}...${colors.reset}`);
      
      const response = await fetch(`${API_URL}/api/subscriptions/upgrade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendor_id: 'test-deployment-check',
          new_plan: 'invalid-plan' // Use invalid plan to test
        })
      });
      
      const status = response.status;
      console.log(`  Status: ${status}`);
      
      if (status === 401) {
        console.log(`  ${colors.red}❌ Still using OLD code (requires auth)${colors.reset}`);
        console.log(`  ${colors.yellow}Waiting ${delayMs/1000} seconds before next check...${colors.reset}\n`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      } else if (status === 400) {
        console.log(`  ${colors.green}✅ NEW code deployed! (No auth required)${colors.reset}`);
        const data = await response.json();
        console.log(`  Response: ${JSON.stringify(data)}\n`);
        
        console.log(`${colors.green}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.green}║                                                                ║${colors.reset}`);
        console.log(`${colors.green}║  🎉 DEPLOYMENT SUCCESSFUL!                                     ║${colors.reset}`);
        console.log(`${colors.green}║                                                                ║${colors.reset}`);
        console.log(`${colors.green}║  Backend is now accepting subscription upgrades                ║${colors.reset}`);
        console.log(`${colors.green}║  without authentication!                                       ║${colors.reset}`);
        console.log(`${colors.green}║                                                                ║${colors.reset}`);
        console.log(`${colors.green}║  You can now test the upgrade flow in production:             ║${colors.reset}`);
        console.log(`${colors.green}║  https://weddingbazaarph.web.app                               ║${colors.reset}`);
        console.log(`${colors.green}║                                                                ║${colors.reset}`);
        console.log(`${colors.green}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
        
        return true;
      } else {
        console.log(`  ${colors.yellow}⚠️  Unexpected status: ${status}${colors.reset}`);
        const data = await response.text();
        console.log(`  Response: ${data}\n`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
    } catch (error) {
      console.log(`  ${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      continue;
    }
  }
  
  console.log(`${colors.red}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.red}║                                                                ║${colors.reset}`);
  console.log(`${colors.red}║  ⏱️  DEPLOYMENT TIMEOUT                                        ║${colors.reset}`);
  console.log(`${colors.red}║                                                                ║${colors.reset}`);
  console.log(`${colors.red}║  Render deployment is taking longer than expected.             ║${colors.reset}`);
  console.log(`${colors.red}║  Please check: https://dashboard.render.com                    ║${colors.reset}`);
  console.log(`${colors.red}║                                                                ║${colors.reset}`);
  console.log(`${colors.red}╚════════════════════════════════════════════════════════════════╝${colors.reset}\n`);
  
  return false;
}

// Run the check
checkDeployment()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
