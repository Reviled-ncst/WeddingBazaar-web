// Script to check current database schema and identify missing columns
const { neon } = require('./backend-deploy/node_modules/@neondatabase/serverless');

async function checkCurrentSchema() {
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://weddingbazaar_owner:BMh24TyCwVNb@ep-green-cherry-a5mjx3ka.us-east-2.aws.neon.tech/weddingbazaar?sslmode=require';
    const sql = neon(databaseUrl);
    
    console.log('🔍 Checking current database schema...\n');
    
    try {
        // Check users table columns
        console.log('📊 Users table columns:');
        const usersColumns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users'
            ORDER BY ordinal_position;
        `;
        usersColumns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
        });
        
        console.log('\n📊 Vendor_profiles table columns:');
        const vendorColumns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'vendor_profiles'
            ORDER BY ordinal_position;
        `;
        vendorColumns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
        });
        
        console.log('\n📊 Couple_profiles table columns:');
        const coupleColumns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'couple_profiles'
            ORDER BY ordinal_position;
        `;
        coupleColumns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
        });
        
        console.log('\n📋 Existing tables:');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;
        tables.forEach(table => {
            console.log(`  - ${table.table_name}`);
        });
        
    } catch (error) {
        console.error('❌ Error checking schema:', error);
    }
}

checkCurrentSchema();
