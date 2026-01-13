//import express and create router
import express from 'express';
const router = express.Router();

//import silver price controller
import {
  getCurrentPrice,
  updatePrice,
  getPriceHistory
} from '../controllers/silverPriceController.js';

//import middleware
import { protect, admin } from '../middleware/auth.js';

/**
 * @route   GET /api/silver-price
 * @desc    Get current silver price
 * @access  Public
 */
router.get('/', getCurrentPrice);

/**
 * @route   POST /api/silver-price
 * @desc    Update silver price (Admin only)
 * @access  Private/Admin
 */
router.put('/', protect, admin, updatePrice);

/**
 * @route   GET /api/silver-price/history
 * @desc    Get price history
 * @access  Private/Admin
 */
router.get('/history', protect, admin, getPriceHistory);

// Export router
export default router;