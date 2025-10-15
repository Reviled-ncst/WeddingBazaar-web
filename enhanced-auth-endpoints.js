// Enhanced Registration Endpoint with Profile Creation
// File: routes/auth.js (Backend)

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const router = express.Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Enhanced Registration Endpoint
 * Creates user account + appropriate profile (vendor_profiles or couple_profiles)
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      first_name,
      last_name,
      email,
      password,
      user_type, // 'vendor', 'couple', or 'admin'
      phone,
      // Vendor-specific fields
      business_name,
      business_type,
      location,
      // Couple-specific fields
      wedding_date,
      partner_name,
      budget_range
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password || !user_type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: first_name, last_name, email, password, user_type'
      });
    }

    // Validate user_type
    if (!['vendor', 'couple', 'admin'].includes(user_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user_type. Must be vendor, couple, or admin'
      });
    }

    // Check if email already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique user ID
    const currentYear = new Date().getFullYear();
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    const userNumber = (parseInt(userCount.rows[0].count) + 1).toString().padStart(3, '0');
    const userId = `${user_type.charAt(0).toUpperCase()}-${currentYear}-${userNumber}`;

    // 1. Create user account in users table
    const userResult = await client.query(`
      INSERT INTO users (
        id, email, password_hash, user_type, first_name, last_name, phone,
        email_verified, phone_verified, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING id, email, first_name, last_name, user_type, email_verified, phone_verified, created_at
    `, [userId, email, hashedPassword, user_type, first_name, last_name, phone, false, false]);

    const user = userResult.rows[0];

    // 2. Create appropriate profile based on user_type
    let profileResult = null;

    if (user_type === 'vendor') {
      // Create vendor profile
      if (!business_name || !business_type) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Vendor registration requires business_name and business_type'
        });
      }

      profileResult = await client.query(`
        INSERT INTO vendor_profiles (
          user_id, business_name, business_type, business_description,
          verification_status, verification_documents, 
          service_areas, pricing_range, business_hours,
          average_rating, total_reviews, total_bookings,
          response_time_hours, is_featured, is_premium,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
        RETURNING *
      `, [
        userId, 
        business_name, 
        business_type, 
        null, // business_description - to be filled later
        'unverified', // verification_status - matches schema default
        JSON.stringify({ // verification_documents - placeholder for admin verification
          business_registration: null,
          tax_documents: null,
          identity_verification: null,
          status: 'pending_submission',
          submitted_at: null,
          reviewed_at: null,
          admin_notes: null
        }),
        JSON.stringify([location || 'Not specified']), // service_areas
        JSON.stringify({ // pricing_range - placeholder
          min: null,
          max: null,
          currency: 'PHP',
          type: 'per_service'
        }),
        JSON.stringify({ // business_hours - default business hours
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false },
          wednesday: { open: '09:00', close: '17:00', closed: false },
          thursday: { open: '09:00', close: '17:00', closed: false },
          friday: { open: '09:00', close: '17:00', closed: false },
          saturday: { open: '09:00', close: '17:00', closed: false },
          sunday: { closed: true }
        }),
        0.00, // average_rating
        0,    // total_reviews
        0,    // total_bookings
        24,   // response_time_hours
        false, // is_featured
        false  // is_premium
      ]);

    } else if (user_type === 'couple') {
      // Create couple profile
      // Generate unique couple profile ID
      const coupleCount = await client.query('SELECT COUNT(*) as count FROM couple_profiles');
      const coupleNumber = (parseInt(coupleCount.rows[0].count) + 1).toString().padStart(3, '0');
      const coupleId = `CP-${currentYear}-${coupleNumber}`;

      profileResult = await client.query(`
        INSERT INTO couple_profiles (
          id, user_id, partner_name, wedding_date, wedding_location,
          budget_range, guest_count, wedding_style,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [
        coupleId,
        userId,
        partner_name || null,
        wedding_date || null,
        location || null, // wedding_location
        budget_range || null,
        0, // guest_count - default
        null // wedding_style - to be selected later
      ]);

    } else if (user_type === 'admin') {
      // Create admin profile (using schema structure you'll provide)
      profileResult = await client.query(`
        INSERT INTO admin_profiles (
          user_id, created_at, updated_at
        ) VALUES ($1, NOW(), NOW())
        RETURNING *
      `, [
        userId
      ]);
    }

    // Commit transaction
    await client.query('COMMIT');

    // Generate JWT token (but user should verify email before using it)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.user_type,
        emailVerified: user.email_verified
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email before logging in.',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        email_verified: user.email_verified,
        phone_verified: user.phone_verified,
        created_at: user.created_at
      },
      profile: profileResult ? profileResult.rows[0] : null,
      token, // Token provided but email verification required
      verification_required: {
        email: true,
        phone: user_type !== 'admin', // Admin doesn't need phone verification
        documents: user_type === 'vendor' // Only vendors need document verification
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  } finally {
    client.release();
  }
});

/**
 * Email Verification Endpoint
 * POST /api/auth/verify-email
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { email, verification_code } = req.body;

    if (!email || !verification_code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code required'
      });
    }

    // TODO: Implement email verification logic
    // For now, just mark as verified (in production, verify the code)
    const result = await pool.query(`
      UPDATE users 
      SET email_verified = true, updated_at = NOW()
      WHERE email = $1
      RETURNING id, email, email_verified
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
});

