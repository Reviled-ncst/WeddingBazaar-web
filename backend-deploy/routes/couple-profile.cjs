const express = require('express');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const router = express.Router();

// Use the same database connection pattern
const sql = neon(process.env.DATABASE_URL);

// Get couple profile with verification status
router.get('/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    
    console.log('🔍 Getting couple profile for ID:', coupleId);
    
    // Get couple profile with user information and verification status
    const coupleQuery = `
      SELECT 
        cp.*,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.email_verified,
        u.created_at as user_created_at,
        u.updated_at as user_updated_at
      FROM couple_profiles cp
      INNER JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1
    `;
    
    const coupleResult = await sql.query(coupleQuery, [coupleId]);
    
    if (coupleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Couple not found',
        message: 'No couple found with this ID'
      });
    }
    
    const couple = coupleResult.rows[0];
    
    // Get wedding information
    const weddingQuery = `
      SELECT * FROM weddings 
      WHERE couple_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const weddingResult = await sql.query(weddingQuery, [coupleId]);
    const wedding = weddingResult.rows[0] || null;
    
    // Format the response
    const coupleProfile = {
      // Basic Information
      id: couple.id,
      userId: couple.user_id,
      firstName: couple.first_name,
      lastName: couple.last_name,
      email: couple.email,
      phone: couple.phone,
      
      // Partner Information
      partnerFirstName: couple.partner_first_name,
      partnerLastName: couple.partner_last_name,
      partnerPhone: couple.partner_phone,
      partnerEmail: couple.partner_email,
      
      // Wedding Details
      weddingDate: couple.wedding_date,
      weddingVenue: couple.wedding_venue,
      weddingLocation: couple.wedding_location,
      estimatedGuests: couple.estimated_guests,
      weddingBudget: couple.wedding_budget,
      weddingStyle: couple.wedding_style,
      
      // Verification Status
      emailVerified: couple.email_verified,
      phoneVerified: couple.phone_verified,
      profileComplete: !!(couple.wedding_date && couple.wedding_location),
      
      // Wedding Planning Information
      wedding: wedding ? {
        id: wedding.id,
        title: wedding.title,
        date: wedding.wedding_date,
        venue: wedding.venue,
        location: wedding.location,
        guestCount: wedding.guest_count,
        budget: wedding.budget,
        status: wedding.status,
        description: wedding.description,
        createdAt: wedding.created_at,
        updatedAt: wedding.updated_at
      } : null,
      
      // Profile Media
      profileImage: couple.profile_image,
      coverImage: couple.cover_image,
      
      // Preferences
      preferredVendors: couple.preferred_vendors || [],
      weddingTheme: couple.wedding_theme,
      specialRequirements: couple.special_requirements,
      
      // Contact Preferences
      communicationPreference: couple.communication_preference || 'email',
      newsletterSubscribed: couple.newsletter_subscribed || false,
      
      // Timestamps
      createdAt: couple.user_created_at,
      updatedAt: couple.user_updated_at,
      profileUpdatedAt: couple.updated_at
    };
    
    console.log('✅ Couple profile retrieved successfully');
    
    res.json({
      success: true,
      couple: coupleProfile
    });
    
  } catch (error) {
    console.error('❌ Error fetching couple profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch couple profile'
    });
  }
});

// Update couple profile
router.put('/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const updates = req.body;
    
    console.log('🔧 Updating couple profile:', coupleId);
    
    // Build dynamic update query based on provided fields
    const allowedFields = [
      'partner_first_name', 'partner_last_name', 'partner_phone', 'partner_email',
      'wedding_date', 'wedding_venue', 'wedding_location', 'estimated_guests',
      'wedding_budget', 'wedding_style', 'wedding_theme', 'special_requirements',
      'profile_image', 'cover_image', 'preferred_vendors', 
      'communication_preference', 'newsletter_subscribed'
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
    
    // Add couple ID for WHERE clause
    values.push(coupleId);
    
    const updateQuery = `
      UPDATE couple_profiles 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await sql.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Couple not found',
        message: 'No couple found with this ID'
      });
    }
    
    console.log('✅ Couple profile updated successfully');
    
    res.json({
      success: true,
      message: 'Couple profile updated successfully',
      couple: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Error updating couple profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update couple profile'
    });
  }
});

