const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixVendorDocuments() {
  try {
    console.log('🔧 Fixing vendor document mapping...');
    
    // First, let's see what documents exist
    const existingDocs = await sql`
      SELECT * FROM vendor_documents
    `;
    console.log('📋 Existing documents:', existingDocs);
    
    // Update the vendor_id from the UUID to our string ID
    const updateResult = await sql`
      UPDATE vendor_documents 
      SET vendor_id = '2-2025-001'
      WHERE vendor_id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1'
    `;
    console.log('✅ Updated documents for vendor 2-2025-001:', updateResult);
    
    // Verify the fix
    const verifyDocs = await sql`
      SELECT * FROM vendor_documents WHERE vendor_id = '2-2025-001'
    `;
    console.log('✅ Verification - Documents for 2-2025-001:', verifyDocs);
    
    // Also ensure documents are approved
    const approveResult = await sql`
      UPDATE vendor_documents 
      SET status = 'approved', 
          approved_at = NOW() 
      WHERE vendor_id = '2-2025-001'
    `;
    console.log('✅ Approved all documents for 2-2025-001:', approveResult);
    
    console.log('🎉 Vendor document mapping fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing vendor documents:', error);
  }
}

fixVendorDocuments();