/**
 * Phone Verification Endpoint
 * POST /api/auth/verify-phone
 */
router.post('/verify-phone', async (req, res) => {
  try {
    const { phone, verification_code } = req.body;

    if (!phone || !verification_code) {
      return res.status(400).json({
        success: false,
        message: 'Phone and verification code required'
      });
    }

    // TODO: Implement SMS verification logic
    // For now, just mark as verified (in production, verify the code)
    const result = await pool.query(`
      UPDATE users 
      SET phone_verified = true, updated_at = NOW()
      WHERE phone = $1
      RETURNING id, phone, phone_verified
    `, [phone]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Phone verified successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Phone verification failed'
    });
  }
});

/**
 * Vendor Document Verification Endpoint
 * POST /api/auth/submit-vendor-documents
 */
router.post('/submit-vendor-documents', async (req, res) => {
  try {
    const { user_id, documents } = req.body;

    if (!user_id || !documents) {
      return res.status(400).json({
        success: false,
        message: 'User ID and documents required'
      });
    }

    // Prepare verification documents structure
    const verificationDocs = {
      business_registration: documents.business_registration || null,
      tax_documents: documents.tax_documents || null,
      identity_verification: documents.identity_verification || null,
      additional_permits: documents.additional_permits || null,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      admin_notes: null,
      review_status: 'pending'
    };

    // Update vendor profile with document submission
    const result = await pool.query(`
      UPDATE vendor_profiles 
      SET 
        verification_status = 'pending',
        verification_documents = $2,
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [user_id, JSON.stringify(verificationDocs)]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Documents submitted successfully. Admin review required.',
      vendor_profile: result.rows[0],
      next_steps: [
        'Documents are under admin review',
        'You will receive an email notification when review is complete',
        'Review process typically takes 2-3 business days',
        'You can continue setting up your profile while waiting'
      ]
    });

  } catch (error) {
    console.error('Document submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Document submission failed'
    });
  }
});

/**
 * Admin Vendor Verification Endpoint (Manual Review)
 * POST /api/admin/verify-vendor
 */
router.post('/admin/verify-vendor', async (req, res) => {
  try {
    const { vendor_user_id, status, admin_notes } = req.body;

    if (!vendor_user_id || !status) {
      return res.status(400).json({
        success: false,
        message: 'Vendor user ID and status required'
      });
    }

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "verified" or "rejected"'
      });
    }

    // Get current verification documents
    const vendorResult = await pool.query(
      'SELECT verification_documents FROM vendor_profiles WHERE user_id = $1',
      [vendor_user_id]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    // Update verification documents with admin review
    const currentDocs = vendorResult.rows[0].verification_documents || {};
    const updatedDocs = {
      ...currentDocs,
      review_status: status,
      reviewed_at: new Date().toISOString(),
      admin_notes: admin_notes || null
    };

    // Update vendor profile
    const result = await pool.query(`
      UPDATE vendor_profiles 
      SET 
        verification_status = $2,
        verification_documents = $3,
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [vendor_user_id, status, JSON.stringify(updatedDocs)]);

    res.json({
      success: true,
      message: `Vendor ${status} successfully`,
      vendor_profile: result.rows[0]
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Admin verification failed'
    });
  }
});

