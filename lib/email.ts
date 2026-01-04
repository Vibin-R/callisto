import nodemailer from 'nodemailer';

// Check if SMTP is configured
const isSMTPConfigured = () => {
  console.log('isSMTPConfigured',process.env.SMTP_USER, process.env.SMTP_PASS);
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
};

// Create transporter only if SMTP is configured
const getTransporter = () => {
  if (!isSMTPConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function sendOTPEmail(email: string, otp: string, name: string) {
  // In development, if SMTP is not configured, log OTP to console
  if (!isSMTPConfigured()) {
    console.log('\n========================================');
    console.log('📧 OTP EMAIL (Development Mode)');
    console.log('========================================');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`OTP: ${otp}`);
    console.log('========================================\n');
    console.warn('⚠️  SMTP not configured. OTP logged to console above.');
    console.warn('⚠️  To enable email sending, set SMTP_USER and SMTP_PASS in .env.local');
    return true; // Return true in dev mode so user can still proceed
  }

  const transporter = getTransporter();
  if (!transporter) {
    console.error('Email transporter not available');
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Callisto - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Callisto</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">A Not So Intelligent Progress Tracker</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #111827; margin-top: 0;">Email Verification</h2>
          <p style="color: #6b7280; line-height: 1.6;">
            Hi ${name},
          </p>
          <p style="color: #6b7280; line-height: 1.6;">
            Thank you for signing up for Callisto! Please use the following OTP to verify your email address:
          </p>
          <div style="background: white; border: 2px solid #4f46e5; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <h1 style="color: #4f46e5; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: monospace;">${otp}</h1>
          </div>
          <p style="color: #6b7280; line-height: 1.6; font-size: 14px;">
            This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error: any) {
    console.error('Error sending email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    
    // Log OTP to console as fallback
    console.log('\n========================================');
    console.log('📧 OTP FALLBACK (Email failed)');
    console.log('========================================');
    console.log(`To: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('========================================\n');
    
    return false;
  }
}

