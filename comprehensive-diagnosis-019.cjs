require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('\n🔍 COMPREHENSIVE DIAGNOSIS FOR USER 2-2025-019');
  console.log('='.repeat(70));
  
  try {
    const userId = '2-2025-019';
    const vendorUUID = '8666acb0-9ded-4487-bb5e-c33860d499d1';
    const venId = 'VEN-00021';
    
    // ================== PART 1: CHECK ALL 3 TABLES ==================
    console.log('\n📊 PART 1: DATABASE STATUS CHECK');
    console.log('-'.repeat(70));
    
    // 1. Users table
    console.log('\n1️⃣ USERS TABLE:');
    const user = await sql`
      SELECT id, email, first_name, last_name, role, email_verified, created_at
      FROM users
      WHERE id = ${userId}
    `;
    console.log(JSON.stringify(user, null, 2));
    
    // 2. Vendor_profiles table (NEW SYSTEM)
    console.log('\n2️⃣ VENDOR_PROFILES TABLE (NEW SYSTEM):');
    const vendorProfile = await sql`
      SELECT 
        id,
        user_id,
        business_name,
        business_type,
        vendor_type,
        business_verified,
        documents_verified,
        verification_status,
        created_at,
        updated_at
      FROM vendor_profiles
      WHERE user_id = ${userId}
    `;
    console.log(JSON.stringify(vendorProfile, null, 2));
    
    // 3. Vendors table (LEGACY SYSTEM)
    console.log('\n3️⃣ VENDORS TABLE (LEGACY SYSTEM):');
    const vendor = await sql`
      SELECT id, user_id, business_name, business_type, created_at
      FROM vendors
      WHERE user_id = ${userId}
    `;
    console.log(JSON.stringify(vendor, null, 2));
    
    // 4. Vendor documents
    console.log('\n4️⃣ VENDOR_DOCUMENTS TABLE:');
    const docs = await sql`
      SELECT 
        id,
        vendor_id,
        document_type,
        document_url,
        verification_status,
        uploaded_at,
        verified_at,
        rejection_reason
      FROM vendor_documents
      WHERE vendor_id = ${vendorUUID}
      ORDER BY uploaded_at DESC
    `;
    console.log(`Found ${docs.length} documents:`);
    console.log(JSON.stringify(docs, null, 2));
    
    // ================== PART 2: ANALYZE THE DATA ==================
    console.log('\n📋 PART 2: DATA ANALYSIS');
    console.log('-'.repeat(70));
    
    const issues = [];
    const fixes = [];
    
    // Check vendor_profiles verification status
    if (vendorProfile.length > 0) {
      const vp = vendorProfile[0];
      console.log('\n✅ Vendor Profile EXISTS');
      console.log(`   - Business Verified: ${vp.business_verified}`);
      console.log(`   - Documents Verified: ${vp.documents_verified}`);
      console.log(`   - Verification Status: ${vp.verification_status}`);
      console.log(`   - Vendor Type: ${vp.vendor_type || 'NOT SET'}`);
      
      // Check if verification is correct
      if (!vp.business_verified || !vp.documents_verified) {
        issues.push('❌ Verification flags are FALSE in vendor_profiles');
        fixes.push('Run: node fix-verification-019.cjs');
      }
      
      if (vp.verification_status !== 'verified') {
        issues.push('❌ Verification status is not "verified"');
        fixes.push('Update verification_status to "verified"');
      }
    } else {
      issues.push('❌ NO VENDOR PROFILE FOUND');
      fixes.push('Create vendor profile for this user');
    }
    
    // Check documents
    if (docs.length > 0) {
      console.log('\n✅ Documents EXIST');
      const allApproved = docs.every(d => d.verification_status === 'approved');
      console.log(`   - All Approved: ${allApproved}`);
      
      if (!allApproved) {
        issues.push('❌ Some documents are not approved');
        fixes.push('Approve all documents in admin panel or run fix script');
      }
      
      docs.forEach(d => {
        console.log(`   - ${d.document_type}: ${d.verification_status}`);
      });
    } else {
      issues.push('❌ NO DOCUMENTS FOUND');
      fixes.push('Upload business documents');
    }
    
    // ================== PART 3: WHAT THE FRONTEND SEES ==================
    console.log('\n🖥️  PART 3: WHAT THE FRONTEND WILL SEE');
    console.log('-'.repeat(70));
    
    if (vendorProfile.length > 0) {
      const vp = vendorProfile[0];
      console.log('\nWhen frontend calls: GET /api/vendor-profile/2-2025-019');
      console.log('It should receive:');
      console.log({
        businessVerified: vp.business_verified,
        documentsVerified: vp.documents_verified,
        overallVerificationStatus: vp.verification_status,
        emailVerified: user[0]?.email_verified || false
      });
      
      const canAddServices = vp.business_verified && vp.documents_verified && (user[0]?.email_verified || false);
      console.log(`\n${canAddServices ? '✅' : '❌'} Can Add Services: ${canAddServices}`);
      
      if (!canAddServices) {
        console.log('\nREASONS:');
        if (!user[0]?.email_verified) console.log('  - Email not verified');
        if (!vp.business_verified) console.log('  - Business not verified');
        if (!vp.documents_verified) console.log('  - Documents not verified');
      }
    }
    
    // ================== PART 4: SUMMARY & ACTION ITEMS ==================
    console.log('\n📝 PART 4: SUMMARY & ACTION ITEMS');
    console.log('='.repeat(70));
    
    if (issues.length === 0) {
      console.log('\n🎉 NO ISSUES FOUND! Everything looks good.');
      console.log('\nVendor should be able to:');
      console.log('  ✅ View their profile');
      console.log('  ✅ Add services (if email verified)');
      console.log('  ✅ Manage their business');
    } else {
      console.log('\n⚠️  ISSUES FOUND:');
      issues.forEach((issue, i) => {
        console.log(`\n${i + 1}. ${issue}`);
      });
      
      console.log('\n💡 RECOMMENDED FIXES:');
      fixes.forEach((fix, i) => {
        console.log(`\n${i + 1}. ${fix}`);
      });
      
      console.log('\n🔧 QUICK FIX COMMAND:');
      console.log('   node fix-verification-019.cjs');
    }
    
    // ================== PART 5: BACKEND ENDPOINT STATUS ==================
    console.log('\n🌐 PART 5: BACKEND ENDPOINT STATUS');
    console.log('-'.repeat(70));
    console.log('\nThese endpoints should work:');
    console.log(`  ✅ GET ${process.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com'}/api/vendor-profile/${userId}`);
    console.log(`  ✅ GET ${process.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com'}/api/vendor-profile/${vendorUUID}`);
    console.log(`  ✅ GET ${process.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com'}/api/vendor-profile/${venId}` + ' (after ID mapping fix)');
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ DIAGNOSIS COMPLETE!\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
})();
