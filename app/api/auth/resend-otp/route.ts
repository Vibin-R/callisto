import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { generateOTP } from '../../../../lib/auth';
import { sendOTPEmail } from '../../../../lib/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, user.name);
    console.log('ojkj',emailSent, process.env.SMTP_USER, process.env.SMTP_PASS);
    if (!emailSent && process.env.SMTP_USER && process.env.SMTP_PASS) {
      // Only fail if SMTP is configured but email still failed
      return NextResponse.json(
        { 
          error: 'Failed to send OTP email',
          details: 'Please check your SMTP configuration. OTP has been logged to server console.'
        },
        { status: 500 }
      );
    }

    // If SMTP not configured, OTP is logged to console (dev mode)
    if (!emailSent) {
      console.log(`OTP for ${email}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP has been resent to your email',
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to resend OTP', details: error.message },
      { status: 500 }
    );
  }
}

