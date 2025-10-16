const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function checkCoupleProfilesTable() {
  console.log('🔍 Checking couple_profiles table...');
  
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Check if couple_profiles table exists
    const tableExists = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'couple_profiles';
    `;
    
    console.log(`Couple_profiles table exists: ${tableExists.length > 0 ? '✅' : '❌'}`);
    
    if (tableExists.length > 0) {
      // Check columns in couple_profiles table
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'couple_profiles' 
        ORDER BY ordinal_position;
      `;
      
      console.log('\\n📋 Couple_profiles table columns:');
      console.log(columns);
      
      // Check if there are any couple profiles
      const coupleData = await sql`
        SELECT id, user_id, created_at 
        FROM couple_profiles 
        LIMIT 3;
      `;
      
      console.log('\\n📋 Existing couple profiles:');
      console.log(coupleData);
    } else {
      console.log('\\n🔧 Creating couple_profiles table...');
      
      await sql`
        CREATE TABLE couple_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) NOT NULL,
          wedding_date DATE,
          budget DECIMAL(12,2),
          guest_count INTEGER,
          venue_type VARCHAR(100),
          style_preferences TEXT,
          notes TEXT,
          phone_verified BOOLEAN DEFAULT FALSE,
          partner_first_name VARCHAR(100),
          partner_last_name VARCHAR(100),
          partner_phone VARCHAR(20),
          partner_email VARCHAR(255),
          wedding_theme VARCHAR(100),
          special_requirements TEXT,
          profile_image VARCHAR(255),
          cover_image VARCHAR(255),
          preferred_vendors TEXT[],
          communication_preference VARCHAR(20) DEFAULT 'email',
          newsletter_subscribed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `;
      
      console.log('   ✅ Created couple_profiles table');
      
      // Create a sample couple profile for testing
      const sampleCouple = await sql`
        INSERT INTO couple_profiles 
        (user_id, wedding_date, budget, guest_count, venue_type, style_preferences)
        VALUES 
        ('test-couple-123', '2024-12-31', 50000, 100, 'Garden', 'Romantic outdoor wedding')
        RETURNING id, user_id;
      `;
      
      console.log('   ✅ Created sample couple profile:', sampleCouple[0]);
    }
    
  } catch (error) {
    console.error('❌ Error checking couple_profiles table:', error);
    console.error('Error details:', error.message);
  }
}

checkCoupleProfilesTable();
