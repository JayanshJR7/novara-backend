//import express and create router
import express from 'express';
const router = express.Router();

//import cart and wishlist controllers
import {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    addToCart,
    updateCartItem,
    removeItemFromCart,
    getCart,
    clearCart
} from '../controllers/cartWishController.js';

//import middleware
import { protect } from '../middleware/auth.js';

// ========== WISHLIST ROUTES ==========


/**
 * @route   GET /api/users/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get('/wishlist', protect, getWishlist);

/**
 * @route   POST /api/users/wishlist/:productId
 * @desc    Add product to wishlist
 * @access  Private
 */
router.post('/wishlist/:productID', protect, addToWishlist);

/**
 * @route   DELETE /api/users/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
router.delete('/wishlist/:productId', protect, removeFromWishlist);

// ========== CART ROUTES ==========

/**
 * @route   GET /api/users/cart
 * @desc    Get user's cart
 * @access  Private
 */
router.get('/cart', protect, getCart);

/**
 * @route   POST /api/users/cart
 * @desc    Add product to cart
 * @access  Private
 */
router.post('/cart', protect, addToCart);

/**
 * @route   PUT /api/users/cart/:productId
 * @desc    Update cart item quantity
 * @access  Private
 */
router.put('/cart/:productId', protect, updateCartItem);

/**
 * @route   DELETE /api/users/cart/:productId
 * @desc    Remove product from cart
 * @access  Private
 */
router.delete('/cart/:productId', protect, removeItemFromCart);

/**
 * @route   DELETE /api/users/cart
 * @desc    Clear entire cart
 * @access  Private
 */
router.delete('/cart', protect, clearCart);

// Export router
export default router