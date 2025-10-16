const express = require('express');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const router = express.Router();

// Use the same database connection pattern as other routes
const sql = neon(process.env.DATABASE_URL);

// Get vendor profile with verification status
router.get('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
        
    // Handle both UUID and string ID formats
    let queryVendorId = vendorId;
    
    // If it's not a UUID format, try to find matching vendor by user_id
    if (!vendorId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.log('🔍 Non-UUID vendor ID detected, looking up by user_id:', vendorId);
      const userLookup = await sql`
        SELECT vp.id as vendor_profile_id
        FROM vendor_profiles vp
        INNER JOIN users u ON vp.user_id = u.id
        WHERE u.id = ${vendorId}
      `;
      
      if (userLookup.length > 0) {
        queryVendorId = userLookup[0].vendor_profile_id;
        console.log('✅ Found vendor profile ID:', queryVendorId);
      } else {
        console.log('❌ No vendor profile found for user ID:', vendorId);
      }
    }
    
    
    console.log('🔍 Getting vendor profile for ID:', vendorId);
    
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.log('📋 Database URL not configured, returning mock verification data');
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
      WHERE vp.id = ${queryVendorId}
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
      // Try multiple approaches to find documents for this vendor
      console.log('🔍 Looking for documents with vendor_id:', queryVendorId);
      console.log('🔍 Also trying original vendor_id:', vendorId);
      
      // First, let's see what vendor IDs actually exist in the documents table
      const allVendorDocs = await sql`
        SELECT DISTINCT vendor_id, COUNT(*) as doc_count
        FROM vendor_documents 
        GROUP BY vendor_id
      `;
      console.log('📊 All vendor IDs in documents table:', allVendorDocs);
      
      // Try to find documents by multiple methods:
      // 1. Direct vendor_id match (UUID or string)
      // 2. User email match (in case documents were stored by email)
      // 3. Any recent documents for this user
      docsResult = await sql`
        SELECT DISTINCT vd.id, vd.document_type, vd.document_url, vd.verification_status, 
               vd.uploaded_at, vd.verified_at, vd.rejection_reason, vd.vendor_id
        FROM vendor_documents vd
        LEFT JOIN vendor_profiles vp ON vd.vendor_id = vp.id
        LEFT JOIN users u ON vp.user_id = u.id
        WHERE vd.vendor_id = ${queryVendorId} 
           OR vd.vendor_id = ${vendorId}
           OR u.id = ${vendorId}
           OR u.email = ${vendor.email}
        ORDER BY vd.uploaded_at DESC
      `;
      
      console.log('📄 Found documents:', docsResult.length);
      docsResult.forEach(doc => {
        console.log('📄 Document:', { 
          id: doc.id,
          type: doc.document_type,
          status: doc.verification_status,
          vendor_id_used: doc.vendor_id
        });
      });
      
    } catch (docError) {
      console.log('⚠️ vendor_documents table error:', docError.message);
    }
    
    // Format the response with safe defaults
    const vendorProfile = {
      // Basic Information
      id: vendor.id,
      userId: vendor.user_id,
      businessName: vendor.business_name,
      businessType: vendor.business_type,
      description: vendor.business_description,
      location: vendor.service_areas ? (Array.isArray(vendor.service_areas) ? vendor.service_areas.join(', ') : vendor.service_areas) : null,
      
      // Contact Information
      email: vendor.email,
      firstName: vendor.first_name,
      lastName: vendor.last_name,
      phone: vendor.phone,
      website: vendor.website,
      
      // Business Details
      yearsInBusiness: vendor.years_in_business || 0,
      teamSize: vendor.team_size || 0,
      serviceArea: vendor.service_areas ? (Array.isArray(vendor.service_areas) ? vendor.service_areas.join(', ') : vendor.service_areas) : null,
      priceRange: vendor.price_range,
      
      // Additional Business Info from Registration
      businessHours: vendor.business_hours,
      pricingRange: vendor.pricing_range,
      averageRating: parseFloat(vendor.average_rating || 0),
      totalReviews: vendor.total_reviews || 0,
      responseTime: vendor.response_time_hours || 24,
      
      // Verification Status (with safe defaults)
      emailVerified: vendor.email_verified || false,
      phoneVerified: vendor.phone_verified || false,
      businessVerified: vendor.business_verified || false,
      documentsVerified: vendor.documents_verified || docsResult.some(doc => doc.verification_status === 'approved'),
      overallVerificationStatus: vendor.verification_status || 'pending',
      
      // Business Information Verification
      businessInfoComplete: !!(vendor.business_name && vendor.business_type && vendor.service_areas),
      
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

// Upload vendor document
router.post('/:vendorId/documents', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { 
      documentType, 
      documentName, 
      documentUrl, 
      fileSize, 
      mimeType 
    } = req.body;

    console.log('📄 Uploading document for vendor:', vendorId, {
      documentType,
      documentName,
      documentUrl,
      fileSize,
      mimeType
    });

    // Validate required fields
    if (!documentType || !documentName || !documentUrl) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'documentType, documentName, and documentUrl are required'
      });
    }

    // Insert document record
    const result = await sql`
      INSERT INTO vendor_documents (
        vendor_id, 
        document_type, 
        file_name, 
        document_url, 
        file_size, 
        mime_type
      ) VALUES (
        ${vendorId}, 
        ${documentType}, 
        ${documentName}, 
        ${documentUrl}, 
        ${fileSize || null}, 
        ${mimeType || null}
      )
      RETURNING *
    `;

    console.log('✅ Document uploaded successfully:', result[0]);

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        id: result[0].id,
        documentType: result[0].document_type,
        documentName: result[0].file_name,
        documentUrl: result[0].document_url,
        fileSize: result[0].file_size,
        mimeType: result[0].mime_type,
        verificationStatus: result[0].verification_status,
        uploadedAt: result[0].uploaded_at
      }
    });

  } catch (error) {
    console.error('❌ Document upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Document upload failed',
      message: error.message
    });
  }
});

