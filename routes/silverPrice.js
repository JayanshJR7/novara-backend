import express from 'express';
import {
  getCurrentPrice,
  updatePrice,
  fetchAndUpdatePrice,
  getPriceHistory
} from '../controllers/silverPriceController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public route - Get current silver price
router.get('/', getCurrentPrice);

// Admin routes - Manage silver price
router.put('/', protect, admin, updatePrice);
router.post('/fetch', protect, admin, fetchAndUpdatePrice);
router.get('/history', protect, admin, getPriceHistory);

export default router;