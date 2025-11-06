import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, 
  },
});

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your LuxuryStay OTP - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #0A1F44, #1a3a5c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>LuxuryStay</h1>
            <p>Email Verification</p>
          </div>
          <div style="background: #f5f5f5; padding: 30px; text-align: center;">
            <p style="font-size: 16px; color: #333;">Your One-Time Password (OTP) is:</p>
            <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 10px; border: 2px solid #D4AF37;">
              <h2 style="color: #D4AF37; letter-spacing: 5px; margin: 0;">${otp}</h2>
            </div>
            <p style="color: #666; font-size: 14px;">This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
          </div>
          <div style="background: #0A1F44; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px;">
            <p>&copy; 2025 LuxuryStay. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('[v0] OTP sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('[v0] Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
};

// Send welcome email after registration
export const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to LuxuryStay!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #0A1F44, #1a3a5c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>Welcome to LuxuryStay, ${name}!</h1>
          </div>
          <div style="background: #f5f5f5; padding: 30px;">
            <p style="font-size: 16px; color: #333;">Thank you for registering with LuxuryStay.</p>
            <p style="color: #666;">Your account has been successfully created. You can now book luxury stays with us.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('[v0] Welcome email sent to:', email);
    return true;
  } catch (error) {
    console.error('[v0] Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};
