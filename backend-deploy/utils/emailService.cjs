const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure email transporter
    // Using Gmail SMTP (you can change this to other providers)
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // Your Gmail app password
      }
    });

    // Fallback to console logging if no email config
    this.isConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    
    if (!this.isConfigured) {
      console.log('⚠️ Email service not configured - emails will be logged to console');
    } else {
      console.log('✅ Email service configured with:', process.env.EMAIL_USER);
    }
  }

  async sendVerificationEmail(email, verificationToken, firstName = '') {
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://weddingbazaarph.web.app'}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Wedding Bazaar</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .btn:hover { background: linear-gradient(135deg, #db2777, #7c3aed); }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💝 Welcome to Wedding Bazaar!</h1>
          <p>Your perfect wedding starts here</p>
        </div>
        
        <div class="content">
          <h2>Hi ${firstName || 'there'}! 👋</h2>
          
          <p>Thank you for registering with Wedding Bazaar! We're excited to help you plan your dream wedding.</p>
          
          <p>To complete your registration and start exploring amazing wedding vendors, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="btn">✅ Verify My Email</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 14px;">
            ${verificationUrl}
          </p>
          
          <div class="warning">
            <strong>⏰ Important:</strong> This verification link will expire in 24 hours. If you don't verify your email, you won't be able to login to your account.
          </div>
          
          <p>Once verified, you'll be able to:</p>
          <ul>
            <li>🔍 Browse and contact wedding vendors</li>
            <li>📅 Book services and manage appointments</li>
            <li>💬 Message vendors directly</li>
            <li>💰 Get quotes and compare prices</li>
            <li>⭐ Read reviews and ratings</li>
          </ul>
          
          <p>If you didn't create an account with Wedding Bazaar, please ignore this email.</p>
          
          <p>Happy wedding planning! 💐</p>
          <p><strong>The Wedding Bazaar Team</strong></p>
        </div>
        
        <div class="footer">
          <p>Wedding Bazaar - Your Perfect Day Awaits</p>
          <p>This email was sent to ${email}</p>
          <p>© ${new Date().getFullYear()} Wedding Bazaar. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Welcome to Wedding Bazaar!

Hi ${firstName || 'there'}!

Thank you for registering with Wedding Bazaar! To complete your registration and start exploring amazing wedding vendors, please verify your email address.

Verification Link: ${verificationUrl}

This link will expire in 24 hours.

Once verified, you'll be able to browse vendors, book services, message vendors, get quotes, and more!

If you didn't create an account with Wedding Bazaar, please ignore this email.

Happy wedding planning!
The Wedding Bazaar Team
    `;

    const mailOptions = {
      from: `"Wedding Bazaar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '💝 Verify Your Email - Welcome to Wedding Bazaar!',
      text: textContent,
      html: htmlContent
    };

    try {
      if (this.isConfigured) {
        console.log('📧 Sending verification email to:', email);
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return {
          success: true,
          messageId: info.messageId,
          email: email
        };
      } else {
        // Fallback: Log email content for development
        console.log('📧 EMAIL WOULD BE SENT TO:', email);
        console.log('📧 VERIFICATION URL:', verificationUrl);
        console.log('📧 EMAIL CONTENT:');
        console.log(textContent);
        
        return {
          success: true,
          messageId: 'dev-mode-' + Date.now(),
          email: email,
          devMode: true,
          verificationUrl: verificationUrl
        };
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw new Error('Failed to send verification email: ' + error.message);
    }
  }

  async sendPasswordResetEmail(email, resetToken, firstName = '') {
    // Similar implementation for password reset
    console.log('📧 Password reset email would be sent to:', email);
    // Implementation here...
  }

  async testConnection() {
    if (!this.isConfigured) {
      console.log('⚠️ Email service not configured for testing');
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email service connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
