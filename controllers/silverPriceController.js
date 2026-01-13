// Import SilverPrice model
import SilverPrice from '../models/silverPrice.js';
import axios from 'axios';

/**
 * @desc    Fetch silver price from Gold API
 * @access  Private helper function
 */
const fetchFromGoldAPI = async () => {
  try {
    const response = await axios.get('https://www.goldapi.io/api/XAG/INR', {
      headers: {
        'x-access-token': process.env.GOLD_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    const pricePerOunce = response.data.price;
    const pricePerGram = pricePerOunce / 31.1035;

    return {
      pricePerGram: parseFloat(pricePerGram.toFixed(2)),
      source: 'goldapi',
      rawData: response.data
    };
  } catch (error) {
    console.error('Gold API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch price from Gold API');
  }
};

/**
 * @desc    Get current silver price
 * @route   GET /api/silver-price
 * @access  Public
 */
export const getCurrentPrice = async (req, res) => {
  try {
    const silverPrice = await SilverPrice.getLatestPrice();

    res.json({
      success: true,
      pricePerGram: silverPrice.pricePerGram,
      lastUpdated: silverPrice.lastUpdated,
      currency: silverPrice.currency || 'INR',
      source: silverPrice.source || 'manual'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Manual update silver price (Admin only)
 * @route   PUT /api/silver-price
 * @access  Private/Admin
 */
export const updatePrice = async (req, res) => {
  try {
    const { pricePerGram } = req.body;

    // Validate input
    if (!pricePerGram || pricePerGram <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid price per gram'
      });
    }

    // Create new price entry (manual update)
    const silverPrice = await SilverPrice.create({
      pricePerGram: parseFloat(pricePerGram),
      lastUpdated: new Date(),
      source: 'manual',
      currency: 'INR'
    });

    res.json({
      success: true,
      message: 'Silver price updated successfully (manual)',
      pricePerGram: silverPrice.pricePerGram,
      lastUpdated: silverPrice.lastUpdated,
      source: silverPrice.source
    });
  } catch (error) {
    console.error('Update Price Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update silver price'
    });
  }
};

/**
 * @desc    Fetch latest price from Gold API (Manual trigger)
 * @route   POST /api/silver-price/fetch
 * @access  Private/Admin
 */
export const fetchAndUpdatePrice = async (req, res) => {
  try {
    const apiData = await fetchFromGoldAPI();

    const silverPrice = await SilverPrice.create({
      pricePerGram: apiData.pricePerGram,
      lastUpdated: new Date(),
      source: 'goldapi-manual',
      currency: 'INR'
    });

    res.json({
      success: true,
      message: 'Silver price fetched from Gold API',
      pricePerGram: silverPrice.pricePerGram,
      lastUpdated: silverPrice.lastUpdated,
      source: silverPrice.source
    });
  } catch (error) {
    console.error('Fetch and Update Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch price from Gold API'
    });
  }
};

/**
 * @desc    Get price history
 * @route   GET /api/silver-price/history
 * @access  Private/Admin
 */
export const getPriceHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;

    const priceHistory = await SilverPrice.find()
      .sort({ lastUpdated: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: priceHistory.length,
      history: priceHistory
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};