const { sql } = require('./backend-deploy/config/database.cjs');

(async () => {
  try {
    console.log('🔧 Adding pricing_details column to services table...\n');
    
    // Add column
    await sql`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS pricing_details JSONB DEFAULT '{}'::jsonb
    `;
    console.log('✅ Column added');
    
    // Add index for fast querying
    await sql`
      CREATE INDEX IF NOT EXISTS idx_services_pricing_details 
      ON services USING GIN (pricing_details)
    `;
    console.log('✅ Index created');
    
    // Add comment
    await sql`
      COMMENT ON COLUMN services.pricing_details IS 
      'Structured pricing breakdown: packages, personnel, equipment, addons'
    `;
    console.log('✅ Comment added');
    
    console.log('\n🔍 Verifying column...\n');
    
    // Test it
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'services' AND column_name = 'pricing_details'
    `;
    
    if (result.length > 0) {
      console.log('✅ MIGRATION SUCCESSFUL!');
      console.log('   Column:', result[0].column_name);
      console.log('   Type:', result[0].data_type);
      console.log('   Nullable:', result[0].is_nullable);
      console.log('\n📋 Next Steps:');
      console.log('   1. Update backend-deploy/routes/services.cjs');
      console.log('   2. Update AddServiceForm.tsx');
      console.log('   3. Update ServiceCard.tsx');
      console.log('   4. Test locally');
      console.log('   5. Deploy!');
      console.log('\n📖 See: ITEMIZED_PRICING_30MIN_QUICKSTART.md\n');
    } else {
      console.error('❌ Column not found after migration!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
  
  process.exit(0);
})();
