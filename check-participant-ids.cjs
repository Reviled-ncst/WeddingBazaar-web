const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkParticipantIds() {
  try {
    console.log('🔍 CHECKING PARTICIPANT IDs IN DATABASE...\n');
    
    const participants = await sql`SELECT DISTINCT participant_id, participant_name FROM conversations ORDER BY participant_id LIMIT 10`;
    
    console.log(`📊 Found ${participants.length} unique participant IDs:`);
    participants.forEach((p, index) => {
      console.log(`${index + 1}. ID: "${p.participant_id}" -> Name: "${p.participant_name}"`);
    });
    
    console.log('\n🎯 FRONTEND IS LOOKING FOR:');
    console.log('- Demo User: "1-2025-001"');
    console.log('- Sarah Johnson: "1"');
    
    console.log('\n❓ Do these IDs exist in database?');
    const demoUser = await sql`SELECT COUNT(*) as count FROM conversations WHERE participant_id = '1-2025-001'`;
    console.log(`- "1-2025-001": ${demoUser[0].count} conversations`);
    
    const sarahUser = await sql`SELECT COUNT(*) as count FROM conversations WHERE participant_id = '1'`;
    console.log(`- "1": ${sarahUser[0].count} conversations`);
    
    // Check a few that should exist
    const admin = await sql`SELECT COUNT(*) as count FROM conversations WHERE participant_id = '2-2025-003'`;
    console.log(`- "2-2025-003": ${admin[0].count} conversations`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkParticipantIds();
