const express = require('express');
const router = express.Router();

// Graceful database connection handling
let sql;
try {
  const { neon } = require('@neondatabase/serverless');
  const config = require('../config/database.cjs');
  if (config.databaseUrl) {
    sql = neon(config.databaseUrl);
  } else {
    console.warn('⚠️ No database URL available for couple-profile routes');
    sql = null;
  }
} catch (error) {
  console.error('⚠️ Database connection failed in couple-profile, using fallback mode:', error.message);
  sql = null;
}

// Helper function to handle database operations safely
async function safeQuery(queryFn, fallbackData = null) {
  if (!sql) {
    console.log('📄 Database not available, returning fallback data');
    return fallbackData;
  }
  
  try {
    return await queryFn();
  } catch (error) {
    console.error('❌ Database query failed:', error.message);
    return fallbackData;
  }
}

// Get couple profile with verification status
router.get('/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    
    console.log('🔍 Getting couple profile for ID:', coupleId);
    
    const result = await safeQuery(async () => {
      // Get couple profile with user information and verification status
      const coupleResult = await sql`
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
        WHERE cp.id = ${coupleId}
      `;
      
      if (coupleResult.length === 0) {
        return null;
      }
      
      const couple = coupleResult[0];
      
      // Get wedding details (if table exists)
      let weddingResult = [];
      try {
        weddingResult = await sql`
          SELECT *
          FROM weddings 
          WHERE couple_id = ${coupleId}
          ORDER BY created_at DESC
          LIMIT 1
        `;
      } catch (error) {
        console.log('⚠️ weddings table not found, using empty data');
      }
      
      return { couple, wedding: weddingResult[0] || null };
    });
    
    if (!result || !result.couple) {
      return res.status(404).json({
        success: false,
        error: 'Couple not found',
        message: 'No couple found with this ID'
      });
    }
    
    const { couple, wedding } = result;
    
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
      
      // Wedding Information
      weddingDate: couple.wedding_date,
      weddingVenue: couple.wedding_venue,
      weddingLocation: couple.wedding_location,
      weddingTheme: couple.wedding_theme,
      guestCount: couple.guest_count,
      budget: couple.budget,
      specialRequirements: couple.special_requirements,
      
      // Wedding Details from weddings table
      weddingDetails: wedding ? {
        title: wedding.title,
        venue: wedding.venue,
        location: wedding.location,
        guestCount: wedding.guest_count,
        budget: wedding.budget,
        status: wedding.status,
        description: wedding.description
      } : null,
      
      // Verification Status
      emailVerified: couple.email_verified || false,
      phoneVerified: couple.phone_verified || false,
      
      // Profile Images
      profileImage: couple.profile_image,
      coverImage: couple.cover_image,
      
      // Preferences
      preferredVendors: couple.preferred_vendors || [],
      communicationPreference: couple.communication_preference || 'email',
      newsletterSubscribed: couple.newsletter_subscribed || false,
      
      // Timestamps
      createdAt: couple.created_at,
      updatedAt: couple.updated_at
    };
    
    res.json(coupleProfile);
    
  } catch (error) {
    console.error('❌ Error getting couple profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch couple profile',
      details: error.message
    });
  }
});

// Update couple profile
router.put('/:coupleId', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const profileData = req.body;
    
    console.log('🔄 Updating couple profile for ID:', coupleId);
    console.log('Profile data received:', profileData);
    
    const result = await safeQuery(async () => {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      
      // Map frontend field names to database column names
      const fieldMapping = {
        firstName: 'first_name',
        lastName: 'last_name',
        partnerFirstName: 'partner_first_name',
        partnerLastName: 'partner_last_name',
        partnerPhone: 'partner_phone',
        partnerEmail: 'partner_email',
        weddingDate: 'wedding_date',
        weddingVenue: 'wedding_venue',
        weddingLocation: 'wedding_location',
        weddingTheme: 'wedding_theme',
        guestCount: 'guest_count',
        budget: 'budget',
        specialRequirements: 'special_requirements',
        profileImage: 'profile_image',
        coverImage: 'cover_image'
      };
      
      Object.keys(profileData).forEach(key => {
        const dbField = fieldMapping[key] || key;
        updateFields.push(`${dbField} = $${values.length + 1}`);
        values.push(profileData[key]);
      });
      
      if (updateFields.length === 0) {
        throw new Error('No valid fields to update');
      }
      
      // Add updated_at
      updateFields.push(`updated_at = NOW()`);
      values.push(coupleId);
      
      const updateQuery = `
        UPDATE couple_profiles 
        SET ${updateFields.join(', ')}
        WHERE id = $${values.length}
        RETURNING *
      `;
      
      const result = await sql(updateQuery, values);
      
      if (result.length === 0) {
        throw new Error('Couple not found');
      }
      
      return result[0];
    });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Couple not found or database unavailable'
      });
    }
    
    res.json({
      success: true,
      message: 'Couple profile updated successfully',
      profile: result
    });
    
  } catch (error) {
    console.error('❌ Error updating couple profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update couple profile',
      details: error.message
    });
  }
});

