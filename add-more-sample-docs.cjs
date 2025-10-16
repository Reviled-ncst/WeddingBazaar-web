const { sql } = require('./backend-deploy/config/database.cjs');

async function addMoreSampleDocuments() {
  console.log('📄 Adding more sample documents...');
  
  try {
    // Get the vendor profile
    const profiles = await sql`
      SELECT id, user_id, business_name
      FROM vendor_profiles
      LIMIT 1
    `;
    
    if (profiles.length === 0) {
      console.log('❌ No vendor profiles found');
      return;
    }
    
    const vendorProfileId = profiles[0].id;
    const businessName = profiles[0].business_name;
    
    console.log(`Adding documents for: ${businessName}`);
    
    // Add more sample documents with different statuses
    const documents = [
      {
        document_type: 'Insurance Certificate',
        file_name: 'insurance-certificate-2024.pdf',
        verification_status: 'approved',
        document_url: 'https://cloudinary.com/wedding-docs/insurance-cert.pdf'
      },
      {
        document_type: 'Tax Registration',
        file_name: 'tax-registration.pdf',
        verification_status: 'rejected',
        document_url: 'https://cloudinary.com/wedding-docs/tax-reg.pdf',
        rejection_reason: 'Document is expired. Please upload a current tax registration certificate valid for 2024.'
      },
      {
        document_type: 'Professional License',
        file_name: 'professional-license.pdf',
        verification_status: 'pending',
        document_url: 'https://cloudinary.com/wedding-docs/prof-license.pdf'
      }
    ];
    
    for (const doc of documents) {
      const daysAgo = Math.floor(Math.random() * 7);
      
      const result = await sql`
        INSERT INTO vendor_documents (
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
          ${vendorProfileId},
          ${doc.document_type},
          ${doc.document_url},
          ${doc.file_name},
          ${doc.verification_status},
          ${doc.rejection_reason || null},
          NOW() - INTERVAL '${daysAgo} days',
          NOW(),
          NOW()
        ) RETURNING id, document_type, verification_status
      `;
      
      console.log(`✅ Added: ${result[0].document_type} (${result[0].verification_status})`);
    }
    
    // Verify all documents
    const allDocs = await sql`
      SELECT 
        vd.document_type,
        vd.verification_status,
        vd.uploaded_at,
        vp.business_name
      FROM vendor_documents vd
      JOIN vendor_profiles vp ON vd.vendor_id = vp.id
      ORDER BY vd.uploaded_at DESC
    `;
    
    console.log(`\n📊 Total documents in database: ${allDocs.length}`);
    allDocs.forEach((doc, index) => {
      const uploadDate = new Date(doc.uploaded_at).toLocaleDateString();
      console.log(`${index + 1}. ${doc.document_type} (${doc.verification_status}) - ${uploadDate}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

addMoreSampleDocuments();
