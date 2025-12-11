import redis from 'redis';

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => {
  console.error('[v0] Redis Client Error:', err);
});

export const connectRedis = async () => {
  try {
    await client.connect();
    console.log('[v0] Redis connected successfully');
  } catch (error) {
    console.error('[v0] Failed to connect to Redis:', error);
    throw error;
  }
};

// Store OTP with automatic expiration (10 minutes)
export const storeOTP = async (email, otp) => {
  try {
    const key = `otp:${email}`;
    await client.setEx(key, 600, otp); // 600 seconds = 10 minutes
    console.log('[v0] OTP stored in Redis for:', email);
  } catch (error) {
    console.error('[v0] Error storing OTP in Redis:', error);
    throw error;
  }
};

// Get OTP from Redis
export const getOTP = async (email) => {
  try {
    const key = `otp:${email}`;
    const otp = await client.get(key);
    return otp;
  } catch (error) {
    console.error('[v0] Error retrieving OTP from Redis:', error);
    throw error;
  }
};

// Get OTP TTL (time remaining)
export const getOTPTTL = async (email) => {
  try {
    const key = `otp:${email}`;
    const ttl = await client.ttl(key);
    return ttl; // Returns -2 if key doesn't exist, -1 if no expiry, or seconds remaining
  } catch (error) {
    console.error('[v0] Error getting OTP TTL:', error);
    throw error;
  }
};

// Delete OTP from Redis
export const deleteOTP = async (email) => {
  try {
    const key = `otp:${email}`;
    await client.del(key);
    console.log('[v0] OTP deleted from Redis for:', email);
  } catch (error) {
    console.error('[v0] Error deleting OTP from Redis:', error);
    throw error;
  }
};

export default client;