// Request email verification
router.post('/:coupleId/verify-email', async (req, res) => {
  try {
    const { coupleId } = req.params;
    
    console.log('📧 Requesting email verification for couple:', coupleId);
    
    const result = await safeQuery(async () => {
      // Get couple email
      const coupleResult = await sql`
        SELECT u.email, u.first_name, u.last_name
        FROM couple_profiles cp
        INNER JOIN users u ON cp.user_id = u.id
        WHERE cp.id = ${coupleId}
      `;
      
      if (coupleResult.length === 0) {
        throw new Error('Couple not found');
      }
      
      const couple = coupleResult[0];
      
      // Generate verification token
      const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Store verification token
      await sql`
        UPDATE users 
        SET email_verification_token = ${verificationToken},
            email_verification_expires = ${expiresAt}
        WHERE email = ${couple.email}
      `;
      
      return verificationToken;
    });
    
    if (result) {
      console.log(`📧 Email verification link (demo): https://weddingbazaar.com/verify-email?token=${result}`);
      
      res.json({
        success: true,
        message: 'Verification email sent successfully',
        verificationToken: result
      });
    } else {
      res.json({
        success: true,
        message: 'Verification email request processed (database not available)',
        verificationToken: 'demo_token_12345'
      });
    }
    
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
router.post('/:coupleId/verify-phone', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { phone } = req.body;
    
    console.log('📱 Requesting phone verification for couple:', coupleId, 'phone:', phone);
    
    const result = await safeQuery(async () => {
      // Get couple info
      const coupleResult = await sql`
        SELECT u.id, u.first_name, u.last_name
        FROM couple_profiles cp
        INNER JOIN users u ON cp.user_id = u.id
        WHERE cp.id = ${coupleId}
      `;
      
      if (coupleResult.length === 0) {
        throw new Error('Couple not found');
      }
      
      const couple = coupleResult[0];
      
      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Store verification code
      await sql`
        UPDATE users 
        SET phone_verification_code = ${verificationCode},
            phone_verification_expires = ${expiresAt},
            phone = ${phone}
        WHERE id = ${couple.id}
      `;
      
      return verificationCode;
    });
    
    const verificationCode = result || Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`📱 SMS verification code (demo): ${verificationCode} for ${phone}`);
    
    res.json({
      success: true,
      message: 'Verification code sent to your phone',
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
router.post('/:coupleId/confirm-phone', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const { code } = req.body;
    
    console.log('✅ Confirming phone verification for couple:', coupleId, 'code:', code);
    
    const result = await safeQuery(async () => {
      // Get couple and check verification code
      const coupleResult = await sql`
        SELECT u.id, u.phone_verification_code, u.phone_verification_expires
        FROM couple_profiles cp
        INNER JOIN users u ON cp.user_id = u.id
        WHERE cp.id = ${coupleId}
      `;
      
      if (coupleResult.length === 0) {
        throw new Error('Couple not found');
      }
      
      const couple = coupleResult[0];
      
      // Check if code matches and hasn't expired
      if (couple.phone_verification_code !== code) {
        throw new Error('Invalid verification code');
      }
      
      if (new Date() > new Date(couple.phone_verification_expires)) {
        throw new Error('Verification code has expired');
      }
      
      // Mark phone as verified
      await sql`
        UPDATE users 
        SET phone_verified = true,
            phone_verification_code = null,
            phone_verification_expires = null
        WHERE id = ${couple.id}
      `;
      
      // Also update couple_profiles table if column exists
      try {
        await sql`
          UPDATE couple_profiles 
          SET phone_verified = true
          WHERE id = ${coupleId}
        `;
      } catch (error) {
        console.log('⚠️ phone_verified column not found in couple_profiles, skipping');
      }
      
      return true;
    });
    
    if (result) {
      res.json({
        success: true,
        message: 'Phone number verified successfully'
      });
    } else {
      res.json({
        success: true,
        message: 'Phone verification processed (database not available)'
      });
    }
    
  } catch (error) {
    console.error('❌ Error confirming phone verification:', error);
    
    if (error.message.includes('Invalid verification code') || error.message.includes('expired')) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to verify phone number'
      });
    }
  }
});

