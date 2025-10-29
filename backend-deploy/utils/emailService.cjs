const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configure email transporter
    // Using Gmail SMTP (you can change this to other providers)
    this.transporter = nodemailer.createTransport({
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

  /**
   * Send notification to vendor when new booking is created
   * @param {Object} vendorData - Vendor information
   * @param {Object} bookingData - Booking details
   */
  async sendNewBookingNotification(vendorData, bookingData) {
    const { email, businessName, firstName } = vendorData;
    const { 
      id, 
      coupleName, 
      coupleEmail, 
      serviceType, 
      eventDate, 
      eventLocation, 
      guestCount,
      budgetRange,
      specialRequests,
      createdAt 
    } = bookingData;

    const bookingUrl = `${process.env.FRONTEND_URL || 'https://weddingbazaarph.web.app'}/vendor/bookings`;
    const formattedEventDate = new Date(eventDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Request - Wedding Bazaar</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .btn:hover { background: linear-gradient(135deg, #db2777, #7c3aed); }
          .booking-details { background: #f9fafb; border-left: 4px solid #ec4899; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; min-width: 140px; }
          .detail-value { color: #111827; }
          .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .urgent { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 New Booking Request!</h1>
          <p>A couple is interested in your services</p>
        </div>
        
        <div class="content">
          <h2>Hi ${firstName || businessName}! 👋</h2>
          
          <p class="highlight">
            <strong>🔔 You have a new booking inquiry!</strong><br/>
            Respond quickly to increase your chances of securing this booking.
          </p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #ec4899;">📋 Booking Details</h3>
            
            <div class="detail-row">
              <span class="detail-label">👫 Couple Name:</span>
              <span class="detail-value">${coupleName}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📧 Email:</span>
              <span class="detail-value">${coupleEmail}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">💍 Service Type:</span>
              <span class="detail-value">${serviceType}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📅 Event Date:</span>
              <span class="detail-value">${formattedEventDate}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">📍 Location:</span>
              <span class="detail-value">${eventLocation}</span>
            </div>
            
            ${guestCount ? `
            <div class="detail-row">
              <span class="detail-label">👥 Guest Count:</span>
              <span class="detail-value">${guestCount} guests</span>
            </div>
            ` : ''}
            
            ${budgetRange ? `
            <div class="detail-row">
              <span class="detail-label">💰 Budget Range:</span>
              <span class="detail-value">${budgetRange}</span>
            </div>
            ` : ''}
            
            <div class="detail-row">
              <span class="detail-label">🆔 Booking ID:</span>
              <span class="detail-value">${id}</span>
            </div>
          </div>
          
          ${specialRequests ? `
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h4 style="margin-top: 0; color: #1e40af;">💬 Special Requests:</h4>
            <p style="margin: 0; color: #1e3a8a;">${specialRequests}</p>
          </div>
          ` : ''}
          
          <h3>🚀 Next Steps:</h3>
          <ol>
            <li><strong>Review the booking details</strong> in your vendor dashboard</li>
            <li><strong>Send a quote</strong> with your pricing and availability</li>
            <li><strong>Respond within 24 hours</strong> for best results</li>
          </ol>
          
          <div style="text-align: center;">
            <a href="${bookingUrl}" class="btn">📋 View Booking Details</a>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <strong>⏰ Quick Response = Higher Conversion</strong><br/>
            <small>Couples typically choose vendors who respond within the first 24 hours. Don't miss out on this opportunity!</small>
          </div>
          
          <p>Need help? Reply to this email or contact our support team.</p>
          
          <p>Good luck! 🍀</p>
          <p><strong>The Wedding Bazaar Team</strong></p>
        </div>
        
        <div class="footer">
          <p>Wedding Bazaar - Vendor Dashboard</p>
          <p>This email was sent to ${email}</p>
          <p>© ${new Date().getFullYear()} Wedding Bazaar. All rights reserved.</p>
          <p style="font-size: 12px; margin-top: 10px;">
            <a href="${bookingUrl}" style="color: #6b7280; text-decoration: none;">Manage Bookings</a> | 
            <a href="${process.env.FRONTEND_URL}/vendor/settings" style="color: #6b7280; text-decoration: none;">Email Preferences</a>
          </p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
New Booking Request - Wedding Bazaar

Hi ${firstName || businessName}!

You have a new booking inquiry!

Booking Details:
- Couple Name: ${coupleName}
- Email: ${coupleEmail}
- Service Type: ${serviceType}
- Event Date: ${formattedEventDate}
- Location: ${eventLocation}
${guestCount ? `- Guest Count: ${guestCount} guests` : ''}
${budgetRange ? `- Budget Range: ${budgetRange}` : ''}
- Booking ID: ${id}

${specialRequests ? `Special Requests:\n${specialRequests}\n` : ''}

Next Steps:
1. Review the booking details in your vendor dashboard
2. Send a quote with your pricing and availability
3. Respond within 24 hours for best results

View Booking: ${bookingUrl}

Quick Response = Higher Conversion
Couples typically choose vendors who respond within the first 24 hours.

Good luck!
The Wedding Bazaar Team
    `;

    const mailOptions = {
      from: `"Wedding Bazaar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🎉 New Booking Request from ${coupleName} - ${serviceType}`,
      text: textContent,
      html: htmlContent,
      priority: 'high' // Mark as high priority
    };

    try {
      if (this.isConfigured) {
        console.log('📧 Sending new booking notification to vendor:', email);
        const info = await this.transporter.sendMail(mailOptions);
        console.log('✅ Vendor notification sent successfully:', info.messageId);
        return {
          success: true,
          messageId: info.messageId,
          email: email
        };
      } else {
        // Fallback: Log email content for development
        console.log('📧 VENDOR NOTIFICATION WOULD BE SENT TO:', email);
        console.log('📧 BOOKING URL:', bookingUrl);
        console.log('📧 EMAIL CONTENT:');
        console.log(textContent);
        
        return {
          success: true,
          messageId: 'dev-mode-' + Date.now(),
          email: email,
          devMode: true,
          bookingUrl: bookingUrl
        };
      }
    } catch (error) {
      console.error('❌ Vendor notification email failed:', error);
      // Don't throw - we don't want to fail booking creation if email fails
      return {
        success: false,
        error: error.message
      };
    }
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
