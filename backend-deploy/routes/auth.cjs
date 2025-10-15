const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sql } = require('../config/database.cjs');
const emailService = require('../utils/emailService.cjs');

const router = express.Router();

// Login endpoint with detailed debugging
router.post('/login', async (req, res) => {
  console.log('🔐 Login attempt received:', { email: req.body.email, hasPassword: !!req.body.password });
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Find user by email
    console.log('🔍 Looking for user:', email);
    const users = await sql`SELECT * FROM users WHERE email = ${email}`;
    
    if (users.length === 0) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }

    const user = users[0];
    console.log('✅ User found:', { id: user.id, email: user.email, type: user.user_type });
    console.log('🔐 Password hash length:', user.password.length);
    console.log('🔐 Password hash starts with:', user.password.substring(0, 10));

    // Verify password with detailed logging
    console.log('🔐 Comparing password...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }

    // Check email verification status - SECURITY: Block login if email not verified
    if (!user.email_verified) {
      console.log('❌ Email not verified for user:', email);
      return res.status(403).json({
        success: false,
        error: 'Email not verified. Please check your email and verify your account before logging in.',
        verification_required: true,
        timestamp: new Date().toISOString()
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.user_type 
      },
      process.env.JWT_SECRET || 'wedding-bazaar-secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful for:', email);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.user_type,
        firstName: user.first_name,
        lastName: user.last_name
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Enhanced Register endpoint with Profile Creation
router.post('/register', async (req, res) => {
  console.log('🎯 [AUTH] POST /api/auth/register called');
  console.log('🎯 [AUTH] Request body:', req.body);
  
  try {
    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      user_type = 'couple',
      phone,
      firebase_uid, // New field for Firebase integration
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
    if (!email || !password || !first_name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and first_name are required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Validate user_type
    const validUserTypes = ['couple', 'vendor', 'admin'];
    if (!validUserTypes.includes(user_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user_type. Must be one of: couple, vendor, admin',
        timestamp: new Date().toISOString()
      });
    }
    
    // Vendor-specific validation
    if (user_type === 'vendor' && (!business_name || !business_type)) {
      return res.status(400).json({
        success: false,
        error: 'Vendor registration requires business_name and business_type',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if user already exists
    console.log('🔍 Checking if user exists:', email);
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
    
    if (existingUsers.length > 0) {
      console.log('❌ User already exists with email:', email);
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('🔐 Password hashed successfully');
    
    // Generate unique user ID using proper sequential format
    const { getNextUserId } = require('../utils/id-generation.cjs');
    const userId = await getNextUserId(sql, user_type === 'vendor' ? 'vendor' : 'individual');
    
    // 1. Create user account in users table (with Firebase UID support)
    // If firebase_uid is provided, user has already verified their email with Firebase
    const isFirebaseVerified = !!firebase_uid;
    
    console.log('💾 Inserting user into database:', { 
      userId, 
      email, 
      user_type, 
      firebase_uid, 
      email_verified: isFirebaseVerified 
    });
    
    const userResult = await sql`
      INSERT INTO users (
        id, email, password, first_name, last_name, user_type, phone, firebase_uid, email_verified, created_at
      )
      VALUES (
        ${userId}, ${email}, ${hashedPassword}, ${first_name}, ${last_name || ''}, 
        ${user_type}, ${phone || null}, ${firebase_uid || null}, ${isFirebaseVerified}, NOW()
      )
      RETURNING id, email, first_name, last_name, user_type, phone, firebase_uid, email_verified, created_at
    `;
    
    const newUser = userResult[0];
    console.log('✅ User inserted into database:', newUser);
    
    // 2. Create appropriate profile based on user_type
    let profileResult = null;
    
    if (user_type === 'vendor') {
      console.log('🏢 Creating vendor profile for user:', userId);
      
      // Create vendor profile with verification placeholders
      profileResult = await sql`
        INSERT INTO vendor_profiles (
          user_id, business_name, business_type, business_description,
          verification_status, verification_documents,
          service_areas, pricing_range, business_hours,
          average_rating, total_reviews, total_bookings,
          response_time_hours, is_featured, is_premium,
          created_at, updated_at
        )
        VALUES (
          ${userId}, ${business_name}, ${business_type}, null,
          'unverified',
          ${JSON.stringify({
            business_registration: null,
            tax_documents: null,
            identity_verification: null,
            status: 'pending_submission',
            submitted_at: null,
            reviewed_at: null,
            admin_notes: null
          })},
          ${JSON.stringify([location || 'Not specified'])},
          ${JSON.stringify({ min: null, max: null, currency: 'PHP', type: 'per_service' })},
          ${JSON.stringify({
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '17:00', closed: false },
            sunday: { closed: true }
          })},
          0.00, 0, 0, 24, false, false,
          NOW(), NOW()
        )
        RETURNING *
      `;
      
      console.log('✅ Vendor profile created:', profileResult[0]?.user_id);
      
    } else if (user_type === 'couple') {
      console.log('💑 Creating couple profile for user:', userId);
      
      // Generate unique couple profile ID
      const coupleCountResult = await sql`SELECT COUNT(*) as count FROM couple_profiles`;
      const coupleCount = parseInt(coupleCountResult[0].count) + 1;
      const currentYear = new Date().getFullYear();
      const coupleId = `CP-${currentYear}-${coupleCount.toString().padStart(3, '0')}`;
      
      profileResult = await sql`
        INSERT INTO couple_profiles (
          id, user_id, partner_name, wedding_date, wedding_location,
          budget_range, guest_count, wedding_style,
          created_at, updated_at
        )
        VALUES (
          ${coupleId}, ${userId}, ${partner_name || null}, ${wedding_date || null},
          ${location || null}, ${budget_range || null}, 0, null,
          NOW(), NOW()
        )
        RETURNING *
      `;
      
      console.log('✅ Couple profile created:', profileResult[0]?.id);
      
    } else if (user_type === 'admin') {
      console.log('👨‍💼 Creating admin profile for user:', userId);
      
      profileResult = await sql`
        INSERT INTO admin_profiles (
          user_id, created_at, updated_at
        )
        VALUES (
          ${userId}, NOW(), NOW()
        )
        RETURNING *
      `;
      
      console.log('✅ Admin profile created:', profileResult[0]?.user_id);
    }
    
    // Generate JWT token (temporarily allowing login until email verification is implemented)
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        userType: newUser.user_type,
        emailVerified: false // Default until schema supports verification
      },
      process.env.JWT_SECRET || 'wedding-bazaar-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log('✅ [AUTH] User and profile registered successfully:', newUser.id);
    
    // Return success response with verification requirements
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email before logging in.',
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        user_type: newUser.user_type,
        phone: newUser.phone,
        email_verified: newUser.email_verified, // From Firebase verification status
        firebase_uid: newUser.firebase_uid,
        created_at: newUser.created_at
      },
      profile: profileResult ? profileResult[0] : null,
      token, // Token provided but email verification required for login
      verification_required: {
        email: !isFirebaseVerified, // Only if not already verified by Firebase
        phone: user_type !== 'admin', // Admin doesn't need phone verification
        documents: user_type === 'vendor' // Only vendors need document verification
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [AUTH] Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Verify Email endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { email, verification_token } = req.body;
    console.log('🔍 Email verification request:', { email, token: verification_token?.substring(0, 10) + '...' });

    if (!email || !verification_token) {
      return res.status(400).json({
        success: false,
        error: 'Email and verification_token are required',
        timestamp: new Date().toISOString()
      });
    }

    // Check token in database first
    const tokenRecords = await sql`
      SELECT user_id, email, expires_at, used_at 
      FROM email_verification_tokens 
      WHERE token = ${verification_token} AND email = ${email}
    `;

    if (tokenRecords.length === 0) {
      // Fallback to old token format for backward compatibility
      try {
        const decoded = Buffer.from(verification_token, 'base64').toString();
        const [token_user_id, token_email, timestamp] = decoded.split(':');
        
        if (token_email !== email) {
          throw new Error('Token email mismatch');
        }
        
        const tokenTime = parseInt(timestamp);
        const now = Date.now();
        const hoursDiff = (now - tokenTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          return res.status(400).json({
            success: false,
            error: 'Verification token has expired. Please request a new verification email.',
            timestamp: new Date().toISOString()
          });
        }

        // Use old format verification
        const result = await sql`
          UPDATE users 
          SET email_verified = true, updated_at = NOW()
          WHERE email = ${email} AND id = ${token_user_id}
          RETURNING id, email, first_name, last_name, user_type, email_verified
        `;

        if (result.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'User not found or invalid verification token',
            timestamp: new Date().toISOString()
          });
        }

        const user = result[0];
        console.log('✅ Email verified successfully (old format) for user:', user.id);

        return res.json({
          success: true,
          message: 'Email verified successfully. You can now login.',
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            userType: user.user_type,
            emailVerified: user.email_verified
          },
          timestamp: new Date().toISOString()
        });

      } catch (decodeError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid verification token format',
          timestamp: new Date().toISOString()
        });
      }
    }

    const tokenRecord = tokenRecords[0];

    // Check if token has already been used
    if (tokenRecord.used_at) {
      return res.status(400).json({
        success: false,
        error: 'Verification token has already been used',
        timestamp: new Date().toISOString()
      });
    }

    // Check if token has expired
    if (new Date() > new Date(tokenRecord.expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'Verification token has expired. Please request a new verification email.',
        timestamp: new Date().toISOString()
      });
    }

    // Mark token as used and update user
    const result = await sql`
      UPDATE users 
      SET email_verified = true, updated_at = NOW()
      WHERE email = ${email} AND id = ${tokenRecord.user_id}
      RETURNING id, email, first_name, last_name, user_type, email_verified
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    // Mark token as used
    await sql`
      UPDATE email_verification_tokens 
      SET used_at = NOW() 
      WHERE token = ${verification_token}
    `;

    const user = result[0];
    console.log('✅ Email verified successfully for user:', user.id);

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.user_type,
        emailVerified: user.email_verified
      },
      timestamp: new Date().toISOString()
    });

    } catch (tokenError) {
      console.error('❌ Invalid verification token:', tokenError.message);
      return res.status(400).json({
        success: false,
        error: 'Invalid verification token',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Email verification failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Phone Verification endpoint (temporarily disabled until schema supports phone_verified column)
router.post('/verify-phone', async (req, res) => {
  try {
    const { phone, verification_code } = req.body;
    console.log('📱 Phone verification request (PLACEHOLDER):', { phone, hasCode: !!verification_code });

    if (!phone || !verification_code) {
      return res.status(400).json({
        success: false,
        error: 'Phone and verification code required',
        timestamp: new Date().toISOString()
      });
    }

    // TODO: Update schema to include phone_verified column, then implement real verification
    // For now, just return success without updating database
    console.log('✅ Phone verification placeholder completed:', phone);

    res.json({
      success: true,
      message: 'Phone verification completed (placeholder).',
      user: { phone: phone, phone_verified: true },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Phone verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Phone verification failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Vendor Document Submission endpoint
router.post('/vendor/submit-documents', async (req, res) => {
  try {
    const { user_id, document_type, document_url } = req.body;
    console.log('📄 Vendor document submission:', { user_id, document_type });

    if (!user_id || !document_type || !document_url) {
      return res.status(400).json({
        success: false,
        error: 'user_id, document_type, and document_url required',
        timestamp: new Date().toISOString()
      });
    }

    // Update vendor profile with submitted document
    const result = await sql`
      UPDATE vendor_profiles 
      SET 
        verification_documents = verification_documents || ${JSON.stringify({
          [document_type]: {
            url: document_url,
            submitted_at: new Date().toISOString(),
            status: 'pending_review'
          }
        })},
        updated_at = NOW()
      WHERE user_id = ${user_id}
      RETURNING user_id, business_name, verification_status, verification_documents
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor profile not found',
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Document submitted for vendor:', user_id);

    res.json({
      success: true,
      message: 'Document submitted successfully. Awaiting admin review.',
      vendor: result[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Document submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Document submission failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Admin Vendor Verification endpoint
router.post('/admin/verify-vendor', async (req, res) => {
  try {
    const { user_id, verification_status, admin_notes } = req.body;
    console.log('👨‍💼 Admin vendor verification:', { user_id, verification_status });

    if (!user_id || !verification_status) {
      return res.status(400).json({
        success: false,
        error: 'user_id and verification_status required',
        timestamp: new Date().toISOString()
      });
    }

    if (!['verified', 'rejected', 'pending_documents'].includes(verification_status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification_status. Must be: verified, rejected, or pending_documents',
        timestamp: new Date().toISOString()
      });
    }

    // Update vendor profile verification status
    const result = await sql`
      UPDATE vendor_profiles 
      SET 
        verification_status = ${verification_status},
        verification_documents = verification_documents || ${JSON.stringify({
          admin_review: {
            reviewed_at: new Date().toISOString(),
            status: verification_status,
            notes: admin_notes || null
          }
        })},
        updated_at = NOW()
      WHERE user_id = ${user_id}
      RETURNING user_id, business_name, verification_status, verification_documents
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Vendor profile not found',
        timestamp: new Date().toISOString()
      });
    }

    console.log('✅ Vendor verification updated:', user_id, verification_status);

    res.json({
      success: true,
      message: `Vendor ${verification_status} successfully`,
      vendor: result[0],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Vendor verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Vendor verification failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Token verification endpoint
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
        timestamp: new Date().toISOString()
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wedding-bazaar-secret-key');
    
    res.json({
      success: true,
      authenticated: true,
      user: decoded,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      authenticated: false,
      error: 'Invalid token',
      timestamp: new Date().toISOString()
    });
  }
});

// User profile endpoint - Get user profile by email
router.get('/profile', async (req, res) => {
  try {
    console.log('👤 Profile request received');
    
    // Get email from query params or headers
    const email = req.query.email || req.headers['x-user-email'];
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email required',
        message: 'Email parameter is required to fetch profile'
      });
    }
    
    console.log('🔍 Looking up user profile for email:', email);
    
    // Get user from database using the modular sql connection
    const users = await sql`
      SELECT id, first_name, last_name, email, user_type, phone, created_at, updated_at 
      FROM users 
      WHERE email = ${email}
    `;
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'No user found with this email address'
      });
    }
    
    const user = users[0];
    
    // If user is a vendor, get additional vendor info
    let vendorInfo = null;
    if (user.user_type === 'vendor') {
      const vendors = await sql`
        SELECT id, name as business_name, category as business_type, location 
        FROM vendors 
        WHERE user_id = ${user.id}
      `;
      
      if (vendors.length > 0) {
        vendorInfo = vendors[0];
      }
    }
    
    const profileData = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.user_type,  // Map user_type to role for frontend compatibility
      phone: user.phone,
      businessName: vendorInfo?.business_name || '',
      vendorId: vendorInfo?.id || null,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
    
    console.log('✅ Profile data retrieved:', { email: profileData.email, role: profileData.role });
    
    res.json({
      success: true,
      user: profileData
    });
    
  } catch (error) {
    console.error('❌ Profile fetch failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Send Email Verification endpoint
router.post('/send-verification', async (req, res) => {
  try {
    const { email, user_id } = req.body;
    console.log('📧 Send verification request:', { email, user_id });

    if (!email || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'Email and user_id are required',
        timestamp: new Date().toISOString()
      });
    }

    // Get user details for personalized email
    const users = await sql`SELECT first_name, last_name FROM users WHERE id = ${user_id} AND email = ${email}`;
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      });
    }

    const user = users[0];
    
    // Generate a secure verification token
    const tokenData = {
      userId: user_id,
      email: email,
      timestamp: Date.now(),
      random: Math.random().toString(36)
    };
    
    const verificationToken = Buffer.from(JSON.stringify(tokenData)).toString('base64url');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store token in database for security
    try {
      await sql`
        INSERT INTO email_verification_tokens (user_id, email, token, expires_at)
        VALUES (${user_id}, ${email}, ${verificationToken}, ${expiresAt})
        ON CONFLICT (user_id) DO UPDATE SET
        token = ${verificationToken},
        expires_at = ${expiresAt},
        created_at = NOW(),
        used_at = NULL
      `;
    } catch (dbError) {
      console.log('⚠️ Database token storage failed, using fallback method');
      // Continue with email sending even if DB storage fails
    }
    
    console.log('📧 Sending verification email to:', email);
    console.log('🔑 Verification token generated for user:', user_id);
    
    // Send actual verification email
    const emailResult = await emailService.sendVerificationEmail(
      email, 
      verificationToken, 
      user.first_name
    );
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Verification email sent successfully',
        email: email,
        messageId: emailResult.messageId,
        // Include verification URL for development/testing
        ...(emailResult.devMode && { dev_verification_url: emailResult.verificationUrl }),
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Email service failed');
    }

  } catch (error) {
    console.error('❌ Send verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send verification email: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
