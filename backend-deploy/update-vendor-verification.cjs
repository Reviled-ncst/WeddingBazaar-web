/**
 * Comprehensive Verification Status Update Script
 * Updates all verification flags for vendor profiles based on actual data
 */

const { sql } = require('./config/database.cjs');

async function updateVendorVerificationStatus(vendorId) {
  console.log(`\n🔍 Checking verification status for vendor: ${vendorId}\n`);
  
  try {
    // 1. Get vendor profile
    const vendorResult = await sql`
      SELECT vp.*, u.email_verified as user_email_verified, u.phone as user_phone
      FROM vendor_profiles vp
      LEFT JOIN users u ON vp.user_id = u.id
      WHERE vp.id = ${vendorId}
    `;
    
    if (vendorResult.length === 0) {
      console.log('❌ Vendor profile not found');
      return;
    }
    
    const vendor = vendorResult[0];
    console.log('📊 Current Status:', {
      email_verified: vendor.user_email_verified,
      phone_verified: vendor.phone_verified,
      business_verified: vendor.business_verified,
      documents_verified: vendor.documents_verified
    });
    
    // 2. Check documents
    const documentsResult = await sql`
      SELECT id, document_type, verification_status
      FROM vendor_documents
      WHERE vendor_id = ${vendorId}
    `;
    
    console.log(`\n📄 Found ${documentsResult.length} documents:`);
    documentsResult.forEach(doc => {
      console.log(`  - ${doc.document_type}: ${doc.verification_status}`);
    });
    
    // 3. Calculate verification statuses
    const hasApprovedDocs = documentsResult.some(doc => doc.verification_status === 'approved');
    const hasBusinessInfo = vendor.business_name && vendor.business_type;
    const hasPhone = vendor.user_phone !== null;
    const emailVerified = vendor.user_email_verified;
    
    console.log('\n🔍 Verification Analysis:');
    console.log(`  ✉️  Email Verified: ${emailVerified ? '✅' : '❌'} (from users table)`);
    console.log(`  📞 Phone Provided: ${hasPhone ? '✅' : '❌'}`);
    console.log(`  🏢 Business Info Complete: ${hasBusinessInfo ? '✅' : '❌'}`);
    console.log(`  📄 Documents Approved: ${hasApprovedDocs ? '✅' : '❌'}`);
    
    // 4. Determine overall verification status
    let overallStatus = 'unverified';
    if (hasApprovedDocs && hasBusinessInfo && emailVerified) {
      overallStatus = 'verified';
    } else if (hasApprovedDocs || hasBusinessInfo) {
      overallStatus = 'partially_verified';
    }
    
    console.log(`\n📊 Overall Status: ${overallStatus}`);
    
    // 5. Update vendor_profiles table
    console.log('\n💾 Updating vendor profile...');
    
    await sql`
      UPDATE vendor_profiles
      SET 
        phone_verified = ${hasPhone},
        business_verified = ${hasBusinessInfo},
        documents_verified = ${hasApprovedDocs},
        verification_status = ${overallStatus},
        updated_at = NOW()
      WHERE id = ${vendorId}
    `;
    
    console.log('✅ Vendor profile updated successfully!');
    
    // 6. Verify the update
    const updatedVendor = await sql`
      SELECT 
        phone_verified,
        business_verified,
        documents_verified,
        verification_status
      FROM vendor_profiles
      WHERE id = ${vendorId}
    `;
    
    console.log('\n✅ New Status:', updatedVendor[0]);
    
    return {
      success: true,
      oldStatus: {
        phone_verified: vendor.phone_verified,
        business_verified: vendor.business_verified,
        documents_verified: vendor.documents_verified,
        verification_status: vendor.verification_status
      },
      newStatus: updatedVendor[0]
    };
    
  } catch (error) {
    console.error('❌ Error updating verification status:', error);
    throw error;
  }
}

// Run for Alison Ortega
const ALISON_VENDOR_ID = '8ec9bdc9-b5a1-4048-ae34-913be59b94f5';

async function main() {
  console.log('🚀 Starting Comprehensive Verification Status Update');
  console.log('=' .repeat(60));
  
  try {
    const result = await updateVendorVerificationStatus(ALISON_VENDOR_ID);
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 Update Complete!');
    console.log('=' .repeat(60));
    
    if (result) {
      console.log('\n📊 Summary of Changes:');
      console.log('\nBefore:');
      console.log(JSON.stringify(result.oldStatus, null, 2));
      console.log('\nAfter:');
      console.log(JSON.stringify(result.newStatus, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Export for use in API or run directly
if (require.main === module) {
  main();
} else {
  module.exports = { updateVendorVerificationStatus };
}
