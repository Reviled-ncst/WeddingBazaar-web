/**
 * Migration: Add missing columns to services table
 * - features (text array)
 * - price_range (varchar)
 * - max_price (decimal)
 * 
 * Run this script to update the production database
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const sql = neon(process.env.DATABASE_URL);

async function addMissingColumns() {
  console.log('🔧 Starting database migration...\n');

  try {
    // Check if columns exist
    console.log('1️⃣ Checking existing columns...');
    const tableInfo = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'services'
      ORDER BY ordinal_position;
    `;
    
    console.log('📊 Current columns in services table:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    const existingColumns = tableInfo.map(col => col.column_name);
    const missingColumns = [];

    // Check for features column
    if (!existingColumns.includes('features')) {
      console.log('\n⚠️  Missing column: features');
      missingColumns.push('features');
    } else {
      console.log('\n✅ Column exists: features');
    }

    // Check for price_range column
    if (!existingColumns.includes('price_range')) {
      console.log('⚠️  Missing column: price_range');
      missingColumns.push('price_range');
    } else {
      console.log('✅ Column exists: price_range');
    }

    // Check for max_price column
    if (!existingColumns.includes('max_price')) {
      console.log('⚠️  Missing column: max_price');
      missingColumns.push('max_price');
    } else {
      console.log('✅ Column exists: max_price');
    }

    if (missingColumns.length === 0) {
      console.log('\n✅ All columns already exist! No migration needed.');
      return;
    }

    console.log(`\n🔧 Need to add ${missingColumns.length} columns:`, missingColumns);
    console.log('\n2️⃣ Adding missing columns...\n');

    // Add features column (text array)
    if (missingColumns.includes('features')) {
      console.log('   Adding features column...');
      await sql`
        ALTER TABLE services 
        ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY[]::TEXT[];
      `;
      console.log('   ✅ features column added');
    }

    // Add price_range column (varchar)
    if (missingColumns.includes('price_range')) {
      console.log('   Adding price_range column...');
      await sql`
        ALTER TABLE services 
        ADD COLUMN IF NOT EXISTS price_range VARCHAR(100);
      `;
      console.log('   ✅ price_range column added');
    }

    // Add max_price column (decimal)
    if (missingColumns.includes('max_price')) {
      console.log('   Adding max_price column...');
      await sql`
        ALTER TABLE services 
        ADD COLUMN IF NOT EXISTS max_price DECIMAL(10, 2);
      `;
      console.log('   ✅ max_price column added');
    }

    // Verify columns were added
    console.log('\n3️⃣ Verifying migration...');
    const verifyInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'services'
      AND column_name IN ('features', 'price_range', 'max_price');
    `;

    console.log('📊 New columns verified:');
    verifyInfo.forEach(col => {
      console.log(`   ✅ ${col.column_name}`);
      console.log(`      Type: ${col.data_type}`);
      console.log(`      Nullable: ${col.is_nullable}`);
      console.log(`      Default: ${col.column_default || 'none'}`);
    });

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Redeploy backend to Render (or it will auto-deploy)');
    console.log('   2. Test service creation in production');
    console.log('   3. Verify pricing displays correctly');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run migration
addMissingColumns()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });
