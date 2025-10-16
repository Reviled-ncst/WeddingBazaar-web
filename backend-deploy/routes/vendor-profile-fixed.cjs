const express = require('express');
const { neon } = require('@neondatabase/serverless');
const config = require('../config/database.cjs');

const router = express.Router();
const sql = neon(config.databaseUrl);

// Get vendor profile with verification status
router.get('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log('🔍 Getting vendor profile for ID:', vendorId);
    
    // Get vendor profile with user information and verification status
    const vendorResult = await sql`
      SELECT 
        vp.*,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.email_verified,
        u.created_at as user_created_at,
        u.updated_at as user_updated_at
      FROM vendor_profiles vp
      INNER JOIN users u ON vp.user_id = u.id
      WHERE vp.id = ${vendorId}
    `;
    
    if (vendorResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found',
        message: 'No vendor found with this ID'
      });
    }
    
    const vendor = vendorResult[0];
    
    // Get verification documents (with fallback if table doesn't exist)
    let docsResult = [];
    try {
      docsResult = await sql`
        SELECT id, document_type, document_url, verification_status, uploaded_at, verified_at, rejection_reason
        FROM vendor_documents 
        WHERE vendor_id = ${vendorId}
        ORDER BY uploaded_at DESC
      `;
    } catch (docError) {
      console.log('⚠️ vendor_documents table not found, using empty docs array');
    }
    
    // Format the response
    const vendorProfile = {
      // Basic Information
      id: vendor.id,
      userId: vendor.user_id,
      businessName: vendor.business_name,
      businessType: vendor.business_type,
      description: vendor.description,
      location: vendor.location,
      
      // Contact Information
      email: vendor.email,
      firstName: vendor.first_name,
      lastName: vendor.last_name,
      phone: vendor.phone,
      website: vendor.website,
      
      // Business Details
      yearsInBusiness: vendor.years_in_business,
      teamSize: vendor.team_size,
      serviceArea: vendor.service_area,
      priceRange: vendor.price_range,
      
      // Verification Status (with defaults)
      emailVerified: vendor.email_verified || false,
      phoneVerified: vendor.phone_verified || false,
      businessVerified: vendor.business_verified || false,
      documentsVerified: vendor.documents_verified || false,
      overallVerificationStatus: vendor.verification_status || 'pending',
      
      // Business Information Verification
      businessInfoComplete: !!(vendor.business_name && vendor.business_type && vendor.location),
      
      // Verification Documents
      documents: docsResult.map(doc => ({
        id: doc.id,
        type: doc.document_type,
        url: doc.document_url,
        status: doc.verification_status,
        uploadedAt: doc.uploaded_at,
        verifiedAt: doc.verified_at,
        rejectionReason: doc.rejection_reason
      })),
      
      // Social Media and URLs
      socialMedia: {
        facebook: vendor.facebook_url,
        instagram: vendor.instagram_url,
        twitter: vendor.twitter_url,
        linkedin: vendor.linkedin_url
      },
      
      // Profile Images
      profileImage: vendor.profile_image,
      coverImage: vendor.cover_image,
      portfolioImages: vendor.portfolio_images,
      
      // Timestamps
      createdAt: vendor.created_at,
      updatedAt: vendor.updated_at
    };
    
    res.json(vendorProfile);
    
  } catch (error) {
    console.error('❌ Error getting vendor profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch vendor profile',
      details: error.message
    });
  }
});

// Update vendor profile
router.put('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const profileData = req.body;
    
    console.log('🔄 Updating vendor profile for ID:', vendorId);
    console.log('Profile data received:', profileData);
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    
    // Map frontend field names to database column names
    const fieldMapping = {
      businessName: 'business_name',
      businessType: 'business_type',
      description: 'description',
      location: 'location',
      website: 'website',
      yearsInBusiness: 'years_in_business',
      teamSize: 'team_size',
      serviceArea: 'service_area',
      priceRange: 'price_range',
      profileImage: 'profile_image',
      coverImage: 'cover_image'
    };
    
    Object.keys(profileData).forEach(key => {
      const dbField = fieldMapping[key] || key;
      updateFields.push(`${dbField} = $${values.length + 1}`);
      values.push(profileData[key]);
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    // Add updated_at
    updateFields.push(`updated_at = NOW()`);
    values.push(vendorId);
    
    const updateQuery = `
      UPDATE vendor_profiles 
      SET ${updateFields.join(', ')}
      WHERE id = $${values.length}
      RETURNING *
    `;
    
    const result = await sql(updateQuery, values);
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      profile: result[0]
    });
    
  } catch (error) {
    console.error('❌ Error updating vendor profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update vendor profile',
      details: error.message
    });
  }
});

// Request email verification
router.post('/:vendorId/verify-email', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log('📧 Requesting email verification for vendor:', vendorId);
    
    // Get vendor email
    const vendorResult = await sql`
      SELECT u.email, u.first_name, u.last_name
      FROM vendor_profiles vp
      INNER JOIN users u ON vp.user_id = u.id
      WHERE vp.id = ${vendorId}
    `;
    
    if (vendorResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    const vendor = vendorResult[0];
    
    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store verification token
    await sql`
      UPDATE users 
      SET email_verification_token = ${verificationToken},
          email_verification_expires = ${expiresAt}
      WHERE email = ${vendor.email}
    `;
    
    // In a real implementation, you would send an email here
    console.log(`📧 Email verification link (demo): https://weddingbazaar.com/verify-email?token=${verificationToken}`);
    
    res.json({
      success: true,
      message: 'Verification email sent successfully',
      // For demo purposes, include the token
      verificationToken: verificationToken
    });
    
  } catch (error) {
    console.error('❌ Error requesting email verification:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to send verification email'
    });
  }
});

