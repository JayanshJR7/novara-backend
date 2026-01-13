import Razorpay from 'razorpay';

/**
 * Initialize Razorpay instance
 * Get keys from: https://dashboard.razorpay.com/app/keys
 */
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

export default razorpayInstance;