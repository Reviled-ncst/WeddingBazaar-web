const { sql } = require('./backend-deploy/config/database.cjs');

async function checkDocumentUrls() {
  try {
    const docs = await sql`
      SELECT 
        id, 
        vendor_id, 
        document_url, 
        file_name, 
        verification_status 
      FROM vendor_documents 
      LIMIT 3
    `;
    
    console.log('📄 Document URLs:');
    docs.forEach((doc, i) => {
      console.log(`\n${i + 1}. ${doc.file_name}`);
      console.log(`   URL: ${doc.document_url}`);
      console.log(`   Vendor ID: ${doc.vendor_id}`);
      console.log(`   Status: ${doc.verification_status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDocumentUrls();
