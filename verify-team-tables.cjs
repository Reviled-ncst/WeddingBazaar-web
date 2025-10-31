const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function verifyTeamTables() {
  console.log('🔍 Verifying Coordinator Team Tables...\n');
  
  const tables = [
    'coordinator_team_members',
    'coordinator_team_activity',
    'team_member_permissions',
    'team_task_assignments'
  ];
  
  let allExist = true;
  
  for (const table of tables) {
    try {
      const result = await sql`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_name = ${table}
      `;
      
      const exists = parseInt(result[0].count) > 0;
      
      if (exists) {
        console.log(`✅ ${table} - EXISTS`);
        
        // Get column count
        const columns = await sql`
          SELECT COUNT(*) as count 
          FROM information_schema.columns 
          WHERE table_name = ${table}
        `;
        console.log(`   └─ Columns: ${columns[0].count}`);
      } else {
        console.log(`❌ ${table} - MISSING`);
        allExist = false;
      }
    } catch (error) {
      console.error(`❌ Error checking ${table}:`, error.message);
      allExist = false;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  if (allExist) {
    console.log('✅ ALL TABLES VERIFIED - DEPLOYMENT READY!');
  } else {
    console.log('❌ SOME TABLES MISSING - RUN create-coordinator-team-tables.cjs');
  }
  console.log('='.repeat(60));
}

verifyTeamTables().catch(console.error);
