import cron from 'node-cron';
import SilverPrice from '../models/silverPrice.js';
import axios from 'axios';

/**
 * Fetch silver price from Gold API
 */
const fetchFromGoldAPI = async () => {
  try {
    const response = await axios.get('https://www.goldapi.io/api/XAG/INR', {
      headers: {
        'x-access-token': process.env.GOLD_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    // Convert price per troy ounce to price per gram
    // 1 troy ounce = 31.1035 grams
    const pricePerOunce = response.data.price;
    const pricePerGram = pricePerOunce / 31.1035;

    return {
      pricePerGram: parseFloat(pricePerGram.toFixed(2)),
      timestamp: response.data.timestamp,
      rawPrice: pricePerOunce
    };
  } catch (error) {
    console.error('❌ Gold API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update silver price in database
 */
const updateSilverPrice = async () => {
  try {
    const apiData = await fetchFromGoldAPI();

    // Save to database
    const silverPrice = await SilverPrice.create({
      pricePerGram: apiData.pricePerGram,
      lastUpdated: new Date(),
      source: 'goldapi-auto',
      currency: 'INR'
    });

    return silverPrice;
  } catch (error) {
    console.error('❌ Failed to update silver price:', error.message);
    throw error;
  }
};

/**
 * Initialize cron jobs for automatic price updates
 * Runs twice daily: 9:00 AM and 6:00 PM IST
 */
export const initSilverPriceCron = () => {
  // Morning update - 9:00 AM IST (3:30 AM UTC)
  cron.schedule('30 3 * * *', async () => {
    try {
      await updateSilverPrice();
    } catch (error) {
      console.error('Morning update failed:', error.message);
    }
  }, {
    timezone: 'UTC'
  });

  // Evening update - 6:00 PM IST (12:30 PM UTC)
  cron.schedule('30 12 * * *', async () => {
    try {
      await updateSilverPrice();
    } catch (error) {
      console.error('Evening update failed:', error.message);
    }
  }, {
    timezone: 'UTC'
  });

};

// Export for manual testing
export { updateSilverPrice };