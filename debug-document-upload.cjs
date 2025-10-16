const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://weddingbazaar_db_owner:KrMz4W5f0pD6@ep-frosty-river-a5s0kskp.us-east-2.aws.neon.tech/weddingbazaar_db?sslmode=require',
    ssl: {
        rejectUnauthorized: false
    }
});

async function debugDocumentUpload() {
    console.log('🔍 Debugging document upload endpoint...');
    
    try {
        // First, check the current vendor from the screenshot
        console.log('\n📋 Checking vendor authentication state...');
        
        // Check available vendors
        const vendorsResult = await pool.query(`
            SELECT id, first_name, last_name, business_name, user_type 
            FROM vendors 
            ORDER BY created_at DESC
        `);
        
        console.log(`✅ Found ${vendorsResult.rows.length} vendors:`);
        vendorsResult.rows.forEach(vendor => {
            console.log(`  - ${vendor.first_name} ${vendor.last_name} (${vendor.business_name}) - ID: ${vendor.id} - Type: ${vendor.user_type}`);
        });
        
        // Check vendor_documents schema
        console.log('\n📊 Checking vendor_documents table schema...');
        const schemaResult = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'vendor_documents'
            ORDER BY ordinal_position
        `);
        
        console.log('✅ vendor_documents schema:');
        schemaResult.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
        
        // Test document insert with the vendor ID from the screenshot
        console.log('\n🧪 Testing document insert...');
        const testVendorId = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1'; // From debug results above
        
        const insertResult = await pool.query(`
            INSERT INTO vendor_documents (
                vendor_id, 
                document_type, 
                document_url, 
                file_name, 
                file_size, 
                mime_type
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [
            testVendorId,
            'Test Upload Debug',
            'https://res.cloudinary.com/test/image/upload/v123/test.pdf',
            'debug-test.pdf',
            123456,
            'application/pdf'
        ]);
        
        console.log('✅ Test document inserted successfully:');
        console.log(insertResult.rows[0]);
        
        // Clean up test document
        await pool.query('DELETE FROM vendor_documents WHERE id = $1', [insertResult.rows[0].id]);
        console.log('🧹 Test document cleaned up');
        
    } catch (error) {
        console.error('❌ Error during debug:', error);
        console.error('Stack trace:', error.stack);
    }
}

debugDocumentUpload().then(() => {
    console.log('\n✅ Debug complete');
    process.exit(0);
}).catch(error => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
});