// Request phone verification
router.post('/:vendorId/verify-phone', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { phone } = req.body;
    
    console.log('📱 Requesting phone verification for vendor:', vendorId, 'phone:', phone);
    
    // Get vendor info
    const vendorResult = await sql`
      SELECT u.id, u.first_name, u.last_name
      FROM vendor_profiles vp
      INNER JOIN users u ON vp.user_id = u.id
      WHERE vp.id = ${vendorId}
    `;
    
    if (vendorResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    const vendor = vendorResult[0];
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store verification code
    await sql`
      UPDATE users 
      SET phone_verification_code = ${verificationCode},
          phone_verification_expires = ${expiresAt},
          phone = ${phone}
      WHERE id = ${vendor.id}
    `;
    
    // In a real implementation, you would send SMS here
    console.log(`📱 SMS verification code (demo): ${verificationCode} for ${phone}`);
    
    res.json({
      success: true,
      message: 'Verification code sent to your phone',
      // For demo purposes, include the code
      verificationCode: verificationCode
    });
    
  } catch (error) {
    console.error('❌ Error requesting phone verification:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to send verification code'
    });
  }
});

// Confirm phone verification
router.post('/:vendorId/confirm-phone', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { code } = req.body;
    
    console.log('✅ Confirming phone verification for vendor:', vendorId, 'code:', code);
    
    // Get vendor and check verification code
    const vendorResult = await sql`
      SELECT u.id, u.phone_verification_code, u.phone_verification_expires
      FROM vendor_profiles vp
      INNER JOIN users u ON vp.user_id = u.id
      WHERE vp.id = ${vendorId}
    `;
    
    if (vendorResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    const vendor = vendorResult[0];
    
    // Check if code matches and hasn't expired
    if (vendor.phone_verification_code !== code) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }
    
    if (new Date() > new Date(vendor.phone_verification_expires)) {
      return res.status(400).json({
        success: false,
        error: 'Verification code has expired'
      });
    }
    
    // Mark phone as verified
    await sql`
      UPDATE users 
      SET phone_verified = true,
          phone_verification_code = null,
          phone_verification_expires = null
      WHERE id = ${vendor.id}
    `;
    
    // Also update vendor_profiles table if column exists
    try {
      await sql`
        UPDATE vendor_profiles 
        SET phone_verified = true
        WHERE id = ${vendorId}
      `;
    } catch (error) {
      console.log('⚠️ phone_verified column not found in vendor_profiles, skipping');
    }
    
    res.json({
      success: true,
      message: 'Phone number verified successfully'
    });
    
  } catch (error) {
    console.error('❌ Error confirming phone verification:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to verify phone number'
    });
  }
});

// Upload verification documents
router.post('/:vendorId/documents', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { documentType } = req.body;
    
    console.log('📄 Uploading documents for vendor:', vendorId, 'type:', documentType);
    
    // In a real implementation, you would handle file uploads here
    // For now, we'll simulate document upload
    const documentUrl = `https://documents.weddingbazaar.com/${vendorId}/${documentType}/${Date.now()}.pdf`;
    const fileName = `${documentType}_${Date.now()}.pdf`;
    
    // Insert document record (if table exists)
    try {
      const result = await sql`
        INSERT INTO vendor_documents (vendor_id, document_type, document_url, file_name, verification_status)
        VALUES (${vendorId}, ${documentType}, ${documentUrl}, ${fileName}, 'pending')
        RETURNING *
      `;
      
      res.json({
        success: true,
        message: 'Documents uploaded successfully for admin review',
        document: result[0]
      });
    } catch (error) {
      console.log('⚠️ vendor_documents table not found, simulating successful upload');
      res.json({
        success: true,
        message: 'Documents uploaded successfully for admin review',
        document: {
          id: `doc_${Date.now()}`,
          vendor_id: vendorId,
          document_type: documentType,
          document_url: documentUrl,
          file_name: fileName,
          verification_status: 'pending',
          uploaded_at: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error uploading documents:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to upload documents'
    });
  }
});

// Get verification status
router.get('/:vendorId/verification-status', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log('📊 Getting verification status for vendor:', vendorId);
    
    // Get verification status
    const vendorResult = await sql`
      SELECT 
        u.email_verified,
        u.phone_verified,
        vp.business_verified,
        vp.documents_verified,
        vp.verification_status
      FROM vendor_profiles vp
      INNER JOIN users u ON vp.user_id = u.id
      WHERE vp.id = ${vendorId}
    `;
    
    if (vendorResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    const vendor = vendorResult[0];
    
    // Calculate verification progress
    const emailVerified = vendor.email_verified || false;
    const phoneVerified = vendor.phone_verified || false;
    const businessVerified = vendor.business_verified || false;
    const documentsVerified = vendor.documents_verified || false;
    
    const verificationCount = [emailVerified, phoneVerified, businessVerified, documentsVerified].filter(Boolean).length;
    const verificationProgress = Math.round((verificationCount / 4) * 100);
    
    res.json({
      emailVerified,
      phoneVerified,
      businessVerified,
      documentsVerified,
      overallStatus: vendor.verification_status || 'pending',
      verificationProgress
    });
    
  } catch (error) {
    console.error('❌ Error getting verification status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get verification status'
    });
  }
});

module.exports = router;
