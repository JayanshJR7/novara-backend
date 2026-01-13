import express from 'express';
const router = express.Router();

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handlePaymentFailure
} from '../controllers/PaymentController.js'

import { protect } from '../middleware/auth.js';

/**
 * @route   POST /api/payment/create-order
 * @desc    Create Razorpay order
 * @access  Private
 */
router.post('/create-order', protect, createRazorpayOrder);

/**
 * @route   POST /api/payment/verify
 * @desc    Verify payment signature and update order
 * @access  Private
 */
router.post('/verify', protect, verifyRazorpayPayment);

/**
 * @route   POST /api/payment/failed
 * @desc    Handle payment failure
 * @access  Private
 */
router.post('/failed', protect, handlePaymentFailure);

export default router;