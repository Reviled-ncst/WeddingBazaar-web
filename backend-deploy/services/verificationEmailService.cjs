const nodemailer = require('nodemailer');

/**
 * Email notification service for verification status updates
 */

// Configure email transporter
const createTransporter = () => {
  // For production, use a real email service like SendGrid, AWS SES, or Gmail
  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_SERVICE) {
    return nodemailer.createTransporter({
      service: process.env.EMAIL_SERVICE, // e.g., 'gmail', 'sendgrid'
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  // For development, log emails to console
  return {
    sendMail: async (mailOptions) => {
      console.log('📧 [Email Service] Would send email:');
      console.log('   To:', mailOptions.to);
      console.log('   Subject:', mailOptions.subject);
      console.log('   Body:', mailOptions.text || mailOptions.html);
      return { messageId: 'dev-' + Date.now() };
    }
  };
};

const transporter = createTransporter();

/**
 * Send verification approved email
 */
async function sendVerificationApprovedEmail(userEmail, userName) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@weddingbazaar.com',
    to: userEmail,
    subject: '✅ Your Wedding Bazaar Account Has Been Verified',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Account Verified!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            
            <div class="badge">✅ Verified Account</div>
            
            <p><strong>Great news!</strong> Your Wedding Bazaar account has been successfully verified by our team.</p>
            
            <p>You now have access to:</p>
            <ul>
              <li>✨ Premium vendor features</li>
              <li>🔒 Secure booking system</li>
              <li>💬 Direct messaging with clients</li>
              <li>📊 Advanced analytics dashboard</li>
              <li>⭐ Verified badge on your profile</li>
            </ul>
            
            <p>Your verified status helps build trust with clients and gives you access to exclusive platform features.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://weddingbazaar-web.web.app'}/vendor/dashboard" class="button">
              Go to Dashboard
            </a>
            
            <p>Thank you for being a valued member of the Wedding Bazaar community!</p>
            
            <p>Best regards,<br>
            <strong>The Wedding Bazaar Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 Wedding Bazaar. All rights reserved.</p>
            <p>This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${userName},

Great news! Your Wedding Bazaar account has been successfully verified.

You now have access to:
- Premium vendor features
- Secure booking system
- Direct messaging with clients
- Advanced analytics dashboard
- Verified badge on your profile

Visit your dashboard: ${process.env.FRONTEND_URL || 'https://weddingbazaar-web.web.app'}/vendor/dashboard

Thank you for being a valued member of the Wedding Bazaar community!

Best regards,
The Wedding Bazaar Team
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [Email Service] Verification approved email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [Email Service] Failed to send verification approved email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send verification rejected email
 */
async function sendVerificationRejectedEmail(userEmail, userName, reason) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@weddingbazaar.com',
    to: userEmail,
    subject: '⚠️ Wedding Bazaar Verification Update',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reason-box { background: #fff; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Verification Update</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            
            <p>Thank you for submitting your verification documents. Unfortunately, we were unable to approve your verification at this time.</p>
            
            <div class="reason-box">
              <strong>Reason:</strong><br>
              ${reason}
            </div>
            
            <p><strong>What you can do next:</strong></p>
            <ul>
              <li>📄 Review the requirements and ensure your documents meet our standards</li>
              <li>📸 Submit clear, high-quality photos of your documents</li>
              <li>✅ Make sure all information is visible and legible</li>
              <li>🔄 Resubmit your verification once you've addressed the issue</li>
            </ul>
            
            <p>Need help? Our support team is here to assist you.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://weddingbazaar-web.web.app'}/profile/settings" class="button">
              Resubmit Verification
            </a>
            
            <p>Thank you for your understanding.</p>
            
            <p>Best regards,<br>
            <strong>The Wedding Bazaar Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 Wedding Bazaar. All rights reserved.</p>
            <p>If you have questions, contact support at support@weddingbazaar.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${userName},

Thank you for submitting your verification documents. Unfortunately, we were unable to approve your verification at this time.

Reason: ${reason}

What you can do next:
- Review the requirements and ensure your documents meet our standards
- Submit clear, high-quality photos of your documents
- Make sure all information is visible and legible
- Resubmit your verification once you've addressed the issue

Resubmit at: ${process.env.FRONTEND_URL || 'https://weddingbazaar-web.web.app'}/profile/settings

Need help? Contact support at support@weddingbazaar.com

Thank you for your understanding.

Best regards,
The Wedding Bazaar Team
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [Email Service] Verification rejected email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [Email Service] Failed to send verification rejected email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send verification pending email
 */
async function sendVerificationPendingEmail(userEmail, userName) {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@weddingbazaar.com',
    to: userEmail,
    subject: '⏳ Your Verification is Being Reviewed',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .timeline { background: #fff; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏳ Verification Submitted</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            
            <p><strong>Thank you for submitting your verification!</strong></p>
            
            <p>Your documents are now being reviewed by our verification team. Here's what happens next:</p>
            
            <div class="timeline">
              <p>⏳ <strong>Review Timeline:</strong> 24-48 hours</p>
              <p>📧 You'll receive an email once the review is complete</p>
              <p>✅ If approved, you'll get instant access to verified features</p>
            </div>
            
            <p><strong>What we're checking:</strong></p>
            <ul>
              <li>Document authenticity and validity</li>
              <li>Photo quality and clarity</li>
              <li>Information accuracy</li>
              <li>Identity match</li>
            </ul>
            
            <p>Thank you for your patience!</p>
            
            <p>Best regards,<br>
            <strong>The Wedding Bazaar Team</strong></p>
          </div>
          <div class="footer">
            <p>© 2025 Wedding Bazaar. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Hello ${userName},

Thank you for submitting your verification!

Your documents are now being reviewed by our verification team.

Review Timeline: 24-48 hours
You'll receive an email once the review is complete.

What we're checking:
- Document authenticity and validity
- Photo quality and clarity
- Information accuracy
- Identity match

Thank you for your patience!

Best regards,
The Wedding Bazaar Team
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [Email Service] Verification pending email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ [Email Service] Failed to send verification pending email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
  sendVerificationPendingEmail
};
