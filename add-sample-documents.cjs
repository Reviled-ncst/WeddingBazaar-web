const { sql } = require('./backend-deploy/config/database.cjs');

async function addSampleDocuments() {
  console.log('📄 Adding sample vendor documents to database...');
  
  try {
    // First, get some real vendor IDs
    const vendors = await sql`
      SELECT vp.user_id, vp.business_name, u.first_name, u.last_name
      FROM vendor_profiles vp
      JOIN users u ON vp.user_id = u.id
      LIMIT 3
    `;
    
    console.log(`Found ${vendors.length} vendors to add documents for`);
    
    if (vendors.length === 0) {
      console.log('❌ No vendors found in database');
      return;
    }
    
    // Sample documents to add
    const sampleDocuments = [
      {
        document_type: 'Business License',
        file_name: 'business-license-2024.pdf',
        verification_status: 'pending',
        file_size: 2048576,
        mime_type: 'application/pdf'
      },
      {
        document_type: 'Insurance Certificate',
        file_name: 'insurance-certificate.pdf',
        verification_status: 'approved',
        file_size: 1536000,
        mime_type: 'application/pdf'
      },
      {
        document_type: 'Tax Registration',
        file_name: 'tax-registration.pdf',
        verification_status: 'rejected',
        file_size: 945000,
        mime_type: 'application/pdf',
        rejection_reason: 'Document is expired. Please upload a current tax registration certificate.'
      }
    ];
    
    // Add documents for each vendor
    for (let i = 0; i < Math.min(vendors.length, sampleDocuments.length); i++) {
      const vendor = vendors[i];
      const doc = sampleDocuments[i];
      
      const documentUrl = `https://cloudinary.com/wedding-docs/${vendor.user_id}/${doc.file_name}`;
      
      const result = await sql`
        INSERT INTO vendor_documents (
          id,
          vendor_id, 
          document_type, 
          document_url, 
          file_name, 
          verification_status,
          rejection_reason,
          uploaded_at,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          ${vendor.user_id}::uuid,
          ${doc.document_type},
          ${documentUrl},
          ${doc.file_name},
          ${doc.verification_status},
          ${doc.rejection_reason || null},
          NOW(),
          NOW(),
          NOW()
        ) RETURNING *
      `;
      
      console.log(`✅ Added ${doc.document_type} for ${vendor.business_name} (${doc.verification_status})`);
    }
    
    // Verify the documents were added
    const allDocs = await sql`
      SELECT 
        vd.document_type,
        vd.verification_status,
        vp.business_name
      FROM vendor_documents vd
      LEFT JOIN vendor_profiles vp ON vd.vendor_id::text = vp.user_id::text
    `;
    
    console.log(`\n📊 Total documents in database: ${allDocs.length}`);
    allDocs.forEach(doc => {
      console.log(`   ${doc.business_name}: ${doc.document_type} (${doc.verification_status})`);
    });
    
  } catch (error) {
    console.error('❌ Error adding sample documents:', error.message);
  }
  
  process.exit(0);
}

addSampleDocuments();
