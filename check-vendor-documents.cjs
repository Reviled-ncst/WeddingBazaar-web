const { sql } = require('./backend-deploy/config/database.cjs');

async function checkVendorDocuments() {
  console.log('🔍 Checking vendor documents in database...');
  
  try {
    // Check if vendor_documents table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'vendor_documents'
      );
    `;
    
    console.log('📋 vendor_documents table exists:', tableCheck[0].exists);
    
    if (tableCheck[0].exists) {
      // Get all documents
      const documents = await sql`
        SELECT 
          vd.*,
          vp.business_name,
          u.first_name,
          u.last_name,
          u.email
        FROM vendor_documents vd
        LEFT JOIN vendor_profiles vp ON vd.vendor_id::text = vp.user_id::text
        LEFT JOIN users u ON vp.user_id = u.id
        ORDER BY vd.uploaded_at DESC
      `;
      
      console.log(`📄 Found ${documents.length} vendor documents:`);
      documents.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.business_name || 'Unknown'} - ${doc.document_type} (${doc.verification_status})`);
      });
      
      // Get stats
      const stats = await sql`
        SELECT 
          verification_status,
          COUNT(*) as count
        FROM vendor_documents
        GROUP BY verification_status
      `;
      
      console.log('\n📊 Document Statistics:');
      stats.forEach(stat => {
        console.log(`   ${stat.verification_status}: ${stat.count}`);
      });
      
    } else {
      console.log('❌ vendor_documents table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking documents:', error.message);
  }
  
  process.exit(0);
}

checkVendorDocuments();
