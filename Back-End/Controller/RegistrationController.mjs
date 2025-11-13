import User from '../Models/users.mjs';
import {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail
} from '../services/emailService.mjs';
import {
  storeOTP,
  getOTP,
  getOTPTTL,
  deleteOTP
} from '../services/otpService.mjs';

// Send OTP for registration
export const sendOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    await storeOTP(email, otp);

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        email,
        name: name || '',
      },
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if OTP already exists and get TTL
    const ttl = await getOTPTTL(email);
    
    if (ttl > 300) { // Prevent resend if OTP is still valid for more than 5 minutes
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting a new OTP',
        retryAfter: ttl - 300,
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    await storeOTP(email, otp);

    // Send new OTP
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message,
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    // Get stored OTP
    const storedOTP = await getOTP(email);
    
    if (!storedOTP) {
      return res.status(404).json({
        success: false,
        message: 'OTP not found or expired',
      });
    }

    // Verify OTP
    if (storedOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // OTP verified successfully
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        email,
        verified: true,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message,
    });
  }
};

// Check OTP Status
export const checkOTPStatus = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const ttl = await getOTPTTL(email);
    
    if (ttl === -2) {
      return res.status(404).json({
        success: false,
        message: 'No OTP found for this email',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        email,
        hasOTP: ttl > 0,
        ttl, // Time remaining in seconds
        expiresIn: ttl > 0 ? `${Math.floor(ttl / 60)} minutes ${ttl % 60} seconds` : 'expired',
      },
    });
  } catch (error) {
    console.error('Check OTP status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check OTP status',
      error: error.message,
    });
  }
};

// Complete Registration
// Complete Registration
export const completeRegistration = async (req, res) => {
  try {
    const { email, name, password, phone, address, preferences } = req.body;

    // Validate required fields
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, name, and password are required',
      });
    }

    // Check if user already exists (final check)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Check if OTP was verified
    const hasOTP = await getOTPTTL(email);
    if (hasOTP === -2) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email with OTP first',
      });
    }

    // ✅ FIX: Create new user with proper verification
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save middleware
      phone: phone || '',
      address: address || '',
      preferences: preferences || '',
      role: 'user', // Default role for regular users
      bookingStatus: 'none',
      status: 'Active',
      verified: true, // ✅ YAHAN CHANGE KARO: true karo kyunki OTP verify ho chuka hai
    });

    // Save user
    await newUser.save();

    // Delete OTP after successful registration
    await deleteOTP(email);

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Don't fail registration if welcome email fails
    }

    // Return user data (excluding password)
    const userData = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      bookingStatus: newUser.bookingStatus,
      phone: newUser.phone,
      address: newUser.address,
      profileImage: newUser.profileImage,
      status: newUser.status,
      preferences: newUser.preferences,
      verified: newUser.verified, // ✅ Ab yeh true hoga
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      data: userData,
    });
  } catch (error) {
    console.error('Complete registration error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};