// Send email verification for couple
router.post('/:coupleId/verify-email', async (req, res) => {
  try {
    const { coupleId } = req.params;
    
    console.log('📧 Sending email verification for couple:', coupleId);
    
    // Get couple email
    const coupleQuery = `
      SELECT u.email, u.first_name, cp.partner_first_name
      FROM couple_profiles cp
      INNER JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1
    `;
    
    const coupleResult = await sql.query(coupleQuery, [coupleId]);
    
    if (coupleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Couple not found'
      });
    }
    
    const couple = coupleResult.rows[0];
    
    // Generate verification token
    const verificationToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store verification token
    await sql.query(
      'UPDATE users SET email_verification_token = $1, email_verification_expires = $2 WHERE email = $3',
      [verificationToken, expiresAt, couple.email]
    );
    
    // Send email (implement email service)
    const emailService = require('../utils/emailService.cjs');
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    await emailService.sendVerificationEmail(couple.email, couple.first_name, verificationUrl);
    
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

// Send phone verification SMS for couple
router.post('/:coupleId/verify-phone', async (req, res) => {
  try {
    const { coupleId } = req.params;
    
    console.log('📱 Sending phone verification for couple:', coupleId);
    
    // Get couple phone
    const coupleQuery = `
      SELECT u.phone, u.first_name
      FROM couple_profiles cp
      INNER JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1
    `;
    
    const coupleResult = await sql.query(coupleQuery, [coupleId]);
    
    if (coupleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Couple not found'
      });
    }
    
    const couple = coupleResult.rows[0];
    
    if (!couple.phone) {
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
      [verificationCode, expiresAt, couple.phone]
    );
    
    // Send SMS (implement SMS service)
    // const smsService = require('../utils/smsService.cjs');
    // await smsService.sendVerificationSMS(couple.phone, verificationCode);
    
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

// Verify phone with code for couple
router.post('/:coupleId/confirm-phone', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { verificationCode } = req.body;
    
    console.log('🔐 Verifying phone code for couple:', coupleId);
    
    if (!verificationCode) {
      return res.status(400).json({
        success: false,
        error: 'Verification code is required'
      });
    }
    
    // Get couple and check code
    const coupleQuery = `
      SELECT u.id as user_id, u.phone_verification_code, u.phone_verification_expires
      FROM couple_profiles cp
      INNER JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1
    `;
    
    const coupleResult = await sql.query(coupleQuery, [coupleId]);
    
    if (coupleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Couple not found'
      });
    }
    
    const couple = coupleResult.rows[0];
    
    // Check if code matches and is not expired
    if (couple.phone_verification_code !== verificationCode) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }
    
    if (new Date() > new Date(couple.phone_verification_expires)) {
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
      [couple.user_id]
    );
    
    // Update couple verification status
    await sql.query(
      'UPDATE couple_profiles SET phone_verified = true WHERE id = $1',
      [coupleId]
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

// Get couple verification summary
router.get('/:coupleId/verification-status', async (req, res) => {
  try {
    const { coupleId } = req.params;
    
    console.log('📊 Getting verification status for couple:', coupleId);
    
    // Get verification status
    const statusQuery = `
      SELECT 
        u.email_verified,
        u.phone_verified,
        cp.wedding_date,
        cp.wedding_location,
        cp.wedding_venue,
        cp.estimated_guests,
        cp.partner_first_name,
        cp.partner_last_name
      FROM couple_profiles cp
      INNER JOIN users u ON cp.user_id = u.id
      WHERE cp.id = $1
    `;
    
    const result = await sql.query(statusQuery, [coupleId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Couple not found'
      });
    }
    
    const status = result.rows[0];
    
    // Check profile completeness
    const profileComplete = !!(
      status.wedding_date && 
      status.wedding_location && 
      status.partner_first_name && 
      status.partner_last_name
    );
    
    // Calculate overall completion percentage
    const verificationSteps = [
      status.email_verified,
      status.phone_verified,
      profileComplete
    ];
    
    const completedSteps = verificationSteps.filter(Boolean).length;
    const completionPercentage = Math.round((completedSteps / verificationSteps.length) * 100);
    
    res.json({
      success: true,
      verification: {
        emailVerified: status.email_verified,
        phoneVerified: status.phone_verified,
        profileComplete: profileComplete,
        completionPercentage,
        missingFields: {
          weddingDate: !status.wedding_date,
          weddingLocation: !status.wedding_location,
          partnerInfo: !status.partner_first_name || !status.partner_last_name,
          venue: !status.wedding_venue,
          guestCount: !status.estimated_guests
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

// Create or update wedding information
router.post('/:coupleId/wedding', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const weddingData = req.body;
    
    console.log('💒 Creating/updating wedding for couple:', coupleId);
    
    // Check if couple exists
    const coupleCheck = await sql.query('SELECT id FROM couple_profiles WHERE id = $1', [coupleId]);
    if (coupleCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Couple not found'
      });
    }
    
    // Check if wedding already exists
    const existingWedding = await sql.query('SELECT id FROM weddings WHERE couple_id = $1', [coupleId]);
    
    if (existingWedding.rows.length > 0) {
      // Update existing wedding
      const updateQuery = `
        UPDATE weddings SET
          title = $2,
          wedding_date = $3,
          venue = $4,
          location = $5,
          guest_count = $6,
          budget = $7,
          description = $8,
          updated_at = NOW()
        WHERE couple_id = $1
        RETURNING *
      `;
      
      const result = await sql.query(updateQuery, [
        coupleId,
        weddingData.title,
        weddingData.weddingDate,
        weddingData.venue,
        weddingData.location,
        weddingData.guestCount,
        weddingData.budget,
        weddingData.description
      ]);
      
      res.json({
        success: true,
        message: 'Wedding updated successfully',
        wedding: result.rows[0]
      });
    } else {
      // Create new wedding
      const insertQuery = `
        INSERT INTO weddings (
          couple_id, title, wedding_date, venue, location, 
          guest_count, budget, description, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'planning', NOW(), NOW())
        RETURNING *
      `;
      
      const result = await sql.query(insertQuery, [
        coupleId,
        weddingData.title,
        weddingData.weddingDate,
        weddingData.venue,
        weddingData.location,
        weddingData.guestCount,
        weddingData.budget,
        weddingData.description
      ]);
      
      res.json({
        success: true,
        message: 'Wedding created successfully',
        wedding: result.rows[0]
      });
    }
    
  } catch (error) {
    console.error('❌ Error creating/updating wedding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create/update wedding'
    });
  }
});

module.exports = router;
