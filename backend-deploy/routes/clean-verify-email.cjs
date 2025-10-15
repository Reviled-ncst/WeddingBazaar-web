// Clean verify-email endpoint
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
    let tokenRecords = [];
    try {
      tokenRecords = await sql`
        SELECT user_id, email, expires_at, used_at 
        FROM email_verification_tokens 
        WHERE token = ${verification_token} AND email = ${email}
      `;
    } catch (dbError) {
      console.log('⚠️ Database token lookup failed, using fallback');
    }

    let userId = null;

    if (tokenRecords.length === 0) {
      // Fallback to old token format for backward compatibility
      try {
        const decoded = Buffer.from(verification_token, 'base64').toString();
        const parts = decoded.split(':');
        
        if (parts.length >= 3) {
          const [token_user_id, token_email, timestamp] = parts;
          
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

          userId = token_user_id;
        } else {
          throw new Error('Invalid token format');
        }

      } catch (decodeError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid verification token format',
          timestamp: new Date().toISOString()
        });
      }
    } else {
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

      userId = tokenRecord.user_id;

      // Mark token as used
      try {
        await sql`
          UPDATE email_verification_tokens 
          SET used_at = NOW() 
          WHERE token = ${verification_token}
        `;
      } catch (updateError) {
        console.log('⚠️ Could not mark token as used:', updateError.message);
      }
    }

    // Update user email_verified status
    const result = await sql`
      UPDATE users 
      SET email_verified = true, updated_at = NOW()
      WHERE email = ${email} AND id = ${userId}
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

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Email verification failed: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});
