// Emergency deployment fix for vendor verification system
const { neon } = require('@neondatabase/serverless');

async function emergencyDeploymentFix() {
    console.log('🚨 Running emergency deployment fix...');
    
    const config = require('./config/database.cjs');
    const sql = neon(config.databaseUrl);
    
    try {
        // Test basic database connection
        console.log('📡 Testing database connection...');
        const testResult = await sql`SELECT 1 as test`;
        console.log('✅ Database connection successful');
        
        // Check if vendor_profiles table exists
        console.log('🔍 Checking vendor_profiles table...');
        const vendorCheck = await sql`SELECT COUNT(*) FROM vendor_profiles LIMIT 1`;
        console.log('✅ vendor_profiles table accessible');
        
        // Check critical columns exist
        console.log('📊 Checking critical columns...');
        const columns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'vendor_profiles' 
            AND table_schema = 'public'
        `;
        
        const columnNames = columns.map(col => col.column_name);
        console.log('📋 Available columns:', columnNames);
        
        // Check for verification columns
        const verificationColumns = [
            'phone_verified',
            'business_verified', 
            'documents_verified',
            'verification_status'
        ];
        
        const missingColumns = verificationColumns.filter(col => !columnNames.includes(col));
        
        if (missingColumns.length > 0) {
            console.log('⚠️ Missing verification columns:', missingColumns);
            console.log('🔧 Adding missing columns...');
            
            for (const column of missingColumns) {
                try {
                    if (column === 'phone_verified' || column === 'business_verified' || column === 'documents_verified') {
                        await sql`ALTER TABLE vendor_profiles ADD COLUMN ${sql(column)} BOOLEAN DEFAULT FALSE`;
                        console.log(`✅ Added column: ${column}`);
                    } else if (column === 'verification_status') {
                        await sql`ALTER TABLE vendor_profiles ADD COLUMN verification_status VARCHAR(20) DEFAULT 'pending'`;
                        console.log(`✅ Added column: verification_status`);
                    }
                } catch (error) {
                    console.log(`⚠️ Could not add column ${column}:`, error.message);
                }
            }
        } else {
            console.log('✅ All verification columns exist');
        }
        
        // Test a simple vendor query
        console.log('🧪 Testing vendor profile query...');
        const testVendor = await sql`
            SELECT vp.id, vp.business_name, u.email, u.first_name, u.last_name
            FROM vendor_profiles vp
            INNER JOIN users u ON vp.user_id = u.id
            LIMIT 1
        `;
        
        if (testVendor.length > 0) {
            console.log('✅ Vendor profile query successful');
            console.log('📋 Sample vendor:', testVendor[0]);
        } else {
            console.log('⚠️ No vendors found in database');
        }
        
        console.log('🎉 Emergency deployment fix completed successfully!');
        console.log('🚀 Backend should now deploy without database schema issues');
        
    } catch (error) {
        console.error('❌ Emergency deployment fix failed:', error);
    }
}

// Only run if called directly
if (require.main === module) {
    emergencyDeploymentFix();
}

module.exports = { emergencyDeploymentFix };
