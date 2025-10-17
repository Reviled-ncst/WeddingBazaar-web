const { sql } = require('./backend-deploy/config/database.cjs');

async function updateDatabaseForServiceConversations() {
  console.log('=== UPDATING DATABASE FOR SERVICE-BASED CONVERSATIONS ===');
  
  try {
    console.log('\n1. Dropping old unique constraint...');
    await sql`DROP INDEX IF EXISTS idx_unique_participants`;
    console.log('✅ Old constraint dropped');
    
    console.log('\n2. Creating new service-based unique constraint...');
    // New constraint: unique combination of participants + service_name
    await sql`
      CREATE UNIQUE INDEX idx_unique_service_participants 
      ON conversations (
        LEAST(participant_id, creator_id), 
        GREATEST(participant_id, creator_id), 
        COALESCE(service_name, 'General Inquiry')
      )
    `;
    console.log('✅ New service-based constraint created');
    
    console.log('\n3. Verifying new constraint...');
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'conversations' AND indexname = 'idx_unique_service_participants';
    `;
    
    if (indexes.length > 0) {
      console.log('✅ New constraint verified:', indexes[0].indexdef);
    } else {
      console.log('❌ New constraint not found');
    }
    
    console.log('\n4. Testing the new constraint...');
    
    // Test creating two conversations with same participants but different services
    const testUserId = 'test-user-service-123';
    const testVendorId = 'test-vendor-service-456';
    
    // Clean up any existing test data first
    await sql`DELETE FROM conversations WHERE creator_id LIKE 'test-%service-%'`;
    
    // Create first conversation (Photography)
    await sql`
      INSERT INTO conversations (
        id, participant_id, participant_name, participant_type,
        creator_id, creator_type, conversation_type, 
        service_name, last_message_time, unread_count, is_online, status,
        created_at, updated_at
      ) VALUES (
        'conv_photo_test', ${testVendorId}, 'Test Vendor', 'vendor',
        ${testUserId}, 'couple', 'individual',
        'Wedding Photography', NOW(), 0, false, 'active',
        NOW(), NOW()
      )
    `;
    console.log('✅ Photography conversation created');
    
    // Create second conversation (Catering) - should work now
    await sql`
      INSERT INTO conversations (
        id, participant_id, participant_name, participant_type,
        creator_id, creator_type, conversation_type, 
        service_name, last_message_time, unread_count, is_online, status,
        created_at, updated_at
      ) VALUES (
        'conv_catering_test', ${testVendorId}, 'Test Vendor', 'vendor',
        ${testUserId}, 'couple', 'individual',
        'Wedding Catering', NOW(), 0, false, 'active',
        NOW(), NOW()
      )
    `;
    console.log('✅ Catering conversation created - service separation working!');
    
    // Try to create duplicate (should fail)
    console.log('\n5. Testing duplicate prevention...');
    try {
      await sql`
        INSERT INTO conversations (
          id, participant_id, participant_name, participant_type,
          creator_id, creator_type, conversation_type, 
          service_name, last_message_time, unread_count, is_online, status,
          created_at, updated_at
        ) VALUES (
          'conv_photo_duplicate', ${testVendorId}, 'Test Vendor', 'vendor',
          ${testUserId}, 'couple', 'individual',
          'Wedding Photography', NOW(), 0, false, 'active',
          NOW(), NOW()
        )
      `;
      console.log('❌ ERROR: Duplicate was allowed when it should have been prevented');
    } catch (error) {
      if (error.message.includes('duplicate key')) {
        console.log('✅ Duplicate correctly prevented - constraint working!');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    // Query the created conversations
    console.log('\n6. Verifying created conversations...');
    const testConversations = await sql`
      SELECT id, participant_id, creator_id, service_name
      FROM conversations
      WHERE creator_id LIKE 'test-%service-%'
      ORDER BY service_name
    `;
    
    console.log('📋 Test conversations created:');
    testConversations.forEach(conv => {
      console.log(`  ${conv.id}: ${conv.service_name} (${conv.creator_id} <-> ${conv.participant_id})`);
    });
    
    // Clean up test data
    console.log('\n7. Cleaning up test data...');
    await sql`DELETE FROM conversations WHERE creator_id LIKE 'test-%service-%'`;
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 SUCCESS: Database updated for service-based conversations!');
    console.log('   - Multiple conversations per vendor-user pair are now allowed');
    console.log('   - Each service gets its own conversation');
    console.log('   - Duplicates within the same service are still prevented');
    
  } catch (error) {
    console.error('❌ Update error:', error.message);
    console.error('Full error:', error);
  }
  
  process.exit(0);
}

updateDatabaseForServiceConversations();
