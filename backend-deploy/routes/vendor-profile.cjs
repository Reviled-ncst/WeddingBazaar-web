const express = require('express');
const { sql } = require('../config/database.cjs');

const router = express.Router();

// Get vendor profile with verification status
router.get('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log('🔍 Getting vendor profile for ID:', vendorId);
    
    // Get vendor profile with user information and verification status
    const vendorQuery = `
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
      WHERE vp.id = $1
    `;
    
    const vendorResult = await sql.query(vendorQuery, [vendorId]);
    
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found',
        message: 'No vendor found with this ID'
      });
    }
    
    const vendor = vendorResult.rows[0];
    
    // Get verification documents
    const docsQuery = `
      SELECT id, document_type, document_url, verification_status, uploaded_at, verified_at, rejection_reason
      FROM vendor_documents 
      WHERE vendor_id = $1
      ORDER BY uploaded_at DESC
    `;
    
    const docsResult = await sql.query(docsQuery, [vendorId]);
    
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
      
      // Verification Status
      emailVerified: vendor.email_verified,
      phoneVerified: vendor.phone_verified,
      businessVerified: vendor.business_verified,
      documentsVerified: vendor.documents_verified,
      overallVerificationStatus: vendor.verification_status,
      
      // Business Information Verification
      businessInfoComplete: !!(vendor.business_name && vendor.business_type && vendor.location),
      
      // Verification Documents
      documents: docsResult.rows.map(doc => ({
        id: doc.id,
        type: doc.document_type,
        url: doc.document_url,
        status: doc.verification_status,
        uploadedAt: doc.uploaded_at,
        verifiedAt: doc.verified_at,
        rejectionReason: doc.rejection_reason
      })),
      
      // Portfolio and Media
      portfolioImages: vendor.portfolio_images || [],
      profileImage: vendor.profile_image,
      coverImage: vendor.cover_image,
      
      // Business Details
      socialMedia: {
        facebook: vendor.facebook_url,
        instagram: vendor.instagram_url,
        twitter: vendor.twitter_url,
        linkedin: vendor.linkedin_url
      },
      
      // Timestamps
      createdAt: vendor.user_created_at,
      updatedAt: vendor.user_updated_at,
      profileUpdatedAt: vendor.updated_at
    };
    
    console.log('✅ Vendor profile retrieved successfully');
    
    res.json({
      success: true,
      vendor: vendorProfile
    });
    
  } catch (error) {
    console.error('❌ Error fetching vendor profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch vendor profile'
    });
  }
});

