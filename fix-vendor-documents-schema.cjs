const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addMissingColumns() {
    console.log('🔧 Adding missing columns to vendor_documents table...');
    
    try {
        // Add file_size and mime_type columns if they don't exist
        await sql`
            ALTER TABLE vendor_documents 
            ADD COLUMN IF NOT EXISTS file_size BIGINT,
            ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100)
        `;
        
        console.log('✅ Added file_size and mime_type columns');
        
        // Check the current schema
        const schema = await sql`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'vendor_documents'
            ORDER BY ordinal_position
        `;
        
        console.log('📊 Current vendor_documents schema:');
        schema.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
        
    } catch (error) {
        console.error('❌ Error adding columns:', error);
    }
}

addMissingColumns().then(() => {
    console.log('✅ Schema update complete');
    process.exit(0);
}).catch(error => {
    console.error('❌ Schema update failed:', error);
    process.exit(1);
});
