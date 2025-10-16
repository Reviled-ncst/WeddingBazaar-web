const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkDocumentsTable() {
  try {
    console.log('🔍 Checking vendor_documents table...');
    
    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'vendor_documents'
      );
    `;
    
    console.log('Table exists:', tableCheck[0].exists);
    
    if (tableCheck[0].exists) {
      // Get table structure
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'vendor_documents'
        ORDER BY ordinal_position;
      `;
      
      console.log('\n📋 Table structure:');
      columns.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
      
      // Check existing documents
      const docs = await sql`SELECT * FROM vendor_documents LIMIT 5`;
      console.log(`\n📄 Sample documents: ${docs.length} found`);
      if (docs.length > 0) {
        console.log('First document:', docs[0]);
      }
    } else {
      console.log('❌ vendor_documents table does not exist');
      console.log('Creating table...');
      
      // Create the table
      await sql`
        CREATE TABLE IF NOT EXISTS vendor_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          vendor_id UUID NOT NULL REFERENCES vendor_profiles(id),
          document_type VARCHAR(100) NOT NULL,
          document_name VARCHAR(255) NOT NULL,
          document_url TEXT NOT NULL,
          file_size BIGINT,
          mime_type VARCHAR(100),
          verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          verified_at TIMESTAMP WITH TIME ZONE,
          verified_by UUID,
          rejection_reason TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      console.log('✅ vendor_documents table created');
      
      // Create index for performance
      await sql`
        CREATE INDEX IF NOT EXISTS idx_vendor_documents_vendor_id ON vendor_documents(vendor_id);
        CREATE INDEX IF NOT EXISTS idx_vendor_documents_status ON vendor_documents(verification_status);
      `;
      
      console.log('✅ Indexes created');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDocumentsTable();
