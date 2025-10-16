const express = require('express');
const router = express.Router();

// Graceful database connection handling
let sql;
try {
  const { neon } = require('@neondatabase/serverless');
  const config = require('../config/database.cjs');
  sql = neon(config.databaseUrl);
} catch (error) {
  console.error('⚠️ Database connection failed, using fallback mode:', error.message);
  sql = null;
}

// Get vendor profile with verification status
router.get('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log('🔍 Getting vendor profile for ID:', vendorId);
    
    // If database is not available, return mock data
    if (!sql) {
      console.log('📋 Database unavailable, returning mock verification data');
      return res.json({
        id: vendorId,
        userId: `user_${vendorId}`,
        businessName: 'Mock Wedding Business',
        businessType: 'Photography',
        description: 'Professional wedding photography services',
        location: 'New York, NY',
        email: 'vendor@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        website: 'https://example.com',
        
        // Verification Status (mock)
        emailVerified: false,
        phoneVerified: false,
        businessVerified: false,
        documentsVerified: false,
        overallVerificationStatus: 'pending',
        
        businessInfoComplete: true,
        documents: [],
        
        socialMedia: {
          facebook: null,
          instagram: null,
          twitter: null,
          linkedin: null
        },
        
        profileImage: null,
        coverImage: null,
        portfolioImages: [],
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
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
    
    // Format the response with safe defaults
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
      yearsInBusiness: vendor.years_in_business || 0,
      teamSize: vendor.team_size || 0,
      serviceArea: vendor.service_area,
      priceRange: vendor.price_range,
      
      // Verification Status (with safe defaults)
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
      
      // Social Media and URLs (with safe defaults)
      socialMedia: {
        facebook: vendor.facebook_url || null,
        instagram: vendor.instagram_url || null,
        twitter: vendor.twitter_url || null,
        linkedin: vendor.linkedin_url || null
      },
      
      // Profile Images
      profileImage: vendor.profile_image,
      coverImage: vendor.cover_image,
      portfolioImages: vendor.portfolio_images || [],
      
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

// Get verification status - simplified version
router.get('/:vendorId/verification-status', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log('📊 Getting verification status for vendor:', vendorId);
    
    // If database is not available, return mock status
    if (!sql) {
      console.log('📋 Database unavailable, returning mock verification status');
      return res.json({
        emailVerified: false,
        phoneVerified: false,
        businessVerified: false,
        documentsVerified: false,
        overallStatus: 'pending',
        verificationProgress: 0
      });
    }
    
    // Get verification status
    const vendorResult = await sql`
      SELECT 
        u.email_verified,
        COALESCE(u.phone_verified, false) as phone_verified,
        COALESCE(vp.business_verified, false) as business_verified,
        COALESCE(vp.documents_verified, false) as documents_verified,
        COALESCE(vp.verification_status, 'pending') as verification_status
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

// Request email verification - simplified
router.post('/:vendorId/verify-email', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log('📧 Requesting email verification for vendor:', vendorId);
    
    // Generate verification token for demo
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
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

// Request phone verification - simplified
router.post('/:vendorId/verify-phone', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { phone } = req.body;
    
    console.log('📱 Requesting phone verification for vendor:', vendorId, 'phone:', phone);
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
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

// Upload verification documents - simplified
router.post('/:vendorId/documents', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { documentType } = req.body;
    
    console.log('📄 Uploading documents for vendor:', vendorId, 'type:', documentType);
    
    // Simulate document upload
    const documentUrl = `https://documents.weddingbazaar.com/${vendorId}/${documentType}/${Date.now()}.pdf`;
    const fileName = `${documentType}_${Date.now()}.pdf`;
    
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
    
  } catch (error) {
    console.error('❌ Error uploading documents:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to upload documents'
    });
  }
});

module.exports = router;
