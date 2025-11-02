/**
 * Check service_tier constraint
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkConstraint() {
  console.log('\n🔍 CHECKING service_tier CONSTRAINT\n');

  try {
    // Get constraint definition
    const constraint = await sql`
      SELECT pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conname = 'services_service_tier_check'
    `;

    console.log('📋 Constraint Definition:');
    console.log(constraint[0].definition);
    console.log('');

  } catch (error) {
    console.error('Error:', error);
  }
}

checkConstraint();
