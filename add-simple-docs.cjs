const { sql } = require('./backend-deploy/config/database.cjs');

async function addSimpleDocuments() {
  console.log('📄 Adding simple sample documents...');
  
  try {
    // Get the vendor profile
    const profiles = await sql`SELECT id, business_name FROM vendor_profiles LIMIT 1`;
    const vendorId = profiles[0].id;
    
    console.log(`Adding documents for: ${profiles[0].business_name}`);
    
    // Add documents one by one
    await sql`
      INSERT INTO vendor_documents (vendor_id, document_type, document_url, file_name, verification_status)
      VALUES (${vendorId}, 'Insurance Certificate', 'https://example.com/insurance.pdf', 'insurance-2024.pdf', 'approved')
    `;
    console.log('✅ Added Insurance Certificate (approved)');
    
    await sql`
      INSERT INTO vendor_documents (vendor_id, document_type, document_url, file_name, verification_status, rejection_reason)
      VALUES (${vendorId}, 'Tax Registration', 'https://example.com/tax.pdf', 'tax-reg.pdf', 'rejected', 'Document expired')
    `;
    console.log('✅ Added Tax Registration (rejected)');
    
    await sql`
      INSERT INTO vendor_documents (vendor_id, document_type, document_url, file_name, verification_status)
      VALUES (${vendorId}, 'Professional License', 'https://example.com/license.pdf', 'prof-license.pdf', 'pending')
    `;
    console.log('✅ Added Professional License (pending)');
    
    // Check final count
    const count = await sql`SELECT COUNT(*) as count FROM vendor_documents`;
    console.log(`\n📊 Total documents in database: ${count[0].count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

addSimpleDocuments();
