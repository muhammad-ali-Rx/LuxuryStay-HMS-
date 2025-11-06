import User from '../Models/users.mjs';
import { generateOTP, sendOTPEmail, sendWelcomeEmail } from '../Services/emailService.mjs';
import { storeOTP, getOTP, deleteOTP, getOTPTTL } from '../Services/otpService.mjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// const otpStore = {}; // In production, use Redis for this

/* ================================
   🔹 Step 1: Send OTP to Email
=================================*/
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const otp = generateOTP();
    await storeOTP(email, otp);

    console.log('[v0] OTP for', email, ':', otp); // Debug - remove in production

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      email,
      expiresIn: 600, // 10 minutes in seconds
    });

    // Send OTP email asynchronously
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('[v0] Error sending OTP email:', emailError);
      // Don't fail the request if email sending fails, OTP is already stored
    }
  } catch (error) {
    console.error('[v0] Error sending OTP:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
};

/* ================================
   🔹 Step 1.5: Resend OTP
=================================*/
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const otp = generateOTP();
    await storeOTP(email, otp);

    console.log('[v0] OTP resent for', email, ':', otp);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      email,
      expiresIn: 600,
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('[v0] Error sending resend OTP email:', emailError);
    }
  } catch (error) {
    console.error('[v0] Error resending OTP:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ success: false, message: 'Failed to resend OTP', error: error.message });
  }
};

/* ================================
   🔹 Step 2: Verify OTP
=================================*/
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const storedOTP = await getOTP(email);

    if (!storedOTP) {
      return res.status(400).json({ success: false, message: 'OTP expired or not requested' });
    }

    if (storedOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP verified - delete it from OTP service
    await deleteOTP(email);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      email,
      verified: true,
    });
  } catch (error) {
    console.error('[v0] Error verifying OTP:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ success: false, message: 'Failed to verify OTP', error: error.message });
  }
};

/* ================================
   🔹 Step 2.5: Check OTP Status
=================================*/
export const checkOTPStatus = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const ttl = await getOTPTTL(email);

    let status = 'not_requested';
    if (ttl === -2) {
      status = 'not_requested'; // Key doesn't exist
    } else if (ttl > 0) {
      status = 'valid'; // OTP is still valid
    } else if (ttl === -1) {
      status = 'no_expiry'; // No expiration (shouldn't happen)
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      status,
      timeRemaining: ttl > 0 ? ttl : 0,
    });
  } catch (error) {
    console.error('[v0] Error checking OTP status:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ success: false, message: 'Failed to check OTP status', error: error.message });
  }
};

/* ================================
   🔹 Step 3: Complete Registration
=================================*/
export const completeRegistration = async (req, res) => {
  try {
    const { email, password, name, address, profileImage } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required' });
    }

    // Verify email was OTP verified (you can use a temp token for this)
    // For now, just check email is not already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      address: address || '',
      profileImage: profileImage || '',
      bookingStatus: 'none',
      status: 'active',
    });

    await newUser.save();

    // Send welcome email
    await sendWelcomeEmail(email, name);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.setHeader('Content-Type', 'application/json');
    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        address: newUser.address,
      },
    });
  } catch (error) {
    console.error('[v0] Error completing registration:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ success: false, message: 'Failed to complete registration', error: error.message });
  }
};
