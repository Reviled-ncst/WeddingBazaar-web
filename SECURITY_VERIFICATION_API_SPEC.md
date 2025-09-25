# 🔐 Security Verification Backend API Endpoints

This document outlines the backend API endpoints needed to support the security verification components (Email, Phone, and Face Recognition).

## 📧 Email Verification Endpoints

### POST /api/auth/send-verification-email
Send a verification email with a 6-digit code.

**Request Body:**
```json
{
  "userId": "string",
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent",
  "expiresIn": 300
}
```

### POST /api/auth/verify-email-code
Verify the email verification code.

**Request Body:**
```json
{
  "userId": "string",
  "email": "string",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

## 📱 Phone Verification Endpoints

### POST /api/auth/send-verification-sms
Send a verification SMS with a 6-digit code.

**Request Body:**
```json
{
  "userId": "string",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification SMS sent",
  "expiresIn": 300
}
```

### POST /api/auth/verify-phone-code
Verify the phone verification code.

**Request Body:**
```json
{
  "userId": "string",
  "phone": "+1234567890",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phone verified successfully"
}
```

## 🎭 Face Recognition Endpoints

### POST /api/auth/register-face
Store face descriptor for a user.

**Request Body:**
```json
{
  "userId": "string",
  "faceDescriptor": [0.1, 0.2, 0.3, ...]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Face registered successfully"
}
```

### POST /api/auth/verify-face
Verify a face against stored descriptor.

**Request Body:**
```json
{
  "userId": "string",
  "faceDescriptor": [0.1, 0.2, 0.3, ...]
}
```

**Response:**
```json
{
  "success": true,
  "confidence": 0.85,
  "message": "Face verified successfully"
}
```

## 🔐 Two-Factor Authentication Endpoints

### POST /api/auth/generate-backup-codes
Generate backup codes for 2FA.

**Request Body:**
```json
{
  "userId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "codes": ["123456789", "987654321", ...]
}
```

### POST /api/auth/toggle-2fa
Enable/disable two-factor authentication.

**Request Body:**
```json
{
  "userId": "string",
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "enabled": true,
  "backupCodes": ["123456789", "987654321", ...] // Only when enabling
}
```

## 📊 Database Schema Updates

### Users Table Updates
```sql
-- Add new columns to users table
ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN is_phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN has_face_recognition BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN phone_verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN email_verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN verification_code_expires TIMESTAMP;
```

### New Tables
```sql
-- Face recognition data
CREATE TABLE user_face_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  face_descriptor TEXT NOT NULL, -- JSON array of face descriptor
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Two-factor backup codes
CREATE TABLE user_backup_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification attempts tracking
CREATE TABLE verification_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'email', 'phone', 'face'
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  blocked_until TIMESTAMP NULL
);
```

## 🔧 Implementation Example (Node.js/Express)

```javascript
// routes/auth.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const twilio = require('twilio'); // For SMS
const nodemailer = require('nodemailer'); // For email

// Send verification email
router.post('/send-verification-email', async (req, res) => {
  try {
    const { userId, email } = req.body;
    
    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    // Store code in database
    await db.query(
      'UPDATE users SET email_verification_code = ?, verification_code_expires = ? WHERE id = ?',
      [code, expiresAt, userId]
    );
    
    // Send email
    const transporter = nodemailer.createTransporter({
      // Your email configuration
    });
    
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Wedding Bazaar - Email Verification',
      html: `
        <h2>Verify Your Email</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code expires in 5 minutes.</p>
      `
    });
    
    res.json({ success: true, message: 'Verification email sent', expiresIn: 300 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify email code
router.post('/verify-email-code', async (req, res) => {
  try {
    const { userId, code, email } = req.body;
    
    const user = await db.query(
      'SELECT email_verification_code, verification_code_expires FROM users WHERE id = ?',
      [userId]
    );
    
    if (!user || user.email_verification_code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    if (new Date() > user.verification_code_expires) {
      return res.status(400).json({ error: 'Verification code expired' });
    }
    
    // Mark email as verified
    await db.query(
      'UPDATE users SET is_email_verified = TRUE, email_verification_code = NULL, verification_code_expires = NULL WHERE id = ?',
      [userId]
    );
    
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send verification SMS
router.post('/send-verification-sms', async (req, res) => {
  try {
    const { userId, phone } = req.body;
    
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    
    // Store code in database
    await db.query(
      'UPDATE users SET phone_verification_code = ?, verification_code_expires = ? WHERE id = ?',
      [code, expiresAt, userId]
    );
    
    // Send SMS using Twilio
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    
    await client.messages.create({
      body: `Wedding Bazaar verification code: ${code}`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });
    
    res.json({ success: true, message: 'Verification SMS sent', expiresIn: 300 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register face descriptor
router.post('/register-face', async (req, res) => {
  try {
    const { userId, faceDescriptor } = req.body;
    
    // Store face descriptor (as JSON)
    await db.query(
      'INSERT INTO user_face_data (user_id, face_descriptor) VALUES (?, ?) ON DUPLICATE KEY UPDATE face_descriptor = VALUES(face_descriptor), updated_at = CURRENT_TIMESTAMP',
      [userId, JSON.stringify(faceDescriptor)]
    );
    
    // Update user record
    await db.query(
      'UPDATE users SET has_face_recognition = TRUE WHERE id = ?',
      [userId]
    );
    
    res.json({ success: true, message: 'Face registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## 📱 SMS Service Integration

### Twilio Setup
```bash
npm install twilio
```

### Environment Variables
```env
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_PHONE=+1234567890
```

## 📧 Email Service Integration

### Nodemailer Setup
```bash
npm install nodemailer
```

### Environment Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@weddingbazaar.com
```

## 🔒 Security Considerations

1. **Rate Limiting**: Implement rate limiting for verification attempts
2. **Code Expiration**: Verification codes should expire after 5-10 minutes
3. **Attempt Tracking**: Track and limit failed verification attempts
4. **Face Data Security**: Encrypt face descriptors in database
5. **SMS Costs**: Monitor SMS usage to control costs
6. **Email Deliverability**: Use proper email service for high deliverability

## 🎯 Integration with Wedding Bazaar

1. **Profile Settings**: Integrated security verification in profile
2. **Login Enhancement**: Add face recognition as login option
3. **Account Security**: Display security score and recommendations
4. **Two-Factor Auth**: Optional 2FA for high-security users
5. **Backup Codes**: Provide backup access methods

This comprehensive security system will make Wedding Bazaar one of the most secure wedding platforms available! 🔐✨
