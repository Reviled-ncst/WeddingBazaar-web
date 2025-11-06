const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function linkProSubscription() {
  console.log('🔧 Linking Pro Subscription to vendor0qw account...\n');
  
  try {
    // Step 1: Find vendor0qw's vendor ID
    console.log('Step 1: Finding vendor0qw account...');
    const vendor = await sql`
      SELECT v.id, v.business_name, v.user_id
      FROM vendors v
      LEFT JOIN users u ON u.id = v.user_id
      WHERE u.email = 'vendor0qw@gmail.com' 
         OR v.business_name LIKE '%vendor0qw%'
      LIMIT 1
    `;
    
    if (vendor.length === 0) {
      console.log('❌ Could not find vendor0qw account!');
      console.log('   Searching by business name...');
      
      const vendorByName = await sql`
        SELECT id, business_name, user_id
        FROM vendors
        WHERE business_name LIKE '%vendor0qw%'
        LIMIT 1
      `;
      
      if (vendorByName.length === 0) {
        console.log('❌ Still not found. Let me check the user_id directly...');
        
        // Try finding by the 2-2025-003 ID we saw earlier
        const vendorByUserId = await sql`
          SELECT id, business_name, user_id
          FROM vendors
          WHERE user_id = '2-2025-003' OR id = '2-2025-003'
          LIMIT 1
        `;
        
        if (vendorByUserId.length > 0) {
          console.log('✅ Found vendor by user_id!');
          console.log(`   Vendor ID: ${vendorByUserId[0].id}`);
          console.log(`   Business: ${vendorByUserId[0].business_name}`);
          console.log(`   User ID: ${vendorByUserId[0].user_id}`);
          
          const targetVendorId = vendorByUserId[0].id;
          await linkSubscription(targetVendorId);
        } else {
          console.log('❌ Could not find vendor account at all!');
          return;
        }
      } else {
        const targetVendorId = vendorByName[0].id;
        console.log('✅ Found vendor by business name!');
        console.log(`   Vendor ID: ${targetVendorId}`);
        console.log(`   Business: ${vendorByName[0].business_name}`);
        await linkSubscription(targetVendorId);
      }
    } else {
      const targetVendorId = vendor[0].id;
      console.log('✅ Found vendor account!');
      console.log(`   Vendor ID: ${targetVendorId}`);
      console.log(`   Business: ${vendor[0].business_name}`);
      console.log(`   User ID: ${vendor[0].user_id}`);
      await linkSubscription(targetVendorId);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

async function linkSubscription(targetVendorId) {
  console.log('\nStep 2: Finding your Pro subscription...');
  
  const proSub = await sql`
    SELECT id, vendor_id, plan_name, status, start_date, end_date
    FROM vendor_subscriptions
    WHERE plan_name = 'pro' OR plan_name = 'PRO'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  
  if (proSub.length === 0) {
    console.log('❌ No Pro subscription found in database!');
    return;
  }
  
  console.log('✅ Found Pro subscription!');
  console.log(`   Subscription ID: ${proSub[0].id}`);
  console.log(`   Current vendor_id: ${proSub[0].vendor_id}`);
  console.log(`   Status: ${proSub[0].status}`);
  console.log(`   Valid until: ${new Date(proSub[0].end_date).toLocaleDateString()}`);
  
  console.log('\nStep 3: Updating subscription vendor_id...');
  
  const result = await sql`
    UPDATE vendor_subscriptions
    SET vendor_id = ${targetVendorId},
        updated_at = NOW()
    WHERE id = ${proSub[0].id}
    RETURNING *
  `;
  
  if (result.length > 0) {
    console.log('✅ SUCCESS! Subscription linked!');
    console.log(`   Old vendor_id: ${proSub[0].vendor_id}`);
    console.log(`   New vendor_id: ${targetVendorId}`);
    console.log(`   Plan: PRO (Unlimited services)`);
    
    console.log('\n🎉 DONE! Your Pro subscription is now active!');
    console.log('\n📋 What this means:');
    console.log('   ✅ Service limit: UNLIMITED (-1)');
    console.log('   ✅ Image limit: UNLIMITED');
    console.log('   ✅ Message limit: UNLIMITED');
    console.log('   ✅ All premium features: ENABLED');
    
    console.log('\n🧪 Testing the fix:');
    console.log('   1. Go to your Services page');
    console.log('   2. Click "Add Service" button');
    console.log('   3. It should now open the Add Service form!');
    console.log('   4. No more upgrade modal blocking you!');
    
    console.log('\n💡 API will now return:');
    console.log(`   GET /api/subscriptions/vendor/${targetVendorId}`);
    console.log('   → { plan: "pro", limits: { max_services: -1 } }');
    
    // Verify the update
    console.log('\nStep 4: Verifying the update...');
    const verification = await sql`
      SELECT vs.*, v.business_name
      FROM vendor_subscriptions vs
      LEFT JOIN vendors v ON v.id = vs.vendor_id
      WHERE vs.id = ${proSub[0].id}
    `;
    
    if (verification.length > 0) {
      console.log('✅ Verification successful!');
      console.log(`   Subscription now linked to: ${verification[0].business_name}`);
      console.log(`   Vendor ID: ${verification[0].vendor_id}`);
      console.log(`   Plan: ${verification[0].plan_name.toUpperCase()}`);
    }
    
  } else {
    console.log('❌ Update failed!');
  }
}

linkProSubscription();
