const { sql } = require('./backend-deploy/config/database.cjs');

(async () => {
  try {
    console.log('🔍 Checking booking_items table...\n');
    
    // Get booking_items table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'booking_items'
      ORDER BY ordinal_position
    `;
    
    console.log('📊 BOOKING_ITEMS TABLE STRUCTURE:\n');
    columns.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('\n');
    
    // Get sample data
    const sample = await sql`SELECT * FROM booking_items LIMIT 5`;
    console.log(`📝 Found ${sample.length} sample records\n`);
    
    if (sample.length > 0) {
      sample.forEach((item, idx) => {
        console.log(`\nItem ${idx + 1}:`, JSON.stringify(item, null, 2));
      });
    } else {
      console.log('ℹ️  No booking items exist yet');
    }
    
    // Check relationships
    console.log('\n🔗 Checking table relationships...\n');
    const relationships = await sql`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name='booking_items'
    `;
    
    if (relationships.length > 0) {
      relationships.forEach(rel => {
        console.log(`  ${rel.table_name}.${rel.column_name} -> ${rel.foreign_table_name}.${rel.foreign_column_name}`);
      });
    } else {
      console.log('  ℹ️  No foreign key relationships found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
})();
