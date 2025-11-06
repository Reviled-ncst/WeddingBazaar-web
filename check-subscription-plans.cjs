// Quick script to check subscription_plans table structure
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function checkPlansTable() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔍 Checking subscription_plans table...\n');
  
  try {
    const plans = await sql`
      SELECT * FROM subscription_plans
      ORDER BY tier
    `;
    
    console.log(`Found ${plans.length} subscription plans:\n`);
    plans.forEach((plan, idx) => {
      console.log(`${idx + 1}. ID: ${plan.id}`);
      console.log(`   Name: ${plan.name}`);
      console.log(`   Tier: ${plan.tier}`);
      console.log(`   Price: ${plan.monthly_price}`);
      console.log(`   Max Services: ${plan.max_services || 'N/A'}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPlansTable();