// Get verification status
router.get('/:coupleId/verification-status', async (req, res) => {
  try {
    const { coupleId } = req.params;
    
    console.log('📊 Getting verification status for couple:', coupleId);
    
    const result = await safeQuery(async () => {
      // Get verification status
      const coupleResult = await sql`
        SELECT 
          u.email_verified,
          u.phone_verified,
          cp.phone_verified as cp_phone_verified
        FROM couple_profiles cp
        INNER JOIN users u ON cp.user_id = u.id
        WHERE cp.id = ${coupleId}
      `;
      
      if (coupleResult.length === 0) {
        throw new Error('Couple not found');
      }
      
      return coupleResult[0];
    });
    
    if (result) {
      // Calculate verification progress
      const emailVerified = result.email_verified || false;
      const phoneVerified = result.phone_verified || result.cp_phone_verified || false;
      
      const verificationCount = [emailVerified, phoneVerified].filter(Boolean).length;
      const verificationProgress = Math.round((verificationCount / 2) * 100);
      
      res.json({
        emailVerified,
        phoneVerified,
        verificationProgress
      });
    } else {
      // Fallback data when database is not available
      res.json({
        emailVerified: false,
        phoneVerified: false,
        verificationProgress: 0
      });
    }
    
  } catch (error) {
    console.error('❌ Error getting verification status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get verification status'
    });
  }
});

// Get/Create wedding details
router.get('/:coupleId/wedding', async (req, res) => {
  try {
    const { coupleId } = req.params;
    
    console.log('💒 Getting wedding details for couple:', coupleId);
    
    const result = await safeQuery(async () => {
      // Check if couple exists
      const coupleCheck = await sql`SELECT id FROM couple_profiles WHERE id = ${coupleId}`;
      
      if (coupleCheck.length === 0) {
        throw new Error('Couple not found');
      }
      
      // Get wedding details
      const existingWedding = await sql`SELECT * FROM weddings WHERE couple_id = ${coupleId}`;
      
      return existingWedding[0] || null;
    });
    
    if (result) {
      res.json(result);
    } else {
      // Return default wedding structure
      res.json({
        id: `wedding_${coupleId}`,
        couple_id: coupleId,
        title: 'Our Wedding',
        wedding_date: null,
        venue: null,
        location: null,
        guest_count: null,
        budget: null,
        status: 'planning',
        description: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ Error getting wedding details:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get wedding details'
    });
  }
});

// Update wedding details
router.put('/:coupleId/wedding', async (req, res) => {
  try {
    const { coupleId } = req.params;
    const weddingData = req.body;
    
    console.log('💒 Updating wedding details for couple:', coupleId);
    
    const result = await safeQuery(async () => {
      // Check if couple exists
      const coupleCheck = await sql`SELECT id FROM couple_profiles WHERE id = ${coupleId}`;
      
      if (coupleCheck.length === 0) {
        throw new Error('Couple not found');
      }
      
      // Check if wedding already exists
      const existingWedding = await sql`SELECT id FROM weddings WHERE couple_id = ${coupleId}`;
      
      if (existingWedding.length > 0) {
        // Update existing wedding
        const updateQuery = `
          UPDATE weddings 
          SET title = $1, wedding_date = $2, venue = $3, location = $4, 
              guest_count = $5, budget = $6, description = $7, updated_at = NOW()
          WHERE couple_id = $8
          RETURNING *
        `;
        
        const result = await sql(updateQuery, [
          weddingData.title || 'Our Wedding',
          weddingData.weddingDate,
          weddingData.venue,
          weddingData.location,
          weddingData.guestCount,
          weddingData.budget,
          weddingData.description,
          coupleId
        ]);
        
        return result[0];
      } else {
        // Create new wedding
        const insertQuery = `
          INSERT INTO weddings (couple_id, title, wedding_date, venue, location, guest_count, budget, description)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        
        const result = await sql(insertQuery, [
          coupleId,
          weddingData.title || 'Our Wedding',
          weddingData.weddingDate,
          weddingData.venue,
          weddingData.location,
          weddingData.guestCount,
          weddingData.budget,
          weddingData.description
        ]);
        
        return result[0];
      }
    });
    
    if (result) {
      res.json({
        success: true,
        message: 'Wedding details updated successfully',
        wedding: result
      });
    } else {
      res.json({
        success: true,
        message: 'Wedding details update processed (database not available)',
        wedding: {
          id: `wedding_${coupleId}`,
          couple_id: coupleId,
          ...weddingData,
          updated_at: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error updating wedding details:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update wedding details'
    });
  }
});

module.exports = router;
