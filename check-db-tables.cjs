const { sql } = require('./backend-deploy/config/database.cjs');

async function checkTables() {
  console.log('🔍 Checking database tables...\n');
  
  try {
    // Check both vendors and vendor_profiles tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('vendors', 'vendor_profiles', 'vendor_documents')
      ORDER BY table_name;
    `;
    
    console.log('📋 Available tables:', tables.map(t => t.table_name));
    
    // Check vendors table
    if (tables.some(t => t.table_name === 'vendors')) {
      const vendorsCount = await sql`SELECT COUNT(*) as count FROM vendors`;
      console.log(`\n👥 vendors table: ${vendorsCount[0].count} rows`);
      
      const vendorsSample = await sql`SELECT id, name FROM vendors LIMIT 3`;
      console.table(vendorsSample);
    }
    
    // Check vendor_profiles table
    if (tables.some(t => t.table_name === 'vendor_profiles')) {
      const profilesCount = await sql`SELECT COUNT(*) as count FROM vendor_profiles`;
      console.log(`\n👤 vendor_profiles table: ${profilesCount[0].count} rows`);
      
      const profilesSample = await sql`SELECT id, user_id, business_name FROM vendor_profiles LIMIT 3`;
      console.table(profilesSample);
    }
    
    // Check vendor_documents table
    if (tables.some(t => t.table_name === 'vendor_documents')) {
      const docsCount = await sql`SELECT COUNT(*) as count FROM vendor_documents`;
      console.log(`\n📄 vendor_documents table: ${docsCount[0].count} rows`);
      
      const docsSample = await sql`
        SELECT id, vendor_id, document_type, verification_status 
        FROM vendor_documents 
        LIMIT 3
      `;
      console.table(docsSample);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkTables();
