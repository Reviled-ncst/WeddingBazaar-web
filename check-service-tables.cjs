const { sql } = require('./backend-deploy/config/database.cjs');

(async () => {
  try {
    console.log('🔍 Checking service-related tables...\n');
    
    // Get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' 
        AND (
          table_name LIKE '%service%' 
          OR table_name LIKE '%package%' 
          OR table_name LIKE '%item%'
          OR table_name LIKE '%pricing%'
        )
      ORDER BY table_name
    `;
    
    console.log('📋 Found tables:', tables.map(t => t.table_name).join(', '));
    console.log('\n');
    
    // Get services table structure
    if (tables.some(t => t.table_name === 'services')) {
      console.log('📊 SERVICES TABLE STRUCTURE:\n');
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'services'
        ORDER BY ordinal_position
      `;
      
      columns.forEach(col => {
        console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      console.log('\n');
      
      // Sample service data
      const sample = await sql`SELECT * FROM services LIMIT 1`;
      if (sample.length > 0) {
        console.log('📝 Sample service:', JSON.stringify(sample[0], null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
})();
