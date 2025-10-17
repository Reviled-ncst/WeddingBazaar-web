const { sql } = require('./backend-deploy/config/database.cjs');

async function checkConstraints() {
  console.log('=== CHECKING CONVERSATIONS TABLE CONSTRAINTS ===');
  
  try {
    // Get constraints
    const constraints = await sql`
      SELECT 
        tc.constraint_name, 
        tc.constraint_type,
        kcu.column_name,
        rc.delete_rule,
        rc.update_rule
      FROM information_schema.table_constraints tc
      LEFT JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.referential_constraints rc 
        ON tc.constraint_name = rc.constraint_name
      WHERE tc.table_name = 'conversations'
      ORDER BY tc.constraint_name, kcu.ordinal_position;
    `;
    
    console.log('📋 Conversations table constraints:');
    constraints.forEach(constraint => {
      console.log(`  ${constraint.constraint_name} (${constraint.constraint_type}): ${constraint.column_name || 'N/A'}`);
    });
    
    // Check indexes specifically
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'conversations';
    `;
    
    console.log('\n📋 Conversations table indexes:');
    indexes.forEach(index => {
      console.log(`  ${index.indexname}: ${index.indexdef}`);
    });
    
  } catch (error) {
    console.error('❌ Constraint check error:', error.message);
  }
  
  process.exit(0);
}

checkConstraints();
