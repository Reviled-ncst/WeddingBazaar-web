const { sql } = require('./backend-deploy/config/database.cjs');

async function checkConstraints() {
  console.log('🔍 Checking vendor_documents table constraints...');
  
  try {
    // Check what type vendor_id should be
    const constraints = await sql`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'vendor_documents'
    `;
    
    console.log('📋 Constraints:');
    constraints.forEach(c => {
      console.log(`   ${c.constraint_type}: ${c.column_name} -> ${c.foreign_table_name}.${c.foreign_column_name}`);
    });
    
    // Try a simple insert with a test UUID
    console.log('\n🧪 Testing simple insert...');
    
    const testId = 'test-doc-' + Date.now();
    const testVendorId = '2-2025-001';
    
    try {
      const result = await sql`
        INSERT INTO vendor_documents (
          vendor_id, 
          document_type, 
          document_url
        ) VALUES (
          ${testVendorId},
          'Test Document',
          'https://example.com/test.pdf'
        ) RETURNING id
      `;
      
      console.log('✅ Test insert successful:', result[0].id);
      
      // Clean up test record
      await sql`DELETE FROM vendor_documents WHERE id = ${result[0].id}`;
      console.log('🧹 Test record cleaned up');
      
    } catch (insertError) {
      console.error('❌ Test insert failed:', insertError.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking constraints:', error.message);
  }
  
  process.exit(0);
}

checkConstraints();