/**
 * Get User Profile Endpoint
 * GET /api/auth/profile
 */
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user data
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, user_type, email_verified, phone_verified, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];
    let profile = null;

    // Get appropriate profile
    if (user.user_type === 'vendor') {
      const vendorResult = await pool.query(
        'SELECT * FROM vendor_profiles WHERE user_id = $1',
        [user.id]
      );
      profile = vendorResult.rows[0] || null;
    } else if (user.user_type === 'couple') {
      const coupleResult = await pool.query(
        'SELECT * FROM couple_profiles WHERE user_id = $1',
        [user.id]
      );
      profile = coupleResult.rows[0] || null;
    } else if (user.user_type === 'admin') {
      const adminResult = await pool.query(
        'SELECT * FROM admin_profiles WHERE user_id = $1',
        [user.id]
      );
      profile = adminResult.rows[0] || null;
    }

    res.json({
      success: true,
      user,
      profile,
      verification_status: {
        email_verified: user.email_verified,
        phone_verified: user.phone_verified,
        profile_verified: profile ? (profile.verification_status === 'verified') : false
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

/**
 * Update Vendor Profile Endpoint
 * PUT /api/auth/vendor-profile
 */
router.put('/vendor-profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const {
      business_description,
      business_registration_number,
      tax_identification_number,
      years_in_business,
      website_url,
      social_media,
      service_areas,
      pricing_range,
      business_hours,
      cancellation_policy,
      terms_of_service
    } = req.body;

    const result = await pool.query(`
      UPDATE vendor_profiles 
      SET 
        business_description = COALESCE($2, business_description),
        business_registration_number = COALESCE($3, business_registration_number),
        tax_identification_number = COALESCE($4, tax_identification_number),
        years_in_business = COALESCE($5, years_in_business),
        website_url = COALESCE($6, website_url),
        social_media = COALESCE($7, social_media),
        service_areas = COALESCE($8, service_areas),
        pricing_range = COALESCE($9, pricing_range),
        business_hours = COALESCE($10, business_hours),
        cancellation_policy = COALESCE($11, cancellation_policy),
        terms_of_service = COALESCE($12, terms_of_service),
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [
      decoded.userId,
      business_description,
      business_registration_number,
      tax_identification_number,
      years_in_business,
      website_url ? JSON.stringify(website_url) : null,
      social_media ? JSON.stringify(social_media) : null,
      service_areas ? JSON.stringify(service_areas) : null,
      pricing_range ? JSON.stringify(pricing_range) : null,
      business_hours ? JSON.stringify(business_hours) : null,
      cancellation_policy,
      terms_of_service
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Vendor profile updated successfully',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Update vendor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vendor profile'
    });
  }
});

/**
 * Update Couple Profile Endpoint
 * PUT /api/auth/couple-profile
 */
router.put('/couple-profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const {
      partner_name,
      wedding_date,
      wedding_location,
      budget_range,
      guest_count,
      wedding_style
    } = req.body;

    const result = await pool.query(`
      UPDATE couple_profiles 
      SET 
        partner_name = COALESCE($2, partner_name),
        wedding_date = COALESCE($3, wedding_date),
        wedding_location = COALESCE($4, wedding_location),
        budget_range = COALESCE($5, budget_range),
        guest_count = COALESCE($6, guest_count),
        wedding_style = COALESCE($7, wedding_style),
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING *
    `, [
      decoded.userId,
      partner_name,
      wedding_date,
      wedding_location,
      budget_range,
      guest_count,
      wedding_style
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Couple profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Couple profile updated successfully',
      profile: result.rows[0]
    });

  } catch (error) {
    console.error('Update couple profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update couple profile'
    });
  }
});

module.exports = router;
