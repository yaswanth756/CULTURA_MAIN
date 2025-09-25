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

export const sendOTPEmail = async (email, otp, type = 'login') => {
  try {
    const transporter = await createTransporter();

    const subject =
      type === 'login'
        ? 'Login OTP - Your Vendor Platform'
        : 'Welcome! Verify Your Account - Your Vendor Platform';

    const htmlContent = `
      <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;">
        <h2 style="background:#c48c2e;color:#fff;padding:15px;text-align:center;">
          ${type === 'login' ? 'Welcome Back!' : 'Welcome to Our Platform!'}
        </h2>
        <div style="padding:20px;background:#f9f9f9;">
          <p>
            ${type === 'login'
              ? 'Use the OTP below to log in:'
              : 'Use the OTP below to verify your email:'}
          </p>
          <div style="font-size:24px;font-weight:bold;color:#c48c2e;margin:20px 0;text-align:center;">
            ${otp}
          </div>
          <p style="color:#888;">Valid for 10 minutes. Do not share this code.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@yourplatform.com',
      to: email,
      subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);

    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};