// Get vendor documents
router.get('/:vendorId/documents', async (req, res) => {
  try {
    const { vendorId } = req.params;

    console.log('📄 Getting documents for vendor:', vendorId);

    const documents = await sql`
      SELECT 
        id,
        document_type,
        file_name,
        document_url,
        file_size,
        mime_type,
        verification_status,
        uploaded_at,
        verified_at,
        rejection_reason
      FROM vendor_documents 
      WHERE vendor_id = ${vendorId}
      ORDER BY uploaded_at DESC
    `;

    const formattedDocs = documents.map(doc => ({
      id: doc.id,
      documentType: doc.document_type,
      documentName: doc.file_name,
      documentUrl: doc.document_url,
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      verificationStatus: doc.verification_status,
      uploadedAt: doc.uploaded_at,
      verifiedAt: doc.verified_at,
      rejectionReason: doc.rejection_reason
    }));

    console.log(`✅ Found ${formattedDocs.length} documents for vendor`);

    res.json({
      success: true,
      documents: formattedDocs
    });

  } catch (error) {
    console.error('❌ Get documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get documents',
      message: error.message
    });
  }
});

// Delete vendor document
router.delete('/:vendorId/documents/:documentId', async (req, res) => {
  try {
    const { vendorId, documentId } = req.params;

    console.log('🗑️ Deleting document:', documentId, 'for vendor:', vendorId);

    const result = await sql`
      DELETE FROM vendor_documents 
      WHERE id = ${documentId} AND vendor_id = ${vendorId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
        message: 'Document not found or not owned by this vendor'
      });
    }

    console.log('✅ Document deleted successfully:', result[0].document_name);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document',
      message: error.message
    });
  }
});

// Update document verification status (admin only)
router.patch('/:vendorId/documents/:documentId/verify', async (req, res) => {
  try {
    const { vendorId, documentId } = req.params;
    const { status, rejectionReason } = req.body;

    console.log('✅ Updating document verification:', documentId, 'status:', status);

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status',
        message: 'Status must be approved, rejected, or pending'
      });
    }

    const result = await sql`
      UPDATE vendor_documents 
      SET 
        verification_status = ${status},
        verified_at = ${status === 'approved' ? new Date().toISOString() : null},
        rejection_reason = ${status === 'rejected' ? rejectionReason : null},
        updated_at = NOW()
      WHERE id = ${documentId} AND vendor_id = ${vendorId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    console.log('✅ Document verification updated:', result[0].verification_status);

    res.json({
      success: true,
      message: 'Document verification status updated',
      document: {
        id: result[0].id,
        verificationStatus: result[0].verification_status,
        verifiedAt: result[0].verified_at,
        rejectionReason: result[0].rejection_reason
      }
    });

  } catch (error) {
    console.error('❌ Update verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update verification status',
      message: error.message
    });
  }
});