// Update vendor profile
router.put('/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const updates = req.body;
    
    console.log('🔧 Updating vendor profile:', vendorId);
    
    // Build dynamic update query based on provided fields
    const allowedFields = [
      'business_name', 'business_type', 'description', 'location', 'website',
      'years_in_business', 'team_size', 'service_area', 'price_range',
      'facebook_url', 'instagram_url', 'twitter_url', 'linkedin_url',
      'profile_image', 'cover_image', 'portfolio_images'
    ];
    
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(updates[field]);
        paramCount++;
      }
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
        message: 'Please provide at least one valid field to update'
      });
    }
    
    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    
    // Add vendor ID for WHERE clause
    values.push(vendorId);
    
    const updateQuery = `
      UPDATE vendor_profiles 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await sql.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found',
        message: 'No vendor found with this ID'
      });
    }
    
    console.log('✅ Vendor profile updated successfully');
    
    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      vendor: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error updating vendor profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update vendor profile'
    });
  }
});

// Send email verification
router.post('/:vendorId/verify-email', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log('📧 Sending email verification for vendor:', vendorId);
    
    // Get vendor email
    const vendorQuery = `
      SELECT u.email, u.first_name, vp.business_name
      FROM vendor_profiles vp
      INNER JOIN users u ON vp.user_id = u.id
      WHERE vp.id = $1
    `;
    
    const vendorResult = await sql.query(vendorQuery, [vendorId]);
    
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    const vendor = vendorResult.rows[0];
    
    // Generate verification token
    const verificationToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store verification token
    await sql.query(
      'UPDATE users SET email_verification_token = $1, email_verification_expires = $2 WHERE email = $3',
      [verificationToken, expiresAt, vendor.email]
    );
    
    // Send email (implement email service)
    const emailService = require('../utils/emailService.cjs');
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    await emailService.sendVerificationEmail(vendor.email, vendor.first_name, verificationUrl);
    
    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });
    
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send verification email'
    });
  }
});

// Send phone verification SMS
router.post('/:vendorId/verify-phone', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log('📱 Sending phone verification for vendor:', vendorId);
    
    // Get vendor phone
    const vendorQuery = `
      SELECT u.phone, u.first_name
      FROM vendor_profiles vp
      INNER JOIN users u ON vp.user_id = u.id
      WHERE vp.id = $1
    `;
    
    const vendorResult = await sql.query(vendorQuery, [vendorId]);
    
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    const vendor = vendorResult.rows[0];
    
    if (!vendor.phone) {
      return res.status(400).json({
        success: false,
        error: 'No phone number found'
      });
    }
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store verification code
    await sql.query(
      'UPDATE users SET phone_verification_code = $1, phone_verification_expires = $2 WHERE phone = $3',
      [verificationCode, expiresAt, vendor.phone]
    );
    
    // Send SMS (implement SMS service)
    // const smsService = require('../utils/smsService.cjs');
    // await smsService.sendVerificationSMS(vendor.phone, verificationCode);
    
    // For now, return the code (remove in production)
    res.json({
      success: true,
      message: 'Verification code sent successfully',
      // TODO: Remove this in production - only for development
      verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined
    });
    
  } catch (error) {
    console.error('❌ Error sending phone verification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send phone verification'
    });
  }
});

// Verify phone with code
router.post('/:vendorId/confirm-phone', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { verificationCode } = req.body;
    
    console.log('🔐 Verifying phone code for vendor:', vendorId);
    
    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        error: 'Verification code is required'
      });
    }
    
    // Get vendor and check code
    const vendorQuery = `
      SELECT u.id as user_id, u.phone_verification_code, u.phone_verification_expires
      FROM vendor_profiles vp
      INNER JOIN users u ON vp.user_id = u.id
      WHERE vp.id = $1
    `;
    
    const vendorResult = await sql.query(vendorQuery, [vendorId]);
    
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    const vendor = vendorResult.rows[0];
    
    // Check if code matches and is not expired
    if (vendor.phone_verification_code !== verificationCode) {
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
    await sql.query(
      `UPDATE users SET 
        phone_verified = true, 
        phone_verification_code = NULL, 
        phone_verification_expires = NULL 
      WHERE id = $1`,
      [vendor.user_id]
    );
    
    // Update vendor verification status
    await sql.query(
      'UPDATE vendor_profiles SET phone_verified = true WHERE id = $1',
      [vendorId]
    );
    
    res.json({
      success: true,
      message: 'Phone verified successfully'
    });
    
  } catch (error) {
    console.error('❌ Error verifying phone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify phone'
    });
  }
});

// Upload business document
router.post('/:vendorId/documents', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { documentType, documentUrl, fileName } = req.body;
    
    console.log('📄 Uploading document for vendor:', vendorId, 'type:', documentType);
    
    if (!documentType || !documentUrl) {
      return res.status(400).json({
        success: false,
        error: 'Document type and URL are required'
      });
    }
    
    // Validate document type
    const allowedDocTypes = [
      'business_license',
      'tax_certificate', 
      'insurance_certificate',
      'professional_license',
      'portfolio_sample',
      'identification'
    ];
    
    if (!allowedDocTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document type'
      });
    }
    
    // Insert document
    const documentQuery = `
      INSERT INTO vendor_documents (
        vendor_id, document_type, document_url, file_name, 
        verification_status, uploaded_at
      ) VALUES ($1, $2, $3, $4, 'pending', NOW())
      RETURNING *
    `;
    
    const result = await sql.query(documentQuery, [vendorId, documentType, documentUrl, fileName]);
    
    res.json({
      success: true,
      message: 'Document uploaded successfully',
      document: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error uploading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload document'
    });
  }
});

// Get verification summary
router.get('/:vendorId/verification-status', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    console.log('📊 Getting verification status for vendor:', vendorId);
    
    // Get verification status from multiple tables
    const statusQuery = `
      SELECT 
        u.email_verified,
        u.phone_verified,
        vp.business_verified,
        vp.documents_verified,
        vp.verification_status,
        (SELECT COUNT(*) FROM vendor_documents WHERE vendor_id = $1 AND verification_status = 'approved') as approved_docs,
        (SELECT COUNT(*) FROM vendor_documents WHERE vendor_id = $1 AND verification_status = 'pending') as pending_docs,
        (SELECT COUNT(*) FROM vendor_documents WHERE vendor_id = $1 AND verification_status = 'rejected') as rejected_docs
      FROM vendor_profiles vp
      INNER JOIN users u ON vp.user_id = u.id
      WHERE vp.id = $1
    `;
    
    const result = await sql.query(statusQuery, [vendorId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    const status = result.rows[0];
    
    // Calculate overall completion percentage
    const verificationSteps = [
      status.email_verified,
      status.phone_verified, 
      status.business_verified,
      status.documents_verified
    ];
    
    const completedSteps = verificationSteps.filter(Boolean).length;
    const completionPercentage = Math.round((completedSteps / verificationSteps.length) * 100);
    
    res.json({
      success: true,
      verification: {
        emailVerified: status.email_verified,
        phoneVerified: status.phone_verified,
        businessVerified: status.business_verified,
        documentsVerified: status.documents_verified,
        overallStatus: status.verification_status,
        completionPercentage,
        documentCounts: {
          approved: status.approved_docs,
          pending: status.pending_docs,
          rejected: status.rejected_docs,
          total: status.approved_docs + status.pending_docs + status.rejected_docs
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting verification status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get verification status'
    });
  }
});

module.exports = router;
