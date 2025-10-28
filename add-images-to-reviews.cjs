const { sql } = require('./backend-deploy/config/database.cjs');

async function addImagesToReviews() {
  try {
    console.log('🔧 Adding images column to reviews table...');
    
    // Check if column already exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reviews' AND column_name = 'images'
    `;
    
    if (columnCheck.length > 0) {
      console.log('✅ images column already exists');
      
      // Check current type
      const typeCheck = await sql`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' AND column_name = 'images'
      `;
      console.log('📋 Current type:', typeCheck[0].data_type);
      
      process.exit(0);
    }
    
    // Add the column as TEXT array
    await sql`
      ALTER TABLE reviews 
      ADD COLUMN images TEXT[]
    `;
    
    console.log('✅ images column added successfully');
    
    // Verify
    const verify = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reviews' AND column_name = 'images'
    `;
    
    console.log('📋 Verification:', verify[0]);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addImagesToReviews();
