const otpStore = new Map();

export const storeOTP = async (email, otp) => {
  try {
    const key = `otp:${email}`;
    const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now
    
    otpStore.set(key, {
      otp,
      expiresAt: expiryTime
    });
    
    console.log('[v0] OTP stored for:', email);
    
    // Auto-cleanup after expiry
    setTimeout(() => {
      otpStore.delete(key);
      console.log('[v0] OTP expired and cleaned up for:', email);
    }, 10 * 60 * 1000);
    
  } catch (error) {
    console.error('[v0] Error storing OTP:', error);
    throw error;
  }
};

export const getOTP = async (email) => {
  try {
    const key = `otp:${email}`;
    const data = otpStore.get(key);
    
    if (!data) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > data.expiresAt) {
      otpStore.delete(key);
      return null;
    }
    
    return data.otp;
  } catch (error) {
    console.error('[v0] Error retrieving OTP:', error);
    throw error;
  }
};

export const getOTPTTL = async (email) => {
  try {
    const key = `otp:${email}`;
    const data = otpStore.get(key);
    
    if (!data) {
      return -2; // Key doesn't exist
    }
    
    const timeRemaining = Math.floor((data.expiresAt - Date.now()) / 1000);
    
    if (timeRemaining <= 0) {
      otpStore.delete(key);
      return -2; // Expired
    }
    
    return timeRemaining;
  } catch (error) {
    console.error('[v0] Error getting OTP TTL:', error);
    throw error;
  }
};

export const deleteOTP = async (email) => {
  try {
    const key = `otp:${email}`;
    otpStore.delete(key);
    console.log('[v0] OTP deleted for:', email);
  } catch (error) {
    console.error('[v0] Error deleting OTP:', error);
    throw error;
  }
};

export default { storeOTP, getOTP, getOTPTTL, deleteOTP };
