const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

/**
 * 🎯 Add Completion Proof Columns Migration
 * 
 * This script adds support for image/video proof when marking bookings as complete.
 * Vendors can upload photos/videos as proof of service delivery.
 */

async function addCompletionProofColumns() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🚀 [Migration] Starting completion proof columns migration...');
  
  try {
    // Add vendor_completion_proof column
    await sql`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS vendor_completion_proof JSONB DEFAULT '[]'::jsonb
    `;
    console.log('✅ Added vendor_completion_proof column');
    
    // Add couple_completion_proof column (optional)
    await sql`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS couple_completion_proof JSONB DEFAULT '[]'::jsonb
    `;
    console.log('✅ Added couple_completion_proof column');
    
    // Add vendor_completion_notes column
    await sql`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS vendor_completion_notes TEXT
    `;
    console.log('✅ Added vendor_completion_notes column');
    
    // Add couple_completion_notes column
    await sql`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS couple_completion_notes TEXT
    `;
    console.log('✅ Added couple_completion_notes column');
    
    // Create index for better query performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_bookings_completion_proof 
      ON bookings USING GIN (vendor_completion_proof)
    `;
    console.log('✅ Created GIN index on vendor_completion_proof');
    
    // Verify the changes
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      AND column_name IN (
        'vendor_completion_proof',
        'couple_completion_proof',
        'vendor_completion_notes',
        'couple_completion_notes'
      )
      ORDER BY column_name
    `;
    
    console.log('\n📊 [Verification] Added columns:');
    result.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    // Test query to ensure columns work
    const testQuery = await sql`
      SELECT 
        id,
        vendor_completed,
        couple_completed,
        vendor_completion_proof,
        couple_completion_proof,
        vendor_completion_notes,
        couple_completion_notes
      FROM bookings
      WHERE vendor_completed = TRUE OR couple_completed = TRUE
      LIMIT 5
    `;
    
    console.log(`\n✅ [Test Query] Successfully queried ${testQuery.length} completed bookings`);
    
    console.log('\n🎉 [Success] Completion proof columns migration completed!');
    console.log('\n📝 [Usage] Example data structure:');
    console.log(`
    {
      "images": [
        {
          "url": "https://res.cloudinary.com/...",
          "publicId": "wedding-proof-123",
          "uploadedAt": "2025-10-28T10:00:00Z",
          "fileType": "image/jpeg",
          "size": 1024000,
          "description": "Final setup photo"
        }
      ],
      "videos": [
        {
          "url": "https://res.cloudinary.com/...",
          "publicId": "wedding-video-123",
          "uploadedAt": "2025-10-28T10:05:00Z",
          "fileType": "video/mp4",
          "size": 5120000,
          "duration": 30,
          "description": "Event highlights"
        }
      ]
    }
    `);
    
  } catch (error) {
    console.error('❌ [Error] Migration failed:', error);
    throw error;
  }
}

// Run migration
addCompletionProofColumns()
  .then(() => {
    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
