import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = async () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// 🎨 Professional email templates
const getEmailTemplate = (otp, type, userRole) => {
  const isVendor = userRole === 'vendor';
  const platformName = 'Utsavlokam';
  
  const colors = {
    primary: isVendor ? '#1f2937' : '#c48c2e', // Dark gray for vendors, gold for users
    secondary: isVendor ? '#374151' : '#d97706',
    background: isVendor ? '#f8fafc' : '#fef3c7'
  };

  const titles = {
    user_login: 'Welcome Back to Utsavlokam!',
    user_signup: 'Welcome to Utsavlokam! 🎉',
    vendor_login: 'Vendor Portal Access',
    vendor_signup: 'Welcome to Utsavlokam Partners! 💼'
  };

  const messages = {
    user_login: 'Ready to book amazing services for your events? Use the code below to continue.',
    user_signup: 'We\'re excited to help you discover and book the best event services. Verify your account to get started!',
    vendor_login: 'Access your vendor dashboard to manage bookings and grow your business.',
    vendor_signup: 'Join our growing network of trusted service providers. Let\'s verify your account and get you started!'
  };

  const templateKey = `${userRole}_${type}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${titles[templateKey]}</title>
    </head>
    <body style="margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f5f5;">
      <div style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);padding:30px 20px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:24px;font-weight:600;">${platformName}</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">${isVendor ? 'Partner Portal' : 'Your Event Platform'}</p>
        </div>

        <!-- Content -->
        <div style="padding:40px 30px;">
          <h2 style="color:#1f2937;margin:0 0 16px;font-size:20px;font-weight:600;">
            ${titles[templateKey]}
          </h2>
          
          <p style="color:#4b5563;line-height:1.6;margin:0 0 24px;font-size:16px;">
            ${messages[templateKey]}
          </p>

          <!-- OTP Section -->
          <div style="background:${colors.background};border:1px solid ${colors.primary}20;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
            <p style="color:#4b5563;margin:0 0 12px;font-size:14px;font-weight:500;">Your verification code:</p>
            <div style="font-size:32px;font-weight:700;color:${colors.primary};letter-spacing:6px;font-family:monospace;">
              ${otp}
            </div>
            <p style="color:#6b7280;margin:12px 0 0;font-size:12px;">
              Valid for 10 minutes • Keep this code private
            </p>
          </div>

          <!-- Security Notice -->
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:16px;margin:24px 0;">
            <p style="color:#dc2626;margin:0;font-size:14px;font-weight:500;">🔒 Security Notice</p>
            <p style="color:#7f1d1d;margin:8px 0 0;font-size:13px;line-height:1.4;">
              Never share this code with anyone. Our team will never ask for your OTP over phone or email.
            </p>
          </div>

          <!-- Call to Action -->
          <p style="color:#4b5563;line-height:1.5;margin:24px 0 0;font-size:15px;">
            ${isVendor 
              ? 'Need help setting up your vendor account? <a href="mailto:support@utsavlokam.com" style="color:' + colors.primary + ';text-decoration:none;">Contact our partner support team</a>.'
              : 'Have questions? <a href="mailto:support@utsavlokam.com" style="color:' + colors.primary + ';text-decoration:none;">We\'re here to help</a>!'
            }
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f9fafb;padding:24px 30px;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="color:#6b7280;margin:0;font-size:12px;">
            © 2025 ${platformName}. Making every event memorable.
          </p>
          <p style="color:#9ca3af;margin:8px 0 0;font-size:11px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// 🚀 Enhanced sendOTPEmail function
export const sendOTPEmail = async (email, otp, type = 'login', userRole = 'user') => {
  try {
    const transporter = await createTransporter();
    
    const isVendor = userRole === 'vendor';
    const platformName = 'Utsavlokam';
    
    const subjects = {
      user_login: `Welcome back! Your ${platformName} verification code`,
      user_signup: `Welcome to ${platformName}! Verify your account`,
      vendor_login: `${platformName} Vendor Portal - Verification Code`,
      vendor_signup: `Welcome to ${platformName} Partners - Verify Account`
    };

    const subject = subjects[`${userRole}_${type}`] || `${platformName} - Verification Code`;
    const htmlContent = getEmailTemplate(otp, type, userRole);

    const mailOptions = {
      from: `"${platformName}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: htmlContent,
      // Add text fallback
      text: `
        ${platformName} - Verification Code
        
        Your verification code: ${otp}
        
        This code is valid for 10 minutes.
        Do not share this code with anyone.
        
        ${isVendor ? 'Welcome to our vendor network!' : 'Welcome to our platform!'}
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      email,
      type,
      userRole
    };

  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw new Error(`Failed to send ${userRole} ${type} email: ${error.message}`);
  }
};

// 🔥 Convenience functions
export const sendUserOTP = (email, otp, type = 'login') => {
  return sendOTPEmail(email, otp, type, 'user');
};

export const sendVendorOTP = (email, otp, type = 'login') => {
  return sendOTPEmail(email, otp, type, 'vendor');
};