// Update vendor profile
router.put('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const updateData = req.body;
    
    console.log('📝 Updating vendor profile:', vendorId, updateData);
    
    // If database is not available, return mock success
    if (!process.env.DATABASE_URL) {
      console.log('📋 Database unavailable, returning mock update success');
      return res.json({
        success: true,
        message: 'Profile updated successfully (mock)',
        data: { id: vendorId, ...updateData }
      });
    }
    
    // Build the update fields dynamically
    const updateFields = [];
    const updateValues = [];
    
    // Map frontend camelCase fields to database snake_case columns
    const fieldMapping = {
      // New camelCase fields from updated frontend
      businessName: 'business_name',
      businessType: 'business_type', 
      description: 'description',
      location: 'location',
      yearsInBusiness: 'years_in_business',
      website: 'website',
      phone: 'phone',
      email: 'email',
      serviceArea: 'service_area',
      socialMedia: 'social_media',
      profileImage: 'profile_image',
      
      // Legacy snake_case fields for backward compatibility
      business_name: 'business_name',
      business_type: 'business_type', 
      business_description: 'description',
      years_in_business: 'years_in_business',
      website_url: 'website',
      contact_phone: 'phone',
      contact_email: 'email',
      service_areas: 'service_area',
      social_media: 'social_media',
      featured_image_url: 'profile_image'
    };
    
    // Build SET clause for SQL update
    Object.keys(updateData).forEach((key, index) => {
      const dbField = fieldMapping[key] || key;
      updateFields.push(`${dbField} = $${index + 2}`); // $1 is reserved for vendorId
      updateValues.push(updateData[key]);
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    
    // Execute the update using Neon tagged template - updated for new camelCase fields
    let result;
    
    // Handle all possible field updates
    const updates = {
      businessName: updateData.businessName || updateData.business_name,
      businessType: updateData.businessType || updateData.business_type,
      businessDescription: updateData.description || updateData.business_description,
      serviceArea: updateData.location || updateData.serviceArea || updateData.service_areas,
      yearsInBusiness: updateData.yearsInBusiness || updateData.years_in_business,
      website: updateData.website || updateData.website_url,
      phone: updateData.phone || updateData.contact_phone,
      email: updateData.email || updateData.contact_email,
      socialMedia: updateData.socialMedia || updateData.social_media,
      profileImage: updateData.profileImage || updateData.featured_image_url
    };
    
    // Build dynamic SQL update using actual database column names
    result = await sql`
      UPDATE vendor_profiles 
      SET 
        business_name = COALESCE(${updates.businessName}, business_name),
        business_type = COALESCE(${updates.businessType}, business_type),
        business_description = COALESCE(${updates.businessDescription}, business_description),
        service_area = COALESCE(${updates.serviceArea}, service_area),
        years_in_business = COALESCE(${updates.yearsInBusiness}, years_in_business),
        website = COALESCE(${updates.website}, website),
        profile_image = COALESCE(${updates.profileImage}, profile_image),
        updated_at = NOW()
      WHERE id = ${vendorId}
      RETURNING *;
    `;
    
    // Also update user table if email/phone provided
    if (updates.email || updates.phone) {
      await sql`
        UPDATE users 
        SET 
          email = COALESCE(${updates.email}, email),
          phone = COALESCE(${updates.phone}, phone),
          updated_at = NOW()
        WHERE id = (SELECT user_id FROM vendor_profiles WHERE id = ${vendorId});
      `;
    }
    
    // Handle social media separately (JSONB update)
    if (updates.socialMedia) {
      await sql`
        UPDATE vendor_profiles 
        SET 
          facebook_url = ${updates.socialMedia.facebook || null},
          instagram_url = ${updates.socialMedia.instagram || null},
          twitter_url = ${updates.socialMedia.twitter || null},
          linkedin_url = ${updates.socialMedia.linkedin || null},
          updated_at = NOW()
        WHERE id = ${vendorId};
      `;
    }
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    const updatedVendor = result[0];
    
    // Format response to match frontend expectations
    const formattedResponse = {
      id: updatedVendor.id,
      userId: updatedVendor.user_id,
      businessName: updatedVendor.business_name,
      businessType: updatedVendor.business_type,
      description: updatedVendor.business_description,
      location: updatedVendor.service_area,
      yearsInBusiness: updatedVendor.years_in_business,
      website: updatedVendor.website,
      serviceArea: updatedVendor.service_area,
      socialMedia: {
        facebook: updatedVendor.facebook_url,
        instagram: updatedVendor.instagram_url,
        twitter: updatedVendor.twitter_url,
        linkedin: updatedVendor.linkedin_url
      },
      profileImage: updatedVendor.profile_image,
      portfolioImages: updatedVendor.portfolio_images || [],
      updatedAt: updatedVendor.updated_at
    };
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: formattedResponse
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

// Update phone verification status after Firebase verification
router.post('/:vendorId/phone-verified', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { phone, verified } = req.body;
    
    console.log('📱 Updating phone verification status:', { vendorId, phone, verified });
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    // Update vendor profile phone verification
    const vendorResult = await sql`
      UPDATE vendor_profiles 
      SET 
        phone_verified = ${verified || true},
        updated_at = NOW()
      WHERE id = ${vendorId}
      RETURNING *;
    `;
    
    if (vendorResult.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    // Also update user table phone and verification status
    const vendor = vendorResult[0];
    await sql`
      UPDATE users 
      SET 
        phone = ${phone},
        phone_verified = ${verified || true},
        updated_at = NOW()
      WHERE id = ${vendor.user_id}
    `;
    
    console.log('✅ Phone verification status updated successfully');
    
    res.json({
      success: true,
      message: 'Phone verification status updated successfully',
      phone: phone,
      verified: verified || true
    });
    
  } catch (error) {
    console.error('❌ Error updating phone verification:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update phone verification status',
      details: error.message
    });
  }
});

// DEBUG: Check what vendor IDs exist in documents table
router.get('/debug/all-document-vendors', async (req, res) => {
  try {
    console.log('🔍 DEBUG: Checking all vendor IDs in documents table');
    
    const allVendorDocs = await sql`
      SELECT DISTINCT vendor_id, COUNT(*) as doc_count
      FROM vendor_documents 
      GROUP BY vendor_id
    `;
    
    const allDocs = await sql`
      SELECT vendor_id, document_type, verification_status, uploaded_at
      FROM vendor_documents 
      ORDER BY uploaded_at DESC
    `;
    
    console.log('📊 All vendor IDs with documents:', allVendorDocs);
    console.log('📄 All documents:', allDocs);
    
    res.json({
      success: true,
      vendorIdsWithDocs: allVendorDocs,
      allDocuments: allDocs,
      searchedIds: ['2-2025-001', 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1']
    });
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
